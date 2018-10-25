
export function pNetworkSrv($http){
    var api_url = "awstack-resource/v1/physical/networks";
    var api_url_ = "awstack-resource/v1/physical/network";
    var api_url_subnet = "awstack-resource/v1/physical/subnets"
    return {
        getNetworks: function () {
            return $http({
                method: "GET",
                url: api_url
            });
        },
        editNetworks: function (id,data) {
            return $http({
                method: "PUT",
                url: api_url+"/"+id,
                data:data
            });
        },
        createNetwork: function (option) {
            return $http({
                method: "POST",
                url: api_url,
                data: option
            });
        },
        delNetworks: function (ids, names) {
            return $http({
                method: "DELETE",
                url: api_url,
                params: {
                    ids: ids,
                    names: names
                },

            });
        },
        createSubnet: function (option) {
            return $http({
                method: "POST",
                url: api_url_subnet,
                data: option
            });
        },
        delSubnets: function (ids, names) {
            return $http({
                method: "DELETE",
                url: api_url_subnet,
                params: {
                    ids: ids,
                    names: names
                },

            });
        },
        editSubnet: function (options,id) {
            return $http({
                method: "PUT",
                url: api_url_subnet + "/" + id,
                data: options
            });

        },
        getNetworkDetail: function (id) {
            return $http({
                method: "GET",
                url: "awstack-resource/v1/physical/networksDetail/"+id
            });
		},
		getPortInfo:function(id){
            return $http({
                method: "GET",
                url: api_url_+"/ports/"+id
            });
		}
    };
}

pNetworkSrv.$inject = ["$http"];