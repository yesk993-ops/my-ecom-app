pipeline {
    agent any

    environment {
        DOCKER_REGISTRY = 'mydocker3692'
        IMAGE_TAG = "${env.BUILD_NUMBER}"
        SONAR_HOST_URL = 'http://192.168.122.151:9000'
        SONAR_TOKEN = credentials('sonar-token')
        GIT_TOKEN = credentials('git-token')
        OPENCODE_BIN = 'opencode'
        OPENCODE_MODEL = 'opencode/qwen3.6-plus-free'
        REPO_URL = 'https://github.com/yesk993-ops/my-ecom-app.git'
    }

    stages {
        stage('Initialize') {
            steps {
                script {
                    pipelineIssues = []
                    opencodeFix = { String stageName, String target = '.', String errorContext = '' ->
                        def bin = env.OPENCODE_BIN ?: 'opencode'
                        def status = sh(
                            script: "command -v ${bin} >/dev/null 2>&1",
                            returnStatus: true
                        )
                        if (status == 0) {
                            def prompt = "The pipeline stage '${stageName}' failed. ${errorContext ? 'Error context: ' + errorContext + '.' : ''} Analyze the code in '${target}', identify the root cause, fix it, and write a summary of what was wrong and what you changed to a file called OPENCODE_FIX_REPORT.md in the workspace root."
                            withCredentials([
                                string(credentialsId: 'git-token', variable: 'GHTOKEN')
                            ]) {
                                sh """
                                export GITHUB_TOKEN=\${GHTOKEN}
                                ${bin} run \\
                                '${prompt}' \\
                                -m ${env.OPENCODE_MODEL} \\
                                --dir ${target} \\
                                --print-logs \\
                                --dangerously-skip-permissions
                                """
                            }
                            pipelineIssues.add("Stage '${stageName}' failed — Opencode attempted fix. See OPENCODE_FIX_REPORT.md for details.")
                        } else {
                            pipelineIssues.add("Stage '${stageName}' failed — Opencode binary not found, cannot auto-fix.")
                            error "Opencode binary not found"
                        }
                    }
                }
            }
        }
        stage('Opencode Version Check') {
            steps {
                sh '''
                echo "=== Opencode Proof ==="
                opencode --version
                opencode models | grep free
                echo "=== Opencode is working ==="
                '''
            }
        }
        stage('Checkout') {
            steps {
                script {
                    try {
                        checkout([
                            $class: 'GitSCM',
                            branches: [[name: '*/main']],
                            userRemoteConfigs: [[
                                url: env.REPO_URL,
                                credentialsId: 'github'
                            ]]
                        ])
                    } catch (Exception e) {
                        opencodeFix('Checkout', '.', e.getMessage())
                    }
                }
            }
        }
        stage('SonarQube Analysis') {
            steps {
                script {
                    try {
                        withSonarQubeEnv('SonarQube') {
                            def scannerHome = tool 'sonar-scanner'
                            sh "${scannerHome}/bin/sonar-scanner -Dsonar.projectKey=ecommerce-devops -Dsonar.sources=."
                        }
                    } catch (Exception e) {
                        opencodeFix('SonarQube Analysis', '.', e.getMessage())
                    }
                }
            }
        }
        stage('Quality Gate') {
            steps {
                script {
                    try {
                        timeout(time: 5, unit: 'MINUTES') {
                            waitForQualityGate abortPipeline: true
                        }
                    } catch (Exception e) {
                        opencodeFix('Quality Gate', '.', e.getMessage())
                    }
                }
            }
        }
        stage('Docker Login') {
            steps {
                script {
                    try {
                        withCredentials([usernamePassword(credentialsId: 'docker-cred', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                            sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin'
                        }
                    } catch (Exception e) {
                        opencodeFix('Docker Login', '.', e.getMessage())
                    }
                }
            }
        }
        stage('Build & Push Docker Images') {
            steps {
                script {
                    def serviceMap = [
                        'cart-service': 'cart',
                        'frontend': 'frontend',
                        'order-service': 'order',
                        'payment-service': 'payment',
                        'product-service': 'product'
                    ]
                    def parallelBuilds = [:]
                    serviceMap.each { dirName, imageName ->
                        def fullImage = "${DOCKER_REGISTRY}/ecommerce:${imageName}-v${IMAGE_TAG}"
                        parallelBuilds[dirName] = {
                            dir(dirName) {
                                def imageExists = sh(
                                    script: "docker manifest inspect ${fullImage} >/dev/null 2>&1",
                                    returnStatus: true
                                ) == 0
                                if (imageExists) {
                                    echo "Image ${fullImage} already exists on Docker Hub — skipping build and push"
                                } else {
                                    try {
                                        opencodeFix("Build ${dirName}", '.', 'Pre-build check and fix')
                                        sh "docker build -t ${fullImage} ."
                                        sh "docker push ${fullImage}"
                                    } catch (Exception e) {
                                        opencodeFix("Build ${dirName}", '.', e.getMessage())
                                    }
                                }
                            }
                        }
                    }
                    parallel parallelBuilds
                }
            }
        }
        stage('Trivy Scan') {
            steps {
                script {
                    def serviceMap = [
                        'cart-service': 'cart',
                        'frontend': 'frontend',
                        'order-service': 'order',
                        'payment-service': 'payment',
                        'product-service': 'product'
                    ]
                    def parallelScans = [:]
                    serviceMap.each { dirName, imageName ->
                        def fullImage = "${DOCKER_REGISTRY}/ecommerce:${imageName}-v${IMAGE_TAG}"
                        parallelScans[dirName] = {
                            sh "docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy:latest image --exit-code 1 --severity HIGH,CRITICAL ${fullImage} || true"
                        }
                    }
                    parallel parallelScans
                }
            }
        }
        stage('Deploy to Kubernetes') {
            steps {
                script {
                    try {
                        opencodeFix('Deploy to Kubernetes', 'k8s', 'Pre-deployment manifest check')
                        sh "sed -i 's|__TAG__|v${IMAGE_TAG}|g' k8s/*.yaml"
                        sh "kubectl apply -f k8s/namespace.yaml"
                        sh "kubectl apply -f k8s/cart-service.yaml"
                        sh "kubectl apply -f k8s/frontend.yaml"
                        sh "kubectl apply -f k8s/order-service.yaml"
                        sh "kubectl apply -f k8s/payment-service.yaml"
                        sh "kubectl apply -f k8s/product-service.yaml"
                        sh "git checkout k8s/*.yaml"
                        sh "sleep 10 && kubectl get pods -n ecommerce"
                        sh "kubectl rollout status deployment/frontend -n ecommerce --timeout=120s || true"
                        sh "kubectl rollout status deployment/cart-service -n ecommerce --timeout=120s || true"
                        sh "kubectl rollout status deployment/order-service -n ecommerce --timeout=120s || true"
                        sh "kubectl rollout status deployment/payment-service -n ecommerce --timeout=120s || true"
                        sh "kubectl rollout status deployment/product-service -n ecommerce --timeout=120s || true"
                        sh "echo '=== Pod Status ===' && kubectl get pods -n ecommerce && echo '=== Services ===' && kubectl get svc -n ecommerce"
                    } catch (Exception e) {
                        opencodeFix('Deploy to Kubernetes', 'k8s', e.getMessage())
                    }
                }
            }
        }
        stage('Opencode Final Report') {
            steps {
                script {
                    sh 'cat OPENCODE_FIX_REPORT.md 2>/dev/null || echo "No opencode fixes were applied this run."'
                    if (pipelineIssues.size() > 0) {
                        echo "=== Pipeline Issues Summary ==="
                        pipelineIssues.each { issue ->
                            echo "  [!] ${issue}"
                        }
                    } else {
                        echo "=== Pipeline completed with no issues ==="
                    }
                }
            }
        }
    }
    post {
        always { cleanWs() }
        failure {
            script {
                def bin = env.OPENCODE_BIN ?: 'opencode'
                def status = sh(script: "command -v ${bin} >/dev/null 2>&1", returnStatus: true)
                if (status == 0) {
                    withCredentials([
                        string(credentialsId: 'git-token', variable: 'GHTOKEN')
                    ]) {
                        sh """
                        export GITHUB_TOKEN=\${GHTOKEN}
                        ${bin} run \\
                        'The pipeline failed with unrecoverable errors. Analyze all code, Dockerfiles, k8s manifests, and Jenkinsfile. Identify root causes, fix them, and write a detailed report to OPENCODE_FIX_REPORT.md.' \\
                        -m ${env.OPENCODE_MODEL} \\
                        --dir . \\
                        --print-logs \\
                        --dangerously-skip-permissions
                        """
                    }
                }
            }
        }
    }
}
