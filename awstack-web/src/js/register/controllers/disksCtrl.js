disksCtrl.$inject=["$scope", "$http","$timeout", "$location", "$routeParams", "$interval","$translate"];
export function disksCtrl($scope, $http,$timeout, $location,$routeParams, $interval,$translate){
    var self = $scope;
    var patternSelected = JSON.parse(localStorage.patternSelected);
    self.disksType = patternSelected.value;
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
                ]
            }
        ]
    }
    if(localStorage.diskCheckedItems){
        diskCheckedItems = JSON.parse(localStorage.diskCheckedItems)[0];
        var nodeConfig = JSON.parse(localStorage.nodeConfig);
        if(nodeConfig[diskCheckedItems.nodeUid].disksJson){
            self.disksJson = nodeConfig[diskCheckedItems.nodeUid].disksJson;
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
        item.dataRatio = (1-item.cachingRatio)*100 +'%';
        item.cachingRatio = item.cachingRatio*100 +'%';
        item.dataSum=item.dataSum.toFixed(2);
        item.cachingSum=item.cachingSum.toFixed(2);
    }
    function Superposition(i,name){
        /*缓存盘或者日志盘只能配一块盘*/
        if(patternSelected.value="deliver"&&name=='data'&&self.disksJson.configGroup[i][name].length>0){
            return;
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
        }
    },300)

    // /*新增缓存数据组*/
    // self.addGroup=function(){
    //     var groupData = { 
    //             "show":true,
    //             "cachingSum":0,
    //             "dataSum":0,
    //             "cachingRatio":0,
    //             "dataRatio":0,
    //             "selected":self.diskscachType[0],
    //             "caching":[
                    
    //             ],
    //             "data":[
                    
    //             ]
    //         }
    //     /*校验数据盘数据是否为空*/
    //     if(self.disksJson.configGroup[self.disksJson.configGroup.length-1].data.length>0){
    //         self.disksJson.configGroup.push(groupData);
    //         $timeout(function(){
    //             $(".caching")[self.disksJson.configGroup.length-1].addEventListener('drop',function(event){
    //                 event.preventDefault();
    //                 cachingIndex= $(this).attr('indexNum');
    //                 if(self.disksJson.configGroup[cachingIndex].caching.length==0){
    //                     self.disksJson.configGroup[cachingIndex].caching.push(self.disksJson.disks[disksIndex]);
    //                     self.disksJson.disks.splice(disksIndex,1);
    //                     sumDisk(self.disksJson.configGroup[cachingIndex],'caching')
    //                     sumDisk(self.disksJson.configGroup[cachingIndex],'data')
    //                     sumRatio(self.disksJson.configGroup[cachingIndex])
    //                     self.$apply()
    //                 }
    //             })
    //             $(".data")[self.disksJson.configGroup.length-1].addEventListener('drop',function(event){
    //                 event.preventDefault();
    //                 dataIndex= $(this).attr('indexNum');
    //                 self.disksJson.configGroup[dataIndex].data.push(self.disksJson.disks[disksIndex]);
    //                 self.disksJson.disks.splice(disksIndex,1);
    //                 sumDisk(self.disksJson.configGroup[dataIndex],'caching')
    //                 sumDisk(self.disksJson.configGroup[dataIndex],'data')
    //                 sumRatio(self.disksJson.configGroup[dataIndex])
    //                 self.$apply()
    //             })
    //         },300)
    //     }else{
    //         self.dataTips = true;
    //         $timeout(function(){
    //             self.dataTips = false;
    //         },2000)
    //     }  
    // }

    // /*删除缓存盘组*/
    // self.deleteDisksGroup = function(i){
    //     /*删除磁盘恢复*/
    //     for(var j=0;j<self.disksJson.configGroup[i].data.length;j++){
    //         self.disksJson.disks.push(self.disksJson.configGroup[i].data[j])
    //     }
    //     for(var g=0;g<self.disksJson.configGroup[i].caching.length;g++){
    //         self.disksJson.disks.push(self.disksJson.configGroup[i].caching[g])
    //     }
    //     self.disksJson.configGroup.splice(i,1);
    // }

    // /*缓存盘组的显示隐藏*/
    // self.showConfDetail=function(item){
    //     item.show=!item.show
    // }

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
    //     console.log('aaaaaaa')
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
        /*
            1.目前软件交付模式底层支持不配置磁盘配置也最多配置一块磁盘---雷文豪，罗超群

         */
        //var dataCheck = true;
        /*遍历所有的数据盘不能为空*/
        // for(var i=0;i<self.disksJson.configGroup.length;i++){
        //     if(self.disksJson.configGroup[i].data.length==0){
        //         dataCheck = false;
        //     }
        // }
        //if(dataCheck){
            var diskCheckedItems = JSON.parse(localStorage.diskCheckedItems)
            diskCheckedItems.forEach(function(item){
                var nodeId = item.nodeUid;
                var nodeConfig = JSON.parse(localStorage.nodeConfig);
                nodeConfig[nodeId].disksJson = self.disksJson;
                localStorage.nodeConfig = JSON.stringify(nodeConfig);
            })
            $location.path("/info/stepone")      
        // }else{
        //     self.dataTips = true;
        //     $timeout(function(){
        //         self.dataTips = false;
        //     },2000)
        // }
    }
}