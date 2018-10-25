/**
 * Created by Weike on 2017/2/27.
 */
angular.module("dockerImagesSrvModule", [])
    .service("dockerImagesSrv", function ($rootScope, $http) {
        let staticUrl = "awstack-user/v1/k8s/harbor/";
        // let headers={
        //     "project_name" : encodeURI(localStorage.projectName),
        //     "project_id" : localStorage.projectUid,
        //     "domain_name" : encodeURI(localStorage.domainName),
        //     "domain_id" : localStorage.domainUid
        // }
        // get list of all dockerServices for current tenant.
        return {
            getUserId: function () {
                return $http({
                    method: "GET",
                    url: staticUrl + "userid",
                    headers:{
                        "project_name" : encodeURI(localStorage.projectName),
                        "project_id" : localStorage.projectUid,
                        "domain_name" : encodeURI(localStorage.domainName),
                        "domain_id" : localStorage.domainUid
                    }
                });
            },

            getHarborProjects: function (is_public) {
                return $http({
                    method: "GET",
                    url: staticUrl + "projects",
                    params: {is_public: is_public},
                    headers:{
                        "project_name" : encodeURI(localStorage.projectName),
                        "project_id" : localStorage.projectUid,
                        "domain_name" : encodeURI(localStorage.domainName),
                        "domain_id" : localStorage.domainUid
                    }
                });
            },

            getProjectDetails: function (projectId) {
                return $http({
                    method: "GET",
                    url: staticUrl + "projects/" + projectId,
                    headers:{
                        "project_name" : encodeURI(localStorage.projectName),
                        "project_id" : localStorage.projectUid,
                        "domain_name" : encodeURI(localStorage.domainName),
                        "domain_id" : localStorage.domainUid
                    }
                });
            },

            createHarborProjects: function (postData) {
                return $http({
                    method: "POST",
                    url: staticUrl + "projects",
                    data: postData,
                    headers:{
                        "project_name" : encodeURI(localStorage.projectName),
                        "project_id" : localStorage.projectUid,
                        "domain_name" : encodeURI(localStorage.domainName),
                        "domain_id" : localStorage.domainUid
                    }
                });
            },

            changePublicity: function (projectId, body) {
                return $http({
                    method: "PUT",
                    url: staticUrl + "projects/" + projectId,
                    data: body,
                    headers:{
                        "project_name" : encodeURI(localStorage.projectName),
                        "project_id" : localStorage.projectUid,
                        "domain_name" : encodeURI(localStorage.domainName),
                        "domain_id" : localStorage.domainUid
                    }
                });
            },

            deleteHarborProjects: function (projectIds) {
                return $http({
                    method: "DELETE",
                    url: staticUrl + "projects",
                    params: projectIds,
                    headers:{
                        "project_name" : encodeURI(localStorage.projectName),
                        "project_id" : localStorage.projectUid,
                        "domain_name" : encodeURI(localStorage.domainName),
                        "domain_id" : localStorage.domainUid
                    }
                });
            },

            getRepositories: function (projectId) {
                return $http({
                    method: "GET",
                    url: staticUrl + "projects/" + projectId + "/repositories",
                    headers:{
                        "project_name" : encodeURI(localStorage.projectName),
                        "project_id" : localStorage.projectUid,
                        "domain_name" : encodeURI(localStorage.domainName),
                        "domain_id" : localStorage.domainUid
                    }
                });
            },

            deleteRepositories: function (projectId, deletedRepos) {
                return $http({
                    method: "DELETE",
                    url: staticUrl + "projects/" + projectId + "/repositories",
                    params: deletedRepos,
                    headers:{
                        "project_name" : encodeURI(localStorage.projectName),
                        "project_id" : localStorage.projectUid,
                        "domain_name" : encodeURI(localStorage.domainName),
                        "domain_id" : localStorage.domainUid
                    }
                });
            },

            getRepositoryTags: function (projectId, repoName) {
                return $http({
                    method: "GET",
                    url: staticUrl + "projects/" + projectId + "/repositories/" + repoName + "/tags",
                    headers:{
                        "project_name" : encodeURI(localStorage.projectName),
                        "project_id" : localStorage.projectUid,
                        "domain_name" : encodeURI(localStorage.domainName),
                        "domain_id" : localStorage.domainUid
                    }
                });
            },

            deleteRepositoryTags: function (projectId, repoName, deletedTags) {
                return $http({
                    method: "DELETE",
                    url: staticUrl + "projects/" + projectId + "/repositories/" + repoName + "/tags",
                    params: deletedTags,
                    headers:{
                        "project_name" : encodeURI(localStorage.projectName),
                        "project_id" : localStorage.projectUid,
                        "domain_name" : encodeURI(localStorage.domainName),
                        "domain_id" : localStorage.domainUid
                    }
                });
            },

            getDockerImageManifests: function (repoName, tag) {
                return $http({
                    method: "GET",
                    url: staticUrl + "repositories/" + repoName + "/tags/" + tag + "/manifests",
                    headers:{
                        "project_name" : encodeURI(localStorage.projectName),
                        "project_id" : localStorage.projectUid,
                        "domain_name" : encodeURI(localStorage.domainName),
                        "domain_id" : localStorage.domainUid
                    }
                });
            },

            buildPushDockerImage: function (postData) {
                return $http({
                    method: "POST",
                    url: staticUrl + "dockerd/image",
                    headers: {
                        "Accept": "application/json",
                        // need AngularJS to set Content-Type.
                        "Content-Type": undefined,
                        "project_name" : encodeURI(localStorage.projectName),
                        "project_id" : localStorage.projectUid,
                        "domain_name" : encodeURI(localStorage.domainName),
                        "domain_id" : localStorage.domainUid
                    },
                    data: postData,
                    transformRequest: function (data, headersGetter) {
                        var formData = new FormData();
                        _.forEach(data, function (value, key) {
                            formData.append(key, value);
                        });
                        return formData;
                    }
                });
            },

            isPublic: 0,
            isMine: 0,
            userId: null,
            projectsData: null,
            repositoriesData: null,
            repositoryTagsData: null,
        }
    });
