/**
 * Created by Weike on 2016/6/6.
 */
angular.module("keyPairsSrvModule", [])
    .service("keyPairsSrv", function($http) {
        var keyPairsUrl = "http://192.168.138.134:8081/awstack-resource/v1";

        return {
            getKeyPairs: function() {
                return $http({
                    method: "GET",
                    url: keyPairsUrl + "/os-keypairs"
                });
            },

            createKeyPair: function(data) {
                return $http({
                    method: "POST",
                    url: keyPairsUrl + "/os-keypair",
                    data: data
                });
            },

            // name: {name: 'name', public_key: 'ssh-rsa ...'}
            importKeyPair: function(data) {
                return $http({
                    method: "POST",
                    url: keyPairsUrl + "/os-keypair/import",
                    data: data
                });
            },

            // data: {name: ['name1', 'name2', ...]}
            deleteKeyPair: function(data) {
                return $http({
                    method: "DELETE",
                    url: keyPairsUrl + "/os-keypair",
                    headers: { "Content-Type": "application/json" },
                    data: data
                });
            },

            keypairsTable: []
        };
    });
