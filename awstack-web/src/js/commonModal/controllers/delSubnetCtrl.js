delSubnetCtrl.$inject = ["$scope", "$rootScope", "$location", "networksSrv", "checkQuotaSrv", "$uibModalInstance", "$translate", "$timeout", "context", "ipSrv","NgTableParams","GLOBAL_CONFIG","TableCom","commonFuncSrv"];

export function delSubnetCtrl($scope, $rootScope, $location, networksSrv, checkQuotaSrv, $uibModalInstance, $translate, $timeout, context, ipSrv,NgTableParams,GLOBAL_CONFIG,TableCom,commonFuncSrv) {
   var self=$scope;
   self.delSubnetCheckbox={};
   function delSubNetTable(){
        self.delSubnetTable = new NgTableParams({
            count: GLOBAL_CONFIG.PAGESIZE,
        }, {
            counts: [],
            dataset: []
        });
        self.loadSubnetData = false;
        networksSrv.getNetworksSubnet(context.network_id).then(function(result) {
            result ? self.loadSubnetData = true : "";
            if (result && result.data && angular.isArray(result.data)) {
                self.subnets_data = _.map(result.data, function(item) {
                    item._enableDhcp = item.enableDhcp == true ? $translate.instant("aws.common.yes") : $translate.instant("aws.common.no");
                    item._ipVersion="ipv"+item.ipVersion;
                    return item;
                });
                TableCom.init(self,'delSubnetTable',self.subnets_data,'id',10,'delSubnetCheckbox');
            }
        });
   }
   delSubNetTable(); 
   self.$watch(function() {
        return self.delSubnetCheckbox.items;//监控checkbox
   }, function(val) {
        self.delSubnetCheckedItems = [];//所有被选中的checkbox的数据

        self.checkedEdit = null;
        var arr=[];
        for(var i in self.delSubnetCheckbox.items){
          arr.push(self.delSubnetCheckbox.items[i]);
        }
        if(val && arr.length>=0){
          for(var key in val){
            if(val[key]){
              self.delSubnetTable.data.forEach(item=>{
                if(item.id==key){
                  self.delSubnetCheckedItems.push(item);
                }
              });
            }
          }
        }
   },true);
   self.confirmDelsubnet=function(delSubnetCheckedItems){
       commonFuncSrv.deleteSubnet(context,delSubnetCheckedItems);
   };
}