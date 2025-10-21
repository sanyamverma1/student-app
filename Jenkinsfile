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
                
                // Set initial GitHub status to pending
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
                echo 'Building Docker Images...'
                
                dir('frontend') {
                    sh "docker build -t ${DOCKERHUB_USERNAME}/student-app-frontend:${BUILD_NUMBER} ."
                    sh "docker build -t ${DOCKERHUB_USERNAME}/student-app-frontend:latest ."
                }

                dir('backend') {
                    sh "docker build -t ${DOCKERHUB_USERNAME}/student-app-backend:${BUILD_NUMBER} ."
                    sh "docker build -t ${DOCKERHUB_USERNAME}/student-app-backend:latest ."
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

        stage('Push Docker Images') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials', passwordVariable: 'DOCKER_PASSWORD', usernameVariable: 'DOCKER_USERNAME')]) {
                    
                    echo 'Logging in to Docker Hub...'
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

        stage('Deploy to Production') {
            steps {
                echo '--- Deploying application to the server ---'

                withCredentials([sshUserPrivateKey(credentialsId: 'autodeploynag3studentapp', keyFileVariable: 'SSH_KEY')]) {
                    
                    sh """
                        ssh -o StrictHostKeyChecking=no -i \${SSH_KEY} terif@localhost << EOF
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
            sh 'docker image prune -af'
            
            // Final GitHub status update
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
            // Optional: Send success notifications
        }
        failure {
            echo 'Pipeline failed!'
            // Optional: Send failure notifications
        }
        unstable {
            echo 'Pipeline is unstable!'
            // Optional: Send unstable notifications
        }
    }
}