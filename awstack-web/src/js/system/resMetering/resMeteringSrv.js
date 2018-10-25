var resMeteringSrvModule = angular.module("resMeteringSrvModule", []);
resMeteringSrvModule.service('resMeteringSrv', ['$http', function($http) {
	return {
		resUsedStatisticTop:function(options){
			return $http({
				method:"POST",
				url:"awstack-monitor/v1/resource/used/statistic/top",
				data:options
			})
		},
		resUsedStatistic: function(options) {
			return $http({
				method: "POST",
				url: "awstack-monitor/v1/resource/used/statistic",
				data:options
			})
		},
		getItemTotalCount:function(options){
			return $http({
				method:"POST",
				url:"awstack-boss/meteringStatistics/queryRegionDeptProjectUserCount"
			})
		},
		getAllRegionsResUsage:function(options){
			return $http({
				method:"GET",
				url:"awstack-boss/meteringStatistics/findResourcesAmountOfRegionList",
				params:options
			})
		},
		getAllDomainsResUsage:function(options){
			return $http({
				method:"GET",
				url:"awstack-boss/meteringStatistics/findResourcesAmountOfDeptList",
				params:options
			})
		},
		getAllProjectsResUsage:function(options){
			return $http({
				method:"GET",
				url:"awstack-boss/meteringStatistics/findResourcesAmountOfProjectList",
				params:options
			})
		},
		getAllUsersResUsage:function(options){
			return $http({
				method:"GET",
				url:"awstack-boss/meteringStatistics/findResourcesAmountOfUserList",
				params:options
			})
		},
		getRegionDetailResUsage:function(options){
			return $http({
				method:"POST",
				url:"awstack-boss/meteringStatistics/findResourcesAmountDetailsOfRegion",
				data:options
			})
		},
		getDomainDetailResUsage:function(options){
			return $http({
				method:"POST",
				url:"awstack-boss/meteringStatistics/findResourcesAmountDetailsOfDept",
				data:options
			})
		},
		getProjectDetailResUsage:function(options){
			return $http({
				method:"POST",
				url:"awstack-boss/meteringStatistics/findResourcesAmountDetailsOfProject",
				data:options
			})
		},
		getUserDetailResUsage:function(options){
			return $http({
				method:"POST",
				url:"awstack-boss/meteringStatistics/findResourcesAmountDetailsOfUser",
				data:options
			})
		},
		getAllRegions:function(options){
			return $http({
				method:"GET",
				url:"awstack-boss/meteringStatisticsRank/findRegionList"
			})
		},
		getDomainsList:function(options){
			return $http({
				method:"GET",
				url:"awstack-boss/meteringStatisticsRank/findDeptList",
				params:options
			})
		},
		getProjectsList:function(options){
			return $http({
				method:"POST",
				url:"awstack-boss/meteringStatisticsRank/findProjectList",
				data:options
			})
		},
		getUsersList:function(options){
			return $http({
				method:"POST",
				url:"awstack-boss/meteringStatisticsRank/findUserList",
				data:options
			})
		},
		getRegionsResUsageRank:function(options){
			return $http({
				method:"POST",
				url:"awstack-boss/meteringStatisticsRank/queryResourcesAmountRankOfRegions",
				data:options?options:{}
			})
		},
		getDomainsResUsageRank:function(options){
			return $http({
				method:"POST",
				url:"awstack-boss/meteringStatisticsRank/queryResourcesAmountRankOfDepts",
				data:options?options:{}
			})
		},
		getProjectsResUsageRank:function(options){
			return $http({
				method:"POST",
				url:"awstack-boss/meteringStatisticsRank/queryResourcesAmountRankOfProjects",
				data:options?options:{}
			})
		},
		getProjectsResUsageRankDepts:function(options){
			return $http({
				method:"POST",
				url:"awstack-boss/meteringStatisticsRank/queryResourcesAmountRankOfDepts",
				data:options?options:{}
			})
		},
		getUsersResUsageRank:function(options){
			return $http({
				method:"POST",
				url:"awstack-boss/meteringStatisticsRank/queryResourcesAmountRankOfUsers",
				data:options?options:{}
			})
		}


	}
}]);