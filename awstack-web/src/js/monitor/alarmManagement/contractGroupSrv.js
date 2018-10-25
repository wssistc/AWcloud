var contactGroupSrvModule = angular.module("contactGroupSrvModule", []);
contactGroupSrvModule.service("contactGroupSrv", function($rootScope, $http) {
    var static_url = "/awstack-monitor/v1";
    return {
        getContactGroup:function(headers){
            return $http({
                method:"GET",
                url:static_url+"/contactLists",
                headers:headers
            });
        },
        addContactGroup:function(options){
            return $http({
                method:"POST",
                url:static_url+"/contactLists",
                data:options
            });
        },
        initAddContactGroup:function(options,headers){
            return $http({
                method:"POST",
                url:static_url+"/contactlists/os-initialize",
                data:options,
                headers:headers
            });
        },
        getOneContactGroup:function(options){
            return $http({
                method:"GET",
                url:static_url+"/contactLists/"+options
            });
        },
        editContactGroup:function(options){
            return $http({
                method:"PUT",
                url:static_url+"/contactLists/"+options.id,
                data:options.data
            });
        },
        delContactGroup:function(options){
            return $http({
                method:"DELETE",
                url:static_url+"/contactLists",
                params:options
            });
        },
        getContactsOfGroup:function(options){
            return $http({
                method:"GET",
                url:static_url+"/list/"+options+"/contacts"
            });
        },
        editContact:function(options){
            return $http({
                method:"PUT",
                url:static_url+"/contacts/"+options.id,
                data:options.data
            });
        },
        delContact:function(options){
            return $http({
                method:"DELETE",
                url:static_url+"/contacts/"+options
            });
        },
        getWechatName: function(name) {
            return $http({
                method: "GET",
                url: static_url + "/wechat/user/" + localStorage.enterpriseUid + "/" + name
            })
        }
    };
});