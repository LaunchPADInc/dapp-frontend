#! /usr/bin/env node

const shell = require('shelljs')
const fs = require('fs')

const init_toolchain = function(directory_path){
  var stats

  try {
    stats = fs.statSync(directory_path)
    if (! stats.isDirectory()){
      console.log('Project is not a directory:' + "\n  " + directory_path)
      process.exit(1)
    }
  }
  catch(error){
    console.log('Project directory does not exist:' + "\n  " + directory_path)
    process.exit(1)
  }

  shell.cd(directory_path);
  // console.log('current directory = ' + process.cwd())

  if (parseInt(process.version.replace(/^[^\d]*(\d+)\..*$/, '$1'), 10) < 6){
    console.log('"angular-starter" requires Node v6.0.0 (or higher)')
    process.exit(1)
  }

  if (! shell.which('git')) {
    console.log('Missing required dependency: "git" client')
    process.exit(1)
  }

  // tested at commit #635669f050afcc7588a4bf9bc3038763a2c12b1d
  if (shell.exec("git clone --depth 1 https://github.com/angularclass/angular2-webpack-starter.git .").code !== 0){
    console.log('')
    console.log('"git" encountered a problem cloning the "angular-starter" project.')
    console.log('It returned an error code.')
    console.log('Inspect the contents of the new project directory:' + "\n  " + directory_path)
    process.exit(1)
  }

  if (shell.exec("npm install").code !== 0){
    console.log('')
    console.log('"npm" encountered a problem installing dependencies for the "angular-starter" project.')
    console.log('It returned an error code.')
    console.log('Inspect the contents of the new project directory:' + "\n  " + directory_path)
    process.exit(1)
  }

  if (shell.exec("npm install --save web3").code !== 0){
    console.log('')
    console.log('"npm" encountered a problem installing the dependency: "web3".')
    console.log('It returned an error code.')
    console.log('Inspect the contents of the new project directory:' + "\n  " + directory_path)
    process.exit(1)
  }

  // remove unwanted files
  shell.rm('-Rf', [
    './.git',
    './.github',
    './src/*'
  ])

  // copy new files into project directory
  shell.cp('-Rf', __dirname + '/../toolchains/ng2/*', './src')

  var committed =
  (shell.exec('git init').code === 0) &&
  (shell.exec('git add --all .').code === 0) &&
  (shell.exec('git commit -m "[dapp-frontend ng2]: new project"').code === 0)

  console.log('')

  if (committed){
    console.log('"Angular 2" project created successfully.')
  }
  else {
    console.log('"Angular 2" project created.')
    console.log('[Warning]: Encountered a problem creating git repo in project directory')
  }
}

// https://nodejs.org/docs/latest/api/all.html#modules_accessing_the_main_module
if (require.main === module){
  // script was invoked directly from command-line
  ((argv) => {
    var directory_path = (argv && Array.isArray(argv) && (argv.length >= 3)) ? argv[2] : process.cwd()
    init_toolchain(directory_path)
  })(process.argv)
}
else {
  module.exports = init_toolchain
}
