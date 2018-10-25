import * as controllers from "./controllers";
import * as services from "./services";

let physicalConductorMonitorModule = angular.module("physicalConductorMonitorModule", []);

physicalConductorMonitorModule.config(["$controllerProvider", function($controllerProvider){
	$controllerProvider.register(controllers);
}]);

physicalConductorMonitorModule.config(["$provide", function($provide){
	$provide.service(services);
}]);



export default physicalConductorMonitorModule.name;