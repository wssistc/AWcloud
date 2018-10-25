import * as controllers from "./controllers";
import * as services from "./services";

let easyNetworkModule = angular.module("easyNetworkModule", ["rzModule"]);

easyNetworkModule.config(["$controllerProvider", function($controllerProvider){
	$controllerProvider.register(controllers);
}]);

easyNetworkModule.config(["$provide", function($provide){
	$provide.service(services);
}]);



export default easyNetworkModule.name;