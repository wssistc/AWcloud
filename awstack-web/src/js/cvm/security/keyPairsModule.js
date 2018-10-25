/**
 * Created by Weike on 2016/6/6.
 */
import "./keyPairsSrv";

angular.module("keyPairsModule", ["ngSanitize", "ngTable", "ngAnimate", "ngMessages", "ui.bootstrap", "ui.select", "ngFileSaver", "keyPairsSrvModule"])
    .controller("keyPairsCtrl", function($scope, $rootScope, $uibModal,$translate, checkedSrv,checkQuotaSrv, keyPairsSrv, NgTableParams,GLOBAL_CONFIG) {
        var self = $scope;
        var initKeyPairsTable = function() {
            keyPairsSrv.getKeyPairs().then(function(result) {
                self.globalSearchTerm = "";
                result?self.loadData = true:"";
                if(result&& result.data){
                    keyPairsSrv.keypairsTable = result.data;
                    self.init_data();
                }
                    
            });
        };
        initKeyPairsTable();
        self.init_data = function(){
            $scope.$watch(function() {
                return keyPairsSrv.keypairsTable;
            }, function(value) {
                var keypairs_data = value;
                _.map(value, function(item) {
                     item.searchTerm = [item.name, item.fingerprint].join("\b");
                });
                $scope.tableParams = new NgTableParams({ count: GLOBAL_CONFIG.PAGESIZE }, { counts: [], dataset:  keypairs_data });
                $scope.applyGlobalSearch = function() {
                    var term = $scope.globalSearchTerm;
                    $scope.tableParams.filter({ searchTerm: term });
                };
                checkedSrv.checkDo($scope, keypairs_data, "name");
            }, true);
        };

        $scope.refreshKeyPairs = function() {
            initKeyPairsTable();
        };

        $scope.createKeyPair = function() {
            var scope = self.$new();
            scope.newKeyPairData = {};

            var newKeyPairModal = $uibModal.open({
                animation: true,
                templateUrl: "newKeyPair.html",
                scope: scope
            });

            // if(localStorage.permission == "enterprise"){
            //     checkQuotaSrv.checkQuota(scope,"key_pairs");
            // }
            

            scope.submitted = false;
            scope.interacted = function(field) {
                scope.field_form = field;
                return scope.submitted || field.$dirty;
            };
            scope.confirmNewKeypair = function(kpData){
                if(scope.field_form.$valid){
                    scope.formSubmitted = true;
                    keyPairsSrv.createKeyPair(kpData).then(function(result){
                        if(result && result.data){
                            $scope.doDownload(result.data);
                            initKeyPairsTable();
                        }
                    });
                    newKeyPairModal.close();
                }else{
                    scope.submitted = true;
                }
            };
        };

        $scope.doDownload = function (data) {
            var downloadScope = $rootScope.$new();
            return $uibModal.open({
                animation: true,
                templateUrl: "downloadPem.html",
                scope: downloadScope,
                controller: "downloadKeyPairCtrl",
                resolve: {
                    kpData: function () {
                        return {
                            name: data.name + ".pem",
                            data: data.private_key
                        };
                    }
                }
            }).result.then(function () {
                $scope.refreshKeyPairs();
            });
        };

        $scope.importKeyPair = function() {
            var scope = $rootScope.$new();
            var importKeyPairModel = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: "importKeyPair.html",
                scope: scope
            });

            scope.importKeyPairData = {};
            scope.submitted = false;
            scope.interacted = function(field) {
                scope.field_form = field;
                return scope.submitted || field.$dirty;
            };
            scope.confirmImportKeypair = function(kpData,importKeyPairForm){
                if(importKeyPairForm.$valid){
                    scope.formSubmitted = true;
                    keyPairsSrv.importKeyPair(kpData).then(function() {
                        $scope.refreshKeyPairs();
                    });
                    importKeyPairModel.close();
                }else{
                    scope.submitted = true;
                }
                
            };
        };

        $scope.deleteKeyPair = function() {
            var content = {
                target: "deleteKeyPair",
                msg: "<span>"+$translate.instant("aws.keypair.deleteKeyPair")+"</span>"
            };
            $scope.$emit("delete", content);
        };
        $scope.$on("deleteKeyPair", function() {
            var deleteKeypairs = {
                name: Object.keys($scope.checkboxes.items)
            };
            keyPairsSrv.deleteKeyPair(deleteKeypairs)
                .then(function() {
                    $scope.refreshKeyPairs();
                });
        });
    })
    .controller("downloadKeyPairCtrl", function ($scope, $uibModalInstance, FileSaver, Blob, kpData) {
        $scope.download = function () {
            var pemData = new Blob(
                [kpData.data],
                { type: "application/x-pem-file"}
            );
            FileSaver.saveAs(pemData, kpData.name);
            $uibModalInstance.close();
        };
    });

