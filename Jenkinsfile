pipeline {
    agent any

    tools {
        nodejs 'node-22.12.0'
    }

    environment {
        // APP_DIR = 'contact-manager-datastar'
        PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD = '0'
    }

    stages {

        stage('Verify Node') {
            steps {
                sh 'node -v'
                sh 'npm -v'
                sh 'npx -v'
            }
        }

        stage('Install Dependencies') {
            steps {
                dir(env.APP_DIR) {
                    sh 'npm ci'
                    sh 'npx playwright install'
                }
            }
        }

        stage('Run Tests / API Tests with Jest') {
            steps {
                dir(env.APP_DIR) {
                    sh 'npm test'
                }
            }
        }

        stage('Run UI Tests with Playwright') {
            steps {
                dir(env.APP_DIR) {
                    sh '''
                      npm start &
                      APP_PID=$!
                      sleep 5
                      npx playwright test --config=playwright.config.mjs
                      kill $APP_PID
                    '''
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                sh 'docker build -t contact-manager-datastar:latest .'
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
