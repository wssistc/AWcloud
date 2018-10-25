import "../services/easyDepartmentSrv";
import "../../department/depviewSrv";
easyDepartmentCtrl.$inject=["$scope",'$http',"$route", "$rootScope", "NgTableParams","$uibModal","$translate","$uibModalInstance","$location","easyDepartmentSrv","depviewsrv","GLOBAL_CONFIG","checkedSrv"];

export function easyDepartmentCtrl($scope,$http,$route, $rootScope, NgTableParams, $uibModal, $translate,$uibModalInstance,$location,departmentDataSrv,depviewsrv,GLOBAL_CONFIG,checkedSrv){
    var self = $scope;
    self.submitted = false;
    self.interacted = function(field) {
        return self.submitted || field.$dirty;
    };
    self.getDepConfig = false;
    self.enabled = [{ id: "1", name: true }, { id: "2", name: false }];

    self.invalid = {};
    self.required = {};
    self.tempVaild = {};
    //新建页面获取可编辑的配额
    function getCanEditQuota() {
        depviewsrv.getCanEditQuota().then(function(result) {
            if (result && result.data) {
                self.getDepConfig = true;
                self.canEditQuotas = result.data;
                if(!$rootScope.L3){
                    self.canEditQuotas=self.canEditQuotas.filter(item=>{
                        return item.name!="floatingip"
                    })
                }
                self.canEditQuotas.forEach((x)=>{
                    if(x.name=="ram"){
                        x.hardLimit=parseInt((x.hardLimit)/1024);
                    }
                })
            } else {
                self.canEditQuotas = [];
            }
        });
    }
    //编辑页面获取可编辑配额
    function getCanEditById(){
          departmentDataSrv.getDepQuota(editData.domainUid).then(function(result) {
            if (result && result.data) {
                self.getDepConfig = true;
                self.canEditQuotas = result.data;
                if(!$rootScope.L3){
                    self.canEditQuotas=self.canEditQuotas.filter(item=>{
                        return item.name!="floatingip"
                    })
                }
                self.canEditQuotas.forEach((x)=>{
                    if(x.name=="ram"){
                        x.hardLimit=parseInt((x.hardLimit)/1024);
                    }
                })
            } else {
                self.canEditQuotas = [];
            }

        })
    }
    function getDepartment() {
        departmentDataSrv.getDepart().then(function(result) {
            result ? self.loadData = true : "";
            if (result && result.data) {
                successFunc(result.data);
            }
        });
    }
    function successFunc(data) {
        data.map(function(item) {
            item.searchTerm = item.name + item.description + item.enabled;
        });
        self.tableParams = new NgTableParams({ count: GLOBAL_CONFIG.PAGESIZE }, { counts: [], dataset: data });
        var tableId = "id";
        checkedSrv.checkDo(self, data, tableId);
    }

    self.handleType='new';
    self.departTitle = $translate.instant("aws.depart.new_depart");
    getCanEditQuota();
    self.getCanEditQuota = function(){
        getCanEditQuota() ;
    }
    self.domain = { name: "", description: "", enabled: true };
    self.confirmDep = function() {
        if (self.createDepForm.$valid) {
            if(self.domain.name==$translate.instant("aws.common.defaultDepar")){
                self.repeatName=true;
                return;
            }
            depviewsrv.depNameIsUsed({ name: self.domain.name }).then(function(result) {
                if (result.data) {
                    self.repeatName=true;  
                }else{
                    self.repeatName=false;
                    var newQuotas = [];
                    _.forEach(angular.copy(self.canEditQuotas), function(item) {
                        delete item["id"];
                        if(item.name=="ram"){
                            item.hardLimit=(item.hardLimit)*1024;
                        }
                        newQuotas.push(item);
                    });
                    self.canSubmit = true;
                    var postParams = { domain: self.domain, quotas: newQuotas };
                    depviewsrv.createDep(postParams).then(function(result) {
                        if(result&&result.data){
                            self.$emit('department-refresh',result.data)
                            self.$emit('region-refresh',{type:"domain"});

                            /*刷新头部部门*/
                            self.getRoleFormUserInProject = function(){
                                $http({
                                   method: "GET",
                                   url: "/awstack-user/v1/user/project/"+localStorage.projectUid+"/roles"
                               }).success(function(res){
                                   if(res){
                                       localStorage.rolename = res.roleName;
                                   }
                               })
                            }
                            function changeCvmView() {
                                $http({
                                    method: "GET",
                                    url: "/awstack-user/v1/user/domains/projects"
                                }).success(function(res) {
                                    if($location.path().indexOf("cvm") == -1 && $location.path().indexOf("monitor") == -1 && easy!="easy"){return;}
                                    if(res){
                                       self.tops.deparList = res;
                                       for(var i=0;i<self.tops.deparList.length;i++){
                                            if(self.tops.deparList[i].domainUid=='default'){
                                                self.tops.deparList[i].disDomainName = '默认部门';
                                            }else{
                                                self.tops.deparList[i].disDomainName = self.tops.deparList[i].domainName;
                                            }
                                            if(self.tops.deparList[i].projects&&self.tops.deparList[i].projects.length>0){
                                                for(var j=0;j<self.tops.deparList[i].projects.length;j++){
                                                    if(self.tops.deparList[i].projects[j].projectName == 'admin' && self.tops.deparList[i].domainUid=='default'){
                                                        self.tops.deparList[i].projects[j].disProjectName = '默认项目';         
                                                    }else{
                                                        self.tops.deparList[i].projects[j].disProjectName = self.tops.deparList[i].projects[j].projectName;
                                                    }
                                                }
                                            }
                                        }
                                        self.tops.deparList.map(function(item) {
                                            if (item.domainName == localStorage.domainName) {
                                                self.tops.depart.selected = item;
                                            }
                                        });
                                        if(!localStorage.domainName){
                                            self.tops.depart.selected = res[0];
                                            localStorage.domainName = self.tops.depart.selected.domainName;
                                            localStorage.domainUid = self.tops.depart.selected.domainUid
                                        }
                                    }
                                    self.tops.projectsList = self.tops.depart.selected.projects
                                    if(self.tops.projectsList){
                                        self.tops.projectsList.map(function(item) {
                                            if (item.projectId == localStorage.projectUid) {
                                                self.tops.pro.selected = item;
                                                self.getRoleFormUserInProject()
                                            }
                                        });
                                        //解决监控页面：新建部门管理员，没有默认项目，但有其他项目在该部门下，默认给第一个项目
                                        if(self.tops.projectsList.length > 0 && !self.tops.pro.selected ){
                                            self.tops.pro.selected = self.tops.projectsList[0];
                                            localStorage.projectName = self.tops.pro.selected.projectName;
                                            localStorage.projectUid = self.tops.pro.selected.projectId;
                                        }
                                    }
                                });
                            }
                            if($location.path()=='/permit/department'||$location.path()=='/permit/overview'){
                               $route.reload(); 
                            }else if($location.path()=='/quickconfig/createins'){
                                self.$emit('get-create',{type:"domain"});
                            }else if($location.path().indexOf('cvm')>-1||$location.path().indexOf('monitor')>-1){
                                changeCvmView()
                            }     
                        }
                    }).finally(function(){
                        self.canSubmit = false;
                        $uibModalInstance.dismiss("cancel");
                    });
                }
            });
        } else {
            self.submitted = true;
        }
    };   
}

