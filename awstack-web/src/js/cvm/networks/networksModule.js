import "./networksSrv";
import "../instances/portsModule";
import "../../system/limitband/bandWidthModule";

var networksModule = angular.module("networksModule", ["networksSrvModule","bandWidthSrv","portsModule"]);

networksModule.controller("networksCtrl", ["$scope", "$rootScope", "NgTableParams", "networksSrv", "checkedSrv", "$uibModal", "$translate", "GLOBAL_CONFIG", "checkQuotaSrv", "bandWidthSrv","$routeParams","TableCom","$timeout","commonFuncSrv",
    function($scope, $rootScope, NgTableParams, networksSrv, checkedSrv, $uibModal, $translate, GLOBAL_CONFIG, checkQuotaSrv, bandWidthSrv,$routeParams,TableCom,$timeout,commonFuncSrv) {
        var self = $scope;
        self.netHasNoSub=$translate.instant("aws.networks.netHasNoSub");
        self.selectOneNet=$translate.instant("aws.networks.selectOneNetwork");
        self.selectNet=$translate.instant("aws.networks.selectNet");
        //搜先默认设置中的带宽不展示
        self.isShowSettingBindTitle=true;
        //用于判断带宽展示列的显示
        bandWidthSrv.getLimitData().then(function(res) {
            if (res && res.data&&angular.isArray(res.data)) {
                if(res.data.length != 0){
                    self.limitData = JSON.parse(res.data[0].paramValue);
                    if(self.limitData.limitActive){
                       self.isShowSettingBindTitle=false;
                    }else{
                       self.isShowSettingBindTitle=true;
                    }
                }else{
                    self.isShowSettingBindTitle=true;
                }
                //更新session中得数据
                self.titleData.forEach(function(title){
                    if(title.name=='networks.bindWidthNoUnit'){
                       title.isShow=self.isShowSettingBindTitle;  
                    }
                });
                sessionStorage.setItem(self.titleName,JSON.stringify(self.titleData));
                
            }
        }).finally(function(){
            initNetworkTable();
        });
        
        //判断是否是admin
        switch(localStorage.managementRole){
            case"2":
                self.isSuperAdmin = true;//是否是超级管理员
                break;
            default:
                self.isSuperAdmin = false;//是否是超级管理员
        }

        //设置项的初始化
        self.titleName="privateNetworks";
        if(sessionStorage["privateNetworks"]){
           self.titleData=JSON.parse(sessionStorage["privateNetworks"]);
        }else{
           self.titleData=[
              {name:'networks.networkName',value:true,disable:true,search:'name'},
              {name:'networks.subnetName',value:true,disable:false,search:'subnetName'},
              {name:'networks.subnetCidr',value:true,disable:false,search:'subnetCidr'},
              {name:'networks.address_range',value:true,disable:false,search:'address_range'}, 
              {name:'networks.status',value:true,disable:false,search:'state'},
              {name:'networks.shared',value:true,disable:false,search:'_shared'},
              {name:'networks.netType',value:true,disable:false,search:'_network_type'},
              {name:'networks.availableIP',value:true,disable:false,search:'networkIpAvailability'},
              {name:'networks.bindWidthNoUnit',value:true,disable:false,search:'rateLimit',isShow:self.isShowSettingBindTitle}   
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
                if (result && result.data&&angular.isArray(result.data)) {
                    networksSrv.networksTableAllData = result.data;
                    self.networksTableData= _.map(result.data, function(item) {
                        item.status = item.status.toUpperCase()
                        if (item.status.toUpperCase() == "ACTIVE") {
                            item.state = $translate.instant("aws.networks.run");
                        } else {
                            item.state = $translate.instant("aws.networks.stop");
                        }
                        item._network_type =(item.provider.network_type.toUpperCase()=='VLAN'||item.provider.network_type.toUpperCase()=='VXLAN')?(item.provider.network_type.toUpperCase()+":"+(item.provider.segmentation_id?item.provider.segmentation_id:"")):item.provider.network_type.toUpperCase();
                        item._shared = item.shared == true ? $translate.instant("aws.common.yes") : $translate.instant("aws.common.no");
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
                            //ipv4地址范围处理
                            if(subnet.ipVersion=='4'){
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
                            //ipv6地址范围处理
                            }else if(subnet.ipVersion=='6'){
                                subnet.allocationPools.forEach(function(pool){
                                    subnet.addressPool.push(pool.start+"~"+pool.end);
                                });
                            }
                            
                        });
                        return item;
                    });
                    //根据titleData拼接搜索项
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
                count: 5,
            }, {
                counts: [],
                dataset: []
            });
            self.loadSubnetData = false;
            networksSrv.getNetworksSubnet(self.network_id).then(function(result) {
                result ? self.loadSubnetData = true : "";
                if (result && result.data && angular.isArray(result.data)) {
                    networksSrv.subnetsTableAllData = result.data;
                    self.subnets_data = _.map(result.data, function(item) {
                        item._enableDhcp = item.enableDhcp == true ? $translate.instant("aws.common.yes") : $translate.instant("aws.common.no");
                        item._ipVersion="ipv"+item.ipVersion;
                        return item;
                    });
                    TableCom.init(self,'subnetTable',self.subnets_data,'id',5,'subnetCheckbox');
                }
            });
        };
        
        //搜索 
        self.globalSearchTerm = {
            "netTerm": "",
            "subTerm": "",
            "portTerm": ""
        };
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

        //网络和子网按钮判断
        self.$watch(function() {
            if (self.networkTable) {
                return self.networkTable.checkedItems;
            }
        }, function(value) {
            self.canCreateSubnet=false;//非admin用户不可操作共享子网
            self.canEditSubnet=false;//非admin用户不可操作共享子网(删除和编辑判断一致)
            self.netEditBtn = false;//非admin用户不可编辑共享网络
            self.netDelBtn = false;//非admin用户不可删除共享网络
            self.netDelBtnTip = "";
            self.netEditBtnTip = "";
            self.subAddBtnTip ="";
            if (!value) {
                return;
            }
            if(value.length == 1){
               self.network_id=value[0].id; 
            }
            if (!$rootScope.ADMIN) {
                if (value.length == 1) {
                    if (value[0].shared) { //非admin用户不能操作(编辑、删除)共享网络
                        self.netDelBtnTip = $translate.instant("aws.networks.canNotDelSharedNet");
                        self.netEditBtnTip = $translate.instant("aws.networks.canNotEditSharedNet");
                        self.subDelBtnTip = $translate.instant("aws.networks.canNotDelSharedSub");
                        self.subEditBtnTip = $translate.instant("aws.networks.canNotEditSharedSub");
                        self.subAddBtnTip = $translate.instant("aws.networks.canNotAddSharedSub");
                    }else {
                        self.netEditBtn = true;
                        self.netDelBtn = true;
                        self.canCreateSubnet=true;
                        if(value[0].subnets.length>0){
                           self.canEditSubnet=true;
                        }
                        self.netDelBtnTip = "";
                        self.netEditBtnTip = "";
                        self.subDelBtnTip = "";
                        self.subEditBtnTip = "";
                        self.subAddBtnTip ="";
                    }
                } else {
                    self.subEditBtnTip = "";
                    self.netEditBtnTip = "";
                    self.subAddBtnTip = "";
                    for (let i in value) {
                        if (value[i].shared) {
                            self.netDelBtn = false;
                            self.subDelBtnTip = $translate.instant("aws.networks.canNotDelSharedSub");
                            self.netDelBtnTip = $translate.instant("aws.networks.canNotDelSharedNet");
                            break;
                        } else {
                            self.netDelBtn = true;
                            self.subDelBtnTip = "";
                            self.netDelBtnTip = "";
                        }
                    }
                }
            } else {
                //网络相关操作
                self.subAddBtnTip ="";
                if (value.length == 1) {
                    self.netEditBtn = true;
                    self.netDelBtn = true;
                    self.canCreateSubnet=true;
                    if(value[0].subnets.length>0){
                       self.canEditSubnet=true;
                    }
                } else if(value.length > 1){
                    self.netDelBtn = true;
                }
            }

        });

        //新建交换机
        self.openNetworkModal = function(type) {
            $rootScope.refreshNetworksTable = initNetworkTable;
            $uibModal.open({
                animation: true,
                templateUrl:"js/commonModal/tmpl/createNetworkModal.html",
                controller:"createNetworkCtrl",
                resolve: {
                    singleway:function(){
                        return type;
                    }
                }
            });
        };

        //input框改变带宽的值
        self.changeBindWidth=function(value){
            var bindBar=$("#bindBar").data("ionRangeSlider");
            bindBar.update({
                min: 1,
                max: 10000,
                type: 'single',//设置类型
                from:value,
                step: 1,
                prefix: "",//设置数值前缀
                postfix: "Mbps",//设置数值后缀
                prettify: true,
                hasGrid: true,
                grid:true,
            });
        };

        //编辑交换机
        self.editNetwork = function(editData) {
            if(self.netEditBtn){
                var scope = self.$new();
                self.editSliderChange=false;
                scope.bandWidthChangeMsg=$translate.instant("aws.networks.bandWidthChangeMsg");
                var editNetModalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: "editNetworkModal.html",
                    scope: scope
                });
                scope.networkForm = angular.copy(editData);
                if(self.isSuperAdmin){
                    $timeout(function(){
                        //admin才可以编辑带宽
                        $("#bindBar").ionRangeSlider({
                            min: 1,
                            max: 10000,
                            type: 'single',//设置类型
                            from:scope.networkForm.networkBandwidth,
                            step: 1,
                            prefix: "",//设置数值前缀
                            postfix: "Mbps",//设置数值后缀
                            prettify: true,
                            hasGrid: true,
                            grid:true,
                            onChange:function(data){
                                self.editSliderChange=true;
                                scope.networkForm.networkBandwidth=data.from;
                                self.$apply();
                            }
                        });
                        //限速模式
                        if (editData.tags && editData.tags.length) {
                            _.each(editData.tags, function(tag) {
                                if (tag.indexOf("qos_limit") > -1) {
                                    scope.networkForm.oldNetworkBandwidth = angular.copy(tag);
                                    if(Number(tag.split(":")[1])){
                                       var bandWidth=Number(tag.split(":")[1]) / 128;
                                       scope.networkForm.networkBandwidth=bandWidth;
                                       self.changeBindWidth(scope.networkForm.networkBandwidth);
                                    }else{
                                       scope.networkForm.networkBandwidth=""; 
                                    }
                                }
                            });
                        }else{
                            //非限速模式且获取带宽的api正常
                            if(self.limitData){
                               scope.networkForm.networkBandwidth=self.limitData.limitType.fixType.networkBandwidth;
                               //将input框的值与滑块保持一致
                               self.changeBindWidth(scope.networkForm.networkBandwidth);
                            }
                        }
                    },100);
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
                            //只有admin才能修改带宽限速
                            if ($rootScope.ADMIN) {
                                editParams.network_name.shared = scope.networkForm.shared;
                                if (self.limitData && self.limitData.limitActive && self.limitData.typeActive == '1') {
                                    if (scope.networkForm.oldNetworkBandwidth) {
                                        editParams.network_name.oldTags = scope.networkForm.oldNetworkBandwidth;
                                    }
                                    if (Number(scope.networkForm.networkBandwidth) > 0) {
                                        editParams.network_name.newTags = "qos_limit:" + Number(scope.networkForm.networkBandwidth) * 128; // Num*1024/8
                                    }
                                }
                            }
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
                $rootScope.refreshNetworksTable =  initNetworkTable;
                var createSubnetModel = $uibModal.open({
                    animation: true,
                    templateUrl: "js/commonModal/tmpl/createSubnetModal.html",
                    controller:"createSubnetCtrl",
                    resolve:{
                        context:self,
                        createPhySub:function(){
                            return false;
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
                        }
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
                networksSrv.getNetworksDetail(self.network_id).then(function(result) {
                    if($routeParams.id!=self.network_id){return;}
                    result ? self.loadNetworkDetailData = true : "";
                    if (result && result.data) {
                        var detailData = _.map(result.data, function(item) {
                            item._status = item.status.toUpperCase() == "ACTIVE" ? $translate.instant("aws.common.active") : $translate.instant("aws.common.down");
                            item._adminState = item.adminState == true ? $translate.instant("aws.common.yes") : $translate.instant("aws.common.no");
                            item.serachTerm = [item._status, item._adminState, item.name, item.ip, item.deviceOwner].join("\b");
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
                       if(item.shared){
                          if(self.isSuperAdmin){
                             self.canCreateSubnet=true;
                             self.subAddBtnTip="";
                          }
                       }else{
                          self.canCreateSubnet=true;
                          self.subAddBtnTip="";
                       }
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
networksModule.directive("repeatVlanId", function(networksSrv) { //校验VLAN 段id是否存在
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