import "./vmHostSrv";
import "../../cvm/instances/instancesSrv";
import { PiePanelDefault } from "../../chartpanel";
import { AreaPanelDefault } from "../../chartpanel";
import { vmInsDetailChartDefault } from "../../chartpanel";
import { hostAreaChartSqlParams } from "../../chartpanel";
import { vmStatusColor } from "../../chartpanel";

angular.module("vmHostModule", ["ngSanitize", "ngTable", "instancesSrv", "usersrv", "vmHostSrv"])
    .controller("vmHostCtrl", ["$scope", "$rootScope", "$routeParams", "NgTableParams", "$uibModal", "instancesSrv", "$translate", "GLOBAL_CONFIG","vmhostSrv",
        function($scope, $rootScope, $routeParams, NgTableParams, $uibModal, instancesSrv, $translate, GLOBAL_CONFIG,vmhostSrv) {
            var self = $scope;
            var otherCount = 0;

            function getInstance() {
                instancesSrv.getData().then(function(result) {
                    result ? self.loadData = true : "";
                    if (result && result.data) {
                        //获取状态分布
                        self.vmTotal = 0;
                        result.data = result.data.filter(item => {
                            item.status = item.status.toLowerCase();
                            return item.proid == localStorage.projectUid && item.name != "fixedImageInstanceName";
                        })
                        vmhostSrv.instanceDataList  = result.data;
                        var hostStatus = {};
                        _.map(result.data, function(item) {
                            if (item.status in hostStatus) {
                                hostStatus[item.status] = hostStatus[item.status] + 1;
                                self.vmTotal++;
                            } else {
                                hostStatus[item.status] = 1;
                                self.vmTotal++;
                            }
                        });
                        self.vmStatusChart = new PiePanelDefault();
                        self.vmStatusChart.panels.pieType = "category";
                        self.vmStatusChart.panels.data = [];
                        self.vmStatusChart.panels.colors = [];
                        for (var key in hostStatus) {
                            var status_h;                    
                            //if(key == "ACTIVE" || key == "STOPPED" || key == "SHUTOFF" || key == "ERROR"  || key == "PAUSED"  || key == "SUSPENDED"){
                            if(key == "active" || key == "stopped" || key == "shutoff" || key == "error"  || key == "paused"  || key == "suspended"){
                                status_h = key;
                            }else{
                                //status_h = "OTHER";
                                status_h = "other";
                                otherCount = otherCount + hostStatus[key] ;
                            }
                            //if(status_h  !="OTHER"){
                            if(status_h  !="other"){
                                self.vmStatusChart.panels.data.push({
                                    name: $translate.instant("aws.instances.table.status." + [status_h]),
                                    value: hostStatus[key],
                                    status: key.toLowerCase()
                                });
                            }
                            
                            
                        }
                        self.vmStatusChart.panels.data.push({
                            name: $translate.instant("aws.monitor.virtual.vmhostStatus.other"),
                            value: otherCount,
                            status: "other"
                        });
                        let vmStatusColors = vmStatusColor();
                        _.each(self.vmStatusChart.panels.data,item=>{
                            self.vmStatusChart.panels.colors.push(vmStatusColors[item.status]);
                        });

                        //获取主机分布
                        self.hostTotal = 0;
                        var hostData = {};
                        _.map(result.data, function(item) {
                            if (item.hostName in hostData) {
                                hostData[item.hostName] = hostData[item.hostName] + 1;
                            } else if (item.hostName) {
                                hostData[item.hostName] = 1;
                                self.hostTotal++;
                            }
                        });
                        self.vmHostChart = new PiePanelDefault();
                        self.vmHostChart.panels.data = [];
                        self.vmHostChart.panels.pieType = "category";
                        for (var vmInfo in hostData) {
                            self.vmHostChart.panels.data.push({ name: vmInfo, value: hostData[vmInfo],nameSortNum:Number(vmInfo.split("-")[1])});
                        }
                        self.vmHostChart.panels.data=_.chain(self.vmHostChart.panels.data).sortBy("nameSortNum").value();
                        //获取表格数据
                        self.tableParams = new NgTableParams({ count: GLOBAL_CONFIG.PAGESIZE }, { counts: [], dataset: result.data });
                    }
                });
            }
            getInstance();

            $scope.$watch(function() {
                return $routeParams.id;
            }, function(value) {
                $scope.animation = value ? "animateIn" : "animateOut";
                $scope.detailIn = value ? true : false;
                if (value) {
                    $scope.$broadcast("vmhostDetail", value);

                }
            });

        }
    ])
    .controller("vmHostdetailCtrl", ["$scope", "userDataSrv", "instancesSrv", "vmhostSrv", "$translate", "$rootScope",
        function($scope, userDataSrv, instancesSrv, vmhostSrv, $translate, $rootScope) {
            var self = $scope;
            //获取虚拟机详情的数据
            self.$on("vmhostDetail", function(event, insUid) {
                self.insConfigData = {};
                self.panels = {};
                let initTimeParams = { //默认最近一小时
                    "startTime":(new Date(moment().subtract('hours',1).format('YYYY-MM-DD HH:mm:ss'))).getTime(),
                    "endTime":(new Date(moment().format('YYYY-MM-DD HH:mm:ss'))).getTime(),
                    "precision":20,
                    "timeStep":"1h"
                };
                self.queryLimit = {
                    "insUid": insUid,
                    "timeRange" : {
                        "cpu":angular.copy(initTimeParams),
                        "mem":angular.copy(initTimeParams),
                        "disk":angular.copy(initTimeParams),
                        "win_disk":angular.copy(initTimeParams),
                        "system":angular.copy(initTimeParams),
                        "netcard":angular.copy(initTimeParams)
                    }
                };
                self.filterData = {};
                $("#vmDetailLoadingChart").html("");

                if(vmhostSrv.instanceDataList){
                    _.each(vmhostSrv.instanceDataList,function(item){
                        if(item.uid == insUid){
                            self.insConfigData = item;
                        }
                    })
                }else{
                    instancesSrv.getServerDetail(insUid).then(function(result) {
                        if (result && result.data) {
                            self.insConfigData = result.data;
                        }
                    });
                }

                function panelsDataFunc(item, key, color,rangeHours) {
                    self.panels[key] = (self.panels[key]).slice((self.panels[key]).length, 0);
                    var areaChart = new AreaPanelDefault();
                    var chart = key;
                    if(key.indexOf("disk") > -1){
                        if(self.linuxSysVmchart){
                            chart = "disk";
                         }else{
                            chart = "win_disk";
                         }
                    }
                    areaChart.panels.title = $translate.instant("aws.monitor." + item.chartPerm.title);
                    areaChart.panels.unit = item.chartPerm.unit;
                    areaChart.panels.priority = item.chartPerm.priority;
                    if (color % 2 == 0) {
                        areaChart.panels.colors = ["#51a3ff"];
                    } else {
                        areaChart.panels.colors = ["#1bbc9d"];
                    }
                    if(rangeHours && rangeHours > 24){ //大于24小时，坐标轴显示日期
                        areaChart.panels.xAxisType = "date";
                    }
                    areaChart.panels.type = item.chartPerm.type;
                    areaChart.panels.chart = chart;
                    areaChart.panels[chart +"StartTime"] = new Date(self.queryLimit.timeRange[chart].startTime);
                    vmhostSrv.sqlQuery(
                        item.sqlPerm
                    ).then(function(res) {
                        if (res && res.data && res.data.results && res.data.results[0] && res.data.results[0].series && res.data.results[0].series[0].values.length > 2) {
                            if(item.chartPerm.type == "stack"){  //累计值，当前值等于之前所有值的和(win sys 累计流入流出流量)
                                let series = res.data.results[0].series[0];
                                let series_domain = series.columns.filter(function(key) {
                                    return key !== "time";
                                });
                                _.each(series_domain,function(name,i){
                                   for(let j=0;j<series.values.length;j++){
                                        if(j>0){
                                            series.values[j][i+1] += series.values[j-1][i+1];
                                        }
                                    }
                                });
                                areaChart.panels.data.push(series);
                            }else{
                                areaChart.panels.data.push(res.data.results[0].series[0]);
                            }   
                        } else {
                            let defaultChartData = {
                                "columns": ["time", item.chartPerm.title],
                                "values": [
                                    [areaChart.panels[chart +"StartTime"], 0],
                                    [moment(), 0]
                                ],
                                "default":true
                            };
                            areaChart.panels.data.push(defaultChartData);
                        }
                        self.panels[key].push(areaChart.panels);
                        $rootScope.loading = true;
                    })
                }

                function linuxSysVmchart(regionKey, insUid, timeRange) {
                    self.panels = {};
                    if ($rootScope.lazyOnType.length > 0) {
                        $rootScope.lazyOnType = $rootScope.lazyOnType.slice($rootScope.lazyOnType.length, 0);
                    }
                    $rootScope.lazyOnType = {
                        "linux_disk": true,
                        "linux_netcard": true
                    };
                    $rootScope.loading = true;
                    self.scrtop = 0;

                    var areaChartPermas = new vmInsDetailChartDefault(regionKey, insUid, timeRange);

                    for (let key in areaChartPermas.linuxSys) {
                        self.panels[key] = [];
                        switch (key) {
                            case "cpu":
                                _.each(areaChartPermas.linuxSys.cpu, function(item) {
                                    panelsDataFunc(item, "cpu", "1");
                                });
                                break;
                            case "mem":
                                _.each(areaChartPermas.linuxSys.mem, function(item) {
                                    panelsDataFunc(item, "mem", "2");
                                });
                                break;
                        }
                    }

                    var linuxDiskChartListener = self.$on("linux_disk", function(e) {
                        $rootScope.loading = false;
                        vmhostSrv.sqlQuery({
                            "sql": "select * from disk where vm_id = '"+ insUid +"' and time > now() - 11s and fstype != 'rootfs'"
                        }).then(function(res) {
                            self.diskPath = {
                                options: []
                            };
                            self.queryLimit.selectedDiskpath = "";
                            $rootScope.loading = true;
                            if (res && res.data && res.data.results && res.data.results[0] && res.data.results[0].series) {
                                let pathIndex = _.findIndex(res.data.results[0].series[0].columns,function(item){
                                    return item == "path";
                                });
                                _.each(res.data.results[0].series[0].values, function(item) {
                                    self.diskPath.options.push(item[pathIndex]);
                                })
                                self.diskPath.options = _.uniq(self.diskPath.options);
                                self.queryLimit.selectedDiskpath = self.diskPath.options[0];

                                function diskPathFunc(selectedDiskpath,rangeHours) {
                                    var diskPathChartPermas = (new vmInsDetailChartDefault(regionKey, insUid, timeRange, selectedDiskpath)).linuxSys.diskPath[0];
                                    panelsDataFunc(diskPathChartPermas, "diskPath", "3",rangeHours);
                                };
                                diskPathFunc(self.queryLimit.selectedDiskpath);

                                self.changeDiskpath = function(diskPath,chart) {
                                    self.panels.diskPath = self.panels.diskPath.slice(self.panels.diskPath.length, 0);
                                    let rangeHours = getRangeHours(self.queryLimit.timeRange[chart].startTime,self.queryLimit.timeRange[chart].endTime);
                                    diskPathFunc(diskPath,rangeHours);
                                };
                            }
                        });

                        vmhostSrv.sqlQuery({
                            "sql": "show tag values from diskio with key=\"name\" where host_type = 'virtual' and code = '" + regionKey + "' and vm_id = '" + insUid + "'"
                        }).then(function(res) {
                            self.diskio = {
                                options: []
                            };
                            self.queryLimit.selectedDiskio = "";
                            if (res && res.data && res.data.results && res.data.results[0] && res.data.results[0].series) {
                                _.each(res.data.results[0].series[0].values, function(item) {
                                    self.diskio.options.push(item[1]);
                                })
                                self.queryLimit.selectedDiskio = self.diskio.options[0];

                                function diskioChartFunc(selectedDiskio,rangeHours) {
                                    var diskioChartPermas = new vmInsDetailChartDefault(regionKey, insUid, timeRange, selectedDiskio);
                                    _.each(diskioChartPermas.linuxSys.diskio, function(item) {
                                        panelsDataFunc(item, "diskio", "3",rangeHours);
                                    })
                                };
                                diskioChartFunc(self.queryLimit.selectedDiskio);

                                self.changeDiskio = function(diskio,chart) {
                                    self.panels.diskio = [];
                                    let rangeHours = getRangeHours(self.queryLimit.timeRange[chart].startTime,self.queryLimit.timeRange[chart].endTime);
                                    diskioChartFunc(diskio,rangeHours);
                                };
                            }
                        });
                        linuxDiskChartListener();
                    });

                    var linuxNetcardChartListener = self.$on("linux_netcard", function(e) {
                        $rootScope.loading = false;
                        vmhostSrv.sqlQuery({
                            "sql": "show tag values from net with key=\"interface\" where host_type = 'virtual' and code = '" + regionKey + "' and vm_id = '" + insUid + "'"
                        }).then(function(res) {
                            $rootScope.loading = true;
                            self.netCard = {
                                options: []
                            };
                            self.queryLimit.selectedNetCard = "";
                            if (res && res.data && res.data.results && res.data.results[0] && res.data.results[0].series) {
                                _.each((res.data.results[0].series[0].values).filter(function(val) {
                                    return val[1] != "all";
                                }), function(item) {
                                    self.netCard.options.push(item[1]);
                                });
                                self.queryLimit.selectedNetCard = self.netCard.options[0];

                                function netcardChartFunc(selectedNetCard,rangeHours) {
                                    var netcardChartPermas = new vmInsDetailChartDefault(regionKey, insUid, timeRange, selectedNetCard);
                                    _.each(netcardChartPermas.linuxSys.netcard, function(item) {
                                        panelsDataFunc(item, "netcard", "4",rangeHours);
                                    });
                                };
                                netcardChartFunc(self.queryLimit.selectedNetCard);

                                self.changeNetCard = function(netcard,chart) {
                                    self.panels.netcard = [];
                                    let rangeHours = getRangeHours(self.queryLimit.timeRange[chart].startTime,self.queryLimit.timeRange[chart].endTime);
                                    netcardChartFunc(netcard,rangeHours);
                                };
                            }
                        });
                        linuxNetcardChartListener();
                    });
                }

                function winSysVmchart(regionKey, insUid, timeRange) {
                    self.panels = {};
                    if ($rootScope.lazyOnType.length > 0) {
                        $rootScope.lazyOnType = $rootScope.lazyOnType.slice($rootScope.lazyOnType.length, 0);
                    }
                    $rootScope.lazyOnType = {
                        "win_disk": true,
                        "win_netcard": true
                    };
                    $rootScope.loading = true;
                    self.scrtop = 0;

                    var areaChartPermas = new vmInsDetailChartDefault(regionKey, insUid, timeRange);
                    for (let key in areaChartPermas.winSys) {
                        self.panels[key] = [];
                        switch (key) {
                            case "cpu":
                                _.each(areaChartPermas.winSys.cpu, function(item) {
                                    panelsDataFunc(item, "cpu", "1");
                                });
                                break;
                            case "mem":
                                _.each(areaChartPermas.winSys.mem, function(item) {
                                    panelsDataFunc(item, "mem", "2");
                                });
                                break;
                            case "system":
                                _.each(areaChartPermas.winSys.system, function(item) {
                                    panelsDataFunc(item, "system", "3");
                                })
                                break;
                        }
                    }

                    var winDiskChartListener = self.$on("win_disk", function(e) {
                        $rootScope.loading = false;
                        _.each(areaChartPermas.winSys.disk, function(item) {
                            panelsDataFunc(item, "disk", "4");
                        })
                            //磁盘分区
                        vmhostSrv.sqlQuery({
                            "sql": "SHOW TAG VALUES FROM \"disk\" WITH KEY = \"path\" where vm_id = '" + insUid + "' and code = '" + regionKey + "'"
                        }).then(function(res) {
                            // console.log("diskPath=", res);
                            self.diskPath = {
                                options: []
                            };
                            self.queryLimit.selectedDiskpath = "";
                            $rootScope.loading = true;
                            if (res && res.data && res.data.results && res.data.results[0] && res.data.results[0].series) {
                                _.each(res.data.results[0].series[0].values, function(item) {
                                    self.diskPath.options.push(item[1]);
                                })
                                self.queryLimit.selectedDiskpath = self.diskPath.options[0];

                                function diskPathFunc(selectedDiskpath,rangeHours) {
                                    var diskPathChartPermas = (new vmInsDetailChartDefault(regionKey, insUid, timeRange, selectedDiskpath)).winSys.diskPath[0];
                                    panelsDataFunc(diskPathChartPermas, "diskPath", "4",rangeHours);
                                };
                                diskPathFunc(self.queryLimit.selectedDiskpath);

                                self.changeDiskpath = function(diskPath,chart) {
                                    self.panels.diskPath = self.panels.diskPath.slice(self.panels.diskPath.length, 0);
                                    let rangeHours = getRangeHours(self.queryLimit.timeRange[chart].startTime,self.queryLimit.timeRange[chart].endTime);
                                    diskPathFunc(diskPath,rangeHours);
                                };
                            }
                        });
                        winDiskChartListener();
                    });

                    var winNetcardChartListener = self.$on("win_netcard", function(e) {
                        $rootScope.loading = false;
                        vmhostSrv.sqlQuery({
                            "sql": "show tag values from win_net with key=\"instance\" where code = '" + regionKey + "'and vm_id ='" + insUid + "'"
                        }).then(function(res) {
                            //console.log("netcard=", res);
                            $rootScope.loading = true;
                            self.netCard = {
                                options: []
                            };
                            self.queryLimit.selectedNetCard = "";
                            if (res && res.data && res.data.results && res.data.results[0] && res.data.results[0].series) {
                                _.each((res.data.results[0].series[0].values).filter(function(val) {
                                    return val[1] != "all";
                                }), function(item) {
                                    self.netCard.options.push(item[1]);
                                })
                                self.queryLimit.selectedNetCard = self.netCard.options[0];

                                function netcardChartFunc(selectedNetCard,rangeHours) {
                                    var netcardChartPermas = new vmInsDetailChartDefault(regionKey, insUid, timeRange, selectedNetCard);
                                    _.each(netcardChartPermas.winSys.netcard, function(item) {
                                        panelsDataFunc(item, "netcard", "5",rangeHours);
                                    })
                                };
                                netcardChartFunc(self.queryLimit.selectedNetCard);

                                self.changeNetCard = function(netcard,chart) {
                                    self.panels.netcard = [];
                                    let rangeHours = getRangeHours(self.queryLimit.timeRange[chart].startTime,self.queryLimit.timeRange[chart].endTime);
                                    netcardChartFunc(netcard,rangeHours);
                                };
                            }
                        });
                        winNetcardChartListener();
                    });
                }

                userDataSrv.getRegionData().then(function(res) {
                    if (res && res.data) {
                        self.queryLimit.regionOptions =  res.data.filter(item => {
                            return item.status == 3;
                        });
                        self.queryLimit.region_key = self.queryLimit.regionOptions[0].regionKey;
                        _.each(self.queryLimit.regionOptions, item => {
                            if (item.regionKey == localStorage.regionKey) {
                                self.queryLimit.region_key = item.regionKey;
                            }
                        });
                        // libvirt监控没有mem这个字段
                        vmhostSrv.sqlQuery({
                            "sql": "select * from mem where time > now() - 1m AND code = '" + self.queryLimit.region_key + "' AND host_type = 'virtual' AND \
                                    vm_id = '" + self.queryLimit.insUid + "'"
                        }).then(function(res) {
                            res?self.loadedQueryData = true:false;
                            if (res && res.data && res.data.results && res.data.results[0] && res.data.results[0].series) {
                                self.queryMemNull = false;
                                vmhostSrv.sqlQuery({
                                    "sql": "SELECT MAX(used_percent) AS used_percent FROM swap WHERE time > now() - 30m AND code = '" + self.queryLimit.region_key + "' \
                                            AND host_type = 'virtual' AND vm_id = '" + self.queryLimit.insUid + "' GROUP BY time(10s)"
                                }).then(function(res) {
                                    //先查看Linux的是否有数据
                                    if (res && res.data && res.data.results && res.data.results[0] && res.data.results[0].series) {
                                        //有数据就用Linux数据渲染
                                        self.linuxSysVmchart = true;
                                        self.winSysVmchart = false;
                                        linuxSysVmchart(self.queryLimit.region_key, self.queryLimit.insUid, self.queryLimit.timeRange);
                                    } else {
                                        self.linuxSysVmchart = false;
                                        self.winSysVmchart = true;
                                        winSysVmchart(self.queryLimit.region_key, self.queryLimit.insUid, self.queryLimit.timeRange);
                                    }
                                });
                            } else {
                                self.queryMemNull = true;
                            }
                        })
                    }
                });
                
                //根据时间范围设置查询精度
                function setSqlPrecision(range,chart){ 

                    if(range>0 && range <=1){
                        self.queryLimit.timeRange[chart].precision = 20;
                    }else if(range>1 && range <=6){
                        self.queryLimit.timeRange[chart].precision = 30;
                    }else if(range >6 && range <12){
                        self.queryLimit.timeRange[chart].precision = 60;
                    }else if(range >12 && range <=24){
                        self.queryLimit.timeRange[chart].precision = 90;
                    }else if(range >24 && range <=72){
                        self.queryLimit.timeRange[chart].precision = 360;
                    }else if(range >72 && range <= 168){
                        self.queryLimit.timeRange[chart].precision = 900;
                    }else if(range >168){
                        self.queryLimit.timeRange[chart].precision = 1800;
                    }
                }

                //获取起止总时间，单位h
                function getRangeHours(start,end){ 
                    let rangeHours;
                    let _start = new Date(start);
                    let _end = new Date(end);
                    let diffTime = _end.getTime() - _start.getTime();
                    let diffDays=Math.floor(diffTime/(24*3600*1000));
                    let leave1=diffTime%(24*3600*1000)    //计算天数后剩余的毫秒数
                    let diffHours=Math.floor(leave1/(3600*1000))
                    rangeHours = diffDays*24 + diffHours;
                    return rangeHours;
                }

                //时间切换后重绘chart图
                function reRenderChart(queryLimit,rangeHours,chart){
                    var areaChartPermas = new vmInsDetailChartDefault(queryLimit.region_key, queryLimit.insUid, queryLimit.timeRange);
                    if(self.linuxSysVmchart){
                        switch(chart){
                            case "cpu":
                                _.each(areaChartPermas.linuxSys.cpu, function(item) {
                                    panelsDataFunc(item, "cpu", "1",rangeHours);
                                });
                            break;
                            case "mem":
                                _.each(areaChartPermas.linuxSys.mem, function(item) {
                                    panelsDataFunc(item, "mem", "2",rangeHours);
                                });
                            break;
                            case "disk":
                                var diskPathChartPermas = (new vmInsDetailChartDefault(queryLimit.region_key, queryLimit.insUid, queryLimit.timeRange, queryLimit.selectedDiskpath)).linuxSys.diskPath[0];
                                panelsDataFunc(diskPathChartPermas, "diskPath", "3",rangeHours);
                                
                                var diskioChartPermas = new vmInsDetailChartDefault(queryLimit.region_key, queryLimit.insUid, queryLimit.timeRange, queryLimit.selectedDiskio);
                                _.each(diskioChartPermas.linuxSys.diskio, function(item) {
                                    panelsDataFunc(item, "diskio", "3",rangeHours);
                                })
                            break;
                            case "netcard":
                            var netcardChartPermas = new vmInsDetailChartDefault(queryLimit.region_key, queryLimit.insUid, queryLimit.timeRange, queryLimit.selectedNetCard);
                             _.each(netcardChartPermas.linuxSys.netcard, function(item) {
                                panelsDataFunc(item, "netcard", "4",rangeHours);
                            });
                            break;
                        }
                    }else{
                        switch(chart){
                            case "cpu":
                                _.each(areaChartPermas.winSys.cpu, function(item) {
                                    panelsDataFunc(item, "cpu", "1",rangeHours);
                                });
                            break;
                            case "mem":
                                 _.each(areaChartPermas.winSys.mem, function(item) {
                                    panelsDataFunc(item, "mem", "2",rangeHours);
                                });
                            break;
                            case "system":
                                _.each(areaChartPermas.winSys.system, function(item) {
                                    panelsDataFunc(item, "system", "3",rangeHours);
                                });
                            break;
                            case "win_disk":
                                var diskPathChartPermas = (new vmInsDetailChartDefault(queryLimit.region_key, queryLimit.insUid, queryLimit.timeRange, queryLimit.selectedDiskpath)).winSys.diskPath[0];
                                panelsDataFunc(diskPathChartPermas, "diskPath", "4",rangeHours);
                                _.each(areaChartPermas.winSys.disk, function(item) {
                                    panelsDataFunc(item, "disk", "4",rangeHours);
                                })

                            break;
                            case "netcard":
                                var netcardChartPermas = new vmInsDetailChartDefault(queryLimit.region_key, queryLimit.insUid, queryLimit.timeRange, queryLimit.selectedNetCard);
                                _.each(netcardChartPermas.winSys.netcard, function(item) {
                                    panelsDataFunc(item, "netcard", "5",rangeHours);
                                });
                            break;
                        }
                    }
                }

                //设置时间参数
                function setTimeRangeParams(start,end,chart){
                    let rangeHours = getRangeHours(start,end);
                    setSqlPrecision(rangeHours,chart);
                    self.queryLimit.timeRange[chart].startTime = (new Date(start)).getTime(); //时间戳，单位ms
                    self.queryLimit.timeRange[chart].endTime = (new Date(end)).getTime();  //时间戳，单位ms
                    reRenderChart(self.queryLimit,rangeHours,chart);
                }

                //清空自定义时间
                function clearCustomTime(chart){
                    $('#'+chart+'-calendar').val("");
                    $(".daterangepicker ").on('click.daterangepicker', 'button.'+chart+'-cancelBtn ', function() {
                        $('#'+chart+'-calendar').val("");
                        //self.timeSelectTab("1h",chart);
                    });
                }

                self.timeStepList = [
                    {value:"1h",name:"近1小时"},
                    {value:"6h",name:"近6小时"},
                    {value:"1d",name:"近一天"},
                    {value:"7d",name:"近一周"},
                    //{value:"15d",name:"近15天"},
                    {value:"30d",name:"近一个月"},
                    {value:"90d",name:"近三个月"}
                ];

                //初始化日历
                function initDaterangepicker(chart) {
                    angular.element('.calendar-select i').click(function() {
                        angular.element(this).parent().find("input[id='"+chart+"-calendar']").click();

                    });

                    angular.element('#'+ chart +'-calendar').daterangepicker({
                        //"startDate": moment().subtract(6, 'days'),
                        "endDate": moment(),
                        "maxDate": moment(), //最大时间 
                        "opens": "left",
                        "showDropdowns": false,
                        "applyClass": chart + "-applyBtn",
                        "cancelClass": chart + "-cancelBtn",
                        "locale": {
                            "format": 'YYYY-MM-DD', //控件中from和to 显示的日期格式  
                            "separator": '  至  ',
                            "applyLabel": '确定',
                            "cancelLabel": '取消',
                            "fromLabel": '起始时间',
                            "toLabel": '结束时间',
                            "customRangeLabel": '自定义',
                            "daysOfWeek": ['日', '一', '二', '三', '四', '五', '六'],
                            "monthNames": ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
                            "firstDay": 1
                        }
                    }, function(start, end, label) {
                        self.queryLimit.timeRange[chart].timeStep = "";
                        start = start.format('YYYY-MM-DD HH:mm:ss');
                        end = end.format('YYYY-MM-DD HH:mm:ss');
                        setTimeRangeParams(start,end,chart);
                    });
                    clearCustomTime(chart);
                }

                for(let key in self.queryLimit.timeRange){
                    initDaterangepicker(key);
                    
                }
                
                //时间tab选择
                self.timeSelectTab = function(step,chart) {
                    clearCustomTime(chart);
                    self.queryLimit.timeRange[chart].timeStep = step;
                    let start = moment().subtract(step.substring(0, step.length - 1), step.substring(step.length - 1, step.length)).format("YYYY-MM-DD HH:mm:ss");
                    let end = moment().format('YYYY-MM-DD HH:mm:ss');
                    setTimeRangeParams(start,end,chart);
                };

            });
        }
    ])
    .controller("vmhostdetailCtrl", ["$scope", "userDataSrv", "instancesSrv", "vmhostSrv", "$translate", "$rootScope","vmFuncSrv",
        function($scope, userDataSrv, instancesSrv, vmhostSrv, $translate, $rootScope,vmFuncSrv) {
            var self = $scope;
            //获取虚拟机详情的数据
            self.$on("vmhostDetail", function(event, insUid) {
                self.insConfigData = {};
                self.panels = {};
                self.collectCycleList = [
                    {name: "5分钟", value: 300},
                    {name: "1小时", value: 3600},
                    {name: "1天", value: 86400}
                ];
                self.timeType = {
                    options: [{
                        "name": $translate.instant('aws.bill.timeType.realTime'),
                        "value": ""
                    }, {
                        "name": $translate.instant('aws.bill.timeType.sixHours'),
                        "value": "6h"
                    }, {
                        "name": $translate.instant('aws.bill.timeType.oneDay'),
                        "value": "1d"
                    }, {
                        "name": $translate.instant('aws.bill.timeType.threeDays'),
                        "value": "3d"
                    }, {
                        "name": $translate.instant('aws.bill.timeType.oneWeek'),
                        "value": "7d"
                    }]
                };
                self.fliterCard = function(data) {
                    if(data && data.length) {
                        var netCard = data.filter(item => item.priority != "c0");
                        return netCard;
                    }
                }
                self.filterData = {
                    insUid:insUid,
                    timeStep: "",
                    from: null,
                    to: null,
                    precision: self.collectCycleList[0].value,
                    definedTimeText: $translate.instant('aws.bill.chooseDate'),
                    rangeHours:""
                };
                $("#vmDetailLoadingChart").html("");
                vmFuncSrv.getHostAreaChartFunc(self,hostAreaChartSqlParams,AreaPanelDefault); //cpu、内存、磁盘各指标的监控

                if(vmhostSrv.instanceDataList){
                    _.each(vmhostSrv.instanceDataList,function(item){
                        if(item.uid == insUid){
                            self.insConfigData = item;
                        }
                    })
                }else{
                    instancesSrv.getServerDetail(insUid).then(function(result) {
                        if (result && result.data) {
                            self.insConfigData = result.data;
                        }
                    });
                }

                userDataSrv.getRegionData().then(function(res) {
                    if (res && res.data) {
                        self.filterData.regionOptions =  res.data.filter(item => {
                            return item.status == 3;
                        });
                        self.filterData.region_key = self.filterData.regionOptions[0].regionKey;
                        _.each(self.filterData.regionOptions, item => {
                            if (item.regionKey == localStorage.regionKey) {
                                self.filterData.region_key = item.regionKey;
                            }
                        });
                        // libvirt监控没有mem这个字段
                        vmhostSrv.sqlQuery({
                            "sql": "select * from mem where time > now() - 1m AND code = '" + self.filterData.region_key + "' AND host_type = 'virtual' AND \
                                    vm_id = '" + insUid + "'"
                        }).then(function(res) {
                            res?self.loadedQueryData = true:false;
                            if (res && res.data && res.data.results && res.data.results[0] && res.data.results[0].series) {
                                self.queryMemNull = false;
                                vmhostSrv.sqlQuery({
                                    "sql": "SELECT MAX(used_percent) AS used_percent FROM swap WHERE time > now() - 30m AND code = '" + self.filterData.region_key + "' \
                                            AND host_type = 'virtual' AND vm_id = '" + insUid + "' GROUP BY time(10s)"
                                }).then(function(res) {
                                    //先查看Linux的是否有数据
                                    if (res && res.data && res.data.results && res.data.results[0] && res.data.results[0].series) {
                                        //有数据就用Linux数据渲染
                                        self.linuxSysVmchart = true;
                                        self.winSysVmchart = false;
                                        self.getHostAreaChart(self.filterData.region_key,insUid,self.filterData);
                                    } else {
                                        self.linuxSysVmchart = false;
                                        self.winSysVmchart = true;
                                        self.getHostAreaChart(self.filterData.region_key,insUid,self.filterData,"win");
                                    }
                                });
                            } else {
                                self.queryMemNull = true;
                            }
                        })
                    }
                });
                
                self.query = function(){
                    if(self.linuxSysVmchart){
                        self.getHostAreaChart(self.filterData.region_key,insUid,self.filterData);
                    }else{
                        self.getHostAreaChart(self.filterData.region_key,insUid,self.filterData,"win");
                    }
                };

            });
        }
    ])
