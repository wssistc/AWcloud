
easyFlavorCtrl.$inject=["$scope", "$rootScope", "$translate","$uibModal","$timeout","$uibModalInstance","flavorsSrv","getInsFlavors"];
export function easyFlavorCtrl($scope,$rootScope,$translate,$uibModal,$timeout,$uibModalInstance,flavorsSrv,getInsFlavors){
    var scope = $scope;
    scope.submitted = false;
    scope.interacted = function(field, name) {
        scope.field_form = field;
        return scope.submitted || field[name].$dirty;
    };

    scope.isPublic = {
        options: [
            {"name":"是","value":true},
            {"name":"否","value":false}
        ]
    };

    scope.newFlavorData = {
        name: "",
        vcpus: 1,
        vcpus_max: 4,
        ram: 1,
        ram_max: 4,
        disk: 0,
        is_public: true,
        ephemeral: 0
    };
    scope.vcpus = {};
    scope.ram = {};
    scope.vcpus_max={};
    
    scope.$watch(function(){
        return scope.newFlavorData.vcpus+scope.newFlavorData.ram;
    },function(){
        scope.vcpus.min_max = {
            min:scope.newFlavorData.vcpus,
            max:240
        };
        scope.ram.min_max = {
            min:scope.newFlavorData.ram,
            max:4000
        };
    });

    scope.focusSet = function(){
        scope.ramGtMax = false;;
    };

    scope.confirmNewFlavor = function(flavorData, flavorForm) {
        if (flavorForm.$valid) {
            if(Number(scope.newFlavorData.ram_max) < Number(scope.newFlavorData.ram)){
                scope.ramGtMax = true;
            }else{
                flavorData.ram=flavorData.ram *1024;
                flavorData.ram_max=flavorData.ram_max *1024;
                $uibModalInstance.close();                
                flavorsSrv.createFlavor(flavorData).then(function() {
                    getInsFlavors()
                    // self.getInsFlavors();
                });
            }
        } else {
            scope.submitted = true;
        }
    };
}