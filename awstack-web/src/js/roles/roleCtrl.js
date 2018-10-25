import "./roleDataSrv";

angular.module("rolectrl", ["ngTable", "rolesrv","ivh.treeview"])
    .controller("RoleCtrl", ["$scope","NgTableParams", "$filter","roleDataSrv", "alertSrv", "checkedSrv", "$location", "$translate","GLOBAL_CONFIG","$timeout","userDataSrv",function($scope, NgTableParams,$filter, roleDataSrv, alertSrv, checkedSrv, $location, $translate,GLOBAL_CONFIG,$timeout,userDataSrv) {
        var self = $scope;
        self.isDisabled = true;
        self.delisDisabled = true;

        function getRole() {
            var postData ={};
            if(!$scope.ADMIN){
                postData.domainUid = localStorage.defaultdomainUid;
            }
            roleDataSrv.getRoledata(postData).then(function(data) {
                data?self.loadData = true:"";
                if(data && data.data && data.data.length){
                    successFunc(data.data);
                }
            });
        }

        function successFunc(data) {
            data.map(function(item){
                item.searchTerm = [item.name, item.description, item.createTime].join('\b')
            });
            self.tableParams = new NgTableParams({ count: 4 }, { counts: [], dataset: data });
            var tableId = "id";
            checkedSrv.checkDo(self, data, tableId);
        }

        self.refreshRole = function(){
            getRole();
        };

        self.applyGlobalSearch = function() {
            var term = self.globalSearchTerm;
            self.tableParams.filter({searchTerm:term});
        };
        
        //监听选中框
        self.$watch(function(){
            return self.checkedItems;
        },function(value){
            if(value && value.length>0){
                value.map(function(item){
                    if(item.name == "admin" && item.domainName == "default" ){
                        self.delisDisabled = true;
                        self.notDelTip = $translate.instant("aws.role.table.privilege_not_del");
                    }
                });
            }
        });
        self.tpl = [
            "<div>",
            "<span ivh-treeview-toggle>",
            "<span ivh-treeview-twistie></span>",
            "</span>",
            "<ascii-box></ascii-box>",
            "<span class='ivh-treeview-node-label' ivh-treeview-toggle>",
            "{{:: trvw.label(node)}}",
            "</span>",
            "<div ivh-treeview-children></div>",
            "</div>"
        ].join("\n");

       /* function formaterMenu(arr,pt){
            _.forEach(arr, function(item) {
                switch(item.keywords){
                    case "Resource":
                        item.selected = true; 
                        break;
                    case "Resource_Instance":
                        item.selected = true; 
                        break;
                }
                if(pt){
                    item.selected = true; 
                }
                if (item.selected > 0) {
                    formaterMenu(item.child,true);
                }

            });
            return arr
        }*/

        self.updateRole = function(type) {
            self.editPage = true;
            self.role_form = {
                name:"",
                domainUid:"",
                description:"" 
            };
            self.getMemus = function(arr) {
                _.forEach(arr, function(item) {
                    //if (item.selected || item.__ivhTreeviewExpanded) {
                    if (item.selected) {
                        self.menuIds.push(item.id);
                        //self.menuIds.push([item.id,item.keywords]);
                    }
                    if (item.child.length > 0) {
                        self.getMemus(item.child);
                    }

                });
                var postData = {
                    name: self.role_form.name,
                    domainUid:self.role_form.domainUid,
                    menuIds: self.menuIds.toString(),
                    description: self.role_form.description || ""
                };
                return postData;

            };
            //获取部门列表
            userDataSrv.getDepartmentData().then(function(result) {
                if(result && result.data && result.data.length){
                    self.domainList =  result.data;
                    if(type == "new" && self.ADMIN){  //admin用户新建权限
                        self.role_form.domainUid =  self.domainList[0].domainUid;
                    }else if(type == "new" && self.DOMAIN_ADMIN){ //domain_admin用户新建权限
                        self.role_form.domainUid  = localStorage.domainUid;

                    }else if(type == "edit"){ //admin、domain_admin用户编辑权限
                        self.role_form.domainUid =  self.editData.domainUid;
                    }
                }
            });
            switch (type) {
            case "new":
                self.new_or_editTitle = $translate.instant("aws.role.new_role");
                $scope.treeData = [];
                self.submitValid = false;
                self.editDisable = false;
                self.hide_domain = false;
                if($scope.ADMIN){
                    //获取菜单
                    roleDataSrv.getMemus().then(function(data) {
                        $scope.treeData = data.data;
                    });

                }else if($scope.DOMAIN_ADMIN){
                    $scope.treeData = angular.fromJson(localStorage.menuList);
                }
                
                $scope.createRole = function(formField) {
                    self.menuIds = [];
                    var sendData = self.getMemus($scope.treeData);
                    sendData.menuIds?self.menuRequire =false :self.menuRequire = true;
                    $timeout(function(){
                        self.menuRequire = false;
                    },5000);
                    if(formField.$valid && !self.menuRequire){
                        roleDataSrv.createRole(sendData).then(function() {
                            getRole();
                            self.editPage = false;
                        });
                    }else{
                        self.submitValid = true;
                    }
                    
                };
                break;
            case "edit":
                self.new_or_editTitle = $translate.instant("aws.role.edit_role");
                self.hide_domain = true;
                self.role_form.name = self.editData.name;
                self.role_form.description = self.editData.description;
                self.editDisable = false;
                if(self.editData.name == "admin"){
                    self.editDisable = true;
                    self.notEditTip = $translate.instant("aws.role.table.privilege_not_edit");
                }
                //获取菜单
                var postData = { privilegeId: Number(self.editData.id) };
                function handleData(handleDatas){
                    handleDatas.forEach(function(item){
                        let treeA_a= false;
                        let treeA_b= false;
                        if(item.child.length){
                            for(var i=0;i<item.child.length;i++){
                                if(item.child[i].selected==false){
                                    treeA_a=true;
                                }else if(item.child[i].selected==true){
                                    treeA_b=true;
                                    let treeB_a= false;
                                    let treeB_b= false;
                                    if(item.child[i].child.length){
                                        for(var j=0;j<item.child[i].child.length;j++){
                                            if(item.child[i].child[j].selected==false){
                                                treeB_a=true;
                                            }else if(item.child[i].child[j].selected==true){
                                                treeB_b=true;
                                            }
                                        }
                                        if(treeB_a&&treeB_b){
                                            item.child[i].selected=false;
                                            item.child[i].__ivhTreeviewIndeterminate=true;
                                            item.selected=false;
                                            item.__ivhTreeviewIndeterminate=true;
                                        
                                        }else if(treeB_a&&!treeB_b){
                                            item.child[i].selected=false;
                                            treeA_b=false;
                                            item.selected=false;
                                            item.__ivhTreeviewIndeterminate=true;
                                        } 
                                        
                                    }
                                }
                            }
                            if(treeA_a&&treeA_b){
                                item.selected=false;
                                item.__ivhTreeviewIndeterminate=true;
                            }else if(treeA_a&&!treeA_b){
                                item.selected=false;
                                item.__ivhTreeviewIndeterminate=false;
                                if(item.__ivhTreeviewExpanded){
                                    item.__ivhTreeviewExpanded=false;
                                }
                            }

                        }
                    })
                }
                $timeout(
                    function(){
                        roleDataSrv.getMemus(postData).then(function(data) {
                            $scope.treeData = data.data;
                            /*if($scope.ADMIN){
                                handleData(data.data)
                                $scope.treeData = data.data;
                            }else if($scope.DOMAIN_ADMIN){
                                var curMenu = angular.fromJson(localStorage.menuList);
                                $scope.treeData = data.data.filter(function(item){ //从所有菜单中过滤出分配给部门管理员的菜单。
                                    var retain = false;
                                    curMenu.map(function(obj){
                                        if(obj.text == item.text){
                                            retain = true;
                                        }
                                    });
                                    return retain;
                                });
                            }*/
                            
                        });
                },3);
                //发送编辑数据
                $scope.createRole = function() {
                    self.menuIds = [];
                    //handleData($scope.treeData)
                    var aaa=$scope.treeData;
                    var sendData = self.getMemus(aaa);
                    sendData.menuIds?self.menuRequire =false :self.menuRequire = true;
                    $timeout(function(){
                        self.menuRequire = false;
                    },5000);
                    sendData.id = self.editData.id;
                    if(!self.menuRequire){
                        roleDataSrv.editRole(sendData).then(function() {
                            getRole();
                            self.editPage = false;

                        });
                    }else{
                        self.submitValid = true;
                    }
                    
                };
                break;
            }
        };
        
        self.closemenu = function(){
            self.editPage = false;
        };
        self.del = function(checkedItems) {
            var content = {
                target: "delRole",
                msg: "<span>" + $translate.instant("aws.role.table.role_del") + "</span>",
                data:checkedItems
            };
            self.$emit("delete", content);
        };

        self.$on("delRole", function(e,data) {
            var delGroup = [];
            var postData = { ids: delGroup };
            _.forEach(data, function(group) {
                delGroup.push(group.id);
            });
            roleDataSrv.delRole(postData).then(function() {
                getRole();
            });
        });

        getRole();

    }])
    .config(function(ivhTreeviewOptionsProvider) {
        ivhTreeviewOptionsProvider.set({
            defaultSelectedState: false,
            validate: true,
            childrenAttribute: "child"

        });
    })
    .directive("asciiBox", function(ivhTreeviewMgr) {
        return {
            restrict: "AE",
            require: "^ivhTreeview",
            template: [
                "<span class='ascii-box'>",
                "<span ng-show='node.selected' class='icon-aw-check-square'></span>",
                "<span ng-show='node.__ivhTreeviewIndeterminate' class='icon-aw-minus2'></span>",
                "<span ng-hide='node.selected || node.__ivhTreeviewIndeterminate' class='icon-aw-square'> </span>",
                "</span>"
            ].join(""),

            link: function(scope, element, attrs, ctrl) {
                element.on("click", function() {
                    ivhTreeviewMgr.select(ctrl.root(), scope.node, !scope.node.selected);
                    scope.$apply();
                });
            }
        };
    })
    .directive("repeatrole",["$timeout","$window","roleDataSrv",function($timeout,$window,roleDataSrv){
        return {
            restrict:"A",
            require:"ngModel",
            link:function(scope,ele,attrs,ngModel){
                var tempRole=angular.copy(scope.role_form.name);
                ngModel.$parsers.push(function(viewvalue){
                    scope.$watch(function(){
                        var domainUid = scope.$parent.role_form.domainUid;
                        return domainUid;
                    },function(domainUid){
                        if(!viewvalue) return;
                        $timeout.cancel($window.timer);
                        $window.timer = $timeout(function(){
                            if(tempRole){
                                if(tempRole==viewvalue){
                                    ngModel.$setValidity("repeatrole",true);
                                }else{
                                    roleDataSrv.roleIsUsed({name:viewvalue,"domainUid":domainUid}).then(function(result){
                                        if(result){
                                            ngModel.$setValidity("repeatrole",!result.data);
                                        }
                                    });    
                                }
                            }else{
                                roleDataSrv.roleIsUsed({name:viewvalue,"domainUid":domainUid}).then(function(result){
                                    if(result){
                                        ngModel.$setValidity("repeatrole",!result.data);
                                    }
                                });    
                            }
                                
                        },1000);
                    });
                    return viewvalue;
                });
                
            }
        };
    }])
    .directive("menuTree",["$timeout",function($timeout){
        return {
            restrict:"EA",
            scope:{
                menuData:"="
            },
            template:`
            <div class="checkbox choose-all">
                <label>
                    <input type="checkbox" name="menuName" ng-model="level.selectedAll" class="selected-all" ng-click="setAllCheckbox(level.selectedAll)">
                    <i class="iconfont"></i>
                </label>
                <span ng-click="toggleChk(level1.keywords)" ng-class="{'cursor':level1.child.length>0}">全选</span>
            </div>
            <ul class="menu-tree-level1">
                <li ng-repeat="level1 in menuData" class="menu-tree-level1-li">
                    <div class="checkbox clearfix level1-checkbox">
                        <label class="menu-{{level1.keywords}}">
                            <input type="checkbox" name="menuName" ng-click="setCheckbox(level1,1)" ng-model="level1.selected">
                            <i class="iconfont"></i>
                        </label>
                        <span ng-click="toggleChk(level1.keywords)" ng-class="{'cursor':level1.child.length>0}">{{"aws.menu."+level1.keywords|translate}}</span>
                    </div>
                    <ul ng-if="level1.child.length>0" class="menu-tree-level2" ng-class="{'show':menuTog[level1.keywords]}" >
                        <li ng-repeat="level2 in level1.child" class="menu-tree-level2-li">
                            <div class="checkbox clearfix level2-checkbox">
                                <label class="menu-{{level2.keywords}}">
                                    <input type="checkbox" indeterminate="level2.indeterminate" ng-click="setCheckbox(level2,2)" name="menuName" ng-model="level2.selected">
                                    <i class="iconfont"></i>
                                </label>
                                <span ng-class="{'cursor':level2.child.length>0}">{{"aws.menu."+level2.keywords|translate}}</span>
                            </div>
                            <ul ng-if="level2.child.length>0" class="menu-tree-level3" ng-class="{'show':menuTog[level1.keywords]}">
                                <li ng-repeat="level3 in level2.child" class="menu-tree-level3-li">
                                    <div class="level3-checkbox clearfix checkbox">
                                        <label>
                                            <input type="checkbox" ng-click="setCheckbox(level3,3)" name="menuName" ng-model="level3.selected">
                                            <i class="iconfont"></i>
                                        </label>
                                        <span class="">{{"aws.menu."+level3.keywords|translate}}</span>
                                    </div>
                                </li>
                            </ul>
                        </li>
                    </ul>
                </li>
            </ul>
            `,
            link:function(scope,ele,attrs,ngModel){
                function init(data){
                    let checkAll = 0
                    for(let i=0;i<data.length;i++){       
                        scope.level={
                            selected:false
                        }
                        if(data[i].selected){
                            checkAll++
                        }
                        if(data[i].child&&data[i].child.length>0){
                            let checkNumO = 0;
                            let checkNum = false;
                            for(let j=0;j<data[i].child.length;j++){//二级菜单集合
                                let checkNumT = 0;
                                if(data[i].child[j].child&&data[i].child[j].child.length>0){
                                    for(let k=0;k<data[i].child[j].child.length;k++){
                                        if(data[i].child[j].child[k].selected){
                                            checkNumT++;
                                        }
                                    }
                                    if(!checkNum){
                                        checkNum = checkNumT!=0&&checkNumT!=data[i].child[j].child.length
                                    }
                                    $(".menu-"+data[i].child[j].keywords+" input").prop("indeterminate", checkNumT!=0&&checkNumT!=data[i].child[j].child.length);
                                }
                                if(data[i].child[j].selected){
                                    checkNumO++;

                                }
                            }
                            //当二级菜单不全部选中时checkbox样式状态置为'-'
                            $(".menu-"+data[i].keywords+" input").prop("indeterminate", (checkNumO!=0&&checkNumO!=data[i].child.length)||checkNum);
                        }
                    }
                    if(checkAll==data.length){
                        scope.level.selectedAll = true
                    }else if(checkAll==0){
                        scope.level.selectedAll = false
                    }
                    $(".selected-all").prop("indeterminate", checkAll!=0&&checkAll!=data.length);
                }
                function resetChk(data){
                    data.forEach(item1=>{
                        if(item1.child&&item1.child.length>0){
                            let tw = 0;
                            item1.child.forEach(item2=>{
                                if(item2.child&&item2.child.length>0){
                                    let thr = 0;
                                    item2.child.forEach(item3=>{
                                        if(item3.selected){
                                            thr++;
                                        }
                                    })
                                    if(thr==item2.child.length){
                                        item2.selected = true;
                                    }else if(thr==0){
                                        item2.selected = false;
                                    }
                                }
                                if(item2.selected){
                                    tw++;
                                }
                                
                            })
                            if(tw==item1.child.length){
                                item1.selected = true;
                            }else if(tw==0){
                                item1.selected = false;
                            }
                        }
                    })
                }
                scope.menuTog = {};
                scope.showLevelThree = false;
                scope.setCheckbox = function(item1,index){
                    console.log(item1);
                    if(item1.child&&item1.child.length>0){
                        item1.child.forEach(item2=>{
                            item2.selected = item1.selected;
                            if(item2.child&&item2.child.length>0){
                                item2.child.forEach(item3=>{
                                    item3.selected = item1.selected;
                                })
                            }
                        })
                    }
                    resetChk(scope.menuData);
                    init(scope.menuData);
                }
                scope.toggleChk = function(v){
                    scope.menuTog[v] = !scope.menuTog[v];
                }
                scope.setAllCheckbox=function(flag){
                    if(scope.menuData&&scope.menuData.length>0){
                        scope.menuData.forEach(function(item1){
                            item1.selected = flag
                            if(item1.child&&item1.child.length>0){
                                item1.child.forEach(function(item2){
                                    item2.selected = flag
                                    if(item2.child&&item2.child.length>0){
                                        item2.child.forEach(function(item3){
                                            item3.selected = flag
                                        })
                                    }
                                   
                                })
                            }
                            
                        })
                    }
                }
                $timeout(function(){
                    init(scope.menuData);
                },500)
            }
        };
    }]);
