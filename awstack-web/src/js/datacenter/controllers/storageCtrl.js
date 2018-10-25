storageCtrl.$inject=["$scope", "$http", "$location", "$routeParams", "$interval","$translate"];
export function storageCtrl($scope, $http, $location, $routeParams, $interval,$translate){
    var self = $scope;
    self.submitValid = false;
    self.storageDispaly = false;
    self.NFSdispaly = false;
    self.interacted = function(field) {
        return self.submitValid || field.$dirty;
    };
    var storageData = localStorage.storageallData ? JSON.parse(localStorage.storageallData) : "";
    self.storageModule = {
        storageTypeSelect:storageData?storageData.storageTypeSelect:{},
        storageManufacturerSelect:storageData?storageData.storageManufacturerSelect:{},
        storageEquipmentSelect:storageData?storageData.storageEquipmentSelect:{},
        storageAgreementSelect:storageData?storageData.storageAgreementSelect:{},
        manageIP:storageData?storageData.manageIP:"",
        nfsIP:storageData?storageData.nfsIP:"",
        storagePoolName:storageData?storageData.storagePoolName:"",
        storageName:storageData?storageData.storageName:"default",
        storagePassword:storageData?storageData.storagePassword:"",
        controller_1:storageData?storageData.controller_1:"",
        controller_2:storageData?storageData.controller_2:"",
        ceph_cinder_pool_size:storageData?storageData.ceph_cinder_pool_size:"3",
        ceph_glance_pool_size:storageData?storageData.ceph_glance_pool_size:"3",
        //ceph_nova_pool_size:storageData?storageData.ceph_nova_pool_size:"3",
        storageType: [
            {name:"ceph",type:"2"},
            //{name:"第三方存储",type:"1"},
            //{name:"nfs",type:"3"}
        ],
        manufacturer:[
            {name:"锐捷",type:"1"},
            {name:"同有",type:"2"},
            {name:"NFS",type:"3"}
        ],
        equipment:[
            {name:"UDS-Stor 3000G2-24R2",type:"1"},
            {name:"UDS-Stor 3000-C01",type:"2"},
        ],
        agreement:[
            {name:"ISCSI",type:""},
            {name:"FC",type:""}
        ],
        storageChange:function(){
            self.NFSdispaly = false;
        },
        storageManufacturerChange:function(val){
            if(val=='1'){
                self.storageModule.equipment=[
                    {name:"UDS-Stor 3000G2-24R2",type:"1"},
                    {name:"UDS-Stor 3000-C01",type:"2"}
                ]
                self.storageModule.agreement=[
                    {name:"ISCSI",type:""},
                    {name:"FC",type:""}
                ]
                self.storageModule.storageEquipmentSelect=self.storageModule.equipment[0];
                self.storageModule.storageAgreementSelect=self.storageModule.agreement[0];
            }else if(val=='2'){
                self.storageModule.equipment=[{name:"NetStor NCS7500G2",type:"1"}];
                self.storageModule.agreement=[{name:"FC",type:""}];
                self.storageModule.storageEquipmentSelect=self.storageModule.equipment[0];
                self.storageModule.storageAgreementSelect=self.storageModule.agreement[0];
            }else if(val=='3'){

            }
        },
        storageEquipmentChange:function(){

        },
        checkNFS:function(){
            self.NFSdispaly = true;
        },
        storageFun:function(){
            self.storageDispaly = !self.storageDispaly;
        },
        completeStorage:function(mForm){
            if(mForm.$valid){
                var storageallData = {
                    storageTypeSelect:self.storageModule.storageTypeSelect,
                    storageManufacturerSelect:self.storageModule.storageManufacturerSelect,
                    storageEquipmentSelect:self.storageModule.storageEquipmentSelect,
                    storageAgreementSelect:self.storageModule.storageAgreementSelect,
                    manageIP:self.storageModule.manageIP,
                    nfsIP:self.storageModule.nfsIP,
                    storagePoolName:self.storageModule.storagePoolName,
                    storageName:self.storageModule.storageName,
                    storagePassword:self.storageModule.storagePassword,
                    controller_1:self.storageModule.controller_1,
                    controller_2:self.storageModule.controller_2,
                    ceph_cinder_pool_size:self.storageModule.ceph_cinder_pool_size,
                    ceph_glance_pool_size:self.storageModule.ceph_glance_pool_size,
                    //ceph_nova_pool_size:self.storageModule.ceph_nova_pool_size
                }
                localStorage.storageallData = JSON.stringify(storageallData);
                var pathData = $location.path().split("/");
                var regionkeyCode = pathData[pathData.length-1];
                $location.path("/info/stepone/"+regionkeyCode);
            }else{
                self.submitValid = true;
            }
        }  
    }
    self.storageModule.storageTypeSelect=self.storageModule.storageType[0];
    self.storageModule.storageManufacturerSelect=self.storageModule.manufacturer[0];
    self.storageModule.storageEquipmentSelect=self.storageModule.equipment[0];
    self.storageModule.storageAgreementSelect=self.storageModule.agreement[0];
}