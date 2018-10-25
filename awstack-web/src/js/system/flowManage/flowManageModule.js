import "./flowManageSrv";

var flowManageCtrlModule = angular.module('flowManageCtrlModule', ["flowManageSrvModule","checkedsrv",]);
flowManageCtrlModule.controller('flowCtrl', ['$scope',"flowManageSrv","$filter",'$routeParams',function(self,flowManageSrv,$filter,$routeParams) {
    if($routeParams.deploy){
        self.showView = false;
    }else{
        self.showView = true;
    }
    self.$on("getDetail", function(event, value) {
        var id = value.split("_")[0];
        var type =  value.split("_")[1];
        var enterpriseUid = localStorage.enterpriseUid ? localStorage.enterpriseUid : "";
       
        if(type == "coustomflow"){
            self.showCoustomflowInfo =true;
            self.modelImgUrl =window.GLOBALCONFIG.APIHOST.WORKFLOW+"/v1/back/enterprises/"+enterpriseUid+"/models/"+id
            flowManageSrv.getFlowDetail(enterpriseUid,id).then(function(data){
                if(data && data.data ){
                    self.coustomDetailData  ={
                        name : data.data.name ,
                        desc:JSON.parse(data.data.metaInfo).description,
                        createTime:$filter("date")(data.data.createTime, "yyyy-MM-dd HH:mm:ss"),
                        upDateTime:$filter("date")(data.data.lastUpdateTime, "yyyy-MM-dd HH:mm:ss"),
                    }
                }
            })
        }else{
            self.showCoustomflowInfo =false;
            flowManageSrv.getWorkflowDetail(id).then(function(data){
                if(data && data.data ){
                    self.workflowlData = data.data;
                  
                    if(data.data.detail.emailFlag){
                        self.workflowlData.detail.emailCtrl = "启用"
                    }else{
                        self.workflowlData.detail.emailCtrl = "未启用"
                    }
                    if(data.data.detail.wfDomain[0].domainUid =="ALL"){
                        self.workflowlData.detail.range = "全局"
                    }else{
                        self.workflowlData.detail.range = "部门"
                    }
                    self.modelImgUrl =window.GLOBALCONFIG.APIHOST.WORKFLOW+"/v1/back/enterprises/"+enterpriseUid+"/models/"+self.workflowlData.detail.modelId
                }
            })
           
        }
       
    });
    
}]);
flowManageCtrlModule.controller('flowManageCtrl', ['$scope',"$uibModal","flowManageSrv","NgTableParams",'GLOBAL_CONFIG', '$compile', '$routeParams', '$location', 'FileSaver', 'Blob', '$translate',"$filter","checkedSrv","$sce",
	function(scope,$uibModal,flowManageSrv,NgTableParams,GLOBAL_CONFIG, $compile, $routeParams, $location, FileSaver, Blob, $translate,$filter,checkedSrv,$sce) { 
        var enterpriseUid = localStorage.enterpriseUid ? localStorage.enterpriseUid : "";
        var self =scope ;
        self.inStepOneBar = 0;
        self.inStepTwoBar = 1;
        self.inStepThreeBar = 3;
       
        initTable();
        self.titleName="workflows";
        if(sessionStorage["workflows"]){
           self.titleData=JSON.parse(sessionStorage["workflows"]);
        }else{
           self.titleData=[
              {name:'workflow.wfName',value:true,disable:true,search:'wfName'},
              {name:'workflow.name',value:true,disable:true,search:'wfProcessName'},
              {name:'workflow.ticketType',value:true,disable:false,search:'ticketType'},
              {name:'workflow.range',value:true,disable:false,search:'range'},
              {name:'workflow.email',value:true,disable:false,search:'emailFlag'},
              {name:'workflow.wfDescription',value:true,disable:false,search:'wfDescription'},
            
           ];
        }
        self.portSearchTerm=function(obj){
            var tableData = obj.tableData;
            var titleData = obj.titleData;
            tableData.map(function(item){
                item.searchTerm="";
                titleData.forEach(function(showTitle){
                    if(showTitle.value){
                        item.searchTerm+=item[showTitle.search]+"\b";
                    }
                });
            });   
        };

        function operateDefaultName(result){
            if(result.child&&angular.isArray(result.child)){
               result.child.forEach(function(children){
                   if(children.domainUid=='default'){
                      children.name='默认部门';
                      if(children.child&&angular.isArray(children.child)){
                         children.child.forEach(function(innerChild){
                              if(innerChild.name=="admin"){
                                 innerChild.name="默认项目";
                              }
                         });
                      }
                   }
               });
            }
            return result;
        }

        self.createFlow =function(){
            var $createFlowModal = $uibModal.open({
                animation: self.animationsEnabled,
                backdrop: 'static',
                templateUrl: "createflow.html",
                controller:  "createFlowCtrl",
                resolve: {
                       initWrokflowTable:function(){
                           return  initTable
                       },
                       closeModal:function(){
                            return function(){
                                $createFlowModal.close()
                            }
                       },
                       operateDefaultName:function(){
                            return operateDefaultName;
                       }             
                }
            });
        }
        self.editWorkflow = function(checkedItems){
            var $createFlowModal = $uibModal.open({
                animation: self.animationsEnabled,
                backdrop: 'static',
                templateUrl: "createflow.html",
                controller:  "editFlowCtrl",
                resolve: {
                       initWrokflowTable:function(){
                            return  initTable
                       },
                       closeModal:function(){
                            return function(){
                                $createFlowModal.close()
                            }
                       },
                       flowUid:function(){
                            return self.checkedItems[0].deploymentId
                       },
                       operateDefaultName:function(){
                            return operateDefaultName;
                       } 
                }
            });
        }
        self.refreshTable = function(){
            initTable();
        }
        self.delFlow = function(checkedItems){
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
                flowManageSrv.deleteTask(postData).then(function(){
                    initTable();
                });
            }
        });
        self.applyGlobalSearch_=  function() {
			var term = self.globalSearchTerm_;
            self.workFlowTable.filter({searchTerm:term});
        };
        self.$watch(function () {
            return self.workflowTableCtrl;
        }, function (values) {
            
            if (values && self.workFlowTable) {
                self.workFlowTable.data.map(function (item) {
                    item.searchTerm = [item.name];
                    for (var obj in values) {
                        if (values[obj]) {
                            item.searchTerm.push(item[obj]);

                        } else {
                            removeByValue(item.searchTerm, item[obj]);
                        }
                    }
                    item.searchTerm = item.searchTerm.join(",");
                })
            }
        }, true)
        function removeByValue(arr, val) {
            for (var i = 0; i < arr.length; i++) {
                if (arr[i] == val) {
                    arr.splice(i, 1);
                    break;
                }
            }
        }
        function initTable(){
            self.globalSearchTerm_ ="";
            flowManageSrv.getWorkflowList().then(function(result){
                result ? self.workFlowData = true : "";
                if(result  && result.data){
                    var data = result.data
                    data.map(function(item){
                        item.ticketType =item.wfType.name ;
                        item.emailFlag = item.emailFlag?"是":"否";
                        if(item.wfDomain[0].domainUid ==="ALL"){
                            item.range = "全局"
                        }else{
                            item.range = "部门"
                        }
                        item.searchTerm = [item.wfName, item.wfProcessName, item.ticketType,item.range, item.emailInform, item.wfDescription+item.emailFlag].join(",");
                    })
                    self.tableData  =data ;
                    self.workFlowTable = new NgTableParams({ count: GLOBAL_CONFIG.PAGESIZE }, { counts: [], dataset:  self.tableData });
                    checkedSrv.checkDo(self,data,"deploymentId",'workFlowTable');
                }
            })
        }





	}
]);
flowManageCtrlModule.controller('customCtrl', ['$scope',"$uibModal","flowManageSrv",'NgTableParams', 'GLOBAL_CONFIG', '$compile', '$routeParams', '$location', 'FileSaver', 'Blob', '$translate',"$filter","checkedSrv","$sce",
	function(scope,$uibModal,flowManageSrv, NgTableParams, GLOBAL_CONFIG, $compile, $routeParams, $location, FileSaver, Blob,$translate,$filter,checkedSrv,$sce) {
        var enterpriseUid = localStorage.enterpriseUid ? localStorage.enterpriseUid : "";
        var self = scope;   
        self.applyGlobalSearch = function() {
			var term = self.globalSearchTerm_;
            self.customFlowTable.filter({searchTerm:term});
        };
        initTable();
        self.refresh  = function(){
            initTable ()
        }
        self.createCoustomFlow = function(){
            flowManageSrv.createModel(enterpriseUid).then(function(data){
                $location.path("/workflow/createCoustomflow/createflow"+data.data);
                console.log(data.data,"新建自定义流程");
            });
        }
        self.deleteCoustomFlow = function(checkedItems) {
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
                flowManageSrv.deleteFlow(enterpriseUid,postData)
                .then(function(){
                    initTable ()
                });
            }
        });
        
        function initTable (){
            self.globalSearchTerm_ = "";
            flowManageSrv.getModelData(enterpriseUid).then(function(result){
                result ? self.customFlowData = true : "";
                self.customFlowData = true;
                if(result && result.data){
                    var data = result.data
                    data.map(function(item){
                        item.metaInfo = JSON.parse(item.metaInfo);
                        item.lastUpdateTime = $filter("date")(item.lastUpdateTime, "yyyy-MM-dd HH:mm:ss");
                        item.createTime = $filter("date")(item.createTime, "yyyy-MM-dd HH:mm:ss");
                        item.description= item.metaInfo.description?item.metaInfo.description:"";
                        item.searchTerm = item.name+item.lastUpdateTime+item.createTime+item.metaInfo.description;
                    });
                    self.tableParamsData = data;
                    self.customFlowTable = new NgTableParams({ count: GLOBAL_CONFIG.PAGESIZE }, { counts: [], dataset: data });
                    checkedSrv.checkDo(self,data,"id",'customFlowTable');
                }
               
            })
        }
       


	}
]);

flowManageCtrlModule.controller('createFlowCtrl', ['$scope',"$uibModal","flowManageSrv", "$translate","initWrokflowTable","closeModal","operateDefaultName",
    function(scope,$uibModal,flowManageSrv, $translate,initWrokflowTable,closeModal,operateDefaultName) {
        var enterpriseUid = localStorage.enterpriseUid ? localStorage.enterpriseUid : "";
        scope.editViewShow=false;
        scope.emailActive = true;
        scope.showApprover = false ;
        scope.addApprover_text = "添加审批人" ;
        scope.inStep = 1;
        scope.inStepOneBar = 0;
        scope.inStepTwoBar = 1;
        scope.inStepThreeBar = 2;
        scope.createData = {};
        scope.tree = {
            approver :false
        }
        scope.stepTo = function (m, createForm) {
            
			/*可能项目没有*/
            if(createForm){
                if(createForm.$valid){
                    scope.checkFlowRepeatFlag = false ;
                    var id = scope.createData.flow.id ;
                    scope.submitValid = false;
                    if(m==2){
                        //document.getElementsByClassName("flow-moadl")[0].style.width  = "750px";
                        scope.showApprover = false;
                        flowManageSrv.getModelNode(enterpriseUid,id).then(function(data){
                           if(data && data.data && data.data.length){
                            scope.errorflow = false ;
                            scope.inStep = m
                            scope.modeNodes =data.data ;
                            scope.modeNodes.map(function(item,index){
                                item.name = $translate.instant("aws.workflow."+index) ;
                                item.index = index ;
                            })
                           }else{
                            scope.errorflow = true ;
                               return ;
                           }
                        })
                    } else if(m==3){
                       //检查 该部门是否已存在该类型的申请
                        var postData = [];
                        if(scope.createData.range.id == 0){
                            postData.push("ALL")
                        }else{
                            scope.createData.department.map(function(item){
                                postData.push(item.domainUid)
                            })
                        }
                        flowManageSrv.checkFlowRepeat(enterpriseUid,scope.createData.ticketType.type,{
                            domainUids:postData
                        }).then(function(data){
                            if(data){
                                scope.checkFlowRepeatFlag = !data.data;
                                 if(!data.data){
                                     return ;
                                 }else{
                                    scope.imgUrl =window.GLOBALCONFIG.APIHOST.WORKFLOW+"/v1/back/enterprises/"+enterpriseUid+"/models/"+id;
                                    scope.inStep = m;
                                    scope.errorApprover = false;
                                    getApprovers();
                                 }
                             }
                        })
                        
                        //图片
                       
                        
                    }else{
                        scope.showApprover = false;
                        scope.inStep = m
                    }
                    
                }else{
                    scope.submitValid = true;  
                    return
                }
            }else{
                scope.inStep = m
                scope.showApprover = false ;
				scope.submitValid = false;
            }
        }
        scope.checkData = {
            flowList:[],
            ticketList:[],
            ranges:[{
                name:"全局",
                id:0
            },{
                name:"部门",
                id:1
            }],
            departments:[],
        }
        scope.approverList = {

        };
        scope.delApprover = function(index){
            delete  scope["approverList"]["approver_"+ index];
            scope["approver_"+index+"_name"] = "" ;
            scope.tree.approver = false;
        }
        scope.addApprover = function(data,index){
            scope.node = index ;
            getApprovers();
            scope.approver_domain = "" ;
            scope.approver_project = "";
            scope.showApprover = true ;
        }
        scope.createData.range =scope.checkData.ranges[0];
        scope.changeRange = function(){
            scope.createData.department = {}
            scope.checkFlowRepeatFlag = false ;
        }
        scope.changeDepoartmentRange=function(){
            scope.checkFlowRepeatFlag = false ;
        }
        scope.changeflow = function(){
            scope.errorflow = false ;

        }
        initData()
        scope.change = function(data){
           if(data.managementRole){
              scope["approverList"]["approver_"+ scope.node] = data ;
              scope["approver_"+ scope.node+"_name"] = scope["approverList"]["approver_"+ scope.node]["name"] ;
           }else{
            scope["approver_"+data.context] = data.name ;
            scope["approver_id_"+data.context] = data[data.context+'Uid'] ;
            scope.approverGroup = data ;
           }
           checkApprover();
        }
		scope.interacted = function (field) {
			return scope.submitValid || field.$dirty;
        };
        scope.haveAppover = function(index){
            if(scope["approverList"]["approver_"+index] && scope["approverList"]["approver_"+index] != "{}"){
                return true;
            }else{
                return  false;
            }

        }
        scope.backInfo = function(node){
            switch (node) {
                case "all": 
                    scope.approverGroup = angular.copy(scope.approverGroupData) ;
                    scope.approver_domain = "" ;
                    scope.approver_project = "";
                break;
                case "domain": 
                    scope.approver_project = ""; 
                    var data = angular.copy(scope.approverGroupData) ;
                    data.child.map(function(item){
                        if(item.domainUid == scope.approver_id_domain){
                            scope.approverGroup = item ;
                        }
                    })
                break;
            }
        }
        // scope.$watch(function(){
        //     return scope.showApprover;
        // },function(val){
        //     if(val){
        //         document.getElementsByClassName("flow-moadl")[0].style.width  = "1050px";
        //     }else{
        //         document.getElementsByClassName("flow-moadl")[0].style.width  = "750px";
        //     }
        // })
        scope.createFlow = function(){
            checkApprover();
            if(scope.errorApprover){
                return 
            }else{
                var postData = {
                    modelId:scope.createData.flow.id,
                    enterpriseUid:enterpriseUid,
                    typeId:scope.createData.ticketType.id,
                    wfName:scope.createData.name,
                    wfDescription:scope.createData.desc?scope.createData.desc:"",
                    wfProcessName:scope.createData.flow.name,
                    createdTime:null,
                    emailFlag:scope.emailActive?1:0,
                    wfDomain:[],
                    assigns:[],
                }
                scope.modeNodes.map(function(item,index){
                    postData.assigns.push(
                        {
                            
                            "documentation":"",
                            "name":"",
                            "resourceId":item.resourceId,
                            "resourceIdAssign":"",
                            "usertaskassignment":{
                                "assignment":{
                                    "candidateUsers": [{"value":scope["approverList"]["approver_"+ index]["userId"]?String(scope["approverList"]["approver_"+ index]["userId"]):String(scope["approverList"]["approver_"+ index]["id"])}],
                                    "candidateGroups": null,
                                    "assignee": ""
                                },
                        }
                    }
                    )
                })
                if(scope.createData.range.id == 0){
                    postData.wfDomain.push({
                        "domainUid": "ALL"
                    })
                }else{
                    scope.createData.department.map(function(item){
                        postData.wfDomain.push({
                            "domainUid": item.domainUid
                        })
                    })
                }
                flowManageSrv.createWorkflow(postData).then(function(){
                    initWrokflowTable();
                    closeModal()
                });
            }
           
        }
        //判断审批人信息是否完善
        function checkApprover(){
            var approverList = Object.keys(scope.approverList).map(key=> scope.approverList[key]);
            // var approverList = Array.from(scope.approverList);
            if(approverList.length != scope.modeNodes.length){
                scope.errorApprover = true;
            }else{
                scope.errorApprover = false;
            }
        }
        function getApprovers(){
            flowManageSrv.getApprovers().then(function(data){
                if(data && data.data){
                    let result=operateDefaultName(data.data);
                    scope.approverGroup =result;
                    scope.approverGroupData = result;
                }   
            })
        }
       
        function initData(){

            flowManageSrv.getModelData(enterpriseUid).then(function(data){
                if(data && data.data && data.data.length){
                    scope.checkData.flowList = data.data ; 
                    scope.createData.flow = scope.checkData.flowList[0]
                }
            }) 
            flowManageSrv.getFlowList().then(function(data){
                if(data && data.data && data.data.length){
                    var arr = [];
                    let regionBusiAuth=localStorage.regionBusiAuth!=2?JSON.parse(localStorage.regionBusiAuth):[];
                    let vpcIndex=regionBusiAuth.indexOf("3");
                    let storageIndex=regionBusiAuth.indexOf("2");
                    data.data.map(function(item){
                        if(item.type != '11'){
                            arr.push(item)
                        }
                    })
                    if(vpcIndex==-1){
                       arr=arr.filter(item=>(item.type!='5'))
                    }
                    if(storageIndex==-1){
                       arr=arr.filter(item=>(item.type!='3'))
                    }
                    scope.checkData.ticketTypeList = arr ; 

                    scope.createData.ticketType = scope.checkData.ticketTypeList[0]
                   
                }
            })  
            flowManageSrv.getDepartments(enterpriseUid).then(function(data){
                if(data && data.data && data.data.length){
                    scope.checkData.departments = data.data ; 
                    scope.checkData.departments.map(function(item){
                       if(item.domainUid =='default'){
                            item.name = '默认部门'
                       }
                    })
                    scope.createData.department = scope.checkData.departments[0]
                }
            })       
        }
    }
]);
flowManageCtrlModule.controller('editFlowCtrl', ['$scope',"$uibModal","flowManageSrv", "$translate","initWrokflowTable","closeModal","flowUid","operateDefaultName",
    function(scope,$uibModal,flowManageSrv, $translate,initWrokflowTable,closeModal,flowUid,operateDefaultName) {
        var enterpriseUid = localStorage.enterpriseUid ? localStorage.enterpriseUid : "";
        scope.addApprover_text = "编辑审批人" ;
        scope.editViewShow=true;
        scope.showApprover = false ;
        scope.inStep = 1;
        scope.inStepOneBar = 0;
        scope.inStepTwoBar = 1;
        scope.inStepThreeBar = 2;
        scope.tree = {
            approver :false
        }
        scope.stepTo = function (m, createForm) {
			/*可能项目没有*/
            if(createForm){
                if(createForm.$valid){
                    var id = scope.createData.flow.id ;
                    scope.checkFlowRepeatFlag = false ;
                    scope.submitValid = false;
                    if(m==2){
                        scope.showApprover = false;
                        //document.getElementsByClassName("flow-moadl")[0].style.width  = "750px";
                        flowManageSrv.getModelNode(enterpriseUid,id).then(function(data){
                           if(data && data.data && data.data.length){
                            scope.errorflow = false ;
                            scope.inStep = m
                            scope.modeNodes =data.data ;
                            scope.modeNodes.map(function(item,index){
                                item.name = $translate.instant("aws.workflow."+index) ;
                                item.index = index ;
                            })
                           }else{
                            scope.errorflow = true ;
                               return ;
                           }
                        })
                    }
                   else if(m==3){
                        var postData ={
                            domainUids:[],
                            deploymentId:[flowUid]
                        };
                        if(scope.createData.range.id == 0){
                            postData.domainUids.push("ALL")
                        }else{
                            scope.createData.department.map(function(item){
                                postData.domainUids.push(item.domainUid)
                            })
                        }
                        flowManageSrv.checkFlowRepeat(enterpriseUid,scope.createData.ticketType.type,postData).then(function(data){
                            if(data){
                               scope.checkFlowRepeatFlag = !data.data;
                                if(!data.data){
                                    return ;
                                }else{
                                    scope.imgUrl =window.GLOBALCONFIG.APIHOST.WORKFLOW+"/v1/back/enterprises/"+enterpriseUid+"/models/"+id;
                                    scope.inStep = m;
                                    scope.errorApprover = false;
                                    // getApprovers();
                                }
                            }
                        })
                       
                        
                    }else{
                        scope.showApprover = false;
                        scope.inStep = m
                    }
                    
                }else{
                    scope.submitValid = true;  
                    return
                }
            }else{
                scope.inStep = m
                scope.showApprover = false ;
				scope.submitValid = false;
            }

        }
        scope.checkData = {
            flowList:[],
            ticketList:[],
            ranges:[{
                name:"全局",
                id:0
            },{
                name:"部门",
                id:1
            }],
            departments:[],
        }
        scope.approverList = {

        };
        scope.delApprover = function(index){
            delete  scope["approverList"]["approver_"+ index];
            scope["approver_"+index+"_name"] = "" ;
            scope.tree.approver = false;
        }
        scope.addApprover = function(data,index){
            scope.node = index ;
           if(scope["approverList"]["approver_"+ index] && scope["approverList"]["approver_"+ index].id){
                 var approverId =scope["approverList"]["approver_"+ index].id;
                 getApprovers(approverId);
           }else{
                 getApprovers()
           }
            scope.approver_domain = "" ;
            scope.approver_project = "";
            scope.showApprover = true ;
        }
       // scope.createData.range =scope.checkData.ranges[0];
        scope.changeRange = function(){
            scope.checkFlowRepeatFlag = false ;
            scope.createData.department = {}
        }
        scope.changeflow = function(){
            scope.checkFlowRepeatFlag = false ;
            scope.errorflow = false ;
        }
        initData()
        scope.change = function(data){
            if(data.child && data.child.length){
                data.child.map(function(item){
                    if(item.selected){
                        if(item.projectUid){
                            item.checkedId = item.projectUid
                        }else{
                            item.checkedId = item.domainUid
                        }
                    }
                })
            }
            if(data.user && data.user.length){
                data.user.map(function(item){
                    if(item.selected){
                        if(item.userId){
                            item.checkedId = item.userId
                        }else{
                            item.checkedId = item.id
                        }
                    }})
            }
           if(data.managementRole){
              scope["approverList"]["approver_"+ scope.node] = {
                  name:data.name,
                  id:data.id?data.id.toString():data.userId.toString()
              } ;
              scope["approver_"+ scope.node+"_name"] = scope["approverList"]["approver_"+ scope.node]["name"] ;
           }else{
            scope["approver_"+data.context] = data.name ;
            scope["approver_id_"+data.context] = data[data.context+'Uid'] ;
            scope.approverGroup = data;
           }
           checkApprover();
        }
        scope.changeDepoartmentRange=function(){
            scope.checkFlowRepeatFlag = false ;
        }
		scope.interacted = function (field) {
			return scope.submitValid || field.$dirty;
        };
        scope.haveAppover = function(index){
            if(scope["approverList"]["approver_"+index] && scope["approverList"]["approver_"+index] != "{}"){
                return true;
            }else{
                return  false;
            }

        }
        scope.backInfo = function(node){
            switch (node) {
                case "all": 
                    scope.approverGroup = angular.copy(scope.approverGroupData) ;
                    scope.approver_domain = "" ;
                    scope.approver_project = "";
                break;
                case "domain": 
                    scope.approver_project = ""; 
                    var data = angular.copy(scope.approverGroupData) ;
                    data.child.map(function(item){
                        if(item.domainUid == scope.approver_id_domain){
                            scope.approverGroup = item ;
                        }
                    })
                break;
            }
        }
        // scope.$watch(function(){
        //     return scope.showApprover;
        // },function(val){
        //     if(val){
        //         document.getElementsByClassName("flow-moadl")[0].style.width  = "1050px";
        //     }else{
        //         document.getElementsByClassName("flow-moadl")[0].style.width  = "750px";
        //     }
        // })
        scope.createFlow = function(){
            checkApprover();
            if(scope.errorApprover){
                return 
            }else{
                var postData = {
                    modelId:scope.createData.flow.id,
                    enterpriseUid:enterpriseUid,
                    deploymentId: flowUid, 
                    typeId:scope.createData.ticketType.type,
                    wfName:scope.createData.name,
                    wfDescription:scope.createData.desc?scope.createData.desc:"",
                    wfProcessName:scope.createData.flow.name,
                    createdTime:null,
                    emailFlag:scope.emailActive?1:0,
                    wfDomain:[],
                    assigns:[],
                }
                
                scope.modeNodes.map(function(item,index){
                    postData.assigns.push(
                        {
                            
                            "documentation":"",
                            "name":"",
                            "resourceId":item.resourceId,
                            "resourceIdAssign":"",
                            "usertaskassignment":{
                                "assignment":{
                                    "candidateUsers": [{"value":scope["approverList"]["approver_"+ index]["userId"]?String(scope["approverList"]["approver_"+ index]["userId"]):String(scope["approverList"]["approver_"+ index]["id"])}],
                                    "candidateGroups": null,
                                    "assignee": ""
                                },
                        }
                    }
                    )
                })
                if(scope.createData.range.id == 0){
                    postData.wfDomain.push({
                        "domainUid": "ALL"
                    })
                }else{
                    scope.createData.department.map(function(item){
                        postData.wfDomain.push({
                            "domainUid": item.domainUid
                        })
                    })
                }
                flowManageSrv.createWorkflow(postData).then(function(){
                    initWrokflowTable();
                    closeModal()
                });
            }
           
        }
        //判断审批人信息是否完善
        function checkApprover(){
            var approverList = Object.keys(scope.approverList).map(key=> scope.approverList[key]);
            // var approverList = Array.from(scope.approverList);
            if(approverList.length != scope.modeNodes.length){
                scope.errorApprover = true;
            }else{
                scope.errorApprover = false;
            }
        }
        function getApprovers(id){
            if(id){
                flowManageSrv.editGetApprovers(id).then(function(data){
                    if(data && data.data){
                        if(data.data && data.data.child){
                            data.data.child.map(function(item){
                                if(item.selected){
                                    item.checkedId = item.domainUid
                                }
                                
                            })
                        }
                        if(data.data && data.data.user){
                            data.data.user.map(function(item){
                                if(item.selected){
                                    if(item.userId){
                                        item.checkedId = item.userId
                                    }else{
                                        item.checkedId = item.id
                                    }
                                }
                                
                            })
                        }
                        let result=operateDefaultName(data.data);
                        scope.approverGroup =result;
                        scope.approverGroupData = result;
                    }   
                })
            }else{
                flowManageSrv.getApprovers().then(function(data){
                    if(data && data.data){
                        let result=operateDefaultName(data.data);
                        scope.approverGroup =result;
                        scope.approverGroupData = result;
                    }   
                })
            }
            
        }
        function getFowInfo(){
            flowManageSrv.getWorkflowDetail(flowUid).then(function(data){
                if(data && data.data){
                    scope.emailActive = data.data.detail.emailFlag?true:false;
                    scope.createData ={
                        name:data.data.detail.wfName,
                        flow:{
                            id:data.data.detail.modelId,
                            name:data.data.detail.wfProcessName
                        },
                        ticketType:data.data.detail.wfType,
                        desc:data.data.detail.wfDescription,
                        range:data.data.detail.wfDomain[0].domainUid =="ALL"?scope.checkData.ranges[0]:scope.checkData.ranges[1],
                    }
                    var arr = [] ;
                    scope.checkData.departments.map(function(item){
                        data.data.detail.wfDomain.map(function(data){
                            if(item.domainUid == data.domainUid){
                                arr.push(item)
                            }
                        })
                    })
                    scope.createData.department = arr ;
                   
                    data.data.assignment.allUsers.map(function(item,index){
                        scope["approver_"+index+"_name"] = item.Assign.name ;
                        scope["approverList"]["approver_"+ index] = item.Assign;
                    })
                }
            })
        }
        function initData(){   
            flowManageSrv.getDepartments(enterpriseUid).then(function(data){
                if(data && data.data && data.data.length){
                    scope.checkData.departments = data.data ; 
                    scope.checkData.departments.map(function(item){
                       if(item.domainUid =='default'){
                            item.name = '默认部门'
                       }
                    })
                    getFowInfo();
                }
            })    
        }
    }
]);
