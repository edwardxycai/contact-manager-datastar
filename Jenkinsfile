pipeline {
    agent {
        docker {
            image 'mcr.microsoft.com/playwright:v1.58.0-jammy'
            args '--user root -v /dev/shm:/dev/shm'
            reuseNode true
        }
    }

    // options {
    //     skipDefaultCheckout(true)
    // }

    environment {
        PLAYWRIGHT_BROWSERS_PATH = "${WORKSPACE}/.cache/ms-playwright"
        NPM_CONFIG_CACHE        = "${WORKSPACE}/.cache/npm"
        CI = 'true'
    }

    stages {
        // stage('Clean Workspace + Check Out') {
        //     steps {
        //         deleteDir()   // THIS PREVENTS THE BUG FOREVER
        //         checkout scm            
        //     }
        // }

        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('API Tests (Jest)') {
            steps {
                sh 'npm test'
            }
        }

        stage('UI Tests (Playwright)') {
            steps {
                sh 'npx playwright test'
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: 'playwright-report/**', allowEmptyArchive: true

            publishHTML([
                reportName: 'Playwright Report',
                reportDir: 'playwright-report',
                reportFiles: 'index.html',
                keepAll: true,
                allowMissing: true,                
                alwaysLinkToLastBuild: true
            ])
        }
        success { echo '✅ Pipeline succeeded' }
        failure { echo '❌ Pipeline failed' }
    }
}