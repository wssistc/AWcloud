var tableService = angular.module("depviewsrv", ["ngResource"]);
tableService.service("depviewsrv", function($http) {
	var static_quota_url = "awstack-user/v1";
	return {
		getDepUsed:function(domainUid){
			return $http({
				method: "get",
				url: static_quota_url + "/quotas_Usages?type=domain_quota&domainUid="+domainUid+"&enterpriseUid="+localStorage.enterpriseUid
			});
		},
        //获取当前部门展示资源的已经使用数量
		getProUsed:function(options){
			return $http({
				method: "get",
                url: "awstack-user/v1/quotas_Usages",
                params:options
			});
		},
		getProjectData: function(domainUid) {
			return $http({
				method: "get",
				url: "awstack-user/v1/enterprises/" + localStorage.enterpriseUid + "/projects" + "?domainUid="+domainUid
			});
		},
        getProjectDataAll: function(domainUid) {
            return $http({
                method: "get",
                url: "awstack-user/v1/enterprises/" + localStorage.enterpriseUid + "/projects",
                params:domainUid
            });
        },
		getQuotaUsed: function(domainUid) {
			return $http({
				method: "get",
				url: static_quota_url + "/projectsofquotas/"+domainUid+"?enterpriseUid="+localStorage.enterpriseUid
			});
		},
        getQuotaUsedIns: function(domainUid) {
            return $http({
                method: "get",
                url: static_quota_url + "/projectsofquotas/"+domainUid+"?enterpriseUid="+localStorage.enterpriseUid+"&name=instances"
            });
        },
        //获取部门下面的所有资源的可用数量
		getQuotaTotal: function(domainUid) {
			return $http({
				method: "get",
				url: static_quota_url + "/domain/quotas?type=domain_quota&targetId="+domainUid+"&enterpriseUid="+localStorage.enterpriseUid
			});       
		},
		getProTotal: function(projectUid) {
			return $http({
				method: "get",
				url: static_quota_url + "/quotas?type=project_quota&targetId="+projectUid+"&enterpriseUid="+localStorage.enterpriseUid
			});       
		},
		getProHave: function(projectUid) {
			return $http({
				method: "get",
				url: static_quota_url + "/getNewQuotas?type=project_quota&targetId="+projectUid+"&enterpriseUid="+localStorage.enterpriseUid
			});       
		},
		getCanEditQuota:function(){
			return $http({
				method:"get",
				url:static_quota_url + "/quotas/default/"+localStorage.enterpriseUid+"?type=domain_quota&isShow=true"
			});
		},
        //新建项目获取需要展示的资源项目
		getProQuota:function(){
			return $http({
				method:"get",
				url:static_quota_url + "/quotas/default/"+localStorage.enterpriseUid+"?type=project_quota&isShow=true"
			});
		},

        gotoCvm: function(data) {
            return $http({
                method: "post",
                url: "awstack-user/v1/projects/resources",
                data:data
            });
        },
        updateDepQuota: function(data) {
            return $http({
                method: "put",
                url: static_quota_url+"/quotas",
                data:data
            });
        },
        createDep: function(data) {
            return $http({
                method: "post",
                url: static_quota_url+"/enterprises/"+localStorage.enterpriseUid+"/domains",
                data:data
            });       
        },
        createPro: function(data) {
            return $http({
                method: "post",
                url: static_quota_url+"/enterprises/"+localStorage.enterpriseUid+"/projects",
                data:data
            });       
        },
        updateProject: function(data) {
            return $http({
                method: "put",
                url: static_quota_url+"/enterprises/"+localStorage.enterpriseUid+"/projects",
                data:data
            });       
        },
        depNameIsUsed: function(data) {
            return $http({
                method: "post",
                url: static_quota_url+"/check/enterprises/"+localStorage.enterpriseUid+"/domains/names",
                data:data
            });       
        },
        /*getEnterAllQuota: function() {
            return $http({
                method: "get",
                url: static_quota_url+"/quotas/enterpriseQuotas/"+enterpriseUid
            })       
        },*/
        getEnterAllQuota:function(){
            return $http({
                method:"GET",
                url:"awstack-user/v1/enterprises/" + localStorage.enterpriseUid +"/nodes/sysinfos"
            });
        },
        getEnterUsedQuota: function() {
            return $http({
                method: "get",
                url: static_quota_url+"/domainsofquotas/"+localStorage.enterpriseUid +"?type=domain_quota"
            });       
        },
        getDomainUsers: function(options) {
            return $http({
                method: "get",
                url: static_quota_url+"/enterprises/"+localStorage.enterpriseUid+"/domains/"+options+"/users"
            });       
        },
        ProjectAllData: []
    };
});
