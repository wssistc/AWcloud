import * as dataCenterSrv from "../services/"

export function dataCenterCtrl($scope,$rootScope,$location,uiComponentSrv,checkedSrv,dataCenterSrv){
    var self = $scope;

    /*if(localStorage.vmware_flag==1){
        //连接vcenter
        if (localStorage.supportOtherClouds && localStorage.supportOtherClouds.indexOf('VMWARE_API_KEY') > -1) {
            self.$emit("loadding_vm",true);
            dataCenterSrv.login().then(function(res){
                if (res && res.data ) {
                    localStorage.VMware_url = res.data.url ? res.data.url : "";
                    localStorage.VMware_uuid = res.data.uuid ? res.data.uuid : "";
                    getDatacenterList();
                    self.$emit("loadding_vm",false);
                }
            })
        }
        localStorage.vmware_flag=2;
    }else{
        getDatacenterList();
    }*/

	function getDatacenterList(){
		dataCenterSrv.getDatacenterList().then(function(res){
			if(res && res.data){
				res.data.map(item => {
					item.hostNum = item.hostNum?item.hostNum:0;
					item.vmNum = item.vmNum?item.vmNum:0;
					item._alarm = item.alarm == true?"已启用":"已禁用";
					return item;
				});
				self.dataCenterTable = uiComponentSrv.table({
					data:res.data
				});
				checkedSrv.checkDo(self,"name","dataCenterTable");
			}
		});
	}

	self.$watch(function(){
		return self.checkedItems;
	},function(checkedItems){
		if(checkedItems){
			if(checkedItems.length == 1){
				self.disabled = false;
			}else{
				self.disabled = true;
			}
		}else{
			self.disabled = true;
		}
	});
    self.refreshDC=function(){
        getDatacenterList();
    }
	self.applyGlobalSearch = function() {
        self.dataCenterTable.filter({ $: self.globalSearchTerm });
    };

    self.createVM = function(){
    	$location.path("/virtualmachine/createvm")
    };

    self.goToDCDetail = function(dcName){
        localStorage.DCTAG = dcName;
    	localStorage.TAG = dcName;
        $location.path("/datacenter/objects/cluster");
    };
    getDatacenterList();

	
}

dataCenterCtrl.$inject = ["$scope","$rootScope","$location","uiComponentSrv","checkedSrv","dataCenterSrv"];