# 🛒 E-Commerce DevOps Platform

> **A cloud-native, microservices-based e-commerce platform with full CI/CD automation, container orchestration, and integrated security scanning.**

[![Jenkins](https://img.shields.io/badge/Jenkins-CI%2FCD-red?logo=jenkins)](https://www.jenkins.io/)
[![Docker](https://img.shields.io/badge/Docker-Container-blue?logo=docker)](https://www.docker.com/)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-Orchestration-326CE5?logo=kubernetes)](https://kubernetes.io/)
[![SonarQube](https://img.shields.io/badge/SonarQube-Quality%20Gate-4E9BCD?logo=sonarqube)](https://www.sonarqube.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?logo=nodedotjs)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://reactjs.org/)

---

## 📚 Table of Contents

- [Architecture Overview](#-architecture-overview)
- [Services Overview](#-services-overview)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Quick Start (Docker Compose)](#-quick-start-docker-compose)
- [Kubernetes Deployment](#-kubernetes-deployment)
- [CI/CD Pipeline](#-cicd-pipeline)
- [Security Scanning](#-security-scanning)
- [Environment Variables](#-environment-variables)
- [API Endpoints](#-api-endpoints)
- [License](#-license)

---

## 🏗 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            CLIENT LAYER                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐                   │
│  │  Web App  │  │  Mobile  │  │   3rd    │  │  Admin   │                   │
│  │  (React)  │  │  (iOS)   │  │  Party   │  │  Panel   │                   │
│  └─────┬─────┘  └─────┬────┘  └────┬─────┘  └────┬─────┘                   │
│        │               │            │             │                         │
├────────┴───────────────┴────────────┴─────────────┴─────────────────────────┤
│                           API GATEWAY                                       │
│                     ┌──────────────────┐                                    │
│                     │  Kong / Nginx    │                                    │
│                     │  (Port 8000)     │                                    │
│                     └────────┬─────────┘                                    │
├──────────────────────────────┼──────────────────────────────────────────────┤
│         ┌────────────────────┼────────────────────┐                         │
│         │                    │                    │                         │
│         ▼                    ▼                    ▼                         │
│  ┌─────────────┐    ┌──────────────┐    ┌──────────────┐                   │
│  │   User      │    │   Product    │    │    Order     │                   │
│  │   Service   │    │   Service    │    │   Service    │                   │
│  │   :4001     │    │   :4002      │    │   :4003      │                   │
│  └──────┬──────┘    └──────┬───────┘    └──────┬───────┘                   │
│         │                  │                    │                           │
│         ▼                  ▼                    ▼                           │
│  ┌─────────────┐    ┌──────────────┐    ┌──────────────┐                   │
│  │  Payment    │    │Notification  │    │              │                   │
│  │  Service    │    │  Service     │    │  Message Bus │                   │
│  │  :4004      │    │  :4005       │    │  (RabbitMQ)  │                   │
│  └─────────────┘    └──────────────┘    └──────────────┘                   │
│                                                                             │
├─────────────────────────── DATA LAYER ──────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│  │ Postgres │ │ Postgres │ │ Postgres │ │  Redis   │ │  Redis   │         │
│  │ (Users)  │ │(Products)│ │ (Orders) │ │ (Cache)  │ │ (Sess.)  │         │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘         │
└─────────────────────────────────────────────────────────────────────────────┘
```


### CI/CD Pipeline Flow

```
┌─────────┐   ┌──────────┐   ┌───────────┐   ┌───────┐   ┌───────────┐
│  Code   │──▶│ SonarQube│──▶│  npm ci   │──▶│ npm   │──▶│   OWASP   │
│ Checkout│   │ Quality  │   │  Install  │   │ Test  │   │ Dependency│
└─────────┘   └──────────┘   └───────────┘   └───────┘   └───────────┘
                                                           │
                ┌──────────────────────────────────────────┘
                ▼
         ┌──────────┐   ┌──────────┐   ┌─────────────┐
         │  Docker  │──▶│  Trivy   │──▶│  Deploy to  │
         │  Build   │   │  Scan    │   │ Kubernetes  │
         └──────────┘   └──────────┘   └─────────────┘
```

---

## 📦 Services Overview

| # | Service             | Port  | Description                                                         |
|---|---------------------|-------|---------------------------------------------------------------------|
| 1 | **User Service**    | 4001  | User registration, authentication (JWT), profile management, RBAC   |
| 2 | **Product Service** | 4002  | Product catalog, categories, inventory tracking, search & filter    |
| 3 | **Order Service**   | 4003  | Order creation, status management, cart operations, history         |
| 4 | **Payment Service** | 4004  | Payment processing (Stripe/PayPal), refunds, transaction history    |
| 5 | **Notification**    | 4005  | Email (SendGrid), SMS (Twilio), in-app push notifications           |

---

## 🛠 Tech Stack

### Frontend
| Technology | Version | Purpose                        |
|------------|---------|--------------------------------|
| React      | 18.x    | Web application UI framework   |
| Redux      | 4.x     | State management               |
| TailwindCSS| 3.x     | Utility-first CSS framework    |
| Axios      | 1.x     | HTTP client for API calls      |

### Backend
| Technology | Version | Purpose                        |
|------------|---------|--------------------------------|
| Node.js    | 18 LTS  | JavaScript runtime             |
| Express.js | 4.x     | Web framework for REST APIs    |
| TypeScript | 5.x     | Type-safe JavaScript superset  |
| Jest       | 29.x    | Unit & integration testing     |

### DevOps & Infrastructure
| Technology    | Version | Purpose                         |
|---------------|---------|---------------------------------|
| Docker        | 24.x    | Containerization                |
| Kubernetes    | 1.28    | Container orchestration         |
| Jenkins       | 2.440   | CI/CD automation                |
| SonarQube     | 10.x    | Code quality & static analysis  |
| Trivy         | 0.50    | Container vulnerability scanner |
| Prometheus    | latest  | Metrics collection              |
| Grafana       | latest  | Monitoring dashboards           |
| ELK Stack     | 8.x     | Centralized logging             |

### Databases & Messaging
| Technology | Purpose                        |
|------------|--------------------------------|
| PostgreSQL | Relational data store (primary)|
| Redis      | Caching & session management   |
| RabbitMQ   | Async message broker           |

---

## 📁 Project Structure

```
ecommerce-devops/
├── Jenkinsfile                      # CI/CD pipeline definition
├── README.md                        # This documentation
├── docker-compose.yml               # Local development orchestration
├── .env.example                     # Environment variable template
├── .gitignore
│
├── services/
│   ├── user-service/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   ├── models/
│   │   │   ├── routes/
│   │   │   ├── middleware/
│   │   │   ├── utils/
│   │   │   └── app.ts
│   │   ├── tests/
│   │   └── reports/
│   │
│   ├── product-service/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   ├── src/
│   │   └── tests/
│   │
│   ├── order-service/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   ├── src/
│   │   └── tests/
│   │
│   ├── payment-service/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   ├── src/
│   │   └── tests/
│   │
│   └── notification-service/
│       ├── Dockerfile
│       ├── package.json
│       ├── src/
│       └── tests/
│
├── k8s/
│   ├── namespace.yaml
│   ├── configmap.yaml
│   ├── secrets.yaml
│   ├── user-service-deployment.yaml
│   ├── user-service-service.yaml
│   ├── product-service-deployment.yaml
│   ├── product-service-service.yaml
│   ├── order-service-deployment.yaml
│   ├── order-service-service.yaml
│   ├── payment-service-deployment.yaml
│   ├── payment-service-service.yaml
│   ├── notification-service-deployment.yaml
│   ├── notification-service-service.yaml
│   ├── ingress.yaml
│   └── hpa.yaml
│
├── monitoring/
│   ├── prometheus/
│   │   └── prometheus.yml
│   └── grafana/
│       └── dashboards/
│
└── scripts/
    ├── seed-data.sh
    ├── migrate-db.sh
    └── health-check.sh
```


---

## ✅ Prerequisites

Ensure the following tools are installed on your system:

| Tool          | Version  | Required For                      | Install Guide                                    |
|---------------|----------|-----------------------------------|--------------------------------------------------|
| Docker        | ≥ 24.x   | Containerization                  | [docs.docker.com/get-docker](https://docs.docker.com/get-docker/) |
| Docker Compose| ≥ 2.20   | Local multi-service orchestration | Included with Docker Desktop                     |
| Node.js       | ≥ 18 LTS | Local development & testing       | [nodejs.org](https://nodejs.org/)                |
| kubectl       | ≥ 1.28   | Kubernetes management             | [kubernetes.io/docs/tasks/tools](https://kubernetes.io/docs/tasks/tools/) |
| Helm          | ≥ 3.12   | Kubernetes package manager        | [helm.sh/docs/intro/install](https://helm.sh/docs/intro/install/) |
| Jenkins       | ≥ 2.440  | CI/CD pipeline execution          | [jenkins.io/download](https://www.jenkins.io/download/) |
| SonarQube     | ≥ 10.x   | Code quality analysis             | [sonarqube.org/downloads](https://www.sonarqube.org/downloads/) |
| Trivy         | ≥ 0.50   | Container vulnerability scanning  | [aquasecurity.github.io/trivy](https://aquasecurity.github.io/trivy/) |
| jq            | ≥ 1.6    | JSON processing in scripts        | [stedolan.github.io/jq](https://stedolan.github.io/jq/) |

---

## 🚀 Quick Start (Docker Compose)

Run the entire platform locally in minutes:

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/ecommerce-devops.git
cd ecommerce-devops
```

### 2. Configure Environment Variables

```bash
cp .env.example .env
# Edit .env with your own values (API keys, DB credentials, etc.)
```

### 3. Start All Services

```bash
# Build and start all services in detached mode
docker compose up --build -d

# View logs for all services
docker compose logs -f

# Check service status
docker compose ps
```

### 4. Verify the Platform

```bash
# Health check
curl http://localhost:4001/health
curl http://localhost:4002/health
curl http://localhost:4003/health
curl http://localhost:4004/health
curl http://localhost:4005/health

# API Gateway
curl http://localhost:8000/api/v1/
```

### 5. Stop Services

```bash
docker compose down
# Include the -v flag to remove volumes (clears DB data)
docker compose down -v
```


---

## ☸ Kubernetes Deployment

Deploy the entire platform to a Kubernetes cluster.

### Step 1: Create the Namespace

```bash
kubectl create namespace ecommerce
# Or use the manifest
kubectl apply -f k8s/namespace.yaml
```

### Step 2: Configure ConfigMaps and Secrets

```bash
# Create ConfigMap for non-sensitive configuration
kubectl apply -f k8s/configmap.yaml

# Create Secrets (edit secrets.yaml with base64-encoded values first)
kubectl apply -f k8s/secrets.yaml

# Verify
kubectl get configmaps,secrets -n ecommerce
```

### Step 3: Deploy All Services

```bash
# Deploy all microservices
kubectl apply -f k8s/ -n ecommerce

# Watch the rollout status
kubectl get pods -n ecommerce -w

# Verify deployments
kubectl get deployments -n ecommerce
kubectl get services -n ecommerce
```

### Step 4: Configure Ingress

```bash
# Apply the ingress resource
kubectl apply -f k8s/ingress.yaml

# Get the ingress IP
kubectl get ingress -n ecommerce
```

### Step 5: Enable Horizontal Pod Autoscaling

```bash
kubectl apply -f k8s/hpa.yaml
kubectl get hpa -n ecommerce
```

### Step 6: Verify Deployment

```bash
# Check all resources
kubectl get all -n ecommerce

# Port-forward for local testing
kubectl port-forward -n ecommerce svc/user-service 4001:4001
```

### Useful Kubernetes Commands

```bash
# View logs for a specific service
kubectl logs -n ecommerce -l app=user-service --tail=100 -f

# Restart a deployment
kubectl rollout restart -n ecommerce deployment/user-service

# Scale a service manually
kubectl scale -n ecommerce deployment/product-service --replicas=5

# Describe a pod for troubleshooting
kubectl describe pod -n ecommerce -l app=order-service
```


---

## 🔄 CI/CD Pipeline

The project uses a **Jenkins Declarative Pipeline** (`Jenkinsfile`) for continuous integration and deployment.

### Pipeline Stages Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          CI / CD PIPELINE                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────┐                                                               │
│  │ CHECKOUT│  Clone repository from SCM                                    │
│  │  CODE   │                                                               │
│  └────┬────┘                                                               │
│       │                                                                     │
│       ▼                                                                     │
│  ┌─────────┐                                                               │
│  │  CODE   │  SonarQube static analysis & quality gate (parallel per svc)  │
│  │ QUALITY │  Fails pipeline if Quality Gate is not PASSED                 │
│  └────┬────┘                                                               │
│       │                                                                     │
│       ▼                                                                     │
│  ┌─────────┐                                                               │
│  │INSTALL  │  npm ci for all 5 services (parallel execution)                │
│  │  DEPS   │  Clean, reproducible installs                                 │
│  └────┬────┘                                                               │
│       │                                                                     │
│       ▼                                                                     │
│  ┌─────────┐                                                               │
│  │   RUN   │  npm test with JUnit reporter (parallel per service)           │
│  │  TESTS  │  Test results archived in Jenkins                             │
│  └────┬────┘                                                               │
│       │                                                                     │
│       ▼                                                                     │
│  ┌─────────┐                                                               │
│  │  OWASP  │  npm audit for dependency vulnerability check (parallel)       │
│  │  CHECK  │  Reports saved as JSON artifacts                              │
│  └────┬────┘                                                               │
│       │                                                                     │
│       ▼                                                                     │
│  ┌─────────┐                                                               │
│  │ DOCKER  │  Build Docker images for all 5 services (parallel)            │
│  │  BUILD  │  Tagged with BUILD_NUMBER                                     │
│  └────┬────┘                                                               │
│       │                                                                     │
│       ▼                                                                     │
│  ┌─────────┐                                                               │
│  │  TRIVY  │  Scan Docker images for HIGH/CRITICAL vulnerabilities          │
│  │  SCAN   │  Generates per-service report artifacts                       │
│  └────┬────┘                                                               │
│       │                                                                     │
│       ▼                                                                     │
│  ┌─────────┐                                                               │
│  │ DEPLOY  │  kubectl apply -f k8s/ to deploy to Kubernetes                │
│  │   TO    │  Deploys to configured namespace                              │
│  │   K8s   │                                                               │
│  └─────────┘                                                               │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  POST-BUILD ACTIONS                                                         │
│  • Archive JUnit test results                                               │
│  • Publish SonarQube HTML report                                            │
│  • Archive OWASP / npm-audit JSON reports                                   │
│  • Archive Trivy scan reports                                               │
│  • Send email notification on success/failure                               │
│  • Clean workspace                                                          │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Triggering the Pipeline

- **Automatic:** On every push/merge to `main` or `develop` branches
- **Manual:** Via Jenkins UI → "Build Now" or using the Jenkins CLI

```bash
# Trigger via Jenkins CLI
java -jar jenkins-cli.jar build ecommerce-pipeline -p BRANCH=main
```


---

## 🔒 Security Scanning

Three layers of security scanning are integrated into the CI/CD pipeline.

### 1. SonarQube – Code Quality & Static Analysis

SonarQube performs static code analysis to detect:

| Category              | Examples                                      |
|-----------------------|-----------------------------------------------|
| **Code Smells**       | Duplicated code, long methods, poor naming    |
| **Bugs**              | Null pointer dereferences, resource leaks     |
| **Vulnerabilities**   | SQL injection, XSS, CSRF patterns             |
| **Security Hotspots** | Areas needing manual security review          |
| **Code Coverage**     | Lines/branches covered by unit tests          |

**Quality Gate:** The pipeline **aborts** if the Quality Gate status is not **PASSED**.

```bash
# Run SonarQube locally
sonar-scanner \
  -Dsonar.projectKey=user-service \
  -Dsonar.sources=. \
  -Dsonar.host.url=http://localhost:9000 \
  -Dsonar.login=<your-token>
```

### 2. OWASP Dependency Check (npm audit)

Scans Node.js dependencies for known vulnerabilities using `npm audit`.

| Feature              | Description                                      |
|----------------------|--------------------------------------------------|
| **Source**           | npm public advisory database + GitHub advisories |
| **Severity Levels**  | CRITICAL, HIGH, MODERATE, LOW                    |
| **Action**           | Pipeline flags HIGH/CRITICAL vulnerabilities     |
| **Report**           | JSON report archived as a build artifact         |

```bash
# Run locally
npm audit --audit-level=high
npm audit --json > npm-audit-report.json
```

### 3. Trivy – Container Vulnerability Scanner

Trivy scans Docker images for operating system and application-level vulnerabilities.

| Feature              | Description                                      |
|----------------------|--------------------------------------------------|
| **Scans**            | OS packages (Alpine, Debian) + app libraries     |
| **Databases**        | CVE, NVD, RedHat, Debian, Ubuntu, Alpine         |
| **Severity**         | Scans only HIGH & CRITICAL by default            |
| **Exit Code**        | `--exit-code 1` to fail on findings              |
| **Report**           | Table and JSON formats as build artifacts        |

```bash
# Run locally
trivy image docker.io/ecommerce/user-service:latest \
  --severity HIGH,CRITICAL \
  --format table \
  --output trivy-report.txt
```


---

## 🌐 Environment Variables

### Common Variables

| Variable              | Description                  | Default            | Required |
|-----------------------|------------------------------|--------------------|----------|
| `NODE_ENV`            | Environment mode             | `development`      | ✅       |
| `PORT`                | Service port                 | Varies per service | ✅       |
| `LOG_LEVEL`           | Logging verbosity            | `info`             | ❌       |
| `API_VERSION`         | API version prefix           | `v1`               | ❌       |

### Database Variables

| Variable              | Description                  | Default            | Required |
|-----------------------|------------------------------|--------------------|----------|
| `DB_HOST`             | Database host                | `localhost`        | ✅       |
| `DB_PORT`             | Database port                | `5432`             | ✅       |
| `DB_NAME`             | Database name                | Varies per service | ✅       |
| `DB_USER`             | Database user                | `postgres`         | ✅       |
| `DB_PASSWORD`         | Database password            | `postgres`         | ✅       |

### Authentication

| Variable              | Description                  | Default            | Required |
|-----------------------|------------------------------|--------------------|----------|
| `JWT_SECRET`          | JWT signing secret           | —                  | ✅       |
| `JWT_EXPIRY`          | Token expiration (seconds)   | `3600`             | ❌       |
| `BCRYPT_SALT_ROUNDS`  | Password hashing rounds      | `10`               | ❌       |

### Redis & Messaging

| Variable              | Description                  | Default            | Required |
|-----------------------|------------------------------|--------------------|----------|
| `REDIS_HOST`          | Redis host                   | `localhost`        | ✅       |
| `REDIS_PORT`          | Redis port                   | `6379`             | ✅       |
| `RABBITMQ_URL`        | RabbitMQ connection URL      | `amqp://localhost` | ✅       |

### External Services

| Variable              | Description                  | Default            | Required |
|-----------------------|------------------------------|--------------------|----------|
| `STRIPE_API_KEY`      | Stripe API secret key        | —                  | ✅       |
| `PAYPAL_CLIENT_ID`    | PayPal client ID             | —                  | ✅       |
| `SENDGRID_API_KEY`    | SendGrid API key             | —                  | ✅       |
| `TWILIO_ACCOUNT_SID`  | Twilio account SID           | —                  | ✅       |
| `TWILIO_AUTH_TOKEN`   | Twilio auth token            | —                  | ✅       |


---

## 📡 API Endpoints

### User Service (`:4001`)

| Method | Endpoint              | Description                  | Auth     |
|--------|-----------------------|------------------------------|----------|
| POST   | `/api/v1/auth/register` | Register a new user          | Public   |
| POST   | `/api/v1/auth/login`    | Authenticate user            | Public   |
| GET    | `/api/v1/users/me`      | Get current user profile     | JWT      |
| PUT    | `/api/v1/users/me`      | Update profile               | JWT      |
| DELETE | `/api/v1/users/me`      | Delete account               | JWT      |
| GET    | `/api/v1/users`         | List users (admin)           | Admin    |
| GET    | `/health`               | Health check                 | Public   |

### Product Service (`:4002`)

| Method | Endpoint                    | Description              | Auth     |
|--------|-----------------------------|--------------------------|----------|
| GET    | `/api/v1/products`          | List products (paginated)| Public   |
| GET    | `/api/v1/products/:id`      | Get product by ID        | Public   |
| POST   | `/api/v1/products`          | Create product           | Admin    |
| PUT    | `/api/v1/products/:id`      | Update product           | Admin    |
| DELETE | `/api/v1/products/:id`      | Delete product           | Admin    |
| GET    | `/api/v1/categories`        | List categories          | Public   |
| GET    | `/api/v1/products/search`   | Search products          | Public   |
| GET    | `/health`                   | Health check             | Public   |

### Order Service (`:4003`)

| Method | Endpoint                    | Description              | Auth     |
|--------|-----------------------------|--------------------------|----------|
| POST   | `/api/v1/orders`            | Create order from cart   | JWT      |
| GET    | `/api/v1/orders`            | List user orders         | JWT      |
| GET    | `/api/v1/orders/:id`        | Get order details        | JWT      |
| PUT    | `/api/v1/orders/:id/cancel` | Cancel order             | JWT      |
| GET    | `/api/v1/cart`              | Get current cart         | JWT      |
| POST   | `/api/v1/cart/items`        | Add item to cart         | JWT      |
| DELETE | `/api/v1/cart/items/:id`    | Remove cart item         | JWT      |
| GET    | `/health`                   | Health check             | Public   |

### Payment Service (`:4004`)

| Method | Endpoint                    | Description              | Auth     |
|--------|-----------------------------|--------------------------|----------|
| POST   | `/api/v1/payments`          | Process payment          | JWT      |
| GET    | `/api/v1/payments/:id`      | Get payment status       | JWT      |
| POST   | `/api/v1/payments/:id/refund`| Refund payment          | Admin    |
| GET    | `/api/v1/payments/history`  | Payment history          | JWT      |
| GET    | `/health`                   | Health check             | Public   |

### Notification Service (`:4005`)

| Method | Endpoint                    | Description              | Auth     |
|--------|-----------------------------|--------------------------|----------|
| POST   | `/api/v1/notifications/email`  | Send email           | Internal |
| POST   | `/api/v1/notifications/sms`    | Send SMS             | Internal |
| POST   | `/api/v1/notifications/push`   | Send push notification| Internal|
| GET    | `/api/v1/notifications`        | List user notifications| JWT     |
| PUT    | `/api/v1/notifications/:id/read`| Mark as read        | JWT      |
| GET    | `/health`                   | Health check             | Public   |


---

## 📄 License

```
MIT License

Copyright (c) 2025 E-Commerce DevOps Platform

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

> **Built with ❤️ by the DevOps Team** — *Happy Shipping! 🚢*
