var tableService = angular.module("affinitySrv", []);
tableService.service('affinitySrv', function ($rootScope, $http) {
    var static_url = '/awstack-resource/v1/';
    return {
      getAffinityGroupList: function () {
        return $http({
          method: 'get',
          url: static_url + 'server/groups'
        })
      },
      creatAffinityGroup: function (data) {
        return $http({
          method: 'POST',
          url: static_url + 'server/groups',
          data: data
        })
      },
      delAffinityGroups:function(ids,names){
         return $http({
          method: 'DELETE',
          url: static_url + 'server/groups',
          params: {
                    ids: ids,
                    names: names
                },
        })
      },
      getAffinityGroupMembers:function(id){
        return $http({
          method: 'get',
          url: static_url + 'server/groups/'+id
        })
      }

    }

  })