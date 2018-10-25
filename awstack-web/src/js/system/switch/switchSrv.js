angular
    .module("switchSrv", [])
    .service("switchSrv",switchSrv);

switchSrv.$inject = ["$http"];

function switchSrv($http){
    
    return{
        editData:function(option){
            return $http({
                method:"PUT",
                url: "/awstack-user/v1/params",
                data:option
            });           
        },
        addData:function(data){
            return $http({
                method:"POST",
                url: "/awstack-user/v1/params",
                data:data
            });           
        },
        getLimitData:function(regionUid){
            return $http({
                method:"GET",
                url: "/awstack-user/v1/params",
                params:{
                    "parentId":724,
                    "enterpriseUid":localStorage.enterpriseUid,
                    "regionUid":regionUid
                }
            });
        },
        handleMenu:function(options){
            return $http({
                method:"PUT",
                url: "/awstack-user/v1/menus/"+options.name+"/description/"+options.description,
                params:options.status
            });
        },
        delBuffer: function() {
            return $http({
                method: "delete",
                url: "awstack-resource/v1/uploadimagez/space"
            });       
        }
    };

}