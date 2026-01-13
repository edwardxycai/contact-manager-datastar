pipeline {
    agent any

    tools {
        nodejs 'node-22.12.0'
    }

    environment {
        PROJECT_DIR = '/home/vovo/workspace/node-workspace/contact-manager-datastar'
        NODE_IMAGE = 'node:22-bullseye'
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

        stage('Build & Test in Docker') {
            steps {
                script {
                    // Run Docker container with workspace mounted
                    docker.image(env.NODE_IMAGE).inside('-v $PWD:/usr/src/app') {
                        dir(env.APP_DIR) {
                            // Install dependencies and run tests
                            sh 'npm ci'
                            sh 'npm test'
                        }
                    }
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    dir(env.APP_DIR) {
                        sh """
                        docker build -t contact-manager-datastar:latest .
                        """
                    }
                }
            }
        }

        stage('Deploy (optional)') {
            steps {
                echo 'Deploy stage: Add your deployment scripts here'
                // e.g., docker run -d -p 3000:3000 contact-manager-datastar:latest
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