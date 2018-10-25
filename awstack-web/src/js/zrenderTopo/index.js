import * as controllers from "./controllers";
import * as services from "./services";

let zrenderTopoModule = angular.module("zrenderTopoModule", []);

zrenderTopoModule.config(["$controllerProvider", function($controllerProvider){
    $controllerProvider.register(controllers);
}]);

zrenderTopoModule.config(["$provide", function($provide){
    $provide.service(services);
}]);



export default zrenderTopoModule.name;