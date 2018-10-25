
angular.module("gradeSrv", [])
    .service("gradesrv", ["$http",function ($http) {
        return {
            getHistoryList: function () {
                return $http({
                    method: "GET",
                    url: "/awstack-user/v1/platform/updatelog"
                });
            },
            getSftpInfo: function (hostName) {
                return $http({
                    method: "GET",
                    url: "/awstack-user/v1/platform/sftp/passwd"
                });
            },
            getSftpPassword: function (hostName) {
                return $http({
                    method: "PUT",
                    url: "/awstack-user/v1/platform/sftp/passwd"
                });
            },
            checkSaas: function () {
                return $http({
                    method: "GET",
                    url: "/awstack-user/v1/platform/updatepack"
                });
            },
            sassGrade: function (data) {
                return $http({
                    method: "POST",
                    url: "/awstack-user/v1/platform/updatepack",
                    data: data
                });
            },
            reTryGrade: function (data) {
                return $http({
                    method: "POST",
                    url: "/awstack-user/v1/platform/updatepack/retry",
                    data: data
                });
            },
            GradeDetail: function (data) {
                return $http({
                    method: "GET",
                    url: "/awstack-user/v1/platform/updatelog/detail/"+data
                });
            },
            GetSaasVersion: function () {
                return $http({
                    method: "GET",
                    url: "/awstack-user/v1/platform/version"
                });
            }
        };
    }]);
