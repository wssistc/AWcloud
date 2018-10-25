
export function easyProjectSrv($http){
    return {
        getProject: function() {
            return $http({
                method: "get",
                url: "awstack-user/v1/enterprises/" + localStorage.enterpriseUid + "/projects"
            });
        },
        delProject: function(options) {
            return $http({
                method: "delete",
                url: "awstack-user/v1/enterprises/" + localStorage.enterpriseUid + "/projects",
                data:options
            });
        },
        createProject: function(options) {
            return $http({
                method: "post",
                url: "awstack-user/v1/enterprises/" + localStorage.enterpriseUid + "/projects",
                data:options
            });
        },
        editProject: function(options) {
            return $http({
                method: "put",
                url: "awstack-user/v1/enterprises/" + localStorage.enterpriseUid + "/projects",
                data:options
            });
        },
        detailProject: function(options) {
            return $http({
                method: "get",
                url: "awstack-user/v1/enterprises/" + localStorage.enterpriseUid + "/projects/"  + options
            });
        },
        usersInProject:function(options){
            return $http({
                method:"get",
                url:"awstack-user/v1/project/"+options+"/users"
            });
        },

        addUserToProject:function(options,postParams){
            return $http({
                method: "put",
                url:"awstack-user/v1/project/"+options+"/users",
                data:postParams
            });
        },
        getDepart: function() {
            return $http({
                method: "GET",
                url:"awstack-user/v1/enterprises/"+localStorage.enterpriseUid+"/domains"
            });
        },
        getProjectSwitchInfo:function(domainId){
            return $http({
                method: "GET",
                url:"awstack-user/v1/enterprises/"+localStorage.enterpriseUid+"/projects/check?enterpriseUid="+localStorage.enterpriseUid+"&type=project_quota&domainUid="+domainId,
            });
        },
        checkProjectQuota:function(options){
            return $http({
                method: "POST",
                url:"awstack-user/v1/enterprises/"+localStorage.enterpriseUid+"/projects/check?enterpriseUid="+localStorage.enterpriseUid,
                data:options
            });
        }
    };
}

easyProjectSrv.$inject = ["$http"];