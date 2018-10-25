import "./quotas/quotasCtrl";
import "./cloud/cloudCtrl";
import "./general/generalCtrl";
import "./paasService/paasCtrl"
angular.module("settingsAll", ["quotaModule", "cloudModule", "generalModule", "paasModule"]);
