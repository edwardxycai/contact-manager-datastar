pipeline {
    agent {
        docker {
            image 'mcr.microsoft.com/playwright:v1.42.1-jammy'
            args '-u root:root'
        }
    }

    environment {
        PLAYWRIGHT_BROWSERS_PATH = "${WORKSPACE}/.cache/ms-playwright"
        NPM_CONFIG_CACHE        = "${WORKSPACE}/.cache/npm"
        CI = 'true'
    }

    stages {
        stage('Clean Workspace') {
        steps {
            deleteDir()   // THIS IS NON-NEGOTIABLE
        }
        }

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
                allowMissing: true,
                reportName: 'Playwright Report',
                reportDir: 'playwright-report',
                reportFiles: 'index.html',
                keepAll: true,
                alwaysLinkToLastBuild: true
            ])
        }
        success { echo '✅ Pipeline succeeded' }
        failure { echo '❌ Pipeline failed' }
    }
}