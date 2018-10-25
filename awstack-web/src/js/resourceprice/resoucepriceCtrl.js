/**
 * Created by Administrator on 2017/3/4 0004.
 */
import "./resourcePriceSrv"

var resoucepriceCtrlModule = angular.module("resoucepriceCtrlModule", ["ngAnimate", "ngSanitize", "ui.bootstrap", "ngTable", "resourcePriceSrvModule"]);
resoucepriceCtrlModule.controller("resoucepriceCtrl", ["$scope", "$rootScope", "NgTableParams", "$uibModal", "$translate", "resourcePriceSrv", "getSelectOptionsSrv","$q",
    function ($scope, $rootScope, NgTableParams, $uibModal, $translate, resourcePriceSrv, getSelectOptionsSrv,$q) {
        var self = $scope;
        self.priceTypeoptions = [
            {name: $translate.instant("aws.price.perHour"), value: "perHour"},
            {name: $translate.instant("aws.price.perMonth"), value: "perMonth"}
        ];
        self.globalSearchTerm = {
            enterpriseId: "",
            region: "",
            prodTypeId: "",
            priceType:self.priceTypeoptions[0].value
        };

        getSelectOptionsSrv.getEnterpriseOptions(self);
        getSelectOptionsSrv.getPriceRegionsOptions(self);
        getSelectOptionsSrv.getResourceTypeOptions(self);

        function getBasicPriceTable(params) {
            resourcePriceSrv.getResourcePriceList(params).then(function (result) {
                if (result && result.data) {
                    for(var resPrice in result.data){
                        var priceTable = (result.data)[resPrice];
                        if(priceTable.prodCompName != ''){
                            priceTable.prodTypeName =   priceTable.prodTypeName+"-"+priceTable.prodCompName;
                        }
                        if(priceTable.priceType== 'perHour'){
                            priceTable.respriceType = $translate.instant("aws.price.perHour");
                        }
                        if(priceTable.priceType== 'perMonth'){
                            priceTable.respriceType = $translate.instant("aws.price.perMonth");;
                        }
                   }
                    self.tableParams = new NgTableParams(
                        {count: 10},
                        {counts: [], dataset: result.data}
                    );
                }
            })
        }

        getBasicPriceTable();

        self.applyGlobalSearch = function () {
            if (self.globalSearchTerm.region == "全部") {
                self.globalSearchTerm.region = "";
            }
            getBasicPriceTable(self.globalSearchTerm);
        };
        self.applyEnterpriseSearch = function () {
            if (self.globalSearchTerm.region == "全部") {
                self.globalSearchTerm.region = "";
            }
            getSelectOptionsSrv.getPriceRegionsOptions(self).then(function(){
                self.globalSearchTerm.region = self.regions.selected.region;
                self.globalSearchTerm.priceType = self.priceTypeoptions[0].value;
                getBasicPriceTable(self.globalSearchTerm);
            })
        }
        self.editResourcePrice = function (editItem) {
            var scope = $rootScope.$new();
            var editResourcePriceModal = $uibModal.open({
                animation: $scope.animationEnabled,
                templateUrl: "editResourcePriceModal.html",
                scope: scope
            });
            scope.submitForm = false;
            scope.updateResPriceTypeData = editItem;
            if(scope.updateResPriceTypeData.priceType== 'perHour'){
                scope.updateResPriceTypeData.respriceType = $translate.instant("aws.price.perHour");
            }
            if(scope.updateResPriceTypeData.priceType== 'perMonth'){
                scope.updateResPriceTypeData.respriceType = $translate.instant("aws.price.perMonth");;
            }
            scope.editResourcePriceConfirm = function (updateResPriceTypeForm) {
                if (updateResPriceTypeForm.$valid) {
                    resourcePriceSrv.editResourcePrice(scope.updateResPriceTypeData).then(function (result) {
                        getBasicPriceTable(self.globalSearchTerm);
                    })
                    editResourcePriceModal.close();
                } else {
                    scope.submitForm = true;
                }

            };
        };
    }]);