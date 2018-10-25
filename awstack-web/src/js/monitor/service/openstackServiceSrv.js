var  openstackServiceSrv= angular.module("openstackServiceSrv",[]);
openstackServiceSrv.service("openstackServiceSrv", function ($http) {
    var static_url = "awstack-monitor/v1/";
    return {
        getDatas: function() {
            return $http({
                method: "get",
                url: static_url + "serviceList"
            });
        },
        getNovaSrvDatas: function(options) {
            return $http({
                method: "get",
                url: static_url + options +"/openstack/nova"
            });
        },
        getCinderSrvDatas: function(options) {
            return $http({
                method: "get",
                url: static_url + options +"/openstack/cinder"
            });
        },
        getNeutronSrvDatas: function(options) {
            return $http({
                method: "get",
                url: static_url + options +"/openstack/neutron"
            });
        },
        getNodeList:function(regionUides) {
            return $http({
                method: "get",
                url: "awstack-user/v1/enterprises/"+localStorage.enterpriseUid+"/regions/"+regionUides+"/nodes/list"
            });
        },
        getServerListOfNode:function(nodeName){
            return $http({
                method: "get",
                url: "/awstack-user/v1/nodes/service?nodeName="+nodeName
            });
        },
        isHealthAction: function (options,regionUid) {
            return $http({
                method: "GET",
                url: "awstack-user/v1/enterprises/" + localStorage.enterpriseUid+"/regions/"+regionUid+"/nodes/health",
                params: options
            });
        },

    };
});