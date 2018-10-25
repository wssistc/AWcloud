import "./overviewSrv";
import "../department/departmentSrv";
import "../monitor/alarmManagement/alarmEventSrv";
import "../ticket/ticketSrv";
import "../department/depviewSrv"
import "../project/projectSrv";
import { PiePanelDefault } from "../chartpanel";
import "../cvm/networks/networksSrv"
import "../cvm/instances/instancesSrv"
import "../cvm/recycle/recycleSrv"

var singleModule = angular.module("viewaModules", ["ngTable", "ngAnimate", "ui.bootstrap", "overviewSrvModule", "depviewsrv", "ngSanitize", "operatelogSrv", "alarmEventSrvModule", "peojectsrv", "networksSrvModule","instancesSrv","recycleSrvModule"]);
singleModule.controller("viewaCtrl", ["$scope", "$rootScope", "$uibModal", "$location", "checkedSrv", "NgTableParams", "overviewSrv", "depviewsrv", "$translate", "operatelogSrv", "departmentDataSrv", "alarmEventSrv", "ticketsrv", "projectDataSrv",
 "$route", "GLOBAL_CONFIG", "networksSrv","instancesSrv","recycleSrv", "vmFuncSrv","localInit",
 function($scope, rootScope, $uibModal, $location, checkedSrv, NgTableParams, overviewSrv, depviewsrv, $translate, operatelogSrv, 
    departmentDataSrv, alarmEventSrv, ticketsrv, projectDataSrv, $route, GLOBAL_CONFIG, networksSrv,instancesSrv,
    recycleSrv,vmFuncSrv,localInit) {
    var self = $scope;
    self = vmFuncSrv.storageFunc(self,instancesSrv);
    localStorage.vmware_flag=1;
    var enterpriseUid = localStorage.enterpriseUid ? localStorage.enterpriseUid : "";
    var userId = localStorage.$USERID ? localStorage.$USERID : "";
    //localStorage.$QCLOUD_AUTH_TOKEN = qcloudUid?qcloudUid:"";
    //rootScope.qcloudUrl = qcloudUid ? "/qcloud/#/?token=" + qcloudUid : '';
    //rootScope.vmwareUrl = "/vmware/#/?url=datacenter&token=" + localStorage.$AUTH_TOKEN;
    self.userName = localStorage.userName;
    /*单数据中心*/
    self.activeRegionKey = localStorage.regionKey;
    rootScope.vmwareLoadding = false;
    self.intoSingle = function(item){
        //rootScope.vmwareLoadding = true;
        var data ={
            regionKey:item.regionKey
        }
        overviewSrv.changeRegion(data).then(function(res){
            if(res&&res.data&&res.data.token){
                var result = {
                    data:angular.copy(res)
                }
                //localStorage.$AUTH_TOKEN =  res.data.token;
                //localStorage.regionName = item.regionName;  
                //localStorage.regionKey = item.regionKey;
                self.activeRegionKey = item.regionKey;

                localInit.localstorageInit(result,self);
                rootScope.services = {
                    "backups":localStorage.backupsService,
                    "cinder":localStorage.cinderService,
                    "ceph":localStorage.cephService
                }
                $route.reload();
            }
        })
        // .finally(function(){
        //     rootScope.vmwareLoadding = false;
        // }) 
    }

    overviewSrv.getVmStatus().then(function(res) {
        if (res && res.data) {
            self.vmStatusData = {
                "colors":
                    [
                        "#1abc9c",
                        "#f39c12",
                        "#e74c3c",
                        "#666666"
                    ],
                "type":"pie",
                "width":200,
                "height":200,
                "outerRadius":75,
                "innerRadius":50,
                "total":res.data.total,
                "data":[
                    {"name":$translate.instant("aws.overview.run"),"value":res.data.active,"status":"active"},
                    {"name":$translate.instant("aws.overview.poweroff"),"value":res.data.shutoff,"status":"shutoff"},
                    {"name":$translate.instant("aws.overview.falut"),"value":res.data.error,"status":"error"},
                    {"name":$translate.instant("aws.overview.other"),"value":res.data.others,"status":"other"}
                ],
                "title":"",
                "id":"",
                "pieType":"category",
                "progressRate":true
            }
        }
    });

    /*公网ip当只有一个时显示饼图，多个时显示条形图*/

    overviewSrv.getExternalNetworks().then(function(res) {
        if (res && res.data){
            self.externalType = res.data.length;
            if(self.externalType<2){
                self.ipDetail = {
                    total:res.data[0].totalNetworkIpAvailability,
                    name:res.data[0].title
                };
                self.ipUseChart = new PiePanelDefault();
                self.ipUseChart.panels.data = [
                    { name: $translate.instant("aws.overview.inUsed"), value: res.data[0].usedNetworkIpAvailability },
                    { name: $translate.instant("aws.overview.unUsed"), value: (res.data[0].totalNetworkIpAvailability-res.data[0].usedNetworkIpAvailability)}
                ];
                self.ipUseChart.panels.pieType = "percent";
                self.ipUseChart.panels.colors = ["#1ABC9C", "#e5e5e5"];
            }else{
                self.netWorkType =[];
                res.data.forEach(function(item){
                    var netItem = {"title":item.title,"inUsed":item.usedNetworkIpAvailability,"beAdded":1,"total":item.totalNetworkIpAvailability}
                    self.netWorkType.push(netItem)
                })
            }
        }
    })

    function handleChartData(title,chartData,unit,ints){
        var xAxis = [];
        var series = [];
        for(var i=1;i<chartData.columns.length;i++){
            var centername = chartData.columns[i];
            var seriesItem = {
                name :centername,
                areaStyle: {normal: {}},
                type:'line',
                data:[]
            }
            for(var j=0;j<chartData.values.length;j++){
                var columnsItem = chartData.values[j];
                var timeDate = new Date(columnsItem[0])
                var timeStr = (timeDate.getMonth()+1)+'/'+timeDate.getDate();
                xAxis.push(timeStr);
                seriesItem.data.push(columnsItem[i]?columnsItem[i]:0) 
            }
            series.push(seriesItem)
        }
        return {
                legend: {
                    show: false,
                    orient: 'vertical',
                    top: 'middle',
                    left: 'auto',
                    right: 10
                },
                color:[
                    "#1abc9c",
                    "#51a3ff",
                    "#1bbc9d",
                    "#b6a2dd",
                    "#e67f23",
                    "#c0392b",
                    "#ff754a"
                ],
                unit:unit,
                title:title,
                xAxis:xAxis,
                toolboxShow: false,
                series:series,
                ints:ints
            }
    }
    /*获取vlan/vxlan资源总量*/
    overviewSrv.getVlanData().then(function(res){
        if(res&&res.data){
            self.VlanData = res.data;
            /*获取Vlan使用数据详情*/
            overviewSrv.getVlanType().then(function(res){
                if(res&&res.data){
                    self.vlanType = res.data.type.toUpperCase();
                    overviewSrv.getVlanFold(res.data.type).then(function(res){
                        var vlanHistory = [];
                        if(res&&res.data){
                            var columns = res.data.columns;
                            var values = res.data.values;
                            for(var k=1;k<columns.length;k++){
                                var regionNamea = columns[k];
                                for (var h = 0; h < values.length; h++){
                                    if(res.data.values[h][k]){
                                        //res.data.values[h][k] = ((res.data.values[h][k])/self.VlanData.totleVlanId)*100
                                    }
                                }
                            }
                            //vlanHistory.push(res.data)
                            /*VLAN标签*/
                            // self.vlanData = {
                            //     "colors":["#1bbc9d"],
                            //     "type":"area",
                            //     "width":550,
                            //     "height":220,
                            //     "margin":{
                            //         "left":60,
                            //         "right":15,
                            //         "top":15,
                            //         "bottom":30},
                            //     "unit":"%",
                            //     "data":vlanHistory,
                            //     "title":"",
                            //     "subTitle":"",
                            //     "priority":"a0",
                            //     "chartName":"",
                            //     "xAxisType":"date"}
                            self.vlanData =  handleChartData('',res.data,'')
                        }
                    })
                }
            })
        }
    })

    /*公网类型*/
    function getRegionList(){
        self.regionModel = {
            selected: "" 
        };
        overviewSrv.getRegions().then(function(res) {
            if(res&&res.data){
                self.regionList = res.data.filter(item=>{
                    return item.status==3;
                })
                localStorage.regionNum = self.regionList.length;
                self.regionModel.selected = self.regionList[0];
            }
            
        })
    }
    getRegionList();

function initAddMenu(){
    self.addMenu =[
        {"name":"createinstance","value":true,"able":false,"icon":"icon-aw-cloud-server"},
        {"name":"createnetwork","value":true,"able":false,"icon":"icon-aw-network1"},
        {"name":"createdisk","value":true,"able":false,"icon":"icon-aw-hard-disk"},
        {"name":"createuser","value":true,"able":false,"icon":"icon-aw-sfgl"},
        {"name":"createvpn","value":false,"able":true,"icon":"icon-aw-router2"}
    ];
    let regionBusiAuth=localStorage.regionBusiAuth!=2?JSON.parse(localStorage.regionBusiAuth):[];
    let netIndex=regionBusiAuth.indexOf("3");
    let storageIndex=regionBusiAuth.indexOf("2");
    if(netIndex==-1){
        self.addMenu.splice(4,1);
    }
    if(storageIndex==-1){
        //此时vpn可点击
        self.addMenu.filter(function(item){
            if(item.name=='createvpn'){
               item.able=false;
               item.value=true;
            }
        });  
        self.addMenu.splice(2,1);
    }
}
initAddMenu();


self.seeAllIp = function(){
    $uibModal.open({
        animation: true,
        templateUrl:"ipRegion.html",
        controller: "ipCtrl",
        scope:self
    })
}

self.seeAllStorage = function(){
    $uibModal.open({
        animation: true,
        templateUrl:"storageRegion.html",
        scope:self
    })
}

self.checkBoxFun = function(){
    var checkNum = 0;
    self.addMenu.forEach(function(item){
        if(item.value){
            checkNum++;
        }
    })
    if(checkNum>=4){
        self.addMenu.forEach(function(item){
            if(!item.value){
                item.able = true;
            }
        })
    }else{
        self.addMenu.forEach(function(item){
            item.able = false;
        })
    }
}
//
    function bytesToSize(bytes) {
        var k = 1024, // or 1000
            sizes = ["GB", "TB", "PB", "EB", "ZB", "YB"], // sizes = ['Bytes', 'KB', 'MB',"GB", "TB", "PB", "EB", "ZB", "YB"],
            i;
        if (bytes < 0) i = Math.floor(Math.log(-bytes) / Math.log(k));
        if (bytes >= 0 && bytes < 1) return { a: 0, b: "0 GB" };
        if (bytes >= 1)
            i = Math.floor(Math.log(bytes) / Math.log(k));
        //var gtZero = ((bytes / Math.pow(k, i)).toPrecision(3)) >= 0 ? ((bytes / Math.pow(k, i)).toPrecision(3)) : 0;
        //解决页面使用科学计算法展示数据的bug
        var gtZero = (bytes / Math.pow(k, i)).toPrecision(3) >= 0 ? (bytes / Math.pow(k, i)): 0;
        if(gtZero.toString().indexOf(".")>-1) {
            if(gtZero.toString().split(".")[1].length>2){
                gtZero = gtZero.toFixed(2)
            }
        }
        if(i<0) i = 0;
        return {
            a: (bytes).toPrecision(3),
            b: gtZero + " " + sizes[i]
        };
    }
    //标准版不显示项目，改为显示网络
    if (localStorage.permission == "stand") {
        networksSrv.getNetworksTableData().then(function(result) {
            if (result && result.data && angular.isArray(result.data)) {
                self.netTotal = result.data.length
            }
        })
    } else {
        overviewSrv.getDomainProTotal().then(function(result) {
            self.domainTotal = 0;
            self.projectTotal = 0;
            if (result && result.data) {
                self.domainTotal = result.data.domain_total;
                self.projectTotal = result.data.project_total;
            }
        });
    }

    overviewSrv.getalarmEvents().then(function(result) {
        self.alarmEventsTotal = 0;
        if (result && result.total) {
            self.alarmEventsTotal = result.total;
        }
    });
    overviewSrv.getHostInfo().then(function(result) {
        if (result && result.data) {
            self.hostTotal = result.data.host_total ? result.data.host_total : 0;
            //self.hostCPUTotal = result.data.host_cpu_total ? result.data.host_cpu_total : 0;
            //self.hostMemoryTotal = result.data.host_memory_total?(result.data.host_memory_total/1024).toFixed(0):0;
            self.registedHosts = result.data.host_registered_total ? result.data.host_registered_total : 0;
            self.unregistedHosts = self.hostTotal - self.registedHosts;
            self.hddTotal = result.data.host_disk_hdd_total ? result.data.host_disk_hdd_total : 0;
            self.ssdTotal = result.data.host_disk_ssd_total ? result.data.host_disk_ssd_total : 0;
            //self.storageTotal = bytesToSize(self.hddTotal + self.ssdTotal); //GB

            self.insRegisterChart = new PiePanelDefault();
            self.insRegisterChart.panels.data = [
                { name: $translate.instant("aws.overview.registed"), value: self.registedHosts },
                { name: $translate.instant("aws.overview.unRegisted"), value: self.unregistedHosts }
            ];
            self.insRegisterChart.panels.pieType = "percent";
            self.insRegisterChart.panels.progressRate = false;
            self.dynamicPopover = {
                templateUrl: "registedInsTable.html"
            };

            overviewSrv.getOshypervisorsStatistics().then(function(res) {
                if (res && res.data) {
                    return res.data;
                }
            }).then(function(statisticsData) {
                overviewSrv.getConfigValues().then(function(res) {
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
                        self.cpuUseChart.panels.data = [
                            { name: $translate.instant("aws.overview.inUsed"), value: self.allocatedCpu },
                            { name: $translate.instant("aws.overview.unUsed"), value: self.unAlloactedCpu }
                        ];
                        self.cpuUseChart.panels.pieType = "percent";
                        self.cpuUseChart.panels.colors = ["#1ABC9C", "#e5e5e5"];

                        //内存
                        //flavor中内存有0.5G的选项，内存展示需保留一位小数
                        let org_hostMemoryTotal = (Number(statisticsData.memory_mb)*ramConfigValue - Number(statisticsData.reserved_host_memory_mb))/1024;
                        let org_allocatedRam = (Number(statisticsData.memory_mb_used) - Number(statisticsData.reserved_host_memory_mb)) / 1024;
                        self.hostMemoryTotal = Math.ceil(org_hostMemoryTotal) === org_hostMemoryTotal ? org_hostMemoryTotal:org_hostMemoryTotal.toFixed(1);
                        self.allocatedRam = Math.ceil(org_allocatedRam) === org_allocatedRam ? org_allocatedRam:org_allocatedRam.toFixed(1);
                        let _unAllocatedRam = Number(self.hostMemoryTotal) - Number(self.allocatedRam);
                        self.unAllocatedRam = Math.ceil(_unAllocatedRam) === _unAllocatedRam?_unAllocatedRam:_unAllocatedRam.toFixed(1);
                        let _ramPercent = Number(self.allocatedRam) / Number(self.hostMemoryTotal);
                        self.ramPercent = Math.ceil(_ramPercent) === _ramPercent ? _ramPercent + "%":(_ramPercent).toFixed(1) + "%";
                        self.memoryUseChart = new PiePanelDefault();
                        self.memoryUseChart.panels.data = [
                            { name: $translate.instant("aws.overview.inUsed"), value: self.allocatedRam },
                            { name: $translate.instant("aws.overview.unUsed"), value: self.unAllocatedRam }
                        ];
                        self.memoryUseChart.panels.pieType = "percent";
                        self.memoryUseChart.panels.colors = ["#1ABC9C", "#e5e5e5"];

                        function storageChartFunc(used, total) {
                            self.storageChart = new PiePanelDefault();
                            self.storageChart.panels.data = [
                                { name: $translate.instant("aws.overview.inUsed"), value: bytesToSize(used).a, valueB: bytesToSize(used).b },
                                { name: $translate.instant("aws.overview.unUsed"), value: bytesToSize(total - used).a, valueB: bytesToSize(total - used).b }
                            ];
                            self.storageChart.panels.colors = ["#1ABC9C", "#e5e5e5"];
                            self.storageChart.panels.pieType = "percent";
                        }

                        //ssd
                        /*if (localStorage.permission == "enterprise") { //企业版用的是ceph或存储
                            self.storageTotal = bytesToSize(self.hddTotal + self.ssdTotal); //GB
                            overviewSrv.getAllocatedQuatas({
                                name: "gigabytes",
                                type: "domain_quota"
                            }).then(function(res) {
                                if (res && res.data) {
                                    self.ssdValue = res.data.inUse; //GB
                                    let storageUsed = Number(self.ssdValue);
                                    let storageTotal = Number(self.hddTotal + self.ssdTotal);
                                    storageChartFunc(storageUsed, storageTotal);
                                }
                            });
                        }*/ 
                        if (localStorage.permission == "enterprise") { //企业版用的是ceph或存储
                            instancesSrv.getStorage().then(function(result){
                                if(result && result.data && angular.isArray(result.data)){
                                    if(localStorage.isCustom=='false'){
                                        self.showStorageType = result.data.length+1;
                                        let storageTotal = statisticsData && statisticsData.local_gb ? Number(statisticsData.local_gb) : 0; //标准版磁盘总量不乘超分
                                        let storageUsed = statisticsData && statisticsData.local_gb_used ? Number(statisticsData.local_gb_used) : 0;
                                        self.storageTotal = bytesToSize(storageTotal); //GB
                                        if(result.data.length<1){
                                            storageChartFunc(storageUsed, storageTotal);
                                        }else{
                                            self.storageAllocateChart = [];
                                            if (result && result.data) {
                                                self.storageAllocateChart.push({
                                                    domainName: $translate.instant("aws.overview.localdisk") ,
                                                    inUsed:  Number(storageUsed),
                                                    total: Number(storageTotal),
                                                    inUsedUnit:bytesToSize(storageUsed).b,
                                                    totalUnit:bytesToSize(storageTotal).b
                                                });
                                                _.map(_.sortBy(result.data, "fresh_allocated_capabilities").reverse(), function(item, i) {
                                                    if (i > 4) {
                                                        return;
                                                    }
                                                    var sdata = self.poolDataTranslate(item);;
                                                    self.storageAllocateChart.push({
                                                        domainName: item.disPlayName ,
                                                        inUsed:  Number(sdata[0]),
                                                        total: Number(sdata[1]),
                                                        inUsedUnit:bytesToSize(sdata[0]).b,
                                                        totalUnit:bytesToSize(sdata[1]).b
                                                    });
                                                });
                                            }
                                        }
                                    }else{
                                        if(result&&result.data&&result.data.length < 2 ){
                                            self.showStorageType = result.data.length;
                                            var sdata = self.poolDataTranslate(result.data[0]);
                                            if(sdata){
                                                self.storageTotal = bytesToSize(sdata[1]);
                                                let storageUsed = Number(sdata[0]);
                                                let storageTotal = Number(sdata[1]);
                                                storageChartFunc(storageUsed, storageTotal);
                                            }
                                        }else if(result&&result.data&&result.data.length >1 ){
                                            self.showStorageType = result.data.length;
                                            self.storageAllocateChart = [];
                                            if (result && result.data) {
                                                _.map(_.sortBy(result.data, "fresh_allocated_capabilities").reverse(), function(item, i) {
                                                    // if (i > 4) {
                                                    //     return;
                                                    // }
                                                    var sdata = self.poolDataTranslate(item);;
                                                    self.storageAllocateChart.push({
                                                        domainName: item.disPlayName ,
                                                        inUsed:  Number(sdata[0]),
                                                        total: Number(sdata[1]),
                                                        inUsedUnit:bytesToSize(sdata[0]).b,
                                                        totalUnit:bytesToSize(sdata[1]).b
                                                    });
                                                });
                                            }
                                            
                                        }
                                    }  
                                }
                            })
                        }else { //基础版是本地盘
                            let storageTotal = statisticsData && statisticsData.local_gb ? Number(statisticsData.local_gb) : 0; //标准版磁盘总量不乘超分
                            let storageUsed = statisticsData && statisticsData.local_gb_used ? Number(statisticsData.local_gb_used) : 0;
                            self.storageTotal = bytesToSize(storageTotal); //GB
                            storageChartFunc(storageUsed, storageTotal);
                        }
                    }
                });
            })
        }
    });

    overviewSrv.getUsageOfDomainQuotas({
        type: "domain_quota",
        name: "instances"
    }).then(function(result) {
        self.insResAllocateChart = [];
        if (result && result.data) {
            _.map(_.sortBy(result.data, "usage").reverse(), function(item, i) {
                if (i > 4) {
                    return;
                }
                self.insResAllocateChart.push({
                    domainName: item.domainName,
                    inUsed: Number(item.usage),
                    total: Number(item.total)
                });

            });
        }
    });

    /*overviewSrv.getNodes().then(function(result) {
        if (result && result.data) {
            return result.data;
        }
    }).then(function(data) {
        self.insRegistedInfo = [];
        if (data) {
            data = data.filter(item => item.status == 4 || item.status == 41)
            _.each(data, function(item) {
                overviewSrv.getNodeInsNum({ host: item.hostName }).then(function(result) {
                    if (result && result.data) {
                        self.insRegistedInfo.push({
                            phyInsName: item.hostName,
                            vmNum: result.data.total
                        });
                        self.insRegistedInfo = _.sortBy(self.insRegistedInfo, "vmNum").reverse();
                    }
                });
            });
        }
    });*/

    function formateTableData(item) {
        // "computeha": "高可用",
        // "planwork": "计划任务",
        // "hardware": "硬件故障",
        if (item.alarmType == "threshold") {
            item._alarmType = $translate.instant("aws.monitor.alarmModule.threshold");
        } else if (item.alarmType == "healthcheck") {
            item._alarmType = $translate.instant("aws.monitor.alarmModule.healthcheck");
        } else if (item.alarmType == "computeha") {
            item._alarmType = $translate.instant("aws.monitor.alarmModule.computeha");
        } else if (item.alarmType == "planwork") {
            item._alarmType = $translate.instant("aws.monitor.alarmModule.planwork");
        } else if (item.alarmType == "hardware") {
            item._alarmType = $translate.instant("aws.monitor.alarmModule.hardware");
        }

        if(item.severity == "critical"){
            item.severity_status="critical";
            item.severity = $translate.instant("aws.monitor.alarmModule.critical");
        }else if(item.severity == "moderate"){
            item.severity_status="moderate";
            item.severity = $translate.instant("aws.monitor.alarmModule.moderate");
        }else if(item.severity == "low"){
            item.severity_status="low";
            item.severity = $translate.instant("aws.monitor.alarmModule.low");
        }
    }

    alarmEventSrv.getNewAlarm({
        status: "new",
        enterpriseId: localStorage.enterpriseUid
    }).then(function(result) {
        self.newAlarms_data = [];
        if (result && result.data) {
            if (result.data.length > 5) {
                _.map(result.data, function(item, i) {
                    formateTableData(item);
                    if (i > 4) { return; }
                    self.newAlarms_data.push({
                        hostname: item.hostname,
                        _alarmType: item._alarmType,
                        alarmType: item.alarmType,
                        severity: item.severity,
                        severity_status:item.severity_status,
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
    });

    operatelogSrv.getoperateLogsData({
        pageNum: "1",
        pageSize: "5",
        businessName: "",
        dateStart: "",
        dateEnd: ""
    }).then(function(result) {
        if (result && result.data) {
            self.logsTable = _.map(result.data, function(item) {
                item.state = $translate.instant("aws.statusCode." + item.responseCode);
                item.createTime = new Date(item.createTime);
                return item;
            });
        }
    });

    ticketsrv.getNoSignList(enterpriseUid, userId).then(function(result) {
        self.workInfosTable = [];
        if (result && result.data) {
            if (result.data.length > 5) {
                _.map(result.data, function(item, i) {
                    if (i > 4) { return; }
                    self.workInfosTable.push(item);
                });
            } else {
                self.workInfosTable = result.data;
            }
        }
    });
    //awstack单机版
    self.gotoCvm = function(m, n, v, s) {
        if (s == "project") {
            $location.url("/permit/project");
        } else if (s == "instances") {
            $location.url("/cvm/instances");
        } else if (s == "alarmEvents") {
            $location.url("/monitor/alarmevent");
        } else if (s == "network") {
            $location.url("/cvm/networks");
        }
        localStorage.domainName = "default";
        localStorage.domainUid = v;
        localStorage.projectName = m;
        localStorage.projectUid = n;
    };

    function getProject() {
        depviewsrv.getProjectData(self.defaultDep.domainUid).then(function(data) {
            data ? self.loadData = true : "";
            if (data && data.data) {
                data.data.map(function(item) {
                    if (item.name == "admin") {
                        self.defaultPro = item;
                    }
                })
                successFunc(data.data);
            }
        });
    }

    function getDepartment() {
        departmentDataSrv.getDepart().then(function(result) {
            if (result && result.data) {
                result.data.map(function(item) {
                    if (item.name == "default") {
                        self.defaultDep = item;
                    }
                })
                if (localStorage.permission == "stand") {
                    self.defaultDep = result.data[0] //todo //暂时解决，当list列表里面有多个部门时，可能就挂了
                }
                getProject();
            }
        });
    }
}]);
singleModule.controller("ipCtrl", ["$scope", "$rootScope", "overviewSrv",
 function($scope, rootScope, overviewSrv) {
    var self = $scope;
    overviewSrv.getExternalNetworks().then(function(res) {
        if (res && res.data){
            self.netWorkType =[];
            res.data.forEach(function(item){
                var netItem = {"title":item.title,"inUsed":item.usedNetworkIpAvailability,"beAdded":1,"total":item.totalNetworkIpAvailability}
                self.netWorkType.push(netItem)
            })
        }
    })
}])