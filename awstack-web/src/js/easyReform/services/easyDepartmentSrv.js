
export function easyDepartmentSrv($http){
    var static_quota_url = "awstack-user/v1";
    return {
        getDepart: function() {
            return $http({
                method: "get",
                url: "awstack-user/v1/enterprises/"+localStorage.enterpriseUid+"/domains"
            });
        },
        delDepart: function(options) {
            return $http({
                method: "delete",
                url:"awstack-user/v1/enterprises/"+localStorage.enterpriseUid+"/domains",
                data:options
            });
        },
        createDepart: function(options) {
            return $http({
                method: "put",
                url:"awstack-user/v1/enterprises/"+localStorage.enterpriseUid+"/domains",
                data:options
            });
        },
        editDepart: function(options) {
            return $http({
                method: "put",
                url: "awstack-user/v1/enterprises/"+localStorage.enterpriseUid+"/domains",
                data:options
            });
        },
        getDepQuota: function(domainUid) {
            return $http({
                method: "get",
                url: static_quota_url + "/getNewQuotas?type=domain_quota&targetId="+domainUid+"&enterpriseUid="+localStorage.enterpriseUid
            });       
        },
        updateDep: function(data) {
            return $http({
                method: "put",
                url: static_quota_url+"/enterprises/"+localStorage.enterpriseUid+"/domains",
                data:data
            });       
        },
        getDomain:function(data){
            return $http({
                method: "get",
                url: static_quota_url+"/max/quota/usage/project/domain",
                params:data
            }); 
        }
    };
}

easyDepartmentSrv.$inject = ["$http"];