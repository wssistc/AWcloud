piecewiseManageCtrl.$inject=['$scope','$rootScope','$timeout','NgTableParams','$uibModal',"GLOBAL_CONFIG",'checkedSrv','TableCom','$translate','tdsqlSrv']
addPieceModalCtrl.$inject=['$scope','$rootScope','$timeout','NgTableParams','$uibModal',"GLOBAL_CONFIG",'checkedSrv','tdsqlSrv','TableCom','$translate','context']
dilatationSliceCtrl.$inject=['$scope','$rootScope','$timeout','NgTableParams','$uibModal',"GLOBAL_CONFIG",'checkedSrv','tdsqlSrv','TableCom','$translate','context']
function piecewiseManageCtrl($scope,$rootScope,$timeout,NgTableParams,$uibModal,GLOBAL_CONFIG,checkedSrv,TableCom,$translate,tdsqlSrv) {
    var self = $scope;
    self.piece_search={};
    self.pieceCheckbox={
        checked:false,
        items:{}
    };
    //设置项的初始化
    self.titleName="tdsqlPiecewiseManage";
    if(sessionStorage["tdsqlPiecewiseManage"]){
       self.titleData=JSON.parse(sessionStorage["tdsqlPiecewiseManage"]);
    }else{
       self.titleData=[
          {name:'tdsql.pieceId',value:true,disable:true,search:'name'},
          {name:'tdsql.sqlTransmissionId',value:true,disable:false,search:'subnetName'},
          {name:'tdsql.monitor',value:true,disable:false,search:'subnetCidr'},
          {name:'tdsql.status',value:true,disable:false,search:'address_range'}, 
          {name:'tdsql.pieceVersion',value:true,disable:false,search:'state'},
          {name:'tdsql.insType',value:true,disable:false,search:'state'},
          {name:'tdsql.specifications',value:true,disable:false,search:'_shared'},
          {name:'tdsql.diskUsageRate',value:true,disable:false,search:'_shared'}
       ];
    }

    self.pieceSearchTearm=function(obj){
        var tableData = obj.tableData;
        var titleData = obj.titleData;
        tableData.map(function(item){
           item.searchTerm="";
           titleData.forEach(function(showTitle){
                 if(showTitle.value){
                    if(showTitle.search=='subnetCidr'){
                       item.subnets.forEach(function(subnet){
                          item.searchTerm+=subnet.cidr+"\b"; 
                       });
                    }else{
                       item.searchTerm+=item[showTitle.search]+"\b";
                    }
                 }
           });
        });
    };

    self.applyGlobalSearch=function(searchTerm){
        self.piece_search.searchTearm="";
        self.pieceTable.filter({
          searchTerm: searchTerm
        });
    };

    self.refreshPiece=getPiece();
    function getPiece(){
        self.piece_search.searchTearm="";
        self.loadPieceData=false;
        self.pieceTable = new NgTableParams({
           count: GLOBAL_CONFIG.PAGESIZE
        }, {
           counts: [],
           dataset: []
        });
        // tdsqlSrv.getPiece().then(function(res){
        //     res ? self.loadPieceData  = true : "";
        //     if(res&&res.data&&angular.isArray(res.data)){
               //successFunc(res.data); 
        //     }
        // });
    }

    function successFunc(data){
        self.pieceData=data;
        self.accountSearchTearm({tableData:self.pieceData,titleData:self.titleData});
        TableCom.init(self,'accountTable',self.pieceData,'id',10,'accountCheckbox');
    }

    //监听页面勾选框变化
    self.$watch(function() {
        return self.pieceCheckbox.items;//监控checkbox
    }, function(val) {
        self.pieceCheckedItems = [];
        var arr=[];
        for(var i in self.pieceCheckbox.items){
            arr.push(self.pieceCheckbox.items[i]);
        }
        if(val && arr.length>=0){
            for(var key in val){
                if(val[key]){
                    self.pieceData.forEach(item=>{
                        if(item.id==key){
                            self.pieceCheckedItems.push(item);
                        }
                    });
                }
            }
        }
    },true);

    self.addPiece=function(){
        self.addPieceModal=$uibModal.open({
            animation: true,
            templateUrl: "addPieceModal.html",
            controller: "addPieceModalCtrl",
            resolve: {
                context: function() {
                    return self;
                }
            }
        });
    };

    self.dilatationSlice=function(){
        self.addPieceModal=$uibModal.open({
            animation: true,
            templateUrl: "dilatationSlice.html",
            controller: "dilatationSliceCtrl",
            resolve: {
                context: function() {
                    return self;
                }
            }
        });
    };

}
function addPieceModalCtrl($scope,$rootScope,$timeout,NgTableParams,$uibModal,GLOBAL_CONFIG,checkedSrv,tdsqlSrv,TableCom,$translate,context) {
    var self = $scope;
    self.formData={
        "newPieceSpec":"",
        "newPieceDisk":30,
        "balancePercent":0
    };
    self.newPieceDiskStep=5;
    self.newPieceDiskUnit='GB';
    self.balanceUnit='%';
    self.balanceStep=1;
    self.pieceSubmintted=false;
    self.interactedAddPiece = function(field) {
        if (field) {
            return self.pieceSubmintted || field.$dirty;
        }
    };
    self.addPieceConfirm=function(addPieceForm){
        if(addPieceForm.$valid){

        }else{
            self.pieceSubmintted=true;
        }
    };
    
    //input框改变带宽的值
    self.changePieceDisk=function(value){
        var bindBar=$("#newPieceDiskBar").data("ionRangeSlider");
        bindBar.update({
            min: 30,
            max: 3000,
            type: 'single',//设置类型
            from:value,
            step: 1,
            prefix: "",//设置数值前缀
            postfix: "GB",//设置数值后缀
            prettify: true,
            hasGrid: true,
            grid:true,
        });
    };
    
    //初始化分片硬盘滑块得值
    $timeout(function(){
        $("#newPieceDiskBar").ionRangeSlider({
            min: 30,
            max: 3000,
            type: 'single',//设置类型
            from:self.formData.newPieceDisk,
            step: 1,
            prefix: "",//设置数值前缀
            postfix: "GB",//设置数值后缀
            prettify: true,
            hasGrid: true,
            grid:true,
            onChange:function(data){
                self.formData.newPieceDisk=data.from;
                self.$apply();
            }
        });
    },100);
    
}
function dilatationSliceCtrl($scope,$rootScope,$timeout,NgTableParams,$uibModal,GLOBAL_CONFIG,checkedSrv,tdsqlSrv,TableCom,$translate,context) {
    var self = $scope;
    self.formData={
        "newPieceSpec":"",
        "newPieceDisk":30,
    };
    self.newPieceDiskStep=5;
    self.newPieceDiskUnit='GB';
    self.pieceSubmintted=false;
    self.interactedDilatationSlice = function(field) {
        if (field) {
            return self.pieceSubmintted || field.$dirty;
        }
    };
    self.dilatationSliceFormConfirm=function(addPieceForm){
        if(addPieceForm.$valid){

        }else{
            self.pieceSubmintted=true;
        }
    };
    
    //input框改变带宽的值
    self.changePieceDisk=function(value){
        var bindBar=$("#dilatation").data("ionRangeSlider");
        bindBar.update({
            min: 30,
            max: 3000,
            type: 'single',//设置类型
            from:value,
            step: 1,
            prefix: "",//设置数值前缀
            postfix: "GB",//设置数值后缀
            prettify: true,
            hasGrid: true,
            grid:true,
        });
    };
    
    //初始化分片硬盘滑块得值
    $timeout(function(){
        $("#dilatation").ionRangeSlider({
            min: 30,
            max: 3000,
            type: 'single',//设置类型
            from:self.formData.newPieceDisk,
            step: 1,
            prefix: "",//设置数值前缀
            postfix: "GB",//设置数值后缀
            prettify: true,
            hasGrid: true,
            grid:true,
            onChange:function(data){
                self.formData.newPieceDisk=data.from;
                self.$apply();
            }
        });
    },100);
    
}
export{piecewiseManageCtrl,addPieceModalCtrl,dilatationSliceCtrl}