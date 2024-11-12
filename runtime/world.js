const { setWorldConstructor, setDefaultTimeout, After, Before, Status } =  require('cucumber');
// const { setWorldConstructor, setDefaultTimeout, After, Status } =  require('cucumber');
const {context, set} = require('./context');
const browser = require('./browser');
const humanizeDuration = require("humanize-duration");
const chalk = require('chalk');


function CustomWorld({ attach, parameters }) {
    set(parameters);
    this.attach = attach;
    setDefaultTimeout(context.step_timeout);
}

function extractFeatureName(uri) {
    return uri.split('/').pop().split('.')[0]
}
function scenarioFullName(scenario) {
    return `${chalk.cyanBright(extractFeatureName(scenario.sourceLocation.uri))}: ${chalk.magentaBright(scenario.pickle.name)}`
}
function scenarioResult(result) {
    return `${scenarioStatus(result.status)} ${chalk.yellow(humanizeDuration(result.duration/1000000))}`;
}
function scenarioStatus(status) {
    if (status === 'passed')
        return `${chalk.green(status)}`;
    else
        return `${chalk.red(status)}`;
}

Before(async function (scenario) {

    context.current_scenario = scenario.pickle.id;

    console.log(`${scenarioFullName(scenario)} ${chalk.cyanBright("started")}`);
});

After(async function (scenario) {

    console.log(` ${scenarioFullName(scenario)} ended in -  ${scenarioResult(scenario.result)}`);

    if (scenario.result.status === Status.FAILED) {
        const screenshot = await browser.takeScreenshot();
        if (screenshot)
            this.attach(screenshot, 'image/png');
    }

    // Teardown browser
    await browser.destroy()
});

setWorldConstructor(CustomWorld);
