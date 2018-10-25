stepthreeCtrl.$inject=["$scope", "$http", "$location", "$routeParams", "$interval","regsrv"];
export function stepthreeCtrl($scope, $http, $location, $routeParams, $interval,regsrv){
    var self = $scope;
    var listData = localStorage.LISTS ? JSON.parse(localStorage.LISTS) : "";
    self.threeModule = {
        ntpserver:"cn.pool.ntp.org",
        preStep:function(){
            var pathData = $location.path().split("/");
            var regionkeyCode = pathData[pathData.length-1];
            $location.path("/info/steptwo/"+regionkeyCode);
        },
        completeThree: function() {
            localStorage.setItem("ACCOUNT", JSON.stringify(self.threeModule.accountData));
            var data = localStorage.NODE ? JSON.parse(localStorage.NODE) : "";
            //regsrv.checkUserName({userName:self.threeModule.accountData.username,regionKey:localStorage.regionKey}).then(function(res){
                //if(res&&res.data&&res.data.code=="0"){
                    //self.threeModule.idExist = false;
                    //self.threeModule.serverError = false;
                    //if (data) {
                        data.common.keystone_admin_user = "";
                        data.common.keystone_admin_password = "";
                        data.common.region_name = self.threeModule.accountData.region;
                        data.common.user_list = JSON.parse(localStorage.USEDLIST);
                        
                        data.common.ntp_servers = [self.threeModule.ntpserver];
                        localStorage.setItem("ALLDATA", JSON.stringify(data));
                    //}
                    var pathData = $location.path().split("/");
                    var regionkeyCode = pathData[pathData.length-1];
                    $location.path("/info/stepfour/"+regionkeyCode);
            //     }else if(res&&res.data&&res.data.code=="01080601"){
            //         self.threeModule.idExist = true;
            //     }else{
            //         self.threeModule.serverError = true;
            //     }
            // });
            
        },
        accountData: {
            region: "",
            username: "",
            password: ""
        },
        change: function(v) {
            $http({
                method: "PUT",
                url: "awstack-user/v1/enterprises/" + listData[0].enterpriseUid + "/regions/" + listData[0].regionUid + "/names",
                data: {
                    "regionName": v
                }
            }).success(function() {
                //self.oneModule.editActive = false;
            });
        },
        isDisabled: false,
        checkedList: "",
        init: function() {
            if (listData) {
                self.threeModule.accountData.region = listData[0].regionName;
            }
        },
        isdisabled: false,
        idExist: false,
        canUsed: false
        /*errorClose:function(){
            self.threeModule.serverError = false;
        },
        exist: function(data) {
            self.threeModule.isdisabled = true;
            if (!data) {
                self.threeModule.isdisabled = false;
                return;
            }
            $http({
                method: "POST",
                url: "awstack-user/v1/enterprises/" + enterpriseUid + "/chkusername",
                data: {
                    "userName": data
                }
            }).then(function(res) {
                if (res&&res.data&&res.data.code=='0') {
                    self.threeModule.idExist = false;
                    self.threeModule.isdisabled = false;
                    self.threeModule.canUsed = true;
                    self.threeModule.serverError = false;
                } else if(res&&res.data&&res.data.code=="01080601"){
                    self.threeModule.idExist = true;
                    self.threeModule.isdisabled = false;
                    self.threeModule.canUsed = false;
                } else{
                    self.threeModule.serverError = true;
                }
            })
        }*/
    };
    self.threeModule.init();
}