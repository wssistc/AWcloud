import "../../user/userDataSrv";
import "../../roles/roleDataSrv";

easyUserCtrl.$inject=["$scope", "$rootScope","$route", "NgTableParams","userDataSrv","$uibModal","$translate","roleDataSrv","$uibModalInstance","$location"];
export function easyUserCtrl($scope, $rootScope,$route, NgTableParams, userDataSrv, $uibModal, $translate,roleDataSrv,$uibModalInstance,$location){
var scope = $scope;
    scope.patternMsg = $translate.instant('aws.register.info.special_8_16');
    scope.inStep= 1;
    scope.inStepOneBar = 0;
    scope.inStepTwoBar = 1;
    scope.inStepThreeBar = 2;
    scope.stepTo = function(m,check){
        /*可能项目没有*/
        if(check){
            if(scope.userForm.selectedProject==''){
                scope.projectCheck = true;    
            }else{
                scope.inStep= m;
                scope.projectCheck = false; 
            }
        }else{
            scope.inStep= m;
            scope.projectCheck = false; 
        } 
    }
    scope.rememberDomainFun = function(){
        scope.$emit('remember-domain',scope.userForm.selectedDepartment)
    }
    scope.submitted = false;
    scope.interacted = function(field) {
        return scope.submitted || field.$dirty;
    };
    scope.userForm ={
        realName: "",
        selectedOrg: "",
        selectedPrivilege: "",
        selectedDepartment: "",
        selectedProject: "",
        selectedRole: "",
        name: "",
        password: "",
        cfmPassword: "",
        enabled: "true",
        phone: "",
        email: ""
    };
    var allPrivileges;
    function getAllPrivilegesFunc() {
        roleDataSrv.getRoledata().then(function(res) {
            if(res&&res.data){
                allPrivileges = res.data;
            }
        }).finally(function(){
            getRolesFunc()
        })
    };
    getAllPrivilegesFunc();
    scope.changeRoleFun = function(item){
        for(var i=0;i<allPrivileges.length;i++){
            if(item.managementRole==allPrivileges[i].managementRole){
                scope.privilegesItems =  allPrivileges[i].id;
            }    
        }
    }
    //获取组织
    // function getOrgsFunc() {
    //     userDataSrv.getOrgsData().then(function(res) {
    //         scope.orgs = {};
    //         scope.orgs.options = [];
    //         scope.orgs.options.push({"id":null,"levname":"请选择","name":"请选择",type:0});
    //         scope.listAllOrg(res.data);
    //         scope.orgs.options.map(item=>{
    //             item.levname = item.name;
    //             for(let i=0;i<item.deptLevel;i++){
    //                 item.levname = "|__"+item.levname;
    //             }
    //         });

    //     });
    // }
    scope.listAllOrg = function(arr) {
        _.forEach(arr, function(item) {
            if (item.children.length > 0) {
                scope.orgs.options.push(item);
                scope.listAllOrg(item.children);
            }else{
                scope.orgs.options.push(item);
            }

        });
    };
    //获取权限
    var getPrivilegesFunc = function(item) {
        var postData = {domainUid:item.domainUid};
        roleDataSrv.getRoledata(postData).then(function(res) {
            scope.privileges = {
                options: res.data,
                selected: res.data[0] ? res.data[0] : ""
            };
            scope.userForm.selectedPrivilege = scope.privileges.selected;
        });
    };


    /*刷新列表*/
    scope.init_data = function() {
        scope.$watch(function() {
            return userDataSrv.userTableAllData;
        }, function(value) {
            var user_data = _.map(value, function(item) {
                if (item.enabled == true) {
                    item.status = $translate.instant("aws.users.active");
                    item.operate = $translate.instant("aws.users.locked");
                } else {
                    item.status = $translate.instant("aws.users.locked");
                    item.operate = $translate.instant("aws.users.active");
                }
                if(item.managementRole=="2"){
                    item.realName = "admin";
                    item.operate="";
                }
                scope.DOMAIN_ADMIN?item.domainName = localStorage.domainName:"";
                item.managementRoleName = $translate.instant("aws.users.roles."+ item.managementRole );
                item.email == null ?  item.email = "":"";
                item.phone == null ?  item.phone = "":"";
                
                item.searchTerm = item.name+item.managementRoleName+item.domainName +item.realName+item.email+item.phone+item.status+item.createTime+item.operate;
                return item;
            });
            _userData = angular.copy(user_data);
            scope.tableParams = new NgTableParams({ count: GLOBAL_CONFIG.PAGESIZE }, { counts: [], dataset: user_data });
            scope.applyGlobalSearch();
            checkedSrv.checkDo(scope, user_data, "id");
        }, true);
    };
    var initUserTable = function() {
        userDataSrv.getUserTableData().then(function(result) {
            if(result && result.data && result.data.length){
                if(scope.ADMIN){
                    userDataSrv.userTableAllData = result.data;
                }else if(scope.DOMAIN_ADMIN){
                    userDataSrv.userTableAllData = result.data.filter(item=>item.domainUid == localStorage.domainUid && item.name != "admin");
                }
                scope.init_data();
            }
            result?scope.loadData = true:"";
        });
    };


    scope.changeDpm = function(item) {
        var params = { domainUid: item ? item.domainUid : "" };
        userDataSrv.getProjectData(params).then(function(res) {
            if(res&&res.data&&res.data.length!=0){
                scope.projectCheck = false; 
                res.data.forEach(function(item){
                    if(item.domainUid=='default'&&item.name=="admin"){
                        item.name=$translate.instant("aws.common.defaultProject");
                    }
                })
            }
            scope.projects = {
                options: res.data,
                selected: res.data[0] ? res.data[0] : ""
            };
            scope.userForm.selectedProject = scope.projects.selected;
        });
        getPrivilegesFunc(item);
    };
    /*新建部门插入新建数据*/
    scope.$on('department-renew',function(e,data){
        var newDomain = data.domain;
        scope.dpms.options.push(newDomain);
    });
    /*新建项目插入数据*/
    scope.$on('project-renew',function(e,data){
        var newProject = data.project;
        scope.projects.options.push(newProject);
        scope.userForm.selectedProject =scope.projects.options[0];
        scope.projectCheck = false;
    });
    //获取部门、项目;项目与部门联动，项目随部门的变化而改变
    var getDepartmentsFunc = function() {
        //获取部门
        if($rootScope.ADMIN){
            userDataSrv.getDepartmentData().then(function(res) {
                if(res&&res.data){
                    res.data.forEach(function(item){
                        if(item.domainUid=='default'){
                            item.name = $translate.instant("aws.common.defaultDepar");
                        }
                    })
                    scope.dpms = {
                        options: res.data,
                        selected: res.data[0] ? res.data[0] : ""
                    };
                }
                scope.userForm.selectedDepartment = scope.dpms.selected;
                return res.data[0];
            }).then(function(item) {
                //根据部门获取相应的项目和权限
                scope.changeDpm(item);
            });
        }else if($rootScope.DOMAIN_ADMIN){
            var curDomain = [{name:localStorage.domainName,domainUid:localStorage.domainUid}];
            scope.dpms ={
                options: curDomain,
                selected: curDomain[0] 
            };
            scope.domain_dis = true;
            scope.userForm.selectedDepartment = scope.dpms.selected;
            scope.changeDpm(curDomain[0]);
        }
        
    };
    //获取角色
    var getRolesFunc = function() {
        userDataSrv.getRolesData().then(function(res) {
            var roles = res.data.filter(function(item){
                if(localStorage.permission == "enterprise"){
                    if($rootScope.ADMIN){
                        return (item.name != "service" && item.name != "guest" && item.name != "admin");
                    }else{
                        return (item.name != "service" && item.name != "guest" && item.name != "admin" && item.name != "domain_admin");
                    }
                }else if(localStorage.permission == "stand"){
                     return item.name == "member";
                }
                
            });
            roles.map(function(item){
                item.roleName = item.name;
                item.name = $translate.instant("aws.users.cu.roles."+item.name);
            });
            scope.roles = {
                options: roles,
                selected: roles[0] ? roles[0] : ""
            };
            scope.userForm.selectedRole = scope.roles.selected;
            if(localStorage.permission=="stand"){
                scope.userForm.selectedRole = roles[roles.length-1];
            }
            scope.changeRoleFun(scope.roles.selected)
        });
    };
    // getOrgsFunc();
    //getPrivilegesFunc();
    getDepartmentsFunc();
    scope.editUser = false;
    scope.userConfirm = function(data, formField) {
        if (formField.$valid) {
            var params =  {
                "name": data.name,
                "realName": data.name, //可以为空
                "email": data.email, //可以为空
                "phone": data.phone, //可以为空
                "enabled": data.enabled,
                "password": data.password,
                "enterpriseUid": localStorage.enterpriseUid,
                "domainUid": data.selectedDepartment.domainUid, //部门
                "privilegeId": scope.privilegesItems,  //data.selectedPrivilege.id, //权限
                "defaultProjectUid": data.selectedProject.projectUid, //项目
                "roleUid": data.selectedRole.id, //角色
                "roleName": data.selectedRole.roleName
            };
            data.selectedOrg.id ? params.departmentId = data.selectedOrg.id : params.departmentId = "";
            userDataSrv.addUserAction(params).then(function() {
                /*当在当前的页面时刷新列表*/
                if($location.path()=='/permit/user'){
                    initUserTable();        
                }  
                if($location.path()=='/permit/overview'){
                    $route.reload(); 
                }
            });
            $uibModalInstance.close();
        } else {
            scope.submitValid = true;
        }
    };   
}