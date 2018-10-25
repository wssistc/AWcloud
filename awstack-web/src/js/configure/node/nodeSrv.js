var tableService = angular.module("nodesrv", []);
tableService.service("nodeSrv", function($rootScope, $http, backendSrv) {
	var aggregateUrl = "awstack-resource/v1";
	var static_url="awstack-user/v1/enterprises/";
	return {
		getRegion: function() {
			return backendSrv.get("awstack-user/v1/enterprises/" + localStorage.enterpriseUid + "/regions", "");
		},
		getNode: function() {
			return backendSrv.get("awstack-user/v1/enterprises/" + localStorage.enterpriseUid + "/nodes/list", "");
		},
		getHypervisors: function () {
			return $http({
				method: "GET",
				url: aggregateUrl + "/os-hypervisors"
			});
		},
		addNodeAction: function(options,regionUid) {
			return $http({
				method: "post",
				url: static_url + localStorage.enterpriseUid+"/regions/"+regionUid+"/nodes",
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
		maintenanceAction: function(options,regionUid) {
			return $http({
				method: "PUT",
				url: static_url + localStorage.enterpriseUid+"/regions/"+regionUid+"/nodes/maint?forceShutIns=true",
				data: options
			});
		},
		activationAction: function(options,regionUid) {
			return $http({
				method: "PUT",
				url: static_url + localStorage.enterpriseUid+"/regions/"+regionUid+"/nodes/active",
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
		isHealthAction: function (options,regionUid) {
			return $http({
				method: "GET",
				url: static_url + localStorage.enterpriseUid+"/regions/"+regionUid+"/nodes/health",
				params: options
			});
		}
	};

});
