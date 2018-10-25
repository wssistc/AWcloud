import * as controllers from "./controllers";
import * as services from "./services";

let vmModule = angular.module("vmModule", ["ngSanitize", "ui.bootstrap.tpls","ui.select"]);

vmModule.config(["$controllerProvider", function($controllerProvider){
	$controllerProvider.register(controllers);
}]);

vmModule.config(["$provide", function($provide){
	$provide.service(services);
}]);



export default vmModule.name;