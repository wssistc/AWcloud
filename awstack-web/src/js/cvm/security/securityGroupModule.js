import "./securityGroupSrv";

var securityGroupModule = angular.module("securityGroupModule", ["securityGroupSrvModule"]);
securityGroupModule.controller("firewallCtrl", ["$rootScope", "$scope", "NgTableParams", "securityGroupSrv", "checkedSrv", "newCheckedSrv","checkQuotaSrv", "$uibModal", "$translate", "GLOBAL_CONFIG", "$routeParams", "$filter",
    function($rootScope, $scope, NgTableParams, securityGroupSrv, checkedSrv,newCheckedSrv, checkQuotaSrv, $uibModal, $translate, GLOBAL_CONFIG, $routeParams, filter) {
        var self = $scope;
        self.headers = {
            "firewallName": $translate.instant("aws.security.securityGroupName"),
            "description": $translate.instant("aws.security.description"),
            "direction": $translate.instant("aws.security.direction"),
            "inputType": $translate.instant("aws.security.inputType"),
            "ip_protocol": $translate.instant("aws.security.ip_protocol"),
            "portRange": $translate.instant("aws.security.portRange"),
            "target": $translate.instant("aws.security.target"),
            "sourceType": $translate.instant("aws.security.sourceType"),
            "typeCodeValue": $translate.instant("aws.security.typeCodeValue")
        };

        var initSecurityGroupData = function(data) {
            self.securityGroupTable = new NgTableParams({
                page: 1,
                count: GLOBAL_CONFIG.PAGESIZE,
                sorting: {
                    firewall: "asc"
                }
            }, {
                counts: [],
                dataset: data
            });

            self.securityGroup_chkboxs = {
                checked: false,
                items: {}
            };

            self.$watch(function() {
                return self.securityGroupTable.page();
            }, function() {
                self.securityGroup_chkboxs = {
                    checked: false,
                    items: {}
                };
            });

            self.$watch(function() {
                return self.securityGroup_chkboxs.checked;
            }, function(value) {
                angular.forEach(self.securityGroupTable.data.filter(item => item.name != "default"), function(item) {
                    self.securityGroup_chkboxs.items[item.id] = value;
                });
            });

            self.$watch(function() {
                return self.securityGroup_chkboxs.items;
            }, function() {
                //if (self.securityGroupTable.data.length === 0) return;
                securityGroupSrv.selectedItemsData = [];
                var checked = 0,
                    unchecked = 0,
                    total = self.securityGroupTable.data.length - 1;

                angular.forEach(self.securityGroupTable.data.filter(item => item.name != "default"), function(item) {
                    checked += (self.securityGroup_chkboxs.items[item.id]) || 0;
                    unchecked += (!self.securityGroup_chkboxs.items[item.id]) || 0;
                    if (self.securityGroup_chkboxs.items[item.id]) {
                        securityGroupSrv.selectedItemsData.push(item);
                        securityGroupSrv.editData = angular.copy(item);
                    }
                });

                // if ((unchecked == 0) || (checked == 0)) {
                //     if (total > 0) {
                //         self.securityGroup_chkboxs.checked = (checked == total);
                //     }
                // }
                self.canEdit = false;
                self.canDel = false;
                if (checked === 1) {
                    if (securityGroupSrv.editData.name == "default") {
                        self.canEdit = false;
                        self.canDel = false;
                    } else {
                        self.canEdit = true;
                        self.canDel = true;
                    }
                } else if (checked > 1) {
                    self.canEdit = false;
                    self.canDel = true;
                } else {
                    self.canEdit = false;
                    self.canDel = false;
                }
                angular.element(".select-all-securityGroupTable").prop("indeterminate", (checked != 0 && unchecked != 0));
                if(checked>0&&unchecked==0){
                    self.securityGroup_chkboxs.checked = true;
                }else if(checked==0&&unchecked>0){
                    self.securityGroup_chkboxs.checked = false;
                }
            }, true);
        };

        //安全组列表
        var initSecurityGroupTable = function() {
            self.securityGroup_name = [];
            securityGroupSrv.getFirewallTableData().then(function(result) {
                self.globalSearchTerm = "";
                result ? self.loadData = true : "";
                if (result && result.data) {
                    result.data.map(function(item){
                        item.searchTerm = [item.name,item.description].join(',');
                    })
                    securityGroupSrv.securityGroupTableData = result.data;
                    /*存下所有已有的安全组名*/
                    result.data.forEach(function(item) {
                        self.securityGroup_name.push(item.name)
                    })
                    initSecurityGroupData(result.data);
                }

            });
        };
        initSecurityGroupTable();

        self.refreshSecurityGroup = function() {
            initSecurityGroupTable();
        };

        self.applyGlobalSearch = function() {
            var term = self.globalSearchTerm;
            self.securityGroupTable.filter({
               searchTerm: term
            });
        };

        //新建 、编辑 安全组
        self.updateSecurityGroup = function(type) {
            var scope = self.$new();
            var securityGroupModal = $uibModal.open({
                animation: true,
                templateUrl: "securityGroupModal.html",
                scope: scope
            });

            scope.submitted = false;
            scope.interacted = function(field) {
                scope.field_form = field;
                return scope.submitted || field.firewallName.$dirty || field.description.$dirty;
            };
            scope.securityGroupForm = {
                name: "",
                description: ""
            };
            /*检验安全组名是否已存在*/
            self.NameCheck = false;
            self.checkedName = function(value) {
                self.NameCheck = false;
                if (self.securityGroup_name.length) {
                    for (var i = 0; i < self.securityGroup_name.length; i++) {
                        if (self.securityGroup_name[i] == value) {
                            self.NameCheck = true;
                            break;
                        }
                    }
                }

            }
            switch (type) {
                case "new":
                    initSecurityGroupTable()
                    if (localStorage.permission == "enterprise") {
                        checkQuotaSrv.checkQuota(scope, "security_group");
                    }
                    scope.securityGroupModal_title = $translate.instant("aws.security.createSecurityGroup");
                    scope.editSecurityGroup = false;
                    scope.securityGroupConfirm = function() {
                        if (scope.field_form.$valid && !self.NameCheck) {
                            let params = {
                                name: scope.securityGroupForm.name,
                                description: scope.securityGroupForm.description ? scope.securityGroupForm.description : ""
                            };
                            scope.formSubmitted = true;
                            securityGroupSrv.addFirewallAction(params).then(function() {
                                initSecurityGroupTable();
                            });
                            securityGroupModal.close();
                        } else {
                            scope.submitted = true;
                        }
                    };
                    break;

                case "edit":
                    /*编辑时过滤掉本身的名字*/
                    self.securityGroup_name = self.securityGroup_name.filter(item => {
                        return item != securityGroupSrv.editData.name
                    })
                    scope.securityGroupModal_title = $translate.instant("aws.security.editSecurityGroup");
                    scope.editSecurityGroup = true;
                    scope.securityGroupForm = angular.copy(securityGroupSrv.editData);
                    scope.securityGroupConfirm = function() {
                        if (scope.field_form.$valid && !self.NameCheck) {
                            let params = {
                                name: scope.securityGroupForm.name,
                                description: scope.securityGroupForm.description ? scope.securityGroupForm.description : "",
                                groupId: securityGroupSrv.editData.id
                            };
                            scope.formSubmitted = true;
                            securityGroupSrv.editFirewallAction(params).then(function() {
                                initSecurityGroupTable();
                            });
                            securityGroupModal.close();
                        } else {
                            scope.submitted = true;
                        }
                    };
                    break;
            }
            // securityGroupModal.closed.then(function(){
            //     initSecurityGroupData();
            // });
        };

        //删除防火墙
        self.deleteSecurityGroups = function() {
            var content = {
                target: "delSecurityGroup",
                msg: "<span>" + $translate.instant("aws.security.delSecurityGroup") + "</span>"
            };
            self.$emit("delete", content);
        };
        self.$on("delSecurityGroup", function() {
            var del_obj_ids = [];
            var del_obj_names = [];
            _.forEach(securityGroupSrv.selectedItemsData, function(item) {
                if (item.name != "default") {
                    del_obj_ids.push(item.id);
                    del_obj_names.push(item.name)
                }
            });
            securityGroupSrv.delFirewallAction({
                ids: del_obj_ids,
                names: del_obj_names
            }).then(function() {
                initSecurityGroupTable();
            });
        });

        //防火墙详情列表
        var initSecurityGroupRuleTable = function(securityGroup_id) {
            securityGroupSrv.getFirewallRuleDetail(securityGroup_id).then(function(result) {
                if($routeParams.id!=securityGroup_id){return;}
                result ? self.securityDetailData = true : "";
                if (result && result.data) {
                    var data = _.map(result.data, function(item) {
                        if (item.direction == "ingress") {
                            item.direc = $translate.instant("aws.security.ingress");
                        }
                        if (item.direction == "egress") {
                            item.direc = $translate.instant("aws.security.egress");
                        }
                        item.ipProtocol = item.ipProtocol ? item.ipProtocol : $translate.instant("aws.security.any");
                        item._ipProtocol = item.ipProtocol == "icmp" ? item.fromPort + " / " + item.toPort : " - ";
                        item.sourceType = item.cidr || item.parentGroupName || $translate.instant("aws.security.any");
                        //item.searchTerm = [item.direc,item.ethertype,item.ipProtocol,item.fromPort+"-"+item.toPort+item._ipProtocol+item.sourceType].join(',');
                        return item;
                    });
                    self.secDetailSearchTearm({"titleData":self.secDetailTitleData,"tableData":data});
                    self.tableParams = new NgTableParams({
                        count: GLOBAL_CONFIG.PAGESIZE
                    }, {
                        counts: [],
                        dataset: data
                    });
                    self.applyDetailSearch = function(firewallDetailSearchTerm) {
                        var term = firewallDetailSearchTerm;
                        self.tableParams.filter({
                            searchTerm: term
                        });
                    };
                    checkedSrv.checkDo(self, data, "id");
                }
            });
        };

        $scope.$on("getDetail", function(event, securityGroup_id) {
            self.securityDetailData = false;
            self.tableParams = new NgTableParams({
                count: GLOBAL_CONFIG.PAGESIZE
            }, {
                counts: [],
                dataset: []
            });
            self.secDetailTitleName = "secDetail";
            if (sessionStorage["secDetail"]) {
                self.secDetailTitleData = JSON.parse(sessionStorage["secDetail"]);
            } else {
                self.secDetailTitleData = [{
                    name: 'security.direction',
                    value: true,
                    disable: true,
                    search: 'direc'
                }, {
                    name: 'security.inputType',
                    value: true,
                    disable: false,
                    search: 'ethertype'
                }, {
                    name: 'security.ip_protocol',
                    value: true,
                    disable: false,
                    search: 'ipProtocol'
                }, {
                    name: 'security.portRange',
                    value: true,
                    disable: false,
                    search: 'portRange'
                }, {
                    name: 'security.typeCodeValue',
                    value: true,
                    disable: false,
                    search: '_ipProtocol'
                }, {
                    name: 'security.sourceType',
                    value: true,
                    disable: false,
                    search: 'sourceType'
                }];
                sessionStorage.setItem(self.secDetailTitleName,JSON.stringify(self.secDetailTitleData));
            };

            self.secDetailSearchTearm = function(obj) {
                var tableData = obj.tableData;
                var titleData = obj.titleData;
                tableData.map(function(item) {
                    item.searchTerm = "";
                    titleData.forEach(function(showTitle) {
                        if (showTitle.value) {
                            if (showTitle.search == 'portRange') {
                                item.searchTerm += (item.fromPort + "-" + item.toPort +"\b");
                            } else {
                                item.searchTerm += item[showTitle.search] +"\b";
                            }
                        }
                    });
                });
            };
            initSecurityGroupRuleTable(securityGroup_id);
        });
        self.firewallDetailSearchTerm = {
            SearchTerm:""
        };
        //防火墙详情页刷新
        self.refreshSecurityGroupDetail = function() {
            self.firewallDetailSearchTerm = {
                SearchTerm:""
            };
            self.applyDetailSearch()
            initSecurityGroupRuleTable($routeParams.id);
        };

        //防火墙详情页面新建防火墙规则
        self.addSecurityGroupRule = function() {
            var scope = self.$new();
            var addSecurityGroupRuleModal = $uibModal.open({
                animation: true,
                templateUrl: "addSecurityGroupRule.html",
                scope: scope
            });
            if (localStorage.permission == "enterprise") {
                checkQuotaSrv.checkQuota(scope, "security_group_rule");
            }
            scope.submitted = false;
            scope.interactedPort = function(field) {
                scope.field_form = field;
                return scope.submitted || field.port.$dirty;
            };
            scope.interactedPortRange = function(field) {
                scope.field_form = field;
                return scope.submitted || field.fromPort.$dirty || field.toPort.$dirty;
            };
            scope.interactedProtocol = function(field) {
                scope.field_form = field;
                return scope.submitted || field.protocol.$dirty;
            };
            scope.securityGroupRule = {
                cidr: "0.0.0.0/0",
                way: "cidr"
            };
            addSecurityGroupRuleModal.opened.then(function() {
                scope.allIcmpShow = true;
                scope.securityGroupRules = {
                    options: [{
                        name: "TCP",
                        value: "tcp"
                    }, {
                        name: "UDP",
                        value: "udp"
                    }, {
                        name: "ICMP",
                        value: "icmp"
                    }, {
                        name: "ALL ICMP",
                        value: "icmp"
                    }, {
                        name: "其他协议",
                        value: "else"
                    }]
                };
                scope.securityGroupRule.selectedRule = scope.securityGroupRules.options[0];

                scope.directions = {
                    options: [{
                        name: $translate.instant("aws.security.ingress"),
                        value: "ingress"
                    }, {
                        name: $translate.instant("aws.security.egress"),
                        value: "egress"
                    }]
                };
                scope.securityGroupRule.direction = scope.directions.options[0];

                scope.portTypes = {
                    options: [{
                        name: $translate.instant("aws.security.assignPort"),
                        value: "port"
                    }, {
                        name: $translate.instant("aws.security.portRange"),
                        value: "portRange"
                    }]
                };
                scope.securityGroupRule.portType = scope.portTypes.options[0];

                scope.changeRule = function(rule) {
                    scope.submitted = false;
                    if (scope.field_form.fromPort && scope.field_form.toPort) {
                        scope.field_form.fromPort.$dirty = false;
                        scope.field_form.toPort.$dirty = false;
                    }
                    if (rule.name == "ALL ICMP" && rule.value == "icmp") {
                        scope.allIcmpShow = false;
                    } else {
                        scope.allIcmpShow = true;
                    }
                    if (rule.name == "ICMP" && rule.value == "icmp") {
                        scope.isIcmp = true;
                        scope.isPort = false;
                        scope.isPortRange = false;
                        scope.types = {
                            options: ["0", "3", "4", "5", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "30"]
                        };
                        scope.securityGroupRule.from_port = scope.types.options[0];

                        scope.codings = {
                            options: ["0"]
                        };
                        scope.securityGroupRule.to_port = scope.codings.options[0];
                    } else {
                        scope.isIcmp = false;
                        scope.isPort = true;
                        scope.securityGroupRule.portType = scope.portTypes.options[0];
                    }
                    if (rule.value == "else") {
                        scope.elseProtocol = true;
                        scope.allIcmpShow = false;
                    } else {
                        scope.elseProtocol = false;
                    }
                };

                scope.changeType = function(t) {
                    scope.codings = {
                        options: []
                    };
                    switch (t) {
                        case "3":
                            scope.codings = {
                                options: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15"]
                            };
                            break;
                        case "5":
                            scope.codings = {
                                options: ["0", "1", "2", "3"]
                            };
                            break;
                        case "11":
                            scope.codings = {
                                options: ["0", "1"]
                            };
                            break;
                        case "12":
                            scope.codings = {
                                options: ["0", "1", "2"]
                            };
                            break;
                        default:
                            scope.codings = {
                                options: ["0"]
                            };
                            break;
                    }
                    scope.securityGroupRule.to_port = scope.codings.options[0];
                };

                scope.isPort = true;
                scope.$watch(function() {
                    return scope.securityGroupRule.portType;
                }, function(portType) {
                    if (portType.value == "port") {
                        scope.isPort = true;
                        scope.isPortRange = false;
                    }
                    if (portType.value == "portRange") {
                        scope.isPort = false;
                        scope.isPortRange = true;
                    }
                });

                scope.isCidrWay = true;
                scope.$watch(function() {
                    return scope.securityGroupRule.way;
                }, function(value) {
                    switch (value) {
                        case "cidr":
                            scope.isCidrWay = true;
                            scope.isFirewallWay = false;
                            break;
                        case "firewall":
                            scope.isCidrWay = false;
                            scope.isFirewallWay = true;
                            break;
                    }
                });

                scope.firewallGroups = {
                    options: securityGroupSrv.securityGroupTableData //fix AWUI-7004
                        //options: securityGroupSrv.securityGroupTableData.filter(item => item.id != $routeParams.id)
                };
                scope.securityGroupRule.firewall = scope.firewallGroups.options[0];

                scope.$watch(function() {
                    return scope.securityGroupRule.port || scope.securityGroupRule.from_port;
                }, function(value) {
                    if (scope.securityGroupRule.selectedRule.value !== "icmp") {
                        if (value && (value < 1 || value > 65535)) {
                            scope.input_invalid = true;
                            scope.field_form.$valid = false;
                        } else {
                            scope.input_invalid = false;
                        }
                        if (!value && scope.field_form && scope.field_form.$dirty) {
                            scope.input_invalid = false;
                        }
                    }
                });
                scope.$watch(function() {
                    return scope.securityGroupRule.to_port;
                }, function(value) {
                    if (scope.securityGroupRule.selectedRule.value !== "icmp") {
                        if (scope.securityGroupRule.from_port) {
                            if (value && (value < Number(scope.securityGroupRule.from_port) || value > 65535)) {
                                scope.toPort_invalid = true;
                                scope.field_form.$valid = false;
                            } else {
                                scope.toPort_invalid = false;
                            }
                            if (!value && scope.field_form && scope.field_form.$dirty) {
                                scope.toPort_invalid = false;
                            }
                        }
                    }
                });
                scope.invalid = {};
                scope.checkIcmpValue = function(value, type) {
                    if (value < -1 || value > 255) {
                        scope.invalid[type] = true;
                        scope.field_form.$valid = false;
                    } else {
                        scope.invalid[type] = false;
                    }
                    if (!value && scope.field_form && scope.field_form.$dirty) {
                        scope.invalid[type] = false;
                    }
                };
            });

            scope.securityGroupRuleConfirm = function(data) {
                if (scope.field_form.$valid) {
                    var params = {
                        "groupId": $routeParams.id,
                        "direction": data.direction.value, //入口或者出口 Ingress 或 egress
                        "ethertype": "IPV4", //类型 默认传iPv4?
                        "ipProtocol": data.selectedRule.value //规则 null, tcp, udp, and icmp
                    };

                    if (data.selectedRule.name == "ALL ICMP") {
                        params.fromPort = "-1";
                        params.toPort = "-1";
                    } else {
                        if (data.port) {
                            params.fromPort = data.port;
                            params.toPort = data.port;
                        } else {
                            params.fromPort = data.from_port;
                            params.toPort = data.to_port;
                        }
                    }
                    if (data.way == "cidr") {
                        params.enabled = "1"; //是否使用cidr 1或0
                        params.cidr = data.cidr; //IP地址
                    } else {
                        params.enabled = "0";
                        params.cidr = "";
                        params.parentGroupId = data.firewall.id;
                    }

                    if (data.selectedRule.value == "else") {
                        params.ipProtocol = data.protocol;
                        params.fromPort = "-1";
                        params.toPort = "-1";
                    }
                    scope.formSubmitted = true;
                    securityGroupSrv.addFirewallRule(params).then(function() {
                        initSecurityGroupRuleTable($routeParams.id);
                        initSecurityGroupTable();
                    });
                    addSecurityGroupRuleModal.close();
                } else {
                    scope.submitted = true;
                }
            };
        };

        //防火墙详情页面删除防火墙规则
        self.deleteSecurityGroupRule = function(data) {
            var content = {
                target: "deleteSecurityGroupRule",
                msg: "<span>" + $translate.instant("aws.security.deleteSecurityGroupRule") + "</span>",
                data: data
            };
            self.$emit("delete", content);
        };
        self.$on("deleteSecurityGroupRule", function(e, data) {
            var del_ids = [];
            _.forEach(data, function(item) {
                del_ids.push(item.id);
            });
            securityGroupSrv.firewallRuleRemove({
                ids: del_ids
            }).then(function() {
                initSecurityGroupRuleTable($routeParams.id);
                initSecurityGroupTable();
            });
        });

    }
]);
