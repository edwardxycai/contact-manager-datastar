pipeline {
    // agent {
    //     docker {
    //         image 'mcr.microsoft.com/playwright:v1.58.0-jammy'
    //         args '-v /dev/shm:/dev/shm --user root'
    //         reuseNode true
    //     }
    // }
    agent any
    
    // options {
    //     skipDefaultCheckout(true)
    // }

    environment {
        // PLAYWRIGHT_BROWSERS_PATH = "${WORKSPACE}/.cache/ms-playwright"
        // NPM_CONFIG_CACHE        = "${WORKSPACE}/.cache/npm"
        CI = 'true'
    }

    stages {
        stage('Clean & Checkout') {
           steps {
                // // 使用 sh 而非 deleteDir() 有時更暴力有效，確保權限問題被掃除
                // sh 'sudo chown -r jenkins:jenkins . || true' 
                deleteDir()
                checkout scm
            }
        }

        stage('Run tests in Docker') {
            agent {
                docker {
                    image 'mcr.microsoft.com/playwright:v1.58.0-jammy'
                    args '-v /dev/shm:/dev/shm --user root'
                    // args '-v /dev/shm:/dev/shm -u $(id -u):$(id -g)'                    
                    reuseNode true
                }
            }

            steps {
                sh 'npm ci'
                sh 'npm test'
                sh 'npx playwright test'
            }
        }
        // stage('Install Dependencies') {
        //     steps {
        //         sh 'npm ci'
        //         sh 'npx playwright install'
        //     }
        // }

        // stage('API Tests (Jest)') {
        //     steps {
        //         sh 'npm test'
        //     }
        // }

        // stage('UI Tests (Playwright)') {
        //     steps {
        //         sh 'npx playwright test'
        //     }
        // }

        stage('Build Production Image') {
            steps{
                // 回到主機執行 Docker Build，這時 node_modules 已經被 ignore
                sh 'docker build -t contact-manager-datastar:latest .'
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