import * as controllers from "./controllers";
import * as services from "./services";

let TDSQLModule = angular.module("TDSQLModule", ["rzModule"]);

TDSQLModule.config(["$controllerProvider", function($controllerProvider){
	$controllerProvider.register(controllers);
}]);

TDSQLModule.config(["$provide", function($provide){
	$provide.service(services);
}]);