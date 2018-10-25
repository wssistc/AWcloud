import "./accesspolicySrv";

var accessPolicyModule = angular.module("accessPolicyModule", ["ngTable", "ngAnimate", "ui.bootstrap", "ngMessages", "accessPolicySrvModule", "app"]);

accessPolicyModule.controller("accessPolicyCtrl", ["$scope", "$translate", "accessPolicySrv", "NgTableParams", "checkedSrv", "$uibModal", "$filter",
    function($scope, $translate, accessPolicySrv, NgTableParams, checkedSrv, $uibModal, filter) {
        var self = $scope;
        var listIps_data = [];
        self.headers = {};

        self.globalSearchTerm = {};
        self.applyGlobalSearch = function() {
            var term = self.globalSearchTerm.item;
            self.tableParams.filter({
                searchTerm: term
            });
        };

        function initWblistIpsTable() {
            accessPolicySrv.getwblistIps().then(function(result) {
                result ? self.loadData = true : "";
                if (result && result.data) {
                    self.accessPolicyTableData = result.data;
                    listIps_data = _.map(result.data, function(item) {
                        item._wbType = item.wbType == "1" ? $translate.instant("aws.system.accesspolicy.whiteList") : $translate.instant("aws.system.accesspolicy.blackList");
                        item._bgnIp = (item.bgnIp).split(",");
                        item.createTimes = filter("date")(item.createTime, "yyyy-MM-dd HH:mm:ss");
                        item.enabled_ori = $translate.instant('aws.system.accesspolicy.' + item.enabled);
                        item.searchTerm = [item.listName, item._wbType, item._bgnIp.join('\b'), item.enabled_ori, item.createTimes, item.description].join('\b');
                        return item;
                    });
                    accessPolicySearchTearm({tableData:self.accessPolicyTableData,titleData:self.titleData});
                    self.tableParams = new NgTableParams({
                        count: 10
                    }, {
                        counts: [],
                        dataset: listIps_data
                    });
                    checkedSrv.checkDo(self, listIps_data, "id");
                }
            });
        }
        initWblistIpsTable();

        //vpn设置项的初始化
        self.titleName="accessPolicyTitleName";
        if(sessionStorage["accessPolicyTitleName"]){
            self.titleData=JSON.parse(sessionStorage["accessPolicyTitleName"]);
        }else{
            self.titleData=[
                {name:'system.accesspolicy.name',value:true,disable:true,search:'listName'},
                {name:'system.accesspolicy.type',value:true,disable:false,search:'_wbType'},
                {name:'system.accesspolicy.ipAddr',value:true,disable:false,search:'bgnIp'},
                {name:'system.accesspolicy.enabled',value:true,disable:false,search:'enabled'},
                {name:'system.accesspolicy.createTime',value:true,disable:false,search:'createTimes'},
                {name:'system.accesspolicy.description',value:true,disable:false,search:'description'}
            ];
        }
        function accessPolicySearchTearm(obj) {
            var tableData = obj.tableData;
            var titleData = obj.titleData;
            tableData.map(function(item){
                item.searchTerm = [];
                titleData.forEach(function(showTitle){
                    if (showTitle.value) {
                        item.searchTerm.push(item[showTitle.search]);
                    }
                });
                item.searchTerm = item.searchTerm.join("\b");
            });
        }
        self.accessPolicySearchTearm = accessPolicySearchTearm;

        self.refreshWbListIps = function() {
            initWblistIpsTable();
        };

        self.wbListIps = function(type, editData) {
            var scope = self.$new();
            var wbListIpsModal = $uibModal.open({
                animation: true,
                templateUrl: "wbListIps.html",
                scope: scope
            });
            scope.wbListIpsForm = {
                listName: "",
                wbType: "0",
                ipType: "1",
                bgnIp: "",
                endIp: "",
                enabled: true,
                description: ""
            };
            scope.ipRepeat = false;
            scope.submitted = false;
            scope.interacted = function(field) {
                return scope.submitted || field.$dirty;
            };

            scope.$watch(function() {
                return scope.wbListIpsForm.ipType;
            }, function(ipType) {
                if (type == "new") {
                    scope.wbListIpsForm.bgnIp = "";
                    scope.wbListIpsForm.endIp = "";
                }
                if (ipType == "2") {
                    if (type == "new") {
                        scope.wbListIpsForm.bgnIp = "";
                    }
                    scope.ipRange = true;
                } else {
                    scope.ipRange = false;
                }
            });

            var chkRepeatIpFunc = function(ipList) {
                let ipRepeat = false;
                if (_.uniq(ipList).length < ipList.length) {
                    ipRepeat = true;
                }
                return ipRepeat;
            };

            scope.focusSet = function() {
                scope.ipRepeat = false;
            };

            switch (type) {
                case "new":
                    scope.wbListIpsTitle = $translate.instant("aws.system.accesspolicy.createAccessPolicy");
                    scope.wbListIpsConfirm = function(formData, form_field) {
                        let params = formData;
                        params.enterpriseUid = localStorage.enterpriseUid;
                        if (form_field.$valid) {
                            if (!scope.ipRange) {
                                scope.ipRepeat = chkRepeatIpFunc(params.bgnIp.split(","))
                            }
                            if (!scope.ipRepeat) {
                                accessPolicySrv.addwblistIps(params).then(function() {
                                    initWblistIpsTable();
                                });
                                wbListIpsModal.close();
                            }
                        } else {
                            scope.submitted = true;
                        }
                    };
                    break;
                case "edit":
                    scope.wbListIpsTitle = $translate.instant("aws.system.accesspolicy.editAccessPolicy");
                    var editDatas = angular.copy(editData);
                    scope.wbListIpsForm = editDatas;
                    scope.editWBlistIp = true;
                    scope.wbListIpsConfirm = function(formData, form_field) {
                        if (formData.ipType == "1") {
                            formData.endIp = "";
                        }
                        let params = formData;
                        params.enterpriseUid = localStorage.enterpriseUid;
                        params.id = editData.id;
                        if (form_field.$valid) {
                            if (!scope.ipRange) {
                                scope.ipRepeat = chkRepeatIpFunc(params.bgnIp.split(","))
                            }
                            if (!scope.ipRepeat) {
                                accessPolicySrv.editwblistIps(params).then(function() {
                                    initWblistIpsTable();
                                });
                                wbListIpsModal.close();
                            }
                        } else {
                            scope.submitted = true;
                        }
                    };
                    break;
            }

            scope.$watch(function() {
                return scope.wbListIpsForm.wbType;
            }, function(wbType) {
                if (wbType == "1") {
                    scope.policynameHolder = $translate.instant("aws.system.accesspolicy.inputWhiteListName");
                } else if (wbType == "0") {
                    scope.policynameHolder = $translate.instant("aws.system.accesspolicy.inputBlackListName");
                }
            });
        };

        self.delWbListIps = function(checkItems) {
            var content = {
                target: "delWbListIps",
                msg: "<span>" + $translate.instant("aws.system.accesspolicy.delWbListIps") + "</span>",
                data: checkItems
            };
            self.$emit("delete", content);
        };
        self.$on("delWbListIps", function(e, data) {
            var ids = [];
            _.each(data, function(item) {
                ids.push(item.id);
            });
            accessPolicySrv.deletewblistIps({
                ids: ids
            }).then(function() {
                initWblistIpsTable();
            });

        });

    }
]);
accessPolicyModule.controller('loginLockPolicyCtrl', ['$scope', '$rootScope', 'NgTableParams', 'GLOBAL_CONFIG', '$translate', '$uibModal', 'checkedSrv', 'accessPolicySrv',
    function($scope, $rootScope, NgTableParams, GLOBAL_CONFIG, $translate, $uibModal, checkedSrv, accessPolicySrv) {
        let self = $scope;
        let loginLockPolicyRes = {};
        self.globalSearchTerm = {};
        self.loginLockPolicySwitchPage = true;
        self.loginLockActive = false;

        function getLoginLockPolicyStatus() {
            accessPolicySrv.getLoginLockPolicyStatus().then(function(res) {
                if (res && res.data && res.data[0]) {
                    loginLockPolicyRes = res.data[0];
                    if (res.data[0].paramValue == -1) {
                        self.loginLockActive = false;
                        self.loginLockPolicySwitchPage = true;
                    } else {
                        self.loginLockActive = true;
                        self.loginLockPolicySwitchPage = false;
                    }
                }
            })
        }

        function getLockedUserTable() {
            self.globalSearchTerm = {};
            accessPolicySrv.getLockedUserData().then(function(res) {
                res ? self.loadLockPolicyTableData = true : false;
                if (res && res.data) {
                    res.data = res.data.map(item => {
                        item.lockedTime = moment(new Date(item.lockedTime)).format('YYYY-MM-DD HH:mm:ss');
                        item.serachTerm = [item.name, item.lockedTime].join("\b");
                        return item;
                    });
                    self.lockPolicyTable = new NgTableParams({
                        count: GLOBAL_CONFIG.PAGESIZE
                    }, {
                        counts: [],
                        dataset: res.data
                    });
                    checkedSrv.checkDo(self, res.data, "userUid", "lockPolicyTable");
                }
            });
        };

        function getLockPolicy() {
            var options=[
              {"enterpriseUid": localStorage.enterpriseUid,"parentId":923,"paramName":"ENT_LOGIN_ERROR_TIMES"},
              {"enterpriseUid": localStorage.enterpriseUid,"parentId":923,"paramName":"ENT_LOGIN_LOCKED_EXPIRED"}
            ];
            accessPolicySrv.getLockPolicy(options).then(function(res) {
                if (res && res.data) {
                    self.getLockPolicyList = angular.copy(res.data);
                    _.each(res.data, item => {
                        if (item.paramName.toLowerCase() == "ent_login_error_times") {
                            self.login_error_times = Number(item.paramValue);
                        }
                        if (item.paramName.toLowerCase() == "ent_login_locked_expired") {
                            self.login_locked_expired = Number(item.paramValue) / 60;
                        }
                    });
                }
            });
        }

        self.loginLockPolicySwitch = function(loginLockActive) {
            self.loginLockActive = loginLockActive;
            loginLockPolicyRes.paramValue = self.loginLockActive ? "1" : "-1";
            accessPolicySrv.updateLoginLockPolicyStatus(loginLockPolicyRes).then(function(res) {
                if (res.status == "0") {
                    if (self.loginLockActive) {
                        self.loginLockPolicySwitchPage = false;
                        getLockedUserTable();
                        getLockPolicy();
                    } else {
                        self.loginLockPolicySwitchPage = true;
                    }
                }
            });
        };
        
        self.setLockPolicy = function() {
            let scope = self.$new();
            let lockPolicySettingInstance = $uibModal.open({
                animation: true,
                templateUrl: "lockPolicySettingModal.html",
                scope: scope
            });

            scope.submitted = false;
            scope.interacted = function(field) {
                if (field) {
                    return scope.submitted || field.$dirty;
                }
            };

            scope.tryNumList = [{
                "name": 3,
                "value": 3
            }, {
                "name": 5,
                "value": 5
            }, {
                "name": "自定义",
                "value": "defined"
            }, ];

            scope.lockedTimeList = [{
                "name": 5,
                "value": 5
            }, {
                "name": 10,
                "value": 10
            }, {
                "name": 30,
                "value": 30
            }, {
                "name": 60,
                "value": 60
            }, {
                "name": "自定义",
                "value": "defined"
            }, ];

            scope.policySettingForm = {
                tryNum: (self.login_error_times != 3 && self.login_error_times != 5) ? "defined" : self.login_error_times,
                lockedTime: (self.login_locked_expired != 5 && self.login_locked_expired != 10 && self.login_locked_expired != 30 && self.login_locked_expired != 60) ? "defined" : self.login_locked_expired,
                definedTryNum: (self.login_error_times != 3 && self.login_error_times != 5) ? self.login_error_times : "",
                definedLockedTime: (self.login_locked_expired != 5 && self.login_locked_expired != 10 && self.login_locked_expired != 30 && self.login_locked_expired != 60) ? self.login_locked_expired : ""
            };

            scope.delDefinedInput = function(type) {
                if (type == "tryNum") {
                    scope.policySettingForm.tryNum = scope.tryNumList[0].value;
                    scope.policySettingForm.definedTryNum = "";
                } else {
                    scope.policySettingForm.lockedTime = scope.lockedTimeList[0].value;
                    scope.policySettingForm.definedLockedTime = "";
                }
            };

            scope.lockPolicySettingCfm = function(form) {
                if (form.$valid) {
                    let params = {
                        tryNum: scope.policySettingForm.tryNum,
                        lockedTime: scope.policySettingForm.lockedTime
                    };
                    if (scope.policySettingForm.tryNum == "defined") {
                        params.tryNum = scope.policySettingForm.definedTryNum;
                    }
                    if (scope.policySettingForm.lockedTime == "defined") {
                        params.lockedTime = scope.policySettingForm.definedLockedTime;
                    }
                    let postParams = angular.copy(self.getLockPolicyList);
                    _.each(postParams, item => {
                        if (item.paramName.toLowerCase() == "ent_login_error_times") {
                            item.paramValue = Number(params.tryNum);
                        }
                        if (item.paramName.toLowerCase() == "ent_login_locked_expired") {
                            item.paramValue = Number(params.lockedTime) * 60;
                        }
                    })
                    accessPolicySrv.settingLockPolicy(postParams).then(function() {
                        getLockedUserTable();
                        getLockPolicy();
                    });
                    lockPolicySettingInstance.close();

                } else {
                    scope.submitted = true;
                }
            };

        };

        self.delLockPolicy = function(checkedItems) {
            var content = {
                target: "delLockPolicyItems",
                msg: "<span>您确定删除所选用户吗？</span>",
                data: checkedItems,
                type: "danger",
                btnType: "btn-danger"
            };
            self.$emit("delete", content);
        };

        self.$on("delLockPolicyItems", function(e, data) {
            console.log(e, data);
            var del_obj_ids = [];
            _.each(data, function(item) {
                del_obj_ids.push({
                    "userUid": item.userUid
                });
            });
            accessPolicySrv.unlockUser(del_obj_ids).then(function() {
                getLockedUserTable();
                getLockPolicy();
            });
        });

        self.refreshLockPolicyTable = function() {
            getLockedUserTable();
            getLockPolicy();
        };

        self.applyGlobalSearch = function(table, term) {
            self[table].filter({
                serachTerm: self.globalSearchTerm[term]
            });
        };

        getLoginLockPolicyStatus();
        getLockedUserTable();
        getLockPolicy();

    }
]);