stepfourCtrl.$inject=["$scope", "$http","$timeout", "$location","$uibModal"];
export function stepfourCtrl($scope, $http,$timeout, $location,$uibModal){
    var self = $scope;
    var listData = localStorage.LISTS ? JSON.parse(localStorage.LISTS) : "";
    if(!listData){return;}
    var alldata = JSON.parse(localStorage.ALLDATA);
    var haPass = JSON.parse(localStorage.TWOFORM).tenantVlanCheck;
    var saasAddrReg = /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/;
    self.fourModuleDisabled = false;
    self.haVlan = JSON.parse(localStorage.HaVlan);
    var patternSelected = JSON.parse(localStorage.patternSelected);
    self.patternSelected = patternSelected.value;
    var oneStepData = JSON.parse(localStorage.oneStepData);
    self.faultdomainShow = oneStepData.faultdomain;
    self.fourModule = {
        ntp_servers:alldata.common.ntp_servers[0],
        enable_ceph:patternSelected&&patternSelected.value=='hyper'?true:false,
        usedHa:listData.length,
        backupMin:1,
        nodeList:listData.length+1,
        //usedHa:3,
        completeFour: function() {
            if(listData.length>0){
                if(self.fourModule.storagesize_selected.value >2 && listData.length == 2){
                    self.fourModule.glanceSize = true;
                    $timeout(function(){
                        self.fourModule.glanceSize = false;
                    },2000)
                    return;
                }else{
                    self.fourModule.glanceSize = false;
                }
            }
            /*拼接网卡磁盘数据*/
            var allNodesData = alldata.node;
            if(patternSelected.value=='hyper'){
                var configselected = JSON.parse(localStorage.configselected);
                allNodesData.forEach(function(item){
                    item.disk_config=configselected.disk_config;
                    item.nic_map= configselected.nic_map;
                    item.bonds=configselected.bonds;
                }) 
            }else{
                var allDisksCard = JSON.parse(localStorage.nodeConfig);
                allNodesData.forEach(function(item){
                    var thisData = allDisksCard[item.nodeid];
                    item.disk_data="";
                    item.nic_map={
                        "cluster":thisData.cardJson.nic_map.cluster.bonds,
                        "storage":thisData.cardJson.nic_map.storage.bonds,
                        "public":thisData.cardJson.nic_map.public.bonds,
                        "tenant":thisData.cardJson.nic_map.tenant.bonds,
                        "mgmt":thisData.cardJson.nic_map.mgmt.bonds
                    };
                    item.bonds={}

                    /*此处修改因为底层可以支持在软件交付模式下磁盘不配置功能*/
                    if(thisData.disksJson){
                        thisData.disksJson.configGroup.forEach(function(i){
                            /*数据盘拼接*/
                            var ceph_osd = [],
                                ceph_ssd=[]
                            i.data.forEach(function(v){
                                ceph_osd.push('/dev/'+v.name)
                            })
                            i.caching.forEach(function(v){
                                ceph_ssd.push('/dev/'+v.name)
                            })
                            ceph_osd = ceph_osd.join(", ")
                            ceph_ssd = ceph_ssd.join(", ")
                            i.ceph_osd = ceph_osd;
                            i.ceph_ssd = ceph_ssd;
                            if(ceph_ssd==''){
                                i.mode = 'journal_collocation';
                                i.root = '';
                            }else{
                                i.mode = i.selected.mode
                                if(i.mode == 'bcache'){
                                    i.root = 'bcache';
                                }else if(i.mode == 'raw_multi_journal'){
                                    i.root = 'ssd_journal';
                                }
                            }
                            // var nodeDisks ={
                            //     "ceph_osd":i.ceph_osd,
                            //     "ceph_ssd":i.ceph_ssd,
                            //     "mode":i.mode,
                            //     "root":i.root
                            // }
                            item.disk_data = i.ceph_osd;
                        })
                    }else{
                         item.disk_data = "";
                    }




                    thisData.cardJson.bonds.forEach(function(i){
                        item.bonds[i.name]={
                            "nics":[],
                            "mode":i.selected.type
                        }

                        i.nics.forEach(function(v){
                            item.bonds[i.name].nics.push(v.name)
                        })
                    })
                }) 
            }

            /*获取检测列表*/
            function getNetTest(){
                var regionKey = JSON.parse(localStorage.LOGINS).regionKey;
                $http({
                    method:"get",
                    url:  GLOBALCONFIG.APIHOST.BASE+"/v1/network/check/result",
                    headers:{'X-Register-Code':regionKey}
                }).success(function(res){
                    if(res&&res.data&&res.data.data){
                        if(res.data.data=='network_check'){
                            initConfig()    
                        }else{
                            var datatest = JSON.parse(res.data.data);
                            if(res.data.data&&datatest.status=='0'){
                                $uibModal.open({
                                    animation: self.animationsEnabled,
                                    templateUrl: "netTestTips.html",
                                })
                            }else{
                                initConfig()  
                            }
                        }
                    }else{
                        initConfig() 
                    }
                })
            }
            getNetTest()
            function initConfig(){
                if(self.detailForm.$valid){
                    if(self.haVlan.neutron_type=='vlan'&&haPass){
                       alldata.ha = true; 
                       alldata.common.ha_vlan = self.haVlan.ha_vlan;                    
                    }else{
                       alldata.ha = false; 
                    }
                    alldata.common.enable_storage_network= true;
                    alldata.common.neutron_type = self.haVlan.neutron_type;
                    alldata.common.pattern_type = self.patternSelected;
                    alldata.common.isTopNonTrivial  = oneStepData.faultdomain;
                    var faultDomainList = [];
                    alldata.node.forEach(function(item){
                        if (item.faultDomain!="") {
                            faultDomainList.push(item.faultDomain)   
                        }
                    });
                    if(patternSelected&&patternSelected.value=='hyper'){
                        alldata.common.is_custom = true;
                        alldata.common.ceph_nova_pool_size = localStorage.LISTS&&JSON.parse(localStorage.LISTS).length==2?'2':'3';
                        alldata.common.ceph_glance_pool_size = self.fourModule.storagesize_selected.value;
                        alldata.common.ceph_cinder_pool_size = self.fourModule.storagesize_selected.value;
                    alldata.common.enable_ceph = true;
                    alldata.registered_faultDomainlist=faultDomainList;
                    localStorage.setItem("ALLDATAS",JSON.stringify(alldata));
                    if (localStorage.ALLDATAS) {
                        self.fourModuleDisabled = true;
                        $http({
                            method: "PUT",
                            url: "awstack-user/v1/enterprises/" + listData[0].enterpriseUid + "/clusters/configurations",
                            data: JSON.parse(localStorage.ALLDATAS)
                        }).then(function(res) {
                            if(res.data.code==0){
                                var pathData = $location.path().split("/");
                                var regionkeyCode = pathData[pathData.length-1];
                                $location.path("/complete/"+regionkeyCode);
                            }
                        }).finally(function(){
                            self.fourModuleDisabled = false;
                        });
                    } 
                }else{
                    alldata.common.is_custom  = false;
                    alldata.common.enable_ceph = false;
                    localStorage.setItem("ALLDATAS",JSON.stringify(alldata));
                    if (localStorage.ALLDATAS) {
                        self.fourModuleDisabled = true;
                        $http({
                            method: "PUT",
                            url: "awstack-user/v1/enterprises/" + listData[0].enterpriseUid + "/clusters/configurations",
                            data: JSON.parse(localStorage.ALLDATAS)
                        }).then(function(res) {
                            if(res.data.code==0){
                                var pathData = $location.path().split("/");
                                var regionkeyCode = pathData[pathData.length-1];
                                $location.path("/complete/"+regionkeyCode);
                            }
                        }).finally(function(){
                            self.fourModuleDisabled = false;
                        });
                    } 
                    }
                }
            }
            
        },
        prev: function() {
            var pathData = $location.path().split("/");
            var regionkeyCode = pathData[pathData.length-1];
            $location.path("/info/stepthree/"+regionkeyCode);
        },
        init: function() {
            if (localStorage.LISTS) {
                self.fourModule.checkedList = JSON.parse(localStorage.LISTS);
                self.storagesizeType = [{name:"2",value:"2"},{name:"3",value:"3"}];
                self.fourModule.storagesize_selected = self.fourModule.checkedList.length==2?self.storagesizeType[0]:self.storagesizeType[1];
            }
            if (localStorage.ACCOUNT) {
                var fourData = JSON.parse(localStorage.ACCOUNT);
                self.fourModule.regionName = fourData.region;
                self.fourModule.username = fourData.username;
                self.fourModule.password = fourData.password;
            }
            if (localStorage.USEDLIST) {
                self.fourModule.usedList = JSON.parse(localStorage.USEDLIST);
            }
        }
    };
    self.fourModule.init();
}