#! /usr/bin/env node

const yargs = require('yargs')

const init_toolchain_react = require('./create-react-dapp')
const init_toolchain_ng2   = require('./create-ng2-dapp')

yargs.usage("$0 command <directory_path>")
  .command("react [path]", "initialize toolchain: 'React'", () => {}, (argv) => {
    var directory_path = (argv.path)? argv.path : process.cwd()
    init_toolchain_react(directory_path)
  })
  .command("ng2 [path]", "initialize toolchain: 'Angular 2'", () => {}, (argv) => {
    var directory_path = (argv.path)? argv.path : process.cwd()
    init_toolchain_ng2(directory_path)
  })
  .command('*', false, () => {}, (argv) => {
    console.log('[ERROR]: unrecognized command. Please choose an available toolchain.')
  })
  .demand(1, "must select a toolchain")
  .example('$0 react ~/react_frontend_dapp', "toolchain: 'React'\ndirectory path: '~/react_frontend_dapp'")
  .example('$0 react', "toolchain: 'React'\ndirectory path: '.'")
  .help("help")
  .epilog("copyright: Warren Bank <github.com/warren-bank>\nlicense: GPLv2")
  .argv
