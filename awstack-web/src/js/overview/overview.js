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

var overviewModule = angular.module("viewModules", ["ngTable", "ngAnimate", "ui.bootstrap", "overviewSrvModule", "depviewsrv", "ngSanitize", "operatelogSrv", "alarmEventSrvModule", "peojectsrv", "networksSrvModule","instancesSrv","recycleSrvModule"]);
overviewModule.controller("viewCtrl", ["$scope", "$rootScope", "$uibModal", "$location", "checkedSrv", "NgTableParams", "overviewSrv", "depviewsrv", "$translate", "operatelogSrv", "departmentDataSrv", "alarmEventSrv", "ticketsrv", "projectDataSrv",
 "$route", "GLOBAL_CONFIG", "networksSrv","instancesSrv","recycleSrv", "vmFuncSrv","alertSrv","$timeout","localInit",
 function($scope, rootScope, $uibModal, $location, checkedSrv, NgTableParams, overviewSrv, depviewsrv, $translate, operatelogSrv, 
    departmentDataSrv, alarmEventSrv, ticketsrv, projectDataSrv, $route, GLOBAL_CONFIG, networksSrv,instancesSrv,
    recycleSrv,vmFuncSrv,alertSrv,$timeout,localInit) {
    var self = $scope;
    self = vmFuncSrv.storageFunc(self,instancesSrv);
    localStorage.vmware_flag=1;
    var enterpriseUid = localStorage.enterpriseUid ? localStorage.enterpriseUid : "";
    var userId = localStorage.$USERID ? localStorage.$USERID : "";
    rootScope.vmwareLoadding = false;
    //localStorage.$QCLOUD_AUTH_TOKEN = qcloudUid?qcloudUid:"";
    //rootScope.qcloudUrl = qcloudUid ? "/qcloud/#/?token=" + qcloudUid : '';
    //rootScope.vmwareUrl = "/vmware/#/?url=datacenter&token=" + localStorage.$AUTH_TOKEN;
    self.userName = localStorage.userName;

    /*数据中心切换*/
    self.intoSingle = function(item){
        //rootScope.vmwareLoadding = true;
        var data ={
            regionKey:item.regionKey
        }
        overviewSrv.changeRegion(data).then(function(res){
            if(res&&res.data&&res.data.token){
                var result = {
                    data:angular.copy(res)
                };
                //localStorage.$AUTH_TOKEN =  res.data.token;
                //localStorage.regionName = item.regionName;  
                //localStorage.regionKey = item.regionKey;
                localInit.localstorageInit(result,self);
                rootScope.services = {
                    "backups":localStorage.backupsService,
                    "cinder":localStorage.cinderService,
                    "ceph":localStorage.cephService
                }
                $location.path('/single')
            }
        }).finally(function(){
            //rootScope.vmwareLoadding = false;
        }) 
    }

    function getChartData(data,unit){
        
        var chartData= {
                "colors": ["#1abc9c","#51a3ff","#e67f23","#b6a2dd"],
                "width": 550,
                "height": 220,
                "margin": {
                    "left": 60,
                    "right": 15,
                    "top": 15,
                    "bottom": 30
                },
                "unit": unit,
                "data":data,
                "title": "",
                "subTitle": "",
                "priority": "a1",
                "legend": true,
                "xAxisType":"date",
                "chart": "netcard"
            }
        return chartData;
    }

    self.overViewData = {
        colors: ["#1abc9c","#51a3ff","#e67f23","#b6a2dd"],
        totalCpu:[],
        totalSto:[],
        totalMem:[],
        totalIp:[],
        regionDetailData:"",
        RegionVm:"",
        RegionVmTotal:"",
        RegionPhy:"",

    }


    function handleChartData(title,chartData,unit,ints){
        var xAxis = [];
        var series = [];
        for(var i=1;i<chartData.columns.length;i++){
            var centername = chartData.columns[i];
            var seriesItem = {
                name :centername,
                type:'line',
                areaStyle: {normal: {}},
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

    function getTotalRes(){
        /*超分比*/
        overviewSrv.getalloData().then(function(res){
            if(res&&res.data){
                var allocata = res.data;
                overviewSrv.getCpuMemData().then(function(val){
                    self.overViewData.totalCpu = [];
                    self.overViewData.totalMem = [];
                    if(val&&val.data){
                        for(var i in val.data){
                            if(val.data[i]){
                                var cpuDetail={
                                    name:i,
                                    total:val.data[i].vcpus*allocata[i].cpu_allocation_ratio,
                                    used :val.data[i].vcpus_used*1,
                                    free:val.data[i].vcpus*allocata[i].cpu_allocation_ratio-val.data[i].vcpus_used*1
                                }
                                self.overViewData.totalCpu.push(cpuDetail)
                                var totalMem = (val.data[i].memory_mb*allocata[i].ram_allocation_ratio/1024).toFixed(2);
                                var usedMem = ((Number(val.data[i].memory_mb_used)-Number(val.data[i].reserved_host_memory_mb))/1024).toFixed(2);
                                var memDetail={
                                    name:i,
                                    unit:"GB",
                                    total:totalMem,
                                    used :usedMem,
                                    free:totalMem - usedMem 
                                }
                                self.overViewData.totalMem.push(memDetail)
                            }else{

                                var cpuErrorDetail={
                                    name:i,
                                    tips:$translate.instant("aws.overview.getdatafail")
                                }
                                self.overViewData.totalCpu.push(cpuErrorDetail)
                                self.overViewData.totalMem.push(cpuErrorDetail)
                            }
                        }
                        /*CPU百分比*/
                        overviewSrv.getCpuFold().then(function(res){
                            if(res&&res.data){
                                var columns = res.data.columns;
                                var values = res.data.values;
                                for(var k=1;k<columns.length;k++){
                                    var regionNamea = columns[k];
                                    var totalData = self.overViewData.totalCpu.filter(e=>{
                                        return e.name == regionNamea;
                                    })
                                    // for (var h = 0; h < values.length; h++){
                                    //     if(res.data.values[h][k]){
                                    //         res.data.values[h][k] = totalData[0].total&&totalData[0].total!=0?((res.data.values[h][k])/totalData[0].total)*100:0
                                    //     }
                                    // }
                                }
                                self.piesCpu = handleChartData('',res.data,"");

                            }
                        })
                        /*内存百分比*/
                        overviewSrv.getMenFold().then(function(res){
                            //var memHistory = [];
                            if(res&&res.data){
                                var columns = res.data.columns;
                                var values = res.data.values;
                                for(var k=1;k<columns.length;k++){
                                    var regionNamea = columns[k];
                                    var totalData = self.overViewData.totalMem.filter(e=>{
                                        return e.name == regionNamea;
                                    })
                                    for (var h = 0; h < values.length; h++){
                                        if(res.data.values[h][k]){
                                            res.data.values[h][k] = parseInt(res.data.values[h][k]/1024);    
                                            //res.data.values[h][k] = totalData[0].total&&totalData[0].total!=0?((res.data.values[h][k])/totalData[0].total)*100:0
                                        }
                                    }
                                }
                                //memHistory.push(res.data);
                                self.piesMem = handleChartData('',res.data,"");
                            }
                        })
                    }
                })
               
            }
        })

        /*存储*/
        overviewSrv.getStoData().then(function(res){
            self.overViewData.totalSto = [];
            if(res&&res.data){
                for(var i in res.data){
                    if(res.data[i]){
                        var stoDetail={
                            name:i,
                            unit:"GB",
                            total:(res.data[i].total_capacity_gb).toFixed(2),
                            used :(res.data[i].allocated_capacity_gb).toFixed(2),
                            free:(Number(res.data[i].total_capacity_gb)-Number(res.data[i].allocated_capacity_gb)).toFixed(2)
                        }
                        self.overViewData.totalSto.push(stoDetail)
                    }else{
                        var stoDetail={
                            name:i,
                            tips:$translate.instant("aws.overview.getdatafail")
                        }
                        self.overViewData.totalSto.push(stoDetail) 
                    }
                }
                overviewSrv.getStoFold().then(function(res){
                    //var stoHistory = [];
                    if(res&&res.data){
                        var columns = res.data.columns;
                        var values = res.data.values;
                        for(var k=1;k<columns.length;k++){
                            var regionNamea = columns[k];
                            var totalData = self.overViewData.totalSto.filter(e=>{
                                return e.name == regionNamea;
                            })
                            // for (var h = 0; h < values.length; h++){
                            //     if(res.data.values[h][k]){
                            //         res.data.values[h][k] = totalData[0].total&&totalData[0].total!=0?((res.data.values[h][k])/totalData[0].total)*100:0
                            //     }
                            // }
                        }
                        //stoHistory.push(res.data);
                        self.piesStorage = handleChartData('',res.data,"");
                    }
                })

            }
        })
        /*公网Ip*/
        overviewSrv.getIpData().then(function(res){
            self.overViewData.totalIp=[];
            if(res&&res.data){
                for(var i in res.data){
                    if(res.data[i]){
                        var ipDetail={
                            name:i,
                            unit:$translate.instant("aws.overview.individual"),
                            total:res.data[i].totalNetworkIpAvailability,
                            used :res.data[i].usedNetworkIpAvailability,
                            free:res.data[i].networkIpAvailability
                        }
                        self.overViewData.totalIp.push(ipDetail)
                    }else{
                        var ipDetail={
                            name:i,
                            tips:$translate.instant("aws.overview.getdatafail")
                        }
                        self.overViewData.totalIp.push(ipDetail) 
                    }
                }
                overviewSrv.getNetFold().then(function(res){
                    //var ipHistory = [];
                    if(res&&res.data){
                        var columns = res.data.columns;
                        var values = res.data.values;
                        for(var k=1;k<columns.length;k++){
                            var regionNamea = columns[k];
                            var totalData = self.overViewData.totalIp.filter(e=>{
                                return e.name == regionNamea;
                            })
                            // for (var h = 0; h < values.length; h++){
                            //     if(res.data.values[h][k]){
                            //         res.data.values[h][k] =totalData[0].total&&totalData[0].total!=0?((res.data.values[h][k])/totalData[0].total)*100:0
                            //     }
                            // }
                        }
                        //ipHistory.push(res.data);
                        self.piesIp =  handleChartData('',res.data,"");
                    }
                })


            }
        })
    }
    getTotalRes();
    /*折线图*/
    overviewSrv.getRegionStatus().then(function(res) {
        if (res && res.data) {
            self.overViewData.regionDetailData = res.data;
        }
    });

    overviewSrv.getRegionVm().then(function(res) {
        if (res && res.data) {
            var vmerrorData = [];
            self.vmnormalData = [];
            self.overViewData.RegionVm =[];
            self.overViewData.RegionVmTotal =0;
            for(var i in res.data){
                if(res.data[i]){
                    res.data[i].name= i;
                    res.data[i].value= res.data[i].total;
                    res.data[i].type= true;
                    self.vmnormalData.push(res.data[i]);
                    self.overViewData.RegionVm.push(res.data[i]);
                    self.overViewData.RegionVmTotal+= res.data[i].total;
                }else{
                    res.data[i] = {}
                    res.data[i].type = false;
                    res.data[i].regionName = i;
                    res.data[i].tips = $translate.instant("aws.overview.getdatafail");
                    vmerrorData.push(res.data[i]);
                }
            }
            self.overViewData.RegionVm.push.apply(self.overViewData.RegionVm,vmerrorData)
            self.panels = {
                "colors":[
                    "#1abc9c",
                    "#51a3ff",
                    "#1bbc9d",
                    "#b6a2dd",
                    "#e67f23",
                    "#c0392b",
                    "#ff754a"
                ],
                "type":"pie",
                "width":200,
                "height":200,
                "outerRadius":75,
                "innerRadius":20,
                "data":self.vmnormalData,
                "title":"",
                "id":"",
                "pieType":"category",
                "progressRate":true
            }
        }
    });

    overviewSrv.getRegionPhy().then(function(res) {
        if (res && res.data) {            
            let errorData = [];
            self.overViewData.RegionPhy =[];
            for(var i in res.data){
                if(res.data[i]){
                    res.data[i].regionName= res.data[i].ironic.regionName;
                    res.data[i].type= true;
                    res.data[i].regionKey = res.data[i].ironic.regionKey; 
                    self.overViewData.RegionPhy.push(res.data[i]);
                }else{
                    res.data[i] = {}
                    res.data[i].type = false;
                    res.data[i].regionName = i;
                    res.data[i].tips = $translate.instant("aws.overview.getdatafail");
                    errorData.push(res.data[i]);
                }
            }

            self.changeReg = function(v){
                self.regionNetworks ={
                    'cluster':"",
                    "storage":"",
                    "tenant":"",
                    "floating":""
                }
                
                function filterList(type){
                    var net = v.userList.filter(i=>{
                        i = JSON.parse(i);
                        return i.name == type;
                    })
                    self.regionNetworks[type] = JSON.parse(net[0]).cidr;
                }
                
                if(v.ironic&&v.userList){
                    filterList('cluster')
                    filterList('storage')
                    filterList('tenant')
                    filterList('floating')
                    self.regionNodes = v.ironic.nodes; 
                    //console.log(self.regionNodes)
                }else{
                    self.regionNodes = [];
                }
            }

            self.changeReg(self.overViewData.RegionPhy[0])
        }
    });
}]);