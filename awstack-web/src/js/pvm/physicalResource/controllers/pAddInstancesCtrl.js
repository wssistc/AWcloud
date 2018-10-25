import  pInstancesSrv from "../services/pInstancesSrv"

export function pAddInstancesCtrl($scope,$rootScope,$location,checkedSrv,pInstancesSrv,
	NgTableParams,$uibModal,$translate,$window,$timeout,$routeParams,vmFuncSrv,commonFuncSrv,$uibModalInstance,
	instancesSrv,cvmViewSrv,depviewsrv){
		var self = $scope;
		localStorage.managementRole != 2 ? self.roleNumber = false : self.roleNumber = true;
		self.insForm = {
			hostNum:1,
			networkList:[]
		};
		self.showPrice = false ;
		self.avoidDouble = false;
		self.options = {
			disabled: true,
			img: "public",
			arch: "x86_64",
			cpu_mem: "1",
			creatBy: "isImage"
		};
		self.conf = {};
		self.submitInValid = false;
		var imgType = [{
			text: $translate.instant("aws.instances.addinstances.public"),
			value: "public"
		}, {
			text: $translate.instant("aws.instances.addinstances.private"),
			value: "private"
		}];
		var framework = [{
			text: $translate.instant('aws.instances.addinstances.x86_64'),// "64位"
			value: "x86_64"
		}, {
			text: $translate.instant('aws.instances.addinstances.i686'),//"32位"
			value: "i686"
		}];
	
		self.vm = {
			imgType: imgType,
			framework: framework
		};

		self.chooseCpuMem = function(data) {
			self.options.flavor = data;
			let flavor_ram_gb = self.options.flavor.ram / 1024;
			self.options.flavor.ram_gb = Math.ceil(flavor_ram_gb) == flavor_ram_gb ? flavor_ram_gb : flavor_ram_gb.toFixed(1);
			self.normalText = data.text;
			self.getPrice()
		};
        //镜像服务
		self = vmFuncSrv.imageFunc(self,pInstancesSrv,"pvm")
		self.allImages();
		//flavor服务
		//self = vmFuncSrv.flavorFunc(self,pInstancesSrv)
		//网络资源
		if(commonFuncSrv.reGetNetList){
			self = commonFuncSrv.insNetworkFunc(self, "definedInsNet", "step3InsForm",pInstancesSrv);
		}else{
			self = commonFuncSrv.insNetworkFunc(self, "network", "InstanceForm",pInstancesSrv);
		}
		//配额服务
		self = vmFuncSrv.quotaFunc(self,instancesSrv,cvmViewSrv,depviewsrv)
	
		self.flavorFunc = function(){
            self.flavorNormalList = [];
            pInstancesSrv.getFlavors().then(function(result) {
				if (result && result.data && angular.isArray(result.data)) {
					_.forEach(result.data, function(val) {
						val.text = val.name + "：" + val.vcpus + $translate.instant("aws.instances.conf.memtip") + (val.ram / 1024).toFixed(1) + "GB ";
						self.flavorNormalList.push(val);
					});
					self.options.flavor = self.flavorNormalList[0];
					let flavor_ram_gb = self.options.flavor.ram / 1024;
					self.options.flavor.ram_gb = Math.ceil(flavor_ram_gb) == flavor_ram_gb ? flavor_ram_gb : flavor_ram_gb.toFixed(1);
					self.getproQuotas(self.options.flavor);
					self.getdomQuotas(self.options.flavor);
					self.getPrice();
				}
			});
		},
		self.flavorFunc();
		self.getPrice = function(){
			if(!$rootScope.billingActive){
				return ;
			}
			var data = {
				cpuCount:self.options.flavor.vcpus,
				memorySize:self.options.flavor.ram_gb,
				hardDiskSize:self.options.flavor.disk,
				region:localStorage.regionName?localStorage.regionName:"wuhan"
			}
			pInstancesSrv.getPrice(data).then(function(data) {
				if(data && data.data  &&!isNaN(data.data) ){
                    self.showPrice = true;
                    self.price =data.data;
                    self.priceFix =  self.price.toFixed(2)
                    self.totalPrice = (self.price*30*24).toFixed(2)
                }else{
                    self.showPrice = true;
                    self.price ="N/A";
                    self.priceFix =  "N/A";
                    self.totalPrice = "N/A"
                }
			});
		}
		

		self.createInstance = function(InstanceForm) {
			self.validForm = false;
			var postData = {};
			var addInstance = function(params) {
				self.avoidDouble = true;
				pInstancesSrv.createServer(params).then(function() {
					$uibModalInstance.close()
				});
			};
			if (InstanceForm.$valid) {
				postData = {
					"name":self.insForm.name,
					"flavor":self.options.flavor.id,
					"image_id":self.arch.selected.imageUid,
					"network_id":self.network.selected.id,
					"os_type":self.image.selected.type,
					"use_local":false,
					"hostname": self.insForm.hostname,
					"admin_pass": self.insForm.admin_pass || "",
				}
				if (self.network.assignIP) {
					postData.fixed_ip = self.network.init_cidr.ip_0 + "." + self.network.init_cidr.ip_1 + "." + self.network.init_cidr.ip_2 + "." + self.network.init_cidr.ip_3;
					self.setCheckValueFunc();
					if (self.field_form.InstanceForm.$valid) {
						self.validForm = true;
						let existedIps = [];
						pInstancesSrv.getNetworksDetail(self.network.selected.id).then(function(res) {
							if (res && res.data) {
								_.each(res.data, function(item) {
									_.each(item.subnetIps, function(sub) {
										existedIps.push(sub.ip_address);
									})
								})
								if (!_.include(existedIps, postData.fixed_ip)) {
									addInstance(postData);
								} else {
									self.network.repeatIp = true;
									self.validForm = false;
								}
							}
						});
					} else {
						self.submitInValid = true;
						self.validForm = false;
					}
				}else{
					self.validForm = true;
					addInstance(postData);
				}
			} else {
				self.submitInValid = true;
				self.validForm = false;
			}
	
			return self;
		};
    

}


let ctrlList = [pAddInstancesCtrl];
angular.forEach(ctrlList,function(item){
	item.$inject = ["$scope","$rootScope","$location","checkedSrv","pInstancesSrv",
	"NgTableParams","$uibModal","$translate","$window","$timeout","$routeParams","vmFuncSrv","commonFuncSrv","$uibModalInstance",
	"instancesSrv","cvmViewSrv","depviewsrv"];
});



