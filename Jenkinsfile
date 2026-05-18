pipeline {
    agent any

    environment {
        DOCKER_REGISTRY = 'mydocker3692'
        IMAGE_TAG = "${env.BUILD_NUMBER}"
        SONAR_HOST_URL = 'http://192.168.122.151:9000'
        SONAR_TOKEN = credentials('sonar-token')
        GIT_TOKEN = credentials('git-token')
        // Opencode is installed at /usr/local/bin/opencode (accessible to Jenkins user)
        OPENCODE_BIN = 'opencode'
        OPENCODE_MODEL = 'opencode/qwen3.6-plus-free'
        // Repository URL (the correct, existing repo)
        REPO_URL = 'https://github.com/yesk993-ops/my-ecom-app.git'
    }

    stages {
        stage('Initialize') {
            steps {
                script {
                    // Define the Opencode fix helper closure for use in later stages
                    opencodeFix = { String target = '.', String prompt = 'Analyze and fix issues' ->
                        def bin = env.OPENCODE_BIN ?: 'opencode'
                        def status = sh(
                            script: "command -v ${bin} >/dev/null 2>&1",
                            returnStatus: true
                        )
                        if (status == 0) {
                            withCredentials([
                                string(credentialsId: 'git-token', variable: 'GHTOKEN')
                            ]) {
                                sh """
                                export GITHUB_TOKEN=${GHTOKEN}
                                ${bin} run \\
                                "${prompt}" \\
                                -m ${env.OPENCODE_MODEL} \\
                                --dir ${target} \\
                                --print-logs \\
                                --dangerously-skip-permissions
                                """
                            }
                        } else {
                            echo "WARNING: Opencode binary not found"
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
                // Use Git credentials securely
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: '*/main']],
                    userRemoteConfigs: [[
                        url: env.REPO_URL,
                        credentialsId: 'github'
                    ]]
                ])
            }
            post { failure { script { opencodeFix() } } }
        }
        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    script {
                        def scannerHome = tool 'sonar-scanner'
                        sh "${scannerHome}/bin/sonar-scanner -Dsonar.projectKey=ecommerce-devops -Dsonar.sources=."
                    }
                }
            }
            post { failure { script { opencodeFix() } } }
        }
        stage('Quality Gate') {
            steps { timeout(time: 5, unit: 'MINUTES') { waitForQualityGate abortPipeline: true } }
            post { failure { script { opencodeFix() } } }
        }
        stage('Docker Login') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'docker-cred', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin'
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
                                    opencodeFix('.')
                                    sh "docker build -t ${fullImage} ."
                                    sh "docker push ${fullImage}"
                                }
                            }
                        }
                    }
                    parallel parallelBuilds
                }
            }
            post { failure { script { opencodeFix() } } }
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
            post { failure { script { opencodeFix() } } }
        }
        stage('Deploy to Kubernetes') {
            steps {
                script {
                    opencodeFix('k8s')
                    sh "sed -i 's|__TAG__|v${IMAGE_TAG}|g' k8s/*.yaml"
                    sh "kubectl apply -f k8s/namespace.yaml"
                    sh "kubectl apply -f k8s/cart-service.yaml"
                    sh "kubectl apply -f k8s/frontend.yaml"
                    sh "kubectl apply -f k8s/order-service.yaml"
                    sh "kubectl apply -f k8s/payment-service.yaml"
                    sh "kubectl apply -f k8s/product-service.yaml"
                    sh "sleep 10 && kubectl get pods -n ecommerce"
                    sh "kubectl rollout status deployment/frontend -n ecommerce --timeout=120s || true"
                    sh "kubectl rollout status deployment/cart-service -n ecommerce --timeout=120s || true"
                    sh "kubectl rollout status deployment/order-service -n ecommerce --timeout=120s || true"
                    sh "kubectl rollout status deployment/payment-service -n ecommerce --timeout=120s || true"
                    sh "kubectl rollout status deployment/product-service -n ecommerce --timeout=120s || true"
                    sh "echo '=== Pod Status ===' && kubectl get pods -n ecommerce && echo '=== Services ===' && kubectl get svc -n ecommerce"
                }
            }
            post { failure { script { opencodeFix('k8s') } } }
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
                        export GITHUB_TOKEN=${GHTOKEN}
                        ${bin} run \\
                        "Analyze and fix pipeline failures" \\
                        -m ${env.OPENCODE_MODEL} \\
                        --dir . \\
                        --print-logs \\
                        --dangerously-skip-permissions
                        """
                    }
                } else {
                    echo "WARNING: Opencode binary not found"
                }
            }
        }
    }
}
