var tableService = angular.module("rolesrv", []);
tableService.service("roleDataSrv", function($rootScope, $http, backendSrv) {
    var role_api_url = "awstack-user/v1/enterprises/" + localStorage.enterpriseUid + "/privileges";
    var role_api_url_menu = "awstack-user/v1/menus";
    return {
        getRoledata: function(options) {
            return backendSrv.get("awstack-user/v1/enterprises/"+localStorage.enterpriseUid+"/privileges","",options);
        },
        delRole: function(options) {
            return backendSrv.delete(role_api_url, "", options);
        },
        getMemus: function(options) {
            return backendSrv.get(role_api_url_menu, "", options);
        },
        createRole: function(options) {
            return backendSrv.post(role_api_url, options);
        },
        /*getRoleDetail:function(options){
            return backendSrv.get(role_api_url+'/'+options,"")
        },*/
        editRole: function(options) {
            return backendSrv.put(role_api_url, options);
        },
        roleIsUsed:function(options){
            return $http({
                method: "POST",
                url: "awstack-user/v1/check/enterprises/" + localStorage.enterpriseUid + "/privileges/names",
                data:options
            });    
        }
    };

});
