tdsqlCtrl.inject = ['$scope','$rootScope','$timeout','NgTableParams','$uibModal',"GLOBAL_CONFIG","$translate",'newCheckedSrv','tdsqlSrv']
createTdsqlCtrl.inject =  ['$scope','$rootScope','$timeout','NgTableParams',"GLOBAL_CONFIG",'newCheckedSrv','tdsqlSrv','$routeParams','$uibModal']
initTdsqlCtrl.inject = ['$scope','$rootScope','$timeout','NgTableParams','$uibModalInstance',"GLOBAL_CONFIG",'refreshTdsqlTable','initData','newCheckedSrv','tdsqlSrv']
upgradeTdsqlCtrl.inject = ['$scope','$rootScope','$timeout','NgTableParams','$uibModalInstance',"GLOBAL_CONFIG",'refreshTdsqlTable','initData','newCheckedSrv','tdsqlSrv']
//bindInstanceCtrl.inject = ['$scope','$rootScope','$timeout','NgTableParams','$uibModalInstance',"GLOBAL_CONFIG",'bindData','newCheckedSrv','tdsqlSrv']
modifyDataSyncCtrl.inject = ['$scope','$rootScope','$timeout','NgTableParams','$uibModalInstance',"GLOBAL_CONFIG",'refreshTdsqlTable','checkedSrv','tdsqlSrv']
function tdsqlCtrl($scope,$rootScope,$timeout,NgTableParams,$uibModal,GLOBAL_CONFIG,$translate,newCheckedSrv,tdsqlSrv) {
    var self = $scope;
    self.tdsql_search={};
    self.tab={};
    self.handleBtn = {
        delEnable:true,
    	isolation:true,
    	canInit:false,
    }
    //设置项的初始化
    self.titleName="TDSQL";
    if(sessionStorage["TDSQL"]){
       self.titleData=JSON.parse(sessionStorage["TDSQL"]);
    }else{
		self.titleData=[
			{name:'tdsql.header.id_name',value:true,disable:true,search:"instanceId"},
			{name:'tdsql.header.status',value:true,disable:true,search:"statusDisplay"},
			{name:'tdsql.header.type',value:true,disable:false,search:"instanceType"},
			{name:'tdsql.header.edition',value:true,disable:false,search:""},
			{name:'tdsql.header.specifications',value:true,disable:false,search:""},
			{name:'tdsql.header.address',value:true,disable:false,search:"hosts"},
		];
    }
    self.tdsqlSearchTerm=function(obj){
        var tableData = obj.tableData;
        var titleData = obj.titleData;
        tableData.map(function(item){
            item.searchTerm="";
            titleData.forEach(function(showTitle){
                if(showTitle.value){
                    item.searchTerm+=item[showTitle.search]+"\b";
                }
            });
        });  
    };
    var initTdsqlTable=function(){
        self.tdsqlTable = new NgTableParams({
           count: GLOBAL_CONFIG.PAGESIZE
        }, {
           counts: [],
           dataset: []
        });
        self.tdsql_search.globalSearchTerm ="";
        self.loadTdsqlData  = false;
        tdsqlSrv.getInstances().then(function(result){
            if(result&&result.data){
                result ? self.loadTdsqlData  = true : "";
                successFunc(result.data);
            }
        });
    };
    initTdsqlTable();

    function successFunc(data){
        self.tdsqlData=data.map(function(item){
            item.statusDisplay = $translate.instant("aws.tdsql.instatus." + item.instanceStatus);
            return item;
        });
        //根据session初始化searchterm
        self.tdsqlSearchTerm({tableData:self.tdsqlData,titleData:self.titleData});
        self.tdsqlTable = new NgTableParams({
         count: GLOBAL_CONFIG.PAGESIZE
        }, {
         counts: [],
         dataset: self.tdsqlData
        });
        newCheckedSrv.checkDo(self, "", "id", "tdsqlTable");
    }

    self.refreshTdsql=function(){
       initTdsqlTable();
    };

    self.$watch(function() {
        return self.checkedItemstdsqlTable;
    }, function(value) {
        if(!value){
            self.handleBtn.delEnable = true;
            self.handleBtn.isolation = true;
            return
        }
        self.handleBtn.canInit=false;
        if(value.length==1){
            self.handleBtn.delEnable = false;
            self.handleBtn.isolation = false;
            self.handleBtn.canInit = true;
        }else if(value.length>1){
            self.handleBtn.delEnable = true;
        }else if(value.length==0){
            self.handleBtn.delEnable = true;
            self.handleBtn.isolation = true;
        }
    });
    
    self.applyGlobalSearch = function() {
        self.tdsqlTable.filter({
            searchTerm: self.tdsql_search.globalSearchTerm
        });
    };

    //新建TDSQL
    self.createTdsql = function() {
        self.tdsqlAnimation = "animateIn";
        $("body").addClass("animate-open")
    };
    self.tdsqlAnimation = "animateOut";
    self.closeTdsql = function(){
        self.tdsqlAnimation = "animateOut";
        $("body").removeClass("animate-open")
    }

    //初始化
    self.initTdsql = function(initData) {
        var editPortsModal=$uibModal.open({
            animation: true,
            templateUrl: "initTdsql.html",
            controller: "initTdsqlCtrl",
            resolve: {
                refreshTdsqlTable: function() {
                    return initTdsqlTable;
                },
                initData:function(){
                    return initData;
                }
            }
        });
    };

    //升级
    self.upgradeTdsql = function(upgradeData) {
        var editPortsModal=$uibModal.open({
            animation: true,
            templateUrl: "upgradeTdsql.html",
            controller: "upgradeTdsqlCtrl",
            resolve: {
                refreshTdsqlTable: function() {
                    return initTdsqlTable;
                },
                initData:function(){
                    return upgradeData;
                }
            }
        });
    };

    //实例隔离
    self.isolationDestruction= function(checkedItems) {
        console.log(checkedItems)
        var content = {
            target: "isolationDes",
            msg: "<span class='isolation'>" + '您正在隔离（'+checkedItems.id+'），实例隔离后将不可被访问，进一步可删除或恢复运行，隔离后资源空间不会被释放且保留最基本的数据副本。'+'<a>隔离策略详情</a>'+ "</span>",
            data: checkedItems
        };
        self.$emit("delete", content);
    };
    self.$on("isolationDes", function(e,data) {
            
    });

    //实例取消隔离
    self.cancelDestruction= function(checkedItems) {
        var content = {
            target: "cancelDes",
            msg: "<span class='cancelDes'>" + '您确定取消隔离？' + "</span>",
            data: checkedItems,
            btnType:'btn-primary'
        };
        self.$emit("delete", content);
    };
    self.$on("cancelDes", function(e,data) {
            
    });

    //实例销毁
    self.delDestruction= function(checkedItems) {
        var content = {
            target: "delDes",
            msg: "<span class='isolation'>" + '您正在销毁（扩容），销毁实例将删除该实例所有数据且不可恢复，请谨慎操作，确定后，销毁实例' + "</span>",
            data: checkedItems
        };
        self.$emit("delete", content);
    };
    self.$on("delDes", function(e,data) {
            
    });

    //绑定云主机
    // self.bindInstance = function(bindData){
    //     var bindInstanceModal=$uibModal.open({
    //         animation: true,
    //         templateUrl: "bindInstance.html",
    //         controller: "bindInstanceCtrl",
    //         resolve: {
    //             bindData:function(){
    //                 return bindData;
    //             }
    //         }
    //     });
    // }

    self.activeTab=function(activeTab){
       self.tab.active = activeTab;
       self.activeDetailTmpl = 'js/paas/tdsql/tmpl/'+activeTab+"Tmpl.html"
    };

    //升级
    self.modifyDataSyncType = function() {
        var modifyDataSyncModal=$uibModal.open({
            animation: true,
            templateUrl: "modifyDataSync.html",
            controller: "modifyDataSyncCtrl",
            resolve: {
                refreshTdsqlTable: function() {
                    return initTdsqlTable;
                }
            }
        });
    };
   
    //tdsql详情
    $scope.$on("getDetail", function(event, value) {
       self.activeTab('insDetail');
    });


    //进度展示模态框
    function showProessModal (){
        
    }

    
    //新建成功
    self.$on("newTDSQL",function(){
        console.log('添加成功')
        self.closeTdsql();
    });

}
function createTdsqlCtrl($scope,$rootScope,$timeout,NgTableParams,GLOBAL_CONFIG,newCheckedSrv,tdsqlSrv,$routeParams,$uibModal) {   
	var self = $scope;
    self.options = {
        'instanceType':0,
        'edition':2,
        'disksize':100,
        "cpuCore":"",
        "memSize":"",
        "mode":1,
        //'chasesnum':1,
        'fragmentnum':2,
    }
    self.limit = {
        maxCore:"",
        maxMen:""
    }

    self.synType = [
        {name:'强同步（可退化）',type:1},
        {name:'异步',type:0},
    ]

    self.instanceType = [
        {
            text:'分布式实例',
            value:0,
        },
        {
            text:'非分布式实例',
            value:1,
        }
    ]

    self.editionType = [
        {
            text:'标准版（一主一从）',
            value:2,
        },
        {
            text:'标准版（一主二从）',
            value:3,
        }
    ]


    self.availableDataSet ={
        clusterList:[],
        databaseList:[
            {
                name:"兼容MySQL 5.6(基于MariaDB 10.1.9分支, 不支持分布式事务)",
                key:"10.1.9"
            },
            {
                name:"兼容MySQL 5.6(基于MairaDB 10.0.10分支, 较老版本，不建议使用)",
                key:"10.0.10"
            },
            {
                name:"MySQL 5.7.17(基于MySQL 5.7.17分支, 支持分布式事务)",
                key:"5.7.17"
            },
            
        ],
        specificationList:[]
    }
    self.getSpecificationList = function (clusterKey){
        tdsqlSrv.getSpecificationList(clusterKey).then(function(res){
            if(res&&res.data){
                let listData = angular.copy(res.data.returnData.spec);
                let specificationData = [];
                listData.forEach(item=>{
                    let str = item.machine+" （cpu:"+item.cpu/100+"核 内存:"+(item.mem/1024).toFixed(2)+"GB 数据磁盘:"+(item.data_disk/1024).toFixed(2)+"GB 日志磁盘:"+(item.log_disk/1024).toFixed(2)+"GB）";
                    specificationData.push({
                        name:str,
                        cpu:item.cpu/100,
                        mem:(item.mem/1024).toFixed(2),
                        value:item.machine
                    })
                })
                self.availableDataSet.specificationList = specificationData;
                self.availableDataSet.specificationSelect = self.availableDataSet.specificationList[0];
                self.limit.maxMen = self.availableDataSet.specificationList[0].mem;
                self.limit.maxCore = self.availableDataSet.specificationList[0].cpu;
            }
        })
    }

    self.changeQueryspec = function(v){
        self.options.cpuCore = "";
        self.options.memSize = "";
        self.limit.maxMen = v.mem;
        self.limit.maxCore = v.cpu;
    }

    tdsqlSrv.getCluster().then(function(res){
        if(res&&res.data){
            self.availableDataSet.clusterList = res.data;
            self.availableDataSet.clusterSelect = self.availableDataSet.clusterList[0];
            self.getSpecificationList(self.availableDataSet.clusterSelect.clusterKey)
        }
    })
    self.availableDataSet.databaseSelect = self.availableDataSet.databaseList[0];
    
    self.chooseNetType = function(item){
        self.options.netType = item.value;
    }
    self.chooseEdition = function(item){
        self.options.edition = item.value;
    }

    $timeout(function(){
       $("#bindBar").ionRangeSlider({
            min: 0,
            max: 3000,
            type: 'single',//设置类型
            from:self.options.disksize,
            step: 5,
            prefix: "",//设置数值前缀
            postfix: "GB",//设置数值后缀
            prettify: true,
            hasGrid: true,
            grid:true,
            onChange:function(data){
                self.options.disksize=data.from;
                self.$apply();
            }
        }); 
    },500)
    
    //input框改变磁盘的值
    self.changeDiskSize=function(value){
        var bindBar=$("#bindBar").data("ionRangeSlider");
        bindBar.update({
            min: 0,
            max: 3000,
            type: 'single',//设置类型
            from:value,
            step: 1,
            prefix: "",//设置数值前缀
            postfix: "M",//设置数值后缀
            prettify: true,
            hasGrid: true,
            grid:true,
        });
    };

    self.changeSize = function(type){
        if(type=='add'){
            if(self.options.disksize>2999){return;}
            self.options.disksize = self.options.disksize + 5;
            self.changeDiskSize(self.options.disksize);
        }else{
            if(self.options.disksize<2){return;}
            self.options.disksize = self.options.disksize - 5;
            self.changeDiskSize(self.options.disksize);
        }
    }

    self.changeFragmentNum = function(type){
        if(type=='add'){
            if(self.options.fragmentnum>7){return;}
            self.options.fragmentnum++;
        }else{
            if(self.options.fragmentnum<3){return;}
            self.options.fragmentnum--;
        }
    }

    self.confirmCreate = function(m){
        self.$emit("newTDSQL");
        return;
        if(m.$valid){
            if(self.options.instanceType==1){
                var data = {
                        "projectUid":localStorage.projectUid, //项目ID
                        "clusterKey":self.availableDataSet.clusterSelect.clusterKey,  //集群KEY
                        "instanceType":self.options.instanceType,     //实例类型(0分布式，1非分布式)
                        "dbversion":self.availableDataSet.databaseSelect.key,  //数据库版本
                        "nodeNum":self.options.edition,           //set的机器数目，2：一主一备；3：一主两备；默认是3
                        "cpu":self.options.cpuCore,           //cpu数量；"100"：代表一个cpu
                        "memory":self.options.memSize,       //内存的大小；单位是M
                        "dataDisk":self.options.disksize*1024,    //数据盘的大小；单位是M
                        "logDisk":self.options.disksize*1024*100,     //日志盘的大小；单位是M
                        "syncType":self.options.mode,           //主机和备机的模式。0：异步模式；1：强同步
                        "machine":self.availableDataSet.specificationSelect.value        //机型规格
                    }
                tdsqlSrv.addInstance(data).then(function(res){
                    if(res){
                        self.$emit("newTDSQL")
                    }
                })
            }else{

            }
        }else{
            self.submitInValid = true;
        }
    }
}
function initTdsqlCtrl($scope,$rootScope,$timeout,NgTableParams,$uibModalInstance,GLOBAL_CONFIG,refreshTdsqlTable,initData,newCheckedSrv,tdsqlSrv) {
	var self = $scope;
    self.initParams = {
        'character':'UTF8',
        'mode':'asy',
        'case':true
    }
    self.supportCharacter = [
        {name:'UTF8',type:'UTF8'},
        {name:'LATIN1',type:'LATIN1'},
        {name:'GBK',type:'GBK'},
        {name:'UTF8MB4',type:'UTF8MB4'},
    ]
}
function upgradeTdsqlCtrl($scope,$rootScope,$timeout,NgTableParams,$uibModalInstance,GLOBAL_CONFIG,refreshTdsqlTable,initData,newCheckedSrv,tdsqlSrv) {
    var self = $scope;
    console.log('sasasasas')
    $timeout(function(){
        function getNowFormatDate(date) {
            var seperator1 = "-";
            var month = date.getMonth() + 1;
            var strDate = date.getDate();
            if (month >= 1 && month <= 9) {
                month = "0" + month;
            }
            if (strDate >= 0 && strDate <= 9) {
                strDate = "0" + strDate;
            }
            var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate;
            return currentdate;
        }
        $('.form_date').datetimepicker({
            language: "zh-CN",
            weekStart: 1,
            todayBtn: 1,
            autoclose: 1,
            todayHighlight: 1,
            minView:"month",
            //startView: 2, 
            minuteStep:5,
            forceParse: 0,
            format: "yyyy-mm-dd",
            pickerPosition: "bottom-left",
            
        });
        var date = new Date();
        $('.form_date').datetimepicker('setStartDate', getNowFormatDate(date));
    },1000)

    self.upgradeData = {
        name:'aaaa',
        edition:'标准版',
        specifications:'aaaddddd',
        upgradeSpecification:{nama:"xss",type:'www'},
        disksize:100,
        suit:'sjoded',
        useTime:'dadadadad',
        change:true
    }
    $timeout(function(){
       $("#upgradeBar").ionRangeSlider({
            min: 0,
            max: 10000,
            type: 'single',//设置类型
            from:self.upgradeData.disksize,
            step: 1,
            prefix: "",//设置数值前缀
            postfix: "M",//设置数值后缀
            prettify: true,
            hasGrid: true,
            grid:true,
            onChange:function(data){
                self.upgradeData.disksize=data.from;
                self.$apply();
            }
        }); 
    },300)
    
    //input框改变磁盘的值
    self.changeDiskSize=function(value){
        console.log(value)
        var bindBar=$("#upgradeBar").data("ionRangeSlider");
        bindBar.update({
            min: 0,
            max: 10000,
            type: 'single',//设置类型
            from:value,
            step: 1,
            prefix: "",//设置数值前缀
            postfix: "M",//设置数值后缀
            prettify: true,
            hasGrid: true,
            grid:true,
        });
    };

    self.changeSize = function(type){
        if(type=='add'){
            if(self.upgradeData.disksize>9999){return;}
            self.upgradeData.disksize++;
            self.changeDiskSize(self.upgradeData.disksize);
        }else{
            if(self.upgradeData.disksize<1){return;}
            self.upgradeData.disksize--;
            self.changeDiskSize(self.upgradeData.disksize);
        }
    }
    self.changePurchasesNum = function(type){
        if(type=='add'){
            if(self.options.purchasesnum>9999){return;}
            self.options.purchasesnum++;
        }else{
            if(self.options.purchasesnum<1){return;}
            self.options.purchasesnum--;
        }
    }
}
// function bindInstanceCtrl($scope,$rootScope,$timeout,NgTableParams,$uibModalInstance,GLOBAL_CONFIG,bindData,newCheckedSrv,tdsqlSrv) {
//     var self = $scope;
//     self.filterList = [
//         {
//             name:"已绑定",
//             value:"bind"
//         },
//         {
//             name:"未绑定",
//             value:"unbind"
//         }
//     ]
//     self.handleBtn={}
//     self.filterselect =  {
//         name:"未选择",
//         value:"unselect"
//     }
//     var initInstancesTable=function(){
//         self.instancesTable = new NgTableParams({
//            count: GLOBAL_CONFIG.PAGESIZE
//         }, {
//            counts: [],
//            dataset: []
//         });
//         self.globalSearchTerm = "";
//         self.instancesData  = false;
//        // tdsqlSrv.getTdsqlList().then(function(result){
//             var result = {};
//             result.data = [
//                 {
//                    "id":1,
//                    "name":"云主机一",
//                    "status":1,
//                    "privateIp":"192.1.2.1",
//                    "publicIp":"172.1.2.1",
//                    "bindStatus":1
//                 },
//                 {
//                    "id":2,
//                    "name":"云主机一",
//                    "status":2,
//                    "privateIp":"156.1.2.1",
//                    "publicIp":"255.1.2.1",
//                    "bindStatus":2
//                 }
//             ];
//             // result ? self.instancesData  = true : "";
//             // if(result&&result.data&&angular.isArray(result.data)){
//                 successFunc(result.data);
//             // }
//         //});
//     };
//     initInstancesTable();

//     function successFunc(data){
//         var initInstancesTable=data.map(function(item){
//             item.searchTerm=[item.name,item.status,item.privateIp,item.publicIp,item.bindStatus].join('\b');
//             return item;
//         });
//         self.instancesTable = new NgTableParams({
//             count: GLOBAL_CONFIG.PAGESIZE
//             }, {
//             counts: [],
//             dataset:initInstancesTable
//         });
//         newCheckedSrv.checkDo(self, "", "id", "instancesTable");
//     }

//     self.refreshInstancesTable=function(){
//        initInstancesTable();
//     };

//     self.$watch(function() {
//         return self.checkedItemsinstancesTable;
//     }, function(value) {
//         if(!value){
//             self.handleBtn.bindBtn = true;
//             self.handleBtn.unbindBtn = true;
//             return
//         }
//         if(value.length==1){
//             self.handleBtn.bindBtn = false;
//             self.handleBtn.unbindBtn = false;
//         }else{
//             self.handleBtn.bindBtn = true;
//             self.handleBtn.unbindBtn = true;
//         }
//     });
    
//     self.applyGlobalSearch = function() {
//         self.instancesTable.filter({
//             searchTerm: self.globalSearchTerm
//         });
//     };
// }
function modifyDataSyncCtrl($scope,$rootScope,$timeout,NgTableParams,$uibModalInstance,GLOBAL_CONFIG,refreshTdsqlTable,checkedSrv,tdsqlSrv) {
    var self = $scope;
    self.type={
        syncType:'Synchronous'
    };
    self.modifyDataSyncConfirm=function(modifyDataSyncForm){
        console.log(self.type.syncType,"self.type.syncType");
        // $uibModalInstance.close();
    };
}
export{tdsqlCtrl,createTdsqlCtrl,initTdsqlCtrl,upgradeTdsqlCtrl,modifyDataSyncCtrl}
