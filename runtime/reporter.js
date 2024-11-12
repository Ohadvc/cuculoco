const reporter = require('cucumber-html-reporter');

const options = {
    theme: 'hierarchy',
    jsonFile: 'reports/cucumber-report.json',
    output: 'reports/cucumber-report.html',
    reportSuiteAsScenarios: true,
    columnLayout: 1,
    scenarioTimestamp: true,
    launchReport: false,
};

function generate() {
    reporter.generate(options)
}

exports.generate = generate

