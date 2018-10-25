var resviewSrvModule = angular.module("resviewSrvModule",[]);
resviewSrvModule.service('resviewSrv', ['$http', function($http){
	return {
		getRegionData:function(){
			return $http({
				method:"GET",
				url: "awstack-user/v1/enterprises/" + localStorage.enterpriseUid + "/regions"
			})
		},
		queryResData:function(options){
			return $http({
				method:"POST",
				url:"/awstack-monitor/v1/current/statistics/query",
				data:options
			})
		},
		query:function(options){
			return $http({
				method:"GET",
				url:"/awstack-monitor/v1/regions/"+options.regionCode+"/hosts/"+options.metrics +"?sort="+options.topType+"&limit="+options.topLength+"&hostType="+options.objType
				
			})
		},
		queryNew:function(options){
			return $http({
				method:"GET",
				url:"/awstack-monitor/v1/regions/"+options.regionCode+"/chart/hosts/"+options.metrics +"?sort="+options.topType+"&limit="+options.topLength+"&hostType="+options.objType
				
			})
		}
	}
}]);