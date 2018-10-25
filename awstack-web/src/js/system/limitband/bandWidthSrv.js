angular
    .module("bandWidthSrv", [])
    .service("bandWidthSrv",bandWidthSrv);

bandWidthSrv.$inject = ["$http"];

function bandWidthSrv($http){
    
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
        getLimitData:function(headers){
            return $http({
                method:"GET",
                url: "/awstack-user/v1/params",
                params:{
                    "parentId":707,
                    "enterpriseUid":localStorage.enterpriseUid,
                    "regionUid":0
                },
                headers:headers
            });
        }
    };

}