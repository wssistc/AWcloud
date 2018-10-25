var tableService = angular.module("departmentsrv", []);
tableService.service("departmentDataSrv", function($rootScope, $http, $routeParams, backendSrv) {
	var static_quota_url = "awstack-user/v1";
	return {
		getDepart: function() {
			return backendSrv.get("awstack-user/v1/enterprises/"+localStorage.enterpriseUid+"/domains", "");
		},
		delDepart: function(options) {
			return backendSrv.delete("awstack-user/v1/enterprises/"+localStorage.enterpriseUid+"/domains", "", options);
		},
		createDepart: function(options) {
			return backendSrv.post("awstack-user/v1/enterprises/"+localStorage.enterpriseUid+"/domains", options);
		},
		editDepart: function(options) {
			return backendSrv.put("awstack-user/v1/enterprises/"+localStorage.enterpriseUid+"/domains", options);
		},
		getDepQuota: function(domainUid) {
			return $http({
				method: "get",
				url: static_quota_url + "/getNewQuotas?type=domain_quota&targetId="+domainUid+"&enterpriseUid="+localStorage.enterpriseUid
			});       
		},
		updateDep: function(data) {
			return $http({
				method: "put",
				url: static_quota_url+"/enterprises/"+localStorage.enterpriseUid+"/domains",
				data:data
			});       
		},
		getDomain:function(data){
			return $http({
				method: "get",
				url: static_quota_url+"/max/quota/usage/project/domain",
				params:data
			}); 
		},
		getMaxProHardlimitOfDepartment:function(domainId){
			return $http({
				method: "get",
				url: "awstack-user/v1/enterprise/"+localStorage.enterpriseUid+ "/quota/max/limit/project/domain/"+ domainId,
			}); 
		},
		getDomainSwitchInfo:function(domainId){
            return $http({
                method: "GET",
                url:"awstack-user/v1/domains/ticket/check?enterpriseUid="+localStorage.enterpriseUid+"&type=project_quota&domainUid="+domainId,
            });
        },
        checkDomainQuota:function(domainId,options){
            return $http({
                method: "POST",
                url:"awstack-user/v1/domains/ticket/check?type=domain_quota&enterpriseUid="+localStorage.enterpriseUid+"&domainUid="+domainId,
                data:options
            });
        }

    };


});
