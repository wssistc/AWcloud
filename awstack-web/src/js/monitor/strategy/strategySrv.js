var tableService = angular.module("strategySrv", []);
tableService.service("strategySrv", function($rootScope, $http) {
    var static_url = "http://192.168.138.134:9080/awstack-user/v1/dictionarys";
    return {

        //获取已经拥有的策略
        getMonitor: function() {
            return $http({
                method: "get",
                url: static_url + "/dictvalues/" + 19 + "/datas"
            });
        },

        //获取所有策略
        getAllMonitor: function() {
            return $http({
                method: "get",
                url: static_url + "/dictvalues/" + 16 + "/datas"
            });
        },

        //添加策略
        createMonitor: function(options) {
            return $http({
                method: "post",
                url: static_url + "/" + 19 + "/datas/" + options.dataName,
                data: options
            });
        },

        //编辑策略
        updataMonitor: function(optionName, options) {
            return $http({
                method: "put",
                url: static_url + "/" + 19 + "/datas/" + optionName,
                data: options
            });
        },



        // delStrategy: function(options) {
        //     return $http({
        //         method: "DELETE",
        //         url: static_url + "/" + 19 + "/enterprises/" + enterpriseUid + "/datas",
        //         dataIds: options
        //     });

        // 从已定制策略中删除
        delStrategy: function(options) {
            return $http({
                method: "DELETE",
                url: static_url + "/" + 19 + "/datas/" + options
            });
        }
    };
});
