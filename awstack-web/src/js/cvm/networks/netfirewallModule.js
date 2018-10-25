import "./netfirewallSrv";
import "./routersSrv";

var netfirewallModule = angular.module("netfirewallModule", ["netfirewallSrvModule", "routersSrvModule"]);

netfirewallModule.controller("netfirewallCtrl", ["$scope", "$rootScope", "TableCom" , "netfirewallSrv", "modalCom", "$translate", "$interval", "$location","GLOBAL_CONFIG","$window","$timeout","NgTableParams","checkedSrv","$routeParams","commonFuncSrv",
    function($scope, $rootScope , TableCom, netfirewallSrv, modalCom ,$translate, $interval, $location ,GLOBAL_CONFIG,$window,$timeout,NgTableParams,checkedSrv,$routeParams,commonFuncSrv) {
        var self = $scope;
        self.globalSearchTerm={};
        //防火墙选择
        self.checkFirst = {
            checked: false,
            items: {}
        };

        //规则设置项的初始化
        self.ruleTitleName="firewallRule";
        if(sessionStorage["firewallRule"]){
           self.ruleTitleData=JSON.parse(sessionStorage["firewallRule"]);
        }else{
           self.ruleTitleData=[
              {name:'networks.protocol',value:true,disable:true,search:'_protocol'},
              {name:'networks.action',value:true,disable:true,search:'_action'},
              {name:'firewall.setSourceIP',value:true,disable:false,search:'_source_ip_address'},
              {name:'firewall.setDestinationIP',value:true,disable:false,search:'_destination_ip_address'},
              {name:'networks.status',value:true,disable:false,search:'status'},
              {name:'firewall.description',value:true,disable:false,search:'description'},
           ];
        }

        //状态选择下拉
        self.statusList={
             options:[
                  {name:$translate.instant("aws.networks.active"),value:'active'},
                 {name:$translate.instant("aws.networks.inactive"),value:'inactive'},
                 {name:$translate.instant("aws.networks.down"),value:'down'},
                 {name:$translate.instant("aws.networks.pending_create"),value:'pending_create'},
                 {name:$translate.instant("aws.networks.pending_update"),value:'pending_update'},
                 {name:$translate.instant("aws.networks.pending_delete"),value:'pending_delete'},
                 {name:$translate.instant("aws.networks.error"),value:'error'},
             ],
             selectedStatus:""
        };

        self.changeStatus=function(status){
             //用最初的数据过滤
             var tableData=angular.copy(self.firewallTableData);
             tableData=tableData.filter(function(item){
                 return item.status.toLowerCase()==status.value;
             });
             successFunc(tableData);
        };

        self.ruleSearchTerm=function(obj){
            var tableData = obj.tableData;
            var titleData = obj.titleData;
            tableData.map(function(item){
                item.searchTerm="";
                titleData.forEach(function(showTitle){
                    if(showTitle.value){
                        if(showTitle.search=='_source_ip_address'){
                           item.searchTerm+=[item._source_ip_address,item._source_port].join("\b");
                        }else if(showTitle.search=='_destination_ip_address'){
                           item.searchTerm+=[item._destination_ip_address,item._destination_port].join("\b");  
                        }else{
                           item.searchTerm+=item[showTitle.search]+"\b";
                        }
                     }
                });
            });           
        };
    
        function initNetFirewallTable() {
            self.globalSearchTerm.fireWallTerm="";
            self.statusList.selectedStatus="";
            TableCom.init(self,'netFirewallTable',[],'id',GLOBAL_CONFIG.PAGESIZE,'checkFirst');
            self.netFirewallLoadData = false;
            netfirewallSrv.getFirewallList().then(function(result) {
                result ? self.netFirewallLoadData = true : "";
                if (result && result.data&& angular.isArray(result.data)) {
                    self.firewallTableData=angular.copy(result.data);
                    successFunc(result.data);
                }
            });
        }
        function successFunc(data){
            self.netFirewallData = _.map(data, function(item) {
                if (item.status) {
                   item.status = item.status.toLowerCase();
                }
                item._admin_state_up = item.admin_state_up ? $translate.instant("aws.networks.up") : $translate.instant("aws.networks.todown");
                item._status = $translate.instant("aws.networks." + item.status.toLowerCase());
                let routerArr=[];
                if(item.routers){
                   item.routers.forEach(function(router){
                        routerArr.push(router.name);
                    }); 
                }
                item.searchTerm=[item.name,routerArr.join("\b"),item._status,item.description].join("\b");
                return item;
            });
            tableResize(self.netFirewallData);
            TableCom.init(self,'netFirewallTable',self.netFirewallData,'id',GLOBAL_CONFIG.PAGESIZE,'checkFirst');  
        }
        initNetFirewallTable();
        self.selectedStatus=self.statusList[6];
        self.refreshFireWallList=function(){
           self.globalSearchTerm.fireWallTerm="";
           self.statusList.selectedStatus="";
           initNetFirewallTable();
        };

        self.refreshFireRuleList=function(){
           self.globalSearchTerm.ruleTerm="";
           self.getFirewallRulesList();
        };

        self.applyGlobalSearch=function(table,term){
           self.netFirewallTable.filter({
              searchTerm: self.globalSearchTerm.fireWallTerm
           });
        };

        self.ruleApplyGlobalSearch=function(table,term){
           self.firewallRuleTable.filter({
              searchTerm: self.globalSearchTerm.ruleTerm
           });
        };

        //删除数组中的某个元素
        Array.prototype.removeFirewallId = function(val) {
            var index = this.indexOf(val);
            if (index > -1) {
                this.splice(index, 1);
            }
        };
        self.resizeNum={};
        self.timerStart=false;
        function tableResize(data){
            //需要轮询的数组列表               
            self.resizing = [];
            data.map(x => {
                if(x.status == "created"||x.status == "pending_create"||x.status == "pending_update"||x.status == "pending_delete"){
                    self.resizing.push(x.id)
                }
            });
            if(self.resizing.length>0){
                //时间重置
                if(JSON.stringify(self.resizeNum) == "{}"){
                    self.resizing.map(id => {self.resizeNum[id]=1});
                }
                if(!self.timerStart){
                    var options={
                        'ids':self.resizing
                    };
                    /*镜像状态更新轮询*/
                    $window.IntervalFirewallResize(options);
                }
                
            }
        }
        $window.IntervalFirewallResize = function(options){
            var timer = $timeout(function(){
                self.timerStart=true;
                netfirewallSrv.getStatus(options).then(function(result) {
                    if(result && result.data && result.data.length){
                        result.data.forEach(function(item){
                            //有数据异常数据（可能有其他用户删除了正在保存数据）
                            if(item.status == null){
                                //轮询数组中去掉这一项
                                self.resizing.removeFirewallId(item.id);
                                //更新列表视图
                                self.netFirewallData=self.netFirewallData.filter(function(obj){
                                    return obj.id!=item.id
                                });
                                //重置按钮状态
                                successFunc(self.netFirewallData);
                            }else if(item.status.toLowerCase() == "active"||item.status.toLowerCase() == "inactive"||item.status.toLowerCase() == "down"||item.status.toLowerCase() == "error"){
                                self.resizing.removeFirewallId(item.id);
                                self.netFirewallData.map(function(obj){
                                    if(obj.id == item.id){
                                        obj.status = item.status.toLowerCase();
                                        obj._status = $translate.instant("aws.networks." + obj.status.toLowerCase());
                                    }
                                });  
                            }
                            
                            //轮询一次记录时间更改。
                            if(self.resizeNum[item.id]){
                                self.resizeNum[item.id]=self.resizeNum[item.id]+1;
                            }else{
                                self.resizeNum[item.id]=1;
                            }
                            
                            //当一个镜像在上传过程中荡掉。让这条数据轮询最多25分钟关闭。
                            if(self.resizeNum[item.id]>151){
                                self.resizing.removeFirewallId(item.id);
                            }
                        });
                        
                    }
                        
                      
                }).finally(function(){
                    //轮询时可能有的数据已经恢复正常,参数重置。
                    if(self.resizing.length>0){
                        var options={
                            'ids':self.resizing
                        };
                        $window.IntervalFirewallResize(options);
                    }else{
                        self.timerStart=false;
                        $timeout.canel(timer);
                    }
                });
            
            },3000);  
        };

        function filteredRouters(result_data) {
            var haveAddRouters = [],
                _routers = [];
            _.each(self.netFirewallData, function(firewall) {
                if (firewall.routers) {
                    _.each(firewall.routers, function(route) {
                        haveAddRouters.push(route);
                    });
                }
            });
            _.each(result_data, function(item) {
                _.each(haveAddRouters, function(val) {
                    if (item.id == val.id) {
                        _routers.push(item);
                    }
                })
            });
            return _.difference(result_data, _routers);
        }

        //增减规则数据处理
        self.operateRulesParams=function(data){
            var result=[];
            data.forEach(function(item){
                let obj={};
                obj.action=item.action;
                obj.description=item.description;
                if(item.destination_ip_address){
                   obj.destination_ip_address=item.destination_ip_address; 
                }
                if(item.destination_port){
                   obj.destination_port=item.destination_port;
                }
                obj.enabled=item.enabled;
                obj.name=item.name;
                obj.protocol=item.protocol;
                if(item.source_ip_address){
                   obj.source_ip_address=item.source_ip_address; 
                }
                if(item.source_port){
                   obj.source_port=item.source_port; 
                }
                result.push(obj);
            });
            return result;
        };
        //规则展示数据处理
        self.operateRuleData=function(data){
           data.map(function(item){
               item.status=$translate.instant("aws.firewall." + item.enabled);
               item._action=$translate.instant("aws.firewall." + item.action);
               item._protocol=item.protocol==null?$translate.instant("aws.networks.any"):item.protocol.toUpperCase();
               item._source_ip_address=item.source_ip_address?item.source_ip_address:$translate.instant("aws.networks.any");
               item._destination_ip_address=item.destination_ip_address?item.destination_ip_address:$translate.instant("aws.networks.any");
               item._source_port=item.source_port?item.source_port.indexOf(":")>-1?"["+item.source_port.replace(/:/g,function(kw){return "~"})+"]":"["+item.source_port+"]":$translate.instant("aws.networks.any");
               item._destination_port=item.destination_port?item.destination_port.indexOf(":")>-1?"["+item.destination_port.replace(/:/g,function(kw){return "~"})+"]":"["+item.destination_port+"]":$translate.instant("aws.networks.any");
               return item;
           });
           return data;
        };
        //防火墙关联（解除）路由器
        function judgeRelieve(data){
             var relieve=false;
             if(data[0].router_ids.length>0){
                relieve=true;
             }
             return relieve;
        }

        // 监听主页的单选框，控制操作按钮的状态
        self.$watch(function() {
            return self.checkFirst.items;//监控checkbox
        }, function(val) {
            self.firewallCheckedItems = [];
            var arr=[];
            for(var i in self.checkFirst.items){
                arr.push(self.checkFirst.items[i])
            }
            self.checkedEdit = null;
            self.checkedDel = null;
            self.checkRelation = null;
            self.checkRelieve = null;
            if(val && arr.length>=0){
                for(var key in val){
                    if(val[key]){
                        self.netFirewallData.forEach(item=>{
                            if(item.id==key){
                                self.firewallCheckedItems.push(item);
                            }
                        })
                    }
                }
            }
        },true);

        //监听firewallCheckedItems的变化，轮询时改变按钮的状态
        self.$watch(function(){
            return self.firewallCheckedItems;
        },function(checkedItems){
            //删除中不可删除 不可编辑 不可关联 解除关联  更新中可以删除 不可以编辑 不可以关联 解除关联
            if(checkedItems.length==1){
                self.canMoreHandle=true;
                self.firewallEditData=self.firewallCheckedItems[0]; 
                if(checkedItems[0].status=="pending_update"||checkedItems[0].status=="pending_delete"){
                    self.canEdit = false;
                    self.canDel = false;
                    self.canRelation = false;
                    self.canRelieve = false;
                    if(checkedItems[0].status=="pending_delete"){
                       self.canDel = true;  
                    }
                }else if(checkedItems[0].status=="inactive"){
                    self.canEdit = true;
                    self.canDel = true;
                    self.canRelation = true;
                    self.canRelieve = false;
                }else{
                    self.canEdit= true;
                    self.canDel=true;
                    self.canRelation = true;
                    self.canRelieve = judgeRelieve(checkedItems);
                }
            }else if(checkedItems.length>1){
                self.canMoreHandle=true;
                var updateResult = checkedItems.some(function(item){
                    return item.status=="pending_update";
                });
                var deleteResult = checkedItems.some(function(item){
                    return item.status=="pending_delete";
                });
                if(updateResult){
                    self.canEdit = false;
                    self.canDel = true;
                    self.canRelation = false;
                    self.canRelieve = false;
                }else if(deleteResult){
                    self.canEdit = false;
                    self.canDel = false;
                    self.canRelation = false;
                    self.canRelieve = false;
                }else{
                    self.canEdit= false;
                    self.canDel=true;
                    self.canRelation = false;
                    self.canRelieve = false;
                }
            }else if(checkedItems.length==0){
                self.canMoreHandle=false;
                self.canEdit= false;
                self.canRelation = false;
                self.canDel=false;
                self.canRelieve = false;
            }
        },true);

        // 新建弹框
        self.createNetFirewall = function(){
            var createNetFirewallModal = modalCom.init('netFirewallModal.html',"createNetFirewallCtrl",{refresh:function(){return initNetFirewallTable},context:function(){return self}})
        }

        // 编辑弹框
        self.editNetFirewall = function(){
            var editNetFirewallModal = modalCom.init('netFirewallModal.html',"editNetFirewallCtrl",{editData:function(){return self.firewallEditData},refresh:function(){return initNetFirewallTable},context:function(){return self}})
        }

        // 关联弹框
        self.relationRouter = function(){
            var relationRouterModal = modalCom.init('associateRouteModal.html',"associateRouteCtrl",{editData:function(){return self.firewallEditData},refresh:function(){return initNetFirewallTable},context:function(){return self}})
        }

        // 解除关联弹框
        self.relieveRouter = function(data){
            var relieveRouterModal = modalCom.init('associateRouteModal.html',"disassociationRouterCtrl",{editData:function(){return self.firewallEditData},refresh:function(){return initNetFirewallTable},context:function(){return self}})
        }

        //删除防火墙
        self.deleteNetfirewall = function(checkedItems) {
            self.refreshNetFirewallTable = initNetFirewallTable;
            commonFuncSrv.deleteFirewall(self,checkedItems);
        };

        // 新建规则
        self.createNetFirewallRules = function(){
            var instan = modalCom.init('netFirewallRuleModal.html',"createNetFirewallRulesCtrl",{refresh:function(){return self.getFirewallRulesList},context:function(){return self}});
        };
        // 规则启用
        self.enabledNetFirewallRules = function(checkedItems){
            var content = {
                target: "enabledNetFirewallRules",
                msg: "<span>" + $translate.instant("aws.networks.del.enabledFirewallRuleMsg") + "</span>",
                type: "info",
                btnType: "btn-info",
                data: checkedItems
            };
            self.$emit("delete", content);
        };
        self.$on("enabledNetFirewallRules", function(e, checkedItems) {
            self.ruleEnabling=true;
            var del_obj_ids = [];
            _.each(checkedItems, function(item) {
                del_obj_ids.push(item.id);
            });
            netfirewallSrv.enableFirewallRule({
                "id": del_obj_ids
            }).then(function() {
                self.getFirewallRulesList();
                initNetFirewallTable()
            }).finally(function(){
                self.ruleEnabling=false;
            });
        });
        // 规则禁用
        self.forbiddenNetFirewallRules = function(checkedItems){       
            var content = {
                target: "forbiddenNetFirewallRules",
                msg: "<span>" + $translate.instant("aws.networks.del.forbiddenFirewallRuleMsg") + "</span>",
                type: "warning",
                btnType: "btn-warning",
                data: checkedItems
            };
            self.$emit("delete", content);
        }
        self.$on("forbiddenNetFirewallRules", function(e, checkedItems) {
            self.ruleDisabling=true;
            var del_obj_ids = [];
            _.each(checkedItems, function(item) {
                del_obj_ids.push(item.id);
            })
            netfirewallSrv.disableFirewallRule({
                "id": del_obj_ids
            }).then(function() {
                self.getFirewallRulesList();
                initNetFirewallTable();
            }).finally(function(){
                self.ruleDisabling=false;
            });
        });
        // 删除规则
        self.deleteNetfirewallRule = function(routerCheckedItems) {        
            var content = {
                target: "deleteNetfirewallRule",
                msg: "<span>" + $translate.instant("aws.networks.del.delFirewallRuleMsg") + "</span>",
                data: routerCheckedItems
            };
            self.$emit("delete", content);
        };
        self.$on("deleteNetfirewallRule", function(e, routerCheckedItems) {
            self.ruleDeleting=true;
            var noSelectResult = [];
            for(var i = 0; i < self.ruleList.length; i++){
                var obj = self.ruleList[i];
                var id = obj.id;
                var isExist = false;
                for(var j = 0; j < routerCheckedItems.length; j++){
                    var aj = routerCheckedItems[j];
                    var selectId = aj.id;
                    if(id == selectId){
                        isExist = true;
                        break;
                    }
                }
                if(!isExist&&obj.name!='default'){
                    noSelectResult.push(obj);
                }
            }
            self.updateRouterListOfDelete=self.operateRulesParams(noSelectResult);
            netfirewallSrv.createFirewallRule(self.netfirewallDetail.id,self.updateRouterListOfDelete).then(function(){
                self.getFirewallRulesList();
            }).finally(function(){
                self.ruleDeleting=false;
            });
        });

        function judgeCanEnabledRule(data){
             let canEnabled=true;
             var len=data.length;
             for(var i=0;i<len;i++){
                 if(data[i].enabled==true){
                    canEnabled=false;
                    break;
                 }
             }
             return canEnabled;
        }

        function judgeCanForbiddenRule(data){
             let canForbidden=true;
             var len=data.length;
             for(var i=0;i<len;i++){
                 if(data[i].enabled==false){
                    canForbidden=false;
                    break;
                 }
             }
             return canForbidden;
        }

        //基本信息点击事件
        self.activeBaseTab=function(){
           self.showBaseMsgOfDetail=true; 
           self.showRuleOfDetail=false;
        }

        function successRuleFunc(data){
           self.ruleList=data;
           self.ruleListData=angular.copy(data);
           self.ruleListData=self.operateRuleData(data);
           //防火墙默认的规则
           var defaultRule={
                "status":$translate.instant("aws.firewall.true"),
                "description":$translate.instant("aws.firewall.firewallDefaultRule"),
                "_destination_ip_address":$translate.instant("aws.networks.any"),
                "_destination_port":$translate.instant("aws.networks.any"),
                "name":"default",
                "enabled":true,
                "enabled_default":"default",
                "_protocol":$translate.instant("aws.networks.any"),
                "_source_ip_address":$translate.instant("aws.networks.any"),
                "_source_port":$translate.instant("aws.networks.any"),
                "_action":$translate.instant("aws.firewall.deny")
           };
           self.ruleListData.push(defaultRule);
           self.ruleListData.forEach(function(rule){
                if(rule.enabled_default=='default'){
                   rule.unChecked=true;
                }else{
                   rule.unChecked=false; 
                }
           });

           self.firewallRuleTable = new NgTableParams({
                count: GLOBAL_CONFIG.PAGESIZE
           }, {
                counts: [],
                dataset: self.ruleListData
           });
           self.ruleSearchTerm({tableData:self.ruleListData,titleData:self.ruleTitleData});
           checkedSrv.checkDo(self, self.ruleListData, "id", "firewallRuleTable");
           self.$watch(function() {
              return self.checkboxes.items;
            }, function(val){
                self.checkedItems = [];
                var arr=[];
                for(var i in self.checkboxes.items){
                    arr.push(self.checkboxes.items[i]);
                }
                if(val && arr.length>=0){
                    for(var key in val){
                        if(val[key]){
                            self.firewallRuleTable.data.forEach(item=>{
                                if(item.id==key){
                                    self.checkedItems.push(item);
                                }
                            });
                        }
                    }
                }
                self.canEnableRule=false;
                self.canForbiddenRoule=false;
                self.canDelRoule=false;
                if(self.checkedItems.length==1){
                   self.canDelRoule=true;
                   self.canEnableRule=judgeCanEnabledRule(self.checkedItems);
                   self.canForbiddenRoule=judgeCanForbiddenRule(self.checkedItems);
                }else if(self.checkedItems.length>1){
                   self.canDelRoule=true;
                   self.canEnableRule=judgeCanEnabledRule(self.checkedItems);
                   self.canForbiddenRoule=judgeCanForbiddenRule(self.checkedItems);
                }
            },true);
        }

        //获取规则列表
        self.getFirewallRulesList=function(){
            self.showRuleOfDetail=true;
            self.showBaseMsgOfDetail=false;
            self.globalSearchTerm.ruleTerm="";
            TableCom.init(self,'firewallRuleTable',[],'id',GLOBAL_CONFIG.PAGESIZE,'firewallRuleCheck');
            self.fireRuleData = false;
            netfirewallSrv.getFirewallRuleList(self.fireWallId).then(function(res){
                res ? self.fireRuleData = true : "";
                if(res&&res.data&&angular.isArray(res.data)){
                   successRuleFunc(res.data);
                }
            });
        };
        
        self.$on("getDetail", function(event, value) {
            self.fireWallId=value;
            if($routeParams.configRule && $routeParams.configRule == "configRule"){
               self.getFirewallRulesList();
            }else{
               self.activeBaseTab();
            }

            self.source_ip_msg=$translate.instant("aws.firewall.source_ip");
            self.destination_ip_msg=$translate.instant("aws.firewall.destination_ip");
            self.port_msg=$translate.instant("aws.firewall.port");

            //获取基本信息
            self.$watch(function(){
                 return  self.netFirewallData;
            },function(netFirewallData){
                 if(netFirewallData){
                   netFirewallData.forEach(function(item){
                        if(item.id==value){
                           self.netfirewallDetail=item;
                           self.netfirewallDetail.state=$translate.instant("aws.networks." + self.netfirewallDetail.status.toLowerCase());
                        }
                   }); 
                 }
                 
            });

        });

}]);
netfirewallModule.controller("createNetFirewallCtrl",["$scope","$uibModalInstance","netfirewallSrv","refresh","context","$translate","TableCom","modalCom",function(scope,$uibModalInstance,netfirewallSrv,refresh,context,$translate,TableCom,modalCom){    
    var self = scope;
    self.netFirewallModal_title = $translate.instant("aws.firewall.newFireWall");
    self.netFirewall = {
        name : "",
        description : ""
    };
    self.protocolList=[
            {name : "TCP",value:"tcp"},
            {name : "UDP",value:"udp"},
            {name : "ICMP",value:"icmp"},    
            {name : $translate.instant("aws.networks.any"),value:null}    
        ]
    self.netFirewallConfirm = function(field,data){
        self.submitInValid=false;
        if(field.$valid){
            $uibModalInstance.dismiss('cancel');
            netfirewallSrv.addFirewall(self.netFirewall).then(function(res){
                refresh();
                if(angular.isObject(res.data)&&res.data.id){
                   //弹出创建规则层//TableCom,modalCom
                   self.newFireId=res.data.id;
                   self.jumpToRuleModal=modalCom.init('jumpToRuleModal.html',"jumpToRuleModalCtrl",{refresh:function(){return refresh},createContext:function(){return self},context:function(){return context}})
                }
            });
        }else{
            self.submitInValid=true;
        }
    }
}]);
netfirewallModule.controller("jumpToRuleModalCtrl",["$scope","$uibModalInstance","netfirewallSrv","refresh","createContext","context","$translate","TableCom","modalCom","$location",function(scope,$uibModalInstance,netfirewallSrv,refresh,createContext,context,$translate,TableCom,modalCom,$location){    
    var self = scope;
    self.clickToCreateRule=function(){
       context.active=1;
       $location.path('/cvm/firewall').search({id:createContext.newFireId,configRule:'configRule'});
       $uibModalInstance.dismiss('cancel');
    }
}]);
netfirewallModule.controller("editNetFirewallCtrl",["$scope","editData","$uibModalInstance","netfirewallSrv","refresh","context","$translate","GLOBAL_CONFIG",function(scope,editData,$uibModalInstance,netfirewallSrv,refresh,context,$translate,GLOBAL_CONFIG){
    var self = scope;
    self.netFirewallModal_title = $translate.instant("aws.firewall.editFireWall")
    self.netFirewall = {
        name : editData.name,
        description : editData.description
    };
    self.netFirewallConfirm = function(field){
        self.submitInValid=false;
        if(field.$valid){
            self.firewallEditing=true;
            netfirewallSrv.updateFirewall(editData.id,self.netFirewall).then(function(){
                refresh();
            }).finally(function(){
                self.firewallEditing=false;
            });
            $uibModalInstance.dismiss('cancel');
        }else{
            self.submitInValid=true;
        }
    }
}]);
netfirewallModule.controller("associateRouteCtrl",["$scope","editData","$uibModalInstance","refresh","context","$translate","GLOBAL_CONFIG","routersSrv","TableCom" ,"modalCom","netfirewallSrv",function(scope,editData,$uibModalInstance,refresh,context,$translate,GLOBAL_CONFIG,routersSrv,TableCom,modalCom,netfirewallSrv){
    var self = scope;
    self.isAssociate=true;
    self.associateRouteModal_title = $translate.instant("aws.networks.associationRouter") 
    self.routerCheck = {
        checked: false,
        items: {}
    };
    var initRoutersTableData = function() {
        netfirewallSrv.getUnrelateRouterOfFireWall(editData.id).then(function(res){
            res ? self.routerData= true : "";
            if(res&&res.data&&angular.isArray(res.data)){
               res.data.map(function(item){
                    //处理返回的数据
                    item._status = $translate.instant("aws.routers.status." + item.status.toString().toLowerCase());
                    item._enableSnat = item.enableSnat == true ? $translate.instant("aws.common.yes") : $translate.instant("aws.common.no");
                    item._adminState = item.adminState == true ? $translate.instant("aws.common.yes") : $translate.instant("aws.common.no");
                    return item;
              });
              TableCom.init(self,'routerTable',res.data,'id',GLOBAL_CONFIG.PAGESIZE,'routerCheck');
            }
        });
    };
    initRoutersTableData()
    self.$watch(function() {
        return self.routerCheck.items;
    }, function(val) {
        self.routerCheckedIds=[];
        for(var key in val){
           if(val[key]){
              self.routerCheckedIds.push(key);
           }
        }
    },true);
    self.relationRouterConfirm=function(){       
        var params={
            "router_ids":editData.router_ids.concat(self.routerCheckedIds)
        }
        self.firewallRelating=true;
        $uibModalInstance.close();
        netfirewallSrv.associateRouter(editData.id,params).then(function(){
            refresh();
        }).finally(function(){
            self.firewallRelating=false;
        });
    };
    
}]);
netfirewallModule.controller("disassociationRouterCtrl",["$scope","editData","$uibModalInstance","refresh","context","$translate","GLOBAL_CONFIG","routersSrv","TableCom" ,"modalCom","netfirewallSrv",function(scope,editData,$uibModalInstance,refresh,context,$translate,GLOBAL_CONFIG,routersSrv,TableCom,modalCom,netfirewallSrv){
    var self = scope;
    self.isAssociate = false;
    self.associateRouteModal_title = $translate.instant("aws.networks.disassociationRouter") 
    self.relieveRouterCheck = {
        checked: false,
        items: {}
    };
    self.haveAssociateRouters = [];
    var initRoutersTableData = function() {
        netfirewallSrv.getRouterOfFireWall(editData.id).then(function(res){
            res ? self.relieveRouterData= true : "";
            if(res&&res.data&&angular.isArray(res.data)){
               self.routerList=res.data;
               res.data.map(function(item){
                    //处理返回的数据
                    item._status = $translate.instant("aws.routers.status." + item.status.toString().toLowerCase());
                    item._enableSnat = item.enableSnat == true ? $translate.instant("aws.common.yes") : $translate.instant("aws.common.no");
                    item._adminState = item.adminState == true ? $translate.instant("aws.common.yes") : $translate.instant("aws.common.no");
                    return item;
              });
              TableCom.init(self,'relieveRouterTable',res.data,'id',GLOBAL_CONFIG.PAGESIZE,'relieveRouterCheck');
            }
        });
    };
    initRoutersTableData();
    self.$watch(function() {
        return self.relieveRouterCheck.items;
    }, function(val) {
        //传入剩下的数组
        self.leftRouterList=[];
        self.relieveRouterCheckedIds=[];
        for(var key in val){
           if(val[key]){
              self.relieveRouterCheckedIds.push(key);
           }
        }
    },true);
    self.relieveRouterConfirm=function(){
        var noSelectResult = [];
        for(var i = 0; i < self.routerList.length; i++){
            var obj = self.routerList[i];
            var id = obj.id;
            var isExist = false;
            for(var j = 0; j < self.relieveRouterCheckedIds.length; j++){
                var selectId = self.relieveRouterCheckedIds[j];
                if(id == selectId){
                    isExist = true;
                    break;
                }
            }
            if(!isExist){
                noSelectResult.push(obj.id);
            }
        }       
        var params={
            "router_ids":noSelectResult
        }
        self.firewallRelieving=true;
        $uibModalInstance.close();
        netfirewallSrv.associateRouter(editData.id,params).then(function(){
            refresh();
        }).finally(function(){
            self.firewallRelieving=false;
        });
    };
}]);
netfirewallModule.controller("createNetFirewallRulesCtrl",["$scope", "$rootScope", "TableCom" , "netfirewallSrv", "modalCom", "$translate", "$interval", "$location","GLOBAL_CONFIG","context","refresh","$uibModalInstance","$filter",function($scope, $rootScope , TableCom, netfirewallSrv, modalCom ,$translate, $interval, $location,GLOBAL_CONFIG,context,refresh,$uibModalInstance,$filter){
    var self = $scope;
    self.netFirewallRule_title = $translate.instant("aws.networks.createFirewallRule");
    self.defaultRule=$translate.instant("aws.firewall.defaultRuleCanNotDel");
    self.source_ip_msg=$translate.instant("aws.firewall.source_ip");
    self.destination_ip_msg=$translate.instant("aws.firewall.destination_ip");
    self.port_msg=$translate.instant("aws.firewall.port");
    self.netFirewallRulesList=[];
    self.netFirewallRulesParamsList=[];
    //选择对哪个规则进行操作
    self.selectRule={};
    self.list ={
        protocolList:[
            {name : $translate.instant("aws.networks.any"),value:null},
            {name : "TCP",value:"tcp"},
            {name : "UDP",value:"udp"},
            {name : "ICMP",value:"icmp"},        
        ],
        ationList:[
            {name : $translate.instant("aws.firewall.allow"),value:'allow'},
            {name : $translate.instant("aws.firewall.deny"),value:'deny'},
            {name : $translate.instant("aws.firewall.reject"),value:'reject'}
        ]
    }
    self.allRedio = {
        sourceIpOrSubnet:1,
        sourcePort:1,
        destinationIpOrsubnet:1,
        destinationPort:1
    }
    //初始化表单数据
    clearInput();
    
    self.netFirewallRulesList = angular.copy(context.ruleListData);
    self.netFirewallRulesParamsList = [];
    //右边初始化已有的规则列表
    TableCom.init(self,'addRuleTable',self.netFirewallRulesList,'id',100,'addFirewallRuleCheck');
    
    self.canMoveUp = false;
    self.canMoveDown = false;
    self.changeRule=function(rule){
        self.canMoveUp = false;
        self.canMoveDown = false;
        self.editData=rule;
        self.netFirewallRulesList.forEach(function(item,index){
           item.index=index;
           if(item.id==rule.id){
              if(index==0&&index!=self.netFirewallRulesList.length-2){
                 self.canMoveUp = false;
                 self.canMoveDown = true;
              }else if(index!=0&&index==self.netFirewallRulesList.length-2){
                 self.canMoveUp = true;
                 self.canMoveDown = false;
              }else if(index!=0&&index!=self.netFirewallRulesList.length-2){
                 self.canMoveUp = true;
                 self.canMoveDown = true;
              }
           }
        }); 
    }
    
    // 交换数组元素
    function swapItems(arr, index1, index2) {
        arr[index1] = arr.splice(index2, 1, arr[index1])[0];
        return arr;
    };

    // 上移
    function upRecord(arr, index) {
        if(index != 0) {
            swapItems(arr, index, index - 1);
        }
        
    };

    function downOrderFunc(type){
        if(type == "down"){
            self.netFirewallRulesList.map((item,index) => {
                item.num = Number(index);
            })
            self.netFirewallRulesList = $filter("orderBy")(self.netFirewallRulesList, "num",true);
        }
    }

    self.ruleMove=function(editData,type){
        self.canMoveUp = false;
        self.canMoveDown = false;
        if(self.netFirewallRulesList && self.netFirewallRulesList.length){
            downOrderFunc(type)
            self.netFirewallRulesList.map((item,index) => {
                if(self.selectRule.rule&&item.id==editData.id){
                    upRecord(self.netFirewallRulesList,index);
                }
            })
            downOrderFunc(type)
            TableCom.init(self,'addRuleTable',self.netFirewallRulesList,'id',100,'cheaddFirewallRuleCheckckFirst');
            //取消勾选
            self.selectRule.rule=false;
            self.editData="";
        }
    }

    //创建按钮
    self.addfireWallRule=function(field){
        if (field.$valid) {
            addfireWallRuleTerm()
            field.$setPristine();
            field.$setUntouched();
            self.submitInValid=false;
            clearInput()
            self.allRedio = {
                sourceIpOrSubnet:1,
                sourcePort:1,
                destinationIpOrsubnet:1,
                destinationPort:1
            }
        }else{
            self.submitInValid = true;
        }
    }
    
    //添加规则时组装数据
    function addfireWallRuleTerm(){
        let fireWallRuleOne = {}
        fireWallRuleOne.name=context.netfirewallDetail.name;
        fireWallRuleOne.description=self.createNetworkRule.description;
        fireWallRuleOne.enabled=true;
        fireWallRuleOne.protocol = self.createNetworkRule.protocol.value;
        fireWallRuleOne.action = self.createNetworkRule.action.value;
        fireWallRuleOne.source_ip_address = self.allRedio.sourceIpOrSubnet == 1 ? self.createNetworkRule.source_ip : self.createNetworkRule.source_subnet;
        fireWallRuleOne.destination_ip_address = self.allRedio.destinationIpOrsubnet == 1 ? self.createNetworkRule.destination_ip : self.createNetworkRule.destination_subnet;
        if(self.createNetworkRule.protocol.value==null||self.createNetworkRule.protocol.value=='icmp'){
           // fireWallRuleOne.source_port=null;
           // fireWallRuleOne.destination_port=null;
           fireWallRuleOne.source_port="";
           fireWallRuleOne.destination_port="";
        }else{
           fireWallRuleOne.source_port=self.allRedio.sourcePort == 1?self.createNetworkRule.source_port:(self.createNetworkRule.source_port_start?(self.createNetworkRule.source_port_start+":"+self.createNetworkRule.source_port_end):"");
           fireWallRuleOne.destination_port=self.allRedio.destinationPort == 1?self.createNetworkRule.destination_port:(self.createNetworkRule.destination_port_start?(self.createNetworkRule.destination_port_start+":"+self.createNetworkRule.destination_port_end):"");
        }
        //显示数据
        var ruleParams=angular.copy(fireWallRuleOne);
        var ruleParamsArr=context.operateRuleData([ruleParams]);
        //配置随机数为id
        ruleParamsArr[0].id=Math.random().toString().split('.')[1];
        self.netFirewallRulesList.splice(self.netFirewallRulesList.length-1,0,ruleParamsArr[0]);
        TableCom.init(self,'addRuleTable',self.netFirewallRulesList,'id',100,'addFirewallRuleCheck');
        if(self.editData){
           self.netFirewallRulesList.forEach(function(item){
               if(item.id==self.editData.id){
                  self.changeRule(item);
               }
           });
        }
    }

    //重置规则表
    function clearInput(){
        return self.createNetworkRule = {
            protocol:self.list.protocolList[0],
            action:self.list.ationList[0],
            source_ip:"",
            source_subnet:"",
            source_port:"",
            source_port_start:"",
            source_port_end:"",
            destination_ip:"",
            destination_subnet:"",
            destination_port:"",
            destination_port_start:"",
            destination_port_end:"",
            description:""
        }
    }

    self.delFireRule = function(rule,num){
        if(rule.enabled_default!='default'){
            self.netFirewallRulesList.splice(num , 1);
            TableCom.init(self,'addRuleTable',self.netFirewallRulesList,'id',100,'cheaddFirewallRuleCheckckFirst');
            if(self.editData){
               self.netFirewallRulesList.forEach(function(item){
                   if(item.id==self.editData.id){
                      self.changeRule(item);
                   }
               });
            }
        } 
    }

    self.firewallRuleConfirm = function(){
        if(self.netFirewallRulesList.length){
            //去掉默认规则
            self.netFirewallRulesList.splice(self.netFirewallRulesList.length-1,1);
            var options=context.operateRulesParams(self.netFirewallRulesList);
            $uibModalInstance.dismiss('cancel');
            netfirewallSrv.createFirewallRule(context.netfirewallDetail.id,options).then(function(){
               refresh();
            });
        }
    }
}]);
netfirewallModule.directive('portLimit',function(){
    return {
        restrict:"A",
        require:"ngModel",
        scope:{
            startport:"=",
            support:"="
        },
        link:function(scope,elem,attrs,ngModel){
            var reg = new RegExp("^(0|[1-9][0-9]*)$");
            ngModel.$parsers.push(function(viewValue){
                if(Number(angular.element("#"+attrs.start).val())){
                    //var val = Number(viewValue);
                    if(reg.test(viewValue)){
                        if(viewValue <= Number(scope.startport)){
                            ngModel.$setValidity("portlimit",false);
                        }else{
                            ngModel.$setValidity("portlimit",true);
                        }
                    }else{
                       ngModel.$setValidity("portlimit",true); 
                    }
                }else{
                    ngModel.$setValidity("portlimit",true);
                }
                if(scope.support){
                    if(!viewValue){
                       ngModel.$setValidity("portsupport",false);
                    }else{
                       ngModel.$setValidity("portsupport",true); 
                    }
                }else{
                    ngModel.$setValidity("portsupport",true);
                }
                return viewValue;
            });
            scope.$watch(function(){
                return angular.element("#"+attrs.start).val();
            },function(startValue){
                if(Number(startValue)){
                    //var val = Number(ngModel.$viewValue);
                    if(reg.test(ngModel.$viewValue)){
                        if(ngModel.$viewValue <=Number(scope.startport)){
                            ngModel.$setValidity("portlimit",false);
                        }else{
                            ngModel.$setValidity("portlimit",true);
                        }
                    }else{
                       ngModel.$setValidity("portlimit",true);  
                    }
                }else{
                    ngModel.$setValidity("portlimit",true);
                }

            });
            scope.$watch(function(){
                return scope.support;
            },function(support){
                if(support){
                    if(!ngModel.$viewValue){
                      ngModel.$setValidity("portsupport",false);
                    }else{
                      ngModel.$setValidity("portsupport",true);
                    }
                }else{
                    ngModel.$setValidity("portsupport",true);
                }

            });
        }
    };
});
netfirewallModule.directive('portRequired',function(){
    return {
        restrict:"A",
        require:"ngModel",
        scope:{
            support:"=",
        },
        link:function(scope,elem,attrs,ngModel){
            var reg = new RegExp("^(0|[1-9][0-9]*)$");
            ngModel.$parsers.push(function(viewValue){
                if(scope.support){
                    if(!viewValue){
                       ngModel.$setValidity("portsupport",false);
                    }else{
                       ngModel.$setValidity("portsupport",true); 
                    }
                }else{
                    ngModel.$setValidity("portsupport",true);
                }
                return viewValue;
            });
            scope.$watch(function(){
                return scope.support;
            },function(support){
                if(support){
                    if(!ngModel.$viewValue){
                      ngModel.$setValidity("portsupport",false);
                    }else{
                      ngModel.$setValidity("portsupport",true);
                    }
                }else{
                    ngModel.$setValidity("portsupport",true);
                }

            });
        }
    };
});
