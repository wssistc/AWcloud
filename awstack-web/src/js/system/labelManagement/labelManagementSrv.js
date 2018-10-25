var tableService = angular.module("labelApi", []);
tableService.service("labelSrv", function($rootScope, $http) {
    var static_url = "awstack-resource/v1";
    var static_quota_url = "awstack-user/v1";
    return {
        getlabel: function() {
            return $http({
                method: "GET",
                url: ""
            });
        },
        dellabel: function(data) {
            return $http({
                method: "DELETE",
                url: "",
                params:data
            });
        },
        createlabel:function(data){
            return $http({
                method: "POST",
                url: "",
                data:data
            });
        }
    }
})