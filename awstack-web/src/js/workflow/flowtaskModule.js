angular.module("flowtaskModule", ["ngTable", "ngAnimate", "ui.bootstrap.tpls", "ui.tree", "checkedsrv"])
    .controller("flowtaskCtrl", ["$scope", "$rootScope","$filter", "NgTableParams", "$uibModal", "workflowsrv", "alertSrv", "$translate","checkedSrv","$location","GLOBAL_CONFIG","$routeParams",
        function(scope, rootScope,$filter, NgTableParams, $uibModal, workflowsrv, alertSrv, $translate,checkedSrv,$location,GLOBAL_CONFIG,$routeParams) {
        var self = scope;
        var enterpriseUid = localStorage.enterpriseUid ? localStorage.enterpriseUid : "";
        self.headers = {
            "name": $translate.instant("aws.workflow.name"),
            "description": $translate.instant("aws.workflow.description"),
            "createTime": $translate.instant("aws.workflow.createTime"),
            "lastUpdateTime": $translate.instant("aws.workflow.lastUpdateTime"),
            "version": $translate.instant("aws.workflow.version")
        };
        self.flow = {
            model:false,
            task:true,
            globalSearchTerm:""
        };
        
        function getModelList(id){
            workflowsrv.getModelData(id).success(function(result){
                var data =[];
                if(result){
                    data = result;
                    data.map(function(item){
                        item.metaInfo = JSON.parse(item.metaInfo);
                        item.lastUpdateTime = $filter("date")(item.lastUpdateTime, "yyyy-MM-dd HH:mm:ss");
                        item.createTime = $filter("date")(item.createTime, "yyyy-MM-dd HH:mm:ss");
                        item.SearchTerm = item.name+item.lastUpdateTime+item.createTime+item.metaInfo.description;
                    });
                    self.tableParamsData = data;
                    self.tableParams = new NgTableParams({ count: GLOBAL_CONFIG.PAGESIZE }, { counts: [], dataset: data });
                    checkedSrv.checkDo(self,result,"id",'tableParams');
                }
            });
            self.flow.globalSearchTerm="";
            self.applyGlobalSearch = function() {
                var term = self.flow.globalSearchTerm;
                self.tableParams.filter({ SearchTerm: term });
            };
        }
        function getTaskList(id){
            workflowsrv.getTaskData(id).success(function(result){
                var data =[];
                if(result){
                    data = result; 
                    data.forEach(function(item){
                        item.SearchTerm = item.name+item.version+item.description;
                    })
                    self.tableParamsDatas = data;
                    self.tableParamsdata = new NgTableParams({ count: GLOBAL_CONFIG.PAGESIZE }, { counts: [], dataset: data });
                    checkedSrv.checkDo(self,result,"id",'tableParamsdata');
                }
            });
            self.flow.globalSearchTerm="";
            self.applyGlobalSearch = function() {
                var term = self.flow.globalSearchTerm;
                self.tableParamsdata.filter({SearchTerm: term });
            };
        }
        self.refreshFlow = function(type){
            if(enterpriseUid){
                switch(type){
                case "model":
                    getModelList(enterpriseUid);
                    break;
                case "task":
                    getTaskList(enterpriseUid);
                    break;
                }
            }else{
                //console.log("no enterpriseUid");
            }
        };
        if(enterpriseUid && $routeParams.deploy!="1"){
            getTaskList(enterpriseUid);
        }else{
           // console.log("no enterpriseUid");
        }
        self.createFlow = function(){
            $uibModal.open({
                animation: scope.animationsEnabled,
                templateUrl: "createModel.html",
                controller: "createModelCtrl"
            });
        };
        self.editFlow = function(editData){
            $location.url("/workflow/createflow?modelId="+editData.id);
        };
        self.deployedFlow = function(editData) {
            $uibModal.open({
                animation: scope.animationsEnabled,
                templateUrl: "deployedFlow.html",
                controller: "deployedFlowCtrl",
                resolve: {
                    items: function() {
                        return {
                            // userGroup:userGroup,
                            nodeData:editData,
                            refresh:self.refreshFlow
                        };
                    }
                }
            });
        };
        self.deleteFlow = function(checkedItems) {
            var content = {
                target: "deleteFlow",
                msg: "<span>您确定要删除吗？</span>",
                data:checkedItems
            };
            self.$emit("delete", content);
        };
        self.$on("deleteFlow", function(e,data) {
            var arr = [];
            var postData = { modelIds: arr };
            angular.forEach(data,function(v){
                arr.push(v.id);
            });
            if(enterpriseUid){
                workflowsrv.deleteFlow(enterpriseUid,postData)
                .then(function(){
                    getModelList(enterpriseUid);
                });
            }
        });
        self.deleteTask = function(checkedItems){
            var content = {
                target: "deleteTask",
                msg: "<span>您确定要删除吗？</span>",
                data:checkedItems
            };
            self.$emit("delete", content);
        };
        self.$on("deleteTask", function(e,data) {
            var arr = [];
            var postData = { deploymentIds: arr };
            angular.forEach(data,function(v){
                arr.push(v.deploymentId);
            });
            if(enterpriseUid){
                workflowsrv.deleteTask(postData).then(function(){
                    getTaskList(enterpriseUid);
                });
            }
        });
        self.getDetail = function(data){
            $uibModal.open({
                animation: scope.animationsEnabled,
                templateUrl: "taskDetail.html",
                controller: "getDetailCtrl",
                resolve: {
                    items: function() {
                        return data;
                    }
                }
            });
        };

        self.choseTask = function(){
            $location.url("/workflow/flowtask");
            self.flow.model = false;
            self.flow.task = true;
            self.active = 0;
            if(enterpriseUid){
                getTaskList(enterpriseUid);
            }else{
                //console.log("no enterpriseUid");
            }
        };
        self.choseModel = function(){
            self.flow.task = false;
            self.flow.model = true;
            self.active = 1;
            if(enterpriseUid){
                getModelList(enterpriseUid);
            }else{
                //console.log("no enterpriseUid");
            }
        };
        if($routeParams && $routeParams.deploy=="1"){
            self.choseModel();
        }
    }])
    .controller("getDetailCtrl",["$scope","items",function(scope,items){
    //.controller("getDetailCtrl",["$scope","items","workflowsrv",function(scope,items,workflowsrv){
        var self = scope;
        var enterpriseUid = localStorage.enterpriseUid ? localStorage.enterpriseUid : "";
        self.imgUrl = GLOBALCONFIG.APIHOST.WORKFLOW+"/v1/back/enterprises/"+enterpriseUid+"/processes/"+items.deploymentId;
    }])
    .controller("createModelCtrl",["$scope","workflowsrv","$location","$uibModalInstance",function(scope,workflowsrv,$location,$uibModalInstance){
        var self = scope;
        var enterpriseUid = localStorage.enterpriseUid ? localStorage.enterpriseUid : "";
        var data = {
            "name":"",
            "description":""
        };
        self.createModelconfirm = function(m){
            if(m.$valid){
                if(enterpriseUid){
                    data = {
                        "name":self.modelName,
                        "description":self.decription
                    };
                    workflowsrv.createFlow(enterpriseUid,data).success(function(result){
                        if(result){
                            $uibModalInstance.close();
                            $location.url("/workflow/createflow?modelId="+result);
                        }

                    });
                }
            }else{
                self.submitValid = true;
            }
        };
    }])
    .controller("deployedFlowCtrl",["$scope","workflowsrv","$location","$uibModalInstance","items",function(scope,workflowsrv,$location,$uibModalInstance,items){
        var self = scope;
        var enterpriseUid = localStorage.enterpriseUid ? localStorage.enterpriseUid : "";
        //self.userList = items.userGroup.user;
        self.modelImgUrl = GLOBALCONFIG.APIHOST.WORKFLOW+"/v1/back/enterprises/"+enterpriseUid+"/models/"+items.nodeData.id;
        self.userList = [];
        //self.groupList = items.userGroup.group;
        function getNodeDefault(){
            return {
                documentation:"",
                name:"",
                resourceId:"",
                usertaskassignment:{
                    assignment:{
                        candidateGroups:[],
                        candidateUsers:[]
                    }
                }
            };
        }
        workflowsrv.getModelNode(enterpriseUid,items.nodeData.id).then(function(result){
            if(result && result.data){
                angular.forEach(result.data,function(v,k){
                   // getCompare(items.userGroup.user,items.userGroup.group,v);
                    v.selectName = "member"+k;
                    v.resourceIdAssign.userList = [];
                    if(v.usertaskassignment.assignment.candidateGroups && v.usertaskassignment.assignment.candidateGroups.length>0){
                        var _a = v.usertaskassignment.assignment.candidateGroups[0].id;
                        if(_a){
                            workflowsrv.getGroupUser(_a).then(function(result){
                                if(result && result.data){
                                    v.resourceIdAssign.userList = result.data.filter((el)=>{
                                        return el.id!=localStorage.$USERID;
                                    });
                                    for(let c = 0;c<v.resourceIdAssign.userSelected.length;c++){
                                        for(let d = 0;d<v.resourceIdAssign.userList.length;d++){
                                            if(v.resourceIdAssign.userSelected[c].id==v.resourceIdAssign.userList[d].id){
                                                v.resourceIdAssign.user.push(v.resourceIdAssign.userList[d]);
                                            }
                                        }
                                    }
                                }
                            });
                        }
                        
                    }
                });
                self.nodeList = result.data;
            }
        });
        self.groupChange = function(v,k){
            self.nodeList[k].resourceIdAssign.userList = [];
            self.nodeList[k].resourceIdAssign.user = [];
            self.nodeList[k].resourceIdAssign.userSelected = [];
            if(v){
                workflowsrv.getGroupUser(v.id).then(function(result){
                    if(result && result.data){
                        self.nodeList[k].resourceIdAssign.userList = result.data;
                    }
                });
            }else{
                self.nodeList[k].resourceIdAssign.userList = [];
            }
            
            
        };
        function getCompare(userlist,grouplist,node){
            node.resourceIdAssign = {
                user:[],
                userSelected:[],
                group:""
            };
            /*if(node.usertaskassignment.assignment.candidateUsers && node.usertaskassignment.assignment.candidateUsers.length>0){
                var user = node.usertaskassignment.assignment.candidateUsers;
                for(var i=0;i<user.length;i++){
                    for(var j=0;j<userlist.length;j++){
                        if(user[i].id==userlist[j].id){
                            node.resourceIdAssign.userSelected.push(userlist[j]);
                            //self.$apply();
                        }
                    }
                }
            }*/
            /*if(node.usertaskassignment.assignment.candidateGroups){
                var group = node.usertaskassignment.assignment.candidateGroups;
                for(var k=0;k<group.length;k++){
                    for(var y=0;y<grouplist.length;y++){
                        if(group[k].id==grouplist[y].id){
                            node.resourceIdAssign.group.push(grouplist[y]);
                        }
                    }
                }
            }*/
            /*if(node.usertaskassignment.assignment.candidateGroups && node.usertaskassignment.assignment.candidateGroups.length>0){
                var group = node.usertaskassignment.assignment.candidateGroups;
                for(var k=0;k<grouplist.length;k++){
                    if(group[0].id==grouplist[k].id){
                        node.resourceIdAssign.group=grouplist[k];
                        break;
                    }
                }
            }*/
        }
        self.deployedFlowconfirm = function(v,deployedFlowForm){
            if(deployedFlowForm.$valid){
                var data = [];
                angular.forEach(v,function(item){
                    var deployData = getNodeDefault();
                    deployData.documentation = item.documentation;
                    deployData.name = item.name;
                    deployData.resourceId = item.resourceId;
                    if(item.resourceIdAssign.user){
                        for(var i=0;i<item.resourceIdAssign.user.length;i++){
                            deployData.usertaskassignment.assignment.candidateUsers.push({"value":item.resourceIdAssign.user[i].id.toString()});
                        }
                    }
                    if(item.resourceIdAssign.group){
                        deployData.usertaskassignment.assignment.candidateGroups.push({"value":item.resourceIdAssign.group.id.toString()});
                    }
                    data.push(deployData);
                });
                workflowsrv.deployedFlow(enterpriseUid,items.nodeData.id,data).then(function(result){
                    if(result && result.status=="0"){
                        $uibModalInstance.close();
                        items.refresh("model");
                    }
                });
            }else{
                self.submitValid = true;
            }

        };
    }]);

