editVMCtrl.$inject=["$scope", "$rootScope", "$translate","vmService","selectedvm","checkboxes","$uibModalInstance"];
export function editVMCtrl($scope, $rootScope, $translate,vmService,selectedvm,checkboxes,$uibModalInstance){
    var self=$scope;
    console.log(selectedvm)
    self.cancel = function() {
        $uibModalInstance.dismiss("cancel");
        checkboxes.items={};
    };

}