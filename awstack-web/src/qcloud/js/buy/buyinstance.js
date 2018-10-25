angular.module("mysqlListModule", ["ngSanitize","ngTable", "ngAnimate", "ui.bootstrap", "mysqlsrv", "ui.select", "ngMessages"])
    .controller("MysqlListCtrl", ["$scope", "$rootScope","mysqlSrv","$uibModal","$window", function($scope, $rootScope,mysqlsrv,$uibModal,$window) {
        var self = $scope;
        mysqlsrv.getList();
        /*self.mysqlList = {
            "retcode":0,
            "errmsg":"ok",
            "data":{
                "totalNum":"3",
                "cdbList":[
                    {
                        "resourceId":"664c71ae-de2f-11e6-9136-6c0b84be0ace",
                        "appId":1252694239,
                        "projectId":0,
                        "protocol":"tcp",
                        "vip":"10.66.200.239",
                        "vport":3306,
                        "slaveVip":"",
                        "slaveVport":0,
                        "status":1,
                        "taskStatus":0,
                        "initFlag":0,
                        "businessType":0,
                        "autoRenewFlag":0,
                        "hide_pip":1,
                        "deadline":"0000-00-00 00:00:00",
                        "modTimeStamp":"2017-01-19 18:07:57",
                        "addTimeStamp":"2017-01-19 18:07:58",
                        "isolateTimeStamp":"0000-00-00 00:00:00",
                        "wanDomain":"",
                        "wanVip":"",
                        "wanVport":0,
                        "wanStatus":0,
                        "vpcId":0,
                        "subnetId":0,
                        "clusterId":2,
                        "uInstanceId":"cdb-9a7bmed9",
                        "payType":1,
                        "cdbType":"CUSTOM",
                        "cdbVersion":"5.6",
                        "cdbVip":"10.59.216.87",
                        "cdbVport":15782,
                        "cdbMem":1000,
                        "cdbVolume":25,
                        "cdbStatus":0,
                        "cdbError":0,
                        "zoneId":100003,
                        "tranId":"20170119160000041195527018236847",
                        "isolateType":0,
                        "instType":1,
                        "protectMode":0,
                        "deployMode":0,
                        "slaveZoneId":100003,
                        "cdbTypeBak":"",
                        "exclusterId":"",
                        "instanceId":133318,
                        "instanceName":"cdb133318",
                        "instanceDesc":"",
                        "cdbQps":1000,
                        "hourFeeStatus":1,
                        "overdueStart":0,
                        "isolatedStart":0,
                        "roInfo":[],
                        "drInfo":[],
                        "backupInstanceId":"",
                        "backupVip":"",
                        "backupVport":0,
                        "backupCdbVip":"",
                        "backupCdbVport":0,
                        "backupZoneId":0,
                        "exclusterName":"",
                        "flowId":-1,
                        "addrList":[{"ip":"10.59.216.87","port":15782}],
                        "name":"cdb133318",
                        "cdbInstId":"664c71ae-de2f-11e6-9136-6c0b84be0ace",
                        "type":"CUSTOM",
                        "instanceType":"CUSTOM",
                        "mysqlVersion":"5.6",
                        "maxStorage":25,
                        "maxQueryCount":1000,
                        "capacity":25,
                        "typeName":"高IO版",
                        "subTypeName":"自定义类型",
                        "regionId":1,
                        "typeText":"CUSTOM",
                        "deadlineText":"--",
                        "destroyDeadlineText":"<1天",
                        "expireDay":0,
                        "regionName":"华南地区（广州）",
                        "vpcName":"基础网络"
                    }
                ],
                "abnormalList":[]
            }
        }*/
        self.create = function(){
            $uibModal.open({
                templateUrl:"createMysql.html",
                controller:""
            });
        }
    }])
    .controller("MysqlCreateCtrl",["$scope",function(scope){

    }]);


