pipeline {
    options {
        timeout(time: 25, unit: 'MINUTES')
        timestamps()
        disableConcurrentBuilds()
        ansiColor('xterm')
        buildDiscarder(logRotator(numToKeepStr: '24'))
    }
    agent {
        dockerfile {
            label 'master'
        }
    }
    parameters {
        choice(name: 'folder', choices: ['example'], description: 'Folder')
    }
    stages {
        stage('Run Tests') {
            steps {
                sh "npm install && node index ./features/${params.squad}"
            }
        }
    }
    post {
        always {
            cucumber fileIncludePattern: '**/*.json', jsonReportDirectory: 'reports', sortingMethod: 'ALPHABETICAL'
        }
        unstable {
            script { send_slackSend('warning') }
        }
        failure {
            script { send_slackSend('danger') }
        }
    }
}
