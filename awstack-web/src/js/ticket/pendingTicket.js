angular.module("pendingTicketModule", ["ngTable", "ngAnimate", "ui.bootstrap.tpls", "ui.tree", "checkedsrv"])
    .controller("pendingTicketCtrl", ["$scope", "$rootScope", "NgTableParams", "$uibModal", "ticketsSrv", "alertSrv", "$translate", "checkedSrv", "$location", "GLOBAL_CONFIG", "$filter", function (scope, rootScope, NgTableParams, $uibModal, ticketsSrv, alertSrv, $translate, checkedSrv, $location, GLOBAL_CONFIG, $filter) {
        var self = scope;
        self.typesDisabled = true;
        var userId = localStorage.$USERID ? localStorage.$USERID : "";
        self.domainName = localStorage.domainName;
        var tableData = [];
        var enterpriseUid = localStorage.enterpriseUid ? localStorage.enterpriseUid : "";
        self.tickets = {
            flowList: [],
            type: {}
        }
        self.titleName="pendingTickets";
        if(sessionStorage["pendingTickets"]){
            self.titleData=JSON.parse(sessionStorage["pendingTickets"]);
        }else{
            self.titleData=[
                {name:'ticket.ticketNum',value:true,disable:true,search:"ticketNumber"},
                {name:'ticket.servename',value:true,disable:false,search:"serverName"},
                {name:'ticket.ticketTitle',value:true,disable:false,search:"title"},
                {name:'ticket.approver',value:true,disable:false,search:"createdbyName"},
                {name:'ticket.approveTime',value:true,disable:false,search:"createTime"},
                {name:'ticket.ticketAction',value:true,disable:true,search:"action"},
                
            ];
        }
        function pendingTicketSearchTearm(obj){
            var tableData = obj.tableData;
            var titleData = obj.titleData;
            tableData.map(function(item){
                item.searchTerm="";
                titleData.forEach(function(showTitle){
                        if(showTitle.value){
                            item.searchTerm+=item[showTitle.search];
                        }
                });
            });
        }
        self.pendingTicketSearchTearm = pendingTicketSearchTearm;
        self.refresh = function () {
            self.globalSearchTerm = "";
            getFlowList();
            getTableData();
        }
        self.changeType = function (data) {
            self.globalSearchTerm = "";
            if (data.id == "all") {
                self.pendingTicketTable = new NgTableParams({
                    count: GLOBAL_CONFIG.PAGESIZE
                }, {
                    counts: [],
                    dataset: tableData
                });
            } else {
                var arr = []
                tableData.map(function (item) {
                    if (item.ticketType == data.id) {
                        arr.push(item)
                    }
                })
                self.pendingTicketTable = new NgTableParams({
                    count: GLOBAL_CONFIG.PAGESIZE
                }, {
                    counts: [],
                    dataset: arr
                });
            }

        }
        getTableData();
        getFlowList()

        function getTableData() {
            ticketsSrv.getQaByUserTo(userId, 0).then(function (result) {
                result?self.loadData = true:"";
                var data = [];
                if (result && result.data) {
                    if (result.data.length > 0) {
                        result.data.map(item => {
                            item.curStep = item.cnt;
                            item.status = "status";
                            item.createTime = $filter("date")(item.createdtime, "yyyy-MM-dd HH:mm:ss");
                            item.endTime = $filter("date")(item.endTime, "yyyy-MM-dd HH:mm:ss");
                            item.serverName = "其它-信息咨询";
                            item.sortByCreateTime = item.createdtime;
                            item.action = "回复";
                            item.ticketType = "11";
                            item.searchTerm = [item.ticketNumber ,item.serverName ,item.title,item.createdbyName , item.createTime ,item.action].join("\b");
                            item.detailId = item.id;
                        });
                    };
                    var Tabledata = result.data;
                    ticketsSrv.getNoSignList(enterpriseUid, userId).success(function (res) {
                        if (res) {
                            var data = res;
                            data.map(function (item) {
                                item.curStep = item.name;
                                item.types = $translate.instant("aws.ticket.resourceType");
                                item.serverName = "资源申请-" + $translate.instant("aws.ticket.applyTypes." + item.ticketType);
                                item.sortByCreateTime = item.createTime
                                item.createTime = item.ticketApplyTime
                                item.variables.types = $translate.instant("aws.workflow." + item.variables.type);
                                item.createdbyName = item.initialAssigneeName;
                                item.action = "审批";
                                item.detailId = item.processInstanceId;
                                item.searchTerm = [item.ticketNumber ,item.serverName ,item.createdbyName ,item.createTime+item.action].join("\b")
                                
                            });

                            ticketsSrv.unHandledTickets = res;
                            Tabledata = Tabledata.concat(data);
                            // Tabledata = Tabledata.sort(sort("sortByCreateTime"))
                            self.NoSignListData = Tabledata;
                            self.tableData = Tabledata;
                            tableData = angular.copy(Tabledata);
                            pendingTicketSearchTearm({tableData:self.tableData,titleData:self.titleData});
                            self.pendingTicketTable = new NgTableParams({
                                count: GLOBAL_CONFIG.PAGESIZE
                            }, {
                                counts: [],
                                dataset: Tabledata
                            });
                            self.applyGlobalSearch = function () {
                                var term = self.globalSearchTerm;
                                self.pendingTicketTable.filter({
                                    searchTerm: term
                                });
                            };
                        }
                    });
                }
            });
        }
        function getFlowList(){
            ticketsSrv.getFlowList().then(function(data){
                if(data && data.data &&data.data.length){
                   self.tickets.flowList = data.data;
                   self.tickets.flowList.unshift({
                       name:"全部",
                       type:"all",
                       id:"all"
                   })
                   self.tickets.type = self.tickets.flowList[0]
                    self.typesDisabled =false;
                }
            })
        }
        self.$on("getDetail", function (event, value) {
            var value = value.split("_");
            var id = value[0];
            var userId = localStorage.$USERID ? localStorage.$USERID : "";
            self.wfqareply = [];
            self.wfqa = {};
            self.type = value[1];
            self.qa = {
                description: ""
            }
            self.approveInfo = []
            self.approveId = false;
            self.emptyReplay = false ;
            if (self.type == "11") {
                self.detailTitle = "信息咨询"
            } else {
                self.detailTitle = "资源申请 " + $translate.instant("aws.ticket.applyTypes." + self.type);
            }
            switch (self.type) {
                case "1":
                    self.processVariable = {};
                    getResApplyInfo(id)
                   
                    break;
                case "2":
                    self.processVariable = {};
                    getResApplyInfo(id);
                    break;
                case "3":
                    self.processVariable = {};
                    getResApplyInfo(id);
                    break;
                case "4":
                    self.processVariable = {};
                    getResApplyInfo(id);
                case "5":
                    self.processVariable = {};
                    getResApplyInfo(id);
                    break;
                case "11":
                    getQalist(id);
                    changeMessageStatus(userId,id)
                    break;
            }
            self.handleTaskConfim = function (form, type) {
                var data = {

                };
                if (type == "1") {
                    data = {
                        approve: true,
                        auto: true
                    };
                } else if (type == "2") {
                    data = {
                        approve: true,
                        auto: false
                    };
                } else {
                    data = {
                        approve: false,
                    };
                }
                ticketsSrv.SignedTask(self.approveId, userId).then(function (result) {
                    if (result && result.status == "0") {
                        ticketsSrv.handleTask(self.approveId, data).then(function () {
                            $location.url("ticket/pendingTickets")
                            self.tickets.type = self.tickets.flowList[0];
                            getTableData();
                        });
                    }
                })

            };
            self.changeReplay = function(){
                self.emptyReplay = false;
            }
            function getQalist(id) {
                ticketsSrv.getQaRepliesByQaId(id).then(function (res) {
                    if (res && res.data) {
                        self.qa = {
                            description: ""
                        }
                        self.wfqa = res.data.wfqa[0];
                        self.wfqareply = res.data.wfqareply;
                        self.wfqa.ticketApplyTime =  $filter("date")(self.wfqa.createdtime, "yyyy-MM-dd HH:mm:ss");
                        self.wfqareply.forEach(function (item) {
                            item.reply = item.reply.replace(/\n/g, "<br\/>")
                        })
                        ticketsSrv.getAssignName(self.wfqa.createdby).then(function (result) {
                            if (result && result.data) {
                                self.wfqa.proposer = result.data.name;
                            }
                        })
                    }
                   
                    /*提交回复*/
                    self.Replyconfirm = function (m) {

                        if (m.$valid) {
                            if(self.qa.description ==""){
                                self.emptyReplay = true ;
                                return ;
                            }
                            var params = {
                                reply: self.qa.description,
                                createdby: userId,
                                qaId: self.wfqa.id,
                                enterpriseUid: enterpriseUid
                            }
                           
                                ticketsSrv.addQaReply(params, userId).then(function () {
                                    self.submitValid = false;
                                    m.$setPristine();
                                    m.$setUntouched();
                                    getQalist(id)
                                })
                           
                           
                        } else {
                            self.submitValid = true;
                        }
                    }
                })
            }
            function changeMessageStatus(userId,id){
                var time = new Date();
	        	var data = {
	        		readedtime : time,
	        		enterpriseUid:localStorage.enterpriseUid
                }
                ticketsSrv.changeMasStatus(userId,id,data).then(function(result){
        			ticketsSrv.getMasTask(enterpriseUid,userId).then(function(data){    
                        getTableData();  
                        self.tickets.type = self.tickets.flowList[0]   
        				ticketsSrv.unHandledMessage = data;
        			})
        		});
            }
            function getResApplyInfo(id) {
                ticketsSrv.seeTicket(id).then(function (res) {
                    if (res && res.data && res.data.length) {
                      
                        self.processVariable = res.data[0].variables;
                         //因为自动创建 需处理参数结构
                        if(self.type == "1" || self.type == "10" ){
                            var arr ={};
                            self.processVariable.quota.map(function(item){
                                var name =item.name ;
                                var num = item.hardLimit ;
                                arr[name] = num
                            })
                            self.processVariable.quota=arr;
                        }
                        self.approveId = res.data[0].id;
                        self.deploymentId = res.data[0].deploymentId
                        var processInstanceId =  res.data[0].processInstanceId?res.data[0].processInstanceId:null
                        var qaId = res.data[0].qaid;
                        
                        self.wfqa = {
                            proposer: self.processVariable.userName,
                            createdtime: $filter("date")(res.data[0].createTime, "yyyy-MM-dd HH:mm:ss"),
                            ticketNumber:res.data[0].ticketNumber,
                            ticketApplyTime:res.data[0].ticketApplyTime
                        }
                        getResQalist(qaId);
                        getTicketFlowInfo(self.deploymentId,processInstanceId)
                    }
                });
            }
            function getResQalist(id) {
                ticketsSrv.getQaRepliesByQaId(id).then(function (res) {
                    if (res && res.data) {
                        self.qa = {
                            description: ""
                        }
                        self.wfqareply = res.data.wfqareply;
                        self.wfqareply.forEach(function (item) {
                            item.reply = item.reply.replace(/\n/g, "<br\/>")
                        })
                        
                    }
                   
                    /*提交回复*/
                    self.Replyconfirm = function (m) {
                        if (m.$valid) {
                            if(self.qa.description ==""){
                                self.emptyReplay = true ;
                                return ;
                            }
                            var params = {
                                reply: self.qa.description,
                                createdby: userId,
                                qaId: id,
                                enterpriseUid: enterpriseUid
                            }
                           
                                ticketsSrv.addQaReply(params, userId).then(function () {
                                    self.submitValid = false;
                                    m.$setPristine();
                                    m.$setUntouched();
                                    getResQalist(id)
                                })
                           
                           
                        } else {
                            self.submitValid = true;
                        }
                    }
                })
            }
            //资源申请 获取审批人信息
            
            function getTicketFlowInfo(id,processInstanceId){
                ticketsSrv.getTicketFlowInfo(id,processInstanceId).then(function(res){
                    if(res &&  res.data ){
                        var approveInfo = res.data ;
                        var index_;                    
                        approveInfo.allUsers.map(function(item,index){
                            item.approverResult = $translate.instant("aws.ticket.approvalStyle.1");
                            if(item.user ==  approveInfo.currentUser.user ){
                                item.approverResult = $translate.instant("aws.ticket.approvalStyle."+approveInfo.currentUser.result);
                                index_ = index+1
                            }
                            
                                // self.finishApprove = "("+$translate.instant("aws.workflow."+(index_-1))+")";
                           
                       
                        })
                        approveInfo.allUsers.map(function(item,index){
                     
                            if(index>=index_ ){
                                item.approverResult = "待审批";   
                            }
                           
                        })
                        self.approveInfo = approveInfo;
                    }
                })
            }
        });

    }]);

