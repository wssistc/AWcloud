storageDiskCtrl.$inject=["$scope", "$timeout", "$location", "NgTableParams","parameter","type","storageManagementSrv","$translate"];
function storageDiskCtrl($scope,$timeout, $location,NgTableParams,parameter,storageManagementSrv,$translate,nodeMapList,storageNodeData){
    var self = $scope;
    var checkedItems = parameter.checkedItems;
    var type = parameter.type;
    var diskData = parameter.diskData;
    var initDiskTable = parameter.initDiskTable;

    function initDiskConfig(diskParams,checkedItems,type){ 
        self.nodeName=checkedItems[0].hostName;
        localStorage.diskCheckedItems = JSON.stringify(checkedItems);
        self.diskscachType = [
            {name:$translate.instant("aws.storage.device.caching"),mode:"bcache"},
            {name:$translate.instant("aws.storage.device.logDisk"),mode:"raw_multi_journal"}
            //{name:"",mode:"journal_collocation"}
        ]
        var diskCheckedItems =null;
        var disks = $("#disks")[0];
        if(localStorage.diskCheckedItems&&type=='ceph'){
            diskCheckedItems = JSON.parse(localStorage.diskCheckedItems)[0];
            var cephDiskConfig = JSON.parse(localStorage.cephDiskConfig);
            if(cephDiskConfig[diskCheckedItems.nodeUid]&&cephDiskConfig[diskCheckedItems.nodeUid].disksJson){
                self.disksJson = cephDiskConfig[diskCheckedItems.nodeUid].disksJson;
            }else{
                self.disksJson = {
                    "disks":diskCheckedItems.hostInfoMap.disks,
                    "configGroup":[
                        {   
                            "show":true,
                            "cachingSum":0,
                            "dataSum":0,
                            "cachingRatio":0,
                            "dataRatio":0,
                            "selected":self.diskscachType[0],
                            "caching":[  
                            ],
                            "data":[  
                            ]
                        }
                    ]
                }
            }
        }else{
            diskCheckedItems = JSON.parse(localStorage.diskCheckedItems)[0];
            var nodeConfig = JSON.parse(localStorage.nodeConfig);
            if(nodeConfig[diskCheckedItems.nodeUid]&&nodeConfig[diskCheckedItems.nodeUid].disksJson){
                self.disksJson = nodeConfig[diskCheckedItems.nodeUid].disksJson;
            }else{
                self.disksJson = {
                    "disks":[],
                    //"disks":diskCheckedItems.hostInfoMap.disks,
                    "configGroup":[
                        {   
                            "show":true,
                            "cachingSum":0,
                            "dataSum":0,
                            "cachingRatio":0,
                            "dataRatio":0,
                            "selected":self.diskscachType[0],
                            "caching":[  
                            ],
                            "data":[  
                            ]
                        }
                    ]
                }
                storageManagementSrv.getNodeDisk(diskParams).then(function(res){
                    if(res && res.data) {
                        self.disksJson.disks = angular.fromJson(res.data);
                    }
                })
            }
        }

        /*数据初始化*/
        function sumDisk(item,type){
            var sum = 0;
            item[type].forEach(function(v){
                if(self.insideCephShow){
                    if(v.capacity.indexOf('TB')>-1){
                        var vCapacity = v.capacity;
                        vCapacity=vCapacity.replace("TB",'');
                        sum+=vCapacity*1024;
                    }else{
                        var vCapacity = v.capacity;
                        vCapacity=vCapacity.replace("GB",'');
                        sum+=Number(vCapacity);
                    }  
                }else{
                    if(v.size.indexOf('T')>-1){
                        var vCapacity = v.size;
                        vCapacity=vCapacity.replace("T",'');
                        sum+=vCapacity*1024;
                    }else{
                        var vCapacity = v.size;
                        vCapacity=vCapacity.replace("G",'');
                        sum+=Number(vCapacity);
                    }  
                }
                
            })
            if(type=='caching'){
                item.cachingSum = sum;
            }else{
                item.dataSum = sum;
            }
        } 
        function sumRatio(item){
            item.cachingRatio = (item.cachingSum/(item.cachingSum+item.dataSum)).toFixed(1);
            item.dataRatio = 100 +'%';
            item.cachingRatio = item.cachingRatio*100 +'%';
            item.dataSum=item.dataSum.toFixed(2);
            item.cachingSum=Number(item.cachingSum).toFixed(2);
        }
        function Superposition(i,name){
            /*缓存盘或者日志盘只能配一块盘*/
            if(self.insideCephShow){
               if(name=='caching'&&self.disksJson.configGroup[i][name].length>0){
                    return;
               }
            }else{
               if(name=='data'&&self.disksJson.configGroup[i][name].length>0){
                    return;
               }
            }
            self.disksJson.configGroup[i][name].push(self.disksJson.disks[disksIndex]);
            self.disksJson.disks.splice(disksIndex,1);
            sumDisk(item,'caching')
            sumDisk(item,'data')
            sumRatio(item)
            self.$apply()
        }
        var cachingIndex = null;
        var dataIndex = null;
        for(var i=0;i<self.disksJson.configGroup.length;i++){
            var item = self.disksJson.configGroup[i];
            sumDisk(item,'caching')
            sumDisk(item,'data')
            sumRatio(item)
        }
        $timeout(function(){
            for(var i=0;i<self.disksJson.configGroup.length;i++){
                if(self.insideCephShow){
                   // $(".caching")[i].addEventListener('drop',function(event){
                   //     event.preventDefault();
                   //     cachingIndex= $(this).attr('indexNum');
                   //     Superposition(cachingIndex,'caching');
                   // })
                   $(".caching")[i].ondrop = function(event){
                       event.preventDefault();
                       cachingIndex= $(this).attr('indexNum');
                       Superposition(cachingIndex,'caching');
                   }
                }
                $(".data")[i].ondrop=function(event){
                    event.preventDefault();
                    dataIndex= $(this).attr('indexNum');
                    Superposition(dataIndex,'data');
                }
            }
        },300)
        /*删除磁盘*/
        self.deleteDisks = function(index,type,item){
            /*1.删除元素并添加到可用区域*/
            self.disksJson.disks.push(item[type][index])
            item[type].splice(index,1);
            /*2.所占比例更新*/
            sumDisk(item,'caching')
            sumDisk(item,'data')
            sumRatio(item)
        }

        /*记住拖动哪个磁盘*/
        var disksIndex = null;
        // $(".no-use-disks")[0].addEventListener('dragstart',function(event){
        //     disksIndex = $(event.target).attr('indexNum');
        //     event.dataTransfer.setData("text/html",$(this).prop("outerHTML"));
        // },false)
        $(".no-use-disks")[0].ondragstart = function(event){
            disksIndex = $(event.target).attr('indexNum');
            event.dataTransfer.setData("text/html",$(this).prop("outerHTML"));
        }

        disks.ondragenter = function(event){
            event.preventDefault();
        }
        disks.ondragover = function(event){
            event.preventDefault();
        }

        /*保存磁盘配置*/
        self.saveDisks = function(){
            var dataCheck = true;
            /*遍历所有的数据盘不能为空*/
            for(var i=0;i<self.disksJson.configGroup.length;i++){
                if(self.disksJson.configGroup[i].data.length==0){
                    dataCheck = false;
                }
            }
            if(dataCheck){
                var diskCheckedItems = JSON.parse(localStorage.diskCheckedItems)
                if(self.insideCephShow){
                    diskCheckedItems.forEach(function(item){
                        var nodeId = item.nodeUid;
                        var cephDiskConfig = JSON.parse(localStorage.cephDiskConfig);
                        cephDiskConfig[nodeId] = {}
                        cephDiskConfig[nodeId].disksJson = self.disksJson;
                        localStorage.cephDiskConfig = JSON.stringify(cephDiskConfig);
                    })
                    storageNodeData.forEach(item=>{
                        diskCheckedItems.forEach(function(checkItem){
                             if(item.nodeUid == checkItem.nodeUid){
                                var diskNameArr=[];
                                self.disksJson.configGroup[0].data.forEach(function(item){
                                    diskNameArr.push("/dev/"+item.name);
                                });
                                item.disk_config=diskNameArr.join(", ");
                                item.disk_speed = self.disksJson.configGroup[0].data[0].capacity;
                                //新增日志盘
                                item.disk_ssd_ceph=self.disksJson.configGroup[0].caching.length>0?("/dev/"+self.disksJson.configGroup[0].caching[0].name):"";
                                nodeMapList[item.nodeUid] = {
                                    disk_config:item.disk_config,
                                    disk_speed:item.disk_speed,
                                    disk_ssd_ceph:item.disk_ssd_ceph
                                }
                            }
                        });
                    })

                    self.getback();
                }else{
                    diskCheckedItems.forEach(function(item){
                        var nodeId = item.nodeUid;
                        var nodeConfig = JSON.parse(localStorage.nodeConfig);
                        nodeConfig[nodeId] = {}
                        nodeConfig[nodeId].disksJson = self.disksJson;
                        localStorage.nodeConfig = JSON.stringify(nodeConfig);
                    })
                    diskData.forEach(item=>{
                        if(item.nodeUid == diskCheckedItems[0].nodeUid){
                            item.disk_config = self.disksJson.configGroup[0].data[0].path;
                            item.disk_speed = self.disksJson.configGroup[0].data[0].size;
                            item.uid = self.disksJson.configGroup[0].data[0].uid;
                        }
                    })
                    initDiskTable(diskData);
                    self.backStoNode();
                }
            }else{
                self.dataTips = true;
                $timeout(function(){
                    self.dataTips = false;
                },2000)
            }
        }
    }

    if(type=='fc'){
        var diskParams = {
            nodeName:checkedItems[0].hostName
            // isMultipath:self.storage.fc.multipath?1:0
        }
        if(!localStorage.nodeConfig){
            localStorage.nodeConfig = JSON.stringify({});
        }
    }else if(type=='ceph'){
        if(!localStorage.cephDiskConfig){
            localStorage.cephDiskConfig = JSON.stringify({});
        }
    }
    self.showType ='disk';
    $timeout(function(){
        initDiskConfig(diskParams,checkedItems,type)
    },200)








 }
export {storageDiskCtrl}