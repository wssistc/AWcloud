vmOverviewCtrl.$inject=["$scope", "$rootScope", "$translate","vmService","alertSrv"];
export function vmOverviewCtrl($scope, $rootScope, $translate,vmService,alertSrv){
    var self=$scope;
    function manage_data(data){
        let dir_length=data.cdroms[0].isoPath.split("/").length;
        data.cdrom=data.cdroms[0].isoPath.split("/")[dir_length-1]
        self.vm_detail=data;
    }
    let params=JSON.parse(localStorage.vmmor);
    vmService.getvmDetail(params).then(function(result){
        manage_data(result.data);
    });
}