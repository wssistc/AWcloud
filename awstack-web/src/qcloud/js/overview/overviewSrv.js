angular.module("overviewsrv", [])
.service("overviewSrv", function($rootScope, $http) {
    var static_cbs_url= "http://192.168.137.33:8080/awcloud-qcloud/v1/cbs/";
    var static_vms_url="http://192.168.137.33:8080/awcloud-qcloud/v1/vms/";
    return {
        getList:function(){
            var data = {
                name:"overview"
            }
            return data
        },
        getVmStatus: function(data) {
            return $http({
                method: "POST",
                url: static_vms_url + "getVmStatistics",
                data:data
            });       
        },
        getQuotaOverview: function(data) {
            return $http({
                method: "POST",
                url: static_vms_url + "getQuotaOverview",
                data:data
            });       
        },
        getQcloudToken:function(data){
            return $http({
                method: "GET",
                url:"http://192.168.137.33:8080/awcloud-qcloud/exclude/enterprises/" + localStorage.enterpriseUid + "/loginOnce/?awcloudtoken=" + localStorage.$AUTH_TOKEN
            }); 
        }
    };

});
