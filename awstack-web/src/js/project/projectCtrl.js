import "./projectSrv";
import "../department/departmentSrv";
import "../user/userDataSrv";
import "../roles/roleDataSrv";
import "../department/depviewSrv"

import "../cvm/overview/cvmViewSrv";
import "../monitor/alarmManagement/alarmEventSrv";
import {PiePanelDefault} from"../chartpanel";

var projectModule = angular.module("projectctrl", ["peojectsrv","cvmViewSrv","alarmEventSrvModule" ,"depviewsrv", "departmentsrv", "angularjs-dropdown-multiselect"])
projectModule.controller("ProjectCtrl", ['$scope','$routeParams' ,'$filter','cvmViewSrv','alarmEventSrv', '$rootScope', 'NgTableParams', '$translate', 'checkedSrv', '$uibModal', 'departmentDataSrv', 'projectDataSrv', 'depviewsrv', 'userDataSrv', '$location', '$route', 'GLOBAL_CONFIG',
    function($scope,$routeParams, $filter,cvmViewSrv,alarmEventSrv, $rootScope, NgTableParams, $translate, checkedSrv, $uibModal, departmentDataSrv, projectDataSrv, depviewsrv, userDataSrv, $location, $route, GLOBAL_CONFIG) {
        var self = $scope;
        var scope = $scope;
        var filter = $filter;
        self.$watch(function() {
            return $routeParams.id;
        }, function(value) {
            self.detailIn = value ? true : false;
        });
        $scope.$on("getDetail", function(event, valueData) {
            var value = valueData.split("_")[0];
            var domainUid = valueData.split("_")[1];
            self.projectNames = decodeURI(valueData.split("_")[2]);
            self.pieshow=false;
            self.headers = {
                "name": $translate.instant("aws.users.userName"),
                "role": $translate.instant("aws.users.role")
            };

            //获取用户列表
            function getProUserList(){
                cvmViewSrv.getProUserTableData(value).then(function(result) {
                    result?self.userDetailLoadData = true:"";
                    if(result && result.data){
                        result.data.map(function(item){
                            item.role=item.roleidlist[0].name;
                        });
                        userDataSrv.userTableAllData = result.data;
                        self.userDetailTableParams = new NgTableParams({ count: 5 }, { counts: [], dataset: result.data });
                    }
                });    
            }
            //根据切换头部的project来获取当前用户在该项目的角色。localStorage.rolename在common.js里面
            scope.$watch(function(){
                return localStorage.rolename;
            },function(val){
                if(val){
                    lisrProUserList();
                }
            });
            function lisrProUserList(){
                if(scope.ADMIN || scope.DOMAIN_ADMIN){
                    scope.showUerList =true;
                    getProUserList();
                }else if(localStorage.rolename != "_member_" && localStorage.rolename != "member"){
                    scope.showUerList =true;
                    getProUserList();
                }else{
                    scope.showUerList = false;
                }
            }
            
            scope.instancesquota={};
            scope.coresquota = {icon:"icon-aw-cpu",type:$translate.instant("aws.cvmview.cpu_unit"),"usedText":$translate.instant("aws.cvmview.used"),used:0};
            scope.ramquota = {icon:"icon-aw-ram",type:$translate.instant("aws.cvmview.ram_unit"),"usedText":$translate.instant("aws.cvmview.used"),used:0};
            scope.snapshotsquota = {icon:"icon-aw-camera",type:$translate.instant("aws.cvmview.snap_unit"),"usedText":$translate.instant("aws.cvmview.used"),used:0};
            scope.floatingipquota = {icon:"icon-aw-internet1",type:$translate.instant("aws.cvmview.fip_unit"),"usedText":$translate.instant("aws.cvmview.used"),used:0};
            scope.counts = {
                projectserverscount : {name:$translate.instant("aws.cvmview.ins_num"),bar_type:"height","normalText":$translate.instant("aws.cvmview.normal"),"abnormalText":$translate.instant("aws.cvmview.abnormal")},
                projectNetworksCount: {name:$translate.instant("aws.cvmview.net_num"),bar_type:"height","normalText":$translate.instant("aws.cvmview.normal"),"abnormalText":$translate.instant("aws.cvmview.abnormal")},
                routerscount : {name:$translate.instant("aws.cvmview.router_num"),bar_type:"height","normalText":$translate.instant("aws.cvmview.normal"),"abnormalText":$translate.instant("aws.cvmview.abnormal")},
                volumescount : {name:$translate.instant("aws.cvmview.volume_num"),bar_type:"height","normalText":$translate.instant("aws.cvmview.normal"),"abnormalText":$translate.instant("aws.cvmview.abnormal")}
            };
            //获取项目配额和使用量
            function getQuotas(){
                var postData= {
                    type:"project_quota",
                    targetId:value,
                    enterpriseUid:localStorage.enterpriseUid
                };
                
                if(localStorage.projectUid){
                    cvmViewSrv.getproQuotas(postData).then(function(result){
                        if(result && result.data && result.data.length){
                            _.forEach(result.data,function(item){
                                if(item.name =="instances" ||item.name =="cores"||item.name=="ram"||item.name=="floatingip"||item.name=="snapshots"){
                                    scope[item.name+"quota"].total = item.defaultQuota || item.hardLimit;
                                    if(item.name=="ram"){
                                        scope[item.name+"quota"].total = (scope[item.name+"quota"].total/1024).toFixed(1);
                                    }
                                }
                            });
                            getused();
                        }
                    });
                }
                
            }
            function getused(){
                var postData= {
                    type:"project_quota",
                    projectUid:value,
                    enterpriseUid:localStorage.enterpriseUid,
                    domainUid:domainUid
                };
                cvmViewSrv.getProused(postData).then(function(result){
                    _.forEach(result.data,function(item){
                        if(item.name =="instances" ||item.name =="cores"||item.name=="ram"||item.name=="floatingip"||item.name=="snapshots"){
                            scope[item.name+"quota"].used = item.inUse ;
                            if(item.name=="ram"){
                                var ram = scope[item.name+"quota"].used/1024;
                                if(ram.toString().split(".")[1] && ram.toString().split(".")[1].length>1){
                                    scope[item.name+"quota"].used = ram.toFixed(1);
                                }else{
                                    scope[item.name+"quota"].used = ram;
                                }
                            }    
                        }
                    });
                    self.pieshow = true;
                    self.cvmViewInsPieChart = new PiePanelDefault();
                    self.cvmViewInsPieChart.panels.data = [
                        {name:$translate.instant("aws.overview.inUsed"),value:scope.instancesquota.used?scope.instancesquota.used:0},
                        {name:$translate.instant("aws.overview.unUsed"),value:(scope.instancesquota.total-scope.instancesquota.used)?scope.instancesquota.total-scope.instancesquota.used:0}
                    ];
                    self.cvmViewInsPieChart.panels.pieType = "percent";
                    self.cvmViewInsPieChart.panels.colors = ["#1ABC9C","#e5e5e5"]; 
                });
                                
            }
            getQuotas();

            //获取不同资源的数量
            
            function getresCount(name){
                var header = {
                    domain_id:domainUid,
                    project_id:value
                }
                projectDataSrv.getResCont(name,header).then(function(result){
                    // scope.name = true;
                    // scope[name]= scope.counts[name];
                    // scope[name].total= result.data.total ||0;
                    // scope[name].success= result.data.success||0 ;
                    // scope[name].error= result.data.error ||0;
                    scope[name] =  {
                    "colors":
                        [
                            "#51a3ff",
                            "#f39c12",
                            "#e74c3c",
                            "#666666"
                        ],
                        "type":"pie",
                        "width":200,
                        "height":200,
                        "outerRadius":75,
                        "innerRadius":50,
                        "total":result.data.total,
                        "data":[
                            {"name":'正常',"value":result.data.success,"status":"success"},
                            {"name":"异常","value":result.data.error,"status":"error"}
                        ],
                        "title":"",
                        "id":"",
                        "pieType":"category",
                        "progressRate":true
                    }
                });
            }
            getresCount("projectserverscount");
            getresCount("projectNetworksCount");
            getresCount("routerscount");
            getresCount("volumescount");

            function formateTableData(item){
                if(item.alarmType == "threshold"){
                    item._alarmType = $translate.instant("aws.monitor.alarmModule.threshold");
                }else if(item.alarmType == "healthcheck"){
                    item._alarmType = $translate.instant("aws.monitor.alarmModule.healthcheck");
                }else if(item.alarmType == "computeha"){
                    item._alarmType = $translate.instant("aws.monitor.alarmModule.computeha");
                }
                if(item.severity == "critical"){
                    item.severity = $translate.instant("aws.monitor.alarmModule.critical");
                }else if(item.severity == "moderate"){
                    item.severity = $translate.instant("aws.monitor.alarmModule.moderate");
                }else if(item.severity == "low"){
                    item.severity = $translate.instant("aws.monitor.alarmModule.low");
                }
            }

            // alarmEventSrv.getNewAlarm({
            //     status:"new",
            //     //projectId:localStorage.projectUid,
            //     //enterpriseId:localStorage.enterpriseUid
            // }).then(function(result){
            //     self.newAlarms_data = [];
            //     if(result && result.data){
            //         if(result.data.length>5){
            //             _.map(result.data, function(item,i) {
            //                 formateTableData(item);
            //                 if(i>4){return;}
            //                 self.newAlarms_data.push({
            //                     hostname:item.hostname,
            //                     _alarmType:item._alarmType,
            //                     alarmType:item.alarmType,
            //                     severity:item.severity,
            //                     createtime:item.createtime
            //                 });
            //             });
            //         }else{
            //             self.newAlarms_data = _.map(result.data, function(item) {
            //                 formateTableData(item);
            //                 return item;
            //             });
            //         }
            //     }
            // });
        });




        
        self.isDisabled = true;
        self.delisDisabled = true;
        self.gotoCvm = function(m, n, v) {
            $location.url("/cvm/cvmview");
            localStorage.domainName = self.domainName;
            localStorage.domainUid = v;
            localStorage.projectName = m;
            localStorage.projectUid = n;
        };

        function getDepartment() {
            self.domainUid = localStorage.domainUid;
            self.domainName = localStorage.domainName;
            getProject();
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
                data ? self.loadData = true : "";
                data.data.map(function(item){
                    /*目前产品默认部门和项目的位移标识不明确先写死*/
                    if(item.domainUid=='default'&&item.name=="admin"){
                        item.name = $translate.instant('aws.common.defaultProject');
                    }
                })
                var adminData ={name:"admin"}
                depviewsrv.ProjectAllData = angular.copy(data.data);
                depviewsrv.ProjectAllData.push(adminData);
                if (data && data.data) {
                    successFunc(data.data);
                    if(localStorage.managementRole=='3' && data && data.data&&data.data.length==0){
                        self.$emit("update-menu",{});
                    }
                }

            });
        }

        function successFunc(data) {            
            data.map(function(item) {
                item.enceodeProject = encodeURI(item.name);
                if(item.domainUid==localStorage.defaultdomainUid&&item.domainName=='default'){
                    item.domainNameNe = $translate.instant('aws.common.defaultDepar');
                }else{
                    item.domainNameNe = item.domainName;
                };
                if(item.projectUid==localStorage.defaultProjectUid&&item.name=='admin'){
                    item.nameNe = $translate.instant('aws.common.defaultProject');
                }else{
                    item.nameNe = item.name
                }
                item.createTimeStr = filter('date')(item.createTime,'yyyy-MM-dd');
                item.searchTerm = [item.nameNe , item.description , item.domainNameNe,item.createTimeStr].join('\b');
            });
            self.tableParams = new NgTableParams({ count: GLOBAL_CONFIG.PAGESIZE }, { counts: [], dataset: data });
            self.applyGlobalSearch = function() {
                var term = self.globalSearchTerm;
                self.tableParams.filter({ searchTerm: term });
            };
            var tableId = "projectUid";
            checkedSrv.checkDo(self, data, tableId);
        }

        self.$watch(function() {
            return self.checkedItems;
        }, function(value) {
            if (value && value.length > 0) {
                value.map(function(item) {
                    if (item.projectUid==localStorage.defaultProjectUid&&item.name=='admin') {
                        self.delisDisabled = true;
                        //self.notDelTip = $translate.instant('aws.depart.table.dep_not_del');
                    }
                });
                if (value.length != 1) {
                    self.delisDisabled = true;
                }
            }
        });
        getDepartment();
        self.refresh = function(){
            getDepartment();
        }
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
                    domainUid: function() {
                        return self.domainUid;
                    },
                    type: function() {
                        return type;
                    },
                    editData: function() {
                        return editData;
                    },
                    context:function(){
                        return self;
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
                    let pro_name = checkedItems[0].name;
                    if (result && result.data && result.data[pro_name]) {
                        function objToStrMap(obj) {
                            let strMap = new Map();
                            for (let k of Object.keys(obj)) {
                                strMap.set(k, obj[k]);
                            }
                            return strMap;
                        }
                        let newmap = objToStrMap(result.data[pro_name]);
                        //let error_info=$translate.instant("aws.project.del.error_info_prefix");
                        let error_info = pro_name + $translate.instant("aws.project.del.error_info_prefix") + "</br>"
                        let error_array = [];
                        for (let [key, value] of newmap) {
                            error_info = error_info + $translate.instant("aws.project.del.resource." + key) + ":" + value + "，"
                                //error_info=error_info+value+$translate.instant("aws.project.del.unit")+$translate.instant("aws.project.del.resource."+key)+"、";
                        }
                        error_info = error_info.substring(0, error_info.length - 1);
                        //error_info=error_info+$translate.instant("aws.project.del.error_info_suffix");
                        let cont = {
                            target: "delete_project",
                            msg: "<span>" + error_info + "</span>",
                            data: checkedItems
                        };
                        self.$emit("delete_error", cont);
                        self.$on("delete_project", function(e, data) {

                        });
                    }else if(result && !result.data){

                    }
                    if(pro_name==localStorage.projectName){
                       $scope.$emit('delete-current-project','delete') 
                    }
                    getProject()
                });
            });
        };
        //分配用户
        self.allocateUser = function(type, editData) {
            var scope = $rootScope.$new();
            var userModal = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: "allocateUser.html",
                scope: scope
            });
            userModal.opened.then(function() {
                depviewsrv.getDomainUsers(editData.domainUid).then(function(result) {
                    if (result && result.data && result.data.length) {
                        return result.data = result.data.filter(function(item) {
                            return (item.managementRole > 3); //过滤掉admin用户和登进来的domain_admin用户
                        });
                    } else {
                        result.data = [];
                    }
                }).then(function(data) {
                    projectDataSrv.usersInProject(editData.projectUid).then(function(result) {
                        if (result && result.data && result.data.length) {
                            result.data = result.data.filter(function(obj) {
                                return obj.name != "admin";
                            });
                            _.forEach(result.data, function(per) {
                                _.forEach(per.roleidlist, function(val) {
                                    val.name = $translate.instant("aws.users.cu.roles." + val.name);
                                });
                                _.remove(data, function(item) {
                                    return (item.userUid == per.userUid);
                                });
                            });
                            scope.users = data;
                            scope.havedUsers2 = angular.copy(result.data);
                            scope.havedUsers = result.data;
                        } else {
                            scope.users = data;
                            scope.havedUsers2 = [];
                            scope.havedUsers = [];
                        }

                    });
                    scope.example5settings = { displayProp: "name", idProp: "id", externalIdProp: "" };
                    scope.example5customTexts = { buttonDefaultText: "Select" };
                });
                userDataSrv.getRolesData().then(function(result) {
                    scope.roles = [];
                    if (result && result.data && result.data.length) {
                        result.data.map(function(role) {
                            if (role.name == "member" || role.name == "project_admin")
                                scope.roles.push(role);
                        });
                    }
                    scope.roles.map(role => { role.name = $translate.instant("aws.users.cu.roles." + role.name); });

                });
                scope.selectUserToProject = function(user) {
                    _.remove(scope.users, function(item) {
                        return item.userUid == user.userUid;
                    });
                    /*_.forEach(scope.roles,function(item){
                        if(item.name=="member"){
                            user.roleidlist=[{id:item.id,name:"member"}];
                        }
                    })*/
                    _.forEach(scope.roles, function(item) {
                        if (item.name == "普通用户") {
                            user.roleidlist = [{ id: item.id, name: item.name }];
                        }
                    });
                    scope.havedUsers.push(user);
                };
                scope.removeUserFromProject = function(havedUser) {
                    _.remove(scope.havedUsers, function(item) {
                        return item.userUid == havedUser.userUid;
                    });
                    havedUser.roleidlist = [];
                    scope.users.push(havedUser);
                };
            });
            userModal.result.then(function() {
                // 判断用户的角色数组中哪些是新加的，哪些是被删除的

                function isAddOrDelete(newData, oldData) {
                    var deleteRoles = [];
                    var reData = [];
                    var addRoles = [];
                    var length = angular.copy(oldData).length;
                    var k = 0;
                    for (var i = 0; i < newData.length; i++) {

                        for (var j = 0; j < oldData.length + k; j++) {
                            if (newData[i] == oldData[j]) {
                                oldData.splice(j, 1);
                                k++;
                                break;
                            }
                        }
                        if (j == length) {
                            addRoles.push(newData[i]);
                        }
                    }
                    deleteRoles = oldData;
                    reData.push(addRoles);
                    reData.push(deleteRoles);
                    return reData;
                }

                function convertUser(obj) {
                    //由于使用了angularjs-dropdown-multiselect插件，选中用户角色后以字典对象保存，把它转化成字符串。

                    _.forEach(obj, function(item) {
                        item.userid = item.userUid;
                        for (var i = 0; i < item.roleidlist.length; i++) {
                            if (typeof(item.roleidlist[i]) != "string") {
                                item.roleidlist.push(item.roleidlist[i].id);
                                item.roleidlist.splice(i, 1);
                                //由于item.roleidlist被删除了一项，被删除的数据会向前移位，为防止有的数据没有进入循环，使索引值减少1
                                i--;
                            }
                        }
                    });
                    return obj;
                }
                scope.havedUsers = convertUser(scope.havedUsers);
                scope.havedUsers2 = convertUser(scope.havedUsers2);

                //deleteUser保存的是被删除的用户。
                var deleteUser = [];

                for (var i = 0; i < scope.havedUsers2.length; i++) {
                    for (var j = 0; j < scope.havedUsers.length; j++) {
                        if (scope.havedUsers2[i].userid == scope.havedUsers[j].userid) {
                            break;
                        }
                    }
                    if (j == scope.havedUsers.length) {
                        deleteUser.push(scope.havedUsers2[i]);
                    }
                }

                var postParams = [];
                for (var ii = 0; ii < scope.havedUsers.length; ii++) {
                    for (var jj = 0; jj < scope.havedUsers2.length; jj++) {
                        if (scope.havedUsers[ii].userid == scope.havedUsers2[jj].userid) {
                            var reData = isAddOrDelete(scope.havedUsers[ii].roleidlist, scope.havedUsers2[jj].roleidlist);
                            scope.havedUsers[ii].oper = "add";
                            scope.havedUsers[ii].roleidlist = reData[0];
                            postParams.push(scope.havedUsers[ii]);
                            var newItem = angular.copy(scope.havedUsers[ii]);
                            newItem.oper = "remove";
                            newItem.roleidlist = reData[1];
                            postParams.push(newItem);
                            break;
                        }
                    }
                    if (jj == scope.havedUsers2.length) {
                        scope.havedUsers[ii].oper = "add";
                        postParams.push(scope.havedUsers[ii]);
                    }
                }
                _.forEach(deleteUser, function(item) {
                    item.oper = "remove";
                    postParams.push(item);
                });
                var paramsData = _.filter(postParams, function(item) {
                    return item.roleidlist.length > 0;
                });
                if (paramsData.length > 0) {
                    projectDataSrv.addUserToProject(editData.projectUid, postParams).then(function() {
                        getProject();
                    });
                }
            });
        };
    }
]);
projectModule.controller("creatProCtrl", ['$scope', '$filter', '$rootScope', '$uibModalInstance', 'type', '$translate', 'depviewsrv', 'editData', 'getProject', 'domainUid', 'getDepartment', '$route', 'projectDataSrv','context', function($scope, $filter, $rootScope, $uibModalInstance, type, $translate, depviewsrv, editData, getProject, domainUid, getDepartment, $route, projectDataSrv,context) {
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
                self.depList.forEach(item => {
                    if (item.domainUid.toLowerCase() == "default") {
                        item.neName = $translate.instant("aws.common.defaultDepar");
                        if(localStorage.managementRole==2){
                            self.curDep.selected = item;
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
    
    function getProQuotaInfo(domainId){
        let projectUid="";
        if(type == "edit"){
           projectUid=context.checkedItems[0].projectUid; 
        }
        projectDataSrv.getProjectSwitchInfo(domainId,type,projectUid).then(function(result) {
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
                            quota.availQuota = item.hardLimit<0?0:item.hardLimit;
                        }
                    });
                });
                if(type == "edit"){
                    getProQuotaUsedInfo(editData.projectUid,domainId);
                }
                self.showQuota = true;
            }else{
                self.showQuota = false;
            }

        });
    }

    function getProQuotaUsedInfo(projectId,domainId) {  //fixed AWSTACK-5477 编辑项目是校验使用量，不校验是否超出部门
        var postData = {
            type: "project_quota",
            domainUid: domainId,
            projectUid: projectId,
            enterpriseUid: localStorage.enterpriseUid
        };
        depviewsrv.getProUsed(postData).then(function(result){
            if (result && result.data && result.data.length) {
                _.forEach(self.canEditQuotas, function(quota) {
                    _.forEach(result.data, function(item) {
                        if (quota.name == item.name) {
                            if (item.name == "ram") {
                                /*部门配额数据处理*/
                                item.inUse = parseInt((item.inUse) / 1024);
                            }
                            quota.inUse = item.inUse;
                        }
                    });
                });
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


    function getCanEditById(domainId) {
        //编辑项目 
        if (editProData.domainUid.toLowerCase() == "default") {
            //如果
            self.curDep.selected = $translate.instant("aws.common.defaultDepar")
        } else {
            self.curDep.selected = editProData.domainName;
            //self.curDep.selected = editProData.domainUid;
        }
        depviewsrv.getProHave(editProData.projectUid).then(function(result) {
            self.canEditQuotas = [];
            if (result && result.data && result.data.length) {
                self.getDepConfig = true;
                _.forEach(result.data, function(item) {
                    self.canEditQuotas.push(item);
                });
                if (!rootScope.L3) {
                    self.canEditQuotas = self.canEditQuotas.filter(item => {
                        return item.name != "floatingip";
                    });
                }
            }
            getProQuotaInfo(domainId);
        });
    }
    switch (type) {
        case "new":
            self.isNew = true;
            self.projectTitle = $translate.instant("aws.project.newproject");
            initDepart();
            self.getCanEditQuota = function() {
                initDepart();
            }
            self.confirmPro = function() {
                if (self.projectName.$valid) {
                    $uibModalInstance.dismiss("cancel");
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
                    self.project.name = self.project.nameNe;
                    var postParams = { project: self.project, quotas: newProQuotas };
                    //先校验是否通过配额，再进行新建
                    projectDataSrv.checkProjectQuota(postParams).then(function(res){
                        if(res&&res.data&&res.data.project){
                            if(localStorage.managementRole==3&&localStorage.noProject==1){
                                rootScope.openStackMenu.child[0].child.forEach(menu=>{
                                    menu.noShow=1;
                                })
                                localStorage.noProject = 2;
                                localStorage.projectName = res.data.project.name;//项目Name
                                localStorage.projectUid = res.data.project.projectUid;//项目Uid
                            }
                            //getDepartment();
                            $route.reload(); 
                        } 
                    });
                } else {
                    self.submitted = true;
                }
            };
            break;
        case "edit":
            self.isEdit = true;
            self.projectTitle = $translate.instant("aws.project.editproject");
            self.project = { name: "", description: "", enabled: true, domainUid: editData.domainUid };
            var editProData = angular.copy(editData);
            self.getDepConfig = false;
            getCanEditById(editProData.domainUid);
            self.getCanEditQuota = function() {
                getCanEditById(editProData.domainUid)
            }
            if (editProData.projectUid==localStorage.defaultProjectUid){
                self.notEditName = true;
                self.notEditTip = $translate.instant("aws.depart.table.pro_not_edit");
            }
            self.project = editProData;

            self.confirmPro = function() {
                if (self.projectName.$valid) {
                    $uibModalInstance.dismiss("cancel");
                    var newProQuotas = [];
                    _.forEach(angular.copy(self.canEditQuotas), function(item) {
                        delete item["id"];
                        item.projectUid = editProData.projectUid;
                        if (item.name == "ram") {
                            item.hardLimit = (item.hardLimit) * 1024;
                        }
                        newProQuotas.push(item);
                    });
                    self.project.name = self.project.nameNe;
                    /*当是默认项目时编辑数据替换*/
                    if(self.project.domainUid == 'default' && self.project.name == $translate.instant('aws.common.defaultProject')){
                        self.project.name = 'admin';
                    }
                    var putParams = { project: self.project, quotas: newProQuotas };
                    //先校验是否通过配额，再进行新建
                    projectDataSrv.checkProjectQuota(putParams).then(function(res){
                        getDepartment();
                    });
                } else {
                    self.submitted = true;
                }
            };
            break;
    }
}])
