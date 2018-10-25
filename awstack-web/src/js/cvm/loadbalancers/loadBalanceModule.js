import './loadBalanceSrv';
import '../instances/instancesSrv';
var balanceModule=angular.module("balanceModule",["ngTable",'ngAnimate','ui.bootstrap.tpls', "ui.select","ngMessages","balanceSrv","instancesSrv"])
balanceModule.controller("balanceCtrl",["$scope","$rootScope","NgTableParams","$uibModal","checkedSrv","balanceDataSrv","GLOBAL_CONFIG","$translate","instancesSrv","$interval",
  function($scope,$rootScope,NgTableParams,$uibModal,checkedSrv,balanceSrv,GLOBAL_CONFIG,$translate,instancesSrv,$interval){
    var self = $scope;
    self.isDisabled = true;
    self.delisDisabled = true;
    //初始化页面
    self.initTable = function(){
    	self.isDisabled = true;
    	self.delisDisabled = true;
      self.balance_name = [];
      self.tabledata = "";
      self.tableParams = new NgTableParams({ count: GLOBAL_CONFIG.PAGESIZE }, { counts: [], dataset: []});
      balanceSrv.getBalancers().then(function(result){
		self.globalSearchTerm ="";
        if(result&&result.data){
            /*存下所有已有的安全组名*/
          result.data.map(item => {
            self.balance_name.push(item.name);
            self.balance_name = _.uniq(self.balance_name);
            item.searchTerm =  [item.name,item.description,item.vip_address,$translate.instant('aws.loadbalancers.ui.table.'+ item.provisioning_status)].join(',');
          });
          successFunc(result.data);
        }
      }) 
    }
    self.initNameData=function(){
      self.balance_name = [];
      balanceSrv.getBalancers().then(function(result){
        if(result&&result.data){
           /*存下所有已有的安全组名*/
          result.data.forEach(function(item){
              self.balance_name.push(item.name)
          })
        }
      })  
    }
    
    function successFunc(data){
      var tableId = "id";
      self.tabledata = data;
      self.tableParams = new NgTableParams({ count: GLOBAL_CONFIG.PAGESIZE }, { counts: [], dataset: self.tabledata });
      self.applyGlobalSearch = function(){
          var term = self.globalSearchTerm;
          self.tableParams.filter({searchTerm: term});
      };
      checkedSrv.checkDo(self,data,tableId);
    }
    self.initTable();

    //公网Ip是否可操作
        self.$watch(function() {
            return self.checkedItems;
        }, function(value) {
            self.bindfloatingIps = true;
            self.relievefloatIpDis = true;
            //获取负载均衡详情
            if(value && value.length == 1){
              balanceSrv.getBalancersDetail(value[0].id).then(function(result) {
                  if(result && result.data && result.data.name == value[0].name){
                      if(result.data.fip){
                        self.relievefloatIpDis = false;
                      }else{
                        self.bindfloatingIps = false;
                      }
                  }
                  
              });
            }
            
        });

    //获取子网
    self.getsubnets =function(id){
      balanceSrv.getsubnets().then(function(result){
        if(result && result.data){
          //result.data = result.data.filter(item => item.name != "external_subnet");
          result.data.map(obj => {obj.name = obj.name +"--" + obj.cidr} )
          self.Vlan.subnet=result.data;
          if(id){
            self.Vlan.selectedId = self.Vlan.subnet.filter(item => item.id == id)[0];
          }else{
            self.Vlan.selectedId = self.Vlan.subnet[0];
          }
        }
      })
    }

    self.changeID = function(subnetId){
      self.Vlan.vip_address ="";
    }

    //创建
    self.createLB=function(type){
      var $modalInstance = $uibModal.open({
        animation: self.animationsEnabled,
        backdrop:'static',
        templateUrl: 'newLB.html',
        scope:$scope
      });
      self.submitInValid = false;
      /*检验负载均衡名是否已存在*/
      self.NameCheck = false;
      self.checkedName = function(value){
          self.NameCheck = false;
          if(self.balance_name.length){
              for(var i= 0;i<self.balance_name.length;i++){
                  if(self.balance_name[i] == value){
                      self.NameCheck = true ;
                      break;
                  }
              }
          }
          
      }

      switch(type){
        case "new":
        self.initNameData();
        self.Vlan = {};
        self.getsubnets();
        self.Vlan.isEdit = false;
        self.Vlan.title = "newLb";
        self.Vlan.admin_state_up = true;
        
        self.confirm = function(createLBForm){
          if (createLBForm.$valid&&!self.NameCheck) {
            var postData = {
              name:self.Vlan.name,
              description:self.Vlan.description,
              vipSubnetId:self.Vlan.selectedId.id,
              vipAddress:self.Vlan.vip_address,
              adminStateUp:true
            }
            $modalInstance.close();
            balanceSrv.createBalancer(postData).then(function(){
              self.initTable()
            })
          }else{
            self.submitInValid = true;
          }
        }
        break;
        case "edit":
        self.Vlan={};
        self.Vlan = angular.copy(self.editData);
        self.Vlan.isEdit = true;
        self.Vlan.title = "editLb";
        self.getsubnets(self.editData.vip_subnet_id);
        /*self.Vlan.selectedId = {
          id:self.editData.vip_subnet_id
        };*/
        /*编辑时过滤掉本身的名字*/
        self.balance_name = self.balance_name.filter(item =>{
            return item != self.editData.name
        })
        self.Vlan.admin_state_up=self.editData.admin_state_up;
        self.confirm = function(createLBForm){
            if (createLBForm.$valid&&!self.NameCheck){
                var postData = {
                  id:self.Vlan.id,
                  name:self.Vlan.name,
                  description:self.Vlan.description,
                  adminStateUp:true
                };
                
                balanceSrv.editBalancer(postData).then(function(){
                  var editerLbTimer = $interval(function(){
                    balanceSrv.getBalancers().then(function(result){
                      if(result && result.data){
                        let count = 0;
                        result.data = _.map(result.data,item =>{
                          if(item.provisioning_status && item.provisioning_status.toLowerCase() == "pending_update"){  // PENDING_UPDATE
                            count++;
                          }
                          self.balance_name.push(item.name);
                          self.balance_name = _.uniq(self.balance_name);
                          item.searchTerm =  [item.name,item.description,item.vip_address,$translate.instant('aws.loadbalancers.ui.table.'+ item.provisioning_status),item.provisioning_status].join('\b');
                          return item;
                        })
                        if(count == 0){
                          $interval.cancel(editerLbTimer);
                          successFunc(result.data);
                        }
                      }
                    })
                  },1000);
                  //self.initTable()
                });
                $modalInstance.close();
            }else{
                self.submitInValid = true;
              }
        }
        break;
      }
    }

    //删除
    self.deleteBalancer = function(checkedItems){
        var content ={
          target:"deleteBalancers",
          msg:"<span>"+ $translate.instant("aws.loadbalancers.ui.lbDelMsg") +"</span>",
          data:checkedItems
        };
        self.$emit("delete",content);
    };
    self.$on("deleteBalancers",function(e,data){
        if (data&&data.length > 0) {
            //获取删除的卷id数组
            var balancers_ids=[];
            _.forEach(data,function(item){
                balancers_ids.push(item.id);
            });
            var delParams = {
                ids: balancers_ids
            };
            balanceSrv.deleteBalancer(delParams).then(function(){
                self.initTable();
            });
        }
    });


    //绑定公网IP和解除公网IP绑定
    self.bindFloatingIp = function(editData) {
        var scope = $rootScope.$new();
        var scope = $scope;
        var modal_os_ip = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: "bind-os-FloatingIp.html",
            scope: scope
        });
        scope.floatingIp = {};
        scope.submitInValid = false;
        scope.osNetList = [];
        //获取所有的公网IP
        instancesSrv.getAllfloalingIp().then(function(result) {
            if (result && result.data&& result.data.length) {
                scope.IpsList = result.data.filter(function(item) {
                    return !(item.portId);
                });
                scope.floatingIp.floatingip_id = scope.IpsList[0];
                return result.data;
            }
        })
        scope.confirm = function(fip, floatForm) {
            if (floatForm.$valid) {
                modal_os_ip.close();
                var postData = {
                    floatingip_id: fip.floatingip_id.id,
                    port_id: editData.vip_port_id
                };
                instancesSrv.bind_floatingip(postData).then(function() {
                  self.checkboxes ={};
                });
            } else {
                scope.submitInValid = true;
            }
        };
    };
    self.unbindFloatingIp = function(editData) {
        var scope = $rootScope.$new();
        var scope = $scope;
        var modal_os_ip = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: "relieve-os-FloatingIp.html",
            scope: scope
        });
        scope.floatingIp = {};
        instancesSrv.getAllfloalingIp().then(function(result) {
            if (result && result.data&& result.data.length) {
              scope.floatingIp = result.data.filter(item => item.portId == editData.vip_port_id)[0];
            }
        })
        scope.confirm = function(floatForm) {
            if (floatForm.$valid) {
                modal_os_ip.close();
                var postData = {
                    floatingip_id: scope.floatingIp.id
                };
                instancesSrv.relieve_floatingip(postData).then(function() {
                  self.checkboxes ={};
                  self.initTable();
                });
            } else {
                scope.submitInValid = true;
            }
        };
    };

}])

balanceModule.controller("balanceDetailCtrl",["$scope","NgTableParams","$uibModal","checkedSrv","balanceDataSrv","$location","GLOBAL_CONFIG","$translate","$routeParams",function($scope,NgTableParams,$uibModal,checkedSrv,balanceSrv,$location,GLOBAL_CONFIG,$translate,$routeParams){
    var self = $scope;
    self.dataRealdy = true ;
    self.isDisabled = true;
    self.delisDisabled = true;
    self.DebalanceId = $location.path().split("/")[3];
    self.search = {};
    if($location.search().active){
      self.detailActive=Number($location.search().active);
    }else{
      self.detailActive=0;
    }
    
    //获取负载均衡详情
    self.getBalancersDetail = function(){
      self.titleFlag=false
      balanceSrv.getBalancersDetail(self.DebalanceId).then(function(result) {
          if(result && result.data){
              self.detailData = result.data;
              self.listeners=result.data.listeners;
              self.titleFlag=true
          }else{
              self.detailData=[];
              self.listeners=[];
          }
          //从资源详情页返回的时候页面显示资源列表
          if($routeParams.active == 2){
            self.getPools();
          }
      });
    }
    self.getBalancersDetail();
    function operateData(data,arry) {
        _.forEach(data, function(item) {
            item.searchTerm = [];
            arry.map(arr => {
              item.searchTerm.push(item[arr])
            })
        });
        return data;
    }
    
  
    //获取Listeners列表
    self.getListeners = function(){
    	self.dataRealdy = true ;
    	self.isDisabled = true;
    	self.delisDisabled = true;
      if(self.titleFlag){
      var loadbalancer = self.detailData;
      self.listenertabledata = "";
      self.tableName = "tableParamsListeners";
        self.tableParamsListeners = new NgTableParams({ count:GLOBAL_CONFIG.PAGESIZE }, { counts: [], dataset: [] });
      balanceSrv.getListeners(loadbalancer.id).then(function(res){
        if(res&&res.data){
          var tableId = "id";
          self.dataRealdy = false;
          self.listenertabledata = operateData(res.data,["name","description","protocol","protocol_port"]);
            self.tableParamsListeners = new NgTableParams({ count: GLOBAL_CONFIG.PAGESIZE }, { counts: [], dataset: self.listenertabledata });
          checkedSrv.checkDo(self,self.listenertabledata,tableId,"tableParamsListeners");
          balanceSrv.listenerList = res.data;
        }
      });
      balanceSrv.getPools(loadbalancer.id).then(function(poolsRes){
        if(poolsRes && poolsRes.data){
          balanceSrv.lbResPoolData = poolsRes.data;
        }
      })
    }
    }
    self.$watch(function(){
      if(self.tableName == "tableParamsListeners" && self.tableParamsListeners){
        return self.tableParamsListeners.checkedItems;
      }
    },function(checkedItems){
      self.disabledDelListenerBtn = false;
      self.delListenerTip = "";
      if(checkedItems && checkedItems.length >0){
        _.each(balanceSrv.lbResPoolData,item =>{
          if(item.listeners && item.listeners.length >0){
            _.each(item.listeners,listenerItem =>{
              for(let i=0;i<checkedItems.length;i++){
                if(listenerItem.id == checkedItems[i].id){
                  self.delListenerTip = $translate.instant("aws.loadbalancers.ls.delListenerTip"); //"已被资源池绑定的监听器不能删除"
                  self.disabledDelListenerBtn = true;
                  break;
                }
              }
            })
          }
        })
      }
    });
    self.applyGlobalSearch = function(tablename) {
        var term = self.search.globalSearchTerm;
        self[tablename].filter({ searchTerm: term });
    };

    //创建、编辑Listener
    self.createListener = function(type){
      var $modalInstance = $uibModal.open({
        animation: self.animationsEnabled,
        backdrop:'static',
        templateUrl: 'newListener.html',
        scope:$scope
      });
      self.submitInValid = false;
      switch(type){
        case "new":
          self.listener = {
            title :"newListener",
            isEdit:false,
            protocol:[{name:"HTTP"},{name:"HTTPS"},{name:"TCP"}],
            admin_state_up:true,
            selectedId:{name:"HTTP"},
            connection_limit:-1
          };
          self.confirm = function(listenerForm){
            if (listenerForm.$valid) {
              var postData = {
                id:self.detailData.id,
                name:self.listener.name,
                description:self.listener.description,
                protocol:self.listener.selectedId.name,
                protocolPort:self.listener.protocol_port,
                adminStateUp: true,
                defaultPoolId:"",
                connectionLimit:self.listener.connection_limit
              }
              balanceSrv.createListeners(postData).then(function(){
                self.getListeners()
              })
              $modalInstance.close();
            }else{
              self.submitInValid = true;
            }

          }
          break;
        case "edit":
          self.listener = self.editData;
          self.listener.title = "editListener";
          self.listener.isEdit = true;
          self.listener.selectedId = {name:self.editData.protocol};
          self.listener.admin_state_up=self.editData.admin_state_up;
          self.confirm = function(listenerForm){
            if(listenerForm.$valid){
              var postData = {
                id:self.listener.id,
                name:self.listener.name,
                description:self.listener.description,
                adminStateUp:true,
                connectionLimit:self.listener.connection_limit
              }
              balanceSrv.editListeners(self.detailData.id,postData).then(function(){
                self.getListeners()
              })
              $modalInstance.close();
            }else{
              self.submitInValid = true;
            }
          }
          break;
      }
    }

    //删除Listeners
    self.deleteListener = function(checkedItems){
        var content ={
          target:"deleteListener",
          msg:"<span>"+$translate.instant("aws.loadbalancers.ls.lsDelMsg")+"</span>",
          data:checkedItems
        };
        self.$emit("delete",content);
    };
    self.$on("deleteListener",function(e,data){
        if (data&&data.length > 0) {
            //获取删除的卷id数组
            var balancers_ids=[];
            _.forEach(data,function(item){
                balancers_ids.push(item.id);
            });
            var delParams = {
                ids: balancers_ids
            };
            balanceSrv.deleteListener(self.detailData.id,delParams).then(function(){
                self.getListeners()
            });
        }
    });

    //详情Listeners
    self.$on("getDetail", function(event, value) {
        balanceSrv.getListenersDetail(self.DebalanceId,value).then(function(result) {
          if(result && result.data){
              self.detailListeners = result.data;
          }
        });
    });
  
    //获取Pools列表
    self.getPools = function(){
    	self.isDisabled = true;
    	self.delisDisabled = true;
      if(self.titleFlag){
        var loadbalancer = self.detailData;
        self.pooltabledata = "";
        self.tableName = "tableParamsPool";     
        self.tableParamsPool = new NgTableParams({ count:GLOBAL_CONFIG.PAGESIZE }, { counts: [], dataset: [] });
        
        var initPoolstableFunc = function(poolsResData){
          self.pooltabledata = operateData(poolsResData,["name","description"]);;      
            self.tableParamsPool = new NgTableParams({ count:GLOBAL_CONFIG.PAGESIZE }, { counts: [], dataset:poolsResData });        
          checkedSrv.checkDo(self, poolsResData ,"id","tableParamsPool");
        };

        balanceSrv.getPools(loadbalancer.id).then(function(poolsRes){
          if(poolsRes && poolsRes.data){
            let poolsResData = poolsRes.data;
            initPoolstableFunc(poolsResData);
          }
        })
      }  
    }

    //创建pools
    self.creatPools = function(type){
      var $modalInstance = $uibModal.open({
        animation: self.animationsEnabled,
        backdrop:'static',
        templateUrl: 'newPool.html',
        scope:$scope
      });
      self.lbAlgorithm = [
        {id:"ROUND_ROBIN",name:$translate.instant("aws.loadbalancers.lbAlgorithm.ROUND_ROBIN")}, 
        {id:"LEAST_CONNECTIONS",name:$translate.instant("aws.loadbalancers.lbAlgorithm.LEAST_CONNECTIONS")}, 
        {id:"SOURCE_IP",name:$translate.instant("aws.loadbalancers.lbAlgorithm.SOURCE_IP")}
      ];
      self.lbAlgorithm.selectedId = self.lbAlgorithm[0];
      self.protocol = [{name:"HTTP"}, {name:"HTTPS"}, {name:"TCP"}];
      self.protocol.selectedId =  self.protocol[0];
      self.listenerData = {};
      self.submitInValid = false;
      switch(type){
        case "new":
          balanceSrv.getListeners(self.detailData.id).then(function(res){
            if(res.status == 0){
              self.listenersData = res.data.filter(item => !item.default_pool_id);
              if(self.listenersData.length){
                self.listenerData.selectedId = self.listenersData[0];
              }
            }
            
          })
          self.pool = {};
          self.pool.isEdit = false;
          self.pool.title = "newPool";
          self.pool.admin_state_up = true;
          self.confirmPool= function(poolForm){
            if (poolForm.$valid){
              var postData = {
                id:self.detailData.id,
                name:self.pool.name,
                description:self.pool.description,
                lbAlgorithm:self.lbAlgorithm.selectedId.id,
                protocol:self.listenerData.selectedId.protocol,
                listenerId:self.listenerData.selectedId.id,
                adminStateUp:true
              }
              balanceSrv.createPools(postData).then(function(){
                self.getPools()
              })
              $modalInstance.close();
            }else{
              self.submitInValid = true;
            }
          }
          break;
        case "edit":
          self.pool = self.editData;
          self.pool.title = "editPool";
          self.pool.isEdit = true;
          self.lbAlgorithm.selectedId = self.lbAlgorithm.filter(item => item.id == self.editData.lb_algorithm)[0];
          self.protocol.selectedId = {name:self.editData.protocol};
          self.pool.admin_state_up = self.editData.admin_state_up;
          balanceSrv.getListeners(self.detailData.id).then(function(res){
            if(res.status == 0){
              self.listenersData = res.data.filter(item => item.default_pool_id==self.editData.id);
              if(self.listenersData.length){
                self.listenerData.selectedId = self.listenersData[0];
              }
            }
          })
          self.confirmPool = function(poolForm){
            if(poolForm.$valid){
              var postData = {
                id:self.pool.id,
                name:self.pool.name,
                description:self.pool.description,
                lbAlgorithm:self.lbAlgorithm.selectedId.id,
                admin_state_up:self.pool.admin_state_up
              }
              $modalInstance.close();
              balanceSrv.editPools(self.detailData.id,postData).then(function(){
                self.getPools()
              })
            }else{
              self.submitInValid = true;
            }
          }
          break;
      }

      //关闭
      self.cancel = function () {
        $modalInstance.close();
      };
    }

    //删除pool
    self.deletePools = function(checkedItems){
        var content ={
          target:"deletePools",
          msg:"<span>"+$translate.instant("aws.loadbalancers.pl.plDelMsg")+"</span>",
          data:checkedItems
        };
        self.$emit("delete",content);
    };
    self.$on("deletePools",function(e,data){
        if (data&&data.length > 0) {
            //获取删除的卷id数组
            var balancers_ids=[];
            _.forEach(data,function(item){
                balancers_ids.push(item.id);
            });
            var delParams = {
                ids: balancers_ids
            };
            balanceSrv.deletePools(self.detailData.id,delParams).then(function(){
                self.getPools()
            });
        }
    });


   
}])

balanceModule.controller("poolsDetailCtrl",["$scope","NgTableParams","$uibModal","checkedSrv","balanceDataSrv","$location","GLOBAL_CONFIG","$translate",function($scope,NgTableParams,$uibModal,checkedSrv,balanceSrv,$location,GLOBAL_CONFIG, $translate){
    var self = $scope;
    self.isDisabled = true;
    self.delisDisabled = true;
    self.loadbalancerId = $location.path().split("/")[3];
    self.poolId = $location.path().split("/")[4];
    self.search = {};

    //获取子网
    self.getsubnets =function(){
        balanceSrv.getsubnets().then(function(result){
            if(result && result.data){
              //result.data = result.data.filter(item => item.name != "external_subnet");
              result.data.map(obj => {obj.name = obj.name +"--" + obj.cidr})
            };
            self.member.subnet=result.data;
            self.member.selectedId = result.data[0];
        })
    }

    //获取pool详情
    self.getPoolsDetail = function(){
        balanceSrv.getPoolsDetail(self.loadbalancerId,self.poolId).then(function(result) {
            if(result && result.data){
                self.detailData = result.data;
                self.pools = result.data.pools;
            }
        });
    }
    self.getPoolsDetail();

    function operateData(data) {
        _.forEach(data, function(item) {
            item.searchTerm = [item.name,item.address,item.protocol_port,item.weight].join(" ");
        });
        return data;
    }

    //获取成员列表
    self.getMembers = function(){
      self.membsertabledata = "";
      
        self.tableParamsMember = new NgTableParams({ count: GLOBAL_CONFIG.PAGESIZE }, { counts: [], dataset: [] });
      
      balanceSrv.getMembers(self.loadbalancerId,self.poolId).then(function(res){
        if(res&&res.data){
          var tableId = "id";
          self.membsertabledata = operateData(res.data);
        
            self.tableParamsMember = new NgTableParams({ count: GLOBAL_CONFIG.PAGESIZE }, { counts: [], dataset: self.membsertabledata });
          
          checkedSrv.checkDo(self,self.membsertabledata,tableId,"tableParamsMember");
        }
      })
    }
    self.applyGlobalSearch = function() {
        var term = self.search.globalSearchTerm;
        self.tableParamsMember.filter({ searchTerm: term });
    };

    //创建成员
    self.createMembers = function(type){
        var $modalInstance = $uibModal.open({
          animation: self.animationsEnabled,
          backdrop:'static',
          templateUrl: 'newMember.html',
          scope:$scope
        });
        self.submitInValid = false;
        switch (type) {
          case "new":
            self.ipStart = false;
            self.ipEnd = false;
            self.member = {}
            self.getsubnets();
            self.member.title = "newMember";
            self.member.admin_state_up = true;
            self.DebalanceId = $location.path().split("/")[3];
            balanceSrv.getBalancersDetail(self.DebalanceId).then(function(result) {
                if(result && result.data){
                    self.subnetId = result.data.vip_subnet_id
                }
            }).then(function(){
                balanceSrv.getsubnets().then(function(res){
                  if(res&&res.data){
                      var dataSubnet = res.data.filter(item => item.id == self.subnetId);
                      self.ipStart = _IP.toLong(dataSubnet[0].allocationPools[0].start);
                      self.ipEnd = _IP.toLong(dataSubnet[0].allocationPools[0].end);
                      //console.log(dataSubnet[0].allocationPools[0].start)
                  }
                })
            });
            $scope.$watch(function(){
              return self.member.address;
            },function(val){
              self.Ipcheck=false; 
              if(val!=undefined){
                var ip = _IP.toLong(val);
                if(ip>=self.ipStart && ip<=self.ipEnd){
                  self.Ipcheck=false;
                  self.submitInValid = false;
                }else{
                  self.Ipcheck=true;
                }
              }
            })

            self.confirmMember = function(memberForm){
              if(memberForm.$valid&&!self.Ipcheck){
                self.submitInValid = false;
                var postData = {
                  id:self.poolId,
                  name:self.member.name,
                  subnetId: self.member.selectedId.id,
                  address: self.member.address,
                  protocolPort: self.member.protocol_port,
                  weight: Number(self.member.weight),
                  adminStateUp:true
                }
                balanceSrv.createMembers(self.loadbalancerId,postData).then(function(){
                  self.getMembers()
                })
                $modalInstance.close();
              }else{
                self.submitInValid = true;
              }
            }
            break;
          case "edit":
            self.member = self.editData;
            self.member.title = "editMember";
            self.member.isEdit = true;
            self.confirmMember = function(memberForm){
              if(memberForm.$valid){
                var postData = {
                  id:self.editData.id,
                  name:self.member.name,
                  weight: self.member.weight,
                  adminStateUp:true
                }
                $modalInstance.close();
                balanceSrv.editMembers(self.loadbalancerId,self.poolId,postData).then(function(){
                  self.getMembers()
                })
              }else{
                self.submitInValid = true;
              }
            }
            break;
        }
        //关闭
        self.cancel = function () {
          $modalInstance.close();
        };
    }

    //删除成员
    self.deleteMembers = function(checkedItems){
        var content ={
          target:"deleteMembers",
          msg:"<span>"+$translate.instant("aws.loadbalancers.mb.mbDelMsg")+"</span>",
          data:checkedItems
        };
        self.$emit("delete",content);
    };
    self.$on("deleteMembers",function(e,data){
        if (data&&data.length > 0) {
          //获取删除的卷id数组
          var balancers_ids=[];
          _.forEach(data,function(item){
              balancers_ids.push(item.id);
          });
          var delParams = {
              ids: balancers_ids
          };
          balanceSrv.deleteMembers(self.loadbalancerId,self.poolId,delParams).then(function(){
              self.getMembers();
          });
        }
    });

    //成员详情
    self.$on("getMemberDetail", function(event, value) {
      if(self.detailvalue != value){
        self.detailvalue = value;
        balanceSrv.getMembersDetail(self.loadbalancerId,self.poolId,value).then(function(result) {
          if(result && result.data){
              self.detailMembers = result.data;
              self.detailvalue = "" ;
          }
        });
      }
    });

    //获取监控器
    self.getHealthMonitors = function(){
      self.healthmonitorData="";
     
        self.tableParams = new NgTableParams({ count: GLOBAL_CONFIG.PAGESIZE }, { counts: [], dataset: [] });
         
      balanceSrv.getHealthMonitors().then(function(result){
        if(result && result.data){
          self.healthmonitorData = result.data.filter(item => {
            if(item.pools && item.pools[0]){
              return item.pools[0].id == self.poolId
            }
          })
          successFunc(self.healthmonitorData);
        }
      })
    }
    function successFunc(data) {
        //初始化表格
        data.map(item => {
            item.searchTerm = [item.name,item.type,item.delay,item.timeout,item.max_retries].join(" ");
        });
        self.tabledata = data;
       
          self.tableParams = new NgTableParams({ count: GLOBAL_CONFIG.PAGESIZE }, { counts: [], dataset: self.tabledata});
        
        checkedSrv.checkDo(self, self.tabledata, "id");
    }
    //详情
    $scope.$on("getMonitorDetail", function(event, value) {
      if(self.detailvalue != value){
        balanceSrv.HealthMonitorsDetail(value).then(function(data) {
          if(data){
              self.detailData = data.data;
              self.detailvalue = "" ;
          }
        });
        self.detailvalue = value;
      }
      
    });
    //新建和编辑
    self.newMonitor = function(type){
          self.submitInValid = false;
          var new_monitor_modal = $uibModal.open({
                  animation: $scope.animationsEnabled,
                  templateUrl: "new-monitor.html",
                  scope: self
              }
            );
            self.typeList = ["PING","HTTP","HTTPS","TCP"],
            self.new ={
              adminStateUp:true,
              httpMethod:"GET",
              urlPath:"/",
              expectedCodes:"200"
            };
            switch (type){
              case "new":
                self.new.type="PING";
                self.new.title="newtitle";
                self.newconfirm = function(form){
                  var postData = self.new;
                  postData.poolId =  self.poolId;
                  if(form.$valid){
                    balanceSrv.newHealthMonitors(postData).then(function(){
                      self.getHealthMonitors()
                    })
                    new_monitor_modal.close()
                  }else{
                    self.submitInValid = true;
                  }
                };
              break;
              case "edit":
                self.isEdit = true;
                self.new.title="edittitle";
                self.new.name = self.editData.name; 
                self.new.type = self.editData.type; 
                self.new.delay = self.editData.delay; 
                self.new.timeout = self.editData.timeout; 
                self.new.maxRetries = self.editData.max_retries; 
                self.new.urlPath = self.editData.url_path; 
                self.new.expectedCodes = self.editData.expected_codes; 
                self.newconfirm = function(form){
                  var postData = self.new;
                  postData.poolId =  self.poolId;
                  if(form.$valid){
                    balanceSrv.editHealthMonitors(postData,self.editData.id).then(function(){
                      self.getHealthMonitors();
                    })
                    new_monitor_modal.close()
                  }else{
                    self.submitInValid = true;
                  }
                };
            }  
    };
    //删除
    self.delMonitors = function() {
            var content = {
                target: "delMonitors",
                msg:"<span>"+ $translate.instant("aws.h_monitor.mnDelMsg") + "</span>"
            };
            self.$emit("delete", content);
    };
    self.$on("delMonitors", function() {
            var del_ids = [];
            self.checkedItems.map(item => {del_ids.push(item.id);});
            balanceSrv.delHealthMonitors({ids:del_ids}).then(function() {
                self.getHealthMonitors();
            });
    });

}])
balanceModule.directive("checkport",["balanceDataSrv",function(balanceDataSrv){
    return {
        restrict:"A",
        require:"ngModel",
        link:function(scope,elem,attrs,ngModel){
            function vaild(viewValue){
               let port = viewValue ;
               let listenerList = balanceDataSrv.listenerList;
               let flag = true;
               listenerList.map(function(item){
               		if(port == item.protocol_port){
               				flag =  false ;
               		}
               })
       				ngModel.$setValidity("checkport",flag);
       				 return viewValue;
            }
            
            ngModel.$parsers.push(vaild);

        }
    };
}]);