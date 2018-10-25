import "./makeImageSrv";
import "../instances/instancesSrv";
var makeImageModule = angular.module("makeImageModule", ["ngTable", "ngAnimate", "ui.bootstrap", "ui.select","instancesSrv","makeImageSrvModule", "ngMessages"]);
makeImageModule.controller("makeImageCtrl", function($scope, $rootScope, NgTableParams, alertSrv, $location, $uibModal,makeImageSrv, instancesSrv,checkedSrv, $translate,GLOBAL_CONFIG) {
    var self=$scope;
    function canOPenConsole(editData){
        self.canConsole=false;
        self.consoleUrl = "";
        if(editData.osStatus!=2){
            self.canConsole=false;
        }else{
            instancesSrv.getServerDetail(editData.instanceId).then(function(res){
                if(res && res.data && editData.instanceId == res.data.uid){
                    if(self.checkedItems.length == 1){
                        self.canConsole = true;
                        instancesSrv.os_console(editData.instanceId).then(function(result) {
                            if(result&&result.data){
                                self.consoleUrl = result.data;
                            }  
                        });
                    }else{
                        self.canConsole = false;
                    }
                    self.vmstatus = res.data.status;
                }else{
                    self.canConsole = false;
                }
            })
        }
    }
    function canUploadImage(editData){
        self.canUpload=true;
        if(editData.osStatus!=2){
            self.canUpload=false;
        }
    }
    function canDelFunc(editData){
        self.canDel=false;
        if(editData.osStatus==2||editData.osStatus==3||editData.osStatus==4 ||editData.osStatus==6 ||editData.osStatus==7){
            self.canDel=true;
        }
    }
    function successFunc(data) {
        data.forEach(item=>{
            item.searchTerm =[item.imageName,item.osType,item.isPrivate?'是':'否',$translate.instant("aws.makeImage.osStatus."+item.osStatus)].join('\b');
        })
        self.tabledata = data;
        self.tableParams = new NgTableParams({ count: GLOBAL_CONFIG.PAGESIZE }, { counts: [], dataset: self.tabledata });
        self.applyGlobalSearch = function() {
            var term = self.globalSearchTerm;
            self.tableParams.filter({ searchTerm: term });
        };
        var tableId = "id";
        /*每次获取列表后置空选项，否则会记住上次选中的控制台打开错误*/
        self.checkedItems=[]
        checkedSrv.checkDo(self, data, tableId);
        self.$watch(function() {
            return self.checkedItems;
        }, function(values) {
            //判断按钮的可用性
            if(!values) return;
            if(values.length!=1){
                self.canConsole=false;
                self.canUpload=false;
                self.canDel=false;
            }if(values.length==1){
                canOPenConsole(values[0]);
                canUploadImage(values[0]);
                canDelFunc(values[0]);
            }
        });
    }
    function initImagesTable() {
        if(!self.services.cinder) return;
        makeImageSrv.getImageDefs().then(function(result){
            if(result&&result.data){
                successFunc(result.data);
            }
            result?self.loadData = true:"";
        });   
    }
    initImagesTable();
    self.delImage = function(data) {
        var content = {
            target: "delImage",
            msg: "<span>" + $translate.instant("aws.img.confirmDelete") + "</span>",
            data: data
        };
        self.$emit("delete", content);
    };
    self.$on("delImage", function(e,data) {
        makeImageSrv.delImage(data).then(function() { 
            initImagesTable(); 
        });
    });
    //刷新镜像列表
    self.refreshImages=function(){
        initImagesTable();
    };
    self.newImage = function() {
        let templateUrl = localStorage.cinderService ? "newImage.html":"js/cvm/volumes/tmpl/addVolumeTip.html";
        let imageController=localStorage.cinderService?"imageController":"";
        $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: templateUrl,
            controller: imageController,
            resolve: {
                initImagesTable: function() {
                    return initImagesTable;
                }
            }
        });
    };
    //打开控制台
    self.openConsole = function(editData,status) {
        if(status == "ACTIVE" && self.consoleUrl){
            window.open(self.consoleUrl, "Console", "height=1000,width=1100,top=20,left=20,toolbar=yes,menubar=no,scroll");
        }else if(status == "SHUTOFF"){
            self.bootBeforeopenConsole(editData)
        }
        
        
    };
    self.bootBeforeopenConsole = function(editData){
        var content = {
            target: "boot",
            msg: "<span>" + "虚拟机未开机,请先开机" + "</span>",
            data: editData,
            type: "info",
            btnType: "btn-primary"
        };
        self.$emit("delete", content);
    }

    self.$on("boot", function(e,data) {
        var post = { ids: [data.instanceId] }
        var  ids = post.ids;
        checkedSrv.setChkIds(ids,"power_on");
        self.checkboxes.items={};
        instancesSrv.startServer(post).then(function(){
            self.canConsole=false;
        });
    });

    self.uploadImage = function(editData) {
        var content = {
            target: "upload",
            msg: "<span>" + $translate.instant("aws.makeImage.confirmUpoad") + "</span>",
            data: editData,
            type: "info",
            btnType: "btn-primary"
        };
        self.$emit("delete", content);
    };
    self.$on("upload", function(e,data) {
        self.ADMIN?"":data.isPrivate = true;
        self.canUpload = false;
        makeImageSrv.uploadImage(data).then(function(){
            //self.checkboxes.items={};
            initImagesTable();
        });
    });
    $scope.$on("makeImageSocket",function(e,data){
        //var tipMsg = data.resourceName + $translate.instant("aws.sockets.opLog."+ data.eventType);
        var tipMsg = "云主机" + $translate.instant("aws.sockets.opLog."+ data.eventType);
        alertSrv.set(data.requestId, tipMsg , "building",5000);
        var putParmas={
            "instanceId":data.eventMata.instance_id,
            "osStatus":2
        };
        makeImageSrv.updateImage(putParmas).then(function(result){
            if(result){
                initImagesTable();
            }
        });
    });
    self.$on("serverSocket", function(e, data) {
        if (self.tabledata && self.tabledata.length) {
            self.tabledata.map(function(obj) {
                if (data.eventMata.instance_id) {
                    if (data.eventType == "compute.instance.create.end" && 
                        obj.instanceId === data.eventMata.instance_id) {
                        obj.osStatus = 2;
                        initImagesTable();
                    }
                }

                
            });
            self.tableParams.reload();
        }
    });
});
makeImageModule.controller("imageController",function($scope,$rootScope,$translate,$uibModalInstance,makeImageSrv,imagesSrv,instancesSrv,initImagesTable,dataclusterSrv){
    var self = $scope;
    imageCtrlFunc($scope,$rootScope,$translate,makeImageSrv,imagesSrv,instancesSrv,dataclusterSrv)
    self.createImage=function(){
        if(JSON.stringify(self.iso) == "{}"){
            self.checkISO=true;
        }else{
            self.checkISO=false; 
        }
        if (self.imageForm.$valid&&!self.checkISO) {
            $uibModalInstance.close();
            self.postParams.source_image_id=self.iso.imageUid;
            _.forEach(self.selectedDisks,function(disk){
                self.postParams.attach_iso.push(disk.imageUid);
            });
            if(self.isWin2003 && self.haveOtherSoftDisk){
                _.forEach(self.soft.selectedSoftDisks,function(disk){
                    self.postParams.attach_soft_iso.push(disk.imageUid);
                });
            }else{
                 self.postParams.attach_soft_iso = [];
            }
            
            self.postParams.disk_size=Number(self.postParams.disk_size);

            makeImageSrv.createImage(self.postParams).then(function(){
                initImagesTable();
            });
        }else{
            self.submitted = true;
        }  
    };
});
function imageCtrlFunc($scope,$rootScope,$translate,makeImageSrv,imagesSrv,instancesSrv,dataclusterSrv){
    var self=$scope;
    self.submitted = false;
    self.images = {
        maxSize :200
    };    
    getNodes();
    function getNodes(){
        var regionUid=JSON.parse(localStorage.$LOGINDATA).regionUid;
        dataclusterSrv.getAllNode(regionUid).then(function(res){
            if(res && res.data && angular.isArray(res.data)){
                res.data.map(item => {
                    item.hostInfo = JSON.parse(item.hostInfo)
                    if(item.hostInfo && item.hostInfo.var_data_size<300 ){
                        self.images.maxSize = 50;
                    }
                })
            }
        })
    }
    self.interacted = function(field) {
        return self.submitted || field.$dirty;
    };
    self.postParams={
        is_private:false,
        os_type:"",
        os_distro:"",
        os_version:"",
        name:"fixedImageInstanceName",
        image_name:"",
        source_image_id:"",
        flavor:"",
        disk_size:"",
        attach_iso:[],
        attach_soft_iso:[],
        network_id:""
    },
    self.ADMIN?"":self.postParams.is_private = true;

    self.haveOtherDisk=false;
    self.selectedDisks=[];
    self.soft = {
        selectedSoftDisks:[]
    };
    //操作系统数组
    self.osDistroList=[];
    self.isoList1=[];
    self.isoList2=[];
    self.isoList3=[];
    self.iso={};
    //系统类型数组
    self.osTypeList=[];
    self.os_distro_type={}
    makeImageSrv.getOSversion().then(function(result){
        if(result&&result.data){
            _.forEach(result.data,function(os){
                //系统数组
                self.osTypeList.push(os);
            });
        }
        if(self.osTypeList.length>0){
            //系统初始选择
            self.os_distro_type.os_type=self.osTypeList[0];
            //os-type初始选择
            self.postParams.os_type=self.os_distro_type.os_type.paramName;
            var osDistroArray=self.osTypeList[0].paramValue.split(",");
            _.forEach(osDistroArray,function(osDistro){
                //操作系统版本数组
                self.osDistroList.push({id:"",name:osDistro});
            });
            if(self.osDistroList.length>0){
                //version初始选择
                self.os_distro_type.os_distro=self.osDistroList[0];
                self.postParams.os_distro=self.os_distro_type.os_distro.name;
            }
            
            if(self.os_distro_type.os_distro.name.indexOf("Windows Server 2003")>-1){
                self.isWin2003 = true;
                self.changeSoftDisk([]);
            }else{
                self.soft.selectedSoftDisks=[];
                self.isoList4 = [];
                self.isWin2003 = false;
            }
        }    
    });
    self.changeOSType=function(os,init){
        self.isoListData=[];
        self.isoListData=self.isoList1.filter(function(image){
            if(image.os_type==os.paramName){
                return image;
            }
        });
        if(self.isoListData.length>0){
            //iso初始选择
            self.iso=self.isoListData[0];
            self.isoList2=angular.copy(self.isoList3);
            filterISo("isoList2",[self.iso]);
            self.checkISO=false;
        }else{
            self.os_distro_type.os_distro={};
            self.postParams.os_distro="";
            self.iso={};
            if(!init){
               self.checkISO=true; 
            }
        }
        self.postParams.os_type=os.paramName;
        var osDistroArray=os.paramValue.split(",");
        self.osDistroList=[];
        _.forEach(osDistroArray,function(version){
            //osDistroList数组
            self.osDistroList.push({id:"",name:version});
        });
        if(self.osDistroList.length>0){
            //osDistro初始选择
            self.os_distro_type.os_distro=self.osDistroList[0];
            self.postParams.os_distro=self.os_distro_type.os_distro.name;
        }else{
            self.os_distro_type.os_distro={};
            self.postParams.os_distro="";
        }

        if(self.os_distro_type.os_distro.name.indexOf("Windows Server 2003")>-1){
            self.isWin2003 = true;
            self.changeSoftDisk([]);
        }else{
            self.soft.selectedSoftDisks=[];
            self.isoList4 = [];
            self.isWin2003 = false;
        }
        
    };
    self.changeOS=function(os_distro){
        self.isWin2003 = false;
        self.postParams.os_distro=os_distro.name;
        if(os_distro.name.indexOf("Windows Server 2003")>-1){
            self.isWin2003 = true;
            self.changeSoftDisk([]);
        }else{
            self.soft.selectedSoftDisks=[];
            self.isoList4 = [];
        }
    };

    //获取ISO
    imagesSrv.getImages().then(function(result) {
        if(result&&result.data){
            //系统盘列表
            self.isoList1=result.data.filter(function(image){
                if((image.disk_format=="ISO"||image.disk_format=="iso") && image.status=="active"){
                    return image;
                }
            });
            self.changeOSType(self.os_distro_type.os_type,true)
            //附加盘列表
            self.isoList2=result.data.filter(function(image){
                if((image.disk_format=="ISO"||image.disk_format=="iso") && image.status=="active"){
                    return image;
                }
            });
            //备用
            self.isoList3=result.data.filter(function(image){
                if((image.disk_format=="ISO"||image.disk_format=="iso") && image.status=="active"){
                    return image;
                }
            });
            if (self.isoList1.length>0) {
                //self.iso=self.isoList1[0];
                self.isoList2=angular.copy(self.isoList3);
                filterISo("isoList2",[self.iso])
            }
        }
    });
    
    //监听iso变化，当系统盘变化时，可选附加盘列表也发生变化
    self.changeISO=function(iso){
        self.iso=iso;
        self.isoList2=angular.copy(self.isoList3);
        self.isoList4=angular.copy(self.isoList3);
        filterISo("isoList2",[...self.soft.selectedSoftDisks,self.iso])
        filterISo("isoList4",[...self.selectedDisks,self.iso])
    };
    
    //获取网络
    self.networkList=[];
    self.network={};
    makeImageSrv.getNetwork().then(function(result){
        if(result&&result.data){
            self.networkList=result.data.filter(function(net){
                if(net.subnets.length>0){
                    return net;
                }
            });;
        }
        if(self.networkList.length>0){
            self.network=self.networkList[0];
            self.postParams.network_id=self.network.id;
        }
    });
    self.changeNet=function(net){
        self.postParams.network_id=net.id;
    };
    //获取flavor
    self.configList=[];
    self.config={};
    instancesSrv.getFlavors().then(function(result) {
        if(result&&result.data){
            _.forEach(result.data, function(val) {
                val.text = val.name+ ": "+val.vcpus  +$translate.instant("aws.instances.conf.memtip") + (val.ram/1024).toFixed(2) ;
                if(!val.local){
                   self.configList.push(val);
                }
            });
        }
        if(self.configList.length>0){
            self.config=self.configList[0];
            self.postParams.flavor=self.config.id;
        }
    });
    self.changeConfig=function(config){
        self.postParams.flavor=config.id;
    };
    //是否添加附加盘
    self.haveDisk=function(){
        if(!self.haveOtherDisk){
            self.selectedDisks=[];  
        } 
    };
    //是否添加附加盘
    self.haveSoftDisk=function(){
        if(!self.haveOtherDisk){
            self.soft.selectedSoftDisks=[];  
        }
    };

    function filterISo(isoList,disk){
        disk.map(item =>{
            self[isoList] = self[isoList].filter(iso => iso.imageUid != item.imageUid)
        })
    }
    
    //监听附加盘列表的变化，当其变化时系统盘列表也发生变化
    self.changeDisk=function(disk){
        self.selectedDisks=disk;
        self.isoList1=angular.copy(self.isoList3);
        self.isoList4=angular.copy(self.isoList3);
        self.soft.selectedSoftDisks?"":self.soft.selectedSoftDisks = [];
        filterISo("isoList1",[...disk,...self.soft.selectedSoftDisks])
        filterISo("isoList4",[...disk,self.iso])
        if(disk.length == 2){
            self.isoList2 = []
        }else{
            self.isoList2=angular.copy(self.isoList3);
            filterISo("isoList2",[...self.soft.selectedSoftDisks,self.iso])
        }
    };
    self.changeSoftDisk =function(disk){
        if(disk && disk.length == 4){
            self.isoList4 = []
        }else if(disk){
             self.isoList1=angular.copy(self.isoList3);
             self.isoList2=angular.copy(self.isoList3);
             self.isoList4=angular.copy(self.isoList3);
             filterISo("isoList1",[...disk,...self.selectedDisks])
             filterISo("isoList2",[...disk,self.iso])
             filterISo("isoList4",[...self.selectedDisks,self.iso])
            
            
        }
    }
    
    
}
export {
    imageCtrlFunc
}