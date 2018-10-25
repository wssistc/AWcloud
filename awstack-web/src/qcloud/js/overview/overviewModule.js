import "./overviewSrv";
import {PiePanelDefault} from "../chartpanel";
angular.module("overviewModule", ["overviewsrv"])
	.controller("overviewCtrl", ["$scope", "$rootScope","overviewSrv","NgTableParams","$translate",function($scope, $rootScope,overviewSrv,NgTableParams,$translate){
		var self = $scope;
        self.showAllVm=false;
        self.showNormalVm=false;
		self.data = overviewSrv.getList();
        //获取云主机状态
        var data={
            params:{
                Region:"bj"
            }
        }
        overviewSrv.getVmStatus(data).then(function(result){
            if(result.code==0){
                if(result.data.totalNum==result.data.normalNum){
                    self.showAllVm=true;
                    self.vmChart = new PiePanelDefault();
                    self.vmChart.panels.data = [
                        {name:'正常状态的vm',value:result.data.normalNum},
                        //{name:'虚拟机总量',value:result.data.totalNum}
                    ];
                    self.vmChart.panels.centerValue="正常";
                    self.vm={};
                    self.vm.vmTotal=result.data.totalNum;
                    self.vm.vmNormal=result.data.normalNum;
                    self.vmChart.panels.pieType = "category";
                    self.vmChart.panels.colors = ["#1ABC9C","#e5e5e5"];
                }
                if(result.data.totalNum>result.data.normalNum){
                    self.showNormalVm=true;
                    self.vmChart = new PiePanelDefault();
                    self.vmChart.panels.data = [
                        {name:'待续费云服务器',value:result.data.toRenewNum},
                        {name:'虚拟机总量',value:result.data.totalNum}
                    ];
                    self.vmChart.panels.datalist = [
                        {name:'待续费云服务器',value:result.data.toRenewNum},
                        {name:'正常云服务器',value:result.data.normalNum}
                    ];
                    self.vmChart.panels.centerValue="您共有"+result.data.totalNum+"台服务器";
                    self.vm={};
                    self.vm.vmTotal=result.data.totalNum;
                    self.vm.vmNormal=result.data.normalNum;
                    self.vmChart.panels.pieType = "percent";
                    self.vmChart.panels.colors = ["#1ABC9C","#e5e5e5"];
                    /*result.data.toRenewList.push({
                        uInstanceId:"ins-iiz4m498",
                        alias:"未命名3",
                        regionId:"广州"
                    })*/
                    /*self.showNormalVm=true;
                    self.vmChart = new PiePanelDefault();
                    self.vmChart.panels.data = [
                        {name:'待续费云服务器',value:2},
                        {name:'虚拟机总量',value:10}
                    ];
                    self.vmChart.panels.datalist = [
                        {name:'待续费云服务器',value:2},
                        {name:'正常云服务器',value:8}
                    ];
                    self.vmChart.panels.centerValue=10+"台";
                    self.vm={};
                    self.vm.vmTotal=10;
                    self.vm.vmNormal=8;
                    self.vmChart.panels.pieType = "percent";
                    self.vmChart.panels.colors = ["#1ABC9C","#e5e5e5"];
                    result.data.toRenewList.push({
                        uInstanceId:"ins-iiz4m498",
                        alias:"未命名3",
                        regionId:"广州"
                    })*/
                    self.vmTable = new NgTableParams({ count: 10 }, { counts: [], dataset: result.data.toRenewList });
                }
            }
        });
        // 获取资源配额以及使用量
        self.regionList=[];
        var asd=[
            {"id":4,"value":[{"name":"image","detail":{"quota":10,"usage":4}},{"name":"prepay","detail":{"quota":10,"usage":4}}]},
            {"id":3,"value":[{"name":"image","detail":{"quota":10,"usage":4}},{"name":"prepay","detail":{"quota":10,"usage":4}}]}
        ]
        
        overviewSrv.getQuotaOverview(data).then(function(result){
            if(result.code==0){
                _.forEach(result.data,function(item){
                    item.quotaBarData=[]
                    _.forEach(item.value,function(quota){
                        if(quota.name==="prepay"){
                            quota.message="云服务器包年包月配额为每月固定数额，仅计算当月该可用区新购云服务器台数。";
                        }
                        if(quota.name==="quoties"){
                            quota.message="云服务器按量计算配额为用户固定配额，计算该可用区云服务器总台数。"
                        }
                        if(quota.name==="snap"){
                            quota.message="目前快照功能处于免费试用期，最多可创建(云硬盘数*7)个快照"
                        }
                        var obj={
                            domainName:$translate.instant("CN.overview.quota."+quota.name),
                            inUsed:quota.detail.usage,
                            total:quota.detail.quota,
                            message:quota.message
                        }
                        if(quota.detail.zoneId){
                            obj.zoneId=quota.detail.zoneId;
                        }
                        item.quotaBarData.push(obj)
                    })
                    self.regionList.push({"id":item.id,"value":item.quotaBarData})
                })
            }
        })
	}])
    .controller("welcomeCtrl", ["$scope","$location","$rootScope","overviewSrv",function($scope,$location, rootScope,overviewSrv){
        var self = $scope;
        overviewSrv.getQcloudToken().then(function(res){
            if(res&&res.data){
                localStorage.$AUTH_TOKENS = res.data.data;
                localStorage.$QCLOUD_AUTH_TOKEN = res.data.data;
                $location.path($location.search().jumpRoute)
            }
        })
    }])
