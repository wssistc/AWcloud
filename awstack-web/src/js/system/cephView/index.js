import * as controllers from "./controllers";
import * as services from "./services";

let cephViewModule = angular.module("cephViewModule", ["rzModule"]);

cephViewModule.config(["$controllerProvider", function($controllerProvider){
	$controllerProvider.register(controllers);
}]);

cephViewModule.config(["$provide", function($provide){
	$provide.service(services);
}]);



export default cephViewModule.name;