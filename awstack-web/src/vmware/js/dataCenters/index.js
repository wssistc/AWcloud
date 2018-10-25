import * as controllers from "./controllers";
import * as services from "./services";

let dataCentersModule = angular.module("dataCentersModule", []);

dataCentersModule.config(["$controllerProvider", function($controllerProvider){
	$controllerProvider.register(controllers);
}]);

dataCentersModule.config(["$provide", function($provide){
	$provide.service(services);
}]);

export default dataCentersModule.name;