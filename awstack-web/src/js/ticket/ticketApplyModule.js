angular.module("ticketApplyModule", ["ngTable", "ngAnimate", "ui.bootstrap.tpls", "ui.tree", "checkedsrv"])
    .controller("ticketApplyCtrl", ["$scope", "$rootScope", "NgTableParams", "$uibModal", "ticketsrv", "alertSrv", "$translate", "checkedSrv", "$location","GLOBAL_CONFIG", function (scope, rootScope, NgTableParams, $uibModal, ticketsrv, alertSrv, $translate, checkedSrv, $location,GLOBAL_CONFIG) {
        var self = scope;
        var userUid = localStorage.$USERID ? localStorage.$USERID : "";
        self.headers = {
            "curStep": $translate.instant("aws.ticket.curStep"),
            "status": $translate.instant("aws.ticket.status"),
            "startTime": $translate.instant("aws.ticket.startTime")
        };
        function getApplyList() {
            ticketsrv.getApplyList(userUid).then(function (result) {
                result.data ? self.loadData = true : "";
                var data = [];
                if (result && result.data && result.data.length>0) {
                    data = result.data;
                    self.tableParams = new NgTableParams({count: GLOBAL_CONFIG.PAGESIZE}, {counts: [], dataset: data});
                }
            });
        }
        self.applyGlobalSearch = function () {
            var term = self.globalSearchTerm;
            self.tableParams.filter({$: term});
        };
        getApplyList();
    }]);

