/**
 * Created by Weike on 2016/6/13.
 */
import "./flavorsModule";
import "./aggregatesModule";
import "./aboutModule";
import "./systemInspectionModule";
import "./networksManageMoudle";
import "./hypervisorsModule";
import "./accesspolicy/all";
import "./license/all";
import "./mailServer/all";
import "./storage/all";
import "./grade/gradeModule";
import "./limitband/all";
import "./switch/all";
import "./weChatAlarm/all";
import "./storageManagement/all";
import "./imageManagement/all";
import "./pluginManage/all";
import "./billingManagement/all";
import "./resMetering/all";
import "./datacluster/";
import "./cephView/";
import "./transmissionMag/all";
import "./labelManagement/all";
import "./flowManage/all";
import "./maxpcshow"



angular.module("system", [
    "flavorsModule",
    "gradeModule",
    "aggregatesModule",
    "aboutModule",
    "systemInspectionModule",
    "networksManageMoudle",
    "hypervisorsModule",
    "accessPolicy",
    "license",
    "mailServer",
    "storage",
    "limitband",
    "switch",
    "weChatAlarm",
    "storageManagement",
    "imageManage",
    "plugin",
    "billingModule",
    "resMeteringModule",
    "datacluster",
    "cephViewModule",
    "transmissionMag",
    "labelManagement",
    "flowManageModule",
    "maxpcshowModule"
]);