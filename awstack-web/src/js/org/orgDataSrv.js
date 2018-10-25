var tableService = angular.module("orgsrv", []);
tableService.service("orgDataSrv", function($rootScope, $http, backendSrv) {
    var org_api_url = "awstack-user/v1/enterprises/" + localStorage.enterpriseUid + "/departments";
    var static_url_enter = "awstack-user/v1/enterprises/" + localStorage.enterpriseUid + "/departments/";
    return {
        getOrgData: function(options) {
            return backendSrv.get(org_api_url, options);
        },
        delOrg: function(options) {
            return backendSrv.delete(org_api_url + "/" + options);
        },
        editOrg: function(options) {
            return backendSrv.put(org_api_url, options);
        },
        createOrg: function(options) {
            return backendSrv.post(org_api_url, options);
        },
        detailOrg: function(id) {
            return $http({
                method: "GET",
                url: static_url_enter + id
            });
        }
    };
});
