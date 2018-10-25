import "./resource/vmHostModule";
import "./resource/phyHostModule";
import "./resource/cephModule";
import "./resource/sqlDatabaseModule";
import "./monitorview/monitorViewCtrl";
import "./service/srvMonitorModule";
import "./service/openstackServiceModule";
import "./service/mysqlModule";
import "./service/rabbitmqModule";
import "./service/memcachedModule";
import "./service/routerMonitorModule"
import "./alarmManagement/alarmEventModule";
import "./alarmManagement/alarmSettingModule";
import "./alarmManagement/alarmSettingInitModule";
import "./alarmManagement/alarmTemplateModule";
import "./alarmManagement/contractGroupModule";
import "./strategy/strategyCtrl";
import "./boss/bosstaskModule";
import "./boss/fileManagementModule";
import "./graph/theGraphModule";
import "./resource/resviewCtrl";

angular.module("monitorAll", [
    "vmHostModule", 
    "phyHostModule",
    "cephModule", 
    "sqlDatabaseModule",
    "monitorview",
    "serviceModule",
    "openstackServiceModule",
    "mysqlModule",
    "memcachedModule",
    "rabbitmqModule",
    "routerMonitorModule",
    "alarmEventModule",
    "alarmSettingModule",
    "alarmSettingInitModule",
    "alarmTemplateModule",
    "contactGroupModule",
    "strategyModule",
    "bosstaskModule",
    "fileManagementModule",
    "theGraphModule",
    "resviewCtrlModule"
]);
