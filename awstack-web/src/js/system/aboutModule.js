angular.module("aboutModule", ["ngSanitize", "ngRoute", "ngTable", "ngAnimate", "ngMessages", "ui.bootstrap", "ui.select"])
    .controller("aboutCtrl", function ($http,$scope, $rootScope, $uibModal,$translate, $routeParams, NgTableParams, checkedSrv,GLOBAL_CONFIG) {
    	let rootScope = $rootScope;
        function tabData(datas){
            var handData=datas.split("-");
            if(datas.split("-")[2]){
                var sData=datas.split("-")[2];
                var sY = sData.substring(0,4);
                var sM = sData.substring(4,6);
                var sD = sData.substring(6);
                var newData = new Date(sY,(sM-1),sD,0,0,0);
                var oldData = new Date(sY,0,1,0,0,0,0);
                var timer = (newData.getTime() - oldData.getTime())/(1000*86400)+1;
                var dataTime =sData.substring(2,4)+timer;
                var name=handData[0]+"-"+dataTime;
            }else{
                var name=handData[0];
            }
            return name;
        }
        $http({
            url: "/awstack-user/v1/platform/version",
            method:"GET"
        }).then(function(res){
            if(res&&res.data){
                res.data.description =JSON.parse(res.data.description); 
                rootScope.versionType=localStorage.permission=="stand"?$translate.instant("aws.aboutVersion.versionStand"):$translate.instant("aws.aboutVersion.versionEnterprise");
                rootScope.systemVersion = $translate.instant("aws.aboutVersion.systemVersion")+":"+tabData(res.data.curVersion);
                rootScope.systemVersionCon = res.data.curVersion;
                rootScope.desc= res.data.description.desc;
                rootScope.siteTitle = res.data.description.title;
                rootScope.copyright = res.data.description.copyright;
            }
        });

    });
