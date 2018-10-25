/**
 * Created by Weike on 2017/2/7.
 */
import "../clb/instanceSrv";

angular.module("buyCLBModule", ["clbInstanceSrvModule"])
    .controller("buyCLBCtrl", function ($scope, $window, $interval, $routeParams, $timeout, RegionID, clbInstanceSrv, sharedValueSrv) {
        $scope.regionsList = sharedValueSrv.regionsList;
        $scope.currentRegion = RegionID.Region();

        // 如果没有设定project，则设置project为“默认项目”：'0'
        $scope.currentProject = sharedValueSrv.currentProject || {id: 0, name: "默认项目"};
        $scope.currentProjectId = sharedValueSrv.currentProjectId || 0;

        var allNewLBsRunning = function (currentLoadBalancersList, unLoadBalancerIds) {
            var counts = 0;
            for (var i = 0; i < currentLoadBalancersList.length; i++) {
                var loadBalancer = currentLoadBalancersList[i];
                if (unLoadBalancerIds.indexOf(loadBalancer["unLoadBalancerId"]) >= 0) {
                    if (loadBalancer["status"] === 1) {
                        counts++;
                    }
                }
            }
            return counts === unLoadBalancerIds.length;
        };

        // 轮询新建负载均衡器操作的结果。
        var intervalCreateLBs = function (newLBRegionCode, unLoadBalancerIds) {
            var continuePost = $interval(function () {
                var postData = {
                    "params": {
                        "projectId": $scope.currentProjectId,
                        "Region": newLBRegionCode,
                        "loadBalancerType": 2
                    }
                };
                clbInstanceSrv.getLBInstancersList(postData).then(function (result) {
                    if (result.code === 0) {
                        var currentLoadBalancersList = result["loadBalancerSet"];
                        // 更新sharedValueSrv上的数据。
                        sharedValueSrv.loadBalancers = {
                            data: currentLoadBalancersList,
                            region: postData["params"]["Region"]
                        };
                        if (allNewLBsRunning(currentLoadBalancersList, unLoadBalancerIds)) {
                            $interval.cancel(continuePost);
                            continuePost = undefined;
                            console.info("新建负载均衡器成功！");
                        }
                    }
                });
            }, 2000);
        };

        $scope.loadBalancerTypeList = [{
            code: 2,
            name: "公网固定IP",
            tips: "分配固定的BGP公网IP，支持HTTP、HTTPS、TCP、UDP等协议转发"
        }];

        $scope.availableRegionList = [{
            name: "广州",
            code: "gz"
        }, {
            name: "上海",
            code: "sh"
        }, {
            name: "北京",
            code: "bj"
        }];
        // }, {
        //     name: "香港",
        //     code: "hk"
        // }, {
        //     name: "新加坡",
        //     code: "sg"
        // }, {
        //     name: "北美",
        //     code: "ca"
        // }];

        $scope.vpcTypeList = [{
            code: 0,
            name: "基础网络"
        }, {
            code: 1,
            name: "私有网络"
        }];

        $scope.postData = {
            Region: $scope.currentRegion,
            projectId: $scope.currentProjectId,
            loadBalancerType: 2,
            vpcType: $routeParams["vpcId"] ? 1 : 0,
            vpcId: $routeParams["vpcId"] || 0,
            number: 1
        };

        $scope.selectLBType = function (lbType) {
            $scope.postData.loadBalancerType = lbType["code"];
        };

        $scope.selectRegion = function (region) {
            $scope.postData.Region = region["code"];
        };

        $scope.selectVpcType = function (vpcType) {
            $scope.postData.vpcType = vpcType["code"];
        };

        $scope.vpcList = [];
        // 如果用户选择了“私有网络”，需要根据用户选择的region实时更新VPCList。
        var initVpcList = function (region) {
            var vpcPostData = {
                "params": {
                    "Region": region
                }
            };
            clbInstanceSrv.getVpcList(vpcPostData).then(function (result) {
                if (result.code === 0) {
                    $scope.vpcList = result.data;
                    if ($scope.vpcList.length > 0) {
                        // 初始化私有网络。
                        if ($routeParams["vpcId"] &&
                            $scope.postData.Region === $routeParams["vpcId"].split("_")[0]) {
                            $scope.postData.vpcId = $routeParams["vpcId"];
                        } else {
                            $scope.postData.vpcId = $scope.vpcList[0]["vpcId"];
                        }
                    } else {
                        // 如果当前region没有vpc，需要提醒用户去创建新的vpc。
                        $scope.postData.vpcId = undefined;
                    }
                }
            });
        };

        $scope.ShowVpcList = false;
        $scope.$watch(function () {
            return $scope.postData.vpcType;
        }, function (vpcType) {
            if (vpcType === 0) {
                $scope.ShowVpcList = false;
                $scope.postData.vpcId = vpcType;
            } else {
                $scope.ShowVpcList = true;
                initVpcList($scope.postData.Region);
            }
        }, true);

        $scope.$watch(function () {
            return $scope.postData.Region;
        }, function (newRegionCode) {
            if ($scope.ShowVpcList) {
                initVpcList(newRegionCode);
            }
        });

        $scope.selectProject = function (project) {
            $scope.postData.projectId = project["id"];
        };

        $scope.reduceNumber = function () {
            if (isNaN($scope.postData.number)) {
                $scope.postData.number = 1;
            } else {
                $scope.postData.number--;
            }
        };

        $scope.addNumber = function () {
            if (isNaN($scope.postData.number)) {
                $scope.postData.number = 1;
            } else {
                $scope.postData.number++;
            }
        };

        var numberPromise;
        $scope.$watch(function () {
            return $scope.postData.number;
        }, function (number) {
            $timeout.cancel(numberPromise);
            numberPromise = $timeout(function () {
                if (!/^[1-9][0-9]*$/.test(number)) {
                    $scope.postData.number = 1;
                }
            }, 3000);
        }, true);

        $scope.price = 0;
        var getPrice = function () {
            var pricePostData = {
                "params": {
                    "Region": $scope.postData.Region,
                    "loadBalancerType": $scope.postData.loadBalancerType
                }
            };
            clbInstanceSrv.getPrice(pricePostData).then(function (result) {
                if (result.code === 0) {
                    $scope.price = result.price / 100;
                }
            });
        };
        getPrice();

        $scope.getTotalPrice = function () {
            var total = 0;
            if (!isNaN($scope.postData.number)) {
                total = parseInt($scope.postData.number);
            }
            return total * $scope.price;
        };

        $scope.confirmBuyCLB = function () {
            // 如果新购买的负载均衡器不属于当前的region，需要更新region和LB数据。
            if ($scope.postData.Region !== $scope.currentRegion) {
                // 修改当前的region。
                for (var i = 0; i < $scope.regionsList.length; i++) {
                    var region = $scope.regionsList[i];
                    if (region.code === $scope.postData.Region) {
                        // 修改本地保存的regionCode
                        sessionStorage.setItem("RegionSession", $scope.postData.Region);
                        break;
                    }
                }
                var _postData = {
                    "params": {
                        "Region": $scope.postData.Region,
                        "projectId": $scope.currentProjectId,
                        "loadBalancerType": 2
                    }
                };

                // 需要在跳转到新的region的LB页面之前更新LB的数据。
                clbInstanceSrv.getLBInstancersList(_postData).then(function (result) {
                    if (result.code === 0) {
                        sharedValueSrv.loadBalancersList = result["loadBalancerSet"];
                    }
                });
            }

            // 跳转到购买的负载均衡实例所属的region的CLB列表页面。
            $window.location.href = "#/clb/instance";

            delete $scope.postData.vpcType;

            var postData = {"params": $scope.postData};
            // console.log("buy clb instance postData:\n", postData);
            clbInstanceSrv.buyLBInstancer(postData).then(function (result) {
                if (result.code === 0) {
                    var newLBRegionCode = postData["params"]["Region"];
                    var unLoadBalancerIds = result["unLoadBalancerIds"][result["dealIds"][0]];
                    intervalCreateLBs(newLBRegionCode, unLoadBalancerIds);
                }
            });
        };
    });
