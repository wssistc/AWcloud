
export function dataCenterSrv($http){
    var static_url = "awstack-vmware/v1/"
    return {
        getDatacenterList: function() {
            return $http({
                method: "get",
                url: static_url + "datacenters"
            });
        },
        testSrv:function(){
        	return ["testaaaaaaaaa"];
        },
        login:function(){
            return $http({
                method:"get",
                url:static_url+"enterprises/"+localStorage.enterpriseUid+ "/login"
            });
        },
        logins:function(data){
            return $http({
                method:"post",
                url:static_url+"vcenter/login",
                data:data
            });
        },
        getDictDataByEidAndDid: function() {
            return $http({
                method: "get",
                url: "awstack-user/v1/params",
                params:{
                    parentId:3,
                    enterpriseUid:localStorage.enterpriseUid,
                    regionUid:angular.fromJson(localStorage.$LOGINDATA).regionUid
                }

            });
        }
    };


}

dataCenterSrv.$inject = ["$http"];