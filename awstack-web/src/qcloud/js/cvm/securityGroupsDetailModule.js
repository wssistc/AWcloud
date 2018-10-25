import "./instanceSrv";

var secGroupsDetailModule = angular.module("secGroupsDetailModule", ["ngSanitize", "ui.bootstrap.tpls", "ui.select"]);
secGroupsDetailModule.controller("secGroupsDetailCtrl", ["$scope","checkedSrv", "$uibModal","instanceSrv","$rootScope","$routeParams","RegionID","NgTableParams",
    function($scope,checkedSrv,$uibModal,instanceSrv,$rootScope,$routeParams,RegionID,NgTableParams){
        var self =$scope;
        var postData = {
            Region:RegionID.Region(),
            projectId:0
        };
        var postData_1 ={
            "Region": RegionID.Region()
        };
        var postData_2 ={
            "Region": RegionID.Region(),
            "sgId":$routeParams.id
        };
        self.ipProtocols = [
            {name:"TCP",ipProtocol:"tcp",portRange:"" },
            {name:"UDP",ipProtocol:"tcp",portRange:""},
            {name:"All traffic",ipProtocol:"",portRange:""},
            {name:"All TCP",ipProtocol:"tcp",portRange:""},
            {name:"All UDP",ipProtocol:"udp",portRange:""},
            {name:"TCP SSH",ipProtocol:"tcp",portRange:"22"},
            {name:"TCP SMTP",ipProtocol:"tcp",portRange:"25"},
            {name:"ICMP",ipProtocol:"icmp",portRange:""},
            {name:"DNS",ipProtocol:"udp",portRange:"53"},
            {name:"HTTP",ipProtocol:"tcp",portRange:"80"},
            {name:"POP3",ipProtocol:"tcp",portRange:"110"},
            {name:"IMAP",ipProtocol:"tcp",portRange:"143"},
            {name:"LDAP",ipProtocol:"tcp",portRange:"389"},
            {name:"HTTPS",ipProtocol:"tcp",portRange:"443"},
            {name:"SMTPS",ipProtocol:"tcp",portRange:"465"},
            {name:"IMAPS",ipProtocol:"tcp",portRange:"992"},
            {name:"POP3S",ipProtocol:"tcp",portRange:"995"},
            {name:"MS SQL",ipProtocol:"tcp",portRange:"1433"},
            {name:"MYSQL",ipProtocol:"tcp",portRange:"3306"},
        ];
        self.sources = [
            {name:"安全组ID",value:"sgId"},
            {name:"IP或CIDR",value:"cidr"},
        ];
        self.actions=[
            {name:"接受",value:"ACCEPT"},
            {name:"拒绝",value:"DROP"}
        ];
        //按钮的可操作性
        self.$watch(function() {
            return self.checkedItems;
        }, function(value) {
            self.prorm_btn = true;
            if(value && value.length){
                var countChk = 0;
                value.map(function(item) {
                    //所选云主机只有一个安全组的状态的个数
                    countChk += (item.sgInfo.length == 1) || 0;
                });
                if(countChk==0){
                    self.prorm_btn = false;
                }
            }
            
            
        });
        

        function instancesOfSecurityGroup(){
            //查询某一区域下的所有云主机
            instanceSrv.getVms(postData_1).then(function(result1) {
                if (result1 && result1.instanceSet && result1.instanceSet.length) {
                    //查询与安全组关联的云主机列表
                    instanceSrv.instancesOfSecurityGroup(postData_2).then(function(result2) {
                        if (result2 && result2.data) {
                            self.detailInfoTabledata = [];
                            result1.instanceSet.map(item1 =>{
                                result2.data.map(item2 =>{
                                    if(item2.instanceId == item1.unInstanceId){
                                        self.detailInfoTabledata.push(item1);
                                    }
                                })
                            });
                            if(self.detailInfoTabledata.length == 1){
                                self.tablerm_btn = true;
                            }else{
                                self.tablerm_btn = false;
                            }
                            self.tableParams = new NgTableParams({ count: 10 }, { counts: [], dataset:self.detailInfoTabledata});
                            checkedSrv.checkDo(self, self.detailInfoTabledata, "unInstanceId","tableParams");
                        }
                    });
                }
            });
        }
        self.basicConf =function(){
            self.onestep = true;
            self.twostep = false;
            self.threestep = false;
            instanceSrv.getSecurityGroups(postData).then(function(result){
                if(result && result.data){
                    self.allSecurityGroup = result.data;
                    self.detailInfo = result.data.filter(item => item.sgId == $routeParams.id)[0];
                }
            })
            instancesOfSecurityGroup();
        };
        function getgress(){
            instanceSrv.DescribeSecurityGroupPolicy(postData_2).then(function(result){
                if(result && result.data){
                    result.data.ingress.map(item => {
                        if(!item.ipProtocol){
                            item.ipProtocol = "All traffic";
                            if(!item.portRange){
                                item.portRange = ""
                            }
                        }else{
                            if(!item.portRange){
                                item.portRange = ""
                            }
                        }
                        if(!item.cidrIp && !item.sgId){
                            item.cidrIp = "0.0.0.0/0"
                        }

                    })
                    result.data.egress.map(item => {
                        if(!item.ipProtocol){
                             item.ipProtocol = "All traffic";
                             if(!item.portRange){
                                 item.portRange = ""
                             }
                        }else{
                            if(!item.portRange){
                                item.portRange = ""
                            }
                        }
                        if(!item.cidrIp && !item.sgId){
                             item.cidrIp = "0.0.0.0/0"
                        }
                     })
                    self.egress = result.data.egress;
                    self.ingress = result.data.ingress;
                }
            })
        }
        self.inbound = function(){
            self.onestep = false;
            self.twostep = true;
            self.threestep = false;
            self.editingress = false;
            self.ingress = [];
            self.addingressArray = [];
            getgress();
            
        }
        self.outbound = function(){
            self.onestep = false;
            self.twostep = false;
            self.threestep = true;
            self.editingress = false;
            self.egress =[];
            self.addingressArray = [];
            getgress()
            
        }
        self.basicConf();
        if($routeParams.type){
            self.inbound();
        }

        //新增入站规则
        self.addIngress = function(addingressArray){
            var ingress = {
                ipProtocolselect: self.ipProtocols[0],
                sourceselect:self.sources[0],
                securityselect:self.allSecurityGroup[0],
                actionselect:self.actions[0]
            }
            addingressArray.push(ingress)
        }
        self.confirmaddIngress = function(type){
            var post = [];
            self.addingressArray.map(item => {
                if(!item.isdel){
                    var param = {
                        "desc": item.desc,  
                        "action": item.actionselect.value
                    };
                    if(item.ipProtocolselect.ipProtocol){
                        param.ipProtocol = item.ipProtocolselect.ipProtocol
                    }
                    if(item.ipProtocolselect.portRange !=""){
                        param.portRange = item.ipProtocolselect.portRange;
                    }
                    if(item.sourceselect.value == "sgId"){
                        param.sgId = item.securityselect.sgId
                    }else{
                        param.cidrIp = item.cidrselect
                    }
                    post.push(param)
                }
            });
            self[type].map(item =>{
                if(!item.isdel){
                    var param = {
                        "desc": item.desc,  
                        "action": item.action.toLowerCase()
                    };
                    if(item.ipProtocol != "All traffic"){
                         param.ipProtocol = item.ipProtocol
                    }
                    if(item.portRange !=""){
                        param.portRange = item.portRange;
                    }
                    if(item.sgId){
                        param.sgId = item.sgId
                    }else{
                        param.cidrIp = item.cidrIp
                    }
                    post.push(param)
                }
            })
            if(type == 'ingress'){
                self.egress.map(item => {
                    if(item.ipProtocol == "All traffic") {
                        item.ipProtocol = ""
                    }
                })
                var postData = {
                    "Region": RegionID.Region(),
                    "sgId":$routeParams.id,
                    "ingress":post,
                    "egress":self.egress
                };
            }else if(type == 'egress'){
                self.ingress.map(item => {
                    if(item.ipProtocol == "All traffic") {
                        item.ipProtocol = ""
                    }
                })
                var postData = {
                    "Region": RegionID.Region(),
                    "sgId":$routeParams.id,
                    "egress":post,
                    "ingress":self.ingress
                };
            }
            //egress heingress不能同时为空
            if(postData.egress.length || postData.ingress.length ){
                instanceSrv.ModifySecurityGroupPolicy(postData).then(function(){
                    if(type == 'ingress'){
                        self.inbound();
                    }else if(type == 'egress'){
                        self.outbound() 
                    }
                    self.editingress = false;
                })
            }
        }
        //取消新增
        self.cancelIngress=function(addingressArray){
            self.editingress = false;
            var ingress = {
                ipProtocolselect: self.ipProtocols[0],
                sourceselect:self.sources[0],
                securityselect:self.allSecurityGroup[0],
                actionselect:self.actions[0]
            };
            addingressArray.shift(ingress);
        }


        //删除规则
        self.delingress = function(item){
            console.log(item);
            item.isdel = true;
        };
        self.recoveryingress = function(item){
            item.isdel = false;
        }

        //加入云主机
        self.joinvm = function(item){
            var scope = $rootScope.$new();
            var modalInstance =  $uibModal.open({
               animation: $scope.animationsEnabled,
               templateUrl: "joinvm.html",
               scope:scope
            });
            //获取云主机列表
            var postData_1 ={
                "Region": RegionID.Region()
            };
            var postData_2 ={
                "Region": RegionID.Region(),
                "sgId":item.sgId
            };
            scope.vm={};
            scope.checkboxes = {
                checked: false,
                vms: {},
                chk:{}
            };
            //将选中的同步到右边的table
            scope.listChek = function(){
                if (scope.vm.allVm && scope.vm.allVm.length){
                    _.forEach(scope.vm.allVm, function(item) {
                        if (scope.checkboxes.vms[item.unInstanceId]) {
                            scope.vm.checkVms.push(item);
                        }
                    });
                } ;
            };
            //监听左边的选中框
            scope.$watch(function() {
                return scope.checkboxes.vms;
            }, function() {
                //console.log(scope.checkboxes.vms);
                scope.vm.checkVms = [];
                //console.log(scope.vm.checkVms);
                scope.listChek();
            }, true)
            //过滤移除的
            scope.rmVmItem = function(value){
                return scope.vm.checkVms.filter(item => item.unInstanceId != value.unInstanceId)
            }
            //移除后还原被选中的
            scope.rmVm = function(item){
                scope.checkboxes.vms[item.unInstanceId] = false;
                scope.vm.checkVms = scope.rmVmItem(item);
            }
            //查询某一区域下的所有云主机
            instanceSrv.getVms(postData_1).then(function(result1) {
                if (result1 && result1.instanceSet && result1.instanceSet.length) {
                    //查询与安全组关联的云主机列表
                    instanceSrv.instancesOfSecurityGroup(postData_2).then(function(result2) {
                        if (result2 && result2.data) {
                            scope.vm.allVm = [];
                            result1.instanceSet.map(item1 =>{
                                var count = 0 
                                result2.data.map(item2 =>{
                                    if(item2.instanceId == item1.unInstanceId){
                                        count +=1;
                                    }
                                });
                                if(!count){
                                    scope.vm.allVm.push(item1)
                                }else{
                                    count +=1;
                                    scope.vm.allVm.push(item1);
                                    if(count==2){
                                        scope.checkboxes.vms[item1.unInstanceId]="";
                                    }                                  
                                }
                                scope.getState(item1);
                            })
                        }
                    });
                }
            });
            scope.getState=function(item1){
                if(scope.checkboxes.vms[item1.unInstanceId]===""){
                    return true;
                }else{
                    return false;
                }
            }
            scope.confirmJoinvm = function(){
               if(scope.vm.checkVms.length){
                   var insIds = [];
                   var postData = {};
                   scope.vm.checkVms.map(function(val){
                       postData[val.unInstanceId] = [$routeParams.id]
                   })
                   instanceSrv.ModifySecurityGroupsOfInstance({
                       "instanceSet":postData,
                       "Region":RegionID.Region()
                   }).then(function(){
                       instancesOfSecurityGroup()
                   })
               }
               modalInstance.close();
           };
        };
        self.rmvm = function(item){
            if(!self.prorm_btn || item.sgInfo>1){
                var scope = $rootScope.$new();
                var modalInstance =  $uibModal.open({
                   animation: $scope.animationsEnabled,
                   templateUrl: "rmvm.html",
                   scope:scope
                });
                scope.confirmrm = function(){
                    var insIds = [];
                    var postData = {};
                    item.map(function(val){
                        postData[val.unInstanceId] = [];
                        val.sgInfo.map(function(sg){
                            if(sg != $routeParams.id ){
                                postData[val.unInstanceId].push(sg)
                            }
                        })
                    })
                    instanceSrv.ModifySecurityGroupsOfInstance({
                       "instanceSet":postData,
                       "Region":RegionID.Region()
                    }).then(function(){
                       instancesOfSecurityGroup()
                    })
                   modalInstance.close();
               } 
            }
            
        }
        
    }]
);