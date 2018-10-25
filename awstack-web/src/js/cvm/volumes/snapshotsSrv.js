var tableService = angular.module("snapshotssrv", []);
tableService.service("snapshotsDataSrv", function($rootScope, $http) {
    var static_url = "awstack-resource/v1/";
    var static_quota_url = "awstack-user/v1";
    return {
        getProUsed: function() {
            return $http({
                method: "get",
                url: static_quota_url + "/quotas_Usages?type=project_quota&domainUid=" + localStorage.domainUid + "&projectUid=" + localStorage.projectUid + "&name=snapshots&enterpriseUid=" + localStorage.enterpriseUid
            });
        },
        updateQuotaUse: function(id, data) {
            return $http({
                method: "PUT",
                url: "awstack-user/v1/quotas_Usages/" + id,
                data: data
            });
        },
        getSnapshotsTableData: function() {
            return $http({
                method: "get",
                url: static_url + "snapshots"
            });
        },
        delOneSnapshotAction: function(options) {
            return $http({
                method: "DELETE",
                url: static_url + "snapshots/" + options
            });
        },
        delSnapshots: function(options) {
            return $http({
                method: "DELETE",
                url: static_url + "snapshots",
                params: options
            });
        },
        snapShotDetailAction: function(options) {
            return $http({
                method: "get",
                url: static_url + "snapshots/" + options
            });
        },
        enabledVolumeAction: function(options) {
            return $http({
                method: "POST",
                url: static_url + "snapshots/createvolume",
                data: options
            });
        }
    };
});
