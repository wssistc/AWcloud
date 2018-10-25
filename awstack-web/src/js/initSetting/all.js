import "./initSettingCtrl";
import "./alarmSettingCtrl";
import "./vpcSettingCtrl";
import "./storageSettingCtrl";
import "./transferSettingCtrl";

angular.module("initSettingAll", [
    "initSettingModule",
    "initAlarmSettingModule",
    "initVpcSettingModule",
    "initStorageSettingModule",
    "initTransferSettingModule"
]);
