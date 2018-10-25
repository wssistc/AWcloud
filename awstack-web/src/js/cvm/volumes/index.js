import * as controllers from "./controllers";
import * as services from "./services";

let backupsModule = angular.module("backupsModule", ["rzModule"]);

backupsModule.config(["$controllerProvider", function($controllerProvider){
	$controllerProvider.register(controllers);
}]);

backupsModule.config(["$provide", function($provide){
	$provide.service(services);
}]);



export default backupsModule.name;