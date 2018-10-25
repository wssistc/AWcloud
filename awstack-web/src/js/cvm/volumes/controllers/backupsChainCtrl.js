import  backupsSrv from "../services/backupsSrv"
import  {backupsCtrl }   from "./backupsCtrl"

backupsChainCtrl.$inject=["$scope", "$rootScope", "$translate","$uibModal","$location","backupsSrv","NgTableParams","newCheckedSrv","$filter","volumesDataSrv","$routeParams"];
export function backupsChainCtrl($scope, $rootScope, $translate,$uibModal,$location,backupsSrv,NgTableParams,newCheckedSrv,$filter,volumesDataSrv,$routeParams){
    var self = $scope;
    self.option = {}
    self.showSystemBackups = false;
    switch($routeParams.type){
        case "false":
            self.showSystemBackups = false
            break;
        case "true":
            self.showSystemBackups=true;
            break;
    }
    self.translateChain = {
        "createAt": $translate.instant("aws.backups.table.createAt"),
        "size": $translate.instant("aws.backups.table.size"),
        "chainName": $translate.instant("aws.backups.table.chainName"),
        "volumeName": $translate.instant("aws.backups.table.volumeName"),
        "chainStatus": $translate.instant("aws.backups.table.chainStatus"),
        "backupPoint": $translate.instant("aws.backups.table.backupPoint"),
    }
    function editSearch(item){
		item.status = item.status.toLowerCase();
		item.statusCopy = $translate.instant('aws.backups.table.status.chain.' + item.status);
        item.bootableCopy = $translate.instant('aws.backups.table.bootable.' + item.bootable);
        item.createdAtCopy = $filter("date")(item.createdAt, "yyyy-MM-dd HH:mm:ss");	
		item.searchTerm = [item.name,item.statusCopy,item.volumeName,item.size,item.num,item.createdAtCopy].join("~") ;
		return item;
	}

    function initTable(res){
		if(res && res.data){
			res.data.map(item => {
				editSearch(item)
			})
			self.chaintabledata = res.data;
			self.backupChainTable = new NgTableParams({ count: 10 }, { counts: [], dataset: self.chaintabledata });
			newCheckedSrv.checkDo(self,res.data,"id","backupChainTable");
		}
    };

    let backupTableTitleData = [
        {name: 'backups.backupChainName', value: true, disable: true, search: "name"},
        {name: 'backups.volumeName', value: true, disable: false, search: "volumeName"},
        {name: 'backups.backupChainStatus', value: true, disable: false, search: "statusCopy"},
        {name: 'backups.size', value: true, disable: false, search: "size"},
        {name: 'backups.backupPoint', value: true, disable: false, search: "num"},
        {name: 'backups.createTime', value: true, disable: false, search: "createdAtCopy"}
    ];
    self.backupTableTitleName = "backupChain";
    if (sessionStorage["backupChain"]) {
        self.backupTableTitleData = JSON.parse(sessionStorage["backupChain"]);
    } else {
        self.backupTableTitleData = angular.copy(backupTableTitleData);
    }
    
    self.backupSearchTearm = function (obj) {
        self.option.globalSearchTerm = "";
        var tableData = obj.tableData;
        var titleData = obj.titleData;
        tableData.map(function (item) {
            item.searchTerm = [];
            titleData.forEach(function (value) {
                if (value.value) {
                    item.searchTerm.push(item[value.search]);
                }
            })
            item.searchTerm = item.searchTerm.join('\b');
        })
    };
        

    //子网设置项的初始化
    self.titleName="backupsDetails";
    if(sessionStorage["backupsDetails"]){
        self.titleData=JSON.parse(sessionStorage["backupsDetails"]);
    }else{
        self.titleData=[ 
            {name:'instances.backups.name',value:true,disable:true},
            {name:'instances.cloudInstanceName',value:true,disable:false},
            {name:'instances.createtime',value:true,disable:false},
            {name:'instances.mount.size',value:true,disable:false},
            {name:'instances.backups.backups_status',value:true,disable:false},
            {name:'instances.backups.backups_type',value:true,disable:false},
        ];
    }
    
    self.$watch(function(){
        return self.checkedItemsbackupChainTable;
    },function(values){
        self.exp_btn = true;
        self.chain_del_btn = true;
        if(values && values.length){
            var num = 0;
            values.map(function(item){
                num += parseInt(item.num);
                
            })
            if(num > 2000) {
                self.exp_btn = true;
                self.exp_tip = $translate.instant("aws.backups.tips.expTip");
            }else {
                self.exp_btn = false;
            }
        }
        
        if(values && values.length == 1){
            let ingNum = 0;
            backupsSrv.getVolumeBackups(values[0].volumeId).then(function(res){
                if(res && res.data && angular.isArray(res.data)){
                    _.each(res.data,item=>{
                        if(item.status.indexOf("ing")>-1){
                            ingNum++;
                        }
                    });
                    if(ingNum == 0){ //AWSTACK-2115
                        self.chain_del_btn = false;
                    }else{
                        self.chain_uibpopover = $translate.instant('aws.backups.tips.chain_uibpopover');
                    }
                }
            });
        }else{
            if ( values && values.length == 0) {
                self.chain_uibpopover = $translate.instant('aws.backups.table.placeholder.plsSelSigItem');
            } else {
                self.chain_uibpopover = $translate.instant('aws.backups.table.placeholder.multipleChoice');
            }
        }
    })
    self.$on("gettrueDetail", function(event, value) {
        backupsCtrl($scope, $rootScope, $translate,$uibModal,$location,backupsSrv,NgTableParams,newCheckedSrv,$filter,value,volumesDataSrv)
    })
    self.$on("getfalseDetail", function(event, value) {
        backupsCtrl($scope, $rootScope, $translate,$uibModal,$location,backupsSrv,NgTableParams,newCheckedSrv,$filter,value,volumesDataSrv)
    })

    self.$on("backupSocket", function(e, data) {
        if (self.chaintabledata && self.chaintabledata.length) {
            self.chaintabledata.map(function(obj) {
                if (data.eventMata.backup_id) {
                    if (obj.id === data.eventMata.backup_id) {
                        //obj.status = data.eventMata.status;
                        if (data.eventType == "backup.delete.end") { //删除
                            // _.remove(self.chaintabledata, function(val) {
                            //     return ((val.status == "error" || val.status == "deleted"));
                            // });
                            self.getBackupsChain(self.showSystemBackups)
                        }
                    }
                    if(data.eventType == "backup.create.end" 
                    || data.eventType == "backup.restore.end"
                    ||data.eventType == "backup.reset_status.end"){
                        self.getBackupsChain(self.showSystemBackups)
                    }
                    //self.chaintabledata = backupChainOperate(self.chaintabledata);
                }
            });
            //self.backupChainTable.data = self.chaintabledata;
            self.backupChainTable.reload();
            self.checkboxesbackupChainTable.items = {};
        }
        
    });

    self.closeDetail = function(){
        self.getBackupsChain(self.showSystemBackups);
    }

    self.applyGlobalSearch = function() {
        var term = self.option.globalSearchTerm;
        self.backupChainTable.filter({searchTerm:term});
    };
    //获取备份列表
    self.getBackupsChain = function(type,refresh){
        if(!localStorage.cinderService ||  !localStorage.backupsService) return;
        self.globalSearchTerm = "";
        self.option.globalSearchTerm = "";
        self.backupTableTitleData = angular.copy(backupTableTitleData);

        if(!refresh){
            self.backupChainTable = new NgTableParams({ count: 10 }, { counts: [], dataset: [] });
        }
        self.chaintabledata = "";
        self.showSystemBackups = type
		backupsSrv.getBackups().then(function(res){
			if(res && res.data && angular.isArray(res.data)){
                self.chaintabledataCopy = res.data;
                res.data = $filter("orderBy")(res.data, "createdAt",false);
                res.data = backupChainOperate(res.data);
                res.data = res.data.filter(item => !item.isIncremental);                
                res.data = $filter("orderBy")(res.data, "createdAt",true);
                res.data = res.data.filter(item => item.bootable == type)
				initTable(res);
			}else{
                self.chaintabledata = null;
            }
		});
    }
    
    function backupChainOperate(data){
        var volBackups = {},volBackupsSize = {},volBackupsErrorStatus = {};
        var volBackupsArray = [];
        data.map(item => {
            if(!volBackups[item.volumeId]) {
                volBackups[item.volumeId] = 0;
                volBackupsSize[item.volumeId] = 0;
                volBackupsErrorStatus[item.volumeId] = 0;
                volBackupsArray.push(item)
            }
            volBackups[item.volumeId] += 1;
            volBackupsSize[item.volumeId] += item.size;
            if(item.status == "error" || item.status == "error_restoring"){
                volBackupsErrorStatus[item.volumeId] +=1;
            }
        })
        volBackupsArray.map(item => {
            item.num = volBackups[item.volumeId];
            item.size = volBackupsSize[item.volumeId];
            if(volBackupsErrorStatus[item.volumeId] == volBackups[item.volumeId]){
                item.status = "error";
            }else if(volBackupsErrorStatus[item.volumeId] >0){
                item.status = "warning";
            }else{
                item.status = "normal";
            }
            
        })
        return volBackupsArray;
    }
    self.getBackupsChain(self.showSystemBackups)
	

    //导入备份链
    self.importBackupsChain = function() {
        $uibModal.open({
            animation: true,
            templateUrl: "importBackups.html",
            controller: "importBackupsCtrl",
            resolve: {
                backupsType: function() {
                    return self.showSystemBackups;
                },
                initBackupsTable: function() {
                    return self.getBackupsChain;
                }
            }
        });
    }

    //导出备份链
    self.exportBackupsChain = function(checkedItems) {
        if(self.exp_btn) {
            return;
        }
        var volumeIds = [];
        checkedItems.map(item => {
            volumeIds.push(item.volumeId)
        })
        var params = {
            volumeIds: volumeIds
        }
        backupsSrv.exportBackups(params).then(function(result) {
            var content = {
                target: "exportBackups",
                msg: "<span>" + $translate.instant("aws.backups.tips.exp_msg") + "</span>",
                type: "info",
                btnType: "btn-info",
                btnText: $translate.instant("aws.action.download"),
                data: result.data
            };
            self.$emit("delete", content);
        });
    }
    self.$on("exportBackups", function(e, data) {
        window.location = data;
    });

    //只允许删除状态为available以及error的备份 
    self.delBackupsChain = function(data){
        if(self.chain_del_btn){
            return;
        }
        var content = {
            target: "delBackupsChain",
            msg: "<span>" + $translate.instant("aws.backups.tips.del_msg") + "</span>",
            data:data
        };
        self.$emit("delete", content);
    }

    self.$on("delBackupsChain", function(e,data) {
        var post = {
            backupIds : [],
            backupChainName:data[0].name
        };
        var del_Array = self.chaintabledataCopy.filter(item => item.volumeId == data[0].volumeId);
        del_Array = $filter("orderBy")(del_Array, "createdAt",true);
        del_Array.map(item=>{
            post.backupIds.push(item.id)
        })
        newCheckedSrv.setChkIds(post.backupIds,"backupdelete")
        backupsSrv.delBackupChain(post).then(function(){

        })
        
        // newCheckedSrv.setChkIds(postData.ids,"backupdelete")
        // backupsSrv.delBackups(postData).then(function() {
        // });
    });

    function chkSome(items) {
		var ids = [];
		var names = []
		items.map(item => {
			ids.push(item.id),
			names.push(item.name)
		})
		return {ids:ids,names:names};
	};
    
    
}


importBackupsCtrl.$inject=["$scope", "$translate", "$timeout", "$uibModalInstance", "alertSrv", "backupsType", "initBackupsTable", "backupsSrv"];
export function importBackupsCtrl($scope, $translate, $timeout, $uibModalInstance, alertSrv, backupsType, initBackupsTable, backupsSrv) {
    var self = $scope;
    self.submitInValid = false;
    self.fileCheck = false;
    self.selected_file = "";
    
    self.fileNameChanged = function() {
        self.fileCheck = false;
        self.selected_file = document.getElementById("upload").value;
        var dom = document.getElementById("upload");
        var file = dom.files[0];
        let fileSize = 0;
        var fileType = "";
        file ? fileSize = file.size:self.selected_file=""; 
        file ? fileType = file.name.substr(-4,4):fileType=".pem";
        if(fileType ==".pem" && fileSize < 2097152) {
            self.fileCheck = false;
        }else{
            self.fileCheck = true;
        }
        self.$apply();
　　}

    self.importConfirm = function(filed) {
        if(filed.$valid && !self.fileCheck) {
            var form = document.forms.namedItem("impBackupsForm");
            var oData = new FormData(form);
            var oReq = new XMLHttpRequest();
            var importsuccess = $translate.instant("aws.backups.tips.importsuccess");
            var importerror = $translate.instant("aws.backups.tips.importerror");
            oReq.onerror = function(e) { 
                if(e.type =="error") {
                    alertSrv.set("",importerror , "error", 5000);       
                }
            };
            oReq.onload = function(){
               var responseObj = JSON.parse(oReq.responseText);
               if(responseObj){
                    if( responseObj.code==0){
                        alertSrv.set("",importsuccess, "success", 5000);
                        $timeout(function() {
                            initBackupsTable(backupsType);
                        },1000);
                        
                    }else{
                        alertSrv.set("", importerror, "error", 5000);
                    }
               }
            }
            oReq.open("POST", window.GLOBALCONFIG.APIHOST.RESOURCE + "/v1/backups/import", true);
            let auth_token = localStorage.$AUTH_TOKEN;
            oReq.setRequestHeader("X-Auth-Token",auth_token); 
            oReq.send(oData);

            $uibModalInstance.close();
        }else{
            self.submitInValid = true;
        }
    }
}