import * as controllers from "./controllers";
import * as services from "./services";

let clustersModule = angular.module("clustersModule", []);

clustersModule.config(["$controllerProvider", function($controllerProvider){
	$controllerProvider.register(controllers);
}]);

clustersModule.config(["$provide", function($provide){
	$provide.service(services);
}]);

export default clustersModule.name;