import "./storageSrv";
import "../../cvm/instances/instancesSrv";

angular
    .module("storageDeviceModule",[ "ngAnimate", "ui.bootstrap","ngMessages","storagesrv"])
    .controller("storageDeviceCtrl",storageDeviceCtrl);

storageDeviceCtrl.$inject = ["$rootScope", "$scope", "NgTableParams", "checkedSrv", "$uibModal", "$translate","GLOBAL_CONFIG","$filter","storageSrv","$routeParams","instancesSrv"];

function storageDeviceCtrl($rootScope, $scope, NgTableParams, checkedSrv, $uibModal, $translate,GLOBAL_CONFIG,$filter,storageSrv,$routeParams,instancesSrv){
    var self = $scope;
    self.getStDevice = function(ceph){
        var postData = {
            "Vendor": "TOYOU"
        }
        storageSrv.getDevice(postData).then(function(result){
            if(result){
                self.deviceData = result.data;
                if(angular.isArray(result.data)){
                    let data = [];
                    data = result.data.reduce((list, device) => {
                        let pools = device[2].split(",");
                        pools.map(pool => {
                            var deviceCopy = angular.copy(device);
                            deviceCopy[2] = pool;list.push(deviceCopy)
                        })
                        return list;
                    }, [])
                    if(ceph && ceph.length){
                        data.push(ceph);
                    }
                    successFunc(data); 
                }else{
                    successFunc(ceph)
                }
            }
            
        });
    };
    function getStvolumeType (data){
        instancesSrv.getvolumeTypes().then(function(res){
            if(res && angular.isArray(res.data)){
                var ceph=[];
                res.data.map(item => {
                    if(item.name == "ceph_1#volumes"){
                        ceph=["",$translate.instant("aws.volumes.cv.ceph_storage"),$translate.instant("aws.volumes.cv.cephpool")];
                    }
                });
                self.getStDevice(ceph); 
            }

        })
    };
    getStvolumeType()
    function successFunc(data) {
        //初始化表格
        data.map(item => {
            item[5] = moment(item[5]).format("YYYY-MM-DD HH:mm:ss");
            item.searchTerm = [item[1],item[2],item.createtime].join(" ");
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
    $scope.$on("getDetail", function(event, value){
        var postData = {
          "id": $routeParams.id,
          "Storage_name": $routeParams.Storage_name
        }
        storageSrv.getFeatures(postData).then(function(result){
          self.featureData = result.data;
          if(result &&result.data &&  angular.isArray(result.data.Storage_characters)){
             self.detailData = result.data.Storage_characters
          }
        });
    })
}
