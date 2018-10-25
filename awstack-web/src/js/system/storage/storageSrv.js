angular
    .module("storagesrv", [])
    .service("storageSrv",storageSrv);

storageSrv.$inject = ["$http"];

function storageSrv($http){
    
    return {
        getDevice:function(options){
            return $http({
                method: "POST",
                url: "/awstack-resource/v1/toyou_storage_base_info_query",
                data:options
            });
        },
        getInit:function(options){
            return $http({
                method: "POST",
                url: "/awstack-resource/v1/volume_type_initialize_all_in",
                data:{
                    "Vendor":"TOYOU",
                    "Keystone_message": {
                         "auth_url": "http://192.168.253.162:20001/keystone/v3",
                         "username": "admin",
                         "password": "AWcloud!23",
                         "project_name": "admin",
                         "project_domain_name": "default",
                         "user_domain_name": "default"
                         }
                }

            });
        },
        getFeatures:function(options){
            return $http({
                method: "POST",
                url: "/awstack-resource/v1/storage_license_options_query",
                data:options
            });
        },
        getVoltype:function(options){
            return $http({
                method: "POST",
                url: "/awstack-resource/v1/volume_type_match",
                data:options
            });
        },
        getPoolInfo:function(options){
            return $http({
                method: "POST",
                url: "/awstack-resource/v1/storage_pool_info_query",
                data:options
            });
        },
        volume_type_analysis:function(options){
            return $http({
                method: "POST",
                url: "/awstack-resource/v1/volume_type_analysis",
                data:options
            });
        },
        addCustomStorage:function(data){
            return $http({
                method:"POST",
                url:"/awstack-resource/v1/storage",
                data:data
            })
        },
        getStorageList:function(options){
            return $http({
                method:"GET",
                url:"/awstack-resource/v1/storage/storagelist",
                params:options
            })
        },
        editStorage:function(options){
            return $http({
                method:"PUT",
                url:"/awstack-resource/v1/storage/editstorage",
                data:options
            }) 
        },
        isActivityStorage:function(options){
            return $http({
                method:"PUT",
                url:"/awstack-resource/v1/storage/activitystorage",
                data:options
            }) 
        },
        deleteStorage:function(id){
            return $http({
                method:"DELETE",
                url:"/awstack-resource/v1/storage/deletestorage?storageIds="+id
            }) 
        }

    }

}