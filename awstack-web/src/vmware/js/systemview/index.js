"use strict";
import * as system from "./systemCtrl";
let module = angular.module("vmware.systemview",[]);
module.controller("vmware.systemCtrl",system.systemCtrl);
export default module.name;
