import * as clusterSrv from "../services/"

function clusterCommonFun($scope,$location,uiComponentSrv,checkedSrv){
	var self = $scope;

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

	self.applyGlobalSearch = function() {
        self.clusterTable.filter({ $: self.globalSearchTerm });
    };

    self.initTable =function(res){
		if(res && res.data){
			res.data.map(item => {
				item.cpuAvailable = item.cpuAvailable?item.cpuAvailable.toFixed(2):0;
				item.memAvailable = item.memAvailable?item.memAvailable.toFixed(2):0;
				item.diskAvailable = item.diskAvailable?item.diskAvailable.toFixed(2):0;
				item._vSphereDRS = item.vSphereDRS == true?"已启用":"已禁用";
				item._vSphereHA = item.vSphereHA == true?"已启用":"已禁用";
				return item;
			});
			self.clusterTable = uiComponentSrv.table({
				data:res.data
			});
			checkedSrv.checkDo(self,"name","clusterTable");
		}
	};

	self.addCluster = function(){
		$location.path("/cluster/createcluster")
	};

	self.goToClusterDetail = function(clusterName){
		localStorage.CLUTAG = clusterName;
		localStorage.TAG = clusterName;
		$location.path("/cluster/objects/host");
	};

	return self;
	
}

export function clusterCtrl($scope,$rootScope,$location,uiComponentSrv,checkedSrv,clusterSrv){
    var self = new clusterCommonFun($scope,$location,uiComponentSrv,checkedSrv);
	self.getClusterList = function(){
		clusterSrv.getClusterList().then(function(res){
			self.initTable(res);
		});
	}
	self.getClusterList();

}

export function dcClusterCtrl($scope,$rootScope,$location,uiComponentSrv,checkedSrv,clusterSrv){
	var self = new clusterCommonFun($scope,$location,uiComponentSrv,checkedSrv);
	self.getClusterList = function(){
		clusterSrv.getClusterListByDCName({
			//"dcName":localStorage.TAG
			"dcName":localStorage.DCTAG
		}).then(function(res){
			self.initTable(res);
		});
	};
	self.getClusterList();

}

let ctrlList = [clusterCtrl,dcClusterCtrl];
angular.forEach(ctrlList,function(item){
	item.$inject = ["$scope","$rootScope","$location","uiComponentSrv","checkedSrv","clusterSrv"];
});
