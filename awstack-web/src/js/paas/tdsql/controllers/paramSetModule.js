paramSetCtrl.$inject = ['$scope','$rootScope','$timeout','NgTableParams','$uibModal',"GLOBAL_CONFIG",'checkedSrv','tdsqlSrv','TableCom','$translate']
function paramSetCtrl($scope,$rootScope,$timeout,NgTableParams,$uibModal,GLOBAL_CONFIG,checkedSrv,tdsqlSrv,TableCom,$translate) {
    var self = $scope;
    self.modifying = false;
    self.paramList=[
        {name:"auto_increment_increment",restart:0,default:"1",currentValue:"1",range:"[1-65535]"},
        {name:"autocommlt",restart:0,default:"ON",currentValue:"ON",range:"[ON|OFF]"},
    ];
    self.modifyValue=function(){
        if(self.modifying){
            self.btnValues = $translate.instant('aws.tdsql.modifyValue');
        }else{
            self.btnValues = $translate.instant('aws.tdsql.saveModifyValue');
        }
        self.modifying = !self.modifying;

    };
    self.modifyValue();
    function getParam(){
        self.paramTable = new NgTableParams({
           count: GLOBAL_CONFIG.PAGESIZE
        }, {
           counts: [],
           dataset: []
        });
        // tdsqlSrv.getParam().then(function(res){
        //     res ? self.paramData  = true : "";
        //     if(res&&res.data&&angular.isArray(res.data)){
               successFunc(self.paramList); 
            // }
        // });
    }
    function successFunc(data){
        TableCom.init(self,'paramTable',self.paramList,'id',10,'paramCheckbox');
    }
    getParam();
}
export{paramSetCtrl}