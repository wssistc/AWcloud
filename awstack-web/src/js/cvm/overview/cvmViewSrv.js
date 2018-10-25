var tableService = angular.module("cvmViewSrv", []);
tableService.service("cvmViewSrv", function($rootScope, $http, backendSrv){
    return {
        getServersCount: function() {
            return backendSrv.get("/awstack-resource/v1/serverscount");
        },
        getResCont: function(options) {
            return backendSrv.get("/awstack-resource/v1/"+options);
        },
        getproQuotas: function(options) {
            return backendSrv.get("awstack-user/v1/quotas","", options);
        },
        getProused: function(options) {
            return backendSrv.get("awstack-user/v1/quotas_Usages","", options);
        },
        updateProused: function(options) {
            return backendSrv.put("awstack-user/v1/updateQuotasUsages", options);
        },
        //查询project中的用户
        getProUserTableData: function(options) {
            return backendSrv.get("awstack-user/v1/project/"+options+"/users");
        }
        
    };
});
