import "./alertSrv";
import "./backendSrv";
import "./checkedSrv";
import "./newCheckedSrv";
import "./detailSrv";
import "./angularResizeSrv";
import "./checkQuotaSrv";
import "./commonFuncSrv";
import "./kbnSrv";
import "./getOptionsSrv";
import "./wsSrv";
import "./vmFuncSrv";
import "./component";
import "./ipSrv";
import "./localInit";
import "./helpSrv";
angular.module("services", [
    "alertsrv", 
    "backendsrv", 
    "checkedsrv", 
    "newCheckedSrv",
    "detailsrv",
    "rt.resize",
    "checkQuotaModule",
    "commonFuncModule",
    "kbnModule",
    "wsModule",
    "getOptionsModule",
    "vmFuncModule",
    "comModule",
    "ipSrvModule",
    "localInitModule",
    "helpModule"
]);
