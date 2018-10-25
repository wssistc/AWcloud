var commonFuncModule = angular.module("commonFuncModule", []);

commonFuncModule.service("commonFuncSrv", ['$rootScope','$http','$location','$translate','$route','$uibModal',"instancesSrv","checkQuotaSrv","routersSrv","checkedSrv","netTopoSrv","networksSrv","netfirewallSrv","regularSnapSrv",
function($rootScope,$http,$location,$translate,route,$uibModal,instancesSrv,checkQuotaSrv,routersSrv,checkedSrv,netTopoSrv,networksSrv,netfirewallSrv,regularSnapSrv) {
    return {
        setLoginViewPage:function(result){
            switch (localStorage.managementRole) {
                case "2":
                    if(result&&(result.status>=4||result.platformStatus>=2)){
                        $location.url("/system/grade?update=1").replace();
                        localStorage.loginUrl="/system/grade?update=1";
                    }else{
                        /*目前不管是多数据中心还是单数据中心都进入多数据中心*/
                        // if(localStorage.regionNum>1){
                            $location.path("/view").replace();
                            localStorage.loginUrl="/view";   
                        // }else{
                        //     $location.path("/single").replace();
                        //     localStorage.loginUrl="/single"; 
                        // }
                

                        //$location.url("/system/grade?update=1").replace();
                    }
                    break;
                case "3":
                    var menu = JSON.parse(localStorage.menuList);
                    var url;
                    for(let i=0;i<menu.length;i++){
                        if(menu[i].noShow==1){
                            if(menu[i].child&&menu[i].child.length>0){
                                if(menu[i].child[0].child&&menu[i].child[0].child.length>0){
                                    url = menu[i].child[0].child[0].href
                                }else{
                                    url= menu[i].child[0].href;
                                }
                            }else{
                                url = menu[i].href;
                            }
                            localStorage.loginUrl=url;
                            break;
                        }
                    }
                    $location.path(url).replace();
                    break;
                case "4":
                    /*if(result&&result.version=="2"){ 
                        $location.path("/cvm/cvmview").replace(); //企业版普通用户登录进来的页面
                    }else{
                        $location.path("/cvm/instances").replace(); //单机版普通用户登录进来的页面
                    }*/
                    //break;
                default:
                    if(localStorage.permission == "enterprise"){
                        var menu = JSON.parse(localStorage.menuList);
                        var url;
                        if(menu[0].child&&menu[0].child.length>0){
                            if(menu[0].child[0].child&&menu[0].child[0].child.length>0){
                                url = menu[0].child[0].child[0].href
                            }else{
                                url= menu[0].child[0].href;
                            }
                        }else{
                            url = menu[0].href;
                        }
                        localStorage.loginUrl=url;
                        $location.path(url).replace();
                        //$location.path("/cvm/cvmview").replace();
                        break;
                    }else{
                        var menu = JSON.parse(localStorage.menuList);
                        var url;
                        if(menu[0].child&&menu[0].child.length>0){
                            if(menu[0].child[0].child&&menu[0].child[0].child.length>0){
                                url = menu[0].child[0].child[0].href
                            }else{
                                url= menu[0].child[0].href;
                            }
                        }else{
                            url = menu[0].href;
                        }
                        localStorage.loginUrl=url;
                        $location.path(url).replace();
                        break;
                    }
            } 
        },
        settingIpFunc: function(self, paramObj, formName) {

            self.invalid = {};
            self.required = {};

            self.compareIpFun = function(startIp_list, endIp_list) {
                self[paramObj].min_num = {};
                self[paramObj].max_num = {};
                self[paramObj].placeholder = {};
                self[paramObj].readonly = {};
                // let startIp_list = item.subnets[item.sub_key].allocationPools[item.allocationPool_key].start.split(".");
                // let endIp_list = item.subnets[item.sub_key].allocationPools[item.allocationPool_key].end.split(".");

                for (let i = 0; i < 4; i++) {
                    self[paramObj].init_cidr["ip_" + i] = "";
                    //$("form[name="+formName+"]  #ip_" + [i]).removeAttr("readonly");
                    self[paramObj].readonly["ip_" + [i]] = false;
                    if (self.field_form && self.field_form[formName] && self.field_form[formName]["ip_" + i]) {
                        self.field_form[formName]["ip_" + i].$valid = true;
                    }
                    self.required["ip_" + i] = false;
                    self.invalid["ip_" + i] = false;
                }
                let index = -1;
                for (let i = 0; i < 3; i++) {
                    if (startIp_list[i] == endIp_list[i]) {
                        self[paramObj].init_cidr["ip_" + i] = startIp_list[i];
                        //$("form[name="+formName+"]  #ip_" + [i]).attr("readonly", "readonly");
                        self[paramObj].readonly["ip_" + [i]] = true;
                        index = i;
                    }
                }
                //$("#ip_" + [index + 1]).attr("placeholder", startIp_list[index + 1] + "~" + endIp_list[index + 1]);
                self[paramObj].placeholder["ip_" + [index + 1]] = startIp_list[index + 1] + "~" + endIp_list[index + 1];
                self[paramObj].min_num["ip_" + (index + 1)] = startIp_list[index + 1];
                self[paramObj].max_num["ip_" + (index + 1)] = endIp_list[index + 1];

                for (let i = (index + 2); i < 4; i++) {
                    if (i >= 4) {
                        return
                    }
                    //$("#ip_" + [i]).attr("placeholder", "0~255");
                    self[paramObj].placeholder["ip_" + [i]] = "0~255";
                    self[paramObj].min_num["ip_" + i] = 0;
                    self[paramObj].max_num["ip_" + i] = 255;
                }
                if (index > 0) {
                    for (let i = 0; i < index; i++) {
                        if (startIp_list[i] != endIp_list[i]) {
                            //$("#ip_" + [i]).attr("placeholder", startIp_list[i] + "~" + endIp_list[i]);
                            self[paramObj].placeholder["ip_" + [i]] = startIp_list[i] + "~" + endIp_list[i];
                            self[paramObj].min_num["ip_" + i] = startIp_list[i];
                            self[paramObj].max_num["ip_" + i] = endIp_list[i];
                        }
                    }
                }
            };

            self.checkValue = function(startIp, endIp) {
                let startIp_list = startIp.split(".");
                let endIp_list = endIp.split(".");

                let minStart = {
                    0: self[paramObj].init_cidr['ip_0'] == startIp_list[0],
                    1: self[paramObj].init_cidr['ip_0'] == startIp_list[0] && self[paramObj].init_cidr['ip_1'] == startIp_list[1],
                    2: self[paramObj].init_cidr['ip_0'] == startIp_list[0] && self[paramObj].init_cidr['ip_1'] == startIp_list[1] && self[paramObj].init_cidr['ip_2'] == startIp_list[2]
                };
                let maxEnd = {
                    0: self[paramObj].init_cidr['ip_0'] == endIp_list[0],
                    1: self[paramObj].init_cidr['ip_0'] == endIp_list[0] && self[paramObj].init_cidr['ip_1'] == endIp_list[1],
                    2: self[paramObj].init_cidr['ip_0'] == endIp_list[0] && self[paramObj].init_cidr['ip_1'] == endIp_list[1] && self[paramObj].init_cidr['ip_2'] == endIp_list[2]
                }

                for (let i = 0; i < 3; i++) {
                    // self[paramObj].min_num = {};
                    // self[paramObj].max_num = {};
                    if (minStart[i] && !maxEnd[i]) {
                        self[paramObj].min_num["ip_" + (i + 1)] = startIp_list[i + 1];
                        self[paramObj].max_num["ip_" + (i + 1)] = 255;
                        //$("#ip_" + (i + 1)).attr("placeholder", startIp_list[i + 1] + "~255");
                        self[paramObj].placeholder["ip_" + (i + 1)] = startIp_list[i + 1] + "~255";
                    }
                    if (!minStart[i] && maxEnd[i]) {
                        self[paramObj].min_num["ip_" + (i + 1)] = 0;
                        self[paramObj].max_num["ip_" + (i + 1)] = endIp_list[i + 1];
                        //$("#ip_" + (i + 1)).attr("placeholder", "0~" + endIp_list[i + 1]);
                        self[paramObj].placeholder["ip_" + (i + 1)] = "0~" + endIp_list[i + 1];
                    }
                    if (minStart[i] && maxEnd[i]) {
                        self[paramObj].min_num["ip_" + (i + 1)] = startIp_list[i + 1];
                        self[paramObj].max_num["ip_" + (i + 1)] = endIp_list[i + 1];
                        //$("#ip_" + (i + 1)).attr("placeholder", startIp_list[i + 1] + "~" + endIp_list[i + 1]);
                        self[paramObj].placeholder["ip_" + (i + 1)] = startIp_list[i + 1] + "~" + endIp_list[i + 1];
                    }
                    if (minStart[i] || maxEnd[i]) {
                        if (i < 2) {
                            for (let j = (i + 2); j < 4; j++) {
                                self[paramObj].min_num["ip_" + j] = 0;
                                self[paramObj].max_num["ip_" + j] = 255;
                                //$("#ip_" + j).attr("placeholder", "0~255");
                                self[paramObj].placeholder["ip_" + j] = "0~255";
                            }
                        }
                    }
                }

                var reg = new RegExp("^(0|[1-9][0-9]*)$");
                for (var i = 0; i < 4; i++) {
                    if (self[paramObj].init_cidr["ip_" + i]) {
                        self.required["ip_" + i] = false;
                        if (Number(self[paramObj].init_cidr["ip_" + i]) < Number(self[paramObj].min_num["ip_" + i]) ||
                            Number(self[paramObj].init_cidr["ip_" + i]) > Number(self[paramObj].max_num["ip_" + i]) ||
                            !reg.test(self[paramObj].init_cidr["ip_" + i])) {
                            self.invalid["ip_" + i] = true;
                            if (self.field_form && self.field_form[formName]) {
                                self.field_form[formName].$valid = false;
                            }
                        } else {
                            self.invalid["ip_" + i] = false;
                        }
                    } else {
                        self.required["ip_" + i] = true;
                        self.invalid["ip_" + i] = false;
                        if (self.field_form && self.field_form[formName]) {
                            self.field_form[formName].$valid = false;
                        }
                    }
                }
            };

            return self;
        },
        settingDomainPRoject:function(self,easy,from){
            self.getRoleFormUserInProject = function(){
                $http({
                   method: "GET",
                   url: "/awstack-user/v1/user/project/"+localStorage.projectUid+"/roles",
                   headers:self.initSetting_headers
               }).success(function(res){
                   if(res){
                       localStorage.rolename = res.roleName;
                   }
               })
            }
            self.changeCvmView = function() {
                self.tops = {
                    depart: { selected: "" },
                    deparList: [],
                    pro: { selected: "" },
                    projectsList: []
                };
                $http({
                    method: "GET",
                    url: "/awstack-user/v1/user/domains/projects",
                    headers:self.initSetting_headers
                }).success(function(res) {
                    //if($location.path().indexOf("cvm") == -1 && $location.path().indexOf("monitor") == -1 && easy!="easy"){return;}
                    if(res){
                       self.tops.deparList = res; 
                       for(var i=0;i<self.tops.deparList.length;i++){
                            if(self.tops.deparList[i].domainUid=='default'){
                                self.tops.deparList[i].disDomainName = '默认部门';
                            }else{
                                self.tops.deparList[i].disDomainName = self.tops.deparList[i].domainName;
                            }
                            if(self.tops.deparList[i].projects){
                                for(var j=0;j<self.tops.deparList[i].projects.length;j++){
                                    if(self.tops.deparList[i].projects[j].projectName == 'admin' && self.tops.deparList[i].domainUid=='default'){
                                        self.tops.deparList[i].projects[j].disProjectName = '默认项目';         
                                    }else{
                                        self.tops.deparList[i].projects[j].disProjectName = self.tops.deparList[i].projects[j].projectName;
                                    }
                                    
                                }
                            }
                        }
                        var domainName = localStorage.domainName;
                        if(from && from == "initSetting") {
                            domainName = localStorage.defaultdomainName;
                        }
                       self.tops.deparList.map(function(item) {
                            if (item.domainName == domainName) {
                                self.tops.depart.selected = item;
                            }
                        });
                        if(!localStorage.domainName){
                            self.tops.depart.selected = res[0];
                        }
                    }
                    self.tops.projectsList = self.tops.depart.selected.projects
                    self.tops.pro.selected = "";
                    if(self.tops.projectsList){
                        self.tops.pro.selected = self.tops.projectsList[0];
                        var projectId = localStorage.projectUid;
                        if(from && from == "initSetting") {
                            projectId = localStorage.defaultProjectUid;
                        }
                        self.tops.projectsList.map(function(item) {
                            if (item.projectId == projectId) {
                                self.tops.pro.selected = item;
                            }
                        });
                        self.changeproject(self.tops.pro.selected)
                    }
                });
            }
            self.changedepart = function(m) {
                self.tops.projectsList = m.projects;
                self.beyondQuota_pro = {}
                self.beyondQuota_dep = {}
                if(m.projects && m.projects.length){
                    self.tops.pro.selected = m.projects[0];
                }else{
                    self.tops.pro.selected = "";
                };
                if(self.tops.pro.selected&&self.tops.pro.selected.projectId){
                    checkQuotaSrv.checkQuota(self, "router",m.domainUid,self.tops.pro.selected.projectId);
                    checkQuotaSrv.checkQuota(self, "network",m.domainUid,self.tops.pro.selected.projectId);
                    checkQuotaSrv.checkQuota(self, "subnet",m.domainUid,self.tops.pro.selected.projectId);
                }
            };

            self.changeproject = function(n) {
                self.tops.pro.selected = n;
                checkQuotaSrv.checkQuota(self, "router",self.tops.depart.selected.domainUid,n.projectId);
                checkQuotaSrv.checkQuota(self, "network",self.tops.depart.selected.domainUid,n.projectId);
                checkQuotaSrv.checkQuota(self, "subnet",self.tops.depart.selected.domainUid,n.projectId);

            };
            return self;

            
        },
        insNetworkFunc: function(self, paramObj, formName,instancesSrv) {
            self[paramObj] = {
                assignIP: false,
                init_cidr: {
                    ip_0: "",
                    ip_1: "",
                    ip_2: "",
                    ip_3: ""
                },
                field_form: {}
            };
            self.field_form = {};
            self.interacted = function(field) {
                self.field_form[formName] = field;
                return self.submitInValid || field.ip_0.$dirty || field.ip_1.$dirty || field.ip_2.$dirty || field.ip_3.$dirty;
            };

            self = this.settingIpFunc(self, paramObj, formName);
            self.setCheckValueFunc = function() {
                let net = self[paramObj].subSegment;
                let startIp = net.subnets[net.sub_key].allocationPools[net.allocationPool_key].start;
                let endIp = net.subnets[net.sub_key].allocationPools[net.allocationPool_key].end;
                self.checkValue(startIp, endIp)
            };

            self.changeNet = function(net) {
                self.subSegmentList = [];
                _.each(self.insForm.networkList_extend, function(item) {
                    if (item.id == net.id) {
                        item.sub_name = item.net_sub_name.split("---")[1];
                        self.subSegmentList.push(item);
                    }
                });
                self[paramObj].subSegment = self.subSegmentList[0];
                self.changeSubSegment(self[paramObj].subSegment);
            };

            self.changeSubSegment = function(net) {
                self[paramObj] = {
                    selected: self[paramObj].selected,
                    assignIP: self[paramObj].assignIP,
                    init_cidr: {
                        ip_0: "",
                        ip_1: "",
                        ip_2: "",
                        ip_3: ""
                    },
                    subSegment: self[paramObj].subSegment,
                    field_form: {}
                };
                let startIp_list = net.subnets[net.sub_key].allocationPools[net.allocationPool_key].start.split(".");
                let endIp_list = net.subnets[net.sub_key].allocationPools[net.allocationPool_key].end.split(".");
                self.compareIpFun(startIp_list, endIp_list);
            };

            self.mouseNet = function(network, type) {
                self.insForm.net_subSegDetail = angular.copy(self.insForm.networkList_extend);
                _.map(self.insForm.net_subSegDetail, function(item) {
                    if (item.id == network.id) {
                        item.sub_name = item.net_sub_name.split("---")[1];
                        if (type == "over") {
                            item.showSubSegDetail = true;
                        } else {
                            item.showSubSegDetail = false;
                        }
                        return item
                    }
                });
            };
            //获取网络数据
            instancesSrv.getProjectNetwork().then(function(result) {
                if (result && result.data && angular.isArray(result.data)) {
                    self.insForm.networkList = result.data.filter(function(item) {
                        return item.subnets.length; //没有绑定子网的交换机创建云主机时不能使用
                    });
                    self.insForm.externalNetwork = self.insForm.networkList.filter(item => {
                        return item.external;
                    });
                    self.insForm.privateNetwork = self.insForm.networkList.filter(item => {
                        return !item.external;
                    });
                    self.insForm.networkList_extend = [];
                    _.each(self.insForm.networkList, function(item) {
                        //创建网络时一个交换机对应一个子网的限制放开，一个交换机可以有多个子网，一个子网又可以有多个IP地址池
                        for (let i = 0; i < item.subnets.length; i++) {
                            for (let j = 0; j < item.subnets[i].allocationPools.length; j++) {
                                item.net_sub_name = item.name + "---" + item.subnets[i].name + "(" + item.subnets[i].allocationPools[j].start + "~" + item.subnets[i].allocationPools[j].end + ")";
                                item.subnetName = item.subnets[i].name;
                                item.subIpSegment = item.subnets[i].allocationPools[j].start + "~" + item.subnets[i].allocationPools[j].end;
                                item.sub_key = i;
                                item.allocationPool_key = j;
                                self.insForm.networkList_extend.push(angular.copy(item));
                            }
                        }
                    });

                    if (self.insForm.networkList.length) {
                        self[paramObj].selected = self.insForm.networkList[0];
                        self.subSegmentList = [];
                        _.each(self.insForm.networkList_extend, function(item) {
                            if (item.id == self[paramObj].selected.id) {
                                item.sub_name = item.net_sub_name.split("---")[1];
                                self.subSegmentList.push(item);
                            }
                        });
                        self[paramObj].subSegment = self.subSegmentList[0];
                        let net = self[paramObj].subSegment;
                        let startIp_list = net.subnets[net.sub_key].allocationPools[net.allocationPool_key].start.split(".");
                        let endIp_list = net.subnets[net.sub_key].allocationPools[net.allocationPool_key].end.split(".");
                        self.compareIpFun(startIp_list, endIp_list);
                    }

                }
            });
            return self;
        },
        setAssignIpFun: function(scope, form, formName, netType) {
            localStorage.managementRole != 2 ? self.isSuperAdmin = false : self.isSuperAdmin = true;
            let subnetsList_extend = [];
            let startIp = "";
            let endIp = "";
            scope[form] = {
                selectedNetType: "",
                selectedNet: "",
                selectedSubnet: "",
                selectedSubPool: "",
                assignSub: false,
                assignIP: false,
                init_cidr: {
                    ip_0: "",
                    ip_1: "",
                    ip_2: "",
                    ip_3: ""
                },
                repeatIp: false
            };
            if(self.isSuperAdmin){
               //网络类型
                scope.netTypeList = [{
                    "name": "私有",
                    "value": "private"
                },{
                    "name": "公有",
                    "value": "external"
                }]; 
            }else{
                scope.netTypeList = [{
                    "name": "私有",
                    "value": "private"
                }]; 
            }
            
            scope[form].selectedNetType = scope.netTypeList[0];
            scope.extNets = {
                options: [],
                selected: ""
            };
            scope.selectedSubPoolList = [];

            scope.field_form = {};
            scope.submitted = false;
            scope.interacted = function(field) {
                scope.field_form[formName] = field;
                if(field && field.ip_0 && field.ip_1 && field.ip_2 && field.ip_3){
                    return scope.submitted || field.ip_0.$dirty || field.ip_1.$dirty || field.ip_2.$dirty || field.ip_3.$dirty;
                }
                
            };

            scope = this.settingIpFunc(scope, form, formName)

            scope.getExtendSubList = function(subnets) {
                let subnets_extend = [];
                _.each(subnets, function(item) {
                    for (let i = 0; i < item.allocationPools.length; i++) {
                        item.sub_pool = item.name + " : " + item.allocationPools[i].start + " ~ " + item.allocationPools[i].end;
                        item.allocationPool_key = i;
                        subnets_extend.push(angular.copy(item));
                    }
                });
                return subnets_extend;
            };

            scope.setSubPoolFunc = function() {
                scope.selectedSubPoolList.splice(0, scope.selectedSubPoolList.length);
                _.each(subnetsList_extend, item => {
                    if (item.id == scope[form].selectedSubnet.id) {
                        scope.selectedSubPoolList.push(item);
                    }
                });
                scope[form].selectedSubPool = scope.selectedSubPoolList[0];

                let subnet = scope[form].selectedSubPool;
                startIp = subnet.allocationPools[subnet.allocationPool_key].start;
                endIp = subnet.allocationPools[subnet.allocationPool_key].end;

                let startIp_list = startIp.split(".");
                let endIp_list = endIp.split(".");
                scope.compareIpFun(startIp_list, endIp_list);
            };

            scope.changeExtNet = function(extNet) {
                scope.subnets = extNet.subnets;
                scope[form].selectedSubnet = extNet.subnets[0];
                subnetsList_extend = scope.getExtendSubList(scope.subnets);
                scope.setSubPoolFunc();
                scope.checkValue(startIp, endIp);
            };

            scope.changeSubnet = function(subnet) {
                scope.setSubPoolFunc();
                scope.checkValue(startIp, endIp);
            };

            scope.changeSubPool = function(subnet) {
                let startIp = subnet.allocationPools[subnet.allocationPool_key].start;
                let endIp = subnet.allocationPools[subnet.allocationPool_key].end;
                scope.compareIpFun(startIp.split("."), endIp.split("."));
                scope.checkValue(startIp, endIp);
            };

            scope.mouseSub = function(sub, type) {
                scope.subPool_detail = angular.copy(subnetsList_extend);
                _.map(scope.subPool_detail, item => {
                    if (item.id == sub.id) {
                        if (type == "over") {
                            item.showSubSegDetail = true;
                        } else {
                            item.showSubSegDetail = false;
                        }
                        return item;
                    }
                })
            };

            scope.setCheckValueFunc = function() {
                let subnet = scope[form].selectedSubPool;
                let startIp = subnet.allocationPools[subnet.allocationPool_key].start;
                let endIp = subnet.allocationPools[subnet.allocationPool_key].end;
                scope.checkValue(startIp, endIp);
            };

            scope.changeNetType = function(netType) {
                if (netType.value == "external") {
                    scope[form].networkList = scope.extNets.options;
                    scope[form].selectedNet = scope.extNets.options[0];
                } else {
                    scope[form].networkList = scope.privateNetList;
                    scope[form].selectedNet = scope[form].networkList[0];
                }
                scope.subnets = scope[form].selectedNet.subnets;
                scope[form].selectedSubnet = scope.subnets[0];
                scope.changeExtNet(scope[form].selectedNet);
            };
            if (netType == "external") {
                routersSrv.getExtNets(self.initSetting_headers).then(function(res) {
                    if (res && res.data) {
                        scope.extNets.options = res.data.filter(function(item){
                            return item.subnets.length!=0;
                        });
                        scope[form].networkList = scope.extNets.options;
                        scope[form].selectedNet = scope[form].networkList[0];
                        scope.subnets = scope[form].selectedNet.subnets;
                        scope[form].selectedSubnet = scope.subnets[0];
                        subnetsList_extend = scope.getExtendSubList(scope[form].selectedNet.subnets);
                        scope.setSubPoolFunc();
                    }
                });
            }else{
                instancesSrv.getProjectNetwork(self.initSetting_headers).then(function(res) {
                    if (res && res.data) {
                        scope.extNets.options = res.data.filter(item => {
                            return item.external&&item.subnets.length!=0;
                        });
                        scope.privateNetList = res.data.filter(item => {
                            return !item.external&&item.subnets.length!=0;
                        });
                        scope.privateNetList.forEach(function(item){
                            item.subnets=item.subnets.filter(function(subnet){
                                return subnet.ipVersion=='4';
                            });
                        });
                        if(netType == "private") {
                            scope[form].networkList = scope.privateNetList.filter(function(item){
                                return item.subnets.length!=0;
                            });
                        }else{
                            scope[form].networkList = res.data.filter(function(item){
                                return item.subnets.length!=0;
                            }); 
                        }
                        scope[form].selectedNet = scope[form].networkList[0];
                        if(!scope[form].selectedNet) return ;
                        scope.subnets = scope[form].selectedNet.subnets;
                        scope[form].selectedSubnet = scope.subnets[0];
                        subnetsList_extend = scope.getExtendSubList(scope[form].selectedNet.subnets);
                        scope.setSubPoolFunc();
                    }
                });
            }

            return scope;
        },
        miliFormat: function() {
            let DIGIT_PATTERN = /(^|\s)\d+(?=\.?\d*($|\s))/g
            let MILI_PATTERN = /(?=(?!\b)(\d{3})+\.?\b)/g
            return (num) => num && num.toString()
                .replace(DIGIT_PATTERN, (m) => m.replace(MILI_PATTERN, ','));
        },
        deleteInstance: function(self, ids, delData) {
            self.allNoHostId = false;
            delData.map(item => {
                if(!item.hostId){
                    self.allNoHostId = true;
                }
            })
            let delTaskBatch = function(data){
                var jobids = data;
                if(data && data.length){
                    regularSnapSrv.delTaskBatch({ids:data}).then(function(){
                    })
                }
            }
            let emitDel = function(show_del_job_tip, data, type) {
                var scope = self.$new();
                var modal_os_delete = $uibModal.open({
                    animation: true,
                    templateUrl: "js/commonModal/tmpl/os-delete.html",
                    scope: scope
                });
                //弹性扩展的云主机提示不能删除
                // scope.hasElastic = delData.reduce((list, vm) => {
                //     vm.description && vm.description.indexOf("elastic expansion created") > -1 && list.push(vm);
                //     return list;
                // }, []);
                if ($location.path() == "/cvm/netTopo") {
                    netTopoSrv.getVmDetail(delData[0].id).then(function(res) {
                        if (res && res.data && res.data instanceof Object) {
                            scope.canDelSysDistRedio = [res.data].some(function(item) {
                                return item.startStyle == "Local"
                            });
                        }
                    });
                } else {
                    scope.canDelSysDistRedio = delData.some(function(item) {
                        return item.startStyle == "Local"
                    });
                }

                scope.show_del_job_tip = show_del_job_tip;
                scope.del = {
                    "job": data,
                    "flag": true
                };
                if(self.allNoHostId){
                    scope.del.flag = false;
                }
                scope.confirmDel = function() {
                    checkedSrv.setChkIds(ids, "delete")
                    if (type == "instance-soft-delete") {
                        if (show_del_job_tip) {
                            delTaskBatch(scope.del.job)
                        }
                        instancesSrv.delServer({
                            ids: ids
                        }, scope.del.flag).then(function() {

                        });
                    } else if (type == "instance-force-delete") {
                        if (show_del_job_tip) {
                            delTaskBatch(scope.del.job)
                        }
                        instancesSrv.osForceDel({
                            ids: ids
                        }).then(function() {

                        });
                    }
                    modal_os_delete.close()
                };
            };

            let checkScheduleJob = function(scope, data, volume_id, type) { //scope作用域，data云主机id数组，volume_id云硬盘id，type操作类型
                scope.show_del_job_tip = false;
                scope.getJobs = false;
                scope.jobIds = [];
                var checkData = {
                    serverIds: data.uid
                }
                if (type == "volume") {
                    checkData.volumeId = volume_id;
                    checkData.serverIds = [data.uid];
                }
                instancesSrv.checkSheduleJob(checkData).then(function(result) {
                    if (result && result.data) {
                        scope.jobIds = result.data;
                        scope.getJobs = true;
                        scope.show_del_job_tip = Boolean(result.data.length);
                        if (type == "instance-soft-delete" || type == "instance-force-delete") {
                            emitDel(scope.show_del_job_tip, result.data, type)
                        }
                    }
                });
            };

            let params = {
                uid: ids
            };
            //判断该主机下是否有定时快照
            checkScheduleJob(self, params, "", "instance-soft-delete");
        },
        deleteSubnet: function(self, delData) {
            let content = {
                target: "delSubnet",
                msg: "<span>" + $translate.instant("aws.networks.del.subMsg") + "</span>",
                data: delData
            };
            self.$emit("delete", content);

            self.$on("delSubnet", function(e, data,delScope) {
                if (!e.defaultPrevented) {
                    let del_obj_ids = [],
                        names = [];
                    _.forEach(data, function(item) {
                        del_obj_ids.push(item.id);
                        names.push(item.name);
                    });
                    //不让重复点击删除按钮
                    delScope.notDel=true;
                    networksSrv.delSubnetAction({
                        subnets_list: del_obj_ids,
                        names: names
                    }).then(function() {
                        if ($location.path() == "/cvm/netTopo") {
                            $rootScope.initEditedTopo();
                        } else {
                            //两层弹出框同时关闭
                            self.delSubnetModel.close();
                            //$rootScope.refreshSubnetsTable();
                            $rootScope.refreshNetworksTable();
                        }
                    });
                }
                e.defaultPrevented = true;
            });
        },
        deleteRouter: function(self, delData) {
            let content = {
                target: "delRouter",
                msg: "<span>" + $translate.instant("aws.routers.del.delRouterMsg") + "</span>",
                data: delData
            };
            self.$emit("delete", content);

            self.$on("delRouter", function(e, data,delScope) {
                if (!e.defaultPrevented) {
                    let del_obj_ids = [];
                    _.forEach(data, function(item) {
                        del_obj_ids.push(item.id);
                    });
                    let delParams = {
                        routers_list: del_obj_ids
                    };
                    //不让重复点击删除按钮
                    delScope.notDel=true;
                    routersSrv.delRouterAction(delParams).then(function() {
                        if ($location.path() == "/cvm/netTopo") {
                            $rootScope.initEditedTopo();
                        } else {
                            self.refreshRoutersTable();
                        }
                    });
                }
                e.defaultPrevented = true;
            });
        },
        deleteFirewall: function(self, delData) {
            let content = {
                target: "deleteNetfirewall",
                msg: "<span>" + $translate.instant("aws.networks.del.delFirewallMsg") + "</span>",
                data: delData
            };
            self.$emit("delete", content);

            self.$on("deleteNetfirewall", function(e, data) {
                if (!e.defaultPrevented) {
                    let del_obj_ids = [];
                    self.firewallDeleting = true;
                    _.each(data, function(item) {
                        del_obj_ids.push(item.id || item.firewall_id);
                    });
                    netfirewallSrv.deleteFirewall({
                        "id": del_obj_ids
                    }).then(function() {
                        if ($location.path() == "/cvm/netTopo") {
                            $rootScope.initEditedTopo();
                        } else {
                            self.refreshNetFirewallTable();
                        }
                    }).finally(function() {
                        self.firewallDeleting = false;
                    });
                }
                e.defaultPrevented = true;
            });
        },
        deleteNetwork: function(self, delData) {
            let content = {
                target: "delNetwork",
                msg: "<span>" + $translate.instant("aws.networks.del.netMsg") + "</span>",
                data: delData
            };
            self.$emit("delete", content);

            self.$on("delNetwork", function(e, data) {
                if (!e.defaultPrevented) {
                    let del_obj_ids = [],
                        names = [];
                    _.forEach(data, function(item) {
                        del_obj_ids.push(item.id);
                        names.push(item.name);
                    });
                    networksSrv.delNetworkAction({
                        networks_list: del_obj_ids,
                        names: names
                    }).then(function() {
                        if ($location.path() == "/cvm/netTopo") {
                            $rootScope.initEditedTopo();
                        } else {
                            self.refreshNetworkTable();
                        }
                    });
                }
                e.defaultPrevented = true;
            });
        }
    };
}]);