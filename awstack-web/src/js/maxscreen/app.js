import "ip";
import { zh_CN } from "./i18n/zh_CN";
import { en_US } from "./i18n/en_US";
import * as maxscreenCtrl from "./controllers/maxscreenCtrl";
import * as directives from './directives/';
import * as services from './services/';
angular.module("app", ["ngRoute", "pascalprecht.translate","ngMessages", "ui.bootstrap","ui.bootstrap.tpls", "ngSanitize","ui.select","ngTable"])
    .constant("API_HOST", GLOBALCONFIG.APIHOST)
    .config(["$routeProvider", "$locationProvider", "$httpProvider", "$translateProvider",
        function($routeProvider, $locationProvider, $httpProvider, $translateProvider) {
            $translateProvider.translations("en", en_US);
            $translateProvider.translations("zh", zh_CN);
            $translateProvider.preferredLanguage("zh");
            $httpProvider.interceptors.push([
                "$q", "$rootScope", "API_HOST","$location",
                function(q, $rootScope, api_host,$location) {
                    return {
                        request: function(config) {
                            if (config.url.indexOf("awstack-monitor") > -1) {
                                var monitor_url = config.url.split("awstack-monitor");
                                config.url = api_host.MONITOR + monitor_url[1];
                            }
                            if (config.url.indexOf("awstack-user") > -1) {
                                var user_url = config.url.split("awstack-user");
                                config.url = api_host.BASE + user_url[1];
                            }
                            if (config.url.indexOf("awstack-resource") > -1) {
                                var resource_url = config.url.split("awstack-resource");
                                config.url = api_host.RESOURCE + resource_url[1];
                            }
                            var auth_token = localStorage.$AUTH_TOKEN;
                            config.headers["X-Auth-Token"] = auth_token;
                            config.headers["X-Register-Code"] =config.headers["X-Register-Code"]?config.headers["X-Register-Code"]:localStorage.regionKey;
                            return config;
                        },
                        response: function(res) {
                            if (/\.html/.test(res.config.url)) {
                                return res;
                            }
                            if (res.data.code === "00010101" || res.data.code === "00010105") {
                                $location.path("/").replace();
                            }
                            return res.data.data;
                        },
                        requestErr: function(rej) {
                            return rej;
                        },
                        responseErr: function(rej) {
                            return rej;
                        }
                    };
                }
            ]);
            $routeProvider
                .when("/", {
                    templateUrl: "/js/maxscreen/tmpl/maxscreen.html",
                    controller: "maxscreenCtrl"
                })
                
                .otherwise({ redirectTo: "/" });
        }
    ])
    .config(["$controllerProvider","$compileProvider", function($controllerProvider,$compileProvider){
        $controllerProvider.register(maxscreenCtrl);
        $compileProvider.directive(directives)
    }])
    .config(["$provide", function($provide){
        $provide.service(services);
    }])
    .controller("loginCtrl", ["$scope", "$http","$location",function($scope, $http,$location) {
        var self = $scope;
       
    }])
    .controller("mainCtrl", ["$scope", "$rootScope", "$routeParams","$location","$http","$translate", function($scope, $rootScope, $routeParams,$location,$http,translate) {
        var self = $scope;
        $rootScope.siteTitle="";
       
    }])
    .value('monitorCache',{
    })

    
