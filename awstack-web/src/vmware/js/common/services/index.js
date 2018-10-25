import checkedSrvModule from "./checkedSrv";
import alertmodule from "./alertSrv";
import kbnModule from "./kbnSrv";
import angularResizeModule from "./angularResizeSrv";
import uiComponentModule from "./uiComponentSrv";

let servicesModule = angular.module("servicesModule", [
    checkedSrvModule,
    alertmodule,
    kbnModule,
    angularResizeModule,
    uiComponentModule
]);
export default servicesModule.name;

