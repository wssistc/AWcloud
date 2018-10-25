var consumeSrvModule = angular.module("consumeSrvModule",[]);
consumeSrvModule.service("consumeViewSrv",["$http",function($http){
    return {
        getEnterpriseCnsData:function(options){
            return $http({
                methed:"GET",
                url:"awcloud-boss/resouce/amountOfEnterprise",
                params:options
            });
        },
        getConsumptionDetails:function(options){
            return $http({
                methed:"GET",
                url:"awcloud-boss/resouce/consumptionDetails",
                params:options
            });
        },
        getEnterprises:function(){
            return $http({
                methed:"GET",
                url:"awcloud-boss/enterprise/enterpriseInfos",
            });
        },
        getDomains:function(options){
            return $http({
                methed:"GET",
                url:"awcloud-boss/enterprise/domainInfos",
                params:options
            });
        },
        getProjects:function(options){
            return $http({
                methed:"GET",
                url:"awcloud-boss/enterprise/projectInfos",
                params:options
            });
        },
        getRegions:function(options){
            return $http({
                methed:"GET",
                url:"awcloud-boss/enterprise/regionInfos",
                params:options
            });
        },
        getConsumeExcel:function(options){
            return $http({
                methed:"GET",
                url:"awcloud-boss/resouce/exportConsumption",
                params:options
            });
        },
        getResourceAmount:function(options){
            return $http({
                methed:"GET",
                url:"awcloud-boss/resouce/resamountOfTenant",
                params:options
            });
        },
        getUsers:function(options){
            return $http({
                methed:"GET",
                url:"awcloud-boss/resouce/getUserName",
                params:options
            })
        },
        getResamountPerTime:function(options){
            return $http({
                methed:"GET",
                url:"awcloud-boss/resouce/resamountPerTime",
                params:options
            });
        },
        consumeViewChartDefault: function() {
            this.chartSqls = {
                consume: [{
                    chartPerm: { "title": "近半年的消费统计", "unit": "", "priority": "a0" }
                }]
            }
        }
    };
}]);
