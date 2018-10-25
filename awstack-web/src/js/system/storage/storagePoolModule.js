import "./storageSrv"

angular
    .module("storagePoolModule",[ "ngAnimate", "ui.bootstrap","ngMessages","storagesrv"])
    .controller("storagePoolCtrl",storagePoolCtrl);

storagePoolCtrl.$inject = ["$rootScope", "$scope", "NgTableParams", "checkedSrv", "$uibModal", "$translate","GLOBAL_CONFIG","$filter","storageSrv","$routeParams"];

function storagePoolCtrl($rootScope, $scope, NgTableParams, checkedSrv, $uibModal, $translate,GLOBAL_CONFIG,$filter,storageSrv,$routeParams){
    var self = $scope;
    self.getStPool = function(){
        var postData = {
            "id": $routeParams.id,
            "Storage_name": $routeParams.Storage_name,
            "Pool_name": $routeParams.Pool_name
        }
        storageSrv.getPoolInfo(postData).then(function(result){
            if(result&& result.data){
                self.detailData = result.data;
            }
        });
    };
    //获取列表
    self.getStPool();
    // function successFunc(data) {
    //     //初始化表格
    //     data.map(item => {
    //         item.createtime = $filter("date")(item.createtime,"yyyy-MM-dd HH:mm:ss");
    //         item.searchTerm = [item.name,item.description,item.createtime].join(" ");
    //     });
    //     self.tabledata = data;
    //     self.tableParams = new NgTableParams({ count: GLOBAL_CONFIG.PAGESIZE }, { counts: [], dataset: self.tabledata});
    //     self.applyGlobalSearch = function() {
    //         var term = self.globalSearchTerm;
    //         self.tableParams.filter({ searchTerm: term });
    //     };
    //     var tableId = "id";
    //     checkedSrv.checkDo(self, data, tableId);
    // }
    
    //新建存储资源池
    // self.add = function(){
    //     var scope = $rootScope.$new();
    //     var modalInstance =  $uibModal.open({
    //        animation: $scope.animationsEnabled,
    //        templateUrl: "add.html",
    //        scope:scope
    //     });
    //     scope.submitInValid = false;
    //     scope.pool = {};
    //     scope.confirmadd = function(field){
    //         if(field.$valid){
    //             modalInstance.close();
    //             var id=""; 
    //             for(var i=0;i<6;i++) { 
    //                 id+=Math.floor(Math.random()*10); 
    //             } 
    //             storageSrv.pool_data.push({
    //                 id:id,
    //                 name:scope.pool.name,
    //                 description:scope.pool.description,
    //                 createtime:moment().format('YYYY-MM-DD:HH:mm:ss')
    //             })
    //             successFunc(storageSrv.pool_data);
    //         }else{
    //             scope.submitInValid = true;
    //         }
    //     }
    // };
    // self.edit = function(){
    //     var scope = $rootScope.$new();
    //     var modalInstance =  $uibModal.open({
    //        animation: $scope.animationsEnabled,
    //        templateUrl: "edit.html",
    //        scope:scope
    //     });
    //     scope.submitInValid = false;
    //     scope.pool = self.editData;
    //     scope.confirmadd = function(field){
    //         if(field.$valid){
    //             modalInstance.close();
    //             storageSrv.pool_data = storageSrv.pool_data.filter(item => item.id !=scope.pool.id)
    //             storageSrv.pool_data.push({
    //                 id:scope.pool.id,
    //                 name:scope.pool.name,
    //                 description:scope.pool.description,
    //                 createtime:scope.pool.createtime
    //             })
    //             successFunc(storageSrv.pool_data);
    //         }else{
    //             scope.submitInValid = true;
    //         }
    //     }
    // };

    // self.delete = function() {
    //     var content = {
    //         target: "delpool",
    //         msg: "<span>" + $translate.instant("aws.instances.tipMsg.delSever") + "</span>"
    //     };
    //     self.$emit("delete", content);
    // };
    // self.$on("delpool", function() {
    //     var ids = [];
    //     self.checkedItems.map(item => {
    //         ids.push(item.id)
    //     })
    //     ids.map(val => {
    //         storageSrv.pool_data = storageSrv.pool_data.filter(item => item.id != val)
    //     })
        
    //     successFunc(storageSrv.pool_data);
    // });
}
