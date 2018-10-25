editSubnetCtrl.$inject = ["$scope", "$rootScope", "$location", "networksSrv", "checkQuotaSrv", "$uibModalInstance", "$translate", "$timeout", "context", "ipSrv","NgTableParams","GLOBAL_CONFIG","TableCom","commonFuncSrv","initNetworkTable"];
export function editSubnetCtrl($scope, $rootScope, $location, networksSrv, checkQuotaSrv, $uibModalInstance, $translate, $timeout, context, ipSrv,NgTableParams,GLOBAL_CONFIG,TableCom,commonFuncSrv,initNetworkTable) {
   var self=$scope;
    var editData="";
    self.editSub={
       selectedSubnet:""
    }
    let assignedIpList = [];
    function editSubNetTable(){
        self.editSubnetTable = new NgTableParams({
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
                TableCom.init(self,'editSubnetTable',self.subnets_data,'id',10,'editSubnetCheckbox');
                //默认编辑第一个子网
                let v4Arr=angular.copy(self.subnets_data).filter(function(item){
                    return item.ipVersion=='4';
                });
                if(v4Arr.length>0){
                   self.changeSub(v4Arr[0]);
                }
            }
        });
    }
    editSubNetTable();
    self.changeSub=function(sub){
       self.editSub.selectedSubnet=sub.id;
       editData=sub;
       self.editData=editData;
       self.subnetForm = angular.copy(editData);
       self.networkAddress=_IP.cidrSubnet(self.subnetForm.cidr).networkAddress;
       self.broadcastAddress=_IP.cidrSubnet(self.subnetForm.cidr).broadcastAddress;
       self.subnetForm.allocationPools = _.sortBy(self.subnetForm.allocationPools, "start");
       //作用？
       assignedIpList = [];
       if (!editData.external) {
            assignedIpList = assignedIpList.slice(assignedIpList.length, 0);
            networksSrv.getNetworksDetail(editData.parentId).then(function(result) {
                if (result && result.data) {
                    _.each(result.data, function(item) {
                        _.each(item.subnetIps, function(sub) {
                            if (sub.subnet_id == editData.id) {
                                assignedIpList.push(sub.ip_address);
                            }
                        })
                    });
                }
            });
       }
    }

    self.submitted = false;
    self.interacted = function(field) {
        if (field) {
            return self.submitted || field.$dirty;
        }
    };
    self.setIpIsOverlap = function() {
        self.ipIsOverlap = false;
        self.ipEqToGateway = false;
        self.poolNarrow = false;
    };

    self.addAllocationPools = function(){
        self.subnetForm.allocationPools.push({
            start:"",
            end:""
        })
        self.setIpIsOverlap()
    }

    self.delAllocationPools = function(index,allocationPools){
        self.subnetForm.allocationPools.splice(index,1)
        self.setIpIsOverlap()
    }
    
    self.editSubnetCfm = function(editSubnetForm) {
        if (editSubnetForm.$valid) {
            self.ipIsOverlap = ipSrv.chkIpOverlapFunc(self.subnetForm.allocationPools);
            self.ipEqToGateway = ipSrv.checkIpInPool(self.subnetForm.allocationPools, editData.gatewayIp);
            if (editData.external) {
                self.poolNarrow = ipSrv.checkPoolRange(editData.allocationPools, self.subnetForm.allocationPools);
            } else {
                for (let i = 0; i < assignedIpList.length; i++) {
                    if (editData.gatewayIp == assignedIpList[i]) {
                        continue;
                    }
                    if (!ipSrv.checkIpInPool(self.subnetForm.allocationPools, assignedIpList[i])) { //如果修改后的IP池中不含有已经分配出去的IP，则不允许修改
                        self.poolNarrow = true;
                        break;
                    }
                }
            }
            if (!self.ipIsOverlap && !self.ipEqToGateway && !self.poolNarrow) {
                self.formSubmitted = true;
                $uibModalInstance.close();
                networksSrv.editSubnetAction({
                    "subnet": {
                        "name": self.subnetForm.name,
                        "allocation_pools": self.subnetForm.allocationPools
                    },
                    "subnet_id": editData.id
                }).then(function() {
                    initNetworkTable();
                });
            }
        } else {
            self.submitted = true;
        }
    };
}