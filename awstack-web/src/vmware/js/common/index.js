import  directiveModule from  "./directives";
import filtersModule from "./filters/filters";
import servicesModule from "./services";

let component = angular.module('component',[
    directiveModule,
    filtersModule,
    servicesModule,
    "ui.select",
    "ngSanitize", 
    "ngTable", 
    "ui.bootstrap.tpls",
    "ngAnimate", 
    "ui.bootstrap",
    "ngMessages",
    "ui.tree"
]);
export default component.name;