var tableService = angular.module("peojectsrv", []);
tableService.service("projectDataSrv", function($rootScope, $http, backendSrv) {
    //var department_api_url = "awstack-user/v1/enterprises/" + localStorage.enterpriseUid + "/projects";
    return {
        getProject: function() {
            return backendSrv.get("awstack-user/v1/enterprises/" + localStorage.enterpriseUid + "/projects", "");
        },
        delProject: function(options) {
            return backendSrv.delete("awstack-user/v1/enterprises/" + localStorage.enterpriseUid + "/projects", "", options);
        },
        createProject: function(options) {
            return backendSrv.post("awstack-user/v1/enterprises/" + localStorage.enterpriseUid + "/projects", options);
        },
        editProject: function(options) {
            return backendSrv.put("awstack-user/v1/enterprises/" + localStorage.enterpriseUid + "/projects", options);
        },
        /*detailProject:function(options){
           return 
        },*/
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
        getResCont: function(options,header) {
            return $http({
                method: "GET",
                url:"/awstack-resource/v1/"+options,
                headers:header
            });
        },
        getProjectSwitchInfo:function(domainId,type,projectUid){
            if(type=='edit'){
                return $http({
                    method: "GET",
                    url:"awstack-user/v1/enterprises/"+localStorage.enterpriseUid+"/projects/check?enterpriseUid="+localStorage.enterpriseUid+"&type=project_quota&domainUid="+domainId+"&projectUid="+projectUid,
                });
            }else{
                return $http({
                    method: "GET",
                    url:"awstack-user/v1/enterprises/"+localStorage.enterpriseUid+"/projects/check?enterpriseUid="+localStorage.enterpriseUid+"&type=project_quota&domainUid="+domainId,
                });
            }
            
        },
        checkProjectQuota:function(options){
            return $http({
                method: "POST",
                url:"awstack-user/v1/enterprises/"+localStorage.enterpriseUid+"/projects/check?enterpriseUid="+localStorage.enterpriseUid,
                data:options
            });
        }
    };

});
