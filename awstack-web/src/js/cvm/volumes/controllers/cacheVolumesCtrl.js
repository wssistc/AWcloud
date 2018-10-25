
import "../volumesSrv";
cacheVolumesCtrl.$inject=['$scope', "$rootScope", "volumesDataSrv", "$translate","NgTableParams","newCheckedSrv"];
function cacheVolumesCtrl($scope, $rootScope, volumesDataSrv,$translate,NgTableParams,newCheckedSrv){
    let self = $scope;
    self.context = self;
    self.table = {};
    self.btn.delisDisabled = true;
    self.menuGuide = [$translate.instant('aws.menu.System'),$translate.instant('aws.menu.System_Operation'),$translate.instant('aws.menu.System_Storage')];
    self.titleName="cacheVolumes";
    if(sessionStorage["cacheVolumes"]){
       self.tableCols=JSON.parse(sessionStorage["cacheVolumes"]);
    }else{
        self.tableCols = [
            { field: "check", title: "",headerTemplateURL:"cacheheaderCheckbox.html",show: true },
            { field: "name", title: self.headers.volumeName,sortable: "name",show: true,disable:true},
            { field: "size", title: self.headers.config,sortable: "size",show: true,disable:false},
            { field: "statusCopy", title: self.headers.status,sortable: "status",show: true,disable:true },
            { field: "voltype", title: self.headers.voltype,sortable: "voltype",show: true,disable:false },
            { field: "description", title: self.headers.description,sortable: "description",show: true,disable:false },
        ];
    }

    function successFunc(res){
		self.cache_data = self.configSearch(self.cache_data,self.tableCols);
        self.cacheTableParams = new NgTableParams({ count: 10 }, { counts: [], dataset: self.cache_data });
        newCheckedSrv.checkDo(self,"","id","cacheTableParams");
    };

    self.getData = function(){
        if(!localStorage.cinderService) return;
        volumesDataSrv.getVolumesTableData().then(function(result) {
            if(result && result.data && angular.isArray(result.data)){
                //过滤掉result.data中vol.instance="fixedImageInstanceName"的元素
                //result.data=result.data.filter(vol=>vol.instance[0]!="fixedImageInstanceName");
                result.data.map(item => {
                    item.statusCopy= $translate.instant("aws.volumes.table.status."+item.status);
                    item.multiattachCopy = $translate.instant('aws.volumes.table.multiattach.'+item.multiattach);
                    item.bootableCopy = $translate.instant('aws.volumes.table.bootable.'+item.bootable);
                    item.voltype =  item.storageInfo?item.storageInfo.disPlayName:"";
                    item._type=angular.copy(item.type);
                    if (item.description == null) {
                       item.description = '';
                    }else if(item.description == "auto-created_from_restore_from_backup"){
                        item.description = $translate.instant("aws.volumes.fromBackup");
                    }
                });
                self.cache_data = result.data.filter(item => ( item.metaData && (item.metaData.image_cache_name || item.metaData.glance_image_id)));
                self.cache_data.map(item => item.image_cache_name = item.metaData.image_cache_name);
                successFunc(self.cache_data);
                
            }			
        });
    }
    self.checkboxescacheTableParams = {
        checked:"",
        items:{}
    }
    
    self.$watch(function(){
        return self.checkboxescacheTableParams.items;
    },function(cacheData){
        if(!cacheData||!self.cache_data) return
        self.checkoutArry = []
        self.cache_data.forEach(function(item){
            for(let key in cacheData){
                if(key==item.id&&cacheData[key]){
                    self.checkoutArry.push(item)
                }
            }
        })
    },true)

    self.$watch(function(){
        return self.checkoutArry;
    },function(checkoutArry){
        if(!checkoutArry) return
        self.canDeleCache = true;
        self.btn.delisDisabled = false;
        self.btn.canDel = true;
        if(checkoutArry.length>0){
            self.canDeleCache = checkoutArry.some(function(item){
                return item.metaData&&item.metaData.glance_image_id
            })
        }
    },true)

    self.getData()
    self.volume.initTablefunc = function(){
        self.getData()
    }
    
}
export {cacheVolumesCtrl}
