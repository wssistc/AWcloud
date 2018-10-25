import "./vpnSrv";
import "./routersSrv";

var vpnModule=angular.module("vpnModule", ["vpnSrvModule","routersSrvModule"]);
vpnModule.controller('vpnCtrl',['$scope','vpnSrv','$window','$uibModal','$translate','NgTableParams','GLOBAL_CONFIG','checkedSrv','$timeout',function($scope,vpnSrv,$window,$uibModal,$translate,NgTableParams,GLOBAL_CONFIG,checkedSrv,$timeout){
    var self=$scope;
    self.selectOneVpn='请选择一个IPSec VPN';
    self.oneLocalSubnte='当前IPSec VPN仅有一个本地子网，不可删除';
    self.oneTargetNet='当前IPSec VPN仅有一个目标网络，不可删除';
    function initVpnTableData(){
        self.loadData =false;
        self.globalSearchTerm="";
        self.webVpnData = "";
        self.vpnTable = new NgTableParams({ count: GLOBAL_CONFIG.PAGESIZE, sorting: { router: "asc" }}, {counts: [],dataset: []});
        vpnSrv.getVpnList().then(function(res){
          self.globalSearchTerm = "";
            res ? self.loadData = true : "";
            if(res&&res.data){
                self.webVpnData = res.data ;
                self.vpnTableData = res.data;
                successFunc(res.data);
            }
        });
    }
    initVpnTableData();

    function successFunc(data){
        self.tabledata=data;
        self.tabledata.map(function(item) {
            //处理返回的数据
            item._state=item.status.toString().toLowerCase();
            item._status = $translate.instant("aws.vpn.status." + item.status.toString().toLowerCase());
            //item.searchTerm=[item.name,item._status,item.local_address,item.peer_address,item.localNets,item.cidrNets,item.description].join(",");
            return item;
       });
       vpnSearchTearm({tableData:self.vpnTableData,titleData:self.titleData});       
       self.vpnTable = new NgTableParams({ count: GLOBAL_CONFIG.PAGESIZE, sorting: { router: "asc" }}, {counts: [],dataset: self.tabledata});
       checkedSrv.checkDo(self, data, "id",'vpnTable');
    }
    function vpnSearchTearm(obj) {
        var tableData = obj.tableData;
        var titleData = obj.titleData;
        tableData.map(function(item){
            item.searchTerm = [];
            titleData.forEach(function(showTitle){
                if (showTitle.value) {
                    if (showTitle.name == "vpn.localSubnet") {
                        item.localNets.forEach(function(localNet){
                           item.searchTerm.push(localNet);
                        });
                    } else if (showTitle.name == "vpn.targetNetwork") {
                        item.cidrNets.forEach(function(cidrNet){
                            item.searchTerm.push(cidrNet);
                        });
                    } else {
                        item.searchTerm.push(item[showTitle.search]);
                    }
                }
            });
            item.searchTerm = item.searchTerm.join("\b");
        });
    }
    self.vpnSearchTearm=vpnSearchTearm;

    //vpn设置项的初始化
    self.titleName="vpnTitleName";
    if(sessionStorage["vpnTitleName"]){
       self.titleData=JSON.parse(sessionStorage["vpnTitleName"]);
    }else{
       self.titleData=[
          {name:'vpn.name',value:true,disable:true,search:'name'},
          {name:'vpn.state',value:true,disable:false,search:'_status'},
          {name:'vpn.localGateway',value:true,disable:false,search:'local_address'},
          {name:'vpn.destinationGateway',value:true,disable:false,search:'peer_address'},
          {name:'vpn.localSubnet',value:true,disable:false,search:''},
          {name:'vpn.targetNetwork',value:true,disable:false,search:''},
          {name:'vpn.description',value:true,disable:false,search:'description'}
       ];
    }

    //删除数组中的某个元素
    Array.prototype.removeVpnId = function(val) {
        var index = this.indexOf(val);
        if (index > -1) {
            this.splice(index, 1);
        }
    };
    self.resizeNum={};
    self.timerStart=false;

    //判断VPN是否可以删(根据需求暂时为任何状态下都可删除)
    function canDelFunc(status){
       var canDel=false;
       var statusArr=['build','pending_create','pending_update','pending_delete'];
       if(!_.include(statusArr,status)){
           canDel=true;
       }
       return canDel;
    }

    //vpn中启用和禁用按钮的判断
    self.$watch(function(){
        return self.checkedItems;
    },function(values){
        if(!values){
            return;
        }
        self.canEdit=false;
        self.canDel=false;
        self.canEnabled=false;
        self.canDisabled=false;
        //更多操作
        self.canAddTargetNet=false;
        self.canDelTargetNet=false;
        self.canAddLocalSubnet=false;
        self.canDelLocalSubnet=false;
        if(values.length==1){
           self.canEdit=true;
           self.canDel=true;
           if(values[0].admin_state_up){
              self.canDisabled=true;
              self.canEnabled=false;
           }else if(!values[0].admin_state_up){
              self.canDisabled=false;
              self.canEnabled=true;
           }
           //更多操作
           self.canAddTargetNet=true;
           self.canAddLocalSubnet=true;
           if(values[0].cidrNets.length>1){
              self.canDelTargetNet=true;
           }
           if(values[0].localNets.length>1){
              self.canDelLocalSubnet=true;
           }
        }else if(values.length>1){
           var enableNum=0;
           var disabledNum=0;
           var notDeleteNum=0;
           values.forEach(function(item){
               if(item.admin_state_up){
                  enableNum++;
               }else if(!item.admin_state_up){
                  disabledNum++;
               }
           });
           if(enableNum==values.length){
               self.canDisabled=true;
           }
           if(disabledNum==values.length){
               self.canEnabled=true;
           }
           self.canDel=true;
        }
    });

    self.$on("changeVpnStatus", function(e, data) {
        let vpnStatus = JSON.parse(data)
        if(!self.webVpnData) return
        initVpnTableData();
    });

    self.refreshVpn=function(){
        initVpnTableData();
    };

    self.applyGlobalSearch=function(globalSearchTerm){
        var term=self.globalSearchTerm;
        self.vpnTable.filter({
            searchTerm:term
        });
    };
    
    function operateSelectData(array1,array2){
        var result=[];
        for(var i = 0; i < array2.length; i++){
            var obj = array2[i];
            var n1 = obj.cidr;
            var isExist = false;
            for(var j =0 ; j < array1.length; j++){
                var aj = array1[j];
                if(aj){
                    var n2 = aj.cidr;
                    if(n1 == n2){
                        isExist = true;
                        break;
                    }
                }
            }
            if(!isExist){
                result.push(obj);
            }
        }
        return result;
    }

    //校验目标网络是否有重叠
    var isCidrOverlap = function(cidrArr) {
        let targetNetOverlap=false;
        let startArr=[];
        let endArr=[];
        _.each(cidrArr, function(item) {
            startArr.push(_IP.toLong(_IP.cidrSubnet(item).firstAddress));
            endArr.push(_IP.toLong(_IP.cidrSubnet(item).lastAddress));
        });
        let startSortArr=startArr.sort(function(a,b){return a-b});
        let endSortArr=endArr.sort(function(a,b){return a-b});
        for(var k=1;k<startSortArr.length;k++){
            if (startSortArr[k] <= endSortArr[k-1]){
                targetNetOverlap=true;
                break;
            }
        }
        return targetNetOverlap;
    };

    //新建 
    self.updateVpn=function(type,bool){
       var updateVpnModal=$uibModal.open({
            animation: true,
            templateUrl: "js/cvm/networks/tmpl/updateVpn.html",
            controller: "updateVpnCtrl",
            resolve:{
                operateSelectData:function(){
                    return operateSelectData;
                },
                initVpnTableData:function(){
                    return initVpnTableData;
                },
                isCidrOverlap:function(){
                    return isCidrOverlap;
                },
                singleway:function(){
                    return bool;
                }
            }
	     });
    };

    //编辑vpn
    self.editVpn=function(editdata){
         var editVpnModal=$uibModal.open({
            animation: true,
            templateUrl: "editVpn.html",
            controller: "editVpnCtrl",
            resolve:{
                editData:function(){
                  return editdata;
                },
                initVpnTableData:function(){
                    return initVpnTableData;
                },
            }
         });
    };


    //添加本地子网
    self.addLocalSubnet=function(){
         if(self.canAddLocalSubnet){
            var addLocalSubnetModal=$uibModal.open({
              animation: true,
              templateUrl: "addLocalSubnet.html",
              controller: "addLocalSubnetCtrl",
              resolve:{
                  operateSelectData:function(){
                      return operateSelectData;
                  },
                  getDetailFunc:function(){
                      return self.getVpnDetail;
                  },
                  initVpnTableData:function(){
                      return initVpnTableData;
                  },
                  baseDetailData:function(){
                      return self.baseDetailData;
                  },
                  context:function(){
                      return self;
                  }
              }
           });
         } 
    };

    //添加目标网络
    self.addTargetNet=function(){
         if(self.canAddTargetNet){
            var addLocalSubnetModal=$uibModal.open({
                animation: true,
                templateUrl: "addTargetNet.html",
                controller: "addTargetNetCtrl",
                resolve:{
                    getDetailFunc:function(){
                        return self.getVpnDetail;
                    },
                    initVpnTableData:function(){
                        return initVpnTableData;
                    },
                    isCidrOverlap:function(){
                        return isCidrOverlap;
                    },
                    context:function(){
                        return self;
                    }
                }
             });
         } 
    };

     //删除本地子网
    self.deleteSubnet = function() {
        if(self.canDelLocalSubnet){
           self.delLocalSubnetModal=$uibModal.open({
              animation: true,
              templateUrl: "delLocalSubnet.html",
              controller: "delLocalSubnetCtrl",
              resolve:{
                  context:function(){
                      return self;
                  }
              }
           });
        }
    };
    self.$on("deleteSubnet", function(e,data) {
        var delSubArr=[];
        var existSubArr=[];
        data.checkedSubnetItems.forEach(function(item){
            delSubArr.push(item.subnetId);
        });
        data.baseDetailData.endpointGroupSubnet.subnets.forEach(function(item){
            existSubArr.push(item.subnetId);
        });
        var updateSubArr=_.difference(existSubArr,delSubArr);
        var params={
            "name": data.baseDetailData.endpointGroupSubnet.name,
            "description": data.baseDetailData.endpointGroupSubnet.description,
            "type": 'subnet',
            "id": data.baseDetailData.endpointGroupSubnet.id,
            "endpoints": updateSubArr
        };
        self.delLocalSubnetModal.close();
        vpnSrv.updateEndpointGroup(data.baseDetailData.ipsecSiteConnection.id,params).then(function(){
            initVpnTableData();
        });
    });

    //删除目标网络
    self.delTargetNet = function() {
        if(self.canDelTargetNet){
           self.delTargetNetModal=$uibModal.open({
                animation: true,
                templateUrl: "delTargetNet.html",
                controller: "delTargetNetCtrl",
                resolve:{
                    context:function(){
                        return self;
                    }
                }
           });
        }
    };
    self.$on("delTargetNet", function(e,data) {
        var targetNetArr=[];
        data.checkedTargetNetItems.forEach(function(item){
            targetNetArr.push(item.id);
        });
        var updateTargetNetArr=_.difference(data.baseDetailData.endpointGroupCidr.endpoins,targetNetArr);
        var params={
            "name": data.baseDetailData.endpointGroupCidr.name,
            "description": data.baseDetailData.endpointGroupCidr.description,
            "type": 'cidr',
            "id": data.baseDetailData.endpointGroupCidr.id,
            "endpoints": updateTargetNetArr
        };
        self.delTargetNetModal.close();
        vpnSrv.updateEndpointGroup(data.baseDetailData.ipsecSiteConnection.id,params).then(function(){
            initVpnTableData();
        });
    });
    
    self.hidePassword=function(){
        self.isHidePassword=!self.isHidePassword;
    };

    self.refreshDetail=function(){
       self.getVpnDetail();
    };
    self.search={
       subnetSearchTerm:"",
       networkSearchTerm:""
    };
    self.detailSearch=function(table,searchTerm){
       var term=self.search[searchTerm];
       self[table].filter({
           searchTerm:term
       });
    };

    $scope.$on("getDetail", function(event, value){
        self.baseDetailData={};
        self.isHidePassword=true;
        //vpn基础信息
        self.getVpnDetail=function(){
             self.search={
                 subnetSearchTerm:"",
                 networkSearchTerm:""
             };
             //先清空一遍数据
             self.localSubTable = new NgTableParams({count: GLOBAL_CONFIG.PAGESIZE,sorting: {router: "asc" }}, {counts: [],dataset: []});
             self.targetNetTable = new NgTableParams({count: GLOBAL_CONFIG.PAGESIZE,sorting: { router: "asc"}}, {counts: [],dataset: []});
             vpnSrv.getVpnDetail(value).then(function(res){
                if(res&&res.data){
                   self.baseDetailData=res.data;
                   self.baseDetailData.IKEConsultativePeriod=self.baseDetailData.ikepolicy.lifetime_value+"("+$translate.instant('aws.vpn.'+self.baseDetailData.ikepolicy.lifetime_units)+")";
                   self.baseDetailData.IPSecProtocolCycle=self.baseDetailData.ipsecpolicy.lifetime_value+"("+$translate.instant('aws.vpn.'+self.baseDetailData.ipsecpolicy.lifetime_units)+")";
                   self.baseDetailData.ipsecSiteConnection.interval=self.baseDetailData.ipsecSiteConnection.interval+"(秒)";
                   self.baseDetailData.ipsecSiteConnection.timeout=self.baseDetailData.ipsecSiteConnection.timeout+"(秒)";
                   self.baseDetailData.ipsecSiteConnection.connectionMode=$translate.instant('aws.vpn.action.'+self.baseDetailData.ipsecSiteConnection.initiator);
                   self.baseDetailData.ipsecSiteConnection.DPDaction=$translate.instant('aws.vpn.action.'+self.baseDetailData.ipsecSiteConnection.action);
                   self.routerId=self.baseDetailData.vpnservice.router_id;
                   self.endpointSubGroupId=self.baseDetailData.endpointGroupSubnet.id;
                   //预共享密码处理
                   if(self.baseDetailData.ipsecSiteConnection.psk.length>45 ){
                      
                   }
                   //self.baseDetailData.ipsecSiteConnection.psk.length>49?
                   //本地子网数据处理
                   var subnet_data=self.baseDetailData.endpointGroupSubnet.subnets;     
                   subnet_data.map(function(item){
                       item.searchTerm=item.cidr;
                   });
                   self.localSubTable = new NgTableParams({
                        count: GLOBAL_CONFIG.PAGESIZE,
                        sorting: {
                            router: "asc"
                        }
                   }, {
                        counts: [],
                        dataset: subnet_data
                   });
                   self.subnet_checkbox = {
                      checked: false,
                      items: {}
                   };
                   self.$watch(function() {
                      return self.localSubTable.page();
                   }, function() {
                      self.subnet_checkbox.checked = false;
                   });
                   self.$watch(function() {
                        return self.subnet_checkbox.checked;
                   }, function(value) {
                        angular.forEach(self.localSubTable.data, function(item) {
                            if (!item.unChecked) {
                                self.subnet_checkbox.items[item.subnetId] = value;
                            }
                        });
                   });
                   self.$watch(function() {
                        return self.subnet_checkbox.items;
                   }, function() {
                        self.checkedSubnetItems = [];
                        var checked = 0,
                            unchecked = 0,
                            total = self.localSubTable.data.length;

                        angular.forEach(self.localSubTable.data, function(item) {
                            checked += (self.subnet_checkbox.items[item.subnetId]) || 0;
                            unchecked += (!self.subnet_checkbox.items[item.subnetId]) || 0;
                            if (self.subnet_checkbox.items[item.subnetId]) {
                                self.checkedSubnetItems.push(item);
                            }
                        });

                        if ((unchecked == 0) || (checked == 0)) {
                            if (total > 0) {
                                self.subnet_checkbox.checked = (checked == total);
                            }
                        }
                        self.canDelSubnet=false;
                        if (checked>0&&(total-checked)>0) {
                           self.canDelSubnet=true;       
                        }
                        angular.element(".select-all-subnetsTable").prop("indeterminate", (checked != 0 && unchecked != 0));
                   }, true);

                   //目标网络数据处理
                   var targetNet_data=[];
                   self.baseDetailData.endpointGroupCidr.endpoins.forEach(function(item){
                       targetNet_data.push({id:item,value:item});
                   });
                   targetNet_data.map(function(item){
                       item.searchTerm=item.value;
                   });
                   self.targetNetTable = new NgTableParams({
                        count: GLOBAL_CONFIG.PAGESIZE,
                        sorting: {
                            router: "asc"
                        }
                   }, {
                        counts: [],
                        dataset: targetNet_data
                   });
                   self.targetNet_checkbox = {
                      checked: false,
                      items: {}
                   };
                   self.$watch(function() {
                      return self.targetNetTable.page();
                   }, function() {
                      self.targetNet_checkbox.checked = false;
                   });
                   self.$watch(function() {
                        return self.targetNet_checkbox.checked;
                   }, function(value) {
                        angular.forEach(self.targetNetTable.data, function(item) {
                            if (!item.unChecked) {
                                self.targetNet_checkbox.items[item.id] = value;
                            }
                        });
                   });
                   self.$watch(function() {
                        return self.targetNet_checkbox.items;
                   }, function() {
                        self.checkedTargetNetItems = [];
                        var checked = 0,
                            unchecked = 0,
                            total = self.targetNetTable.data.length;

                        angular.forEach(self.targetNetTable.data, function(item) {
                            checked += (self.targetNet_checkbox.items[item.id]) || 0;
                            unchecked += (!self.targetNet_checkbox.items[item.id]) || 0;
                            if (self.targetNet_checkbox.items[item.id]) {
                                self.checkedTargetNetItems.push(item);
                            }
                        });

                        if ((unchecked == 0) || (checked == 0)) {
                            if (total > 0) {
                                self.targetNet_checkbox.checked = (checked == total);
                            }
                        }
                        self.canDelTargetNet=false;
                        if (checked>0&&(total-checked)>0) {
                           self.canDelTargetNet=true;     
                        }
                        angular.element(".select-all-targetNetTable").prop("indeterminate", (checked != 0 && unchecked != 0));
                   }, true);


                }
             });
        };
        self.getVpnDetail();
    });

    //删除VPN
    self.deleteVPN = function() {
        var content = {
            target: "deleteVPN",
            msg: "<span>" + $translate.instant("aws.vpn.delVPN") + "</span>"
        };
        self.$emit("delete", content);
    };
    self.$on("deleteVPN", function() {
        var VPNcheckedItems = self.checkedItems;
        var del_obj_ids = [];
        _.forEach(VPNcheckedItems, function(item) {
            del_obj_ids.push(item.id);
        });
        var delParams = {
            ids: del_obj_ids
        };
        vpnSrv.deleteVPN(delParams).then(function() {
            initVpnTableData();
        });
    });
    
    //启用VPN
    self.enabledVPN = function() {
        var VPNcheckedItems = self.checkedItems;
        var del_obj_ids = [];
        _.forEach(VPNcheckedItems, function(item) {
            del_obj_ids.push(item.id);
        });
        var delParams = {
            ids: del_obj_ids
        };
        vpnSrv.enabledVPN(delParams).then(function() {
            self.checkboxes.items = {};
            // initVpnTableData();
        });
    };

    //禁用VPN
    self.disabledVPN = function() {
        var VPNcheckedItems = self.checkedItems;
        var del_obj_ids = [];
        _.forEach(VPNcheckedItems, function(item) {
            del_obj_ids.push(item.id);
        });
        var delParams = {
            ids: del_obj_ids
        };
        vpnSrv.disabledVPN(delParams).then(function() {
            self.checkboxes.items = {};
            // initVpnTableData();
        });
    };


}]);
vpnModule.controller('updateVpnCtrl',['$scope','vpnSrv','routersSrv','singleway','$translate','operateSelectData','initVpnTableData','$uibModalInstance','isCidrOverlap',function($scope,vpnSrv,routersSrv,singleway,$translate,operateSelectData,initVpnTableData,$uibModalInstance,isCidrOverlap){
    var self=$scope;
    self.singlePassageway = singleway;
    self.domainproject = {};
    self.isHidePassword=true;
    self.updateVpn_title = $translate.instant("aws.vpn.newVpn");
    self.noLocalSubnet=$translate.instant("aws.vpn.noLocalSubnet");
    self.permitInteger=$translate.instant("aws.vpn.permitInteger");
    self.targetNetOverlap=false;
    self.inStep= 1;
    self.inStepOneBar = 0;
    self.inStepTwoBar = 1;

    //IKE相关参数
    self.IKEData={
        authenAlgorithm:{
            options:["sha1"]
        },
        encryptionAlgorithm:{
            options:["aes-128","3des","aes-256","aes-192"]
        },
        IKEversion:{
            options:["v1","v2"]
        },
        oneNegotiationModel:{
            options:["main"]
        },
        perfectSecrecy:{
            options:["group5","group2","group14"]
        },
        periods:{
            options:[{name:"秒",value:"seconds"}]
        }
    };
    //Ipse相关参数
    self.IpseData={
        transProtocol:{
            options:["esp","ah"]
        },
        authenAlgorithm:{
            options:["sha1"]
        },
        encryptionAlgorithm:{
            options:["aes-128","3des","aes-256","aes-192"]
        },
        EncapsulationMode:{
            options:["tunnel"]
        },
        perfectSecrecy:{
            options:["group5","group2","group14"]
        },
        periods:{
            options:[{name:"秒",value:"seconds"}]
        }
    };
    //Ipse相关参数
    self.siteData={
        localRouter:{
            options:[],
        },
        //本地子网可供选择下拉列表
        localSubnetsList:[],
        localSubnetsModel:[],
        localSubnetsShow:[{}],
        localSubnets:{
            options_0:[]
        },
        connectionMode:{
            options:[{name:"双向",value:'bi-directional'},{name:"仅应答",value:'response-only'}]
        },
        DPDaction:{
            options:[{name:"保持",value:'hold'},{name:"清除",value:'clear'},{name:"禁用",value:'disabled'},{name:"重启",value:'restart'},{name:"被目标端重启",value:'restart-by-peer'}]
        }
    };

    //form表单绑定的数组
    self.stepOneData={
        name:"",
        description:"",
        selectedAuthenAlg :self.IKEData.authenAlgorithm.options[0],
        selectedEncryptionAlg :self.IKEData.encryptionAlgorithm.options[0],
        selectedIKEversion :self.IKEData.IKEversion.options[0],
        selectedNegotiationModel :self.IKEData.oneNegotiationModel.options[0],
        selectedIKEPerfect :self.IKEData.perfectSecrecy.options[0],
        selectedIKEperiodUnit :self.IKEData.periods.options[0],
        selectedIKEperiod:3600, 
        selectedTransPro :self.IpseData.transProtocol.options[0],
        selectedIpseAuthenAlg :self.IpseData.authenAlgorithm.options[0],
        selectedIpseEncryptionAlg :self.IpseData.encryptionAlgorithm.options[0],
        selectedEncapsulationMode :self.IpseData.EncapsulationMode.options[0],
        selectedPerfect :self.IpseData.perfectSecrecy.options[0],
        selectedIPSecperiodUnit :self.IKEData.periods.options[0],
        selectedIPSecperiod:3600,
    };

    self.stepTwoData={
        targetGateway:{
            gateway_1:"",
            gateway_2:"",
            gateway_3:"",
            gateway_4:""
        },
        targetRoute:"",//和目标网关地址保持一致
        targetNetworks:[
            {
                ip_1:"",
                ip_2:"",
                ip_3:"",
                ip_4:"",
                ip_5:""
            }
        ],
        maxTransUnit:1500,
        heartInterval:30,
        overtimeInterval:120,
        //selectedRouter:self.siteData.localRouter.options[0],
        selectedConnectMode:self.siteData.connectionMode.options[0],
        selectedDPDaction:self.siteData.DPDaction.options[0]
    };
    self.hidePassword=function(){
        self.isHidePassword=!self.isHidePassword;
    };

    //更换本地路由器
    self.changeLocalRouter=function(selectedRouter){
        //需要先重置表单
        self.siteFormValidate=false;
        //初始化第一个本地子网数据(需要先清空上一个路由的子网数据)
        self.siteData.localSubnetsShow=[{}];
        self.siteData.localSubnetsModel=[];
        self.siteData.localSubnets={
          options_0:[]
        };
        self.siteData.localSubnetsList=selectedRouter.tbPorts;        
        self.siteData.localSubnets.options_0=angular.copy(self.siteData.localSubnetsList);
        self.siteData.localSubnetsModel[0]=self.siteData.localSubnets.options_0[0];
        self.siteData.localSubnets['options_'+self.siteData.localSubnetsShow.length]=operateSelectData(self.siteData.localSubnetsModel,self.siteData.localSubnetsList);
    };

    self.addLocalSubnetFunc=function(localSubnetsShow){
         if(self.siteData.localSubnets['options_'+(localSubnetsShow.length)]!=0){
              localSubnetsShow.push({});
              self.siteData.localSubnets['options_'+(localSubnetsShow.length-1)]=operateSelectData(self.siteData.localSubnetsModel,self.siteData.localSubnetsList);
              self.siteData.localSubnetsModel[localSubnetsShow.length-1]=self.siteData.localSubnets['options_'+(localSubnetsShow.length-1)][0];
              self.siteData.localSubnets['options_'+(localSubnetsShow.length)]=operateSelectData(self.siteData.localSubnetsModel,self.siteData.localSubnetsList);
         }
    };
    self.delLocalSubnetFunc=function(localSubnetsShow,index){
         localSubnetsShow.splice(index,1);
         self.siteData.localSubnetsModel.splice(index,1);
    };
    self.localSubClick=function(index){
         var result=[];
         for(var i = 0; i < self.siteData.localSubnetsList.length; i++){
            var obj = self.siteData.localSubnetsList[i];
            var n1 = obj.cidr;
            var isExist = false;
            for(var j = 0; j < self.siteData.localSubnetsModel.length; j++){
                var aj = self.siteData.localSubnetsModel[j];
                if(aj){
                    var n2 = aj.cidr;
                    if(n1 == n2&&index!=j){
                        isExist = true;
                        break;
                    }
                }
            }
            if(!isExist){
                result.push(obj);
            }
         }
         self.siteData.localSubnets['options_'+index]=result;
    };

    self.addTargetNetFunc=function(targetNetworks){
         //初始化网络地址重叠提示语
         self.targetNetOverlap=false;
         targetNetworks.push({
              ip_1:"",
              ip_2:"",
              ip_3:"",
              ip_4:"",
              ip_5:""
         });
    };

    self.delTargetNetFunc=function(targetNetworks,index){
         //初始化网络地址重叠提示语
         self.targetNetOverlap=false;
         targetNetworks.splice(index,1);
    };

    self.stepToTwo=function(updateVpnForm){
    	self.vpnFormValidate=false;
    	if(updateVpnForm.$valid){
           self.inStep=2;
           //第二步才获取和路由器相关的数据
           //获取本地路由器列表
           if(self.siteData.localRouter.options.length==0){
               vpnSrv.getRoutersList().then(function(res){
                    if(res&&res.data&&angular.isArray(res.data)){
                       res.data.forEach(function(router){
                           router.tbPorts.forEach(function(port){
                               port.cidr=port.subnetIP[0];
                           });
                       });
                       self.siteData.localRouter.options=res.data;
                       self.stepTwoData.selectedRouter=res.data[0];
                       if(self.stepTwoData.selectedRouter&&self.stepTwoData.selectedRouter.id){
                           //获取router下面得子网
                           self.siteData.localSubnetsList=self.stepTwoData.selectedRouter.tbPorts;
                           self.siteData.localSubnets.options_0=angular.copy(self.siteData.localSubnetsList);
                           self.siteData.localSubnetsModel[0]=self.siteData.localSubnets.options_0[0];
                           self.siteData.localSubnets['options_'+self.siteData.localSubnetsShow.length]=operateSelectData(self.siteData.localSubnetsModel,self.siteData.localSubnetsList);
                       }
                    }
               });
           }
    	}else{
           self.vpnFormValidate=true;
    	}
    };
    self.stepToOne=function(){
       self.inStep= 1;
    };
    self.interactedVpn = function(field) {
  	    if (field) {
  	        return self.vpnFormValidate || field.$dirty;
  	    }
  	};
  	self.interactedSite = function(field) {
  	    if (field) {
  	        return self.siteFormValidate || field.$dirty;
  	    }
  	};

    //改变周期单位
    self.changePeriod=function(period,type){
        if(period.value=='seconds'){
            if(type=='IKE'){
               self.stepOneData.selectedIKEperiod=3600;
            }else if(type=='IPSec'){
               self.stepOneData.selectedIPSecperiod=3600;
            }
            
        }else if(period.value=='KB'){
            if(type=='IKE'){
               self.stepOneData.selectedIKEperiod=5000;
            }else if(type=='IPSec'){
               self.stepOneData.selectedIPSecperiod=5000;
            }
        }
    };

    //目标路由标识符和目标网关地址保持一致
    self.assembleTargetGateway=function(targetGateway){
        for(var key in targetGateway){
            targetGateway[key]=targetGateway[key]==undefined?"":targetGateway[key];
        }
        self.stepTwoData.targetRoute=targetGateway.gateway_1+"."+targetGateway.gateway_2+"."+targetGateway.gateway_3+"."+targetGateway.gateway_4;
    };
    
    //点击目标网络重置网络重叠状态
    self.resetSubIpOverlap=function(){
        self.targetNetOverlap=false;
    };
    self.updateVpnConfirm=function(modifySiteForm){
        if(modifySiteForm.$valid){
            //判断目标网络是否重叠
            var targetNetworksArray=[];
            self.stepTwoData.targetNetworks.forEach(function(item){
                let cidr=item.ip_1+"."+item.ip_2+"."+item.ip_3+"."+item.ip_4+"/"+item.ip_5;
                targetNetworksArray.push(cidr);
            });
            if(targetNetworksArray.length>1){
                self.targetNetOverlap=isCidrOverlap(targetNetworksArray);
            }
            if(!self.targetNetOverlap){//目标网络不重叠
                 //拼接本地子网
                 var localSubArr=[];
                 var targetNetArr=[];
                 self.siteData.localSubnetsModel.forEach(function(item){
                     localSubArr.push(item.subnetId[0]);
                 });
                 self.stepTwoData.targetNetworks.forEach(function(item){
                     let cidr=item.ip_1+"."+item.ip_2+"."+item.ip_3+"."+item.ip_4+"/"+item.ip_5;
                     targetNetArr.push(cidr);
                 });
                 var targetGateway=self.stepTwoData.targetGateway.gateway_1+"."+self.stepTwoData.targetGateway.gateway_2+"."+self.stepTwoData.targetGateway.gateway_3+"."+self.stepTwoData.targetGateway.gateway_4;
                 var params={//Math.random()生成0~1之间的随机数
                    "ikepolicy":{
                        "name":self.stepOneData.name,
                        "description":self.stepOneData.description,
                        "encryption_algorithm":self.stepOneData.selectedEncryptionAlg,
                        "ike_version":self.stepOneData.selectedIKEversion,
                        "lifetime_value":self.stepOneData.selectedIKEperiod,
                        "pfs":self.stepOneData.selectedIKEPerfect,
                        "units":self.stepOneData.selectedIKEperiodUnit.value,
                        "phase1_negotiation_mode":self.stepOneData.selectedNegotiationModel,
                        "auth_algorithm":self.stepOneData.selectedAuthenAlg
                    },
                    "ipsecpolicy":{
                        "name":self.stepOneData.name,
                        "description":self.stepOneData.description,
                        "encryption_algorithm":self.stepOneData.selectedIpseEncryptionAlg,
                        "encapsulation_mode":self.stepOneData.selectedEncapsulationMode,
                        "transform_protocol":self.stepOneData.selectedTransPro,
                        "lifetime_value":self.stepOneData.selectedIPSecperiod,
                        "pfs":self.stepOneData.selectedPerfect,
                        "units":self.stepOneData.selectedIPSecperiodUnit.value,
                        "auth_algorithm":self.stepOneData.selectedIpseAuthenAlg
                    },
                    "vpnservice":{
                        "name":self.stepOneData.name,
                        "description":self.stepOneData.description,
                        "routerId":self.stepTwoData.selectedRouter.id,
                        "subnetId":""//固定传空字符串
                    },
                    "endpointGroupSubnet":{
                        "name":self.stepOneData.name+"_subnet",
                        "description":self.stepOneData.description,
                        "type":"subnet",//固定
                        "endpoints":localSubArr
                    },
                    "endpointGroupCidr":{
                        "name":self.stepOneData.name+"_cidr",
                        "description":self.stepOneData.description,
                        "type":"cidr",//固定
                        "endpoints":targetNetArr
                    },
                    "ipsecSiteConnection":{
                        "name":self.stepOneData.name,//页面的名称或者描述
                        "description":self.stepOneData.description,//页面的名称或者描述
                        "peer_address":targetGateway,//目标网关地址
                        "peer_id":self.stepTwoData.targetRoute,//目标路由标识符
                        "psk":self.stepTwoData.sharedPassword,//预共享密码
                        "peer_cidrs":targetNetArr,//目标网络
                        "initiator":self.stepTwoData.selectedConnectMode.value,
                        "mtu":self.stepTwoData.maxTransUnit,
                        "action":self.stepTwoData.selectedDPDaction.value,
                        "interval":self.stepTwoData.heartInterval,
                        "timeout":self.stepTwoData.overtimeInterval
                    }
                 };
                 $uibModalInstance.close();
                 if(singleway){
                    vpnSrv.addSingleVpn(params,self.domainproject).then(function(){
                    });
                 }else{
                    vpnSrv.addVpn(params).then(function(){
                      initVpnTableData();
                    }); 
                 }
            }
        }else{
           self.siteFormValidate=true; 
        }
    };
}]);
vpnModule.controller('addLocalSubnetCtrl',['$scope','vpnSrv','$translate','operateSelectData','getDetailFunc','initVpnTableData','$uibModalInstance','context',function($scope,vpnSrv,$translate,operateSelectData,getDetailFunc,initVpnTableData,$uibModalInstance,context){
    var self=$scope;
    self.noLocalSubnet=$translate.instant("aws.vpn.noLocalSubnet");
    //获取vpn详情
    vpnSrv.getVpnDetail(context.checkedItems[0].id).then(function(res){
      if(res&&res.data){
         self.baseDetailData=res.data;
         self.routerId=self.baseDetailData.vpnservice.router_id;
         self.endpointSubGroupId=self.baseDetailData.endpointGroupSubnet.id;
         self.IPSecSiteId=self.baseDetailData.ipsecSiteConnection.id;
         //获取可添加的本地子网
         vpnSrv.availableLocalSubnet(self.routerId,self.endpointSubGroupId).then(function(res){
               if(res&&res.data&&angular.isArray(res.data)){
                   res.data.forEach(function(subnet){
                      subnet.cidr=subnet.subnetIP[0];
                   });
                   self.localSubnetsList=res.data;
                   self.localSubnets.options_0=angular.copy(self.localSubnetsList);
                   self.localSubnetsModel[0]=self.localSubnets.options_0[0];
                   self.localSubnets['options_'+self.localSubnetsShow.length]=operateSelectData(self.localSubnetsModel,self.localSubnetsList);
               }
         });
      }
    });

    self.interacted = function(field) {
        if (field) {
            return self.submitted || field.$dirty;
        }
    };
    //绑定的数组
    self.localSubnetsModel=[];
    //repeat数组
    self.localSubnetsShow=[{show:(Math.random()+"").split(".")[1]}];
    //下拉框数
    self.localSubnets={
       options_0:[],
       options_1:[]
    };

    self.addLocalSubnetFunc=function(localSubnetsShow){
         if(self.localSubnets['options_'+(localSubnetsShow.length)]!=0){
              self.localSubnets['options_'+localSubnetsShow.length]=operateSelectData(self.localSubnetsModel,self.localSubnetsList);
              self.localSubnetsModel[localSubnetsShow.length]=self.localSubnets['options_'+localSubnetsShow.length][0];
              localSubnetsShow.push({show:"show"+Math.random()});
              self.localSubnets['options_'+(localSubnetsShow.length)]=operateSelectData(self.localSubnetsModel,self.localSubnetsList);
         }
    };
    self.delLocalSubnetFunc=function(localSubnetsShow,index){
         localSubnetsShow.splice(index,1);
         self.localSubnetsModel.splice(index,1);
    };
    self.localSubClick=function(index,selected){
         var result=[];
         for(var i = 0; i < self.localSubnetsList.length; i++){
            var obj = self.localSubnetsList[i];
            var n1 = obj.cidr;
            var isExist = false;
            for(var j = 0; j < self.localSubnetsModel.length; j++){
                var aj = self.localSubnetsModel[j];
                if(aj){
                    var n2 = aj.cidr;
                    if(n1 == n2&&index!=j){
                        isExist = true;
                        break;
                    }
                }
            }
            if(!isExist){
                result.push(obj);
            }
         }
         self.localSubnets['options_'+index]=result;
         result.forEach(function(item){
            if(item.subnetId==selected.subnetId){
               self.localSubnetsModel[index]=item;
               selected=item;
            }
         });
    };
    self.localSubnetConfirm=function(addLocalSubnetForm){
         self.submitted=false;
         if(addLocalSubnetForm.$valid){
            var addLocalSubArr=[];
            var existSubArr=[];
            self.localSubnetsModel.forEach(function(item){
                addLocalSubArr.push(item.subnetId[0]);
            });
            self.baseDetailData.endpointGroupSubnet.subnets.forEach(function(item){
                existSubArr.push(item.subnetId);
            });

            var params={
                "name": self.baseDetailData.endpointGroupSubnet.name,
                "description": self.baseDetailData.endpointGroupSubnet.description,
                "type": 'subnet',
                "id": self.endpointSubGroupId,
                "endpoints": addLocalSubArr.concat(existSubArr)//拼接添加的和原有的
            };
            $uibModalInstance.close();
            vpnSrv.updateEndpointGroup(self.IPSecSiteId,params).then(function(){
                initVpnTableData();
            });
         }else{
            self.submitted=true;
         }
    };
}]);
vpnModule.controller('delLocalSubnetCtrl',['$scope','vpnSrv','$translate','$uibModalInstance','context','GLOBAL_CONFIG','TableCom','$timeout',function($scope,vpnSrv,$translate,$uibModalInstance,context,GLOBAL_CONFIG,TableCom,$timeout){
    var self=$scope;
    self.search={};
    self.refreshLocalSubnet=function(){
       self.search.localSubnetTerm="";
       initlocalSubnet();
    };
    self.localSubnetSearch=function(localSubnetTerm){
         self.localSubTable.filter({
           searchTerm:localSubnetTerm
         });
     };
    function initlocalSubnet(){
       vpnSrv.getVpnDetail(context.checkedItems[0].id).then(function(res){
          if(res&&res.data){
             self.baseDetailData=res.data;
             //本地子网数据处理
             var subnet_data=self.baseDetailData.endpointGroupSubnet.subnets;     
             subnet_data.map(function(item){
                 item.searchTerm=item.cidr;
             });
             self.subnet_checkbox = {
                checked: false,
                items: {}
             };
             TableCom.init(self,'localSubTable',subnet_data,'subnetId',5,'subnet_checkbox');
            
             self.$watch(function() {
                  return self.subnet_checkbox.items;
             }, function() {
                  self.checkedSubnetItems = [];
                  var checked = 0,
                      unchecked = 0,
                      total = self.localSubTable.data.length;

                  angular.forEach(self.localSubTable.data, function(item) {
                      checked += (self.subnet_checkbox.items[item.subnetId]) || 0;
                      unchecked += (!self.subnet_checkbox.items[item.subnetId]) || 0;
                      if (self.subnet_checkbox.items[item.subnetId]) {
                          self.checkedSubnetItems.push(item);
                      }
                  });

                  if ((unchecked == 0) || (checked == 0)) {
                      if (total > 0) {
                          self.subnet_checkbox.checked = (checked == total);
                      }
                  }
                  self.canDelSubnet=false;
                  if (checked>0&&(total-checked)>0) {
                     self.canDelSubnet=true;       
                  }
             }, true);
          }
       });
    }
    initlocalSubnet();
    self.delLocalSubnetCfm=function(checkedSubnetItems){
        if(checkedSubnetItems.length==0){
           self.noChecked=true;
           $timeout(function(){
             self.noChecked=false;
           },2000);
        }
        if((self.localSubTable.data.length-checkedSubnetItems.length)<1){
           self.noLeft=true;
           $timeout(function(){
             self.noLeft=false;
           },1500);
        }
        if(self.canDelSubnet){
            var delData={
                checkedSubnetItems:self.checkedSubnetItems,
                baseDetailData:self.baseDetailData
            };
            var content = {
                target: "deleteSubnet",
                msg: "<span>" + $translate.instant("aws.vpn.delSubnet") + "</span>",
                data:delData
            };
            context.$emit("delete", content);
        }
    };
}]);
vpnModule.controller('delTargetNetCtrl',['$scope','vpnSrv','$translate','$uibModalInstance','context','GLOBAL_CONFIG','TableCom','$timeout',function($scope,vpnSrv,$translate,$uibModalInstance,context,GLOBAL_CONFIG,TableCom,$timeout){
     var self=$scope;
     self.search={};
     self.refreshTargetNet=function(){
         self.search.targetNetTerm="";
         initTargetNet();
     };
     self.targetNetSearch=function(targetNetTerm){
         self.targetNetTable.filter({
           searchTerm:targetNetTerm
         });
     };
     function initTargetNet(){
         vpnSrv.getVpnDetail(context.checkedItems[0].id).then(function(res){
            if(res&&res.data){
               self.baseDetailData=res.data;
               //目标网络数据处理
               var targetNet_data=[];
               self.baseDetailData.endpointGroupCidr.endpoins.forEach(function(item){
                   targetNet_data.push({id:item,value:item});
               });
               targetNet_data.map(function(item){
                   item.searchTerm=item.value;
               });
               self.targetNet_checkbox = {
                  checked: false,
                  items: {}
               };
               TableCom.init(self,'targetNetTable',targetNet_data,'id',5,'targetNet_checkbox');
               self.$watch(function() {
                    return self.targetNet_checkbox.items;
               }, function() {
                    self.checkedTargetNetItems = [];
                    var checked = 0,
                        unchecked = 0,
                        total = self.targetNetTable.data.length;

                    angular.forEach(self.targetNetTable.data, function(item) {
                        checked += (self.targetNet_checkbox.items[item.id]) || 0;
                        unchecked += (!self.targetNet_checkbox.items[item.id]) || 0;
                        if (self.targetNet_checkbox.items[item.id]) {
                            self.checkedTargetNetItems.push(item);
                        }
                    });

                    if ((unchecked == 0) || (checked == 0)) {
                        if (total > 0) {
                            self.targetNet_checkbox.checked = (checked == total);
                        }
                    }
                    self.canDelTargetNet=false;
                    if (checked>0&&(total-checked)>0) {
                       self.canDelTargetNet=true;     
                    }

               }, true);
            }
         });
     }
     initTargetNet();
     self.delTargetNetCfm=function(checkedTargetNetItems){
        if(checkedTargetNetItems.length==0){
           self.noChecked=true;
           $timeout(function(){
             self.noChecked=false;
           },2000);
        }
        if((self.targetNetTable.data.length-checkedTargetNetItems.length)<1){
           self.noLeft=true;
           $timeout(function(){
             self.noLeft=false;
           },1500);
        }
        if(self.canDelTargetNet){
            var delData={
                checkedTargetNetItems:self.checkedTargetNetItems,
                baseDetailData:self.baseDetailData
            };
            var content = {
                target: "delTargetNet",
                msg: "<span>" + $translate.instant("aws.vpn.delTargetNet") + "</span>",
                data:delData
            };
            context.$emit("delete", content);
        }
     };
}]);
vpnModule.controller('addTargetNetCtrl',['$scope','vpnSrv','$translate','context','getDetailFunc','initVpnTableData','$uibModalInstance','isCidrOverlap',function($scope,vpnSrv,$translate,context,getDetailFunc,initVpnTableData,$uibModalInstance,isCidrOverlap){
    var self=$scope;
    self.submitted=false;
    self.targetNetOverlap=false;
    //获取vpn详情
    vpnSrv.getVpnDetail(context.checkedItems[0].id).then(function(res){
      if(res&&res.data){
         self.baseDetailData=res.data;
         self.endpointSubGroupId=self.baseDetailData.endpointGroupSubnet.id;
         self.IPSecSiteId=self.baseDetailData.ipsecSiteConnection.id;
      }
    });

    self.interacted = function(field) {
        if (field) {
            return self.submitted || field.$dirty;
        }
    };

    self.resetIsOverLap=function(){
       self.targetNetOverlap=false;
    };

    self.targetNetsData=[
        {
            "ip_1":"",
            "ip_2":"",
            "ip_3":"",
            "ip_4":"",
            "ip_5":""
        }
    ];
    self.addTargetNetFunc=function(targetNetsData){
        //初始化网络地址重叠提示语baseDetailData
        self.targetNetOverlap=false;
        targetNetsData.push({});
    };
    self.delTargetNetFunc=function(targetNetsData,index){
        //初始化网络地址重叠提示语
        self.targetNetOverlap=false;
        targetNetsData.splice(index,1);
    };
    self.addTargetNetConfirm=function(addTargetNetForm){
        if(addTargetNetForm.$valid){
           //校验目标网络不能重复
           var targetNetsArr=[];
           self.targetNetsData.forEach(function(item){
               let cidr=item.ip_1+"."+item.ip_2+"."+item.ip_3+"."+item.ip_4+"/"+item.ip_5;
               targetNetsArr.push(cidr);
           });
           self.allTargetNets=targetNetsArr.concat(self.baseDetailData.endpointGroupCidr.endpoins);
           //目标网络个数大于1才校验是否重叠
           if(self.allTargetNets.length>1){
              self.targetNetOverlap=isCidrOverlap(self.allTargetNets);
           }
           if(!self.targetNetOverlap){
              var params={
                "name": self.baseDetailData.endpointGroupCidr.name,
                "description": self.baseDetailData.endpointGroupCidr.description,
                "type": 'cidr',
                "id": self.endpointCidrGroupId,
                "endpoints": self.allTargetNets
              };
              $uibModalInstance.close();
              vpnSrv.updateEndpointGroup(self.IPSecSiteId,params).then(function(){ 
                 initVpnTableData();
              });
           }
        }else{
            self.submitted=true;
        }
    };
}]);
vpnModule.controller('editVpnCtrl',['$scope','vpnSrv','$translate','editData','initVpnTableData','$uibModalInstance',function($scope,vpnSrv,$translate,editData,initVpnTableData,$uibModalInstance){
    var self=$scope;
    self.submitted=false;
    self.interacted = function(field) {
        if (field) {
            return self.submitted || field.$dirty;
        }
    };
    self.hidePassword=function(){
        self.isHidePassword=!self.isHidePassword;
    };
    self.available={
        connectionMode:{
            options:[{name:"双向",value:'bi-directional'},{name:"仅应答",value:'response-only'}]
        },
        DPDaction:{
            options:[{name:"保持",value:'hold'},{name:"清除",value:'clear'},{name:"禁用",value:'disabled'},{name:"重启",value:'restart'},{name:"被目标端重启",value:'restart-by-peer'}]
        }
    };
    //获取当前vpn的详情
    vpnSrv.getVpnDetail(editData.id).then(function(res){
        if(res&&res.data){
           self.vpnDetailData=res.data;
           var targetGatewayOfDetail=self.vpnDetailData.ipsecSiteConnection.peer_address.split(".");
           self.editData={
                name:self.vpnDetailData.ipsecSiteConnection.name,
                description:self.vpnDetailData.ipsecSiteConnection.description,
                targetRoute:self.vpnDetailData.ipsecSiteConnection.peer_id,
                password:self.vpnDetailData.ipsecSiteConnection.psk,
                targetGateway:{
                   gateway_1:targetGatewayOfDetail[0],
                   gateway_2:targetGatewayOfDetail[1],
                   gateway_3:targetGatewayOfDetail[2],
                   gateway_4:targetGatewayOfDetail[3]
                },
                maxTransUnit:self.vpnDetailData.ipsecSiteConnection.mtu,
                heartInterval:self.vpnDetailData.ipsecSiteConnection.interval,
                overtimeInterval:self.vpnDetailData.ipsecSiteConnection.timeout,
                selectedConnectMode:"",
                selectedDPDaction:"",
           };
           self.available.connectionMode.options.forEach(function(item){
                if(item.value==self.vpnDetailData.ipsecSiteConnection.initiator){
                   self.editData.selectedConnectMode=item;
                }
           });
           self.available.DPDaction.options.forEach(function(item){
                if(item.value==self.vpnDetailData.ipsecSiteConnection.action){
                   self.editData.selectedDPDaction=item;
                }
            });
        }
    });
    
    //目标路由标识符和目标网关地址保持一致
    self.assembleTargetGateway=function(targetGateway){
        for(var key in targetGateway){
            targetGateway[key]=targetGateway[key]==undefined?"":targetGateway[key];
        }
        self.editData.targetRoute=targetGateway.gateway_1+"."+targetGateway.gateway_2+"."+targetGateway.gateway_3+"."+targetGateway.gateway_4;
    };

    self.editVpnConfirm=function(editVpnForm){
        if(editVpnForm.$valid){
           var params={
                "id": self.vpnDetailData.ipsecSiteConnection.id, 
                "name": self.editData.name, 
                "description": self.editData.description, 
                "action": self.editData.selectedDPDaction.value, 
                "interval": self.editData.heartInterval, 
                "timeout": self.editData.overtimeInterval, 
                "initiator": self.editData.selectedConnectMode.value, 
                "mtu": self.editData.maxTransUnit, 
                "peer_address": self.editData.targetGateway.gateway_1+"."+self.editData.targetGateway.gateway_2+"."+self.editData.targetGateway.gateway_3+"."+self.editData.targetGateway.gateway_4, 
                "peer_cidrs": [],//此处是否传参需要确认
                "peer_id": self.editData.targetRoute, 
                "psk": self.editData.password,
                "admin_state_up": self.vpnDetailData.ipsecSiteConnection.admin_state_up, 
                "local_ep_group_id": self.vpnDetailData.ipsecSiteConnection.local_ep_group_id, 
                "peer_ep_group_id": self.vpnDetailData.ipsecSiteConnection.peer_ep_group_id
           };
           $uibModalInstance.close();
           vpnSrv.updateVpn(params).then(function(){
                initVpnTableData();
           });
        }else{
           self.submitted=true;
        }
    };
}]);
vpnModule.directive('minmtu',function(){
    return{
       restrict:"A",
       require:"ngModel",
       scope:{
            min:"=",
       },
       link:function(scope,elem,attrs,ngModel){
            function vaild(viewValue){
                var reg = new RegExp("^(0|[1-9][0-9]*)$");
                if(viewValue){
                    var val = Number(viewValue);
                    if(val < Number(scope.min) || !reg.test(viewValue)){
                        ngModel.$setValidity("minmtu",false);
                    }else{
                        ngModel.$setValidity("minmtu",true);
                    }
                }else{
                    ngModel.$setValidity("minmtu",true);
                }
                return viewValue;
            }   
            ngModel.$parsers.push(vaild);
            scope.$watch(function(){
                return ngModel.$viewValue;
            },function(value){
                vaild(ngModel.$viewValue);
            });
        }
    };
});
vpnModule.directive('heartInterval',function(){
    return {
        restrict:"A",
        require:"ngModel",
        scope:{
            min:"=",
            max:"=",
            heartmin:"=",
        },
        link:function(scope,elem,attrs,ngModel){
            var reg = new RegExp("^(0|[1-9][0-9]*)$");
            function vaild(viewValue){
                if(viewValue){
                    var val = Number(viewValue);
                    if( (val < Number(scope.min) || val > Number(scope.max)) || !reg.test(viewValue) ){
                        ngModel.$setValidity("timerange",false);
                    }else{
                        ngModel.$setValidity("timerange",true);
                    }
                    
                }else{
                    ngModel.$setValidity("timerange",true);
                }
                return viewValue;
            }
            ngModel.$parsers.push(function(viewValue){
                if(Number(angular.element("#"+attrs.interval).val())){
                    var val = Number(viewValue);
                    if(val <= Number(scope.heartmin)){
                        ngModel.$setValidity("heartinterval",false);
                    }else{
                        ngModel.$setValidity("heartinterval",true);
                    }
                }
                if(viewValue){
                    var val = Number(viewValue);
                    if( (val < Number(scope.min) || val > Number(scope.max)) || !reg.test(viewValue) ){
                        ngModel.$setValidity("timerange",false);
                    }else{
                        ngModel.$setValidity("timerange",true);
                    }
                    
                }else{
                    ngModel.$setValidity("timerange",true);
                }
                return viewValue;
            });
            scope.$watch(function(){
                return angular.element("#"+attrs.interval).val();
            },function(startValue){
                if(Number(startValue)){
                    var val = Number(ngModel.$viewValue);
                    if(val <=Number(scope.heartmin)){
                        ngModel.$setValidity("heartinterval",false);
                    }else{
                        ngModel.$setValidity("heartinterval",true);
                    }
                }else{
                    ngModel.$setValidity("heartinterval",true);
                }

            });
            scope.$watch(function(){
                return scope.max+scope.min+ngModel.$viewValue;
            },function(value){
                vaild(ngModel.$viewValue);
            });
        }
    };
});
