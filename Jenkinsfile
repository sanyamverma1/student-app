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
                script {
                    updateGitHubCommitStatus(
                        name: "jenkins/ci",
                        state: "PENDING", 
                        context: "jenkins/ci",
                        description: "Pipeline started...",
                        targetUrl: "${env.BUILD_URL}"
                    )
                }
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
            post {
                always {
                    script {
                        updateGitHubCommitStatus(
                            name: "jenkins/frontend-tests",
                            state: currentBuild.result == null ? "SUCCESS" : "FAILURE",
                            context: "jenkins/frontend-tests",
                            description: "Frontend tests ${currentBuild.result ?: 'passed'}"
                        )
                    }
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
            post {
                always {
                    script {
                        updateGitHubCommitStatus(
                            name: "jenkins/backend-tests", 
                            state: currentBuild.result == null ? "SUCCESS" : "FAILURE",
                            context: "jenkins/backend-tests",
                            description: "Backend tests ${currentBuild.result ?: 'passed'}"
                        )
                    }
                }
            }
        }


        stage('Build Docker Images') {
            steps {
                echo '--- Building Docker Images ---'
                
                echo 'Building production frontend image...'
                dir('frontend') {
                    // Use the -f flag to specify the production Dockerfile
                    sh "docker build -f Dockerfile.prod -t ${DOCKERHUB_USERNAME}/student-app-frontend:${BUILD_NUMBER} ."
                    sh "docker build -f Dockerfile.prod -t ${DOCKERHUB_USERNAME}/student-app-frontend:latest ."
                }

                echo 'Building production backend image...'
                dir('backend') {
                    // Use the -f flag here as well
                    sh "docker build -f Dockerfile.prod -t ${DOCKERHUB_USERNAME}/student-app-backend:${BUILD_NUMBER} ."
                    sh "docker build -f Dockerfile.prod -t ${DOCKERHUB_USERNAME}/student-app-backend:latest ."
                }
            }
            post {
                always {
                    script {
                        updateGitHubCommitStatus(
                            name: "jenkins/docker-build",
                            state: currentBuild.result == null ? "SUCCESS" : "FAILURE",
                            context: "jenkins/docker-build",
                            description: "Docker images built ${currentBuild.result ?: 'successfully'}"
                        )
                    }
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
            post {
                always {
                    script {
                        updateGitHubCommitStatus(
                            name: "jenkins/docker-push",
                            state: currentBuild.result == null ? "SUCCESS" : "FAILURE",
                            context: "jenkins/docker-push",
                            description: "Docker images pushed ${currentBuild.result ?: 'successfully'}"
                        )
                    }
                }
            }
        }

        // The final stage: Automated Deployment
        stage('Deploy to Production') {
            steps {
                echo '--- Deploying application to the server ---'

                // Use the withCredentials block to securely access the SSH key.
                // The 'credentialsId' must match the ID you created in Jenkins.
                withCredentials([sshUserPrivateKey(credentialsId: 'autodeploynag3studentapp', keyFileVariable: 'SSH_KEY')]) {
                    
                    // The 'sh' step will execute a shell script.
                    // The triple quotes """ allow us to write a multi-line script.
                    sh """
                        # Use the SSH key to connect to the server as the 'terif' user.
                        # The -o StrictHostKeyChecking=no option prevents a prompt about new hosts.
                        ssh -o StrictHostKeyChecking=no -i \${SSH_KEY} terif@localhost << EOF

                            echo 'Connected to the server via SSH.'

                            # Navigate to the project directory
                            # Using '|| exit 1' ensures the script stops if the cd fails.
                            cd ~/student-app || exit 1
                            echo 'Navigated to project directory.'

                            # Pull the latest source code (to get the latest docker-compose.prod.yml)
                            git pull origin main
                            echo 'Pulled latest source code.'

                            # Pull the latest Docker images that were just built
                            docker compose -f docker-compose.prod.yml pull
                            echo 'Pulled latest Docker images.'

                            # Stop the old containers and start the new ones
                            docker compose -f docker-compose.prod.yml up -d
                            echo 'Deployment complete!'
EOF
                    """
                }
            }
            post {
                always {
                    script {
                        updateGitHubCommitStatus(
                            name: "jenkins/deployment",
                            state: currentBuild.result == null ? "SUCCESS" : "FAILURE",
                            context: "jenkins/deployment",
                            description: "Deployment ${currentBuild.result ?: 'succeeded'}"
                        )
                    }
                }
            }
        }
    }

    post {
        always {
            echo 'Pipeline finished.'
            // Always good practice to clean up to save disk space.
            sh 'docker image prune -af'
            script {
                def finalStatus = currentBuild.result ?: 'SUCCESS'
                updateGitHubCommitStatus(
                    name: "jenkins/ci",
                    state: finalStatus == 'SUCCESS' ? 'SUCCESS' : 'FAILURE',
                    context: "jenkins/ci",
                    description: "Pipeline ${finalStatus.toLowerCase()}",
                    targetUrl: "${env.BUILD_URL}"
                )
            }
        }
        
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed!'
        }
        unstable {
            echo 'Pipeline is unstable!'
        }
    }
}
