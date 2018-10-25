vmDetailCtrl.$inject=["$scope", "$rootScope", "$translate","vmService"];
export function vmDetailCtrl($scope, $rootScope, $translate,vmService){
    var self=$scope;
    function snapshot_table(data) {
        /*self.tabledata = data;
        self.tableParams = new NgTableParams({ count: 5 }, { counts: [], dataset: self.tabledata });
        self.applyGlobalSearch = function() {
            var term = self.globalSearchTerm;
            self.tableParams.filter({ searchTerm: term });
        };
        checkedSrv.checkDo(self,"instanceUuid");
        self.$watch(function() {
            return self.checkedItems;
        }, function(values) {
            
        });*/
    }
    //let params={"mor":JSON.parse(localStorage.vmmor)}
    let params=JSON.parse(localStorage.vmmor)
    vmService.getvmDetail(params).then(function(result){
        console.log(result)
    });
}