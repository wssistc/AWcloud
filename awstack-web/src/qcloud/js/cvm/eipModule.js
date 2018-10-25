import "../cvm/instanceSrv";

var eipModule = angular.module("eipModule", ["ngSanitize", "ui.bootstrap.tpls", "ui.select"]);
eipModule.controller("eipCtrl", ["$scope","checkedSrv", "$uibModal","instanceSrv","$location","NgTableParams","$translate","$filter","RegionID","$rootScope","$interval",
    function($scope,checkedSrv,$uibModal,instanceSrv,$location,NgTableParams,$translate,$filter,RegionID,$rootScope,$interval){
        var self =$scope;
        self.regionList = instanceSrv.getRegionList();
        self.options = {
            region:RegionID.Region()
        };

        self.getDescribeEip = function(){
            var postData = {
                "Region":self.options.region,  
                "eipIds":[]
            };
            instanceSrv.DescribeEip(postData).then(function(result){
                if(result&& !result.code){
                    successFunc(result.data.eipSet);
                }

            })
        };

        self.changeRegion =function(item = self.options.region){
            self.options.region = item;
            sessionStorage.setItem("RegionSession",item);
             self.tableParams = new NgTableParams({ count: 10 }, { counts: [], dataset:[]});
            self.getDescribeEip();
        };

        function searchEdit(data){
            data.map(function(item){
                item.unInstanceIdNum=0;
                if(item.unInstanceId){
                   data.map(function(ipItem){
                       if(ipItem.unInstanceId==item.unInstanceId){
                          item.unInstanceIdNum++;
                       }
                   });
                }
                item.status_t = $translate.instant('CN.eip.table.status.'+item.status);
                item.type_t = $translate.instant('CN.eip.table.type.'+item.type);
                item.createTime_t = $filter("date")(item.createdAt,"yyyy-MM-dd HH:mm:ss");
                item.searchTerm = [item.eipId,item.eipName,item.status_t,item.eip,item.unInstanceId,item.createTime_t];
            });
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
                checkedSrv.checkDo(self, self.tabledata, "eipId","tableParams");
        }

        /*轮询*/
        function intervalFunc(v,ids){
            self.checkboxes.items = {};
            //var region = self.options.region;
            _.forEach(ids,function(item){
                var continuePost = $interval(function(){
                    instanceSrv.DescribeEip({
                        "Region":self.options.region,  
                        "eipIds":[item]
                    }).then(function(result){
                        if(result && result.data.eipSet && result.data.eipSet.length){
                            /*更新列表状态*/
                            _.forEach(self.tabledata,function(val){
                                if(val.eipId == item){
                                    val.status =  result.data.eipSet[0].status;
                                    val.unInstanceId = result.data.eipSet[0].unInstanceId;
                                    val.status_t= $translate.instant("CN.instances.table.status."+val.status);
                                    searchEdit(self.tabledata);
                                }
                            })
                            if(result.data.eipSet[0].status == v){
                                $interval.cancel(continuePost);
                                continuePost = undefined;
                            }
                            
                        }else if(result && result.data.eipSet && result.data.eipSet.length ==0){
                            /*删除时更新列表*/
                            /*var data =angular.copy(self.tabledata);*/
                             _.remove(self.tabledata,function(val){
                                return (val.eipId == item);
                            });
                            self.tableParams.reload();
                            $interval.cancel(continuePost);
                            continuePost = undefined;
                        }
                    });
                },5000)
              })
        }

        self.release = function(item){
            if(!item.unInstanceId){
                var scope = $rootScope.$new();
                var modalInstance =  $uibModal.open({
                   animation: $scope.animationsEnabled,
                   templateUrl: "release.html",
                   scope:scope
                }); 
                scope.disRelease = false;
                scope.confirmRelease = function(){
                    var postData = {
                        "Region":self.options.region, 
                        "eipIds":[item.eipId]
                    }
                    scope.disRelease = true;
                    instanceSrv.DeleteEip(postData).then(function(){
                        modalInstance.close();
                        intervalFunc("",[item.eipId])
                    })
                }
            }
        };

        self.unbind = function(item){
            if(item.unInstanceId){
                var scope = $rootScope.$new();
                var modalInstance =  $uibModal.open({
                   animation: $scope.animationsEnabled,
                   templateUrl: "unbind.html",
                   scope:scope
                }); 
                scope.disunbind = false;
                scope.eip = item;
                var count =0
                self.tabledata.map(val=>{
                    if(item.unInstanceId == val.unInstanceId )count+=1;
                })
                if(count<2){
                    scope.cannotunbind = true;
                }
                scope.confirmUnbind = function(){
                    var postData = {
                        "Region":self.options.region, 
                        "eipId":item.eipId,
                        "allocWanIp":0
                    };
                    scope.disunbind = true;
                    instanceSrv.EipUnBindInstance(postData).then(function(){
                        modalInstance.close();
                        intervalFunc(4,[item.eipId])
                    })
                }
            }
        }
        self.getDescribeEip();
    }]
);