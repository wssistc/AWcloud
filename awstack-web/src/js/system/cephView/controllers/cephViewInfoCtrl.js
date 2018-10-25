 import "../services/cephViewSrv"

cephViewInfoCtrl.$inject = ["$rootScope", "$scope", "NgTableParams","$uibModal","cephViewSrv","$routeParams","$filter"];
infoBalanceDataCtrl.$inject = ["$rootScope", "$scope","cephViewSrv","$uibModalInstance","item","postFunc","getCephTasks","getCephList"];
infoAddBalanceDataCtrl.$inject = ["$rootScope", "$scope","cephViewSrv","$uibModalInstance","item","postFunc","to","getCephTasks","getCephList"];
function cephViewInfoCtrl($rootScope, $scope,NgTableParams,$uibModal,cephViewSrv,$routeParams,$filter){
    var self = $scope;
    self.hasTask = false;
    getCephTasks()
    function getCephTasks(){
        cephViewSrv.getCephTasks().then(function(result){
            if (result && result.data){
                result.data.map(item=>{
                    if(item.jobStatus == "EXECUTING" || item.jobStatus=="NORMAL" ){
                        self.hasTask = true;
                    }
                })
            }
        })
    }
    
    function postFunc(item,maxBackfills,type,to){  //type:控制delete、add，to控制添加数据盘还是日志盘
        var oldCephOsd,oldCephSsd,cephOsd,cephSsd;
        oldCephOsd = self.cephDataList.reduce((list, osd) => {//节点之前的数据盘配置
            list.push(osd.byId);
            return list;
        }, []);  
        oldCephSsd = self.cephJournalList.reduce((list, osd) => { //节点之前的日志盘配置
            list.push(osd.byId);
            return list;
        }, []);
        if(item.attribute == "data" || to == "data"){
            cephSsd = [];
            cephOsd = [item.byId]

        }else if(item.attribute == "journal" || to == "journal"){
            cephSsd = [item.byId];
            cephOsd = []
        }
        var post ={
            "action": type,
            "cephOsd": cephOsd,
            "cephSsd": cephSsd,
            "diskName": item.name,
            "jobType": 1,
            "maxBackfills": Number(maxBackfills),
            "nodeIp": item.nodeIp,
            "nodeName": item.nodeName,
            "oldCephOsd": oldCephOsd,
            "oldCephSsd": oldCephSsd,
            "regionKey":localStorage.regionKey,
        }
        return post;
    }
    function hasTaskTip(){   //集群中有任务不允许添加和删除
        var scope = $rootScope.$new();
        var modal_os_delete= $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: "add-tip.html",
            scope: scope
        });
    }

    function hasJournalTip(){      //日志盘只能有一个
        var scope = $rootScope.$new();
        var modal_os_delete= $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: "journal-tip.html",
            scope: scope
        });
    }

    self.getCephList = function(){
        cephViewSrv.getCephList().then(function(result){
            if(result && result.data && angular.isArray(result.data)){
                result.data.map(node => {
                    if(node.nodeName == $routeParams.nodeName){
                        self.nodeName = node.nodeName;
                        self.nodeIp = node.adress;
                        node.diskInfos.map(item =>{
                            item.total=parseInt(item.size/(1024*1024*1024));
                            item.inUsed = parseInt(item.used/(1024*1024*1024));
                            item.percent = ((item.used/item.size)*100).toFixed(2)+"%";
                            item.nodeName = node.nodeName;
                            item.nodeIp = node.adress;
                            return item;
                        })
                        var cephAvaiList = node.diskInfos.filter(item => item.attribute =="available"); 
                        var cephJournalList = node.diskInfos.filter(item => item.attribute =="journal");
                        var cephDataList = node.diskInfos.filter(item => item.attribute =="data");
                        var cephMissList = node.diskInfos.filter(item => {return !item.size && !item.attribute && !item.byId});
                        var targetAvaiList = node.diskInfos.filter(item => item.targetAttribute =="available");
                        var targetJournalList = node.diskInfos.filter(item => item.targetAttribute =="journal");
                        var targetDataList = node.diskInfos.filter(item => item.targetAttribute =="data");
                        
                        cephMissList.map(item => {return item.status = "miss"})
                        self.cephAvaiList = $filter("orderBy")(cephAvaiList, "type",false);
                        self.cephJournalList = $filter("orderBy")(cephJournalList, "type",false);
                        self.cephDataList = $filter("orderBy")(cephDataList, "type",false);
                        self.cephMissList = $filter("orderBy")(cephMissList, "type",false);

                    } 
                })
            }
        })
    }
    self.getCephList()
    //设置权重
    self.weightSet = function(){
        var uibModalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: "js/system/cephView/tmpl/weightSet.html",
            controller: "weightSetCtrl",
            resolve: {
                initTable: function() {
                    return self.getTable;
                }
            },
        });
        return uibModalInstance.result.then(function(post){
            
        });
    }
    self.dragstart = function (e,item) {
        var data = angular.toJson(item)
        e.dataTransfer.setData("Text", data);
    };
    self.dragover = function (e) {
       e.preventDefault()
    };
    self.data_journalDrop = function(e,to){
        e.preventDefault();
        var data = e.dataTransfer.getData("Text");
        var item = angular.fromJson(data);
        if(self.hasTask){
            hasTaskTip()   //集群中有任务不允许添加和删除
        }else{
            if(to == "journal" && self.cephJournalList.length){  
                hasJournalTip() //日志盘只能有一个
            }else{
                var uibModalInstance = $uibModal.open({
                    animation: $scope.animationsEnabled,
                    templateUrl: "js/system/cephView/tmpl/infoAddBalanceData.html",
                    controller: "infoAddBalanceDataCtrl",
                    resolve:{
                        item:function(){
                            return item;
                        },
                        postFunc:function(){
                            return postFunc;
                        },
                        to:function(){
                            return to
                        },
                        getCephTasks:function(){
                            return getCephTasks
                        },
                        getCephList:function(){
                            return self.getCephList
                        }
                    }
                });
            }
            
        }
        
    }
    self.delUsedfunc = function(item){
        if(self.hasTask){
            hasTaskTip()
        }else{
            var uibModalInstance = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: "js/system/cephView/tmpl/infoBalanceData.html",
                controller: "infoBalanceDataCtrl",
                resolve:{
                    item:function(){
                        return item;
                    },
                    postFunc:function(){
                        return postFunc;
                    },
                    getCephTasks:function(){
                        return getCephTasks
                    },
                    getCephList:function(){
                        return self.getCephList
                    }
                }
            });
            return uibModalInstance.result.then(function(post){
                
            });
        }
        
    }

    self.delMissfunc = function(item){
        var scope = $rootScope.$new();
        var uibModalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: "delete-miss.html",
            scope: scope
        });
        scope.doubleClick = false;
        scope. confirmDelMiss = function(){
           scope.doubleClick = true;
           cephViewSrv.delMissOSD(item).then(function(){
                getCephTasks();
                self.getCephList();
           })
           uibModalInstance.close()
        }
    } 
}

function infoBalanceDataCtrl($rootScope, $scope,cephViewSrv,$uibModalInstance,item,postFunc,getCephTasks,getCephList){
    var self = $scope;
    self.balance = {
        execute:"timing",
        maxBackfills:2
    }
    self.stepOne = true;
    self.submitInValid = false;
    self.doubleClick = false;
    self.confirmBefore = function(field){
        self.showClusterStatusTip = false;
        self.stepOne = true;
        if(field.$valid){
            switch(self.balance.execute){
                case "timing":
                    self.stepOne = false;
                    break;
                case "immediately":
                    cephViewSrv.getPGstatus().then(function(res){
                        if(res && res.data){
                            self.stepOne = false;
                        }else{
                            self.showClusterStatusTip = true;
                        }
                    })
                break;
            }
            
        }else{
            self.submitInValid = true;
        }
    }
    self.balanceConfirm = function(){
        var post = postFunc(item,self.balance.maxBackfills,"delete");
        self.balance.execute == "timing"?post.startTime = self.balance.startTime:"";
        self.doubleClick = true;
        $uibModalInstance.close();
        cephViewSrv.balanceData(post).then(function(){
            getCephTasks()
            getCephList()
        })

    }
    self.close = function(){
        self.stepOne = true;
    }

}
function infoAddBalanceDataCtrl($rootScope, $scope,cephViewSrv,$uibModalInstance,item,postFunc,to,getCephTasks,getCephList){
    var self = $scope;
    self.balance = {
        execute:"timing",
        maxBackfills:2
    }
    self.submitInValid = false;
    self.doubleClick = false;
    self.balanceConfirm = function(field){
        if(field.$valid){
            self.showClusterStatusTip = false;
            var post = postFunc(item,self.balance.maxBackfills,"add",to);
            self.balance.execute == "timing"?post.startTime = self.balance.startTime:"";
            switch(self.balance.execute){
                case "timing":
                    self.doubleClick = true;
                    $uibModalInstance.close();
                    cephViewSrv.balanceData(post).then(function(){
                        getCephTasks()
                        getCephList()
                    })
                    break;
                case "immediately":
                    cephViewSrv.getPGstatus().then(function(res){
                        if(res && res.data){
                            self.doubleClick = true;
                            $uibModalInstance.close();
                            cephViewSrv.balanceData(post).then(function(){
                                getCephTasks()
                                getCephList()
                            })
                        }else{
                            self.showClusterStatusTip = true;
                        }
                    })
                break;
            }
        }else{
            self.submitInValid = true;
        }

    }

}
export {cephViewInfoCtrl,infoBalanceDataCtrl,infoAddBalanceDataCtrl}