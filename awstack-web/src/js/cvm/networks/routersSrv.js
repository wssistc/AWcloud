import "../../common/services/commonFuncSrv";

var routersSrvModule = angular.module("routersSrvModule", ["commonFuncModule"]);
routersSrvModule.service("routersSrv", function($rootScope, $http ,$q) {
    var static_url = "/awstack-resource/v1";
    return {
        getRoutersTableData: function() {
            return $http({
                method: "get",
                url: static_url + "/routers"
            });
        },
        getExtNets: function(headers) {
            return $http({
                method: "get",
                url: static_url + "/extnets",
                headers:headers
            });
        },
        getTenantSubs: function() {
            return $http({
                method: "get",
                url: static_url + "/projectSubs"
            });
        },
        addRouterAction: function(options) {
            return $http({
                method: "POST",
                url: static_url + "/routers",
                data: options
            });
        },
        editRouterName: function(options) {
            return $http({
                method: "PUT",
                url: static_url + "/routers",
                data: options
            });
        },
        delRouterAction: function(options) {
            return $http({
                method: "DELETE",
                url: static_url + "/routers",
                data: options
            });
        },
        getRouterDetail: function(options) {
            return $http({
                method: "GET",
                url: static_url + "/routers/" + options
            });
        },
        getSubnetsInfo: function() {
            return $http({
                method: "GET",
                url: static_url + "/subnets"
            });
        },
        getUnbindSubnets: function(options) {
            return $http({
                method: "GET",
                url: static_url + "/router/" + options + "/unbindSubnets"
            });
        },
        interfaceAdd: function(options) {
            return $http({
                method: "POST",
                url: static_url + "/interfaceAdd",
                data: options
            });
        },
        updatePortName: function(options) {
            return $http({
                method: "PUT",
                url: static_url + "/ports/" + options.port_id,
                data: options.portName
            });
        },
        interfaceRemove: function(options) {
            return $http({
                method: "POST",
                url: static_url + "/interfaceRemove",
                data: options
            });
        },
        updateRouterGateway: function(options) {
            return $http({
                method: "PUT",
                url: static_url + "/routers",
                data: options
            });
        },
        //获取静态路由表
        getStaticRoutes: function() {
            return $http({
                method: "GET",
                url: static_url + "/staticrouters"
            });
        },
        editStaticRoutes: function(options) {
            return $http({
                method: "PUT",
                url: static_url + "/routers/staticroute",
                data: options
            });
        },
        routersTableAllData: [],
        // 新建路由转发
        creatPortForwarding:function(routerId,data){
            return $http({
                method: "PUT",
                url: static_url + "/portsPortForward/" + routerId ,
                data: data
            });
        },
        //路由转发列表
        getPortForwarding:function(id){
            return $http({
                method: "GET",
                url: static_url +""+id
            });
        },
        //云主机ip地址列表
        getCouldIpAddressList:function(id){
            return $http({
                method: "GET",
                url: static_url + "/server/" + id + "/detail"
            });
        },
        //端口转发列表
        getPortForwardingList:function(id){
            return $http({
                method: "GET",
                url: static_url + "/portsPortForward/" + id
            })
        },
        //计费接口
        getPrice:function(data){
            return $http({
                method: "POST",
                url: " /awstack-boss/newResourceCharge/queryRouterChargingAmount",
                data:data
            })
        },
        // 获取所有子网
        getSubnetsTableData: function() {
            return $http({
                method: "GET",
                url: static_url + "/subnets"
            });
        },
    };
});
