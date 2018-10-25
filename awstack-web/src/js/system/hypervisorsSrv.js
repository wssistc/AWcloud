/**
 * Created by Weike on 2016/6/16.
 */
angular.module("hypervisorsSrvModule", [])
    .service("hypervisorsSrv", function ($http) {
        var aggregateUrl = "http://192.168.138.134:9080/awstack-resource/v1";

        return {
            getHypervisors: function () {
                return $http({
                    method: "GET",
                    url: aggregateUrl + "/os-hypervisors"
                });
            },

            hypervisorsTable: []
        };
    });
