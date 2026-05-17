/*
 * Jenkins Declarative Pipeline - E-Commerce DevOps Platform
 * Services: product-service, cart-service, order-service, payment-service, frontend
 */

def services = [
    [name: 'product-service', port: '3001', dir: 'product-service'],
    [name: 'cart-service',    port: '3002', dir: 'cart-service'],
    [name: 'order-service',   port: '3003', dir: 'order-service'],
    [name: 'payment-service', port: '3004', dir: 'payment-service'],
    [name: 'frontend',        port: '80',   dir: 'frontend']
]

pipeline {
    agent any
    tools {
        nodejs 'NodeJS-18'
        docker 'Docker-24'
    }
    environment {
        DOCKER_REGISTRY   = 'ghcr.io/ecommerce'
        K8S_NAMESPACE     = 'ecommerce'
        SONAR_HOST_URL    = 'http://sonarqube:9000'
        SONAR_LOGIN       = credentials('sonar-token')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                echo "Building ${services.size()} services..."
            }
        }

        stage('Code Quality - SonarQube') {
            parallel {
                script {
                    def stages = [:]
                    services.each { svc ->
                        stages["SonarQube - ${svc.name}"] = {
                            dir(svc.dir) {
                                sh 'npm ci'
                                withSonarQubeEnv('SonarQube-Server') {
                                    sh "sonar-scanner -Dsonar.projectKey=${svc.name} -Dsonar.sources=. -Dsonar.host.url=${SONAR_HOST_URL} -Dsonar.login=${SONAR_LOGIN}"
                                }
                                timeout(time: 5, unit: 'MINUTES') {
                                    waitForQualityGate abortPipeline: true
                                }
                            }
                        }
                    }
                    stages
                }
            }
        }

        stage('Install Dependencies') {
            parallel {
                script {
                    def stages = [:]
                    services.each { svc ->
                        stages["Install - ${svc.name}"] = {
                            dir(svc.dir) { sh 'npm ci --legacy-peer-deps' }
                        }
                    }
                    stages
                }
            }
        }

        stage('Run Tests') {
            parallel {
                script {
                    def stages = [:]
                    services.each { svc ->
                        stages["Test - ${svc.name}"] = {
                            dir(svc.dir) { sh 'npm test' }
                        }
                    }
                    stages
                }
            }
        }

        stage('OWASP Dependency Check') {
            parallel {
                script {
                    def stages = [:]
                    services.each { svc ->
                        stages["OWASP - ${svc.name}"] = {
                            dir(svc.dir) {
                                sh 'npm audit --audit-level=high || true'
                                sh 'npm audit --json > npm-audit-report.json 2>/dev/null || echo "{}" > npm-audit-report.json'
                            }
                        }
                    }
                    stages
                }
            }
        }

        stage('Build Docker Images') {
            parallel {
                script {
                    def stages = [:]
                    services.each { svc ->
                        stages["Docker Build - ${svc.name}"] = {
                            dir(svc.dir) {
                                def imageName = "${DOCKER_REGISTRY}/${svc.name}:${env.BUILD_NUMBER}"
                                docker.build(imageName, '-f Dockerfile .')
                            }
                        }
                    }
                    stages
                }
            }
        }

        stage('Trivy Security Scan') {
            parallel {
                script {
                    def stages = [:]
                    services.each { svc ->
                        stages["Trivy - ${svc.name}"] = {
                            def imageName = "${DOCKER_REGISTRY}/${svc.name}:${env.BUILD_NUMBER}"
                            sh "trivy image --severity HIGH,CRITICAL --exit-code 1 --format table --output trivy-report-${svc.name}.txt ${imageName} || true"
                        }
                    }
                    stages
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                sh 'kubectl apply -f k8s/ --namespace=${K8S_NAMESPACE}'
                sh 'kubectl rollout status deployment/frontend -n ${K8S_NAMESPACE} --timeout=5m'
                sh 'kubectl rollout status deployment/product-service -n ${K8S_NAMESPACE} --timeout=5m'
                sh 'kubectl rollout status deployment/cart-service -n ${K8S_NAMESPACE} --timeout=5m'
                sh 'kubectl rollout status deployment/order-service -n ${K8S_NAMESPACE} --timeout=5m'
                sh 'kubectl rollout status deployment/payment-service -n ${K8S_NAMESPACE} --timeout=5m'
            }
        }
    }

    post {
        always {
            junit allowEmptyResults: true, testResults: '**/reports/junit.xml'
            archiveArtifacts allowEmptyArchive: true, artifacts: '**/npm-audit-report.json, **/trivy-report-*.txt'
            cleanWs()
        }
        success {
            emailext(subject: "SUCCESS: ${env.JOB_NAME} - #${env.BUILD_NUMBER}",
                body: "Pipeline succeeded.", to: 'devops-team@ecommerce.com')
        }
        failure {
            emailext(subject: "FAILURE: ${env.JOB_NAME} - #${env.BUILD_NUMBER}",
                body: "Pipeline failed.", to: 'devops-team@ecommerce.com')
        }
    }
}
