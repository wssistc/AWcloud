steponeCtrl.$inject=["$scope","$http","$timeout" ,"$location", "$routeParams", "$interval","$translate","$uibModal"];
export function steponeCtrl($scope, $http,$timeout, $location, $routeParams, $interval,$translate,$uibModal){
    var self = $scope;
    var hyperConfig = window.hyperConfig;

    var loginsData = localStorage.LOGINS ? JSON.parse(localStorage.LOGINS) : "";
    self.stepOneData = [];
    self.hostNameList = {};
    var stepOneTemp = [];
    if(!localStorage.nodeConfig){
        localStorage.nodeConfig = JSON.stringify({});
    }
    if(!localStorage.diskCardConfig){
        localStorage.diskCardConfig = JSON.stringify({});
    }
    self.diskscachType = [
        {name:"缓存盘",mode:"bcache"},
        {name:"日志盘",mode:"raw_multi_journal"}
        //{name:"",mode:"journal_collocation"}
    ]
    /*超融合模式下磁盘网卡拼接*/
    function sumRatio(item){
        item.cachingRatio = (item.cachingSum/(Number(item.cachingSum)+Number(item.dataSum))).toFixed(1);
        item.dataRatio = (1-Number(item.cachingRatio))*100 +'%';
        item.cachingRatio = item.cachingRatio*100 +'%';
    }
    function sumDisk(item,type){
        var sum = 0;
        item[type].forEach(function(v){
            if(v){
                if(v.capacity.indexOf('TB')>-1){
                    var vCapacity = v.capacity;
                    vCapacity=vCapacity.replace(" TB",'');
                    sum+=vCapacity*1024;
                }else{
                    var vCapacity = v.capacity;
                    vCapacity=vCapacity.replace(" GB",'');
                    sum+=Number(vCapacity);
                }
            }
        })
        if(type=='caching'){
            item.cachingSum = sum.toFixed(2);
        }else{
            item.dataSum = sum.toFixed(2);
        }
    } 
    var hyperCard = false;
    /*使用by排序兼容edge浏览器*/
    function by(name){
        return function(o, p){
           var a, b;
           if (typeof o === "object" && typeof p === "object" && o && p) {
             a = o[name];
             b = p[name];
             if (a === b) {
               return 0;
             }
             if (typeof a === typeof b) {
               return a < b ? -1 : 1;
             }
             return typeof a < typeof b ? -1 : 1;
           }
           else {
             throw ("error");
           }
        }
    }

    /*硬盘配置*/
    self.disksconfigure = function(checkedItems){
        localStorage.diskCheckedItems = JSON.stringify(checkedItems);
        var checkDiskData = [];
        for(var i=0;i<checkedItems.length;i++){
            var disksItems = [];
            for(var j=0;j<checkedItems[i].hostInfoMap.disks.length;j++){
                var diska = {
                    "capacity":checkedItems[i].hostInfoMap.disks[j].capacity,
                    "name":checkedItems[i].hostInfoMap.disks[j].name,
                    "ssd":checkedItems[i].hostInfoMap.disks[j].ssd,
                    "status":checkedItems[i].hostInfoMap.disks[j].status
                }
                disksItems.push(diska)
            }
            var diskItems = {
                "disks":disksItems
            }
            checkDiskData.push(diskItems)
        }
        for(var i=0;i<checkDiskData.length-1;i++){
            var firstDisk = JSON.stringify(checkDiskData[i].disks.sort(by('name')));
            var elseDisk = JSON.stringify(checkDiskData[i+1].disks.sort(by('name')));
            if(firstDisk!=elseDisk){
                self.isDiskChecked =true;
                $timeout(function(){
                    self.isDiskChecked =false;
                },2000)
                return;
            }
        }
        
        checkedItems.forEach(function(item){
            var nodeId = item.nodeUid;
            var nodeConfig = JSON.parse(localStorage.nodeConfig);
            if(nodeConfig[nodeId]){

            }else{
                nodeConfig[nodeId]={disksJson:null,cardJson:null};
                localStorage.nodeConfig = JSON.stringify(nodeConfig);
            }
        })
        $location.path("/info/disks");
    }

    /*网络配置*/
    self.cardconfigure = function(checkedItems){
        localStorage.cardCheckedItems = JSON.stringify(checkedItems);
        for(var i=0;i<checkedItems.length;i++){
            var firstCard = JSON.stringify(checkedItems[0].hostInfoMap.nics.sort(by('name')));
            var elseCard = JSON.stringify(checkedItems[i].hostInfoMap.nics.sort(by('name')));
            if(firstCard!=elseCard){
                self.isCardChecked =true;
                $timeout(function(){
                    self.isCardChecked =false;
                },2000)
                return;
            }
        }
        checkedItems.forEach(function(item){
            var nodeId = item.nodeUid;
            var nodeConfig = JSON.parse(localStorage.nodeConfig);
            if(nodeConfig[nodeId]){

            }else{
                nodeConfig[nodeId]={disksJson:null,cardJson:null};
                localStorage.nodeConfig = JSON.stringify(nodeConfig);
            }
        })
        $location.path("/info/cards");
    }
    
    self.isErrorFunc = function(obj) {
        var reg = /^([1-9]\d?)(-([1-9]\d?))?(-([1-9]\d?))?$/;
        if (obj.hostInfoMap.fault_domain!="") {
            if (!reg.test(obj.hostInfoMap.fault_domain)) {
                self.faultError= true;
                obj.isError = true;
                obj.errorMessage = $translate.instant("aws.errors.fault_domain");
            } else {
                self.faultError= false;
                obj.isError = false;
                obj.errorMessage = "";
            }
        }else {
            self.faultError= false;
            obj.isError = false;
            obj.errorMessage = "";
        }
    };

    self.editFault = function(item){
        if(item.isError==false){
            var hostInfoData = JSON.parse(item.hostInfo);
            hostInfoData.fault_domain = item.hostInfoMap.fault_domain;
            var LOGINS=JSON.parse(localStorage.LOGINS);
            $http({
                method: "PUT",
                url: "/awstack-user/back/v1/enterprises/"+LOGINS.enterpriseUid+"/nodes/"+item.nodeUid+"/hostinfo",
                data:hostInfoData
            })
        }
    }

    function sortNumber(a,b){
        return _IP.toLong(a.hostInfoMap.ip) - _IP.toLong(b.hostInfoMap.ip);
    }

    var chkall = function() {
        self.checkboxes = {
            checked: false,
            items: {}
        };
        self.$watch(function() {
            return self.checkboxes.checked;
        }, function(value) {
            angular.forEach(self.stepOneData, function(item) {
                self.checkboxes.items[item.nodeUid] = value;
            });
        });
        self.$watch(function() {
            return self.checkboxes.items;
        }, function(value) {
            var checkedNum=0;
            for (var i in value) {
                if(value[i]){
                   checkedNum++; 
                }   
            }
            self.diskDisable = true;
            self.cardDisable = true;
            if(checkedNum>0){
                self.cardDisable = false;
                self.diskDisable = false;
            }
            chkDo();
        }, true);
    };

    function changeUnit(v){
        if(v.search(/TB$/i)>-1){
            return Number(v.replace(/TB$/i,""))*1024;
        }else if(v.search(/PB$/i)>-1){
            return Number(v.replace(/PB$/i,""))*1024*1024;
        }else if(v.search(/GB$/i)>-1){
            return Number(v.replace(/GB$/,""));
        }else if(v.search(/MB$/i)>-1){
            return parseInt(Number(v.replace(/MB$/i,""))/1024);
        }else if(v.search(/KB$/i)>-1){
            return parseInt(Number(v.replace(/KB$/i,""))/1024/1024);
        }
        return 0;
    }

    function setUnit(v){
        if(parseInt(v/(1024*1024)) > 0){
            return {total:(v/(1024*1024)).toFixed(2),unit:"PB"};
        }else if(parseInt(v/1024) > 0){
            return {total:(v/1024).toFixed(2),unit:"TB"};
        }
        return {total:v.toFixed(2),unit:"GB"};
    }

    function checkNode(stepOneData){
        let data = stepOneData;
        let length = data.length;
        /*配置信息要统一 ceph sdn version版本信息 is_custom选择模式*/
        if(length>1){
            for(let i=1;i<length;i++){
                if(data[i-1].hostInfoMap.allow_ceph!==data[i].hostInfoMap.allow_ceph ||
                    data[i-1].hostInfoMap.allow_sdn!==data[i].hostInfoMap.allow_sdn ||
                    data[i-1].hostInfoMap.enable_ceph!==data[i].hostInfoMap.enable_ceph ||
                    data[i-1].hostInfoMap.enable_sdn!==data[i].hostInfoMap.enable_sdn ||
                    data[i-1].hostInfoMap.enable_storage_network!==data[i].hostInfoMap.enable_storage_network ||
                    data[i-1].hostInfoMap.sys_version!==data[i].hostInfoMap.sys_version ||
                    data[i-1].hostInfoMap.is_custom!==data[i].hostInfoMap.is_custom 
                ){
                    self.isChecked = true;
                    break;
                }else{
                    self.isChecked = false;
                }
            }
        }
    }

    var chkDo = function() {
        var checked = 0,
            unchecked = 0,
            total = self.stepOneData.length;
        self.checkedItems = [];
        angular.forEach(self.stepOneData, function(item) {
            checked += (self.checkboxes.items[item.nodeUid]) || 0;
            unchecked += (!self.checkboxes.items[item.nodeUid]) || 0;
            if (self.checkboxes.items[item.nodeUid]) {
                self.editData = angular.copy(item);
                self.checkedItems.push(item);
            }
        });
        if ((unchecked == 0) || (checked == 0)) {
            if (total > 0) {
                self.checkboxes.checked = (checked == total);
            }
        }
        if (checked > 1) {
            self.oneModule.isDisabled = false;
        } else {
            self.oneModule.isDisabled = true;
        }
        checkNode(self.checkedItems);
        angular.element(".select-all").prop("indeterminate", (checked != 0 && unchecked != 0));
    };


    /*
        配置系列
        1.M系列
        2.D/F系列
        3.H/S系列
    */
    self.oneStepType = {
        config_type : hyperConfig,
        pattern_type : [{name:"超融合模式",value:"hyper"},{name:"软件交付模式",value:"deliver"}],
    }

    /*
        在超融合模式下，进行详情数据数据组装，本着和软件交付模式数据格式尽量同步的原则
        1.进行磁盘数据处理
        2.进行网卡数据处理
        （实现方式，在节点里面拿到未配的磁盘网卡信息和配置文件进行比对拼装）
    */
    self.changeConfig=function(v){
        localStorage.configselected = JSON.stringify(v);
        var disk_config = v.disk_config[0].ceph_osd.replace(/\/dev\//g,'').replace(/\s/g,'');
        var disk_config_ssd= v.disk_config[0].ceph_ssd.replace(/\/dev\//g,'').replace(/\s/g,'');
        var nic_map =  v.nic_map;
        var nic_bond = v.bonds;
        disk_config  = disk_config.split(',');
        disk_config_ssd  = disk_config_ssd.split(',');
        var diskCard = {}
        self.stepOneData.forEach(function(item){
            var dc_item = {
                "disksJson":{
                    "configGroup": [
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
                },
                "cardJson": {
                    "nic_map": {
                        "cluster": {},
                        "storage": {},
                        "public": {},
                        "tenant": {},
                        "mgmt": {
                            // "bonds": "NAN",
                            // "speed": 0
                        }
                    },
                    "bonds":{}
                }
            }
            dc_item.cardJson.bonds = v.bonds;
            /*磁盘*/
            for(var i=0;i<disk_config.length;i++){
                var diskName = disk_config[i];
                var disk = item.hostInfoMap.disks.filter(v=>{
                    return v.name == diskName;
                })
                if(disk.length>0){
                    dc_item.disksJson.configGroup[0].data.push(disk[0]);
                }else{
                    dc_item.disksJson.configGroup[0].data=[];
                    break;
                }
            }
            for(var i=0;i<disk_config_ssd.length;i++){
                var diskName_ssd = disk_config_ssd[i];
                var disk_ssd = item.hostInfoMap.disks.filter(v=>{
                    return v.name == diskName_ssd;
                })
                if(disk_ssd.length>0){
                    dc_item.disksJson.configGroup[0].caching.push(disk_ssd[0]);
                }else{
                    dc_item.disksJson.configGroup[0].caching=[];
                    break;
                }
            }
            /*网卡*/
            var nics = item.hostInfoMap.nics;
            function getSpeed(type){
                if(nic_map[type].indexOf('bond')>-1){
                    var bondName = nic_map[type];
                    var cardNname = nic_bond[bondName].nics[0];
                    var nicItem = nics.filter(k=>{return cardNname==k.name});
                }else{
                    var nicItem = nics.filter(k=>{return nic_map[type]==k.name});
                }
                if(nicItem.length>0){
                    dc_item.cardJson.nic_map[type].bonds = nic_map[type].indexOf('bond')>-1?bondName:nicItem[0].name;
                    dc_item.cardJson.nic_map[type].speed = nicItem[0].speed;
                }
            }
            var netType = ["cluster","storage","public","tenant","mgmt"];
            netType.forEach(function(typeItem){
                getSpeed(typeItem)
            })
            sumDisk(dc_item.disksJson.configGroup[0],'data');
            sumDisk(dc_item.disksJson.configGroup[0],'caching');
            sumRatio(dc_item.disksJson.configGroup[0]);
            diskCard[item.nodeUid] = dc_item;
        })
        localStorage.diskCardConfig = JSON.stringify(diskCard);
        
    }

    self.oneModule = {
        editActive: false,
        isDisabled: true,
        chartNum:0,
        configselected:localStorage.configselected?JSON.parse(localStorage.configselected):self.oneStepType.config_type[0],
        faultdomain:localStorage.oneStepData?JSON.parse(localStorage.oneStepData).faultdomain:false,
        patternselected:localStorage.patternSelected?JSON.parse(localStorage.patternSelected):self.oneStepType.pattern_type[0],
        chartDisplay:function(v){
            self.oneModule.chartNum = v;
        },
        chooseFault:function(v){
            console.log(v);
            var oneStepData = {
                faultdomain:v
            }
            localStorage.setItem("oneStepData", JSON.stringify(oneStepData));
        },
        /*查看详情*/
        /*缓存盘组的显示隐藏*/
        showConfDetail:function(item){
            item.show=!item.show
        },
        detailOut: function(b,v){
            self.logOut = b;
            if(b){
                if(v.hostInfoMap.ssdUnit=='GB'){
                    v.hostInfoMap.totalAll = v.hostInfoMap.ssdAll/1024;
                }else{
                    v.hostInfoMap.totalAll = Number(v.hostInfoMap.ssdAll);
                }
                if(v.hostInfoMap.sataUnit=='GB'){
                    v.hostInfoMap.totalAll += v.hostInfoMap.sataAll/1024;
                }else{
                    v.hostInfoMap.totalAll += Number(v.hostInfoMap.sataAll);
                }
            }
            self.detailItem = v;
            if(v){
                var diskCheckedItems = v;
                if(self.oneModule.patternselected.value=='hyper'){
                    var nodeConfig = JSON.parse(localStorage.diskCardConfig);
                }else{
                    var nodeConfig = JSON.parse(localStorage.nodeConfig);
                }
                if(nodeConfig[diskCheckedItems.nodeUid]&&nodeConfig[diskCheckedItems.nodeUid].disksJson){
                    self.disksJson = nodeConfig[diskCheckedItems.nodeUid].disksJson;
                }else{
                    self.disksJson = {
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
                var cardCheckedItems = v; 
                if(nodeConfig[cardCheckedItems.nodeUid]&&nodeConfig[cardCheckedItems.nodeUid].cardJson){
                    self.cardJson = nodeConfig[cardCheckedItems.nodeUid].cardJson;
                }else{
                    self.cardJson = {
                        "nic_map": {
                            "cluster":{},
                            "storage":{},
                            "public": {},
                            "tenant": {},
                            "mgmt":   {}
                        }
                    }
                }
            }
        },
        edit: function(data) {
            self.oneModule.editActive = data.id;
        },
        save: function(v) {
            self.oneModule.editActive = false;
            // $http({
            //     method: "PUT",
            //     url: "awstack-user/v1/enterprises/" + v.enterpriseUid + "/regions/" + v.regionUid + "/nodes/" + v.nodeUid + "/hostnames",
            //     data: {
            //         "hostName": v.hostName
            //     }
            // }).success(function() {
            //     self.oneModule.editActive = false;
            // });
            self.hostNameList["" + v.nodeUid + ""].newName = v.hostName;
            self.hostNameList["" + v.nodeUid + ""].changed = "2";
        },
        completeOne: function() {
            /*两节点安装部署时必须选择node-1节点*/
            if(self.checkedItems.length==2){
                var nodeOne = self.checkedItems.filter(v=>{
                    return v.hostName == 'node-1'
                })
                console.log(nodeOne);
                if(nodeOne.length == 0 ){
                    self.isTwoNodesChecked = true;
                    $timeout(function(){
                        self.isTwoNodesChecked = false;
                    },2000);
                    return
                }
            }
            /*云管所在节点必须被选中*/
            var regionkey = JSON.parse(localStorage.LOGINS).regionKey;
            if(regionkey==='FFFFF'){
                var sassNode = self.stepOneData.filter(v=>{
                    return v.hostInfoMap.saas_install == true;
                })
                self.sassNodeName = sassNode[0].hostName;

                var sassNodeItem = self.checkedItems.filter(v=>{
                    return v.hostInfoMap.saas_install == true;
                })
                
                if(sassNodeItem.length == 0 ){
                    self.isSassNodesChecked = true;
                    $timeout(function(){
                        self.isSassNodesChecked = false;
                    },2000);
                    return
                }
            }

            var list = [];
            angular.forEach(self.stepOneData, function(item) {
                if (self.checkboxes.items[item.nodeUid]) {
                    list.push(item);
                }
            });
            localStorage.patternSelected = JSON.stringify(self.oneModule.patternselected);
            /*检测网卡和磁盘的配置信息是否完整*/
            if(self.oneModule.patternselected.value=='hyper'){
               var nodeConfig = JSON.parse(localStorage.diskCardConfig); 
            }else{
               var nodeConfig = JSON.parse(localStorage.nodeConfig); 
            }
            
            for(var i in self.checkboxes.items){
                if(self.checkboxes.items[i]){
                    if(!(nodeConfig[i]&&
                    // nodeConfig[i].disksJson&&
                    // nodeConfig[i].disksJson.configGroup[0].data.length>0&&
                    nodeConfig[i].cardJson&&
                    nodeConfig[i].cardJson.nic_map.cluster.bonds&&
                    nodeConfig[i].cardJson.nic_map.storage.bonds&&
                    nodeConfig[i].cardJson.nic_map.public.bonds&&
                    nodeConfig[i].cardJson.nic_map.tenant.bonds&&
                    nodeConfig[i].cardJson.nic_map.mgmt.bonds)
                        ){
                        self.isConfigChecked =true;
                        $timeout(function(){
                            self.isConfigChecked =false;
                        },2000)
                        return;
                    }
                }
            }
            
            /*当选择了故障域的话就进行故障域验证*/
            if(self.oneModule.faultdomain){
                /*两节点不启用故障域*/
                if(list.length==2){
                    self.limitFault = true;
                    $timeout(function(){
                        self.limitFault = false;    
                    },2000)
                    return;
                }else{
                    self.limitFault = false;
                }
                var faultFirst = "";
                Array.prototype.in_array=function(e){
                    var r=new RegExp(','+e+',');
                    return (r.test(','+this.join(this.S)+','));
                };
                for(var i=0;i<list.length;i++){
                    var faultdomainArry = new Array(list[i].hostInfoMap.fault_domain.split("-"));
                    if(faultdomainArry.in_array('0')){
                        self.isfaultFormat=true;
                        $timeout(function(){
                            self.isfaultFormat = false;    
                        },2000)
                        return;
                    }
                    if(i==0){
                        faultFirst=list[i].hostInfoMap.fault_domain.split("-").length;
                    }
                    if(faultFirst!=(list[i].hostInfoMap.fault_domain.split("-").length)){
                        self.isfaultChecked=true;
                        $timeout(function(){
                            self.isfaultChecked = false;    
                        },2000)
                        return;
                    }
                }
            }
            var oneStepData = {
                faultdomain:self.oneModule.faultdomain
            }
            localStorage.setItem("oneStepData", JSON.stringify(oneStepData));
            localStorage.setItem("LISTS", JSON.stringify(list));
            localStorage.setItem("HOSTNAMELIST", JSON.stringify(self.hostNameList));
            $location.path("/info/steptwo");    
        },
        init: function() {
            if (localStorage.HOSTNAMELIST) {
                self.hostNameList = JSON.parse(localStorage.HOSTNAMELIST);
            }
            if (localStorage.LOGINS) {
                var regionkeys = JSON.parse(localStorage.LOGINS).regionKey;
            }

            $http({
                method: "GET",
                //url: "awstack-user/v1/enterprises/" + loginsData.enterpriseUid + "/nodes/list"
                url:"awstack-user/front/v1/regions/regionkeys/"+regionkeys+"/nodes"
                //url:"awstack-user/front/v1/regions/regionkeys/FFFFF/nodes"
            }).success(function(res) {
                if (res && res.data && res.data.data) {
                    self.faultError=false;
                    self.isfaultChecked=false;
                    //self.checkboxes.checked=true;
                    self.stepOneData.splice(0, res.data.total);
                    //self.stepOneData.push.apply(self.stepOneData, res.data.data);
                    stepOneTemp = res.data.data;
                    stepOneTemp = stepOneTemp.sort(sortNumber);
                    /* 
                        1.先检查所有节点是否模式相同不同静止所有操作
                        2.判断模式超融合或软件交付模式以第一个节点为标准
                    */
                    function checkCustom(stepOneTemp){
                        let data = stepOneTemp;
                        let length = data.length;
                        self.isCustomChecked = false;
                        /*当只有一个节点时*/
                        if(length==1){
                            if(data[0].hostInfoMap.is_custom){
                                self.oneModule.patternselected =  self.oneStepType.pattern_type[0];
                            }else{
                                self.oneModule.patternselected =  self.oneStepType.pattern_type[1];
                            }
                            localStorage.patternSelected = JSON.stringify(self.oneModule.patternselected);
                        }  
                        /*当多个节点*/
                        if(length>1){
                            for(let i=1;i<length;i++){
                                if(data[i-1].hostInfoMap.is_custom!=data[i].hostInfoMap.is_custom){
                                    self.isCustomChecked = true;
                                    break;
                                }else{
                                    self.isCustomChecked = false;
                                }
                            }
                            /*当所有节点模式相同，开始模式选择*/
                            if(!self.isCustomChecked){
                                if(data[0].hostInfoMap.is_custom){
                                    self.oneModule.patternselected =  self.oneStepType.pattern_type[0];
                                }else{
                                    self.oneModule.patternselected =  self.oneStepType.pattern_type[1];
                                }  
                            }
                            localStorage.patternSelected = JSON.stringify(self.oneModule.patternselected);
                        }
                        /*当没有有选择配置文件模式*/
                        if(!localStorage.configselected){
                            self.changeConfig(self.oneStepType.config_type[0])
                        }
                    }

                    angular.forEach(stepOneTemp, function(v, index) {
                        //diskCardConfig(v.hostInfoMap.disks,v.hostInfoMap.nics,v.nodeUid)
                        v.hostInfoMap = JSON.parse(v.hostInfo)
                        if (self.hostNameList["" + v.nodeUid + ""] && self.hostNameList["" + v.nodeUid + ""].changed=="2") {
                            v.hostName = self.hostNameList["" + v.nodeUid + ""].newName;
                        } else {
                            let hostNameInfo = {
                                "oldName": v.hostName,
                                "newName": "node-" + (index + 1),
                                "changed": "1"
                            };
                            self.hostNameList["" + v.nodeUid + ""] = hostNameInfo;
                            v.hostName = hostNameInfo.newName;
                        }

                        v.hostInfoMap.ssdAll = new Number();
                        v.hostInfoMap.sataAll = new Number();
                        v.hostInfoMap.disks = v.hostInfoMap.disks.sort(by('name'));
                        v.hostInfoMap.nics = v.hostInfoMap.nics.sort(by('name'));
                        let data = v.hostInfoMap.disks;
                        var ssdAll=0;
                        var sataAll=0;

                        v.diskStatus = 0
                        for (let i = 0; i < data.length; i++) {
                            if(i.status==false){
                                v.diskStatus = 1
                            }
                            if (data[i].ssd) {
                                ssdAll += changeUnit(data[i].capacity);
                            } else {
                                sataAll += changeUnit(data[i].capacity);
                            }
                        }
                        if(ssdAll>0){
                            v.hostInfoMap.ssdAll = setUnit(ssdAll).total;
                            v.hostInfoMap.ssdUnit = setUnit(ssdAll).unit;
                        }
                        if(sataAll>0){
                            v.hostInfoMap.sataAll = setUnit(sataAll).total;
                            v.hostInfoMap.sataUnit = setUnit(sataAll).unit;
                        }

                        /*if(!v.hostInfoMap.fault_domain){
                            v.hostInfoMap.fault_domain = v.hostInfoMap.fault_domain1?v.hostInfoMap.fault_domain1:'';
                            v.hostInfoMap.fault_domain += v.hostInfoMap.fault_domain2?'-'+v.hostInfoMap.fault_domain2:'';
                            v.hostInfoMap.fault_domain += v.hostInfoMap.fault_domain3?'-'+v.hostInfoMap.fault_domain3:'';
                        } */
                       
                    });
                    self.stepOneData = stepOneTemp;
                    checkCustom(stepOneTemp);
                    self.stepOneData = self.stepOneData.sort(sortNumber);   
                }
            });
        }
    };
    chkall();
    self.oneModule.init();
}