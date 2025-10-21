pipeline {
    agent any // This tells Jenkins to run the pipeline on any available agent.

    stages {
        stage('Checkout') {
            steps {
                // This command automatically checks out code from the GitHub repo
                // configured in the Jenkins job.
                echo 'Checking out the code...'
                checkout scm
            }
        }

        stage('Build') {
            steps {
                // Placeholder
                echo 'Building the application...'
                sh 'npm install' // Example: Install dependencies
            }
        }

        stage('Test') {
            steps {
                // This stage runs automated tests. The build will fail if tests fail.
                echo 'Running tests...'
                sh 'npm test' // Example: Run unit tests
            }
        }

        stage('Build Docker Image') {
            steps {
                // This stage uses Docker to build an image of the application.
                echo 'Building Docker image...'
                sh 'docker build -t your-docker-repo/student-app .'
            }
        }

        stage('Deploy') {
            // We will build this stage out later. It will deploy the Docker image.
            steps {
                echo 'Deploying application...'
            }
        }
    }
}