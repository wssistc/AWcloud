
maxpcshowSrv.$inject = ["$http"];
export function maxpcshowSrv($http){
    return{
        getCephList:function(){
            return $http({
                method: "GET",
                url: "/awstack-user/v1/region/"+ localStorage.regionKey+"/ceph",
            });
        }
    }

}