steptwoCtrl.$inject=["$scope", "$http", "$location","$timeout","$uibModal","NgTableParams"];
export function steptwoCtrl($scope, $http, $location,$timeout, $uibModal,NgTableParams){
    var self = $scope;
    self.sassIP=GLOBALCONFIG.APIHOST.BASE.split("//")[1].split(":")[0];
    //self.sassIP=window.location.hostname;
    var listData = localStorage.LISTS ? JSON.parse(localStorage.LISTS) : "";
    var twoFormData = localStorage.TWOFORM ? JSON.parse(localStorage.TWOFORM) : "";
    var HaVlanData = localStorage.HaVlan ? JSON.parse(localStorage.HaVlan) : "";
    self.gateWayCan = false;
    if(!listData){
        return;
    }else if(listData.length==2){
        self.gateWayCan = true;
    }
    self.submitValid = true;
    self.changeCheck = function(type,val){
        if(val){
            return;
        }
        switch(type){
            case "cluster":
                self.twoModule.clusterVlan = "";
                break;
            case "storage":
                self.twoModule.storageVlan = "";
                break;
            case "public":
                self.twoModule.publicVlan = "";
                break;
        }
    }

    /*网卡检测*/
    self.netTestFun = function(){
        /*建立websocket链接*/
        self.netTestCan = {
            testBtn:true,
            testLoad:false
        }
        var linkNum=0;
        var regionKey = localStorage.LOGINS?JSON.parse(localStorage.LOGINS).regionKey:"FFFFF";
        if ("WebSocket" in window) {
            //let url = GLOBALCONFIG.APIHOST.WEBSOCKET + "/v1/bobmsg/operation?X-Register-Code=" + regionKey;
            let url = GLOBALCONFIG.APIHOST.WEBSOCKET + "/check?X-Register-Code=" + regionKey;
            var socket = function (url){
                let netws = new WebSocket(url);
                netws.onopen = function() {
                    
                };
                netws.onmessage = function(event) {
                    if(event.data){
                        var data = JSON.parse(event.data)
                        var testData = dataProcess(data);
                        self.tableParams = new NgTableParams({ count: 5 }, { counts: [], dataset: testData });
                        self.tableParams.reload();
                    }
                };
                netws.onerror = function() {
                    // if(linkNum<11){
                    //     netws = socket(url);
                    // }
                    // linkNum++;
                    // console.log(netws);
                };
                netws.onclose = function() {
                    if(linkNum<11){
                        $timeout(function(){
                            netws = socket(url);
                            console.log(netws,linkNum);
                        },2000)
                    }
                    linkNum++;
                };
                return netws;
            }
            socket(url)
        }

        /*打开检测弹出框*/
        var qaModal = $uibModal.open({
            animation: self.animationsEnabled,
            templateUrl: "netTest.html",
            scope: self
        })

        /*检测数据处理*/
        function dataProcess(v){
            let data = v;
            let vlanType = self.twoModule.neutron_type;
            let testData = [];
            self.netTestCan = {
                testBtn:data.status=='1'?false:true,
                testLoad:data.status=='1'?false:true
            }
            if(data.actiontype=='network_config'){
                if(data.status=='1'){
                    self.netConfig = true;
                }else{
                    self.netConfig = false;
                }
            }else{
                self.netConfig = false;
            }
            if(data.actiontype!='network_config'){
                let checkresult = data.checkresult;
                for(var i in checkresult){
                    let nodeItem = {
                        name:i,
                        cluster:"",
                        clusterstatus:"0",
                        tenant:"",
                        tenantstatus:"0",
                        storage:"",
                        storagestatus:"0",
                    }
                    var netItem = checkresult[i];
                    if(netItem.cluster){
                        if(netItem.cluster.status=='0'){
                            nodeItem.cluster = "验证成功";
                            nodeItem.clusterstatus = "0";
                        }else{
                            nodeItem.cluster = netItem.cluster.msg.join(',')+"未连通";
                            nodeItem.clusterstatus = "1"
                        }
                    }
                    if(netItem.storage){
                        if(netItem.storage.status=='0'){
                            nodeItem.storage = "验证成功";
                            nodeItem.storagestatus = "0";
                        }else{
                            nodeItem.storage = netItem.storage.msg.join(',')+"未连通";
                            nodeItem.storagestatus = "1";
                        }    
                    }
                    if(data.status=='1'&&data.actiontype!='vlan_config'&&data.actiontype!='vlan_connectivity'){
                        if(netItem.tenant.status=='0'){
                            nodeItem.tenant = "验证成功";
                            nodeItem.tenantstatus = "0";
                        }else{
                            nodeItem.tenant = netItem.tenant.msg.join(',')+"未连通";
                            nodeItem.tenantstatus = "1";
                        }    
                    }
                    if(netItem.tenant&&netItem.tenant.status=='0'){
                        if(data.actiontype=='vlan_config'){
                            if(netItem.vlanconfig!=''){
                                nodeItem.tenant = netItem.vlanconfig;
                                nodeItem.tenantstatus = "1";        
                            }else if(JSON.stringify(netItem.vlan)!='{}'){
                                for(var i in netItem.vlan){
                                    nodeItem.tenant += vlanType+i+" "+netItem.vlan[i].join('、')+"不通"+"\n"
                                }
                                nodeItem.tenantstatus = "1";
                            }
                        }else if(data.actiontype=='vlan_connectivity'){
                            if(JSON.stringify(netItem.vlan)=='{}'){
                                if(data.status=='1'){
                                    nodeItem.tenant = "验证成功";
                                    nodeItem.tenantstatus = "0"; 
                                }
                            }else{
                                for(var i in netItem.vlan){
                                    nodeItem.tenant += vlanType+i+" "+netItem.vlan[i].join('、')+"不通"+"\n"
                                }
                                nodeItem.tenantstatus = "1";
                            }
                        }
                    }else{
                        if(data.actiontype=='vlan_config'){
                            if(netItem.vlanconfig!=''){
                                nodeItem.tenant = netItem.vlanconfig;
                                nodeItem.tenantstatus = "1";        
                            }else if(JSON.stringify(netItem.vlan)!='{}'){
                                for(var i in netItem.vlan){
                                    nodeItem.tenant += vlanType+i+" "+netItem.vlan[i].join('、')+"不通"+"\n"
                                }
                                nodeItem.tenantstatus = "1";
                            }
                        }else if(data.actiontype=='vlan_connectivity'){
                            if(JSON.stringify(netItem.vlan)=='{}'){
                                if(data.status=='1'){
                                    nodeItem.tenant = "验证成功";
                                    nodeItem.tenantstatus = "0"; 
                                }
                            }else{
                                nodeItem.tenant = ''
                                for(var i in netItem.vlan){
                                    nodeItem.tenant += vlanType+i+" "+netItem.vlan[i].join('、')+"不通"+"\n"
                                }
                                nodeItem.tenantstatus = "1"; 
                            }
                        }else{
                            nodeItem.tenant =netItem.tenant.msg.join(',')+"未连通";
                            nodeItem.tenantstatus = "1";
                        }
                    }
                    testData.push(nodeItem);
                }
            }
            return testData;
        }

        /*获取检测列表*/
        function getNetTest(){
            $http({
                method:"get",
                url:GLOBALCONFIG.APIHOST.BASE+"/v1/network/check/result",
                headers:{'X-Register-Code':regionKey}
            }).success(function(res){
                if(res&&res.data&&res.data.data){
                    if(res.data.data=='network_check'||res.data.data==''){
                        self.netTestCan =  {
                            testBtn:false,
                            testLoad:false
                        }
                        var testData = [];
                    }else{
                        var datatest = JSON.parse(res.data.data);
                        if(datatest.status=='1'){
                            self.netTestCan =  {
                                testBtn:false,
                                testLoad:false
                            }
                        }else{
                            self.netTestCan =  {
                                testBtn:true,
                                testLoad:true
                            }
                        }           
                        var testData = dataProcess(datatest)
                    }
                    self.tableParams = new NgTableParams({ count: 5 }, { counts: [], dataset: testData });
                }
            })
        }
        getNetTest();
        

        /*拼接网络数据*/
        function splicingNet(){
            var nodesData = JSON.parse(localStorage.NODE);
            var patternSelected = JSON.parse(localStorage.patternSelected);
            if(patternSelected.value=='hyper'){
                var allDisksCard = JSON.parse(localStorage.diskCardConfig);
            }else{
                var allDisksCard = JSON.parse(localStorage.nodeConfig);
            }
            nodesData.node.forEach(function(item){
                var thisData = allDisksCard[item.nodeid];
                item.disk_config=[];
                item.nic_map={
                    "cluster":thisData.cardJson.nic_map.cluster.bonds,
                    "storage":thisData.cardJson.nic_map.storage.bonds,
                    "public":thisData.cardJson.nic_map.public.bonds,
                    "tenant":thisData.cardJson.nic_map.tenant.bonds,
                    "mgmt":thisData.cardJson.nic_map.mgmt.bonds
                };
                item.bonds={}
                if(patternSelected.value=='hyper'){
                    item.bonds = thisData.cardJson.bonds;
                }else{
                    if(thisData.cardJson&&thisData.cardJson.bonds){
                        thisData.cardJson.bonds.forEach(function(i){
                            item.bonds[i.name] = {
                                "nics":[],
                                "mode":i.selected.type
                            }
                            i.nics.forEach(function(v){
                                item.bonds[i.name].nics.push(v.name)
                            })
                        })
                    }
                }
            })

            var nodeValue = [];
            nodesData.node.forEach(function(item){
                var nodeItem = {
                    "hostname": item.hostname,
                    "nodeUid": item.nodeid,
                    "action": "check_network",
                    "action_type": "network_config",
                    "network": item.network,
                    "nic_map": item.nic_map,
                    "bonds": item.bonds,
                    "neutron_type": self.twoModule.neutron_type,
                    "ha_vlan": self.twoModule.tenantVlanCheck&&self.twoModule.neutron_type=='vlan'?self.twoModule.ha_vlan:"",
                    "allow_sdn": nodesData.common.allow_sdn=='True'?true:false,
                    "enable_sdn": nodesData.common.enable_sdn=='True'?true:false,
                    "enable_storage_network": true
                }
                nodeValue.push(nodeItem)
            })
            var dataParams = {
                data:nodeValue,
                iprange:nodesData.iprange,
                check_type:"0"
            }
            return dataParams
        }

        /*开始网络检测*/
        self.startTestNet = function(ipForm){
            self.netTestCan = {
                testBtn:true,
                testLoad:true
            }
            self.twoModule.completeTwo(ipForm);
            var dataParams = splicingNet();
            $http({
                method:"post",
                url:GLOBALCONFIG.APIHOST.BASE+"/v1/network/check",
                headers:{'X-Register-Code':regionKey},
                data:dataParams
            }).success(function(res){
                //2010101  //网络检测参数错误码
                //2010102  //网络检测失败错误码
            })
        }
    }
    //self.netTestFun()

    self.twoModule = {
        neutron_type: twoFormData ? twoFormData.neutron_type :'vlan',
        ha_vlan: twoFormData ? twoFormData.ha_vlan :'1000',
        enable_sdn :listData[0].hostInfoMap.enable_sdn,
        enable_storage_network :listData[0].hostInfoMap.enable_storage_network,
        allow_ceph :listData[0].hostInfoMap.allow_ceph,
        allow_sdn :listData[0].hostInfoMap.allow_sdn,
        moreIp:7,
        cidrAllCheck:{
            cluster:false,
            tenat:false,
            storage:false
        },
        checkAllNet:function(v,type){
            var reg =new RegExp("^((?:(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d))))[\/]([1-9]|[1-2][0-9]|[3][0]|[3][1])$");
            if(!reg.test(v)&&v){
                if(v.indexOf('10.179.243')>-1&&v.substring(0,10)=='10.179.243'){
                    this.cidrAllCheck[type] = true;
                }else{
                    this.cidrAllCheck[type] = false;
                }
            }else{
                this.cidrAllCheck[type] = false;
            }
            
        },
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
        publicRangeError:{
            rangeTotal:false,
            rangeSame:false
        },
        advanceSetting: twoFormData ? twoFormData.advanceSetting : listData.length==2?true:false,
        clusterCheck: twoFormData ? twoFormData.clusterCheck : true,
        storageCheck: twoFormData ? twoFormData.storageCheck : true,
        tenantCheck: twoFormData ? twoFormData.tenantCheck : false,
        tenantVlanCheck:twoFormData ? twoFormData.tenantVlanCheck : true,
        publicCheck: twoFormData ? twoFormData.publicCheck : false,
        publicVlan: twoFormData ? twoFormData.publicVlan : "1000",
        clusterVlan: twoFormData ? twoFormData.clusterVlan : "1000",
        storageVlan: twoFormData ? twoFormData.storageVlan : "1000",
        logical: twoFormData ? twoFormData.logical : "1000",
        logicalVlan: function(v){
            if(v!=''&&v<=4094&&v>=2){
                self.twoModule.clusterVlan = v;
                self.twoModule.storageVlan = v;
                if(self.twoModule.neutron_type=='vlan'){
                    self.twoModule.ha_vlan = v;
                }   
            }
        },
        advanceSet:function(){
            self.twoModule.advanceSetting = !self.twoModule.advanceSetting;
        },
        setVlan:function(v){
            if(v=='vxlan'){
                self.twoModule.tenantStart = "1";
                self.twoModule.tenantEnd =  "5000";
            }else{
                self.twoModule.tenantStart = "1000";
                self.twoModule.tenantEnd =  "1010";
            }
        },
        changeCreateEmail: function(index, user) {
            var emailField = "clusterStart_" + index;
            //self.ipForm = {};
            // console.log(self.twoModule.ipForm);
            user.isError = self.twoModule.ipForm[emailField];
        },
        rangeOff:function(tips){
            self.twoModule[tips].rangeSame = false;
            self.twoModule[tips].rangeTotal = false;
            if(listData.length==2){
                self.gateWayCan = false;
                $timeout(function(){
                    self.gateWayCan = true;
                },40)
            }
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
        hidecidrCheck:function(){
            self.cidrCheckFlag  = false;
        },
        completeTwo: function(ipForm,netCheck) {
            if(ipForm.$valid){
                /*clusterCidr集群网
                storageCidr存储网
                tenantCidr租户网
                floatingCidr业务网*/
                function getIplong(cidr){
                    return {
                        "startip":_IP.toLong(_IP.cidrSubnet(cidr).firstAddress),
                        "endip":_IP.toLong(_IP.cidrSubnet(cidr).lastAddress)
                    }
                }
                var cidrCheck=[
                    getIplong(self.twoModule.clusterCidr),
                    getIplong(self.twoModule.storageCidr),
                    getIplong(self.twoModule.tenantCidr),
                    getIplong(self.twoModule.floatingCidr)
                ];
                /*利用冒泡的方案进行四种网络类型两两比较*/
                for(var i=0;i<cidrCheck.length;i++){
                    for(var j=0;j<cidrCheck.length-i-1;j++){
                        var temps = null;
                        var startip_1 = cidrCheck[j].startip;
                        var endip_1 = cidrCheck[j].endip;
                        var startip_2 = cidrCheck[j+1].startip;
                        var endip_2 = cidrCheck[j+1].endip;
                        if(endip_1<=endip_2&&endip_1>=startip_2){
                            self.cidrCheckFlag  = true;
                            return;
                        }else if(startip_1<=endip_2&&startip_1>=startip_2){
                            self.cidrCheckFlag  = true;
                            return;
                        }else{
                            temps = cidrCheck[j];
                            cidrCheck[j] = cidrCheck[j+1];
                            cidrCheck[j+1] = temps;
                        }
                    }
                } 
                /**/ 
                self.haCheckFlag  = false;                  
                if(this.neutron_type=='vlan'){
                    var ha_vlan = Number(this.ha_vlan);
                    var tenantStart = Number(this.tenantStart);
                    var tenantEnd = Number(this.tenantEnd);
                    if(ha_vlan>=tenantStart&&ha_vlan<=tenantEnd){
                        self.haCheckFlag  = true;
                        $timeout(function(){
                            self.haCheckFlag  = false;
                        },3000)
                        return;
                    }
                }

                /*验证存储网和租户网vlan冲突*/
                self.tenantStoVlan = false;
                if(this.neutron_type=='vlan'&&
                    this.storageCheck&&
                    Number(this.tenantStart)<=Number(this.storageVlan)&&
                    Number(this.tenantEnd)>=Number(this.storageVlan)
                    ){
                    self.tenantStoVlan = true;
                    $timeout(function(){
                        self.tenantStoVlan  = false;
                    },3000)
                    return
                }

                this.setCidrIp();
                var clusterIpChecked=this.checkRange(self.twoModule.cluster,"clusterRangeError",self.twoModule.moreIp);
                var storageIpChecked=this.checkRange(self.twoModule.storage,"storageRangeError",0);
                var tenantIpChecked=this.checkRange(self.twoModule.tenant,"tenantRangeError",0);
                if(clusterIpChecked&&storageIpChecked&&tenantIpChecked){
                    var ipData;
                    ipData = {
                        advanceSetting:self.twoModule.advanceSetting,
                        neutron_type:self.twoModule.neutron_type,
                        ha_vlan : self.twoModule.tenantVlanCheck?self.twoModule.ha_vlan:"1000",
                        logical:self.twoModule.logical!=''?self.twoModule.logical:"1000",
                        cidrOn: self.twoModule.cidrOn,
                        clusterCheck: self.twoModule.clusterCheck ? true : false,
                        clustergateway: self.twoModule.clustergateway || "",
                        clusterRangeCheck: self.twoModule.clusterRangeCheck ? true : false,
                        storageCheck: self.twoModule.storageCheck ? true : false,
                        storagegateway: self.twoModule.storagegateway || "",
                        storageRangeCheck: self.twoModule.storageRangeCheck ? true : false,
                        tenantCheck: self.twoModule.tenantCheck ? true : false,
                        tenantVlanCheck: self.twoModule.tenantVlanCheck ? true : false,
                        tenantRangeCheck: self.twoModule.tenantRangeCheck ? true : false,
                        publicCheck: self.twoModule.publicCheck ? true : false,
                        clusterCidr: self.twoModule.clusterCidr? self.twoModule.clusterCidr : "",
                        clusterRange: self.twoModule.clusterRangeCheck? self.twoModule.clusterRange : "",
                        clusterVlan: self.twoModule.clusterCheck ? self.twoModule.clusterVlan : "1000",
                        storageCidr: self.twoModule.storageCidr ? self.twoModule.storageCidr : "",
                        storageRange: self.twoModule.storageRangeCheck? self.twoModule.storageRange : "",
                        storageVlan: self.twoModule.storageCheck ? self.twoModule.storageVlan : "1000",
                        tenantCidr: self.twoModule.tenantCidr? self.twoModule.tenantCidr : "",
                        tenantgateway: self.twoModule.tenantgateway || "",
                        tenantRange: self.twoModule.tenantRangeCheck? self.twoModule.tenantRange : "",
                        tenantStart: self.twoModule.tenantStart,
                        tenantEnd: self.twoModule.tenantEnd,
                        publicVlan: self.twoModule.publicCheck ? self.twoModule.publicVlan : "1000",
                        floatingRangeCheck: self.twoModule.floatingRangeCheck ? true : false,
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
                    localStorage.setItem("NODE", JSON.stringify(createC));
                    localStorage.setItem("CIDR", JSON.stringify());
                    var usedList = [{
                        vlanType:this.neutron_type,
                        name: "floating",
                        cidr: self.twoModule.floatingCidr,
                        iprange: self.twoModule.floating,
                        vlan: self.twoModule.publicCheck ? self.twoModule.publicVlan : ""
                    }, {
                        vlanType:this.neutron_type,
                        name: "cluster",
                        cidr: self.twoModule.clusterCidr,
                        iprange: self.twoModule.cluster,
                        vlan: self.twoModule.clusterCheck ? self.twoModule.clusterVlan : ""
                    }, {
                        vlanType:this.neutron_type,
                        name: "storage",
                        cidr: self.twoModule.storageCidr,
                        iprange: self.twoModule.storage,
                        vlan: self.twoModule.storageCheck ? self.twoModule.storageVlan : ""
                    }, {
                        vlanType:this.neutron_type,
                        name: "tenant",
                        cidr: self.twoModule.tenantCidr,
                        iprange: self.twoModule.tenant,
                        vlan: self.twoModule.tenantStart + "-" + self.twoModule.tenantEnd
                    }];
                    if(!self.twoModule.enable_sdn){//不使用sdn时删除外网
                        usedList = usedList.filter(function(item){
                            return item.name!='floating'
                        });
                        usedList.forEach(item=>{//不使用sdn时删除租户网ip,cidr
                            if(item.name=="tenant"){
                                delete item.cidr;
                                delete item.iprange;
                            }
                        })
                    }
                    if(!self.twoModule.enable_storage_network){//不使用存储网时删除存储网
                        usedList = usedList.filter(function(item){
                            return item.name!='storage'
                        });
                    }
                    var HaVlan = {
                        neutron_type:self.twoModule.neutron_type,
                        ha_vlan:self.twoModule.ha_vlan,  
                    }
                    localStorage.setItem("HaVlan", JSON.stringify(HaVlan));
                    localStorage.setItem("TWOFORM", JSON.stringify(ipData));
                    localStorage.setItem("USEDLIST", JSON.stringify(usedList));
                    if(netCheck){
                        $location.path("/info/stepthree");
                    } 
                }
                
            }else{
                self.submitValid = true;
            }

        },
        isDisabled: false,
        clusterRange: twoFormData && twoFormData.clusterRange ? twoFormData.clusterRange : [
            { start: "10.0.1.2", end: "10.0.1.254", startname: "clusterStart", endname: "clusterEnd" }
        ],
        cluster: "",
        clusterRangeCheck:twoFormData ? twoFormData.clusterRangeCheck : false,
        clusterCidr: twoFormData ? twoFormData.clusterCidr : "10.0.1.0/24",
        clusterNetmask: twoFormData ? twoFormData.clusterNetmask : "",
        clustergateway: twoFormData ? twoFormData.clustergateway : "10.0.1.254",
        storageRange: twoFormData && twoFormData.storageRange ? twoFormData.storageRange : [
            { start: "10.0.2.2", end: "10.0.2.254", startname: "storageStart", endname: "storageEnd" }
        ],
        storage: "",
        storageRangeCheck:twoFormData ? twoFormData.storageRangeCheck : false,
        storageCidr: twoFormData ? twoFormData.storageCidr : "10.0.2.0/24",
        storageNetmask: twoFormData ? twoFormData.storageNetmask : "",
        storagegateway: twoFormData ? twoFormData.storagegateway : "10.0.2.254",
        tenantRange: twoFormData && twoFormData.tenantRange ? twoFormData.tenantRange : [
            { start: "10.0.3.2", end: "10.0.3.254", startname: "tenantRangeStart", endname: "tenantRangeEnd" }
        ],
        tenant: "",
        tenantRangeCheck:twoFormData ? twoFormData.tenantRangeCheck : false,
        tenantCidr: twoFormData ? twoFormData.tenantCidr : "10.0.3.0/24",
        tenantNetmask: twoFormData ? twoFormData.tenantNetmask : "",
        tenantgateway: twoFormData ? twoFormData.tenantgateway : "10.0.3.254",
        cidrOn: twoFormData ? twoFormData.cidrOn : "cidr",
        tenantStart: twoFormData ? twoFormData.tenantStart : "1001",
        tenantEnd: twoFormData ? twoFormData.tenantEnd : "1010",
        floating: "",
        floatingRangeCheck:twoFormData ? twoFormData.floatingRangeCheck : true,
        floatingRange: twoFormData && twoFormData.floatingRange ? twoFormData.floatingRange : [
            { start: "192.168.1.2", end: "192.168.1.254", startname: "floatingStart", endname: "floatingEnd" }
        ],
        floatingNetmask: twoFormData ? twoFormData.floatingNetmask : "",
        floatingCidr: twoFormData ? twoFormData.floatingcidr : "192.168.1.0/24",
        floatinggateway: twoFormData ? twoFormData.floatinggateway : "192.168.1.1",
        nameNum: 1,
        //listData: JSON.parse(localStorage.LISTS),
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
        addFloating: function() {
            var item = { start: "", end: "", startname: "floatingStart" + this.nameNum, endname: "floatingEnd" + this.nameNum };
            self.twoModule.floatingRange.push(item);
        },
        delFloating: function(v) {
            self.twoModule.floatingRange.splice(v, 1);
        },
        setNet: function() {//设置node信息 网络类型，ip,netmask,vlan
            var clusterIp = self.twoModule.getIp(self.twoModule.cluster);
            var storageIp = self.twoModule.getIp(self.twoModule.storage);
            var tenantIp = self.twoModule.getIp(self.twoModule.tenant);
            var networkData = [{
                "role": "public",
                "vlan": self.twoModule.publicCheck ? self.twoModule.publicVlan : "",
            }, {
                "role": "cluster",
                "ip": self.twoModule.cluster[0].start,
                "netmask": self.twoModule.clusterNetmask,
                "vlan": self.twoModule.clusterCheck ? self.twoModule.clusterVlan : "",
            }, {
                "role": "storage",
                "ip": self.twoModule.storage[0].start,
                "netmask": self.twoModule.storageNetmask,
                "vlan": self.twoModule.storageCheck ? self.twoModule.storageVlan : ""
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
                
                if(!self.twoModule.enable_storage_network){//不使用存储网时删除存储网
                    data = data.filter(item=>{
                        return item.role!="storage"
                    })
                }
                if(!self.twoModule.enable_sdn){//不使用sdn删除外网
                    data = data.filter(item=>{
                        return item.role!="public";
                    })
                    data.forEach(item=>{
                        if(item.role=="tenant"){
                            delete item.ip;
                            delete item.netmask;
                        }
                    })
                }
                nodeNet.push(data);
            }
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
                    data.faultDomain = v.hostInfoMap.fault_domain;
                    data.fault_domain1 = v.hostInfoMap.fault_domain1;
                    data.fault_domain2 = v.hostInfoMap.fault_domain2;
                    data.fault_domain3 = v.hostInfoMap.fault_domain3;
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
                    //com.directpass_start = self.twoModule.floatingRange[0].start,
                    //com.directpass_end =self.twoModule.floatingRange[0].end,
                    //com.directpass_cidr = self.twoModule.floatingCidr,
                    //com.directpass_gateway = self.twoModule.floatinggateway
                    //delete com.tenant_vlan_range;
                }
                if(self.gateWayCan){
                    com.tenant_gateway = self.twoModule.tenantgateway;
                    com.cluster_gateway = self.twoModule.clustergateway;
                    com.storage_gateway = self.twoModule.storagegateway;
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
                },
                "floating": {
                    "range": self.twoModule.floating,
                    "netmask": self.twoModule.floatingNetmask,
                    "aleardyusr": self.twoModule.getIp(self.twoModule.floating)
                }
            };
            //console.log(iprange);
            if(!self.twoModule.enable_sdn){//不使用sdn时删除租户网
                delete iprange.tenant;
            };
            if(!self.twoModule.enable_storage_network){//不使用存储网时删除存储网
                delete iprange.storage
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
                //console.log(cidrData);
                List = {
                    start: cidrData.firstAddress,
                    end: cidrData.lastAddress
                };
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
            self.twoModule.getCidrIp("floating", self.twoModule.floatingCidr, "floatingNetmask",self.twoModule.floatingRangeCheck);
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
}