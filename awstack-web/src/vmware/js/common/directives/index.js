import validateModule from "./validate";
import emptyModule from "./empty";
import chartsModule from "./chart";
import UIModule from "./ui-directive";

let directives = angular.module("directiveModule",[
	validateModule,
	emptyModule,
	chartsModule,
    UIModule
]);

export default directives.name;
