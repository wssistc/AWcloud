var tableService = angular.module("imagesSrv", []);
tableService.service("imagesSrv", function($rootScope, $http, backendSrv) {
	var images_api_url = "awstack-resource/v1/images";
	var image_api_url = "awstack-resource/v1/image";
	var imagebuffer_api = "awstack-resource/v1/uploadimagez/space";
	return {
		getImages: function() {
			return backendSrv.get(images_api_url, "");
		},
		delImages: function(options) {
			return backendSrv.delete(images_api_url, "", options);
		},
		createImage: function(options) {
			return backendSrv.post(image_api_url, options);
		},
		editImage: function(options) {
			return backendSrv.put(image_api_url + "/" + options.imageUid, options);
		},
		getImagesDetail: function(options) {
			return backendSrv.get(images_api_url + "/" + options, "", "");
		},
		getStatus: function(options) {
            return $http({
                method: "get",
                url: images_api_url + "polling",
                params:options
            });       
        },
        getBuffer: function() {
            return $http({
                method: "get",
                url: imagebuffer_api+'/info'
            });       
        },
        getBufferPolling: function(headers) {
            return $http({
                method: "get",
                headers:headers,
                url: imagebuffer_api+'/info'
            });       
        },
        delBuffer: function() {
            return $http({
                method: "delete",
                url: imagebuffer_api
            });       
        }

	};
});
