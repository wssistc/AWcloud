import "./memcachedSrv";
import { AreaPanelDefault } from "../../chartpanel";
import { memcachedAreaChartDefault } from "../../chartpanel";

var memcachedModule = angular.module("memcachedModule", ["ngTable","ngAnimate", "ui.bootstrap","ngSanitize","memcachedSrv","usersrv"]);
memcachedModule.controller("memcachedCtrl",["$scope", "$rootScope","NgTableParams","$translate","memcachedSrv" ,"userDataSrv",
function($scope, $rootScope,NgTableParams,$translate,memcachedSrv,userDataSrv) {
    var self = $scope;

    function memcachedBasicInfoFunc(regionKey){
        self.rabbitmqBasicInfo = {};
        memcachedSrv.getMemcachedBasicInfo(regionKey).then(function(res){
            if(res && res.data){
                self.rabbitmqBasicInfo.nodeName = res.data[0].hostName;
                self.rabbitmqBasicInfo.keyTotal = res.data[0].curr_items;
            }
        })
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
        memcachedSrv.sqlQuery(
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
        })
    }

    function memcachedChart(){
        self.panels = {};
        var areaChartPermas = new memcachedAreaChartDefault(); 
        var count = 0;
        for(let key in areaChartPermas.chartSqls){
            self.panels[key] = [];
            count++;
            _.each(areaChartPermas.chartSqls[key],function(item){
                panelsDataFunc(item,key,count);
            }) 
        }
    }

    userDataSrv.getRegionData().then(function(res) {
        if (res && res.data && res.data[0] && res.data[0].regionKey) { 
            res.data = res.data.filter(item => {
                return item.status == 3;
            });
            self.region_key = res.data[0].regionKey;
            _.each(res.data, item => {
                if (item.regionKey == localStorage.regionKey) {
                    self.region_key = item.regionKey;
                }
            });
            memcachedBasicInfoFunc(self.region_key);
        }    
    });
    memcachedChart();
   
}]);

