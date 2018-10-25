var tableService = angular.module("usersrv", ["ngResource"]);
tableService.service("userDataSrv", ["$rootScope", "$http", function($rootScope, $http) {
    var static_url = "awstack-user/v1/enterprises/";
    return {
        getUserTableData: function(domainUid) {
            return $http({
                method: "get",
                url: static_url  + localStorage.enterpriseUid +  "/users",
                params:domainUid
            });
        },
        //查询project中的用户
        getProUserTableData: function(options) {
            return $http({
                method: "get",
                url: "awstack-user/v1/project/"+options+"/users"
            });
        },
        //获取组织
        getOrgsData: function() {
            return $http({
                method: "get",
                url: static_url  + localStorage.enterpriseUid + "/departments"
            });
        },
        //获取权限
        getPrivilegesData: function() {
            return $http({
                method: "get",
                url: static_url  + localStorage.enterpriseUid + "/privileges"
            });
        },
        //获取部门
        getDepartmentData: function() {
            return $http({
                method: "get",
                url: static_url  + localStorage.enterpriseUid + "/domains"
            });
        },
        //获取项目
        getProjectData: function(options) {
            return $http({
                method: "get",
                url: static_url  + localStorage.enterpriseUid + "/projects",
                params: {
                    domainUid: options.domainUid
                }
            });
        },
        //获取region
        getRegionData: function() {
            return $http({
                method: "get",
                url: static_url  + localStorage.enterpriseUid + "/regions"
               
            });
        },

        //获取某个region下的云主机列表
        getVmlist: function(options) {
            return $http({
                method: "get",
                url: "awstack-user/v1" + "/regions/" + options + "/nodes"
            });
        },

        getRolesData: function() {
            return $http({
                method: "get",
                url: static_url  + localStorage.enterpriseUid + "/roles"
            });
        },
        putUserRoles: function(options) {
            return $http({
                method: "PUT",
                url: static_url  + localStorage.enterpriseUid + "/users/" + options.id + "/privileges",
                params: options.role_ids
            });
        },
        addUserAction: function(options) {
            return $http({
                method: "post",
                url: static_url  + localStorage.enterpriseUid + "/users",
                data: options
            });
        },
        editUserAction: function(options) {
            return $http({
                method: "PUT",
                url: static_url  + localStorage.enterpriseUid + "/users",
                data: options
            });
        },
        delUserAction: function(options) {
            return $http({
                method: "DELETE",
                url: static_url  + localStorage.enterpriseUid + "/users/",
                params: options
            });
        },
        operateUserAction: function(options) {
            return $http({
                method: "PUT",
                url: static_url  + localStorage.enterpriseUid + "/users/" + options.id + "/" + options.userUid + "/status/" + options.state
            });
        },
        getUserPrivileges: function(options) {
            return $http({
                method: "GET",
                url: static_url  + localStorage.enterpriseUid + "/users/" + options.user_id + "/privileges"
            });
        },
        userTableAllData: []
    };
}]);
