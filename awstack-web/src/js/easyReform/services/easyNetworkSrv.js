
export function easyNetworkSrv($http){
    var static_url = "/awstack-resource/v1"
    return {
        easyNetwork:function(data,header,regionKey){
            return $http({
                method:"POST",
                url:"awstack-resource/v1/fast/"+regionKey+"/networks",
                data:data,
                headers:header
            })
        }
    };
}

easyNetworkSrv.$inject = ["$http"];