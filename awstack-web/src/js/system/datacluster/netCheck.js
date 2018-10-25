netCheckCtrl.$inject=["$scope", "$http","$timeout", "$location", "$routeParams","NgTableParams","dataclusterSrv","context","$interval","$translate"];
function netCheckCtrl($scope,$http,$timeout, $location,$routeParams,NgTableParams,dataclusterSrv,context, $interval,$translate){
    var self = $scope;
    /*得到一个已经使用的节点nodeConfigScript*/
    var usedNode = context.nodeListData.filter(item=>{
        return item.useStatus == true
    })
    var currentRegion =[];

    /*拼接网络数据*/
    function splicingNet(){
        var nodesData = context.checkedItems;
        var allDisksCard = JSON.parse(localStorage.nodeConfig);
        nodesData.forEach(function(item){
            var thisData = allDisksCard[item.nodeUid];
            var nodeNetDeatil = JSON.parse(usedNode[0].nodeConfigScript);
            item.network = nodeNetDeatil.network;
            item.neutron_type = nodeNetDeatil.neutron_type;
            item.ha_vlan = nodeNetDeatil.ha_vlan;
            item.allow_sdn = nodeNetDeatil.allow_sdn;
            item.enable_sdn = nodeNetDeatil.enable_sdn;
            item.enable_storage_network = nodeNetDeatil.enable_storage_network;
            item.disk_config=[];
            item.nic_map={
                "cluster":thisData.cardJson.nic_map.cluster.bonds,
                "storage":thisData.cardJson.nic_map.storage.bonds,
                "public":thisData.cardJson.nic_map.public.bonds,
                "tenant":thisData.cardJson.nic_map.tenant.bonds,
                "mgmt":thisData.cardJson.nic_map.mgmt.bonds
            };
            item.bonds={}
            thisData.cardJson.bonds.forEach(function(i){
                item.bonds[i.name] = {
                    "nics":[],
                    "mode":i.selected.type
                }
                i.nics.forEach(function(v){
                    item.bonds[i.name].nics.push(v.name)
                })
            })
        })

        var nodeValue = [];
        nodesData.forEach(function(item){
            var nodeItem = {
                "hostname": item.hostName,
                "nodeUid": item.nodeUid,
                "action": "check_network",
                "action_type": "network_config",
                "network": item.network,
                "nic_map": item.nic_map,
                "bonds": item.bonds,
                "neutron_type": item.neutron_type,
                "ha_vlan": item.ha_vlan,
                "allow_sdn": item.allow_sdn,
                "enable_sdn": item.enable_sdn,
                "enable_storage_network": item.enable_storage_network
            }
            nodeValue.push(nodeItem)
        })
        var dataParams = {
            data:nodeValue,
            iprange:'',
            check_type:'1'
        }
        return dataParams
    }

    /*检测数据处理*/
    function dataProcess(v){
        let data = v;
        let vlanType = JSON.parse(usedNode[0].nodeConfigScript).neutron_type;
        let testData = [];
        self.netTestCan = {
            testBtn:data.status=='1'?false:true,
            testLoad:data.status=='1'?false:true
        }
        if(data.actiontype=='network_config'){
            if(data.status=='1'){
                self.netConfig = true;
                self.hasNetCheck=true;
            }else{
                self.netConfig = false;
            }
        }else{
            self.netConfig = false;
        }
        if(data.actiontype!='network_config'){
            let checkresult = data.checkresult;
            for(var i in checkresult){
                self.hasNetCheck=true;
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
        dataclusterSrv.getNetResult().then(function(res){
            if(res&&res.data){
                if(res.data=='network_check'||res.data==''){
                    self.netTestCan = {
                        testBtn:false,
                        testLoad:false
                    }
                    var testData = [];
                }else{
                    var datatest = JSON.parse(res.data);
                    if(datatest.status=='1'){
                        self.netTestCan = {
                            testBtn:false,
                            testLoad:false
                        }
                    }else{
                        self.netTestCan = {
                            testBtn:true,
                            testLoad:true
                        }
                    }
                    var hostName = context.checkedItems[0].hostName;
                    if (datatest.checkresult&&JSON.stringify(datatest.checkresult).indexOf(hostName)==-1) {
                        datatest.checkresult = {}
                    };
                    var testData = dataProcess(datatest)
                }
                self.tableParams = new NgTableParams({ count: 5 }, { counts: [], dataset: testData });
            }
        })
    }

    function getIprange(){
        dataclusterSrv.getClusterTableData().then(function(res){
            if(res&&res.data){
                var regionUid = $location.search().id;
                currentRegion = res.data.filter(item=>{
                    return item.regionUid == regionUid;
                })
            }
        })    
    }

    self.netTestFun = function(){
        /*建立netwebsocket链接*/
        if(window.netwebsocket){
            window.netwebsocket.close();
        }
        self.netTestCan = {
            testBtn:true,
            testLoad:false
        }
        var regionKey = localStorage.$LOGINDATA?JSON.parse(localStorage.$LOGINDATA).regionKey:"";
        if ("WebSocket" in window) {
            //let url = GLOBALCONFIG.APIHOST.WEBSOCKET + "/v1/bobmsg/operation?X-Register-Code=" + regionKey;
            let url = GLOBALCONFIG.APIHOST.WEBSOCKET + "/check?X-Register-Code=" + regionKey;
            window.netwebsocket = new WebSocket(url);
            window.netwebsocket.onopen = function() {

            };
            window.netwebsocket.onmessage = function(event) {
                if(event.data){
                    var data = JSON.parse(event.data)
                    var testData = dataProcess(data);
                    self.tableParams = new NgTableParams({ count: 5 }, { counts: [], dataset: testData });
                    self.tableParams.reload();
                }
            };
            window.netwebsocket.onerror = function() {

            };
            window.netwebsocket.onclose = function() {

            };
        }
        getNetTest();
        /*获取iprange*/
        getIprange();
    }

    /*网卡检测*/
    if(window.netwebsocket){
        window.netwebsocket.close(); 
    }
    self.netTestFun();
    /*开始网络检测*/
    self.startTestNet = function(){
        //网卡配置之后才能进行网络检测
        if(self.hasConfigCard){
            self.netTestCan = {
                testBtn:true,
                testLoad:true
            }
            var dataParams = splicingNet();
            dataclusterSrv.startNetTest(dataParams).then(function(res){
                //2010101  //网络检测参数错误码
                //2010102  //网络检测失败错误码
            })
        }else{
            self.showCardConfigMsg=true;
            $timeout(function(){
                 self.showCardConfigMsg = false;   
            },2000);
        }
    }
}
export {netCheckCtrl}