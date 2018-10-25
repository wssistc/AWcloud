
angular.module("aggregatesSrvModule", [])
    .service("aggregatesSrv", function ($http) {
        var aggregateUrl = "http://192.168.138.134:9080/awstack-resource/v1";

        return {
            getAggregates: function () {
                return $http({
                    method: "GET",
                    url: aggregateUrl + "/os-aggregates"
                });
            },

            createAggregate: function (data) {
                return $http({
                    method: "POST",
                    url: aggregateUrl + "/os-aggregates",
                    data: data
                });
            },

            deleteAggregate: function (params) {
                return $http({
                    method: "DELETE",
                    url: aggregateUrl + "/os-aggregates",
                    params: params
                });
            },

            editAggregate: function (aggregateId, newData) {
                return $http({
                    method: "PUT",
                    url: aggregateUrl + "/os-aggregates/" + aggregateId,
                    data: newData
                });
            },

            resetAggregate: function(options){
                return $http({
                    method: "PUT",
                    url:aggregateUrl + "/os-aggregates/" + options.id,
                    data:options.data
                });
            },

            setAggregateMetadata: function (aggregateId, metadata) {
                return $http({
                    method: "POST",
                    url: aggregateUrl + "/os-aggregates/" + aggregateId +"/setMetadata",
                    data: metadata
                });
            },

            addHostIntoAggregates: function (aggregateId, data) {
                return $http({
                    method: "POST",
                    url: aggregateUrl + "/os-aggregates/" + aggregateId,
                    data: data
                });
            },

            removeHostFromAggregates: function (aggregateId, params) {
                return $http({
                    method: "DELETE",
                    url: aggregateUrl + "/os-aggregates/" + aggregateId,
                    params: params
                });
            },

            getZoneAndHosts: function () {
                return $http({
                    method: "GET",
                    url: aggregateUrl + "/os-availability-zone"
                });
            },
            OsService:function(){
                return $http({
                    method:"GET",
                    url: aggregateUrl + "/os-services"
                })
            },
            editMetadata: function(aggregateId, options) {
                return $http({
                    method: "PUT",
                    url: "/awstack-resource/v1/os-aggregates/" + aggregateId + "/metedata",
                    data: options
                })
            },

            aggregatesTable: []
        };
    });
