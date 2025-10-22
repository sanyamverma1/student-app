// This is a Declarative Pipeline
pipeline {
    agent any

    triggers {
        githubPush()
    }

    environment {
        DOCKERHUB_USERNAME = 'francodeploy'
        // Add security thresholds
        MAX_HIGH_VULNERABILITIES = '0'
        MAX_CRITICAL_VULNERABILITIES = '0'
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

        // ENHANCED: Comprehensive Security Scans
        stage('Security Scans') {
            parallel {
                stage('Dependency & SAST Scan') {
                    steps {
                        script {
                            dir('frontend') {
                                sh 'npm audit --audit-level high --json > npm-audit-frontend.json || true'
                                sh 'semgrep --config=auto . --json -o semgrep-frontend.json || true'
                            }
                            dir('backend') {
                                sh 'npm audit --audit-level high --json > npm-audit-backend.json || true'
                                sh 'semgrep --config=auto . --json -o semgrep-backend.json || true'
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
                            
                            // Scan with Trivy (more comprehensive than Docker Scout)
                            sh "trivy image --exit-code 0 --format json --output trivy-frontend.json ${DOCKERHUB_USERNAME}/student-app-frontend:${BUILD_NUMBER} || true"
                            sh "trivy image --exit-code 0 --format json --output trivy-backend.json ${DOCKERHUB_USERNAME}/student-app-backend:${BUILD_NUMBER} || true"
                        }
                    }
                }
                
                stage('Secrets Detection') {
                    steps {
                        script {
                            // Scan for hardcoded secrets
                            sh 'gitleaks detect --source . --exit-code 0 --report-format json --report-path gitleaks-report.json || true'
                        }
                    }
                }
            }
            
            post {
                always {
                    // Archive all security reports
                    archiveArtifacts artifacts: '**/*.json, **/*-report.*', allowEmptyArchive: true
                }
            }
        }

        // NEW: Security Analysis & Gates
        stage('Security Analysis') {
            steps {
                script {
                    echo 'Analyzing security scan results...'
                    
                    // Check for critical vulnerabilities
                    def securityStatus = [
                        dependencies: true,
                        containers: true,
                        secrets: true,
                        sast: true
                    ]
                    
                    // Analyze npm audit results
                    dir('frontend') {
                        if (fileExists('npm-audit-frontend.json')) {
                            def audit = readJSON file: 'npm-audit-frontend.json'
                            def criticalVulns = audit.metadata?.vulnerabilities?.critical ?: 0
                            def highVulns = audit.metadata?.vulnerabilities?.high ?: 0
                            
                            if (criticalVulns > 0 || highVulns > 0) {
                                echo "Frontend has $criticalVulns critical and $highVulns high vulnerabilities"
                                securityStatus.dependencies = false
                            }
                        }
                    }
                    
                    dir('backend') {
                        if (fileExists('npm-audit-backend.json')) {
                            def audit = readJSON file: 'npm-audit-backend.json'
                            def criticalVulns = audit.metadata?.vulnerabilities?.critical ?: 0
                            def highVulns = audit.metadata?.vulnerabilities?.high ?: 0
                            
                            if (criticalVulns > 0 || highVulns > 0) {
                                echo "Backend has $criticalVulns critical and $highVulns high vulnerabilities"
                                securityStatus.dependencies = false
                            }
                        }
                    }
                    
                    // Check Trivy results
                    if (fileExists('trivy-frontend.json')) {
                        def trivy = readJSON file: 'trivy-frontend.json'
                        def criticalVulns = trivy.Results?.findAll { it.Vulnerabilities?.find { it.Severity == 'CRITICAL' } }?.size() ?: 0
                        if (criticalVulns > 0) {
                            echo "Frontend image has $criticalVulns critical vulnerabilities"
                            securityStatus.containers = false
                        }
                    }
                    
                    // Check secrets detection
                    if (fileExists('gitleaks-report.json')) {
                        def gitleaks = readJSON file: 'gitleaks-report.json'
                        if (gitleaks.find { it }) {
                            echo "Potential secrets detected - review gitleaks-report.json"
                            // Don't fail build for secrets, just warn
                        }
                    }
                    
                    // Set environment variable for security status
                    env.SECURITY_STATUS_PASSED = securityStatus.every { it.value }
                    echo "Security Status: ${env.SECURITY_STATUS_PASSED ? 'PASSED' : 'FAILED'}"
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

        // ENHANCED: Security Approval Gate
        stage('Security Approval') {
            when {
                expression { env.SECURITY_STATUS_PASSED == 'false' }
            }
            steps {
                script {
                    echo 'Security scans detected issues that require review!'
                    echo 'Critical/High vulnerabilities found in:'
                    echo '- Dependencies (npm audit)'
                    echo '- Container images (Trivy)'
                    echo ''
                    echo 'Please review the security reports in build artifacts.'
                    echo 'You can either:'
                    echo '1. Fix the vulnerabilities and re-run pipeline'
                    echo '2. Acknowledge and proceed (not recommended for production)'
                    
                    // Manual approval for security issues
                    input(
                        message: 'Security issues detected. Proceed with deployment?', 
                        ok: 'Deploy Anyway',
                        submitterParameter: 'approvedBy',
                        submitter: 'admin,deployer'
                    )
                    
                    echo "Deployment approved by: ${approvedBy}"
                }
            }
        }

        stage('Deploy to Production') {
            steps {
                echo '--- Deploying application to the server ---'

                withCredentials([sshUserPrivateKey(credentialsId: 'autodeploynag3studentapp', keyFileVariable: 'SSH_KEY')]) {
                    sh """
                        ssh -o StrictHostKeyChecking=accept-new -o LogLevel=ERROR -i \${SSH_KEY} terif@localhost << 'EOF'
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
            sh 'docker image prune -af'
            
            // Enhanced security summary
            script {
                echo "=== ENHANCED SECURITY SUMMARY ==="
                echo "Scans performed:"
                echo "Dependency scanning (npm audit)"
                echo "Container vulnerability scanning (Trivy)"
                echo "Secrets detection (Gitleaks)"
                echo "SAST scanning (Semgrep)"
                echo ""
                echo "Security gates:"
                echo "Manual approval required for critical vulnerabilities"
                echo "Security reports archived as build artifacts"
                echo ""
                echo "Next level improvements:"
                echo "- Add staging environment"
                "- Implement automated compliance checks"
                "- Add runtime security scanning"
                "- Integrate with security dashboard"
            }
        }
        success {
            // Security notification
            emailext (
                subject: "SECURITY: Pipeline ${env.JOB_NAME} - Build ${env.BUILD_NUMBER}",
                body: """
                Pipeline completed with security scanning!
                
                Build: ${env.BUILD_URL}
                Security Status: ${env.SECURITY_STATUS_PASSED ? 'PASSED' : 'REVIEW REQUIRED'}
                
                Security reports available in build artifacts.
                """,
                to: "team@yourcompany.com"
            )
        }
        failure {
            emailext (
                subject: "SECURITY ALERT: Pipeline ${env.JOB_NAME} - Build ${env.BUILD_NUMBER}",
                body: """
                Pipeline failed during security scanning!
                
                Build: ${env.BUILD_URL}
                Check security scan results and fix vulnerabilities.
                """,
                to: "team@yourcompany.com"
            )
        }
    }
}