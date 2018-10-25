"use strict";
createVmCtrl.$inject=["$scope", "$rootScope", "$translate","vmService","$uibModal","$location"];
export function createVmCtrl($scope, $rootScope, $translate,vmService,$uibModal,$location){
    var self=$scope;
    self.show2=false;
    self.show3=false;
    self.show4=false;
    self.show5=false;
    self.show6=false;
    self.class_icon_2="collapsed";
    self.class_icon_3="collapsed";
    self.class_icon_4="collapsed";
    self.class_icon_5="collapsed";
    self.class_icon_6="collapsed";
    self.href_2="";
    self.href_3="";
    self.href_4="";
    self.href_5="";
    self.href_6="";
    self.vaild_ram=false;
    self.vaild_disk=false;
    self.vaild_network=false;
    self.vaild_iso=false;
    //当以上所有值为true是第二页中的下一页才可以点击。
    self.$watch(function(){
        return self.show2+":"+self.show3+":"+self.show4+":"+self.show5+":"+
                self.show6+":"+self.vaild_ram+":"+self.vaild_disk+":"+self.vaild_network
                +":"+self.vaild_iso
    },function(value){
        let val=value.split(":");
        if(val.indexOf("false") > -1){
            self.can_two_step=false;
        }else{
            self.can_two_step=true;
        }
    })
    //如果新建页面在第三页，则第二页为已经完成的状态
    self.$watch(function(){
        return self.active
    },function(value){
        if(value==2){
            self.class_page2="done";
        }else{
            self.class_page2="";
        }
    })
    //4的倍数params.config.memoryMB
    self.multiple_of_four=function(){
        self.vaild_ram=true;
        if(self.params.config.memoryMB&&(self.params.config.memoryMB>0)){
           if((self.params.config.memoryMB%4)!=0){
                self.params.config.memoryMB=(parseInt(self.params.config.memoryMB/4)+1)*4
            } 
        }else{
            self.params.config.memoryMB=4;
        }
    };
    //判断是否是整数self.params.config.diskSizeMB
    
    self.number_func=function (size) {
        self.vaild_disk=true;
        if(size&&(size>0)){
           self.newDiskList[0].size=size;
        }else{
            self.newDiskList[0].size=1;
        }

        self.params.config.diskSizeMB=self.newDiskList[0].size;
    }
    //新建页面上一步下一步
    self.active=0;
    self.forwardPage=function(){
       self.active--;
    };
    self.backPage=function(){
        self.active++
    }

    //定义需要传到后端的数据
    self.params={};
    self.params.config={};
    self.params.config.name="";
    
    //配置虚拟机位置
    //当第一个模态框符合条件时第二个框才会显示
    //flagn=can时上一个模态框的判断条件得到满足，show是某些模态框是否会显示。
    self.flag_2="cant";
    self.$watch(function(){
        return  self.params.config.name+":"+self.flag_2
    },function(value){
        let val=value.split(":");
        if((val[0]!="")&&(val[0]!="undefined")&&(val[1]==="can")){
            self.show2=true;
            self.class_icon_2="";
            self.href_2="#editfooter2";
        }else{
            self.show2=false;
            self.class_icon_2="collapsed";
            self.href_2="";
        }
    });
    //当第二个模态框符合条件时第三个框才会显示
    self.flag_3="cant";
    self.$watch(function(){
        return self.flag_3+":"+self.show2
    },function(value){
        let val=value.split(":");
        if((val[0]==="can")&&val[1]=="true"){
            self.show3=true;
            self.class_icon_3="";
            self.href_3="#editfooter3";
        }else{
            self.show3=false;
            self.class_icon_3="collapsed";
            self.href_3="";
        }
    });
    //当第3个模态框符合条件时第4个框才会显示
    self.flag_4="cant";
    self.$watch(function(){
        return self.flag_4+":"+self.show3
    },function(value){
        let val=value.split(":");
        if((val[0]==="can")&&val[1]=="true"){
            self.show4=true;
            self.class_icon_4="";
            self.href_4="#editfooter4";
        }else{
            self.show4=false;
            self.class_icon_4="collapsed";
            self.href_4="";
        }
    });
    //当第4个模态框符合条件时第5个框才会显示
    self.$watch(function(){
        return self.show4
    },function(value){
        if(self.show4){
            self.show5=true;
            self.class_icon_5="";
            self.href_5="#editfooter5";
        }else{
            self.show5=false;
            self.class_icon_5="collapsed";
            self.href_5="";
        }
    });
    //当第4个模态框符合条件时第5个框才会显示
    self.$watch(function(){
        return self.show4
    },function(value){
        if(self.show4){
            self.show5=true;
            self.class_icon_6="";
            self.href_6="#editfooter6";
        }else{
            self.show5=false;
            self.class_icon_6="collapsed";
            self.href_6="";
        }
    });
    //当第5个模态框符合条件时第6个框才会显示
    self.$watch(function(){
        return self.show5
    },function(value){
        if(self.show5){
            self.show6=true;
        }else{
            self.show6=false
        }
    });

    //虚拟机名称的验证
    self.name_error=false;
    let i=0
    self.$watch(function(){
        return self.params.config.name
    },function(value){
        if(i>0){
            if (!value){
                self.name_error=true;
            }else{
                self.name_error=false;
            }
        }
        i++;
    });
    self.$watch(function(){
        return self.params.folderMor
    },function(value){
        if(self.params.config.name){
            verifyFunc(self.params.config.name,value);
        }else{
            self.name_repeat_error=false;
        }
    })
    //判断虚拟机是否重名
    self.name_repeat_error=false;
    self.name_repeat_func=function(){
        if(self.params.folderMor){
            if(self.params.config.name){
                verifyFunc(self.params.config.name,self.params.folderMor);
            }else{
                self.name_repeat_error=false;
            }
        }
    }
    function verifyFunc(name,mor){
        let data={
            config:{name:name},
            folderMor:mor
        }
        vmService.verifyName(data).then(function(result){
            if(result){
                if(!result.data){
                    self.name_repeat_error=true;
                    self.show2=false;
                    self.flag_2="cant";
                }else{
                    self.name_repeat_error=false;
                    self.show2=true;
                    self.flag_2="can";
                }
            }
        })
    }
    //获取文件夹
    function getFoldersList(){
        self.folderList=[];
        vmService.getFolders().then(function(result){
            if(result&&result.data){
                self.folderList.push(result.data);
            }
        })
    }
    getFoldersList();
    //虚拟机位置搜索
    self.query={}
    self.query.vm_location="";
    self.query.resource=""
    self.findNodes=function(){};
    self.visible = function (item) {
        return !($scope.query.vm_location && $scope.query.vm_location.length > 0
        && item.name.indexOf($scope.query.vm_location) == -1);
    }
    self.get_folder_func=function(obj){
        if(obj.mor){
            if(!self.params.config.name){
                self.name_error=true;
            }else{
                verifyFunc(self.params.config.name,obj.mor);
            }
            //self.flag_2="can";
            
            self.selected_folder={dcName:obj.dcName};
            self.selected_folder_name=obj.name;
            self.params.folderMor=obj.mor;
            self.select_folderMor=obj.name;
            //根据选择的虚拟机位置获取对应的数据中心。
            vmService.getDCList().then(function(result){
                if(result&&result.data){
                    result.data.forEach((x)=>{
                        if(x.name==obj.dcName){
                            x.childs=[];
                            $scope.computeLoc=[x];
                        }
                    });
                }
            });

        }
    }
    //获取计算资源的整个列表根据父级是datacenter还是cluster选择下级目录
    $scope.toggles = function (scope,node) {
        if(node.type=="Datacenter"){
            let dcName=node.name
            vmService.getClusterListByDCName(dcName).then(function(result){
                if(result&&result.data){
                    result.data.forEach((x)=>x.childs=[]);
                    node.childs=result.data;
                }
            });
        }else if(node.type=="ClusterComputeResource"){
            let clusterName=node.name
            vmService.getHostListByClusterName(clusterName).then(function(result){
                if(result){
                    result.data.forEach((x)=>x.childs=[]);
                    node.childs=result.data;
                    //兼容性检查
                    if(result.data.length==0){
                        self.no_host=true;
                    }else{
                        self.no_host=false;
                    }
                }
            });
        }
        scope.toggle();
    };
    //计算资源搜索
    $scope.visible_resource = function (item) {
        return !($scope.query.resource && $scope.query.resource.length > 0
        && item.name.indexOf($scope.query.resource) == -1);

    }
    //改变计算资源时，更改网络列表和数据存储位置列表
    self.datastore_info={};
    self.network_info={};
    self.change_comp_resc=function(obj){
        if(obj.type==="ClusterComputeResource"){
            self.flag_3="can";
            self.selected_host_vm=obj.name;
            self.network_info.obj=obj.mor;
            self.params.clusterMor=obj.mor;
            self.select_cluster_name=obj.name;
            self.params.hostMor={};
            self.select_host_name="无";
            self.datastore_info.type="cluster";
            self.network_info.type="cluster";
            self.datastore_info.name=obj.name;
            self.datastore_info.parameter="clusterName";
            getDSList();
            getNetworkList();
        }else if(obj.type==="HostSystem"){
            self.flag_3="can";
            self.selected_host_vm=obj.name;
            self.network_info.obj=obj.mor;
            self.params.hostMor=obj.mor;
            self.select_host_name=obj.name
            self.params.clusterMor=obj.cluster.mor;
            self.select_cluster_name=obj.cluster.name;
            self.datastore_info.type="host";
            self.network_info.type="host";
            self.datastore_info.name=obj.name;
            self.datastore_info.parameter="hostName";
            getDSList();
            getNetworkList();
        }
    }
    //获取存储器列表
    function getDSList(){
        vmService.getDSList(self.datastore_info).then(function(result){
            if(result){
                result.data.forEach((x)=>{
                    x.capacity=(x.capacity/(1024*1024*1024)).toFixed(2)+" GB";
                    x.usage=(x.usage/(1024*1024*1024)).toFixed(2)+" GB";
                    x.freeSpace=(x.freeSpace/(1024*1024*1024)).toFixed(2)+" GB";
                })
                self.datastoreList=result.data;
                /*self.datastoreList.push(angular.copy(self.datastoreList[0]));
                self.datastoreList[1].name = 'datastore2 (2)'*/
                if(self.datastoreList.length>0){
                    self.selectedDS=self.datastoreList[0];
                    self.getBrowserData.dsName=self.selectedDS.name;
                    self.getBrowserData.dsMor=self.selectedDS.mor;
                    self.params.dataStoreMor=self.selectedDS.mor;
                    self.select_datastore_name=self.selectedDS.name;
                    getRootDrive();
                }
            }
        })
    }
    //选择ISO时初始数据格式
    self.getBrowserData={
        
        dsName:"datastore1",
        datastorePath:"",
        folder:true,
        dsMor:{
            type:"Datastore",
            value:"datastore-11"
        },
        searchSpec:{
            details:{
                fileOwner:true,
                fileSize:true,
                fileType:true,
                modification:true
            },
            matchPattern:["*"]
        }
    }
    //新CD/DVD驱动器
    //self.driveList=[{name:"客户端设备"},{name:"主机设备"},{name:"数据存储ISO文件"}];
    self.driveList=[{name:"点击选择ISO文件"}];
    self.selected_drive=self.driveList[0];
    self.changeDrive=function(drive){
        self.selected_drive=drive;
        if(drive.name=="点击选择ISO文件"){
            let modalInstance =  $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: "selectISO.html",
                scope:self
            });
            self.confirmISO=function(){
                self.selected_cdrom_data=self.selected_cdrom;
                if(self.selected_cdrom_data&&self.selected_cdrom_data.indexOf(".iso")!=-1){
                    self.vaild_iso=true;
                }else{
                    self.vaild_iso=false;
                }
                modalInstance.close()
            };
        }
    };
    //过滤文件类型
    self.file_type_list=[{name:"全部文件（*.*）",value:["*.*","*"]},{name:"ISO映像（*.iso）",value:["*.iso"]}]
    self.file_type=self.file_type_list[0];
    self.change_file_type=function(obj){
        self.file_type=obj;
        if(self.folder_info_left) {
            self.get_ds_path(self.folder_info_left);
        }
    };
    //根目录名称
    self.rootFolder="";
    //获取整个ISO文件夹列表
    self.get_ds_path=function(node,scope,flag){
        if(node.folder===false){
            return
        }
        self.getBrowserData.searchSpec.matchPattern=self.file_type.value;
        /*if(scope==="filter"){
            self.getBrowserData.searchSpec.matchPattern=self.file_type.value;
        }else{
            self.getBrowserData.searchSpec.matchPattern=["*.*","*"];
        }*/
        _.each(self.datastoreList, item => {
            if(item.name == node.path || (node.folderPath && node.folderPath.replace(/\[|\]/g,"") == item.name)){
                self.getBrowserData.dsName= item.name;
                self.getBrowserData.dsMor = item.mor;
            }
        });
        if(node.location==="root"){
            self.getBrowserData.datastorePath="";
        }else{
            if(node.folderPath && node.folderPath.indexOf('/')>-1){
                let oldurl=node.folderPath.replace(self.rootFolder,'')
                self.getBrowserData.datastorePath=oldurl+node.path;
            }else{
                self.getBrowserData.datastorePath=node.path;
                self.rootFolder = node.folderPath+" ";
            } 
        }
        node.childs=[];
        vmService.getBrowserList(self.getBrowserData).then(function(result){
            if(result){
                result.data.forEach((x)=>{
                    if (x.folder===true) {
                        node.childs.push(x)
                    }
                });
                if(flag !="collapsed"){
                    self.child_folder=[];
                    result.data.forEach((x)=>{
                        if (x.folder===false) {
                            self.child_folder.push(x);
                        }
                    });
                    if(self.file_type.value[0]=="*.iso"){
                        for(let i=0;i<result.data.length;i++){
                            if(result.data[i].path.indexOf(".iso")!=-1){
                                self.middle_box(result.data[i]);
                                break;
                            }
                        }
                    }
                }
            }
        });
        if(flag==="collapsed"){
            scope.toggle();
        }
        
    }
    //当选择的集群改变时，去掉原来选择的iso,第二步的按钮因没有选择iso置灰。
    self.$watch(function(){
        return self.getBrowserData.dsName
    },function(value){
        self.selected_cdrom="";
        self.selected_cdrom_data="";
        self.folder_info={};
        self.vaild_iso=false;
        //选择的集群改变时，数据存储要重新选择。
        //self.flag_4="cant";
        self.error_message="";
    })
    function getRootDrive(){
        self.rootDSList = [];
        _.each(self.datastoreList, item => {
            self.rootDSList.push({
                path: item.name,
                childs: [],
                location: "root"
            })
        });
        // self.rootDSList=[{path:self.getBrowserData.dsName,childs:[],location:"root"}];
    }
    //选择ISO的函数
    self.selectISOFunc=function(obj){
        self.folder_info=angular.copy(obj);
        self.folder_info.fileSize=(self.folder_info.fileSize/1024/1024).toFixed(2);
        self.get_ds_path(obj,"filter");
        self.folder_info_left=obj;

        
    }
    self.isISO=false;
    //选择ISO页面中间框操作的函数
    self.middle_box=function(obj){
        self.active_item=angular.copy(obj);
        self.folder_info=angular.copy(obj);
        self.folder_info.fileSize=(self.folder_info.fileSize/1024/1024).toFixed(2);
        if(obj.folder===true){
            self.get_ds_path(obj)
        }
        if(obj.folder===false){
            if(obj.path.indexOf(".iso")!=-1){
                self.isISO=true;
                self.error_message="";
            }else{
                self.isISO=false;
                self.error_message="你所选择的不是ISO文件，请选择ISO文件。";
            }
            self.selected_cdrom=obj.folderPath+obj.path;
        }
    }
    self.selectedDSFunc=function(ds){
        self.flag_4="can";
        self.params.dataStoreMor=ds.mor;
        self.select_datastore_name=ds.name;
        self.selectedDS=ds;
        self.getBrowserData.dsName=ds.name;
        self.getBrowserData.dsMor=ds.mor;
        getRootDrive();
    };
    //获取网络列表
    //选择新网络
    self.newNetworkList=[{id:1,network:{}}];
    function getNetworkList(){
        vmService.getNetworkList(self.network_info).then(function(result){
            if(result){
                result.data.forEach((x)=>{
                    x.addressType="generated";
                    x.connectInfo={};
                    x.connectInfo.startConnected=true;
                    x.operation="add";
                })
                self.networkList=result.data;
                if(self.networkList.length>0){
                    self.vaild_network=true;
                    self.initNetwork=self.networkList[0];
                }else{
                    self.initNetwork=[];
                }
                self.newNetworkList=[{id:1,network:self.initNetwork}]; 
            }
        });
    }
    //网络支持多个，port暂时只支持一个。
    self.changeNetwork=function(net,selectedNet){
        self.newNetworkList.forEach((x)=>{
            if(x.id==net.id){
                if(selectedNet.mor.type==="DistributedVirtualPortgroup"){
                    self.show_port_keys=true;
                    self.portList=[];
                    selectedNet.portKeys.forEach((x)=>{
                        self.portList.push({name:x});
                    });
                    if(self.portList.length>0){
                        self.port=self.portList[0];
                        selectedNet.portKey=self.port.name;
                    }
                }else if(selectedNet.mor.type==="Network"){
                    self.show_port_keys=false;
                    selectedNet.portKey="";
                }
                x.network=selectedNet;
            }  
        });
    };
    //选择port
    self.changePort=function(obj){
        self.newNetworkList[0].network.portKey=obj.name;
    };
    //适配器,最终数据完成时添加
    self.adapterList=[{name:"VirtualVmxnet3"},{name:"VirtualE1000"}];
    self.adapter=self.adapterList[0];
    self.changeAdapter=function(obj){
        self.adapter=obj;
    }





    //兼容
    self.compatibilityList=[{name:"ESX/ESXi3.5及更高版本"},{name:"ESX/ESXi4.0及更高版本"},
                       {name:"ESXi 5.0及更高版本"},{name:"ESXi 5.1及更高版本"},
                       {name:"ESXi 5.5及更高版本"}];
    self.compatibility=self.compatibilityList[0];
    self.changeCom=function(compatibility){
        self.compatibility=compatibility;
    };



    //客户机操作系统系列
    self.os_map={};
    self.osSeriesList=[{name:"Windows"},{name:"Linux"}/*,{name:"其他"}*/];
    self.os_map.osSeries=self.osSeriesList[0];
    var os_version_windows=[{name:"Microsoft Windows Server 2003 (64位)",id:"winNetEnterprise64Guest"},
                        {name:"Microsoft Windows Server 2003 (32位)",id:"winNetEnterpriseGuest"},
                        {name:"Microsoft Windows Server 2008 (64位)",id:"winLonghorn64Guest"},
                        {name:"Microsoft Windows Server 2008 (32位)",id:"winLonghornGuest"},
                        {name:"Microsoft Windows Server 2008 R2 (64位)",id:"windows7Server64Guest"},
                        {name:"Microsoft Windows Server 2012 (64位)",id:"windows8Server64Guest"}/*,
                        {name:"Microsoft Windows 8 (32位)",id:"windows8Guest"},
                        {name:"Microsoft Windows 8 (64位)",id:"windows8_64Guest"},
                        {name:"Microsoft Windows 7 (64位)",id:"windows7Guest"},
                        {name:"Microsoft Windows 7 (32位)",id:"windows7_64Guest"}*/];
    var os_version_Linux=[{name:"Red Hat Enterprise Linux6 (64位)",id:"rhel6_64Guest"},
                                {name:"Red Hat Enterprise Linux6 (32位)",id:"rhel6Guest"},
                                {name:"Red Hat Enterprise Linux5 (64位)",id:"rhel5_64Guest"},
                                {name:"Red Hat Enterprise Linux5 (32位)",id:"rhel5Guest"},
                                {name:"SUSE Linux Enterprise 12 (64位)",id:"sles12_64Guest"},
                                {name:"SUSE Linux Enterprise 12 (32位)",id:"sles12Guest"},
                                {name:"SUSE Linux Enterprise 11 (64位)",id:"sles11_64Guest"},
                                {name:"SUSE Linux Enterprise 11 (32位)",id:"sles11Guest"},
                                {name:"CentOS 4/5/6 (64位)",id:"centos64Guest"},
                                {name:"CentOS 4/5/6 (32位)",id:"centosGuest"},
                                {name:"Ubuntu Linux (64位)",id:"ubuntu64Guest"},
                                {name:"Ubuntu Linux (32位)",id:"ubuntuGuest"},
                                {name:"其他 Linux (64位)",id:"otherLinux64Guest"},
                                {name:"其他 Linux (32位)",id:"otherLinuxGuest"}];
    self.osVersionList=os_version_windows;
    self.os_map.osVersion=self.osVersionList[0];
    self.params.config.guestId=self.os_map.osVersion.id;
    self.params.config.guestName=self.os_map.osVersion.name;
    self.changeSeries=function(series){
        self.os_map.osSeries=series;
        if(series.name=="Linux"){
            self.osVersionList=os_version_Linux;
        }else if(series.name=="Windows"){
            self.osVersionList=os_version_windows;
        }
        self.os_map.osVersion=self.osVersionList[0];
        self.params.config.guestId=self.os_map.osVersion.id;
        self.params.config.guestName=self.os_map.osVersion.name;
    };

    //客户机操作系统版本
    self.changeVersion=function(osVersion){
        self.os_map.osVersion=osVersion;
        self.params.config.guestId=self.os_map.osVersion.id;
        self.params.config.guestName=self.os_map.osVersion.name;
    };




    //选择硬件的新设备
    /*self.equipmentList=[{name:"新硬盘",id:"disk"},{name:"网络",id:"network"}];
    self.equipment={name:"选择"};
    self.can_add_equipment=false;
    self.changeEqu=function(equ){
        self.can_add_equipment=true;
        self.equipment=equ;
    }
    self.add_equipment=function(obj){
        if(obj.id==="network"){
            let length=self.newNetworkList.length;
            self.newNetworkList.push({id:length,network:self.initNetwork});
        }else if(obj.id="disk"){
            let length=self.newDiskList.length;
            self.newDiskList.push({id:length,size:""});
        }
    }*/
    
      
      
      
    
    
    //选择cpu数量
    self.cpuNumList=[{name:"1",CpuCount:1},{name:"2",CpuCount:2},{name:"3",CpuCount:3},{name:"4",CpuCount:4}];
    self.cpuNum=self.cpuNumList[0];
    self.params.config.numCPUs=self.cpuNum.CpuCount;
    self.changeCPUNum=function(obj){
        self.cpuNum=obj;
        self.params.config.numCPUs=self.cpuNum.CpuCount;
    }
    //新硬盘数量
    self.newDiskList=[{id:1,size:""}];
    self.params.config.diskSizeMB=self.newDiskList[0].size;
    self.change_disk_size=function(obj,size){
        //这里暂时只支持一个硬盘
        //self.params.config.diskSizeMB=size;
    }
    
    
    
    
    

    
    
    //新软盘驱动器
    self.floppyList=[{name:"客户端设备"},{name:"使用现有软盘镜像"},{name:"创建新软盘映像"}];
    self.floppy=self.floppyList[0];
    self.newFloppyList=[{id:1,floppy:self.floppy},{id:2,floppy:self.floppy}];
    self.changeFloppy=function(floppy,selectedFloppy){
        self.newFloppyList.forEach((x)=>{
            if(x.id==floppy.id){
                x.floppy=selectedFloppy
            }
        });
    };




    //选择显卡
    self.dispalycardList=[{name:"指定自定义设置"},{name:"自动检测设备"}];
    self.dispalycard={};
    self.dispalycard.type=self.dispalycardList[0];
    self.dispalycard.num={name:1,number:1};
    self.changeDispCardNum=function(num){
        self.dispalycard.num=num;
    };
    self.dispalycardNumList=[{name:1,number:1},{name:2,number:2},{name:3,number:3},{name:4,number:4}]
    self.compute_memory=function(){
        let scope = self.$new();
           scope.data = {
                card_number:{name:"1",value:1},
                card_number_list:[{name:"1",value:1},{name:"2",value:2},{name:"3",value:3}],
                screen_resolution:{name:"1024*708",value:1},
                screen_resolution_list:[{name:"1024*708",value:1},{name:"600*800",value:2}]
           };
           scope.data.total_memory=(scope.data.card_number.value)*(scope.data.screen_resolution.value);
           scope.change_card_number=function(obj){
                scope.data.card_number=obj;
                scope.data.total_memory=(scope.data.card_number.value)*(scope.data.screen_resolution.value);
           };
           scope.change_screen_resolution=function(obj){
                scope.data.screen_resolution=obj;
                scope.data.total_memory=(scope.data.card_number.value)*(scope.data.screen_resolution.value);
           };
           scope.confirm_card=function(){
           }

        let modalInstance =  $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: "computememory.html",
            scope:scope
        });
        return modalInstance.result.then(function(){
            self.Total_video_memory=scope.data.total_memory
        });
    }


    self.unitsList = ["MB","GB","TB"];
    self.unit = {
        memoryUnit:self.unitsList[0],
        diskUnit:self.unitsList[0]
    };

    //完成函数
    self.canConfirm=true;
    self.vmConfirm=function(){
        self.canConfirm=false;
        self.params.config.cdroms=[{
            "operation":"add",
            "remote":false,
            isoPath:self.selected_cdrom_data,
            "connectInfo":{
                "startConnected":true
            }
        }];
        self.newNetworkList[0].network.adapter=self.adapter.name;
        self.params.config.networks=[self.newNetworkList[0].network];
        //self.params.config.diskSizeMB=Number(self.params.config.diskSizeMB);
        //self.params.config.memoryMB=Number(self.params.config.memoryMB);
        if(self.unit.memoryUnit == "GB"){
            self.params.config.memoryMB = Number(self.params.config.memoryMB)*1024;
        }else if(self.unit.memoryUnit == "TB"){
            self.params.config.memoryMB = Number(self.params.config.memoryMB)*1024*1024;
        }else{
            self.params.config.memoryMB=Number(self.params.config.memoryMB);
        }
        if(self.unit.diskUnit == "GB"){
            self.params.config.diskSizeMB = Number(self.params.config.diskSizeMB)*1024;
        }else if(self.unit.diskUnit == "TB"){
            self.params.config.diskSizeMB = Number(self.params.config.diskSizeMB)*1024*1024;
        }else{
            self.params.config.diskSizeMB=Number(self.params.config.diskSizeMB);
        }
        self.params.config.disks=[{
            "operation":"add",
            "diskSizeMB":self.params.config.diskSizeMB,
            "diskType":"thick"
        }];
        vmService.createVM(self.params).then(function(result){
            if(localStorage.form_location){
                if(localStorage.form_location=="virtualmachine"){
                    $location.url("/virtualmachine");
                }else if(localStorage.form_location=="datacenter"){
                    $location.url("/datacenter/objects/vm");
                }else if(localStorage.form_location=="host"){
                    $location.url("/host/objects/vm");
                }
            }
            
        });
    }

}
