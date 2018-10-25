import * as physicalConductorSrv from "../../physicalConductor/services/"
import "../../../monitor/resource/phyHostSrv";
import "../../../user/userDataSrv";
import { tubephyAreaChartDefault } from "../../../chartpanel";
import { AreaPanelDefault } from "../../../chartpanel";


export function physicalConductorMonitorCtrl($scope,$rootScope,$location,checkedSrv,physicalConductorSrv,
	NgTableParams,$uibModal,$translate,$window,$timeout,userDataSrv,$routeParams,phyhostSrv){
	var self = $scope;
    var memChartListener,diskChartListener,netcardChartListener;
	self.queryLimit = {};
	self.zonehosts = {};
    self.getNum=false;

    function getZone() {
        self.zonetypes = {
            options:[]
		};
		physicalConductorSrv.getPvmList().then(function(res){
			if(res && res.data && angular.isArray(res.data)){
				res.data.map(item => {
					item.nodeUid = item.nodeId;
					item.hostName = item.nodeName
				})
				self.zonehosts.options = res.data;
				self.queryLimit.selectedZonehost = res.data[0];
				self.queryLimit.selectedZonetype = {};
				self.queryLimit.selectedZonetype.regionKey = localStorage.regionKey;
				renderHostInfo(self.queryLimit);
			}
			
			
		})
    }

    //phyhost详情
    function renderHostInfo(queryLimit){
        window.localStorage.queryLimit = JSON.stringify(queryLimit); 
        self.diskPathUsageData = [];
        var diskTotal = 0 ,diskUsageTotal = 0,diskTotals = 0 ,diskUsageTotals = 0;
        self.diskTotal = 0;
        self.diskUsageTotal = 0;
        self.diskTotals = 0;
        self.diskUsageTotals = 0;
        getPhyAreaChart(queryLimit.selectedZonehost.nodeUid,queryLimit.timeRange);

    }

    function panelsDataFunc(item,key,color){
        self.panels[key] = (self.panels[key]).slice((self.panels[key]).length,0);
        var areaChart = new AreaPanelDefault();
        areaChart.panels.title = $translate.instant("aws.monitor."+item.chartPerm.title);
        areaChart.panels.unit = item.chartPerm.unit;
        areaChart.panels.priority = item.chartPerm.priority;
        if(color%2 == 0){
            areaChart.panels.colors = ["#51a3ff"];
        }else{
             areaChart.panels.colors = ["#1bbc9d"];
        }
        phyhostSrv.sqlQuery(
            item.sqlPerm
        ).then(function(res){
            if(res && res.data && res.data.results && res.data.results[0] && res.data.results[0].series) {
                areaChart.panels.data.push(res.data.results[0].series[0]);
            }else{
                var defaultChartData = {
                    "columns":["time",item.chartPerm.title],
                    "values":[
                        [moment().subtract(30,"m"),0],
                        [moment(),0]
                    ],
                    "default":true
                };
                areaChart.panels.data.push(defaultChartData);

            }
            self.panels[key].push(areaChart.panels);
            $rootScope.loading = true;
        })
    }
    
    function getPhyAreaChart(phy_id,timeRange){
        self.panels = {};
        if(memChartListener){memChartListener();}
        if(diskChartListener){diskChartListener();}
        if(netcardChartListener){netcardChartListener();}
        $rootScope.lazyOnType = {
            "disk":true,
            "netcard":true
        };
        $rootScope.loading = true;
        self.scrtop = 0;

        var phyChartPermas = new tubephyAreaChartDefault(phy_id,timeRange);
        for(let key in phyChartPermas.chartSqls){
            self.panels[key] = [];
            if(key=="cpu"){
                _.each(phyChartPermas.chartSqls.cpu,function(item){
                    panelsDataFunc(item,"cpu","1");
                })
            }
        }

        // memChartListener = self.$on("mem",function(e){
        //     $rootScope.loading = false;
            
        //     memChartListener(); 
        // });
        _.each(phyChartPermas.chartSqls.mem,function(item){
            panelsDataFunc(item,"mem","2");
        }) 
        
        diskChartListener = self.$on("disk",function(e){
            $rootScope.loading = false;
            self.diskPath = {options:[]};
            self.queryLimit.selectedDiskpath = "";
            self.diskio = {options:[]};
            self.queryLimit.selectedDiskio = "";
            phyhostSrv.getDiskPartition(self.queryLimit.selectedZonetype.regionKey, self.queryLimit.selectedZonehost.nodeUid).then(function(res){
                $rootScope.loading = true;
                if (res && res.data) {
                    self.diskPath.options = self.diskPath.options.slice(self.diskPath.options.lenght,0);
                    _.each(res.data,function(item){
                        self.diskPath.options.push(item.path);
                    })
                    self.diskPath.options = self.diskPath.options.filter(function(item){
                        if(item.indexOf("awstack") < 0){
                            return item;
                        }
                    })
                    self.queryLimit.diskPath = self.diskPath.options;
                    self.queryLimit.selectedDiskpath = self.diskPath.options[0];

                    function diskPathFunc(selectedDiskpath){
                        var diskPathChartPermas = (new tubephyAreaChartDefault(phy_id,timeRange,selectedDiskpath)).chartSqls.diskPath[0];
                        panelsDataFunc(diskPathChartPermas,"diskPath","3");
                    };
                    diskPathFunc(self.queryLimit.selectedDiskpath);
                    
                    self.changeDiskpath = function(diskPath){
                        self.panels.diskPath = self.panels.diskPath.slice(self.panels.diskPath.length,0);
                        diskPathFunc(diskPath);
                    };
                }
            });

            phyhostSrv.sqlQuery({
                "sql": "show tag values from diskio with key=\"name\" where node_id= '" + self.queryLimit.selectedZonehost.nodeUid + "' "
            }).then(function(res){
                $rootScope.loading = true;
                if (res && res.data && res.data.results && res.data.results[0] && res.data.results[0].series) {
                    self.diskio.options = self.diskio.options.slice(self.diskio.options.lenght, 0);
                    _.each(res.data.results[0].series[0].values,function(item){
                        self.diskio.options.push(item[1]);
                    })
                    self.queryLimit.selectedDiskio = self.diskio.options[0];

                    function diskioChartFunc(selectedDiskio){
                        var diskioChartPermas = new tubephyAreaChartDefault(phy_id,timeRange,selectedDiskio);
                        _.each(diskioChartPermas.chartSqls.diskio,function(item){
                            panelsDataFunc(item,"diskio","3");
                        });
                    };
                    diskioChartFunc(self.queryLimit.selectedDiskio);

                    self.changeDiskio = function(diskio){
                        self.panels.diskio = self.panels.diskio.slice(self.panels.diskio.length,0);
                        diskioChartFunc(diskio);
                    };
                }
            })
            diskChartListener();
        });

        netcardChartListener = self.$on("netcard",function(e){
            $rootScope.loading = false;
            self.netCard = {
                options:[]
            };
            self.queryLimit.selectedNetCard = "";
            phyhostSrv.sqlQuery({
                "sql": "show tag values from net with key=\"interface\" where node_id= '" + self.queryLimit.selectedZonehost.nodeUid + "' "
            }).then(function(res){
                $rootScope.loading = true;
                if (res && res.data && res.data.results && res.data.results[0] && res.data.results[0].series) {
                    self.netCard.options = self.netCard.options.slice(self.netCard.options.lenght,0);
                    _.each((res.data.results[0].series[0].values).filter(function(val){
                        return val[1] != "all";
                    }),function(item){
                        self.netCard.options.push(item[1]);
                    })
                    self.queryLimit.selectedNetCard = self.netCard.options[0];
                    function netcardChartFunc(selectedNetCard){
                        var netcardChartPermas = new tubephyAreaChartDefault(phy_id,timeRange,selectedNetCard);
                        _.each(netcardChartPermas.chartSqls.netcard,function(item){
                            panelsDataFunc(item,"netcard","4");
                        });
                    };
                    netcardChartFunc(self.queryLimit.selectedNetCard);

                    self.changeNetCard = function(netcard){
                        self.panels.netcard = self.panels.netcard.slice(self.panels.netcard.length,0);
                        netcardChartFunc(netcard);
                    };
                }
            })
            netcardChartListener();
        });
    }

    function clearSvgContent(){
        for(let key in self.panels){
            _.each(self.panels[key],function(item,i){
                if(key !="cpu"){
                    $("#"+key+i).html("");
                }
            });
        }
    }

    self.changeHost = function(){
        clearSvgContent();
        renderHostInfo(self.queryLimit);
        self.clickMore = false;
        self.moreIp = false;
    };

    self.changeRegion = function(selectedzone){
        self.zonehosts.options = self.zonehosts.options.splice(self.zonehosts.options.length,0);
        self.queryLimit.selectedZonetype = selectedzone;
        getPhyHost(self.queryLimit.selectedZonetype.regionUid);
    };

    self.$watch(function () {
        return $routeParams.id;
    }, function (value) {
        $scope.animation = value ? "animateIn" : "animateOut";
        if (value) {
            $scope.$broadcast("processDetail", value);
        }
    });

    self.$watch(function(){
        return $rootScope.clickedHostInfo
    },function(hostItem){
        if(hostItem){
            getZone();
        }else{
            getZone();
            // getPhyHost();
        }
    });
   
}


let ctrlList = [physicalConductorMonitorCtrl];
angular.forEach(ctrlList,function(item){
	item.$inject = ["$scope","$rootScope","$location","checkedSrv","physicalConductorSrv",
	"NgTableParams","$uibModal","$translate","$window","$timeout","userDataSrv","$routeParams","phyhostSrv"];
});
