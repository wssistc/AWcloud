var alaudaService = angular.module("alaudaSrv", []);
alaudaService.service("alaudaSrv", function($rootScope, $http) {
    var static_url="awstack-user/v1/";
    return {
        getTBase: function() {
            return $http({
                method: "get",
                url: static_url + "/paas/login/simulate?paasType=TBase"
            });
        },
        getCOC: function() {
            return $http({
                method: "get",
                url: static_url + "/paas/login/simulate?paasType=zhiyun"
            });
        },
        checkToken:function(){
            return $http({
                method:'GET',
                url:'awstack-user/back/v1/check/user/token'
            })
        }
    }
})