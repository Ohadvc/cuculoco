const {program} = require('commander');
const {Cli} = require('cucumber');
const VError = require('verror');
const chalk = require('chalk');

function exitWithError(error) {
  console.error(VError.fullStack(error)) // eslint-disable-line no-console
  process.exit(1)
}

function main() {
  parse_arguments();
  console.log(`${chalk.cyanBright('running test')} `);
  run_cucumber(build_cucumber_args())
}

async function run_cucumber(args) {
  const cwd = process.cwd();
  const cli = new Cli({
    argv: args,
    cwd,
    stdout: process.stdout,
  });

  let result;
  try {
    result = await cli.run()
  } catch (error) {
    exitWithError(error)
  }

  require('./runtime/reporter').generate();

  const exitCode = result.success ? 0: 1;
  if (result.shouldExitImmediately) {
    process.exit(exitCode)
  } else {
    process.exitCode = exitCode
  }
}

function parse_arguments() {
  program
    .option('--env <name>', 'environment to use', 'integration')
    .option('--existing', 'use existing account', false)
    .option('-t, --tags <string>', 'filter by tags')
    .option('-c, --create-only', 'only creare automatic account')
    .usage("[options] [feature file/folder]...");
  program.parse(process.argv);
}

function build_cucumber_args() {
  let args = [
    process.argv[0], process.argv[1],
    '-r steps',
    '-r runtime/world.js',
    '--no-strict',
    '-fjson:reports/cucumber-report.json'
  ];
  if (program.tags)
    args.push(`-t ${program.tags}`);
  args.push(...program.args);

  return args;
}

main()
