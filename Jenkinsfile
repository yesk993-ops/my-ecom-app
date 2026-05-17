pipeline {
    agent any

    environment {
        DOCKER_REGISTRY = 'mydocker3692'
        IMAGE_TAG = "${env.BUILD_NUMBER}"
        SONAR_HOST_URL = 'http://sonarqube:9000'
        SONAR_TOKEN = credentials('sonar-token')
    }

    stages {
        stage('Checkout') {
            steps {
                // Checkout the GitHub repository containing the source code
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: '*/main']],
                    userRemoteConfigs: [[
                        url: 'https://github.com/yesk993-ops/ecom-app.git',
                        credentialsId: 'github-credentials'
                    ]]
                ])
            }
        }
        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    sh "sonar-scanner -Dsonar.projectKey=ecommerce-devops -Dsonar.sources=. -Dsonar.host.url=$SONAR_HOST_URL -Dsonar.login=$SONAR_TOKEN"
                }
            }
        }
        stage('Quality Gate') {
            steps { timeout(time: 5, unit: 'MINUTES') { waitForQualityGate abortPipeline: true } }
        }
        stage('Build & Push Docker Images') {
            steps {
                script {
                    def services = ['cart-service', 'frontend', 'order-service', 'payment-service', 'product-service']
                    services.each { svc ->
                        dir(svc) {
                            sh "docker build -t $DOCKER_REGISTRY/${svc}:$IMAGE_TAG ."
                            sh "docker push $DOCKER_REGISTRY/${svc}:$IMAGE_TAG"
                        }
                    }
                }
            }
        }
        stage('Trivy Scan') {
            steps {
                script {
                    def services = ['cart-service', 'frontend', 'order-service', 'payment-service', 'product-service']
                    services.each { svc ->
                        // Scan the newly built image
                        sh "trivy image --exit-code 1 --severity HIGH,CRITICAL $DOCKER_REGISTRY/${svc}:$IMAGE_TAG || exit 1"
                    }
                }
            }
        }
        stage('Deploy to Kubernetes') {
            steps {
                sh "kubectl apply -f k8s/namespace.yaml"
                sh "kubectl apply -f k8s/cart-service.yaml"
                sh "kubectl apply -f k8s/frontend.yaml"
                sh "kubectl apply -f k8s/order-service.yaml"
                sh "kubectl apply -f k8s/payment-service.yaml"
                sh "kubectl apply -f k8s/product-service.yaml"
            }
        }
    }
    post { always { cleanWs() } }
}
