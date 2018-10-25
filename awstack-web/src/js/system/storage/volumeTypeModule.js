import "./storageSrv";
import "../../cvm/instances/instancesSrv"
angular
	.module("volumeTypeModule",[ "ngAnimate", "ui.bootstrap","ngMessages","storagesrv"])
	.controller("volumeTypeCtrl",volumeTypeCtrl);

volumeTypeCtrl.$inject = ["$rootScope", "$scope", "NgTableParams", "checkedSrv", "$uibModal", "$translate","GLOBAL_CONFIG","$filter","storageSrv","instancesSrv"];

function volumeTypeCtrl($rootScope, $scope, NgTableParams, checkedSrv, $uibModal, $translate,GLOBAL_CONFIG,$filter,storageSrv,instancesSrv){
    var self = $scope;
    self.getStvolumeType = function(){
        instancesSrv.getvolumeTypes().then(function(result){
            self.volTypeData = result.data;
            if(result && angular.isArray(result.data)){
                successFunc(result.data); 
            }

        })
    };
    
    function successFunc(data) {
        //初始化表格
        data = data.filter(function(item){
            return item.name != "ceph_1#volumes"
        })
        data.map(item => {
            /*item.name == "ceph_1#volumes"?item.name="ceph":"";*/
            item.searchTerm = [item.name,item.id].join(" ");
        });
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
    self.getStvolumeType();
    self.init = function(){
        storageSrv.getInit().then(res=>{
            console.log(res);
        })
    }

    //新建
    // self.add = function(){
    //     var scope = $rootScope.$new();
    //     var modalInstance =  $uibModal.open({
    //        animation: $scope.animationsEnabled,
    //        templateUrl: "add.html",
    //        scope:scope
    //     });
    //     scope.submitInValid = false;
    //     scope.voltype = {};
    //     scope.deviceList = [{
    //     	id:1,
    //     	name:"设备01"
    //     },{
    //     	id:2,
    //     	name:"设备02"
    //     },{
    //     	id:3,
    //     	name:"设备03"
    //     }];
    //     scope.poolList = [{
    //     	id:1,
    //     	name:"存储池01"
    //     },{
    //     	id:2,
    //     	name:"存储池02"
    //     },{
    //     	id:3,
    //     	name:"存储池03"
    //     }];
    //     scope.voltype.devicename =  scope.deviceList[0];
    //     scope.voltype.stpool = scope.poolList[0];
    //     scope.voltype.typeone = true;
    //     scope.voltype.typethree = true;
    //     scope.confirmadd = function(field){
    //         if(field.$valid){
    //             modalInstance.close();
    //             var id=""; 
    //             for(var i=0;i<6;i++) { 
    //                 id+=Math.floor(Math.random()*10); 
    //             } 
    //             storageSrv.voltype_data.push({
    //                 id:id,
    //                 name:scope.voltype.name,
    //                 description:scope.voltype.description,
    //                 createtime:moment().format('YYYY-MM-DD:HH:mm:ss')
    //             })
    //             successFunc(storageSrv.voltype_data);
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
    //     scope.voltype = self.editData;
    //     scope.deviceList = [{
    //         id:1,
    //         name:"设备01"
    //     },{
    //         id:2,
    //         name:"设备02"
    //     },{
    //         id:3,
    //         name:"设备03"
    //     }];
    //     scope.poolList = [{
    //         id:1,
    //         name:"存储池01"
    //     },{
    //         id:2,
    //         name:"存储池02"
    //     },{
    //         id:3,
    //         name:"存储池03"
    //     }];
    //     scope.voltype.devicename =  scope.deviceList[0];
    //     scope.voltype.stpool = scope.poolList[0];
    //     scope.voltype.typeone = true;
    //     scope.voltype.typethree = true;
    //     scope.confirmadd = function(field){
    //         if(field.$valid){
    //             modalInstance.close();
                
    //             storageSrv.voltype_data = storageSrv.voltype_data.filter(item => item.id !=scope.voltype.id)
    //             storageSrv.voltype_data.push({
    //                 id:scope.voltype.id,
    //                 name:scope.voltype.name,
    //                 description:scope.voltype.description,
    //                 createtime:scope.voltype.creattime
    //             })
    //             successFunc(storageSrv.voltype_data);
    //         }else{
    //             scope.submitInValid = true;
    //         }
    //     }
    // };

    // self.delete = function() {
    //     var content = {
    //         target: "delvoltype",
    //         msg: "<span>" + $translate.instant("aws.instances.tipMsg.delSever") + "</span>"
    //     };
    //     self.$emit("delete", content);
    // };
    // self.$on("delvoltype", function() {
    //     var ids = [];
    //     self.checkedItems.map(item => {
    //         ids.push(item.id)
    //     })
    //     ids.map(val => {
    //         storageSrv.voltype_data = storageSrv.voltype_data.filter(item => item.id != val)
    //     })
        
    //     successFunc(storageSrv.voltype_data);
    // });

}
    