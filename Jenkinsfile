// This is a Declarative Pipeline
pipeline {
    agent any

    triggers {
        // This enables GitHub webhook triggers
        githubPush()
    }
    // Define variables for the entire pipeline
    environment {
        DOCKERHUB_USERNAME = 'francodeploy' 
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
                    echo '--- Preparing Backend ---'
                    // For testing, we NEED the dev dependencies.
                    // We will run the --omit=dev flag in the Dockerfile instead.
                    echo 'Installing all backend dependencies for testing...'
                    sh 'npm ci'
                    
                    echo 'Running backend tests...'
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

        stage('Deploy to Production') {
            steps {
                echo '--- Deploying application to the server ---'

                withCredentials([sshUserPrivateKey(credentialsId: 'autodeploynag3studentapp', keyFileVariable: 'SSH_KEY')]) {
                    sh """
                        # The '<<-EOF' variation allows the ending EOF to be indented.
                        # This is a cleaner way to write it.
                        ssh -o StrictHostKeyChecking=no -i \${SSH_KEY} terif@localhost <<-EOF

                            echo 'Connected to the server via SSH.'
                            cd ~/student-app || exit 1
                            echo 'Navigated to project directory.'

                            git pull origin main
                            echo 'Pulled latest source code.'

                            docker compose -f docker-compose.prod.yml pull
                            echo 'Pulled latest Docker images.'

                            docker compose -f docker-compose.prod.yml up -d
                            echo 'Deployment complete!'

                        EOF
                    """
                }
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