/**
 * Created by Weike on 2017/2/27.
 */
import "./dockerImagesSrv";

angular.module("dockerImagesModule", ["ngTable", 'ngAnimate', 'angularFileUpload', 'ui.bootstrap', "ui.select", "dockerImagesSrvModule"])
    .controller("harborProjectsCtrl", function ($scope, $translate, $rootScope, $uibModal, $interval, NgTableParams, dockerImagesSrv,$location,detailFactory,$filter) {
        $scope.isPublic = dockerImagesSrv.isPublic;
        $scope.userId = dockerImagesSrv.userId;
        $scope.canDelete = false;
        $scope.selectedItemsAllCanDelete = false;
        $scope.selectedItemsData = [];
        $scope.selectedItems = [];
        $scope.setPublicity = function (isPublic) {
            $scope.isPublic = isPublic;
            dockerImagesSrv.isPublic = isPublic;
        };
        var self = $scope;
        if(localStorage.installK8s==1){
            self.pluginSwitch=1;
        }else{
            self.pluginSwitch=2;
            return;
        }
        $scope.harborProject_search = {
            globalSearchTerm: ""
        }

        $scope.applyGlobalSearch = function() {
            if(!$scope.tableParams) return

            $scope.tableParams.filter({
                searchTerm: $scope.harborProject_search.globalSearchTerm
            });
        };


        $scope.showDetails = function (id, name) {
            $location.search({id: encodeURIComponent(id), name: encodeURIComponent(name)});
            detailFactory.pageTitle.imgTitle = name
        }

        $scope.$watch(function () {
            return detailFactory.moveTo
        }, function (value) {
            $scope.moveTo = value
        }, true)

        $scope.$watch(function () {
            return detailFactory.moveToLeft
        }, function (value) {
            $scope.moveToLeft = value
        }, true)

        $scope.handleDetail = function () {
            $location.url('/k8s/projects')
        }

        $scope.toRightOnce = function(){
            $scope.moveTo = false;
            $scope.moveToLeft = false;
            detailFactory.moveTo = false;
            detailFactory.moveToLeft = false;
            detailFactory.showIt.showImgWarehouse = false;
        }

        $scope.toRight = function () {
            $scope.moveTo = false;
            $scope.moveToLeft = false;
            detailFactory.moveTo = false;
            detailFactory.moveToLeft = false;
            detailFactory.showIt.showImgWarehouse = false;
            detailFactory.showIt.showImgLog = false;
        }

        $scope.toRightAgain = function () {
            $scope.moveToLeft = false;
            detailFactory.moveToLeft = false;
            detailFactory.showIt.showImgLog = false;
        }

        $scope.$watch(function () {
            return detailFactory.showIt
        }, function (value) {
            $scope.showImgWarehouse = value.showImgWarehouse
            $scope.showImgLog = value.showImgLog
        }, true)

        $scope.$watch(function () {
            return detailFactory.pageTitle
        }, function (value, old) {
            $scope.imgTitle = value.imgTitle
            $scope.imgWarehouseTitle = value.imgWarehouseTitle
            $scope.imgLogTitle = value.imgLogTitle
        }, true)

        $scope.$watch(function () {
            return $scope.isPublic;
        }, function (newIsPublic, oldIsPublic) {
            if(newIsPublic !== oldIsPublic) {
                $scope.refresh();
            }
        });

        $scope.$watch(function () {
            return $scope.selectedItemsData;
        }, function (selectedItemsData) {
            if (selectedItemsData.length === 0) {
                $scope.selectedItemsAllCanDelete = false;
                return;
            }
            for (let i = 0; i < selectedItemsData.length; i++) {
                if (selectedItemsData[i]["repo_count"] > 0) {
                    $scope.selectedItemsAllCanDelete = false;
                    return;
                }
            }
            $scope.selectedItemsAllCanDelete = true;
        });

        $scope.getUserId = function () {
            dockerImagesSrv.getUserId().then(function (result) {
                if (result && result.status === 0) {
                    dockerImagesSrv.userId = parseInt(result.data);
                    $scope.userId = dockerImagesSrv.userId;
                }
            });
        };

        $scope.initData = function () {
            dockerImagesSrv.getHarborProjects($scope.isPublic).then(function (result) {
                if (!result) {
                    dockerImagesSrv.projectsData = [];
                    return;
                }
                // console.log(result.data)
                result.data.forEach(function(item){
                    item.creationTime = $filter('localDate')(item["creation_time"]);
                    item.searchTerm = [item.name,item.repo_count,item["owner_id"] === $scope.userId ? "项目拥有者" : "项目使用者",item.creationTime,item["public"] == 1 ? "是" : "否"].join("\b")

                })
                dockerImagesSrv.projectsData = result.data;
                // console.log("getHarborProjects results:\n", result.data);

                $scope.getUserId();
            });
        };

        $scope.initData();
        $scope.refresh = function () {
            $scope.harborProject_search.globalSearchTerm = "";
            $scope.applyGlobalSearch();
            $scope.initData();
        };

        $scope.$watch(function () {
            return dockerImagesSrv.projectsData;
        }, function (data) {
            if (data != null && data != undefined) {
                $scope.tableParams = new NgTableParams({
                    count: 10, sorting: {project_id: "asc"}
                }, {counts: [], dataset: data});

                $scope.checkboxes = {
                    checked: false,
                    items: {}
                };

                $scope.$watch(function () {
                    return $scope.tableParams.page();
                }, function (data) {
                    $scope.checkboxes.checked = false;
                    $scope.checkboxes.items = {};
                });

                $scope.$watch(function () {
                    return $scope.checkboxes.checked;
                }, function (checked) {
                    angular.forEach($scope.tableParams.data, function (item) {
                        $scope.checkboxes.items[item.project_id] = checked;
                    });
                });

                $scope.$watch(function () {
                    return $scope.checkboxes.items;
                }, function (values) {
                    $scope.selectedItemsData = [];
                    let checkedItems = [];
                    let checked = 0,
                        unchecked = 0,
                        total = $scope.tableParams.data.length;

                    angular.forEach($scope.tableParams.data, function (item) {
                        if (item["owner_id"] !== $scope.userId) {
                            $scope.checkboxes.items[item.project_id] = false;
                        }
                        checked += ($scope.checkboxes.items[item.project_id]) || 0;
                        unchecked += (!$scope.checkboxes.items[item.project_id]) || 0;
                        if ($scope.checkboxes.items[item.project_id]) {
                            checkedItems.push(item.project_id);
                            $scope.selectedItemsData.push(item);
                            $scope.currentItemData = item;
                        }
                    });
                    $scope.selectedItems = checkedItems;
                    if ((unchecked == 0) || (checked == 0)) {
                        if (total > 0) {
                            $scope.checkboxes.checked = (checked == total);
                        }
                    }
                    if (checked === 0) {
                        $scope.canDelete = false;
                    } else if (checked === 1) {
                        $scope.canDelete = true;
                    } else {
                        $scope.canDelete = true;
                    }
                    angular.element(".select-all").prop("indeterminate", (checked != 0 && unchecked != 0));
                }, true);
            }
        }, true);

        $scope.createProject = function () {
            let scope = $rootScope.$new();

            scope.createProjectData = {
                name: "",
                isPublic: false
            };

            let createProjectModel = $uibModal.open({
                animation: true,
                templateUrl: "createProject.html",
                scope: scope
            });

            return createProjectModel.result.then(function (createProjectData) {
                let postData = {
                    project_name: createProjectData["name"],
                    is_public: createProjectData["isPublic"] ? 1 : 0
                };

                // console.log("postData:\n", postData);
                dockerImagesSrv.createHarborProjects(postData).then(function (result) {
                    $scope.refresh();
                    if ($scope.isPublic == 1) {
                        $scope.isPublic = 0;
                        dockerImagesSrv.isPublic = 0;
                    }
                });
            });
        };

        $scope.deleteHarborProjects = function (projectId) {
            if (projectId !== undefined) {
                $scope.selectedItems = [projectId]
            }
            $scope.$emit("delete", {
                target: "deleteHarborProjects",
                msg: "<span>" + $translate.instant("aws.k8s.dockerImages.confirmDeleteDockerImages") + "</span>"
            });
        };

        $scope.$on("deleteHarborProjects", function () {
            let deleteParams = {projectIds: $scope.selectedItems};
            // console.info("deletedServices:\n", deleteParams);
            dockerImagesSrv.deleteHarborProjects(deleteParams).then(function (result) {
                $scope.refresh();
            });
        });

        $scope.changePublicity = function (project_id, isPublic) {
            dockerImagesSrv.changePublicity(project_id, {is_public: isPublic == 0 ? 1 : 0})
                .then(function (result) {
                    $scope.refresh();
                });
        };

    })
    .controller("harborProjectDetailsCtrl", function ($scope, $translate, $rootScope, $routeParams, $location, $uibModal, $interval, NgTableParams, FileUploader, dockerImagesSrv, detailFactory) {
        $scope.projectId = $location.search().id;
        detailFactory.pageTitle.imgTitle = $location.search().name;
        $scope.isMine = dockerImagesSrv.isMine;
        
        $scope.harborProjectDetails_search = {
            globalSearchTerm : ""
        }

        $scope.applyGlobalSearch = function() {
            if(!$scope.tableParams) return
            $scope.tableParams.filter({
                searchTerm: $scope.harborProjectDetails_search.globalSearchTerm
            });
        };


        $scope.$watch(function () {
            return $location.search().id
            // return $routeParams.clusterName;
        }, function (clusterName) {
            if (!clusterName) return
            $scope.projectId = $location.search().id
            $scope.initData();
            // $scope.animation = clusterName ? "animateIn" : "animateOut";
        });

        // $scope.$watch(function () {
        //     return $routeParams.projectId;
        // }, function (projectId) {
        //     $scope.animation = projectId ? "animateIn" : "animateOut";
        // });

        // $scope.goBack = function () {
        //     $location.path("/k8s/projects");
        // };

        $scope.encodeURL = function (url) {
            // 需要对docker镜像仓库的名称（比如：'library/nginx'）使用 encodeURIComponent 转换2次！
            // 结果是 'library%252Fnginx'
            return encodeURIComponent(encodeURIComponent(url));
        };

        $scope.goImgWarehouseDetails = function (imgWarehouseName, ip) {
            detailFactory.moveTo = true
            detailFactory.showIt.showImgWarehouse = true
            detailFactory.pageTitle.imgWarehouseTitle = imgWarehouseName.split("/")[1];
            detailFactory.imgWarehouseData = {
                imgName: $scope.projectId,
                imgWarehouseName: imgWarehouseName
            };
        }

        $scope.initData = function () {
            if (!$scope.projectId) return
            dockerImagesSrv.getRepositories($scope.projectId).then(function (result) {
                if (!result || result.status !== 0 || result.msg !== "OK") {
                    dockerImagesSrv.repositoriesData = [];
                    return;
                }
                dockerImagesSrv.repositoriesData = [];
                $scope.harbor = result.data.harbor;
                // console.log(result.data.repos)
                _.forEach(result.data.repos, function (repo) {
                    dockerImagesSrv.repositoriesData.push({name: repo , searchTerm : ($scope.harbor + "/" + repo)});
                });
                // console.log("getRepositories results:\n", dockerImagesSrv.repositoriesData);
            });
            dockerImagesSrv.getProjectDetails($scope.projectId).then(function (result) {
                if (result && result.status == 0) {
                    $scope.projectName = result.data["name"];
                    $scope.isMine = result.data["is_mine"];
                    dockerImagesSrv.isMine = $scope.isMine;
                    $scope.isPublic = result.data["public"];
                    dockerImagesSrv.isPublic = $scope.isPublic;
                }
            });
        };

        $scope.initData();
        $scope.refresh = function () {
            $scope.harborProjectDetails_search.globalSearchTerm = "";
            $scope.applyGlobalSearch();
            $scope.initData();
        };

        $scope.$watch(function () {
            return dockerImagesSrv.repositoriesData;
        }, function (data) {
            if (data != null && data != undefined) {
                $scope.tableParams = new NgTableParams({
                    count: 10, sorting: {name: "asc"}
                }, {counts: [], dataset: data});

                $scope.search = function (searchIterm) {
                    $scope.tableParams.filter({$: searchIterm});
                };

                $scope.checkboxes = {
                    checked: false,
                    items: {}
                };

                $scope.$watch(function () {
                    return $scope.tableParams.page();
                }, function (data) {
                    $scope.checkboxes.checked = false;
                    $scope.checkboxes.items = {};
                });

                $scope.$watch(function () {
                    return $scope.checkboxes.checked;
                }, function (data) {
                    angular.forEach($scope.tableParams.data, function (item) {
                        $scope.checkboxes.items[item.name] = data;
                    });
                });

                $scope.$watch(function () {
                    return $scope.checkboxes.items;
                }, function (values) {
                    $scope.selectedItemsData = [];
                    let checkedItems = [];
                    let checked = 0,
                        unchecked = 0,
                        total = $scope.tableParams.data.length;

                    angular.forEach($scope.tableParams.data, function (item) {
                        checked += ($scope.checkboxes.items[item.name]) || 0;
                        unchecked += (!$scope.checkboxes.items[item.name]) || 0;
                        if ($scope.checkboxes.items[item.name]) {
                            checkedItems.push(item.name);
                            $scope.selectedItemsData.push(item);
                            $scope.currentItemData = item;
                        }
                    });
                    $scope.selectedItems = checkedItems;
                    if ((unchecked == 0) || (checked == 0)) {
                        if (total > 0) {
                            $scope.checkboxes.checked = (checked == total);
                        }
                    }
                    if (checked === 0) {
                        $scope.canDelete = false;
                    } else if (checked === 1) {
                        $scope.canDelete = true;
                    } else {
                        $scope.canDelete = true;
                    }
                    angular.element(".select-all").prop("indeterminate", (checked != 0 && unchecked != 0));
                }, true);
            }
        }, true);

        $scope.createRepository = function () {
            let scope = $rootScope.$new();

            scope.existedImageNames = [];
            _.forEach(dockerImagesSrv.repositoriesData, function (repository) {
                scope.existedImageNames.push(repository.name.split("/")[1]);
            });

            scope.canSelectRepos = scope.existedImageNames.length > 0;
            scope.repoNameValid = false;
            scope.dockerfileSelected = false;
            scope.tagDuplicated = false;

            scope.repositoryData = {
                newRepoName: null,
                hideNewRepoName: false,
                choseRepository: false,
                oldRepoName: null,
                tagName: null,
                choseUploadDockerfile: false
            };

            let uploader = scope.uploader = $scope.uploader =
                new FileUploader({
                    url: window.GLOBALCONFIG.APIHOST + "/v1/k8s/dockerd/image",
                    alias: "dockerfile",
                    queueLimit: 1,
                    removeAfterUpload: true
                });

            scope.clearItems = function () {
                uploader.clearQueue();
            };

            uploader.onAfterAddingFile = function (fileItem) {
                $scope.dockerfile = fileItem._file;
                scope.dockerfileSelected = true;
            };

            scope.$watch(function () {
                return scope.repositoryData.choseRepository;
            }, function (choseRepository) {
                scope.repositoryData.hideNewRepoName = choseRepository;
            });

            let doCheckTagDuplicated = function (repoName, tagName) {
                // console.info("repoName: ", repoName, "; tagName: ", tagName);
                if (!repoName || !tagName) {
                    scope.tagDuplicated = false;
                    return;
                }

                let repoNameExist = false;
                for (let i = 0; i < scope.existedImageNames.length; i++) {
                    if (repoName == scope.existedImageNames[i]) {
                        repoNameExist = true;
                        break;
                    }
                }

                if (!repoNameExist) {
                    scope.tagDuplicated = false;
                    return;
                }

                dockerImagesSrv.getRepositoryTags($scope.projectId,
                    encodeURIComponent(encodeURIComponent($scope.projectName + "/" + repoName)))
                    .then(function (result) {
                        if (result.status === 0) {
                            let tags = result.data.tags;
                            for (let i = 0; i < tags.length; i++) {
                                if (tags[i] === tagName) {
                                    scope.tagDuplicated = true;
                                    return;
                                }
                            }
                            scope.tagDuplicated = false;
                        }
                    });
            };

            let checkTagDuplicated = function (choseRepository, tagName) {
                if (choseRepository) {
                    if (scope.repositoryData.oldRepoName) {
                        doCheckTagDuplicated(scope.repositoryData.oldRepoName, tagName);
                    } else {
                        scope.tagDuplicated = false;
                    }
                } else {
                    if (scope.repositoryData.newRepoName) {
                        doCheckTagDuplicated(scope.repositoryData.newRepoName, tagName);
                    } else {
                        scope.tagDuplicated = false;
                    }
                }
            };

            scope.$watch(function () {
                return scope.repositoryData.newRepoName;
            }, function (newRepoName) {
                if (!scope.repositoryData.choseRepository) {
                    doCheckTagDuplicated(newRepoName, scope.repositoryData.tagName);
                }
            });

            scope.$watch(function () {
                return scope.repositoryData.oldRepoName;
            }, function (oldRepoName) {
                if (scope.repositoryData.choseRepository) {
                    doCheckTagDuplicated(oldRepoName, scope.repositoryData.tagName);
                }
            });

            scope.$watch(function () {
                return scope.repositoryData.tagName;
            }, function (tagName) {
                checkTagDuplicated(scope.repositoryData.choseRepository, tagName);
            });

            scope.$watch(function () {
                return scope.repositoryData.choseRepository;
            }, function (choseRepository) {
                checkTagDuplicated(choseRepository, scope.repositoryData.tagName);
            });

            scope.$watch(function () {
                return scope.repositoryData;
            }, function (repositoryData) {
                if (repositoryData.choseRepository) {
                    scope.repoNameValid = repositoryData.oldRepoName !== null;
                } else {
                    if (repositoryData.newRepoName) {
                        scope.repoNameValid = /^[a-z0-9A-Z]([0-9a-zA-Z\-_]*[a-z0-9A-Z])?$/.test(
                            repositoryData.newRepoName);
                    } else {
                        scope.repoNameValid = false;
                    }
                }
            }, true);

            let createRepositoryModel = $uibModal.open({
                animation: true,
                templateUrl: "createRepository.html",
                scope: scope
            });

            return createRepositoryModel.result.then(function (repositoryData) {
                let repository = $scope.projectName + "/";
                if (repositoryData.choseRepository) {
                    repository += repositoryData.oldRepoName;
                } else {
                    repository += repositoryData.newRepoName;
                }

                let postData = {
                    repository: repository,
                    tag: repositoryData.tagName,
                    dockerfile: $scope.dockerfile
                };
                // console.info("postData:\n", postData);
                dockerImagesSrv.buildPushDockerImage(postData).then(function (result) {
                    $scope.refresh();
                });
            });
        };

        $scope.deleteRepositories = function (repoName) {
            if (repoName !== undefined) {
                $scope.selectedItems = [repoName]
            }
            $scope.$emit("delete", {
                target: "deleteRepositories",
                msg: "<span>" + $translate.instant("aws.k8s.dockerImages.imageRepoDeleteWarn") + "</span>"
            });
        };

        $scope.$on("deleteRepositories", function () {
            let deletedRepoNames = [];
            _.forEach($scope.selectedItems, function (item) {
                deletedRepoNames.push(encodeURIComponent(item));
            });
            let deletedRepos = {deletedRepos: deletedRepoNames};
            console.info("deletedRepos:\n", deletedRepos);
            dockerImagesSrv.deleteRepositories($scope.projectId, deletedRepos).then(function (result) {
                $scope.refresh();
            });
        });
    })
    .controller("dockerImagesCtrl", function ($scope, $translate, $rootScope, $routeParams, $location, $uibModal, $interval, NgTableParams, dockerImagesSrv, detailFactory) {
        $scope.dockerImages_search = {
            globalSearchTerm : ""
        }
        $scope.$watch(function () {
            return detailFactory.imgWarehouseData.imgWarehouseName
            // return $routeParams.clusterName;
        }, function (repoName) {
            if (!repoName) return
            $scope.projectId = detailFactory.imgWarehouseData.imgName;
            $scope.repoName = detailFactory.imgWarehouseData.imgWarehouseName.replace("/", "%2F");
            $scope.isMine = dockerImagesSrv.isMine;
            $scope.encodedRepoName = encodeURIComponent($scope.repoName);
            $scope.decodedRepoName = decodeURIComponent($scope.repoName);
            $scope.initData();
            // $scope.animation = clusterName ? "animateIn" : "animateOut";
        });

        $scope.applyGlobalSearch = function() {
            if(!$scope.tableParams) return
            $scope.tableParams.filter({
                searchTerm: $scope.dockerImages_search.globalSearchTerm
            });
        };
        // $scope.goBack = function () {
        //     $location.path("/k8s/projects/" + $scope.projectId);
        // };

        $scope.goImgLogDetails = function (imgLogName) {
            detailFactory.moveToLeft = true;
            detailFactory.imgLogData = {
                imgName: $scope.projectId,
                imgWarehouseName: $scope.repoName,
                imgLogName: imgLogName
            }
            detailFactory.pageTitle.imgLogTitle = imgLogName
            detailFactory.showIt.showImgLog = true
        }
        $scope.initData = function () {
            dockerImagesSrv.getRepositoryTags($scope.projectId, encodeURIComponent($scope.repoName))
                .then(function (result) {
                    if (!result || result.status !== 0 || result.msg !== "OK") {
                        dockerImagesSrv.repositoryTagsData = [];
                        return;
                    }
                    dockerImagesSrv.repositoryTagsData = [];
                    $scope.harbor = result.data.harbor;
                    _.forEach(result.data.tags, function (tag) {
                        dockerImagesSrv.repositoryTagsData.push({tag: tag,searchTerm : ('docker pull'+ " " + $scope.harbor + "/" + $scope.decodedRepoName + ":" + tag)});
                    });
                });
            dockerImagesSrv.getProjectDetails($scope.projectId).then(function (result) {
                console.log(result)
                if (result && result.status == 0) {
                    $scope.projectName = result.data["name"];
                    $scope.isMine = result.data["is_mine"];
                    dockerImagesSrv.isMine = $scope.isMine;
                    $scope.isPublic = result.data["public"];
                    dockerImagesSrv.isPublic = $scope.isPublic;
                }
            });
        };

        // $scope.initData();
        $scope.refresh = function () {
            $scope.dockerImages_search.globalSearchTerm = "";
            $scope.applyGlobalSearch();
            $scope.initData();
        };

        $scope.$watch(function () {
            return dockerImagesSrv.repositoryTagsData;
        }, function (data) {
            if (data != null && data != undefined) {
                $scope.tableParams = new NgTableParams({
                    count: 10, sorting: {tag: "asc"}
                }, {counts: [], dataset: data});

                $scope.search = function (searchIterm) {
                    $scope.tableParams.filter({$: searchIterm});
                };

                $scope.checkboxes = {
                    checked: false,
                    items: {}
                };

                $scope.$watch(function () {
                    return $scope.tableParams.page();
                }, function (data) {
                    $scope.checkboxes.checked = false;
                    $scope.checkboxes.items = {};
                });

                $scope.$watch(function () {
                    return $scope.checkboxes.checked;
                }, function (data) {
                    angular.forEach($scope.tableParams.data, function (item) {
                        $scope.checkboxes.items[item.tag] = data;
                    });
                });

                $scope.$watch(function () {
                    return $scope.checkboxes.items;
                }, function (values) {
                    $scope.selectedItemsData = [];
                    let checkedItems = [];
                    let checked = 0,
                        unchecked = 0,
                        total = $scope.tableParams.data.length;

                    angular.forEach($scope.tableParams.data, function (item) {
                        checked += ($scope.checkboxes.items[item.tag]) || 0;
                        unchecked += (!$scope.checkboxes.items[item.tag]) || 0;
                        if ($scope.checkboxes.items[item.tag]) {
                            checkedItems.push(item.tag);
                            $scope.selectedItemsData.push(item);
                            $scope.currentItemData = item;
                        }
                    });
                    $scope.selectedItems = checkedItems;
                    if ((unchecked == 0) || (checked == 0)) {
                        if (total > 0) {
                            $scope.checkboxes.checked = (checked == total);
                        }
                    }
                    if (checked === 0) {
                        $scope.canDelete = false;
                    } else if (checked === 1) {
                        $scope.canDelete = true;
                    } else {
                        $scope.canDelete = true;
                    }
                    angular.element(".select-all").prop("indeterminate", (checked != 0 && unchecked != 0));
                }, true);
            }
        }, true);

        $scope.deleteRepositoryTags = function (tag) {
            if (tag !== undefined) {
                $scope.selectedItems = [tag]
            }
            $scope.$emit("delete", {
                target: "deleteRepositoryTags",
                msg: "<span>" + $translate.instant("aws.k8s.dockerImages.imageRepoTagDeleteWarn") + "</span>"
            });
        };

        $scope.$on("deleteRepositoryTags", function () {
            let deleteAllTags = false;
            if ($scope.selectedItems.length ===
                dockerImagesSrv.repositoryTagsData.length) {
                deleteAllTags = true;
            }
            let deletedTagsList = [];
            _.forEach($scope.selectedItems, function (item) {
                deletedTagsList.push(encodeURIComponent(item));
            });

            let deletedTags = {deletedTags: deletedTagsList};
            // console.info("deletedTags:\n", deletedTags);
            dockerImagesSrv.deleteRepositoryTags($scope.projectId,
                encodeURIComponent($scope.repoName), deletedTags).then(function (result) {
                // Harbor will delete this repository if all tags have been deleted!
                if (deleteAllTags) {
                    $scope.goBack();
                } else {
                    $scope.refresh();
                }
            });
        });
    })
    .controller("dockerImageManifestsCtrl", function ($scope, $translate, $rootScope, $routeParams, $location, $uibModal, $interval, $sce, $timeout, NgTableParams, dockerImagesSrv, detailFactory) {
        // $scope.projectId = detailFactory.imgLogData.imgName;
        // $scope.repoName = detailFactory.imgLogData.imgWarehouseName.replace("/", "%2F");
        // $scope.tag = detailFactory.imgLogData.imgLogName;
        // $scope.encodedRepoName = encodeURIComponent($scope.repoName);
        // $scope.decodedRepoName = decodeURIComponent($scope.repoName);

        // detailFactory.imgLogData = {
        //     imgName: $scope.projectId,
        //     imgWarehouseName: $scope.repoName,
        //     imgLogName: imgLogName
        // }

        $scope.$watch(function () {
            return detailFactory.imgLogData.imgLogName
            // return $routeParams.clusterName;
        }, function (repoName) {
            if (!repoName) return
            $scope.projectId = detailFactory.imgLogData.imgName;
            $scope.repoName = detailFactory.imgLogData.imgWarehouseName.replace("/", "%2F");
            $scope.tag = detailFactory.imgLogData.imgLogName;
            $scope.encodedRepoName = encodeURIComponent($scope.repoName);
            $scope.decodedRepoName = decodeURIComponent($scope.repoName);
            $scope.initData();
            // $scope.animation = clusterName ? "animateIn" : "animateOut";
        });


        let trusted = {};
        $scope.getPopoverText = function (popoverText) {
            return trusted[popoverText] || (trusted[popoverText] =
                    $sce.trustAsHtml("<pre>" + popoverText + "</pre>"));
        };

        // console.info("$scope.projectId: ", $scope.projectId);
        // console.info("$scope.repoName: ", $scope.repoName);
        // console.info("$scope.tag: ", $scope.tag);

        // $scope.$watch(function () {
        //     return $routeParams.tag;
        // }, function (tag) {
        //     $scope.animation = tag ? "animateIn" : "animateOut";
        // });

        $scope.initData = function () {
            dockerImagesSrv.getDockerImageManifests($scope.encodedRepoName, $scope.tag)
                .then(function (result) {
                    if (!result || result.status !== 0 || result.msg !== "OK") {
                        $scope.imageManifests = null;
                        return;
                    }
                    $scope.imageManifests = result.data;
                    $scope.imageHistory = $scope.imageManifests["history"];
                    $scope.imageLayers = $scope.imageManifests["layers"];
                });
        };

        $scope.getShortInstruct = function (instruct) {
            if (instruct && instruct.length > 60) {
                return instruct.substring(0, 59) + " ...";
            }
            return instruct;
        };

        $scope.showInstruct = function (instruct) {
            console.info("instruct: ", instruct);
        };

        $scope.showHistory = function () {
            if (!$scope.imageHistory) {
                return;
            }
            $scope.tableParams = new NgTableParams({
                count: 10
            }, {counts: [], dataset: $scope.imageHistory});
        };

        $scope.showLayers = function () {
            if (!$scope.imageLayers) {
                return;
            }
            $scope.tableParams = new NgTableParams({
                count: 10
            }, {counts: [], dataset: $scope.imageLayers});
        };

        $scope.getBytesForHuman = function (size) {
            if (size < 1024) {
                return size + "B";
            } else if (size < 1024 * 1024) {
                return (size / 1024).toFixed(2) + "KB";
            } else if (size < 1024 * 1024 * 1024) {
                return (size / 1024 / 1024).toFixed(2) + "MB";
            } else {
                return (size / 1024 / 1024 / 1024).toFixed(2) + "GB";
            }
        };

        // $scope.initData();
    })
    .factory('detailFactory', function () {
        var DetailData = {
            imgWarehouseData: {},
            imgLogData: {},
            showIt: {
                showImgWarehouse: false,
                showImgLog: false
            },
            moveTo: false,
            moveToLeft: false,
            pageTitle: {
                imgTitle: "",
                imgWarehouseTitle: "",
                imgLogTitle: ""
            }
        }
        return DetailData
    });
