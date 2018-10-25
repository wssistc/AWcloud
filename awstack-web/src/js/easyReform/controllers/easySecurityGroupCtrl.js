
easySecurityGroupCtrl.$inject=["$scope", "$rootScope", "$translate","$uibModal","$timeout","$uibModalInstance","securityGroupSrv","self"];
export function easySecurityGroupCtrl($scope,$rootScope,$translate,$uibModal,$timeout,$uibModalInstance,securityGroupSrv,self){
    var scope = $scope;
    //安全组名称列表
    var initSecurityGroupList = function() {
        scope.securityGroup_name = [];
        var headers = {
            domain_id: localStorage.domainUid,
            domain_name: encodeURI(localStorage.domainName),
            project_id: localStorage.projectId,
            project_name: encodeURI(localStorage.projectName)
        }
        securityGroupSrv.getFirewallTableData(headers).then(function(result) {
            if (result && result.data) {
                /*存下所有已有的安全组名*/
                result.data.forEach(function(item) {
                    scope.securityGroup_name.push(item.name)
                })
            }

        });
    };
    initSecurityGroupList();
    /*检验安全组名是否已存在*/
    scope.NameCheck = false;
    scope.groupLimit = null;
    scope.checkedName = function(value) {
        scope.NameCheck = false;
        if (scope.securityGroup_name.length) {
            for (var i = 0; i < scope.securityGroup_name.length; i++) {
                if (scope.securityGroup_name[i] == value) {
                    scope.NameCheck = true;
                    break;
                }
            }
        }

    }
    scope.interactedRouter = function(field) {
        if (field) {
            return scope.routerSubmitInValid || field.firewallName.$dirty;
        }
    };
    function stepsStatus(one, two, oneBar, twoBar) {
        scope.inStepOne = one;
        scope.inStepTwo = two;
        scope.inStepOneBar = oneBar;
        scope.inStepTwoBar = twoBar;
    }
    scope.stepToOne = function() {
        stepsStatus(true, false, true, false)
    }
    scope.stepToOne()
    scope.stepToTwo = function(createrouterForm) {
        if (createrouterForm.$valid) {
            if(!scope.NameCheck){
                stepsStatus(false, true, true, true)	
            }
        } else {
            scope.routerSubmitInValid = true;
        }
    }
    //防火墙详情页面新建防火墙规则  
    securityGroupSrv.getDomianQuota({ //获取项目配额总数
        type: "project_quota",
        targetId: localStorage.projectUid,
        enterpriseUid: localStorage.enterpriseUid,
        name: "security_group_rule"
    }).then(function(res) {
        if (res && res.data) {
            scope.groupLimit = res.data[0].hardLimit;
            securityGroupSrv.getProQuotasUsages({
                type: "project_quota",
                projectUid: localStorage.projectUid,
                domainUid: localStorage.domainUid,
                enterpriseUid: localStorage.enterpriseUid,
                name: "security_group_rule"
            }).then(function(result) {
                if (result && result.data) {
                    scope.groupLimit = scope.groupLimit * 1 - (result.data[0].inUse) * 1;
                }
            });
        }
    });
   
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

    scope.changeRule = function(rule,active) {
        scope.securityGroupRule.port = '';
        if(active){
            scope.shortCutType = '';
        }
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
    securityGroupSrv.getFirewallTableData().then(function(result) {
        if (result && result.data) {
            result.data.map(function(item) {
                item.searchTerm = [item.name, item.description].join(',');
            })
            securityGroupSrv.securityGroupTableData = result.data;
            scope.firewallGroups = {
                options: securityGroupSrv.securityGroupTableData //fix AWUI-7004
                    //options: securityGroupSrv.securityGroupTableData.filter(item => item.id != $routeParams.id)
            };
            scope.securityGroupRule.firewall = scope.firewallGroups.options[0];

        }

    });


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

    /*快捷方式*/
    scope.shortCutFun = function(type) {
        scope.shortCutType = type;
        switch (scope.shortCutType) {
            case "SSH":
                scope.securityGroupRule.selectedRule = {
                    name: "TCP",
                    value: "tcp"
                }
                scope.changeRule(scope.securityGroupRule.selectedRule)
                scope.securityGroupRule.port = 22;
                break;
            case "RDP":
                scope.securityGroupRule.selectedRule = {
                    name: "TCP",
                    value: "tcp"
                }
                scope.changeRule(scope.securityGroupRule.selectedRule)
                scope.securityGroupRule.port = 3389;
                break;
            case "HTTPS":
                scope.securityGroupRule.selectedRule = {
                    name: "TCP",
                    value: "tcp"
                }
                scope.changeRule(scope.securityGroupRule.selectedRule)
                scope.securityGroupRule.port = 443;
                break;
            case "HTTP":
                scope.securityGroupRule.selectedRule = {
                    name: "TCP",
                    value: "tcp"
                }
                scope.changeRule(scope.securityGroupRule.selectedRule)
                scope.securityGroupRule.port = 80;
                break;
            case "FTP":
                scope.securityGroupRule.selectedRule = {
                    name: "TCP",
                    value: "tcp"
                }
                scope.changeRule(scope.securityGroupRule.selectedRule)
                scope.securityGroupRule.port = 21;
                break;
            default:
                scope.securityGroupRule.port = '';
                break;
        }
    }
    scope.tableRules = [];
    scope.securityGroupRuleConfirm = function(data) {
        if (scope.field_form.$valid) {
            var params = {
                //"groupId": $routeParams.id,
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
            var tableListNum = scope.tableRules.length;
            /*验证是否超过项目配额*/
            var canAdd = true;
            scope.canAddTips = false;
            function addRules() {
                if(tableListNum>5){
                    canAdd = false;
                    scope.canAddTips = true;
                    return;
                }
                if (scope.groupLimit > (tableListNum + 1)) {
                    if (tableListNum > 0) {
                        for (var i = 0; i < tableListNum; i++) {
                            if(!scope.isPortRange){
                                params.fromPort = scope.securityGroupRule.port
                                params.toPort = scope.securityGroupRule.port;
                                if (scope.tableRules[i].ipProtocol == params.ipProtocol &&
                                    scope.tableRules[i].fromPort == params.fromPort &&
                                    scope.tableRules[i].toPort == params.toPort&&
                                    scope.tableRules[i].direction == params.direction
                                ){
                                    canAdd = false;
                                }
                            }else{
                                params.fromPort = scope.securityGroupRule.from_port;
                                params.toPort = scope.securityGroupRule.to_port;
                                if (scope.tableRules[i].ipProtocol == params.ipProtocol &&
                                    scope.tableRules[i].fromPort == params.fromPort &&
                                    scope.tableRules[i].toPort == params.toPort&&
                                    scope.tableRules[i].direction == params.direction
                                ) {
                                    canAdd = false;
                                }
                            }
                            
                            
                        }

                    }
                }
            }
            addRules()
            if (canAdd) {
                if (params.parentGroupId) {
                    params.sourceType = scope.securityGroupRule.firewall.name;
                } else {
                    params.sourceType = params.cidr;
                }
                scope.tableRules.push(params)
            }
        } else {
            scope.submitted = true;
        }
    };
    scope.deleteRulesFun = function(i) {
        scope.canAddTips = false;
        scope.tableRules.splice(i, 1)
    }
    scope.securityGroupConfirm = function() {
        var options = {
            name: scope.securityGroupForm.name,
            description: scope.securityGroupForm.description,
            rules: scope.tableRules
        }
        var headers = {
            domain_id: localStorage.domainUid,
            domain_name: encodeURI(localStorage.domainName),
            project_id: localStorage.projectId,
            project_name: encodeURI(localStorage.projectName)
        }
        securityGroupSrv.createSecurityGroups(options, headers).then(function(res) {
            if (res && res.data) {
                res.data.value = res.data.name;
                self.securityList.push(res.data);
            }
        }).finally(function() {
            $uibModalInstance.close();
        })
    }
    
}