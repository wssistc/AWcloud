import "./userDataSrv";
import "../department/depviewSrv";
import "../roles/roleDataSrv";
import "../cvm/instances/instancesSrv"
import "../cvm/volumes/regularSnapSrv"

var userModule = angular.module("userModule", ["ngTable", "ngAnimate", "ui.bootstrap", "usersrv", "ngSanitize", "ui.select","depviewsrv","rolesrv","instancesSrv"]);
userModule.controller("UserCtrl", function($scope, $rootScope, NgTableParams, userDataSrv, checkedSrv, $uibModal, $translate,depviewsrv,GLOBAL_CONFIG,roleDataSrv,instancesSrv,regularSnapSrv) {
    var self = $scope;
    self.patternMsg=$translate.instant('aws.register.info.special_8_16');
    self.userName = localStorage.userName;
    self.user_managementRole = localStorage.managementRole;
    self.headers = {
        "realName": $translate.instant("aws.users.name"),
        "role": $translate.instant("aws.users.role"),
        "name": $translate.instant("aws.users.userName"),
        "phone": $translate.instant("aws.users.phone"),
        "status": $translate.instant("aws.users.status"),
        "createTime": $translate.instant("aws.users.createTime"),
        "operate": $translate.instant("aws.users.operate"),
        "domainName": $translate.instant("aws.users.domainName")
    };

    //列表搜索框右侧设置按钮配置
    self.userTitleName = "userRule";
    if (sessionStorage["userRule"]) {
        self.userTitleData = JSON.parse(sessionStorage["userRule"]);
    } else {
        self.userTitleData = [
            {name: 'users.userName', value: true, disable: true, search: "name"},
            {name: 'users.role', value: true, disable: false, search: "managementRoleName"},
            {name: 'users.domainName', value: true, disable: false, search: "domainName"},
            {name: 'users.email', value: true, disable: false, search: "email"},
            {name: 'users.phone', value: true, disable: false, search: "phone"},
            {name: 'users.status', value: true, disable: false, search: "status"},
            {name: 'users.createTime', value: true, disable: false, search: "createTime"},
            {name: 'users.operate', value: true, disable: false, search: "operate"}
        ]
    }

    self.userSearchTearm = function (obj) {
        self.globalSearchTerm = "";
        var tableData = obj.tableData;
        var titleData = obj.titleData;
        tableData.map(function (item) {
            item.searchTerm = [];
            titleData.forEach(function (value) {
                if (value.value) {
                    item.searchTerm.push(item[value.search]);
                }
            })
            item.searchTerm = item.searchTerm.join('\b');
        })
        // self.tableParams = new NgTableParams({ count: GLOBAL_CONFIG.PAGESIZE }, { counts: [], dataset: tableData });
    }
    var _userData = [];
    self.$watch(function() {
        return self.checkedItems;
    }, function(value) {
        self.notDelTip = "";
        self.notAllocateTip = "";
        self.notEditTip = "";
        self.notEditPassTip = "";
        self.isDisabled = false;
        self.delisDisabled = false;
        self.sigDisabled = false;
        self.iseditDisabled = false;
        self.hideadminActive = false;
        if(value && value.length == 1){
            if(value[0].managementRole == localStorage.managementRole){
                self.delisDisabled =true;
                self.notDelTip = $translate.instant("aws.users.tip.notDelTip"); 
                if(value[0].name == "admin"){ //不能操作admin用户------2017.5.16
                    self.notAllocateDis = true;
                    self.isDisabled = true;
                    self.iseditDisabled = false;
                    self.hideadminActive = true;
                    self.notAllocateTip = $translate.instant("aws.users.tip.allocate_admin");
                    self.notEditTip = $translate.instant("aws.users.tip.edit_admin");
                    self.notEditPassTip = $translate.instant("aws.users.tip.edit_admin_pass");
                }else if(value[0].name ==localStorage.userName){ //用户登录后不能操作同级用户
                    self.notAllocateDis = false;
                    self.isDisabled = false;
                    self.iseditDisabled = false;
                    self.hideActive = true;
                }else{
                    self.notAllocateDis = true;
                    self.isDisabled = true;
                    self.iseditDisabled = true;
                    self.notAllocateTip = $translate.instant("aws.users.tip.allocate_user");
                    self.notEditTip = $translate.instant("aws.users.tip.edit_user");
                    self.notEditPassTip = $translate.instant("aws.users.tip.edit_user_pass");
                }                 
            }
        }else if(value && value.length > 1){
            self.isDisabled = true;
            self.sigDisabled = true;
            self.iseditDisabled = true;
            value.map(function(item){
                if(item.managementRole == localStorage.managementRole){
                    self.delisDisabled =true;
                    self.notDelTip =  $translate.instant("aws.users.tip.notDelTip");                        
                }
            });
        }
        else{  //check为空的时候
            self.isDisabled = true;
            self.delisDisabled = true;
            self.sigDisabled = true;
            self.iseditDisabled = true;
        }
    });

    self.applyGlobalSearch = function() {
        var term = self.globalSearchTerm;
        self.tableParams.filter({searchTerm:term});
    };

    //获取user table的数据 初始化userTable
    var initUserTable = function() {
        if(localStorage.managementRole=='3'){
            var params={
                domainUid:localStorage.domainUid
            }
        }else{
            var params={}
        }
        userDataSrv.getUserTableData(params).then(function(result) {
            if(result && result.data && result.data.length){
                if(self.ADMIN){
                    userDataSrv.userTableAllData = result.data;
                }else if(self.DOMAIN_ADMIN){
                    userDataSrv.userTableAllData = result.data.filter(item=>item.domainUid == localStorage.domainUid && item.name != "admin");
                }
                self.init_data();
            }
            result?self.loadData = true:"";
        });
    };
    initUserTable();

    self.init_data = function() {
        self.userTableData = userDataSrv.userTableAllData;
        self.$watch(function() {
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
                if(item.domainUid=='default'){
                    item.domainName =  $translate.instant("aws.common.defaultDepar");
                }
                self.DOMAIN_ADMIN?item.domainName = localStorage.domainName:"";
                item.managementRoleName = $translate.instant("aws.users.roles."+ item.managementRole );
                item.email == null ?  item.email = "":"";
                item.phone == null ?  item.phone = "":"";
                
                item.searchTerm = [item.name, item.managementRoleName, item.domainName, item.email, item.phone, item.status, item.createTime, item.operate].join('\b');
                return item;
            });
            _userData = angular.copy(user_data);
            self.tableParams = new NgTableParams({ count: GLOBAL_CONFIG.PAGESIZE }, { counts: [], dataset: user_data });
            self.userSearchTearm({tableData:self.userTableData,titleData:self.userTitleData})
            self.applyGlobalSearch();
            checkedSrv.checkDo(self, user_data, "id");
        }, true);
    };
    //刷新列表操作
    self.refreshUser = function() {
        initUserTable();
    };

    //激活操作
    self.operateUser = function(user) {
        var operateParams = {
            enterpriseUid: user.enterpriseUid,
            id: user.id,
            userUid: user.userUid
        };
        if (user.enabled == true) {
            operateParams.state = 0;
        } else {
            operateParams.state = 1;
        }
        userDataSrv.operateUserAction(operateParams).then(function() {
            initUserTable();
        });
    };
    //新建and编辑
    self.updateUser = function(type, editData) {
        var scope = self.$new(); // 子 scope 原型 继承父 scope ..



        scope.inStep= 1;
        scope.inStepOneBar = 0;
        scope.inStepTwoBar = 1;
        scope.inStepThreeBar = 2;
        scope.inStepFourBar = 3;
        scope.projectCheck = false; 
        scope.stepTo = function(m,check){
            /*可能项目没有*/
            if(check){
                if(self.userForm.selectedProject==''){
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
        
        var userModal = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl:type=='new'? "js/user/tmpl/usermodal.html":"userModel.html",
            scope: scope
        });
        scope.submitted = false;
        scope.interacted = function(field) {
            return scope.submitted || field.$dirty;
        };
        userModal.opened.then(function() {
            self.userForm ={
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
            self.changeRoleFun = function(item){
                for(var i=0;i<allPrivileges.length;i++){
                    if(item.managementRole==allPrivileges[i].managementRole){
                        self.privilegesItems =  allPrivileges[i].id;
                    }    
                }
            }
            //获取组织
            // function getOrgsFunc() {
            //     userDataSrv.getOrgsData().then(function(res) {
            //         self.orgs = {};
            //         scope.orgs.options = [];
            //         scope.orgs.options.push({"id":null,"levname":"请选择","name":"请选择",type:0});
            //         self.listAllOrg(res.data);
            //         scope.orgs.options.map(item=>{
            //             item.levname = item.name;
            //             for(let i=0;i<item.deptLevel;i++){
            //                 item.levname = "|__"+item.levname;
            //             }
            //         });
            //         if(type == "edit"){
            //             _.forEach(self.orgs.options,function(item){
            //                 if(editData.departmentId==item.id){
            //                     self.userForm.selectedOrg=item;
            //                 }
            //             });
            //         }
            //     });
            // }
            self.listAllOrg = function(arr) {
                _.forEach(arr, function(item) {
                    if (item.children.length > 0) {
                        scope.orgs.options.push(item);
                        self.listAllOrg(item.children);
                    }else{
                        scope.orgs.options.push(item);
                    }

                });
            };
            //获取权限
            var getPrivilegesFunc = function(item) {
                var postData = {domainUid:item.domainUid};
                roleDataSrv.getRoledata(postData).then(function(res) {
                    self.privileges = {
                        options: res.data,
                        selected: res.data[0] ? res.data[0] : ""
                    };
                    self.userForm.selectedPrivilege = self.privileges.selected;
                });
            };
            self.changeDpm = function(item) {
                var params = { domainUid: item ? item.domainUid : "" };
                userDataSrv.getProjectData(params).then(function(res) {
                    self.projects = {
                        options: res.data,
                        selected: res.data[0] ? res.data[0] : ""
                    };
                    self.userForm.selectedProject = self.projects.selected;
                });
                getPrivilegesFunc(item);
            };
                //获取部门、项目;项目与部门联动，项目随部门的变化而改变
            var getDepartmentsFunc = function() {
                //获取部门
                if($rootScope.ADMIN){
                    userDataSrv.getDepartmentData().then(function(res) {
                        self.dpms = {
                            options: res.data,
                            selected: res.data[0] ? res.data[0] : ""
                        };
                        self.userForm.selectedDepartment = self.dpms.selected;
                        return res.data[0];
                    }).then(function(item) {
                        //根据部门获取相应的项目和权限
                        self.changeDpm(item);
                    });
                }else if($rootScope.DOMAIN_ADMIN){
                    var curDomain = [{name:localStorage.domainName,domainUid:localStorage.domainUid}];
                    self.dpms ={
                        options: curDomain,
                        selected: curDomain[0] 
                    };
                    self.domain_dis = true;
                    self.userForm.selectedDepartment = self.dpms.selected;
                    self.changeDpm(curDomain[0]);
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
                    self.roles = {
                        options: roles,
                        selected: roles[0] ? roles[0] : ""
                    };
                    self.userForm.selectedRole = self.roles.selected;
                    if(localStorage.permission=="stand"){
                        self.userForm.selectedRole = roles[roles.length-1];
                    }
                    self.changeRoleFun(self.roles.selected)
                });
            };
            // getOrgsFunc();
            //getPrivilegesFunc();
            getDepartmentsFunc();
            

            switch (type) {
            case "new":
                self.userModal_title = $translate.instant("aws.users.adduser");
                self.editUser = false;
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
                            "privilegeId": self.privilegesItems,  //data.selectedPrivilege.id, //权限
                            "defaultProjectUid": data.selectedProject.projectUid, //项目
                            "roleUid": data.selectedRole.id, //角色
                            "roleName": data.selectedRole.roleName
                        };
                        data.selectedOrg.id ? params.departmentId = data.selectedOrg.id : params.departmentId = "";
                        userDataSrv.addUserAction(params).then(function() {
                            initUserTable();
                        });
                        userModal.close();
                    } else {
                        scope.submitValid = true;
                    }
                };
                break;
            case "edit":
                self.userModal_title = $translate.instant("aws.users.edituser");
                self.editUser = true;
                self.submitValid = false;
                editData.cfmPassword = editData.password;
                if (editData.enabled == true) {
                    editData.enabled = "true";
                } else {
                    editData.enabled = "false";
                }
                self.userForm = editData;
                scope.userConfirm = function(data, formField) {
                    if (formField.$valid) {
                        var params = {
                            "name": data.name,
                            "realName": data.name, //可以为空
                            "email": data.email, //可以为空
                            "phone": data.phone, //可以为空
                            "enabled": data.enabled,
                            //"password": data.password,
                            "description": "",
                            "enterpriseUid": localStorage.enterpriseUid,
                        };
                        params.id = editData.id; //编辑用户时参数增加了一个id
                        params.userUid = editData.userUid;
                        userDataSrv.editUserAction(params).then(function() {
                            initUserTable();
                        });
                        userModal.close();
                    } else {
                        scope.submitValid = true;
                    }
                };
                break;
            }
        });
        userModal.closed.then(function(){
            checkedSrv.checkDo(self, _userData, "id");
        });
        
    };
    //删除
    self.deleteUser = function(checkedItems) {
        var uids = [],jobIds=[];
        _.forEach(checkedItems, function(item) {
            uids.push(item.userUid);
        });
        var checkData = {
            userIds:uids
        }
        //判断该用户下是否有定时快照
        instancesSrv.checkSheduleJob(checkData).then(function(result){
            var content = {
                target: "delUser",
                msg: "<span>" + $translate.instant("aws.users.delMsg") + "</span>",
                data:{checkedItems,jobIds}
            };
            if(result && result.data && result.data.length){
                content.data.jobIds = result.data;
                content.msg = "<span>" + $translate.instant("aws.instances.tipMsg.delSever") + "</span>" + "</br>" +
                                "<span>" + $translate.instant("aws.instances.tipMsg.delUserJob") + "</span>";
            }
            self.$emit("delete", content);
        })
        
       
    };
    self.$on("delUser", function(e,data) {
        var ids = [],uids = [];
        var checkedItems = data.checkedItems;
        var jobIds = data.jobIds;
        _.forEach(checkedItems, function(item) {
            ids.push(item.id);
            uids.push(item.userUid);
        });
        var delParams = {
            ids: ids,
            uids: uids
        };
        userDataSrv.delUserAction(delParams).then(function(res) {
            return res;
        }).then(function() {
            initUserTable();
        });
        //删除该用户下的所有定时快照
        if(jobIds.length){
            regularSnapSrv.delTaskBatch({ids:jobIds}).then(function(){
            })
        }
    });

    //分配权限  目前只能分配一个权限，所以权限分配做成互斥的
    self.allocatePrivilege = function(type, editData) {
        var scope = $rootScope.$new();
        var userModal = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: "allocatePrivilege.html",
            scope: scope
        });
        userModal.opened.then(function() {
            var params = {
                user_id: editData.id
            };
            var postData = {
                domainUid:editData.domainUid
            };
            var checkedRoles = [],
                checkedUserRoles = [],
                user_roles = [],
                initUserRoleId = "";
            //获取角色，初始化两个table的数据
            roleDataSrv.getRoledata(postData).then(function(result) {
                if(result && result.data){
                    //self.roles=result.data;
                    return result.data;
                }
            }).then(function(data) {
                userDataSrv.getUserPrivileges(params).then(function(result) {
                    if(result && result.data){
                        //self.userRoles=result.data;
                        initUserRoleId = angular.copy(result.data);
                        _.forEach(result.data, function(id) {
                            _.remove(data, function(item) {
                                if (item.id == id) {
                                    user_roles.push(item);
                                }
                                return item.id == id;
                            });
                        });
                        scope.roles = data;
                        scope.userRoles = user_roles;
                        scope.init_Privileges_table();
                        scope.init_userPrivs_table();
                    }
                    
                });
            });

            //监听table数据变化
            scope.init_Privileges_table = function() {
                scope.checkboxes = {
                    checked: false,
                    roles: {}
                };
                scope.$watch(function() {
                    return scope.checkboxes.roles;
                }, function() {
                    if (scope.roles === 0) return;
                    checkedRoles = [];
                    _.forEach(scope.roles, function(item) {
                        if (scope.checkboxes.roles[item.id]) {
                            checkedRoles.push(item.id);
                        }
                    });
                }, true);
            };
            scope.init_userPrivs_table = function() {
                scope.chkboxes = {
                    checked: false,
                    userRoles: {}
                };
                scope.$watch(function() {
                    return scope.chkboxes.userRoles;
                }, function() {
                    if (scope.userRoles === 0) return;
                    checkedUserRoles = [];
                    _.forEach(scope.userRoles, function(item) {
                        if (scope.chkboxes.userRoles[item.id]) {
                            checkedUserRoles.push(item.id);
                        }
                    });
                }, true);
            };

            scope.$watch(function() {
                return checkedRoles;
            }, function(checkedRoles) {
                checkedRoles.length ==1 ?  scope.canSelect = true: scope.canSelect = false;
                if(checkedRoles.length > 1){
                    scope.showSelectTip = true;
                    scope.selectips = $translate.instant("aws.users.oneUser_oneRole");
                }else{
                    scope.showSelectTip= false;
                    scope.selectips = "";
                }
            }, true);

            scope.selectRolesToUser = function() {
                scope.roles = scope.roles.concat(scope.userRoles);
                scope.userRoles = [];
                _.forEach(checkedRoles, function(id) {
                    _.remove(scope.roles, function(item) {
                        if (item.id == id) {
                            scope.userRoles.push(item);
                            scope.chkboxes.userRoles = false;
                        }
                        return item.id == id;
                    });
                });
                scope.init_Privileges_table();
                scope.init_userPrivs_table();
            };
            scope.removeRolesFromUser = function() {
                _.forEach(checkedUserRoles, function(id) {
                    _.remove(scope.userRoles, function(item) {
                        if (item.id == id) {
                            var roles = scope.roles;
                            roles.push(item);
                            scope.checkboxes.roles = false;
                        }
                        return item.id == id;
                    });
                });
            };
            return userModal.result.then(function() {
                var put_ids = [];
                _.forEach(scope.userRoles, function(item) {
                    put_ids.push(item.id);
                });
                var params = {
                    id: editData.id,
                    role_ids: {
                        ids: put_ids
                    }
                };
                if(params.role_ids.ids[0] != initUserRoleId){
                    userDataSrv.putUserRoles(params).then(function() {
                        initUserTable();
                    });
                }
            });
        });
    };

    //修改用户密码
    self.changePass = function(editData) {
        var scope = $scope; 
        var userModal = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: "userPassModel.html",
            scope: scope
        });
        scope.userForm = {};
        scope.userPassConfirm = function(formField) {
            if (formField.$valid) {
                var params ={
                    "name": editData.name,
                    "realName": editData.realName, //可以为空
                    "email": editData.email, //可以为空
                    "phone": editData.phone, //可以为空
                    "enabled": editData.enabled,
                    "password": scope.userForm.password,
                    "description": editData.description,
                    "enterpriseUid": localStorage.enterpriseUid,
                    "departmentId": editData.departmentId,
                    "id":editData.id,
                    "userUid":editData.userUid
                };
                userModal.close();
                userDataSrv.editUserAction(params).then(function() {
                    initUserTable();
                });
            } else {
                scope.submitValid = true;
            }
        };
    };
    self.changeOrg = function(editData) {
        var scope = $scope; 
        var userOrgModal = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: "allocateOrg.html",
            scope: scope
        });
        scope.userOrgForm = {};
        // function getOrgsFunc() {
        //     userDataSrv.getOrgsData().then(function(res) {
        //         scope.orgs = {};
        //         scope.orgs.options = [];
        //         scope.orgs.options.push({"id":null,"name":"请选择",type:0});
        //         listAllOrg(res.data);
        //         scope.orgs.options.map(item=>{
        //             item.levname = item.name;
        //             for(let i=0;i<item.deptLevel;i++){
        //                 item.levname = "|__"+item.levname;
        //             }
        //         });
        //         _.forEach(scope.orgs.options,function(item){
        //             if(editData.departmentId==item.id){
        //                 scope.userOrgForm.selectedOrg=item;
        //             }
        //         });
        //     });
        // }
        function listAllOrg(arr){
            _.forEach(arr, function(item) {
                if (item.children.length > 0) {
                    scope.orgs.options.push(item);
                    listAllOrg(item.children);
                }else{
                    scope.orgs.options.push(item);
                }

            });
        }
        // getOrgsFunc();
        scope.userOrgConfirm = function(org,formField) {
            if (formField.$valid) {
                var params ={
                    "name": editData.name,
                    "realName": editData.realName, //可以为空
                    "email": editData.email, //可以为空
                    "phone": editData.phone, //可以为空
                    "enabled": editData.enabled,
                    "password": editData.password,
                    "description": editData.description,
                    "enterpriseUid": localStorage.enterpriseUid,
                    "departmentId": org.selectedOrg.id,
                    "id":editData.id,
                    "userUid":editData.userUid
                };
                userOrgModal.close();
                userDataSrv.editUserAction(params).then(function() {
                    initUserTable();
                });
            } else {
                scope.submitValid = true;
            }
        };
    };
});
