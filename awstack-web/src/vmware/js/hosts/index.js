import * as controllers from "./controllers";
import * as services from "./services";

let hostsModule = angular.module("hostsModule", []);

hostsModule.config(["$controllerProvider", function($controllerProvider){
	$controllerProvider.register(controllers);
}]);

hostsModule.config(["$provide", function($provide){
	$provide.service(services);
}]);



export default hostsModule.name;