angular.module("clusterDeployModule", ["ngTable", "ngAnimate", "ui.bootstrap", "ui.select", "clusterSrv"])
.controller("clusterDeployCtrl", ["$scope","$routeParams",function($scope,$routeParams) {
    var self = $scope;
    var stepId = $routeParams.stepId;
    self.curRegionEnterpriseUid = sessionStorage.curRegionEnterpriseUid;
    //self.curRegionEnterpriseUid = '643fcce040804434a9e9159257a6a312';
    self.curRegionKey = sessionStorage.curRegionKey;
    //self.curRegionKey = 'J96J3';
    self.curRegionStatus = sessionStorage.curRegionStatus;
    self.curRegionName = sessionStorage.curRegionName;
    self.curRegionUid = sessionStorage.curRegionUid;

}])
.filter("unitFilter", function() {
    return function(v) {
        return Number(v) / 1024;
    };
})
.controller("steponeCtrl", ["$scope", "$http", "$location", "$routeParams", "$interval","clusterSrv","$window", function($scope, $http, $location, $routeParams, $interval,clusterSrv,$window) {
    var self = $scope;
    self.stepOneData = [];
    self.hostNameList = {};
    self.stepOneTemp = [];
    function sortNumber(a,b){
        return _IP.toLong(a.hostInfoMap.ip) - _IP.toLong(b.hostInfoMap.ip);
    }
    var chkall = function() {
        self.checkboxes = {
            checked: false,
            items: {}
        };
        self.$watch(function() {
            return self.checkboxes.checked;
        }, function(value) {
            angular.forEach(self.stepOneData, function(item) {
                self.checkboxes.items[item.id] = value;
            });
        });
        self.$watch(function() {
            return self.checkboxes.items;
        }, function() {
            chkDo();
        }, true);
    };
    function changeUnit(v){
        if(v.search(/TB$/i)>-1){
            return Number(v.replace(/GB|TB|PB$/,""))*1024;
        }else if(v.search(/PB$/i)>-1){
            return Number(v.replace(/GB|TB|PB$/,""))*1024*1024;
        }
        return Number(v.replace(/GB|TB|PB$/,""));
    }
    function setUnit(v){
        if(parseInt(v/(1024*1024)) > 0){
            return {total:(v/(1024*1024)).toFixed(2),unit:"PB"};
        }else if(parseInt(v/1024) > 0){
            return {total:(v/1024).toFixed(2),unit:"TB"};
        }
        return {total:v.toFixed(2),unit:"GB"};
    }
    function checkNode(stepOneData){
        let data = stepOneData;
        let length = data.length;
        if(length>1){
            for(let i=1;i<length;i++){
                if(data[i-1].hostInfoMap.allow_ceph!==data[i].hostInfoMap.allow_ceph ||
                    data[i-1].hostInfoMap.allow_sdn!==data[i].hostInfoMap.allow_sdn ||
                    data[i-1].hostInfoMap.enable_ceph!==data[i].hostInfoMap.enable_ceph ||
                    data[i-1].hostInfoMap.enable_sdn!==data[i].hostInfoMap.enable_sdn ||
                    data[i-1].hostInfoMap.enable_storage_network!==data[i].hostInfoMap.enable_storage_network ||
                    data[i-1].hostInfoMap.sys_version!==data[i].hostInfoMap.sys_version){
                    self.isChecked = true;
                    break;
                }else{
                    self.isChecked = false;
                }
            }
        }
    }
    var chkDo = function() {
        var checked = 0,
            unchecked = 0,
            total = self.stepOneData.length;
        angular.forEach(self.stepOneData, function(item) {

            checked += (self.checkboxes.items[item.id]) || 0;
            unchecked += (!self.checkboxes.items[item.id]) || 0;
            if (self.checkboxes.items[item.id]) {
                self.editData = angular.copy(item);
            }
        });
        if ((unchecked == 0) || (checked == 0)) {
            if (total > 0) {
                self.checkboxes.checked = (checked == total);
            }
        }
        if (checked > 0) {
            self.oneModule.isDisabled = false;
        } else {
            self.oneModule.isDisabled = true;
        }
        angular.element(".select-all").prop("indeterminate", (checked != 0 && unchecked != 0));
    };
    self.oneModule = {
        editActive: false,
        isDisabled: true,
        edit: function(data) {
            self.oneModule.editActive = data.id;
        },
        save: function(v) {
            self.oneModule.editActive = false;
            self.hostNameList["" + v.nodeUid + ""].newName = v.hostName;
            self.hostNameList["" + v.nodeUid + ""].changed = "2";
        },
        completeOne: function() {
            var list = [];
            angular.forEach(self.stepOneData, function(item) {
                if (self.checkboxes.items[item.id]) {
                    list.push(item);
                }
            });
            localStorage.setItem("curRegionLISTS", JSON.stringify(list));
            localStorage.setItem("curRegionHOSTNAMELIST", JSON.stringify(self.hostNameList));
            //self.isSetpOne = false;
            $location.path("/configure/cluster/steptwo");
        },
        init: function() {
            if (localStorage.curRegionHOSTNAMELIST) {
                self.hostNameList = JSON.parse(localStorage.curRegionHOSTNAMELIST);
            }else{
                self.hostNameList = {};
            }
            clusterSrv.getCurRegNodeList(self.curRegionEnterpriseUid).then(function(res) {
                if (res&&res.data) {
                    var defauData = res.data;
                    var total = res.total;
                    self.checkboxes.checked=true;
                    self.stepOneData.splice(0, total);
                    //self.stepOneData.push.apply(self.stepOneData, res.data.data);
                    var filterData = defauData.filter(item=>{
                        if(item.regionUid==self.curRegionUid){
                            return item;
                        }
                    })
                    var stepOneTemp = filterData;
                    self.stepOneData = stepOneTemp.sort(sortNumber);
                    angular.forEach(self.stepOneData, function(v, index) {

                        if (self.hostNameList&&self.hostNameList[v.nodeUid] && self.hostNameList[v.nodeUid].changed=="2") {
                            v.hostName = self.hostNameList[v.nodeUid].newName;
                        } else {
                            let hostNameInfo = {
                                "oldName": v.hostName,
                                "newName": "node-" + (index + 1),
                                "changed": "1"
                            };
                            self.hostNameList[v.nodeUid] = hostNameInfo;
                            v.hostName = hostNameInfo.newName;
                        }

                        v.hostInfoMap.ssdAll = new Number();
                        v.hostInfoMap.sataAll = new Number();
                        //console.log(v.hostInfoMap.disks);
                        let data = v.hostInfoMap.disks;
                        var ssdAll=0;
                        var sataAll=0;
                        for (let i = 0; i < data.length; i++) {
                            if (data[i].ssd) {
                                ssdAll += changeUnit(data[i].capacity);
                            } else {
                                sataAll += changeUnit(data[i].capacity);
                            }
                        }
                        if(ssdAll>0){
                            v.hostInfoMap.ssdAll = setUnit(ssdAll).total;
                            v.hostInfoMap.ssdUnit = setUnit(ssdAll).unit;
                        }
                        if(sataAll>0){
                            v.hostInfoMap.sataAll = setUnit(sataAll).total;
                            v.hostInfoMap.sataUnit = setUnit(sataAll).unit;
                        }
                        checkNode(self.stepOneData);
                    });
                }
            });
        }
    };
    chkall();
    self.oneModule.init();
    $window.rollpolingNodes = $interval(function() {
        //if (!self.isSetpOne) {
            self.checkboxes.checked = false;
            self.oneModule.init();
        /*} else {
            $interval.cancel(rollpolingNodes);
            rollpolingNodes = undefined;
        }*/
    }, 10000);
}])
.controller("steptwoCtrl", ["$scope", "$http", "$location", function($scope, $http, $location) {
    var self = $scope;
    var listData = localStorage.curRegionLISTS ? JSON.parse(localStorage.curRegionLISTS) : "";
    var twoFormData = localStorage.curRegionTWOFORM ? JSON.parse(localStorage.curRegionTWOFORM) : "";
    self.submitValid = true;
    self.twoModule = {
        enable_sdn :listData[0].hostInfoMap.enable_sdn,
        enable_storage_network :listData[0].hostInfoMap.enable_storage_network,
        allow_ceph :listData[0].hostInfoMap.allow_ceph,
        allow_sdn :listData[0].hostInfoMap.allow_sdn,
        moreIp:2,
        clusterRangeError:{
            rangeTotal:false,
            rangeSame:false
        },
        storageRangeError:{
            rangeTotal:false,
            rangeSame:false
        },
        tenantRangeError:{
            rangeTotal:false,
            rangeSame:false
        },
        clusterCheck: twoFormData ? twoFormData.clusterCheck : false,
        storageCheck: twoFormData ? twoFormData.storageCheck : false,
        tenantCheck: twoFormData ? twoFormData.tenantCheck : false,
        publicCheck: twoFormData ? twoFormData.publicCheck : false,
        publicVlan: twoFormData ? twoFormData.publicVlan : "",
        clusterVlan: twoFormData ? twoFormData.clusterVlan : "",
        storageVlan: twoFormData ? twoFormData.storageVlan : "",
        changeCreateEmail: function(index, user) {
            var emailField = "clusterStart_" + index;
            //self.ipForm = {};
            // console.log(self.twoModule.ipForm);
            user.isError = self.twoModule.ipForm[emailField];
        },
        rangeOff:function(tips){
            self.twoModule[tips].rangeSame = false;
            self.twoModule[tips].rangeTotal = false;
        },
        checkRange:function(v,tips,moreIp){
            for(var i=0;i<v.length;i++){
                if(i>0 && _IP.toLong(v[i].start)<=_IP.toLong(v[i-1].end)){
                    self.twoModule[tips].rangeSame = true;
                    return;
                }
            }
            if(v && v.length==1){
                var num = _IP.toLong(v[0].end) - _IP.toLong(v[0].start) + 1;
                if(num< listData.length + moreIp){
                    self.twoModule[tips].rangeTotal = true;
                }
            }else if(v.length>1){
                var total =0;
                for(var j=0;j<v.length;j++){
                    total+=_IP.toLong(v[j].end)-_IP.toLong(v[j].start)+1;
                    if(total>listData.length + moreIp){
                        break;
                    }
                }
                if(total<listData.length + moreIp){
                    self.twoModule[tips].rangeTotal = true;
                }
            }
            return !self.twoModule[tips].rangeTotal && !self.twoModule[tips].rangeSame;

        },
        completeTwo: function(ipForm) {
            if(ipForm.$valid){
                this.setCidrIp();
                var clusterIpChecked=this.checkRange(self.twoModule.cluster,"clusterRangeError",self.twoModule.moreIp);
                var storageIpChecked=this.checkRange(self.twoModule.storage,"storageRangeError",0);
                var tenantIpChecked=this.checkRange(self.twoModule.tenant,"tenantRangeError",0);
                if(clusterIpChecked&&storageIpChecked&&tenantIpChecked){
                    var ipData;
                    ipData = {
                        cidrOn: self.twoModule.cidrOn,
                        clusterCheck: self.twoModule.clusterCheck ? true : false,
                        clusterRangeCheck: self.twoModule.clusterRangeCheck ? true : false,
                        storageCheck: self.twoModule.storageCheck ? true : false,
                        storageRangeCheck: self.twoModule.storageRangeCheck ? true : false,
                        tenantCheck: self.twoModule.tenantCheck ? true : false,
                        tenantRangeCheck: self.twoModule.tenantRangeCheck ? true : false,
                        publicCheck: self.twoModule.publicCheck ? true : false,
                        clusterCidr: self.twoModule.clusterCidr? self.twoModule.clusterCidr : "",
                        clusterRange: self.twoModule.clusterRangeCheck? self.twoModule.clusterRange : "",
                        clusterVlan: self.twoModule.clusterCheck ? self.twoModule.clusterVlan : "",
                        storageCidr: self.twoModule.storageCidr ? self.twoModule.storageCidr : "",
                        storageRange: self.twoModule.storageRangeCheck? self.twoModule.storageRange : "",
                        storageVlan: self.twoModule.storageCheck ? self.twoModule.storageVlan : "",
                        tenantCidr: self.twoModule.tenantCidr? self.twoModule.tenantCidr : "",
                        tenantRange: self.twoModule.tenantRangeCheck? self.twoModule.tenantRange : "",
                        tenantStart: self.twoModule.tenantStart,
                        tenantEnd: self.twoModule.tenantEnd,
                        publicVlan: self.twoModule.publicCheck ? self.twoModule.publicVlan : "",
                        floatingRange: self.twoModule.floatingRange || "",
                        floatingcidr: self.twoModule.floatingCidr || "",
                        floatinggateway: self.twoModule.floatinggateway || ""
                    };
                    var createC = {
                        common: this.setCom().common,
                        node: this.setNode(),
                        registered_iplist: self.twoModule.getIp(self.twoModule.cluster),
                        iprange: this.setRange()
                    };
                    localStorage.setItem("curRegionNODE", JSON.stringify(createC));
                    var usedList = [{
                        name: "floating",
                        cidr: self.twoModule.floatingCidr,
                        iprange: self.twoModule.floatingRange,
                        vlan: self.twoModule.publicVlan
                    }, {
                        name: "cluster",
                        cidr: self.twoModule.clusterCidr,
                        iprange: self.twoModule.cluster,
                        vlan: self.twoModule.clusterVlan
                    }, {
                        name: "storage",
                        cidr: self.twoModule.storageCidr,
                        iprange: self.twoModule.storage,
                        vlan: self.twoModule.storageVlan
                    }, {
                        name: "tenant",
                        cidr: self.twoModule.tenantCidr,
                        iprange: self.twoModule.tenant,
                        vlan: self.twoModule.tenantStart + "-" + self.twoModule.tenantEnd
                    }];
                    if(!self.twoModule.enable_sdn){//不使用sdn时删除租户网
                        usedList.splice(3,1);
                    };
                    if(!self.twoModule.enable_storage_network){//不使用存储网时删除存储网
                        usedList.splice(2,1);
                    }
                    localStorage.setItem("curRegionTWOFORM", JSON.stringify(ipData));
                    localStorage.setItem("curRegionUSEDLIST", JSON.stringify(usedList));
                    $location.path("/configure/cluster/stepthree");
                }

            }else{
                self.submitValid = true;
            }

        },
        isDisabled: false,
        clusterRange: twoFormData && twoFormData.clusterRange ? twoFormData.clusterRange : [
            { start: "10.0.1.1", end: "10.0.1.254", startname: "clusterStart", endname: "clusterEnd" }
        ],
        cluster: "",
        clusterRangeCheck:twoFormData ? twoFormData.clusterRangeCheck : false,
        clusterCidr: twoFormData ? twoFormData.clusterCidr : "10.0.1.0/24",
        clusterNetmask: twoFormData ? twoFormData.clusterNetmask : "",
        storageRange: twoFormData && twoFormData.storageRange ? twoFormData.storageRange : [
            { start: "10.0.2.1", end: "10.0.2.254", startname: "storageStart", endname: "storageEnd" }
        ],
        storage: "",
        storageRangeCheck:twoFormData ? twoFormData.storageRangeCheck : false,
        storageCidr: twoFormData ? twoFormData.storageCidr : "10.0.2.0/24",
        storageNetmask: twoFormData ? twoFormData.storageNetmask : "",
        tenantRange: twoFormData && twoFormData.tenantRange ? twoFormData.tenantRange : [
            { start: "10.0.3.1", end: "10.0.3.254", startname: "tenantRangeStart", endname: "tenantRangeEnd" }
        ],
        tenant: "",
        tenantRangeCheck:twoFormData ? twoFormData.tenantRangeCheck : false,
        tenantCidr: twoFormData ? twoFormData.tenantCidr : "10.0.3.0/24",
        tenantNetmask: twoFormData ? twoFormData.tenantNetmask : "",
        cidrOn: twoFormData ? twoFormData.cidrOn : "cidr",
        tenantStart: twoFormData ? twoFormData.tenantStart : "1001",
        tenantEnd: twoFormData ? twoFormData.tenantEnd : "1010",
        floatingRange: twoFormData && twoFormData.floatingRange ? twoFormData.floatingRange : [
            { start: "192.168.1.2", end: "192.168.1.254", startname: "floatingStart", endname: "floatingEnd" }
        ],
        floatingCidr: twoFormData ? twoFormData.floatingcidr : "192.168.1.0/24",
        floatinggateway: twoFormData ? twoFormData.floatinggateway : "192.168.1.1",
        nameNum: 1,
        //listData: JSON.parse(localStorage.curRegionLISTS),
        addCluster: function() {
            this.nameNum += 1;
            var item = { start: "", end: "", startname: "clusterStart" + this.nameNum, endname: "clusterEnd" + this.nameNum };
            self.twoModule.clusterRange.push(item);
        },
        delCluster: function(v) {
            self.twoModule.clusterRange.splice(v, 1);
        },
        addStorage: function() {
            var item = { start: "", end: "", startname: "storageStart" + this.nameNum, endname: "storageEnd" + this.nameNum };
            self.twoModule.storageRange.push(item);
        },
        delStorage: function(v) {
            self.twoModule.storageRange.splice(v, 1);
        },
        addTenant: function() {
            var item = { start: "", end: "", startname: "tenantRangeStart" + this.nameNum, endname: "tenantRangeEnd" + this.nameNum };
            self.twoModule.tenantRange.push(item);
        },
        delTenant: function(v) {
            self.twoModule.tenantRange.splice(v, 1);
        },
        setNet: function() {//设置node信息 网络类型，ip,netmask,vlan
            var clusterIp = self.twoModule.getIp(self.twoModule.cluster);
            var storageIp = self.twoModule.getIp(self.twoModule.storage);
            var tenantIp = self.twoModule.getIp(self.twoModule.tenant);
            var networkData = [{
                "role": "public",
                "vlan": self.twoModule.publicVlan
            }, {
                "role": "cluster",
                "ip": self.twoModule.cluster[0].start,
                "netmask": self.twoModule.clusterNetmask,
                "vlan": self.twoModule.clusterVlan
            }, {
                "role": "storage",
                "ip": self.twoModule.storage[0].start,
                "netmask": self.twoModule.storageNetmask,
                "vlan": self.twoModule.storageVlan
            }, {
                "role": "tenant",
                "ip": self.twoModule.tenant[0].start,
                "netmask": self.twoModule.tenantNetmask,
                "vlan-start": self.twoModule.tenantStart,
                "vlan-end": self.twoModule.tenantEnd
            }];
            var length = listData.length;
            var nodeNet = [];
            for (var i = 0; i < length; i++) {
                var data = angular.copy(networkData);
                data[1].ip = clusterIp[i];//集群IP
                data[2].ip = storageIp[i];//存储网IP
                data[3].ip = tenantIp[i];//租户网IP
                for (var j = 0; j < 3; j++) {
                    if (!data[j].vlan) {
                        delete data[j]["vlan"];
                    }
                }
                if(!self.twoModule.enable_sdn){//不使用sdn时删除租户网
                    data.splice(3,1);
                };
                if(!self.twoModule.enable_storage_network){//不使用存储网时删除存储网
                    data.splice(2,1);
                }
                if(!self.twoModule.enable_sdn){//不使用sdn 外网的role为'directpass'
                    data[0].role = "directpass";
                }
                nodeNet.push(data);
            }
            //console.log(nodeNet);
            return nodeNet;
        },
        setNode: function() {//拼接
            var nodeJson = {
                "nodeid": "",
                "hostname": "",
                "network": []
            };
            var node = [];
            var nodeNetData = this.setNet();
            if (listData) {
                angular.forEach(listData, function(v, k) {
                    var data = angular.copy(nodeJson);
                    data.nodeid = v.nodeUid;
                    data.hostname = v.hostName;
                    data.network = nodeNetData[k];
                    node.push(data);
                });
            }
            //console.log(node);
            return node;
        },
        setCom: function() {
            var comIp = {
                common: "",
                registered_iplist: ""
            };
            var com = {};
            var iplist = [];
            if (listData) {
                com = {
                    "regionid": listData[0].regionUid,
                    "registered_hosts": [],
                    "tenant_vlan_range": {
                        "start": self.twoModule.tenantStart,
                        "end": self.twoModule.tenantEnd
                    },
                    "enable_sdn":listData[0].hostInfoMap.enable_sdn,
                    "enable_ceph":listData[0].hostInfoMap.enable_ceph,
                    "allow_ceph":listData[0].hostInfoMap.allow_ceph,
                    "allow_sdn":listData[0].hostInfoMap.allow_sdn
                };
                if(self.twoModule.enable_sdn){
                    //企业版 外网参数
                    com.floating_start = self.twoModule.floatingRange[0].start,
                        com.floating_end = self.twoModule.floatingRange[0].end,
                        com.floating_cidr = self.twoModule.floatingCidr,
                        com.floating_gateway = self.twoModule.floatinggateway
                }else{
                    //基础版 直通网参数
                    com.directpass_start = self.twoModule.floatingRange[0].start,
                        com.directpass_end =self.twoModule.floatingRange[0].end,
                        com.directpass_cidr = self.twoModule.floatingCidr,
                        com.directpass_gateway = self.twoModule.floatinggateway
                    delete com.tenant_vlan_range;
                }
                angular.forEach(listData, function(v) {
                    com.registered_hosts.push(v.hostName);
                    iplist.push(v.hostInfoMap.ip);
                });
            }
            comIp.common = com;
            comIp.registered_iplist = iplist;
            //console.log(comIp);
            return comIp;
        },
        setRange: function() {
            var iprange = {
                "cluster": {
                    "range": self.twoModule.cluster,
                    "netmask": self.twoModule.clusterNetmask,
                    "aleardyusr": self.twoModule.getIp(self.twoModule.cluster)
                },
                "storage": {
                    "range": self.twoModule.storage,
                    "netmask": self.twoModule.storageNetmask,
                    "aleardyusr": self.twoModule.getIp(self.twoModule.storage)
                },
                "tenant": {
                    "range": self.twoModule.tenant,
                    "netmask": self.twoModule.tenantNetmask,
                    "aleardyusr": self.twoModule.getIp(self.twoModule.tenant)
                }
            };
            //console.log(iprange);
            if(!self.twoModule.enable_sdn){//不使用sdn时删除租户网
                delete iprange.tenant;
            };
            if(!self.twoModule.enable_storage_network){//不使用存储网时删除存储网
                delete iprange.storage;
            }
            return iprange;
        },
        getIp: function(data) {
            var iplist = [];
            if (data) {
                angular.forEach(data, function(v) {
                    var start = v.start.split(".").map(function(v) {
                        return Number(v);
                    });
                    var end = v.end.split(".").map(function(v) {
                        return Number(v);
                    });
                    var prefix = start.slice(0, -1).join(".") + ".";
                    if (listData) {
                        for (var i = 0; i < end[3]; i++) {
                            var ip;
                            ip = prefix + (i + start[3]).toString();
                            /*if (start[3] == 1) {
                             ip = prefix + (i + start[3] + 1).toString();
                             } else {
                             ip = prefix + (i + start[3]).toString();
                             }*/
                            if(iplist.length < listData.length){
                                iplist.push(ip);
                            }else{
                                break;
                            }

                        }
                    }

                });
            }
            return iplist;
        },

        getCidrIp: function(name, v, mask,rangecheck) {
            var List = {
                start: "",
                end: ""
            };
            if (v) {
                var cidrData = _IP.cidrSubnet(v);
                console.log(cidrData);
                List = {
                    start: cidrData.firstAddress,
                    end: cidrData.lastAddress
                };
                /*var cidr = v.split("/");
                 var prefixed = cidr[0].split(".").slice(0, -1).join(".") + ".";
                 var a = [parseInt(cidr[1] / 8), cidr[1] % 8];
                 List = {
                 start: prefixed + "1",
                 end: prefixed + "255"
                 };

                 switch (a[0]) {
                 case 0:
                 self.twoModule[mask] = self.twoModule.getsuffix(a[1]) + ".0.0.0";
                 break;
                 case 1:
                 self.twoModule[mask] = "255." + self.twoModule.getsuffix(a[1]) + ".0.0";
                 break;
                 case 2:
                 self.twoModule[mask] = "255.255." + self.twoModule.getsuffix(a[1]) + ".0";
                 break;
                 case 3:
                 self.twoModule[mask] = "255.255.255." + self.twoModule.getsuffix(a[1]);
                 break;
                 }*/

            }
            self.twoModule[mask] = _IP.cidrSubnet(v).subnetMask;
            if(rangecheck){
                self.twoModule[name] = self.twoModule[name+"Range"];
            }else{
                self.twoModule[name] = [List];
            }
        },
        getsuffix: function(v) {
            var num = 0;
            for (var i = 7; i > 7 - v; i--) {
                num += Math.pow(2, i);
            }
            // console.log(num);
            return num;
        },
        setCidrIp: function() {
            self.twoModule.getCidrIp("cluster", self.twoModule.clusterCidr, "clusterNetmask",self.twoModule.clusterRangeCheck);
            self.twoModule.getCidrIp("storage", self.twoModule.storageCidr, "storageNetmask",self.twoModule.storageRangeCheck);
            self.twoModule.getCidrIp("tenant", self.twoModule.tenantCidr, "tenantNetmask",self.twoModule.tenantRangeCheck);
            /*if (self.twoModule.cidrOn == "ip") {
             self.twoModule.cluster = self.twoModule.clusterRange;
             self.twoModule.storage = self.twoModule.storageRange;
             self.twoModule.tenant = self.twoModule.tenantRange;
             } else {
             self.twoModule.getCidrIp("cluster", self.twoModule.clusterCidr, "clusterNetmask");
             self.twoModule.getCidrIp("storage", self.twoModule.storageCidr, "storageNetmask");
             self.twoModule.getCidrIp("tenant", self.twoModule.tenantCidr, "tenantNetmask");
             }*/
        }
    };
}])
.controller("stepthreeCtrl", ["$scope", "$http", "$location", "$routeParams", "$interval","clusterSrv", function($scope, $http, $location, $routeParams, $interval,clusterSrv) {
    var self = $scope;
    var listData = localStorage.curRegionLISTS ? JSON.parse(localStorage.curRegionLISTS) : "";
    self.threeModule = {
        completeThree: function(){
            localStorage.setItem("curRegionACCOUNT", JSON.stringify(self.threeModule.accountData));
            var data = localStorage.curRegionNODE ? JSON.parse(localStorage.curRegionNODE) : "";
            clusterSrv.checkUserName({userName:self.threeModule.accountData.username,regionKey:localStorage.regionKey},self.curRegionEnterpriseUid).then(function(res){
                if(!res){
                    self.threeModule.idExist = false;
                    self.threeModule.serverError = false;
                    if (data) {
                        data.common.keystone_admin_user = self.threeModule.accountData.username;
                        data.common.keystone_admin_password = self.threeModule.accountData.password;
                        data.common.user_list = JSON.parse(localStorage.curRegionUSEDLIST);
                        localStorage.setItem("curRegionALLDATA", JSON.stringify(data));
                    }
                    $location.path("/configure/cluster/stepfour");
                }else if(res&&res.data&&res.data.code=="01080601"){
                    self.threeModule.idExist = true;
                }else{
                    self.threeModule.serverError = true;
                }
            });

        },
        accountData: {
            region: "",
            username: "",
            password: ""
        },
        change: function(v) {
            $http({
                method: "PUT",
                url: "awstack-user/v1/enterprises/" + listData[0].enterpriseUid + "/regions/" + listData[0].regionUid + "/names",
                data: {
                    "regionName": v
                }
            }).success(function() {
                //self.oneModule.editActive = false;
            });
        },
        prev: function() {
            $location.path("/info/steptwo");
        },
        isDisabled: false,
        checkedList: "",
        init: function() {
            if (listData) {
                self.threeModule.accountData.region = listData[0].regionName;
            }
        },
        isdisabled: false,
        idExist: false,
        canUsed: false
    };
    self.threeModule.init();
}])
.controller("stepfourCtrl", ["$scope", "$http", "$location","clusterSrv", function($scope, $http, $location,clusterSrv) {
    var self = $scope;
    var listData = localStorage.curRegionLISTS ? JSON.parse(localStorage.curRegionLISTS) : "";
    //var alldata = JSON.parse(localStorage.curRegionALLDATA);
    var alldata = JSON.parse(localStorage.curRegionNODE);
    alldata.common.keystone_admin_user = '';
    alldata.common.keystone_admin_password = '';
    alldata.common.user_list = JSON.parse(localStorage.curRegionUSEDLIST);
    alldata.ha = true;
    self.fourModule = {
        ha:true,
        enable_ceph:listData?listData[0].hostInfoMap.enable_ceph:false,
        //enable_ceph:true,
        ceph_nova_pool_size:2,
        ceph_glance_pool_size:2,
        ceph_cinder_pool_size:2,
        usedHa:listData.length,
        //usedHa:3,
        completeFour: function() {
            if(listData.length>0){
                self.fourModule.nodeList = listData.length;
                if(self.fourModule.ceph_nova_pool_size < 2 || self.fourModule.ceph_nova_pool_size > listData.length){
                    self.fourModule.novaSize = true;
                }else{
                    self.fourModule.novaSize = false;
                }
                if(self.fourModule.ceph_glance_pool_size < 2 || self.fourModule.ceph_glance_pool_size > listData.length){
                    self.fourModule.glanceSize = true;
                }else{
                    self.fourModule.glanceSize = false;
                }
                if(self.fourModule.ceph_cinder_pool_size < 2 || self.fourModule.ceph_cinder_pool_size > listData.length){
                    self.fourModule.cinderSize = true;
                }else{
                    self.fourModule.cinderSize = false;
                }
            }
            alldata.ha = self.fourModule.ha;
            if(Number(self.fourModule.usedHa)>0 && Number(self.fourModule.usedHa)<3){
                alldata.ha = false;
            };

            if(self.fourModule.enable_ceph){
                if(self.detailForm.$valid && !self.fourModule.novaSize && !self.fourModule.glanceSize && !self.fourModule.cinderSize){
                    alldata.common.ceph_nova_pool_size = self.fourModule.ceph_nova_pool_size;
                    alldata.common.ceph_glance_pool_size = self.fourModule.ceph_glance_pool_size;
                    alldata.common.ceph_cinder_pool_size = self.fourModule.ceph_cinder_pool_size;
                    localStorage.setItem("curRegionALLDATAS",JSON.stringify(alldata));
                    if (localStorage.curRegionALLDATAS) {//安装部署
                        clusterSrv.postDeploy(JSON.parse(localStorage.curRegionALLDATAS),self.curRegionEnterpriseUid).then(function(res){
                            if(res.code==0){
                                $location.path("/configure/cluster/complete");
                            }
                        })
                        /*$http({
                            method: "PUT",
                            url: "awstack-user/v1/enterprises/" + listData[0].enterpriseUid + "/clusters/configurations",
                            data: JSON.parse(localStorage.curRegionALLDATAS)
                        }).then(function() {
                            
                        });*/
                    }
                }
            }else{
                localStorage.setItem("curRegionALLDATAS",JSON.stringify(alldata));
                if (localStorage.curRegionALLDATAS) {
                    clusterSrv.postDeploy(JSON.parse(localStorage.curRegionALLDATAS),self.curRegionEnterpriseUid).then(function(res){
                        if(res.code==0){
                            $location.path("/configure/cluster/complete");
                        }
                    })
                    /*$http({
                        method: "PUT",
                        url: "awstack-user/v1/enterprises/" + listData[0].enterpriseUid + "/clusters/configurations",
                        data: JSON.parse(localStorage.curRegionALLDATAS)
                    }).then(function() {
                        $location.path("/configure/cluster/complete");
                    });*/
                }
            }
        },
        prev: function() {
            $location.path("/configure/cluster/stepthree");
        },
        init: function() {
            if (localStorage.curRegionLISTS) {
                self.fourModule.checkedList = JSON.parse(localStorage.curRegionLISTS);
            }
            if (localStorage.curRegionACCOUNT) {
                var fourData = JSON.parse(localStorage.curRegionACCOUNT);
                self.fourModule.regionName = fourData.region;
                self.fourModule.username = fourData.username;
                self.fourModule.password = fourData.password;
            }
            if (localStorage.curRegionUSEDLIST) {
                self.fourModule.usedList = JSON.parse(localStorage.curRegionUSEDLIST);
            }
        }
    };
    self.fourModule.init();
}])
.controller("completeCtrl", ["$scope","$http","$location","$translate","clusterSrv", function(scope,$http,$location,translate,clusterSrv) {
    var self = scope;
    var enterpriseUid = self.curRegionEnterpriseUid;
    var regionKey = self.curRegionKey;
    var listData = localStorage.curRegionLISTS ? JSON.parse(localStorage.curRegionLISTS) : "";
    //var component = localStorage.COMPONENT ? JSON.parse(localStorage.COMPONENT) : "";
    var websocket;
    var component_enable_ceph = localStorage.componentEnableCeph;
    self.enable_ceph = listData?listData[0].hostInfoMap.enable_ceph:component_enable_ceph;
    self.startUp = false;
    self.complete = {
        message: [],
        status: ""
    };
    self.redo = false;
    if(self.curRegionStatus=="3"){
        self.ending = true;
        self.failed = false;
        self.redo = true;
    }
    if (self.curRegionStatus && self.curRegionStatus!="3") {
        if ("WebSocket" in window) {
            let url = GLOBALCONFIG.APIHOST.WEBSOCKET + "/v1/bobmsg/operation?X-Register-Code=" + regionKey;
            //let url = "ws:"+GLOBALCONFIG.APIHOST.WEBSOCKET+"/v1/bobmsg/operation?X-Register-Code=0g3nJ";
            websocket = new WebSocket(url);
            websocket.onopen = function() {
                self.startUp = false;
                self.failed = false;
                self.ending = false;
                self.complete.message.push("正在准备配置信息");
                scope.$apply();
            };
            websocket.onmessage = function() {
                if (event.data.toLowerCase().indexOf("deploying success all") > -1 || self.curRegionStatus=="3") {
                    self.ending = true;
                    self.failed = false;
                    self.components_neutron = true;
                    self.components_nova = true;
                    self.components_cinder = true;
                    self.components_glance = true;
                    self.components_keystone = true;
                    self.components_ceph = true;
                    self.complete.status = "color-9";
                    websocket.close();
                    //var trans_title = translate.instant("aws.siteTitle.completed") + " - " + translate.instant("aws.siteTitle.projectname") || "home";
                    var trans_title = translate.instant("aws.siteTitle.completed") ;
                    window.document.title = trans_title;

                }else if(event.data.toLowerCase().indexOf("deploying openstack network service") > -1) {
                    self.startUp = true;
                    self.components_nova = true;
                    self.components_cinder = true;
                    self.components_glance = true;
                    self.components_keystone = true;
                    self.components_ceph = true;
                    self.complete.status = "color-8";
                }else if (event.data.toLowerCase().indexOf("deploying openstack compute service") > -1) {
                    self.startUp = true;
                    self.components_cinder = true;
                    self.components_glance = true;
                    self.components_keystone = true;
                    self.components_ceph = true;
                    self.complete.status = "color-7";
                }else if (event.data.toLowerCase().indexOf("deploying openstack volume service") > -1) {
                    self.startUp = true;
                    self.components_glance = true;
                    self.components_keystone = true;
                    self.components_ceph = true;
                    self.complete.status = "color-6";
                }else if (event.data.toLowerCase().indexOf("deploying openstack image service") > -1) {
                    self.startUp = true;
                    self.components_keystone = true;
                    self.components_ceph = true;
                    self.complete.status = "color-5";
                }else if (event.data.toLowerCase().indexOf("deploying openstack identity service") > -1) {
                    self.startUp = true;
                    self.complete.status = "color-4";
                    self.components_ceph = true;
                }else if (event.data.toLowerCase().indexOf("deploying database cluster") > -1) {
                    self.startUp = true;
                    self.complete.status = "color-3";
                    self.components_ceph = true;
                }else if (event.data.toLowerCase().indexOf("deploying load balancer") > -1) {
                    self.startUp = true;
                    self.complete.status = "color-2";
                    self.components_ceph = true;
                }else if (event.data.toLowerCase().indexOf("deploying ceph restapi") > -1) {
                    self.startUp = true;
                    self.complete.status = "color-1";
                }else if (event.data.toLowerCase().indexOf("deploying ceph monitors") > -1) {
                    self.startUp = true;
                    self.complete.status = "color-0";
                }else if (event.data.toLowerCase().indexOf("deploying fail all") > -1) {
                    self.failed = true;
                    self.ending = false;
                    self.startUp = true;
                }
                scope.$apply();
            };
            websocket.onerror = function() {

            };
            websocket.onclose = function() {

            };
        }
    }
    self.detail = function(){
        self.showConfDetail = !self.showConfDetail;//获取部署详情
        clusterSrv.getDeployDetail(regionKey).then(function(result){
            if(result&&result.data){
                var nodesData = result.data;
                var com = JSON.parse(nodesData.regionConfigScript);
                self.usedList = com.user_list;
            }
        })
        /*$http({
            method:"GET",
            url:"/awstack-user/v1/enterprises/regions/regionkeys/"+regionKey
        }).then(function(result){
            if(result&&result.data){
                var nodesData = result.data;
                var com = JSON.parse(nodesData.regionConfigScript);
                self.usedList = com.user_list;
            }
        });*/
    };
    self.dismiss = function(){
        self.showConfDetail = false;
    };
    self.reset = function(){
        self.showAlert = true;
    };
    self.close = function(){
        self.showAlert = false;
    };
    self.reseConfirm = function(){
        var data=[];
        
        data.push({"regionKey":regionKey});
        clusterSrv.resetDeploy(data,enterpriseUid).then(function(res){//重新部署
            self.curRegionStatus = null;
            localStorage.removeItem("INSTALLSTATUS");
            localStorage.removeItem("curRegionNODE");
            localStorage.removeItem("curRegionLISTS");
            localStorage.removeItem("curRegionHOSTNAMELIST");
            localStorage.removeItem("curRegionTWOFORM");
            localStorage.removeItem("curRegionALLDATA");
            localStorage.removeItem("curRegionALLDATAS");
            localStorage.removeItem("curRegionACCOUNT");
            localStorage.removeItem("componentEnableCeph");
            $location.path("/configure/cluster/stepone");
            $location.replace();
        })
        /*$http({
            method:"DELETE",
            headers:{
                "Content-Type":"application/json"
            },
            url:"/awstack-user/v1/enterprises/"+enterpriseUid+"/clusters/configurations",
            data:data
        }).then(function(){
            self.curRegionStatus = null;
            localStorage.removeItem("INSTALLSTATUS");
            localStorage.removeItem("curRegionNODE");
            localStorage.removeItem("curRegionLISTS");
            localStorage.removeItem("curRegionHOSTNAMELIST");
            localStorage.removeItem("curRegionTWOFORM");
            localStorage.removeItem("curRegionALLDATA");
            localStorage.removeItem("curRegionALLDATAS");
            localStorage.removeItem("curRegionACCOUNT");
            $location.path("/configure/cluster/stepone");
            $location.replace();
        });*/
    };
}])
