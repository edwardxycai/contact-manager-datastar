pipeline {
    agent any

    tools {
        nodejs 'node-22.12.0'
    }

    environment {
        APP_DIR = 'contact-manager-datastar'
    }

    stages {

        stage('Verify Node') {
            steps {
                sh 'node -v'
                sh 'npm -v'
            }
        }

        stage('Install Dependencies') {
            steps {
                dir(env.APP_DIR) {
                    sh 'npm ci'
                }
            }
        }

        stage('Run Tests') {
            steps {
                dir(env.APP_DIR) {
                    sh 'npm test'
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                dir(env.APP_DIR) {
                    sh 'docker build -t contact-manager-datastar:latest .'
                }
            }
        }

        stage('Deploy (optional)') {
            steps {
                sh '''
                  docker stop contact-manager || true
                  docker rm contact-manager || true
                  docker run -d \
                    --name contact-manager \
                    -p 3000:3000 \
                    contact-manager-datastar:latest
                '''
            }
        }
    }

    post {
        success { echo '✅ Pipeline succeeded' }
        failure { echo '❌ Pipeline failed' }
    }
}
