var tableService = angular.module("dataclusterSrv", []);
tableService.service("dataclusterSrv", function($rootScope, $http) {
    var static_url = "awstack-user/v1/enterprises/";
    var aggregateUrl = "awstack-resource/v1";
    var enterpriseUid = localStorage.enterpriseUid;
    return {
        getClusterTableData: function() {
            return $http({
                method: "get",
                url: static_url + localStorage.enterpriseUid + "/regions"
            });
        },
        getNetResult: function() {
            return $http({
                method: "get",
                url: "awstack-user/v1/network/check/result"
            });
        },
        startNetTest: function(dataParams) {
            return $http({
                method: "post",
                url: "awstack-user/v1/network/check",
                data:dataParams
            });
        },
        addNodeAction: function(options,regionUid) {
            return $http({
                method: "post",
                url: static_url + localStorage.enterpriseUid+"/regions/"+regionUid+"/nodes",
                data: options
            });
        },
        getNode: function(regionUid) {
            return $http({
                method: "get",
                url: "awstack-user/v1/regions/"+regionUid+"/nodes"
            });
        },
        createRegion: function(options) {
            return $http({
                method: "post",
                url: static_url + localStorage.enterpriseUid+"/regions",
                data: options
            });
        },
        editRegion: function(options,item) {
            return $http({
                method: "put",
                url: static_url +item.enterpriseUid+"/regions/"+item.regionUid+"/names",
                data: options
            });
        },
        delRegion:function(regionUid){
            return $http({
                method: "delete",
                url: static_url + localStorage.enterpriseUid+"/regions/"+regionUid
            });
        },
        getCurRegNodeList: function() {
            return $http({
                method: "get",
                url: "awstack-user/v1/enterprises/"+localStorage.enterpriseUid+"/nodes/list"
            });
        },
        checkUserName:function(data,enterpriseUid){
            var loginsData = localStorage.LOGINS ? JSON.parse(localStorage.LOGINS) : "";
            //var enterpriseUid = loginsData.enterpriseUid;
            return $http({
                method: "POST",
                url: "awstack-user/v1/enterprises/" + enterpriseUid + "/chkusername",
                data:data
            });
        },
        postDeploy:function(data,enterpriseUid){
            return $http({
                method: "PUT",
                url: "awstack-user/v1/enterprises/" + enterpriseUid + "/clusters/configurations",
                data: data
            });
        },
        getDeployDetail:function(regionKey){
            return $http({
                method:"GET",
                url:"/awstack-user/v1/enterprises/regions/regionkeys/"+regionKey
            })
        },
        resetDeploy:function(data,enterpriseUid){
            return $http({
                method:"DELETE",
                headers:{
                    "Content-Type":"application/json"
                },
                url:"/awstack-user/v1/enterprises/"+enterpriseUid+"/clusters/configurations",
                data:data
            })
        },
        getHypervisors: function () {
            return $http({
                method: "GET",
                url: aggregateUrl + "/os-hypervisors"
            });
        },
        getIpmiInfo: function(nodeId) {
            return $http({
                method: "GET",
                url: "/awstack-resource/v1/ipmi/nodes/" + nodeId
            });
        },
        addIpmiInfo: function(options) {
            return $http({
                method: "POST",
                url: "awstack-resource/v1/ipmi/nodes/add",
                data: options
            });
        },
        editIpmiInfo: function(options) {
            return $http({
                method: "PUT",
                url: "awstack-resource/v1/ipmi/nodes/update",
                data: options
            });
        },
        isHealthAction: function (options,regionUid) {
            return $http({
                method: "GET",
                url: static_url + localStorage.enterpriseUid+"/regions/"+regionUid+"/nodes/health",
                params: options
            });
        },
        activationAction: function(options,regionUid) {
            return $http({
                method: "PUT",
                url: static_url + localStorage.enterpriseUid+"/regions/"+regionUid+"/nodes/active",
                data: options
            });
        },
        maintenanceAction: function(options,regionUid) {
            return $http({
                method: "PUT",
                url: static_url + localStorage.enterpriseUid+"/regions/"+regionUid+"/nodes/maint?forceShutIns=true",
                data: options
            });
        },
        delNodeAction: function(options,regionUid) {
            return $http({
                method: "DELETE",
                headers:{
                    "Content-Type":"application/json;charset=UTF-8"
                },
                url: static_url + localStorage.enterpriseUid+"/regions/"+regionUid+"/nodes",
                data: options
            });
        },
        forceDelNodeAction: function(options,regionUid) {
			return $http({
				method: "DELETE",
				headers:{
					"Content-Type":"application/json;charset=UTF-8"
				},
				url: static_url + localStorage.enterpriseUid+"/regions/"+regionUid+"/nodes/forceRemove",
                data: options
			});
		},
        retryNodeAction: function(options,regionUid) {
            return $http({
                method: "POST",
                url: static_url + localStorage.enterpriseUid+"/regions/"+regionUid+"/nodes/retry",
                data: options
            });
        },
        // getAllNode: function() {
        //     return $http({
        //         method: "get",
        //         url: "awstack-user/v1/enterprises/" + localStorage.enterpriseUid + "/nodes/list"
        //     });
        // },
        getAllNode: function(regionUides) {
            return $http({
                method: "get",
                url: "awstack-user/v1/enterprises/"+localStorage.enterpriseUid+"/regions/"+regionUides+"/nodes/list"
            });
        },
        shutDown:function(regionKey,regionName){
            return $http({
                method: "get",
                url: "awstack-user/v1/enterprises/regions/shutdown/" + regionKey+"/"+regionName
            }); 
        },
        initConfig:function(enterpriseUid,regionKey,nodeUid,options){
            return $http({
                method: "put",
                url: "awstack-user/v1/enterprises/"+enterpriseUid+"/regions/"+ regionKey+"/nodes/"+nodeUid+"/diskandnetwork/configurations",
                data:options
            });
        },
        twoNodePromote:function(options){
            return $http({
                method: "put",
                url: "awstack-user/v1/enterprises/regions/twonode/hosts/61/promote_node",
                data:options
            });
        },
        threeNodePromote:function(options){
            return $http({
                method: "put",
                url: "awstack-user/v1/enterprises/regions/twonode/hosts/62/promote_node",
                data:options
            });
        },
        joinCluster:function(enterpriseUid,regionUid,options){
            return $http({
                method: "post",
                url: "awstack-user/v1/enterprises/"+enterpriseUid+"/regions/"+regionUid+"/nodes",
                data:options
            });
        },
        getStorageList:function(){
            return $http({
                method: "get",
                url: "awstack-user/v1/volume/pools/detail"
            }); 
        },
        getNodeStatus:function(options){
            return $http({
                method: "get",
                url: "awstack-user/v1/nodes/status",
                params:options
            }); 
        },
        getSettingStatus: function(){
            return $http({
                method:"GET",
                url: "awstack-user/v1/ent/" + localStorage.enterpriseUid + "/platform/initialization"
            });
        },
        getNetType:function(enterprisesId,regionKey,headers){
            return $http({
                method: "GET",
                url: "awstack-resource/v1/networkSetting/"+regionKey+"/"+enterprisesId+"/getPrivateNetworkType",
                headers:headers
            });
        },
        getNatureStart:function(data){
            return $http({
                method: "GET",
                url: "/awstack-user/back/v1/enterprises/regions/status",
                params:data,
            });
        },
        initArbiterPromoteStep:function(enterpriseUid,regionUid){
            return $http({
                method: "post",
                url: "awstack-user/v1/enterprises/"+enterpriseUid+"/region/"+regionUid+"/complete",
            });
        },
        setStep:function(regionUid,step){
            return $http({
                method: "put",
                url: "awstack-user/v1/enterprises/"+localStorage.enterpriseUid+"/region/"+regionUid+"/promotestep/"+step,
            });
        }
    };
});