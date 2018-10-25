import  pImagesSrv from "../services/pImagesSrv"


export function pImagesCtrl($scope, $window,$rootScope, $uibModal, NgTableParams, $routeParams, pImagesSrv, alertSrv,
        checkedSrv, $filter, $timeout, GLOBAL_CONFIG, $translate){
		self = $scope;
		if(localStorage.installIronic==1){
			self.pluginSwitch=1;
		}else{
			self.pluginSwitch=2;
			return;
		}
		getImages();
		self.titleName="pImage";
		if(sessionStorage["pImage"]){
			self.titleData=JSON.parse(sessionStorage["pImage"]);
		}else{
			self.titleData=[
				{name:'img.img_name',value:true,disable:true,search:"name"},
				{name:'img.system_type',value:true,disable:false,search:"_os_type"},
				{name:'img.issue_version',value:true,disable:false,search:"os"},
				{name:'img.type',value:true,disable:false,search:"image_type"},
				{name:'img.public',value:true,disable:false,search:"is_public"},
				{name:'img.architecture',value:true,disable:false,search:"arch"},
				{name:'img.disk_format',value:true,disable:false,search:"disk_format"},
				{name:'img.status',value:true,disable:false,search:"status"},
				{name:'img.created_at',value:true,disable:false,search:"create_at"},
				{name:'img.canUse',value:true,disable:false,search:"canUse"},
			];
		}
		


		function pImageSearchTearm(obj){
			var tableData = obj.tableData;
			var titleData = obj.titleData;
			tableData.map(function(item){
				item.searchTerm="";
				titleData.forEach(function(showTitle){
						if(showTitle.value){
						if(showTitle.search=='subnets'){
							item.subnets.forEach(function(subnet){
								item.searchTerm+=subnet.cidr; 
							});
						}else{
							item.searchTerm+=item[showTitle.search];
						}
						
						}
				});
			});
		}
		self.pImageSearchTearm = pImageSearchTearm;
		self.updateImages = function(type, editData) {
			if (type == "edit" && !self.canEdit) {
				return;
			}
			var scope = $rootScope.$new();
			scope.submitInValid = false;
			scope.interacted = function(field) {
				return scope.submitInValid || field.$dirty;
			};
			scope.submitInValid = false;
			//初始可选择文件
			self.cant_select_file = false;
			//禁止按钮二次点击
			scope.can_double_click = true;
			//选择镜像上传方式
			scope.source_type_list=[{id:"2",name:$translate.instant("aws.img.uploadfile")},];
			// scope.source_type_list = [{ id: "1", name: "从http上传" }];
			scope.source_type = scope.source_type_list[0];
			scope.showFile = true;
			scope.change_source_type = function(obj) {
				scope.source_type = obj;
				if (obj.id == 1) {
					scope.showFile = false;
					scope.fileSizeinvalidate = false;
				} else {
					scope.showFile = true;
					if (document.getElementById("upload").value) {
						scope.fileSize <= 10 ? scope.fileSizeinvalidate = false : scope.fileSizeinvalidate = true;
					}
				}
			}
	
	
			scope._self = scope;
			scope.disk_format = [
				{ "id": 1, "text": "raw" },
				{ "id": 2, "text": "qcow2" },
			];
			scope.arch = [
				{ id: 1, text: "i686" },
				{ id: 2, text: "x86_64" }
	
			];
			/*scope.options = {
				disk_format: "qcow2",
				arch: "x86_64"
			};*/
			scope.chooseDisk = function(item) {
				scope.options.disk_format = item.text;
			};
			scope.chooseArch = function(item) {
				scope.options.arch = item.text;
			};
			scope.versionList = [];
			scope.os = {};
			//系统类型。linux or windows
			scope.osTypeList = [];
			//详细的系统
			scope.osDistroList = [];
			scope.os_type = "";
			scope.os_distro = "";
			pImagesSrv.getOSversion().then(function(result) {
				if (result && result.data) {
					_.forEach(result.data, function(os) {
						//系统数组
						os.dataName_t = $translate.instant("aws.img.osType." + os.paramName.toLowerCase())
						scope.osTypeList.push(os);
					});
				}
				if (scope.osTypeList.length > 0) {
					//系统初始选择
					if (editData) {
						scope.osTypeList.forEach(function(item, index) {
	
							if (item.paramName == editData.os_type) {
	
								scope.os_type = scope.osTypeList[index];
								var osDistroArray = item.paramValue.split(",");
								_.forEach(osDistroArray, function(osDistro) {
									//操作系统版本数组
									scope.osDistroList.push({ id: "", name: osDistro });
								});
								return;
							}
						})
						if (scope.osDistroList.length > 0) {
							//version初始选择
							scope.osDistroList.forEach(function(item, index) {
								if (editData && (item.name).toLowerCase() == (editData.os).toLowerCase()) {
									scope.os_distro = scope.osDistroList[index];
									return;
								}
							});
						}
					} else {
						scope.os_type = scope.osTypeList[0];
						scope.changeOSType(scope.os_type);
						//scope.os_distro=scope.osDistroList[0];
					}
					judge_type();
	
				}
			});
			scope.changeOSType = function(os) {
				scope.os_type = os;
				var osDistroArray = os.paramValue.split(",");
				scope.osDistroList = [];
				_.forEach(osDistroArray, function(version) {
					//osDistroList数组
					scope.osDistroList.push({ id: "", name: version });
				});
				if (scope.osDistroList.length > 0) {
					//osDistro初始选择
					scope.os_distro = scope.osDistroList[0];
				}
			};
			scope.changeOS = function(os_distro) {
				scope.os_distro = os_distro;
			};
			/*检测上传镜像的名字是否小于255字节*/
			scope.checkNameFun = function(name) {
				var nameReg = /^(\w|[\u4E00-\u9FA5]|\-|\.)*$/;
				var nameStrReg = /^[\u4E00-\u9FA5]$/
				var nameStr = "";
				if (nameReg.test(name) && name != undefined) {
					var num = 0;
					for (var i = 0; i < name.length; i++) {
						nameStr = name.charAt(i)
						if (nameStrReg.test(nameStr)) {
							num += 3;
						} else {
							num++;
						}
					}
					if (num <= 255) {
						scope.nameCheck = false;
					} else {
						scope.nameCheck = true;
					}
				} else {
					scope.nameCheck = false;
				}
			}
			var modalImage = $uibModal.open({
				animation: $scope.animationsEnabled,
				templateUrl: "updateimages.html",
				scope: scope
			});
	
			function judge_type() {
				//判断是否在上传镜像的状态。
				scope.upDataUpFlag = false;
				//提示消息
				scope.tipCheck = false;
				scope.canelUpdataImage = function() {
					if (scope.upDataUpFlag) {
						if (scope.tipCheck) {
							modalImage.close();
						}
						scope.tipCheck = true;
					} else {
						modalImage.close();
					}
				}
				switch (type) {
					case "new":
						scope.options = {
							disk_format: "qcow2",
							arch: "x86_64"
						};
						scope.hideSome = false;
						scope.imageTitle = $translate.instant("aws.img.upload_image");
						scope.upImage = {};
						scope.upImage.disk_format = "iso";
						scope.upImage.architecture = "x86_64";
						scope.upImage.is_public = false;
						if (localStorage.permission == "stand") {
							scope.upImage.is_public = true;
						}
						$('#upload').on('change', function() {
							scope.selected_file = document.getElementById("upload").value;
							let dom = document.getElementById("upload");
							let fileSize = 0;
							dom.files[0] ? fileSize = dom.files[0].size : scope.selected_file = "";
							scope.fileSize = Math.ceil(fileSize / 1024 / 1024 / 1024);
							scope.fileSize <= 10 ? scope.fileSizeinvalidate = false : scope.fileSizeinvalidate = true;
							scope.$apply();
						})
						scope.uploadData = {
							title: $translate.instant("aws.img.progress"),
							beAdded: 0,
							total: 1,
							inUsed: 0
						}
						scope.$watch(function() {
								return scope.showFile
							}, function(value) {
								if (value) {
									scope.selected_file = document.getElementById("upload").value;
								} else {
									scope.selected_file = "123";
								}
							})
							//判断是否在上传镜像的状态。
						scope.upDataUpFlag = false;
						//提示消息
						scope.tipCheck = false;
						scope.canelUpdataImage = function() {
							if (scope.upDataUpFlag) {
								if (scope.tipCheck) {
									modalImage.close();
								}
								scope.tipCheck = true;
							} else {
								modalImage.close();
							}
						}
						scope.confirmImage = function(pro, imageName) {
							if (imageName.$valid && !scope.nameCheck) {
								scope.can_double_click = false;
								scope.show_progress = true;
								if (scope.showFile) {
									scope.upDataUpFlag = true;
									$window.updataImageInterval = function() {
										$timeout(function() {
											if (scope.upDataUpFlag) {
												pImagesSrv.getOSversion().finally(function() {
													$window.updataImageInterval();
												})
											}
										}, 600000)
									}
									$window.updataImageInterval()
									scope.cant_select_file = true;
									var file = document.getElementById("upload").files[0];
									var imageName = scope.upImage.name;
									//使用FormData对象上传文件
									var form = document.forms.namedItem("imageForm");
									var oData = new FormData(form);
									oData.append("disk_format", scope.options.disk_format);
									oData.append("is_public", scope.upImage.is_public);
									oData.append("architecture", scope.options.arch);
									oData.append("os_distro", scope.os_distro.name);
									oData.append("os_type", scope.os_type.paramName);
								
									//  oData.append("os_version",scope.upImage.os_version);
									var oReq = new XMLHttpRequest();
		                            var startData ={
		                                timeStamp :null,
		                                loadedSize :null
		                            }
									oReq.upload.onprogress = function(e) {
		                                /*计算速率*/
		                                if(startData.timeStamp&&startData.loadedSize){
		                                    var timeDifference = e.timeStamp - startData.timeStamp;
		                                    var imageDifference = e.loaded - startData.loadedSize;
		                                    self.rateNum = (imageDifference/timeDifference/1024/1.024).toFixed(2)+"M/s";
		                                }

		                                startData.timeStamp = e.timeStamp;
		                                startData.loadedSize = e.loaded;

		                                /*计算进程*/
										let percentage = (e.loaded / e.total / 100).toFixed(2);
										scope.uploadData = {
											title: $translate.instant("aws.img.progress"),
											beAdded: 0,
											rate:self.rateNum,
											total: e.total,
											inUsed: e.loaded
										}
										scope.$apply();
										if (e.total == e.loaded) {
											scope.upDataUpFlag = false;
											modalImage.close();
											//api更改马上刷新可能会拿不到数据经多次测试延迟1秒。
											$timeout(function() {
												$scope.refreshImages();
											}, 1000)
										}
	
									};
									oReq.onerror = function(e) {
										if (e.type == "error") {
											scope.upDataUpFlag = false;
											alertSrv.set("", imageName +$translate.instant("aws.img.uploadfail"), "error", 5000);
	
										}
									};
									oReq.onload = function() {
										var responseObj = JSON.parse(oReq.responseText);
										if (responseObj) {
											if (responseObj.code == 0) {
												scope.upDataUpFlag = false;
												alertSrv.set("", imageName +$translate.instant("aws.img.uploadsuccess"), "success", 5000);
												getImages();
											} else {
												scope.upDataUpFlag = false;
												alertSrv.set("", imageName +$translate.instant("aws.img.uploadfail"), "error", 5000);
											}
										}
	
	
									}
									oReq.open("POST", window.GLOBALCONFIG.APIHOST.RESOURCE + "/v1/physical/uploadimagez", true);
									let auth_token = localStorage.$AUTH_TOKEN;
									oReq.setRequestHeader("X-Auth-Token", auth_token);
									oReq.setRequestHeader("domain_id", localStorage.domainUid);
									oReq.setRequestHeader("domain_name", encodeURI(localStorage.domainName));
									oReq.setRequestHeader("project_id", localStorage.projectUid);
									oReq.setRequestHeader("project_name", encodeURI(localStorage.projectName));
									oReq.send(oData);
									// modalImage.close();
	
								} else {
									pro.architecture = scope.options.arch;
									pro.disk_format = scope.options.disk_format;
									pro.os_type = scope.os_type.paramName;
									pro.os_distro = scope.os_distro.name;
									pro.minimum_disk = pro.vol_size;
									if (localStorage.permission == "stand") {
										pro.is_public = true;
									}
									modalImage.close();
									pImagesSrv.createImage(pro).then(function() {
										getImages();
									});
								}
							} else {
								scope.submitInValid = true;
							}
						};
						break;
	
					case "edit":
						//随便的值，为了表单验证通过
						scope.selected_file = "123";
						scope.options = {};
						scope.imageTitle = $translate.instant("aws.img.edit_image");
						scope.upImage = angular.copy(editData);
						scope.hideSome = true;
						scope.upImage.disk_format = editData.disk_format;
						scope.upImage.architecture = editData.arch;
						scope.options.arch = editData.arch
						scope.upImage.os_version = editData.release;
						scope.upImage.os_type = editData.os_type;
						scope.os_type = { "dataName_t": editData.os_type };
						_.forEach(scope.osTypeList, function(os) {
							if ((os.paramName).toLowerCase() == editData.os_type) {
								scope.changeOSType(os)
							}
						})
						scope.upImage.os_distro = editData.os_distro;
						scope.os_distro = { id: "", name: editData.os };
						scope.upImage.vol_size = editData.size || 0;
						scope.options.disk_format = editData.disk_format;
						scope.confirmImage = function(pro, imageName) {
							if (imageName.$valid && !scope.nameCheck) {
								scope.can_double_click = false;
								var postData = {
									"name": pro.name,
									"copy_from": pro.copy_from,
									"disk_format": scope.options.disk_format,
									"architecture": scope.options.arch,
									"os_version": pro.os_version,
									"os_type": scope.os_type.paramName,
									"os_distro": scope.os_distro.name,
									"is_public": pro.is_public,
									"is_protected": pro.is_protected,
									"imageUid": pro.imageUid,
								   
								};
								modalImage.close();
								pImagesSrv.editImage(postData).then(function() {
									getImages();
								});
							} else {
								scope.submitInValid = true;
							}
	
						};
						break;
				}
			}
			scope.cant_click = function() {
				/*return !scope.can_double_click || (!scope.have_file && scope.showFile)*/
				return !scope.can_double_click || scope.fileSizeinvalidate
			}
	
		};
		$scope.refreshImages = function() {
			getImages();
		};
		$scope.$on("getDetail", function(event, value) {
			pImagesSrv.getImagesDetail(value).then(function(data) {
				data.data.status = data.data.status.toLowerCase();
				if (data.data.os == "Unknown") {
					data.data.os = "";
				}
				$scope.detailData = data.data;
				$scope.detailData.size = $scope.detailData.size || 0;
				if ($scope.detailData.os_type) {
					$scope.detailData.os_type = $scope.detailData.os_type.toLowerCase();
				}
				if ($scope.detailData.true_size > 1) {
					$scope.detailData.true_size = $scope.detailData.true_size.toFixed(2) + " GB";
				} else {
					$scope.detailData.true_size = (($scope.detailData.true_size) * 1024).toFixed(2) + " MB";
				}
	
			});
		});
		self.deleteImages = function() {
			if (!self.canDelete) {
				return;
			}
			var content = {
				target: "delImage",
				msg: "<span>" + $translate.instant("aws.img.del_msg") + "</span>"
			};
			self.$emit("delete", content);
		};
		self.$on("delImage", function() {
			var delGroup = [];
			var names = [];
			var postData = { ids: delGroup ,names:names};
			_.forEach(self.tableParams.data, function(group) {
				if (self.checkboxes.items[group.imageUid]) {
					console.log(group)
					delGroup.push(group.imageUid);
					names.push(group.name)
				}
			});
			pImagesSrv.delImages(postData).finally(function() {
				getImages();
			});
		});
	
		function canDelete(obj) {
			self.canDelete = true;
			if (obj.status == "QUEUED" || obj.status == "SAVING" || obj.is_protected == true) {
				self.canDelete = false;
			}
			if (obj.is_public && !self.ADMIN) {
				self.canDelete = false;
			}
		}
	
		function canEdit(obj) {
			if (obj.is_public && !self.ADMIN) {
				self.canEdit = false;
			} else {
				self.canEdit = true;
			}
		}
	
		function canAddVm(obj) {
			if (obj.disk_format == 'iso' || obj.status.toLowerCase() != 'active' || !obj.canUse) {
				self.canAddVm = false;
			} else {
				self.canAddVm = true;
			}
		}
	
		function getImages() {
			self.globalSearchTerm= "";
			pImagesSrv.getImages().then(function(data) {
				if (data && data.data && data.data.length>=0) {
					data ? self.loadData = true : "";
					tableResize(data.data)
					successFunc(data.data);
				}
				
			})
		}
		//判断定时器是否在启动中。
		//记录每条数据轮询时间对象最长轮询25分钟。
		self.resizeNum={};
		self.timerStart=false;
	
		function tableResize(data) {
			//需要轮询的数组列表               
			self.resizing = [];
			data.map(x => {
				if (x.status == "saving" || x.status == "queued") {
					self.resizing.push(x.imageUid)
				}
			})
			if (self.resizing.length > 0) {
				//时间重置
				if (JSON.stringify(self.resizeNum) == "{}") {
					self.resizing.map(id => { self.resizeNum[id] = 1 })
				}
				if (!self.timerStart) {
					var options = {
							'imageUids': self.resizing
						}
						/*镜像状态更新轮询*/
					$window.IntervalImageResize(options);
				}
	
			}
		}
		  $window.IntervalImageResize = function(options){
			var timer = $timeout(function(){
				self.timerStart=true;
				pImagesSrv.getStatus(options).then(function(result) {
					if(result && result.data && result.data.length){
						result.data.forEach(function(item){
							//有数据异常数据（可能有其他用户删除了正在保存数据）
							if(item.status == null){
								self.resizing.removeImageUid(item.imageUid);
								self.tabledata.map(function(obj){
									if(obj.imageUid == item.imageUid){
										self.tabledata.removeImageUid(obj);
									}
								})
								successFunc(self.tabledata)
							}else if(item.status == "active"){
								self.resizing.removeImageUid(item.imageUid);
								self.tabledata.map(function(obj){
									if(obj.imageUid == item.imageUid){
										obj.status = item.status;
									}
								})  
							}
							
							//轮询一次记录时间更改。
							if(self.resizeNum[item.imageUid]){
								self.resizeNum[item.imageUid]=self.resizeNum[item.imageUid]+1;
							}else{
								self.resizeNum[item.imageUid]=1;
							}
							
							//当一个镜像在上传过程中荡掉。让这条数据轮询最多25分钟关闭。
							if(self.resizeNum[item.imageUid]>151){
								self.resizing.removeImageUid(item.imageUid)
							}
						})
						
					}
						
					  
				}).finally(function(){
					//轮询时可能有的数据已经恢复正常,参数重置。
					if(self.resizing.length>0){
						var options={
							'imageUids':self.resizing
						}
						$window.IntervalImageResize(options);
					}else{
						self.timerStart=false;
						$timeout.canel(timer);
					}
				})
			
			},10000)  
		}
		Array.prototype.removeImageUid = function(val) {
			var index = this.indexOf(val);
			if (index > -1) {
				this.splice(index, 1);
			}
		};
		function successFunc(data) {
			self.tabledata = data;
			pImageSearchTearm({tableData:self.tabledata,titleData:self.titleData});
				self.subnetTable = new NgTableParams({
					count: GLOBAL_CONFIG.PAGESIZE
				}, {
					counts: [],
					dataset: self.subNetTableData
				});
			data.map(function(item) {
				if (item.os) {
					if ((item.os).toLowerCase() == "unknown") {
						item.os = "";
						item.os_type = "";
					}
				}
				if (item.os_type != null && item.size != null && item.arch != null) {
					if (((item.os_type).toLowerCase() == 'windows' || (item.os_type).toLowerCase() == "linux") && (item.size != 0) && (item.arch == "x86_64" || item.arch == "i686")) {
						item.canUse = true;
						item.tip_message = "";
					} else {
						item.canUse = false;
						item.tip_message = $translate.instant("aws.img.tip_message");
					}
				} else {
					item.canUse = false;
					item.tip_message = $translate.instant("aws.img.tip_message");
				}
	
				item.status = item.status.toLowerCase();
				item.status_ori = $translate.instant("aws.img.table.status." + item.status);
				item.public_ori = $translate.instant("aws.img.table.is_public." + item.is_public);
				item.canUse_ori = $translate.instant("aws.img.table.is_public." + item.canUse);
				item.create_at = $filter("date")(item.create_at, "yyyy-MM-dd HH:mm:ss");
				item.os_type = item.os_type ? item.os_type.toLowerCase() : "";
				item._os_type = item.os_type ? $translate.instant("aws.img.osType." + item.os_type) : "";
				// item.searchTerm = item.name +item.image_type + item.public_ori + item.os + item.release + item.arch + item.is_protected + item.disk_format + item.create_at +item.status_ori;
                item.searchTerm =[item.name,item._os_type,item.os,item.image_type,item.public_ori,item.arch,item.disk_format,item.status_ori,item.create_at,item.canUse_ori].join("\b") 
			});
			self.tableParams = new NgTableParams({ count: GLOBAL_CONFIG.PAGESIZE }, { counts: [], dataset: data });
			self.applyGlobalSearch = function() {
				var term = self.globalSearchTerm;
				self.tableParams.filter({ searchTerm: term });
			};
			var tableId = "imageUid";
			checkedSrv.checkDo(self, data, tableId);
			self.$watch(function() {
				return self.checkedItems;
			}, function(values) {
				self.canEdit = false;
				self.canAddVm = false;
				if (values.length == 0) {
					self.canDelete = false;
				}
				if (values.length == 1) {
					canDelete(values[0]);
					canEdit(values[0]);
					canAddVm(values[0])
				} else if (values.length > 1) {
					for (var i = 0; i < values.length; i++) {
						canDelete(values[i]);
						if (self.canDelete == false) {
							self.canDelete = false;
							break;
						}
					}
				}
			});
		}
    

}


let ctrlList = [pImagesCtrl];
angular.forEach(ctrlList,function(item){
	item.$inject = ["$scope", "$window","$rootScope", "$uibModal", "NgTableParams", "$routeParams", "pImagesSrv","alertSrv",
		  "checkedSrv", "$filter", "$timeout", "GLOBAL_CONFIG", "$translate"];
});
