var module = angular.module("backendsrv", []);

module.service("backendSrv", function($rootScope, $http) {
    this.get = function(url, data, params,headers) {
        return this.request({ method: "GET", url: url, data: data, params: params ,headers:headers});
    };

    this.delete = function(url, data, params) {
        return this.request({ method: "DELETE", url: url, data: data, params: params });
    };

    this.post = function(url, data, params) {
        return this.request({ method: "POST", url: url, data: data, params: params });
    };

    this.patch = function(url, data, params) {
        return this.request({ method: "PATCH", url: url, data: data, params: params });
    };

    this.put = function(url, data, params) {
        return this.request({ method: "PUT", url: url, data: data, params: params });
    };

    this.request = function(options) {
        options.retry = options.retry || 0;
        return $http(options).then(function(results) {
            return results;
        });
    };

});
