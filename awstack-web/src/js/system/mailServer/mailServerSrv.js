var mailServerSrvModule = angular.module("mailServerSrvModule",[]);

mailServerSrvModule.service("mailServerSrv",["$http",function($http){
    return{
        editData:function(option,headers){
            return $http({
                method:"PUT",
                url: "/awstack-user/v1/params",
                data:option,
                headers:headers
            });           
        },
        addData:function(data,headers){
            return $http({
                method:"POST",
                url: "/awstack-user/v1/params",
                data:data,
                headers:headers
            });           
        },
        getMailData:function(headers){
            return $http({
                method:"GET",
                url: "/awstack-user/v1/params",
                params:{
                    "parentId":27,
                    "enterpriseUid":localStorage.enterpriseUid,
                    "regionUid":0
                },
                headers:headers
            });
        }
    };
}]);