import "../../consumeStatistics/consumeView/consumeViewSrv";
import "../../resourceprice/resourcePriceSrv";
var getOptionsModule = angular.module("getOptionsModule", ["consumeSrvModule","resourcePriceSrvModule"]);

getOptionsModule.service("getSelectOptionsSrv", ["consumeViewSrv","resourcePriceSrv","$q","$translate", function (consumeViewSrv, resourcePriceSrv, $q,$translate) {
    return {
        getEnterpriseOptions: function (self) {
            consumeViewSrv.getEnterprises().then(function (result) {
                if (result && result.data) {
                    self.enterprises = {
                        options: result.data
                    };
                    //self.enterprises.options.push({enterpriseName:"全部",enterpriseId:""});
                }
            })
        },
        /*getRegionsOptions:function(self){
         var params = { enterpriseId: self.tableCnsForm.enterpriseId ? self.tableCnsForm.enterpriseId: "" };
         consumeViewSrv.getRegions(params).then(function(result){
         if(result && result.data){
         self.regions = {
         options:result.data,
         selected: result.data[0] ? result.data[0] : ""
         };
         if(self.tableCnsForm.enterpriseId){
         self.tableCnsForm.region = self.regions.selected.region;
         };
         self.regions.options.push({region:"全部"});
         }
         })
         },*/
        getPriceRegionsOptions: function (self) {
            var params = {enterpriseId: self.globalSearchTerm.enterpriseId ? self.globalSearchTerm.enterpriseId : ""};
            var deferred = $q.defer();
            consumeViewSrv.getRegions(params).then(function (result) {
                if (result && result.data) {
                    result.data.map(item=> {
                        item.regionName = item.region;
                    })
                    self.regions = {
                        options: result.data,
                        selected: result.data[0] ? result.data[0] : ""
                    };
                    if (self.globalSearchTerm.enterpriseId) {
                        self.globalSearchTerm.region = self.regions.selected.region;
                    }
                    ;
                    self.regions.options.push({region: "", regionName: $translate.instant("aws.price.all")});
                    deferred.resolve(self);
                }
            })
            return deferred.promise;
        },
        getDomainsOptions: function (self) {
            var params = {enterpriseId: self.tableCnsForm.enterpriseId ? self.tableCnsForm.enterpriseId : ""};
            consumeViewSrv.getDomains(params).then(function (result) {
                if (result && result.data) {
                    self.domains = {
                        options: result.data,
                        selected: result.data[0] ? result.data[0] : ""
                    };
                    if (self.tableCnsForm.enterpriseId) {
                        self.tableCnsForm.domainId = self.regions.selected.domainId;
                    }
                    ;
                    self.domains.options.push({domainName: $translate.instant("aws.price.all"), domainId: ""})
                }
            })
        },
        getProjectsOptions: function (self) {
            //var params = { enterpriseId:self.tableCnsForm.enterpriseId ? self.tableCnsForm.enterpriseId: "" };
            //var params = {};
            var deferred = $q.defer();
            //if (self.tableCnsForm.domainId) {
               var params = {
                    enterpriseId: self.tableCnsForm.enterpriseId,
                    domainId: self.tableCnsForm.domainId

                };
            //}
            consumeViewSrv.getProjects(params).then(function (result) {
                if (result && result.data) {
                    self.projects = {
                        options: result.data,
                        selected: result.data[0] ? result.data[0] : ""
                    };
                    if (self.tableCnsForm.enterpriseId) {
                        self.tableCnsForm.projectId = self.projects.selected.projectId;
                    }
                    ;
                    self.projects.options.push({projectName: $translate.instant("aws.price.all"), projectId: ""});
                    deferred.resolve(self);
                }
            });
            return deferred.promise;
        },
        getResourceTypeOptions: function (self) { //获取所有的产品类型
            resourcePriceSrv.getResourceTypeList().then(function (result) {
                if (result && result.data) {
                    self.productTypes = {
                        options: result.data
                    };
                    self.productTypes.options.push({prodTypeName: $translate.instant("aws.price.all"), prodTypeId: ""});
                }
            })
        },
        getRegionList: function (self) {
            var params = {enterpriseId: self.tableCnsForm.enterpriseId ? self.tableCnsForm.enterpriseId : ""};
            var deferred = $q.defer();
            consumeViewSrv.getRegions(params).then(function (result) {
                if (result && result.data) {
                    result.data.map(item=> {
                        item.regionName = item.region;
                        //return item;
                    })
                    self.regions = {
                        options: result.data,
                        selected: result.data[0] ? result.data[0] : ""
                    };
                    if (self.tableCnsForm.enterpriseId) {
                        self.tableCnsForm.region = self.regions.selected.region;
                    }
                    ;
                    self.regions.options.push({region: "", regionName: $translate.instant("aws.price.all")});
                    deferred.resolve(self);
                }
            })
            return deferred.promise;
        },
        getDomainsOptionsList: function (self) {
            var params = {
                enterpriseId: self.tableCnsForm.enterpriseId ? self.tableCnsForm.enterpriseId : "",
                region: self.tableCnsForm.region
            };
            var deferred = $q.defer();
            consumeViewSrv.getDomains(params).then(function (result) {
                if (result && result.data) {
                    self.domains = {
                        options: result.data,
                        selected: result.data[0] ? result.data[0] : ""
                    };
                    if (self.tableCnsForm.enterpriseId) {
                        self.tableCnsForm.domainId = self.domains.selected.domainId;
                    }
                    ;
                    self.domains.options.push({domainName: $translate.instant("aws.price.all"), domainId: ""})
                    deferred.resolve(self);
                }
            })
            return deferred.promise;
        },
        getUserOptions:function(self){
            var params = {
                enterpriseId: self.tableCnsForm.enterpriseId ? self.tableCnsForm.enterpriseId : "",
                domainId: self.tableCnsForm.domainId,
                projectId: self.tableCnsForm.projectId ? self.tableCnsForm.projectId : ""
            };
            var deferred = $q.defer();
            consumeViewSrv.getUsers(params).then(function(res){
                if( res && res.data){
                    self.users = {
                        options: res.data,
                        selected: res.data[0] ? res.data[0] : ""
                    };
                    if (self.tableCnsForm.enterpriseId) {
                        self.tableCnsForm.userName = self.users.selected.userName;
                    };
                    self.users.options.push($translate.instant("aws.price.all"));
                    deferred.resolve(self);
                }
            })
            return deferred.promise;
        }
    }
}]);
