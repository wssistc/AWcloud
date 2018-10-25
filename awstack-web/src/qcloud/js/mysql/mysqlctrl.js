import "./paramTmplSrv";

angular.module("mysqlListModule", ["ngSanitize","ngTable", "ngAnimate", "ui.bootstrap", "mysqlsrv", "ui.select", "ngMessages","paramTmplSrvModule"])
    .controller("MysqlListCtrl", ["$scope", "$rootScope","mysqlSrv","$uibModal","$window","checkedSrv","NgTableParams","$q","$routeParams","$location","$route","$timeout","$translate","RegionID","FileSaver", "Blob","paramTmplSrv",
     function($scope, $rootScope,mysqlSrv,$uibModal,$window,checkedSrv,NgTableParams,$q,$routeParams,$location,$route,$timeout,$translate,RegionID,FileSaver,Blob,paramTmplSrv) {
        var self = $scope;
        //self.regionList = mysqlSrv.getRegionList('all');
        self.regionList = mysqlSrv.getRegionList();
        self.showVal = true
        self.modVal = false;
        self.isSet = true;
        //self.isRenew = false;
        self.isAutoRenew = true;
        self.isCancelRenew = true;
        self.isSet = true;
        self.canExport = true;
        var flag;
        self.listA = [
            {
                title:'实例详情',
                active:1
            },
            /*{
                title:'实例监控',
                active:2
            },*/
            {
                title:'参数设置',
                active:3
            },
            {
                title:'帐号管理',
                active:4
            },
            {
                title:'只读实例',
                active:5
            }
        ];
        self.listB = [
            {
                title:'数据库参数',
                active:1
            },
            {
                title:'修改历史',
                active:2
            }
        ];
        self.listBact = 1;
        self.tabAct = 1;
        self.cfmEdit = false;
        var req = {
            "projectId":0,
            "Region": RegionID.Region()
        };
        var defauPro = [{projectId:0,projectName:"默认项目"}];
        self.project = {};
        self.region = {};
        self.$watch(function() {
            return $routeParams.id;
        }, function(value) {
            if(!value){
                $window.readOnlyFunc = null;
            }
            value ? self.animation = "animateIn" : self.animation = "animateOut";
            if(value && $routeParams.type){
                self.$emit("get"+$routeParams.type+"Detail", value);
            }else if (value) {
                self.$emit("getDetail", value);
            }
        });
        self.ExportFunc = function(){
            var exportData = [];
            var data = [];
            if(self.checkedItems.length>0){
                data = self.checkedItems
            }else{
                data = self.mysqlList
            }
            data.filter(item=>{
                exportData.push([
                    item.cdbInstanceName,
                    item.uInstanceId,
                    item.cdbInstanceType_t,
                    item.region_name,
                    "高IO版 "+item.memory+"MB/"+item.volume+"GB/"+item.maxQueryCount+"QPS",
                    "MySQL"+item.engineVersion,
                    item.networkName,
                    item.cdbInstanceVip,
                    item.cdbInstanceVport,
                    item.payType_t,
                    item.cdbInstanceDeadlineTime,
                    item.cdbInstanceCreateTime
                ])
            });
            return exportData
        };
        //self.projectList = defauPro.concat(proList);
        self.projectList = defauPro;
        function sucFc(res){
            if(res.cdbInstanceSet){
               var proLength = self.projectList.length;
                var mysqlList = res.cdbInstanceSet;
                self.mysqlTotal = res.totalCount;
                self.allOnlyList = [];
                mysqlList = mysqlList.filter(item=>{
                    if(item.cdbInstanceType==1){
                        return item;
                    }else if(item.cdbInstanceType==3){
                        self.allOnlyList.push(item);
                    }
                })
                mysqlList = searchEdit(mysqlList);
                self.mysqlList = mysqlList;
                self.tableList = new NgTableParams(
                    { count: 10 }, 
                    { counts: [], dataset: self.mysqlList }
                );
                self.canExport = false;
                checkedSrv.checkDo(self, self.mysqlList, "uInstanceId",'tableList'); 
            }
        }
        function searchEdit(data){
            data.map(function(item){
                item.status_t = $translate.instant('CN.mysql.status.'+item.status);
                item.initFlag_t = $translate.instant('CN.mysql.initFlag.'+item.initFlag);
                item.cdbInstanceType_t = $translate.instant('CN.mysql.cdbInstanceType.'+item.cdbInstanceType);
                item.payType_t = $translate.instant('CN.mysql.payType.'+item.payType);
                item.taskStatus_t = $translate.instant('CN.mysql.taskStatus.'+item.taskStatus);
                item.searchTerm = [
                    item.uInstanceId,item.cdbInstanceName,item.taskStatus_t,
                    item.status_t,item.region_name,item.networkName,
                    item.initFlag_t,item.cdbInstanceType_t,
                    item.memory,item.volume,item.maxQueryCount,
                    item.cdbInstanceVip,item.cdbInstanceVport,
                    item.engineVersion,item.payType_t,item.cdbInstanceDeadlineTime
                ]
            })
            return data;
        }
        self.applyGlobalSearch = function() {
            var term = self.globalSearchTerm;
            self.tableList.filter({ searchTerm: term });
        };
        function init(){
            var initReq = {
                "projectId":0,
                "Region": RegionID.Region()
            };
            mysqlSrv.getList(initReq).then(function(res){
                sucFc(res,self);
            }).then(function(){
                $window.cdbInterFunc = null;
                $window.cdbInterFunc = cdbInterFunc;
                $window.cdbInterFunc();
            })
        };
        var statusInit = function(res){
            if(res.cdbInstanceSet&&res.cdbInstanceSet.length>0){
                var status=false;
                var proLength = self.projectList.length;
                var mysqlList = res.cdbInstanceSet;
                self.mysqlTotal = res.totalCount;
                self.allOnlyList = [];
                mysqlList = mysqlList.filter(item=>{
                    if(item.cdbInstanceType==1){
                        return item;
                    }else if(item.cdbInstanceType==3){
                        self.allOnlyList.push(item);
                    }
                })
                mysqlList = searchEdit(mysqlList);
                for(let i=0;i<mysqlList.length;i++){
                    if(mysqlList[i].status!=1||mysqlList[i].taskStatus!=0){
                        
                        status = true;
                        break;
                    }
                }
                self.mysqlList = mysqlList;
                self.tableList = new NgTableParams(
                    { count: 10 }, 
                    { counts: [], dataset: self.mysqlList }
                );
                var term = self.globalSearchTerm;
                self.tableList.filter({ searchTerm: term });
                return status
            }
        };
        function cdbInterFunc(){
            var timer = $timeout(function(){
                var flag;
                var interreq={
                    "projectId":0,
                    "Region": RegionID.Region()
                } 
                mysqlSrv.getList(interreq).then(function(res){
                    flag = statusInit(res);
                }).finally(function(res){
                    //$window.cdbInterFunc();
                    if(flag){
                        $window.cdbInterFunc();
                    }else{
                        $timeout.cancel(timer);
                    }
                })
            },5000)
        }
        //$window.cdbInterFunc = cdbInterFunc;
        //$window.cdbInterFunc();
        self.refresh = function(){
            init(req)
        }
        self.$watch(function() {
            return self.checkedItems;
        }, function(value) {
            if(value && value.length > 1){
                self.isRenew = true;
                self.isAutoRenew = true;
                self.isCancelRenew = true;
                self.isSet = true;
            }else if(value && value.length > 0){
                self.isRenew = false;
                self.isAutoRenew = false;
                self.isCancelRenew = false;
                self.isSet = false;
                if(value[0].payType && value[0].payType == 1){
                    self.isRenew = true;
                    self.isAutoRenew = true;
                    self.isCancelRenew = true;
                }
                if(value[0].initFlag==0||value[0].cdbInstanceType==3){
                    self.isRenew = true;
                    self.isAutoRenew = true;
                    self.isCancelRenew = true;
                    self.isSet = true;
                }
            }else {
                self.isRenew = true;
                self.isAutoRenew = true;
                self.isCancelRenew = true;
                self.isSet = true;
            }
        })
        self.pageStep = 10;
        self.project.selected = self.projectList[0];
        self.regionList.filter(item=>{
            if(item.region==RegionID.Region()){
                self.region.selected = item;
            }
            return item;
        });
        //参数设置
        self.setParam = function(edit){
            self.tabAct = 3;
            $location.url("/cdb/cdblist?id="+edit.uInstanceId+"&region="+edit.region_id);
            self.paramListTab='param';
        }
        
        //销毁主实例
        self.distory = function(list){
            var content = {
                target: "masterInstan",
                msg: "<span>销毁后所有数据将被清除且不可恢复，请谨慎操作。</span>",
                data:list
            };
            self.$emit("delete", content);
        };
        self.$on("masterInstan",function(e,list){
            mysqlSrv.delReadInstan({
                    "Region":self.region.selected.region,
                    "cdbInstanceIds.0":list.uInstanceId,
                    "instanceRole":'master'
                }).then(function(res){
                    if(res&&res.code==0){
                        init(req);
                    }
            })
        });

        self.create = function(){
            $uibModal.open({
                templateUrl:"createMysql.html",
                controller:"MysqlCreateCtrl",
                resolve:{
                    proList:function(){
                        return proList
                    },
                    refresh:function(){
                        return init;
                    }
                }
            });
        }
        init(req);

        self.selectedProject = function(cur){
            let re = {
                "Region":self.region.selected.region,
                "projectId":cur.projectId
            }
            mysqlSrv.getList(re).then(function(res){
                sucFc(res,self);
            })
        }
        self.selectedRegion = function(cur){
            self.region.selected = cur;
            let re = {
                "Region":cur.region,
                "projectId":self.project.selected.projectId
            }
            sessionStorage.setItem("RegionSession",cur.region);
            self.mysqlList = [];
            self.globalSearchTerm = "";
            mysqlSrv.getList(re).then(function(res){
                sucFc(res,self);
            }).then(function(){
                $window.cdbInterFunc = null;
                $window.cdbInterFunc = cdbInterFunc;
                $window.cdbInterFunc();
            })
            //$window.cdbInterFunc();
        }
        self.changePage = function(obj){
            let re = {
                "Region":self.region.selected.region,
                "projectId":self.project.selected.projectId,
                "offset":obj.offset,
                "limit":obj.limit
            }
            mysqlSrv.getList(re).then(function(res){
                sucFc(res,self);
            })
        }
        self.upgrade = function(item){
            if(item.taskStatus==0){
                $uibModal.open({
                    templateUrl:"upgrade.html",
                    controller:"MysqlUpgradeCtrl",
                    resolve:{
                        refresh:function(){
                            return init;
                        },
                        reg:function(){
                            return self.region.selected;
                        },
                        lowInstan:function(){
                            var lowData = [];
                            var data = [];
                            var allryList = self.allOnlyList;
                            if(item.roInfo.length>0){
                                var curRo = item.roInfo;
                                for(let i=0;i<curRo.length;i++){
                                    for(let j=0;j<allryList.length;j++){
                                        if(curRo[i].uInstanceId==allryList[j].uInstanceId){
                                            data.push(allryList[j]);
                                        }
                                    }
                                }
                                console.log(data);
                                if(data.length==1){
                                    lowData[0] = data[0].memory;
                                    lowData[1] = data[0].volume;
                                }else{
                                    data.sort(function(a,b){
                                        return a.memory - b.memory;
                                    });
                                    lowData[0] = data[0].memory;
                                    data.sort(function(a,b){
                                        return a.volume - b.volume;
                                    });
                                    lowData[1] = data[0].volume;
                                }
                            }
                            return lowData;
                        },
                        instan:function(){
                            var data = {
                                region_id:item.region_id,
                                uInstanceId:item.uInstanceId,
                                cdbInstanceType:item.cdbInstanceType,
                                zoneId:item.zoneId
                            }
                            return item;
                        }
                    }
                })
            }
        };
        
        self.tabSelect = function(obj){
            console.log(obj);
            switch(obj.active){
                case 3:
                self.paramListTab = "param";
                self.cfmEdit = false;
                break;
            }
        }
        self.detailFunc = function(item){
            if(item.taskStatus==0){
                self.IsRoDetail = false;
                self.tabAct = 1;
                self.listA = [
                    {
                        title:'实例详情',
                        active:1
                    },
                    {
                        title:'参数设置',
                        active:3
                    },
                    {
                        title:'帐号管理',
                        active:4
                    },
                    {
                        title:'只读实例',
                        active:5
                    }
                ]
                $location.url('/cdb/cdblist?id='+item.uInstanceId+"&region="+item.region_id);
            }
        }
        self.goBack = function(){
            $location.url('/cdb/cdblist');
            self.tabAct = 1;
            self.listA = [
                {
                    title:'实例详情',
                    active:1
                },
                {
                    title:'参数设置',
                    active:3
                },
                {
                    title:'帐号管理',
                    active:4
                },
                {
                    title:'只读实例',
                    active:5
                }
            ]
        }
        self.goDetail = function(){
            $route.reload();
            self.tabAct = 5;
        }
        self.$on("getDetail", function(event, value) {
            let req = {
                "Region":$routeParams.region,
                "cdbInstanceIds.0":value
            }
            let reqc = {
                "Region":$routeParams.region,
                "cdbInstanceId":value
            }
            self.enabledEdit = false;
            self.detailData = null;
            self.noCreateOnly = true;
            self.upReadOnly = true;
            self.cdbWanLoading = false;
            //获取详情
            mysqlSrv.getDetail(req).then(function(res){
                if(res&&res.cdbInstance){
                    self.enabledEdit = true;
                    self.detailData = res.cdbInstance;
                    self.detailData.region_id = $routeParams.region;
                    if(self.detailData.memory>=4000&&self.detailData.volume>=100&&self.detailData.engineVersion=="5.6"){
                        self.upReadOnly = false;
                    }
                }
            }).then(function(){
                self.getAccList();
                self.getRdList();
            })
            function interGetDetail(status,req){
                mysqlSrv.getDetail(req).then(function(res){
                    if(res&&res.cdbInstance){
                        if(status==res.cdbInstance.cdbWanStatus){
                            self.detailData.cdbWanAdress = res.cdbInstance.cdbWanAdress;
                            self.cdbWanLoading = false;
                        }
                    }
                })
            }
            
            /**************************************账号管理***********************************************/
            //获取账号信息
            self.getAccList = function(){
                if(self.detailData.initFlag!=0){
                   mysqlSrv.getAccoutList(reqc).then(function(res){
                        if(res && res.data){
                            var accountList = res.data.rows;
                            self.accountList = accountList.filter(item=>{
                                if(item.user){
                                    return item;
                                }
                            });
                            self.tableparam = new NgTableParams({
                                count: 10
                            }, {
                                counts: [], dataset: self.accountList
                            });
                        }
                    }) 
                }else{
                    self.accountList = [{host: "%", user: "root", create_time: null, modify_time: null, remarks: null}]
                    self.tableparam = new NgTableParams({
                        count: 10
                    }, {
                        counts: [], dataset: self.accountList
                    });
                }
                
            };

            //修改权限
            self.editPermit = function(item,nePost){
                self.loading = true;
                var prvReq = {
                        "Region":$routeParams.region,                           //地域[必填]
                        "cdbInstanceId":value,          //实例ID[必填]
                        "user":item.user,                         //帐号名称[必填]
                        "host":item.host                          //主机[必填]
                }
                $uibModal.open({
                    templateUrl:"editPrivile.html",
                    controller:"EditPrivileCtrl",
                    resolve:{
                        refresh:function(){
                            return init;
                        },
                        instan:function(){
                            var data = {
                                req:reqc,
                                data:item
                            }
                            if(nePost){
                                data.Nepost = nePost;
                            }
                            return data;
                        },
                        databasePrivile:function(){
                            var deferred = $q.defer();
                            $q.all([mysqlSrv.getAllDB(reqc),mysqlSrv.getPrivileges(prvReq),mysqlSrv.getAllPrivileges(reqc)]).then(function(res){
                                self.loading = false;
                                if(res){
                                    deferred.resolve(res);
                                }
                            },function(res){
                                self.loading = false;
                                deferred.reject([]);
                            })
                            return deferred.promise;
                        }
                    }
                })
            };
            //创建克隆账号
            self.createAccount = function(item){
                $uibModal.open({
                    templateUrl:"createuser.html",
                    controller:"CreateUserCtrl",
                    resolve:{
                        refresh:function(){
                            return init;
                        },
                        instan:function(){
                            var data = {};
                            data.req = reqc;
                            if(item){
                                data.item = item;
                            }
                            return data;
                        },
                        initAcc:function(){
                            return self.getAccList;
                        },
                        editPermit:function(){
                            return self.editPermit
                        }
                    }
                })
            }
            //修改密码
            self.editPassWord = function(item){
                $uibModal.open({
                    templateUrl:"editpassword.html",
                    controller:"editPassWordCtrl",
                    resolve:{
                        refresh:function(){
                            return init;
                        },
                        instan:function(){
                            var data = {};
                            data.req = reqc;
                            if(item){
                                data.item = item;
                            }
                            return data;
                        },
                        initAcc:function(){
                            return self.getAccList;
                        }
                    }
                })
            }

            //删除账户
            self.delAccount = function(item){
                $uibModal.open({
                    templateUrl:"deluser.html",
                    controller:"delAccountCtrl",
                    resolve:{
                        refresh:function(){
                            return init;
                        },
                        instan:function(){
                            var data = {};
                            data.req = reqc;
                            if(item){
                                data.item = item;
                            }
                            return data;
                        },
                        initAcc:function(){
                            return self.getAccList;
                             }
                    }
                })
            }

            //修改备注
            self.editRemarks = function(item){
                $uibModal.open({
                    templateUrl:"editremarks.html",
                    controller:"editRemarksCtrl",
                    resolve:{
                        refresh:function(){
                            return init;
                        },
                        instan:function(){
                            var data = {};
                            data.req = reqc;
                            if(item){
                                data.item = item;
                            }
                            return data;
                        },
                        initAcc:function(){
                            return self.getAccList;
                             }
                    }
                })
            };

            /**************************************只读实例************************************************/
            //只读实例列表
            function ReadOnlyStatus(data){
                var _length = data.length;
                var status = false;
                for(let i=0;i<_length;i++){
                    if(data[i].status!=1){
                        status = true;
                        break;
                    }
                }
                self.readOnlyList = data;
                self.readOnlyLength = self.readOnlyList.length;
                self.noCreateOnly = self.readOnlyLength>2;
                return status;
            }
            self.getRdList = function(){
                mysqlSrv.getReadList(req).then(function(res){
                    if(res&&res.data){
                        self.readOnlyList = res.data;
                        self.readOnlyLength = self.readOnlyList.length;
                        self.noCreateOnly = self.readOnlyLength>2;
                    }
                }).then(function(){
                    $window.readOnlyFunc = null;
                    $window.readOnlyFunc = readOnlyFunc;
                    $window.readOnlyFunc();
                })
            }
            function readOnlyFunc(){
                var timer = $timeout(function(){
                    var flag;
                    let req = {
                        "Region":$routeParams.region,
                        "cdbInstanceIds.0":value
                    }
                    mysqlSrv.getReadList(req).then(function(res){
                        if(res&&res.data){
                            flag = ReadOnlyStatus(res.data);
                        }
                    }).finally(function(res){
                        if(flag){
                            readOnlyFunc();
                        }else{
                            $timeout.canel(timer);
                        }
                    })
                },5000)
            }
            
            //新建只读实例
            self.createReadInstan = function(item){  
                $uibModal.open({
                    templateUrl:"createReadInstan.html",
                    controller:"createReadInstanCtrl",
                    resolve:{
                        refresh:function(){
                            return self.getRdList;
                        },
                        instan:function(){
                            var data = self.detailData;
                            data.req = reqc;
                            data.listLength = self.readOnlyLength?self.readOnlyLength:0
                            return data;
                        }
                    }
                })
            };
            //只读升级
            self.updateReadInstan = function(item){
                $uibModal.open({
                    templateUrl:"updateReadInstan.html",
                    controller:"updateReadInstanCtrl",
                    resolve:{
                        refresh:function(){
                            return self.getRdList;
                        },
                        instan:function(){
                            var data = item;
                            data.req = reqc;
                            return data;
                        }
                    }
                })
            };
            //销毁只读实例
            self.ReadDel = function(list){
                var content = {
                    target: "ReadDel",
                    msg: "<span>销毁后所有数据将被清除且不可恢复，请谨慎操作。</span>",
                    data:list
                };
                self.$emit("delete", content);
            };
            self.$on("ReadDel",function(e,list){
                mysqlSrv.delReadInstan({
                        "Region":req.Region,
                        "cdbInstanceIds.0":list.uInstanceId,
                        "instanceRole":'ro'
                    }).then(function(res){
                        if(res&&res.code==0){
                            $timeout(function(){
                                self.getRdList();
                            },1000)
                            
                        }
                })
            });
            //只读实例详情
            self.roDetail = function(list){
                self.detailData = null;
                self.IsRoDetail = true;
                self.enabledEdit = false;
                var roDetreq = {
                    "Region":req.Region,            //地域[必填]
                    "cdbInstanceIds.0":req['cdbInstanceIds.0'],     //所属主实例ID[必选]
                    "RoCdbInstanceId":list.uInstanceId,    //只读实例ID[必选]
                    "projectId": 0      
                }
                self.tabAct = 1;
                self.listA = [
                    {
                        title:'实例详情',
                        active:1
                    }/*,
                    {
                        title:'实例监控',
                        active:2
                    }*/
                ]
                mysqlSrv.getRoDetail(roDetreq).then(function(res){
                    if(res&&res.cdbInstance){
                        self.enabledEdit = true;
                        self.detailData = res.cdbInstance;
                        self.detailData.region_id = $routeParams.region;
                    }
                })
            };

            /*************************************参数设置*******************************************/
            
            function formateParamList(){  //处理参数列表数据
                self.paramList.map(item => {
                    item._need_reboot = item.need_reboot == 0? "否":"是";
                    if(item.min == item.max == 0){
                        item.rangeValue = "[" + item.min +"-"+item.max+"]";
                        item.isRange = true;
                    }else{
                        item.rangeValue = "["+item.enum_value.join(' | ')+"]";
                        item.isEnum = true;
                    }
                    item.curValue = item.cur_value;
                    item.showEdit = false;
                    return item;
                });
            }

            function getParamsList(cdbInstanceId){ 
                mysqlSrv.getParamsList({
                    "Region":$routeParams.region,
                    "cdbInstanceId":cdbInstanceId
                }).then(function(res){
                    if(res && res.data){
                        self.paramList = res.data;
                        self.originParamList = angular.copy(res.data);
                        formateParamList()
                    }
                })
            }
            //获取参数列表
            getParamsList(value); 

            self.refreshParamList = function(){
                getParamsList(value); 
            };

            self.submitted = false;
            self.interacted = function(field) {
                if(field){
                    return self.submitted || field.$dirty;
                }
            };
            //取消参数值修改
            self.cancelEdit = function(){ 
                self.importAndCoverTip = false;
                self.paramList = angular.copy(self.originParamList);
                formateParamList();
            };
            //确认参数值修改
            self.editParamsConfirm = function(type,formField,editData,index){ 
                if(formField.$valid){
                    var params = {
                        "Region":$routeParams.region,
                        "cdbInstanceIds.0":value
                    };
                    if(type == "all"){
                        var postParamList = [];
                        for(let i = 0; i < self.paramList.length; i++){
                            if(self.paramList[i].cur_value != self.originParamList[i].cur_value){
                                postParamList.push(self.paramList[i]);
                            }
                        }
                        if(postParamList.length > 0){
                            self.needReboot = false;
                            for(let i = 0; i < postParamList.length; i++){
                                params['paramList.' + i +'.name'] = postParamList[i].name;
                                params['paramList.' + i +'.value'] = postParamList[i].cur_value;
                            }
                            for(let i = 0; i < postParamList.length; i++){
                                if(postParamList[i].need_reboot == 1){
                                    self.needReboot = true;
                                    break;
                                }
                            }
                        }else{
                            var scope = self.$new();
                            var noneModifyParamTipModal = $uibModal.open({
                                animation:$scope.animationsEnabled,
                                templateUrl:"noneModifyParamTipModal.html",
                                scope:scope
                            });
                            scope.noneModifyParamCfm = function(){
                                self.cfmEdit=false
                                self.cancelEdit();
                                noneModifyParamTipModal.close();
                            };
                        }
                    }else if(type == "one"){
                        params["paramList.0.name"] = editData.name;
                        params["paramList.0.value"] = editData.cur_value;
                        self.needReboot = editData.need_reboot == 1? true:false;;
                    }
                    if(self.needReboot){
                        var scope = self.$new();
                        var modifyParamCfmModal = $uibModal.open({
                            animation:$scope.animationsEnabled,
                            templateUrl:"modifyParamCfmModal.html",
                            scope:scope
                        });
                        
                        scope.modifyParamCfm = function(){
                            mysqlSrv.editParams(params).then(function(res){
                                if(res && res.code == 0){
                                    //getParamsList(value);//修改成功应重新请求列表api,但是底层可能修改没有那么快，api返回的数据任然是修改前的，导致页面上看起来还是修改前的值
                                    formateParamList();//code为0表示修改成功，可以不用请求api直接用修改后的值更新列表
                                    self.cfmEdit = false;
                                    self.importAndCoverTip = false;
                                    modifyParamCfmModal.close();
                                    
                                    var goTocdbInstanceListModal = $uibModal.open({
                                        animation:$scope.animationsEnabled,
                                        templateUrl:"goTocdbInstanceListModal.html",
                                        scope:scope
                                    });
                                    scope.modifyParamSucc = function(){
                                        goTocdbInstanceListModal.close();
                                        $location.url("/cdb/cdblist");
                                        self.refresh();
                                    };
                                    goTocdbInstanceListModal.opened.then(function(){
                                        $timeout(function(){
                                            scope.modifyParamSucc();
                                        },5000)
                                    });
                                }
                            });
                        };
                    }else{
                        mysqlSrv.editParams(params).then(function(res){
                            if(res && res.code == 0){
                                if(type == "all"){
                                    formateParamList();
                                    self.cfmEdit = false;
                                    self.importAndCoverTip = false;
                                }else if(type == "one"){
                                    self.paramList[index].showEdit = false;
                                    self.paramList[index].cur_value = self.paramList[index].curValue = editData.cur_value;
                                }
                            }
                        });
                    }
                }else{
                    self.submitted = true;
                    self.cfmEdit = true;
                }
            };
            //导出参数
            self.exportParams = function(detailData){
                mysqlSrv.getParamsList({
                    "Region":$routeParams.region,
                    "cdbInstanceId":detailData.uInstanceId
                }).then(function(res){
                    if(res && res.data){
                        var exportData = [];
                        res.data.forEach(item => {
                            exportData.push(item.name+"="+item.cur_value);
                        });
                        var pemData = new Blob(
                            [exportData.join("\n")],
                            { type: "application/x-pem-file"}
                        );
                        FileSaver.saveAs(pemData, detailData.cdbInstanceName + ".cnf");
                    }
                });
            };

            //导入参数
            self.importParams = function(detailData){
                //缺api
            };

            //从模板导入
            self.importFromTmpl = function(detailData){
                var scope = self.$new();
                var importFromTmplModal = $uibModal.open({
                    animation:$scope.animationsEnabled,
                    templateUrl:"importFromTmplModal.html",
                    scope:scope
                });
                scope.paramTmplOptions = [{
                    name:"系统默认模板",
                    templateId:""
                }];
                scope.importFromTmplForm = {
                    "templateId":scope.paramTmplOptions[0].templateId
                };

                paramTmplSrv.queryParamTmplList({
                    "params":{
                        "Region":$routeParams.region
                    }
                }).then(function(res){
                    if(res && res.data){
                        res.data.forEach(item => { //需过滤，例如当前实例版本为MySQL5.6，只能选择版本为MySQL5.6的参数模板
                            if(item.engineVersion == detailData.engineVersion){ 
                                scope.paramTmplOptions.push(item);
                            }
                        });
                    }
                });

                function getParamlistDataSucc(paramList){
                    var count = 0;
                    _.each(self.originParamList,function(item,i){
                        if(paramList[i].cur_value != item.cur_value){
                            paramList[i].diff = true;
                            count++;
                        }
                    });
                    self.paramList = paramList;
                    formateParamList();
                    self.coverValueCount = count;
                    self.cfmEdit = true;
                    self.importAndCoverTip = true;
                    importFromTmplModal.close();
                }

                scope.importAndCoverCfm = function(formData){
                    if(formData.templateId){ //导入选择的模板
                        paramTmplSrv.queryParamTmplDetail({
                            "params":{
                                "Region":$routeParams.region,
                                "templateId":formData.templateId
                            }
                        }).then(function(res){
                            if(res && res.data){
                                getParamlistDataSucc(res.data.paramList);
                            }
                        });
                    }else{ //导入系统默认模板
                        mysqlSrv.getDefaultTmplParam({
                            "params":{
                                "engineVersion":detailData.engineVersion 
                            }
                        }).then(function(res){
                            if(res && res.code == 0){
                                res.data.map(item => {
                                    item.cur_value = item.default;
                                    return item;
                                });
                               getParamlistDataSucc(res.data);
                            }
                        })
                    }
                };
            };

            //另存为模板
            self.saveAsTmpl = function(detailData){
                var scope = self.$new();
                var saveAsTmplModal = $uibModal.open({
                    animation:$scope.animationsEnabled,
                    templateUrl:"saveAsTmplModal.html",
                    scope:scope
                });
                scope.submitted = false;
                scope.interacted = function(field) {
                    return scope.submitted || field.$dirty;
                };
                scope.existedNamesList = [];
                paramTmplSrv.queryParamTmplList({
                    "params":{
                        "Region":$routeParams.region
                    }
                }).then(function(res){
                    if(res && res.data){
                        res.data.forEach(item => {
                            scope.existedNamesList.push(item.name)
                        });
                    }
                });

                scope.saveAsTmplComfirm = function(formField,formData){
                    if(formField.$valid){
                        paramTmplSrv.createParamTmpl({
                            "params":{
                                "Region":$routeParams.region,
                                "name":formData.name,
                                "desc":formData.desc,
                                "engineVersion":detailData.engineVersion
                            }
                        }).then(function(res){
                            if(res && res.code == 0){
                                saveAsTmplModal.close();
                            }
                        });
                    }else{
                        scope.submitted = true;
                    }
                };
            };

            //获取参数列表历史修改
            function getParamModifyHistory(cdbInstanceId){
                mysqlSrv.getParamsHistory({
                    "Region":$routeParams.region,
                    "cdbInstanceId":cdbInstanceId
                }).then(function(res){
                    self.paramModifyHistoryTable = new NgTableParams(
                        { count: 10 }, 
                        { counts: [], dataset: res.data.paramList });
                });
            }
            getParamModifyHistory(value);

            self.choseParamList = function(type){
                /*if(type == "param"){
                    getParamsList(value); 
                }else*/ if(type == "history"){
                    getParamModifyHistory(value);
                }
            };
            
            self.listBSelect = function(obj){
                if(obj.active==self.listBact){
                    return;
                }
                if(obj.active==1){
                    self.getParamsList()
                }else if(obj.active==2){
                    self.getParamsHistory();

                }
            }
            
        });  


        self.editFunc = function(type,data){
            $uibModal.open({
                templateUrl:type+".html",
                controller:"EditFuncCtrl",
                resolve:{
                    refresh:function(){
                        return init;
                    },
                    instan:function(){
                        var editItem = {
                            type:type,
                            data:data,
                            context:self
                        };
                        return editItem;
                    }
                }
            })
        }

        //续费
        self.renew = function(){
            self.total = {price:""};
            self.crsPriceUnit = [{name:"年"}, {name:"月"}];
            self.crsPriceUnit.selected =self.crsPriceUnit[0];

            self.crsPriceTime = [{name:"1",time:"12"},{name:"2",time:"24"},{name:"3",time:"36"}]
            self.crsPriceTime.selected =self.crsPriceTime[0];

            var modalInstance = $uibModal.open({
                templateUrl:"renew.html",
                scope:$scope
            });
            var queryData = {
                "Region": self.region.selected.region,
                "cdbType": self.checkedItems[0].cdbType,
                "memory":self.checkedItems[0].memory,
                "volume": self.checkedItems[0].volume,
                "zoneId": self.checkedItems[0].zoneId,
                "instanceRole": "master",
                "goodsNum": 1,
                "period":self.crsPriceTime.selected.time
            }
            mysqlSrv.priceMonth(queryData).then(function(res){
                self.total = res;
            });
            self.changeUnit = function(val){
                switch (val){
                    case "年":
                    self.crsPriceTime = [{name:"1",time:"12"},{name:"2",time:"24"},{name:"3",time:"36"}];
                    self.crsPriceTime.selected = self.crsPriceTime[0];
                    break;
                    case "月":
                    self.crsPriceTime = [
                    {name:"1",time:"1"},
                    {name:"2",time:"2"},
                    {name:"3",time:"3"},
                    {name:"4",time:"4"},
                    {name:"5",time:"5"},
                    {name:"6",time:"6"},
                    {name:"7",time:"7"},
                    {name:"8",time:"8"},
                    {name:"9",time:"9"},
                    {name:"10",time:"10"},
                    {name:"11",time:"11"},
                    {name:"12",time:"12"}
                    ]
                    self.crsPriceTime.selected =self.crsPriceTime[0];
                    break;
                }
                var queryData = {
                    "Region": self.region.selected.region,
                    "cdbType": self.checkedItems[0].cdbType,
                    "memory":self.checkedItems[0].memory,
                    "volume": self.checkedItems[0].volume,
                    "zoneId": self.checkedItems[0].zoneId,
                    "instanceRole": "master",
                    "goodsNum": 1,
                    "period":self.crsPriceTime.selected.time
                }
                mysqlSrv.priceMonth(queryData).then(function(res){
                    self.total = res
                });
            }
            self.changeTime = function(val){
                var queryData = {
                    "Region": self.region.selected.region,
                    "cdbType": self.checkedItems[0].cdbType,
                    "memory":self.checkedItems[0].memory,
                    "volume": self.checkedItems[0].volume,
                    "zoneId": self.checkedItems[0].zoneId,
                    "instanceRole": "master",
                    "goodsNum": 1,
                    "period":val
                }
                mysqlSrv.priceMonth(queryData).then(function(res){
                    self.total = res
                });
            }
            self.confirm= function(){
                var postData = {
                    Region:self.region.selected.region,
                    cdbInstanceId:self.checkedItems[0].cdbInstanceId,
                    period:self.crsPriceTime.selected.time
                }
                mysqlSrv.renewCdb(postData).then(function(result){
                    modalInstance.dismiss("cancel");
                    init({Region:self.region.selected.region})
                });
            }
        }

        // 设置自动续费
        self.autoRenew = function(){
            $uibModal.open({
                templateUrl:"autoRenew.html",
                controller:"mysqlAutoRenewCtrl",
                resolve:{
                    refresh:function(){
                        return init;
                    },
                    val:function(){
                        return self.checkedItems;
                    },
                    reg:function(){
                        return self.region.selected;
                    }
                }
            });
        }

        // 取消自动续费
        self.cancelRenew = function(){
            $uibModal.open({
                templateUrl:"cancelRenew.html",
                controller:"mysqlAutoRenewCtrl",
                resolve:{
                    refresh:function(){
                        return init;
                    },
                    val:function(){
                        return self.checkedItems;
                    },
                    reg:function(){
                        return self.region.selected;
                    }
                }
            });
        }

    }])
    .controller("updateReadInstanCtrl",["$scope","$uibModalInstance","refresh","instan","mysqlSrv","$timeout","$location",function(scope,$uibModalInstance,refresh,instan,mysqlSrv,$timeout,$location){
        var self = scope;
        var postData = instan.req;
        var timer;
        postData.instanceRole = 'ro';
        self.instan = instan;
        self.slider = {};
        self.priceIng = true;
        self.noGetPrice = true;
        self.slider.value = 110;
        self.delayCheck = true;
        self.subMt = false;
        mysqlSrv.getProductList(postData).then(function(res){
            if(res&&res.configs){
                var proList = res.configs.goodsDescription[self.instan.roList[0].zoneId].types;
                self.proList = proList.filter(item=>{
                   if(item.memory>=self.instan.roList[0].cdbMem&&item.volumeMax>self.instan.roList[0].cdbVolume){
                    return item;
                   } 
                });
                self.memory={
                   selected: self.proList[0]
                }
                self.sectionArr = [];
                var min = self.memory.selected.volumeMin>self.instan.roList[0].cdbVolume?self.memory.selected.volumeMin:self.instan.roList[0].cdbVolume;
                self.section = (self.memory.selected.volumeMax - min)/4;
                for(let c=1;c<4;c++){
                    var item = (min+self.section*c).toFixed();
                    self.sectionArr.push(item);
                }
                self.slider.value = min;
                self.slider.options = {
                    floor: min,
                    ceil: self.memory.selected.volumeMax,
                    step: self.memory.selected.volumeStep,
                    ticksArray: self.sectionArr
                }
            }
        })
        self.selMem = function(cur){//切换内存
            self.memory.selected = cur;
            self.sectionArr = [];
            var min = self.memory.selected.volumeMin>self.instan.roList[0].cdbMem?self.memory.selected.volumeMin:self.instan.roList[0].cdbVolume;
            self.section = (self.memory.selected.volumeMax - min)/4;
            for(let c=1;c<4;c++){
                var item = (min+self.section*c).toFixed();
                self.sectionArr.push(item);
            }
            self.slider.value = min;
            self.slider.options = {
                floor: min,
                ceil: self.memory.selected.volumeMax,
                step: self.memory.selected.volumeStep,
                ticksArray: self.sectionArr
            }
        }
        self.goodsNum = 1;  
        self.$watch(function(){
            if(self.delayCheck&&self.memory){
                return instan.req.Region+self.memory.selected.memory+self.slider.value+self.goodsNum
            }
        },function(ne){
            if(ne){
                if(self.memory&&self.slider.value&&self.memory.selected.memory==self.instan.roList[0].cdbMem&&self.slider.value==self.instan.roList[0].cdbVolume){
                    $timeout.cancel(timer);
                    self.noGetPrice = true;
                    self.priceIng = false;
                    return;
                }
                if(self.memory&&self.memory.selected&&self.slider.value&&(self.memory.selected.memory>self.instan.roList[0].cdbMem||self.slider.value>self.instan.roList[0].cdbVolume)){
                   $timeout.cancel(timer);
                    timer = $timeout(function(){
                        let data = {
                            "Region":self.instan.req.Region,            //地域[必填]
                            "memory":self.memory.selected.memory,            //实例内存大小[可选]，单位：MB,使用/ProductList获取范围
                            "cdbInstanceId":self.instan.roList[0].uInstanceId,
                            "volume":self.slider.value,              //实例硬盘大小[可选]，单位：GB,使用/ProductList获取范围
                            "instanceRole":"ro"   //实例类型[可选]，默认为 master，支持值包括：master-表示主实例，dr-表示灾备实例，ro-表示只读实例
                        }
                        self.price = null;
                        self.noGetPrice = false;
                        self.priceIng = true;
                        mysqlSrv.upgradePrice(data,'hourPay').then(function(res){
                            self.canCheck = false;
                            if(Number(res.price)){
                                self.price = (res.price/100).toFixed(2);
                            }
                        }).finally(function(){
                            self.priceIng = false;
                        })
                    },300); 
                }
            }
        })
        self.confirm = function(){
            let postData = {
                memory:self.memory.selected.memory,
                volume:self.slider.value,
                instanceRole:'ro',
                cdbInstanceId:self.instan.roList[0].uInstanceId,
                Region:self.instan.req.Region
            };
            self.subMt = true;
            mysqlSrv.upgradeCdb(postData).then(function(res){
                if(res&&res.code==0){
                    $uibModalInstance.dismiss("cancel");
                    $location.url("/cdb/task")
                }
            }).finally(function(){
                self.subMt = false;
            });
        }

    }])
    .controller("createReadInstanCtrl",["$scope","$uibModalInstance","refresh","instan","mysqlSrv","$timeout",function(scope,$uibModalInstance,refresh,instan,mysqlSrv,$timeout){
        var self = scope;
        var postData = instan.req;
        var timer;
        postData.instanceRole = 'ro';
        self.instan = instan;
        self.slider = {};
        self.slider.value = self.instan.volume;
        self.priceIng = true;
        self.subMt = false;
        mysqlSrv.getProductList(postData).then(function(res){
            if(res&&res.configs){
                var proList = res.configs.goodsDescription[instan.zoneId].types;
                self.proList = proList.filter(item=>{
                    if(item.memory>=self.instan.memory&&item.volumeMax>=self.instan.volume){
                        return item;
                    }
                })
                self.memory={
                   selected: self.proList[0]
                }
                self.sectionArr = [];
                var min = self.memory.selected.volumeMin>self.instan.volume?self.memory.selected.volumeMin:self.instan.volume;
                self.section = (self.memory.selected.volumeMax - min)/4;
                for(let c=1;c<4;c++){
                    var item = (min+self.section*c).toFixed();
                    self.sectionArr.push(item);
                }
                self.slider.value = min;
                self.slider.options = {
                    floor: min,
                    ceil: self.memory.selected.volumeMax,
                    step: self.memory.selected.volumeStep,
                    ticksArray: self.sectionArr
                }
            }
        })
        self.selMem = function(cur){//切换内存
            self.memory.selected = cur;
            self.sectionArr = [];
            var min = self.memory.selected.volumeMin>self.instan.volume?self.memory.selected.volumeMin:self.instan.volume;
            self.section = (self.memory.selected.volumeMax - min)/4;
            for(let c=1;c<4;c++){
                var item = (min+self.section*c).toFixed();
                self.sectionArr.push(item);
            }
            self.slider.value = min;
            self.slider.options = {
                floor: min,
                ceil: self.memory.selected.volumeMax,
                step: self.memory.selected.volumeStep,
                ticksArray: self.sectionArr
            }
        }
        self.goodsNum = 1;
        self.countMax = 3-self.instan.listLength;
        self.$watch(function(){
            if(self.memory){
                return instan.req.Region+self.memory.selected.memory+self.slider.value+self.goodsNum
            }
        },function(ne){
            if(self.memory&&self.slider.value&&self.goodsNum&&self.goodsNum>0&&self.goodsNum<=self.countMax){
               $timeout.cancel(timer);
                timer = $timeout(function(){
                    let data = {
                        "Region":self.instan.req.Region,            //地域[必填]
                        "cdbType":"CUSTOM",       //实例规格[必填]，CUSTOM 代表自定义规格
                        "goodsNum":self.goodsNum,             //实例数量[必填]，默认值为1，使用/ProductList获取可用数量
                        "memory":self.memory.selected.memory,            //实例内存大小[可选]，单位：MB,使用/ProductList获取范围
                        "volume":self.slider.value,              //实例硬盘大小[可选]，单位：GB,使用/ProductList获取范围
                        "zoneId":Number(self.instan.zoneId),          //可用区ID[可选]，使用/ProductList获取范围
                        "instanceRole":"ro"   //实例类型[可选]，默认为 master，支持值包括：master-表示主实例，dr-表示灾备实例，ro-表示只读实例
                    }
                    self.price = null;
                    self.priceIng = true;
                    mysqlSrv.getPrice(data,'hourPay').then(function(res){
                        if(Number(res.price)){
                            self.price = (res.price/100).toFixed(2);
                        }
                    }).finally(function(){
                        self.priceIng = false;
                    })
                },300); 
            }
            
        })
        self.confirm = function(){
            let postData = {
                cdbType:"CUSTOM",
                engineVersion:self.instan.engineVersion,
                goodsNum:self.goodsNum,
                //vpcId:0,
                //subnetId:self.curPeri,
                //period:self.curPeri,
                projectId:0,
                memory:self.memory.selected.memory,
                volume:self.slider.value,
                zoneId:Number(self.instan.zoneId),
                instanceRole:'ro',
                cdbInstanceId:self.instan.uInstanceId,
                //masterRegion:self.regionCur,
                Region:self.instan.req.Region
            };
            self.subMt = true;
            mysqlSrv.createInstan(postData,'hourPay').then(function(res){
                if(res.code==0){
                    $uibModalInstance.dismiss("cancel");
                    refresh();
                }
            }).finally(function(){
                self.subMt = false;
            })
        }

    }])
    .controller("CreateUserCtrl",["$scope","$uibModalInstance","refresh","instan","mysqlSrv","initAcc","editPermit",function(scope,$uibModalInstance,refresh,instan,mysqlSrv,initAcc,editPermit){
        var self = scope;
        self.submitalid = false;
        self.req = {
            "Region":instan.req.Region,
            "cdbInstanceId":instan.req.cdbInstanceId
        };
        self.confirm = function(){
            self.submitalid = true;
            if(self.createuser.$valid){
                var nePost = {
                    "user":self.req.user,
                    "host":self.req.host
                }
                mysqlSrv.Addaccount(self.req).then(function(res){
                    if(res.code==0){
                        initAcc();
                        $uibModalInstance.dismiss('cancel');
                        if(instan.item){
                            editPermit(instan.item,nePost);
                        }
                    }
                })
            }
        }
    }])
    .controller("editPassWordCtrl",["$scope","$uibModalInstance","refresh","instan","mysqlSrv","initAcc",function(scope,$uibModalInstance,refresh,instan,mysqlSrv,initAcc){
        var self = scope;
        self.submitalid = false;
        self.req = {
            "Region":instan.req.Region,
            "cdbInstanceId":instan.req.cdbInstanceId,
            "user":instan.item.user,
            "host":instan.item.host
        };
        self.confirm = function(){
            self.submitalid = true;
            if(self.editpassword.$valid){
                var postData = {
                    "Region":self.req.Region,
                    "cdbInstanceId":self.req.cdbInstanceId,
                    "user":self.req.user,
                    "host":self.req.host,
                    "password":self.req.password
                }
                mysqlSrv.editPassWord(postData).then(function(res){
                    if(res.code==0){
                        initAcc();
                        $uibModalInstance.dismiss('cancel');
                    }
                })
            }
        }
    }])
    .controller("delAccountCtrl",["$scope","$uibModalInstance","refresh","instan","mysqlSrv","initAcc",function(scope,$uibModalInstance,refresh,instan,mysqlSrv,initAcc){
        var self = scope;
        self.req = {
            "Region":instan.req.Region,
            "cdbInstanceId":instan.req.cdbInstanceId,
            "user":instan.item.user,
            "host":instan.item.host
        };
        self.confirm = function(){
            if(self.deluser.$valid){
                mysqlSrv.deleteaccout(self.req).then(function(res){
                    if(res.code==0){
                        initAcc();
                        $uibModalInstance.dismiss('cancel');
                    }
                })
            }
        }
    }])
    .controller("editRemarksCtrl",["$scope","$uibModalInstance","refresh","instan","mysqlSrv","initAcc",function(scope,$uibModalInstance,refresh,instan,mysqlSrv,initAcc){
        var self = scope;
        self.req = {
            "Region":instan.req.Region,
            "cdbInstanceId":instan.req.cdbInstanceId,
            "user":instan.item.user,
            "host":instan.item.host
        };
        self.confirm = function(){
            var postData ={
                "Region":self.req.Region,
                "cdbInstanceId":self.req.cdbInstanceId,
                "user":self.req.user,
                "host":self.req.host,
                "remarks":self.req.remarks
            }
            if(self.editremarks.$valid){
                mysqlSrv.editRemarks(postData).then(function(res){
                    if(res.code==0){
                        initAcc();
                        $uibModalInstance.dismiss('cancel');
                    }
                })
            }
        }
    }])
    .controller("EditPrivileCtrl",["$scope","$uibModalInstance","refresh","instan","mysqlSrv","$timeout","databasePrivile","$q",function(scope,$uibModalInstance,refresh,instan,mysqlSrv,$timeout,databasePrivile,$q){
        var self = scope;
        var req = {
                "Region":instan.req.Region,                           //地域[必填]
                "cdbInstanceId":instan.req.cdbInstanceId,          //实例ID[必填]
                "user":instan.data.user,                         //帐号名称[必填]
                "host":instan.data.host                          //主机[必填]
        };
        var tableReq = {//请求表List
            "Region":instan.req.Region,                           //地域[必填]
            "cdbInstanceId":instan.req.cdbInstanceId
        }
        //var database = databasePrivile[0].data[0].databaseList;//所有数据库列表
        var global_support_priv = databasePrivile[2].data.global_support_priv;//全局特权列表
        var db_support_priv = databasePrivile[2].data.db_support_priv;//数据库权限列表
        var tb_support_priv = databasePrivile[2].data.tb_support_priv;//数据表权限列表
        var col_support_priv = databasePrivile[2].data.col_support_priv;//数据列权限列表
        var AllPrivieList = databasePrivile[1].data;//所有默认选中权限
        self.databaseList = databasePrivile[0].data;
        self.AllPrivieList = {
            global:{},
            db_priv:{},
            tb_priv:{},
            col_priv:{}
        };
        for(var dbKey in self.databaseList){
            self.AllPrivieList.db_priv[dbKey] = {};
            self.AllPrivieList.tb_priv[dbKey] = {};
            self.AllPrivieList.col_priv[dbKey] = {};
            if(AllPrivieList.db_priv[dbKey]){
                self.AllPrivieList.db_priv[dbKey] = AllPrivieList.db_priv[dbKey];//所有库有选中权限赋值
            }else{
                let _length_db = db_support_priv.length;
                for(let j=0;j<_length_db;j++){//所有库无选中权限赋值
                    self.AllPrivieList.db_priv[dbKey][db_support_priv[j]] = 0;
                }
            }
            for(var tbKey in self.databaseList[dbKey]){
                self.AllPrivieList.tb_priv[dbKey][tbKey] = {};
                self.AllPrivieList.col_priv[dbKey][tbKey] = {};
                if(AllPrivieList.tb_priv[dbKey]&&AllPrivieList.tb_priv[dbKey][tbKey]){//所有表有选中权限赋值
                    self.AllPrivieList.tb_priv[dbKey][tbKey] = AllPrivieList.tb_priv[dbKey][tbKey];
                }else{
                    let _length_tb = tb_support_priv.length;
                    for(let x=0;x<_length_tb;x++){//当前表没有选中权限,默认赋0
                        self.AllPrivieList.tb_priv[dbKey][tbKey][tb_support_priv[x]] = 0;
                    }
                }
                var colList = self.databaseList[dbKey][tbKey];
                for(var colKey=0;colKey<colList.length;colKey++){
                    self.AllPrivieList.col_priv[dbKey][tbKey][colList[colKey]] = {};
                    if(AllPrivieList.col_priv[dbKey]&&AllPrivieList.col_priv[dbKey][tbKey]&&AllPrivieList.col_priv[dbKey][tbKey][colList[colKey]]){
                        self.AllPrivieList.col_priv[dbKey][tbKey][colList[colKey]] = AllPrivieList.col_priv[dbKey][tbKey][colList[colKey]];
                    }else{
                        let _length_col = col_support_priv.length;
                        for(var col=0;col<_length_col;col++){//当前表没有选中权限,默认赋0
                            self.AllPrivieList.col_priv[dbKey][tbKey][colList[colKey]][col_support_priv[col]] = 0;
                        }
                    }

                }
            }
        }
        for(let key in AllPrivieList){
            switch(key){
                case "global":
                    if(Object.keys(AllPrivieList[key]).length>0){
                        self.AllPrivieList.global = AllPrivieList.global;
                    }else{
                        let _length_global = global_support_priv.length;
                        for(let i=0;i<_length_global;i++){
                            self.AllPrivieList.global[global_support_priv[i]] = 0;
                        }
                    }
                    break;
            }
        }
        
        self.curPriv = "global_support_priv";
        self.curoLev = false;//库折叠cur
        self.curdLev = false;//库折叠cur
        self.curtLev = false;//表折叠cur
        self.curcLev = false;//列折叠cur
        self.firstCur = true;//选中状态样式类
        self.PrivieList = global_support_priv;
        self.getGlobalPriv = function(){
            self.curPriv = "global_support_priv";
            self.PrivieList = global_support_priv;
            self.firstCur = true;//选中状态样式类
            self.curDb = null;//库key
            self.curTb = null;//表key
            self.curCol = null;//列key
            self.curoLev = false;//库折叠cur
            self.curdLev = false;//库折叠cur
            self.curtLev = false;//表折叠cur
            self.curcLev = false;//列折叠cur
        }
        self.databasePrivieList = function(db){
            self.firstCur = false;
            self.curdLev = !self.curdLev;//库折叠cur
            self.actDb = db;
            self.PrivieList = db_support_priv;
            self.curPriv = "db_support_priv";
            self.curDb = db;
            self.curTb = null;
            self.curCol = null;
        }
        self.databaseTable = function(db,table){
            self.firstCur = false;
            self.curtLev = !self.curtLev;//表折叠cur
            self.actTb = table;
            self.PrivieList = tb_support_priv;
            self.curPriv = "tb_support_priv";
            self.curDb = db;
            self.curTb = table;
            self.curCol = null;
        }
        self.databaseCol = function(db,table,item){
            self.firstCur = false;
            self.actCol = item;
            self.PrivieList = col_support_priv;
            self.curPriv = "col_support_priv";
            self.curDb = db;
            self.curTb = table;
            self.curCol = item;
        }
        
        self.confirm = function(){
            req.data = self.AllPrivieList;
            if(instan.Nepost){
                req.user = instan.Nepost.user;
                req.host = instan.Nepost.host;
            }
            mysqlSrv.updatePrivileges(req).then(function(res){
                console.log(res);
                if(res.code==0){
                    $uibModalInstance.dismiss('cancel');
                }
            })
        }
        self.privToggle = function(){
            self.curoLev = !self.curoLev;
            self.curdLev = false;//库折叠cur
            self.curtLev = false;//表折叠cur
            self.curcLev = false;//列折叠cur
            //self.firstCur = false;
        }
        
    }])
    .controller("EditFuncCtrl",["$scope","$uibModalInstance","refresh","instan","mysqlSrv","$timeout","$location","$window",function(scope,$uibModalInstance,refresh,instan,mysqlSrv,$timeout,$location,$window){
        var self = scope;
        self.subDisabled = false;
        self.submitalid = false;
        function reNameConf(req){
            self.submitalid = true;
            if(self.updateName.$valid){
               self.subDisabled = true;
                mysqlSrv.editName(req).then(function(res){
                    if(res.code==0){
                      $uibModalInstance.dismiss('cancel');
                      if(instan.context.detailData){
                        instan.context.detailData.cdbInstanceName = self.req.cdbInstanceName
                      }
                      $timeout(function(){
                        refresh({Region:instan.data.region_id})  
                      },1500);
                    }
                    self.subDisabled = false;
                }) 
            }
            
        }
        function myinitConf(){

            self.submitalid = true;
            if(self.myinit.$valid){
                let req = {
                    Region:self.req.Region,
                    cdbInstanceId:self.req.cdbInstanceId,
                    charset:self.req.charset.toLowerCase(),
                    lowerCaseTableNames:self.req.lowerCaseTableNames?0:1,
                    password:self.req.password,
                    port:self.req.port
                }
                self.subDisabled = true;
                mysqlSrv.myinit(req).then(function(res){
                    if(res&&res.code==0){
                      $uibModalInstance.dismiss('cancel');
                      if(instan.context.detailData){
                        instan.context.detailData.initFlag = 1;
                        instan.context.detailData.cdbInstanceVport = self.req.cdbInstanceVport;
                      }
                      $timeout(function(){
                        refresh({Region:instan.data.region_id})  
                      },1500);
                    }
                }).finally(function(){
                    self.subDisabled = false;
                })
            }
            
        }
        function charsetConf(req){
            self.subDisabled = true;
            mysqlSrv.updateCharset(req).then(function(res){
                if(res.code==0){
                  $uibModalInstance.dismiss('cancel');
                  if(instan.context.detailData){
                    instan.context.detailData.character = self.req.charset.toUpperCase();
                  }
                }
                self.subDisabled = false;
                $location.url('/cdb/task');
            })
        }
        function portConf(req){
            self.submitalid = true;
            if(self.updatePort.$valid){
                self.subDisabled = true;
                mysqlSrv.updatePort(req).then(function(res){
                    if(res.code==0){
                      $uibModalInstance.dismiss('cancel');
                      if(instan.context.detailData){
                        instan.context.detailData.cdbInstanceVport = self.req.port;
                      }
                    }
                    self.subDisabled = false;
                }) 
            }
            
        }
        function openNetConf(){
            self.submitalid = true;
            if(self.submitalid&&self.openNet.$valid){
                var openReq = {
                    "Region":instan.data.region_id,
                    "cdbInstanceId":instan.data.cdbInstanceId,
                    "password":self.req.password
                }
                self.subDisabled = true;
                mysqlSrv.openExtrance(openReq).then(function(res){
                    if(res.code==0){
                      $uibModalInstance.dismiss('cancel');
                      instan.context.cdbWanLoading = true;
                    }
                    self.subDisabled = false;
                }).then(function(){
                    var status = 1;
                    var req = {
                        "Region":instan.data.region_id,
                        "cdbInstanceIds.0":instan.data.uInstanceId
                    }
                    $window.interGetDet = function(status,req,context){
                        var flag;
                        var timer = $timeout(function(){
                            mysqlSrv.getDetail(req).then(function(res){
                                if(res&&res.cdbInstance){
                                    if(status==res.cdbInstance.cdbWanStatus){
                                        context.detailData.cdbWanAdress = res.cdbInstance.cdbWanAdress;
                                        context.cdbWanLoading = false;
                                        flag=false;
                                    }else{
                                        flag = true;
                                    }
                                }
                            }).finally(function(){
                                if(flag){
                                    $window.interGetDet(status,req,context);
                                }else{
                                    $timeout.cancel(timer);
                                    $window.interGetDet = null;
                                }
                            })
                        },5000)
                    }
                    $window.interGetDet(status,req,instan.context);
                }) 
            }
        }
        function closeNetConf(req){
            self.submitalid = true;
            if(self.closeNet.$valid){
                self.subDisabled = true;
                mysqlSrv.closeExtrance(req).then(function(res){
                    if(res.code==0){
                      $uibModalInstance.dismiss('cancel');
                      instan.context.cdbWanLoading = true;
                    }
                    self.subDisabled = false;
                }).then(function(){
                    var status = 2;
                    var req = {
                        "Region":instan.data.region_id,
                        "cdbInstanceIds.0":instan.data.uInstanceId
                    }
                    $window.interGetDet = function(status,req,context){
                        var flag;
                        var timer = $timeout(function(){
                            mysqlSrv.getDetail(req).then(function(res){
                                if(res&&res.cdbInstance){
                                    if(status==res.cdbInstance.cdbWanStatus){
                                        context.detailData.cdbWanAdress = res.cdbInstance.cdbWanAdress;
                                        context.cdbWanLoading = false;
                                        flag=false;
                                    }else{
                                        flag = true;
                                    }
                                }
                            }).finally(function(){
                                if(flag){
                                    $window.interGetDet(status,req,context);
                                }else{
                                    $timeout.cancel(timer);
                                    $window.interGetDet = null;
                                }
                            })
                        },5000)
                    }
                    $window.interGetDet(status,req,instan.context);
                }) 
            }
        }
        switch(instan.type){
            case 'name':
                self.req = {
                    Region:instan.data.region_id,
                    cdbInstanceId:instan.data.uInstanceId,
                    cdbInstanceName:instan.data.cdbInstanceName
                }
                break;
            case 'myinit':
                self.req = {
                    Region:instan.data.region_id,
                    cdbInstanceId:instan.data.uInstanceId,
                    charset:instan.data.character?instan.data.character:"UTF8",
                    lowerCaseTableNames:true,
                    password:"",
                    port:instan.data.cdbInstanceVport
                }
                self.portRange ={
                   min:1024,
                   max:65535 
                };
                break;
            case 'charset':
                self.req = {
                    "Region":instan.data.region_id,
                    "cdbInstanceIds.0":instan.data.cdbInstanceId,
                    "charset":instan.data.character
                }
                break;
            case 'port':
                self.req = {
                    "Region":instan.data.region_id,
                    "cdbInstanceIds.0":instan.data.cdbInstanceId,
                    "port":instan.data.cdbInstanceVport
                }
                self.portRange ={
                   min:1024,
                   max:65535 
                };
                break;
            case 'openextrance':
                break;
            case 'closeextrance':
                self.req = {
                    "Region":instan.data.region_id,
                    "cdbInstanceIds.0":instan.data.cdbInstanceId,
                    "port":instan.data.cdbInstanceVport
                }
                break;
        }
        self.confirm = function(){
            switch(instan.type){
                case 'name':
                    reNameConf(self.req);
                    break;
                case 'myinit':
                    myinitConf();
                    break;
                case 'charset':
                    charsetConf(self.req);
                    break;
                case 'port':
                    let portReq = {
                        "Region":instan.data.region_id,
                        "cdbInstanceIds.0":instan.data.cdbInstanceId,
                        "port":self.req.port
                    }
                    portConf(portReq);
                    break;
                case 'openextrance':
                    openNetConf();
                    break;
                case 'closeextrance':
                    let closeReq = {
                        "Region":instan.data.region_id,
                        "cdbInstanceId":instan.data.cdbInstanceId,
                        "password":self.req.password
                    }
                    closeNetConf(closeReq);
                    break;
            }
        }
        
    }])
    .controller("MysqlUpgradeCtrl",["$scope","$uibModalInstance","refresh","instan","mysqlSrv","$timeout","lowInstan","$routeParams","$location",function(scope,$uibModalInstance,refresh,instan,mysqlSrv,$timeout,lowInstan,$routeParams,$location){
        var self = scope;
        var timer;
        var req = {
            Region:instan.region_id,
            instanceRole:instan.cdbInstanceType==1?"master":"dr",
            cdbInstanceId:instan.uInstanceId
        };
        self.noGetPrice = true;
        self.canCheck = false;
        self.memory = {};
        self.priceIng = true;
        self.curData = instan;
        self.slider = {};
        self.subMt = false;
        self.slider.value = self.curData.volume;
        self.delayCheck = true;
        mysqlSrv.getProductList(req).then(function(res){
            if(res.configs&&res.configs.goodsDescription){
                var types = res.configs.goodsDescription[instan.zoneId].types;
                self.Types = types.filter(item=>{
                    if(lowInstan.length>0){
                        if(self.curData.memory<=item.memory&&self.curData.volume<item.volumeMax&&lowInstan[0]>=item.memory&&lowInstan[1]>=item.volumeMin&&lowInstan[1]<=item.volumeMax){
                            return item;
                        } 
                    }else{
                        if(self.curData.memory<=item.memory&&self.curData.volume<item.volumeMax){
                            return item;
                        } 
                    }
                    
                });
                self.curTypes = self.Types[0];
                self.memory.selected = self.curTypes;
                self.curMysql = self.curTypes.mysqlversion[0]//mqsql版本默认值[5.5]


                self.sectionArr = [];
                var min = self.memory.selected.volumeMin>self.curData.volume?self.memory.selected.volumeMin:self.curData.volume;
                self.section = (lowInstan.length>0?lowInstan[1]:self.memory.selected.volumeMax - min)/4;
                for(let c=1;c<4;c++){
                    var item = (min+self.section*c).toFixed();
                    self.sectionArr.push(item);
                }
                self.slider.value = min;
                self.slider.options = {
                    floor: min,
                    ceil: lowInstan.length>0?lowInstan[1]:self.memory.selected.volumeMax,
                    step: self.memory.selected.volumeStep,
                    ticksArray: self.sectionArr
                }
                self.canCheck = true;
            }
        })
        self.selMysql = function(item){//切换数据库版本
            self.curMysql = item;
        }
        self.selMem = function(cur){//切换内存
            self.curTypes = cur;
            self.sectionArr = [];
            var min = self.curTypes.volumeMin>self.curData.volume?self.curTypes.volumeMin:self.curData.volume;
            self.section = (lowInstan.length>0?lowInstan[1]:self.curTypes.volumeMax - min)/4;
            for(let c=1;c<4;c++){
                var item = (min+self.section*c).toFixed();
                self.sectionArr.push(item);
            }
            self.slider.value = min;
            self.slider.options = {
                floor: min,
                ceil: lowInstan.length>0?lowInstan[1]:self.curTypes.volumeMax,
                step: self.curTypes.volumeStep,
                ticksArray: self.sectionArr
            }
        }
        self.confirm = function(){
            if(self.upgradeMysql.$valid){
               let postData = {
                    Region:instan.region_id,
                    cdbInstanceId:instan.uInstanceId,
                    memory:self.memory.selected.memory,
                    volume:self.slider.value,
                    /*engineVersion:self.curMysql,
                    membeore:instan.memory,
                    volbefore:instan.volume,
                    enginebefore:instan.engineVersion,*/
                    instanceRole:"master"
                };
                self.subMt = true;
                mysqlSrv.upgradeCdb(postData).then(function(res){
                    if(res&&res.code==0){
                        $uibModalInstance.dismiss("cancel");
                        $location.url("/cdb/task");
                    }
                    
                }).finally(function(){
                    self.subMt = false;
                })
            }
            
        }
        
        self.$watch(function(){
            if(self.delayCheck&&self.memory.selected){
                return instan.region_id+","+self.memory.selected.memory+","+self.slider.value
            }
        },function(ne){
            if(ne){
                var allset = ne.split(',');
                var mem = allset[1];
                var val = allset[2];
                if(mem&&val&&mem==self.curData.memory&&val==self.curData.volume){
                    $timeout.cancel(timer);
                    self.noGetPrice = true;
                    self.priceIng = false;
                    return;
                }
                if(mem&&val&&(mem>self.curData.memory||val>self.curData.volume)){
                    $timeout.cancel(timer);
                    timer = $timeout(function(){
                        if(self.canCheck){
                            let data = {
                                "Region":instan.region_id,            //地域[必填]
                                "memory":mem,            //实例内存大小[可选]，单位：MB,使用/ProductList获取范围
                                "volume":val, 
                                "cdbInstanceId":instan.uInstanceId,           
                                "instanceRole":"master"   //实例类型[可选]，默认为 master，支持值包括：master-表示主实例，dr-表示灾备实例，ro-表示只读实例
                            }
                            self.noGetPrice = false;
                            self.priceIng = true;
                            mysqlSrv.upgradePrice(data).then(function(res){
                                if(Number(res.price)){
                                    self.price = (res.price/100).toFixed(2);
                                }
                            }).finally(function(){
                                self.priceIng = false;
                            })
                        }
                    },500);
                }
            }
        })
    }])
    .controller("mysqlAutoRenewCtrl",["$scope","val","$uibModalInstance","mysqlSrv","$timeout","refresh","$filter","reg",function(scope,val,$uibModalInstance,mysqlSrv,$timeout,refresh,$filter,reg){
        var self = scope;
        self.region = {};
        self.totalUnitPrice = 0;
        self.val= [];
        self.val = val;
        var _length =  self.val.length;
        self.val.map(item =>{
            item.lastTime = new Date(moment(item.cdbInstanceDeadlineTime).format("YYYY-MM-DD"));
            if(item.lastTime.getMonth() == 11){
                item.lastTime = (item.lastTime.getFullYear()+1) + '-01-' + item.lastTime.getDate();
            }else if(item.lastTime.getMonth() == 10 || item.lastTime.getMonth() == 9 ||  item.lastTime.getMonth() == 8){
                item.lastTime = item.lastTime.getFullYear() + '-' + (item.lastTime.getMonth()+2) + '-' + item.lastTime.getDate();
            }else{
                item.lastTime = item.lastTime.getFullYear() + '-0' + (item.lastTime.getMonth()+2)  + '-' + item.lastTime.getDate();
            }
            var postData = {
                "Region": reg.region,
                "cdbType": item.cdbType,
                "memory": item.memory,
                "volume": item.volume,
                "zoneId": item.zoneId,
                "instanceRole": "master",
                "goodsNum": 1,
                "period": 1
            }
            mysqlSrv.priceMonth(postData).then(function(res){
                item.price = res.price / 100;
                self.totalUnitPrice += item.price;
            });
        })

        self.confirm = function(type){
            switch(type){
                case 'ok':
                var postData = {
                    Region:reg.region,
                    cdbInstanceId: self.val[0].cdbInstanceId,
                    isAutoRenew: "Y"
                }
                mysqlSrv.setautorenew(postData).then(function(result){
                    $uibModalInstance.dismiss("cancel");
                    refresh({Region:reg.region})
                });
                break;
                case 'cancel':
                var postData = {
                    Region:reg.region,
                    cdbInstanceId: self.val[0].cdbInstanceId,
                    isAutoRenew: "N"
                }
                mysqlSrv.setautorenew(postData).then(function(result){
                    $uibModalInstance.dismiss("cancel");
                    refresh({Region:reg.region})
                });
                break;
            }
        }

    }])
    /*.controller("editParamsCtrl",["$scope","val","$uibModalInstance","mysqlSrv","$timeout","$location",function(scope,val,$uibModalInstance,mysqlSrv,$timeout,$location){
        var self = scope;
        self.confirm = function(){
            mysqlSrv.editParams(val).then(function(res){
                $uibModalInstance.dismiss("cancel");
                if(res && res.code == 0){
                    $location.url('/cdb/cdblist');
                }
            })

        }
    }])*/

   /* .controller("MysqlCreateCtrl",["$scope","mysqlSrv","proList","$uibModalInstance","refresh",function(scope,mysqlSrv,proList,$uibModalInstance,refresh){
        var self = scope;
        self.canCheck = true;
        self.isSupportVpc = false;
        function init(res){
            if(res.configs){
                self.shopconfigs = res.configs;//所有数据
                self.curZoneId = Object.keys(self.shopconfigs.goodsDescription)[0];//可用区默认值
                self.Types = self.shopconfigs.goodsDescription[self.curZoneId].types;//mqsql规格所有值
                self.isSupportVpc = self.shopconfigs.goodsDescription[self.curZoneId].isSupportVpc;//是否支持私有网络
                self.curTypes = self.Types[0];//mqsql规格默认值
                self.curMysql = self.curTypes.mysqlversion[0]//mqsql版本默认值[5.5]
                self.memory={
                    selected:self.curTypes
                }
                self.section = (self.curTypes.volumeMax - self.curTypes.volumeMin)/4;
                self.sectionArr = [Number(self.section*1).toFixed(),Number(self.section*2).toFixed(),Number(self.section*3).toFixed()]
                self.slider.value = self.curTypes.volumeMin;
                self.slider.options = {
                    floor: self.curTypes.volumeMin,
                    ceil: self.curTypes.volumeMax,
                    step: self.curTypes.volumeStep,
                    ticksArray: self.sectionArr
                }
                self.canCheck = true;
            }
        }
        function getNetNum(region,network,subnet){

        }
        self.curNetC = "base";
        self.shopconfigs = {};
        self.slider = {
            value:1
        }
        self.network = {};
        self.subnet = {};
        self.goodsNum = 1;
        self.memory={
            selected:{}
        };
        self.regionList = mysqlSrv.getRegionList();
        self.regionCur = self.regionList[0].region;
        self.projectList = proList;
        self.payType = [
            {
                text: "包年包月",
                value: "prePay"
            },
            {
                text: "按量计费",
                value: "hourPay"
            }
        ]
        self.periodList=[
            {
                text: "1个月",
                value: 1
            },{
                text: "2个月",
                value: 2
            },{
                text: "3个月",
                value: 3
            },{
                text: "半年",
                value: 6
            },{
                text: "1年",
                value: 12
            },{
                text: "2年",
                value: 24
            },{
                text: "3年",
                value: 36
            }
        ];
        self.curPay = self.payType[0].value;
        self.curPeri = self.periodList[0].value;
        self.selPayType = function(item){
            self.curPay=item.value
        }
        mysqlSrv.getProductList({Region:self.regionList[0].region}).then(function(res){
            init(res);
        });
        self.selReg = function(item){//切换区域
            if(self.regionCur != item.region){
                self.regionCur = item.region;
                self.curNetC = "base";
                self.isSupportVpc = false;
                self.network.select ={}
                self.canCheck = false;
                mysqlSrv.getProductList({Region:item.region}).then(function(res){
                    init(res);
                })
            }
            
        }
        self.selZone = function(zoneid,val){//切换可用域
            self.curZoneId = zoneid;
            self.Types = val.types;
            self.isSupportVpc = val.isSupportVpc
            self.curNetC = "base";
            self.network.select ={};
        }
        self.chooseNetwork = function(){//切换网络
            var option = {
                Region:self.regionCur,
                zoneId:Number(self.curZoneId)
            }
            if(self.curNetC!= "perNet"){
                self.curNetC = "perNet";
                self.networkList = [];
                self.subNetList = [];
                self.network.select ={}
                self.subnet.select = {}
                mysqlSrv.getNetwork(option).then(function(res){
                    if(res.data){
                        self.networkList = res.data;
                        if(self.networkList.length>0){
                            self.subNetList = self.networkList[0].subnetlist;
                            self.network.select = self.networkList[0];
                            self.subnet.select = self.subNetList[0];
                        }
                    };
                    
                });
            }
        }
        self.selNetwork = function(item){
            self.subNetList = item.subnetlist;
            self.subnet.select = self.subNetList[0];
        }
        self.selMysql = function(item){//切换数据库版本
            self.curMysql = item;
        }
        self.selMem = function(cur){//切换内存
            self.curTypes = cur;
            self.section = (self.curTypes.volumeMax - self.curTypes.volumeMin)/4;
            self.sectionArr = [Number(self.section*1).toFixed(),Number(self.section*2).toFixed(),Number(self.section*3).toFixed()]
            self.slider.value = self.curTypes.volumeMin;
            self.slider.options = {
                floor: self.curTypes.volumeMin,
                ceil: self.curTypes.volumeMax,
                step: self.curTypes.volumeStep,
                ticksArray: self.sectionArr
            }
        }
        self.selPeri = function(item){//切换时长
            self.curPeri = item.value;
        }
        self.confirm = function(){
            let postData = {
                cdbType:"CUSTOM",
                engineVersion:self.curMysql,
                goodsNum:self.goodsNum,
                //vpcId:0,
                //subnetId:self.curPeri,
                //period:self.curPeri,
                projectId:0,
                memory:self.memory.selected.memory,
                volume:self.slider.value,
                zoneId:Number(self.curZoneId),
                instanceRole:'master',
                //masterRegion:self.regionCur,
                Region:self.regionCur
            };
            if(self.curNetC=="perNet"){
                postData.vpcId = self.network.select.vpcId;
                postData.subnetId = self.subnet.select.subnetId;
            }
            if(self.curPay=="prePay"){
                postData.period = self.curPeri;
            }
            mysqlSrv.createInstan(postData,self.curPay).then(function(res){
                if(res.code==0){
                    $uibModalInstance.dismiss("cancel");
                    refresh();
                }
            })
        }
        self.$watch(function(){
            return self.regionCur+self.goodsNum+self.memory.selected.memory+self.slider.value+self.curPeri+self.curZoneId+self.curPay
        },function(ne){
            console.log(ne);
            if(self.canCheck){
                let data = {
                    "Region":self.regionCur,            //地域[必填]
                    "cdbType":"CUSTOM",       //实例规格[必填]，CUSTOM 代表自定义规格
                    "goodsNum":self.goodsNum,             //实例数量[必填]，默认值为1，使用/ProductList获取可用数量
                    "memory":self.memory.selected.memory,            //实例内存大小[可选]，单位：MB,使用/ProductList获取范围
                    "volume":self.slider.value,              //实例硬盘大小[可选]，单位：GB,使用/ProductList获取范围
                    "zoneId":Number(self.curZoneId),          //可用区ID[可选]，使用/ProductList获取范围
                    "instanceRole":"master"   //实例类型[可选]，默认为 master，支持值包括：master-表示主实例，dr-表示灾备实例，ro-表示只读实例
                }
                if(self.curPay=="prePay"){
                    data.period = self.curPeri;
                }
                mysqlSrv.getPrice(data,self.curPay).then(function(res){
                    if(Number(res.price)){
                        self.price = (res.price/100).toFixed(2);
                    }
                })
            }
        })
    }]);*/


