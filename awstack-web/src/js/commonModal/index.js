import * as controllers from "./controllers";

let commonModalModule = angular.module("commonModalModule", []);

commonModalModule.config(["$controllerProvider", function($controllerProvider){
    $controllerProvider.register(controllers);
}]);



export default commonModalModule.name;