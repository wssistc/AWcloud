routerModelCtrl.$inject = ["$scope", "$rootScope", "$location", "routersSrv", "checkQuotaSrv", "commonFuncSrv", "$uibModalInstance", "$translate"];
export function routerModelCtrl($scope, $rootScope, $location, routersSrv, checkQuotaSrv, commonFuncSrv, $uibModalInstance, $translate) {
    var self = $scope;

    checkQuotaSrv.checkQuota(self, "router");
    getPrice();
    self = commonFuncSrv.setAssignIpFun(self, "routerForm", "createrouterForm", "external");

    self.routerForm = {
        name: "",
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
        selectedTenantSub: ""
    };

    self.routerModal_title = $translate.instant("aws.routers.newRouter");
    self.extNetsPlaceholder = $translate.instant("aws.routers.placeholder.routerExtNet");
    self.subPlaceholder = $translate.instant("aws.routers.choseLinkSubnetHolder");

    self.field_form = {};
    self.submitted = false;
    self.interacted = function(field) {
        if (field) {
            self.field_form.createrouterForm = field;
            return self.submitted || field.name.$dirty || field.extnet.$dirty || field.tenantsub.$dirty || field.ip_0.$dirty || field.ip_1.$dirty || field.ip_2.$dirty || field.ip_3.$dirty;
        }
    };

    routersSrv.getTenantSubs().then(function(res) {
        if (res && res.data && angular.isArray(res.data)) {
            var tenantSubs_data = res.data.filter(function(item) {
                item.name = item.name + "---" + item.cidr;
                return item.gatewayIp
            });
            self.tenantSubs = {
                options: tenantSubs_data,
                selected: tenantSubs_data[0]
            };
            self.routerForm.selectedTenantSub = self.tenantSubs.selected;
            if (tenantSubs_data.length == 0) {
                self.subPlaceholder = $translate.instant("aws.routers.placeholder.noSubToChose");
            }
        }
    });

    function getPrice() {
        if (!$rootScope.billingActive) {
            return;
        }
        var postData = {
            "region": localStorage.regionName ? localStorage.regionName : "default",
            "routerCount": 1
        }
        routersSrv.getPrice(postData).then(function(data) {
            if (data && data.data && !isNaN(data.data)) {
                self.showPrice = true;
                self.price = data.data;
                self.priceFix = self.price.toFixed(2)
                self.totalPrice = (self.price * 30 * 24).toFixed(2)
            } else {
                self.showPrice = true;
                self.price = "N/A";
                self.priceFix = "N/A";
                self.totalPrice = "N/A"
            }

        })
    }
    self.routerConfirm = function(form) {
        let postrouterParams = {};
        if (form.$valid) {
            postrouterParams = {
                "name": self.routerForm.name,
                "network_id": self.routerForm.selectedNet.id,
                "subnet_id": self.routerForm.selectedTenantSub.id
            };
        } else {
            self.submitted = true;
        }
        if (self.routerForm.assignSub) {
            postrouterParams.external_fixed_ips = [];
            let externalFixedIps = {};
            externalFixedIps.subnet_id = self.routerForm.selectedSubnet.id;
            if (self.routerForm.assignIP == true) {
                let gatewayIp = self.routerForm.init_cidr.ip_0 + "." +
                    self.routerForm.init_cidr.ip_1 + "." +
                    self.routerForm.init_cidr.ip_2 + "." +
                    self.routerForm.init_cidr.ip_3;
                externalFixedIps.ip_address = gatewayIp;
                delete externalFixedIps.subnet_id;
                self.setCheckValueFunc();
            }
            postrouterParams.external_fixed_ips.push(externalFixedIps);
        }

        if (self.field_form.createrouterForm.$valid) {
            self.formSubmitted = true;
            routersSrv.addRouterAction(postrouterParams).then(function() {
                if ($location.path() == "/cvm/netTopo") {
                    $rootScope.initEditedTopo();
                } else {
                    $rootScope.refreshRoutersTable();
                }
            });
            $uibModalInstance.close();
        } else {
            self.submitted = true;
        }
    };

    self.cancelRouterModal = function() {
        $uibModalInstance.close();
        if ($location.path() == "/cvm/netTopo") {
            $rootScope.editTopo();
        }
    };

}