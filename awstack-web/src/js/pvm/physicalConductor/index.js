import * as controllers from "./controllers";
import * as services from "./services";

let physicalConductorModule = angular.module("physicalConductorModule", []);

physicalConductorModule.config(["$controllerProvider", function($controllerProvider){
	$controllerProvider.register(controllers);
}]);

physicalConductorModule.config(["$provide", function($provide){
	$provide.service(services);
}]);



export default physicalConductorModule.name;