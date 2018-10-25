import "./recycleSrv";
import "../instances/instancesSrv";
import "../overview/cvmViewSrv";
import "../../department/depviewSrv";

var recycleModule = angular.module("recycleModule", ["recycleSrvModule"]);
recycleModule.controller("recycleCtrl",["$rootScope", "$scope", "NgTableParams", "recycleSrv", "checkedSrv", "$uibModal", "$translate","GLOBAL_CONFIG","$filter","instancesSrv","cvmViewSrv","depviewsrv","generalSrv","$routeParams",
    function($rootScope, $scope, NgTableParams, recycleSrv, checkedSrv, $uibModal, $translate,GLOBAL_CONFIG,$filter,instancesSrv,cvmViewSrv,depviewsrv,generalSrv,$routeParams) {
        var self = $scope;
        self.showalerttip = true;
        self.context = self;
        function getRecycleTime() {
            generalSrv.getRecycleTimeData(localStorage.regionKey).then(function(res) {
                if(res && res.data) {
                    var time = parseInt(res.data.reclaim_instance_interval / 3600);
                    self.recycle = {"time":time};
                }
            });


        }

        self.headers = {
            name:$translate.instant("aws.instances.cloudInstanceName"),
            status:$translate.instant('aws.instances.status'),
            imgName:$translate.instant('aws.instances.imgName'),
            privateIP:$translate.instant('aws.instances.privateIP'),
            create_at:$translate.instant('aws.instances.create_at'),
            updatetime:$translate.instant('aws.instances.deletetime'),
        }
        self.titleName="recycle";
        if(sessionStorage["recycle"]){
            self.tableCols=JSON.parse(sessionStorage["recycle"]);
        }else{
             self.tableCols = [
                 { field: "check", title: "",headerTemplateURL:"headerCheckbox.html",show: true },
                 { field: "name", title: self.headers.name,sortable: "name",show: true,disable:true},
                 { field: "status_ori", title: self.headers.status,sortable: "status",show: true,disable:false},
                 { field: "imageName", title: self.headers.imgName,sortable: "imageName",show: true,disable:false},
                 { field: "fixedIps", title: self.headers.privateIP,sortable: "fixedIps_long",show: true,disable:false},
                 { field: "createtime", title: self.headers.create_at,sortable: "createtime",show: true,disable:false},
                 { field: "updatetime", title: self.headers.updatetime,sortable: "updatetime",show: true,disable:false},
             ];
        }
        self.configSearch = function(data,tableCols){
            var tableData =  data;
            tableData.map(item => {
                editSearch(item,tableCols)
            })
            return tableData;
        }
        function editSearch(item,tableCols){
            var searchTerm = []
            tableCols.map(search => {
                if(search.title && search.show){
                    searchTerm.push(item[search.field])
                }
            })
            item.searchTerm =searchTerm.join("\b") ;
            return item;
        }

        self.getSoftDel = function(){
            recycleSrv.getSoftDel().then(function(result){
                if(result && result.data && angular.isArray(result.data)){
                    if (localStorage.projectName == "admin" && self.ADMIN) {
                        result.data = result.data.filter(function(item) {
                            return item.proid == localStorage.projectUid;
                        });
                    }
                    successFunc(result.data); 
                }
                result?self.loadData = true:"";
            });
        };
        function successFunc(data) {
            //初始化表格
            data.map(item => {
                item.updatetime = $filter("date")(item.updatetime,"yyyy-MM-dd HH:mm:ss");
                item.createtime = $filter("date")(item.createtime,"yyyy-MM-dd HH:mm:ss");
                item.status = item.status.toLowerCase();
                item.fixedIps_long = item.fixedIps.map(ip => _IP.toLong(ip)) ;
                item.status_ori = $translate.instant("aws.recycle.table.status."+item.status);
                item.searchTerm = [item.name,item.status_ori,item.imageName,item.fixedIps,item.floatingIps,item.createtime,item.updatetime].join("\b");
            });
            self.tabledata = self.configSearch(data,self.tableCols);
            self.tableParams = new NgTableParams({ count: GLOBAL_CONFIG.PAGESIZE }, { counts: [], dataset: self.tabledata});
            var tableId = "uid";
            checkedSrv.checkDo(self, data, tableId);
        }
        self.getSoftDel();
        self.refresh = function(){
            getRecycleTime();
            self.getSoftDel();
        }
        getRecycleTime();
        //云主机详情
        $scope.$on("getDetail", function(event, value) {
            $scope.insConfigData = { status: "empty",  cpuConfigData: 0, ramConfigData: 0 };
            instancesSrv.getServerDetail(value).then(function(result) {
                $scope.insConfigData = { status: "empty",  cpuConfigData: 0, ramConfigData: 0 };
                if($routeParams.id!=value){return;}
                if (result && result.data) {
                    result.data.status = result.data.status.toLowerCase();
                    result.data.diskNewName = "";
                    for (var i = 0; i < result.data.diskName.length; i++) {
                        if (i != result.data.diskName.length - 1) {
                            result.data.diskNewName = result.data.diskNewName + result.data.diskName[i] + ",";
                        } else {
                            result.data.diskNewName = result.data.diskNewName + result.data.diskName[i];
                        }
                    }

                    if (result.data.status != "error") {
                        instancesSrv.getServerLog(value).then(function(result) {
                            if (result) {
                                $scope.logContent = result.data.replace(/\n/g, "<br\/>");
                            }
                        });
                    }

                }
                self.tab = {
                    active : 0
                }
                self.chartDisplay = function(i) {
                    self.tab.active = i
                }
                $scope.insConfigData = result.data;
                $scope.insConfigData.cpuConfigData = Number(result.data.vcpus);
                var ram = Number(result.data.ram/1024);
                $scope.insConfigData.ramConfigData = Math.ceil(ram) == ram?ram:ram.toFixed(1);

            });
        });
        //恢复云主机
        self.restoreRes = function() {
            if(localStorage.permission == "stand"){
                var content = {
                    target: "restoreRes",
                    msg:"<span>"+ $translate.instant("aws.instances.tipMsg.restoreSever") + "</span>",
                    type: "info",
                    btnType: "btn-primary"
                };
                self.$emit("delete", content);
            }else{
                self.sartTest = false;
                var value = self.checkedItems[0].uid
                instancesSrv.getServerDetail(value).then(function(result){
                    if(result && result.data){
                        getProused(result.data);
                    }
                }) 
            }
            
        };
        self.processArr=["restoring","deleting"];
        self.$watch(function(){
            return self.checkedItems;
        },function(values){
            self.canClear=false;
            self.canRecovery=false;
            self.forceDel=false;
            if(!values){
               return;
            }
            if(values.length==1){
               if(!_.include(self.processArr,values[0].status)){
                  self.canClear=true;
                  self.canRecovery=true;
                  self.forceDel=true;
               }
            }else if(values.length>1){
               self.canClear=true;
               for(var i=0;i<values.length;i++){
                   if(_.include(self.processArr,values[0].status)){
                      self.canClear=false;
                      break;
                   }
               }
            }
        },true);
    
        self.$watch(function(){
            return self.sartTest
        },function(value){
            if(value){
                var ramtip="",coretip="",instip="",text;
                if(self.coreProText){
                    coretip = self.coreProText;
                }else if(self.coreDomText){
                    coretip = self.coreDomText
                }
                if(self.ramProText){
                    ramtip = self.ramProText;
                }else if(self.ramDomText){
                    ramtip = self.ramDomText;
                }
                if(self.insProText){
                    instip = self.insProText;
                }else if(self.insDomText){
                    instip = self.insDomText;
                }
                if(coretip || ramtip || instip ){
                    text = instip + "</br>" + coretip + "</br>"+ramtip;
                    var content = {
                        target: "restoreRes",
                        msg:"<span>"+ text + "</span>",
                        type:"danger" ,
                        btnType: "btn-primary"
                    };
                    content.notDel = true;
                }else{
                    text = $translate.instant("aws.instances.tipMsg.restoreSever")
                    var content = {
                        target: "restoreRes",
                        msg:"<span>"+ text + "</span>",
                        type: "info",
                        btnType: "btn-primary"
                    };
                }
                
                self.$emit("delete", content);
            }
        })
        self.$on("restoreRes", function() {
            var del_ids = [];
            self.notDel = true;
            self.checkedItems.map(item => {del_ids.push(item.uid);});
            checkedSrv.setChkIds(del_ids,"restore")
            recycleSrv.osRestore({ids:del_ids}).then(function() {
            });
        });
        
        //强制删除云主机
        self.forceDelRes = function() {
            var content = {
                target: "forceDelRes",
                msg:"<span>"+ $translate.instant("aws.instances.tipMsg.forcedelSever") + "</span>"
            };
            self.$emit("delete", content);
        };
        self.$on("forceDelRes", function() {
            var del_ids = [];
            self.checkedItems.map(item => {del_ids.push(item.uid);});
            checkedSrv.setChkIds(del_ids,"delete")
            recycleSrv.osForceDel({ids:del_ids}).then(function() {
                
            });
        });

        self.forceDelVm = function(){
            var content = {
                target: "forceDelVm",
                msg:"<span>"+ $translate.instant("aws.instances.tipMsg.forcedelvm") + "</span>"
            };
            self.$emit("delete", content);
        }
        self.$on("forceDelVm", function() {
            var del_ids = [];
            self.checkedItems.map(item => {del_ids.push(item.uid);});
            checkedSrv.setChkIds(del_ids,"delete")
            recycleSrv.osForceDelVm(del_ids[0],{serverName:self.checkedItems[0].name}).then(function() {
                
            });
        });

        self.close = function(){
            self.showalerttip = false;
        };

        //server socket
        $rootScope.$on("serverSocket",function(e,data){
            if(self.tabledata && self.tabledata.length){
                self.tabledata.map(function(obj){
                    if(data.eventMata.instance_id){
                        if(obj.uid === data.eventMata.instance_id){
                            obj.status = data.eventMata.status;
                            if(data.eventType == "compute.instance.restore.end" ){ //恢复
                                _.remove(self.tabledata,function(val){
                                    return val.status =="active";
                                });
                            }
                            if(data.eventType == "compute.instance.delete.end"){ //删除
                                _.remove(self.tabledata,function(val){
                                    return val.status =="deleted";
                                });
                            }
                            
                        }
                    }
                });
                self.tableParams.reload();
                self.checkboxes.items={};
            }
        });

        //获取项目中的总配额
            function getproQuotas(data) {
                var insQuotapost = {
                    type: "project_quota",
                    targetId: localStorage.projectUid,
                    enterpriseUid: localStorage.enterpriseUid
                };
                cvmViewSrv.getproQuotas(insQuotapost).then(function(result) {
                    if (result && result.data && result.data.length) {
                        _.forEach(result.data, function(item) {
                            if (item.name == "instances" || item.name == "cores" || item.name == "ram") {
                                self[item.name + "quota"].total = item.defaultQuota || item.hardLimit;
                            }
                        });
                        (data.vcpus> self.coresquota.total - self.coresquota.used) ? self.coreProText = $translate.instant("aws.instances.quota.proCpu"): self.coreProText = "";
                        (data.ram > self.ramquota.total - self.ramquota.used) ? self.ramProText = $translate.instant("aws.instances.quota.proRam"): self.ramProText = "";
                        (1 > self.instancesquota.total - self.instancesquota.used) ? self.insProText = $translate.instant("aws.instances.quota.proIns"): self.insProText = "";
                }
                    getDomused(data);
                });
            }
            //获取项目中配额的使用量
            function getProused(data) {
                self.instancesquota = {};
                self.coresquota = {};
                self.ramquota = {};
                var postData = {
                    type: "project_quota",
                    domainUid: localStorage.domainUid,
                    projectUid: localStorage.projectUid,
                    enterpriseUid: localStorage.enterpriseUid
                };
                cvmViewSrv.getProused(postData).then(function(result) {
                    if (result && result.data && result.data.length) {
                        _.forEach(result.data, function(item) {
                            if (item.name == "instances" || item.name == "cores" || item.name == "ram") {
                                self[item.name + "quota"].used = item.inUse;
                            }
                        });
                    }
                    getproQuotas(data);
                });
                
            }
            //获取部门中的总配额
            function getDomQuotas(data) {
                depviewsrv.getQuotaTotal(localStorage.domainUid).then(function(result) {
                    if (result && result.data && result.data.length) {
                        _.forEach(result.data, function(item) {
                            if (item.name == "instances" || item.name == "cores" || item.name == "ram") {
                                self[item.name + "Domquota"].total = item.defaultQuota || item.hardLimit;
                            }
                        });
                        (data.vcpus > self.coresDomquota.total - self.coresDomquota.used) ? self.coreDomText = $translate.instant("aws.instances.quota.domCpu"): self.coreDomText = "";
                        (data.ram> self.ramDomquota.total - self.ramDomquota.used) ? self.ramDomText = $translate.instant("aws.instances.quota.domRam"): self.ramDomText = "";
                        (1 > self.instancesDomquota.total - self.instancesDomquota.used) ? self.insDomText = $translate.instant("aws.instances.quota.domIns"): self.insDomText = "";
                        self.sartTest = true;
                     }
                });
            }
            //获取部门中配额的使用量
            function getDomused(data) {
                self.instancesDomquota = {};
                self.coresDomquota = {};
                self.ramDomquota = {};
                depviewsrv.getQuotaUsed(localStorage.domainUid).then(function(result) {
                    if (result && result.data && result.data.length) {
                        _.forEach(result.data, function(item) {
                            if (item.name == "instances" || item.name == "cores" || item.name == "ram") {
                                self[item.name + "Domquota"].used = item.inUse;
                            }
                        });
                    }
                    getDomQuotas(data);
                });
                
            }
}]);
