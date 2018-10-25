import  pInstancesSrv from "../services/pInstancesSrv";
import  physicalConductorSrv from "../../physicalConductor/services/physicalConductorSrv"

export function pInstancesCtrl($scope,$rootScope,$location,checkedSrv,pInstancesSrv,
	NgTableParams,$uibModal,$translate,$window,$timeout,userDataSrv,$routeParams,physicalConductorSrv){
	var self = $scope;
	if(localStorage.installIronic==1){
		self.pluginSwitch=1;
	}else{
		self.pluginSwitch=2;
		return;
	}
	function editSearch(item){
		item.status = item.status.toLowerCase();
		item.statusCopy = $translate.instant('aws.instances.table.status.' + item.status);
		item.lockedCopy = $translate.instant('aws.pvm.servers.table.locked.' + item.locked)
		
		item.searchTerm = [item.name,item.statusCopy,item.fixedIps,item.imageName,item.lockedCopy,item.description
		].join("\b") ;
		return item;
	}

    //设置项的初始化
    self.titleName="pInstances";
    if(sessionStorage["pInstances"]){
       self.titleData=JSON.parse(sessionStorage["pInstances"]);
    }else{
        self.titleData=[ 
            {name:'pvm.pvmName',value:true,disable:true},
            {name:'instances.status',value:true,disable:false},
            {name:'instances.IPaddress',value:true,disable:false},
            {name:'instances.imgName',value:true,disable:false},
            {name:'pvm.options_lock',value:true,disable:false},
            {name:'pvm.desc',value:true,disable:false},
         ];
    }

	function chkSome(items) {
		var ids = [];
		var names = []
		items.map(item => {
			ids.push(item.uid),
			names.push(item.name)
		})
		return {ids:ids,names:names};
	};
	
    function initTable(res){
    	self.globalSearchTerm = "";
		if(res && res.data){
			res.data.map(item => {
				item.showDesc = item.description?true:false;
				editSearch(item)
			})
			self.tabledata = res.data;
			self.tableParams = new NgTableParams({ count: 10 }, { counts: [], dataset: self.tabledata });
			checkedSrv.checkDo(self,res,"uid");
		}
	};

	self.applyGlobalSearch = function () {
		var term = self.globalSearchTerm;
		self.tableParams.filter({
			searchTerm: term
		});
	};

	self.applypvm = function(){
		var uibModalInstance = $uibModal.open({
			animation: $scope.animationsEnabled,
			templateUrl: "js/pvm/physicalResource/tmpl/addinstances.html",
			controller: "pAddInstancesCtrl"
		});
		return uibModalInstance.result.then(function(post){
            self.getServers();
        });
	}

	self.vncServer = function(data){
		if(self.shutoff_btn || self.lock_btn) return;
		window.open("http://"+data.ipmiAddress)
	}
	self.showDesc = function(item){
		item.showDesc = true;
	}
	self.editDesc = function(data,descForm){
		if (descForm.$valid) {
			var postData = {
				description:data.description,
				serverName:data.name
			}
			pInstancesSrv.editDesc(data.uid,postData).then(function(){
				self.getServers()
			});
		}else{
			return ;
		}
	}
	//不同状态下某些按钮的可操作性
    self.$watch(function() {
        return self.checkedItems;
    }, function(value) {
		self.boot_btn = true;
		self.shutoff_btn = true;
		self.reboot_btn = true;
		self.lock_btn = true;
		self.unlock_btn = true;
		self.reset_btn = true;
		self.restTip = "" ;
		self.del_btn = false;
        if(value){
            var activeChk = 0,stopChk = 0,errorChk = 0,lockChk = 0,unlockChk = 0;
            value.map(function(item) {
                //故障状态的个数
                errorChk += (item.status === "error") || 0;
                //开机状态的个数
                activeChk += (item.status === "active") || 0;  
                //关机状态的个数
				stopChk += (item.status === "shutoff" || item.status === "stopped" ) || 0; 
				//锁定状态的个数
                lockChk += (item.locked) || 0;  
                //未锁定状态的个数
				unlockChk += (!item.locked ) || 0; 
            });
            var values = [activeChk, stopChk, errorChk,unlockChk,lockChk];

            if(value.length > 0 ){
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
				if(values[3] == value.length){
					self.lock_btn = false;
				}else if(values[4] == value.length){
					self.unlock_btn = false;
					self.boot_btn = true;
					self.shutoff_btn = true;
					self.reboot_btn = true;
					self.lock_btn = true;
					self.reset_btn = true;
					self.del_btn = true;
				}
			}
			if(value.length == 1 && self.editData.phyServerId){
				physicalConductorSrv.IronicgetPvmInfo(self.editData.phyServerId).then(function(result){
					if(result && result.data){
						if(result.data.uuid == self.editData.phyServerId){
							if(!result.data.maintenance &&  !(value[0].ironProvisionState =='wait call-back' || value[0].ironProvisionState =='deploying'||value[0].ironProvisionState =='deploy complete' ) && values[4]<1 && (values[0]==1 ||values[1]==1)){
								self.reset_btn = false;
							}else{
								self.restTip = $translate.instant('aws.pvm.tip.tip19')
							}
							
						}
					}
				})
			}
			if(value.length == 1 
				&& (value[0].ironProvisionState =='wait call-back' || value[0].ironProvisionState =='deploying'||value[0].ironProvisionState =='deploy complete' ) 
				&& (value[0].status =='active' || value[0].status =='shutoff' || value[0].status =='stopped') ){
					self.unlock_btn =true ;
					self.shutoff_btn = true ;
					self.lock_btn = true;
					self.boot_btn = true ;
					self.reset_btn = true;
			}
			if(value.length == 1){
				if(
					value[0].status =='error'||
					value[0].status =='building'||
					value[0].status =='build'
					){
					return;
				}
				pInstancesSrv.getInsImage(value[0].uid).then(function(data){
					if(data && !data.data){
						self.reset_btn = !data.data;
						self.restTip = "原始镜像不存在，无法重装"
					}
				})
			}
        }
	});
	self.$on("getDetail", function(event, insUid) {
		pInstancesSrv.getDetail(insUid).then(function(data){
			self.insConfigDatas = data.data;
			self.phymacName = self.insConfigDatas.name;
			self.insConfigDatas.status = data.data.status.toLowerCase()
		})
			// instancesSrv.getServerDetail(insUid).then(function(result) {
			// 	if (result && result.data) {
			// 		self.insConfigData = result.data;
			// 	}
			// });
		})
	self.$on("serverSocket", function(e, data) {
		if (self.tabledata && self.tabledata.length) {
			self.tabledata.map(function(obj) {
				if (data.eventMata.instance_id) {
					if (obj.uid === data.eventMata.instance_id) {
						if(data.eventMata.status != "deleting"){
							obj.status = data.eventMata.status;
						}
						if (data.eventType == "compute.phy_instance.delete.end") { //删除
                            _.remove(self.tabledata, function(val) {
                                return ((val.status == "error" || val.status == "deleted")&& val.uid === data.eventMata.instance_id);
                            });
                        }
					}
				}
			});
			if(data.eventType == "compute.phy_instance.create.end" ){  
				$timeout(function(){
					self.getServers();
				},2000)
			}
			self.tableParams.data = initTable(self.tabledata);
			self.tableParams.page(1);
			self.tableParams.reload();
			self.checkboxes.items = {};
		}
	});

	
	//开启虚拟机
	self.bootServer = function(data) {
		if(self.boot_btn) return;
		var content = {
			target: "bootServer",
			msg: "<span>" + $translate.instant("aws.instances.tipMsg.startIronicServer") + "</span>",
			type: "info",
			btnType: "btn-info",
			data:data
		};
		self.$emit("delete", content);
	};
	self.$on("bootServer", function(e,data) {
		var  post = chkSome(data);
		checkedSrv.setChkIds(post.ids,"power_on")
		pInstancesSrv.bootServer(post).then(function(result) {
			self.checkboxes.items = {};
			

		});
	});
	//关闭虚拟机
	self.shutdownServer = function(data) {
		if(self.shutoff_btn) return;
		var content = {
			target: "shutdownServer",
			msg: "<span>" + $translate.instant("aws.instances.tipMsg.stopServer") + "</span>",
			type: "warning",
			btnType: "btn-warning",
			data:data
		};
		self.$emit("delete", content);
	};
	self.$on("shutdownServer", function(e,data) {
		var  post = chkSome(data);
		checkedSrv.setChkIds(post.ids,"power_off")
		pInstancesSrv.shutdownServer(post).then(function() {
			self.checkboxes.items = {};

		});
	});
	//重启虚拟机
	self.rebootServer = function(data) {
		if(self.shutoff_btn) return;
		var content = {
			target: "rebootServer",
			msg: "<span>" + $translate.instant("aws.instances.tipMsg.reboot") + "</span>",
			type: "info",
			btnType: "btn-primary",
			data:data
		};
		self.$emit("delete", content);
	};
	self.$on("rebootServer", function(e,data) {
		var  post = chkSome(data);
		checkedSrv.setChkIds(post.ids,"reboot")
		pInstancesSrv.rebootServer(post).then(function(result) {
			self.checkboxes.items = {};
			

		});
	});
	//删除虚拟机
	self.delServer = function(data) {
		var content = {
			target: "delSever",
			msg: "<span>" + $translate.instant("aws.instances.tipMsg.delSever") + "</span>",
			type: "warning",
			btnType: "btn-warning",
			data:data
		};
		self.$emit("delete", content);
	};
	self.$on("delSever", function(e,data) {
		var  post = chkSome(data);
		checkedSrv.setChkIds(post.ids,"delete")
		pInstancesSrv.delServer(post).then(function() {
			self.checkboxes.items = {};
			self.getServers()
		});
	});
	//锁定虚拟机
	self.lockServer = function(data) {
		if(self.lock_btn) return;
		var content = {
			target: "lockSever",
			msg: "<span>" + $translate.instant("aws.pvm.tipMsg.lockPhySever") + "</span>",
			type: "warning",
			btnType: "btn-warning",
			data:data
		};
		self.$emit("delete", content);
	};
	self.$on("lockSever", function(e,data) {
		var  post = chkSome(data);
		pInstancesSrv.lockServer(post).then(function() {
			self.checkboxes.items = {};
			self.getServers();

		});
	});

	//解锁虚拟机
	self.unlockServer = function(data) {
		if(self.unlock_btn) return;
		var content = {
			target: "unlockSever",
			msg: "<span>" + $translate.instant("aws.pvm.tipMsg.unlockPhySever") + "</span>",
			type: "warning",
			btnType: "btn-warning",
			data:data
		};
		self.$emit("delete", content);
	};
	self.$on("unlockSever", function(e,data) {
		var  post = chkSome(data);
		pInstancesSrv.unlockServer(post).then(function() {
			self.checkboxes.items = {};
			self.getServers();

		});
	});

	//系统重装
	self.resetServer = function(data) {
		if(self.reset_btn) return;
		var content = {
			target: "resetServer",
			msg: "<span>" + $translate.instant("aws.pvm.tipMsg.resetServer") + "</span>",
			type: "warning",
			btnType: "btn-warning",
			data:data
		};
		self.$emit("delete", content);
	};
	self.$on("resetServer", function(e,data) {
		var names =[],ids=[];
		data.map(item=>{
			names.push(item.name)
			ids.push(item.phyServerId)
		})
		var nodes = {
			uuids:ids,
			names:names,
			target:"rebuild"
		};
		physicalConductorSrv.IronicProvisionstates(nodes).then(function() {
			self.checkboxes.items = {};
			self.getServers();
		});
	});
    
    //获取监控客户端
	self.getMonitorClient = function(data) {
        let scope = self.$new();
        let clientModalInstance = $uibModal.open({
            animation: true,
            templateUrl: "monitorClientModal.html",
            scope: scope
        });
        scope.uid = data.uid;
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
	
	//获取虚拟机列表
	self.getServers = function(){
		pInstancesSrv.getServers().then(function(res){
			res ? self.loadData = true : "";
			if(res && res.data && angular.isArray(res.data)){
				initTable(res);
			}
		});
	}
	self.getServers();

}


let ctrlList = [pInstancesCtrl];
angular.forEach(ctrlList,function(item){
	item.$inject = ["$scope","$rootScope","$location","checkedSrv","pInstancesSrv",
	"NgTableParams","$uibModal","$translate","$window","$timeout","userDataSrv","$routeParams","physicalConductorSrv"];
});
