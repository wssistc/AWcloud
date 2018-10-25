tdsqlSrv.inject = ["$rootScope", "$http"]
function tdsqlSrv($rootScope, $http) {
    var static_url="awstack-user/back/v1/";
    return {
        getTBase: function() {
            return $http({
                method: "get",
                url: static_url + "/paas/login/simulate?paasType=TBase"
            });
        },
        getAccount:function() {
        	var opt={"groupid":"group_1539864169_83199"};
            return $http({
                method: "post",
                url: static_url + "tdsql/tdsql_99454041/listuser",
                data:opt
            });
        },
        createAccountConfirm:function(opt){
            return $http({
                method: "post",
                url: static_url + "tdsql/tdsql_99454041/adduser",
                data:opt
            });
        },
        copyAccountConfirm:function(opt){
        	return $http({
                method: "post",
                url: static_url + "tdsql/tdsql_99454041/cloneaccount",
                data:opt
            });
        },
        resetPwd:function(opt){
        	return $http({
                method: "post",
                url: static_url + "tdsql/tdsql_99454041/resetpwd",
                data:opt
            });
        },
        delAccount:function(opt){
        	return $http({
                method: "post",
                url: static_url + "tdsql/tdsql_99454041/deluser",
                data:opt
            });
        }
    }
}
export {tdsqlSrv}