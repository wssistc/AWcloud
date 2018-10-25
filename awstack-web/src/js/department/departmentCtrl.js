import "./departmentSrv";
import "./depviewSrv";
import {PiePanelDefault} from"../chartpanel";
var depModule = angular.module("departmenctrl", ["departmentsrv", "depviewsrv",]);
depModule.controller("DepartmentCtrl", ['$scope', '$rootScope', '$q', '$routeParams', 'NgTableParams', 'departmentDataSrv', 'alertSrv', 'checkedSrv', '$location', '$uibModal', '$translate', 'GLOBAL_CONFIG','depviewsrv','$filter',
    function($scope, $rootScope, $q, $routeParams, NgTableParams, departmentDataSrv, alertSrv, checkedSrv, $location, $uibModal, $translate, GLOBAL_CONFIG,depviewsrv,$filter) {
    var self = $scope;
    self.isDisabled = true;
    self.delisDisabled = true;

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
            item.encodeDomainName = encodeURI(item.name);
            if(item.domainUid==localStorage.defaultdomainUid&&item.name=='default'){
                item.name = $translate.instant('aws.common.defaultDepar');
            };
            item.createTimeStr = $filter('date')(item.createTime,'yyyy-MM-dd');
            item.searchTerm = [item.name , item.description,item.createTimeStr].join('\b');
        });
        self.tableParams = new NgTableParams({ count: GLOBAL_CONFIG.PAGESIZE }, { counts: [], dataset: data });
        var tableId = "id";
        checkedSrv.checkDo(self, data, tableId);
    }

    self.refreshDep = function() {
        getDepartment();
    };

    self.applyGlobalSearch = function() {
        var term = self.globalSearchTerm;
        self.tableParams.filter({ searchTerm: term });
    };

    self.$watch(function() {
        return self.checkedItems;
    }, function(value) {
        if (value && value.length) {
            value.map(function(item) {
                if (item.domainUid==localStorage.defaultdomainUid) {
                    self.delisDisabled = true;
                    self.notDelTip = $translate.instant("aws.depart.table.dep_not_del");
                }
            });
        }
    });
    self.updateDepart = function(type, editData) {
        $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: "creatDepart.html",
            controller: "createDepartCtrl",
            resolve: {
                getDepartment: function() {
                    return getDepartment;
                },
                editData: function() {
                    return editData;
                },
                type: function() {
                    return type;
                }
            }
        });
    };
    self.del = function(checkedItems) {
        var content = {
            target: "delDepart",
            msg: "<span>" + $translate.instant("aws.depart.del_depart") + "</span>",
            data: checkedItems
        };
        self.$emit("delete", content);
    };
    self.$on("delDepart", function(e, data) {
        var delGroup = [],
            domainGrop = [];
        var postData = { ids: delGroup, uids: domainGrop };
        _.forEach(data, function(group) {
            delGroup.push(group.id);
            domainGrop.push(group.domainUid);
        });
        departmentDataSrv.delDepart(postData).then(function() {
            getDepartment();
        });
    });

    getDepartment();
    self.$watch(function() {
        return $routeParams.id;
    }, function(value) {
        self.detailIn = value ? true : false;
    });

    self.$on("getDetail", function(event, valueData) {
        var value = valueData.split("_")[0];
        self.decodeDomainName = decodeURI(valueData.split("_")[1]);
        self.showpie =false;
        function getDepartmentDetail() {
            self.domainUid=value;
            getQuotaTotal();
            getProject();
        }
        self.depDetailInsPieChart = {};

        function getProject() {
            depviewsrv.getProjectData(self.domainUid).then(function(data) {  
                data?self.loadData = true:"";
                depviewsrv.ProjectAllData = data.data;
                if(data && data.data){
                    successFuncDetail(data.data);
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
                quota.icon="icon-aw-internet1";
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
                self.depDetailInsPieChart = new PiePanelDefault();
                self.depDetailInsPieChart.panels.data = [
                    {name:$translate.instant("aws.overview.inUsed"),value:self.insData.used},
                    {name:$translate.instant("aws.overview.unUsed"),value:self.insData.total-self.insData.used>=0?self.insData.total-self.insData.used:0}
                ];
                self.depDetailInsPieChart.panels.pieType = "percent";
                self.depDetailInsPieChart.panels.colors = ["#1ABC9C","#e5e5e5"];  
            });
        }
        function successFuncDetail(data) {
            data.map(function(item){
                item.searchTerm = [item.name, item.description].join('\b');
            });
            self.projectTable = new NgTableParams({ count: GLOBAL_CONFIG.PAGESIZE }, { counts: [], dataset: data });
            self.applyGlobalSearch = function() {
                var term = self.globalSearchTerm;
                self.projectTable.filter({searchTerm: term });
            };
            var tableId = "projectUid";
            //checkedSrv.checkDo(self, data, tableId,'projectTable');
        }
        getDepartmentDetail();
    })

}]);
depModule.controller("createDepartCtrl", function($scope,$rootScope, $uibModalInstance, $translate, departmentDataSrv, editData, depviewsrv, getDepartment, $route, type) {
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
                if(type == 'edit'){
                    //getMaxProHardlimitOfDepartment(editData.domainUid);
                    getCheckQuotaType(editData.domainUid);
                }
            } else {
                self.canEditQuotas = [];
            }
        })
    }
    //获取部门中配额最大的项目
    function  getMaxProHardlimitOfDepartment(domainId){
        departmentDataSrv.getMaxProHardlimitOfDepartment(domainId).then(function(result){
            if(result && result.data){ 
                self.canEditQuotas.forEach((x)=>{
                    x.proHardLimitMax = result.data[x.name]
                    if(x.name=="ram"){
                        x.proHardLimitMax=parseInt((result.data[x.name])/1024);
                    }
                })
            }   
        })
    }
    function getCheckQuotaType(domainId){
        //假设api(开返回的是部门下所有项目的总配额数，关返回的是部门下配额最大的项目数)
        departmentDataSrv.getDomainSwitchInfo(domainId).then(function(result){
             if(result&&result.data&&angular.isObject(result.data)){
                 //判断配额开关状态
                 if(result.data.switch==0){
                    self.narrowSwitch=false;
                 }else if(result.data.switch==1){
                    self.narrowSwitch=true;
                 }
                 let arr=result.data.quota;
                 self.canEditQuotas.forEach(function(item){
                     arr.forEach(function(resultItem){
                          if(item.name==resultItem.name){
                             item.proHardLimitMax = resultItem.hardLimit;
                             if(item.name=="ram"){
                                item.proHardLimitMax=parseInt((resultItem.hardLimit)/1024);
                             }
                          }
                     });
                 });
             }
        });
    }

    switch (type) {
    case "new":
        self.handleType='new';
        self.departTitle = $translate.instant("aws.depart.new_depart");
        getCanEditQuota();
        self.getCanEditQuota = function(){
            getCanEditQuota() ;
        }
        self.domain = { name: "", description: "", enabled: true };
        self.confirmDep = function() {
            if (self.createDepForm.$valid) {
                var newQuotas = [];
                _.forEach(angular.copy(self.canEditQuotas), function(item) {
                    delete item["id"];
                    if(item.name=="ram"){
                        item.hardLimit=(item.hardLimit)*1024;
                    }
                    newQuotas.push(item);
                });
                var postParams = { domain: self.domain, quotas: newQuotas };
                depviewsrv.createDep(postParams).then(function(result) {
                    getDepartment();
                });  
 
                $uibModalInstance.dismiss("cancel");
            } else {
                self.submitted = true;
            }
        };
        break;
    case "edit":
        self.handleType='edit';
        self.getDepConfig = false;
        getCanEditById();
        self.getCanEditQuota = function(){
            getCanEditById()
        }
        var editDepData = angular.copy(editData);
        var domainData={
            enterpriseUid:localStorage.enterpriseUid,
            domainUid:editData.domainUid
        }
        //获取部门下已经使用的资源数
        departmentDataSrv.getDomain(domainData).then(function(result){
            if(result&&result.data){
                self.limitDomain =  result.data
                self.limitDomain.ram=parseInt((self.limitDomain.ram)/1024);
            }
        })
        if (editDepData.domainUid==localStorage.defaultdomainUid) {
            self.notEditName = true;
            self.notEditTip = $translate.instant("aws.depart.table.dep_not_edit");
        }
        self.domain = editDepData;
        self.departTitle = $translate.instant("aws.depart.edit_depart");
        self.confirmDep = function() {
            if (self.createDepForm.$valid) {
                var newQuotas = [];
                _.forEach(angular.copy(self.canEditQuotas), function(item) {
                    delete item["id"];
                    item.domainUid = editDepData.domainUid;
                    if(item.name=="ram"){
                        item.hardLimit=(item.hardLimit)*1024;
                    }
                    newQuotas.push(item);
                });
                var domainData = angular.copy(self.domain);
                if(domainData.domainUid=="default"){
                    domainData.name = "default"
                }
                var postParams = { domain:domainData , quotas: newQuotas };
                departmentDataSrv.checkDomainQuota(editData.domainUid,postParams).then(function(res){
                    getDepartment();
                });
                $uibModalInstance.dismiss("cancel");
            } else {
                self.submitted = true;
            }
        };

        break;
    }
    //编辑时部门下面的已使用资源总数
}).directive("quotadomain",function(){
    return {
        restrict:"A",
        require:"ngModel",
        scope:{
            limitdomain:"=",
            switchtype:"=",
            quotaname:"="
        },
        link:function(scope,elem,attrs,ngModel){
            //配额开关开时不需要进行这个校验
            if(scope.switchtype){
               return;
            }
            //新建时不需要判断
            ngModel.$parsers.push(function(viewValue){
                if(viewValue){
                    if(viewValue*1<scope.limitdomain[scope.quotaname]*1){
                        ngModel.$setValidity("quotadomain",false);
                    }else{
                        ngModel.$setValidity("quotadomain",true);
                    }
                   
                }else{
                    ngModel.$setValidity("quotadomain",false);
                }
                return viewValue;
            });

        }
    };
});
//编辑时部门下项目对应资源的最大数（开关未打开）
depModule.directive("quotadomainpromax",function(){
    return {
        restrict:"A",
        require:"ngModel",
        link:function(scope,ele,attrs,creatProCtrl){    
            function quotadomainpromaxfunc(viewValue){
                if(typeof(scope.quota.proHardLimitMax) != undefined&&Number(viewValue)<Number(scope.quota.proHardLimitMax)&&viewValue!=0){
                    creatProCtrl.$setValidity("quotadomainpromax",false);
                }else{
                    creatProCtrl.$setValidity("quotadomainpromax",true);
                }
                return viewValue;
            }
            //tempVaildQuotainused(scope.quota.hardLimit);
            creatProCtrl.$parsers.push(quotadomainpromaxfunc);
            scope.$watch(function(){
               return scope.quota.proHardLimitMax;
            },function(max){
               if(max){
                  if(creatProCtrl.$viewValue&&Number(creatProCtrl.$viewValue)!=0&&Number(creatProCtrl.$viewValue)<Number(max)){
                     creatProCtrl.$setValidity("quotadomainpromax",false);
                  }else{
                     creatProCtrl.$setValidity("quotadomainpromax",true);
                  }
               }else{
                  creatProCtrl.$setValidity("quotadomainpromax",true);
               }
            });
        }
    };
});
//新建和编辑的最大数限制
depModule.directive("availquota2", function() {
    return {
        restrict: "A",
        require: "ngModel",
        link: function(scope, ele, attrs, createDepartCtrl) {
            function tempVaildQuota2(viewValue) {

                if(createDepartCtrl.$name == 'ram'){
                    if (viewValue*1024 > 2147483647 && viewValue*1024 != 0) {
                        createDepartCtrl.$setValidity("availquota2", false);
                    } else {
                        createDepartCtrl.$setValidity("availquota2", true);
                    }
                    return viewValue;
                }else{
                    if (viewValue > 2147483647 && viewValue != 0) {
                        createDepartCtrl.$setValidity("availquota2", false);
                    } else {
                        createDepartCtrl.$setValidity("availquota2", true);
                    }
                    return viewValue;
                }
                
            }
            tempVaildQuota2(scope.quota.hardLimit);
            createDepartCtrl.$parsers.push(tempVaildQuota2);
        }
    };
});
depModule.directive("repeatname1", ["$timeout","$translate" ,"$window", "depviewsrv", function($timeout,$translate, $window, depviewsrv) {
    return {
        restrict: "A",
        require: "ngModel",
        link: function(scope, ele, attrs, createDepCtrl) {
            var tempName = scope.domain.name;
            scope.$watch(attrs.ngModel, function(depName) {
                if(depName){
                    if(depName == $translate.instant('aws.common.defaultDepar')){
                        depName = 'default'
                    } 
                }else{
                    return  
                }
                $timeout.cancel($window.timer);
                $window.timer = $timeout(function() {
                    if (tempName) {
                        if (tempName == depName||tempName== $translate.instant('aws.common.defaultDepar')) {
                            createDepCtrl.$setValidity("repeatname1", true);
                        } else {
                            depviewsrv.depNameIsUsed({ name: depName }).then(function(result) {
                                if (result) {
                                    createDepCtrl.$setValidity("repeatname1", !result.data);
                                }
                            });
                        }
                    } else {
                        depviewsrv.depNameIsUsed({ name: depName }).then(function(result) {
                            if (result) {
                                createDepCtrl.$setValidity("repeatname1", !result.data);
                            }
                        });
                    }
                }, 1000);
            });
        }
    };
}]);
