# CI/CD Pipeline Documentation: Student Application

## 1. High-Level Overview

### 1.1. Purpose

This document outlines the architecture and operation of a fully automated CI/CD (Continuous Integration / Continuous Deployment) pipeline for the multi-container "Student Application". The primary goal of this pipeline is to automate the process of integrating, testing, packaging, and deploying the application, thereby reducing manual errors, improving reliability, and enabling the rapid delivery of new features and fixes.

### 1.2. Core Principles

The pipeline is designed around modern DevOps principles:

*   **Continuous Integration (CI):** Every code change pushed to the main branch is automatically built and tested, providing immediate feedback on its quality.
*   **Continuous Deployment (CD):** Code that successfully passes all automated tests is automatically packaged and deployed to the production environment.
*   **Infrastructure as Code (IaC):** The entire pipeline is defined in a `Jenkinsfile`, and the application's runtime environment is defined in `Dockerfile` and `docker-compose.prod.yml`. This makes the setup repeatable, version-controlled, and transparent.
*   **Immutable Infrastructure:** The application is packaged into immutable Docker images. We don't change the running server; we replace old containers with new ones, leading to more predictable deployments.

## 2. Technology Stack & Architecture

This pipeline leverages a suite of industry-standard tools, each with a specific role. The entire infrastructure is hosted on a single Virtual Machine on Google Cloud Platform (GCP).

| Tool | Role in Pipeline | Justification |
| :--- | :--- | :--- |
| **GitHub** | **Source Code Management (SCM)** | Acts as the central, version-controlled repository for all application code and IaC files (`Jenkinsfile`, `Dockerfiles`). Triggers the pipeline via webhooks. |
| **Jenkins** | **CI/CD Orchestrator** | The "brain" of the pipeline. It listens for triggers, checks out code, runs build/test scripts, orchestrates Docker commands, and manages the deployment process. |
| **Docker** | **Containerization Platform** | Used to package the frontend and backend services into lightweight, portable, and isolated containers. Ensures consistency between development, testing, and production. |
| **Docker Compose** | **Deployment & Service Manager** | Defines the multi-container production environment. Used to start, stop, and manage the `frontend`, `backend`, and `mongo` services on the production server. |
| **Docker Hub** | **Container Registry** | A central, cloud-based "warehouse" for storing the versioned production Docker images built by Jenkins. |
| **Google Cloud Platform (GCP)** | **Infrastructure Provider** | Hosts the `e2-medium` Compute Engine VM that serves as our production and Jenkins server. Provides the static IP, networking, and firewall. |
| **Google Cloud Operations Suite** | **Monitoring & Alerting** | The native GCP monitoring solution used to observe server health (CPU, RAM). It is configured to send alerts on sustained high-load conditions. |
| **NGINX** | **Frontend Web Server** | Used inside the frontend Docker container as a high-performance, production-grade web server to serve the static React application files. |
| **Node.js / Express.js** | **Backend Runtime** | The runtime environment for the backend API service. |
| **MongoDB** | **Database** | The NoSQL database used by the backend, running as a separate container managed by Docker Compose. |

## 3. The CI/CD Flow: A Step-by-Step Journey

The pipeline is a sequence of automated stages that execute every time new code is pushed to the `main` branch.

1.  **Trigger:**
    *   A developer pushes a commit to the `main` branch on GitHub.
    *   A GitHub Webhook sends a notification to the Jenkins server's public IP on port 8080.

2.  **CI Phase (Executed by Jenkins):**
    *   **Checkout:** Jenkins receives the notification, starts a new build, and checks out the latest source code.
    *   **Build & Test Frontend:**
        *   Navigates to the `/frontend` directory.
        *   Runs `npm install` to get dependencies.
        *   Runs `npm test` to execute the Jest/React Testing Library test suite. The pipeline halts if any test fails.
    *   **Build & Test Backend:**
        *   Navigates to the `/backend` directory.
        *   Runs `npm ci` to install dependencies based on the lock file.
        *   Runs `npm test` to execute the Jest/Supertest API tests. The pipeline halts if any test fails.

3.  **Packaging Phase (Docker & Jenkins):**
    *   **Build Docker Images:**
        *   Jenkins executes `docker build -f Dockerfile.prod` in the `/frontend` directory to create an optimized NGINX-based image.
        *   It then runs `docker build -f Dockerfile.prod` in the `/backend` directory to create a lean Node.js image.
        *   Both images are tagged with the unique Jenkins build number (e.g., `:22`) and `:latest`.
    *   **Push Docker Images:**
        *   Jenkins securely authenticates with Docker Hub using credentials stored in its internal vault.
        *   It then pushes both tagged images to the `francodeploy` Docker Hub repository.

4.  **CD Phase (Deployment by Jenkins):**
    *   **Deploy to Production:**
        *   Jenkins uses a stored SSH key to open a secure, passwordless connection to the production server (as the `terif` user).
        *   It remotely executes a script on the server which performs the following actions:
            1.  `cd ~/student-app`: Navigates to the project directory.
            2.  `git pull`: Pulls the latest source code to get the most recent `docker-compose.prod.yml`.
            3.  `docker compose pull`: Pulls the new application images that were just pushed to Docker Hub.
            4.  `docker compose up -d`: Stops the old running containers and starts new ones from the new images, with zero downtime for the user.

## 4. Key Configuration Files (Infrastructure as Code)

### 4.1. `Jenkinsfile`
This is the heart of the pipeline, defining every stage and step. It uses a declarative syntax to ensure a predictable and readable workflow. It manages everything from testing to securely calling deployment scripts.

### 4.2. `Dockerfile.prod`
*   **Frontend:** A multi-stage Dockerfile is used. The first stage uses a Node.js environment to build the static React assets. The second stage copies *only* these built assets into a lightweight, production-ready NGINX image. This results in a minimal, secure final image.
*   **Backend:** A single-stage Dockerfile based on `node:18-alpine`. It uses `npm ci --omit=dev` to install only production dependencies, creating a small and efficient image.

### 4.3. `docker-compose.prod.yml`
This file is the blueprint for the live application environment. It defines three services: `frontend`, `backend`, and `mongo`.
*   It specifies which Docker Hub **images** to pull.
*   It handles **port mapping** (e.g., mapping the host's port 80 to the frontend container's port 80).
*   It sets up a private Docker **network**, allowing the backend to securely connect to the database using its service name (`mongodb://mongo:27017/...`).
*   It configures a Docker **volume** for the `mongo` service to ensure that all database data persists on the host machine, even if the container is removed or updated.

## 5. Security & Credentials Management

*   **Jenkins Credentials:** All sensitive information, including the Docker Hub Personal Access Token and the SSH private key for deployment, is stored securely within the Jenkins Credentials Manager. These secrets are injected into the pipeline at runtime and are never exposed in logs or source code.
*   **GCP Firewall:** The server's firewall is configured with a "least privilege" approach, only allowing inbound traffic on essential ports: `22` (SSH), `80` (HTTP), and `8080` (Jenkins). All other ports are blocked.
*   **SSH Key Authentication:** The automated deployment process uses a dedicated, passwordless SSH key pair, which is more secure than password-based authentication.

## 6. Monitoring & Alerting

The project uses the **Google Cloud Operations Suite** for monitoring and alerting, as it is the native and most tightly integrated solution for the GCP platform.
*   **Monitoring:** The Ops Agent is installed on the VM, collecting real-time metrics on CPU, memory, disk, and network usage. These are viewable in a pre-configured dashboard in Cloud Monitoring.
*   **Alerting:** An alerting policy is configured to automatically send an email to the development team if the server's **CPU idle time drops below 10% for a sustained period of 15 minutes.** This indicates a genuine high-load situation that may require attention.
