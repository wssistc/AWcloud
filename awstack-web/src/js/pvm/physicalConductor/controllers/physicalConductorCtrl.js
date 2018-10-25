import * as physicalConductorSrv from "../services/"


function physicalConductorCtrl($scope,$rootScope,$location,checkedSrv,physicalConductorSrv,NgTableParams,$uibModal,$translate,$window,$timeout){
    var self=$scope;
    self.showalerttip = true;
    self.showNewTitle=true;
    self.getLeftListData=function(num){
        if(num==1){
            self.showNewTitle=true
        }else{
            self.showNewTitle=false
        }
    }
    function editSearch(item){
		item.ipmi_address = item.driverInfo.ipmi_address;
		item.powerStatusCopy = $translate.instant("aws.pvm.table.status." +item.powerState )
		item.provisionStateCopy = $translate.instant("aws.pvm.table.status.deploy." + item.provisionState )
		item.maintenanceCopy = $translate.instant("aws.pvm.table.status.maintenance." + item.maintenance )

		item.usedCopy = $translate.instant("aws.pvm.table.status.used." + Boolean(item.instanceUuid));
	
        item.init = "已完成";
        item.provisionStateCopy =  $translate.instant("aws.pvm.table.status.deploy." + item.provisionState);
        item.usedCopy = $translate.instant("aws.pvm.table.status.used.true");
		
		item.searchTerm = [item.name,item.ipmi_address,item.inspectionFinishedAt,item.powerStatusCopy,
			item.provisionStateCopy,item.maintenanceCopy,item.limitAttributeCopy,item.usedCopy,item.init].join("\b") ;
		return item;
	}
	//资源池物理机
	function editSearch_(item){
		item.ipmi_address = item.driverInfo.ipmi_address;
		item.powerStatusCopy = $translate.instant("aws.pvm.table.status." +item.powerState )
		item.provisionStateCopy = $translate.instant("aws.pvm.table.status.deploy." + item.provisionState )
		item.maintenanceCopy = $translate.instant("aws.pvm.table.status.maintenance." + item.maintenance )
		item.used = Boolean(item.instanceUuid);
		item.usedCopy = $translate.instant("aws.pvm.table.status.used." + Boolean(item.instanceUuid));
        if(item.inspectionFinishedAt){
            item.init = "已完成";
        }else if(item.inspectionStartedAt){
            item.init = "初始化中";
        }else{
            item.init = "未初始化";
        }
		item.searchTerm = [item.name,item.ipmi_address,item.inspectionFinishedAt,item.powerStatusCopy,
			item.provisionStateCopy,item.maintenanceCopy,item.limitAttributeCopy,item.usedCopy,item.init].join("\b") ;
		return item;
    }
	self.applyGlobalSearch = function () {
		var term = self.globalSearchTerm;
		self.tableParams.filter({
			searchTerm: term
		});
	};
    $scope.$on("gettrueDetail", function(event, value) {
        self.detailData = {};
        self.detailType = "ipmi"
        physicalConductorSrv.getPvmInfo(value).then(function(result) {
            if (result && result.data) {
				self.detailData = editSearch(result.data)
            }
		});
		
	});

	$scope.$on("getfalseDetail", function(event, value) {
		self.detailData = {};
		self.sysDiskList = [];
		self.detailType = "ironic"    
		self.sysDiskData={sysDisk : {}    }
		self.canAddDis = true;
		self.nodeUse = true;
		self.doubleClick = false;
		getDetail(value)
		function getDetail(value){
			physicalConductorSrv.IronicgetPvmInfo(value).then(function(result) {
				if (result && result.data) {
					self.detailData = editSearch_(result.data);
					if(self.detailData.properties.local_gb){
						var root_device_nm = self.detailData.properties.root_device?self.detailData.properties.root_device.wwn:"";
						self.btn_text = self.detailData.properties.root_device?"修改":"确定";
						self.nodeUse =  Boolean(self.detailData.instanceUuid);
						var root_disk = null ;
						physicalConductorSrv.getSysDiskList(value).then(function(data){
							if(data && data.data && data.data.inventory){
								self.sysDiskList = data.data.inventory.disks;
								self.sysDiskList.map(function(item){
									item.type_ = item.rotational?'sata':'ssd';
									item.showText = item.name+"："+item.type_+" 类型 | 大小："+parseInt(item.size/1024/1024/1024)+"GB";
									if(item.wwn == root_device_nm){
										root_disk = item;
									}
								})
								self.sysDiskData.sysDisk = root_disk?root_disk:self.sysDiskList[0];
								self.showAddSysDesk =true;
								self.canAddDis = false;
							}
						})
					}else{
						self.showAddSysDesk =false
					}
					
				}
			});
		}
       
		self.changeSysDisk = function(){
			var postData = {
				uuid:value,
				wwn:self.sysDiskData.sysDisk.wwn,
				ram:self.detailData.properties.memory_mb,
				cpus:self.detailData.properties.cpus,
				disk:self.sysDiskData.sysDisk.size
			}
			self.doubleClick = true;
			physicalConductorSrv.addSysDisk(postData).then(function(){
				self.doubleClick = false;
				getDetail(value);
			})
		}
	});
}   
function NanotubePhysicsMachineCtrl($scope,$rootScope,$location,checkedSrv,physicalConductorSrv,NgTableParams,$uibModal,$translate,$window,$timeout){
    var self=$scope;
    if(localStorage.installIronic==1){
        self.pluginSwitch=1;
    }else{
        self.pluginSwitch=2;
        return;
    }
    self.del_btn = true;

    //设置项的初始化
    self.titleName="ipmi";
    if(sessionStorage["ipmi"]){
        self.titleData=JSON.parse(sessionStorage["ipmi"]);
    }else{
        self.titleData=[
            {name:'pvm.name',value:true,disable:true},
            {name:'pvm.IPMI_add',value:true,disable:false},
            {name:'pvm.power_status',value:true,disable:false},
            {name:'pvm.register_time',value:true,disable:false},
        ];
    }

    self.$watch(function() {
        return self.checkedItems;
    }, function(value) {
        if(value){
            var activeChk = 0,stopChk = 0,errorChk = 0,openMainChk = 0,closeMainChk = 0,initProChk = 0 ,PowerStateNull = 0;
            self.boot_btn = true;
            self.shutoff_btn = true;
			self.reboot_btn = true;
			self.openMain_btn = true;
			self.closeMain_btn = true;
            self.initPro_btn = true;
            self.mixMain_btn = true;
            self.del_btn = true;
            value.map(function(item) {
                //故障状态的个数
                errorChk += (item.powerState === "Error") || 0;
                //开机状态的个数
                activeChk += (item.powerState === "power on") || 0;  
                //关机状态的个数
				stopChk += (item.powerState === "power off" ) || 0; 
				//开启维护状态个数
				openMainChk += (item.maintenance === true ) || 0;
				//关闭维护状态个数
				closeMainChk += (item.maintenance === false ) || 0;
				//初始化完成的个数
				initProChk += (Boolean(item.inspectionFinishedAt) || Boolean(!item.inspectionFinishedAt && !item.inspectionStartedAt) ) || 0;
            });
            var values = [activeChk, stopChk, errorChk];

            if(value.length > 0 ){
                self.del_btn = false
                if(!PowerStateNull){
                    //目前开关机不支持批量操作
                    if (values[0] == value.length) { 
                        //开机可操作
                        self.shutoff_btn = false;
                        self.reboot_btn = false;
                    } else if (values[1] == value.length) {
                        //关机允许的操作
                        self.boot_btn = false;
                    } else if (values[2] == value.length) {
                        //错误状态时允许操作
                        self.errorEnable = false; 
                    } 
                    if(openMainChk == value.length){
                        self.closeMain_btn = false;
                        self.openMaintenanceTip = $translate.instant('aws.pvm.tip.tip5');
                    }else if(closeMainChk == value.length){
                        self.openMain_btn = false;
                        self.closeMaintenanceTip = $translate.instant('aws.pvm.tip.tip6');
                    }else {
                        self.mixMain_btn = false;
                    }
                }else{
                    self.openMaintenanceTip = $translate.instant('aws.pvm.tip.tip15');
                    self.closeMaintenanceTip = $translate.instant('aws.pvm.tip.tip15');
                }
            }    
        }
    });
    self.canChoiceStatus = true

	//轮询物理机的状态
	$window.nodeInterFunc = function(ids){
        var flag=false;
        var timer = $timeout(function(){
            physicalConductorSrv.getIpmiList().then(function(result) {
                if(result && result.data && angular.isArray(result.data)){
                    //更新列表状态
                    var finishCount = ids.length;
                    _.forEach(result.data,function(obj){
                        _.forEach(ids,function(id){
                            if(obj.uuid == id){
                                _.forEach(self.tabledata,function(tdata){
                                    if(tdata.uuid == id){
										tdata.powerState = obj.powerState;
										tdata.targetPowerState = obj.targetPowerState;
										resetPowerState(tdata)
										editSearch(tdata)
									}	
								})
								//从manageable 到 available
								if(!obj.targetPowerState){
									finishCount = finishCount -1;
								}   
                            }
                        })
                    })
                    //停止轮询
                    if(finishCount == 0){
                        flag=true;
                    }
                }
            }).finally(function(){
                if(!flag){
                    $window.nodeInterFunc(ids);
                }else{
                    $timeout.canel(timer);
                }
            })
        },5000)
    }
    function editSearch(item){
        item.ipmi_address = item.driverInfo.ipmi_address;
        item.powerStatusCopy = $translate.instant("aws.pvm.table.status." +item.powerState )
		item.provisionStateCopy = $translate.instant("aws.pvm.table.status.deploy." + item.provisionState )
		item.maintenanceCopy = $translate.instant("aws.pvm.table.status.maintenance." + item.maintenance )

		item.usedCopy = $translate.instant("aws.pvm.table.status.used." + Boolean(item.instanceUuid));
	
        item.init = "已完成";
        item.provisionState ="active"
        item.provisionStateCopy =  $translate.instant("aws.pvm.table.status.deploy.active");
        item.usedCopy = $translate.instant("aws.pvm.table.status.used.true");
		item.searchTerm = [item.name,item.ipmi_address,item.powerStatusCopy, getTimeStyle(item.createdAt)].join("\b") ;
		return item;
    }
    
    function double(num){
        if (num<10){
            return "0"+num;   //如果时分秒少于10，则在前面加字符串0
        }
        else{
        return ""+num;        //否则，直接返回原有数字
        }
    }
    function getTimeStyle(date){
        var oDate = new Date(date),  
        oTime = oDate.getFullYear() +'-'+ double(oDate.getMonth() + 1) +'-'+ double(oDate.getDate()) +' '+ double(oDate.getHours()) +':'+ double(oDate.getMinutes()) +':'+double(oDate.getSeconds());//最后拼接时间  
        return oTime;  
    }
	self.applyGlobalSearch = function () {
		var term = self.globalSearchTerm;
		self.tableParams.filter({
			searchTerm: term
		});
    };
    
    // 状态查询
    self.statusList = [
        {name:"全部状态",status:"all"},
        {name:"开机",status:"powerOn"},
        {name:"关机",status:"powerOff"}
    ]

    self.statusFrom = {}
    
    self.choiceStatus = function(item){
        if(item.status=="all"||!item.status){
            self.tableParams = new NgTableParams({ count: 10 }, { counts: [], dataset: self.tabledata });
			checkedSrv.checkDo(self,self.tabledata,"uuid");
        }else if(item.status=="powerOn"){
            self.tableData = []
            self.tabledata.forEach(function(item){
                if(item.powerState=="power on"){
                    self.tableData.push(item)
                    self.tableParams = new NgTableParams({ count: 10 }, { counts: [], dataset: self.tableData });
                    checkedSrv.checkDo(self,self.tabledata,"uuid");
                }
            })
            if(self.tableData.length==0){
                self.tableParams = new NgTableParams({ count: 10 }, { counts: [], dataset: self.tableData });
                checkedSrv.checkDo(self,self.tabledata,"uuid");
            }
        }else if(item.status=="powerOff"){
            self.tableData = []
            self.tabledata.forEach(function(item){
                if(item.powerState=="power off"){
                    self.tableData.push(item)
                    self.tableParams = new NgTableParams({ count: 10 }, { counts: [], dataset: self.tableData });
                    checkedSrv.checkDo(self,self.tabledata,"uuid");
                }
            })
            if(self.tableData.length==0){
                self.tableParams = new NgTableParams({ count: 10 }, { counts: [], dataset: self.tableData });
                checkedSrv.checkDo(self,self.tabledata,"uuid");
            }
        }
    }
     // 电源状态
	function resetPowerState(tdata){
		if(tdata.targetPowerState == "power on" && tdata.powerState == "power off"){
			tdata.powerState = "powering on"
		}
		if(tdata.targetPowerState == "power off" && tdata.powerState == "power on"){
			tdata.powerState = "powering off"
		}
		if(tdata.targetPowerState == "power on" && tdata.powerState == "power on"){
			tdata.powerState = "rebooting"
		}
		return tdata
    }
    self.initTable =function(res){
		if(res && res.data){
            self.canChoiceStatus = false
            self.statusFrom.name = ""
			var inspectCount = [],targetCount = [];
			res.data.map(item => {
                editSearch(item)                
				resetPowerState(item)
				item.inspectionStartedAt?inspectCount.push(item.uuid):"";
				item.targetPowerState?targetCount.push(item.uuid):"";
            })

			self.tabledata = res.data;
            self.tableParams = new NgTableParams({ count: 10 }, { counts: [], dataset: self.tabledata });
			checkedSrv.checkDo(self,res,"uuid");
			if(targetCount.length){
				$window.nodeInterFunc(targetCount)
			}
			if(inspectCount.length){
				$window.nodeProvisionFunc(inspectCount)
			}
		}
    };
    self.getIpmiList = function(){
        self.tabledata = "";
		physicalConductorSrv.getIpmiList().then(function(res){
			self.initTable(res);
		});
    }
    self.getIpmiList();
    function powerStateFun(targetStatus){
		var nodes = {
			uuids:[],
			names:[],
			target:targetStatus
		};
		self.checkedItems.map(item => {
			nodes.uuids.push(item.uuid);
			nodes.names.push(item.name)
		})
		if(self.checkedItems[0].limitAttribute){
			physicalConductorSrv.powerState(nodes).then(function(){
				self.checkboxes.items = {};
				$window.nodeInterFunc(nodes.uuids)
			})
		}else{
			physicalConductorSrv.IronicPowerState(nodes).then(function(result) {
				self.checkboxes.items = {};
				$window.nodeInterFunc(nodes.uuids)
			});
		}
	}
    // 注册
    self.registerPvm = function(){
		var uibModalInstance =  $uibModal.open({
            animation: $scope.animationsEnabled,
			templateUrl: "js/pvm/physicalConductor/tmpl/register.html",
			controller: "registerPvmCtrl",
			resolve: {
                editData: function() {
                    return "limitPvm";
                },
            }
		});
    }
    // 批量注册
    self.batchRegister = function(){
		var uibModalInstance = $uibModal.open({
			animation: $scope.animationsEnabled,
			templateUrl: "js/pvm/physicalConductor/tmpl/batchRegister.html",
            controller: "batchRegisterCtrl",
            resolve: {
                editData: function() {
                    return "limitPvm";
                },
            }
		});
    }
    //删除
    self.deletePvm = function() {
		if(!self.del_btn){
			var content = {
				target: "deletePvm",
				msg: "<span>" + $translate.instant("aws.pvm.tipMsg.deleteServer") + "</span>",
			};
			self.$emit("delete", content);
		}
	};
	self.$on("deletePvm", function() {
		var nodes = {
			uuids:[],
			names:[],
		};
		self.checkedItems.map(item => {
			nodes.uuids.push(item.uuid);
			nodes.names.push(item.name)
		})
		if(self.checkedItems[0].limitAttribute){
			physicalConductorSrv.deletePvm(nodes).then(function(){
				self.checkboxes.items = {};
				self.getIpmiList();
			})
		}else{
			physicalConductorSrv.IronicDeletePvm(nodes).then(function(result) {
				self.checkboxes.items = {};
				self.getIpmiList();
			});
		}
	});
    //  编辑
    self.editPvm=function(){
		if(!self.isDisabled){
			$uibModal.open({
				animation: $scope.animationsEnabled,
				templateUrl: "js/pvm/physicalConductor/tmpl/register.html",
				controller: "registerPvmCtrl",
				resolve: {
					editData: function() {
						return self.editData;
					},
					
				}
			});
		}
    }
    //打开控制台
    self.openConsole = function (editData) {
        window.open("http://"+editData.ipmi_address, "", "height=1000,width=1100,top=20,left=20,toolbar=yes,resizable=yes,menubar=no,scroll");
    };

	//开启物理机
	self.bootPvm = function(target) {
		if(!self.boot_btn){
			var content = {
				target: "bootPvm",
				msg: "<span>" + $translate.instant("aws.pvm.tipMsg.bootServer") + "</span>",
				type: "info",
				btnType: "btn-primary",
				data:target
			};
			self.$emit("delete", content);
		}
	};
	self.$on("bootPvm", function(e,targetStatus) {
		targetStatus?powerStateFun(1):powerStateFun("power on")
	});

	//关闭物理机
	self.shutdownPvm = function(target) {
		if(!self.shutoff_btn){
			var content = {
				target: "shutdownPvm",
				msg: "<span>" + $translate.instant("aws.pvm.tipMsg.shutdownServer") + "</span>",
				type: "info",
				btnType: "btn-primary",
				data:target
			};
			self.$emit("delete", content);
		}
		
	};
	self.$on("shutdownPvm", function(e,targetStatus) {
		targetStatus?powerStateFun(0):powerStateFun("power off")
	});
	//重启物理机
	self.rebootPvm = function(target) {
		if(!self.shutoff_btn){
			var content = {
				target: "rebootPvm",
				msg: "<span>" + $translate.instant("aws.pvm.tipMsg.rebootServer") + "</span>",
				type: "info",
				btnType: "btn-primary",
				data:target
			};
			self.$emit("delete", content);
		}
	};
	self.$on("rebootPvm", function(e,targetStatus) {
		targetStatus?powerStateFun(3):powerStateFun("rebooting")
	});

    self.$on("refresh", function() {
		self.getIpmiList();
    });

    self.getMonitorClient = function(data) {
        let scope = self.$new();
        let clientModalInstance = $uibModal.open({
            animation: true,
            templateUrl: "monitorClientModal.html",
            scope: scope
        });
        scope.uid = data.uuid;
        scope.winSysVersionList = [
        	"Windows server 2008 64位",
            "Windows server 2012 64位"

        ];
        scope.linuxSysVersionList = [
            "Centos6.x 64位",
            "Centos7.x 64位",
			"Ubuntu14.04.x 64位"
        ];
        physicalConductorSrv.getInfluxdbip().then(function(res) {
            if (res && res.data) {
                scope.influxdbip = res.data;
            }
        });
        scope.regionKey = localStorage.regionKey;
        scope.hostIP = window.GLOBALCONFIG.APIHOST.BASE.split("//")[1].split("/")[0];

    };
}
function resourcePoolPhysicalMachineCtrl($scope,$rootScope,$location,checkedSrv,physicalConductorSrv,NgTableParams,$uibModal,$translate,$window,$timeout){
    var self=$scope;
    self.initPro_btn = true;
    // self.registerStetus_btn = true;
    self.del_btn = true;
    self.canChoiceStatus = true
	self.initProvisionstatesTip = $translate.instant('aws.pvm.placeholder.plsSelNode');
    if(localStorage.installIronic==1){
        self.pluginSwitch=1;
    }else{
        self.pluginSwitch=2;
        return;
    }
    //设置项的初始化
    self.titleName="ironic";
    if(sessionStorage["ironic"]){
        self.titleData=JSON.parse(sessionStorage["ironic"]);
    }else{
        self.titleData=[
            {name:'pvm.name',value:true,disable:true},
            {name:'pvm.IPMI_add',value:true,disable:false},
            {name:'pvm.init',value:true,disable:false},
            {name:'pvm.power_status',value:true,disable:false},
            {name:'pvm.deploy_status',value:true,disable:false},
            {name:'pvm.Maintain_status',value:true,disable:false},
            {name:'pvm.use_status',value:true,disable:false},
            {name:'pvm.canuse',value:true,disable:false},
         ];
    }

    self.$watch(function() {
        return self.checkedItems;
    }, function(value) {
        if(value){
            var activeChk = 0,stopChk = 0,errorChk = 0,openMainChk = 0,closeMainChk = 0,initProChk = 0 ,usedPhyMacChk = 0, initedPhyMacChk = 0 ,PowerStateNull = 0;
            self.boot_btn = true;
            self.shutoff_btn = true;
			self.reboot_btn = true;
            self.openMain_btn = true;
			self.closeMain_btn = true;
            self.mixMain_btn = true;
            self.initedPhyMacChk_btn = true;
            self.initPro_btn = true;
            // self.registerStetus_btn = true;
			self.del_btn = true;
			self.showBSR = false;
            
            value.map(function(item) {
                //故障状态的个数
                errorChk += (item.powerState === "Error") || 0;
                //开机状态的个数
                activeChk += (item.powerState === "power on") || 0;  
                //关机状态的个数
				stopChk += (item.powerState === "power off" ) || 0; 
				//开启维护状态个数
				openMainChk += (item.maintenance === true ) || 0;
				//关闭维护状态个数
				closeMainChk += (item.maintenance === false ) || 0;
				//初始化完成的个数(未初始化和已经初始化的物理机)
                initProChk += ( Boolean(!item.inspectionFinishedAt && !item.inspectionStartedAt) ) || 0;
                //初始化中的物理机个数
                initedPhyMacChk += Boolean(item.inspectionStartedAt && !item.inspectionFinishedAt)
                //已使用物理机个数
                usedPhyMacChk += (item.used === true )
                // 电源状态为null
                PowerStateNull  += (Boolean(!item.powerState))
            });
            var values = [activeChk, stopChk, errorChk];

            if(value.length > 0){
				if(value.length == 1){
					if(initedPhyMacChk == 0 && usedPhyMacChk == 0 && (
							(closeMainChk == 1 && 
								value[0].provisionState != "inspecting"
								&& value[0].provisionState != "deploying"
								&&value[0].provisionState != "wait call-back"
								&&value[0].provisionState != "building"
								&&value[0].provisionState != "deleting"
								&&value[0].provisionState != "initializing"
							)
						||openMainChk == 1
						)
					){
						self.del_btn = false;
					}else if(initedPhyMacChk != 0){
						self.deleteTip = $translate.instant('aws.pvm.tip.tip17')
					}else if(usedPhyMacChk != 0){
						self.deleteTip = $translate.instant('aws.pvm.tip.tip20')
					}else{
						self.deleteTip = $translate.instant('aws.pvm.tip.tip18')
					}
					
					if(openMainChk == 0){
						if(initProChk == value.length && usedPhyMacChk==0){
							self.initPro_btn = false;
						}else if( initProChk == value.length && usedPhyMacChk!=0){
							self.initProvisionstatesTip = $translate.instant('aws.pvm.tip.tip13');
						}else if(initProChk != value.length){
							self.initProvisionstatesTip = $translate.instant('aws.pvm.tip.tip9');
						}
					}else{
						self.initProvisionstatesTip = $translate.instant('aws.pvm.tip.tip5');
					}

					if(initedPhyMacChk == value.length){
						self.initedPhyMacChk_btn = false;
					}else{
						self.initedPhyMacChkTip = $translate.instant('aws.pvm.tip.tip16');
					}

					if(usedPhyMacChk == 0){
						self.showBSR = true;
					}
				}else{
					self.deleteTip = $translate.instant('aws.pvm.placeholder.plsSelNode')
				}

                if(!PowerStateNull){
					//目前开关机不支持批量操作
					if(value.length == 1 && initedPhyMacChk == 0){
						if (values[0] == value.length) { 
							//开机可操作
							self.shutoff_btn = false;
							self.reboot_btn = false;
							self.bootTip =  $translate.instant("aws.pvm.tip.tip1")
						} else if (values[1] == value.length) {
							//关机允许的操作
							self.boot_btn = false;
							self.shutoffTip = $translate.instant("aws.pvm.tip.tip2")
							self.rebootTip = $translate.instant("aws.pvm.tip.tip3")
						}
					}else{
						self.bootTip =  $translate.instant("aws.pvm.tip.tip17");
						self.shutoffTip = $translate.instant("aws.pvm.tip.tip17");
						self.rebootTip = $translate.instant("aws.pvm.tip.tip17");
					}
                    if (values[2] == value.length) {
                        //错误状态时允许操作
                        self.errorEnable = false; 
					} 
					if(initedPhyMacChk == 0){
						if(openMainChk == value.length){
							self.closeMain_btn = false;
							self.openMaintenanceTip = $translate.instant('aws.pvm.tip.tip5');
						}else if(closeMainChk == value.length){
							self.openMain_btn = false;
							self.closeMaintenanceTip = $translate.instant('aws.pvm.tip.tip6');
						}else {
							self.mixMain_btn = false;
						}
					}else{
						self.closeMaintenanceTip = $translate.instant('aws.pvm.tip.tip17');
						self.openMaintenanceTip = $translate.instant('aws.pvm.tip.tip17');
					}
                }else{
                    self.openMaintenanceTip = $translate.instant('aws.pvm.tip.tip15');
                    self.closeMaintenanceTip = $translate.instant('aws.pvm.tip.tip15');
                    self.initProvisionstatesTip = $translate.instant('aws.pvm.tip.tip15');
                    self.initedPhyMacChkTip = $translate.instant('aws.pvm.tip.tip16');
				}
				
            }           
        }
    });

    self.statusFrom = {}
    // 状态查询
    self.statusList = [
        {name:"全部状态",status:"all"},
        {name:"开机",status:"powerOn"},
        {name:"关机",status:"powerOff"},
        {name:"开启维护",status:"maintain"},
        {name:"关闭维护",status:"unMaintain"}
    ]

    self.getMonitorClient = function(data) {
        let scope = self.$new();
        let clientModalInstance = $uibModal.open({
            animation: true,
            templateUrl: "monitorClientModal.html",
            scope: scope
        });
        scope.uid = data.uuid;
        scope.winSysVersionList = [
        	"Windows server 2008 64位",
            "Windows server 2012 64位"

        ];
        scope.linuxSysVersionList = [
            "Centos6.x 64位",
            "Centos7.x 64位",
			"Ubuntu14.04.x 64位"
        ];
        physicalConductorSrv.getInfluxdbip().then(function(res) {
            if (res && res.data) {
                scope.influxdbip = res.data;
            }
        });
        scope.regionKey = localStorage.regionKey;
        scope.hostIP = window.GLOBALCONFIG.APIHOST.BASE.split("//")[1].split("/")[0];

    };

    self.choiceStatus = function(item){
        if(item.status=="all"||!item.status){
            self.tableParams = new NgTableParams({ count: 10 }, { counts: [], dataset: self.tabledata });
			checkedSrv.checkDo(self,self.tabledata,"uuid");
        }else if(item.status=="powerOn"){
            self.tableData = []
            self.tabledata.forEach(function(item){
                if(item.powerState=="power on"){
                    self.tableData.push(item)
                    self.tableParams = new NgTableParams({ count: 10 }, { counts: [], dataset: self.tableData });
                    checkedSrv.checkDo(self,self.tabledata,"uuid");
                }
            })
            if(self.tableData.length==0){
                self.tableParams = new NgTableParams({ count: 10 }, { counts: [], dataset: self.tableData });
                checkedSrv.checkDo(self,self.tabledata,"uuid");
            }
        }else if(item.status=="powerOff"){
            self.tableData = []
            self.tabledata.forEach(function(item){
                if(item.powerState=="power off"){
                    self.tableData.push(item)
                    self.tableParams = new NgTableParams({ count: 10 }, { counts: [], dataset: self.tableData });
                    checkedSrv.checkDo(self,self.tabledata,"uuid");
                }
            })
            if(self.tableData.length==0){
                self.tableParams = new NgTableParams({ count: 10 }, { counts: [], dataset: self.tableData });
                checkedSrv.checkDo(self,self.tabledata,"uuid");
            }
        }else if(item.status=="maintain"){
            self.tableData = []
            self.tabledata.forEach(function(item){
                if(item.maintenance){
                    self.tableData.push(item)
                    self.tableParams = new NgTableParams({ count: 10 }, { counts: [], dataset: self.tableData });
                    checkedSrv.checkDo(self,self.tabledata,"uuid");
                }
            })
            if(self.tableData.length==0){
                self.tableParams = new NgTableParams({ count: 10 }, { counts: [], dataset: self.tableData });
                checkedSrv.checkDo(self,self.tabledata,"uuid");
            }
        }else if(item.status=="unMaintain"){
            self.tableData = []
            self.tabledata.forEach(function(item){
                if(!item.maintenance){
                    self.tableData.push(item)
                    self.tableParams = new NgTableParams({ count: 10 }, { counts: [], dataset: self.tableData });
                    checkedSrv.checkDo(self,self.tabledata,"uuid");
                }
            })
            if(self.tableData.length==0){
                self.tableParams = new NgTableParams({ count: 10 }, { counts: [], dataset: self.tableData });
                checkedSrv.checkDo(self,self.tabledata,"uuid");
            }
        }
    }
    //轮询manageable到available
	$window.nodeProvisionToAvalFunc = function(ids){
        var flag=false;
        var timer = $timeout(function(){
            physicalConductorSrv.getIronicList().then(function(result) {
                if(result && result.data && angular.isArray(result.data)){
                    //更新列表状态
                    var finishCount = ids.length;
                    _.forEach(result.data,function(obj){
                        _.forEach(ids,function(id){
                            if(obj.uuid == id){
                                _.forEach(self.tabledata,function(tdata){
                                    if(tdata.uuid == id){
										tdata.provisionState = obj.provisionState;
										tdata.powerState = obj.powerState;
										tdata.targetPowerState = obj.targetPowerState;
										editSearch(tdata)
									}	
								})
								//从manageable 到 available
								if(obj.provisionState == "active" || obj.provisionState == "available"){
									finishCount = finishCount -1;
								}   
                            }
                        })
                    })
                    //停止轮询
                    if(finishCount == 0){
                        flag=true;
                    }
                }
            }).finally(function(){
                if(!flag){
                    $window.nodeProvisionToAvalFunc(ids);
                }else{
                    $timeout.canel(timer);
                }
            })
        },5000)
	}
    //初始化轮询到avaliable
	$window.nodeProvisionFunc = function(ids){
		var flag=false;
		if(timer){
			timer = null
		}
        var timer = $timeout(function(){
            physicalConductorSrv.getIronicList().then(function(result) {
                if(result && result.data && angular.isArray(result.data)){
                    //更新列表状态
                    var finishCount = ids.length;
                    _.forEach(result.data,function(obj){
                        _.forEach(ids,function(id){
                            if(obj.uuid == id){
                                _.forEach(self.tabledata,function(tdata){
                                    if(tdata.uuid == id){
										tdata.provisionState = obj.provisionState;
										tdata.inspectionFinishedAt = obj.inspectionFinishedAt;
										tdata.inspectionStartedAt = obj.inspectionStartedAt;
										tdata.powerState = obj.powerState;
										tdata.targetPowerState = obj.targetPowerState;
										resetPowerState(tdata)
										editSearch(tdata)
									}	
								})
								//从manageable 到 available
								if(obj.inspectionFinishedAt || obj.provisionState =='inspect failed' ){
									finishCount = finishCount -1;
								}   
                            }
                        })
                    })
                    //停止轮询
                    if(finishCount == 0){
                        flag=true;
                    }
                }
            }).finally(function(){
                if(!flag){
                    $window.nodeProvisionFunc(ids);
                }else{
                    $timeout.canel(timer);
                }
            })
        },5000)
	}
	//轮询物理机的状态
	$window.nodeInterFunc = function(ids){
        var flag=false;
        var timer = $timeout(function(){ 
            physicalConductorSrv.getIronicList().then(function(result) {
                if(result && result.data && angular.isArray(result.data)){
                    //更新列表状态
                    var finishCount = ids.length;
                    _.forEach(result.data,function(obj){
                        _.forEach(ids,function(id){
                            if(obj.uuid == id){
                                _.forEach(self.tabledata,function(tdata){
                                    if(tdata.uuid == id){
										tdata.powerState = obj.powerState;
										tdata.targetPowerState = obj.targetPowerState;
										resetPowerState(tdata)
										editSearch(tdata)
									}	
								})
								//从manageable 到 available
								if(!obj.targetPowerState){
									finishCount = finishCount -1;
								}   
                            }
                        })
                    })
                    //停止轮询
                    if(finishCount == 0){
                        flag=true;
                    }
                }
            }).finally(function(){
                if(!flag){
                    $window.nodeInterFunc(ids);
                }else{
                    $timeout.canel(timer);
                }
            })
        },5000)
	}
    function editSearch(item){
		item.ipmi_address = item.driverInfo.ipmi_address;
		item.powerStatusCopy = $translate.instant("aws.pvm.table.status." +item.powerState )
		item.provisionStateCopy = $translate.instant("aws.pvm.table.status.deploy." + item.provisionState )
		item.maintenanceCopy = $translate.instant("aws.pvm.table.status.maintenance." + item.maintenance )
		item.used = Boolean(item.instanceUuid);
		item.usedCopy = $translate.instant("aws.pvm.table.status.used." + Boolean(item.instanceUuid));
        if(item.inspectionFinishedAt){
            item.init = "已完成";
        }else if(item.inspectionStartedAt){
            item.init = "初始化中";
        }else{
            item.init = "未初始化";
        }
		item.searchTerm = [item.name,item.ipmi_address,item.inspectionFinishedAt,item.powerStatusCopy,
			item.provisionStateCopy,item.maintenanceCopy,item.limitAttributeCopy,item.usedCopy,item.canUse,item.init].join("\b") ;
		return item;
    }
	self.applyGlobalSearch = function () {
		var term = self.globalSearchTerm;
		self.tableParams.filter({
			searchTerm: term
		});
	};
    //部署状态
	function IronicProvisionstatesFunc(data,targetStatus){
		var nodes = {
			uuids:[],
			names:[],
			target:targetStatus
		};
		switch (targetStatus){
			case "inspect":
				data.map(item => {
					nodes.uuids.push(item.uuid);
					nodes.names.push(item.name);
				})
				if(nodes.uuids.length){
					physicalConductorSrv.IronicProvisionstates(nodes).then(function(result) {
						self.checkboxes.items = {};
						$window.nodeProvisionFunc(nodes.uuids)
					});
				}
				break;
			case "provide":
				data.map(item => {
					if(item.provisionState == 'manageable'){
						nodes.uuids.push(item.uuid);
						nodes.names.push(item.name);
					}
				})
				if(nodes.uuids.length){
					physicalConductorSrv.IronicProvisionstates(nodes).then(function(result) {
						self.checkboxes.items = {};
						$window.nodeProvisionToAvalFunc(nodes.uuids)
					});
				}
				break
		}			
	}
    // 电源状态
	function resetPowerState(tdata){
		if(tdata.targetPowerState == "power on" && tdata.powerState == "power off"){
			tdata.powerState = "powering on"
		}
		if(tdata.targetPowerState == "power off" && tdata.powerState == "power on"){
			tdata.powerState = "powering off"
		}
		if(tdata.targetPowerState == "power on" && tdata.powerState == "power on"){
			tdata.powerState = "rebooting"
		}
		return tdata
    }
    // 注册
    self.registerPvm = function(){
		var uibModalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
			templateUrl: "js/pvm/physicalConductor/tmpl/register.html",
			controller: "registerPvmCtrl",
			resolve: {
                editData: function() {
                    return "unlimitPvm";
                },
                
            }
		});
		return uibModalInstance.result.then(function(){
            $timeout(function(){
				self.getIronicList();
			},20000)
        }); 
    }
    // 批量注册
    self.batchRegister = function(){
		var uibModalInstance = $uibModal.open({
			animation: $scope.animationsEnabled,
			templateUrl: "js/pvm/physicalConductor/tmpl/batchRegister.html",
            controller: "batchRegisterCtrl",
            resolve: {
                editData: function() {
                    return "unlimitPvm";
                },
            }   
		});
		return uibModalInstance.result.then(function(){
            $timeout(function(){
				self.getIronicList();
			},20000)
        });
    }
    //  编辑
    self.editPvm=function(){
		if(!self.isDisabled){
			$uibModal.open({
				animation: $scope.animationsEnabled,
				templateUrl: "js/pvm/physicalConductor/tmpl/register.html",
				controller: "registerPvmCtrl",
				resolve: {
					editData: function() {
						return self.editData;
					},
					
				}
			});
		}
	}
    // 初始化数据
    self.initTable =function(res){
		if(res && res.data && angular.isArray(res.data)){
            self.canChoiceStatus = false
            var inspectCount = [],targetCount = [];
            self.statusFrom.name = ""
			res.data.map(item => {
				editSearch(item)
				resetPowerState(item)
				item.inspectionStartedAt?inspectCount.push(item.uuid):"";
				item.targetPowerState?targetCount.push(item.uuid):"";
            })
            IronicProvisionstatesFunc(res.data,"provide")
			self.tabledata = res.data;
			
            self.tableParams = new NgTableParams({ count: 10 }, { counts: [], dataset: self.tabledata });
			checkedSrv.checkDo(self,res,"uuid");
			if(targetCount.length){
				$window.nodeInterFunc(targetCount)
			}
			if(inspectCount.length){
				$window.nodeProvisionFunc(inspectCount)
			}
		}
    };
    self.getIronicList = function(){
		self.tabledata = "";
		physicalConductorSrv.getIronicList().then(function(res){
			physicalConductorSrv.getIronicStatus().then(function(result){
				if(result&&result.data){
					res.data.forEach(function(item){
						var phyid = item.uuid;
						item.canUse = result.data[phyid]?'是':"否"
					})
					self.initTable(res);
				}
			})
		});
    }
    self.getIronicList();
    // 初始化
    self.initProvisionstates = function() {
		if(!self.initPro_btn){
			var content = {
				target: "initProvisionstates",
				msg: "<span>" + $translate.instant("aws.pvm.tipMsg.initPvm") + "</span>",
				type: "info",
				btnType: "btn-primary",
				data:self.checkedItems
			};
			self.$emit("delete", content);
        }
	};
	self.$on("initProvisionstates", function(e,data) {
        IronicProvisionstatesFunc(data,"inspect")
        self.initPro_btn=true
	});
	//控制台
	self.openConsole_Pool = function(data){
		window.open("http://"+data.ipmi_address, "", "height=800,width=1000,top=20,left=20,toolbar=yes,resizable=yes,menubar=no,scroll");
	}
    function powerStateFun(targetStatus){
		var nodes = {
			uuids:[],
			names:[],
			target:targetStatus
		};
		self.checkedItems.map(item => {
			nodes.uuids.push(item.uuid);
			nodes.names.push(item.name)
		})
		if(self.checkedItems[0].limitAttribute){
			physicalConductorSrv.powerState(nodes).then(function(){
				self.checkboxes.items = {};
				$window.nodeInterFunc(nodes.uuids)
			})
		}else{
			physicalConductorSrv.IronicPowerState(nodes).then(function(result) {
				self.checkboxes.items = {};
				$window.nodeInterFunc(nodes.uuids)
			});
		}
	}
	//开启物理机
	self.bootPvm = function(target) {
		if(!self.boot_btn){
			var content = {
				target: "bootPvm",
				msg: "<span>" + $translate.instant("aws.pvm.tipMsg.bootServer") + "</span>",
				type: "info",
				btnType: "btn-primary",
				data:target
			};
			self.$emit("delete", content);
		}
	};
	self.$on("bootPvm", function(e,targetStatus) {
		targetStatus?powerStateFun(1):powerStateFun("power on")
	});

	//关闭物理机
	self.shutdownPvm = function(target) {
		if(!self.shutoff_btn){
			var content = {
				target: "shutdownPvm",
				msg: "<span>" + $translate.instant("aws.pvm.tipMsg.shutdownServer") + "</span>",
				type: "info",
				btnType: "btn-primary",
				data:target
			};
			self.$emit("delete", content);
		}
		
	};
	self.$on("shutdownPvm", function(e,targetStatus) {
		targetStatus?powerStateFun(0):powerStateFun("power off")
	});
	//重启物理机
	self.rebootPvm = function(target) {
		if(!self.shutoff_btn){
			var content = {
				target: "rebootPvm",
				msg: "<span>" + $translate.instant("aws.pvm.tipMsg.rebootServer") + "</span>",
				type: "info",
				btnType: "btn-primary",
				data:target
			};
			self.$emit("delete", content);
		}
	};
	self.$on("rebootPvm", function(e,targetStatus) {
		targetStatus?powerStateFun(3):powerStateFun("rebooting")
	});
	//删除物理机
	self.deletePvm = function() {
		if(!self.del_btn){
			var content = {
				target: "deletePvm",
				msg: "<span>" + $translate.instant("aws.pvm.tipMsg.deleteServer") + "</span>",
			};
			self.$emit("delete", content);
		}
	};
	self.$on("deletePvm", function() {
		var nodes = {
			uuids:[],
			names:[],
		};
		self.checkedItems.map(item => {
			nodes.uuids.push(item.uuid);
			nodes.names.push(item.name)
		})
		if(self.checkedItems[0].limitAttribute){
			physicalConductorSrv.deletePvm(nodes).then(function(){
				self.checkboxes.items = {};
				self.getIronicList();
			})
		}else{
			physicalConductorSrv.IronicDeletePvm(nodes).then(function(result) {
				self.checkboxes.items = {};
				self.getIronicList();
			});
		}
	});

	//开启维护模式
	self.openMaintenance = function() {
		if(!self.openMain_btn){
			var content = {
				target: "openMaintenance",
				msg: "<span>" + $translate.instant("aws.pvm.tipMsg.openMaintenance") + "</span>",
			};
			self.$emit("delete", content);
		}
	};
	self.$on("openMaintenance", function() {
		var nodes = {
			uuids:[],
			names:[]
		};
		self.checkedItems.map(item => {
			nodes.uuids.push(item.uuid);
			nodes.names.push(item.name)
		})
		physicalConductorSrv.IronicOpenMiantance(nodes).then(function(result) {
			self.checkboxes.items = {};
			self.getIronicList();
		});
	});

	//关闭维护模式
	self.closeMaintenance = function() {
		if(!self.closeMain_btn){
			var content = {
				target: "closeMaintenance",
				msg: "<span>" + $translate.instant("aws.pvm.tipMsg.closeMaintenance") + "</span>",
			};
			self.$emit("delete", content);
		}
	};
	self.$on("closeMaintenance", function() {
		var nodes = {
			uuids:[],
			names:[]
		};
		self.checkedItems.map(item => {
			nodes.uuids.push(item.uuid);
			nodes.names.push(item.name)
		})
		physicalConductorSrv.IronicCloseMiantance(nodes).then(function(result) {
			self.checkboxes.items = {};
			self.getIronicList();
		});
	});

    // 终止初始化
    self.stopInit = function(){
        if(!self.initedPhyMacChk_btn){
			var content = {
				target: "stopInit",
				msg: "<span>" + $translate.instant("aws.pvm.tipMsg.stopInit") + "</span>",
			};
			self.$emit("delete", content);
		}
    }
    self.$on("stopInit", function() {
        var nodes = {
			uuids:[],
			names:[]
		};
		self.checkedItems.map(item => {
			nodes.uuids.push(item.uuid);
			nodes.names.push(item.name)
		})
		physicalConductorSrv.stopInit(nodes).then(function(result) {
            self.checkboxes.items = {};
			self.getIronicList();
		});
    });
    
    // 状态重启
    // self.registerStetus = function(){
        // if(!self.registerStetus_btn){
		// 	var content = {
		// 		target: "registerStetus",
        //         msg: "<span>" + $translate.instant("aws.pvm.tipMsg.registerStetus") + "</span>",
        //         type: "info",
		// 		btnType: "btn-info",
		// 		data:self.checkedItems
		// 	};
		// 	self.$emit("delete", content);
		// }
    // }
    // self.$on("registerStetus", function(e,data) {
    //     IronicProvisionstatesFunc(data,"provide")
    //     self.registerStetus_btn=true
    // });
    
	self.$on("refresh", function() {
		self.getIronicList();
	});
}
export {physicalConductorCtrl,NanotubePhysicsMachineCtrl,resourcePoolPhysicalMachineCtrl}

let ctrlList = [physicalConductorCtrl,NanotubePhysicsMachineCtrl,resourcePoolPhysicalMachineCtrl];
angular.forEach(ctrlList,function(item){
	item.$inject = ["$scope","$rootScope","$location","checkedSrv","physicalConductorSrv","NgTableParams","$uibModal","$translate","$window","$timeout"];
});
