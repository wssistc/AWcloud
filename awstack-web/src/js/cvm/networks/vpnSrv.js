var vpnSrvModule = angular.module("vpnSrvModule", []);
vpnSrvModule.service('vpnSrv',function($http){
	 var static_url = "/awstack-resource/v1";
	 return{
	 	getVpnList: function() {
            return $http({
                method: "get",
                url: static_url + "/vpn/listIPSecSite"
            });
        },
        addVpn: function(options) {
            return $http({
                method: "POST",
                url: static_url + "/vpn/addVpn",
                data:options
            });
        },
        addSingleVpn: function(options,domainProject) {
            return $http({
                method: "POST",
                url: static_url + "/vpn/addVpn",
                data:options,
                headers:{
                    'domain_id':domainProject.depart.selected.domainUid,
                    'domain_name':encodeURI(domainProject.depart.selected.domainName),
                    'project_id':domainProject.pro.selected.projectId,
                    'project_name':encodeURI(domainProject.pro.selected.projectName)
                }
            });
        },
	 	getRoutersList: function() {
            return $http({
                method: "get",
                url: static_url + "/vpn/listAvaliableRouters"
            });
        },
        getSublistOfRouter: function(routerId) {
            return $http({
                method: "get",
                url: static_url + "/vpn/"+routerId+"/getRouterSubnets"
            });
        },
        getVpnDetail:function(vpnId){
            return $http({
                method: "get",
                url: static_url + "/vpn/"+vpnId+"/getIPSecSiteDetail"
            });
        },
        availableLocalSubnet:function(routerId,vpnId){
            return $http({
                method: "get",
                url: static_url + "/vpn/"+routerId+"/"+vpnId+"/listAvaliableRouterSubnets",
            });
        },
        updateEndpointGroup:function(IPSecSiteId,options){
            return $http({
                method: "put",
                url: static_url + "/vpn/"+IPSecSiteId+"/updateVPNEndpointGroup",
                data:options
            }); 
        },
        updateVpn:function(options){
            return $http({
                method: "put",
                url: static_url + "/vpn/updateIPSecSite",
                data:options
            });
        },
        disabledVPN:function(options){
            return $http({
                method: "put",
                url: static_url + "/vpn/disabledVPN",
                data:options
            });
        },
        enabledVPN:function(options){
            return $http({
                method: "put",
                url: static_url + "/vpn/enabledVPN",
                data:options
            });
        },
        deleteVPN:function(params){
            return $http({
                method: "delete",
                url: static_url + "/vpn/deleteVPN",
                data:params
            });
        },
        getStatus:function(params){
            return $http({
                method: "put",
                url: static_url + "/vpn/askIPSecSiteStatus",
                data:params
            });
        }
	 	
	 };
});