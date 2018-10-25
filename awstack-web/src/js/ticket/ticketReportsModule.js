angular.module("ticketReportsModule", ["ngTable", "ngAnimate", "ui.bootstrap.tpls", "ui.tree", "checkedsrv"])
    .controller("ticketReportsCtrl", ["$scope", "$rootScope", "NgTableParams", "$uibModal", "ticketsSrv", "alertSrv", "$translate", "checkedSrv", "$location","GLOBAL_CONFIG", "$filter",function (scope, rootScope, NgTableParams, $uibModal, ticketsSrv, alertSrv, $translate, checkedSrv, $location,GLOBAL_CONFIG,$filter) {
        var self = scope ;
       
       
        self.tableCnsForm ={
            department:{},
        }
        self.filterData  ={
            startTime:"",
            endTime:""
        }
        function init_dateTimepicker() {
            $(".form_date").datetimepicker({
                language: "zh-CN",
                weekStart: 1,
                todayBtn: 1,
                autoclose: 1,
                todayHighlight: 1,
                //startView: 2,
                minView: "month",
                //minuteStep:5,
                forceParse: 0,
                format: "yyyy-mm-dd",
                pickerPosition: "bottom-left"
            });
        }

        init_dateTimepicker();
        self.filterInfo = {
            disposeStatuses: [
                {
                    status: "全部",
                    id:""
                },
                {
                    status: "已同意",
                    id: "1"
                },
                {
                    status: "正在进行",
                    id: "0"
                },
                {
                    status: "已拒绝",
                    id: "2"
                },
                {
                    status: "已撤销",
                    id: "3"
                },
                {
                    status: "已关闭",
                    id: "4"
                },
            ],
        }
        self.tableCnsForm.disposeStatus = self.filterInfo.disposeStatuses[0]
        self.downloadAllData = function () {
            // 过滤出需要在CSV文件中显示的字段。
            if(self.allDataList && self.allDataList.length ==0 ){
                return [["暂无数据"]]
            }else{
                return self.allDataList;
            }
        };
        self.changeDepartment =function(){
            self.tableCnsForm.user = self.departmentUser[0].user[0]
        }
        self.tableQueryFun = function () {
            var postData = {
                domainUid:self.tableCnsForm.department?self.tableCnsForm.department.domainUid:"",
                applyUserId:self.tableCnsForm.user?self.tableCnsForm.user.id:"",
                applyName:self.tableCnsForm.ticketName?self.tableCnsForm.ticketName:"",
                candidateUser:self.tableCnsForm.disposer?self.tableCnsForm.disposer.id:"",
                startTime:self.filterData.from?self.filterData.from:"",
                endTime:self.filterData.to?self.filterData.to:"",
                ticketType:self.tableCnsForm.ticketType?self.tableCnsForm.ticketType.id:"",
                status:self.tableCnsForm.disposeStatus?self.tableCnsForm.disposeStatus.id:"",
                regionKey:self.tableCnsForm.region?self.tableCnsForm.region.regionKey:""
            }
            getTableData(postData);
        }
        self.changeTicketType = function(typeData){
            if(typeData.type ==""){
                self.filterInfo .disposeStatuses = [
                        {
                            status: "全部",
                            id:""
                        },
                        {
                            status: "已同意",
                            id: "1"
                        },
                        {
                            status: "正在进行",
                            id: "0"
                        },
                        {
                            status: "已拒绝",
                            id: "2"
                        },
                        {
                            status: "已撤销",
                            id: "3"
                        },
                        {
                            status: "已关闭",
                            id: "4"
                        },
                    ]
             }
            else if(typeData.type =="11"){
                self.filterInfo .disposeStatuses = [
                        {
                            status: "全部",
                            id:""
                        },
                        
                        {
                            status: "正在进行",
                            id: "0"
                        },
                        {
                            status: "已关闭",
                            id: "4"
                        },
                    ]
            }
            else{
                self.filterInfo .disposeStatuses = [
                    {
                        status: "全部",
                        id:""
                    },
                    {
                        status: "已同意",
                        id: "1"
                    },
                    {
                        status: "正在进行",
                        id: "0"
                    },
                    {
                        status: "已拒绝",
                        id: "2"
                    },
                    {
                        status: "已撤销",
                        id: "3"
                    },
                ]
            }

            self.tableCnsForm.disposeStatus = self.filterInfo.disposeStatuses[0]
        }
        self.refresh = function(){
            self.filterData  ={
                startTime:"",
                endTime:"",
                domainUid:self.ADMIN?"":self.tableCnsForm.department,
            }
            self.tableCnsForm.ticketName =""
            if(self.ADMIN){
                self.tableCnsForm.department = self.departmentUser[0]
                self.tableCnsForm.user = self.departmentUser[0].user[0]
                getDisposer()
            }else{
                self.tableCnsForm.department = self.departmentUser[1]
                self.tableCnsForm.user = self.departmentUser[1].user[0]
                self.filterInfo.disposers = self.tableCnsForm.department.user;
                self.tableCnsForm.disposer =  self.filterInfo.disposers[0]
            }
            var postData = {
                domainUid:self.ADMIN?"":self.tableCnsForm.department.domainUid,
                applyUserId:"",
                applyName:"",
                candidateUser:"",
                startTime:"",
                endTime:"",
                ticketType:"",
                status:"",
            }
            getTableData(postData);
            getFlowList();
           // getDisposer();
           self.filterInfo .disposeStatuses = [
            {
                status: "全部",
                id:""
            },
            {
                status: "已同意",
                id: "1"
            },
            {
                status: "正在进行",
                id: "0"
            },
            {
                status: "已拒绝",
                id: "2"
            },
            {
                status: "已撤销",
                id: "3"
            },
            {
                status: "已关闭",
                id: "4"
            },
        ]
            self.tableCnsForm.disposeStatus = self.filterInfo.disposeStatuses[0];
        }
        getDepartmentUser();
        getFlowList();
        getRegion()
        // getDisposer();
        function getTableData(postData){
            ticketsSrv.getTicketReportsList(localStorage.enterpriseUid,postData).then(function(data){
                data?self.loadData = true:"";
                self.allDataList = [];
                var tableData = []
                
                if(data && data.data&&data.data){
                   
                    data.data.map(function(item){
                        item.endTime = $filter("date")(item.endTime, "yyyy-MM-dd HH:mm:ss");
                        item.startTime = $filter("date")(item.startTime, "yyyy-MM-dd HH:mm:ss");
                        item.serverName = "资源申请-" + $translate.instant("aws.ticket.applyTypes." + item.type);
                        item.ticketType  =  $translate.instant("aws.ticket.applyTypes."+item.type)
                        switch(item.status){
                            case "0":
                            item.status_info = "正在进行"
                            break;
                            case "1":
                            item.status_info = "已同意"
                            break;
                            case "2":
                            item.status_info = "拒绝"
                            break;
                            case "3":
                            item.status_info = "撤销"
                            break;
                            }    
                           tableData = data.data;
                           self.allDataList.push([item.userName,item.serverName,item.ticketType,item.startTime,item.endTime,item.status_info])
                    })
                    ticketsSrv.reportApplyLists(localStorage.enterpriseUid,postData).then(function(res){
                        if(res && res.data){
                            res.data.map(function(item){
                                item.endTime = $filter("date")(item.endTime, "yyyy-MM-dd HH:mm:ss");
                                item.startTime = $filter("date")(item.startTime, "yyyy-MM-dd HH:mm:ss");
                                item.serverName =  $translate.instant("aws.ticket.applyTypes." + item.type);
                                item.ticketType  =  $translate.instant("aws.ticket.applyTypes."+item.type)
                                switch(item.status){
                                    case "5":
                                    item.status_info = "正在进行"
                                    break;
                                    case "6":
                                    item.status_info = "已关闭"
                                    break;
                                   
                                    }    
                                
                             self.allDataList.push([item.userName,item.serverName,item.ticketType,item.startTime,item.endTime,item.status_info])
                                
                            })
                            tableData = tableData.concat(res.data);
                                self.Tabledatas  = tableData              
                                self.tableParams = new NgTableParams({count: GLOBAL_CONFIG.PAGESIZE}, {counts: [], dataset: self.Tabledatas});
                                if(self.tableCnsForm.ticketName){
                                    self.allDataList = [];
                                    self.Tabledatas = self.Tabledatas.filter(item => {
                                        return item.serverName.indexOf(self.tableCnsForm.ticketName)>-1;
                                    });
                                    self.tableParams = new NgTableParams({count: GLOBAL_CONFIG.PAGESIZE}, {counts: [], dataset: self.Tabledatas});
                                    self.Tabledatas.map(function(item){
                                        self.allDataList.push([item.userName,item.serverName,item.ticketType,item.startTime,item.endTime,item.status_info])
                                    })
                                }
                        }
                    })
                  
                   
                
                    
                    
                }
            })
        }
        function getRegion(){
            ticketsSrv.getRegionList().then(function(data){
                if(data && data.data){
                    self.regionList = data.data.filter(item => item.status=='3');
                    self.regionList.unshift({'regionName':"全部",'regionKey':""})
                    self.tableCnsForm.region =  self.regionList[0]
                }
            })
        }
        function getDepartmentUser(){
            ticketsSrv.getDepartmentUser().then(function(data){
                if(data && data.data){
                    if(self.ADMIN){
                        self.departmentUser = data.data;
                        
                    }else{
                        var arr = [];
                        data.data.map(function(item){
                            if(item.domainUid == localStorage.domainUid){
                                arr.push(item)
                            }
                        })
                        self.departmentUser = arr;
                    }
                    self.departmentUser.map(function(item){
                        item.user.unshift({
                            id:"",
                            name:"全部"
                        })
                    })
                    self.departmentUser.unshift({
                        domainName:"全部",
                        domainUid:"",
                        user:[
                            {
                                id:"",
                                name:"全部"
                            }
                        ]
                    })
                    self.departmentUser.map(function(item){
                        if(item.domainName == "default"){
                            item.domainName = '默认部门'
                        }
                    })
                    if(self.ADMIN){
                        self.tableCnsForm.department = self.departmentUser[0]
                        self.tableCnsForm.user = self.departmentUser[0].user[0]
                        getDisposer()
                    }else{
                        self.tableCnsForm.department = self.departmentUser[1]
                        self.tableCnsForm.user = self.departmentUser[1].user[0]
                        self.filterInfo.disposers = self.tableCnsForm.department.user;
                        self.tableCnsForm.disposer =  self.filterInfo.disposers[0]
                    }
                    self.tableQueryFun();
                }
            })
        }
        function getFlowList(){
            ticketsSrv.getFlowList().then(function(data){
                if(data && data.data &&data.data.length){
                   self.filterInfo.ticketTypes = data.data;
                   self.filterInfo.ticketTypes.unshift({
                       name:"全部",
                       type:"",
                       id:""
                   })
                   self.tableCnsForm.ticketType =  self.filterInfo.ticketTypes[0]
                   self.typesDisabled =false;
                }
            })
        }
        function getDisposer(){
            ticketsSrv.getAllUser().then(function(data){
                if(data && data.data ){
                    self.filterInfo.disposers =  data.data;
                    self.filterInfo.disposers.unshift({
                        name:"全部",
                        id:""
                    })
                    self.tableCnsForm.disposer =  self.filterInfo.disposers[0]
                }
            })
        }
    }]);
