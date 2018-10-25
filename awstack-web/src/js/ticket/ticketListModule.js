angular.module("ticketListModule", ["ngTable", "ngAnimate", "ui.bootstrap.tpls", "ui.tree", "checkedsrv"])
    .controller("ticketListCtrl", ["$scope", "$rootScope", "NgTableParams", "$uibModal", "ticketsrv", "alertSrv", "$translate", "checkedSrv", "$location","GLOBAL_CONFIG","$filter", function (scope, rootScope, NgTableParams, $uibModal, ticketsrv, alertSrv, $translate, checkedSrv, $location,GLOBAL_CONFIG,$filter) {
        var self = scope;
        var enterpriseUid = localStorage.enterpriseUid ? localStorage.enterpriseUid : "";
        var userId = localStorage.$USERID ? localStorage.$USERID : "";
        self.flow = {
            handling: true,
            handled: false
        };
        self.headers = {
            "name": $translate.instant("aws.workflow.curStep"),
            "hadledname": $translate.instant("aws.workflow.handlecurStep"),
            "title": $translate.instant("aws.workflow.applytype"),
            "description": $translate.instant("aws.workflow.description"),
            "createTime": $translate.instant("aws.workflow.createTime"),
            "lastUpdateTime": $translate.instant("aws.workflow.lastUpdateTime"),
            "version": $translate.instant("aws.workflow.version"),
            "action": $translate.instant("aws.workflow.action"),
            "initialAssigneeName": $translate.instant("aws.workflow.initialAssigneeName"),
            "applyTime": $translate.instant("aws.workflow.applyTime"),
            "proTime": $translate.instant("aws.workflow.proTime"),
            "status": $translate.instant("aws.workflow.status"),
            "statusName": $translate.instant("aws.workflow.statusName"),
            "transactor": $translate.instant("aws.workflow.transactor"),
            "endTime": $translate.instant("aws.workflow.dueTime"),
            "createTime": $translate.instant("aws.workflow.createTime"),
            "tiName": $translate.instant("aws.workflow.tiName"),
            "value": $translate.instant("aws.workflow.value"),
            "result": $translate.instant("aws.workflow.result"),
            "detail":$translate.instant("aws.workflow.detail")
        };
        self.applyGlobalSearch = function () {
            var term = self.flow.globalSearchTerm;
            self.tableParams.filter({$: term});
        };
        self.interacted = function(field) {
            return self.submitted || field.$dirty;
        };
        self.listType=function(type,item){
        	if(!item.dcnt && item.dcnt != undefined){
        		var time = new Date();
	        	var data = {
	        		readedtime : time,
	        		enterpriseUid:localStorage.enterpriseUid
	        	}
        		ticketsrv.changeMasStatus(userId,item.id,data).then(function(result){
        			ticketsrv.getMasTask(enterpriseUid,userId).then(function(data){
        				ticketsrv.unHandledMessage = data;
        			})
        			if(type == "noType"){
		        		getNoSignList();
		        		return
		        	}
        		});
        	}
        	if(type != "noType"){
        		localStorage.ticketsType=type;
                if(type == "resource"){
                    $location.search('id='+item.processInstanceId)
                }else if((type == "information")||(type == "reply")){
                    $location.search('id='+item.id)
                }
        	}
        }
        self.$on("getDetail", function(event, value) {
            self.ticketsType= localStorage.ticketsType;
            var notpass =  $translate.instant("aws.ticket.approvalStyle.notpass");
            var pass = $translate.instant("aws.ticket.approvalStyle.pass");
            var unapproved = $translate.instant("aws.ticket.approvalStyle.unapproved");
            if(self.ticketsType=='resource'){
                ticketsrv.seeTicket(value).then(function(res){
                    self.processIns = res.data;
                    /*数据转化*/
                    self.processIns.forEach(function(item,i){

                        if(item.variables.approve == false){
                            item.variables.approve= notpass;
                        }else if(item.variables.approve == true){
                            item.variables.approve=pass;
                        }else{
                            item.variables.approve=unapproved;
                        }
                        if(i>=1&&self.processIns[0].variables.approve==notpass){
                           self.processIns[i].variables.approve=pass; 
                        }
                        if (!item.assignee) {
                            item.variables.approve=unapproved;
                        }
                    })
                    /*相关变量展示*/
                    self.processVariable=res.data[0].variables;
                    ticketsrv.getAssignName(self.processVariable.applyUserId).then(function(resDate){
                        self.processVariable.applyUserId = resDate.data.name;
                    });
                });
            }else if(self.ticketsType=='reply'||'information'){
                /*获取对话列表*/
                function getQalist(){
                    ticketsrv.getQaRepliesByQaId(value).then(function(res){
                        if(res&&res.data){
                            self.wfqa = res.data.wfqa[0];
                            self.wfqareply = res.data.wfqareply;
                            self.wfqareply.forEach(function(item){
                                item.reply=item.reply.replace(/\n/g, "<br\/>")
                            })
                            ticketsrv.getAssignName(self.wfqa.createdby).then(function(result){
                                if(result&&result.data){
                                    self.wfqa.proposer=result.data.name;
                                }
                            })
                        }
                        self.qa={
                            description:""
                        }
                        /*提交回复*/
                        self.Replyconfirm=function(m){
                            if(m.$valid){

                               var params={
                                    reply:self.qa.description,
                                    createdby:userId,
                                    qaId:self.wfqa.id,
                                    enterpriseUid:enterpriseUid
                                }
                                ticketsrv.addQaReply(params,userId).then(function(){ 
                                    self.submitValid = false; 
                                	m.$setPristine();
        							m.$setUntouched();
                                    getQalist()
                                })   
                            }else{
                                self.submitValid = true;
                            }
                        }
                    })   
                }
                getQalist();
            }

        });

        //流程未处理数据
        function getNoSignList() {
            ticketsrv.getQaByUserTo(userId,0).then(function (result) {
                var data = [];
                if (result && result.data) {
                    if (result.data.length>0) {
                        result.data.map(item => {
                            item.curStep = item.cnt;
                            item.status = "status";
                            item.createTime = $filter("date")(item.createdtime, "yyyy-MM-dd HH:mm:ss");
                            item.endTime = $filter("date")(item.endTime, "yyyy-MM-dd HH:mm:ss");
                            item.types = $translate.instant("aws.ticket.informationType");
                            item.sortByCreateTime =item.createdtime
                        });
                        result.data.map(item => {
                             item.initialAssigneeName=item.createdbyName;
                            item.searchTerm =item.types + item.initialAssigneeName+ item.curStep  +item.createTime;
                        });
                    };
                    var Tabledata = result.data;
                    ticketsrv.getNoSignList(enterpriseUid,userId).success(function (res) {
                    	
                        if (res) { 
                            var data = res;
                            data.map(function(item){
                                item.curStep = item.name;
                                item.types= $translate.instant("aws.ticket.resourceType");
                                item.title = $translate.instant("aws.ticket.instanceApply");
                                item.sortByCreateTime =item.createTime
                                item.createTime = $filter("date")(item.createTime, "yyyy-MM-dd HH:mm:ss");
                                item.variables.types = $translate.instant("aws.workflow."+item.variables.type );
                                item.searchTerm = item.variables.types + item.name + item.initialAssigneeName + item.createTime;
                            });    

                            ticketsrv.unHandledTickets = res;
                            Tabledata = Tabledata.concat(data);
                            Tabledata = Tabledata.sort(sort("sortByCreateTime"))
                            self.NoSignListData=Tabledata;
                            self.NoSignList = new NgTableParams({count: GLOBAL_CONFIG.PAGESIZE}, {counts: [], dataset: Tabledata});
                            self.applyGlobalSearch = function () {
                                var term = self.flow.globalSearchTerm;
                                self.NoSignList.filter({searchTerm: term});
                            };
                        }
                    });
                }
            });
        }
        getNoSignList();
        self.SignList = function(){
            getNoSignList();
        }
        //排序函数
        function sort(property){
         return function(obj1,obj2){
             var value1 = obj1[property];
             var value2 = obj2[property];
             return value2 - value1;     // 升序
         }
    }
        //流程处理后的表格数据
        function gethandledList() {
            var notpass =  $translate.instant("aws.ticket.approvalStyle.notpass");
            var pass = $translate.instant("aws.ticket.approvalStyle.pass");
            var unapproved = $translate.instant("aws.ticket.approvalStyle.unapproved");
             ticketsrv.getQaByUserTo(userId,1).success(function(result){
             	if(result && result.length){
             		result.map(item =>{
             			item.variables = {}
             			 item.variables.type  = "tickTitle";
             			 item.name = item.cnt;
             			 item.initialAssigneeName =item.createdbyName;
             			  //处理初始化排序
             			 item.sortBytime = item.endtime; 
             			 item.endTime = $filter("date")(item.endtime, "yyyy-MM-dd HH:mm:ss");
             			 item.createdtime = item.endTime;
                          item.variables.approve = $translate.instant("aws.ticket.approvalStyle.close");
                          item.type = $translate.instant("aws.workflow.tickTitle");
                          item.searchTerm = item.type + item.createdbyName + item.name + item.endTime + item.variables.approve;
             		})
             		var tableData = result ;
             		
             	}else{
                    var tableData = []
                }
         		ticketsrv.gethandledList(enterpriseUid,userId).success(function (result) {
	                var data = [];
	                if (result) {
	                    var data = result;
	                    data.map(function(item){
	                        if(item.variables.approve == false){
	                            /*不通过*/
	                            item.variables.approve = notpass;
	                        }else if(item.variables.approve == true){
	                            /*通过*/
	                            item.variables.approve = pass;
	                        }else{
	                            /*未审批*/
	                            item.variables.approve = unapproved;
	                        }     
	                        //处理初始化排序
	                        item.sortBytime = item.endTime;
	                        item.endTime = $filter("date")(item.endTime, "yyyy-MM-dd HH:mm:ss");
	                        item.variables.types = $translate.instant("aws.workflow."+item.variables.type );
	                        item.showFlag = true;
	                        item.searchTerm = item.variables.types + item.name + item.initialAssigneeName + item.endTime + item.variables.approve;
	                    });
	                    tableData = tableData.concat(data);
	                    tableData = tableData.sort(sort("sortBytime"))
	                    self.tableParamsData = tableData;
	                    self.tableParams = new NgTableParams({count: GLOBAL_CONFIG.PAGESIZE}, {counts: [], dataset: tableData});
	                    self.applyGlobalSearch = function () {
	                        var term = self.flow.globalSearchTerm;
	                        self.tableParams.filter({searchTerm: term});                
	                    };
	                }
	            });
             })
          
        }

        //处理函数
        self.handle = function (item) {
            var scopes = self;
             
            var handleModal = $uibModal.open({
                animation: scope.animationsEnabled,
                templateUrl: "handleTask.html",
                scope: scopes
            });
            if(item.variables.type=="resourceApply"){
                var variables = {
                    domainUid:item.variables.domainUid,
                    projectname:item.variables.projectname,
                    type:item.variables.type
                };
                for(var k in item.variables.quota){
                    if(!rootScope.L3){
                        if(k!='floatingip'){
                            variables[k] = item.variables.quota[k]
                        }
                    }else{
                        variables[k] = item.variables.quota[k]; 
                    }
                }
                scopes.variables = variables;
            }
            scopes.chosData = [
                {
                    name: $translate.instant("aws.ticket.approvalStyle.yes"),
                    approve: true
                },
                {
                    name: $translate.instant("aws.ticket.approvalStyle.no"),
                    approve: false
                }
            ];
            scopes.pro = {
                signed: scopes.chosData[0].approve,
                description: ""
            };

            //确定提交,先进行工单的分配,再进行提交。
            scopes.handleTaskConfim = function (pro,form) {
                self.submitInValid = false;
                if(form.$valid){
                    var data = {
                        approve: pro.signed,
                        dec: pro.description
                    };
                    if (!item.assignee) {
                        ticketsrv.SignedTask(item.id,userId).then(function (result) {
                            if (result && result.status == "0") {
                                ticketsrv.handleTask(item.id, data).then(function () {
                                    getNoSignList();
                                    handleModal.close();
                                });
                            }
                        });
                    }else{
                        ticketsrv.handleTask(item.id, data).then(function () {
                            getNoSignList();
                            handleModal.close();
                        });
                    }   
                }else{
                    self.submitInValid = true;
                }
                
            };
        
        };

        //待处理
        self.choseHandling = function () {
            self.flow = {
                handling: true,
                handled: false
            };
            getNoSignList();
        };

        //已处理
        self.choseHandled = function () {
            self.flow = {
                handling: false,
                handled: true
            };
            gethandledList();
        };
    }])
