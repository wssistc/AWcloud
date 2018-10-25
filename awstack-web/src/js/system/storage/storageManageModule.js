import "./storageSrv";
import "../../cvm/instances/instancesSrv";

angular
    .module("storageManageModule",[ "ngAnimate", "ui.bootstrap","ngMessages","storagesrv"])
    .controller("storageManageCtrl",storageManageCtrl)
    .controller("storageController",storageController);

storageManageCtrl.$inject = ["$rootScope", "$scope", "NgTableParams", "checkedSrv", "$uibModal", "$translate","GLOBAL_CONFIG","$filter","storageSrv","$routeParams","instancesSrv"];
storageController.$inject = ["$rootScope","$uibModalInstance", "$scope", "NgTableParams", "checkedSrv", "$uibModal", "$translate","GLOBAL_CONFIG","$filter","storageSrv","$routeParams","getStorageList"];
function storageController($rootScope, $uibModalInstance, $scope, NgTableParams, checkedSrv, $uibModal, $translate,GLOBAL_CONFIG,$filter,storageSrv,$routeParams,getStorageList){
    var param={
        "enterprise_id": localStorage.enterpriseUid,
        "region_key":localStorage.regionKey
    };
    var self = $scope;
    self.submitInValid = false;
    self.submitInValid_cus = false;
    self.storagesType="custom";
    self.addStorage={}
    self.changeStorgeType=function(type){
      self.storagesType=type;
    }
    self.custom={};
    self.confirmadd = function(m1,m2){
      self.submitInValid = false;
      self.submitInValid_cus = false;
      if(self.storagesType=='custom'){
          if(m2.$valid){
            var Data={
              "storage_name":self.custom.name,
              "storage_pools":self.custom.pool,
              "storage_interface":self.custom.interface,
                "enterprise_id": localStorage.enterpriseUid,
                "region_key":localStorage.regionKey

            }
            storageSrv.addCustomStorage(Data).then(function(){
              getStorageList(param);
            })
            $uibModalInstance.dismiss("cancel")
         }else{
            self.submitInValid_cus = true;
         }
      }
      if(self.storagesType=='Predefined'){
          if(m1.$valid){
            $uibModalInstance.dismiss("cancel")
         }else{
             self.submitInValid = true;
         }
      } 
    }
    
 }
function storageManageCtrl($rootScope, $scope, NgTableParams, checkedSrv, $uibModal, $translate,GLOBAL_CONFIG,$filter,storageSrv,$routeParams,instancesSrv){
    var param={
        "enterprise_id": localStorage.enterpriseUid,
        "region_key":localStorage.regionKey
    };
    var self = $scope;
   /*添加存储*/
   self.add = function(){
    var scope = $rootScope.$new();
    var modalInstance =  $uibModal.open({
      animation: $scope.animationsEnabled,
      templateUrl: "add.html",
      controller: "storageController",
      resolve: {
        getStorageList: function() {
          return getStorageList
        }
      }
    });
  }
  /*初始化列表*/
  function getStorageList(param){
    self.selectedStorage={}
    storageSrv.getStorageList(param).then(function(res){
      if(res&&res.data){
        res.data.map(item=>{
          self.selectedStorage[item.storage_id] = item.isactivity;
        });
        self.tabledata = res.data;
        self.tableParams = new NgTableParams({ count: GLOBAL_CONFIG.PAGESIZE }, { counts: [], dataset: self.tabledata});
        self.applyGlobalSearch = function() {
            var term = self.globalSearchTerm;
            self.tableParams.filter({ $: term });
        };
        var tableId = "storage_id";
        checkedSrv.checkDo(self, self.tabledata, tableId); 
      }
    })
  }
  getStorageList(param)
  /*是否激活存储*/
  self.activationFun = function(id,b){
    self.isHanding = true;
    var Data={
      "storage_id":id,
      "isactivity":b
    }
    storageSrv.isActivityStorage(Data).finally(function(){
      self.isHanding = false;
    })
}
  /*编辑*/    
  self.edit = function(){
    var scope = $rootScope.$new();
    scope.edits={
      name:self.checkedItems[0].storage_name,
      pool:self.checkedItems[0].storage_pools
    }
    var modalInstance =  $uibModal.open({
      animation: $scope.animationsEnabled,
      templateUrl: "edit.html",
      scope:scope
    });
    scope.submitInValid = false;
    scope.confirmadd = function(field,edit){
      if(field.$valid){
        var Data={
          "storage_id":self.checkedItems[0].storage_id,
          "storage_name":edit.name,
          "storage_pools":edit.pool
        }
        storageSrv.editStorage(Data).then(function(){
          getStorageList(param);
        })
        modalInstance.close(); 
      }else{
        scope.submitInValid = true;
      }
    }
  };

  /*删除*/
  self.delete = function() {
    var content = {
      target: "delstorages",
      msg: "<span>" + $translate.instant("aws.instances.tipMsg.delSever") + "</span>"
    };
    self.$emit("delete", content);
  };
  self.$on("delstorages", function() {
    var ids = [];
    self.checkedItems.map(item => {
      ids.push(item.storage_id)
    })
    storageSrv.deleteStorage(ids).then(function(){
      getStorageList(param);
    })
  });

}
