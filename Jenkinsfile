pipeline {
    agent any

    tools {
        nodejs 'node-22.12.0'
    }

    environment {
        PROJECT_DIR = '/home/vovo/workspace/node-workspace/contact-manager-datastar'
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
                dir('/home/vovo/workspace/node-workspace/contact-manager-datastar') {
                    sh 'npm ci'
                }
            }
        }

        stage('Run Tests') {
            steps {
                dir('/home/vovo/workspace/node-workspace/contact-manager-datastar') {
                    sh 'npm run test'
                }
            }
        }
    }

    post {
        always {
            echo 'Pipeline finished'
        }
        success {
            echo '✅ Tests passed'
        }
        failure {
            echo '❌ Tests failed'
        }
    }
}
