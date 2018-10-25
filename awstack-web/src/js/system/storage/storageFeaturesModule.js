import "./storageSrv"

angular
	.module("storageFeaturesModule",[ "ngAnimate", "ui.bootstrap","ngMessages","storagesrv"])
	.controller("storageFeaturesCtrl",storageFeaturesCtrl);

storageFeaturesCtrl.$inject = ["$rootScope", "$scope", "NgTableParams", "checkedSrv", "$uibModal", "$translate","GLOBAL_CONFIG","$filter","storageSrv"];

function storageFeaturesCtrl($rootScope, $scope, NgTableParams, checkedSrv, $uibModal, $translate,GLOBAL_CONFIG,$filter,storageSrv){
    var self = $scope;
    self.getStFeatures = function(){
      var postData = {
        "id": "1",
        "Storage_name": "NCS7500G2"
      }
      storageSrv.getFeatures(postData).then(function(result){
        self.featureData = result.data;
        if(result &&result.data &&  angular.isArray(result.data.Storage_characters)){
            successFunc(result.data.Storage_characters);   
        }
      });
    };
    function successFunc(data) {
        //初始化表格
        /*data.map(item => {
            item.createtime = $filter("date")(item.createtime,"yyyy-MM-dd HH:mm:ss");
            item.searchTerm = [item.name,item.description,item.createtime].join(" ");
        });*/
        self.tabledata = data;
        self.tableParams = new NgTableParams({ count: GLOBAL_CONFIG.PAGESIZE }, { counts: [], dataset: self.tabledata});
        self.applyGlobalSearch = function() {
            var term = self.globalSearchTerm;
            self.tableParams.filter({ searchTerm: term });
        };
        var tableId = "id";
        checkedSrv.checkDo(self, data, tableId);
    }

    //获取列表
    //self.getStFeatures();

   //新建
   // self.add = function(){
   //     var scope = $rootScope.$new();
   //     var modalInstance =  $uibModal.open({
   //        animation: $scope.animationsEnabled,
   //        templateUrl: "add.html",
   //        scope:scope
   //     });
   //     scope.submitInValid = false;
   //     scope.feature = {};
   //     scope.confirmadd = function(field){
   //         if(field.$valid){
   //             modalInstance.close();
   //             var id=""; 
   //             for(var i=0;i<6;i++) { 
   //                 id+=Math.floor(Math.random()*10); 
   //             } 
   //             storageSrv.features_data.push({
   //                 id:id,
   //                 name:scope.feature.name,
   //                 description:scope.feature.description,
   //                 createtime:moment().format('YYYY-MM-DD:HH:mm:ss')
   //             })
   //             successFunc(storageSrv.features_data);
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
   //     scope.feature = self.editData;
   //     scope.confirmadd = function(field){
   //         if(field.$valid){
   //             modalInstance.close();
               
   //             storageSrv.features_data = storageSrv.features_data.filter(item => item.id !=scope.feature.id)
   //             storageSrv.features_data.push({
   //                 id:scope.feature.id,
   //                 name:scope.feature.name,
   //                 description:scope.feature.description,
   //                 createtime:scope.feature.creattime
   //             })
   //             successFunc(storageSrv.features_data);
   //         }else{
   //             scope.submitInValid = true;
   //         }
   //     }
   // };

   // self.delete = function() {
   //     var content = {
   //         target: "delfeatures",
   //         msg: "<span>" + $translate.instant("aws.instances.tipMsg.delSever") + "</span>"
   //     };
   //     self.$emit("delete", content);
   // };
   // self.$on("delfeatures", function() {
   //     var ids = [];
   //     self.checkedItems.map(item => {
   //         ids.push(item.id)
   //     })
   //     ids.map(val => {
   //         storageSrv.features_data = storageSrv.features_data.filter(item => item.id != val)
   //     })
       
   //     successFunc(storageSrv.features_data);
   // });
}

