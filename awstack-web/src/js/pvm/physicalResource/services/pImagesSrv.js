
export function pImagesSrv($http){
    var images_api_url = "awstack-resource/v1/physical/images";
	var image_api_url = "awstack-resource/v1/physical/image";
    return {
        getImages: function() {
            return $http({
                method: "GET",
                url: images_api_url,
            });
		},
		delImages: function(options,names) {
			return $http({
                method: "DELETE",
                url: images_api_url,
                params:options
            });
		},
		createImage: function(options) {
            return $http({
                method: "POST",
                url: images_api_url,
                data:options
            });
		},
		editImage: function(options) {
            return $http({
                method: "PUT",
                url: image_api_url + "/" + options.imageUid,
                data:options
            });
		},
		getImagesDetail: function(options) {
            return $http({
                method: "GET",
                url: images_api_url + "/" + options
            });
		},
		getStatus: function(options) {
            return $http({
                method: "GET",
                url: images_api_url + "polling",
                params:options
            });       
        },
        getOSversion: function() {
            return $http({
                method: "get",
                url: "awstack-user/v1" + "/params",
                params:{
                    parentId:26 
                }
            });       
        },

    };
}

pImagesSrv.$inject = ["$http"];