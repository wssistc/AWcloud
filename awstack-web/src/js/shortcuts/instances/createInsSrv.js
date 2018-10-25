let createInsSrvModule = angular.module("createInsSrvModule", []);
createInsSrvModule.service("createInsSrv", ["$http", function($http) {
	return {
		getDomain: function(options) {
			return $http({
				method: "GET",
				url: "/awstack-user/v1/user/domains/projects"
			})
		},
		getRole: function(projectUid) {
			return $http({
				method: "GET",
				url: "/awstack-user/v1/user/project/" + projectUid + "/roles"
			})
		},
		getNodes:function(enterpriseUid,regionUid){
			return $http({
				method: "GET",
				url: "/awstack-user/v1/enterprises/"+enterpriseUid+"/region/" + regionUid + "/health/nodes"
			})
		},
		getPrice:function(data){
			return $http({
				method: "POST",
				url: "/awstack-boss/newResourceCharge/queryVmChargingAmount",
				data:data
			})
		},
		getResourPrice:function(data,url){
			return $http({
				method: "POST",
				url: "/awstack-boss/newResourceCharge/"+url,
				data:data
			})
		},
		getVlomesPrice:function(data){
			return $http({
				method: "POST",
				url: "/awstack-boss/newResourceCharge/queryChdChargingAmount",
				data:data
			})
		},
		
	}
}])