import config from './config'
//import main from './main'
let elasticExtension = angular.module('elasticExtension', [])
elasticExtension.config(config)
//vmModule.run(main)

export default elasticExtension.name