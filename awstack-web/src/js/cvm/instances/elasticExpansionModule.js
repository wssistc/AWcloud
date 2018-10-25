import "./instancesSrv";
import "./elasticExpansionSrv";

angular.module("elasticExpansionModule", ["instancesSrv","elasticExpansionSrvModule"])
    .controller("elasticExpansionCtrl", ["$scope", "$rootScope","NgTableParams","$uibModal", "instancesSrv","elasticExpansionSrv","$translate", "checkedSrv","$timeout", "GLOBAL_CONFIG", "alertSrv","$filter","$q","$location",
      function($scope, $rootScope,NgTableParams, $uibModal, instancesSrv, elasticExpansionSrv, $translate, checkedSrv, $timeout, GLOBAL_CONFIG, alert,$filter,$q,$location) {
        var self = $scope;   
        self.expansion_search={};
        self.delisDisabled=true;
        self.canEdit=false;
        var initElasticExpansionTable=function(){
            self.ports_search.globalSearchTerm ="";
             portsSrv.getPortList().then(function(result){
                  result ? self.loadPortsData = true : "";
                  if(result&&angular.isArray(result.data)){
                      self.portsData=result.data.map(function(item){
                          if(item.device_id){
                             item.status='mounted';
                          }else{
                             item.status='unmounted';
                          }
                          item.status_TR=$translate.instant("aws.ports."+item.status);
                          item.created_at=item.created_at.replace(/T/g," ").replace(/-/g,"/");
                          item.created_at=new Date(item.created_at).getTime()+28800000;
                          item.created_at=$filter("date")(item.created_at, "yyyy-MM-dd HH:mm:ss");
                          //没有子网和ip
                          if(item.fixed_ips.length==0){
                             item.searchTerm =[item.name,item.mac_address,item.network_name,item.device_name,item.created_at].join(",");
                          }else{
                             item.ip_address=item.fixed_ips[0].ip_address?item.fixed_ips[0].ip_address:"";
                             item.subnet_name=item.fixed_ips[0].subnet_name?item.fixed_ips[0].subnet_name:"";
                             item.searchTerm =[item.name,item.mac_address,item.network_name,item.subnet_name,item.ip_address,item.device_name,item.created_at].join(",");
                          }
                          return item;
                      });
                      self.portsTable = new NgTableParams({
                         count: GLOBAL_CONFIG.PAGESIZE
                      }, {
                         counts: [],
                         dataset: self.portsData
                      });
                      checkedSrv.checkDo(self, "", "id", "portsTable");
                  }
             });
        };
        //initPortsTable();

        self.refreshElasticExpansion=function(){
           initElasticExpansionTable();
        };

        self.$watch(function() {
            return self.checkedItems;
        }, function(value) {
            if(!value){return}
            self.moreHandle=false;
            self.loadEnable=false;
            self.unloadEnable=false;
            self.canEdit=false;
            //多个
            self.delEnable=false;
            if(value.length==1){
               self.canEdit=true;
               self.moreHandle=true;
               if(!value[0].device_id){
                  self.loadEnable=true;
                  self.delEnable=true;
               }else{
                  self.unloadEnable=true;
               }
            }else if(value.length>1){
               self.moreHandle=true;
               var exitIns=false;
               value.some(function(item){
                   if(item.device_id){
                      exitIns=true;
                      return item.device_id;
                   }
               });
               if(!exitIns){
                  self.delEnable=true;
               }else{
                  self.delEnable=false;
               }
            }
        });
        

        self.applyGlobalSearch = function() {
            self.portsTable.filter({
                searchTerm: self.ports_search.globalSearchTerm
            });
        };

        //新建网卡
        self.createExpansion = function() {
            var createPortsModal=$uibModal.open({
                animation: true,
                templateUrl: "expansion.html",
                controller: "expansionCtrl",
                resolve: {
                    refreshExpansionTable: function() {
                        return initElasticExpansionTable;
                    }
                }
            });
        };

        //删除网卡
        self.delPorts= function(checkedItems) {
            var content = {
                target: "delPorts",
                msg: "<span>" + $translate.instant("aws.ports.delPorts") + "</span>",
                data: checkedItems
            };
            self.$emit("delete", content);
        };
        self.$on("delPorts", function(e,data) {
            var ports_ids=[];
            _.forEach(data,function(item){
                ports_ids.push(item.id);
            });
            var del_params={
                portIds:ports_ids
            };
            portsSrv.deletePort(del_params).then(function(){
                initPortsTable();
            });
        }); 

        self.$on("getDetail", function(event, value) {
            
        }); 
    }])
    .controller('expansionCtrl',["$scope", "$rootScope","NgTableParams","$uibModal", "instancesSrv","elasticExpansionSrv","$translate", "checkedSrv","$timeout", "GLOBAL_CONFIG", "alertSrv","$filter","$q","$location",
      function($scope, $rootScope,NgTableParams, $uibModal, instancesSrv, elasticExpansionSrv, $translate, checkedSrv, $timeout, GLOBAL_CONFIG, alert,$filter,$q,$location){
        var self=$scope;
        var self = $scope;
        self.inStepOne = true;
        self.inStepTwo = false;
        self.inStepThree = false;
        self.inStepOneBar = true;
        self.configSubmitInValid = false;
        self.extensionalSubmitInValid = false;
        self.telescopicSubmitInValid = false;
        self.subnetSubmitInValid = false;
        self.subDetailSubmitInValid = false;
        self.configData={
            name:"",
            loadbalancer:{
                options:["sha1"]
            },
            selectedLoadbalancer:"",
            listener:{
                options:["sha1"]
            },
            selectedListener:"",
            contactGroup:{
                options:["sha1"]
            },
            selectedContact:"",
        };
        self.triggerLogic={
           options:["所有","任意"]
        };
        self.monitoringCycle={
           options:["1分钟","3分钟","5分钟","10分钟"]
        };
        self.monitorObject={
           options:["CPU利用率","内存利用率","内网出带宽","内网入带宽","外网出带宽","外网入带宽"]
        };
        self.boundary={
           options:["最大值","最小值","平均值"]
        };
        self.mode={
           options:[">",">=","<","<="]
        };
        self.times={
           options:["连续1次","连续2次","连续3次","连续4次","连续5次","连续6次","连续7次","连续8次","连续9次","连续10次"]
        };
        self.triggerCondition={
           selectedLogic:self.triggerLogic.options[0],
           selectedCycle:self.monitoringCycle.options[0],
           monitoringRules:[
               {
                  monitorObject:self.monitorObject.options[0],
                  boundary:self.boundary.options[0],
                  mode:self.mode.options[0],
                  value:"",
                  times:self.times.options[0]
               }
           ],
        };
        function stepsStatus(one,two,three,oneBar,twoBar,threeBar){
            self.inStepOne = one;
            self.inStepTwo = two;
            self.inStepThree = three;
            self.inStepOneBar = oneBar;
            self.inStepTwoBar = twoBar;
            self.inStepThreeBar = threeBar;
            self.inStepZero = false;
        }
        self.interactedConfig = function(field){
            if (field) {
                return self.configSubmitInValid || field.$dirty ;
            }
        };
        self.interactedExtensional = function(field){
            if (field) {
                return self.extensionalSubmitInValid || field.$dirty;
            }
        };

        self.interactedTelescopic = function(field){
            if (field) {
                return self.telescopicSubmitInValid || field.$dirty;
            }
        };

        //一到二
        self.stepToTwo=function(createNetworkForm){
            // if(createNetworkForm.$valid){
                stepsStatus(false,true,false,true,true,false)
                //子网中cidr的验证
                //self.setCidr()
            // }else{
                // self.configSubmitInValid = true;
            // }
        }

      }
    ]);

