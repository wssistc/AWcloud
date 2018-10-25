import "ip";
import "./functionSrv";

var functionModule = angular.module("functionModule",["ngTable", "ngAnimate", "ui.bootstrap","ngMessages","accessFunctionSrvModule","app"]);

functionModule.controller("pluginCtrl",["$scope","$window","$timeout","$location","$translate","accessSrv","NgTableParams","newCheckedSrv", "$uibModal","$filter",
    function($scope,$window,$timeout,$location,$translate,accessSrv,NgTableParams,newCheckedSrv,$uibModal,filter){
        var self = $scope;
        self.delDisable = true;
        self.conCanAdd = true;
        self.phyCanAdd = true;
        var listPhy_data = [];
        var listContent_data = [];

        self.headers = {
            'name':$translate.instant('aws.function.header.name'),
            'progress':$translate.instant('aws.function.header.progress'),
            'status':$translate.instant('aws.function.header.status'),
            'addtime':$translate.instant('aws.function.header.addtime'),
            'handle':$translate.instant('aws.function.header.handle')
        }
        let paasServiceTypes = [
            {name:"TDSQL分布式数据库",type:"TDSQL",authId:10},
            {name:"CTSDB时序数据库",type:"CTSDB",authId:11},
            //{name:"TSF",type:"TSF",authId:},
            {name:"云镜",type:"CloudSecurity",authId:13},
            {name:"Tbase海量事务处理平台",type:"TBase",authId:14},
            {name:"织云",type:"COC",authId:15},
            {name:"TBDS大数据套件",type:"TBDS",authId:12},
            //{name:"CMQ",type:"CMQ",authId:},
           // {name:"API网关",type:"APIGateway",authId:},
           // {name:"蓝鲸",type:"BlueKing",authId:},
            {name:"灵雀云",type:"Alauda",authId:16},
            {name:"天眼云镜",type:"SkyCloudSecurity",authId:17}
        ];
        /*功能类型*/
        var netCidr = {}
        accessSrv.getCluster().then(function(res){
            if(res&&res.data){
                netCidr = JSON.parse(res.data);
            }
        })

        self.pluginData={
            type:'con'
        }
        self.checkedItems = {
            item:[]
        }

        function setHanle(install,clean){
            self.canHandle = {
                install:install,
                clean:clean
            }
        }
        setHanle(true,true)

        initContentTable()
        self.globalSearchTerm = {};
        self.applyGlobalSearch = function() {
            var term = self.globalSearchTerm.item;
            self.tableContentParams.filter({ searchTerm: term });
        };

        /*容器*/
        var contentListData = []
        function initContentTable(){
            accessSrv.getContentList().then(function(result){
                result?self.contentLoadData = true:"";
                if(result && result.data){
                    successConFunc(result.data)
                }
            });
        }

        function successConFunc(condata,isWs){
            contentListData = condata;

            var supportPaas = {
                "Resource":{isLinked:true},
                "PhysicalResource":{isLinked:true},
                "K8s":{isLinked:true},
                "Monitoring":{isLinked:true},
                "List":{isLinked:true},
                "Log":{isLinked:true},
                "User":{isLinked:true},
                "System":{isLinked:true},
            }
            condata.forEach((item)=>{
                if(item.pluginName=="TDSQL" || item.pluginName=="CTSDB" ||item.pluginName=="TSF"
                ||item.pluginName=="CloudSecurity" || item.pluginName=="TBase" ||item.pluginName=="COC" ||
                item.pluginName=="TBDS" ||item.pluginName=="CMQ" ||item.pluginName=="APIGateway"
                ||item.pluginName=="BlueKing"||item.pluginName=="Alauda" ||item.pluginName=="SkyCloudSecurity"){
                    var paasName = item.pluginName;
                    var supportPaasData = JSON.parse(item.meta);
                    supportPaas[paasName] = supportPaasData;
                    supportPaas[paasName].isLinked = item.pluginStatus==0?true:false;
                }
            })
            localStorage.supportPaas = JSON.stringify(supportPaas);




            listContent_data = _.map(condata, function(item) {
                item.createTimes = filter("date")(item.createTime,"yyyy-MM-dd HH:mm:ss");
                item.statuText = $translate.instant('aws.function.status.'+item.pluginStatus);
                if(!isWs&&item.pluginName=="容器管理"){
                    item.type="con";
                    item.pluginNameCopy = item.pluginName;
                    item.metaData = JSON.parse(item.meta);
                    item.statusType = item.metaData.status.task_queue_status?item.metaData.status.task_queue_status.task_queue_name:"ready";
                    item.Ratio = {
                        total:item.statusType=='install'?21:item.pluginStatus=='4'?1:1,
                        inUsed:item.metaData.status.subtask_status?item.metaData.status.subtask_status.length:0
                    }
                }else if(!isWs&&item.pluginName=="物理机管理"){
                    item.type="phy";
                    item.pluginNameCopy = item.pluginName;
                    item.statuText = $translate.instant('aws.function.status.'+item.pluginStatus);
                    var meta = JSON.parse(item.meta);
                    var installProgress = meta.process?meta.process.taskProcess:0;
                    var total = meta.process?meta.process.taskCount:35;
                    item.Ratio = {
                        total:total,
                        inUsed:installProgress
                    }
                }else if(item.pluginName=="TDSQL" || item.pluginName=="CTSDB" ||item.pluginName=="TSF"
                ||item.pluginName=="CloudSecurity" || item.pluginName=="TBase" ||item.pluginName=="COC" ||
                item.pluginName=="TBDS" ||item.pluginName=="CMQ" ||item.pluginName=="APIGateway"
                ||item.pluginName=="BlueKing"||item.pluginName=="Alauda" ||item.pluginName=="SkyCloudSecurity"){
                    item.type = "paas";
                    item.pluginNameCopy = $translate.instant("aws.function.paas."+item.pluginName)
                    item.meta = JSON.parse(item.meta);
                    if(item.pluginStatus == 0){
                        item.Ratio = {total:100,inUsed:100}
                    }else if(item.pluginStatus == 1){
                        item.Ratio = {total:100,inUsed:0}
                    }
                    if(item.pluginName=="COC" && item.pluginStatus == 1){
                        item.pluginStatus = 2
                    }
                    /*paas判断*/ 
                    if(item.pluginStatus==1||item.pluginStatus==2){
                        if(item.pluginName =='COC'||item.pluginName =='SkyCloudSecurity'){
                           item.canSync=false;
                        }
                    }else if(item.pluginStatus==0){
                        if(item.pluginName =='COC'||item.pluginName =='SkyCloudSecurity'){
                           item.canSync=true;
                        }
                    }
                }
                
                if(item.pluginName == "物理机管理" && item.statuText==$translate.instant('aws.function.status.3')){
                    self.showalerttip = true;
                }

                item.searchTerm = [item.pluginNameCopy ,item.createTimes ,item.statuText].join('\b');
                if(item.pluginName == "物理机管理" && item.statuText==$translate.instant('aws.function.status.1') ){
                    item.canClear =true ;
                }else{
                    item.canClear =false ;
                }
                /*按钮状态机（容器判断）*/
                if(item.statusType=='ready'){
                    setHanle(false,false)
                    if(item.pluginStatus==8||item.pluginStatus==9){
                        setHanle(true,true)
                    }
                }else if(item.statusType=='clean'){
                    switch (item.pluginStatus){
                        case 0 :
                            setHanle(false,false);
                        break;
                        case 1 :
                        case 2 :                        
                            setHanle(true,true);
                        break;
                        case 3 :
                            setHanle(false,true);
                        break;
                        case 4 :
                            setHanle(true,false);
                        break;
                    }
                }else if(item.statusType=='install'){
                    switch (item.pluginStatus){
                        case 0 :
                            setHanle(false,false);
                        break;
                        case 1 :
                        case 2 :                        
                            setHanle(true,true);
                        break;
                        case 3 :
                            setHanle(true,false);
                        break;
                        case 4 :
                            setHanle(true,false);
                        break;
                    }
                }
                

                return item;
            });
            self.tabledata = angular.copy(listContent_data);
            self.tableContentParams = new NgTableParams({ count: 10 }, { counts: [], dataset: listContent_data })
            var tableId = "pluginId";
            newCheckedSrv.checkDo(self, listContent_data, tableId,"tableContentParams"); 
            self.listPluginData={
                con:true,
                phy:true
            }
            if(condata.length>0){
                var constent = condata.filter(item=>{
                    return item.type=='con'
                })
                var physic = condata.filter(item=>{
                    return item.type=='phy'
                })
                if(constent.length>0){
                    self.listPluginData.con = false;
                }
                if(physic.length>0){
                    self.listPluginData.phy = false;
                }
                if(constent.length>0&&physic.length>0){
                    self.conCanAdd = true;
                }else{
                    self.conCanAdd = false;
                }
            }else{
                self.conCanAdd = false;
            }
            //判断云管平台是否可以添加物理机和容器
            let regionBusiAuth=localStorage.regionBusiAuth!=2?JSON.parse(localStorage.regionBusiAuth):[];
            regionBusiAuth=regionBusiAuth.map(function(item){
                item=Number(item);
                return item;
            });
            let phyIndex=regionBusiAuth.indexOf(4);
            let conIndex=regionBusiAuth.indexOf(5);
            self.typeList=[];
            function setTypeListFunc(){
                if(self.listPluginData.con&&self.listPluginData.phy){
                    self.typeList = [
                        {name:$translate.instant('aws.function.functiontype.con'),type:"1"},
                        {name:$translate.instant('aws.function.functiontype.phy'),type:"2"}
                    ]

                }else if(self.listPluginData.con&&!self.listPluginData.phy){
                    self.typeList = [
                        {name:$translate.instant('aws.function.functiontype.con'),type:"1"}
                    ]
                }else if(!self.listPluginData.con&&self.listPluginData.phy){
                    self.typeList = [
                        {name:$translate.instant('aws.function.functiontype.phy'),type:"2"}
                    ]
                }else if(!self.listPluginData.con&&!self.listPluginData.phy){
                    self.typeList=[];
                }
            }

            if(phyIndex>-1&&conIndex>-1){
                setTypeListFunc();
            }else if(phyIndex>-1&&conIndex==-1){
                if(self.listPluginData.con&&self.listPluginData.phy){
                    self.typeList = [
                        {name:$translate.instant('aws.function.functiontype.phy'),type:"2"}
                    ]
                }else if(self.listPluginData.con&&!self.listPluginData.phy){
                    self.typeList=[]; 
                }
            }else if(phyIndex==-1&&conIndex>-1){
                if(self.listPluginData.con&&self.listPluginData.phy){
                    self.typeList = [
                        {name:$translate.instant('aws.function.functiontype.con'),type:"1"}
                    ]
                }else if(!self.listPluginData.con&&self.listPluginData.phy){
                    self.typeList=[]; 
                }
            }else if(phyIndex==-1&&conIndex==-1){
                self.typeList=[];
            }
            var filtePaasType = paasServiceTypes.filter(obj=>{
                var hasType = false;
                self.tabledata.map(item => {
                    if(item.pluginName ==  obj.type){
                        hasType = true
                    }
                })
                return !hasType
            })
        
            filtePaasType = filtePaasType.filter( obj => {
                var flag = false;
                regionBusiAuth.map(item => {
                    if(item == obj.authId){
                        flag = true;
                    }
                })
                return flag;
            })
            
            self.typeList.push(...filtePaasType)
            
            if(self.typeList.length==0){
               self.conCanAdd = true;
            }else{
               self.conCanAdd = false; 
            }
        }

        self.syncCOCSky = function(pluginName){
            self.clearPluginName=pluginName;
            var content = {
                target: "syncCOCSky",
                msg:"<span>"+ $translate.instant("aws.system.plugin.sync_tips") + "</span>",
                type: "info",
                btnType: "btn-primary",
                pluginName:pluginName
            };
            self.$emit("delete", content);
        }

        self.$on("syncCOCSky", function(e,data) {
            if(self.clearPluginName=='COC'){
               accessSrv.syncCOC().then(function(res){});
            }else if(self.clearPluginName=='SkyCloudSecurity'){
               accessSrv.syncSkyCloudSecurity().then(function(res){});
            }
        });

        self.$on("functionSocket", function(e, data) {
            if(data.indexOf('plugin.ironic')>-1){
                var data=angular.fromJson(data);
                self.phyLogMessages.unshift(JSON.stringify(data));
                if(self.phyLogMessages.length>1500){
                    self.phyLogMessages = self.phyLogMessages.slice(0,1001);
                    self.logMessages =  self.phyLogMessages.join("\n"); 
                }else{
                    self.logMessages =  self.phyLogMessages.join("\n");
                }
                if(data.event_type=='plugin.ironic.install.log'||data.event_type=='plugin.ironic.remove.log'){
                    var phyItem = data;
                    contentListData.forEach(function(item){
                        if(item.type=='phy'){
                            item.pluginStatus = phyItem.process.taskStatus;
                            if(item.pluginStatus=='6'){
                                item.canPlug = false;
                            }
                            if(item.pluginStatus==3){
                                item.Ratio = {
                                    total:35,
                                    inUsed:35
                                }
                            }else{
                                item.Ratio = {
                                    total:(phyItem.process.taskStatus!=4&&phyItem.process.taskStatus!=7)?phyItem.process.taskCount:35,
                                    inUsed:(phyItem.process.taskStatus!=4&&phyItem.process.taskStatus!=7)?phyItem.process.taskProcess:0
                                }
                            }
                        }
                    })
                }
                successConFunc(contentListData,true);
            }else if(
                    data.indexOf('plugin.k8s.install.kube.kit')>-1||
                    data.indexOf('plugin.k8s.manager')>-1||
                    data.indexOf('task_queue_status')>-1
                ){
                if(JSON.parse(data).log||data.indexOf('plugin.k8s.install.kube.kit')){
                    JSON.parse(data).log?self.conLogMessages.unshift(JSON.parse(data).log):self.conLogMessages.unshift(data);
                    if(self.conLogMessages.length>1500){
                        self.conLogMessages = self.conLogMessages.slice(0,1001)
                        self.logMessages =  self.conLogMessages.join("\n");
                    }else{
                        self.logMessages =  self.conLogMessages.join("\n");
                    }
                }
                if(data.indexOf('task_queue_status')>-1){
                    var conItem = JSON.parse(data)
                    contentListData.forEach(function(item){
                        if(item.type=='con'){
                            item.statusType = conItem.task_queue_status?conItem.task_queue_status.task_queue_name:"ready";
                            item.pluginStatus = conItem.task_queue_status?conItem.task_queue_status.task_queue_status:"0";
                            item.Ratio = {
                                total:item.statusType=='install'?21:item.pluginStatus=='4'?1:1,
                                inUsed:conItem.subtask_status?conItem.subtask_status.length:0
                            }
                        }
                    })
                    successConFunc(contentListData,true);
                }
                if(data.indexOf('plugin.k8s.install.kube.kit')>-1){
                    var phyItem = JSON.parse(data);
                    contentListData.forEach(function(item){
                        if(item.type=='con'){
                            if(data.indexOf('taskStatus')>-1){
                                item.pluginStatus = phyItem.process.taskStatus;    
                            }
                            item.Ratio = {
                                total:21,
                                inUsed:0
                            }
                        }
                    })
                    successConFunc(contentListData,true);
                }
            }
            self.$apply()
        });

        self.refreshCon = function(){
            initContentTable()
        };

        self.delFun = function(item,left){
            self.left = left;
            if(left){
                self.currentPlugin = item.type;
                self.currentPluginId = item.pluginId;
            }else{
                self.currentPlugin = item[0].type;
            }
            var content = {
                target: "DelRes",
                msg:"<span>"+ $translate.instant("aws.system.plugin.del_tips") + "</span>",
            };
            self.$emit("delete", content);
        };

        self.$on("DelRes", function() {
            if(self.currentPlugin=='phy'){
                var del_ids = '';
                self.checkedItems.forEach(item => {
                    del_ids = item.pluginId;
                });
                self.delDisable  = true;
                accessSrv.deleteFunData(del_ids).then(function(res){
                    initContentTable()
                })
            }else if(self.currentPlugin=='con'){
                var regionUid = JSON.parse(localStorage.$LOGINDATA).regionUid;
                var data = {
                    "enterpriseUid":localStorage.enterpriseUid,
                    "regionUid":regionUid,
                    "pluginId":self.checkedItems[0].pluginId
                }
                accessSrv.deleteContent(data).then(function(res){
                    initContentTable()
                })
            }else if(self.currentPlugin=='paas'){
                var id;
                if(self.left){
                    id = self.currentPluginId;
                }else{
                    id = self.checkedItems[0].pluginId;
                }
                accessSrv.deletePaas(id).then(function(res){
                    initContentTable()
                })
            }
        });

        self.$watch(function(){
            return self.checkedItems
        },function(value){
            if(value&&value.length>0){
                if(value.length==1){
                    if(value[0].type=='con'){
                        if(value[0].pluginStatus=='4'||value[0].pluginStatus=='3'||value[0].pluginStatus=='0'||value[0].pluginStatus=='9 '){
                            self.delDisable  = false;    
                        }else{
                            self.delDisable  = true;    
                        }
                    }else if(value[0].type=='phy'){
                        if(value[0].pluginStatus == 1||
                            value[0].pluginStatus == 6
                            ){
                            self.delDisable  = false;
                        }else{
                            self.delDisable  = true;   
                        }
                    }else if(value[0].type=='paas'){
                        self.delDisable  = false;  
                    }
                }else{
                    self.delDisable  = true;
                }
            }else{
               self.delDisable  = true; 
            }  
        })
        /*容器*/

        self.installPlugin = function(item){
            if(item.type=='con'){
                var regionUid = JSON.parse(localStorage.$LOGINDATA).regionUid;
                var data = {
                    "enterpriseUid":localStorage.enterpriseUid,
                    "regionUid":regionUid,
                    "pluginId":item.pluginId
                }
                accessSrv.installContent(data).then(function(res){
                })  
            }else{
                accessSrv.installPhy(item.pluginId).then(function(res){
                    item.canPlug =true;
                }) 
            } 
        }


        /*清除功能*/
        self.cleanPlugin = function(item){
            if(item.type=='con'){
                self.clearPluginId = item.pluginId;
                var content = {
                    target: "clearConInfo",
                    msg:"<span>"+$translate.instant('aws.function.tips.contips')+"</span>",
                };
                self.$emit("delete", content);
            }else{
                self.clearPluginId = item.pluginId;
                var content = {
                    target: "clearPhyInfo",
                    msg:"<span>"+$translate.instant('aws.function.tips.phytips')+"</span>",
                };
                self.$emit("delete", content);
            }
        }

        self.$on("clearPhyInfo", function() {
            accessSrv.clearPhy(self.clearPluginId).then(function(res){
            })        
        });

        self.$on("clearConInfo", function() {
            var regionUid = JSON.parse(localStorage.$LOGINDATA).regionUid;
            var data = {
                "enterpriseUid":localStorage.enterpriseUid,
                "regionUid":regionUid,
                "pluginId":self.clearPluginId
            }
            accessSrv.clearContent(data).then(function(res){
            })
        });

        
        /*查看详情*/
        self.phyLogMessages=[];
        self.conLogMessages=[];
        function getPluginLog(type,pluginId,status){
            var methodType = ["_install_kube_kit","install_ironic","remove_install"]
            if(type=='con'){
                var dataParams = {
                    "method": methodType[0],
                    "meta": pluginId,
                    "regionKey":localStorage.regionKey
                }
                accessSrv.getPLuginLog(dataParams).then(function(res){
                    if(res&&res.data){
                        if(res.data.logs&&res.data.logs.length>0){
                            res.data.logs.forEach(function(item){
                                self.conLogMessages.unshift(item.customMsg)       
                            })
                            self.logMessages =  self.conLogMessages.join("\n");
                        }
                    }
                })
            }else if(type=='phy'){
                if(
                    status==5||
                    status==6||
                    status==7
                    ){
                    var dataParams = {
                        "method": methodType[2],
                        "meta": pluginId,
                        "regionKey":localStorage.regionKey
                    }
                }else{
                    var dataParams = {
                        "method": methodType[1],
                        "meta": pluginId,
                        "regionKey":localStorage.regionKey
                    }
                }
                accessSrv.getPLuginLog(dataParams).then(function(res){
                    if(res&&res.data){
                        if(res.data.logs&&res.data.logs.length>0){
                            res.data.logs.forEach(function(item){
                                self.phyLogMessages.unshift(item.customMsg);    
                                self.logMessages =  self.phyLogMessages.join("\n");   
                            })
                        }
                    }
                })
            }
        }

        if ($location.search().plugintype) {
            self.currentPlugin = $location.search().plugintype
            getPluginLog(self.currentPlugin,$location.search().id,$location.search().pluginStatus)
        }
        self.enterDetail = function(item){
            if(item.type=='paas') return;
            self.phyLogMessages=[];
            self.conLogMessages=[];
            self.currentPlugin = item.type
            $location.search('id='+item.pluginId+"&plugintype="+item.type+"&pluginStatus="+item.pluginStatus);

            getPluginLog(item.type,item.pluginId,item.pluginStatus)
        }

        self.createFun = function(type){
            var scope = self.$new();
            var wbListIpsModal = $uibModal.open({
                animation: true,
                templateUrl: "createFunction.html",
                controller:  "createFunCtrl",
                scope: scope,
                resolve:{
                    initConTable:function(){
                        return initContentTable;
                    },
                    netCidr:function(){
                        return netCidr;
                    }
                }
            })
        };

        self.editPaas = function(data){
            var scope = self.$new();
            var wbListIpsModal = $uibModal.open({
                animation: true,
                templateUrl: "editFunction.html",
                scope: scope
            })
            var item = angular.copy(data);
            scope.paasEdit = item.meta;
            scope.paasEditType = item.pluginName;
            scope.submittedvalid = false;
            scope.editFuncConfirm = function(field){
                if(field.$valid){
                    var data = {
                        "regionUid":JSON.parse(localStorage.$LOGINDATA).regionUid,
                        "enterpriseUid":localStorage.enterpriseUid,
                        "pluginName":item.pluginName,
                        "pluginId":item.pluginId,
                        "meta":angular.toJson(scope.paasEdit)
                    }
                    // if(item.pluginName == "TBDS" || item.pluginName == "COC" || item.pluginName == "TBase"){
                    //     data.username = scope.paasEdit.url;
                    //     data.password = scope.paasEdit.password;
                    // }
                    // if(item.pluginName == "COC" || item.pluginName == "CloudSecurity"){
                    //     data.agentUrl =  scope.paasEdit.agentUrl;
                    // }
                    accessSrv.editPaas(data).finally(function(){
                        initContentTable()
                    });
                    wbListIpsModal.dismiss('cancel');

                }else{
                    scope.submittedvalid = true;
                }
            }
        }
    
    }])
.controller("createFunCtrl",["$scope","$window","$timeout","$location","$translate","accessSrv","NgTableParams","initConTable","netCidr", "$uibModalInstance","$filter",
    function($scope,$window,$timeout,$location,$translate,accessSrv,NgTableParams,initConTable,netCidr,$uibModalInstance,filter){
        var scope = $scope;
        scope.submitted = false;
        scope.interacted = function(field){
            return scope.submitted || field.$dirty;
        };
        scope.paas = {
            TDSQL:{},
            CTSDB:{},
            TSF:{},
            CloudSecurity:{},
            TBase:{},
            COC:{},
            TBDS:{},
            CMQ:{},
            APIGateway:{},
            BlueKing:{},
            Alauda:{},
            SkyCloudSecurity:{}
        }
        scope.paramsData = {}      
        scope.paramsData.selected = scope.typeList[0];
        function changePluginType(){
            switch (scope.paramsData.selected.type){
                case '2': 
                    scope.inspectorDhcp={
                        Gateway:"",
                        Netmask:"",
                        start:"",
                        end:"",
                        includeCheck:false
                    }
                    
                    // scope.inspectorDhcp={
                    //     Gateway:"10.129.1.128",
                    //     Netmask:"255.255.255.0",
                    //     start:"10.129.1.100",
                    //     end:"10.129.1.120",
                    //     includeCheck:false
                    // }

                    // scope.inspectorIronicCheck={
                    //     includeCheck:false
                    // }
                    // scope.inspectorFloatingCheck={
                    //     includeCheck:false
                    // }

                    // scope.ironic={
                    //     cidr:"192.168.128.0/20",
                    //     Gateway:"192.168.128.1",
                    //     start:"192.168.129.38",
                    //     end:"192.168.129.45",
                    //     includeCheck:false
                    // }
                    scope.ironic={
                        cidr:"",
                        Gateway:"",
                        start:"",
                        end:"",
                        includeCheck:false
                    }
                    // scope.ironicInspectorCheck={
                    //     includeCheck:false
                    // }
                    scope.ironicFloatingCheck={
                        includeCheck:false
                    }
                    scope.floating = {
                        start:"",
                        end:"",
                    }

                    scope.rangeSame = false;
                    function checkSames(v){
                        scope.rangeSame = false;
                        function checkDouble(a,b){
                            if((_IP.toLong(v[a].start)>=_IP.toLong(v[b].start)&&
                            _IP.toLong(v[a].start)<=_IP.toLong(v[b].end))||
                            (_IP.toLong(v[a].end)>=_IP.toLong(v[b].start)&&
                            _IP.toLong(v[a].end)<=_IP.toLong(v[b].end))
                            ){
                                scope.rangeSame = true;
                            }   
                        }
                        checkDouble(0,1)
                        checkDouble(1,0)
                        checkDouble(2,1)
                        checkDouble(1,2)
                        checkDouble(0,2)
                        checkDouble(2,0)
                        if(scope.rangeSame){
                            var content = {
                                target: "floatingTips",
                                msg:"<div class='floating-group'>"+
                                        "<label class='floating-label'>"+$translate.instant('aws.function.floating.cidr')+"：</label>"+
                                        "<div class='controls clearfix'>"+
                                          "<span class='text-tips'>"+scope.floatingData.floating_cidr+"</span>"+
                                        "</div>"+
                                    "</div>"+
                                    "<div class='floating-group'>"+
                                        "<label class='floating-label'>"+$translate.instant('aws.function.floating.gateway')+"：</label>"+
                                        "<div class='controls clearfix'>"+
                                            "<span class='text-tips'>"+scope.floatingData.floating_gateway+"</span>"+
                                        "</div>"+
                                    "</div>"+
                                    "<div class='floating-group'>"+
                                      "<label class='floating-label'>"+$translate.instant('aws.function.floating.startip')+"：</label>"+
                                      "<div class='controls clearfix'>"+
                                        "<span class='text-tips'>"+scope.floatingData.floating_start+"</span>"+
                                      "</div>"+
                                    "</div>"+
                                    "<div class='floating-group'>"+
                                      "<label class='floating-label'>"+$translate.instant('aws.function.floating.endip')+"：</label>"+
                                      "<div class='controls clearfix'>"+
                                        "<span class='text-tips'>"+scope.floatingData.floating_end+"</span>"+
                                      "</div>"+
                                    "</div>",
                                btnType:'btn-none'
                            };
                            scope.$emit("delete", content);
                            scope.$on("floatingTips", function() {
                            });
                        }
                    }
                    scope.clusterCidr = netCidr.cluster_cidr;
                    function checkipInclude(ipRange,gateway,tip){
                        scope[tip].includeCheck =false;
                        if(_IP.toLong(ipRange.start)<=_IP.toLong(gateway)&&
                            _IP.toLong(ipRange.end)>=_IP.toLong(gateway)){
                            scope[tip].includeCheck =true;
                        }
                    }

                    accessSrv.getIps().then(function(res){
                        if(res&&res.data){
                            scope.floatingData = res.data;
                            scope.floating.start = scope.floatingData.floating_start;
                            scope.floating.end = scope.floatingData.floating_end;
                        }
                    })

                    scope.wbListIpsTitle = $translate.instant("aws.system.accesspolicy.createAccessPolicy");
                    scope.functionConfirm = function(form_field){
                        if(form_field.$valid){
                            var ipDataRange = [];
                            scope.ironicRange = {
                                start: _IP.cidrSubnet(scope.ironic.cidr).networkAddress,
                                end:_IP.cidrSubnet(scope.ironic.cidr).broadcastAddress
                            }
                            scope.floatingRange = {
                                start: _IP.cidrSubnet(scope.floatingData.floating_cidr).networkAddress,
                                end:_IP.cidrSubnet(scope.floatingData.floating_cidr).broadcastAddress
                            }

                            /*检测集群网络*/
                            function checkNetwork(ip1,ip2,ip3,ip4){
                                var  startIpLong = _IP.toLong(scope.inspectorDhcp.start);
                                var  endIpLong = _IP.toLong(scope.inspectorDhcp.end);

                                if(
                                   (startIpLong<=_IP.toLong(ip1)&&_IP.toLong(ip1)<=endIpLong)||
                                   (startIpLong<=_IP.toLong(ip2)&&_IP.toLong(ip2)<=endIpLong)||
                                   (startIpLong<=_IP.toLong(ip3)&&_IP.toLong(ip3)<=endIpLong)||
                                   (startIpLong<=_IP.toLong(ip4)&&_IP.toLong(ip4)<=endIpLong)
                                    ){
                                    scope.ClusterIpCheck = true;
                                }else{
                                    scope.ClusterIpCheck = false; 
                                }        
                            }
                            checkNetwork(netCidr.ironic_vm_cluster_ip,netCidr.inspector_vm_cluster_ip,netCidr.log_server_ip_addr,netCidr.kapacitor_ip_addr);

                            // ipDataRange.push(scope.floatingRange)
                            ipDataRange.push(scope.floating)
                            //ipDataRange.push(scope.ironicRange)
                            ipDataRange.push(scope.ironic)
                            ipDataRange.push(scope.inspectorDhcp)
                            checkSames(ipDataRange)
                            checkipInclude(scope.ironic,scope.ironic.Gateway,'ironic')
                            // checkipInclude(scope.inspectorDhcp,scope.ironic.Gateway,'ironicInspectorCheck')
                            checkipInclude(scope.floating,scope.ironic.Gateway,'ironicFloatingCheck')
                            // checkipInclude(scope.inspectorDhcp,scope.inspectorDhcp.Gateway,'inspectorDhcp')
                            // checkipInclude(scope.ironic,scope.inspectorDhcp.Gateway,'inspectorIronicCheck')
                            // checkipInclude(scope.floating,scope.inspectorDhcp.Gateway,'inspectorFloatingCheck')
                            if(!scope.rangeSame
                                &&!scope.ironic.includeCheck
                                // &&!scope.ironicInspectorCheck.includeCheck
                                &&!scope.ironicFloatingCheck.includeCheck
                                // &&!scope.inspectorDhcp.includeCheck
                                // &&!scope.inspectorIronicCheck.includeCheck
                                // &&!scope.inspectorFloatingCheck.includeCheck
                                &&!scope.ClusterIpCheck
                                ){
                                var data = {
                                    "pluginName":scope.paramsData.selected.name,
                                    "ironicFloatingCidr":scope.ironic.cidr,
                                    "ironicFloatingGateway":scope.ironic.Gateway,
                                    "ironicStartip":scope.ironic.start,
                                    "ironicEndip":scope.ironic.end,
                                    // "inspectorVmMgmtNetmask":scope.inspectorDhcp.Netmask,
                                    // "inspectorVmMgmtGateway":scope.inspectorDhcp.Gateway,
                                    // "inspectorDhcpStartip":scope.inspectorDhcp.start,
                                    // "inspectorDhcpEndip":scope.inspectorDhcp.end
                                    "inspectorVmMgmtNetmask":"",
                                    "inspectorVmMgmtGateway":"",
                                    "inspectorDhcpStartip":"",
                                    "inspectorDhcpEndip":""
                                }
                                accessSrv.checkedFunStatus().then(function(res){
                                    if(res&&res.data){
                                        accessSrv.addFunData(data).finally(function(){
                                            initConTable();
                                        });
                                    }
                                })
                                $uibModalInstance.dismiss('cancel');
                            }
                        
                        }else{
                            scope.submitted = true;
                        }
                    };
                 break;
                case '1': 
                    // scope.container = {
                    //     "useCeph":0,
                    //     "serverIpAddressAndPort":"",
                    //     "masters":"192.168.138.140",
                    //     "nodes":"192.168.138.141-192.168.138.143",
                    //     "masterPassword":"awcloud",
                    //     "nodePassword":"awcloud",
                    //     "diskName":"/dev/sdb"
                    // }
                    
                    scope.container = {
                        "useCeph":0,
                        "serverIpAddressAndPort":"",
                        "masters":"",
                        "nodes":"",
                        "masterPassword":"",
                        "nodePassword":"",
                        "masterDiskName":"",
                        "nodeDiskName":""
                    }


                    scope.psDispaly = false;
                    scope.mpsDispaly = false;
                    scope.passwordDisplay = function(m){
                        if(m){
                            scope.mpsDispaly = !scope.mpsDispaly;
                            if(scope.mpsDispaly){
                                $("#ksmpsw").attr('type','text')   
                            }else{
                                $("#ksmpsw").attr('type','password')   
                            } 
                        }else{
                            scope.psDispaly = !scope.psDispaly;
                            if(scope.psDispaly){
                                $("#kspsw").attr('type','text')   
                            }else{
                                $("#kspsw").attr('type','password')   
                            } 
                        }
                    } 

                    scope.functionConfirm = function(form_field){
                        if(form_field.$valid){ 
                            var regionUid = JSON.parse(localStorage.$LOGINDATA).regionUid;
                            var data = {
                                "useCeph":scope.container.useCeph==1?true:false,
                                "serverIpAddressAndPort":scope.container.serverIpAddressAndPort,
                                "masters":scope.container.masters,
                                "nodes":scope.container.nodes,
                                "masterPassword":scope.container.masterPassword,
                                "nodePassword":scope.container.nodePassword,
                                "masterDiskName":scope.container.masterDiskName,
                                "nodeDiskName":scope.container.nodeDiskName,
                                "enterpriseUid":localStorage.enterpriseUid,
                                "regionUid":regionUid
                            }
                            accessSrv.addContent(data).finally(function(){
                                initConTable()
                            });
                            $uibModalInstance.dismiss('cancel');
                        }else{
                            scope.submitted = true;
                        }
                    };

                break;

                case "TDSQL":
                case "CTSDB":
                case "TSF":
                case "CloudSecurity":
                case "TBase":
                case "COC":
                case "TBDS":
                case "CMQ":
                case "APIGateway":
                case "BlueKing":
                case "Alauda":
                case "SkyCloudSecurity":
                scope.functionConfirm = function(form_field){
                    if(form_field.$valid){ 
                        var regionUid = JSON.parse(localStorage.$LOGINDATA).regionUid;
                        var data = {
                            "regionUid":JSON.parse(localStorage.$LOGINDATA).regionUid,
                            "enterpriseUid":localStorage.enterpriseUid,
                            "pluginName":scope.paramsData.selected.type,
                            "meta":angular.toJson(scope.paas[scope.paramsData.selected.type])  
                        }
                        // if(scope.paramsData.selected.type == "COC" || scope.paramsData.selected.type=="TBase" || scope.paramsData.selected.type == "TBDS"){
                        //     data.username = scope.paas[scope.paramsData.selected.type].username; 
                        //     data.password = scope.paas[scope.paramsData.selected.type].password; 
                        // }
                        // if(scope.paramsData.selected.type == "COC" || scope.paramsData.selected.type == "CloudSecurity"){
                        //     data.agentUrl = scope.paas[scope.paramsData.selected.type].agentUrl;
                        // }
                        accessSrv.addPaas(data).finally(function(){
                            initConTable()
                        });
                        $uibModalInstance.dismiss('cancel');
                    }else{
                        scope.submitted = true;
                    }
                };
                break;
            }
        }
        changePluginType()
        scope.changeType = function(v){
            scope.submitted = false;
            scope.functionForm.$setPristine();
            scope.functionForm.$setUntouched();
            if(v.type==2){
                scope.canHandles={
                    enableCeph:false,
                    enableDisable:true
                }
                accessSrv.getCephStatus().then(function(res){
                    var cephData = [];
                    if(res&&res.data&&res.data.length>0){
                        cephData = res.data.filter(function(i){
                            return i.storageFirm =='ceph'||i.storageFirm =='out_ceph'
                        })
                    }
                    if(cephData.length>0){
                        scope.canHandles={
                            enableCeph:false,
                            enableDisable:false
                        }
                    }else{
                        scope.canHandles={
                            enableCeph:true,
                            enableDisable:true
                        }
                    }
                })
                
            }
            changePluginType()
        }
 
    }])
.directive("gtips", [function() {
    return {
        require: "ngModel",
        link: function(scope, elem, attrs, $ngModel) {
            $ngModel.$parsers.push(function(value){
                var startValue = elem.parent().parent().siblings(".control-group").find(".form-control").val();
                if(_IP.isV4Format(value)){
                    if(_IP.toLong(value) <= _IP.toLong(startValue)){
                        $ngModel.$setValidity("gtips",false);
                        return value;
                    }
                    $ngModel.$setValidity("gtips",true);
                    return value;
                }
                return value;
            });
            scope.$watch(function(){
                return elem.parent().parent().siblings(".control-group").find(".form-control").val();
            },function(val){
                if(_IP.isV4Format(val)){
                    if(_IP.toLong($ngModel.$viewValue) <= _IP.toLong(val)){
                        $ngModel.$setValidity("gtips",false);
                        return;
                    }
                    $ngModel.$setValidity("gtips",true);
                }
            });
            $ngModel.$formatters.push(function(value){
                var startValue = elem.parent().parent().siblings(".control-group").find(".form-control").val();
                if(_IP.isV4Format(value)){
                    if(_IP.toLong(value) <= _IP.toLong(startValue)){
                        $ngModel.$setValidity("gtips",false);
                        return value;
                    }
                    $ngModel.$setValidity("gtips",true);
                    return value;
                }
                return value;
            });
        }
    };
}])
.directive("incidrs", [function() {
    return {
        require: "ngModel",
        link: function(scope, elem, attrs, $ngModel) {
            var cidr = "#" + attrs.incidrs;
            var cidrReg = /^((?:(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d))))[\/]([1-9]|[1-2][0-9]|[3][0]|[3][1])$/;
            $ngModel.$parsers.push(function(value){
                if(cidrReg.test($(cidr).val())){
                    var min = _IP.cidrSubnet($(cidr).val()).networkAddress;
                    var max = _IP.cidrSubnet($(cidr).val()).broadcastAddress;
                    if(_IP.isV4Format(value)){
                        if(!_IP.cidrSubnet($(cidr).val()).contains(value) || (_IP.cidrSubnet($(cidr).val()).contains(value) && (_IP.toLong(min) >= _IP.toLong(value) || _IP.toLong(max)<= _IP.toLong(value)))){
                            $ngModel.$setValidity("incidrs", false);
                            return value;
                        }
                    }
                }    
                $ngModel.$setValidity("incidrs", true);
                return value;
            });
            $ngModel.$formatters.push(function(value){
                if(cidrReg.test($(cidr).val())){
                    var min = _IP.cidrSubnet($(cidr).val()).networkAddress;
                    var max = _IP.cidrSubnet($(cidr).val()).broadcastAddress;
                    if(_IP.isV4Format(value)){
                        if(!_IP.cidrSubnet($(cidr).val()).contains(value) || (_IP.cidrSubnet($(cidr).val()).contains(value) && (_IP.toLong(min) >= _IP.toLong(value) || _IP.toLong(max)<= _IP.toLong(value)))){
                            $ngModel.$setValidity("incidrs", false);
                            return value;
                        }
                    }
                }
                $ngModel.$setValidity("incidrs", true);
                return value;
            });
            scope.$watch(function(){
                return $(cidr).val();
            },function(val){
                if(cidrReg.test($(cidr).val())&&_IP.cidrSubnet(val)){
                    var min = _IP.cidrSubnet(val).networkAddress;
                    var max = _IP.cidrSubnet(val).broadcastAddress;
                    if(!_IP.cidrSubnet(val).contains($ngModel.$viewValue) || (_IP.cidrSubnet(val).contains($ngModel.$viewValue) && (_IP.toLong(min) >= _IP.toLong($ngModel.$viewValue) || _IP.toLong(max)<= _IP.toLong($ngModel.$viewValue)))){
                        $ngModel.$setValidity("incidrs", false);
                        return;
                    }
                    $ngModel.$setValidity("incidrs", true);
                }
            });
        }
    };
}])