import config from './config'
//import main from './main'
let virtualMachine = angular.module('virtualMachine', [])
virtualMachine.config(config)
//vmModule.run(main)

export default virtualMachine.name