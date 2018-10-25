var tableService = angular.module("elasticExpansionSrvModule", []);
tableService.service("elasticExpansionSrv", function($rootScope, $http) {
    var static_url = "/awstack-resource/v1";
    return {
       getPortList:function(){
            return $http({
                method: "GET",
                url: static_url + "/ports"
            });
       }      
    };
});
