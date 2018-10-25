
import "../volumesSrv";
systemVolumesCtrl.$inject=['$scope', "$rootScope", "volumesDataSrv", "$translate","NgTableParams","newCheckedSrv","volumesSrv"];
function systemVolumesCtrl($scope, $rootScope, volumesDataSrv,$translate,NgTableParams,newCheckedSrv,volumesSrv){
    let self = $scope;
    self.context = self;
    self.table = {};
    self.menuGuide = [$translate.instant('aws.menu.System'),$translate.instant('aws.menu.System_Operation'),$translate.instant('aws.menu.System_Storage')];
    self.titleName="systemVolumes";
    if(sessionStorage["systemVolumes"]){
       self.tableCols=JSON.parse(sessionStorage["systemVolumes"]);
    }else{
        self.tableCols = [
            { field: "check", title: "",headerTemplateURL:"systemheaderCheckbox.html",show: true },
            { field: "name", title: self.headers.volumeName,sortable: "name",show: true,disable:true},
            { field: "size", title: self.headers.config,sortable: "size",show: true,disable:false},
            { field: "statusCopy", title: self.headers.status,sortable: "status",show: true,disable:true },
            { field: "voltype", title: self.headers.voltype,sortable: "voltype",show: true,disable:false },
            { field: "description", title: self.headers.description,sortable: "description",show: true,disable:false },
        ];
    }

    function successFunc(res){
		self.system_data = self.configSearch(self.system_data,self.tableCols);
        self.systemTableParams = new NgTableParams({ count: 10 }, { counts: [], dataset: self.system_data });
        newCheckedSrv.checkDo(self,"","id","systemTableParams");
    };

    self.getData = function(){
        if(!localStorage.cinderService) return;
        volumesDataSrv.getVolumesTableData().then(function(result) {
            if(result && result.data && angular.isArray(result.data)){
                //过滤掉result.data中vol.instance="fixedImageInstanceName"的元素
                //result.data=result.data.filter(vol=>vol.instance[0]!="fixedImageInstanceName");
                result.data.map(item => {
                    item.statusCopy= $translate.instant("aws.volumes.table.status."+item.status);
                    item.voltype =  item.storageInfo?item.storageInfo.disPlayName:"";
                    item._type=angular.copy(item.type);
                    if (item.description == null) {
                       item.description = '';
                    }else if(item.description == "auto-created_from_restore_from_backup"){
                        item.description = $translate.instant("aws.volumes.fromBackup");
                    }
                    if(angular.isArray(item.attachments) && item.attachments.length == 1 && item.attachments[0].device && item.attachments[0].device.slice(-2) == "da"){
                        item.root_device = true;
                    }
                })
                self.system_data = result.data.filter(volume => (volume.bootable && volume.root_device));
                self.system_data = self.system_data.filter(volume => (volume.imageMetadata.disk_format != "iso"));
                successFunc(self.system_data);
                
            }			
        });
    }

    self.resetVolumeStatus = function(obj) {
        if(!self.btn.resetVol) return;
        var content = {
            target: "resetVolumeStatus",
            msg: "<span>" + $translate.instant("aws.volumes.dv.confirmResetStatus") + "</span>",
            data: obj
        };
        self.$emit("delete", content);
    };
    self.$on("resetVolumeStatus", function(e,data) {
        volumesSrv.resetStatus(data.id).then(function(){
            self.getData();
        })
    });

    self.volume.initTablefunc = function(){
        self.getData()
    }

    $scope.$on("volumeSocket",function(e,data){
        if(self.system_data.length){
            self.system_data.map(function(obj){
                if(obj.id === data.eventMata.volume_id){
                    obj.status = data.eventMata.status;
                    if(obj.status == "deleted"){
                        _.remove(self.system_data,function(val){
                            return val.status =="deleted";
                        });
                    }
                }
            });
        }
        if(self.systemTableParams){
            self.systemTableParams.reload();
            self["checkboxes"+ "systemTableParams"].items={};
        }
        
    });
    self.$watch(function(){
        return self.checkedItemssystemTableParams;
    },function(values){
        self.tablchk(values)    
    })
    self.getData()
    
}
export {systemVolumesCtrl}
