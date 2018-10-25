
import "../volumesSrv";
import "../../instances/instancesSrv";
import "../../../system/storage/storageSrv";
import "../../../overview/overviewSrv"
import "../regularSnapSrv";
volumesTabCtrl.$inject=['$scope', "$rootScope", "volumesDataSrv", "$translate","$uibModal","newCheckedSrv",
'GLOBAL_CONFIG','storageSrv','instancesSrv','regularSnapSrv',"backupsSrv","alertSrv","$routeParams","NgTableParams"];
DistStockTransferCtrl.$inject=['$scope', 'volumesDataSrv', '$translate', '$uibModalInstance', 'initSystemVolumesTable','editData','type','backupsSrv','volumesSrv'];
function volumesTabCtrl($scope, $rootScope, volumesDataSrv,$translate,$uibModal,newCheckedSrv,
    GLOBAL_CONFIG,storageSrv,instancesSrv,regularSnapSrv,backupsSrv,alertSrv,$routeParams,NgTableParams){
    let self = $scope;
    self.volume = {
        curTable:"data",
        volumeTemp:"js/cvm/volumes/tmpl/dataVolumeTmpl.html",
        getDataTable(){
            this.curTable="data";
            this.volumeTemp = "js/cvm/volumes/tmpl/dataVolumeTmpl.html"
        },
        getSystemTable(){
            this.curTable="system";
            this.volumeTemp = "js/cvm/volumes/tmpl/systemVolumeTmpl.html"
        },
        getCacheTable(){
            this.curTable="cache";
            this.volumeTemp = "js/cvm/volumes/tmpl/cacheVolumeTmpl.html"
        }
    }
    self.headers = {
        "volumeName": $translate.instant("aws.volumes.volumeName"),
        "projectName": $translate.instant("aws.volumes.projectName"),
        "associatedHost": $translate.instant("aws.volumes.associatedHost"),
        "config": $translate.instant("aws.volumes.config"),
        "status": $translate.instant("aws.volumes.status"),
        "hostName": $translate.instant("aws.volumes.hostName"),
        "snapshot": $translate.instant("aws.volumes.snapshot"),
        "description": $translate.instant("aws.volumes.description"),
        "sharedVolume": $translate.instant("aws.volumes.sharedVolume"),
        "type": $translate.instant("aws.volumes.type"),
        "voltype": $translate.instant("aws.volumes.voltype"),
        "snapshotNum":$translate.instant("aws.volumes.snapshotNum"),
        "imageName":$translate.instant("aws.volumes.imageName"),
        "bootable":$translate.instant("aws.volumes.bootable"),
        "sharedVolume":$translate.instant("aws.volumes.sharedVolume"),
        "snapshotName": $translate.instant("aws.snapshots.snapshotName"),
        "volume": $translate.instant("aws.volumes.volumeName"),
        "size": $translate.instant("aws.snapshots.size"),
        "created_at": $translate.instant("aws.snapshots.created_at"),
    };
    self.translate = {
        "name": $translate.instant("aws.backups.table.name"),
        "vm": $translate.instant("aws.backups.table.vm"),
        "createAt": $translate.instant("aws.backups.table.createAt"),
        "size": $translate.instant("aws.backups.table.size"),
        "backupStatus": $translate.instant("aws.backups.table.backupStatus"),
        "backupType": $translate.instant("aws.backups.table.backupType"),
    }
    self.searchList = [
        {name:"全部",key:""},
        {name:$translate.instant('aws.volumes.table.status.available'),value:"available",key:"status"},
        {name:$translate.instant('aws.volumes.table.status.inavailable'),value:"inavailable",key:"status"},
        {name:$translate.instant('aws.volumes.table.status.creating'),value:"creating",key:"status"},
        {name:$translate.instant('aws.volumes.table.status.in-use'),value:"in-use",key:"status"},
        {name:$translate.instant('aws.volumes.table.status.error'),value:"error",key:"status"},
        //{name:$translate.instant('aws.volumes.table.status.deleting'),value:"deleting",key:"status"},
        // {name:$translate.instant('aws.volumes.table.status.attaching'),value:"attaching",key:"status"},
        // {name:$translate.instant('aws.volumes.table.status.detaching'),value:"detaching",key:"status"},
        // {name:$translate.instant('aws.volumes.table.status.unrecognized'),value:"unrecognized",key:"status"},
        // {name:$translate.instant('aws.volumes.table.status.error-deleting'),value:"error-deleting",key:"status"},
        // {name:$translate.instant('aws.volumes.table.status.downloading'),value:"downloading",key:"status"},
        // {name:$translate.instant('aws.volumes.table.status.uploading'),value:"uploading",key:"status"},
        // {name:$translate.instant('aws.volumes.table.status.retyping'),value:"retyping",key:"status"},
        // {name:$translate.instant('aws.volumes.table.status.backing-up'),value:"backing-up",key:"status"},
        // {name:$translate.instant('aws.volumes.table.status.restoring-backup'),value:"restoring-backup",key:"status"},
        // {name:$translate.instant('aws.volumes.table.status.error-restoring'),value:"error-restoring",key:"status"},
    ]
    
    self.tablchk = function(values){
        //分别对不同个数的选中项进行判断是否能删除
        self.btn={
            canNewIns:false,
            canEdit:false,
            canDel:false,
            canAttach:false,
            canUnstall:false,
            canCS:false,
            canExtend:false,
            canForeDel:false,
            isSelected:false,
            canStockTransfer:false,
            canBackup:false,
            hasTaskbackup:true,
            //CSHostDisabled:true,
            hasTasksnapshot:true,
            resetVol:false,
            delisDisabled:true
        }
        if(!values){return}
        self.checkedItems = values;
        if (values.length > 1) {
            self.btn.delisDisabled = false;
            self.btn.canNewIns = false;
            self.btn.canBackup = false;
            //只要有一个满足不能删除，即删除按钮不可用;分别对不同个数的选中项进行判断是否能强制删除
            for (var i = 0; i < values.length; i++) {
                canDelFunc(values[i]);
                if (self.btn.canDel == false) {
                    self.btn.canDel = false;
                    break;
                }
            }
            for (var i = 0; i < values.length; i++) {
                canForceDelFunc(values[i]);
                if (self.btn.canForeDel == false) {
                    self.btn.canForeDel = false;
                    break;
                }
            }
        } else {
            self.btn.canDel = false;
            self.btn.canForeDel = false;
            self.btn.canStockTransfer = false;
            self.btn.canEdit = false;
            self.btn.canExtend = false;
            self.btn.canAttach = false;
            self.btn.canUnstall = false;
            self.btn.canCS = false;
            self.btn.canNewIns = false;
            self.btn.canBackup = false;
            
        }

        //如果只有一个被选中，则可以编辑；如果不止一个被选中，则不能编辑扩展卸载
        if (values.length == 1) {
            self.btn.delisDisabled = false;
            self.editData = values[0];
            if(values[0] && values[0].storageInfo){
                self.btn.limit = values[0].storageInfo.storageLimitList;
                self.storageTypeTip = $translate.instant("aws.volumes.tip.tip5");
            }
            getSnapFromVolumeDetail(values[0].id);
            canDelFunc(values[0]);
            canForceDelFunc(values[0]);
            canEditFunc(values[0]);
            canResetStatus(values[0])
            if(self.btn.limit["os-retype"]) canStockTransferFunc(values[0])
            switch(self.volume.curTable){
                case "data":
                    if(self.btn.limit["os-extend"]) canExtendFunc(values[0]);
                    if(self.btn.limit["os-attach"]) canAttachFunc(values[0]);
                    if(self.btn.limit["os-detach"]) canUnstallFunc(values[0]);
                    if(self.btn.limit["snapshots"])canCSFunc(values[0]);
                    if(self.btn.limit["backups"])canBackup(values[0]);
                    canNewIns(values[0])
                    break;
            }
        }else {
            self.btn.canStockTransfer = false;
            self.btn.canEdit = false;
            self.btn.canExtend = false;
            self.btn.canAttach = false;
            self.btn.canUnstall = false;
            self.btn.canCS = false;
            self.btn.canNewIns = false;
            self.btn.canBackup = false;
            self.storageTypeTip=$translate.instant("aws.volumes.tip.tip10");
        }
    }
    $scope.$on("volumeSocket",function(e,data){
        //创建云硬盘和删除云硬盘弹出
        if(data.eventType == "volume.create.start" || data.eventType == "volume.delete.start"){  
            var tipMsg4 = data.resourceName + $translate.instant("aws.sockets.opLog."+ data.eventType);
            alertSrv.set(data.requestId, tipMsg4 , "building",5000);
        }
        if(data.eventType == "volume.create.end" ){  
            var tipMsg5 = data.resourceName + $translate.instant("aws.sockets.opLog."+ data.eventType);
            alertSrv.set(data.requestId, tipMsg5 , "success",5000);
            self.volume.initTablefunc()            

        }
        if( data.eventType == "volume.delete.end"){  
            var tipMsg6 = data.resourceName + $translate.instant("aws.sockets.opLog."+ data.eventType);
            alertSrv.set(data.requestId, tipMsg6 , "success",5000);
            self.volume.initTablefunc()
        }
    });
    $scope.$on("snapSocket",function(e,data){
        self.volume.initTablefunc()
    });
    $scope.$on("getDetail", function(event, value) {
        if(self.detailvalue != value){
            self.detailvalue = value;
            self.detailData = {};
            volumesDataSrv.detailVolumeData(value).then(function(result) {
                self.detailData = {};
                if(result && result.data && angular.isArray(result.data)){
                    if($routeParams.id!=value){return;}
                    self.detailData = result.data[0];
                    self.detailData.description = self.detailData.description == "auto-created_from_restore_from_backup"?self.detailData.description = "来自备份恢复":self.detailData.description;
                    self.detailData.ori_type = angular.copy(self.detailData.type);
                    self.detailData.created = moment(new Date(self.detailData.created)).format('YYYY-MM-DD HH:mm:ss');
                    self.detailvalue = "" ;
                    if(self.detailData.storageInfo.name.indexOf("toyou")>-1){
                        var postData = {
                            "volume_type_name": self.detailData.ori_type,
                        }
                        self.detailData.feature = [];
                        storageSrv.volume_type_analysis(postData).then(function(result){
                            if(result && result.data && angular.isObject(result.data)){
                                self.detailData.type = result.data.Storage_name;
                                self.detailData.pool = result.data.Pool_name
                                for(let key in result.data.Character_message){
                                    result.data.Character_message[key]>0 ? self.detailData.feature.push(key):"";
                                }
                            }

                        })
                    }
                }
                
            });
            instancesSrv.getVolumeSnapshots({volumeid:value}).then(function(res){
                if(res && res.data && angular.isArray(res.data)){
                    self.snapshotTable = new NgTableParams({ count: res.data.length }, { counts: [], dataset:res.data});
                }
            })
            backupsSrv.getVolumeBackups(value).then(function(res){
                if(res && res.data && angular.isArray(res.data)){
                    self.backupTable = new NgTableParams({ count: res.data.length }, { counts: [], dataset:res.data});
                }
            })
        }
        
    });
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

    //获取云硬盘的详情
    function getSnapFromVolumeDetail(value){
        self.btn.isSelected = false;
        volumesDataSrv.detailVolumeData(value).then(function(result){
            if(result && result.data && angular.isArray(result.data)){
                if(result.data[0].id == value){
                    self.btn.isSelected = true;
                    self.detailData = result.data[0];
                }
            }
        })
    }

    function canResetStatus(obj){
        self.btn.resetVol = true;
        if(obj.status!="retyping"){
            self.btn.resetVol = false;
            self.resetVolumeStatusTip = $translate.instant("aws.volumes.tip.tip14");
        }
    }
    //判断是否能新建云主机
    function canNewIns(obj){
        self.btn.canNewIns = true;
        if(obj.magrationing){
            self.btn.canNewIns = false;
            self.newInsTip = $translate.instant("aws.volumes.tip.tip19");
            return;
        }
        if(!obj.bootable || obj.status!="available"){
            self.btn.canNewIns = false;
            self.newInsTip = $translate.instant("aws.volumes.tip.tip1");
            return;
        }
        if(obj.imageMetadata && obj.imageMetadata.disk_format == "iso") {
            self.btn.canNewIns = false;
            self.newInsTip = $translate.instant("aws.volumes.tip.tip4");
        }
    }
    //判断是否能备份
    function canBackup(obj){
        self.btn.canBackup = true;
        if(obj.magrationing){
            self.btn.canBackup = false;
            self.newBackupTip = $translate.instant("aws.volumes.tip.tip19");
            return;
        }
        if(obj.status !="available" && obj.status!="in-use"){
            self.btn.canBackup = false;
            self.newBackupTip = $translate.instant("aws.volumes.tip.tip2");
            return;
        }
        if(obj.imageMetadata && obj.imageMetadata.disk_format == "iso") {
            self.btn.canBackup = false;
            self.newBackupTip = $translate.instant("aws.volumes.tip.tip4");
            return;
        }
        if(obj.type.toLowerCase().indexOf("nfs")>-1 && obj.status=="in-use"){
            self.btn.canBackup = false;
            self.newBackupTip = $translate.instant("aws.volumes.tip.tip15");
            return
        }
        if(!self.btn.limit["share_volumes_backups"] && obj.multiattach && obj.attachments && obj.attachments.length>1 ){
            self.btn.canBackup = false;
            self.newBackupTip = $translate.instant("aws.volumes.tip.tip11");

        }
        if(obj.status=="available" || obj.status=="in-use"){
            self.btn.hasTaskbackup = true;
            hasTaskJob(obj.id,1,"backup")
        }
    }
    
    //判断是否能删除 、强制删除
    function canDelFunc(obj) {
        self.btn.canDel = true;
        var cantDelArray = ["deleting", "detaching", "in-use", "attaching","creating","error-deleting" , "retyping", "backing-up"];
        _.forEach(cantDelArray, function(item) {
            if (obj.status == item) {
                self.btn.canDel = false;
                self.delTip = $translate.instant("aws.volumes.tip.tip16");
                return;
            }
        });

        if(obj.magrationing){
            self.btn.canDel = false;
            self.delTip = $translate.instant("aws.volumes.tip.tip19");
            return;
        }

        if(self.btn.canDel){
            if(obj.snapshotNum > 0){
                self.btn.canDel = false;
                self.delTip = $translate.instant("aws.volumes.tip.tip17");
            }
        }
    }
    function canForceDelFunc(obj) {
        self.btn.canForeDel = true;
        var cantForeDelArray = ["attaching", "in-use", "detaching" , "retyping", "backing-up"];
        _.forEach(cantForeDelArray, function(item) {
            if (obj.status == item) {
                self.btn.canForeDel = false;
                self.forceDelTip = $translate.instant("aws.volumes.tip.tip16");
                return;
            }
        });

        if(obj.magrationing){
            self.btn.canForeDel = false;
            self.forceDelTip = $translate.instant("aws.volumes.tip.tip19");
            return;
        }

        if(self.btn.canForeDel){
            if(obj.snapshotNum > 0){
                self.btn.canForeDel = false;
                self.forceDelTip = $translate.instant("aws.volumes.tip.tip17");
            }
        }
    }
    
    //判断是否能编辑
    function canEditFunc(obj) {
        self.btn.canEdit = true;
        if(obj.magrationing){
            self.btn.canEdit = false;
            self.editTip = $translate.instant("aws.volumes.tip.tip19");
            return;
        }
        if(obj.status != "available" && obj.status != "in-use"){
            self.btn.canEdit = false ;
            self.editTip = $translate.instant("aws.volumes.tip.tip2");
            return ;
        }
        if(obj.imageMetadata && obj.imageMetadata.disk_format == "iso") {
            self.btn.canEdit = false;
            self.editTip = $translate.instant("aws.volumes.tip.tip4");
        }
    }
    
    //判断是否能够卷迁移
    function canStockTransferFunc(obj){
        self.btn.canStockTransfer = true ;
        if(obj.magrationing){
            self.btn.canStockTransfer = false;
            self.stockTransferTip = $translate.instant("aws.volumes.tip.tip19");
            return;
        }
        if(obj.status != "available" && obj.status != "in-use"){
            self.btn.canStockTransfer = false ;
            self.stockTransferTip = $translate.instant("aws.volumes.tip.tip2");
            return;
        }
        if(obj.imageMetadata && obj.imageMetadata.disk_format == "iso") {
            self.btn.canStockTransfer = false;
            self.stockTransferTip = $translate.instant("aws.volumes.tip.tip4");
            return;
        }
        if(obj.snapshotNum>0){
            self.btn.canStockTransfer = false ;
            self.stockTransferTip = $translate.instant("aws.volumes.tip.tip18");
        }
    }
    //判断是否能扩展
    function canExtendFunc(obj) {
        self.btn.canExtend = true;
        if(obj.magrationing){
            self.btn.canExtend = false;
            self.extendTip = $translate.instant("aws.volumes.tip.tip19");
            return;
        }
        if(obj.status != "available"){
            self.btn.canExtend = false   //不能进行扩容
            self.extendTip = $translate.instant("aws.volumes.tip.tip6");
            return;
        }
        if(obj.imageMetadata && obj.imageMetadata.disk_format == "iso") {
            self.btn.canExtend = false;
            self.extendTip = $translate.instant("aws.volumes.tip.tip4");
            return;
        }
        toyouCha(obj)
        
    }

    function toyouCha(obj){
        if(obj.storageInfo && obj.storageInfo.name.indexOf("toyou") > -1){
            var postData = {
                "volume_type_name": obj._type,
            }
            self.btn.canExtend = false;
            self.btn.canCS = false;
            storageSrv.volume_type_analysis(postData).then(function(result){
                if(result && result.data && angular.isObject(result.data)){
                    if(result.data.Character_message){
                        if(result.data.Character_message.hyperswap==1){
                            self.CSTip = $translate.instant("aws.volumes.tip.tip7");
                        }else{
                            self.btn.canExtend = true;
                            self.btn.canCS = true;
                        }
                    }
                }
            })
        }
    }

    function canAttachFunc(obj) {
        self.btn.canAttach = true;
        if(obj.magrationing){
            self.btn.canAttach = false;
            self.attachTip = $translate.instant("aws.volumes.tip.tip19");
            return;
        }
        if(obj.multiattach){
            if(obj.status != "available" && obj.status != "in-use"){
                self.btn.canAttach = false ;
                self.attachTip = $translate.instant("aws.volumes.tip.tip2");
            }
        }else{
            if(obj.status != "available"){
                self.btn.canAttach = false ;
                self.attachTip = $translate.instant("aws.volumes.tip.tip6");
            }
        }
        if(obj.imageMetadata && obj.imageMetadata.disk_format == "iso") {
            self.btn.canAttach = false;
            self.attachTip = $translate.instant("aws.volumes.tip.tip4");
        }
    }
    
    //判断是否能卸载
    function canUnstallFunc(obj) {
        self.btn.canUnstall = true;
        if(obj.magrationing){
            self.btn.canUnstall = false;
            self.unistallTip = $translate.instant("aws.volumes.tip.tip19");
            return;
        }
        if(obj.status != "in-use"){
            self.btn.canUnstall = false ;
            self.unistallTip = $translate.instant("aws.volumes.tip.tip9");
        }
        if(obj.imageMetadata && obj.imageMetadata.disk_format == "iso") {
            self.btn.canUnstall = false;
            self.unistallTip = $translate.instant("aws.volumes.tip.tip4");
        }
    }
    
    //判断是否能创建快照
    function canCSFunc(obj) {
        self.btn.canCS = true;
        if(obj.magrationing){
            self.btn.canCS = false;
            self.CSTip = $translate.instant("aws.volumes.tip.tip19");
            return;
        }
        if(obj.status != "available" && obj.status != "in-use"){
            self.btn.canCS = false ;
            self.CSTip = $translate.instant("aws.volumes.tip.tip2");
            return;
        }
        if(obj.imageMetadata && obj.imageMetadata.disk_format == "iso") {
            self.btn.canCS = false;
            self.CSTip = $translate.instant("aws.volumes.tip.tip4");
            return;
        }
        if(!self.btn.limit["share_volumes_snapshots"] && obj.multiattach && obj.attachments && obj.attachments.length>1 ){
            self.btn.canCS = false;
            self.CSTip = $translate.instant("aws.volumes.tip.tip11");

        }
        if(obj.status=="available" || obj.status=="in-use"){
            self.btn.hasTasksnapshot = true;
            hasTaskJob(obj.id,0,"snapshot")
        }
        toyouCha(obj)
    }

    function hasTaskJob(volumeId,type,name){
        backupsSrv.checkSheduleJob({volumeId:volumeId,jobType:type}).then(function(res){
            if(res && res.data && angular.isArray(res.data)){
                self.btn["hasTask"+name] = Boolean(res.data.length);
                if(name == "backup" && self.btn.hasTaskbackup){
                    self.newBackupTip = $translate.instant("aws.volumes.tip.tip3");
                }
                if(name == "snapshot" && self.btn.hasTasksnapshot){
                    self.CSTip = $translate.instant("aws.volumes.tip.tip8");
                }
            }
        })
    }

    self.openVolumeModel = function(type,editData,init) {
        if (type == "new") {
            $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: "js/cvm/volumes/tmpl/volumeModel.html",
                controller: "volumeController",
                resolve: {
                    type: function() {
                        return type;
                    },
                    editData: function() {
                        return editData;
                    },
                    initTable: function() {
                        return init;
                    }
                }
            });
        } else if(type == "edit"){
            if(!self.btn.canEdit) return;
            $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: "volumeUpdateModel.html",
                controller: "volumeController",
                resolve: {
                    type: function() {
                        return type;
                    },
                    editData: function() {
                        return angular.copy(editData);
                    },
                    initTable: function() {
                        return init;
                    }
                }
            });
        }else if(type == "systemEdit"){
            $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: "volumeUpdateModel.html",
                controller: "volumeController",
                resolve: {
                    type: function() {
                        return type;
                    },
                    editData: function() {
                        return angular.copy(editData);
                    },
                    initTable: function() {
                        return init;
                    }
                }
            });
        }
    };
    //向父元素传递要删除的信息和数据
    self.deleteVolumes = function(checkedItems) {
        if(!self.btn.canDel || self.btn.delisDisabled) return;
        var content = {
            target: "delVolume",
            msg: "<span>" + $translate.instant("aws.volumes.dv.confirmDelete") + "</span>",
            data: checkedItems
        };
        self.$emit("delete", content);
    };
    self.$on("delVolume", function(e,data) {
        if (data.length == 1) {
                newCheckedSrv.setChkIds([data[0].id],"volumedelete")
                volumesDataSrv.delOneVolumeAction(data[0].id).then(function() {	
                    
                });
        } else if (data.length > 1) {
            //获取删除的卷id数组
            var volume_ids=[];
            _.forEach(data,function(item){
                volume_ids.push(item.id);
            });
            var delParams = {
                ids: volume_ids
            };
            newCheckedSrv.setChkIds(volume_ids,"volumedelete")
            volumesDataSrv.delVolumes(delParams).then(function(){
                
            });
        }
    });

    self.DistStockTransfer = function(editData,type,init) {
        if(!self.btn.canStockTransfer) return;
        $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: "dist_stock_transfer.html",
            controller: "DistStockTransferCtrl",
            resolve: {
                initSystemVolumesTable: function() {
                    return init;
                },
                editData: function() {
                    return editData;
                },
                type:function(){
                    return type
                }
            }
        });
    };
    
}
function DistStockTransferCtrl(scope, volumesDataSrv, $translate, $uibModalInstance, initSystemVolumesTable, editData,type,backupsSrv,volumesSrv){
    scope.submitInValid = false;
    scope.storageDevice = {
        name:""
    }
    scope.submitInValidList = [];
    let id=editData[0].id;
    let _type=editData[0]._type;
    let volumeTypeId = editData[0].storageInfo.volumeTypeId;
    let multiattach ;
    let attachedServerInfo ;

    function getVolServerVol(){
        var post = {
            ids:[]
        }
        editData[0].attachments.map(item => {
            post.ids.push(item.server_id);
        })
        scope.serverHasRetyping = false;
    
        volumesSrv.serversVolumes(post).then(function(res){
            if(res && res.data && angular.isArray(res.data)){
                res.data.map(item => {
                    if(item.status == "retyping"){
                        scope.serverHasRetyping = true;
                    }
                })

            }
    
        })
    }

    function getVolumeAttachServer(){
        scope.Vol_allServerActive = true;
        backupsSrv.isVolumeExist(editData[0].id).then(function(res){
            attachedServerInfo = res;
            if(res && res.data && res.data.volume&& res.data.volume.insnameAndId && angular.isArray(res.data.volume.insnameAndId)){
                res.data.volume.insnameAndId.map(item => {
                    if(item.status !="active"){
                        scope.Vol_allServerActive = false;
                    }
                })
            }
        })
    }

    function stockTransferList(type){
        switch(type){
            case "fromData":
                multiattach = editData[0].multiattach;
                volumesDataSrv.stockTransferList().then(function(res){
                    if(res&&res.data&&res.data&&res.data.length>0){
                        res.data.forEach(function(item,index){
                            if(item.id!=volumeTypeId){
                                if(multiattach &&item.multiattach=="true"){
                                    scope.submitInValidList.push(item)
                                }else if(!multiattach){
                                    scope.submitInValidList.push(item)
                                }
                            }
                        })
                    }
                })
            break;
            case "fromSystem":
                multiattach = editData[0].multiattach;
                volumesDataSrv.stockTransferList().then(function(res){
                    if(res&&res.data&&res.data&&res.data.length>0){
                        scope.submitInValidList = res.data;
                        scope.submitInValidList.forEach(function(item,index){
                            if(item.id!=volumeTypeId){
                                if(multiattach &&item.multiattach=="true"){
                                    scope.submitInValidList.push(item)
                                }else if(!multiattach){
                                    scope.submitInValidList.push(item)
                                }
                            }
                        })
                    }
                })
            break;

        }
        
    }
    stockTransferList(type)
    getVolumeAttachServer();
    getVolServerVol();


    scope.warningUp = false
    scope.warningDown = false
    scope.chooseStorageDevice = function(type){
        // console.log(editData[0])
        if(editData[0].status == "in-use"){
            if(angular.isArray(editData[0].attachments) && editData[0].attachments.length == 1 && editData[0].attachments[0].device && editData[0].attachments[0].device.slice(-2) == "da"){
                if(type.storageProtocol == "ceph"){
                    var res = attachedServerInfo;
                    if(res&&res.data&&res.data.volume&&res.data.volume.insnameAndId&&res.data.volume.insnameAndId.length>0&&(res.data.volume.insnameAndId[0].status == "shutoff"||res.data.volume.insnameAndId[0].status == "stopped")){
                        scope.warningUp = false
                    }else{
                        scope.warningUp = true
                    }
                }else{
                    scope.warningDown = false                    
                }
            }else{
                if(type.storageProtocol == "ceph"){
                    scope.warningDown = true
                }else{
                    scope.warningDown = false
                }
            }
        }
    } 

    scope.stockTransferConfirm = function(fileFrom){
        if(fileFrom.$valid&&!scope.warningDown&&!scope.warningUp){
            var postData = {
                "volumeId":id,
                "newType":scope.storageDevice.name.id
            }
            volumesDataSrv.stockTransfer(postData).then(function(res){
                initSystemVolumesTable()
            })
            $uibModalInstance.close();
        }else{
            scope.submitInValid = true;
        }
    }
    scope.cancel = function() {
        $uibModalInstance.dismiss("cancel");
    };
}
export {volumesTabCtrl,DistStockTransferCtrl}
