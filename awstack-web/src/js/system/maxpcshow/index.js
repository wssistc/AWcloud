import * as controllers from "./controllers";
import * as services from "./services";

let maxpcshowModule = angular.module("maxpcshowModule", ["rzModule"]);

maxpcshowModule.config(["$controllerProvider", function($controllerProvider){
	$controllerProvider.register(controllers);
}]);

maxpcshowModule.config(["$provide", function($provide){
	$provide.service(services);
}]);



export default maxpcshowModule.name;