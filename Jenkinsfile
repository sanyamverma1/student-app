// This is a Declarative Pipeline
pipeline {
    agent any

    // Define variables for the entire pipeline
    environment {
        DOCKERHUB_USERNAME = 'lurk8ola@gmail.com' 
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out source code...'
                checkout scm
            }
        }

        stage('Build & Test Frontend') {
            steps {
                dir('frontend') {
                    echo 'Preparing Frontend...'
                    sh 'npm install'
                    sh 'npm test'
                }
            }
        }

        stage('Build & Test Backend') {
            steps {
                dir('backend') {
                    echo 'Preparing Backend...'
                    sh 'npm ci --omit=dev'
                    sh 'npm test'
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                echo 'Building Docker Images...'
                
                // Build the frontend image using the username defined above.
                // We tag it with the build number (e.g., '1', '2', '3') for a unique version.
                dir('frontend') {
                    sh "docker build -t ${DOCKERHUB_USERNAME}/student-app-frontend:${BUILD_NUMBER} ."
                    sh "docker build -t ${DOCKERHUB_USERNAME}/student-app-frontend:latest ."
                }

                // Build the backend image.
                dir('backend') {
                    sh "docker build -t ${DOCKERHUB_USERNAME}/student-app-backend:${BUILD_NUMBER} ."
                    sh "docker build -t ${DOCKERHUB_USERNAME}/student-app-backend:latest ."
                }
            }
        }

        // This stage securely logs in and pushes the images.
        stage('Push Docker Images') {
            steps {
                // This block tells Jenkins: "Find the secret with the nickname 'dockerhub-credentials'".
                // It injects the real username and password into temporary variables.
                withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials', passwordVariable: 'DOCKER_PASSWORD', usernameVariable: 'DOCKER_USERNAME')]) {
                    
                    echo 'Logging in to Docker Hub...'
                    // The double quotes are important here to use the variables.
                    sh "docker login -u ${DOCKER_USERNAME} -p ${DOCKER_PASSWORD}"
                    
                    echo 'Pushing frontend image...'
                    sh "docker push ${DOCKERHUB_USERNAME}/student-app-frontend:${BUILD_NUMBER}"
                    sh "docker push ${DOCKERHUB_USERNAME}/student-app-frontend:latest"
                    
                    echo 'Pushing backend image...'
                    sh "docker push ${DOCKERHUB_USERNAME}/student-app-backend:${BUILD_NUMBER}"
                    sh "docker push ${DOCKERHUB_USERNAME}/student-app-backend:latest"
                }
            }
        }

        stage('Deploy') {
            steps {
                echo 'Skipping deploy stage for now...'
            }
        }
    }

    post {
        always {
            echo 'Pipeline finished.'
            // Always good practice to clean up to save disk space.
            sh 'docker image prune -af'
        }
    }
}