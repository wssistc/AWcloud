angular.module("allTicketsModule", ["ngTable", "ngAnimate", "ui.bootstrap.tpls", "ui.tree", "checkedsrv"])
    .controller("allTicketsCtrl", ["$scope", "$rootScope", "NgTableParams", "$uibModal", "ticketsSrv", "alertSrv", "$translate", "checkedSrv", "$location","GLOBAL_CONFIG","$filter", function (scope, rootScope, NgTableParams, $uibModal, ticketsSrv, alertSrv, $translate, checkedSrv, $location,GLOBAL_CONFIG,$filter) {
        var self = scope ;
        self.typesDisabled = true ;
        var userId = localStorage.$USERID ? localStorage.$USERID : "";
        var enterpriseUid = localStorage.enterpriseUid ? localStorage.enterpriseUid : "";
        self.domainName = localStorage.domainName;
        self.tickets = {
            flowList :[],
            type:{}
        }
        var tableData = [];
        self.titleName="allTickets";
        if(sessionStorage["allTickets"]){
            self.titleData=JSON.parse(sessionStorage["allTickets"]);
        }else{
            self.titleData=[
                {name:'ticket.ticketNum',value:true,disable:true,search:"ticketNumber"},
                {name:'ticket.servename',value:true,disable:false,search:"serverName"},
                {name:'ticket.ticketTitle',value:true,disable:false,search:"title"},
                {name:'ticket.approver',value:true,disable:false,search:"createdbyName"},
                {name:'ticket.approveTime',value:true,disable:false,search:"createTime"},

                {name:'ticket.ticketStatus',value:true,disable:false,search:"action"},
                {name:'ticket.ticketAction',value:true,disable:true,search:"_status"},
                
            ];
        }
        function allTicketsSearchTearm(obj){
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
        self.allTicketsSearchTearm = allTicketsSearchTearm;
        self.applyGlobalSearch = function () {
            var term = self.globalSearchTerm;
            self.alltTable.filter({searchTerm: term});
        };
        self.refresh = function(){
            self.globalSearchTerm = "";
            getTableData();
            getFlowList()
        }
        getTableData();
        getFlowList()
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
        self.changeType = function (data) {
            self.globalSearchTerm = "";
            if (data.id == "all") {
                self.alltTable = new NgTableParams({
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
                self.alltTable = new NgTableParams({
                    count: GLOBAL_CONFIG.PAGESIZE
                }, {
                    counts: [],
                    dataset: arr
                });
            }

        }
        function getTableData(){
            /*信息咨询数据*/
            ticketsSrv.getAllQas(userId).then(function (result) {
                result?self.loadData = true:"";
                var data = [];
                if (result && result.data) {
                    if (result.data.length>0) {
                        result.data.map(item => {
                            item.curStep = item.cnt;
                            item.status = "status";
                            item.createdtime = $filter("date")(item.createdtime, "yyyy-MM-dd HH:mm:ss");
                            item.type = $translate.instant("aws.ticket.informationType");
                            item._type = $translate.instant("aws.ticket.informationType");
                            item.ticketType = "11";
                            item.serverName = "其它-信息咨询"
                            
                            item.detailId = item.id;
                            if (item.endtime) {
                                item.endTime = $filter("date")(item.endtime, "yyyy-MM-dd HH:mm:ss");
                                item._status = "已关闭";
                                item.class="bg-orange";
                                item.action="";
                                
                            }else {
                                item.endTime = "";
                                item._status = "进行中";
                                item.action="回复";
                                item.class="bg-blue"
                            }
                            item.searchTerm =[item.ticketNumber,item.title,item.serverName,item.createdtime , item.createdbyName,item._status,item.action].join("\b");
                        });

                    };
                    var Tabledata = result.data;
                    /*资源申请数据*/
                    ticketsSrv.getAllResApplys(userId).then(function(res){
                        if(res&&res.data){
                            if (res.data.length>0) {
                                res.data.map(item => {
                                    item.type= $translate.instant("aws.ticket.resourceType");
                                    item._type = $translate.instant("aws.ticket.informationType");
                                   
                                    item.createdtime = item.ticketApplyTime;
                                    item.serverName = "资源申请-" + $translate.instant("aws.ticket.applyTypes." + item.ticketType);
                                    item.createdbyName = item.initialAssigneeName;
                                    item.detailId = item.processInstanceId;
                                   
                                    if (item.endTime) {
                                        item.endTime = $filter("date")(item.endTime, "yyyy-MM-dd HH:mm:ss");
                                        item._status = "已审批";
                                         item.action="";
                                        item.class="bg-green"
                                    }else{
                                        item.endTime = "";
                                        item._status = "待审批";
                                        item.class="bg-blue"
                                         item.action="审批";
                                    }
                                  
                                        item.searchTerm =[item.ticketNumber, item.serverName,item.createdtime ,item.action ,item.createdbyName ,item._status].join("\b");
                                });
                            };
                        /*信息咨询和资源申请数据整合*/
                        Tabledata = Tabledata.concat(res.data);
                        self.Tabledatas = Tabledata;
                        allTicketsSearchTearm({tableData:self.Tabledatas,titleData:self.titleData});
                        tableData = angular.copy(Tabledata);
                        self.alltTable = new NgTableParams({count: GLOBAL_CONFIG.PAGESIZE}, {counts: [], dataset: self.Tabledatas});
                        }
                    })
                }
            });
            self.$on("getDetail", function (event, value) {
                var value = value.split("_");
                var id = value[0];
                var userId = localStorage.$USERID ? localStorage.$USERID : "";
                var resId = value[2]
                self.wfqareply = [];
                self.wfqa = {};
                self.type = value[1];
                self.endTime = ""
                self.qa = {
                    description: ""
                }
                self.approveInfo = {
                    
                }
                self.emptyReplay = false;
                self.approveId = false ;
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
                                $location.url("ticket/allTickets")
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
                            self.endtime = self.wfqa.endtime;
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
                                if(self.type == "11"){
                                    ticketsSrv.addQaReply(params, userId).then(function () {
                                        self.submitValid = false;
                                        m.$setPristine();
                                        m.$setUntouched();
                                        getQalist(id)
                                    })
                                }else{
                                    alert(11)
                                }
                               
                            } else {
                                self.submitValid = true;
                            }
                        }
                    })
                }
    
                function getResApplyInfo(id) {
                    ticketsSrv.seeTicket(id).then(function (res) {
                        if (res && res.data && res.data.length) {
                            var infoData ;
                            res.data.map(function(item,index){
                                if(resId == item.id){
                                    infoData = item ;
                                }
                            })
                            var findData = (res.data).reverse();
                            self.processVariable = infoData.variables;
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
                            self.approveId =infoData.id;
                            self.endtime = infoData.endTime;
                            self.deploymentId = res.data[0].deploymentId
                            var processInstanceId =  res.data[0].processInstanceId?res.data[0].processInstanceId:null
                            if(self.processVariable.isUndo){
                                self.approveResult = "已撤销"
                            }else{
                                if(self.processVariable.isComplete == "0"){
                                    self.approveResult = "审批中"
                                }else if(self.processVariable.isComplete == "1"){
                                    self.approveResult = "审批通过"
                                }else{
                                    self.approveResult = "已拒绝"
                                }
                            } 
                            var qaId = infoData.qaid;
                            self.wfqa = {
                                proposer: self.processVariable.userName,
                                createdtime: $filter("date")(infoData.createTime, "yyyy-MM-dd HH:mm:ss"),
                                ticketNumber:infoData.ticketNumber,
                                ticketApplyTime:res.data[0].ticketApplyTime
                            }
                            getResQalist(qaId)
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
                        ticketsSrv.getTicketFlowInfo(id,processInstanceId).then(function(data){
                            if(data &&  data.data ){
                                var approveInfo = data.data ;
                                var index_; 
                               if(approveInfo.currentUser.result =="2"){
                                approveInfo.allUsers.map(function(item,index){
                                    item.approverResult = $translate.instant("aws.ticket.approvalStyle.1");
                                    if(item.dueTime){
                                        index_ = index+1;
                                        return;
                                    }
                                    
                                })
                                    approveInfo.allUsers =  approveInfo.allUsers.slice(0,index_);
                                    approveInfo.allUsers[index_-1].approverResult = "已拒绝"
                                    self.approveInfo = approveInfo;
                               }else{
                                approveInfo.allUsers.map(function(item,index){
                                    item.approverResult = $translate.instant("aws.ticket.approvalStyle.1");
                                    if(item.user == approveInfo.currentUser.user ){
                                        item.approverResult = $translate.instant("aws.ticket.approvalStyle."+approveInfo.currentUser.result);
                                        index_ = index+1
                                    }
                                   
                                })
                                approveInfo.allUsers.map(function(item,index){
                                 
                                    if(index>=index_ ){
                                        item.approverResult = "待审批";   
                                    }
                                   
                                })
                                self.approveInfo = approveInfo;
                               }
                              
                            }
                        })
                    }
    
            });
    }
       
    }]);
