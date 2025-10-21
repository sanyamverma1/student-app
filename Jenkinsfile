// This is a Declarative Pipeline, the modern standard for Jenkins.
pipeline {
    // 'agent any' tells Jenkins to run this pipeline on any available machine.
    agent any

    // The 'stages' block contains the main work of the pipeline.
    stages {

        // Stage 1: Get the source code from GitHub.
        stage('Checkout') {
            steps {
                echo 'Checking out source code from GitHub...'
                // 'checkout scm' automatically pulls the code from the repository
                // configured in the Jenkins job UI.
                checkout scm
            }
        }

        // Stage 2: Install dependencies and run tests for the frontend.
        stage('Build & Test Frontend') {
            steps {
                // The 'dir' step is crucial. It changes the directory for the commands inside it.
                dir('frontend') {
                    echo '--- Preparing Frontend ---'
                    echo 'Installing frontend dependencies...'
                    sh 'npm install'
                    
                    echo 'Running frontend tests...'
                    sh 'npm test'
                }
            }
        }

        // Stage 3: Install dependencies and run tests for the backend.
        stage('Build & Test Backend') {
            steps {
                dir('backend') {
                    echo '--- Preparing Backend ---'
                    echo 'Installing backend dependencies...'
                    // 'npm ci' is faster and better for CI/CD than 'npm install'.
                    // '--omit=dev' skips development-only packages.
                    sh 'npm ci --omit=dev'
                    
                    echo 'Running backend tests...'
                    sh 'npm test'
                }
            }
        }

        // Stage 4: Build production-ready Docker images for both services.
        stage('Build Docker Images') {
            steps {
                echo '--- Building Docker Images ---'
                
                echo 'Building frontend image...'
                dir('frontend') {
                    // Replace 'your-docker-repo' with your Docker Hub username or registry path.
                    // We tag with the build number for a unique version and 'latest'.
                    sh 'docker build -t your-docker-repo/student-app-frontend:$BUILD_NUMBER .'
                    sh 'docker build -t your-docker-repo/student-app-frontend:latest .'
                }

                echo 'Building backend image...'
                dir('backend') {
                    sh 'docker build -t your-docker-repo/student-app-backend:$BUILD_NUMBER .'
                    sh 'docker build -t your-docker-repo/student-app-backend:latest .'
                }
            }
        }

        // Stage 5: Placeholder for pushing images to a registry.
        stage('Push Docker Images') {
            steps {
                // This is where you would add commands to push your images.
                // This requires setting up credentials in Jenkins first.
                echo 'Skipping push stage for now...'
                // Example commands:
                // sh 'docker push your-docker-repo/student-app-frontend:$BUILD_NUMBER'
                // sh 'docker push your-docker-repo/student-app-backend:$BUILD_NUMBER'
            }
        }

        // Stage 6: Placeholder for deploying the application.
        stage('Deploy') {
            steps {
                // This is where you would deploy your application, for example,
                // by using docker-compose on your production server.
                echo 'Skipping deploy stage for now...'
            }
        }
    }

    // The 'post' block runs after all stages are complete.
    post {
        // 'always' will run regardless of whether the pipeline succeeded or failed.
        always {
            echo 'Pipeline finished.'
            // A good place to clean up old Docker images to save disk space.
            sh 'docker image prune -af'
        }
    }
}