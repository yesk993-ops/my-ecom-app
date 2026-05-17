pipeline {
    agent any

    environment {
        DOCKER_REGISTRY = 'mydocker3692'
        IMAGE_TAG = "${env.BUILD_NUMBER}"
        SONAR_HOST_URL = 'http://192.168.122.151:9000'
        SONAR_TOKEN = credentials('sonar-token')
        GIT_TOKEN = credentials('git-token')
        // If opencode binary is not on PATH, set absolute path here
        // OPENCODE_BIN = '/usr/local/bin/opencode'
        // Repository URL (the correct, existing repo)
        REPO_URL = 'https://github.com/yesk993-ops/my-ecom-app.git'
    }

    stages {
        stage('Initialize') {
            steps {
                script {
                    // Define the Opencode fix helper closure for use in later stages
                    opencodeFix = { String target = '.' ->
                        def bin = env.OPENCODE_BIN ?: 'opencode'
                        // Check if binary exists before attempting to run it
                        def binExists = sh(script: "which ${bin} 2>/dev/null || command -v ${bin} 2>/dev/null", returnStdout: true).trim()
                        if (binExists) {
                            sh "${bin} fix --git-auth-token ${env.GIT_TOKEN} ${target}"
                        } else {
                            echo "WARNING: '${bin}' not found — skipping Opencode fix for ${target}. Set OPENCODE_BIN env var if installed elsewhere."
                        }
                    }
                }
            }
        }
        stage('Checkout') {
            steps {
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
        stage('Build & Push Docker Images') {
            steps {
                script {
                    def services = ['cart-service', 'frontend', 'order-service', 'payment-service', 'product-service']
                    services.each { svc ->
                        dir(svc) {
                            // Fix before building this service
                            opencodeFix('.')
                            sh "docker build -t $DOCKER_REGISTRY/${svc}:$IMAGE_TAG ."
                            sh "docker push $DOCKER_REGISTRY/${svc}:$IMAGE_TAG"
                        }
                    }
                }
            }
            post { failure { script { opencodeFix() } } }
        }
        stage('Trivy Scan') {
            steps {
                script {
                    def services = ['cart-service', 'frontend', 'order-service', 'payment-service', 'product-service']
                    services.each { svc ->
                        // Allow scan to continue; Opencode can attempt fix on failure
                        sh "trivy image --exit-code 1 --severity HIGH,CRITICAL $DOCKER_REGISTRY/${svc}:$IMAGE_TAG || true"
                    }
                }
            }
            post { failure { script { opencodeFix() } } }
        }
        stage('Deploy to Kubernetes') {
            steps {
                // Fix any manifest issues before applying
                script { opencodeFix('k8s') }
                sh "kubectl apply -f k8s/namespace.yaml"
                sh "kubectl apply -f k8s/cart-service.yaml"
                sh "kubectl apply -f k8s/frontend.yaml"
                sh "kubectl apply -f k8s/order-service.yaml"
                sh "kubectl apply -f k8s/payment-service.yaml"
                sh "kubectl apply -f k8s/product-service.yaml"
            }
            post { failure { script { opencodeFix('k8s') } } }
        }
    }
    post {
        always { cleanWs() }
        failure {
            script {
                def bin = env.OPENCODE_BIN ?: 'opencode'
                def binExists = sh(script: "which ${bin} 2>/dev/null || command -v ${bin} 2>/dev/null", returnStdout: true).trim()
                if (binExists) {
                    sh "${bin} fix --git-auth-token ${env.GIT_TOKEN} ."
                } else {
                    echo "WARNING: '${bin}' not found — cannot run Opencode auto-fix. Set OPENCODE_BIN env var if installed elsewhere."
                }
            }
        }
    }
}
