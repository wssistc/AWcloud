/**
 * Created by Weike on 2016/6/13.
 */
angular.module("flavorsSrvModule", [])
    .service("flavorsSrv", function ($http) {
        var flavorUrl = "http://192.168.138.134:9080/awstack-resource/v1";

        return {
            getFlavors: function () {
                return $http({
                    method: "GET",
                    url: flavorUrl + "/flavors"
                });
            },

            // data: {name: 'test', ram: 1024, vcpus: 2, disk: 20, is_public: true}
            createFlavor: function (data) {
                return $http({
                    method: "POST",
                    url: flavorUrl + "/flavor",
                    data: data
                });
            },

            // params: {flavorIds: ["flavorId1", "flavorId2"]}
            deleteFlavor: function (params) {
                return $http({
                    method: "DELETE",
                    url: flavorUrl + "/flavor",
                    params: params
                });
            },

            getFlavorExtras: function (flavorId) {
                return $http({
                    method: "GET",
                    url: flavorUrl + "/" + flavorId + "/extras"
                });
            },

            // data: {flavor_id: "flavor_id", key: "key-name", value: "value"}
            createFlavorExtra: function (flavorId, data) {
                return $http({
                    method: "POST",
                    url: flavorUrl + "/" + flavorId + "/extra",
                    data: data
                });
            },

            // data: {key: ["key1", "key2"]}
            deleteFlavorExtra: function (flavorId, data) {
                return $http({
                    method: "DELETE",
                    url: flavorUrl + "/" + flavorId + "/extra",
                    headers: { "Content-Type": "application/json" },
                    data: data
                });
            },

            getFlavorAccess: function (flavorId) {
                return $http({
                    method: "GET",
                    url: flavorUrl + "/os-access/" + flavorId
                });
            },

            // data: {flavor_id: "flavor_id", tenant_id: "tenant_id"}
            addFlavorAccess: function (flavorId, data) {
                return $http({
                    method: "POST",
                    url: flavorUrl + "/os-access/" + flavorId + "/action",
                    data: data
                });
            },

            // data: {tenant_id: ["tenant_id1", "tenant_id2"]}
            removeFlavorAccess: function (flavorId, data) {
                return $http({
                    method: "DELETE",
                    url: flavorUrl + "/os-access/" + flavorId + "/action",
                    headers: { "Content-Type": "application/json" },
                    data: data
                });
            },
            getPhyMacFlavors: function() {
                return $http({
                    method: "GET",
                    url: flavorUrl + "/physical/flavors"
                });
            },
            createPhyMacFlavors: function(data) {
                return $http({
                    method: "POST",
                    url: flavorUrl + "/physical/flavors",
                    data: data
                });
            },
            deletePhyMacFlavors: function(params) {
                return $http({
                    method: "DELETE",
                    url: flavorUrl + "/physical/flavors",
                    params: params
                });
            },
            getPhymacFlavorExtras: function(flavorId) {
                return $http({
                    method: "GET",
                    url: flavorUrl + "/physical/" + flavorId + "/extras"
                });
            },
            createPhymacFlavorExtra: function(flavorId, data) {
                return $http({
                    method: "POST",
                    url: flavorUrl + "/physical/" + flavorId + "/extra",
                    data: data
                });
            },
            deletePhymacFlavorExtra: function(flavorId, data) {
                return $http({
                    method: "DELETE",
                    url: flavorUrl + "/physical/" + flavorId + "/extra",
                    headers: { "Content-Type": "application/json" },
                    data: data
                });
            },
            editPhyMacFlavorExtra: function(flavorId, data) {
                return $http({
                    method: "PUT",
                    url: flavorUrl + "/physical/" + flavorId + "/extra",
                    data: data
                });
            },
            flavorsTable: [],
            flavorExtrasData: [],
            editData: {},
            selected_items: [],
            selectedItemsData: []
        };
    });