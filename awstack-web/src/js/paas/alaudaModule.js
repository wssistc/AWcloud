import "./alaudaSrv"
var alaudaModule = angular.module("alaudaCtrl", ["ngTable", "ngAnimate", "ui.bootstrap", "ngAnimate", "ngSanitize","alaudaSrv"])
alaudaModule.controller("alauda_1Ctrl", ['$scope','$timeout' ,'$rootScope','alaudaSrv',function($scope,$timeout, $rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_1').attr('src',self.iframeUrl);
                        }
                })
        },150)
}])
.controller("alauda_2Ctrl", ['$scope','$timeout', '$rootScope','alaudaSrv',function($scope,$timeout, $rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_2').attr('src',self.iframeUrl);
                        }
                })
        },150)
}])
.controller("alauda_3Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_3').attr('src',self.iframeUrl);
                        }
                })
        },150)
}])
.controller("alauda_4Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_4').attr('src',self.iframeUrl);
                        }
                })
        },150)
}])
.controller("alauda_5Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_5').attr('src',self.iframeUrl);
                        }
                })
        },150)
}])
.controller("alauda_6Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_6').attr('src',self.iframeUrl);
                        }
                })
        },150)
}])
.controller("alauda_7Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_7').attr('src',self.iframeUrl);
                        }
                })
        },150)
}])
.controller("alauda_8Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_8').attr('src',self.iframeUrl);
                        }
                })
        },150)
}])
.controller("alauda_9Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_9').attr('src',self.iframeUrl);
                        }
                })

        },150)
}])
.controller("alauda_10Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_10').attr('src',self.iframeUrl);
                        }
                })

        },150)
}])
.controller("alauda_11Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_11').attr('src',self.iframeUrl);
                        }
                })
        },150)
}])
.controller("alauda_12Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_12').attr('src',self.iframeUrl);
                        }
                })
        },150)
}])
.controller("alauda_13Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_13').attr('src',self.iframeUrl);
                        }
                })
        },150)
}])
.controller("alauda_14Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_14').attr('src',self.iframeUrl);
                        }
                })
        },150)
}])
.controller("alauda_15Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_15').attr('src',self.iframeUrl);
                        }
                })
        },150)
}])
.controller("alauda_16Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_16').attr('src',self.iframeUrl);
                        }
                })
        },150)
}])
.controller("alauda_17Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_17').attr('src',self.iframeUrl);
                        }
                })
        },150)
}])
.controller("alauda_18Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_18').attr('src',self.iframeUrl);
                        }
                })
        },150)
}])
.controller("alauda_19Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_19').attr('src',self.iframeUrl);
                        }
                })
        },150)
}])
.controller("alauda_20Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_20').attr('src',self.iframeUrl);
                        }
                })
        },150)
}])

/*TBase*/
.controller("alauda_21Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.getTBase().then(function(res){
                        if(res&&res.data){
                                var TBasedata = JSON.parse(res.data);
                                document.cookie = "PHPSESSID=" + escape(TBasedata.PHPSESSID); 
                                $('#alauda_21').attr('src',self.iframeUrl);      
                        }
                })
        },150)
}])
.controller("alauda_22Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.getTBase().then(function(res){
                        if(res&&res.data){
                                var TBasedata = JSON.parse(res.data);
                                document.cookie = "PHPSESSID=" + escape(TBasedata.PHPSESSID); 
                                $('#alauda_22').attr('src',self.iframeUrl);      
                        }
                        
                })
                
        },150)
}])
.controller("alauda_23Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.getTBase().then(function(res){
                        if(res&&res.data){
                                var TBasedata = JSON.parse(res.data);
                                document.cookie = "PHPSESSID=" + escape(TBasedata.PHPSESSID); 
                                $('#alauda_23').attr('src',self.iframeUrl);      
                        }
                        
                })
                
        },150)
}])
.controller("alauda_24Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.getTBase().then(function(res){
                        if(res&&res.data){
                                var TBasedata = JSON.parse(res.data);
                                document.cookie = "PHPSESSID=" + escape(TBasedata.PHPSESSID); 
                                $('#alauda_24').attr('src',self.iframeUrl);      
                        }
                        
                })
                
        },150)
}])
.controller("alauda_25Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.getTBase().then(function(res){
                        if(res&&res.data){
                                var TBasedata = JSON.parse(res.data);
                                document.cookie = "PHPSESSID=" + escape(TBasedata.PHPSESSID); 
                                $('#alauda_25').attr('src',self.iframeUrl);      
                        }
                        
                })
                
        },150)
}])
.controller("alauda_26Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.getTBase().then(function(res){
                        if(res&&res.data){
                                var TBasedata = JSON.parse(res.data);
                                document.cookie = "PHPSESSID=" + escape(TBasedata.PHPSESSID); 
                                $('#alauda_26').attr('src',self.iframeUrl);      
                        }
                        
                })
                
        },150)
}])
.controller("alauda_27Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.getTBase().then(function(res){
                        if(res&&res.data){
                                var TBasedata = JSON.parse(res.data);
                                document.cookie = "PHPSESSID=" + escape(TBasedata.PHPSESSID); 
                                $('#alauda_27').attr('src',self.iframeUrl);      
                        }
                        
                })
                
        },150)
}])
.controller("alauda_28Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.getTBase().then(function(res){
                        if(res&&res.data){
                                var TBasedata = JSON.parse(res.data);
                                document.cookie = "PHPSESSID=" + escape(TBasedata.PHPSESSID); 
                                $('#alauda_28').attr('src',self.iframeUrl);      
                        }
                        
                })
                
        },150)
}])
.controller("alauda_29Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.getTBase().then(function(res){
                        if(res&&res.data){
                                var TBasedata = JSON.parse(res.data);
                                document.cookie = "PHPSESSID=" + escape(TBasedata.PHPSESSID); 
                                $('#alauda_29').attr('src',self.iframeUrl);      
                        }
                        
                })
                
        },150)
}])
.controller("alauda_30Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.getTBase().then(function(res){
                        if(res&&res.data){
                                var TBasedata = JSON.parse(res.data);
                                document.cookie = "PHPSESSID=" + escape(TBasedata.PHPSESSID); 
                                $('#alauda_30').attr('src',self.iframeUrl);      
                        }
                        
                })
                
        },150)
}])
.controller("alauda_31Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.getTBase().then(function(res){
                        if(res&&res.data){
                                var TBasedata = JSON.parse(res.data);
                                document.cookie = "PHPSESSID=" + escape(TBasedata.PHPSESSID); 
                                $('#alauda_31').attr('src',self.iframeUrl);      
                        }
                        
                })
                
        },150)
}])
.controller("alauda_32Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.getTBase().then(function(res){
                        if(res&&res.data){
                                var TBasedata = JSON.parse(res.data);
                                document.cookie = "PHPSESSID=" + escape(TBasedata.PHPSESSID); 
                                $('#alauda_32').attr('src',self.iframeUrl);      
                        }
                        
                })
                
        },150)
}])
.controller("alauda_33Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.getTBase().then(function(res){
                        if(res&&res.data){
                                var TBasedata = JSON.parse(res.data);
                                document.cookie = "PHPSESSID=" + escape(TBasedata.PHPSESSID); 
                                $('#alauda_33').attr('src',self.iframeUrl);      
                        }
                        
                })
                
        },150)
}])
.controller("alauda_34Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.getTBase().then(function(res){
                        if(res&&res.data){
                                var TBasedata = JSON.parse(res.data);
                                document.cookie = "PHPSESSID=" + escape(TBasedata.PHPSESSID); 
                                $('#alauda_34').attr('src',self.iframeUrl);      
                        }
                        
                })
                
        },150)
}])
.controller("alauda_35Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.getTBase().then(function(res){
                        if(res&&res.data){
                                var TBasedata = JSON.parse(res.data);
                                document.cookie = "PHPSESSID=" + escape(TBasedata.PHPSESSID); 
                                $('#alauda_35').attr('src',self.iframeUrl);      
                        }
                        
                })
                
        },150)
}])
.controller("alauda_36Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.getTBase().then(function(res){
                        if(res&&res.data){
                                var TBasedata = JSON.parse(res.data);
                                document.cookie = "PHPSESSID=" + escape(TBasedata.PHPSESSID); 
                                $('#alauda_36').attr('src',self.iframeUrl);      
                        }
                        
                })
                
        },150)
}])

/*TDSQL*/
.controller("alauda_37Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_37').attr('src',self.iframeUrl);
                        }
                })
        },150)
}])
.controller("alauda_38Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_38').attr('src',self.iframeUrl);
                        }
                })
        },150)
}])
.controller("alauda_39Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_39').attr('src',self.iframeUrl);
                        }
                })
        },150)
}])
.controller("alauda_40Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_40').attr('src',self.iframeUrl);
                        }
                })
        },150)
}])
.controller("alauda_41Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_41').attr('src',self.iframeUrl);
                        }
                })
        },150)
}])
.controller("alauda_42Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_42').attr('src',self.iframeUrl);
                        }
                })
        },150)
}])
.controller("alauda_43Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_43').attr('src',self.iframeUrl);
                        }
                })
        },150)
}])
.controller("alauda_44Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_44').attr('src',self.iframeUrl);
                        }
                })
        },150)
}])
.controller("alauda_45Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_45').attr('src',self.iframeUrl);
                        }
                })
        },150)
}])
.controller("alauda_46Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_46').attr('src',self.iframeUrl);
                        }
                })
        },150)
}]).controller("alauda_47Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_47').attr('src',self.iframeUrl);
                        }
                })
        },150)
}]).controller("alauda_48Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_48').attr('src',self.iframeUrl);
                        }
                })
        },150)
}]).controller("alauda_49Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_49').attr('src',self.iframeUrl);
                        }
                })
        },150)
}]).controller("alauda_50Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_50').attr('src',self.iframeUrl);
                        }
                })
        },150)
}]).controller("alauda_51Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_51').attr('src',self.iframeUrl);
                        }
                })
        },150)
}]).controller("alauda_52Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_52').attr('src',self.iframeUrl);
                        }
                })
        },150)
}]).controller("alauda_53Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_53').attr('src',self.iframeUrl);
                        }
                })
        },150)
}]).controller("alauda_54Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_54').attr('src',self.iframeUrl);
                        }
                })
        },150)
}]).controller("alauda_55Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_55').attr('src',self.iframeUrl);
                        }
                })
        },150)
}]).controller("alauda_56Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_56').attr('src',self.iframeUrl);
                        }
                })
        },150)
}]).controller("alauda_57Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_57').attr('src',self.iframeUrl);
                        }
                })
        },150)
}]).controller("alauda_58Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_58').attr('src',self.iframeUrl);
                        }
                })
        },150)
}]).controller("alauda_59Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_59').attr('src',self.iframeUrl);
                        }
                })
        },150)
}]).controller("alauda_60Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_60').attr('src',self.iframeUrl);
                        }
                })
        },150)
}]).controller("alauda_61Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_61').attr('src',self.iframeUrl);
                        }
                })
        },150)
}]).controller("alauda_62Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_62').attr('src',self.iframeUrl);
                        }
                })
        },150)
}]).controller("alauda_63Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_63').attr('src',self.iframeUrl);
                        }
                })
        },150)
}]).controller("alauda_64Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_64').attr('src',self.iframeUrl);
                        }
                })
        },150)
}]).controller("alauda_65Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_65').attr('src',self.iframeUrl);
                        }
                })
        },150)
}]).controller("alauda_66Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_66').attr('src',self.iframeUrl);
                        }
                })
        },150)
}]).controller("alauda_67Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_67').attr('src',self.iframeUrl);
                        }
                })
        },150)
}]).controller("alauda_68Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_68').attr('src',self.iframeUrl);
                        }
                })
        },150)
}])
.controller("alauda_69Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_69').attr('src',self.iframeUrl);
                        }
                })
        },150)
}]).controller("alauda_70Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_70').attr('src',self.iframeUrl);
                        }
                })
        },150)
}]).controller("alauda_71Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_71').attr('src',self.iframeUrl);
                        }
                })
        },150)
}]).controller("alauda_72Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_72').attr('src',self.iframeUrl);
                        }
                })
        },150)
}]).controller("alauda_73Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_73').attr('src',self.iframeUrl);
                        }
                })
        },150)
}]).controller("alauda_74Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_74').attr('src',self.iframeUrl);
                        }
                })
        },150)
}]).controller("alauda_75Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_75').attr('src',self.iframeUrl);
                        }
                })
        },150)
}]).controller("alauda_76Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_76').attr('src',self.iframeUrl);
                        }
                })
        },150)
}]).controller("alauda_77Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_77').attr('src',self.iframeUrl);
                        }
                })
        },150)
}]).controller("alauda_78Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_78').attr('src',self.iframeUrl);
                        }
                })
        },150)
}]).controller("alauda_79Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_79').attr('src',self.iframeUrl);
                        }
                })
        },150)
}]).controller("alauda_80Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_80').attr('src',self.iframeUrl);
                        }
                })
        },150)
}]).controller("alauda_81Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_81').attr('src',self.iframeUrl);
                        }
                })
        },150)
}]).controller("alauda_82Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_82').attr('src',self.iframeUrl);
                        }
                })
        },150)
}]).controller("alauda_83Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_83').attr('src',self.iframeUrl);
                        }
                })
        },150)
}]).controller("alauda_84Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_84').attr('src',self.iframeUrl);
                        }
                })
        },150)
}]).controller("alauda_85Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_85').attr('src',self.iframeUrl);
                        }
                })
        },150)

}]).controller("alauda_86Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_86').attr('src',self.iframeUrl);
                        }
                })
        },150)
}]).controller("alauda_87Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_87').attr('src',self.iframeUrl);
                        }
                })
        },150)
}]).controller("alauda_88Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_88').attr('src',self.iframeUrl);
                        }
                })
        },150)
}]).controller("alauda_89Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_89').attr('src',self.iframeUrl);
                        }
                })
        },150)
}]).controller("alauda_90Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_90').attr('src',self.iframeUrl);
                        }
                })
        },150)
}]).controller("alauda_91Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_91').attr('src',self.iframeUrl);
                        }
                })
        },150)
}]).controller("alauda_92Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_92').attr('src',self.iframeUrl);
                        }
                })
        },150)
}]).controller("alauda_93Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_93').attr('src',self.iframeUrl);
                        }
                })
        },150)
}]).controller("alauda_94Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_94').attr('src',self.iframeUrl);
                        }
                })
        },150)
}]).controller("alauda_95Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_95').attr('src',self.iframeUrl);
                        }
                })
        },150)
}]).controller("alauda_96Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_96').attr('src',self.iframeUrl);
                        }
                })
        },150)
}]).controller("alauda_97Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_97').attr('src',self.iframeUrl);
                        }
                })
        },150)
}]).controller("alauda_98Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_98').attr('src',self.iframeUrl);
                        }
                })
        },150)
}]).controller("alauda_99Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_99').attr('src',self.iframeUrl);
                        }
                })
        },150)
}]).controller("alauda_100Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_100').attr('src',self.iframeUrl);
                        }
                })
        },150)
}]).controller("alauda_101Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_101').attr('src',self.iframeUrl);
                        }
                })
        },150)
}]).controller("alauda_102Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_102').attr('src',self.iframeUrl);
                        }
                })
        },150)
}]).controller("alauda_103Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_103').attr('src',self.iframeUrl);
                        }
                })
        },150)
}]).controller("alauda_104Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_104').attr('src',self.iframeUrl);
                        }
                })
        },150)
}]).controller("alauda_105Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_105').attr('src',self.iframeUrl);
                        }
                })
        },150)
}]).controller("alauda_106Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_106').attr('src',self.iframeUrl);
                        }
                })
        },150)
}]).controller("alauda_107Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_107').attr('src',self.iframeUrl);
                        }
                })
        },150)
}]).controller("alauda_108Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_108').attr('src',self.iframeUrl);
                        }
                })
        },150)
}]).controller("alauda_109Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_109').attr('src',self.iframeUrl);
                        }
                })
        },150)
}]).controller("alauda_110Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_110').attr('src',self.iframeUrl);
                        }
                })
        },150)
}]).controller("alauda_111Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_111').attr('src',self.iframeUrl);
                        }
                })
        },150)
}]).controller("alauda_112Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_112').attr('src',self.iframeUrl);
                        }
                })
        },150)
}]).controller("alauda_113Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_113').attr('src',self.iframeUrl);
                        }
                })
        },150)
}]).controller("alauda_114Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_114').attr('src',self.iframeUrl);
                        }
                })
        },150)
}]).controller("alauda_115Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_115').attr('src',self.iframeUrl);
                        }
                })
        },150)
}]).controller("alauda_116Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_116').attr('src',self.iframeUrl);
                        }
                })
        },150)
}]).controller("alauda_117Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_117').attr('src',self.iframeUrl);
                        }
                })
        },150)
}]).controller("alauda_118Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_118').attr('src',self.iframeUrl);
                        }
                })
        },150)
}]).controller("alauda_119Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_119').attr('src',self.iframeUrl);
                        }
                })
        },150)
}]).controller("alauda_120Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_120').attr('src',self.iframeUrl);
                        }
                })
        },150)
}]).controller("alauda_121Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_121').attr('src',self.iframeUrl);
                        }
                })
        },150)
}]).controller("alauda_122Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_122').attr('src',self.iframeUrl);
                        }
                })
        },150)
}]).controller("alauda_123Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_123').attr('src',self.iframeUrl);
                        }
                })
        },150)
}]).controller("alauda_124Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_124').attr('src',self.iframeUrl);
                        }
                })
        },150)
}]).controller("alauda_125Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_125').attr('src',self.iframeUrl);
                        }
                })
        },150)
}]).controller("alauda_126Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_126').attr('src',self.iframeUrl);
                        }
                })
        },150)
}]).controller("alauda_127Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_127').attr('src',self.iframeUrl);
                        }
                })
        },150)
}]).controller("alauda_128Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_128').attr('src',self.iframeUrl);
                        }
                })
        },150)
}]).controller("alauda_129Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_129').attr('src',self.iframeUrl);
                        }
                })
        },150)
}]).controller("alauda_130Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_130').attr('src',self.iframeUrl);
                        }
                })
        },150)
}]).controller("alauda_131Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_131').attr('src',self.iframeUrl);
                        }
                })
        },150)
}]).controller("alauda_132Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_132').attr('src',self.iframeUrl);
                        }
                })
        },150)
}]).controller("alauda_133Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_133').attr('src',self.iframeUrl);
                        }
                })
        },150)
}]).controller("alauda_134Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_134').attr('src',self.iframeUrl);
                        }
                })
        },150)
}]).controller("alauda_135Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_135').attr('src',self.iframeUrl);
                        }
                })
        },150)
}]).controller("alauda_136Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_136').attr('src',self.iframeUrl);
                        }
                })
        },150)
}]).controller("alauda_137Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_137').attr('src',self.iframeUrl);
                        }
                })
        },150)
}]).controller("alauda_138Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_138').attr('src',self.iframeUrl);
                        }
                })
        },150)
}]).controller("alauda_139Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_139').attr('src',self.iframeUrl);
                        }
                })
        },150)
}]).controller("alauda_140Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_140').attr('src',self.iframeUrl);
                        }
                })
        },150)
}]).controller("alauda_141Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_141').attr('src',self.iframeUrl);
                        }
                })
        },150)
}]).controller("alauda_142Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_142').attr('src',self.iframeUrl);
                        }
                })
        },150)
}]).controller("alauda_143Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_143').attr('src',self.iframeUrl);
                        }
                })
        },150)
}]).controller("alauda_144Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_144').attr('src',self.iframeUrl);
                        }
                })
        },150)
}]).controller("alauda_145Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_145').attr('src',self.iframeUrl);
                        }
                })
        },150)
}]).controller("alauda_146Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_146').attr('src',self.iframeUrl);
                        }
                })
        },150)
}]).controller("alauda_147Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_147').attr('src',self.iframeUrl);
                        }
                })
        },150)
}]).controller("alauda_148Ctrl", ['$scope','$timeout','$rootScope','$location','alaudaSrv',function($scope,$timeout,$rootScope,location,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        //self.iframeUrl = $rootScope.alaudaURL;
        var PaasData = localStorage.supportPaas?JSON.parse(localStorage.supportPaas):{};
        self.iframeUrl =  PaasData['TBDS'].url+':'+PaasData['TBDS'].port1+'/cas/login?service='+PaasData['TBDS'].url+':'+PaasData['TBDS'].port2+'/index.html?'+PaasData['TBDS'].username+'?'+PaasData['TBDS'].password;
        //console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_148').attr('src',self.iframeUrl);
                        }
                })
                $rootScope.TBDSAlert = true;
                $timeout(function(){
                        $rootScope.TBDSAlert = false;
                        location.path("/TBDS/tbMyApply").replace();
                },5000)
        },150)

        }]).controller("alauda_149Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_149').attr('src',self.iframeUrl);
                        }
                })
        },150)
}]).controller("alauda_150Ctrl", ['$scope','$timeout','$rootScope','alaudaSrv',function($scope,$timeout,$rootScope,alaudaSrv) {
        var self = $scope;
        var paramData = "?token="+localStorage.$AUTH_TOKEN+"&enterprisesId="+localStorage.enterpriseUid+"&userUid="+localStorage.userUid;
        self.iframeUrl = $rootScope.alaudaURL;
        console.log(self.iframeUrl)
        $timeout(function(){
                alaudaSrv.checkToken().then(function(res){
                        if(res.data){
                                $('#alauda_150').attr('src',self.iframeUrl);
                        }
                })
        },150)
}])