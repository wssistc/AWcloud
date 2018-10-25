/**
 * Created by Weike on 2017/1/20.
 */
import "./instanceSrv"

angular.module("clbInstanceModule", [
        "ngSanitize", "ngTable", "ngAnimate", "ui.bootstrap", "ui.select",
        "ngMessages", "clbInstanceSrvModule"
    ])
    .controller("clbInstanceCtrl", function ($scope, $rootScope, $uibModal, $translate, $timeout, $interval, $location, NgTableParams, RegionID, clbInstanceSrv, utilSrv, sharedValueSrv) {
        $scope.loadBalancerTypes = sharedValueSrv.loadBalancerTypes;
        $scope.loadBalancerStatuses = sharedValueSrv.loadBalancerStatuses;
        $scope.regionsList = sharedValueSrv.regionsList;

        // 从本地存储中取regionCode，默认是“sh”
        $scope.currentRegion = RegionID.Region();

        // 如果没有设定project，则设置project为“默认项目”：'0'
        $scope.currentProject = sharedValueSrv.currentProject || {id: 0, name: "默认项目"};
        $scope.currentProjectId = sharedValueSrv.currentProjectId || 0;

        $scope.goToLBDetails = function (unLoadBalancerId) {
            $location.path("/clb/instance/" + unLoadBalancerId);
            // 如果是从LB列表页面跳转的，那么默认子页面为LB详情页面。
            sharedValueSrv.activeTabId = 0;
        };

        $scope.initProjectsData = function () {
            // 如果sharedValueSrv.projectList不为空，则直接取出sharedValueSrv.projectsList
            if (sharedValueSrv.projectsList) {
                $scope.projectsList = sharedValueSrv.projectsList;
                return;
            }

            $scope.projectsList = [{id: -1, name: "全部项目"}, {id: 0, name: "默认项目"}];

            var projectPostData = {
                "params": {
                    "Region": $scope.currentRegion
                }
            };

            clbInstanceSrv.getProjects(projectPostData).then(function (result) {
                if (result.code === 0) {
                    $scope.projectsList = [];
                    _.map(result.data, function (project) {
                        $scope.projectsList.push({
                            id: project.projectId,
                            name: project.projectName
                        });
                    });
                    // 同步新的数据到sharedValueSrv.projectsList
                    sharedValueSrv.projectsList = $scope.projectsList;
                    // console.log("projectsList:\n", $scope.projectsList);
                }
            });
        };

        $scope.downloadAllLBData = function () {
            var allLBDataList = [];
            if (!sharedValueSrv.loadBalancers) {
                return allLBDataList;
            }
            // 过滤出需要在CSV文件中显示的字段。
            _.map(sharedValueSrv.loadBalancers.data, function (loadBalancer) {
                allLBDataList.push([
                    loadBalancer["unLoadBalancerId"],
                    loadBalancer["loadBalancerName"],
                    "公网固定IP",
                    loadBalancer["vpcName"] === "base" ? "基础网络" : loadBalancer["vpcName"],
                    loadBalancer["loadBalancerVips"].join(", "),
                    loadBalancer["domain"],
                    _.find(sharedValueSrv.regionsList, function (region) {
                        return region.code === $scope.currentRegion;
                    })["name"],
                    loadBalancer["createTime"],
                    $scope.loadBalancerStatuses[loadBalancer["status"]]
                ]);
            });
            return allLBDataList;
        };

        // 直接调用API获取数据。
        $scope.getLBData = function () {
            var postData = {
                "params": {
                    "projectId": $scope.currentProjectId,
                    "Region": $scope.currentRegion,
                    "loadBalancerType": 2
                }
            };
            // console.log("postData:\n", postData);
            clbInstanceSrv.getLBInstancersList(postData).then(function (result) {
                if (result.code === 0) {
                    sharedValueSrv.loadBalancers = {
                        data: result["loadBalancerSet"],
                        region: $scope.currentRegion
                    };
                    // console.log("loadBalancersList:\n", result["loadBalancerSet"]);
                }
            });
        };

        // 初始化LB数据，不一定调用API。
        $scope.initLBData = function () {
            // 现在都使用默认的project。
            // $scope.initProjectsData();

            // 如果sharedValueSrv.loadBalancers缓存的数据属于当前的地域，则不需要调用API。
            if (sharedValueSrv.loadBalancers &&
                sharedValueSrv.loadBalancers.region === $scope.currentRegion) {
                return;
            }

            $scope.getLBData();
        };

        $scope.initLBData();

        // 刷新操作，强制调用API获取最新数据。
        $scope.refreshLBData = function () {
            $scope.searchContent = "";
            $scope.getLBData();
        };

        $scope.changeRegion = function (selectedRegion) {
            // region没有改变。
            if (selectedRegion["code"] === $scope.currentRegion) {
                return;
            }
            // 修改本地保存的regionCode
            sessionStorage.setItem("RegionSession", selectedRegion["code"]);
            $scope.currentRegion = selectedRegion["code"];
            $scope.searchContent = "";
            $scope.initLBData();
        };

        $scope.searchLB = function (searchContent) {
            var postData = {
                "params": {
                    "projectId": $scope.currentProjectId,
                    "Region": $scope.currentRegion,
                    "loadBalancerType": 2,
                    "searchKey": searchContent
                }
            };
            clbInstanceSrv.getLBInstancersList(postData).then(function (result) {
                if (result.code === 0) {
                    sharedValueSrv.loadBalancers = {
                        data: result["loadBalancerSet"],
                        region: $scope.currentRegion
                    };
                }
            });
        };

        $scope.$watch(function () {
            return sharedValueSrv.loadBalancers;
        }, function (loadBalancers) {
            if (!loadBalancers) {
                return;
            }

            $scope.lbInstanceTable = new NgTableParams({
                count: 8,
                sorting: {createTime: "desc"}
            }, {
                counts: [], dataset: loadBalancers["data"]
            });

            $scope.search = function () {
                $scope.lbInstanceTable.filter({
                    $: $scope["searchItem"]
                });
            };

            $scope.checkboxes = {
                allChecked: false,
                items: {}
            };

            $scope.$watch(function () {
                return $scope.lbInstanceTable.page();
            }, function () {
                $scope.checkboxes.allChecked = false;
                $scope.checkboxes.items = {};
            });

            $scope.$watch(function () {
                return $scope.checkboxes.allChecked;
            }, function (isChecked) {
                angular.forEach($scope.lbInstanceTable.data, function (item) {
                    $scope.checkboxes.items[item.unLoadBalancerId] = isChecked;
                });
            });

            $scope.$watch(function () {
                return $scope.checkboxes.items;
            }, function () {
                $scope.selectedItemsData = [];
                $scope.selectedItems = [];
                var checked = 0,
                    unchecked = 0,
                    total = $scope.lbInstanceTable.data.length;

                angular.forEach($scope.lbInstanceTable.data, function (item) {
                    checked += ($scope.checkboxes.items[item.unLoadBalancerId]) || 0;
                    unchecked += (!$scope.checkboxes.items[item.unLoadBalancerId]) || 0;
                    if ($scope.checkboxes.items[item.unLoadBalancerId]) {
                        $scope.selectedItemsData.push(item);
                        $scope.selectedItems.push(item.unLoadBalancerId);
                    }
                });

                if ((unchecked == 0) || (checked == 0)) {
                    if (total > 0) {
                        $scope.checkboxes.allChecked = (checked == total);
                    }
                }
                if (checked === 0) {
                    $scope.canModify = false;
                    $scope.canDelete = false;
                } else if (checked === 1) {
                    $scope.canModify = true;
                    $scope.canDelete = true;
                } else {
                    $scope.canModify = false;
                    $scope.canDelete = true;
                }
                angular.element(".select-all").prop("indeterminate", (checked != 0 && unchecked != 0));
            }, true);
        }, true);

        var allParamsModified = function (modifiedLBParams) {
            for (var i = 0; i < sharedValueSrv.loadBalancers.data.length; i++) {
                var loadbalancer = sharedValueSrv.loadBalancers.data[i];
                if (loadbalancer["unLoadBalancerId"] ===
                    modifiedLBParams["loadBalancerId"]) {
                    for (var key in modifiedLBParams) {
                        if (key === "loadBalancerName" &&
                            modifiedLBParams["loadBalancerName"] !==
                            loadbalancer["loadBalancerName"]) {
                            return false;
                        }
                        if (key === "domainPrefix" &&
                            modifiedLBParams["domainPrefix"] !==
                            loadbalancer["domain"].split(".")[0]) {
                            return false;
                        }
                    }
                    return true;
                }
            }
        };

        var intervalModifyLB = function (modifiedLBParams) {
            var continuePost = $interval(function () {
                var postData = {
                    "params": {
                        "projectId": $scope.currentProjectId,
                        "Region": $scope.currentRegion,
                        "loadBalancerType": 2
                    }
                };
                clbInstanceSrv.getLBInstancersList(postData).then(function (result) {
                    if (result.code === 0) {
                        var currentLoadBalancersList = result["loadBalancerSet"];
                        sharedValueSrv.loadBalancers = {
                            data: currentLoadBalancersList,
                            region: $scope.currentRegion
                        };

                        // 如果所有的修改的参数都也生效，结束轮询。
                        if (allParamsModified(modifiedLBParams)) {
                            $interval.cancel(continuePost);
                            continuePost = undefined;
                            // 修改负载均衡器成功之后，需要直接调用API更新健康检查的相关数据。
                            $scope.getLBListenerData();
                            $scope.getHealthStatusData();
                            console.info("修改负载均衡器成功！");
                        }
                    }
                });
            }, 2000);
        };

        $scope.modifyLBInstancer = function () {
            var scope = $rootScope.$new();
            $scope.selectedLBInstancerData = $scope.selectedItemsData[0];

            scope.postData = {
                unLoadBalancerId: $scope.selectedItems[0],
                loadBalancerName: $scope.selectedLBInstancerData["loadBalancerName"],
                domainPrefix: $scope.selectedLBInstancerData["domain"].split(".")[0]
            };

            return $uibModal.open({
                animation: true,
                templateUrl: "modifyLBInstancer.html",
                scope: scope
            }).result.then(function (_postData) {
                var postData = {
                    "params": {
                        "Region": $scope.currentRegion,
                        "loadBalancerId": _postData["unLoadBalancerId"]
                    }
                };
                var newLoadBalancerName = _postData["loadBalancerName"];
                var oldLoadBalancerName = $scope.selectedLBInstancerData["loadBalancerName"];
                var newDomainPrefix = _postData["domainPrefix"];
                var oldDomainPrefix = $scope.selectedLBInstancerData["domain"].split(".")[0];

                // 如果“实例名称”和“域名前缀”都没有改变，就不发送请求。
                if (newLoadBalancerName === oldLoadBalancerName &&
                    newDomainPrefix === oldDomainPrefix) {
                    return;
                }
                // “实例名称”赋予了新的值。
                if (newLoadBalancerName !== oldLoadBalancerName) {
                    postData["params"]["loadBalancerName"] = newLoadBalancerName;
                }
                // “域名前缀”赋予了新的值。
                if (newDomainPrefix !== oldDomainPrefix) {
                    postData["params"]["domainPrefix"] = newDomainPrefix;
                }
                // console.log("modify lbInstancer postData:\n", postData);
                clbInstanceSrv.modifyLBInstancer(postData).then(function (result) {
                    if (result.code === 0) {
                        intervalModifyLB(postData["params"]);
                    }
                });
            });
        };

        $scope.buyLBInstancer = function () {
            $location.path("/buy/clb");
        };

        var allLBsDeleted = function (currentLBIds, deletedLBIds) {
            var deletedLBNum = deletedLBIds.length;
            for (var i = 0; i < deletedLBIds.length; i++) {
                if (currentLBIds.indexOf(deletedLBIds[i]) === -1) {
                    deletedLBNum--;
                }
            }
            return deletedLBNum === 0;
        };

        // 轮询删除负载均衡器操作的结果。
        var intervalDeletedLBs = function (deletedLBIds) {
            var continuePost = $interval(function () {
                var postData = {
                    "params": {
                        "projectId": $scope.currentProjectId,
                        "Region": $scope.currentRegion,
                        "loadBalancerType": 2
                    }
                };
                clbInstanceSrv.getLBInstancersList(postData).then(function (result) {
                    if (result.code === 0) {
                        var currentLoadBalancersList = result["loadBalancerSet"];
                        sharedValueSrv.loadBalancers = {
                            data: currentLoadBalancersList,
                            region: $scope.currentRegion
                        };
                        var currentLBIds = [];
                        _.map(currentLoadBalancersList, function (loadBalancer) {
                            currentLBIds.push(loadBalancer["unLoadBalancerId"]);
                        });
                        if (allLBsDeleted(currentLBIds, deletedLBIds)) {
                            $interval.cancel(continuePost);
                            continuePost = undefined;
                            // 删除负载均衡器成功之后，需要直接调用API更新健康检查的相关数据。
                            $scope.getLBListenerData();
                            $scope.getHealthStatusData();
                            console.info("删除负载均衡器成功！");
                        }
                    }
                });
            }, 2000);
        };

        $scope.deleteLBInstancers = function () {
            var scope = $rootScope.$new();
            scope.selectedItems = $scope.selectedItems;

            return $uibModal.open({
                animation: true,
                templateUrl: "deleteLBInstancers.html",
                scope: scope
            }).result.then(function (selectedItems) {
                var postData = {
                    "params": {
                        "Region": $scope.currentRegion
                    }
                };

                for (var i = 0; i < selectedItems.length; i++) {
                    postData["params"]["loadBalancerIds." + (i + 1).toString()] = selectedItems[i];
                }
                // console.log("postData:\n", postData);
                clbInstanceSrv.deleteLBInstancers(postData).then(function (result) {
                    if (result.code === 0) {
                        var deletedLBIds = [];
                        for (var key in postData["params"]) {
                            if (key !== "Region") {
                                deletedLBIds.push(postData["params"][key]);
                            }
                        }
                        intervalDeletedLBs(deletedLBIds);
                    }
                });
            });
        };
    })
    .controller("clbInstanceDetailsCtrl", function ($scope, $rootScope, $uibModal, $uibModalStack, $routeParams, $timeout, $translate, $interval, $location, $window, $q, NgTableParams, RegionID, clbInstanceSrv, utilSrv, sharedValueSrv) {
        $scope.loadBalancerId = $routeParams.loadBalancerId;
        $scope.currentRegion = RegionID.Region();
        $scope.currentProjectId = sharedValueSrv.currentProjectId || 0;
        $scope.loadBalancerTypes = sharedValueSrv.loadBalancerTypes;
        $scope.listenerProtocols = sharedValueSrv.listenerProtocols;
        $scope.listenerHttpHash = sharedValueSrv.listenerHttpHash;
        $scope.listenerStatuses = sharedValueSrv.listenerStatuses;
        $scope.listenerHealthSwitch = sharedValueSrv.listenerHealthSwitch;
        $scope.lbServerStatus = sharedValueSrv.lbServerStatus;
        $scope.regionsList = sharedValueSrv.regionsList;
        $scope.activeTabId = sharedValueSrv.activeTabId || 0;
        $scope.lbHealthStatusesMap = sharedValueSrv.lbHealthStatusesMap;
        $scope.loadBalancer = null;

        $scope.$watch(function () {
            return $routeParams.loadBalancerId;
        }, function (loadBalancerId) {
            $scope.animation = loadBalancerId ? "animateIn" : "animateOut";
        });

        $scope.downloadAllLBListenersData = function () {
            var allLBListenersData = [];
            if (!sharedValueSrv.lbListeners) {
                return allLBListenersData;
            }
            for (var i = 0; i < sharedValueSrv.lbListeners.data.length; i++) {
                var listener = sharedValueSrv.lbListeners.data[i];
                allLBListenersData.push([
                    listener["unListenerId"],
                    listener["listenerName"],
                    $scope.loadBalancer["unLoadBalancerId"],
                    $scope.loadBalancer["loadBalancerName"],
                    listener["loadBalancerPort"],
                    listener["instancePort"],
                    $scope.listenerProtocols[listener["protocol"]],
                    $scope.listenerStatuses[listener["status"]],
                    $scope.listenerHttpHash[listener["httpHash"]] || "-",
                    listener["sessionExpire"] > 0 ? "已开启" : "未开启",
                    listener["sessionExpire"] > 0 ? listener["sessionExpire"].toString() + "s" : "-",
                    listener["healthSwitch"] === 1 ? sharedValueSrv.listenerHealthSwitch[listener["healthSwitch"]] : "-",
                    listener["healthSwitch"] === 1 ? listener["httpCheckPath"] || "-" : "-",
                    listener["healthSwitch"] === 1 ? sharedValueSrv.listenerHealthCheckTypes[listener["protocol"]] : "-",
                    listener["healthSwitch"] === 1 ?
                        utilSrv.getCheckoutOptionContents(listener["timeOut"], listener["intervalTime"],
                            listener["unhealthNum"], listener["healthNum"]).join("； ") : "-",
                    listener["healthSwitch"] === 1 && listener["protocol"] === 1 ?
                        utilSrv.getHTTPCodeContents(listener["httpCode"]).join(", ") : "-"
                ]);
            }
            return allLBListenersData;
        };

        $scope.downloadAllLBBindingServersData = function () {
            var allLBBindingServersData = [];
            if (!sharedValueSrv.lbBindingServers) {
                return allLBBindingServersData;
            }
            for (var i = 0; i < sharedValueSrv.lbBindingServers.data.length; i++) {
                var server = sharedValueSrv.lbBindingServers.data[i];
                allLBBindingServersData.push([
                    server['unInstanceId'],
                    server["instanceName"] || "-",
                    server["lanIp"] || "-",
                    server["wanIpSet"].join(", ") || "-",
                    server["weight"] || "-",
                    $scope.lbServerStatus[server["instanceStatus"]]
                ]);
            }
            return allLBBindingServersData;
        };

        // 负载均衡详情
        var setLoadBalancer = function (loadBalancersList) {
            for (var i = 0; i < loadBalancersList.length; i++) {
                var loadBalancer = loadBalancersList[i];
                if (loadBalancer.unLoadBalancerId === $scope.loadBalancerId) {
                    $scope.loadBalancer = loadBalancer;
                    for (var j = 0; j < $scope.regionsList.length; j++) {
                        var region = $scope.regionsList[j];
                        if (region.code === $scope.currentRegion) {
                            $scope.loadBalancer.regionName = region.name;
                            break;
                        }
                    }
                    break;
                }
            }
        };

        $scope.initLBData = function () {
            if (sharedValueSrv.loadBalancers &&
                sharedValueSrv.loadBalancers.region === $scope.currentRegion) {
                setLoadBalancer(sharedValueSrv.loadBalancers.data);
            } else {
                var postData = {
                    "params": {
                        "Region": $scope.currentRegion,
                        "instanceType": 2
                    }
                };
                // 刷新页面之后，需要通重新调用API获取数据。
                clbInstanceSrv.getLBInstancersList(postData).then(function (result) {
                    if (result.code === 0) {
                        var loadBalancersList = result["loadBalancerSet"];
                        // 使用新获取的数据更新sharedValueSrv上保存的数据。
                        sharedValueSrv.loadBalancers = {
                            data: loadBalancersList,
                            region: $scope.currentRegion
                        };
                        setLoadBalancer(loadBalancersList);
                    }
                });
            }
        };
        $scope.initLBData();

        // 直接调用API获取HealthStatus数据。
        $scope.getHealthStatusData = function () {
            var postData = {
                "params": {
                    "Region": $scope.currentRegion,
                    "loadBalanceId": $scope.loadBalancerId
                }
            };
            clbInstanceSrv.getHealthStatus(postData).then(function (result) {
                sharedValueSrv.lbHealthStatuses = {
                    data: result["data"],
                    loadBalancerId: $scope.loadBalancerId
                }
            });
        };

        // 初始化HealthStatus数据，不一定会调用API。
        $scope.initHealthStatusData = function () {
            if (sharedValueSrv.lbHealthStatuses &&
                sharedValueSrv.lbHealthStatuses.loadBalancerId === $scope.loadBalancerId) {
                return;
            }
            $scope.getHealthStatusData();
        };
        $scope.initHealthStatusData();

        $scope.$watchGroup([
            function () {
                return $scope.loadBalancer;
            }, function () {
                return sharedValueSrv.lbListeners;
            }, function () {
                return sharedValueSrv.lbBindingServers
            }, function () {
                return sharedValueSrv.lbHealthStatuses
            }
        ], function (newValues) {
            var loadBalancer = newValues[0],
                lbListeners = newValues[1],
                lbBindingServers = newValues[2],
                lbHealthStatuses = newValues[3];
            if (loadBalancer && lbListeners && lbBindingServers && lbHealthStatuses) {

                var lbListenersList = lbListeners["data"],
                    lbBindingServersList = lbBindingServers["data"],
                    lbHealthStatusesList = lbHealthStatuses["data"];

                _.map(lbListenersList, function (lbListener) {
                    lbListener["serverStatuses"] = [];
                    for (var i = 0; i < lbHealthStatusesList.length; i++) {
                        var lbHealthStatus = lbHealthStatusesList[i];
                        if (lbHealthStatus["vport"] === lbListener["loadBalancerPort"] &&
                            lbHealthStatus["port"] === lbListener["instancePort"]) {
                            var serverStatuses = {
                                "port": lbHealthStatus["port"],
                                "vport": lbHealthStatus["vport"],
                                "protocol": lbHealthStatus["protocol"],
                                "status": sharedValueSrv.lbHealthStatusesMap[lbHealthStatus["healthStatus"]]
                            };
                            // 根据后端云主机的内网IP反向查找云主机的名称和ID。
                            for (var j = 0; j < lbBindingServersList.length; j++) {
                                var server = lbBindingServersList[j];
                                if (server["lanIp"] === lbHealthStatus["ip"]) {
                                    serverStatuses["ip"] = server["lanIp"];
                                    serverStatuses["serverId"] = server["unInstanceId"];
                                    serverStatuses["serverName"] = server["instanceName"];
                                    break;
                                }
                            }
                            if (serverStatuses.hasOwnProperty("ip") &&
                                serverStatuses.hasOwnProperty("serverId") &&
                                serverStatuses.hasOwnProperty("serverName")) {
                                // 排除“探测目标不完整”的status。
                                lbListener["serverStatuses"].push(serverStatuses);
                            }
                        }
                        // 每个lbListener的后端server状态的数目等于总的后端server的数目时，可以跳出循环。
                        if (lbListener["serverStatuses"].length === lbBindingServersList.length) {
                            break;
                        }
                    }
                    // 只要该listener的一个后端云主机处于“异常”状态，就显示listener的状态为“异常”。
                    var errorNum = 0;
                    _.map(lbListener["serverStatuses"], function (serverStatus) {
                        if (serverStatus["status"] === "异常") {
                            errorNum++;
                        }
                    });
                    if (lbListener["serverStatuses"].length === 0) {
                        lbListener["totalServerStatus"] = "未绑定CVM";
                    } else {
                        lbListener["totalServerStatus"] = (errorNum === 0 ? "健康" : "异常");
                    }
                });
            }
        });

        $scope.selectListener = function (listener) {
            $scope.serversStatuses = listener["serverStatuses"];
        };

        // 负载均衡监听器
        // 调用API获取监听器的数据。
        $scope.getLBListenerData = function () {
            var postData = {
                "params": {
                    "loadBalancerId": $scope.loadBalancerId,
                    "Region": $scope.currentRegion
                }
            };
            clbInstanceSrv.getLBListeners(postData).then(function (result) {
                if (result.code === 0) {
                    // sharedValueSrv.lbListener对象保存了列表和当前的loadBalancerId
                    sharedValueSrv.lbListeners = {
                        data: result["listenerSet"],
                        loadBalancerId: result["loadBalancerId"]
                    };
                }
            });
        };

        // 初始化监听器数据，可能不会调用API。
        $scope.initLBListeners = function () {
            // 如果sharedValueSrv.lbListener不为空，
            // 并且loadbalancerId没有改变，则不需要调用API。
            if (sharedValueSrv.lbListeners &&
                sharedValueSrv.lbListeners.loadBalancerId === $scope.loadBalancerId) {
                return;
            }
            $scope.getLBListenerData();
        };
        $scope.initLBListeners();

        // 刷新按钮：强制调用API获取最新数据。
        $scope.refreshLBListeners = function () {
            $scope.getLBListenerData();
            $scope.getHealthStatusData();
            $scope.getLBBindingServers();
        };

        $scope.$watch(function () {
            return sharedValueSrv.lbListeners;
        }, function (lbListeners) {
            if (!lbListeners) {
                return;
            }
            $scope.lbListenersTable = new NgTableParams({
                count: 8,
                sorting: {listenerName: "asc"}
            }, {
                counts: [], dataset: lbListeners["data"]
            });

            $scope.searchLBL = function () {
                $scope.lbListenersTable.filter({
                    $: $scope["searchLBLItem"]
                });
            };

            $scope.lblCheckboxes = {
                allChecked: false,
                items: {}
            };

            $scope.$watch(function () {
                return $scope.lbListenersTable.page();
            }, function () {
                $scope.lblCheckboxes.allChecked = false;
                $scope.lblCheckboxes.items = {};
            });

            $scope.$watch(function () {
                return $scope.lblCheckboxes.allChecked;
            }, function (isChecked) {
                angular.forEach($scope.lbListenersTable.data, function (item) {
                    $scope.lblCheckboxes.items[item.unListenerId] = isChecked;
                });
            });

            $scope.$watch(function () {
                return $scope.lblCheckboxes.items;
            }, function () {
                $scope.selectedLBLdata = [];
                $scope.selectedLBLItem = [];
                var checked = 0,
                    unchecked = 0,
                    total = $scope.lbListenersTable.data.length;

                angular.forEach($scope.lbListenersTable.data, function (item) {
                    checked += ($scope.lblCheckboxes.items[item.unListenerId]) || 0;
                    unchecked += (!$scope.lblCheckboxes.items[item.unListenerId]) || 0;
                    if ($scope.lblCheckboxes.items[item.unListenerId]) {
                        $scope.selectedLBLdata.push(item);
                        $scope.selectedLBLItem.push(item.unListenerId);
                    }
                });

                if ((unchecked == 0) || (checked == 0)) {
                    if (total > 0) {
                        $scope.lblCheckboxes.allChecked = (checked == total);
                    }
                }
                if (checked === 0) {
                    $scope.canModifyLBL = false;
                    $scope.canDeleteLBL = false;
                } else if (checked === 1) {
                    $scope.canModifyLBL = true;
                    $scope.canDeleteLBL = true;
                } else {
                    $scope.canModifyLBL = false;
                    $scope.canDeleteLBL = true;
                }
                angular.element(".select-all").prop("indeterminate", (checked != 0 && unchecked != 0));
            }, true);
        }, true);

        // 轮询删除负载均衡监听器操作的结果。
        var intervalDeleteLBLs = function (deletedLBLIds) {
            var continuePost = $interval(function () {
                var postData = {
                    "params": {
                        "loadBalancerId": $scope.loadBalancerId,
                        "Region": $scope.currentRegion
                    }
                };
                clbInstanceSrv.getLBListeners(postData).then(function (result) {
                    if (result.code === 0) {
                        sharedValueSrv.lbListeners = {
                            data: result["listenerSet"],
                            loadBalancerId: result["loadBalancerId"]
                        };

                        var currentLBLIds = [];
                        _.map(sharedValueSrv.lbListeners.data, function (lbListener) {
                            currentLBLIds.push(lbListener["unListenerId"]);
                        });

                        var deletedLBLNum = deletedLBLIds.length;
                        for (var i = 0; i < deletedLBLIds.length; i++) {
                            if (currentLBLIds.indexOf(deletedLBLIds[i]) === -1) {
                                deletedLBLNum--;
                            }
                        }
                        // 如果已经标记删除的监控器都不在当前的监控器列表中了，则停止轮询。
                        if (deletedLBLNum === 0) {
                            $interval.cancel(continuePost);
                            continuePost = undefined;
                            // 删除负载均衡监听器成功之后，需要直接调用API更新健康检查的相关数据。
                            $scope.getLBListenerData();
                            $scope.getHealthStatusData();
                            console.info("删除负载均衡监听器成功！");
                        }
                    }
                });
            }, 2000);
        };

        // 删除负载均衡监听器
        $scope.deleteLBListeners = function () {
            var scope = $rootScope.$new();
            scope.selectedItems = $scope.selectedLBLItem;

            return $uibModal.open({
                animation: true,
                templateUrl: "deleteLBListeners.html",
                scope: scope
            }).result.then(function (selectedItems) {
                var postData = {
                    "params": {
                        "Region": $scope.currentRegion
                    }
                };

                postData["params"]["loadBalancerId"] = $scope.loadBalancerId;
                for (var i = 0; i < selectedItems.length; i++) {
                    postData["params"]["listenerIds." + (i + 1).toString()] = selectedItems[i];
                }
                // console.log("delete listeners postdata:\n", postData);
                clbInstanceSrv.deleteLBListeners(postData).then(function (result) {
                    if (result.code === 0) {
                        var deletedLBLIds = [];
                        for (var key in postData["params"]) {
                            if (key !== "Region" && key !== "loadBalancerId") {
                                deletedLBLIds.push(postData["params"][key]);
                            }
                        }
                        intervalDeleteLBLs(deletedLBLIds);
                    }
                });
            });
        };

        // 轮询新建负载均衡监听器操作的结果。
        var intervalCreateLBL = function (listenerId) {
            var continuePost = $interval(function () {
                var postData = {
                    "params": {
                        "loadBalancerId": $scope.loadBalancerId,
                        "Region": $scope.currentRegion
                    }
                };
                clbInstanceSrv.getLBListeners(postData).then(function (result) {
                    if (result.code === 0) {
                        sharedValueSrv.lbListeners = {
                            data: result["listenerSet"],
                            loadBalancerId: result["loadBalancerId"]
                        };

                        var newLBLData = null;
                        for (var i = 0; i < sharedValueSrv.lbListeners.data.length; i++) {
                            var lbListener = sharedValueSrv.lbListeners.data[i];
                            if (lbListener["unListenerId"] === listenerId) {
                                newLBLData = lbListener;
                                break;
                            }
                        }
                        // 如果新获取的监听器列表中，有刚才新建的监听器，并且处于运行状态，则停止轮询。
                        if (newLBLData && newLBLData["status"] === 1) {
                            $interval.cancel(continuePost);
                            continuePost = undefined;
                            // 新建负载均衡监听器成功之后，需要直接调用API更新健康检查的相关数据。
                            $scope.getLBListenerData();
                            $scope.getHealthStatusData();
                            console.info("新建负载均衡监听器成功！");
                        }
                    }
                });
            }, 2000);
        };

        // 新建负载均衡监听器
        $scope.createLBListener = function () {
            var scope = $rootScope.$new();

            scope.listenerProtocols = [{
                code: 1, name: "HTTP"
            }, {
                code: 2, name: "TCP"
            }, {
                code: 3, name: "UDP"
            }];

            scope.httpHashList = [{
                abbr: "wrr",
                name: "按权重轮询"
            }, {
                abbr: "ip_hash",
                name: "源IP哈希算法"
            }];

            scope.postData = {
                Region: $scope.currentRegion,
                loadBalancerId: $scope.loadBalancerId,
                listenerName: null,
                protocol: 2,
                loadBalancerPort: null,
                instancePort: null,
                httpHash: "wrr",
                sessionKeepAlive: true,
                sessionExpire: null,
                healthSwitch: true,
                timeOut: 2,
                intervalTime: null,
                healthNum: null,
                unhealthNum: null,
                httpCode: 31,
                httpCheckPath: "/"
            };

            scope.$watch(function () {
                return scope.postData.protocol;
            }, function (protocol) {
                scope.selectedProtocol = protocol === 1 ? "http" : "tcpudp";
            });

            var usedListenerPorts = [];
            if (sharedValueSrv.lbListeners) {
                _.map(sharedValueSrv.lbListeners.data, function (lbListener) {
                    usedListenerPorts.push(lbListener.loadBalancerPort);
                });
            }

            // 用户填写的loadBalancerPort不能是已经存在的。
            scope.loadBalancerPortConflict = false;
            scope.$watch(function () {
                return scope.postData.loadBalancerPort;
            }, function (loadBalancerPort) {
                if (loadBalancerPort !== null) {
                    if (usedListenerPorts.indexOf(parseInt(loadBalancerPort)) >= 0) {
                        scope.loadBalancerPortConflict = true;
                    } else {
                        scope.loadBalancerPortConflict = false;
                    }
                }
            }, true);

            scope.selectHttpHash = function (item) {
                scope.postData.httpHash = item["abbr"];
            };

            // 如果protocol是http，均衡方式是“源IP哈希算法”，则不能设置“会话保持时间”。
            scope.canSelectSessionKeepAlive = true;
            scope.$watch(function () {
                return scope.postData.httpHash;
            }, function (httpHash) {
                if (scope.postData.protocol === 1) {
                    if (httpHash === "ip_hash") {
                        scope.postData.sessionKeepAlive = false;
                        scope.canSelectSessionKeepAlive = false;
                    } else {
                        scope.postData.sessionKeepAlive = true;
                        scope.canSelectSessionKeepAlive = true;
                    }
                } else {
                    scope.postData.sessionKeepAlive = true;
                    scope.canSelectSessionKeepAlive = true;
                }
            });

            scope.$watch(function () {
                return scope.postData.protocol;
            }, function (protocol) {
                // 如果选择的协议是TCP/UDP，则负载方式只能是'wrr'。
                if (protocol === 2 || protocol === 3) {
                    scope.postData.httpHash = "wrr";
                    scope.canSelectHttpHash = false;
                } else {
                    scope.canSelectHttpHash = true;
                    if (scope.postData.httpHash === "ip_hash") {
                        scope.postData.sessionKeepAlive = false;
                        scope.canSelectSessionKeepAlive = false;
                    } else {
                        scope.postData.sessionKeepAlive = true;
                        scope.canSelectSessionKeepAlive = true;
                    }
                }
            });

            // 负载均衡监听器的会话保持时间，单位：秒。
            // HTTP协议的监听器会话保持时间可选值：30~3600
            // 非HTTP协议的监听器会话保持时间可选值：900~3600
            // 默认值为1200秒
            scope.sessionExpireSlider = {
                tcpudp: {
                    value: 1200,
                    options: {
                        floor: 900,
                        ceil: 3600,
                        step: 1,
                        minLimit: 900,
                        maxLimit: 3600
                    }
                },
                http: {
                    value: 1200,
                    options: {
                        floor: 30,
                        ceil: 3600,
                        step: 1,
                        minLimit: 30,
                        maxLimit: 3600
                    }
                }
            };

            var sessionExpirePromise;
            scope.$watch(function () {
                return scope.sessionExpireSlider[scope.selectedProtocol].value;
            }, function (value) {
                if (scope.postData.sessionKeepAlive) {
                    $timeout.cancel(sessionExpirePromise);
                    sessionExpirePromise = $timeout(function () {
                        // 非HTTP协议的监听器会话保持时间可选值：900~3600
                        if (scope.selectedProtocol === "tcpudp") {
                            if (!/^([3-9][0-9]|[1-9][0-9]{2}|[1-2][0-9]{3}|3[0-5][0-9]{2}|3600)$/.test(value)) {
                                scope.sessionExpireSlider[scope.selectedProtocol].value = 1200;
                                scope.postData.sessionExpire = 1200;
                            } else {
                                scope.postData.sessionExpire = parseInt(value);
                            }
                        } else {
                            // HTTP协议的监听器会话保持时间可选值：30~3600
                            if (!/^(9[0-9]{2}|[1-2][0-9]{3}|3[0-5][0-9]{2}|3600)$/.test(value)) {
                                scope.sessionExpireSlider[scope.selectedProtocol].value = 1200;
                                scope.postData.sessionExpire = 1200;
                            } else {
                                scope.postData.sessionExpire = parseInt(value);
                            }
                        }
                    }, 2000);
                }
            }, true);

            // 响应超时时间，可选值：2-60，默认值：2，单位:秒。
            scope.timeoutSlider = {
                value: 2,
                options: {
                    floor: 2,
                    ceil: 60,
                    step: 1,
                    minLimit: 2,
                    maxLimit: 60
                }
            };

            var timeoutPromise;
            scope.$watch(function () {
                return scope.timeoutSlider.value;
            }, function (value) {
                $timeout.cancel(timeoutPromise);
                timeoutPromise = $timeout(function () {
                    if (!/^([2-9]|[1-5][0-9]|60)$/.test(value)) {
                        scope.timeoutSlider.value = 2;
                        scope.postData.timeOut = 2;
                    } else {
                        scope.postData.timeOut = parseInt(value);
                    }
                }, 2000);
            });

            // 负载均衡监听器检查间隔时间，
            // TCP、UDP协议可选值：5-300秒，默认值：5。
            // HTTPS、HTTP协议可选值：30-300秒，默认值：30。
            scope.intervalTimeSlider = {
                tcpudp: {
                    value: 5,
                    options: {
                        floor: 5,
                        ceil: 300,
                        step: 1,
                        minLimit: 5,
                        maxLimit: 300
                    }
                },
                http: {
                    value: 30,
                    options: {
                        floor: 30,
                        ceil: 300,
                        step: 1,
                        minLimit: 30,
                        maxLimit: 300
                    }
                }
            };

            var intervalTimePromise;
            scope.$watch(function () {
                return scope.intervalTimeSlider[scope.selectedProtocol].value;
            }, function (value) {
                $timeout.cancel(intervalTimePromise);
                intervalTimePromise = $timeout(function () {
                    if (scope.selectedProtocol === "tcpudp") {
                        if (!/^([5-9]|[1-9][0-9]|[1-2][0-9]{2}|300)$/.test(value)) {
                            scope.intervalTimeSlider[scope.selectedProtocol].value = 5;
                            scope.postData.intervalTime = 5;
                        } else {
                            scope.postData.intervalTime = parseInt(value);
                        }
                    } else {
                        if (!/^([3-9][0-9]|[1-2][0-9]{2}|300)$/.test(value)) {
                            scope.intervalTimeSlider[scope.selectedProtocol].value = 30;
                            scope.postData.intervalTime = 30;
                        } else {
                            scope.postData.intervalTime = parseInt(value);
                        }
                    }
                }, 2000);
            });

            // 响应超时时间要小于检查间隔时间。
            scope.$watch(function () {
                return scope.timeoutSlider.value;
            }, function (timeout) {
                if (timeout >= scope.intervalTimeSlider[scope.selectedProtocol].value) {
                    scope.intervalTimeSlider[scope.selectedProtocol].value = timeout + 1;
                }
            });

            scope.$watch(function () {
                return scope.intervalTimeSlider[scope.selectedProtocol].value;
            }, function (intervalTime) {
                if (scope.timeoutSlider.value >= intervalTime) {
                    scope.timeoutSlider.value = intervalTime - 1;
                }
            });

            // 负载均衡监听器健康阀值，表示当连续探测三次健康则表示该转发正常
            // 可选值：2-10，单位：次，默认值：3。
            scope.healthNumSlider = {
                value: 3,
                options: {
                    floor: 2,
                    ceil: 10,
                    step: 1,
                    minLimit: 2,
                    maxLimit: 10
                }
            };

            var healthNumPromise;
            scope.$watch(function () {
                return scope.healthNumSlider.value;
            }, function (value) {
                $timeout.cancel(healthNumPromise);
                healthNumPromise = $timeout(function () {
                    if (!/^([2-9]|10)$/.test(value)) {
                        scope.healthNumSlider.value = 3;
                        scope.postData.healthNum = 3;
                    } else {
                        scope.postData.healthNum = parseInt(value);
                    }
                }, 2000);
            });

            // 负载均衡监听器不健康阀值，表示当连续探测三次不健康则表示该转发不正常
            // 可选值：2-10，单位：次，默认值：3。
            scope.unhealthNumSlider = {
                value: 3,
                options: {
                    floor: 2,
                    ceil: 10,
                    step: 1,
                    minLimit: 2,
                    maxLimit: 10
                }
            };

            var unhealthNumPromise;
            scope.$watch(function () {
                return scope.unhealthNumSlider.value;
            }, function (value) {
                $timeout.cancel(unhealthNumPromise);
                unhealthNumPromise = $timeout(function () {
                    if (!/^([2-9]|10)$/.test(value)) {
                        scope.unhealthNumSlider.value = 3;
                        scope.postData.unhealthNum = 3;
                    } else {
                        scope.postData.unhealthNum = parseInt(value);
                    }
                }, 2000);
            });

            // 对于HTTP协议的监听器，以该返回码来判断健康与否。可选值：1~31，默认31。
            // 1 代表返回 1xx 表示健康；
            // 2 代表返回 2xx 表示健康；
            // 4 代表返回 3xx 表示健康；
            // 8 代表返回 4xx 表示健康；
            // 16 代表返回 5xx 表示健康
            // 若返回多种表示健康，则将相应的值累加
            scope.httpCodeList = [{
                code: 1,
                name: "http_1xx",
                selected: true
            }, {
                code: 2,
                name: "http_2xx",
                selected: true
            }, {
                code: 4,
                name: "http_3xx",
                selected: true
            }, {
                code: 8,
                name: "http_4xx",
                selected: true
            }, {
                code: 16,
                name: "http_5xx",
                selected: true
            }];

            scope.selectHttpCode = function (httpCode) {
                for (var i = 0; i < scope.httpCodeList.length; i++) {
                    if (scope.httpCodeList[i].code === httpCode.code) {
                        scope.httpCodeList[i].selected = !scope.httpCodeList[i].selected;
                        break;
                    }
                }
            };

            scope.$watch(function () {
                return scope.httpCodeList;
            }, function (httpCodeList) {
                scope.postData.httpCode = 0;
                _.map(httpCodeList, function (httpCode) {
                    if (httpCode.selected) {
                        scope.postData.httpCode += httpCode.code;
                    }
                });
                // console.log("httpCode: ", scope.postData.httpCode);
            }, true);

            return $uibModal.open({
                animation: true,
                templateUrl: "createLBListener.html",
                scope: scope
            }).result.then(function (_postData) {
                // 构造出传递给后端的postBody
                var postData = {
                    params: {
                        "Region": $scope.currentRegion,
                        "loadBalancerId": _postData.loadBalancerId,
                        "listeners.1.listenerName": _postData.listenerName,
                        "listeners.1.protocol": _postData.protocol,
                        "listeners.1.loadBalancerPort": parseInt(_postData.loadBalancerPort),
                        "listeners.1.instancePort": parseInt(_postData.instancePort),
                        "listeners.1.httpHash": _postData.httpHash,
                        "listeners.1.healthSwitch": _postData.healthSwitch ? 1 : 0
                    }
                };

                // 如果开启了保持会话功能，则加上会话保持时间。
                if (_postData.sessionKeepAlive) {
                    postData.params["listeners.1.sessionExpire"] = _postData.sessionExpire;
                } else {
                    postData.params["listeners.1.sessionExpire"] = 0;
                }

                // 若果开启了健康检查功能，则加上健康检查的相关参数。
                if (_postData.healthSwitch) {
                    postData.params["listeners.1.intervalTime"] = _postData.intervalTime;
                    postData.params["listeners.1.healthNum"] = _postData.healthNum;
                    postData.params["listeners.1.unhealthNum"] = _postData.unhealthNum;

                    if (scope.selectedProtocol === "tcpudp") {
                        postData.params["listeners.1.timeOut"] = _postData.timeOut;
                    } else {
                        postData.params["listeners.1.httpCode"] = _postData.httpCode;
                        postData.params["listeners.1.httpCheckPath"] = _postData.httpCheckPath;
                    }
                }

                console.log("create listener postData:\n", postData);
                clbInstanceSrv.createLBListener(postData).then(function (result) {
                    if (result.code === 0) {
                        intervalCreateLBL(result["listenerIds"][0]);
                    }
                });
            });
        };

        // 修改负载均衡监听器
        $scope.modifyLBListener = function () {
            var scope = $rootScope.$new();
            var selectedLBLData = $scope.selectedLBLdata[0];
            // console.info("selectedLBLData:\n", selectedLBLData);

            scope.postData = {
                Region: $scope.currentRegion,
                loadBalancerId: $scope.loadBalancerId,
                listenerId: selectedLBLData["unListenerId"],
                listenerName: selectedLBLData["listenerName"],
                protocol: selectedLBLData["protocol"],
                loadBalancerPort: selectedLBLData["loadBalancerPort"],
                instancePort: selectedLBLData["instancePort"],
                httpHash: selectedLBLData["httpHash"],
                sessionExpire: selectedLBLData["sessionExpire"],
                healthSwitch: selectedLBLData["healthSwitch"] === 1,
                timeOut: selectedLBLData["timeOut"] || null,
                intervalTime: selectedLBLData["intervalTime"] || null,
                healthNum: selectedLBLData["healthNum"] || null,
                unhealthNum: selectedLBLData["unhealthNum"] || null,
                httpCode: selectedLBLData["httpCode"] || null,
                httpCheckPath: selectedLBLData["httpCheckPath"] || null
            };

            // 当前监控器使用的协议名称
            scope.selectedProtocol = scope.postData.protocol === 1 ? "http" : "tcpudp";
            scope.listenerProtocols = $scope.listenerProtocols;

            scope.httpHashList = [{
                abbr: "wrr",
                name: "按权重轮询"
            }, {
                abbr: "ip_hash",
                name: "源IP哈希算法"
            }];

            scope.selectHttpHash = function (item) {
                scope.postData.httpHash = item["abbr"];
            };

            // 如果选择的协议是TCP/UDP，则负载方式只能是'wrr'。
            // 初始化scope.canSelectHttpHash
            if (scope.selectedProtocol === "tcpudp") {
                scope.postData.httpHash = "wrr";
                scope.canSelectHttpHash = false;
            } else {
                scope.canSelectHttpHash = true;
            }

            // 初始化 scope.postData.sessionKeepAlive
            if (scope.selectedProtocol === "http") {
                if (selectedLBLData["httpHash"] === "wrr") {
                    scope.postData.sessionKeepAlive =
                        selectedLBLData["sessionExpire"] > 0;
                } else {
                    scope.postData.sessionKeepAlive = false;
                }
            } else {
                scope.postData.sessionKeepAlive =
                    selectedLBLData["sessionExpire"] > 0;
            }

            scope.$watch(function () {
                return scope.postData.httpHash;
            }, function (httpHash) {
                if (scope.selectedProtocol === "http") {
                    // 如果protocol是HTTP，均衡方式是“源IP哈希算法”，
                    // 则不能设置“会话保持时间”。
                    if (httpHash === "ip_hash") {
                        scope.canSelectSessionKeepAlive = false;
                        // 应该隐藏设置“会话保持时间”的按钮。
                        scope.postData.sessionKeepAlive = false;
                    } else {
                        scope.canSelectSessionKeepAlive = true;
                    }
                } else {
                    scope.canSelectSessionKeepAlive = true;
                }
            });

            // 负载均衡监听器的会话保持时间，单位：秒。
            // HTTP协议的监听器会话保持时间可选值：30~3600
            // 非HTTP协议的监听器会话保持时间可选值：900~3600
            // 默认值为1200秒
            scope.sessionExpireSlider = {
                tcpudp: {
                    value: selectedLBLData["sessionExpire"] || 1200,
                    options: {
                        floor: 900,
                        ceil: 3600,
                        step: 1,
                        minLimit: 900,
                        maxLimit: 3600
                    }
                },
                http: {
                    value: selectedLBLData["sessionExpire"] || 1200,
                    options: {
                        floor: 30,
                        ceil: 3600,
                        step: 1,
                        minLimit: 30,
                        maxLimit: 3600
                    }
                }
            };

            var sessionExpirePromise;
            scope.$watch(function () {
                return scope.sessionExpireSlider[scope.selectedProtocol].value;
            }, function (value) {
                if (scope.postData.sessionKeepAlive) {
                    $timeout.cancel(sessionExpirePromise);
                    sessionExpirePromise = $timeout(function () {
                        // 非HTTP协议的监听器会话保持时间可选值：900~3600
                        if (scope.selectedProtocol === "tcpudp") {
                            if (!/^([3-9][0-9]|[1-9][0-9]{2}|[1-2][0-9]{3}|3[0-5][0-9]{2}|3600)$/.test(value)) {
                                scope.sessionExpireSlider[scope.selectedProtocol].value =
                                    selectedLBLData["sessionExpire"] || 1200;
                                scope.postData.sessionExpire = selectedLBLData["sessionExpire"] || 1200;
                            } else {
                                scope.postData.sessionExpire = parseInt(value);
                            }
                        } else {
                            // HTTP协议的监听器会话保持时间可选值：30~3600
                            if (!/^(9[0-9]{2}|[1-2][0-9]{3}|3[0-5][0-9]{2}|3600)$/.test(value)) {
                                scope.sessionExpireSlider[scope.selectedProtocol].value =
                                    selectedLBLData["sessionExpire"] || 1200;
                                scope.postData.sessionExpire = selectedLBLData["sessionExpire"] || 1200;
                            } else {
                                scope.postData.sessionExpire = parseInt(value);
                            }
                        }
                    }, 2000);
                }
            }, true);

            // 响应超时时间，可选值：2-60，默认值：2，单位:秒。
            scope.timeoutSlider = {
                value: selectedLBLData["timeOut"],
                options: {
                    floor: 2,
                    ceil: 60,
                    step: 1,
                    minLimit: 2,
                    maxLimit: 60
                }
            };

            var timeoutPromise;
            scope.$watch(function () {
                return scope.timeoutSlider.value;
            }, function (value) {
                $timeout.cancel(timeoutPromise);
                timeoutPromise = $timeout(function () {
                    if (!/^([2-9]|[1-5][0-9]|60)$/.test(value)) {
                        scope.timeoutSlider.value = selectedLBLData["timeout"];
                        scope.postData.timeOut = selectedLBLData["timeout"];
                    } else {
                        scope.postData.timeOut = parseInt(value);
                    }
                }, 2000);
            });

            // 负载均衡监听器检查间隔时间，
            // TCP、UDP协议可选值：5-300秒，默认值：5。
            // HTTPS、HTTP协议可选值：30-300秒，默认值：30。
            scope.intervalTimeSlider = {
                tcpudp: {
                    value: selectedLBLData["intervalTime"],
                    options: {
                        floor: 5,
                        ceil: 300,
                        step: 1,
                        minLimit: 5,
                        maxLimit: 300
                    }
                },
                http: {
                    value: selectedLBLData["intervalTime"],
                    options: {
                        floor: 30,
                        ceil: 300,
                        step: 1,
                        minLimit: 30,
                        maxLimit: 300
                    }
                }
            };

            var intervalTimePromise;
            scope.$watch(function () {
                return scope.intervalTimeSlider[scope.selectedProtocol].value;
            }, function (value) {
                $timeout.cancel(intervalTimePromise);
                intervalTimePromise = $timeout(function () {
                    if (scope.selectedProtocol === "tcpudp") {
                        if (!/^([5-9]|[1-9][0-9]|[1-2][0-9]{2}|300)$/.test(value)) {
                            scope.intervalTimeSlider[scope.selectedProtocol].value =
                                selectedLBLData["intervalTime"];
                            scope.postData.intervalTime = selectedLBLData["intervalTime"];
                        } else {
                            scope.postData.intervalTime = parseInt(value);
                        }
                    } else {
                        if (!/^([3-9][0-9]|[1-2][0-9]{2}|300)$/.test(value)) {
                            scope.intervalTimeSlider[scope.selectedProtocol].value =
                                selectedLBLData["intervalTime"];
                            scope.postData.intervalTime = selectedLBLData["intervalTime"];
                        } else {
                            scope.postData.intervalTime = parseInt(value);
                        }
                    }
                }, 2000);
            });

            // 响应超时时间要小于检查间隔时间。
            scope.$watch(function () {
                return scope.timeoutSlider.value;
            }, function (timeout) {
                if (timeout >= scope.intervalTimeSlider[scope.selectedProtocol].value) {
                    scope.intervalTimeSlider[scope.selectedProtocol].value = timeout + 1;
                }
            });

            scope.$watch(function () {
                return scope.intervalTimeSlider[scope.selectedProtocol].value;
            }, function (intervalTime) {
                if (scope.timeoutSlider.value >= intervalTime) {
                    scope.timeoutSlider.value = intervalTime - 1;
                }
            });

            // 负载均衡监听器健康阀值，表示当连续探测三次健康则表示该转发正常
            // 可选值：2-10，单位：次，默认值：3。
            scope.healthNumSlider = {
                value: selectedLBLData["healthNum"],
                options: {
                    floor: 2,
                    ceil: 10,
                    step: 1,
                    minLimit: 2,
                    maxLimit: 10
                }
            };

            var healthNumPromise;
            scope.$watch(function () {
                return scope.healthNumSlider.value;
            }, function (value) {
                $timeout.cancel(healthNumPromise);
                healthNumPromise = $timeout(function () {
                    if (!/^([2-9]|10)$/.test(value)) {
                        scope.healthNumSlider.value = selectedLBLData["healthNum"];
                        scope.postData.healthNum = selectedLBLData["healthNum"];
                    } else {
                        scope.postData.healthNum = parseInt(value);
                    }
                }, 2000);
            });

            // 负载均衡监听器不健康阀值，表示当连续探测三次不健康则表示该转发不正常
            // 可选值：2-10，单位：次，默认值：3。
            scope.unhealthNumSlider = {
                value: selectedLBLData["unhealthNum"],
                options: {
                    floor: 2,
                    ceil: 10,
                    step: 1,
                    minLimit: 2,
                    maxLimit: 10
                }
            };

            var unhealthNumPromise;
            scope.$watch(function () {
                return scope.unhealthNumSlider.value;
            }, function (value) {
                $timeout.cancel(unhealthNumPromise);
                unhealthNumPromise = $timeout(function () {
                    if (!/^([2-9]|10)$/.test(value)) {
                        scope.unhealthNumSlider.value = selectedLBLData["unhealthNum"];
                        scope.postData.unhealthNum = selectedLBLData["unhealthNum"];
                    } else {
                        scope.postData.unhealthNum = parseInt(value);
                    }
                }, 2000);
            });

            // 对于HTTP协议的监听器，以该返回码来判断健康与否。可选值：1~31，默认31。
            // 1 代表返回 1xx 表示健康；
            // 2 代表返回 2xx 表示健康；
            // 4 代表返回 3xx 表示健康；
            // 8 代表返回 4xx 表示健康；
            // 16 代表返回 5xx 表示健康
            // 若返回多种表示健康，则将相应的值累加

            // 把11这样的整数转成数组["http_1xx", "http_2xx", "http_4xx"]
            var httpCodeContents = utilSrv.getHTTPCodeContents(selectedLBLData["httpCode"]);

            // 根据监控器原来的httpCode的值初始化新的httpCode
            scope.httpCodeList = [{
                code: 1,
                name: "http_1xx",
                selected: httpCodeContents.indexOf("http_1xx") >= 0
            }, {
                code: 2,
                name: "http_2xx",
                selected: httpCodeContents.indexOf("http_2xx") >= 0
            }, {
                code: 4,
                name: "http_3xx",
                selected: httpCodeContents.indexOf("http_3xx") >= 0
            }, {
                code: 8,
                name: "http_4xx",
                selected: httpCodeContents.indexOf("http_4xx") >= 0
            }, {
                code: 16,
                name: "http_5xx",
                selected: httpCodeContents.indexOf("http_5xx") >= 0
            }];

            scope.selectHttpCode = function (httpCode) {
                for (var i = 0; i < scope.httpCodeList.length; i++) {
                    if (scope.httpCodeList[i].code === httpCode.code) {
                        scope.httpCodeList[i].selected = !scope.httpCodeList[i].selected;
                        break;
                    }
                }
            };

            scope.$watch(function () {
                return scope.httpCodeList;
            }, function (httpCodeList) {
                scope.postData.httpCode = 0;
                _.map(httpCodeList, function (httpCode) {
                    if (httpCode.selected) {
                        scope.postData.httpCode += httpCode.code;
                    }
                });
                // console.log("httpCode: ", scope.postData.httpCode);
            }, true);

            return $uibModal.open({
                animation: true,
                templateUrl: "modifyLBListener.html",
                scope: scope
            }).result.then(function (_postData) {
                // 构造出传递给后端的postData
                var postData = {
                    params: {
                        "Region": $scope.currentRegion,
                        "loadBalancerId": _postData.loadBalancerId,
                        "listenerId": _postData.listenerId,
                        "listenerName": _postData.listenerName,
                        "httpHash": _postData.httpHash,
                        "healthSwitch": _postData.healthSwitch ? 1 : 0
                    }
                };

                // 如果开启了保持会话功能，则加上会话保持时间。
                if (_postData.sessionKeepAlive) {
                    postData.params["sessionExpire"] = _postData.sessionExpire;
                } else {
                    postData.params["sessionExpire"] = 0;
                }

                // 若果开启了健康检查功能，则加上健康检查的相关参数。
                if (_postData.healthSwitch) {
                    postData.params["intervalTime"] = _postData.intervalTime;
                    postData.params["healthNum"] = _postData.healthNum;
                    postData.params["unhealthNum"] = _postData.unhealthNum;

                    if (scope.selectedProtocol === "tcpudp") {
                        postData.params["timeOut"] = _postData.timeOut;
                    } else {
                        postData.params["httpCode"] = _postData.httpCode;
                        postData.params["httpCheckPath"] = _postData.httpCheckPath;
                    }
                }

                // console.log("modify listener postData:\n", postData);
                clbInstanceSrv.modifyLBListener(postData).then(function (result) {
                    if (result.code === 0) {
                        $timeout(function () {
                            $scope.getLBListenerData();
                        }, 3000);
                    }
                });
            });
        };

        // 负载均衡已绑定的云主机列表
        // 直接调用API获取绑定的云主机数据
        $scope.getLBBindingServers = function () {
            var postData = {
                "params": {
                    "loadBalancerId": $scope.loadBalancerId,
                    "Region": $scope.currentRegion
                }
            };
            clbInstanceSrv.getLBBindingServers(postData).then(function (result) {
                if (result.code === 0) {
                    sharedValueSrv.lbBindingServers = {
                        data: result["backendSet"],
                        loadBalancerId: result["loadBalancerId"]
                    };
                }
            });
        };

        // 初始化绑定的云主机数据，可能不会调用API
        $scope.initLBBindingServers = function () {
            // 如果sharedValueSrv.lbBindingServers不为空，
            // 并且loadbalancerId没有改变，则不需要调用API。
            if (sharedValueSrv.lbBindingServers &&
                sharedValueSrv.lbBindingServers.loadBalancerId === $scope.loadBalancerId) {
                return;
            }
            $scope.getLBBindingServers();
        };
        $scope.initLBBindingServers();

        $scope.jumpToCVMDetails = function (serverId) {
            // 跳转到相应的云主机详情页面。
            $window.location.href = "#/cvm/instances?id=" + serverId;
            // 从云主机详情页面返回时，应返回到“云主机管理”子页面。
            sharedValueSrv.activeTabId = 2;
        };

        // 强制调用API刷新数据。
        $scope.refreshLBBindingServers = function () {
            $scope.getLBBindingServers();
        };

        $scope.$watch(function () {
            return sharedValueSrv.lbBindingServers;
        }, function (lbBindingServers) {
            if (!lbBindingServers) {
                return;
            }
            $scope.lbbindingServersTable = new NgTableParams({
                count: 7,
                sorting: {instanceName: "asc"}
            }, {
                counts: [], dataset: lbBindingServers["data"]
            });

            $scope.searchLBBindingServer = function () {
                $scope.lbbindingServersTable.filter({
                    $: $scope["searchLBBindingServerItem"]
                });
            };

            $scope.lbBindServerCheckboxes = {
                allChecked: false,
                items: {}
            };

            $scope.$watch(function () {
                return $scope.lbbindingServersTable.page();
            }, function () {
                $scope.lbBindServerCheckboxes.allChecked = false;
                $scope.lbBindServerCheckboxes.items = {};
            });

            $scope.$watch(function () {
                return $scope.lbBindServerCheckboxes.allChecked;
            }, function (isChecked) {
                angular.forEach($scope.lbbindingServersTable.data, function (item) {
                    $scope.lbBindServerCheckboxes.items[item.unInstanceId] = isChecked;
                });
            });

            $scope.$watch(function () {
                return $scope.lbBindServerCheckboxes.items;
            }, function () {
                $scope.selectedLBBindingServerdata = [];
                $scope.selectedLBBindingServerItem = [];
                var checked = 0,
                    unchecked = 0,
                    total = $scope.lbbindingServersTable.data.length;

                angular.forEach($scope.lbbindingServersTable.data, function (item) {
                    checked += ($scope.lbBindServerCheckboxes.items[item.unInstanceId]) || 0;
                    unchecked += (!$scope.lbBindServerCheckboxes.items[item.unInstanceId]) || 0;
                    if ($scope.lbBindServerCheckboxes.items[item.unInstanceId]) {
                        $scope.selectedLBBindingServerdata.push(item);
                        $scope.selectedLBBindingServerItem.push(item.unInstanceId);
                    }
                });

                if ((unchecked == 0) || (checked == 0)) {
                    if (total > 0) {
                        $scope.lbBindServerCheckboxes.allChecked = (checked == total);
                    }
                }
                if (checked === 0) {
                    $scope.canModifyLBBindingServerWeight = false;
                    $scope.canUnbindLBServer = false;
                } else if (checked === 1) {
                    $scope.canModifyLBBindingServerWeight = true;
                    $scope.canUnbindLBServer = true;
                } else {
                    $scope.canModifyLBBindingServerWeight = false;
                    $scope.canUnbindLBServer = true;
                }
                angular.element(".select-all").prop("indeterminate", (checked != 0 && unchecked != 0));
            }, true);
        }, true);

        var allServersBind = function (currentBindServerIds, bindInstanceIds) {
            var counts = 0;
            for (var i = 0; i < bindInstanceIds.length; i++) {
                if (currentBindServerIds.indexOf(bindInstanceIds[i]) > -1) {
                    counts++;
                }
            }
            return counts === bindInstanceIds.length;
        };

        // 轮询新增关联云服务器操作的结果。
        var intervalBindLBServers = function (bindInstanceIds) {
            var continuePost = $interval(function () {
                var postData = {
                    "params": {
                        "loadBalancerId": $scope.loadBalancerId,
                        "Region": $scope.currentRegion
                    }
                };
                clbInstanceSrv.getLBBindingServers(postData).then(function (result) {
                    if (result.code === 0) {
                        sharedValueSrv.lbBindingServers = {
                            data: result["backendSet"],
                            loadBalancerId: result["loadBalancerId"]
                        };

                        var currentBindServerIds = [];
                        _.map(result["backendSet"], function (lbBindingServersList) {
                            currentBindServerIds.push(lbBindingServersList["unInstanceId"]);
                        });

                        // 如果新获取的绑定的云主机列表中，有所有的新增关联云服务器，则停止轮询。
                        if (allServersBind(currentBindServerIds, bindInstanceIds)) {
                            $interval.cancel(continuePost);
                            continuePost = undefined;
                            // 新增关联云服务器成功之后，需要直接调用API更新健康检查的相关数据。
                            $scope.getLBListenerData();
                            $scope.getHealthStatusData();
                            console.info("新增关联云服务器成功！");
                        }
                    }
                });
            }, 2000);
        };

        // 新增关联云服务器
        $scope.bindLBServers = function () {
            var scope = $rootScope.$new();
            scope.instanceSet = [];
            scope.backendSet = [];
            scope.selectedServerData = [];
            scope.postData = [];

            var postData = {
                "params": {
                    "Region": $scope.currentRegion,
                    "loadBalancerId": $scope.loadBalancerId
                }
            };

            var getAvaliableServersPromise = clbInstanceSrv.getAvaliableServers(postData)
                .then(function (result) {
                    if (result.code === 0) {
                        var instanceSet = result["instanceSet"];
                        for (var i = 0; i < instanceSet.length; i++) {
                            var instance = instanceSet[i];
                            scope.instanceSet.push({
                                id: instance["unInstanceId"],
                                name: instance["instanceName"],
                                status: instance["status"],
                                lanIp: instance["lanIp"],
                                wanIpSet: instance["wanIpSet"],
                                canBeSelected: instance["status"] === 2,
                                weight: 10
                            });
                        }
                    }
                });

            var getBindingServersPromise = clbInstanceSrv.getBindingServers(postData)
                .then(function (result) {
                    if (result.code === 0) {
                        var backendSet = result["backendSet"];
                        for (var i = 0; i < backendSet.length; i++) {
                            var backend = backendSet[i];
                            scope.backendSet.push({
                                id: backend["unInstanceId"],
                                name: backend["instanceName"],
                                status: backend["instanceStatus"],
                                lanIp: backend["lanIp"],
                                wanIpSet: backend["wanIpSet"],
                                weight: backend["weight"]
                            });
                        }
                    }
                });

            $q.all([getAvaliableServersPromise, getBindingServersPromise]).then(function () {
                for (var i = 0; i < scope.instanceSet.length; i++) {
                    var instance = scope.instanceSet[i];
                    for (var j = 0; j < scope.backendSet.length; j++) {
                        var backend = scope.backendSet[j];
                        if (backend["id"] === instance["id"]) {
                            instance["canBeSelected"] = false;
                            break;
                        }
                    }
                }
            });

            scope.$watch(function () {
                return scope.instanceSet;
            }, function (instanceSet) {
                if (!instanceSet) {
                    return;
                }

                scope.serversCheckboxes = {
                    allChecked: false,
                    items: {}
                };

                scope.$watch(function () {
                    return scope.serversCheckboxes.items;
                }, function (checkedItems) {
                    scope.selectedServerData = [];

                    angular.forEach(instanceSet, function (item) {
                        if (checkedItems[item.id]) {
                            scope.selectedServerData.push(item);
                        }
                    });
                }, true);
            }, true);

            scope.$watch(function () {
                return scope.selectedServerData;
            }, function (selectedServerData) {
                var oldPostData = angular.copy(scope.postData);
                scope.postData = angular.copy(selectedServerData);
                for (var i = 0; i < scope.postData.length; i++) {
                    var instance = scope.postData[i];
                    for (var j = 0; j < oldPostData.length; j++) {
                        var oldInstance = oldPostData[j];
                        if (oldInstance["id"] === instance["id"]) {
                            // 新的postData中instance的weight应该保持不变。
                            instance["weight"] = oldInstance["weight"];
                            break;
                        }
                    }
                }
                // console.log("selectedServerData:\n", selectedServerData);
            }, true);

            scope.reduceWeight = function (instance) {
                if (isNaN(instance.weight)) {
                    instance.weight = 10;
                } else {
                    instance.weight--;
                }
            };

            scope.addWeight = function (instance) {
                if (isNaN(instance.weight)) {
                    instance.weight = 10;
                } else {
                    instance.weight++;
                }
            };

            var weightPromise;
            scope.$watch(function () {
                return scope.postData;
            }, function (postData) {
                $timeout.cancel(weightPromise);
                weightPromise = $timeout(function () {
                    for (var i = 0; i < postData.length; i++) {
                        var instance = postData[i];
                        if (!/^([0-9]|[1-9][0-9]|100)$/.test(instance["weight"])) {
                            instance["weight"] = 10;
                        } else {
                            instance["weight"] = parseInt(instance["weight"]);
                        }
                    }
                }, 1000);
            }, true);

            scope.deleteInstance = function (instance) {
                var indexOfInstance = scope.postData.indexOf(instance);
                var indexOfServer;
                for (var i = 0; i < scope.postData.length; i++) {
                    var server = scope.postData[i];
                    if (server["id"] === instance["id"]) {
                        indexOfServer = scope.postData.indexOf(server);
                        break;
                    }
                }
                if (indexOfInstance > -1) {
                    scope.postData.splice(indexOfInstance, 1);
                }
                if (indexOfServer > -1) {
                    scope.selectedServerData.splice(indexOfServer, 1);
                    scope.serversCheckboxes.items[instance.id] = false;
                }
            };

            return $uibModal.open({
                animation: true,
                templateUrl: "bindLBServers.html",
                scope: scope
            }).result.then(function (_postData) {

                var postData = {
                    "params": {
                        "Region": $scope.currentRegion,
                        "loadBalancerId": $scope.loadBalancerId
                    }
                };

                // 当没有选择云主机时，不发送请求。
                if (_postData.length == 0) {
                    return;
                }

                for (var i = 0; i < _postData.length; i++) {
                    var instance = _postData[i];
                    postData["params"]["backends." + (i + 1).toString() + ".instanceId"] = instance["id"];
                    postData["params"]["backends." + (i + 1).toString() + ".weight"] = instance["weight"];
                }

                console.log("bind servers postData:\n", postData);
                clbInstanceSrv.bindLBServers(postData).then(function (result) {
                    if (result.code === 0) {
                        var bindInstanceIds = [];
                        for (var key in postData["params"]) {
                            if (/^(backends\.[0-9]+\.instanceId)$/.test(key)) {
                                bindInstanceIds.push(postData["params"][key]);
                            }
                        }
                        intervalBindLBServers(bindInstanceIds);
                    }
                });
            });
        };

        var allLBServersUnbinded = function (currentLBBindingServersIds, unBindServerIds) {
            var counts = unBindServerIds.length;
            for (var i = 0; i < unBindServerIds.length; i++) {
                var unBindServerid = unBindServerIds[i];
                if (currentLBBindingServersIds.indexOf(unBindServerid) === -1) {
                    counts--;
                }
            }
            return counts === 0;
        };

        var intervalUnbindLBServers = function (unBindServerIds) {
            var continuePost = $interval(function () {
                var postData = {
                    "params": {
                        "projectId": $scope.currentProjectId,
                        "Region": $scope.currentRegion,
                        "loadBalancerId": $scope.loadBalancerId
                    }
                };
                clbInstanceSrv.getLBBindingServers(postData).then(function (result) {
                    if (result.code === 0) {
                        var currentLBBindingServersData = result["backendSet"];
                        sharedValueSrv.lbBindingServers = {
                            data: currentLBBindingServersData,
                            loadBalancerId: result["loadBalancerId"]
                        };

                        var currentLBBindingServersIds = [];
                        for (var i = 0; i < currentLBBindingServersData.length; i++) {
                            var server = currentLBBindingServersData[i];
                            currentLBBindingServersIds.push(server["unInstanceId"]);
                        }
                        if (allLBServersUnbinded(currentLBBindingServersIds, unBindServerIds)) {
                            $interval.cancel(continuePost);
                            continuePost = undefined;
                            // 云主机解绑成功之后，需要直接调用API更新健康检查的相关数据。
                            $scope.getLBListenerData();
                            $scope.getHealthStatusData();
                            console.info("云主机解绑成功！");
                        }
                    }
                });
            }, 2000);
        };

        $scope.unbindLBServer = function () {
            var scope = $rootScope.$new();
            scope.selectedItems = $scope.selectedLBBindingServerdata;

            return $uibModal.open({
                animation: true,
                templateUrl: "unbindLBServers.html",
                scope: scope
            }).result.then(function (selectedItems) {
                var postData = {
                    "params": {
                        "Region": $scope.currentRegion,
                        "loadBalancerId": $scope.loadBalancerId
                    }
                };

                for (var i = 0; i < selectedItems.length; i++) {
                    postData["params"]["backends." + (i + 1).toString() + ".instanceId"] =
                        selectedItems[i]["unInstanceId"];
                }
                clbInstanceSrv.unbindLBServers(postData).then(function (result) {
                    if (result.code === 0) {
                        var unBindLBServerIds = [];
                        for (var key in postData["params"]) {
                            if (key !== "Region" && key !== "loadBalancerId") {
                                unBindLBServerIds.push(postData["params"][key]);
                            }
                        }
                        intervalUnbindLBServers(unBindLBServerIds);
                    }
                });
            });
        };

        var LBServerModifyWeightSuc = function (currentLBBindingServersData, unInstanceId, newWeigth) {
            for (var i = 0; i < currentLBBindingServersData.length; i++) {
                var Server = currentLBBindingServersData[i];
                if (Server["unInstanceId"] === unInstanceId &&
                    Server["weight"] === newWeigth) {
                    return true;
                }
            }
            return false;
        };

        var intervalModifyLBServiceWeight = function (unInstanceId, newWeigth) {
            var continuePost = $interval(function () {
                var postData = {
                    "params": {
                        "projectId": $scope.currentProjectId,
                        "Region": $scope.currentRegion,
                        "loadBalancerId": $scope.loadBalancerId
                    }
                };
                clbInstanceSrv.getLBBindingServers(postData).then(function (result) {
                    if (result.code === 0) {
                        var currentLBBindingServersData = result["backendSet"];
                        sharedValueSrv.lbBindingServers = {
                            data: currentLBBindingServersData,
                            loadBalancerId: result["loadBalancerId"]
                        };
                        if (LBServerModifyWeightSuc(currentLBBindingServersData, unInstanceId, newWeigth)) {
                            $interval.cancel(continuePost);
                            continuePost = undefined;
                            console.info("修改云主机权重成功！");
                        }
                    }
                });
            }, 2000);
        };

        $scope.modifyLBServerWeight = function () {
            var scope = $rootScope.$new();
            scope.selectedLBServerData = $scope.selectedLBBindingServerdata[0];

            scope.postData = {
                unLoadBalancerId: $scope.loadBalancerId,
                unInstanceId: scope.selectedLBServerData["unInstanceId"],
                weight: scope.selectedLBServerData["weight"]
            };

            return $uibModal.open({
                animation: true,
                templateUrl: "modifyLBServerWeigth.html",
                scope: scope
            }).result.then(function (_postData) {
                var newWeigth = parseInt(_postData["weight"]);
                var oldWeigth = scope.selectedLBServerData["weight"];

                // 如果没有改变，就不发送请求。
                if (newWeigth === oldWeigth) {
                    return;
                }

                var postData = {
                    "params": {
                        "Region": $scope.currentRegion,
                        "loadBalancerId": _postData["unLoadBalancerId"],
                        "backends.1.instanceId": _postData["unInstanceId"],
                        "backends.1.weight": newWeigth
                    }
                };
                clbInstanceSrv.modifyLBServerWeight(postData).then(function (result) {
                    if (result.code === 0) {
                        intervalModifyLBServiceWeight(_postData["unInstanceId"], newWeigth);
                    }
                });
            });
        };
    })
    .controller("clbListenerDetailsCtrl", function ($scope, $rootScope, $uibModal, $routeParams, $translate, $location, RegionID, clbInstanceSrv, utilSrv, sharedValueSrv) {
        $scope.loadBalancerId = $routeParams.loadBalancerId;
        $scope.listenerId = $routeParams.listenerId;
        $scope.currentRegion = RegionID.Region();
        $scope.currentProjectId = sharedValueSrv.currentProjectId || 0;
        $scope.listenerProtocols = sharedValueSrv.listenerProtocols;
        $scope.listenerHttpHash = sharedValueSrv.listenerHttpHash;
        $scope.listenerStatuses = sharedValueSrv.listenerStatuses;
        $scope.listenerHealthSwitch = sharedValueSrv.listenerHealthSwitch;
        $scope.listenerHealthCheckTypes = sharedValueSrv.listenerHealthCheckTypes;
        $scope.listenerHTTPCodes = sharedValueSrv.listenerHTTPCodes;
        $scope.listenerCheckOptions = sharedValueSrv.listenerCheckOptions;
        $scope.getCheckoutOptionContents = utilSrv.getCheckoutOptionContents;
        $scope.getHTTPCodeContents = utilSrv.getHTTPCodeContents;
        $scope.availableRegion = null;
        // 当前的负载均衡器和当前的负载均衡监听器
        $scope.loadBalancer = null;
        $scope.listener = null;

        $scope.goBackToListeners = function () {
            $location.path("/clb/instance/" + $scope.loadBalancerId + "/listener");
            // 如果是从LBL详情页面返回的，那么默认子页面应该为监听器列表页面。
            sharedValueSrv.activeTabId = 1;
        };

        $scope.$watch(function () {
            return $routeParams.listenerId;
        }, function (listenerId) {
            $scope.animation = listenerId ? "animateIn" : "animateOut";
        });

        // 过滤出当前的负载均衡器的详情。
        var setLoadBalancer = function (loadBalancersList) {
            for (var i = 0; i < loadBalancersList.length; i++) {
                var loadBalancer = loadBalancersList[i];
                if (loadBalancer.unLoadBalancerId === $scope.loadBalancerId) {
                    $scope.loadBalancer = loadBalancer;
                    break;
                }
            }
        };

        // 过滤出当前的负载均衡监听器的详情。
        var setListener = function (listenersList) {
            for (var i = 0; i < listenersList.length; i++) {
                var listener = listenersList[i];
                if (listener.unListenerId === $scope.listenerId) {
                    $scope.listener = listener;
                    break;
                }
            }
        };

        // 当通过链接或者强制刷新进入本页面时，需要通过API获取LB和LBL的数据。
        var getListeners = function () {
            var loadBalancersList = null;
            var listenersList = null;

            var clbPostData = {
                "params": {
                    "Region": $scope.currentRegion,
                    "loadBalancerType": 2
                }
            };
            clbInstanceSrv.getLBInstancersList(clbPostData).then(function (result) {
                if (result.code === 0) {
                    loadBalancersList = result["loadBalancerSet"];
                    sharedValueSrv.loadBalancers = {
                        data: loadBalancersList,
                        region: $scope.currentRegion
                    };
                    setLoadBalancer(loadBalancersList);

                    var listenerPostData = {
                        "params": {
                            "loadBalancerId": $scope.loadBalancerId,
                            "Region": $scope.currentRegion
                        }
                    };
                    clbInstanceSrv.getLBListeners(listenerPostData).then(function (result) {
                        if (result.code === 0) {
                            listenersList = result["listenerSet"];
                            sharedValueSrv.lbListeners = {
                                data: listenersList,
                                loadBalancerId: result["loadBalancerId"]
                            };
                            setListener(listenersList);
                        }
                    });
                }
            });
        };

        $scope.initListeners = function () {
            // 直接通过上一级的页面跳转进入本页面。
            if (sharedValueSrv.lbListeners &&
                sharedValueSrv.lbListeners.loadBalancerId === $scope.loadBalancerId) {
                // 如果sharedValueSrv.lbListeners不为空，
                // csharedValueSrv.loadBalancersList也不可能为空。
                setLoadBalancer(sharedValueSrv.loadBalancers.data);
                setListener(sharedValueSrv.lbListeners.data);
            } else {
                // 刷新页面时需要调用API获取数据。
                getListeners();
            }
        };
        $scope.initListeners();

        $scope.refreshListenerData = function () {
            getListeners();
        }
    });
