
var lisenceSrvModule = angular.module("licenseSrvModule",[]);

lisenceSrvModule.service("licenseSrv",["$http",function($http){
    return {
        getLicense:function(){
            return $http({
                    method:"GET",
                    url:"awstack-user/v1/license/" + localStorage.regionKey
            });
            
        }
    };
}]);