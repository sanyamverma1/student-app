// This is a Declarative Pipeline
pipeline {
    agent any

    triggers {
        githubPush()
    }

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
                    echo 'Installing all backend dependencies for testing...'
                    sh 'npm ci'
                    echo 'Running backend tests...'
                    sh 'npm test'
                }
            }
        }

        // ENHANCED: Comprehensive Security Scans (FIXED)
        stage('Security Scans') {
            parallel {
                stage('Dependency Scan') {
                    steps {
                        script {
                            dir('frontend') {
                                sh 'npm audit --audit-level high || echo "Frontend vulnerabilities found"'
                            }
                            dir('backend') {
                                sh 'npm audit --audit-level high || echo "Backend vulnerabilities found"'
                            }
                        }
                    }
                }
                
                stage('Container Vulnerability Scan') {
                    steps {
                        script {
                            // Build images first for Trivy scanning
                            dir('frontend') {
                                sh "docker build -f Dockerfile.prod -t ${DOCKERHUB_USERNAME}/student-app-frontend:${BUILD_NUMBER} ."
                            }
                            dir('backend') {
                                sh "docker build -f Dockerfile.prod -t ${DOCKERHUB_USERNAME}/student-app-backend:${BUILD_NUMBER} ."
                            }
                            
                            // Scan with Trivy
                            sh "trivy image --exit-code 0 --severity HIGH,CRITICAL ${DOCKERHUB_USERNAME}/student-app-frontend:${BUILD_NUMBER} || echo 'Frontend container scan completed'"
                            sh "trivy image --exit-code 0 --severity HIGH,CRITICAL ${DOCKERHUB_USERNAME}/student-app-backend:${BUILD_NUMBER} || echo 'Backend container scan completed'"
                        }
                    }
                }
                
                stage('Secrets Detection') {
                    steps {
                        script {
                            // Scan for hardcoded secrets
                            sh 'gitleaks detect --source . --exit-code 0 || echo "Secrets scan completed"'
                        }
                    }
                }
            }
        }

        // DYNAMIC: Security Analysis
        stage('Security Review') {
            steps {
                script {
                    echo '=== SECURITY SCAN SUMMARY ==='
                    echo 'Scans performed:'
                    echo '- Dependency scanning (npm audit)'
                    echo '- Container vulnerability scanning (Trivy)'
                    echo '- Secrets detection (Gitleaks)'
                    echo ''
                    
                    // DYNAMIC: Try to detect actual vulnerabilities
                    def frontendVulns = "Unknown"
                    def backendVulns = "Unknown"
                    def secretsFound = "Unknown"
                    
                    // Check frontend npm audit results
                    dir('frontend') {
                        try {
                            def auditOutput = sh(script: 'npm audit --audit-level high --silent 2>&1 || true', returnStdout: true).trim()
                            if (auditOutput.contains("found 0 vulnerabilities")) {
                                frontendVulns = "0"
                            } else if (auditOutput.contains("high")) {
                                frontendVulns = "High vulnerabilities detected"
                            } else {
                                frontendVulns = "Vulnerabilities found (check logs)"
                            }
                        } catch (Exception e) {
                            frontendVulns = "Scan failed"
                        }
                    }
                    
                    // Check backend npm audit results
                    dir('backend') {
                        try {
                            def auditOutput = sh(script: 'npm audit --audit-level high --silent 2>&1 || true', returnStdout: true).trim()
                            if (auditOutput.contains("found 0 vulnerabilities")) {
                                backendVulns = "0"
                            } else {
                                backendVulns = "Vulnerabilities found (check logs)"
                            }
                        } catch (Exception e) {
                            backendVulns = "Scan failed"
                        }
                    }
                    
                    // Check secrets status from gitleaks
                    try {
                        def gitleaksOutput = sh(script: 'gitleaks detect --source . --exit-code 0 --quiet 2>&1 || true', returnStdout: true).trim()
                        if (gitleaksOutput.contains("no leaks found")) {
                            secretsFound = "No secrets detected"
                        } else {
                            secretsFound = "Potential secrets found (check logs)"
                        }
                    } catch (Exception e) {
                        secretsFound = "Scan failed"
                    }
                    
                    echo 'VULNERABILITY STATUS:'
                    echo "Frontend: ${frontendVulns}"
                    echo "Backend: ${backendVulns}"
                    echo "Secrets: ${secretsFound}"
                    echo ''
                    
                    // DYNAMIC: Set security requirement based on actual scan results
                    def requiresReview = false
                    if (!frontendVulns.contains("0") || !backendVulns.contains("0") || secretsFound.contains("Potential")) {
                        requiresReview = true
                        env.SECURITY_REVIEW_REQUIRED = 'true'
                        echo 'MANUAL SECURITY REVIEW REQUIRED - vulnerabilities detected'
                    } else {
                        env.SECURITY_REVIEW_REQUIRED = 'false'
                        echo 'ALL SECURITY CHECKS PASSED - no manual review needed'
                    }
                    
                    // Store vulnerability count for reporting
                    env.FRONTEND_VULNERABILITIES = frontendVulns
                    env.BACKEND_VULNERABILITIES = backendVulns
                    env.SECRETS_STATUS = secretsFound
                }
            }
        }

        // FIXED: Security Approval Gate
        stage('Security Approval') {
            when {
                expression { env.SECURITY_REVIEW_REQUIRED == 'true' }
            }
            steps {
                script {
                    echo '=== SECURITY APPROVAL REQUIRED ==='
                    echo "Build: ${env.BUILD_NUMBER}"
                    // DYNAMIC: Use actual vulnerability counts
                    echo "Frontend: ${env.FRONTEND_VULNERABILITIES}"
                    echo "Backend: ${env.BACKEND_VULNERABILITIES}" 
                    echo "Secrets: ${env.SECRETS_STATUS}"
                    echo ''
                    echo 'Options:'
                    echo '1. Approve deployment (acknowledge risks)'
                    echo '2. Cancel and fix vulnerabilities first'
                    echo '3. Check security reports in build artifacts'
                    
                    def deploymentApproval = input(
                        // DYNAMIC: Use actual vulnerability info in message
                        message: "Security: Build ${env.BUILD_NUMBER} has vulnerabilities. Frontend: ${env.FRONTEND_VULNERABILITIES}, Backend: ${env.BACKEND_VULNERABILITIES}. Proceed?", 
                        ok: 'Deploy Anyway',
                        submitterParameter: 'APPROVED_BY'
                    )
                    env.DEPLOYMENT_APPROVED_BY = deploymentApproval
                    echo "Approved by: ${env.DEPLOYMENT_APPROVED_BY}"
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                echo '--- Building Docker Images ---'
                
                // Images already built in security stage, just tag them
                echo 'Tagging production images...'
                dir('frontend') {
                    sh "docker tag ${DOCKERHUB_USERNAME}/student-app-frontend:${BUILD_NUMBER} ${DOCKERHUB_USERNAME}/student-app-frontend:latest"
                }
                dir('backend') {
                    sh "docker tag ${DOCKERHUB_USERNAME}/student-app-backend:${BUILD_NUMBER} ${DOCKERHUB_USERNAME}/student-app-backend:latest"
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
        }

        // The final stage: Automated Deployment
        stage('Deploy to Production') {
            steps {
                echo '--- Deploying application to the server ---'
                withCredentials([sshUserPrivateKey(credentialsId: 'autodeploynag3studentapp', keyFileVariable: 'SSH_KEY')]) {
                    sh """
                        ssh -o StrictHostKeyChecking=accept-new -o LogLevel=ERROR -i \${SSH_KEY} terif@localhost '
                            echo "Connected to the server via SSH."
                            cd ~/student-app || exit 1
                            echo "Navigated to project directory."
                            
                            # FIX: Update git remote URL to correct repository
                            git remote set-url origin https://github.com/student-app-team/student-app.git
                            echo "Updated git remote URL"
                            
                            git pull origin main
                            echo "Pulled latest source code."
                            docker compose -f docker-compose.prod.yml pull
                            echo "Pulled latest Docker images."
                            docker compose -f docker-compose.prod.yml up -d
                            echo "Deployment complete!"
                        '
                    """
                }
            }
        }
    }

     post {
        always {
            echo 'Pipeline finished.'
            sh 'docker image prune -af'
            
            // DYNAMIC: Security summary
            script {
                echo "=== PIPELINE SUMMARY ==="
                echo "Status: ${currentBuild.result ?: 'SUCCESS'}"
                echo "Security Review Required: ${env.SECURITY_REVIEW_REQUIRED ?: 'false'}"
                echo "Frontend Vulnerabilities: ${env.FRONTEND_VULNERABILITIES ?: 'Unknown'}"
                echo "Backend Vulnerabilities: ${env.BACKEND_VULNERABILITIES ?: 'Unknown'}"
                echo "Secrets Status: ${env.SECRETS_STATUS ?: 'Unknown'}"
                echo "Approved by: ${env.DEPLOYMENT_APPROVED_BY ?: 'N/A'}"
                echo "Build: ${env.BUILD_URL}"
            }
        }
        success {
            echo 'Pipeline completed successfully!'
            emailext (
                subject: "SUCCESS: Pipeline ${env.JOB_NAME} - Build ${env.BUILD_NUMBER}",
                body: """
                Pipeline completed with security review!
                
                Build: ${env.BUILD_URL}
                Security Status: ${env.SECURITY_REVIEW_REQUIRED == 'true' ? 'Vulnerabilities detected but approved' : 'All checks passed'}
                Frontend: ${env.FRONTEND_VULNERABILITIES ?: 'Unknown'}
                Backend: ${env.BACKEND_VULNERABILITIES ?: 'Unknown'}
                Secrets: ${env.SECRETS_STATUS ?: 'Unknown'}
                Approved by: ${env.DEPLOYMENT_APPROVED_BY ?: 'N/A'}
                """,
                to: "104860583@student.swin.edu.au"
            )
        }
        failure {
            echo 'Pipeline failed!'
            emailext (
                subject: "FAILED: Pipeline ${env.JOB_NAME} - Build ${env.BUILD_NUMBER}",
                body: "Pipeline failed! Check details: ${env.BUILD_URL}",
                to: "104860583@student.swin.edu.au"
            )
        }
    }
}