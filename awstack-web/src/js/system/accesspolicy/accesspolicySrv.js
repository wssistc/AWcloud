var accessPolicySrvModule = angular.module("accessPolicySrvModule", []);

accessPolicySrvModule.service("accessPolicySrv", ["$http", function($http) {
    var static_url = "awstack-user/v1/enterprises/" + localStorage.enterpriseUid;
    return {
        getwblistIps: function(options) {
            return $http({
                method: "GET",
                url: static_url + "/wblistIps",
                params: options
            });

        },
        addwblistIps: function(options) {
            return $http({
                method: "POST",
                url: static_url + "/wblistIps",
                data: options
            });
        },
        editwblistIps: function(options) {
            return $http({
                method: "PUT",
                url: static_url + "/wblistIps",
                data: options
            });
        },
        deletewblistIps: function(options) {
            return $http({
                method: "DELETE",
                url: static_url + "/wblistIps",
                params: options
            });
        },

        //获取锁定状态
        getLoginLockPolicyStatus: function() {
            return $http({
                method: "GET",
                url: "/awstack-user/v1/params",
                params: {
                    "enterpriseUid": 0,
                    "regionUid": 0,
                    "parentId": 1,
                    "paramId": 696
                }
            })
        },
        //激活或者取消锁定
        updateLoginLockPolicyStatus: function(options) {
            return $http({
                method: "PUT",
                url: "/awstack-user/v1/enterprises/" + localStorage.enterpriseUid + "/batch/params", //"/awstack-user/v1/enterprisies/" + localStorage.enterpriseUid + "/loginrule/params",
                data: [options]
            })
        },
        //获取锁定用户列表
        getLockedUserData: function() {
            return $http({
                method: "GET",
                url: "/awstack-user/v1/enterprises/" + localStorage.enterpriseUid + "/users/locked",
            })
        },
        //设置锁定次数和时长
        settingLockPolicy: function(options) {
            return $http({
                method: "PUT",
                url: "/awstack-user/v1/enterprises/" + localStorage.enterpriseUid + "/batch/params",
                data: options
            })
        },
        //获取锁定次数和时长
        getLockPolicy: function(options) {
            return $http({
                method: "POST",
                url: "awstack-user/v1/enterprises/" + localStorage.enterpriseUid + "/params/list",
                data:options
            })
        },
        //解锁用户
        unlockUser: function(options) {
            return $http({
                method: "POST",
                url: "/awstack-user/v1/enterprises/" + localStorage.enterpriseUid + "/users/unlock",
                data: options
            })
        }
    };
}]);