import "./openstackServiceSrv";

var openstackServiceModule = angular.module("openstackServiceModule", ["ngTable", "ngAnimate", "ui.bootstrap", "ngSanitize", "openstackServiceSrv", "usersrv"]);

openstackServiceModule.controller("openstackServiceCtrl", ["$scope", "$rootScope", "NgTableParams", "$translate", "openstackServiceSrv", "userDataSrv","GLOBAL_CONFIG",
    function($scope, $rootScope, NgTableParams, $translate, openstackServiceSrv, userDataSrv,GLOBAL_CONFIG) {
        var self = $scope; 
        self.servicesArr=[];
        var regionUid=JSON.parse(localStorage.$LOGINDATA).regionUid;
        openstackServiceSrv.getNodeList(regionUid).then(function(res) {
            if (res && res.data && angular.isArray(res.data)) {
                let data=res.data;
                var used = [],nouse = [],max = [],newData,nodeNamesArry = [];
                data.map(function(item){
                    if(regionUid==item.regionUid){
                       nodeNamesArry.push(item.hostName);
                    }
                });
                //判断节点的健康状态
                var nodeName = { nodeNames: nodeNamesArry };
                openstackServiceSrv.isHealthAction(nodeName, regionUid).then(function(result){
                    if(result&&result.data){
                       data.forEach(function(node){
                            if(regionUid==node.regionUid){
                               node.healthStatus = result.data[node.hostName]?result.data[node.hostName]:false; 
                            }
                            if(node.useStatus){
                                used.push(node);
                                max.push(Number(node.hostName.split("-")[1]));
                            }else{
                                nouse.push(node);
                            }
                       });
                        used.sort(function(a,b){
                            return _IP.toLong(a.hostInfoMap.ip) - _IP.toLong(b.hostInfoMap.ip);
                        });
                        nouse.sort(function(a,b){
                            return _IP.toLong(a.hostInfoMap.ip) - _IP.toLong(b.hostInfoMap.ip);
                        }).map(function(item,index){
                            item.hostName = "node-"+(Math.max.apply(null,max)+1+index);
                            return item;
                        });
                        newData = used.concat(nouse).filter(function(node){
                           return node.healthStatus;
                        });
                        self.nodeList=newData;
                        if(self.nodeList.length>0){
                           self.selectedNode=self.nodeList[0];
                           self.changeNode(self.nodeList[0]);
                        }
                    }
                });
            }
        });

         function isArrRepeat(arr){
            var hash={};
            var filterArr=[];
            for(var i=0;i<arr.length;i++){
                if(!hash[arr[i].Service]){
                   hash[arr[i].Service]=true;
                   filterArr.push(arr[i]);
                }
            }
            return filterArr;
        }

        self.changeNode=function(node){
            self.selectedNode=node;
            self.servicesArr=[];
            self.serverTable = new NgTableParams({
                count: GLOBAL_CONFIG.PAGESIZE,
            }, {
                counts: [],
                dataset:[]
            });
            openstackServiceSrv.getServerListOfNode(node.hostName).then(function(result){
                result ? self.loadServiceData = true : "";
                if(result&&result.data&&angular.isObject(result.data)){
                   let services=result.data.Services;
                   for(var key in services){
                       services[key].description=$translate.instant("aws.monitor.openstackService.serverDescription."+services[key].Service);
                       if(services[key].description.split(".").length>2){
                          services[key].description="";
                       }
                       self.servicesArr.push(services[key]);
                   }
                   //server中名字相同的要去掉
                   self.servicesArr=isArrRepeat(self.servicesArr);
                   self.serverTable = new NgTableParams({
                        count: GLOBAL_CONFIG.PAGESIZE,
                   }, {
                        counts: [],
                        dataset:self.servicesArr
                   });
                }
            });
        };
    }
]);
