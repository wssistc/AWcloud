import * as controllers from "./controllers";
import * as services from "./services";

let physicalResourceModule = angular.module("physicalResourceModule", []);

physicalResourceModule.config(["$controllerProvider", function($controllerProvider){
	$controllerProvider.register(controllers);
}]);

physicalResourceModule.config(["$provide", function($provide){
	$provide.service(services);
}]);



export default physicalResourceModule.name;