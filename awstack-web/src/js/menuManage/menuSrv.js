var tableService = angular.module("menuSv", ["ngResource"]);
tableService.service("menuSrv", function($http) {
    var static_url="awstack-user/v1/";
    return {
        getAllMenus: function() {
            return $http({
                method: "get",
                url: static_url + "allmenus"
            });
        },
        addMenu: function(data){
            return $http({
                method: "post",
                url: static_url+"menus",
                data: data
            });
        },
        getAllRoles:function(){
            return $http({
                method: "get",
                url: static_url+"enterprises/"+localStorage.enterpriseUid+"/roles"
            });
        },
        deleteMenu:function(id){
            return $http({
                method: "delete",
                url: static_url+"menus/"+id
            });
        },
        deleteMenuIds:function(ids){
            return $http({
                method:"delete",
                url:static_url+"menus",
                params:ids
            });
        },
        updateMenu:function(data){
            return $http({
                method:"put",
                url:static_url+"menus",
                data:data
            });
        }

    };
});
