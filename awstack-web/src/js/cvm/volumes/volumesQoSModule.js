import "./volumesQoSSrv";

var volumesQoSModule = angular.module("volumesQoSModule", ["volumesQoSApi"])
.controller("VolumesQoSCtrl", ['$routeParams','$scope', '$rootScope', '$location', 'volumesQoSSrv', '$translate','GLOBAL_CONFIG','TableCom','modalCom',
function($routeParams,$scope, $rootScope, $location, volumesQoSSrv, $translate,GLOBAL_CONFIG,TableCom,modalCom) {
    var self = $scope ;
    self.checkFirst = {
        checked: false,
        items: {}
    };
    self.volumesQoS_search={};

    var initVolumesQos = function(){
        if(!localStorage.cinderService) return;
        self.volumesQoS_search.globalSearchTerm = "";
         volumesQoSSrv.getVolumesQoS().then(function(res){
            if(res&&angular.isArray(res.data)){
                self.volumesQoSData = res.data.map(function(item){
                    item.specs.write_bytes_sec = item.specs.write_bytes_sec>0?item.specs.write_bytes_sec/1024/1024 + "MB/s":(item.specs.write_bytes_sec==0?"不限制":"");
                    item.specs.read_bytes_sec = item.specs.read_bytes_sec>0?item.specs.read_bytes_sec/1024/1024 + "MB/s":(item.specs.read_bytes_sec==0?"不限制":"");
                    item.specs.read_iops_sec = item.specs.read_iops_sec>0?item.specs.read_iops_sec + "个" : (item.specs.read_iops_sec==0?"不限制":"");
                    item.specs.write_iops_sec = item.specs.write_iops_sec>0?item.specs.write_iops_sec + "个" : (item.specs.write_iops_sec==0?"不限制":"");
                    item.searchTerm = [item.name, item.specs.write_bytes_sec,item.specs.read_bytes_sec,item.specs.read_iops_sec,item.specs.write_iops_sec].join("\b")
                    
                    return item
                })
                TableCom.init(self,'volumesQoSTable',self.volumesQoSData,'id',GLOBAL_CONFIG.PAGESIZE,'checkFirst');
            }
        })
    }
    initVolumesQos();

    self.applyGlobalSearch = function() {
        self.volumesQoSTable.filter({
            searchTerm: self.volumesQoS_search.globalSearchTerm
        });
    };
    self.refreshVolumesQoS = function(){
        initVolumesQos()
    }

    // 监听主页的单选框，控制操作按钮的状态
    self.$watch(function() {
        return self.checkFirst.items;//监控checkbox
    }, function(val) {
        self.checkedItems = [];
        var arr=[];
        for(var i in self.checkFirst.items){
            arr.push(self.checkFirst.items[i])
        }
        self.checkRelation = null;
        self.checkRelieve = null;
        if(val && arr.length>=0){
            for(var key in val){
                if(val[key]){
                    self.volumesQoSData.forEach(item=>{
                        if(item.id==key){
                            self.checkedItems.push(item);
                        }
                    })
                }
            }
        }
        if(self.checkedItems.length==1){  
            if(self.checkedItems[0].status=="1"){
                self.canDel = false;
                self.canRelation = true;
                self.canRelieve = true
            }else if(self.checkedItems[0].status=="0"){
                self.canDel = true;
                self.canRelation = true;
                self.canRelieve = true;
            }
        }else if(self.checkedItems.length>1){
            var result = self.checkedItems.some(function(item){
                return item.status=="1"
            })
            if(result){
                self.canDel = false;
                self.canRelation = false;
                self.canRelieve = false;
            }else{
                self.canDel=true;
                self.canRelation = false;
                self.canRelieve = false;
            }
        }else if(self.checkedItems.length==0){
            self.canRelation = false;
            self.canDel=false;
            self.canRelieve = false;
        }
    },true);

    // 新建
    self.createVolumesQoS = function() {
        let templateUrl = localStorage.cinderService ? "createVolumesQoS.html":"js/cvm/volumes/tmpl/addVolumeTip.html";
        let createVolumesQoSCtrl = localStorage.cinderService ? "createVolumesQoSCtrl":"";
        var createVolumesQoS = modalCom.init(templateUrl,createVolumesQoSCtrl,{refresh:function(){return initVolumesQos},context:function(){return self}})
    };
    // 关联存储
    self.relativeVolumesQoS = function(editData) {
        var relativeVolumesQoS = modalCom.init('relativeVolumesQoS.html',"relativeVolumesQoSCtrl",{editData:function(){return editData},refresh:function(){return initVolumesQos},context:function(){return self}})
    };
    // 解除关联
    self.relieveVolumeQoS = function(editData) {
        var relieveVolumeQoS = modalCom.init('relieveVolumeQoS.html',"relieveVolumeQoSCtrl",{editData:function(){return editData},refresh:function(){return initVolumesQos},context:function(){return self}})
    };
    // 删除
    self.delVolumeQoS= function(checkedItems) {
        var content = {
            target: "delVolumeQoS",
            msg: "<span>" + $translate.instant("aws.volumesQoS.delVolumesQoS") + "</span>",
            data: checkedItems
        };
        self.$emit("delete", content);
    };
    self.$on("delVolumeQoS", function(e,data) {
        let obj_id=[]
        data.forEach(function(item){
            obj_id.push(item.id)
        })
        volumesQoSSrv.delVolumesQoS(obj_id.join(",")).then(function(res){
            initVolumesQos()
        })
    });  
}])
.controller("createVolumesQoSCtrl", ["$scope", "$rootScope","$translate","GLOBAL_CONFIG","$uibModalInstance","volumesQoSSrv","refresh",
function($scope, $rootScope, $translate, GLOBAL_CONFIG,$uibModalInstance,volumesQoSSrv,refresh) {
    var self = $scope;
    
    self.volumesQoSMsg = {
        name:"",
        read_bytes_sec:"",
        write_bytes_sec:"",
        read_iops_sec:"",
        write_iops_sec:"",
    };


    self.mustOne = false;
    self.hasAssociatedStorageList=[];
    
    volumesQoSSrv.getHasAssociatedStorageList().then(function(res){
        if(res&&res.data){
            res.data.forEach(function(item){
                if(item.status=="0"){
                    self.hasAssociatedStorageList.push(item)
                }
            })
        }
    })
    self.createVolumesQoSConfirm = function(field){
        self.submitInValid=false;
        if(self.volumesQoSMsg.read_bytes_sec||self.volumesQoSMsg.write_bytes_sec||self.volumesQoSMsg.read_iops_sec||self.volumesQoSMsg.write_iops_sec){
            self.mustOne = false;
            if(field.$valid){
                let postData = {
                    name:self.volumesQoSMsg.name,
                    volTypeId:"",
                    readIopsSec:self.volumesQoSMsg.read_iops_sec?self.volumesQoSMsg.read_iops_sec:"",
                    writeIopsSec:self.volumesQoSMsg.write_iops_sec?self.volumesQoSMsg.write_iops_sec:""
                }
                if(angular.isObject(self.volumesQoSMsg.hasDockingDevice)){
                    postData.volTypeId=self.volumesQoSMsg.hasDockingDevice.volumeTypeId;
                }
                postData.readBytesSec = self.volumesQoSMsg.read_bytes_sec?(self.volumesQoSMsg.read_bytes_sec*1024*1024).toString():""
                postData.writeBytesSec = self.volumesQoSMsg.write_bytes_sec?(self.volumesQoSMsg.write_bytes_sec*1024*1024).toString() :""

                volumesQoSSrv.createVolumesQoS(postData).then(function(res){
                    refresh()
                })
                $uibModalInstance.dismiss('cancel');
            }else{
                self.submitInValid=true;
            }
        }else{
            self.mustOne = true;
        }
    }
}])
.controller("relativeVolumesQoSCtrl", ["$scope", "$rootScope","$translate","GLOBAL_CONFIG","$uibModalInstance","volumesQoSSrv","refresh","editData",
function($scope, $rootScope, $translate, GLOBAL_CONFIG,$uibModalInstance,volumesQoSSrv,refresh,editData) {
    var self = $scope;
   
    self.volumesQoS = {};

    self.relativeVolumesList = [];
    volumesQoSSrv.getHasAssociatedStorageList().then(function(res){
        if(res&&res.data&&res.data.length>0){
            let resultList=[]
            res.data.forEach(function(item){
                if(item.status == "0"){
                    self.relativeVolumesList.push(item)
                }
            })
        }
    })
    self.relativeVolumesQoSConfirm = function(field){
        self.submitInValid=false;
        let posId=editData.id
        
        if(field.$valid){
            if(self.volumesQoS.relativeVolumes){
                let volTypeId=self.volumesQoS.relativeVolumes.volumeTypeId
                volumesQoSSrv.associateStorage(volTypeId,posId).then(function(res){
                    refresh()
                })
                $uibModalInstance.dismiss('cancel'); 
            }
        }else{
            self.submitInValid=true;
        }
    }
}])
.controller("relieveVolumeQoSCtrl", ["$scope", "$rootScope","$translate","GLOBAL_CONFIG","$uibModalInstance","volumesQoSSrv","refresh","editData",
function($scope, $rootScope, $translate, GLOBAL_CONFIG,$uibModalInstance,volumesQoSSrv,refresh,editData) {
    var self = $scope;
    self.volumesQoS = {}
    self.relieveVolumesQoSList = []
    volumesQoSSrv.disassociateStorageList(editData.id).then(function(res){
        if(res&&res.data&&res.data.length){
            self.relieveVolumesQoSList = res.data
        }        
    })
    self.relieveVolumesQoSConfirm = function(field){
        self.submitInValid=false;
        let posId=editData.id
        if(field.$valid){
            if(self.volumesQoS.relieveVolumes){
                let volTypeId=self.volumesQoS.relieveVolumes.id
                volumesQoSSrv.disassociateStorage(volTypeId,posId).then(function(res){
                    refresh()
                })
                $uibModalInstance.dismiss('cancel');
            }
        }else{
            self.submitInValid=true;
        }
    }
}])
