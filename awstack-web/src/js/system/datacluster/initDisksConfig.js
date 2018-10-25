initDisksCtrl.$inject=["$scope", "$http","$timeout", "$location", "$routeParams", "$interval","$translate","dataclusterSrv"];
function initDisksCtrl($scope, $http,$timeout, $location,$routeParams, $interval,$translate,dataclusterSrv){
    var self = $scope;
    //三个tab页的active控制
    self.insDisk=true;
    self.shareDisk=false;
    self.cephDisk=false;

    self.activeDiskTab=function(type){
       if(type=='ins'){
          self.insDisk=true;
          self.shareDisk=false;
          self.cephDisk=false;
       }else if(type=='share'){
          self.insDisk=false;
          self.shareDisk=true;
          self.cephDisk=false;
       }else if(type=='ceph'){
          self.insDisk=false;
          self.shareDisk=false;
          self.cephDisk=true;
       }
       //已经进行过保存，初始展示保存的tab页，切换以后进行清空
       // if(self.disksJson.selectedDiskTab){
       //    if(type!=self.disksJson.selectedDiskTab){
       //        self.hasConfigDisks=false;
       //        var selectedDiskTab=self.disksJson.selectedDiskTab;
       //        //清空页面上的数据
       //        self.disksJson = {
       //          "disks":angular.copy(diskCheckedItems.hostInfoMap.disks),
       //          "configGroup":[
       //              {   
       //                  "show":true,
       //                  "cachingSum":0,
       //                  "dataSum":0,
       //                  "cachingRatio":0,
       //                  "dataRatio":0,
       //                  "selected":self.diskscachType[0],
       //                  "caching":[  
       //                  ],
       //                  "data":[  
       //                  ],
       //                  "localdisk":[
       //                  ]
       //              }
       //          ],
       //          "selectedDiskTab":selectedDiskTab
       //        };
       //        //清空localstorage里面的数据
       //        diskCheckedItems = JSON.parse(localStorage.initConfigDiskCheckedItems)[0];
       //        var nodeConfig = JSON.parse(localStorage.nodeConfig);
       //        nodeConfig[diskCheckedItems.nodeUid].disksJson=null;
       //        localStorage.nodeConfig = JSON.stringify(nodeConfig);
       //    }
       // }else if(!self.disksJson.selectedDiskTab){
       // //没有进行过保存，只需清楚页面上的数据
       //    self.hasConfigDisks=false;
       //    self.disksJson = {
       //      "disks":angular.copy(diskCheckedItems.hostInfoMap.disks),
       //      "configGroup":[
       //          {   
       //              "show":true,
       //              "cachingSum":0,
       //              "dataSum":0,
       //              "cachingRatio":0,
       //              "dataRatio":0,
       //              "selected":self.diskscachType[0],
       //              "caching":[  
       //              ],
       //              "data":[  
       //              ],
       //              "localdisk":[
       //              ]
       //          }
       //      ]
       //    };
       // }
       addEventListenerDrop();
    };

    var patternSelected = JSON.parse(localStorage.patternSelected);
    self.diskscachType = [
        {name:"缓存盘",mode:"bcache"},
        {name:"日志盘",mode:"raw_multi_journal"}
        //{name:"",mode:"journal_collocation"}
    ]
    var diskCheckedItems =null;
    var disks = $("#disks")[0];
    self.disksJson = {
        "disks":[
            {
                "status":true,
                "ssd":false,
                "capacity":"59.63 GB",
                "name":"sda"
            },
            {
                "status":true,
                "ssd":false,
                "capacity":"59.63 GB",
                "name":"sda"
            }
        ],
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
                ],
                "localdisk":[
                ]
            }
        ]
    }
    if(localStorage.initConfigDiskCheckedItems){
        diskCheckedItems = JSON.parse(localStorage.initConfigDiskCheckedItems)[0];
        var nodeConfig = JSON.parse(localStorage.nodeConfig);
        if(nodeConfig[diskCheckedItems.nodeUid].disksJson){
            self.disksJson = nodeConfig[diskCheckedItems.nodeUid].disksJson;
            //显示已经保存过一次的diskTab页
            if(self.disksJson.selectedDiskTab){
               self.activeDiskTab(self.disksJson.selectedDiskTab);
            }
        }else{
            self.disksJson = {
                "disks":angular.copy(diskCheckedItems.hostInfoMap.disks),
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
                        ],
                        "localdisk":[
                        ]
                    }
                ]
            }  
        }
    }
    //判断硬盘配置中三个tab页的展示(初始化设置为false)
    //超融合模式下只显示ceph
    self.showCephTab=false;
    self.showInsTab=false;
    if(localStorage.isCustom=='true'){
       self.showCephTab=true;
       self.showInsTab=false;
       self.activeDiskTab('ceph');
    }else{
    //软件交付
       dataclusterSrv.getStorageList().then(function(res){
          if(res&&res.data&&angular.isArray(res.data)){
             self.storageList=res.data.filter(function(item){
                 return item.use==0;
             });
             if(self.storageList.length>0){
                for(var i=0;i<self.storageList.length;i++){
                    if(self.storageList[i].storageFirm=='ceph'){
                       self.hasCephStorage=true;
                       break;
                    }
                }
                if(self.hasCephStorage){
                    self.showCephTab=true;
                    self.showInsTab=true;
                    //显示已经保存过一次的diskTab页
                    if(self.disksJson.selectedDiskTab){
                       self.activeDiskTab(self.disksJson.selectedDiskTab);
                    }else{
                       self.activeDiskTab('ins');
                    }
                }else{
                    self.showCephTab=false;
                    self.showInsTab=true;
                    self.activeDiskTab('ins');
                }
             }else{
                //未对接存储，只显示本地盘空间
                self.showCephTab=false;
                self.showInsTab=true;
                self.activeDiskTab('ins');
             }
          }
       });
    }

    /*数据初始化*/
    function sumDisk(item,type){
        var sum = 0;
        item[type].forEach(function(v){
            if(v.capacity.indexOf('TB')>-1){
                var vCapacity = v.capacity;
                vCapacity=vCapacity.replace(" TB",'');
                sum+=vCapacity*1024;
            }else{
                var vCapacity = v.capacity;
                vCapacity=vCapacity.replace(" GB",'');
                sum+=Number(vCapacity);
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
        if(self.cephDisk){
           if(patternSelected.value="deliver"&&name=='caching'&&self.disksJson.configGroup[i][name].length>0){
              return;
           }
        }else{
           if(patternSelected.value="deliver"&&name=='localdisk'&&self.disksJson.configGroup[i][name].length>0){
              return;
           }
        }
        self.disksJson.configGroup[i][name].push(self.disksJson.disks[disksIndex]);
        self.disksJson.disks.splice(disksIndex,1);
        // sumDisk(item,'caching')
        // sumDisk(item,'data')
        // sumRatio(item)
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

    function addEventListenerDrop(){
       $timeout(function(){
            for(var i=0;i<self.disksJson.configGroup.length;i++){
                if(self.cephDisk){
                    // $(".caching")[i].addEventListener('drop',function(event){
                    //     event.preventDefault();
                    //     cachingIndex= $(this).attr('indexNum');
                    //     Superposition(cachingIndex,'caching');
                    // });
                    // $(".data")[i].addEventListener('drop',function(event){
                    //     event.preventDefault();
                    //     dataIndex= $(this).attr('indexNum');
                    //     Superposition(dataIndex,'data');
                    // });

                    $(".caching")[i].ondrop = function(event){
                      event.preventDefault();
                      cachingIndex= $(this).attr('indexNum');
                      Superposition(cachingIndex,'caching');   
                    }

                    $(".data")[i].ondrop = function(event){
                      event.preventDefault();
                      dataIndex= $(this).attr('indexNum');
                      Superposition(dataIndex,'data');
                    }  
                }else{
                    // $(".localdisk")[i].addEventListener('drop',function(event){
                    //     event.preventDefault();
                    //     dataIndex= $(this).attr('indexNum');
                    //     Superposition(dataIndex,'localdisk');
                    // });
                    $(".localdisk")[i].ondrop = function(event){
                      event.preventDefault();
                      dataIndex= $(this).attr('indexNum');
                      Superposition(dataIndex,'localdisk');
                    }

                }  
            }
        },300);
    }
    /*删除磁盘*/
    self.deleteDisks = function(index,type,item){
        /*1.删除元素并添加到可用区域*/
        self.disksJson.disks.push(item[type][index])
        item[type].splice(index,1);
        //如果drop区域数据为空，认为没有配置磁盘,且重新保存数据
        self.hasConfigDisks=false;
        var diskCheckedItems = JSON.parse(localStorage.initConfigDiskCheckedItems)
        diskCheckedItems.forEach(function(item){
            var nodeId = item.nodeUid;
            var nodeConfig = JSON.parse(localStorage.nodeConfig);
            nodeConfig[nodeId].disksJson = self.disksJson;
            localStorage.nodeConfig = JSON.stringify(nodeConfig);
        });

        /*2.所占比例更新*/
        sumDisk(item,'caching')
        sumDisk(item,'data')
        sumRatio(item)
    }

    /*记住拖动哪个磁盘*/
    var disksIndex = null;

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

    // $(".no-use-disks")[0].addEventListener('dragstart',function(event){
    //     disksIndex = $(event.target).attr('indexNum');
    //     event.dataTransfer.setData("text/html",$(this).prop("outerHTML"));
    // },false)
 
    // disks.addEventListener('dragenter',function(event){
    // },false)
    // disks.addEventListener('dragover',function(event){
    //     event.preventDefault();
    // },false)

    /*保存磁盘配置*/
    self.saveDisksConfig = function(){
        self.hasConfigDisks=true;
        /*遍历所有的数据盘不能为空*/
        self.noDisk = false;
        self.noCephDisk=false;
        //软件交付下对接超融合ceph，本地盘和ceph都显示（ceph为必填，本地盘为选填）
        if(self.hasCephStorage){
           //是否有本地盘的判断
           for(var i=0;i<self.disksJson.configGroup.length;i++){
                if(self.disksJson.configGroup[i].data.length==0){
                    self.noCephDisk=true;
                    self.hasConfigDisks=false;
                }
            }
            self.noDisk=self.noCephDisk;
            if(self.noDisk){
               $timeout(function(){
                     self.noDisk = false;   
               },1500);
               return;
            }
        }else{
            if(self.cephDisk){
                for(var i=0;i<self.disksJson.configGroup.length;i++){
                    if(self.disksJson.configGroup[i].data.length==0){
                        self.noDisk=true;
                        self.hasConfigDisks=false;
                        $timeout(function(){
                             self.noDisk = false;   
                        },1500)
                        return;
                    }
                }
            }
        }
        
        if(!self.noDisk){
            self.saveDisksSuccess=true;
            $timeout(function(){
                 self.saveDisksSuccess = false;   
            },1500);
            var diskCheckedItems = JSON.parse(localStorage.initConfigDiskCheckedItems)
            diskCheckedItems.forEach(function(item){
                var nodeId = item.nodeUid;
                var nodeConfig = JSON.parse(localStorage.nodeConfig);
                nodeConfig[nodeId].disksJson = self.disksJson;
                nodeConfig[nodeId].disksJson.selectedDiskTab=self.insDisk?'ins':self.cephDisk?'ceph':'share';
                localStorage.nodeConfig = JSON.stringify(nodeConfig);
            }); 
        }else{
            self.hasConfigDisks=false; 
        }
    }
}
export {
    initDisksCtrl
}
