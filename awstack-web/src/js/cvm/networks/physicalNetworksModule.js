import "./physicalNetworksSrv";
import "../instances/portsModule";
import "../../system/limitband/bandWidthModule"; 

var physicalNetworksModule = angular.module("physicalNetworksModule", ["physicalNetworksSrvModule","bandWidthSrv","portsModule"]);

physicalNetworksModule.controller("physicalNetworksCtrl", ["$scope", "$rootScope", "NgTableParams", "physicalNetworksSrv", "checkedSrv", "$uibModal", "$translate", "GLOBAL_CONFIG", "checkQuotaSrv", "bandWidthSrv","$routeParams","TableCom","ipSrv","commonFuncSrv",
    function($scope, $rootScope, NgTableParams, networksSrv, checkedSrv, $uibModal, $translate, GLOBAL_CONFIG, checkQuotaSrv, bandWidthSrv,$routeParams,TableCom,ipSrv,commonFuncSrv) {
        var self = $scope;
        self.netHasNoSub=$translate.instant("aws.networks.netHasNoSub");
        self.selectOneNet=$translate.instant("aws.networks.selectOneNetwork");
        self.selectNet=$translate.instant("aws.networks.selectNet");
        //搜索 
        self.globalSearchTerm = {
            "netTerm": "",
            "subTerm": "",
            "portTerm": ""
        };
        //网络设置项的初始化
        self.titleName="phyNetworks";
        if(sessionStorage["phyNetworks"]){
           self.titleData=JSON.parse(sessionStorage["phyNetworks"]);
        }else{
           self.titleData=[
              {name:'networks.name',value:true,disable:true,search:'name'},
              {name:'networks.subnetName',value:true,disable:false,search:'subnetName'},
              {name:'networks.subnetCidr',value:true,disable:false,search:'subnetCidr'},
              {name:'networks.address_range',value:true,disable:false,search:'address_range'}, 
              {name:'networks.status',value:true,disable:false,search:'state'},
              {name:'networks.shared',value:true,disable:false,search:'_shared'},
              {name:'networks.phyNet',value:true,disable:false,search:'_physical_network'},
              {name:'networks.netType',value:true,disable:false,search:'_network_type'},
              {name:'networks.availableIP',value:true,disable:false,search:'networkIpAvailability'}
           ];
        }

        function networkSearchTearm(obj){
            var tableData = obj.tableData;
            var titleData = obj.titleData;
            tableData.map(function(item){
               item.serachTerm="";
               titleData.forEach(function(showTitle){
                     if(showTitle.value){
                        if(showTitle.search=='subnetCidr'){
                           item.subnets.forEach(function(subnet){
                              item.serachTerm+=subnet.cidr+"\b"; 
                           });
                        }else if(showTitle.search=='subnetName'){
                           item.subnets.forEach(function(subnet){
                              item.serachTerm+=subnet.name+"\b"; 
                           });
                        }else if(showTitle.search=='address_range'){
                           item.subnets.forEach(function(subnet){
                              item.serachTerm+=subnet.addressPool.join("\b")+"\b"; 
                           });
                        }else{
                           item.serachTerm+=item[showTitle.search]+"\b";
                        }
                     }
               });
            });
        }
        self.networkSearchTearm=networkSearchTearm;

        var initNetworkTable = function(init) {
            self.loadNetworkData = false;
            self.globalSearchTerm.netTerm="";
            self.networkTable = new NgTableParams({
                count: GLOBAL_CONFIG.PAGESIZE
            }, {
                counts: [],
                dataset: []
            });
            networksSrv.getNetworksTableData().then(function(result) {
                result ? self.loadNetworkData = true : "";
                if (result && result.data) {
                    networksSrv.networksTableAllData = result.data;
                    self.networksTableData= _.map(result.data, function(item) {
                        item.status = item.status.toUpperCase()
                        if (item.status.toUpperCase() == "ACTIVE") {
                            item.state = $translate.instant("aws.networks.run");
                        } else {
                            item.state = $translate.instant("aws.networks.stop");
                        }
                        if(item.provider.network_type){
                           item._network_type =item.provider.network_type.toUpperCase()=='VLAN'?(item.provider.network_type.toUpperCase()+":"+(item.provider.segmentation_id?item.provider.segmentation_id:"")):item.provider.network_type.toUpperCase();
                        }
                        //物理网络
                        item._physical_network =item.provider.physical_network;
                        item._shared = item.shared == true ? $translate.instant("aws.common.yes") : $translate.instant("aws.common.no");
                        //item._external = item.external == true ? $translate.instant("aws.common.yes") : $translate.instant("aws.common.no");
                        item._adminState = item.adminState == true ? $translate.instant("aws.common.yes") : $translate.instant("aws.common.no");
                        if (item.tags && item.tags.length > 0) {
                            _.each(item.tags, function(tag) {
                                if (tag.indexOf("qos_limit") > -1) {
                                    let rateLimit_Mbps = Number(tag.split(":")[1]) / 128;
                                    item.rateLimit = Math.ceil(rateLimit_Mbps) == rateLimit_Mbps ? rateLimit_Mbps : rateLimit_Mbps.toFixed(2);
                                }
                            })
                        }else{
                            item.rateLimit = $translate.instant("aws.networks.noLimit");
                        }
                        if (item.provider.segmentation_id === null) {
                            item.provider.segmentation_id = '';
                        }   
                        //可用地址范围处理
                        item.subnets.forEach(function(subnet){
                            subnet.addressPool=[];
                            let startArr=[];
                            let endArr=[];
                            subnet.allocationPools.forEach(function(pool){
                                startArr.push(_IP.toLong(pool.start));
                                endArr.push(_IP.toLong(pool.end));
                            });
                            let startSortArr=startArr.sort(function(a,b){return a-b});
                            let endSortArr=endArr.sort(function(a,b){return a-b});
                            startSortArr.forEach(function(start,index){
                                subnet.addressPool.push(_IP.fromLong(start)+"~"+_IP.fromLong(endSortArr[index]));
                            });
                        });
                        return item;
                    });
                    networkSearchTearm({tableData:self.networksTableData,titleData:self.titleData});
                    self.networkTable = new NgTableParams({
                        count: GLOBAL_CONFIG.PAGESIZE
                    }, {
                        counts: [],
                        dataset: self.networksTableData
                    });
                    checkedSrv.checkDo(self, "", "id", "networkTable");
                }
            });
        };

        //获取网络子网信息
        var initSubnetTable = function() {
            self.subnetTable = new NgTableParams({
                count: GLOBAL_CONFIG.PAGESIZE,
            }, {
                counts: [],
                dataset: []
            });
            self.loadSubnetData = false;
            self.globalSearchTerm.subTerm="";
            networksSrv.getNetworksSubnet(self.network_id).then(function(result) {
                result ? self.loadSubnetData = true : "";
                if (result && result.data &&angular.isArray(result.data)) {
                    networksSrv.subnetsTableAllData = result.data;
                    self.subnets_data = _.map(result.data, function(item) {
                        item._enableDhcp = item.enableDhcp == true ? $translate.instant("aws.common.yes") : $translate.instant("aws.common.no");
                        item._ipVersion="ipv"+4;
                        return item;
                    });
                    TableCom.init(self,'subnetTable',self.subnets_data,'id',10,'subnetCheckbox');
                }
            });
        };
        initNetworkTable();

        self.applyGlobalSearch = function(table, term) {
            self[table].filter({
                serachTerm: self.globalSearchTerm[term]
            });
        };

        //子网刷新功能
        self.refreshNetworks=function(){
            initNetworkTable();
        };
        self.refreshPorts=function(){
            self.getNetworkPorts();
        };
        self.refreshSubnets=function(){
            initSubnetTable();
        };

        //外部网络按钮设置（非admin用户看不到外部网络菜单）
        self.$watch(function() {
            if (self.networkTable) {
                return self.networkTable.checkedItems;
            }
        }, function(value) {
            if(!value){return;}

            self.netEditBtn = false;
            self.netDelBtn = false;
            self.canCreateSubnet=false;
            self.canEditSubnet=false;

            if(value.length==1){
               self.network_id=value[0].id;
               self.netEditBtn = true;
               self.netDelBtn = true;
               self.canCreateSubnet=true;
               if(value[0].subnets.length>0){
                  self.canEditSubnet=true;
               }
            }else if(value.length>1){
               self.netDelBtn = true;
            }
        });

        //新建交换机
        self.openNetworkModal = function() {
            $rootScope.refreshPhyNetworksTable = initNetworkTable;
            $uibModal.open({
                animation: true,
                //templateUrl:"createPhyNetworkModal.html",
                templateUrl:"js/commonModal/tmpl/createPhyNetworkModal.html",
                controller:"createPhyNetworkCtrl",
                resolve: {
                    type:function(){
                        return true;
                    }
                }
            });
        };

        //编辑交换机
        self.editNetwork = function(editData) {
            if(self.netEditBtn){
                var scope = self.$new();
                var editNetModalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: "editPhyNetworkModal.html",
                    scope: scope
                });
                scope.networkForm = angular.copy(editData);
                if (editData.tags && editData.tags.length) {
                    _.each(editData.tags, function(tag) {
                        if (tag.indexOf("qos_limit") > -1) {
                            scope.networkForm.oldNetworkBandwidth = angular.copy(tag);
                            scope.networkForm.networkBandwidth = Number(tag.split(":")[1]) ? Number(tag.split(":")[1]) / 128 : "";
                        }
                    });
                }
                editNetModalInstance.rendered.then(function() {
                    scope.submitted = false;
                    scope.interacted = function(field) {
                        return scope.submitted || field.$dirty;
                    };
                    scope.editNetConfirm = function(editNetworkForm) {
                        if (editNetworkForm.$valid) {
                            scope.formSubmitted = true;
                            var editParams = {
                                "network_name": {
                                    "name": scope.networkForm.name
                                },
                                "network_id": editData.id
                            };
                            networksSrv.editNetworkAction(editParams).then(function() {
                                initNetworkTable();
                            });
                            editNetModalInstance.close();
                        } else {
                            scope.submitted = false;
                        }
                    };
                });
            }
        };

        //删除交换机
        self.deleteNetwork = function(checkedItems) {
            if(self.netDelBtn){
               self.refreshNetworkTable = initNetworkTable;
               commonFuncSrv.deleteNetwork(self,checkedItems); 
            }
        };

        //新建子网
        self.createSubnetModel = function() {
            if(self.canCreateSubnet){
                var scope = self.$new();
                $rootScope.refreshSubnetsTable = initSubnetTable;
                $rootScope.refreshNetworksTable = initNetworkTable;
                var createSubnetModel = $uibModal.open({
                    animation: true,
                    templateUrl: "js/commonModal/tmpl/createSubnetModal.html",
                    controller:"createSubnetCtrl",
                    resolve:{
                        context:self,
                        createPhySub:function(){
                            return true;
                        }
                    },
                }); 
            }
        };

        //编辑子网
        self.editSubnetModel = function(subnetCheckedItems) {
            if(self.canEditSubnet){
                var scope = self.$new();
                var editSubnetModal = $uibModal.open({
                    animation: true,
                    templateUrl: "js/commonModal/tmpl/editSubnetModal.html",
                    controller:"editSubnetCtrl",
                    resolve:{
                        context:function(){
                            return self;
                        },
                        initNetworkTable:function(){
                            return initNetworkTable;
                        },
                    }
                }); 
            } 
        };

        //删除子网
        self.deleteSubnet = function(subnetCheckedItems) {
            if(self.canEditSubnet){
                //$rootScope.refreshSubnetsTable = initSubnetTable;
                $rootScope.refreshNetworksTable =  initNetworkTable;
                self.delSubnetModel = $uibModal.open({
                    animation: true,
                    templateUrl: "js/commonModal/tmpl/delSubnetModal.html",
                    controller:"delSubnetCtrl",
                    resolve:{
                        context:function(){
                            return self;
                        }
                    }
                });
            }
        };

        //获取网络端口信息
        self.getNetworkPorts=function(){
            self.networksDetailTable = new NgTableParams({
                count: GLOBAL_CONFIG.PAGESIZE,
            }, {
                counts: [],
                dataset: []
            });
            self.loadNetworkDetailData = false;
            self.globalSearchTerm.portTerm="";
            var initNetworksDetailTable = function() {
                self.globalSearchTerm = {};
                networksSrv.getNetworksDetail(self.network_id).then(function(result) {
                    if($routeParams.id!=self.network_id){return;}
                    result ? self.loadNetworkDetailData = true : "";
                    if (result && result.data) {
                        var detailData = _.map(result.data, function(item) {
                            item._status = item.status.toUpperCase() == "ACTIVE" ? $translate.instant("aws.common.active") : $translate.instant("aws.common.down");
                            item._adminState = item.adminState == true ? $translate.instant("aws.common.yes") : $translate.instant("aws.common.no");
                            item.serachTerm = item._status + item._adminState + item.name + item.ip + item.deviceOwner;
                            return item;
                        });
                        self.networksDetailTable = new NgTableParams({
                            count: GLOBAL_CONFIG.PAGESIZE,
                        }, {
                            counts: [],
                            dataset: detailData
                        });
                        self.globalSearchTerm.netDetailTerm = "";
                    }

                });
            };
            initNetworksDetailTable();
            self.refreshNetDetail = function() {
                initNetworksDetailTable();
            };
        };

        //网络详情
        self.$on("getDetail", function(event, value) {
            self.network_id=value;
            //获取网络基本信息
            self.$watch(function(){
                 return  networksSrv.networksTableAllData
            },function(networksTableAllData){
                 networksTableAllData.forEach(function(item){
                    if(item.id==value){
                       self.baseDetailData=item;
                    }
                 });
            });
            //初始化子网选项
            self.subnetCheckbox={
                checked:false,
                items:{}
            };
            self.getNetworkPorts();
            initSubnetTable();
        });
    }
]);
physicalNetworksModule.directive("repeatVlanId", function(networksSrv) { //校验VLAN 段id是否存在
    return {
        restrict: "A",
        require: "ngModel",
        link: function(scope, elem, attrs, ngModel) {
            ngModel.$parsers.push(function(viewValue) {
                let existedVlanIds = scope.existedVlanIds;
                if (_.include(existedVlanIds, Number(viewValue))) {
                    ngModel.$setValidity("repeatVlanId", false);
                } else {
                    ngModel.$setValidity("repeatVlanId", true);
                }
                return viewValue;
            });
        }

    };
});
