import "./depviewSrv";
import "../department/departmentSrv";
import "../project/projectSrv";
import "../user/userDataSrv";
import "../roles/roleDataSrv";
import {PiePanelDefault} from"../chartpanel";
var depviewModule=angular.module("depviewModule", ["ngTable", "ngAnimate", "ui.bootstrap", "depviewsrv","ngAnimate", "ngSanitize", "departmentsrv"]);
depviewModule.controller("depviewCtrl", function($scope,$filter, $rootScope, NgTableParams, $translate,checkedSrv,$uibModal, departmentDataSrv,projectDataSrv,depviewsrv,userDataSrv,$location,$route,GLOBAL_CONFIG) {
	var self=$scope;
	var filter = $filter;
	self.isDisabled = true;
	self.delisDisabled = true;
	self.gotoCvm = function(m,n,v){
		$location.url("/cvm/cvmview");
		localStorage.domainName = self.domainName;
		localStorage.domainUid = v;
		localStorage.projectName = m;
		localStorage.projectUid = n;
	};
	
	function getDepartment() {
		self.domainUid=localStorage.domainUid;
		self.domainName = localStorage.domainName;
		getQuotaTotal();
		getProject();
	}

	function getProject() {
		depviewsrv.getProjectData(self.domainUid).then(function(data) {  
			data?self.loadData = true:"";
			depviewsrv.ProjectAllData = data.data;
			if(data && data.data){
				successFunc(data.data);
			}
		});
	}
	function getQuotaTotal(){
		depviewsrv.getQuotaTotal(self.domainUid).then(function(result) {   
			if(result && result.data && result.data.length){
				_.forEach(result.data,function(item){
					_.forEach(self.quotas,function(quota){
						if(item.name==quota.name){
							if(quota.name=="ram"){
								quota.total=(item.hardLimit/1024).toFixed(1);
								
							}else{
								quota.total=item.hardLimit;
							}					
						}
					});
					if(item.name=="instances"){
						self.insData.total=item.hardLimit;
					}
				});
				if(!$rootScope.L3){
					self.quotas=self.quotas.filter(item=>{
						return item.name!="floatingip"
					})
				}
				
			}else{
				self.insData.total = 0 ;
				_.forEach(self.quotas,function(quota){
					quota.total = 0;
				});
			}
			getQuotaUsed();
			
		});
	}
	self.quotaName={
		"cores":$translate.instant("aws.quota.cores"),
		"ram":$translate.instant("aws.quota.ramGb"),
		"snapshots":$translate.instant("aws.quota.snapshots"),
		"floatingip":$translate.instant("aws.quota.floatingip"),
		"instances":$translate.instant("aws.quota.instances")
	};
	function quotaInfo(quota){
		switch (quota.name){
		case "cores":
			quota.type=self.quotaName.cores;
			quota.icon="icon-aw-cpu";
			break;
		case "ram":
			quota.type=self.quotaName.ram;
			quota.icon="icon-aw-ram";
			break;
		case "snapshots":
			quota.type=self.quotaName.snapshots;
			quota.icon="icon-aw-camera";
			break;
		case "floatingip":
			quota.type=self.quotaName.floatingip;
			quota.icon="icon-aw-internet";
			break;
		case "instances":
			quota.type=self.quotaName.instances;
		} 
	}
	self.quotas=[{name:"cores"},{name:"ram"},{name:"snapshots"},{name:"floatingip"}];
	self.insData={};
	self.allocate={
		"alearyAllocate":$translate.instant("aws.quota.alearyAllocate")
	};
	function getQuotaUsed(){
		self.insData.type=self.allocate.alearyAllocate;
		self.insData.used=0;

		_.forEach(self.quotas,function(quota){
			quota.used = 0 ;
			quota.usedText=self.allocate.alearyAllocate;
			quotaInfo(quota);
		});
		depviewsrv.getQuotaUsed(self.domainUid).then(function(result){
			if(result && result.data && result.data.length){
				_.forEach(result.data,function(item){
					_.forEach(self.quotas,function(quota){
						if(item.name==quota.name){
							if(quota.name=="ram"){
								quota.used=(item.inUse/1024).toFixed(1);
							}else{
								quota.used=item.inUse;
							}
						}
					});
					if(item.name=="instances"){
						self.insData.used=item.inUse;
					}	
				});
			}
			self.showpie = true;
			self.depViewInsPieChart = new PiePanelDefault();
			self.depViewInsPieChart.panels.data = [
				{name:$translate.instant("aws.overview.inUsed"),value:self.insData.used},
				{name:$translate.instant("aws.overview.unUsed"),value:self.insData.total-self.insData.used>=0?self.insData.total-self.insData.used:0}
			];
			self.depViewInsPieChart.panels.pieType = "percent";
			self.depViewInsPieChart.panels.colors = ["#1ABC9C","#e5e5e5"]; 	
		});
	}
	function successFunc(data) {
		data.map(function(item){
			item.searchTerm = item.name+item.description;
		});
		self.tableParams = new NgTableParams({ count: GLOBAL_CONFIG.PAGESIZE }, { counts: [], dataset: data });
		self.applyGlobalSearch = function() {
			var term = self.globalSearchTerm;
			self.tableParams.filter({searchTerm: term });
		};
		var tableId = "projectUid";
		checkedSrv.checkDo(self, data, tableId);
	}

	self.$watch(function(){
		return self.checkedItems;
	},function(value){
		if(value && value.length>0){
			value.map(function(item){
				if(item.name == "admin"){
					self.delisDisabled = true;
					//self.notDelTip = $translate.instant('aws.depart.table.dep_not_del');
				}
			});
			if(value.length!=1){
				self.delisDisabled = true;
			}
		}
	});
	getDepartment();

	
	self.createDep = function() {
		$uibModal.open({
			animation: $scope.animationsEnabled,
			templateUrl: "createDep.html",
			controller: "createDepCtrl",
			resolve: {
				getDepartment: function() {
					return getDepartment;
				},
				domainUid:function(){
					return self.domainUid;
				}
			}
		});
	};
	
	self.updateProject = function(type, editData) {
		$uibModal.open({
			animation: $scope.animationsEnabled,
			templateUrl: "creatProject.html",
			controller: "creatProCtrl",
			resolve: {
				getDepartment: function() {
					return getDepartment;
				},
				getProject: function() {
					return getProject;
				},
				domainUid:function(){
					return self.domainUid;
				},
				type:function(){
					return type;
				},
				editData:function(){
					return editData;
				}
			}
		});
	};

	self.del = function(checkedItems) {
		var content = {
			target: "delProject",
			msg: "<span>" + $translate.instant("aws.project.delproject") + "</span>"
		};
		self.$emit("delete", content);
		self.$on(content.target, function() {
			var delGroup = [],
			projectGroup = [];
			var postData = { ids: delGroup, uids: projectGroup };
			_.forEach(checkedItems, function(group) {
				delGroup.push(group.id);
				projectGroup.push(group.projectUid);
			});
			projectDataSrv.delProject(postData).then(function(result) {
				let pro_name=checkedItems[0].name;
				if(result&&result.data&&result.data[pro_name]){
					function objToStrMap(obj) {
					    let strMap = new Map();
					    for (let k of Object.keys(obj)) {
					        strMap.set(k, obj[k]);
					    }
					    return strMap;
					}
					let newmap=objToStrMap(result.data[pro_name]);
					//let error_info=$translate.instant("aws.project.del.error_info_prefix");
					let error_info=pro_name+$translate.instant("aws.project.del.error_info_prefix")+"</br>"
					let error_array=[];
					for (let [key, value] of newmap) {
						error_info=error_info+$translate.instant("aws.project.del.resource."+key)+":"+value+"，"
					   //error_info=error_info+value+$translate.instant("aws.project.del.unit")+$translate.instant("aws.project.del.resource."+key)+"、";
					}
					error_info=error_info.substring(0,error_info.length-1);
					//error_info=error_info+$translate.instant("aws.project.del.error_info_suffix");
					let cont = {
						target: "delete_project",
						msg: "<span>" + error_info + "</span>",
						data: checkedItems
					};
					self.$emit("delete_error", cont);
					self.$on("delete_project", function(e,data) {
						
					});
				}
				$route.reload();
			});
		});
	};
	//分配用户
	self.allocateUser = function(type, editData) {
		var scope = $rootScope.$new();
		var userModal = $uibModal.open({
			animation: $scope.animationsEnabled,
			templateUrl: "allocateUser.html",
			scope:scope
		});
		userModal.opened.then(function(){
			depviewsrv.getDomainUsers(self.domainUid).then(function(result){
				if(result && result.data && result.data.length){
					return result.data = result.data.filter(function(item){
						return (item.managementRole >3 ); //过滤掉admin用户和登进来的domain_admin用户
					});
				}else{
					result.data = [];
				}
			}).then(function(data){		
				projectDataSrv.usersInProject(editData.projectUid).then(function(result){
					if(result && result.data && result.data.length){
						result.data = result.data.filter(function(obj){
							return obj.name !="admin";
						});
						_.forEach(result.data,function(per){
							_.forEach(per.roleidlist,function(val){
								val.name=$translate.instant("aws.users.cu.roles."+val.name);
							});
							_.remove(data,function(item){
								return (item.userUid==per.userUid);
							});
						});
						scope.users=data;
						scope.havedUsers2=angular.copy(result.data);
						scope.havedUsers=result.data;
					}else{
						scope.users=data;
						scope.havedUsers2=[];
						scope.havedUsers=[];
					}
										
				});
				scope.example5settings = {displayProp: "name", idProp: "id",externalIdProp: ""};
				scope.example5customTexts = {buttonDefaultText: "Select"};
			});
			userDataSrv.getRolesData().then(function(result){ 
				scope.roles =[];
				if(result && result.data && result.data.length){
					result.data.map(function(role){
						if(role.name =="member" || role.name =="project_admin" )
							scope.roles.push(role);
					});  
				}	
				scope.roles.map(role=>{role.name=$translate.instant("aws.users.cu.roles."+role.name);});

			});
			scope.selectUserToProject=function(user){
				_.remove(scope.users,function(item){
					return item.userUid==user.userUid;
				});
				/*_.forEach(scope.roles,function(item){
					if(item.name=="member"){
						user.roleidlist=[{id:item.id,name:"member"}];
					}
				})*/
				_.forEach(scope.roles,function(item){
					if(item.name=="普通用户"){
						user.roleidlist=[{id:item.id,name:item.name}];
					}
				});
				scope.havedUsers.push(user);
			};
			scope.removeUserFromProject=function(havedUser){
				_.remove(scope.havedUsers,function(item){
					return item.userUid==havedUser.userUid;
				});
				havedUser.roleidlist=[];
				scope.users.push(havedUser);
			};				   
		});
		userModal.result.then(function(){
			// 判断用户的角色数组中哪些是新加的，哪些是被删除的
			
			function isAddOrDelete(newData,oldData){
				var deleteRoles=[];
				var reData=[];
				var addRoles=[];
				var length=angular.copy(oldData).length;
				var k=0;
				for(var i=0;i<newData.length;i++){
						
					for(var j=0;j<oldData.length+k;j++){
						if(newData[i]==oldData[j]){
							oldData.splice(j,1);
							k++;
							break;	  
						}
					}
					if(j==length){
						addRoles.push(newData[i]);
					}
				}
				deleteRoles=oldData;				
				reData.push(addRoles);
				reData.push(deleteRoles);
				return reData;
			}
			function convertUser(obj){
				//由于使用了angularjs-dropdown-multiselect插件，选中用户角色后以字典对象保存，把它转化成字符串。

				_.forEach(obj,function(item){
					item.userid=item.userUid;
					for(var i=0;i<item.roleidlist.length;i++){
						if(typeof(item.roleidlist[i])!="string"){
							item.roleidlist.push(item.roleidlist[i].id);
							item.roleidlist.splice(i,1);
							//由于item.roleidlist被删除了一项，被删除的数据会向前移位，为防止有的数据没有进入循环，使索引值减少1
							i--;
						}
					}
				});
				return obj;
			}
			scope.havedUsers=convertUser(scope.havedUsers);
			scope.havedUsers2=convertUser(scope.havedUsers2);
				
			//deleteUser保存的是被删除的用户。
			var deleteUser=[];
			
			for (var i = 0; i < scope.havedUsers2.length; i++) {
				for (var j =0; j< scope.havedUsers.length ; j++) {
					if(scope.havedUsers2[i].userid==scope.havedUsers[j].userid){
						break;
					}
				}
				if(j==scope.havedUsers.length){
					deleteUser.push(scope.havedUsers2[i]);
				}
			}
			
			var postParams=[];
			for (var ii = 0; ii < scope.havedUsers.length; ii++) {
				for(var jj=0; jj<scope.havedUsers2.length;jj++){
					if (scope.havedUsers[ii].userid==scope.havedUsers2[jj].userid){
						var reData=isAddOrDelete(scope.havedUsers[ii].roleidlist,scope.havedUsers2[jj].roleidlist);
						scope.havedUsers[ii].oper="add";
						scope.havedUsers[ii].roleidlist=reData[0];
						postParams.push(scope.havedUsers[ii]);
						var newItem=angular.copy(scope.havedUsers[ii]);
						newItem.oper="remove";
						newItem.roleidlist=reData[1];
						postParams.push(newItem);
						break;
					}
				}
				if(jj==scope.havedUsers2.length){
					scope.havedUsers[ii].oper="add";
					postParams.push(scope.havedUsers[ii]);
				}
			}
			_.forEach(deleteUser,function(item){
				item.oper="remove";
				postParams.push(item);
			});
			var paramsData = _.filter(postParams,function(item){
				return item.roleidlist.length >0;
			});
			if(paramsData.length>0){
				projectDataSrv.addUserToProject(editData.projectUid,postParams).then(function(){
					getProject();
				});
			}
		});
	};
});
depviewModule.controller("createDepCtrl", function($scope,$filter,$rootScope,$uibModalInstance, $translate,depviewsrv, getDepartment,domainUid,$route) {
	var self = $scope;
	var filter = $filter;
	var rootScope=$rootScope;
	self.submitted = false;
	self.interacted = function(field) {
		return self.submitted || field.$dirty;
	};
	
	self.enabled = [{ id: "1", name: true }, { id: "2", name: false }];
	
	self.invalid = {};
	self.required = {};
	self.tempVaild={};
	//获取可编辑的配额
	self.getCanEditQuota = ()=>{
		getCanEditQuota()
	}
	function getCanEditQuota(){
		//self.canEditQuotas1={};
		depviewsrv.getCanEditQuota().then(function(result){
			if(result && result.data){
				self.getDepConfig = true ;
				self.canEditQuotas=result.data;
				self.canEditQuotas.forEach((x)=>{
					if(x.name=="ram"){
						x.hardLimit=parseInt((x.hardLimit)/1024);
					}
					})
				if(!rootScope.L3){
				self.canEditQuotas=self.canEditQuotas.filter(item=>{
					return item.name!="floatingip";
				});
			}
			}
		
		})
	}
	getCanEditQuota();
	self.domain={name:"",description:"",enabled:true};
	self.confirmDep=function(){
		if(self.createDepForm.$valid){
			$uibModalInstance.dismiss("cancel");
			var newQuotas=[];
			_.forEach(angular.copy(self.canEditQuotas),function(item){
				delete item["id"];
				if(item.name=="ram"){
					item.hardLimit=(item.hardLimit)*1024;
				}
				newQuotas.push(item);
			});
			var postParams={domain:self.domain,quotas:newQuotas};
			depviewsrv.createDep(postParams).then(function(result){
				if(result && result.data){
					localStorage.domainName = result.data.domain.name;
					localStorage.domainUid = result.data.domain.domainUid;
					$route.reload();
				}
			});
		}else{
			self.submitted = true;
		}
		
	};
});
depviewModule.controller("creatProCtrl", function($scope,$filter,$rootScope,$uibModalInstance,type, $translate,depviewsrv,editData,getProject,domainUid,getDepartment,$route) {
	var self = $scope;
	var filter = $filter;
	var rootScope=$rootScope;
	self.submitted = false;
	self.showQuota=false;
	self.confirm_dis = false;
	self.interactedName = function(field) {
		return self.submitted || field.$dirty
	};
	self.invalid = {};
	self.required = {};
	self.tempVaild={};

	function getProQuotaInfo(){
		depviewsrv.getQuotaTotal(domainUid).then(function(result){
			if (result && result.data && result.data.length){
				_.forEach(self.canEditQuotas,function(quota){
					if(quota.name=="ram"){
						/*获取默认配额的数据处理*/
						quota.hardLimit=parseInt((quota.hardLimit)/1024);
						
					}
					_.forEach(result.data,function(item){
						if(quota.name==item.name){
							if(item.name=="ram"){
								/*部门配额数据处理*/
								item.hardLimit=parseInt((item.hardLimit)/1024);
							}
							quota.availQuota=item.hardLimit;
						}
					});
				});
				self.showQuota=true;
			}else{
				self.showQuota=true;
			}
			
		});
		
	}

	self.project={name:"",description:"",enabled:true,domainUid:domainUid};
	function getCanEditQuota(){
		depviewsrv.getProQuota().then(function(result){
			if(result && result.data){
				self.getDepConfig = true;
				if(!rootScope.L3){
					result.data=result.data.filter(item=>{
						return item.name!="floatingip";
					});
				}
				self.canEditQuotas=result.data;
			}else{
				self.canEditQuotas=[];
			}
			
		}).then(function(){
			getProQuotaInfo();
		});
	}
	function getCanEditById(){
    	  depviewsrv.getProHave(editProData.projectUid).then(function(result){
			self.canEditQuotas=[];
			if(result && result.data && result.data.length){
				self.getDepConfig = true;
				_.forEach(result.data,function(item){
					self.canEditQuotas.push(item);
				});
				if(!rootScope.L3){
					self.canEditQuotas=self.canEditQuotas.filter(item=>{
						return item.name!="floatingip";
					});
				}
			}
			getProQuotaInfo();
		});
    }
	switch (type) {
	case "new":
		self.projectTitle = $translate.instant("aws.project.newproject");
		getCanEditQuota();
		self.getCanEditQuota = function(){
        	getCanEditQuota() ;
        }
		self.confirmPro=function(){
			if(self.projectName.$valid){
				$uibModalInstance.dismiss("cancel");  
				self.confirm_dis = true;
				var newProQuotas=[];
				_.forEach(angular.copy(self.canEditQuotas),function(item){
					delete item["id"];
					item.domainUid=domainUid;
					if(item.name=="ram"){
						item.hardLimit=(item.hardLimit)*1024;
					}
					newProQuotas.push(item);
				});
				var postParams={project:self.project,quotas:newProQuotas};		
				depviewsrv.createPro(postParams).then(function(){
					getDepartment();
					$route.reload();
				});
			}else{
				self.submitted = true;
			}			
		};
		break;
	case "edit":
		self.projectTitle = $translate.instant("aws.project.editproject");
		var editProData = angular.copy(editData);
		self.getDepConfig = false;
        getCanEditById();
        self.getCanEditQuota = function(){
        	getCanEditById()
        }
		if(editProData.name == "admin"){
			self.notEditName = true;
			self.notEditTip =$translate.instant("aws.depart.table.pro_not_edit") ;
		}
		self.project = editProData;
		
		self.confirmPro=function(){
			if(self.projectName.$valid){
				$uibModalInstance.dismiss("cancel"); 
				var newProQuotas=[];
				_.forEach(angular.copy(self.canEditQuotas),function(item){
					delete item["id"];
					item.projectUid=editProData.projectUid;
					if(item.name=="ram"){
						item.hardLimit=(item.hardLimit)*1024;
					}
					newProQuotas.push(item);
				});
				var putParams={project:self.project,quotas:newProQuotas};
				depviewsrv.updateProject(putParams).then(function(){
					getDepartment();
					$route.reload();
				});
			}else{
				self.submitted = true;
			}	
		};
		break;
	}	
});

depviewModule.directive("repeatNums",function(depviewsrv){  //校验项目名称是否重复
    return {
        restrict:"A",
        require:"ngModel",
        link:function(scope,elem,attrs,ngModel){
        	var tempName = scope.project.name;
            ngModel.$parsers.push(function(viewValue){
                var existedVlanIds = [];
                _.each(depviewsrv.ProjectAllData,function(item){
                    existedVlanIds.push(item.name);
                });
                if(tempName){
                	for (var i = 0; i < existedVlanIds.length; i++) {
                		if(existedVlanIds[i]==tempName){
                			existedVlanIds.splice(i,1);
                		}
                	}
                }
                if(_.include(existedVlanIds,viewValue)){
                    ngModel.$setValidity("repeatNums",false);
                }else{
                    ngModel.$setValidity("repeatNums",true);
                }
                return viewValue;
            });
        }

    };
});

depviewModule.directive("availquota",function(){
	return {
		restrict:"A",
		require:"ngModel",
		link:function(scope,ele,attrs,creatProCtrl){	
			function tempVaildQuota(viewValue){
				if(typeof(scope.quota.availQuota) != undefined&&Number(viewValue)>Number(scope.quota.availQuota)&&Number(viewValue)!=0){
					creatProCtrl.$setValidity("availquota",false);
				}else{
					creatProCtrl.$setValidity("availquota",true);
				}
				return viewValue;
			}
			tempVaildQuota(scope.quota.hardLimit);
			creatProCtrl.$parsers.push(tempVaildQuota);
		}
	};
});
depviewModule.directive("inusedquota",function(){
	return {
		restrict:"A",
		require:"ngModel",
		link:function(scope,ele,attrs,creatProCtrl){	
			function tempVaildQuotainused(viewValue){
				if(typeof(scope.quota.inUse) != undefined&&viewValue<scope.quota.inUse&&viewValue!=0){
					creatProCtrl.$setValidity("inusedquota",false);
				}else{
					creatProCtrl.$setValidity("inusedquota",true);
				}
				return viewValue;
			}
			tempVaildQuotainused(scope.quota.hardLimit);
			creatProCtrl.$parsers.push(tempVaildQuotainused);
			creatProCtrl.$formatters.push(tempVaildQuotainused);
			scope.$watch(function(){
				return scope.quota.inUse;
			},function(val){
				if(val){
					tempVaildQuotainused(scope.quota.hardLimit);
				}
			});
		}
	};
});
depviewModule.directive("availquota1",function(){
	return {
		restrict:"A",
		require:"ngModel",
		link:function(scope,ele,attrs,createDepCtrl){
			//
			function tempVaildQuota1(viewValue){
				if(viewValue>2147483647&&viewValue!=0){
					createDepCtrl.$setValidity("availquota1",false);
				}else{
					createDepCtrl.$setValidity("availquota1",true);
				}
				return viewValue;
			}
			tempVaildQuota1(scope.quota.hardLimit);
			createDepCtrl.$parsers.push(tempVaildQuota1);	  
		}
	};
});
depviewModule.directive("repeatname",["$timeout","$window","depviewsrv",function($timeout,$window,depviewsrv){
	return {
		restrict:"A",
		require:"ngModel",
		link:function(scope,ele,attrs,createDepCtrl){
			scope.$watch(attrs.ngModel, function(depName) {
				if (!depName) return;
				$timeout.cancel($window.timer);
				$window.timer = $timeout(function(){
					depviewsrv.depNameIsUsed({name:depName}).then(function(result){
						createDepCtrl.$setValidity("repeatname",!result.data);
					});	
				},1000);
			});
		}
	};
}]);
