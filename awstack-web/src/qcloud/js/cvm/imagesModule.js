import "../cvm/instanceSrv";

var imagesModule = angular.module("imagesModule", ["ngSanitize", "ui.bootstrap.tpls", "ui.select"]);
imagesModule.controller("imagesCtrl", ["$scope","checkedSrv", "$uibModal","instanceSrv","$location","NgTableParams","$translate","$filter","RegionID","$rootScope","$window","$timeout",
    function($scope,checkedSrv,$uibModal,instanceSrv,$location,NgTableParams,$translate,$filter,RegionID,$rootScope,$window,$timeout){
        var self =$scope;
        self.regionList = instanceSrv.getRegionList();
        self.imgTypeList = [{name:"公共镜像",value:2},{name:"私有镜像",value:1}];
        self.options = {
            region:RegionID.Region(),
            imgType:self.imgTypeList[0]
        };
        self.changeRegion =function(item = self.options.region){
            self.options.region = item;
            sessionStorage.setItem("RegionSession",item);
            self.tabledata = [];
            self.tableParams = new NgTableParams({ count: 10 }, { counts: [], dataset:self.tabledata});
            self.globalSearchTerm = "";
            self.isDisabled = true;
            getImage(item)
        };
        self.changeImgType = function(item){
            self.options.imgType = item;
            self.changeRegion()
        };
        //获取选中的id
        self.getIds = function(){
            var ids = [];
            self.checkedItems.map(item =>{
                ids.push(item.unImgId)
            })
            return ids;
        }
        //新建云主机
        self.toAddVm = function(item,type){
            if(!self.isDisabled || type){
                $location.url("/buy/instances?imageId="+item.unImgId + "&imgageType=" +item.imageType )
            }
        };
        //获取镜像详情
        $scope.$on("getDetail", function(event, value) {
            var postData = {
                "Region":self.options.region,
                "imageType": self.options.imgType.value ,// 镜像类型，1: 私有镜像 2: 公共镜像 3: 服务市场 4: 共享镜像
                "imageIds": [value] 
            };
            instanceSrv.getImage(postData).then(function(result){
                self.detailInfo = result.imageSet[0]
            })
        });
        function getImage(chkregion = self.options.region){
            var postData = {
                "Region":chkregion,
                "imageType": self.options.imgType.value ,// 镜像类型，1: 私有镜像 2: 公共镜像 3: 服务市场 4: 共享镜像
                "imageIds": [] 
            };
            instanceSrv.getImage(postData).then(function(result){
                if(result && result.imageSet){
                    if(self.options.imgType.value == postData.imageType){
                        successFunc(result.imageSet);
                    }
                }
            })
        }
        function searchEdit(data){
            data.map(function(item){
                item.status_t = $translate.instant('CN.images.table.status.'+item.status);
                item.imageType_s = $translate.instant('CN.images.table.imageType.'+item.imageType);
                item.createTime_t = $filter("date")(item.createTime,"yyyy-MM-dd HH:mm:ss");
                item.searchTerm = [item.unImgId,item.imageName,item.osName,item.status_t,item.imageType_s,item.createTime_t]
            })
            return data;
        }

        function successFunc(data) {
            //self.tabledata = data;
            self.tabledata = searchEdit(data)
            self.tableParams = new NgTableParams({ count: 10 }, { counts: [], dataset:self.tabledata});
            self.applyGlobalSearch = function() {
                var term = self.globalSearchTerm;
                self.tableParams.filter({ searchTerm: term });
            };
            checkedSrv.checkDo(self, self.tabledata, "unImgId","tableParams");
        }
        $window.imageInterFunc = function(v,ids,type){
            self.checkboxes.items = {};
            var region = self.options.region;
            var flag=false;
            var timer = $timeout(function(){
                instanceSrv.getImage({
                    "Region":self.options.region,
                    "imageType": self.options.imgType.value ,// 镜像类型，1: 私有镜像 2: 公共镜像 3: 服务市场 4: 共享镜像
                    "imageIds": ids
                }).then(function(result){
                    if(result && result.imageSet && result.imageSet.length){
                        //更新列表状态
                        var SatisfyCount = 0;
                        _.forEach(result.imageSet,function(obj){
                            _.forEach(self.tabledata,function(val){
                                if(val.unImgId == obj.unImgId ){
                                    val.status =  obj.status;
                                    val.status_t = $translate.instant("CN.instances.table.status."+val.status);
                                    searchEdit(self.tabledata);
                                }
                            })
                        })
                        
                    }else if(result && result.imageSet && result.imageSet.length ==0){
                        //删除时更新列表
                        var data =angular.copy(self.tabledata);
                        _.forEach(ids,function(item){
                            _.remove(self.tabledata,function(val){
                                return (val.unImgId == item);
                            });
                        })
                        console.log(self.tabledata)
                        self.tableParams.reload();
                        
                        flag=true;
                    }
                }).finally(function(){
                    if(!flag){
                        $window.imageInterFunc(v,ids,type);
                    }else{
                        $timeout.canel(timer);
                    }
                })
            },5000)
        }
        //删除私有镜像
        self.delImage = function(){
            if(!self.delisDisabled){
                var scope = $rootScope.$new();
                var modalInstance =  $uibModal.open({
                   animation: $scope.animationsEnabled,
                   templateUrl: "delImage.html",
                   scope:scope
                }); 
                scope.checkedItems = self.checkedItems;
                scope.showVm = function(){
                    scope.show_vm = !scope.show_vm
                }
                scope.confirmDelImage = function(){
                    var postData = {
                        "Region": self.options.region,
                        "imageIds":self.getIds(),
                    };
                    instanceSrv.DeleteImages(postData).then(function(result){
                        if(result && result.code==0){
                            $window.imageInterFunc("",self.getIds())
                        }
                    })
                    modalInstance.close();
                }
            }
            
        }

        getImage();
    }]
);