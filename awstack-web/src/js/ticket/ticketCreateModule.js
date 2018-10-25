
var ticketCreateModule=angular.module("ticketCreateModule", ["ngTable", "ngAnimate", "ui.bootstrap.tpls", "ui.tree", "checkedsrv"]);
ticketCreateModule.controller("ticketCreateCtrl", ["$scope", "$rootScope", "NgTableParams", "$uibModal", "ticketsrv","ticketListData","$translate","GLOBAL_CONFIG","$filter","$location", function (scope, rootScope, NgTableParams, $uibModal, ticketsrv,ticketListData,$translate,GLOBAL_CONFIG,$filter,$location) {
    var self = scope;
    var enterpriseUid = localStorage.enterpriseUid ? localStorage.enterpriseUid : "";
    var userId = localStorage.$USERID ? localStorage.$USERID : "";
    var ticketObj = {};
    self.create = {globalSearchTerm:""};
    self.headers = {
        "title": $translate.instant("aws.workflow.title"),
        "curStep": $translate.instant("aws.ticket.curStep"),
        "type": $translate.instant("aws.workflow.applytype"),
        "status": $translate.instant("aws.ticket.statusAction"),
        "startTime": $translate.instant("aws.ticket.startTime"),
        "endTime": $translate.instant("aws.ticket.endTime")
    };
    function getApplyList() {
        /*信息咨询数据*/
        ticketsrv.getApplyList(userId).then(function (result) {
            var data = [];
            if (result && result.data) {
                if (result.data.length>0) {
                    result.data.map(item => {
                        item.curStep = item.cnt;
                        item.status = "status";
                        item.createdtime = $filter("date")(item.createdtime, "yyyy-MM-dd HH:mm:ss");
                        item.type = $translate.instant("aws.ticket.informationType");
                        item._type = $translate.instant("aws.ticket.informationType");
                        if (item.endtime) {
                            item.endTime = $filter("date")(item.endtime, "yyyy-MM-dd HH:mm:ss");
                            item._status = $translate.instant("aws.workflow.operations.closed");
                        }else {
                            item.endTime = "";
                            item._status = $translate.instant("aws.workflow.operations.close");
                        }
                    });
                    result.data.map(item => {
                        item.searchTerm =item.title+ item.type+item.curStep + item.createdtime + item.endTime +item._status;
                    });
                };
                var Tabledata = result.data;
                /*资源申请数据*/
                ticketsrv.getApplyListR(userId).then(function(res){
                    if(res&&res.data){
                        if (res.data.length>0) {
                            res.data.map(item => {
                                item.type= $translate.instant("aws.ticket.resourceType");
                                item._type = $translate.instant("aws.ticket.informationType");
                                item.title = $translate.instant("aws.ticket.instanceApply");
                                item.createdtime = $filter("date")(item.startTime, "yyyy-MM-dd HH:mm:ss");
                                if (item.endTime) {
                                    item.endTime = $filter("date")(item.endTime, "yyyy-MM-dd HH:mm:ss");
                                }else{
                                    item.endTime = "";
                                }
                                if (item.endActivityId) {
                                    item.searchTerm =item.title+item.type+ item.endActivityId + item.createdtime + item.endTime +$translate.instant("aws.workflow."+item.status);
                                }else {
                                    item.searchTerm =item.title+item.type+ item.curStep + item.createdtime + item.endTime +$translate.instant("aws.workflow."+item.status);
                                }
                            });
                        };
                    /*信息咨询和资源申请数据整合*/
                    Tabledata = Tabledata.concat(res.data);
                    self.Tabledatas = Tabledata;
                    self.tableParams = new NgTableParams({count: GLOBAL_CONFIG.PAGESIZE}, {counts: [], dataset: self.Tabledatas});
                    }
                })
            }
        });
    }
    self.SignList=function(){
        getApplyList()
    }
    self.applyGlobalSearch = function (userId,data) {
    	
        var term = self.create.globalSearchTerm;
        self.tableParams.filter({searchTerm: term});
    };
    //getApplyList();
    self.tiApp = function(){
        getApplyList();
    };
    if(ticketListData && ticketListData.data.length>0){
        angular.forEach(ticketListData.data,function(item){
            ticketObj[item.paramName]=item.paramValue;
        });
    }
    self.ticketQuestions = [
        {
            icon: "icon-aw-dialogue",
            title: "tickTitle",
            dec: "tickDec",
            button: "tickButton",
            type: "ticket"
        },
        {
            icon: "icon-aw-gear",
            title: "resTitle",
            dec: "resDec",
            button: "resButton",
            type: "resource"
        }
    ];
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
                $location.search('id='+item.processInstanceId+'&createdtime='+item.createdtime)
            }else if((type == "information")||(type == "reply")){
                $location.search('id='+item.id)
            }
        }
    }
    //关闭信息咨询流程
    self.closeMesApply = function(id){
    	var data = {
    		enterprise_uid:enterpriseUid,
    		qa_id :id
    	}
    	 ticketsrv.closeMasQur(id,data).success(function(result){
    	 	 var changeInfo ;
    	 	 ticketsrv.getApplyList(userId).then(function(result){
    	 	 	result.data.map(function(item){
    	 	 		if(item.id == id){
    	 	 			changeInfo = item;
    	 	 			changeInfo.endtime = $filter("date")(item.endtime, "yyyy-MM-dd HH:mm:ss");
    	 	 		}
    	 	 	})
    	 	 	self.Tabledatas.map(function(item){
	    	 		if(item.id == id){
	    	 			item.endtime = changeInfo.endtime;
	    	 		}
    	 		})
    	 	 })
    	 	
    	 	ticketsrv.getMasTask(enterpriseUid,userId).then(function(data){
        				ticketsrv.unHandledMessage = data;
        		})
    	 });
    	
    }
    self.$on("getDetail", function(event, value) {
        self.ticketsType= localStorage.ticketsType;
        if(self.ticketsType=='reply'){
            function getQalist(){
                ticketsrv.getQaRepliesByQaId(value).then(function(res){
                    if(res&&res.data){
                        self.wfqa = res.data.wfqa[0];
                        self.wfqareply = res.data.wfqareply;
                        self.wfqareply.forEach(function(item){
                            item.reply=item.reply.replace(/\n/g, "<br\/>")
                            ticketsrv.getAssignName(item.createdby).then(function(result){
                                if(result&&result.data){
                                    item.createdby=result.data.name;
                                }
                            })
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
                                getQalist()
                            })   
                        }else{
                            self.submitValid = true;
                        }
                    }

                })   
            }
            getQalist();
        }else if(self.ticketsType=='resource'){
            ticketsrv.seeTicket(value).then(function(res){
                self.processVariable=res.data[0].variables;
                if(self.processVariable.approve!=undefined){
                    if(self.processVariable.approve==true){
                        if(res.data[0].assigneeName){
                            self.processVariable.approve=1;
                        }else{
                            self.processVariable.approve=0;  
                        }
                    }else if(self.processVariable.approve==false){
                        self.processVariable.approve=2;
                    }
                }else{
                    self.processVariable.approve=0;
                }
                if(self.processVariable.applyUserId){
                    ticketsrv.getAssignName(self.processVariable.applyUserId).then(function(resDate){
                        self.processVariable.applyUser = resDate.data.name;
                        self.processVariable.createdtime = $location.search().createdtime;                        
                    });
                }
            });
        }
    });
    self.ticketApply = function (v) {
        switch (v) {
        case "ticket":
            ticketQa();
            break;
        case "resource":
            resourceApply();
            break;
        default :
                //console.log("no ticket type");
            break;
        }
    };
    /*信息咨询页面*/
    function ticketQa() {
        scope.submitValid = false;
        ticketsrv.getAddressee().then(function(res){
            if(res&&res.data){
                self.Addressee=res.data;
            }
        });
        scope.qa = {
            userTo: "",
            title: "",
            description: ""
        };
        scope.Addresseegroup = {};
        scope.Addresseegroup.selected = [];
        var qaModal = $uibModal.open({
            animation: scope.animationsEnabled,
            templateUrl: "ticketQa.html",
            scope: self
        })
 
        scope.ticketQaconfirm = function (m) {
            var id = JSON.parse(localStorage.$LOGINDATA).id.toString();
            if (m.$valid) {
                var usergroup=[]
                _.forEach(scope.Addresseegroup.selected,function(item){
                    usergroup.push(item.id)
                })
                scope.qa.userTo=usergroup.join(",");
                var qaData = {
                        title: scope.qa.title,
                        userTo: scope.qa.userTo,
                        description : scope.qa.description,
                        createdby:userId,
                        enterpriseUid:enterpriseUid

                };
                ticketsrv.addQaFun(qaData,userId).then(function (res) {
                	ticketsrv.getMasTask(enterpriseUid,userId).then(function(data){
        				ticketsrv.unHandledMessage = data;
        			});
                    qaModal.close();
                });
            } else {
                scope.submitValid = true;
            }
        };
    }

    function resourceApply() {
        scope.submitValid = false;
        scope.departDisabled = true;
        scope.proDisabled = true;
        var localData = localStorage.$LOGINDATA ? JSON.parse(localStorage.$LOGINDATA) : [];
        var resourceModal = $uibModal.open({
            animation: scope.animationsEnabled,
            templateUrl: "ticketResource.html",
            scope: self
        });
        var id = JSON.parse(localStorage.$LOGINDATA).id.toString();
        var resourceData = {
            busiData: {
                applyUserId: "",
                domainUid: "",
                projectUid: "",
                quota:""
            },
            key: ""
        };
        scope.tickets = {
            depart: {selected: ""},
            deparList: [],
            pro: {selected: ""},
            projectsList: []
        };
        ticketsrv.getProjectsList().then(function (result) {
            var k;
            if (result && result.data) {
                if (result.data.default) {
                    result.data.default.map(function (item, index) {
                        if (item.projectname == "service") {
                            result.data.default.splice(index, 1);
                        }
                    });
                }
                for (k in result.data) {
                    if(k=='default'){
                       var kName= $translate.instant("aws.common.defaultDepar");
                       self.tickets.deparList.push({name: kName});
                    }else{
                        self.tickets.deparList.push({name: k});
                    }
                    if(k!="default"){
                        result.data[k].map(function(item,index){
                            if(item.projectname=="admin"){
                                result.data[k].splice(index,1);
                            }
                        });
                    }
                }
                scope.ticketsData = result.data;
                scope.tickets.depart.selected = self.tickets.deparList[0];
                var projectsData = angular.copy(result.data[localData.domainName]);
                projectsData.map(function(item){
                    if(item.projectname=='admin'){
                        item.projectname= $translate.instant('aws.common.defaultProject');
                    }
                })
                scope.tickets.projectsList = projectsData;
                scope.tickets.pro.selected = scope.tickets.projectsList[0];
                if (localData) {
                    switch (localData.managementRole.toString()) {
                    case "2":
                        scope.departDisabled = false;
                        scope.proDisabled = false;
                        break;
                    case "3":
                        scope.departDisabled = false;
                        scope.proDisabled = false;
                        break;
                    case "4":
                        scope.departDisabled = true;
                        scope.proDisabled = false;
                        break;
                    default :
                        scope.departDisabled = true;
                        scope.proDisabled = false;
                        break;
                    }
                }
            }
        }).then(function(){
            getProQuta();
        });
        var getProQuta = function(){
            if(scope.tickets.pro.selected){
                ticketsrv.getProHave(scope.tickets.pro.selected.projectid).then(function(result){
                    scope.quotas=[];
                    if(result && result.data){
                        _.forEach(result.data,function(item){
                            item.num="";
                            scope.quotas.push(item);
                        });
                        if(!rootScope.L3){
                            scope.quotas=scope.quotas.filter(item=>{
                                return item.name!="floatingip"
                            })
                        }
                    }
                }); 
            }
            
        };
        scope.changedepart = function (m) {
            scope.tickets.projectsList = scope.ticketsData[m.name];
            scope.tickets.pro.selected = scope.tickets.projectsList[0];
            getProQuta();
        };
        scope.changePro = function(){
            getProQuta();
        };
        scope.resourceConfirm = function (m) {
            if (m.$valid) {
                var quota = {};
                scope.quotas.forEach(function(item){
                    if(item.name){
                        quota[item.name] = item.num;
                    }
                });
                if(scope.tickets.depart.selected.name==$translate.instant("aws.common.defaultDepar")){
                    var domainUids = 'default'
                }else{
                    var domainUids = scope.tickets.depart.selected.name;
                }
                if(scope.tickets.pro.selected.projectname == $translate.instant('aws.common.defaultProject')){
                    var projectnames = 'admin'
                }else{
                    var projectnames = scope.tickets.pro.selected.projectname;
                }
                resourceData = {
                    busiData: {
                        type:"resourceApply",
                        applyUserId: id,
                        domainUid: domainUids,
                        projectUid: scope.tickets.pro.selected.projectid,
                        projectname: projectnames,
                        quota:quota
                    },
                    key: ticketObj["资源申请"]
                };
                ticketsrv.startJob(resourceData,enterpriseUid).then(function () {
	                ticketsrv.getNoSignList(localStorage.enterpriseUid, localStorage.$USERID).success(function(result) {
	                    ticketsrv.unHandledTickets = result;
	                });
                    resourceModal.close();
                });
            } else {
                scope.submitValid = true;
            }
        };
    }
}]);
ticketCreateModule.directive("quotalimit",function(){
    return {
        restrict:"A",
        require:"ngModel",
        link:function(scope,ele,attrs,ticketCreateCtrl){   
            function tempVaildQuota(viewValue){
                if(typeof(scope.quota.hardLimit) != undefined&&viewValue>scope.quota.hardLimit){
                    ticketCreateCtrl.$setValidity("quotaLimit",false);
                }else{
                    ticketCreateCtrl.$setValidity("quotaLimit",true);
                }  
                return viewValue;
            }
            tempVaildQuota(scope.quota.hardLimit);
            ticketCreateCtrl.$parsers.push(tempVaildQuota);
        }
    };
});

