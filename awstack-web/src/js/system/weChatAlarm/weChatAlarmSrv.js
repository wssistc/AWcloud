var weChatAlarmSrvModule = angular.module("weChatAlarmSrvModule",[]);

weChatAlarmSrvModule.service("weChatAlarmSrv",["$http", function($http){
    return{
        editData:function(option,headers){
            return $http({
                method: "PUT",
                url: "/awstack-user/v1/params",
                data: option,
                headers:headers
            });           
        },
        addData:function(data,headers){
            return $http({
                method: "POST",
                url: "/awstack-user/v1/params",
                data: data,
                headers:headers
            });           
        },
        getWeChatData:function(headers){
            return $http({
                method: "GET",
                url: "/awstack-user/v1/params",
                params: {
                    "parentId": 800,
                    "enterpriseUid": localStorage.enterpriseUid,
                    "regionUid": 0
                },
                headers:headers
            });
        },
        weChatProxyInit: function(option,headers) {
            return $http({
                method: "POST",
                url: "/awstack-monitor/v1/wechat/init/" + localStorage.enterpriseUid,
                data: option,
                headers:headers
            });
        }
    };
}]);