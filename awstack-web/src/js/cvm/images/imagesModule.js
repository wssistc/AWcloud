import "./imagesSrv";
import "../instances/instancesSrv";
import "../../overview/overviewSrv"
//import "./makeImageSrv";

angular.module("imagesModule", ["ngSanitize", "ngTable", "ui.bootstrap.tpls", "imagesSrv", "makeImageSrvModule","instancesSrv", "ui.select","aggregatesSrvModule"])
.controller("ImagesCtrl", ["$scope","$location","$window","$filter","$timeout", "$rootScope","NgTableParams", "$uibModal", "$routeParams","imagesSrv",
"makeImageSrv",  "backendSrv","alertSrv", "checkedSrv","GLOBAL_CONFIG","$translate","dataclusterSrv",
    function($scope,$location,$window,$filter,$timeout, $rootScope, NgTableParams, $uibModal, $routeParams, imagesSrv,makeImageSrv, backendSrv, alertSrv,
        checkedSrv,GLOBAL_CONFIG,$translate,dataclusterSrv) {
    var self = $scope;
    self.context = self;
    self.isDisabled = true;
    self.maxSizeLimit = false;
    //self.delisDisabled = true;
    getNodes();
    function getNodes(){
        var regionUid=JSON.parse(localStorage.$LOGINDATA).regionUid;
        dataclusterSrv.getAllNode(regionUid).then(function(res){
            if(res && res.data && angular.isArray(res.data)){
                res.data.map(item => {
                    item.hostInfo = JSON.parse(item.hostInfo)
                    if(item.hostInfo && item.hostInfo.var_data_size<300 ){
                        self.maxSizeLimit = true;
                    }
                })
            }
        })
    }
    function canDelete(obj){
        self.canDelete=true;
        if(obj.status=="QUEUED"||obj.status=="SAVING" || obj.is_protected == true){
            self.canDelete=false;
        }
        if(obj.is_public && !self.ADMIN){
            self.canDelete=false;
        }
        //系统默认镜像(一定是公有)
        if(obj.name=='SystemCheck'){
            self.isDelDefaultImg=true;
            self.canDelete=false;
        }
    }
    function canEdit(obj){
        self.canEdit=true;
        if(obj.is_public && !self.ADMIN){
            self.canEdit=false;
            self.cannotEditTip = $translate.instant('aws.popover.image.tip1');
            return;
        }
        if(obj.name=='SystemCheck'){
            self.cannotEditTip = $translate.instant('aws.popover.image.tip4');
            self.canEdit=false;
            return;
        }
        // if(self.maxSizeLimit){
        //     self.cannotEditTip = $translate.instant('aws.popover.image.tip6');
        //     self.canEdit=false;
        //     return;
        // }
    }
    function canAddVm(obj){
        if(obj.disk_format=='iso'|| obj.status.toLowerCase() != 'active'|| !obj.canUse){
            self.canAddVm=false;
        }else{
            self.canAddVm=true;
        }
    }

    self.headers = {
        name:$translate.instant("aws.img.img_name"),
        os:$translate.instant('aws.instances.addinstances.os'),
        system_type:$translate.instant('aws.img.system_type'),
        type:$translate.instant('aws.img.type'),
        public:$translate.instant('aws.img.public'),
        architecture:$translate.instant('aws.img.architecture'),
        disk_format:$translate.instant('aws.img.disk_format'),
        status:$translate.instant('aws.img.status'),
        created_at:$translate.instant('aws.img.created_at'),
    }

    self.titleName="images";
    if(sessionStorage["images"]){
        self.tableCols=JSON.parse(sessionStorage["images"]);
    }else{
         self.tableCols = [
             { field: "check", title: "",headerTemplateURL:"headerCheckbox.html",show: true },
             { field: "name", title: self.headers.name,sortable: "name",show: true,disable:true},
             { field: "_os_type", title: self.headers.os,sortable: "_os_type",show: true,disable:false},
             { field: "os", title: self.headers.system_type,sortable: "os",show: true,disable:false},
             { field: "image_type", title: self.headers.type,sortable: "image_type",show: true,disable:false},
             { field: "public_ori", title: self.headers.public,sortable: "public_ori",show: true,disable:false},
             { field: "arch_ori", title: self.headers.architecture,sortable: "arch_ori",show: true,disable:false},
             { field: "disk_format", title: self.headers.disk_format,sortable: "disk_format",show: true,disable:false},
             { field: "status_ori", title: self.headers.status,sortable: "status_ori",show: true,disable:false},
             { field: "create_at", title: self.headers.created_at,sortable: "create_at",show: true,disable:false},
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

    function getImages() {
        self.globalSearchTerm = "";
        imagesSrv.getImages().then(function(data) {
            if(data&&data.data){
                tableResize(data.data)
                successFunc(data.data);
            }
            data?self.loadData = true:"";
        });
    }
    //删除数组中的某个元素
    Array.prototype.removeImageUid = function(val) {
        var index = this.indexOf(val);
        if (index > -1) {
            this.splice(index, 1);
        }
    };
    //判断定时器是否在启动中。
    //记录每条数据轮询时间对象最长轮询25分钟。
    self.resizeNum={};
    self.timerStart=false;
    function tableResize(data){
        //需要轮询的数组列表               
        self.resizing = [];
        data.map(x => {
            if(x.status == "saving"||x.status == "queued"){
                self.resizing.push(x.imageUid)
            }
        })
        if(self.resizing.length>0){
            //时间重置
            if(JSON.stringify(self.resizeNum) == "{}"){
                self.resizing.map(id => {self.resizeNum[id]=1})
            }
            if(!self.timerStart){
                var options={
                    'imageUids':self.resizing
                }
                /*镜像状态更新轮询*/
                $window.IntervalImageResize(options);
            }
            
        }
    }     
    $window.IntervalImageResize = function(options){
        var timer = $timeout(function(){
            self.timerStart=true;
            imagesSrv.getStatus(options).then(function(result) {
                if(result && result.data && result.data.length){
                    result.data.forEach(function(item){
                        //有数据异常数据（可能有其他用户删除了正在保存数据）
                        if(item.status == null){
                            self.resizing.removeImageUid(item.imageUid);
                            self.tabledata.map(function(obj){
                                if(obj.imageUid == item.imageUid){
                                    self.tabledata.removeImageUid(obj);
                                }
                            })
                            successFunc(self.tabledata)
                        }else if(item.status == "active"){
                            self.resizing.removeImageUid(item.imageUid);
                            self.tabledata.map(function(obj){
                                if(obj.imageUid == item.imageUid){
                                    obj.status = item.status;
                                    obj.status_ori = $translate.instant("aws.img.table.status."+obj.status);
                                    obj.searchTerm = [obj.name,obj._os_type, obj.os,obj.image_type, obj.public_ori, obj.arch_ori, obj.disk_format, obj.status_ori, obj.create_at, obj.canUse_ori].join("\b");
                                }
                            })  
                        }
                        
                        //轮询一次记录时间更改。
                        if(self.resizeNum[item.imageUid]){
                            self.resizeNum[item.imageUid]=self.resizeNum[item.imageUid]+1;
                        }else{
                            self.resizeNum[item.imageUid]=1;
                        }
                        
                        //当一个镜像在上传过程中荡掉。让这条数据轮询最多25分钟关闭。
                        if(self.resizeNum[item.imageUid]>151){
                            self.resizing.removeImageUid(item.imageUid)
                        }
                    })
                    
                }
                    
                  
            }).finally(function(){
                //轮询时可能有的数据已经恢复正常,参数重置。
                if(self.resizing.length>0){
                    var options={
                        'imageUids':self.resizing
                    }
                    $window.IntervalImageResize(options);
                }else{
                    self.timerStart=false;
                    $timeout.canel(timer);
                }
            })
        
        },10000)  
    }
    $scope.refreshImages=function(){
        getImages();
    };
    $scope.$on("getDetail", function(event, value) {
        imagesSrv.getImagesDetail(value).then(function(data) {
            if($routeParams.id!=value){return;}
            data.data.status=data.data.status.toLowerCase();
            if(data.data.os=="Unknown"){
                data.data.os="";
            }
            $scope.detailData = data.data;
            $scope.detailData.hw_vif_multiqueue_enabled = 
                $scope.detailData.hw_vif_multiqueue_enabled ? $translate.instant("aws.action.enabled") : $translate.instant("aws.action.close");
            $scope.detailData.hw_boot_menu = 
                $scope.detailData.hw_boot_menu ? $translate.instant("aws.action.enabled") : $translate.instant("aws.action.close");
            $scope.detailData.hw_qemu_guest_agent = 
                $scope.detailData.hw_qemu_guest_agent ? $translate.instant("aws.action.enabled") : $translate.instant("aws.action.close");
                
            $scope.detailData.size = $scope.detailData.size || 0;
            if($scope.detailData.os_type){
                $scope.detailData.os_type = $scope.detailData.os_type.toLowerCase();
            }
            
            
            if($scope.detailData.true_size>1){
                $scope.detailData.true_size=$scope.detailData.true_size.toFixed(2)+" GB";
            }else{
                $scope.detailData.true_size=(($scope.detailData.true_size)*1024).toFixed(2)+" MB";
            }
            
        });
    });
    //云主机备份、制作镜像后更新列表状态
    $rootScope.$on("serverSocket",function(e,data){
        if(data.eventType == "compute.instance.snapshot.start" || data.eventType == "compute.instance.snapshot.end"){
            getImages();
        }
    });

    function successFunc(data) {
        data.map(function(item){
            if(item.os){
                if((item.os).toLowerCase()=="unknown"){
                    item.os="";
                    item.os_type="";
                } 
            }
            if(item.os_type!=null&&item.size!=null && item.arch != null){
                if(((item.os_type).toLowerCase()=='windows'||(item.os_type).toLowerCase()=="linux")&&(item.size!=0) && (item.arch =="x86_64" || item.arch =="i686" )){
                    item.canUse=true;
                    item.tip_message="";
                }else{
                    item.canUse=false;
                    item.tip_message=$translate.instant("aws.img.tip_message");
                }
            }else{
                item.canUse=false;
                item.tip_message=$translate.instant("aws.img.tip_message");
            }
            
            item.status = item.status.toLowerCase();
            item.arch_ori = item.arch?$translate.instant("aws.img.arch."+item.arch):'';
            item.status_ori = $translate.instant("aws.img.table.status."+item.status);
            item.public_ori = $translate.instant("aws.img.table.is_public."+item.is_public);
            item.canUse_ori = $translate.instant("aws.img.table.is_public."+item.canUse);
	        item.create_at = $filter("date")(item.create_at, "yyyy-MM-dd HH:mm:ss");	
            item.os_type = item.os_type?item.os_type.toLowerCase():"";
            item._os_type = item.os_type?$translate.instant("aws.img.osType." + item.os_type):"";
            // item.searchTerm = item.name +item.image_type + item.public_ori + item.os + item.release + item.arch + item.is_protected + item.disk_format + item.create_at +item.status_ori;
            item.searchTerm = [item.name,item._os_type, item.os,item.image_type, item.public_ori, item.arch_ori, item.disk_format, item.status_ori, item.create_at, item.canUse_ori].join("\b");
        });
        self.tabledata = self.configSearch(data,self.tableCols);
        self.tableParams = new NgTableParams({ count: GLOBAL_CONFIG.PAGESIZE }, { counts: [], dataset: data });
        var tableId = "imageUid";
        checkedSrv.checkDo(self, data, tableId);
    }
    self.$watch(function() {
        return self.checkedItems;
    }, function(values) {
        self.isDelDefaultImg=false;
        self.isEditDefaultImg=false;
        self.canEdit = false;
        self.canAddVm=false;
        if(!values) return;
        if(values.length==0){
            self.canDelete = false;
        }
        
        if (values.length == 1) {
            canDelete(values[0]);
            canEdit(values[0]);
            canAddVm(values[0])
        } else if (values.length > 1) {
            for (var i = 0; i < values.length; i++) {
                canDelete(values[i]);
                if (self.canDelete == false) {
                    self.canDelete = false;
                    break;
                }
            }
        }
    });
    /*获取可用缓存空间*/
    function getBuffer(){
        imagesSrv.getBuffer().then(function(res){
            if(res&&res.data){
                self.bufferSpaces = res.data.freeSpace/1024/1024/1024;
                self.bufferSpace = (res.data.freeSpace/1024/1024).toFixed(2) +'MB'
            }
        })
    }
    getBuffer()
    /*清除缓存空间*/
    self.clearSpace = function() {
        var content = {
            target: "clearSpace",
            msg: "<span>" + $translate.instant("aws.img.clear_space_msg") + "</span>",
        };
        self.$emit("delete", content);
    };
    self.$on("clearSpace", function() {
        imagesSrv.delBuffer().then(function(res){
            if(res){
                getBuffer()
            }
        })
    });


    self.updateImages = function(type, editData,maxSizeLimit) {
        if(type == "edit" && !self.canEdit){
            return;
        }
        var scope = $rootScope.$new();
        scope.submitInValid = false;
        scope.images = {};
        scope.maxSizeLimit = maxSizeLimit;
        if(!maxSizeLimit){
            scope.images.maxSize = 200;
        }else{
            scope.images.maxSize = 50;
        }
        scope.maxSize
        scope.interacted = function(field) {
            return scope.submitInValid || field.$dirty;
        };
        scope.submitInValid=false;
        //初始可选择文件
        self.cant_select_file=false;
        //禁止按钮二次点击
        scope.can_double_click=true;
        //选择镜像上传方式
        getBuffer();
        if(scope.ADMIN){
            scope.source_type_list=[{id:"1",name:$translate.instant("aws.img.uploadhttp")},{id:"2",name:$translate.instant("aws.img.uploadfile")}];
        }else{
            scope.source_type_list=[{id:"1",name:$translate.instant("aws.img.uploadhttp")}];
        }
        scope.source_type=scope.source_type_list[0];
        scope.showFile=false;
        scope.change_source_type=function(obj){
            scope.source_type=obj;
            if(obj.id==1){
                scope.showFile=false;
                scope.fileSizeinvalidate = false;
            }else{
                scope.showFile=true;
                if(document.getElementById("upload").value){
                    scope.fileSize<=10?scope.fileSizeinvalidate = false: scope.fileSizeinvalidate = true;
                }
            }
        }


        scope._self = scope;
        scope.disk_format = [
            { "id": 1, "text": "raw" },
            { "id": 2, "text": "qcow2" },
            { "id": 3, "text": "iso" }
        ];
        if(localStorage.permission == "stand"){
            scope.disk_format = [
                { "id": 1, "text": "raw" },
                { "id": 2, "text": "qcow2" },
            ];
        }
        scope.arch = [
            {id: 1,text: "i686"},
            { id: 2, text: "x86_64"}
            
        ];
        /*scope.options = {
            disk_format: "qcow2",
            arch: "x86_64"
        };*/
        scope.chooseDisk = function(item) {
            scope.options.disk_format = item.text;
        };
        scope.chooseArch = function(item) {
            scope.options.arch = item.text;
        };

        scope.busTypeList = [
            {
                id:"virtio",
                name:"virtio"
            }, { 
                id:"scsi",
                name:"scsi"
            }, {
                id:"ide",
                name:"ide"
            }];
        scope.videoModelList = [
            {
                id:"virtio",
                name:"virtio"
            }, { 
                id:"e1000",
                name:"e1000"
            }, {
                id:"rtl8139",
                name:"rtl8139"
            }];
        scope.vifModelList = [
            {
                id:"vga",
                name:"vga"
            }, { 
                id:"qxl",
                name:"qxl"
            }/*, {
                id:"vmvga",
                name:"vmvga"
            }*/];
        scope.busType = scope.busTypeList[0];
        scope.videoModel = scope.videoModelList[0];
        scope.vifModel = scope.vifModelList[0];
        scope.seniorStatus = {
            BIOSmenu : "false",
            qemu : "false",
            videoQueue : "false",
            diskCtrl : "false"
        }
        scope.diskCtrlShow = true;
        scope.videoQueueShow = true;
        scope.changeBusType = function(obj) {
            scope.busType = obj;
            if(obj.id == "virtio") {
                scope.diskCtrlShow = true;
            } else {
                scope.diskCtrlShow = false;
            }
        }
        scope.changeVideoModel = function(obj) {
            scope.videoModel = obj;
            if(obj.id == "virtio") {
                scope.videoQueueShow = true;
            } else {
                scope.videoQueueShow = false;
            }
        }
        scope.changeVifModel = function(obj) {
            scope.vifModel = obj;
        }

        scope.versionList=[];
        scope.os={};
        //系统类型。linux or windows
        scope.osTypeList=[];
        //详细的系统
        scope.osDistroList=[];
        scope.os_type="";
        scope.os_distro="";
        makeImageSrv.getOSversion().then(function(result){
            if(result&&result.data){
                _.forEach(result.data,function(os){
                    //系统数组
                    os.dataName_t = $translate.instant("aws.img.osType." + os.paramName.toLowerCase()) 
                    scope.osTypeList.push(os);
                });
            }
            if(scope.osTypeList.length>0){
                //系统初始选择
                if(editData){
                    scope.osTypeList.forEach(function(item,index){

                        if(item.paramName==editData.os_type){

                            scope.os_type=scope.osTypeList[index];
                            var osDistroArray=item.paramValue.split(",");
                            _.forEach(osDistroArray,function(osDistro){
                                //操作系统版本数组
                                scope.osDistroList.push({id:"",name:osDistro});
                            });
                            return;
                        }
                    })
                    if(scope.osDistroList.length>0){
                    //version初始选择
                        scope.osDistroList.forEach(function(item,index){
                            if(editData && (item.name).toLowerCase()==(editData.os).toLowerCase()){
                                scope.os_distro=scope.osDistroList[index];
                                return;
                            }
                        });
                    }
                }else{
                    scope.os_type = scope.osTypeList[0];
                    scope.changeOSType(scope.os_type);
                    //scope.os_distro=scope.osDistroList[0];
                }
                judge_type();
                
            }             
        });
        scope.changeOSType=function(os){
            scope.os_type=os;
            var osDistroArray=os.paramValue.split(",");
            scope.osDistroList=[];
            _.forEach(osDistroArray,function(version){
                //osDistroList数组
                scope.osDistroList.push({id:"",name:version});
            });
            if(scope.osDistroList.length>0){
                //osDistro初始选择
                scope.os_distro=scope.osDistroList[0];
            }
        };
        scope.changeOS=function(os_distro){
            scope.os_distro=os_distro;
        };
        /*检测上传镜像的名字是否小于255字节*/
        scope.checkNameFun=function(name){
            var nameReg = /^(\w|[\u4E00-\u9FA5]|\-|\.)*$/;
            var nameStrReg = /^[\u4E00-\u9FA5]$/
            var nameStr="";
            if(nameReg.test(name)&&name!=undefined){
                var num = 0;
                for(var i=0;i<name.length;i++){
                    nameStr=name.charAt(i)
                    if(nameStrReg.test(nameStr)){
                        num+=3;
                    }else{
                       num++; 
                    }
                }
                if(num<=255){
                    scope.nameCheck=false;
                }else{
                    scope.nameCheck=true;
                }
            }else{
                scope.nameCheck=false;
            }
        }
        var modalImage = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: "updateimages.html",
            scope: scope
        });
        function judge_type(){
            //判断是否在上传镜像的状态。
            scope.upDataUpFlag = false;
            //提示消息
            scope.tipCheck = false;
            scope.canelUpdataImage = function(){
                if(scope.upDataUpFlag){
                    if(scope.tipCheck){
                       modalImage.close();
                    }
                    scope.tipCheck = true;
                }else{
                    modalImage.close();
               }
            }
            switch (type) {
                case "new":
                    scope.options = {
                        disk_format: "qcow2",
                        arch: "x86_64"
                    };
                    scope.hideSome = false;
                    scope.imageTitle = $translate.instant("aws.img.upload_image");
                    scope.upImage = {};
                    scope.upImage.disk_format = "iso";
                    scope.upImage.architecture = "x86_64";
                    scope.upImage.is_public=false;
                    if(localStorage.permission =="stand"){
                        scope.upImage.is_public = true;
                    }
                    $('#upload').on('change',function(){
                        scope.selected_file = document.getElementById("upload").value;
                        let dom = document.getElementById("upload");
                        let fileSize = 0;
                        dom.files[0] ? fileSize = dom.files[0].size:scope.selected_file="";  
                        scope.fileSize = Math.ceil(fileSize/1024/1024/1024);
                        scope.fileSize<=10?scope.fileSizeinvalidate = false: scope.fileSizeinvalidate = true;
                        scope.fileSize<self.bufferSpaces?scope.fileSizeinvalidate = false: scope.fileSizeinvalidate = true;
                        scope.$apply();
                    })
                    scope.uploadData={
                        title:$translate.instant("aws.img.progress"),
                        beAdded:0,
                        total:1,
                        inUsed:0
                    }
                    scope.$watch(function(){
                        return scope.showFile
                    },function(value){
                        if(value){
                            scope.selected_file = document.getElementById("upload").value;
                        }else{
                            scope.selected_file="123";
                        }
                    })
                    //判断是否在上传镜像的状态。
                    scope.upDataUpFlag = false;
                    //提示消息
                    scope.tipCheck = false;
                    scope.canelUpdataImage = function(){
                        if(scope.upDataUpFlag){
                            if(scope.tipCheck){
                               modalImage.close();
                            }
                            scope.tipCheck = true;
                        }else{
                            modalImage.close();
                       }
                    }
                    scope.confirmImage = function(pro,imageName){
                        if(imageName.$valid&&!scope.nameCheck){
                            scope.can_double_click=false;
                            scope.show_progress=true;
                            if(scope.showFile){
                            var content = {
                                target: "newWindows",
                                msg: "<dl class='new-windows'>"+
                                        "<dt><i class='icon-aw-prompt2'></i></dt>"+
                                        "<dd>"+$translate.instant("aws.img.uploadtips")
                                            +
                                        "</dd>"+
                                    "</dl>",
                                btnType:'btn-primary'
                            };
                            self.$emit("delete", content);
                            self.$on("newWindows", function() {
                                window.open($location.$$absUrl);  
                            });
                            scope.upDataUpFlag=true;
                            var tokenValue = localStorage.$AUTH_TOKEN;
                            $window.updataImageInterval = function(){
                                var headers={};
                                headers['X-Auth-Token']=tokenValue;
                                $timeout(function(){
                                    if(scope.upDataUpFlag){
                                        imagesSrv.getBufferPolling(headers).then(function(res){
                                            if(res&&res.data){
                                                self.bufferSpace = (res.data.freeSpace/1024/1024).toFixed(2)+'MB'
                                            }
                                        }).finally(function(){
                                            $window.updataImageInterval();
                                        }) 
                                    }
                                },20000)
                            }
                            $window.updataImageInterval()
                            scope.cant_select_file=true;
                            var file = document.getElementById("upload").files[0];
                            var imageName= scope.upImage.name;
                            //使用FormData对象上传文件
                            var form = document.forms.namedItem("imageForm");
                            var oData = new FormData(form);
                            oData.append("disk_format",scope.options.disk_format);
                            oData.append("is_public",scope.upImage.is_public);
                            oData.append("architecture",scope.options.arch);
                            oData.append("os_distro",scope.os_distro.name);
                            oData.append("os_type",scope.os_type.paramName);
                            oData.append("minimum_disk",scope.upImage.vol_size);
                        //  oData.append("os_version",scope.upImage.os_version);
                            var oReq = new XMLHttpRequest();
                            var startData ={
                                timeStamp :null,
                                loadedSize :null
                            }
                            oReq.upload.onprogress = function(e){
                                /*计算速率*/
                                if(startData.timeStamp&&startData.loadedSize){
                                    var timeDifference = e.timeStamp - startData.timeStamp;
                                    var imageDifference = e.loaded - startData.loadedSize;
                                    self.rateNum = (imageDifference/timeDifference/1024/1.024).toFixed(2)+"M/s";
                                }

                                startData.timeStamp = e.timeStamp;
                                startData.loadedSize = e.loaded;

                                /*计算进程*/
                                let percentage=(e.loaded/e.total/100).toFixed(2);
                                scope.uploadData={
                                        title:$translate.instant("aws.img.progress"),
                                        beAdded:0,
                                        rate:self.rateNum,
                                        total:e.total,
                                        inUsed:e.loaded
                                }
                                scope.$apply();
                                if(e.total==e.loaded){
                                    scope.upDataUpFlag = false;
                                    modalImage.close();
                                    self.$emit("closeNewWindow", false);
				                    //api更改马上刷新可能会拿不到数据经多次测试延迟1秒。
                                    $timeout(function(){
                                        $scope.refreshImages();
                                    },1000)
                                }

                            };
                            oReq.onerror = function(e) { 
                                if(e.type=="error"){
                                    scope.upDataUpFlag = false;
                                    alertSrv.set("", imageName+$translate.instant("aws.img.uploadfail") , "error",5000);
                                    
                                }
                            };
                            oReq.onload = function(){
                                var responseObj=JSON.parse(oReq.responseText);
                                if(responseObj){
                                        if( responseObj.code==0){
                                            scope.upDataUpFlag = false;
                                            alertSrv.set("", imageName+$translate.instant("aws.img.uploadsuccess") , "success",5000);
                                            getImages();
                                        }else{
                                            scope.upDataUpFlag = false;
                                            alertSrv.set("", imageName+$translate.instant("aws.img.uploadfail") , "error",5000);
                                        }
                                }
                            }
                            oReq.open("POST", window.GLOBALCONFIG.APIHOST.RESOURCE+"/v1/uploadimagez", true);
                            let auth_token = localStorage.$AUTH_TOKEN;
                            oReq.setRequestHeader("X-Auth-Token",auth_token); 
                            oReq.setRequestHeader("domain_id",localStorage.domainUid); 
                            oReq.setRequestHeader("domain_name",encodeURI(localStorage.domainName)); 
                            oReq.setRequestHeader("project_id",localStorage.projectUid); 
                            oReq.setRequestHeader("project_name",encodeURI(localStorage.projectName)); 
                            oReq.send(oData);
                            oReq.onreadystatechange=state_Change;
                            function state_Change(){
                                if(oReq.readyState==4){
                                    if(oReq.response.indexOf('磁盘空间不足')>-1){
                                        $rootScope.$broadcast("alert-error", '77000111');
                                        $rootScope.$apply();

                                    }
                                }
                            }
                        // modalImage.close();
                            
                        }else{
                            pro.architecture = scope.options.arch;
                            pro.disk_format = scope.options.disk_format;
                            pro.os_type=scope.os_type.paramName;
                            pro.os_distro=scope.os_distro.name;
                            pro.minimum_disk = pro.vol_size;
                            if(localStorage.permission == "stand"){
                                pro.is_public = true;
                            }
                            modalImage.close();
                            imagesSrv.createImage(pro).then(function() {
                                getImages();
                            });
                        }
                    }else{
                        scope.submitInValid = true;
                    }
                };
                break;

                case "edit":
                    //随便的值，为了表单验证通过
                    scope.selected_file ="123";
                    scope.options = {};
                    scope.imageTitle = $translate.instant("aws.img.edit_image");
                    scope.upImage = angular.copy(editData);
                    scope.hideSome = true;
                    scope.upImage.disk_format = editData.disk_format;
                    scope.upImage.architecture =editData.arch;
                    scope.options.arch=editData.arch
                    scope.upImage.os_version = editData.release;
                    scope.upImage.os_type=editData.os_type;
                    scope.os_type={"dataName_t":editData.os_type};
                    _.forEach(scope.osTypeList,function(os){
                        if((os.paramName).toLowerCase()==editData.os_type){
                            scope.changeOSType(os)
                        }
                    })
                    scope.upImage.os_distro = editData.os_distro;
                    scope.os_distro={id:"",name:editData.os};
                    scope.upImage.vol_size= editData.size || 0;
                    scope.options.disk_format=editData.disk_format;
                    scope.busTypeList.forEach(function(item, index) {
                        if(item.id == editData.hw_disk_bus) {
                            scope.busType = scope.busTypeList[index];
                            scope.changeBusType(scope.busType);
                        }
                    });
                    scope.videoModelList.forEach(function(item, index) {
                        if(item.id == editData.hw_vif_model) {
                            scope.videoModel = scope.videoModelList[index];
                            scope.changeVideoModel(scope.videoModel);
                        }
                    });
                    scope.vifModelList.forEach(function(item, index) {
                        if(item.id == editData.hw_video_model) {
                            scope.vifModel = scope.vifModelList[index];
                        }
                    });
                    scope.seniorStatus = {
                        BIOSmenu : editData.hw_boot_menu ? "true" : "false",
                        qemu : editData.hw_qemu_guest_agent ? "true" : "false",
                        videoQueue : editData.hw_vif_multiqueue_enabled ? "true" : "false",
                        diskCtrl : editData.hw_scsi_model ? "true" : "false"
                    };
                    scope.confirmImage = function(pro,imageName){
                        if(imageName.$valid&&!scope.nameCheck){
                            scope.can_double_click=false;
                            var postData = {
                                "name": pro.name,
                                "copy_from": pro.copy_from,
                                "disk_format": scope.options.disk_format,
                                "architecture": scope.options.arch,
                                "os_version": pro.os_version,
                                "os_type":scope.os_type.paramName,
                                "os_distro":scope.os_distro.name,
                                "is_public": pro.is_public,
                                "is_protected": pro.is_protected,
                                "imageUid": pro.imageUid,
                                "vol_size":pro.vol_size,
                                "minimum_disk":pro.vol_size,
                                "hw_disk_bus": scope.busType.id,
                                "hw_video_model": scope.vifModel.id,
                                "hw_vif_model": scope.videoModel.id,
                                "hw_qemu_guest_agent": scope.seniorStatus.qemu,
                                "hw_boot_menu": scope.seniorStatus.BIOSmenu
                            };
                            if(scope.busType.id == "virtio") {
                                postData.hw_scsi_model = scope.seniorStatus.diskCtrl;
                            }
                            if(scope.videoModel.id == "virtio") {
                                postData.hw_vif_multiqueue_enabled = scope.seniorStatus.videoQueue;
                            }
                            modalImage.close();
                            imagesSrv.editImage(postData).then(function() {
                                getImages();
                            });
                        }else{
                            scope.submitInValid = true;
                        }
                        
                    };
                break;
            }
        }
        scope.cant_click=function(){
            /*return !scope.can_double_click || (!scope.have_file && scope.showFile)*/
            return !scope.can_double_click || scope.fileSizeinvalidate 
        }
        
    };
    self.deleteImages = function() {
        if(!self.canDelete){
            return;
        }
        var content = {
            target: "delImage",
            msg: "<span>" + $translate.instant("aws.img.del_msg") + "</span>"
        };
        self.$emit("delete", content);
    };
    self.$on("delImage", function() {
        var delGroup = [];
        var postData = { ids: delGroup };
        _.forEach(self.tableParams.data, function(group) {
            if (self.checkboxes.items[group.imageUid]) {
                delGroup.push(group.imageUid);
            }
        });
        imagesSrv.delImages(postData).finally(function() {
            getImages();
        });
    });

    self.insAnimation = "animateOut";
    self.newInstance = function(editData) {
        if(!self.canAddVm)return;
        var path = "/cvm/images?from=image&imageUid="+editData.imageUid
        $location.url(path);
        self.insAnimation = "animateIn";
        $("body").addClass("animate-open")
    };
    self.closeNewIns = function(){
        self.insAnimation = "animateOut";
        $("body").removeClass("animate-open");
        $location.url("/cvm/images");
    }
    self.customImages = function(){
        var scope = $rootScope.$new();
        /*var modalImage = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: "customImages.html",
            scope: scope
        });*/
        scope.stepOne = true;
        scope.stepTwo = false;
        scope.stepthree = false;
        scope.img_type = "iso";
        scope.choose_iso = "existed";
        scope.toStepTwo = function(){
            scope.stepOne = false;
            scope.stepTwo = true;
            scope.stepThree = false;
        };
        scope.toStepOne = function(){
            scope.stepOne = true;
            scope.stepTwo = false;
            scope.stepThree = false;
        };
        scope.toStepThree = function(){
            scope.stepOne = false;
            scope.stepTwo = false;
            scope.stepThree = true;
        };
    };
    getImages();
}])
.directive("defaultImg", function() {
    return {
        restrict: "A",
        require: "ngModel",
        link: function(scope, elem, attrs, ngModel) {
            ngModel.$parsers.push(function(viewValue) {
                if (viewValue=='SystemCheck') {
                    ngModel.$setValidity("repeatDefaultImg", false);
                } else {
                    ngModel.$setValidity("repeatDefaultImg", true);
                }
                return viewValue;
            });
            ngModel.$formatters.push(function(viewValue){
                if (viewValue=='SystemCheck') {
                    ngModel.$setValidity("repeatDefaultImg", false);
                } else {
                    ngModel.$setValidity("repeatDefaultImg", true);
                }
                return viewValue;
            });
        }

    };
});

// .controller("imgInstancesCtrl", ["$scope","$rootScope", "instancesSrv", "$uibModalInstance","$translate", "items","cvmViewSrv","depviewsrv","aggregatesSrv","networksSrv","storageSrv","overviewSrv","volumesDataSrv",
//     function($scope,$rootScope, instancesSrv, $uibModalInstance,$translate, items,cvmViewSrv,depviewsrv,aggregatesSrv,networksSrv,storageSrv,overviewSrv,volumesDataSrv) {
//         var self = $scope;
//         localStorage.managementRole!=2?self.roleNumber=false:self.roleNumber=true;
//         self.flavorNormalList = [];
//         self.instancesquota = {
//             used: 0
//         };
//         self.coresquota = {
//             used: 0
//         };
//         self.ramquota = {
//             used: 0
//         };
//         self.volumesquota = {
//             used: 0
//         };
//         self.instancesDomquota = {
//             used: 0
//         };
//         self.coresDomquota = {
//             used: 0
//         };
//         self.ramDomquota = {
//             used: 0
//         };
//         self.volumesDomquota = {
//             used: 0
//         };
//         self.allList = [];
//         self.options = {
//             disabled: true,
//             img: items.editData.is_public,
//             imgtext: items.editData.is_public ? $translate.instant("aws.instances.addinstances.public") : $translate.instant("aws.instances.addinstances.private"),
//             arch: items.editData.arch,
//             os: $translate.instant("aws.img.osType." + items.editData.os_type.toLowerCase()),
//             name: items.editData.name,
//             cpu_mem: "1",
//             creatBy: "isImage"
            
//         };
//         //(items.editData.os_type && items.editData.os_type.toLowerCase() == "windows")?self.hide_windows_hostname=true:self.hide_windows_hostname=false;
//         self.network = {
//             assignIP:false,
//             init_cidr: {
//                 ip_0: "",
//                 ip_1: "",
//                 ip_2: "",
//                 ip_3: ""
//             }
//         };
//         self.keypairs = {};
//         self.securities = {};
//         self.zone = {};
//         self.node = {};
//         self.setting_tip = [];
//         self.conf = {};
//         self.storage = {};
//         self.hostNum = 1;
//          self.isUseLocal ={};
//         self.isUseLocalList=[
//             {
//                 "name":$translate.instant("aws.instances.addinstances.useLocal"),
//                 "id":true,
//                 "type":1
//             },{   
//                 "name":$translate.instant("aws.instances.addinstances.ebs"),
//                 "id":false,
//                 "type":2
//             }
//         ];
//         if (localStorage.permission == "stand") {
//             self.isUseLocalList[0].name = $translate.instant("aws.instances.addinstances.local")
//             self.isUseLocal.selected = self.isUseLocalList[0];
//         }else{
//             self.isUseLocal.selected = self.isUseLocalList[1];
//         }
//         self.submitInValid = false;
//         var imgType = [{
//             text: $translate.instant("aws.instances.addinstances.public"),
//             value: true
//         }, {
//             text: $translate.instant("aws.instances.addinstances.private"),
//             value: false
//         }];
//         var framework = [{
//             text: $translate.instant('aws.instances.addinstances.x86_64'),// "64位"
//             value: "x86_64"
//         }, {
//             text: $translate.instant('aws.instances.addinstances.i686'),//"32位"
//             value: "i686"
//         }];
//         self.vm = {
//             imgType: imgType,
//             framework: framework
//         };
//         self.osType = [];
//         self.archType = [];
//         self.images2 = [];
//         //非ceph存储
//         function getBatchVolum(image){
//             self.canBatchNoCeph= true;
//             if(self.storage.storageDeviceSelected&&self.storage.storageDeviceSelected.volume_backend_name.indexOf('ceph')==-1){
//                 if (self.hostNum > 1 && image && self.storage.storageDeviceSelected) {
//                     if(self.storage.storageDeviceSelected.image_volume_cache_enabled){
//                         if (self.storage.storageDeviceSelected.host) {
//                             var postData = self.storage.storageDeviceSelected.host;
//                             instancesSrv.getImageCacheVol(image.imageUid, postData).then(function(result) {
//                                 if (result && result.status == 0 && result.data && result.data.status == "400") {
//                                     self.canBatchNoCeph = false;
//                                 } else {
//                                     self.canBatchNoCeph = true;
//                                 }
//                             })
//                         } else {
//                             self.canBatchNoCeph = true;
//                         }

//                     }else{
//                         self.canBatchNoCeph = false;
//                     }
//                 }
     
//             }
//         }

//         function getCacheVolume(image){
//             self.canBatch = true;
//             if(self.hostNum > 1 &&  image && image.disk_format == "qcow2" && self.storage.storageDeviceSelected){
//                 if(self.storage.storageDeviceSelected.host){
//                     var postData = self.storage.storageDeviceSelected.host;
//                     instancesSrv.getImageCacheVol(image.imageUid,postData).then(function(result){
//                         if(result && result.status == 0 && result.data && result.data.status =="400"){
//                             self.canBatch = false;
//                         }else {
//                             self.canBatch = true;
//                         }
//                     })
//                 }else{
//                     self.canBatch = true;
//                 }
                
//             }
            
//         }
//         getCacheVolume(items.editData)
//         getBatchVolum(items.editData);

//         //获取项目下云主机的配额,并判断
//         function getproQuotas() {
//             var insQuotapost = {
//                 type: "project_quota",
//                 targetId: localStorage.projectUid,
//                 enterpriseUid: localStorage.enterpriseUid
//             };
//             cvmViewSrv.getproQuotas(insQuotapost).then(function(result) {
//                 if (result && result.data.length) {
//                     _.forEach(result.data, function(item) {
//                         if (item.name == "instances" || item.name == "cores" || item.name == "ram" || item.name == "volumes") {
//                             self[item.name + "quota"].total = item.hardLimit;

//                         }
//                     });
//                     self.testProQuota(self.flavorNormalList[0], 1); //初始化的时候检查配额
//                 }
//             });
//         }

//         function getdomQuotas() {
//             depviewsrv.getQuotaTotal(localStorage.domainUid).then(function(result) {
//                 if (result && result.data.length) {
//                     _.forEach(result.data, function(item) {
//                         if (item.name == "instances" || item.name == "cores" || item.name == "ram" || item.name == "volumes") {
//                             self[item.name + "Domquota"].total = item.hardLimit;
//                         }
//                     });
//                     self.testDomQuota(self.flavorNormalList[0], 1); //初始化的时候检查配额
//                 }
//             });
//         }

//         self.testProQuota = function(val, num) {
//             var postData = {
//                 type: "project_quota",
//                 domainUid: localStorage.domainUid,
//                 projectUid: localStorage.projectUid,
//                 enterpriseUid: localStorage.enterpriseUid
//             };
//             cvmViewSrv.getProused(postData).then(function(result) {
//                 if (result && result.data) {
//                     _.forEach(result.data, function(item) {
//                         if (item.name == "instances" || item.name == "cores" || item.name == "ram" || item.name == "volumes") {
//                             self[item.name + "quota"].used = item.inUse;
//                         }
//                     });
//                     (val.vcpus * num > self.coresquota.total - self.coresquota.used) ? self.coreProText = $translate.instant("aws.instances.quota.proCpu"): self.coreProText = "";
//                     (val.ram * num > self.ramquota.total - self.ramquota.used) ? self.ramProText = $translate.instant("aws.instances.quota.proRam"): self.ramProText = "";
//                     (num > self.instancesquota.total - self.instancesquota.used) ? self.insProText = $translate.instant("aws.instances.quota.proIns"): self.insProText = "";
//                     (num > self.volumesquota.total - self.volumesquota.used) ? self.volumesProText = $translate.instant("aws.instances.quota.proVolumes"): self.volumesProText = "";
//                     self.proInsNum = { icon: true, total: self.instancesquota.total, used: self.instancesquota.used, showUsed: num };
//                     self.proRam = { icon: true, total: (self.ramquota.total / 1024).toFixed(1), used: (self.ramquota.used / 1024).toFixed(1), showUsed: (val.ram * num / 1024).toFixed(1) };
//                     self.proCores = { icon: true, total: self.coresquota.total, used: self.coresquota.used, showUsed: val.vcpus * num };
//                     self.proVolumes = { icon: true, total: self.volumesquota.total, used: self.volumesquota.used, showUsed: num };
//                 }
//             });
//         };
//         self.testDomQuota = function(val, num) {
//             depviewsrv.getQuotaUsed(localStorage.domainUid).then(function(result) {
//                 if (result && result.data) {
//                     _.forEach(result.data, function(item) {
//                         if (item.name == "instances" || item.name == "cores" || item.name == "ram" || item.name == "volumes") {
//                             self[item.name + "Domquota"].used = item.inUse;
//                         }
//                     });
//                     (val.vcpus * num > self.coresDomquota.total - self.coresDomquota.used) ? self.coreDomText = $translate.instant("aws.instances.quota.domCpu"): self.coreDomText = "";
//                     (val.ram * num > self.ramDomquota.total - self.ramDomquota.used) ? self.ramDomText = $translate.instant("aws.instances.quota.domRam"): self.ramDomText = "";
//                     (num > self.instancesDomquota.total - self.instancesDomquota.used) ? self.insDomText = $translate.instant("aws.instances.quota.domIns"): self.insDomText = "";
//                     (num > self.volumesDomquota.total - self.volumesDomquota.used) ? self.volumesDomText = $translate.instant("aws.instances.quota.domVolumes"): self.volumesDomText = "";
//                     self.domInsNum = { icon: true, total: self.instancesDomquota.total, used: self.instancesDomquota.used, showUsed: num };
//                     self.domRam = { icon: true, total: (self.ramDomquota.total / 1024).toFixed(1), used: (self.ramDomquota.used / 1024).toFixed(1), showUsed: (val.ram * num / 1024).toFixed(1) };
//                     self.domCores = { icon: true, total: self.coresDomquota.total, used: self.coresDomquota.used, showUsed: val.vcpus * num };
//                     self.domVolumes = { icon: true, total: self.volumesDomquota.total, used: self.volumesDomquota.used, showUsed: num };
//                 }
//             });
//         };

//         self.$watch(function() {
//             return self.hostNum;
//         }, function(val) {
//             if(val){
//                 getBatchVolum(items.editData);
//                 getCacheVolume(items.editData);
//             }
//             if (localStorage.permission == "enterprise" && self.flavorNormalList.length) {
//                 self.proInsNum = null;
//                 self.proRam = null;
//                 self.proCores = null;
//                 self.proVolumes = null;
//                 self.domInsNum = null;
//                 self.domRam = null;
//                 self.domCores = null;
//                 self.domVolumes = null;
//                 self.testProQuota(self.options.flavor, val);
//                 self.testDomQuota(self.options.flavor, val);
//             }
//             if (val > 1) {
//                 self.network.assignIP = false;
//             }
//         });
//         self.chooseCpuMem = function(data) {
//                 self.proInsNum = null;
//                 self.proRam = null;
//                 self.proCores = null;
//                 self.proVolumes = null;
//                 self.domInsNum = null;
//                 self.domRam = null;
//                 self.domCores = null;
//                 self.domVolumes = null;
//                 if (localStorage.permission == "enterprise") {
//                     self.testProQuota(data, self.hostNum);
//                     self.testDomQuota(data, self.hostNum);
//                 }
//                 self.options.flavor = data;
//                 let flavor_ram_gb = self.options.flavor.ram/1024;
//                 self.options.flavor.ram_gb = Math.ceil(flavor_ram_gb) == flavor_ram_gb?flavor_ram_gb:flavor_ram_gb.toFixed(1);
//                 self.normalText = data.text;
//             };

//         self.interacted = function(field) {
//             self.field_form = field;
//             return self.submitInValid || field.ip_0.$dirty || field.ip_1.$dirty || field.ip_2.$dirty || field.ip_3.$dirty;
//         };
//         var compareIpFun = function(item){
//             var startIp_list = [],endIp_list=[];
//             self.min_num = {};
//             self.max_num = {};

//             startIp_list = item.subnets[item.sub_key].allocationPools[item.allocationPool_key].start.split(".");
//             endIp_list = item.subnets[item.sub_key].allocationPools[item.allocationPool_key].end.split(".");

//             for(var i = 0;i<startIp_list.length;i++){
//                 if(startIp_list[i] == endIp_list[i]){
//                     self.network.init_cidr["ip_"+i] = startIp_list[i];
//                     $("#ip_"+[i]).attr("readonly","readonly");
//                 }else{
//                     $("#ip_"+[i]).removeAttr("readonly");
//                     $("#ip_"+[i]).attr("placeholder",startIp_list[i]+"~"+endIp_list[i]);
//                     self.min_num["ip_"+i] = startIp_list[i];
//                     self.max_num["ip_"+i] = endIp_list[i];
//                     if(i == 1){
//                         $("#ip_2").removeAttr("readonly");
//                         $("#ip_2").removeData();
//                         $("#ip_2").attr("placeholder","0~255");
//                         self.min_num.ip_2 = 0;
//                         self.max_num.ip_2= 255;
//                         $("#ip_3").removeAttr("readonly");
//                         $("#ip_3").removeData();
//                         $("#ip_3").attr("placeholder","0~255");
//                         self.min_num.ip_3 = 0;
//                         self.max_num.ip_3 = 255;
//                     }
//                     if(i == 2){
//                         $("#ip_3").removeAttr("readonly");
//                         $("#ip_3").removeData();
//                         $("#ip_3").attr("placeholder","0~255");
//                         self.min_num.ip_3 = 0;
//                         self.max_num.ip_3 = 255;
//                     }
//                 }
//             }
//         };
//         self.invalid = {};
//         self.required = {};
//         self.checkValue = function(){
//             var reg = new RegExp("^(0|[1-9][0-9]*)$");
//             for(var i = 0;i<4;i++){
//                 if(self.network.init_cidr["ip_"+i]){
//                     self.required["ip_"+i] = false;
//                     if(Number(self.network.init_cidr["ip_"+i]) < Number(self.min_num["ip_"+i]) || 
//                     Number(self.network.init_cidr["ip_"+i]) > Number(self.max_num["ip_"+i]) || 
//                     !reg.test(self.network.init_cidr["ip_"+i])){
//                         self.invalid["ip_"+i] = true;
//                         self.field_form.$valid = false;
//                     }else{
//                         self.invalid["ip_"+i] = false;
//                     }
//                 }else{
//                     self.required["ip_"+i] = true;
//                     self.invalid["ip_"+i] = false;
//                     self.field_form.$valid = false;
//                 }
//             }
//         };
//        self.changeNet = function(net) {
//             self.subSegmentList = [];
//             _.each(self.networkList_extend,function(item){
//                 if(item.id == net.id){
//                     item.sub_name = item.net_sub_name.split("---")[1];
//                     self.subSegmentList.push(item);
//                 }
//             });
//             self.network.subSegment = self.subSegmentList[0];
//             self.changeSubSegment(self.network.subSegment);
//         };
//         self.changeSubSegment = function(net){
//             self.network = {
//                 selected: self.network.selected,
//                 assignIP: self.network.assignIP,
//                 init_cidr: {
//                     ip_0: "",
//                     ip_1: "",
//                     ip_2: "",
//                     ip_3: ""
//                 },
//                 subSegment:self.network.subSegment
//             };
//             for (let i = 1; i < 4; i++) {
//                 self.field_form["ip_" + i].$valid = true;
//                 self.required["ip_" + i] = false;
//                 self.invalid["ip_" + i] = false;
//             }
//             compareIpFun(net);
//         };
//         self.mouseNet = function(network,type){
//             self.net_subSegDetail = angular.copy(self.networkList_extend);
//             _.map(self.net_subSegDetail,function(item){
//                 if(item.id == network.id){
//                     item.sub_name = item.net_sub_name.split("---")[1];
//                     if(type == "over"){
//                          item.showSubSegDetail = true;
//                      }else{
//                          item.showSubSegDetail = false;
//                      }
//                     return item 
//                 }
//             });
//         };
//         //异构存储 获取openstack的volumeTypes 
//         //同有只显示不带“存储特性”的卷类型。
//         //获取所有的卷类型并将ceph的存储设备和资源池set进storageDeviceList
//         function getStorage(){
//             instancesSrv.getvolumeTypes().then(function(result){
//                 if(result && angular.isArray(result.data)){
//                     var ceph_type,device,pools;
//                     self.volList = result.data;
//                     ceph_type =  result.data.filter(item => item.extra.volume_backend_name == "ceph_1#volumes")[0];
//                     if(ceph_type){
//                         device = $translate.instant("aws.volumes.cv.ceph_storage");
//                         pools = ceph_type.extra.volume_backend_name.split("#")[1];
//                     }
//                     self.storageDeviceList = [{
//                         id:ceph_type.id,
//                         name:device,
//                         pools:[$translate.instant("aws.volumes.cv.cephpool")],
//                         volume_backend_name: ceph_type.extra.volume_backend_name
//                     }]
//                     if(self.storageDeviceList.length){
//                         self.storage.storageDeviceSelected = self.storageDeviceList[0];
//                         self.storage.storagePoolSelected = self.storageDeviceList[0].pools[0];
//                         getvolType(self.storage.storageDeviceSelected)
//                     }
//                     getDevice()
//                     self.changePool(self.storage.storageDeviceSelected)
//                 }
                
//             })
//         };
//         //获取第三方存储设备和资源池set进storageDeviceList
//         function getDevice(){
//             var postData = {
//                 "Vendor": "TOYOU"
//             }
//             storageSrv.getDevice(postData).then(function(result){
//                 if(result && angular.isArray(result.data) && result.data.length){
//                     result.data.map(item => {
//                         self.storageDeviceList.push({
//                             did:item[0],
//                             name:item[1],
//                             pools:item[2].split(",")
//                         })
//                     })
//                     self.volList = self.volList.filter(item => item.extra.volume_backend_name.indexOf("--") == -1)
//                     setthirdVol()
//                 }else{
//                     setthirdVol()
//                 }  
//             });

//         };

//         //拆分非同有的第三方存储
//         function setthirdVol(){
//             let storageDevice_third = [];
//             let storageDevice_thirdobj = [];
//             let third_type = [];
//             third_type = self.volList.filter(item => item.extra.volume_backend_name != "ceph_1#volumes")
//             third_type.map(function(item){
//                 var vol = splitVolumeBacked(item);
//                 if(storageDevice_third.indexOf(vol[0]) == -1 ){
//                     storageDevice_third.push(vol[0])
//                 }
//             })
//             storageDevice_third.map(function(item){
//                 storageDevice_thirdobj.push({name:item,pools:[]})
//             })

//             storageDevice_thirdobj.map(function(item){
//                 third_type.map(function(val){
//                     var vol = splitVolumeBacked(val);
//                     if(item.name == vol[0] && item.pools.indexOf(vol[1]) == -1){
//                         item.pools.push(vol[1])
//                     }
//                 })
//             })
//             self.storageDeviceList.push(...storageDevice_thirdobj)
//         }

//         function splitVolumeBacked(item){
//             if(item.extra.volume_backend_name.indexOf("--")>-1){
//                     var vol = item.extra.volume_backend_name.split("--");
//             }else if(item.extra.volume_backend_name.indexOf("#")>-1){
//                 var vol = item.extra.volume_backend_name.split("#");
//             }
//             return vol
//         }

//         function getvolType(voltype,hyperswap=0){
//             self.storage.storageSelected = "";
//             self.nomore_voltype = false;
//             if(voltype.id){
//                 self.storage.storageSelected = voltype.id;
//             }else if(voltype.did){
//                 var posta = {
//                     "Vendor": "TOYOU",
//                     "Storage_name": self.storage.storageDeviceSelected.name,
//                     "Pool_name": self.storage.storagePoolSelected,
//                     "Character_message": { 
//                         "compression": 0,
//                         "rsize" : 0,
//                         "easytier": 0,
//                         "hyperswap": hyperswap
//                     }
//                 };
//                 storageSrv.getVoltype(posta).then(function(result){
//                     if(result && result.data && result.data.volume_type_id){
//                         self.storage.storageSelected = result.data.volume_type_id;
//                     }else{
//                         self.nomore_voltype = true;
//                     }
//                 })
//             }else{
//                 self.volList.map(function(item){
//                     var vol = splitVolumeBacked(item);
//                     if(vol[0] == self.storage.storageDeviceSelected.name && vol[1] == self.storage.storagePoolSelected){
//                         self.storage.storageSelected = item.id;
//                     }
//                 })
                   

//             }
            
//         }
        
//         self.changeDevice = function(device){
//             self.storage.storagePoolSelected = device.pools[0];
//             if(device.did){
//                 self.storage.storagepoolShow = true;
//                 self.changePool(self.storage.storageDeviceSelected,self.storage.storagePoolSelected)
//             }else{
//                 self.changePool(self.storage.storageDeviceSelected,self.storage.storagePoolSelected)
//                 self.storage.storagepoolShow = false;
//                 self.nomore_voltype = false;
//             }
//             getBatchVolum(items.editData);
//             getCacheVolume(items.editData);
//         }
//         self.changePool = function(device,pool){
//             self.hidePools = false;
//             if(device.did){
//                 var postData = {
//                 "id": device.did,
//                 "Storage_name": device.name
//             }
//             //获取该资源池支持的存储特性
//             storageSrv.getFeatures(postData).then(function(result){
//                 if(result && result.data &&  angular.isArray(result.data.Storage_characters)){
//                     self.storageFeatures = result.data.Storage_characters;
//                     var hasHyperswap = 0;
//                     if(self.storageFeatures.indexOf("hyperswap") > -1){
//                         hasHyperswap = 1;
//                     }
//                     getvolType(self.storage.storageDeviceSelected,hasHyperswap)
//                 }
//             })
//                 device.volume_backend_name = device.name + "--" +pool;
//                 getPoolInfo(device);
//             }else if(device.id){
//                 getPoolInfo(device)
//                 getvolType(self.storage.storageDeviceSelected)
//             }else{
//                 device.volume_backend_name = device.name + "#" +pool;
//                 getPoolInfo(device)
//                 getvolType(self.storage.storageDeviceSelected)
//             }
//         }
//         //其他存储
//         var getPoolInfo = function(device){
//             // self.poolsInfo_data={
//             //     title:"TB",
//             //     inUsed:0,
//             //     beAdded:0,
//             //     total:100
//             // };
//             overviewSrv.getPoolsDetail().then(function(result){
//                 if(result && result.data && angular.isArray(result.data)){
//                     result.data.map(item => {
//                         if(item.capabilities.volume_backend_name == device.volume_backend_name){
//                             self.storage.storageDeviceSelected.host = item.name;
//                             self.storage.storageDeviceSelected.image_volume_cache_enabled = item.capabilities.image_volume_cache_enabled?true:false;
//                             var sdata = item;
//                             if(!sdata.capabilities.max_over_subscription_ratio){
//                                 sdata.capabilities.max_over_subscription_ratio = 1;
//                             }
//                             var total =  sdata.capabilities.total_capacity_gb *sdata.capabilities.max_over_subscription_ratio;
//                             var allocated_capacity_gb;
//                             if(sdata.capabilities.provisioned_capacity_gb){
//                                 allocated_capacity_gb = sdata.capabilities.provisioned_capacity_gb;
//                             }else{
//                                 allocated_capacity_gb = sdata.capabilities.allocated_capacity_gb;
//                             }
//                             self.poolsInfo_data={
//                                 title:"TB",
//                                 inUsed:Number(allocated_capacity_gb/1024).toFixed(2),
//                                 beAdded:0,
//                                 total:Number(total/1024).toFixed(2)
//                             };
//                             getCacheVolume(items.editData)
//                             getBatchVolum(items.editData);
//                         }
//                     })
//                 }       
//             })
//         }
//         //存储池详细信息查询
//         // var getPoolInfo = function(device,pool){
//         //     var postData = {
//         //         "id": device.did,
//         //         "Storage_name": device.name,
//         //         "Pool_name": pool
//         //     }
//         //     storageSrv.getPoolInfo(postData).then(function(result){
//         //         if(result && result.data && angular.isObject(result.data)){
//         //             var capacity = Number(result.data.capacity.slice(0,result.data.capacity.length-2));
//         //             var free_capacity = Number(result.data.free_capacity.slice(0,result.data.free_capacity.length-2));
//         //             var unit = result.data.capacity.slice(result.data.capacity.length-2)
//         //             self.poolsInfo_data={
//         //                 title:"("+unit+")",
//         //                 inUsed:(capacity-free_capacity).toFixed(2),
//         //                 beAdded:0,
//         //                 total:capacity
//         //             };
//         //         }else{
//         //             self.poolsInfo_data = {
//         //                 title:$translate.instant("aws.volumes.cv.pool_capacity")+ "TB"
//         //             }
//         //         }
                
//         //     })
//         // };
//         //获取网络数据
//         instancesSrv.getProjectNetwork().then(function(result) {
//             if (result && result.data && angular.isArray(result.data)) {
//                 self.networkList = result.data.filter(function(item) {
//                     return item.subnets.length; //没有绑定子网的交换机创建云主机时不能使用
//                 });
//                 self.networkList_extend = [];
//                 _.each(self.networkList, function(item) {
//                     //创建网络时一个交换机对应一个子网的限制放开，一个交换机可以有多个子网，一个子网又可以有多个IP地址池
//                     for(let i=0;i<item.subnets.length;i++){
//                         for(let j=0;j<item.subnets[i].allocationPools.length;j++){
//                             item.net_sub_name = item.name + "---" + item.subnets[i].name + "(" + item.subnets[i].allocationPools[j].start + "~" + item.subnets[i].allocationPools[j].end + ")";
//                             item.sub_key = i;
//                             item.allocationPool_key = j; 
//                             self.networkList_extend.push(angular.copy(item));
//                         }
//                     }
//                 });

//                 if(self.networkList.length){
//                     self.network.selected = self.networkList[0];
//                     self.subSegmentList = [];
//                     _.each(self.networkList_extend,function(item){
//                         if(item.id == self.network.selected.id){
//                             item.sub_name = item.net_sub_name.split("---")[1];
//                             self.subSegmentList.push(item);
//                         }
//                     });
//                     self.network.subSegment = self.subSegmentList[0];
//                     compareIpFun(self.network.subSegment);
//                 }
                
//             }
//         });

//         //获取密钥对数据
//         function getKeypairs() {
//             instancesSrv.getKeypairs().then(function(result) {
//                 if (result && result.data.length) {
//                     result.data.map(item => item.value = item.name);
//                     self.keypairsList = [];
//                     self.keypairsList.push({name:"",value:$translate.instant("aws.instances.addinstances.keypairChoice")});
//                     self.keypairsList.push(...result.data);
//                     //self.keypairsList = result.data;
//                 }
//             });
//         }
        
//         //获取防火墙数据
//         function getSecurity() {
//             instancesSrv.getSecurity().then(function(result) {
//                 if (result && result.data.length) {
//                     self.securityList = [];
//                     result.data.map(item => item.value = item.name);
//                     self.securityList.push({name:"",value:$translate.instant("aws.instances.addinstances.securityGroupChoice")});
//                     self.securityList.push(...result.data);
//                     //self.securityList = result.data;
//                 }
//             });
//         }
//         //获取flavor数据
//         instancesSrv.getFlavors().then(function(result) {
//             if(result && result.data.length){
//                 _.forEach(result.data, function(val) {
//                     if(localStorage.permission == "stand"){
//                         val.text = val.name + "：" + val.vcpus + $translate.instant("aws.instances.conf.memtip") + (val.ram / 1024).toFixed(1) +"GB "+ $translate.instant("aws.instances.addinstances.dataDisk") + val.ephemeral + " GB" ;
//                     }else{
//                         val.text = val.name + "：" + val.vcpus + $translate.instant("aws.instances.conf.memtip") + (val.ram / 1024).toFixed(1)+"GB";
//                     }
//                     self.flavorNormalList.push(val);
//                 });
//                 self.options.flavor=self.flavorNormalList[0];
//                 let flavor_ram_gb = self.options.flavor.ram/1024;
//                 self.options.flavor.ram_gb = Math.ceil(flavor_ram_gb) == flavor_ram_gb?flavor_ram_gb:flavor_ram_gb.toFixed(1);
//                 if(localStorage.permission == "enterprise"){
//                     getproQuotas();
//                     getdomQuotas();
//                 }
//             }
//         });
//         //获取可用域和节点信息
//         function getZone() {
//             if (self.ADMIN) {
//                 instancesSrv.getZone().then(function(result) {
//                     if (result && result.data && angular.isArray(result.data)) {
//                         operateZone(result.data,"zoneName")
//                     }
//                 });
//             } else {
//                 aggregatesSrv.getAggregates().then(function(result) {
//                     if (result && result.data && angular.isArray(result.data)) {
//                         operateZone(result.data,"availZone")
//                     }
//                 });
//             }
//         }

//         function operateZone(data,zoneName){
//             data = data.filter(val => val.zoneName != "internal");
//             self.zoneList = [];
//             self.zoneList.push({
//                 zoneName:"",
//                 value:$translate.instant("aws.instances.addinstances.launchAreaChoice"),
//                 nodeList:[{name:"",value:$translate.instant("aws.instances.addinstances.launchNodeChoice")}]
//             })
//             self.zoneInit = data.map(item => {
//                 item.nodeList = [];
//                 item.nodeList.push({name:"",value:$translate.instant("aws.instances.addinstances.launchNodeChoice")})
//                 item.zoneName = item[zoneName]
//                 item.value = item[zoneName];
//                 if(zoneName == "zoneName"){
//                     for (let hostname in item.hosts) {
//                         item.nodeList.push({ name: hostname ,value:hostname});
//                     } 
//                 }else{
//                     item.hosts.map(val => {
//                         item.nodeList.push({ name: val ,value:val});
//                     })
//                 }
//                 return item;
//             });
//             self.zoneList.push(...self.zoneInit)
//         }

//         getKeypairs();
//         getSecurity();
//         getZone();
//         if (localStorage.permission == "enterprise"){
//             getStorage();
//         }

//         self.changeZone = function(zone){
//             self.node.selected = zone.nodeList[0];
//         };
//         self.canVolum=true;
//         self.create = function(form) {
//             self.validForm = false;
//             var postData = {};
//             var addInstance = function(params){
//                 if(self.canVolum){
//                     instancesSrv.createServer(params);
//                     $uibModalInstance.close();
//                 } 
//             };
//             if(self.poolsInfo_data.inUsed){
//                 var usedSize =items.editData.true_size/1000+self.poolsInfo_data.inUsed*1
//                 if(usedSize>(self.poolsInfo_data.total*1)){
//                     self.canVolum=false;
//                 }
//             }
//             if(form.$valid){
//                 postData = {
//                     name: self.hostName,
//                     count: self.hostNum,
//                     admin_pass: self.admin_pass || "",
//                     network_id: self.network.selected.id,
//                     keypair_id: self.keypairs.selected ? self.keypairs.selected.name : "",
//                     use_local: Boolean(self.isUseLocal.selected.id),
//                     flavor: self.options.flavor.id,
//                     image_id: items.editData.imageUid,
//                     security_id: self.securities.selected?self.securities.selected.name : "",
//                     os_type:self.options.os.toLowerCase()
//                 };
//                 if(!self.isUseLocal.selected.id){
//                     postData.volume_type = self.storage.storageSelected
//                 }
//                 if(localStorage.permission == "stand"){
//                     postData.hostname = self.hostname;
//                 }
//                 self.validForm = true;
//                 self.zone.selected ? postData.availability_zone = self.zone.selected.zoneName : "";
//                 self.node.selected ? postData.node = self.node.selected.name : "";
//             }else{
//                 self.submitInValid = true;
//                 self.validForm = false;
//             }

//             if(self.network.assignIP){
//                 postData.fixed_ip = self.network.init_cidr.ip_0 + "." + self.network.init_cidr.ip_1 + "." +self.network.init_cidr.ip_2 + "." +self.network.init_cidr.ip_3 ;
//                 self.checkValue(); 
//                 if(self.field_form.$valid){
//                     self.validForm = true;
//                     let existedIps = [];
//                     networksSrv.getNetworksDetail(self.network.selected.id).then(function(res) {
//                         if (res && res.data) {
//                             _.each(res.data, function(item) {
//                                 _.each(item.subnetIps,function(sub){
//                                     existedIps.push(sub.ip_address);
//                                 })
//                             })
//                             if (!_.include(existedIps, postData.fixed_ip)) {
//                                 addInstance(postData);
//                             } else {
//                                 self.repeatIp = true;
//                                 self.validForm = false;
//                             }
//                         }
//                     });
//                 }else{
//                     self.submitInValid = true;
//                     self.validForm = false;
//                 }
//             }else{
//                 if(self.field_form.$valid){
//                     self.validForm = true;
//                     addInstance(postData);
//                 }else{
//                     self.submitInValid = true;
//                     self.validForm = false;
//                 }
//             }
            
//         };

// }]);
