/**
 * Created by Weike on 2016/10/13.
 */
angular.module("dockerClustersSrvModule", [])
    .service("dockerClustersSrv", function ($rootScope, $http) {
        let staticUrl = "awstack-user/v1/k8s/";
        // get list of all dockerclusters for current tenant.
        return {
            getDockerClusters: function () {
                return $http({
                    method: "GET",
                    url: staticUrl + "dockerclusters",
                    headers:{
                        "project_name" : encodeURI(localStorage.projectName),
                        "project_id" : localStorage.projectUid,
                        "domain_name" : encodeURI(localStorage.domainName),
                        "domain_id" : localStorage.domainUid
                    }
                });
            },

            createDockerCluster: function (postData) {
                return $http({
                    method: "POST",
                    url: staticUrl + "dockerclusters",
                    data: postData,
                    headers:{
                        "project_name" : encodeURI(localStorage.projectName),
                        "project_id" : localStorage.projectUid,
                        "domain_name" : encodeURI(localStorage.domainName),
                        "domain_id" : localStorage.domainUid
                    }
                });
            },

            deleteDockerClusters: function (deleteParams) {
                return $http({
                    method: "DELETE",
                    url: staticUrl + "dockerclusters",
                    params: deleteParams,
                    headers:{
                        "project_name" : encodeURI(localStorage.projectName),
                        "project_id" : localStorage.projectUid,
                        "domain_name" : encodeURI(localStorage.domainName),
                        "domain_id" : localStorage.domainUid
                    }
                });
            },

            scaleDockerCluster: function (putData) {
                return $http({
                    method: "PUT",
                    url: staticUrl + "dockerclusters",
                    data: putData,
                    headers:{
                        "project_name" : encodeURI(localStorage.projectName),
                        "project_id" : localStorage.projectUid,
                        "domain_name" : encodeURI(localStorage.domainName),
                        "domain_id" : localStorage.domainUid
                    }
                });
            },

            getDockerClustersDetail: function (clusterName) {
                return $http({
                    method: "GET",
                    url: staticUrl + "dockerclusters/" + clusterName,
                    headers:{
                        "project_name" : encodeURI(localStorage.projectName),
                        "project_id" : localStorage.projectUid,
                        "domain_name" : encodeURI(localStorage.domainName),
                        "domain_id" : localStorage.domainUid
                    }
                });
            },

            getDockerContainerLogs: function (replicaName, containerName) {
                return $http({
                    method: "GET",
                    url: staticUrl + "dockerclusterreplica/" + replicaName + "/log/" + containerName,
                    headers:{
                        "project_name" : encodeURI(localStorage.projectName),
                        "project_id" : localStorage.projectUid,
                        "domain_name" : encodeURI(localStorage.domainName),
                        "domain_id" : localStorage.domainUid
                    }
                });
            },

            getDockerContainerStats: function (hostIP, podId, containerId) {
                return $http({
                    method: "GET",
                    url: staticUrl + "nodes/" + hostIP + "/kubepods/" + podId + "/container/" + containerId + "/stats",
                    headers:{
                        "project_name" : encodeURI(localStorage.projectName),
                        "project_id" : localStorage.projectUid,
                        "domain_name" : encodeURI(localStorage.domainName),
                        "domain_id" : localStorage.domainUid
                    }
                });
            },

            deleteDockerClusterReplicas: function (clusterReplicas) {
                return $http({
                    method: "DELETE",
                    url: staticUrl + "dockerclusterreplica",
                    params: clusterReplicas,
                    headers:{
                        "project_name" : encodeURI(localStorage.projectName),
                        "project_id" : localStorage.projectUid,
                        "domain_name" : encodeURI(localStorage.domainName),
                        "domain_id" : localStorage.domainUid
                    }
                });
            },

            getContentList:function(){
                return $http({
                    method:"GET",
                    url:"awstack-user/v1/enterprises/"+localStorage.enterpriseUid+"/regions/"+JSON.parse(localStorage.$LOGINDATA).regionUid+"/plugins/all"
                });
            },
            
            startMonitor: false,

            selectedClustersData: null,
            selectedClusterReplicaData: null,
            selectedContainerData: null
        }
    });
