import "../services/easyProjectSrv";
import "../../department/depviewSrv";
easyProjectCtrl.$inject=['$scope','$http', '$filter','$location','$rootScope', '$uibModalInstance', '$translate', 'depviewsrv','$route', 'easyProjectSrv'];
export function easyProjectCtrl($scope,$http,$filter,$location,$rootScope,$uibModalInstance,$translate,depviewsrv, $route, projectDataSrv){
    var self = $scope;
    var filter = $filter;
    var rootScope = $rootScope;
    self.submitted = false;
    self.showQuota = false;
    self.confirm_dis = false;
    self.interactedName = function(field) {
        return self.submitted || field.$dirty;
    };
    self.invalid = {};
    self.required = {};
    self.tempVaild = {};
    self.depList = []
    self.curDep = {
        selected: null
    }
    self.isNew = false;
    self.isEdit = false;
    function initDepart() {
        self.project = { name: "", description: "", enabled: true, domainUid: null };
        self.canCheckDer = false;
        projectDataSrv.getDepart().then(function(res) {
            if (res && res.data && res.data.length > 0) {
                self.depList = res.data;
                self.curDep.selected = self.depList[0];
                /*新建用户时部门不让选*/
                if(self.rememberDomain){
                    self.rememberDomain.neName = self.rememberDomain.name;
                    self.curDep.selected = self.rememberDomain;
                }
                self.depList.forEach(item => {
                    if (item.domainUid.toLowerCase() == "default") {
                        item.neName = $translate.instant("aws.common.defaultDepar");
                        if(localStorage.managementRole==2){
                            self.curDep.selected = item;
                        }
                        /*新建用户时部门不让选*/
                        if(self.rememberDomain){
                            self.rememberDomain.neName = self.rememberDomain.name;
                            self.curDep.selected = self.rememberDomain;
                        }

                    } else {
                        item.neName = item.name;
                    }
                    if(localStorage.managementRole==3&&item.domainUid==localStorage.defaultdomainUid){
                        self.curDep.selected = item;
                        self.canCheckDer = true;
                    }
                })
                self.project.domainUid = self.curDep.selected.domainUid
                getCanEditQuota(self.curDep.selected.domainUid);
            }
        })
    }
    self.changeDepart = function(item) {
        getCanEditQuota(item.domainUid);
        self.project.domainUid = item.domainUid;
        self.showQuota = true;
        self.showQuota = false;
    }
    function getProject() {
        if(localStorage.managementRole=='3'){
            var params={
                domainUid:localStorage.domainUid
            }
        }else{
            var params={}
        }
        depviewsrv.getProjectDataAll(params).then(function(data) {
            if(data&&data.data){
                /*目前产品默认部门和项目的位移标识不明确先写死*/
                data.data.map(function(item){
                    if(item.domainUid=='default'&&item.name=="admin"){
                        item.name = $translate.instant('aws.common.defaultProject');
                    }
                })
                var adminData ={name:"admin"}
                depviewsrv.ProjectAllData = angular.copy(data.data); 
                depviewsrv.ProjectAllData.push(adminData)
            }
            
        });
    }
    getProject()

    function getProQuotaInfo(domainId){
        //假设api
        projectDataSrv.getProjectSwitchInfo(domainId).then(function(result) {
            console.log(result.data,"获取所有资源可以编辑的最大数");
            if(result&&result.data&&angular.isObject(result.data)){
                 if(result.data.switch==0){
                    self.narrowSwitch=false;
                 }else if(result.data.switch==1){
                    self.narrowSwitch=true;
                 }
                 let arr=result.data.quota;
                 _.forEach(self.canEditQuotas, function(quota) {
                    if (quota.name == "ram") {
                        /*获取默认配额的数据处理*/
                        quota.hardLimit = parseInt((quota.hardLimit) / 1024);

                    }
                    _.forEach(arr, function(item) {
                        if (quota.name == item.name) {
                            if (item.name == "ram") {
                                /*部门配额数据处理*/
                                item.hardLimit = parseInt((item.hardLimit) / 1024);
                            }
                            quota.availQuota = item.hardLimit;
                        }
                    });
                });
                self.showQuota = true;
            }else{
                self.showQuota = false;
            }

        });
    }


    function getCanEditQuota(domainId) {
        depviewsrv.getProQuota().then(function(result) {
            if (result && result.data) {
                self.getDepConfig = true;
                if (!rootScope.L3) {
                    result.data = result.data.filter(item => {
                        return item.name != "floatingip";
                    });
                }
                self.canEditQuotas = result.data;
            } else {
                self.canEditQuotas = [];
            }

        }).then(function() {
            getProQuotaInfo(domainId);
        });
    }    
    self.isNew = true;
    self.projectTitle = $translate.instant("aws.project.newproject");
    initDepart();
    self.getCanEditQuota = function() {
        initDepart();
    }
    self.confirmPro = function() {
        if (self.projectName.$valid) {
            self.confirm_dis = true;
            var newProQuotas = [];
            _.forEach(angular.copy(self.canEditQuotas), function(item) {
                delete item["id"];
                item.domainUid = self.curDep.selected.domainUid;
                if (item.name == "ram") {
                    item.hardLimit = (item.hardLimit) * 1024;
                }
                newProQuotas.push(item);
            });
            var postParams = { project: self.project, quotas: newProQuotas };
            self.canSubmit = true;
            projectDataSrv.checkProjectQuota(postParams).then(function(res){
                if(res&&res.data&&res.data.project){
                    self.$emit('project-refresh',res.data);
                    self.$emit('region-refresh',{type:"project"});
                    if($location.path()=='/permit/project'||$location.path()=='/permit/overview'){
                        $route.reload();
                    }else if($location.path()=='/quickconfig/createins'){
                        self.$emit('get-create',{type:"project"});
                    }
                    //更新部门管理员登录时有无项目的菜单显示视图
                    if(localStorage.managementRole==3&&localStorage.noProject==1){
                        rootScope.openStackMenu.child[0].child.forEach(menu=>{
                            menu.noShow=1;
                        })
                        localStorage.noProject = 2;
                        localStorage.projectName = res.data.project.name;//项目Name
                        localStorage.projectUid = res.data.project.projectUid;//项目Uid
                    }
                }
            }).finally(function(){
                self.canSubmit = false;
                $uibModalInstance.dismiss("cancel");
            });
            
        } else {
            self.submitted = true;
        }
    };
}