/**
 * Created by Weike on 2016/11/25.
 */
angular.module("dockerServicesSrvModule", [])
    .service("dockerServicesSrv", function ($rootScope, $http) {
        let staticUrl = "awstack-user/v1/k8s/";
        // get list of all dockerServices for current tenant.
        return {
            getDockerServices: function () {
                return $http({
                    method: "GET",
                    url: staticUrl + "dockerservices",
                    headers:{
                        "project_name" : localStorage.projectName,
                        "project_id" : localStorage.projectUid,
                        "domain_name" : localStorage.domainName,
                        "domain_id" : localStorage.domainUid
                    }
                });
            },

            getDockerServiceByName: function (serviceName) {
                return $http({
                    method: "GET",
                    url: staticUrl + "dockerservices/" + serviceName,
                    headers:{
                        "project_name" : localStorage.projectName,
                        "project_id" : localStorage.projectUid,
                        "domain_name" : localStorage.domainName,
                        "domain_id" : localStorage.domainUid
                    }
                });
            },

            getK8SNodes: function () {
                return $http({
                    method: "GET",
                    url: staticUrl + "readynodes",
                    headers:{
                        "project_name" : localStorage.projectName,
                        "project_id" : localStorage.projectUid,
                        "domain_name" : localStorage.domainName,
                        "domain_id" : localStorage.domainUid
                    }
                });
            },

            getAvailableNodePorts: function (number) {
                return $http({
                    method: "GET",
                    url: staticUrl + "nodeports",
                    params: {
                        number: number
                    },
                    headers:{
                        "project_name" : localStorage.projectName,
                        "project_id" : localStorage.projectUid,
                        "domain_name" : localStorage.domainName,
                        "domain_id" : localStorage.domainUid
                    }
                });
            },

            createDockerService: function (postData) {
                return $http({
                    method: "POST",
                    url: staticUrl + "dockerservices",
                    data: postData,
                    headers:{
                        "project_name" : localStorage.projectName,
                        "project_id" : localStorage.projectUid,
                        "domain_name" : localStorage.domainName,
                        "domain_id" : localStorage.domainUid
                    }
                });
            },

            deleteDockerServices: function (deleteParams) {
                return $http({
                    method: "DELETE",
                    url: staticUrl + "dockerservices",
                    params: deleteParams,
                    headers:{
                        "project_name" : localStorage.projectName,
                        "project_id" : localStorage.projectUid,
                        "domain_name" : localStorage.domainName,
                        "domain_id" : localStorage.domainUid
                    }
                });
            },

            selectedItemsData: null,
            dockerServicesData: null,
            selectedServiceData: null
        }
    });
