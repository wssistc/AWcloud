angular.module("mysqlsrv", [])
.service("mysqlSrv", function($rootScope, $http) {
    return {
        getList:function(){
            var data = {
                name:"mysqlsrv"
            }
            return data
        }
    };

});
