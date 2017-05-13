#! /usr/bin/env node

const shell = require('shelljs')
const fs = require('fs')
const npmAddScript = require('npm-add-script')

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
    console.log('"create-react-app" requires Node v6.0.0 (or higher)')
    process.exit(1)
  }

  if (! shell.which('create-react-app')) {
    console.log('Missing required dependency: "create-react-app"')
    console.log('Please run: "npm install -g create-react-app"')
    process.exit(1)
  }

  if (! shell.which('node-sass')) {
    console.log('Missing optional dependency: "node-sass"')
    console.log('Please run: "npm install -g node-sass"')
    console.log('Until this is satisfied:')
    console.log('  - "npm run watch-css" will fail')
    console.log('  - SASS (.scss) will not be transpiled into CSS (.css)')
    console.log('  - "src/App.css" can be modified instead')
  }

  if (shell.exec("create-react-app .").code !== 0){
    console.log('"create-react-app" encountered a problem.')
    console.log('It returned an error code.')
    console.log('Inspect the contents of the new project directory:' + "\n  " + directory_path)
    process.exit(1)
  }

  if (shell.exec("npm install --save web3").code !== 0){
    console.log('"npm" encountered a problem installing the dependency: "web3".')
    console.log('It returned an error code.')
    console.log('Inspect the contents of the new project directory:' + "\n  " + directory_path)
    process.exit(1)
  }

  npmAddScript({
    key: 'build-css',
    value: 'node-sass src/ -o src/'
  })
  npmAddScript({
    key: 'watch-css',
    value: 'npm run build-css && node-sass src/ -o src/ --watch --recursive'
  })

  // remove unwanted files
  shell.rm([
    'src/App.js',
    'src/App.css',
    'src/index.css',
    'src/logo.svg'
  ])

  // copy new files into project directory
  shell.cp('-Rf', __dirname + '/../toolchains/react/*', './src')

  var committed =
  (shell.exec('git init').code === 0) &&
  (shell.exec('git add --all .').code === 0) &&
  (shell.exec('git commit -m "[dapp-frontend react]: new project"').code === 0)

  console.log('')

  if (committed){
    console.log('"React" project created successfully.')
  }
  else {
    console.log('"React" project created.')
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
