
import "./aggregatesSrv";

angular.module("aggregatesModule", ["ngSanitize", "ngTable", "ngAnimate", "ngMessages", "ui.bootstrap", "ui.select", "aggregatesSrvModule"])
    .controller("AggregatesCtrl", function ($scope, $rootScope, $uibModal,$translate, NgTableParams, checkedSrv, aggregatesSrv,GLOBAL_CONFIG, $timeout,depviewsrv) {

        var self = $scope ;
        self.checkType = ""
        function getListAllPhyhosts(data){
            return _.reduce(
                        _.map(data, function (aggregate) {
                            if(aggregate.hosts instanceof Array){
                                return aggregate.hosts;
                            }else{
                                return Object.keys(aggregate.hosts);
                            }
                            
                        }),
                        function (aggHost1, aggHost2) {
                            return _.union(aggHost1, aggHost2);
                        },
                        []
                    );
        }

        function filterNonexistentHostFunc(allHosts,hostsList){
            var _hosts = [];
            _.each(hostsList,function(item){
                if(_.include(allHosts,item)){
                    _hosts.push(item)
                }
            })
            return _hosts;
        }

        function initAggregatesTable() {
            aggregatesSrv.getAggregates()
                .then(function (result) {
                    if(result&&result.data){
                       aggregatesSrv.aggregatesTable = result.data; 
                    }
                    //self.haveAddedHosts = getListAllPhyhosts(result.data);
                });
            aggregatesSrv.OsService().then(function(result){
                return result.data;
            }).then(function(allHosts){
                aggregatesSrv.getZoneAndHosts().then(function (result) {
                    var zoneHostsTableData = _.map(result.data, function (zoneHost) {
                        return {
                            zoneName: zoneHost.zoneName,
                            hosts: filterNonexistentHostFunc(allHosts,Object.keys(zoneHost.hosts)),
                            available: zoneHost.zoneState.available == true?$translate.instant("aws.common.yes"):$translate.instant("aws.common.no")
                        };
                    });
                    self.zoneHostsTableData = zoneHostsTableData
                    self.zoneHostsTable = new NgTableParams(
                    {count:GLOBAL_CONFIG.PAGESIZE},{counts:[],dataset:zoneHostsTableData}
                    );
                    // all available hosts in this cluster.
                    result.data = result.data.filter(item => item.zoneName !="internal");
                    self.all_availableHosts = getListAllPhyhosts(result.data);
                });
            })
            
        }
        initAggregatesTable();

        self.showData = false

        self.$watch(function () {
            return aggregatesSrv.aggregatesTable;
        }, function (value) {
            var aggregatesData = _.map(value, function (item) {
                // item.metadata = JSON.stringify(item.metadata).replace(/\{|\}|"/g,"");
                item.metadataSearch='\b';
                for(var key in item.metadata){
                   if(key=='setaggregate_instance_extra_specs:pinned'){
                      if(item.metadata[key]=='true'){
                         item.metadataSearch+="CPU绑定=启用"+"\b";
                      }else{
                         item.metadataSearch+="CPU绑定=禁用"+"\b";
                      }
                   }else{
                      item.metadataSearch+=key+"="+item.metadata[key]+"\b";
                   }
                }
                item.searchTerm = [item.name, item.availZone, item.hosts.join('\b'), item.metadataSearch].join('\b');
                return item;
            });
            self.tableParams = new NgTableParams(
                {count: GLOBAL_CONFIG.PAGESIZE}, {counts: [], dataset: aggregatesData}
            );
            self.applyGlobalSearch = function() {
               
                var term = self.globalSearchTerm;
                self.tableParams.filter({ searchTerm: term });
                $timeout(function(){
                    if(!self.tableParams.data.length){
                        self.showData = true
                    }else{
                        self.showData = false
                    }
                },0)

            };
            checkedSrv.checkDo(self, aggregatesData, "id");
        }, true);


        self.$watch(function(){
            return self.checkedItems;
        },function(checkedItems){
            if(checkedItems){
                for(let i=0;i<checkedItems.length;i++){
                    if(checkedItems[i].hosts && checkedItems[i].hosts.length > 0){
                        self.delisDisabled = true;
                        self.cannotDel_tip = $translate.instant("aws.system.aggregate.cannotDelAggregate");
                        break;
                    }else{
                        self.delisDisabled = false;
                        self.cannotDel_tip = "";
                    }
                }
            }
            
        });

        self.refreshAggregates = function () {
            self.globalSearchTerm = ""
            initAggregatesTable();
        };

        self.aggregate = function (type,editData) {
            var scope = self.$new();
            
            var aggregateModel = $uibModal.open({
                animation: true,
                templateUrl: "aggregate.html",
                scope: scope
            });

            scope.submitted = false;
            scope.interacted = function(field) {
                if(field){
                    scope.field_form = field;
                    return scope.submitted || field.$dirty;
                }
            };

            switch(type){
            case "new":
                scope.aggregateTitle = $translate.instant("aws.system.aggregate.createAggregate");
                scope.editAggregateModal = false;
                scope.aggregateData = {};
                scope.confirmAggregate = function(aggregateData){
                    if(scope.field_form.$valid){
                        aggregatesSrv.createAggregate(aggregateData)
                            .then(function () {
                                scope.refreshAggregates();
                            });
                        aggregateModel.close();
                    }else{
                        scope.submitted = true;
                    }
                };
                break;
            case "edit":
                scope.aggregateTitle = $translate.instant("aws.system.aggregate.editAggregate");
                scope.editAggregateModal = true;
                editData = angular.copy(editData);
                scope.aggregateData = {
                    name: editData.name,
                    availability_zone: editData.availZone,
                    metadata: editData.metadata
                };
                scope.metadataSet = angular.copy(editData.metadata);
                delete scope.metadataSet.availability_zone;

                scope.keyMap = {};
                scope.cpuSelectList = [{
                    name: "启用",
                    value: "true"
                }, {
                    name: "禁用",
                    value: "false"
                }];
                scope.checkType = {};
                scope.placeholder = {};
                scope.hasProps = false;
                for (let key in scope.metadataSet) {
                    scope.hasProps = true;
                    scope.keyMap[key] = key;
                    switch (key) {
                        case "filter_tenant_id":
                            scope.placeholder.filter_tenant_id = $translate.instant("aws.system.aggregate.enterValues");
                            break;
                        case "instance_type":
                            scope.checkType.instance_type = "instanceLimitChk"
                            scope.placeholder.instance_type = $translate.instant("aws.system.aggregate.input_instanceType");
                            break;
                        case "cpu_allocation_ratio":
                            scope.checkType.cpu_allocation_ratio = "cpuLimitChk"
                            scope.placeholder.cpu_allocation_ratio = $translate.instant("aws.system.aggregate.input_cpu_pen");
                            break;
                        case "ram_allocation_ratio":
                            scope.checkType.ram_allocation_ratio = "ramLimitChk"
                            scope.placeholder.ram_allocation_ratio = $translate.instant("aws.system.aggregate.input_mem_pen");
                            break;
                        case "setaggregate_instance_extra_specs:pinned":
                            scope.placeholder.setaggregate_instance_extra_specs = "";
                            scope.keyMap[key] = $translate.instant("aws.system.aggregate.CPUBinding");
                            break;
                        default:
                            scope.placeholder[key] = $translate.instant("aws.system.aggregate.input_number");
                            break;
                    }
                }

                scope.delMetadata = function(key, index) {
                    scope.aggregateData.metadata[key] = null;
                    delete scope.metadataSet[key];
                };

                scope.confirmAggregate = function(aggregateData) {
                    if (scope.field_form.$valid) {
                        for(let key in aggregateData.metadata){
                            if(!aggregateData.metadata[key]){
                                aggregateData.metadata[key] = null;
                            }
                            if(key == "availability_zone"){
                                delete  aggregateData.metadata[key]
                            }
                        }
                        let params = {
                            availabilityZone:aggregateData.availability_zone,
                            metadata:aggregateData.metadata,
                            name:aggregateData.name
                        };
                        aggregatesSrv.editMetadata(editData.id, params)
                            .then(function() {
                                scope.refreshAggregates();
                            });
                        aggregateModel.close();
                    } else {
                        scope.submitted = true;
                    }
                };
                break;
            }
        };

        self.resetAggregate = function(editData){
            var content = {
                target: "resetAggregate",
                msg: "<span>"+$translate.instant("aws.system.aggregate.resetAggregate")+"</span>",
                data: editData
            };
            self.$emit("delete", content);
        };
        self.$on("resetAggregate", function (e,data) {
            aggregatesSrv.resetAggregate({
                id:data.id,
                data:{
                    availability_zone:data.availZone,
                    name:data.name
                }
            }).then(function () {
                self.refreshAggregates();
            });

        });

        self.deleteAggregate = function () {
            var content = {
                target: "deleteAggregate",
                msg: "<span>"+$translate.instant("aws.system.aggregate.deleteAggregate")+"</span>"
            };
            self.$emit("delete", content);
        };
        self.$on("deleteAggregate", function () {
            var deleteAggregateData = {
                aggregateIds: []
            };
            self.checkedItems.map(item => {
                deleteAggregateData.aggregateIds.push(item.id)
            })
            aggregatesSrv.deleteAggregate(deleteAggregateData)
                .then(function () {
                    self.refreshAggregates();
                });
        });

        self.setAggregateMetadata = function (editData) {
            var scope = self.$new();
            var setMetadataModel = $uibModal.open({
                animation: true,
                templateUrl: "setAggregateMetadata.html",
                scope: scope
            });
            scope.projectList = [];

            self.cpuSelectList=[
                {name:"启用",value:"true"},
                {name:"禁用",value:"false"}
            ];

            scope.metadata = {};
            scope.keyOptions = [
                "filter_tenant_id",
                "cpu_allocation_ratio",
                "ram_allocation_ratio",
                "instance_type",
                $translate.instant("aws.system.aggregate.CPUBinding"),
                $translate.instant("aws.system.aggregate.selfDefined")
            ];
            scope.metadata.key = scope.keyOptions[0];
            scope.valuePlaceholder = $translate.instant("aws.system.aggregate.enterValues");
            depviewsrv.getProjectDataAll().then(function(res){
                if(res && res.data && angular.isArray(res.data)){
                    res.data.map(item => {
                        if(item.domainUid=='default'&&item.name=="admin"){
                            item.name = $translate.instant('aws.common.defaultProject');
                        }
                    })
                    scope.projectList = res.data;
                    if(editData.metadata && editData.metadata.filter_tenant_id){
                        scope.metadata.value = editData.metadata.filter_tenant_id;
                    }else{
                        scope.metadata.value = scope.projectList[0].projectUid;
                    }
                     
                }
            })
            
            scope.changekey = function(key){
                switch(key){
                case "filter_tenant_id":
                    scope.valuePlaceholder = $translate.instant("aws.system.aggregate.enterValues");
                    scope.metadata.value=localStorage.projectUid;
                    break;
                case "instance_type":
                    scope.checkType = "instanceLimitChk"
                    scope.valuePlaceholder = $translate.instant("aws.system.aggregate.input_instanceType");
                    scope.metadata.value="";
                    break;
                case "cpu_allocation_ratio":
                    scope.checkType = "cpuLimitChk"
                    scope.valuePlaceholder = $translate.instant("aws.system.aggregate.input_cpu_pen");
                    scope.metadata.value="";
                    break;
                case "ram_allocation_ratio":
                    scope.checkType = "ramLimitChk"
                    scope.valuePlaceholder = $translate.instant("aws.system.aggregate.input_mem_pen");
                    scope.metadata.value="";
                    break;
                case $translate.instant("aws.system.aggregate.CPUBinding"):
                    scope.valuePlaceholder ="";
                    if(angular.isObject(self.checkedItems[0].metadata)&&self.checkedItems[0].metadata['setaggregate_instance_extra_specs:pinned']=='false'){
                       scope.metadata.value=self.cpuSelectList[1];
                    }else if(angular.isObject(self.checkedItems[0].metadata)&&self.checkedItems[0].metadata['setaggregate_instance_extra_specs:pinned']=='true'){
                       scope.metadata.value=self.cpuSelectList[0];
                    }else{
                       scope.metadata.value=self.cpuSelectList[0];
                    }
                    break;        
                default:
                    scope.valuePlaceholder = $translate.instant("aws.system.aggregate.input_number");
                    scope.metadata.value="";
                    break;
                }
            };
            return setMetadataModel.result
                .then(function (metadata) {
                    var metaDataOptions={};
                    if(metadata.key==$translate.instant("aws.system.aggregate.CPUBinding")){
                        metaDataOptions.key='setaggregate_instance_extra_specs:pinned';
                        metaDataOptions.value=metadata.value.value;
                    }else if(metadata.key==$translate.instant("aws.system.aggregate.selfDefined")){
                        metaDataOptions.key=metadata.selfkey;
                        metaDataOptions.value=metadata.selfvalue;
                    }else{
                        metaDataOptions=angular.copy(metadata);
                    }
                    var aggregateId = self.checkedItems[0].id;
                    aggregatesSrv.setAggregateMetadata(aggregateId, metaDataOptions)
                        .then(function () {
                            scope.refreshAggregates();
                        });
                });
        };

        self.manageHost = function (editData) {
            var scope = self.$new();
            var manageHostModal = $uibModal.open({
                animation: true,
                templateUrl: "manageHost.html",
                scope: scope
            });
            var originHosts = angular.copy(editData.hosts),addHosts = [],delHosts = [];

            scope.manageHostData = {
                hosts:editData.hosts
            };
            var others_availZone = [];
            _.each(aggregatesSrv.aggregatesTable,function(item){
                if(item.availZone != editData.availZone){
                    others_availZone.push(item);
                }
            });
            self.haveAddedHosts = getListAllPhyhosts(others_availZone);
            
            scope.$watch(function(){
                return scope.manageHostData.hosts;
            },function(currentSelect){
                addHosts = _.difference(currentSelect, originHosts);
                delHosts = _.difference(originHosts, currentSelect);
                scope.availableHosts = _.difference(self.all_availableHosts,self.haveAddedHosts);//过滤掉其它可用域已经被添加的物理主机
                //scope.availableHosts = self.availableHosts;
                if(scope.availableHosts.length == 0){
                    scope.selectHostplaceholder = $translate.instant("aws.system.aggregate.noHostsTips");
                }else{
                    scope.selectHostplaceholder = $translate.instant("aws.system.aggregate.choseHosts");
                }
            });
            return manageHostModal.result.then(function () {
                // add hosts to this aggregate.
                if (addHosts.length > 0) {
                    aggregatesSrv.addHostIntoAggregates(editData.id, {hosts: addHosts})
                        .then(function () {
                            scope.refreshAggregates();
                        });
                }
                // delete hosts from this aggregate.
                if (delHosts.length > 0) {
                    aggregatesSrv.removeHostFromAggregates(editData.id, {hosts: delHosts})
                        .then(function () {
                            scope.refreshAggregates();
                        });
                }
            });
        };
    }).directive("checkType",function(){
        return {
            restrict:"A",
            require:"ngModel",
            scope:{
                checkType:"="
            },
            link:function(scope,elem,attrs,ngModel){
                scope.$watch(function(){
                    return scope.checkType
                },function(val){
                    if(!val) return
                    ngModel.$parsers.push(function(viewValue){
                        let viewValueStr=viewValue.toString();
                        let reg=/^0{1}([.]\d{1,2})?$|^[1-9]\d*([.]{1}[0-9]{1,2})?$/;
                        switch(scope.checkType){                   
                            case "cpuLimitChk":
                                // let reg = new RegExp("^((0\.((0[1-9])|([1-9]\d?)))|(([1-9]|1[0-5])(\.[\d]{1,2})?)|(16(\.0{1,2})?))$");
                                if(viewValue>1 && viewValue<16 && reg.test(viewValue)){
                                    ngModel.$setValidity("checkCpuType",true);
                                    ngModel.$setValidity("checkRamType",true);
                                }else{
                                    ngModel.$setValidity("checkCpuType",false);
                                    ngModel.$setValidity("checkRamType",true);
                                }
                            break;
                            case "ramLimitChk":
                                if(viewValue>1 && viewValue<2 && reg.test(viewValue)){
                                    ngModel.$setValidity("checkRamType",true);
                                    ngModel.$setValidity("checkCpuType",true);
                                }else{
                                    ngModel.$setValidity("checkRamType",false);
                                    ngModel.$setValidity("checkCpuType",true);
                                }
                            break;
                            case "instanceLimitChk":
                                ngModel.$setValidity("checkCpuType",true);
                                ngModel.$setValidity("checkRamType",true);
                            break;
                        }
                        return viewValue;
                    });
                })
            }
        };
    })
    // .directive("checkRamType",function(){
    //     return {
    //         restrict:"A",
    //         require:"ngModel",
    //         scope:{
    //             checkRamType:"="
    //         },
    //         link:function(scope,elem,attrs,ngModel){
    //             if(!checkRamType) return
    //             ngModel.$parsers.push(function(viewValue){
    //                 let reg = new RegExp("^(0|[1-9][0-9]*)$");
    //                 if(reg.test(viewValue)){
    //                     ngModel.$setValidity("checkRamType",true);
    //                 }else{
    //                     ngModel.$setValidity("checkRamType",false);
    //                 }
    //                 return viewValue;
    //             });
    //         }
    //     };
    // });