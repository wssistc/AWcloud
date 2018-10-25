var tableService = angular.module("balanceSrv",[]);
 tableService.service('balanceDataSrv', function($rootScope,$http){
  var static_url='/awstack-resource/v1/';
  return {
    //���ؾ����
    getBalancers:function(){
      return $http({
        method:'get',
        url:static_url+'lbaas/loadbalancers'
      })
    },
    getsubnets:function(){
      return $http({
        method:'get',
        url: static_url + "subnets"
      })
    },
    createBalancer: function (options) {
      return $http({
          method: "POST",
          url: static_url + "lbaas/loadbalancers/",
          data: options
      });
    },
    editBalancer: function (options) {
      return $http({
          method: "PUT",
          url: static_url + "lbaas/loadbalancers/" + options.id,
          data: options
      });
    },
    deleteBalancer: function (ids) {
      return $http({
          method: "DELETE",
          url: static_url + "lbaas/loadbalancers",
          params: ids
      });
    },
    getBalancersDetail:function(loadbalancerId){
      return $http({
        method:'get',
        url:static_url+'lbaas/loadbalancers/'+loadbalancerId
      })
    },
    //Listener
    getListeners:function(options){
      return $http({
        method:'get',
        url: static_url + 'lbaas/loadbalancers/' + options+ "/listeners"
      })
    },
    createListeners: function (options) {
      return $http({
          method: "POST",
          url: static_url + "lbaas/loadbalancers/" + options.id + "/listeners",
          data: options
      });
    },
    editListeners: function(loadBalancerId,listeners){
      return $http({
        method: 'PUT',
        url: static_url + "lbaas/loadbalancers/" + loadBalancerId + "/listeners/" + listeners.id,
        data:listeners
      })
    },
    deleteListener: function (loadBalancerId,ids) {
      return $http({
          method: "DELETE",
          url: static_url + "lbaas/loadbalancers/" + loadBalancerId + "/listeners",
          params: ids
      });
    },
    getListenersDetail:function(loadBalancerId,listenerId){
      return $http({
        method:'get',
        url: static_url + "lbaas/loadbalancers/" + loadBalancerId +"/listeners/" + listenerId
      })
    },
    //pools
    getPools:function(options){
      return $http({
        method:'get',
        url: static_url + 'lbaas/loadbalancers/' + options + "/pools"
      })
    },
    createPools: function (options) {
      return $http({
          method: "POST",
          url: static_url + "lbaas/loadbalancers/" + options.id + "/pools",
          data: options
      });
    },
    editPools: function(loadBalancerId,pools){
      return $http({
        method: 'PUT',
        url: static_url + "lbaas/loadbalancers/" + loadBalancerId + "/pools/" + pools.id,
        data:pools
      })
    },
    deletePools: function (loadBalancerId,ids) {
      return $http({
          method: "DELETE",
          url: static_url + "lbaas/loadbalancers/" + loadBalancerId + "/pools",
          params: ids
      });
    },
    getPoolsDetail:function(loadBalancerId,poolId){
      return $http({
        method:'get',
        url: static_url + "lbaas/loadbalancers/" + loadBalancerId +"/pools/" + poolId
      })
    },
    //members
    getMembers:function(loadBalancerId,options){
      return $http({
        method:'get',
        url: static_url + 'lbaas/loadbalancers/' + loadBalancerId + "/pools/" + options + "/members"
      })
    },
    createMembers: function (loadBalancerId,options) {
      return $http({
          method: "POST",
          url: static_url + 'lbaas/loadbalancers/' + loadBalancerId + "/pools/" + options.id + "/members",
          data: options
      });
    },
    editMembers: function(loadBalancerId,poolId,options){
      return $http({
          method: 'PUT',
          url: static_url + 'lbaas/loadbalancers/' + loadBalancerId + "/pools/" + poolId + "/members/" + options.id,
          data: options
      })
    },
    deleteMembers: function (loadBalancerId,options,ids) {
      return $http({
          method: "DELETE",
          url: static_url + "lbaas/loadbalancers/" + loadBalancerId + "/pools/" + options + "/members",
          params: ids
      });
    },
    getMembersDetail:function(loadBalancerId,poolId,memberId){
      return $http({
        method:'get',
        url: static_url + "lbaas/loadbalancers/" + loadBalancerId +"/pools/" + poolId + "/members/" + memberId
      })
    },
    getHealthMonitors: function() {
        return $http({
            method: "GET",
            url: "awstack-resource/v1/lbaas/healthmonitors"    
        });
    },
    newHealthMonitors: function(options) {
        return $http({
            method: "POST",
            url: "awstack-resource/v1/lbaas/healthmonitors",
            data: options
        });
    },
    editHealthMonitors: function(options,mId) {
        return $http({
            method: "PUT",
            url: "awstack-resource/v1/lbaas/healthmonitors/"+mId,
            data: options  
        });
    },
    delHealthMonitors: function(options) {
        return $http({
            method: "DELETE",
            url: "awstack-resource/v1/lbaas/healthmonitors" ,
            params: options  
        });
    },
    HealthMonitorsDetail:function(options){
        return $http({
            method: "GEt",
            url: "awstack-resource/v1/lbaas/healthmonitors/"+options 
        });
    },
    listenerList:[]
    
    
  }
})
