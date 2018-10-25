import {
    zh_CN
} from "./i18n/zh_CN";
import {
    en_US
} from "./i18n/en_US";

var appModule = angular.module("app", ["ngRoute", "pascalprecht.translate", "ngMessages", "ngAnimate", "ngSanitize", "ui.bootstrap"])
    .constant("API_HOST", GLOBALCONFIG.APIHOST)
    .config(["$routeProvider", "$locationProvider", "$httpProvider", "$translateProvider",
        function($routeProvider, $locationProvider, $httpProvider, $translateProvider) {
            $translateProvider.translations("en", en_US);
            $translateProvider.translations("zh", zh_CN);
            $translateProvider.preferredLanguage("zh");
            $httpProvider.interceptors.push([
                "$q", "$rootScope", "API_HOST",
                function(q, $rootScope, api_host) {
                    return {
                        request: function(config) {
                            if (config.url.indexOf("awstack-resource") > -1) {
                                var url = config.url.split("awstack-resource");
                                config.url = api_host.RESOURCE + url[1];
                            }
                            return config;
                        },
                        response: function(res) {
                            if (/\.html/.test(res.config.url)) {
                                return res;
                            }
                            return res.data.data;
                        },
                        requestErr: function(res) {
                            return res;
                        },
                        responseErr: function(res) {
                            return res;
                        }
                    };
                }
            ]);
            $routeProvider
                .when("/", {
                    templateUrl: "/js/minpcmonitor/tmpl/monitor.html",
                    controller: "mainCtrl"
                })
                .otherwise({
                    redirectTo: "/"
                });
        }
    ]);
appModule.service("mainSrv", ["$http", function($http) {
    return {
        //获取云平台告警事件
        getalarmEvents: function() {
            return $http({
                method: "GET",
                url: "/awstack-resource/v1/back/alarmEvents/?status=new"
            });
        },
        //获取CPU、内存、磁盘超分比
        getConfigValues: function() {
            return $http({
                method: "GET",
                url: "/awstack-resource/v1/back/enterprises/configs?configName=cpu_allocation_ratio&configName=ram_allocation_ratio&configName=disk_allocation_ratio",
            })
        },
        //获取CPU、内存使用率
        getOshypervisorsStatistics: function() {
            return $http({
                method: "GET",
                url: "/awstack-resource/v1/back/os-hypervisors/statics"
            })
        },
        //获取获取云资源磁盘使用率
        getPoolsDetail: function() {
            return $http({
                method: "GET",
                url: "/awstack-resource/v1/back/scheduler-stats/get_pools"
            })
        },
        //获取交换机电源状态
        getSwitchPowerState: function() {
            return $http({
                method: "GET",
                url: "/awstack-resource/v1/back/switchboard"
            })
        },
        //获取IPMI物理机电源，CPU温度,磁盘，网卡
        getIPMIdata: function() {
            return $http({
                method: "GET",
                url: "/awstack-resource/v1/back/ipmi/nodes"
            })
        },
        //获取CPU、磁盘利用率阀值
        getcpudiskLimitVal: function() {
            return $http({
                method: "GET",
                url: "/awstack-resource/v1/back/diskcpu/nodes"
            })
        },
        //设置CPU，磁盘利用率阀值
        setcpudiskLimitVal: function(options) {
            return $http({
                method: "POST",
                url: "/awstack-resource/v1/back/diskcpu/nodes",
                data: options
            })
        }

    };
}]);
appModule.controller("mainCtrl", ["$scope", "$rootScope", "$routeParams", "$location", "$translate", "$uibModal", "mainSrv", "$interval",
    function($scope, $rootScope, $routeParams, $location, $translate, $uibModal, mainSrv, $interval) {
        var self = $scope;
        let modalInstance;
        let count = 0;
        self.settingForm = {};
        window.PiePanelDefault = function() {
            this.panels = {
                colors: ["#2ec6a9", "#efb75f", "#ec5b60", "#e67f23", "#c0392b", "#ff754a", "#f39c12", "#b675de"],
                type: "pie",
                width: 200,
                height: 200,
                outerRadius: 75,
                innerRadius: 50,
                data: [],
                title: "",
                id: "",
                pieType: "",
                progressRate: true
            };
        };

        function bytesToSize(bytes) {
            var k = 1024, // or 1000
                sizes = ["GB", "TB", "PB", "EB", "ZB", "YB"], // sizes = ['Bytes', 'KB', 'MB',"GB", "TB", "PB", "EB", "ZB", "YB"],
                i;
            if (bytes < 0) i = Math.floor(Math.log(-bytes) / Math.log(k));
            if (bytes >= 0 && bytes < 1) return {
                a: 0,
                b: "0 GB"
            };
            if (bytes >= 1)
                i = Math.floor(Math.log(bytes) / Math.log(k));
            var gtZero = (bytes / Math.pow(k, i)).toPrecision(3) >= 0 ? (bytes / Math.pow(k, i)) : 0;
            if (gtZero.toString().indexOf(".") > -1) {
                if (gtZero.toString().split(".")[1].length > 2) {
                    gtZero = gtZero.toFixed(2)
                }
            }
            if (i < 0) i = 0;
            return {
                a: (bytes).toPrecision(3),
                b: gtZero + " " + sizes[i]
            };
        }

        function getIPMITableData() {
            mainSrv.getcpudiskLimitVal().then(function(res) {
                if (res && res.data) {
                    self.settingForm = {
                        "cpuAlarmMin": res.data.cpuUseLow,
                        "cpuAlarmMax": res.data.cpuUseHigh,
                        "diskAlarmMin": res.data.diskPercent,
                        "mainSwitchIp": res.data.switchBoardMaster,
                        "spareSwitchIp": res.data.switchBoardSlave,
                        "node1Ip": res.data["node-1"],
                        "node2Ip": res.data["node-2"],
                        "node3Ip": res.data["node-3"],
                        "node4Ip": res.data["node-4"]
                    }
                    return res.data;
                }
            }).then(function(limiVal) {
                self.loadingIPMIData = true;
                mainSrv.getIPMIdata().then(function(res) {
                    res ? self.loadingIPMIData = false : true;
                    if (res && res.data && angular.isArray(res.data)) {
                        var IPMI_data = [];
                        IPMI_data = res.data.map(function(item) {
                            if (item.cpu_temperature != null && item.cpu_temperature != "") {
                                item.cpu_temperature = Number(item.cpu_temperature);
                                limiVal.cpuUseLow = Number(limiVal.cpuUseLow);
                                limiVal.cpuUseHigh = Number(limiVal.cpuUseHigh);
                                if (item.cpu_temperature <= limiVal.cpuUseLow) {
                                    item.cpu_temp_state = "green";
                                } else if (item.cpu_temperature > limiVal.cpuUseLow && item.cpu_temperature <= limiVal.cpuUseHigh) {
                                    item.cpu_temp_state = "yellow";
                                } else if (item.cpu_temperature > limiVal.cpuUseHigh) {
                                    item.cpu_temp_state = "red";
                                }
                            }
                            return item;
                        });
                        mainSrv.getSwitchPowerState().then(function(res) {
                            if (res && res.data && res.data[0]) {
                                IPMI_data.push({
                                    "host": "主交换机",
                                    "powerState": res.data[0].switchBoardMaster,
                                    "switch": true
                                }, {
                                    "host": "备交换机",
                                    "powerState": res.data[0].switchBoardSlave,
                                    "switch": true
                                });
                            } else {
                                IPMI_data.push({
                                    "host": "主交换机",
                                    "powerState": "",
                                    "switch": true
                                }, {
                                    "host": "备交换机",
                                    "powerState": "",
                                    "switch": true
                                });
                            }
                            for (let i = 0; i <= IPMI_data.length; i++) {
                                if (IPMI_data[i]) {
                                    if ((IPMI_data[i].powerState != 0 || IPMI_data[i].powerState != 1) && !(self.settingForm.mainSwitchIp && self.settingForm.spareSwitchIp && self.settingForm.node1Ip && self.settingForm.node2Ip && self.settingForm.node3Ip && self.settingForm.node4Ip) && !modalInstance) {
                                        self.sysSetting();
                                        break;
                                    }
                                }
                            }
                            count++;
                            self.interval = true;
                            self.intervalCount = count;
                            self.hardwareTable = IPMI_data;
                        });
                    }
                });
            })
        }

        function cloudResUseRate() {
            mainSrv.getOshypervisorsStatistics().then(function(res) {
                if (res && res.data) {
                    return res.data;
                }
            }).then(function(statisticsData) {
                mainSrv.getConfigValues().then(function(res) {
                    if (res && res.data) {
                        var cpuConfigvalue = res.data.cpu_allocation_ratio ? Number(res.data.cpu_allocation_ratio) : 1;
                        var ramConfigValue = res.data.ram_allocation_ratio ? Number(res.data.ram_allocation_ratio) : 1;
                        var diskConfigValue = res.data.disk_allocation_ratio ? Number(res.data.disk_allocation_ratio) : 1;

                        if (statisticsData) {
                            statisticsData.vcpus = statisticsData.vcpus ? statisticsData.vcpus : 0;
                            statisticsData.vcpus_used = statisticsData.vcpus_used ? statisticsData.vcpus_used : 0;
                            statisticsData.memory_mb = statisticsData.memory_mb ? statisticsData.memory_mb : 0;
                            statisticsData.reserved_host_memory_mb = statisticsData.reserved_host_memory_mb ? statisticsData.reserved_host_memory_mb : 0;
                            statisticsData.memory_mb_used = statisticsData.memory_mb_used ? statisticsData.memory_mb_used : 0;
                        }
                        //cpu 
                        self.hostCPUTotal = statisticsData.vcpus * cpuConfigvalue;
                        self.allocatedCpu = statisticsData.vcpus_used;
                        self.unAlloactedCpu = self.hostCPUTotal - self.allocatedCpu;
                        self.cpuUseChart = new PiePanelDefault();
                        self.cpuUseChart.panels.data = [{
                            name: "已使用",
                            value: self.allocatedCpu
                        }, {
                            name: "未使用",
                            value: self.unAlloactedCpu
                        }];
                        self.cpuUseChart.panels.pieType = "percent";
                        self.cpuUseChart.panels.progressRate = true;

                        //内存
                        //flavor中内存有0.5G的选项，内存展示需保留一位小数
                        let org_hostMemoryTotal = (Number(statisticsData.memory_mb) * ramConfigValue - Number(statisticsData.reserved_host_memory_mb)) / 1024;
                        let org_allocatedRam = (Number(statisticsData.memory_mb_used) - Number(statisticsData.reserved_host_memory_mb)) / 1024;
                        self.hostMemoryTotal = Math.ceil(org_hostMemoryTotal) === org_hostMemoryTotal ? org_hostMemoryTotal : org_hostMemoryTotal.toFixed(1);
                        self.allocatedRam = Math.ceil(org_allocatedRam) === org_allocatedRam ? org_allocatedRam : org_allocatedRam.toFixed(1);
                        let _unAllocatedRam = Number(self.hostMemoryTotal) - Number(self.allocatedRam);
                        self.unAllocatedRam = Math.ceil(_unAllocatedRam) === _unAllocatedRam ? _unAllocatedRam : _unAllocatedRam.toFixed(1);
                        let _ramPercent = Number(self.allocatedRam) / Number(self.hostMemoryTotal);
                        self.ramPercent = Math.ceil(_ramPercent) === _ramPercent ? _ramPercent + "%" : (_ramPercent).toFixed(1) + "%";
                        self.memoryUseChart = new PiePanelDefault();
                        self.memoryUseChart.panels.data = [{
                            name: "已使用",
                            value: self.allocatedRam
                        }, {
                            name: "未使用",
                            value: self.unAllocatedRam
                        }];
                        self.memoryUseChart.panels.pieType = "percent";
                        self.memoryUseChart.panels.progressRate = true;
                    }
                });
            });

            //企业版
            mainSrv.getPoolsDetail().then(function(result) {
                if (result && result.data && angular.isArray(result.data)) {
                    //过滤掉不符合条件的存储
                    result.data = result.data.filter(item => {
                        return (item.capabilities.volume_backend_name.indexOf("#") > -1 ||
                            item.capabilities.volume_backend_name.indexOf("--") > -1)
                    })
                    if (result && result.data && result.data.length < 2) { //当前版本不考虑多存储的情况
                        var sdata = result.data[0];
                        if (sdata) {
                            if (!sdata.capabilities.max_over_subscription_ratio) {
                                sdata.capabilities.max_over_subscription_ratio = 1;
                            }
                            var total = sdata.capabilities.total_capacity_gb * sdata.capabilities.max_over_subscription_ratio;
                            var allocated_capacity_gb;
                            if (sdata.capabilities.provisioned_capacity_gb) {
                                allocated_capacity_gb = sdata.capabilities.provisioned_capacity_gb;
                            } else {
                                allocated_capacity_gb = sdata.capabilities.fresh_allocated_capabilities;
                            }
                            self.storageTotal = bytesToSize(total);
                            let storageUsed = Number(allocated_capacity_gb);
                            let storageTotal = Number(total);
                            self.storageChart = new PiePanelDefault();
                            self.storageChart.panels.data = [{
                                name: "已使用",
                                value: bytesToSize(storageUsed).a
                            }, {
                                name: "未使用",
                                value: bytesToSize(storageTotal - storageUsed).a
                            }];
                            self.storageChart.panels.pieType = "percent";
                            self.storageChart.panels.progressRate = true;
                        }
                    }
                }
            });
        }

        function formateTableData(item) {
            if (item.alarmType == "threshold") {
                item._alarmType = "阈值";
            } else if (item.alarmType == "healthcheck") {
                item._alarmType = "健康检查";
            } else if (item.alarmType == "computeha") {
                item._alarmType = "高可用";
            }
            if (item.severity == "critical") {
                item.severity = "严重";
            } else if (item.severity == "moderate") {
                item.severity = "适中";
            } else if (item.severity == "low") {
                item.severity = "低";
            }
        }

        function getAlram() {
            mainSrv.getalarmEvents().then(function(result) {
                self.newAlarms_data = [];
                if (result && result.data) {
                    if (result.data.length > 5) {
                        _.map(result.data, function(item, i) {
                            formateTableData(item);
                            if (i > 4) {
                                return;
                            }
                            self.newAlarms_data.push({
                                hostname: item.hostname,
                                _alarmType: item._alarmType,
                                alarmType: item.alarmType,
                                severity: item.severity,
                                createtime: item.createtime
                            });
                        });
                    } else {
                        self.newAlarms_data = _.map(result.data, function(item) {
                            formateTableData(item);
                            return item;
                        });
                    }
                }
            })
        }

        self.sysSetting = function() {
            if (modalInstance && modalInstance.closed && !modalInstance.closed.$$state.status) {
                return;
            }
            var scope = self.$new();
            modalInstance = $uibModal.open({
                animation: true,
                templateUrl: "settingModal.html",
                scope: scope
            });

            scope.$watch(function() {
                return scope.settingForm.cpuAlarmMax + scope.settingForm.cpuAlarmMin;
            }, function() {
                scope.cpuvalidmax = scope.settingForm.cpuAlarmMax && scope.settingForm.cpuAlarmMax <= 100 && scope.settingForm.cpuAlarmMax > 30 ? Number(scope.settingForm.cpuAlarmMax) - 1 : 99;
                scope.cpuvalidmin = scope.settingForm.cpuAlarmMin && scope.settingForm.cpuAlarmMin < 100 && scope.settingForm.cpuAlarmMin >= 30 ? Number(scope.settingForm.cpuAlarmMin) + 1 : 31
            });

            scope.errors = {};
            scope.submitValid = false;
            scope.interacted = function(form_field, name) {
                scope.form_field = form_field;
                scope.errors[name] = (scope.submitValid || form_field[name].$dirty) && Object.keys(form_field[name].$error).length > 0;
                if (scope.errors[name]) {
                    if (!$("input[name='" + name + "']").hasClass("error")) {
                        $("input[name='" + name + "']").addClass("error");
                    }
                    if (!$("input[name='" + name + "']").parent().find(".calculator").hasClass("error")) {
                        $("input[name='" + name + "']").parent().find(".calculator").addClass("error");
                    }
                } else {
                    $("input[name='" + name + "']").parent().find(".calculator").removeClass("error");
                    $("input[name='" + name + "']").removeClass("error");
                }
                return scope.submitValid || form_field[name].$dirty;
            };

            scope.confirmSet = function(setting_form) {
                if (setting_form.$valid) {
                    mainSrv.setcpudiskLimitVal({
                        "cpuUseLow": scope.settingForm.cpuAlarmMin,
                        "cpuUseHigh": scope.settingForm.cpuAlarmMax,
                        "diskPercent": scope.settingForm.diskAlarmMin,
                        "switchBoardMaster": scope.settingForm.mainSwitchIp,
                        "switchBoardSlave": scope.settingForm.spareSwitchIp,
                        "node-1": scope.settingForm.node1Ip,
                        "node-2": scope.settingForm.node2Ip,
                        "node-3": scope.settingForm.node3Ip,
                        "node-4": scope.settingForm.node4Ip
                    }).then(function(res) {
                        if (res && res.status == 0) {
                            getIPMITableData();
                        }
                    });
                    modalInstance.close();
                } else {
                    scope.submitValid = true;
                }
            };

            scope.resetForm = function() {
                scope.settingForm = {};
                scope.form_field.$dirty = false;
                scope.submitValid = false;
                $("div.ngcalculator_area").addClass('hide');
            };
            
        };

        $rootScope.$on("$routeChangeStart", function(e, next) {
            if (next.originalPath == "/") {
                getIPMITableData();
                cloudResUseRate();
                getAlram();
                var timer = $interval(function() {
                    if (self.interval && (!modalInstance || (modalInstance && modalInstance.closed.$$state && modalInstance.closed.$$state.status))) {
                        getIPMITableData();
                        cloudResUseRate();
                        getAlram();
                        self.interval = false;
                    }
                }, 6000);

            }
        });
    }
]);
appModule.directive("ipaddrpattern", function() { //ip格式校验(1~255).(0~255).(0~255).(0~255)
    return {
        restrict: "A",
        require: "ngModel",
        scope: {
            ipadd: "=",
            formfield: "="
        },
        link: function(scope, elem, attrs, ngModel) {
            if (scope.ipadd == "access") {
                /*普通ip尾数只能1-254*/
                var reg = /^((?:(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(?:25[0-4]|2[0-4]\d|((1\d{2})|[1-9]|([1-9][0-9]))))$/;
            } else {
                /*包含网络地址，和广播地址校验,尾数0-255*/
                var reg = /^((?:(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d))))$/;
            }
            var valid = function(viewValue) {
                if (viewValue) {
                    if (!reg.test(viewValue)) {
                        ngModel.$setValidity("ipaddrpattern", false);
                    } else {
                        ngModel.$setValidity("ipaddrpattern", true);
                    }
                } else {
                    if (!attrs.required) {
                        ngModel.$setValidity("ipaddrpattern", true);
                    }
                }
                return viewValue;
            };
            ngModel.$parsers.push(valid);

            scope.$watch(function() {
                return ngModel.$viewValue;
            }, function(viewValue) {
                if (viewValue || viewValue == "") {
                    scope.formfield[attrs.name].$dirty = true;
                }
                valid(viewValue);
            });

        }
    };
});
appModule.directive("limitnumrange", function() {
    return {
        restrict: "A",
        require: "ngModel",
        scope: {
            min: "=",
            max: "=",
            formfield: "="
        },
        link: function(scope, elem, attrs, ngModel) {
            function vaild(viewValue) {
                var reg = new RegExp("^(0|[1-9][0-9]*)$");
                if (viewValue) {
                    var val = Number(viewValue);
                    if ((val < Number(scope.min) || val > Number(scope.max)) || !reg.test(viewValue)) {
                        ngModel.$setValidity("limitnumrange", false);
                    } else {
                        ngModel.$setValidity("limitnumrange", true);
                    }

                } else {
                    ngModel.$setValidity("limitnumrange", true);
                }
                return viewValue;
            }
            ngModel.$parsers.push(vaild);

            scope.$watch(function() {
                return scope.min + scope.max + ngModel.$viewValue;
            }, function(viewValue) {
                if (ngModel.$viewValue || ngModel.$viewValue == "") {
                    scope.formfield[attrs.name].$dirty = true;
                }
                vaild(ngModel.$viewValue)
            });
        }
    };
});
appModule.directive('numKeyboard', ['$compile', function($compile) {
    return {
        restrict: 'A',
        replace: true,
        transclude: true,
        template: '<input/>',
        link: function(scope, element, attrs) {
            attrs.error = attrs.error || false;
            var keylist = [7, 8, 9, 4, 5, 6, 1, 2, 3, 0, '.'];
            var calculator = '<div class="ngcalculator_area "><div class="bg" ></div>' + '<div class="calculator">' + '<div class="inputarea">' + '<input type="text" id="text" ng-tap="getInput()" class="' + attrs.class + '" ng-model="' + attrs.ngModel + '">' + '</div><div class="con">' + '<div class="left clearFix">';
            $.each(keylist, function(k, v) {
                calculator += '<div class="keyboard num" value="' + v + '">' + v + '</div>';
            });
            calculator += '</div>' + '<div class="right clearFix">' + '<div class="keyboard blueIcon backstep"></div>' + '<div class="keyboard blueIcon cleanup">清空</div>' + '<div class="keyboard ensure ensure">确<br>定</div>' + '</div>' + '</div>' + '</div>' + '</div>';
            calculator = $compile(calculator)(scope);

            var setClass = function(error) {
                if ((error && error != "false") || error == "true") {
                    if (!calculator.find(".calculator").hasClass("error")) {
                        calculator.find(".calculator").addClass("error");
                    }
                } else {
                    calculator.find(".calculator").removeClass("error");
                }
            };

            // scope.$watch(function() {
            //  return attrs.error;
            // }, function(error) {
            //  setClass(error);
            // });

            element.bind('focus', function() {
                $("div.ngcalculator_area").addClass("hide");
                if (element.parent().find(".ngcalculator_area").length == 0) {
                    element.parent()[0].appendChild(calculator[0]);
                    //$compile($(this).parent()[0])(scope);
                    element.parent().find(".ngcalculator_area").removeClass("hide");
                } else {
                    element.parent().find(".ngcalculator_area").removeClass("hide");
                }
                setClass(attrs.error);
                document.activeElement.blur();
            });

            //退格
            $(calculator[0]).find(".backstep").click(function() {
                if (typeof $(calculator[0]).find("input").val() == "undefined") {
                    $(calculator[0]).find("input").val("");
                }
                $(calculator[0]).find("input").val($(calculator[0]).find("input").val().substring(0, $(calculator[0]).find("input").val().length - 1)).trigger('change');
            });

            //清空
            $(calculator[0]).find(".cleanup").click(function() {
                $(calculator[0]).find("input").val("").trigger('change');
            });

            //点击数字
            $(calculator[0]).find(".num").click(function() {
                var val = $(calculator[0]).find("input").val();
                var filter = attrs.filter;
                if (typeof filter != "undefined") {
                    val = scope[filter](val, $(this).attr("value"));
                } else {
                    val = val + '' + $(this).attr("value");
                }
                $(calculator[0]).find("input").val(val).trigger('change');
            });

            //确认
            $(calculator[0]).find(".ensure").click(function() {
                //calculator[0].remove();
                calculator.addClass("hide");
                var callback = attrs.callback;
                if (typeof callback != "undefined") {
                    scope[callback](attrs.name);
                }
            });

            //点击效果
            $(calculator[0]).find(".keyboard").click(function() {
                $(this).addClass("keydown");
                // $(this).children().removeClass("hide");
                var that = this;
                setTimeout(function() {
                    $(that).removeClass("keydown");
                }, 100)

                // setTimeout(function() {
                //  $(that).children().addClass("hide");
                // }, 300)
            });

        }
    };
}]);
appModule.directive("chartPie", function($translate) {
    return {
        restrict: "A",
        scope: {
            panel: "="
        },
        template: "",
        link: function(scope, elem) {
            function renderPieFunc(width) {
                scope.panel = scope.panel || new PiePanelDefault();
                scope.panel.data = scope.panel.data || [];
                scope.panel.colors = scope.panel.colors || [];
                var colors = scope.panel.colors;

                var dataSet = (scope.panel.data).map(function(d) {
                    return Number(d.value);
                });
                var seriesName = (scope.panel.data).map(function(d) {
                    return d.name;
                });
                var pie = d3.layout.pie().value(function(d) {
                    return d;
                });
                var pieData = pie(dataSet);
                var usagePercent = (dataSet[0] / d3.sum(dataSet, function(d) {
                    return d;
                }) * 100).toFixed(1);

                var svg = d3.select(elem[0]).append("svg").attr("width", width).attr("height", width);

                var outerRadius = width / 2 - 2,
                    innerRadius = outerRadius - 5;

                var tooltip = d3.select(elem[0])
                    .append("div")
                    .attr("class", "tooltip")
                    .style("display", "none");

                function mouseout() {
                    tooltip.style("display", "none");
                }

                function mousemove() {
                    tooltip.style("left", (d3.event.pageX - elem.offset().left + 20) + "px").style("top", (d3.event.pageY - elem.offset().top - 20) + "px");
                }

                function defaultPath() {
                    var arc = d3.svg.arc()
                        .startAngle(0)
                        .innerRadius(innerRadius)
                        .outerRadius(outerRadius);

                    var arcs = svg.append("g")
                        .attr("transform", "translate(" + (width / 2) + "," + (width / 2) + ")");

                    arcs.append("path")
                        .attr("class", "background")
                        .attr("fill", "#51a3ff")
                        .attr("d", arc.endAngle(2 * Math.PI));

                    return arcs;
                }

                if (dataSet.length == 0) {
                    defaultPath().append("text").attr({
                        "text-anchor": "middle",
                        "fill": "#90a2ba",
                        "font-size": ".14rem"
                    }).text($translate.instant("aws.common.noData"));
                } else {
                    if (scope.panel.pieType == "percent") {
                        if (!usagePercent || usagePercent == "Infinity" || usagePercent == "NaN") {
                            if (_.every(dataSet, function(val) {
                                    return val == 0;
                                })) {
                                defaultPath().append("text").attr({
                                    "text-anchor": "middle",
                                    "fill": "#313949",
                                    "font-size": ".24rem"
                                }).text("0%");
                            } else {
                                defaultPath().append("text").attr({
                                    "text-anchor": "middle",
                                    "fill": "#90a2ba",
                                    "font-size": ".14rem"
                                }).text($translate.instant("aws.common.dataError"));
                            }
                        } else {
                            var arc = d3.svg.arc()
                                .startAngle(0)
                                .innerRadius(innerRadius)
                                .outerRadius(outerRadius);

                            var _arc = d3.svg.arc()
                                .startAngle(0)
                                .innerRadius(innerRadius - 2)
                                .outerRadius(outerRadius + 2);

                            var arcs = svg.append("g")
                                .attr("transform", "translate(" + (width / 2) + "," + (width / 2) + ")");

                            arcs.append("path")
                                .attr("class", "background")
                                .attr("fill", "#e5e5e5")
                                .attr("d", arc.endAngle(2 * Math.PI))
                                .on("mouseover", function() {
                                    tooltip.html(seriesName[1] + "\t:\t" + +dataSet[1] + " (" + (dataSet[1] / d3.sum(dataSet, function(d) {
                                            return d;
                                        }) * 100).toFixed(1) + "%)")
                                        .style("left", (d3.event.pageX - elem.offset().left) + "px")
                                        .style("top", (d3.event.pageY - elem.offset().top - 20) + "px")
                                        .style("display", "block");
                                })
                                .on("mousemove", mousemove)
                                .on("mouseout", mouseout);

                            arcs.append("path")
                                .attr("class", "portion")
                                .attr("fill", function() {
                                    if (scope.panel.progressRate) {
                                        if (usagePercent <= 30) {
                                            colors[0] = "#1abc9c";
                                            return "#1abc9c";
                                        } else if (usagePercent <= 50 && usagePercent > 30) {
                                            colors[0] = "#51a3ff";
                                            return "#51a3ff";
                                        } else if (usagePercent <= 65 && usagePercent > 50) {
                                            colors[0] = "#4e80f5";
                                            return "#4e80f5";
                                        } else if (usagePercent <= 75 && usagePercent > 65) {
                                            colors[0] = "#f39c12";
                                            return "#f39c12";
                                        } else if (usagePercent <= 85 && usagePercent > 75) {
                                            colors[0] = "#e67e22";
                                            return "#e67e22";
                                        } else if (usagePercent <= 95 && usagePercent > 85) {
                                            colors[0] = "#e74c3c";
                                            return "#e74c3c";
                                        } else if (usagePercent > 95) {
                                            colors[0] = "#c0392b";
                                            return "#c0392b";
                                        }
                                    } else {
                                        return colors[0];
                                    }
                                })
                                .on("mouseover", function() {
                                    tooltip.html(seriesName[0] + "\t:\t" + +dataSet[0] + " (" + (dataSet[0] / d3.sum(dataSet, function(d) {
                                            return d;
                                        }) * 100).toFixed(1) + "%)")
                                        .style("left", (d3.event.pageX - elem.offset().left) + "px")
                                        .style("top", (d3.event.pageY - elem.offset().top - 20) + "px")
                                        .style("display", "block");

                                })
                                .on("mousemove", mousemove)
                                .on("mouseout", mouseout)
                                .transition()
                                .duration(1000)
                                .tween("transition", function() {
                                    return function(t) {
                                        var i = d3.interpolate(0, dataSet[0] / d3.sum(dataSet, function(d) {
                                            return d;
                                        }));
                                        svg.select(".portion").attr("d", _arc.endAngle(2 * Math.PI * i(t)));
                                    };
                                });

                            var pieCenterText = d3.select(elem[0]).append("div").attr("class", "pie-center").append("span");
                            pieCenterText.html((dataSet[0] / d3.sum(dataSet, function(d) {
                                return d;
                            }) * 100).toFixed(1) + "%");
                        }

                    } else if (scope.panel.pieType == "category") {
                        let arc = d3.svg.arc()
                            .innerRadius(innerRadius)
                            .outerRadius(outerRadius);
                        let arcs = svg.selectAll("g")
                            .data(pieData)
                            .enter()
                            .append("g")
                            .attr("transform", function() {
                                return "translate(" + (width / 2) + "," + (width / 2) + ")";
                            });

                        arcs.append("path")
                            //.style("stroke", "#fff")
                            .attr("fill", function(d, i) {
                                return colors[i];
                            })
                            .attr("d", function(d) {
                                return arc(d);
                            })
                            .on("mouseover", function(d, i) {
                                var arcOn = d3.svg.arc().innerRadius(innerRadius - 2).outerRadius(outerRadius + 2);
                                d3.select(this).attr("d", function(d) {
                                    return arcOn(d);
                                });
                                tooltip.html(seriesName[i] + "\t:\t" + +d.data + " (" + (d.data / d3.sum(dataSet, function(d) {
                                        return d;
                                    }) * 100).toFixed(1) + "%)")
                                    .style("left", (d3.event.pageX - elem.offset().left) + "px")
                                    .style("top", (d3.event.pageY - elem.offset().top - 20) + "px")
                                    .style("display", "block");

                            })
                            .on("mousemove", mousemove)
                            .on("mouseout", function() {
                                d3.select(this).transition().duration(800)
                                    .attr("d", function(d) {
                                        return arc(d);
                                    });
                                mouseout();
                            });
                    }
                }
            }

            scope.$watch(function() {
                return scope.panel;
            }, function(panel) {
                if (panel) {
                    elem.html("");
                    renderPieFunc(elem.width());
                }
            });

        }
    };
});