import "./networksManageSrv";
angular.module("networksManageMoudle", ["ngSanitize", "ngRoute", "ngTable", "ngAnimate", "ngMessages", "ui.bootstrap", "ui.select","networksManageSrvModule"])
    .controller("networksManageCtrl", function ($http,$scope, $rootScope, $uibModal,$translate, $routeParams, NgTableParams, checkedSrv,GLOBAL_CONFIG,networksManageSrv) {
    	var self = $scope;
    	self.netInUse=$translate.instant("aws.system.networksManage.netInUse");
        self.noAvailableNet=$translate.instant("aws.system.networksManage.noAvailableNet");
    	//云主机外部物理网络相关逻辑
    	self.manageData={
            //已分配的租户物理网络
            assignTenantNetList:[],
    		availableTenantNets:[],
            tenantNetsModel:[],          
            addTenantNetList:[],

            //已分配的外部物理网络
    		assignExternalNets:[],
    		//select下拉框
    		availableExternalNets:[],
    		//双向绑定数组
    		externalNetsModel:[],
            //添加的显示列表
            addExternalNetList:[],

            //所有下拉列表的数据
            availablePhysicalNetList:[],
    	};

    	function operateData(data){
            data.map(function(item){
                 if(item.networkType=='FLAT'){
                    item.showName=item.networkName;
                 }else if(item.networkType=='VLAN'){
                 	let index=item.networkName.lastIndexOf(":");
                 	item.showName=item.networkName.slice(0,index)+"-"+item.networkName.slice(index+1);
                 }
     		});
     		return data;
    	}

        function operateTanentData(data){
            var tenantData=[];
            data.map(function(item){
                 if(item.networkType=='FLAT'){
                    item.showName=item.networkName;
                 }else if(item.networkType=='VLAN'){
                    let index=item.networkName.lastIndexOf(":");
                    item.showName=item.networkName.slice(0,index)+"-"+item.networkName.slice(index+1);
                    tenantData.push(item);
                 }
            });
            return tenantData;
        }

        //租户物理网络
        function getTenanetNetList(){
            networksManageSrv.getTenantPhyNetList(localStorage.regionKey,localStorage.enterpriseUid).then(function(res){
                if(res&&res.data){
                    self.tenantData=res.data;
                    self.manageData.assignTenantNetList=operateData(res.data);
                }
            });
        }
        //获取网络类型
        networksManageSrv.getVlanType(localStorage.regionKey,localStorage.enterpriseUid).then(function(res){
            if(res&&res.data){
               self.vlanType=res.data.type;
               if(self.vlanType=='vlan'){
                  getTenanetNetList();
               }
            }
       });
        
        //外部物理网络
        function getExternalPhyNetList(){
             networksManageSrv.getExternalPhyNetList(localStorage.regionKey,localStorage.enterpriseUid).then(function(res){
               if(res&&res.data){
                self.externaldata=res.data;
                self.manageData.assignExternalNets=operateData(res.data);
               }
             });
        }
        getExternalPhyNetList();

        //可添加的下拉列表
        function getUnassignedNetList(){
             networksManageSrv.getUnassignedNetList(localStorage.regionKey,localStorage.enterpriseUid).then(function(res){
                 if(res&&res.data){
                   self.availablePhysicalNetList=operateData(res.data);
                   self.manageData.availableTenantNets["options_"+self.manageData.addTenantNetList.length]=operateTanentData(self.availablePhysicalNetList);
                   self.manageData.availableExternalNets["options_"+self.manageData.addExternalNetList.length]=operateData(self.availablePhysicalNetList);
                 }

            });
         }
        getUnassignedNetList();
        
        function operateSelectData(array1,array2){
        	var result=[];
        	for(var i = 0; i < array2.length; i++){
			    var obj = array2[i];
			    var networkName = obj.networkName;
			    var isExist = false;
			    for(var j =0 ; j < array1.length; j++){
			        var aj = array1[j];
			        if(aj){
                        var name = aj.networkName;
				        if(name == networkName){
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

        function operateTenantSelectData(array1,array2){
            var result=[];
            for(var i = 0; i < array2.length; i++){
                var obj = array2[i];
                var networkName = obj.networkName;
                var isExist = false;
                for(var j =0 ; j < array1.length; j++){
                    var aj = array1[j];
                    if(aj){
                        var name = aj.networkName;
                        if(name == networkName){
                            isExist = true;
                            break;
                        }
                    }
                }
                if(!isExist&&obj.networkType!='FLAT'){
                    result.push(obj);
                }
            }
            return result;
        }

        self.addTenantNet=function(addExternalNetList,addTenantNetList){
            if(self.manageData.availableTenantNets['options_'+addTenantNetList.length].length!=0){
                //处理下拉框的数据
                addTenantNetList.push({});
                self.manageData.availableTenantNets["options_"+(addTenantNetList.length-1)]=operateTenantSelectData(self.manageData.tenantNetsModel.concat(self.manageData.externalNetsModel),self.availablePhysicalNetList); 
                self.manageData.tenantNetsModel[addTenantNetList.length-1]=self.manageData.availableTenantNets["options_"+(addTenantNetList.length-1)][0];
                self.manageData.availableTenantNets["options_"+addTenantNetList.length]=operateTenantSelectData(self.manageData.tenantNetsModel.concat(self.manageData.externalNetsModel),self.availablePhysicalNetList);
                self.manageData.availableExternalNets["options_"+addExternalNetList.length]=operateSelectData(self.manageData.tenantNetsModel.concat(self.manageData.externalNetsModel),self.availablePhysicalNetList);
            }
            
        };

        self.addExternalNet=function(addExternalNetList,addTenantNetList){
            if(self.manageData.availableExternalNets['options_'+addExternalNetList.length].length!=0){
                //处理下拉框的数据
                addExternalNetList.push({});
                self.manageData.availableExternalNets["options_"+(addExternalNetList.length-1)]=operateSelectData(self.manageData.tenantNetsModel.concat(self.manageData.externalNetsModel),self.availablePhysicalNetList); 
                self.manageData.externalNetsModel[addExternalNetList.length-1]=self.manageData.availableExternalNets["options_"+(addExternalNetList.length-1)][0];
                self.manageData.availableTenantNets["options_"+addTenantNetList.length]=operateTenantSelectData(self.manageData.tenantNetsModel.concat(self.manageData.externalNetsModel),self.availablePhysicalNetList);
                self.manageData.availableExternalNets["options_"+addExternalNetList.length]=operateSelectData(self.manageData.tenantNetsModel.concat(self.manageData.externalNetsModel),self.availablePhysicalNetList);
            }
        	
        };

        self.click=function(index,selectedPhyNet,type){
            var existedAddNet=self.manageData.tenantNetsModel.concat(self.manageData.externalNetsModel);
            var result=[];
            for(var i = 0; i < self.availablePhysicalNetList.length; i++){
                var obj = self.availablePhysicalNetList[i];
                var networkName = obj.networkName;
                var isExist = false;
                for(var j = 0; j < existedAddNet.length; j++){
                    var aj = existedAddNet[j];
                    if(aj){
                        var name = aj.networkName;
                        if(name == networkName&&selectedPhyNet.networkName!=name){
                            isExist = true;
                            break;
                        }
                    }
                }
                if(!isExist){
                    result.push(obj);
                }
            }
            self.manageData.availableExternalNets["options_"+index]=result;
            
        };

        self.tanentClick=function(index,selectedPhyNet,type){
            var existedAddNet=self.manageData.tenantNetsModel.concat(self.manageData.externalNetsModel);
            var result=[];
            for(var i = 0; i < self.availablePhysicalNetList.length; i++){
                var obj = self.availablePhysicalNetList[i];
                var networkName = obj.networkName;
                var isExist = false;
                for(var j = 0; j < existedAddNet.length; j++){
                    var aj = existedAddNet[j];
                    if(aj){
                        var name = aj.networkName;
                        if(name == networkName&&selectedPhyNet.networkName!=name){
                            isExist = true;
                            break;
                        }
                    }
                }
                if(!isExist&&obj.networkType!='FLAT'){
                    result.push(obj);
                }
            }
            self.manageData.availableTenantNets["options_"+index]=result; 
        };


        
        self.delAssignNet=function(assignNetList,index,assignNet){
            //不在使用中才可删除
            if (assignNet.usable!=1) {
                assignNetList.splice(index,1);
            }
        };

        self.delAddNet=function(addTenantNetList,addExternalNetList,index,type){
            if(type=='tenant'){
               addTenantNetList.splice(index,1);
               self.manageData.tenantNetsModel.splice(index,1);
            }else if(type=='external'){
               addExternalNetList.splice(index,1);
               self.manageData.externalNetsModel.splice(index,1);
            }
            self.manageData.availableTenantNets["options_"+addTenantNetList.length]=operateTenantSelectData(self.manageData.tenantNetsModel.concat(self.manageData.externalNetsModel),self.availablePhysicalNetList);
            self.manageData.availableExternalNets["options_"+addExternalNetList.length]=operateSelectData(self.manageData.tenantNetsModel.concat(self.manageData.externalNetsModel),self.availablePhysicalNetList);
        };

        self.saveNetworksManage=function(){
        	self.submitInValid=false;
        	if(self.networksManageForm.$valid){
        	   var externalPhyNet=[];
               var tenantPhyNet=[];   
        	   self.manageData.assignTenantNetList.forEach(function(item){
                   tenantPhyNet.push(item.networkName);
               });
               self.manageData.tenantNetsModel.forEach(function(item){
                   tenantPhyNet.push(item.networkName);
               });
               self.manageData.assignExternalNets.forEach(function(item){
                   externalPhyNet.push(item.networkName);
               });
               self.manageData.externalNetsModel.forEach(function(item){
                   externalPhyNet.push(item.networkName);
               });
               var params={
                   "external":externalPhyNet,
                   "tenant":tenantPhyNet
               };
               networksManageSrv.updatePhyNetList(localStorage.regionKey,localStorage.enterpriseUid,params).then(function(res){
                   //刷新
                   self.manageData={
                        //已分配的租户物理网络
                        assignTenantNetList:[],
                        availableTenantNets:[],
                        tenantNetsModel:[],          
                        addTenantNetList:[],
                        //已分配的外部物理网络
                        assignExternalNets:[],
                        availableExternalNets:[],
                        externalNetsModel:[],
                        addExternalNetList:[],
                        //下拉列表
                        availablePhysicalNetList:[],
                   };
                   self.manageData.externalNetsModel=[];
                   self.manageData.addExternalNetList=[];
                   self.manageData.assignExternalNets=[];
                   self.manageData.tenantNetsModel=[];
                   self.manageData.addTenantNetList=[];
                   self.manageData.assignTenantNetList=[];
                   getExternalPhyNetList();
                   if(self.vlanType=='vlan'){
                      getTenanetNetList();
                   }
                   self.tenantData=false;
                   self.externaldata=false;
                   getUnassignedNetList();
               });
        	}else{
               self.submitInValid=true;
        	}

        };    
    });
    
