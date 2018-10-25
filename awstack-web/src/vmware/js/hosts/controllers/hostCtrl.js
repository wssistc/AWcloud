import * as hostSrv from "../services/"

function hostCommonFun($scope,$location,uiComponentSrv,checkedSrv){
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
        self.hostTable.filter({ $: self.globalSearchTerm });
    };

    self.initTable =function(res){
		if(res && res.data){
			res.data.map(item => {
				item.memorySize = item.memorySize?item.memorySize.toFixed(2):0;
				return item;
			});
			self.hostTable = uiComponentSrv.table({
				data:res.data
			});
			checkedSrv.checkDo(self,"name","hostTable");
		}
	};

	self.addHost = function(){
		$location.path("/host/createhost");
	};

	self.goToHostDetail = function(hostIP){
    	localStorage.TAG = hostIP;
    	$location.path("/host/objects/vm");
    };

	return self;
	
}

export function hostCtrl($scope,$rootScope,$location,uiComponentSrv,checkedSrv,hostSrv){
    var self = new hostCommonFun($scope,$location,uiComponentSrv,checkedSrv);
	self.getHostList = function(){
		hostSrv.getHostList().then(function(res){
			self.initTable(res);
		});
	}
	self.getHostList();
	
}

export function dcHostCtrl($scope,$rootScope,$location,uiComponentSrv,checkedSrv,hostSrv){
	var self = new hostCommonFun($scope,$location,uiComponentSrv,checkedSrv);
	self.getHostList = function(){
		hostSrv.getHostListByDCName({
			"dcName":localStorage.DCTAG
		}).then(function(res){
			self.initTable(res);
		});
	};
	self.getHostList();

}
export function clusterHostCtrl($scope,$rootScope,$location,uiComponentSrv,checkedSrv,hostSrv){
	var self = new hostCommonFun($scope,$location,uiComponentSrv,checkedSrv);
	self.getHostList = function(){
		hostSrv.getHostListByClusterName({
			"cluster":localStorage.CLUTAG
		}).then(function(res){
			self.initTable(res);
		});
	};
	self.getHostList();

}

let ctrlList = [hostCtrl,dcHostCtrl,clusterHostCtrl];
angular.forEach(ctrlList,function(item){
	item.$inject = ["$scope","$rootScope","$location","uiComponentSrv","checkedSrv","hostSrv"];
});
