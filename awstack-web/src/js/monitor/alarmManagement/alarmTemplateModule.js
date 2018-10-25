import "./alarmTemplateSrv";

var alarmTemplateModule = angular.module("alarmTemplateModule", ["ngTable", "ngAnimate", "ui.bootstrap", "alarmTmplSrvModule", "ngMessages"])

alarmTemplateModule.controller("alarmTemplateCtrl", ["$scope", "$rootScope", "NgTableParams", "alarmTemplateSrv", "checkedSrv", "$uibModal", "$translate","GLOBAL_CONFIG",
function($scope, $rootScope, NgTableParams, alarmTemplateSrv, checkedSrv, $uibModal, $translate,GLOBAL_CONFIG) {
    var self = $scope;
    var initAlarmTmplsTable = function(){
        self.globalSearchTerm="";
        alarmTemplateSrv.getAlarmTmpls().then(function(result){
            result?self.loadData = true:"";
            if(result && result.data){
                var alarmTmpls_data = [];
                if($rootScope.ADMIN){
                    alarmTmpls_data = _.map(result.data, function(item) {
                        if(item.resourceType == "physical"){
                            item.resource_type = $translate.instant("aws.monitor.alarmModule.physicalHost");
                        }else if(item.resourceType == "virtual"){
                            item.resource_type = $translate.instant("aws.monitor.alarmModule.vmHost");
                        }else if(item.resourceType == "ceph"){
                            item.resource_type = "ceph";
                        }else if(item.resourceType == "tsdb"){
                            item.resource_type = $translate.instant("aws.monitor.alarmModule.tsdb");
                        }
                        item.searchTerm = [item.name,item.resource_type].join("\b")
                        return item;
                    }); 
                }else{
                    _.each(result.data,function(item){
                        if(item.resourceType == "virtual"){
                            item.resource_type = $translate.instant("aws.monitor.alarmModule.vmHost");
                            item.searchTerm = [item.name,item.resource_type].join("\b")
                            alarmTmpls_data.push(item);
                        }
                    });
                }
                self.tableParams = new NgTableParams({ count: GLOBAL_CONFIG.PAGESIZE }, { counts: [], dataset: alarmTmpls_data });
                checkedSrv.checkDo(self, alarmTmpls_data, "id");
            }
        });
    };
    initAlarmTmplsTable();

    self.$watch(function(){
        return self.checkedItems;
    },function(value){
        if(!value){
            self.isDisabled = true;
            self.delisDisabled = true;
        }
    });

    self.refreshAlarmTmpl = function(){
        self.globalSearchTerm="";
        self.applyGlobalSearch();
        initAlarmTmplsTable();
    };
    
    self.applyGlobalSearch = function() {
        var term = self.globalSearchTerm;
        self.tableParams.filter({ searchTerm: term });
    };

    //新建、编辑告警模板
    self.alarmTmpl = function(type,item){
        var scope = self.$new();
        var addTmplModal = $uibModal.open({
            animation:$scope.animationsEnabled,
            templateUrl:"alarmTmpl.html",
            scope:scope
        });

        scope.submited = false;
        scope.interacted = function(field){
            scope.field_form = field;
            return scope.submited || field.tmplName.$dirty;
        };
        switch(type){
        case "new":
            scope.tmplModalTitle = $translate.instant("aws.monitor.alarmModule.newCreatAlarmTmpl");
            scope.showResType = true;
            scope.enableCeph = localStorage.permission == "enterprise"?true:false; //企业版时资源类型显示ceph
            scope.addAlarmTmplForm = {
                name:"",
                resType:$rootScope.ADMIN == true?"physical":"virtual" //给出默认初始值
            };
            //判断是否能新建时序数据库告警
            var paasList=JSON.parse(localStorage.supportPaas);
            var regionBusiAuth=JSON.parse(localStorage.regionBusiAuth);
            if(paasList&&angular.isObject(paasList)&&paasList.CTSDB&&paasList.CTSDB.isLinked&&(regionBusiAuth.indexOf("11")>-1)){
               scope.hasCTsdb=true;
            }
            scope.alarmTmplConfirm = function(){
                if(scope.field_form.$valid){
                    var params =  {
                        "name":scope.addAlarmTmplForm.name,
                        "resourceType":scope.addAlarmTmplForm.resType
                    };
                    alarmTemplateSrv.addAlarmTmpl(params).then(function(){
                        initAlarmTmplsTable();
                    });
                    addTmplModal.close();
                }else{
                    scope.submited = true;
                }
            };
            break;

        case "edit":
            scope.tmplModalTitle = $translate.instant("aws.monitor.alarmModule.editAlarmTmpl");
            scope.showResType = false;
            scope.addAlarmTmplForm = {
                name:item.name,
                resType:item.resourceType
            };
            scope.alarmTmplConfirm = function(){
                if(scope.field_form.$valid){
                    var params =  {
                        id:item.id,
                        data:{
                            "name":scope.addAlarmTmplForm.name,
                            "resourceType":scope.addAlarmTmplForm.resType
                        }
                    };
                    alarmTemplateSrv.editAlarmTmpl(params).then(function(){
                        initAlarmTmplsTable();
                    });
                    addTmplModal.close();
                }else{
                    scope.submited = true;
                }
            };
        }
    };

    //删除告警模板
    self.deleteAlarmTmpls = function(checkedItems){
        var content = {
            target:"deleteTmpls",
            msg:"<span>"+$translate.instant("aws.monitor.alarmModule.deleteTmpls")+"</sapn>",
            data:checkedItems
        };
        self.$emit("delete",content);
    };
    self.$on("deleteTmpls",function(e,data){
        var ids = [];
        _.each(data,function(item){
            ids.push(item.id);
        });
        alarmTemplateSrv.delAlarmTmpl({"ids":ids}).then(function(){
            initAlarmTmplsTable();
        });
    });

    self.settingTmplRule=function(editData){
        self.tmplRuleModal = $uibModal.open({
            animation:$scope.animationsEnabled,
            templateUrl:"setAlarmTmplRule.html",
            controller: "settingTmplRuleCtrl",
            resolve:{
                editData:function(){
                    return editData;
                },
                initAlarmTmplsTable:function(){
                    return initAlarmTmplsTable;
                },
                context:function(){
                    return self;
                }
            }
        });
    };
}]);
alarmTemplateModule.controller("settingTmplRuleCtrl", ["$scope", "$rootScope", "NgTableParams", "alarmTemplateSrv", "checkedSrv", "$uibModal", "$translate","GLOBAL_CONFIG","editData","$timeout","initAlarmTmplsTable","context",
function(scope, $rootScope, NgTableParams, alarmTemplateSrv, checkedSrv, $uibModal, $translate,GLOBAL_CONFIG,editData,$timeout,initAlarmTmplsTable,context) {
    var self = scope;
    self.isSatisfy=true;
    var thresholdNames=[],_alarmrulesEx=[];
    function initThresholdRules() {  
        return {
            name:self.alarmRule.name.ruleKey, //告警规则名称
            tempId:editData.id,//告警规则所属的告警模板id
            alarmType:"threshold", //threshold event （阈值告警或事件告警）写死的
            severity:self.alarmRule.severity.value,//告警的严重等级， 三选一："critical", "moderate","low" (高、中、低)
            operator:self.alarmRule.operator.value, //comparison_operator 比较符gt、ge、eq、le、lt（大于、大于等于、等于、小于、小于等于 
            statistic:self.alarmRule.statistic.value, // max min avg 最大值 最小值 平均值
            threshold:self.alarmRule.threshold, //num 阈值大小
            period:self.alarmRule.period.value, //int 告警数据采集周期
            unit:self.alarmRule.name.ruleUnit,
            id:""
        };
    }
    function postRulesParamsFunc(item){
        return {   //需要传走的参数字段
            name:item.name, 
            tempId:item.tempId,
            alarmType:item.alarmType, 
            severity:item.severity,
            operator:item.operator, 
            statistic:item.statistic, 
            threshold:item.threshold, 
            period:item.period,
            id:item.id 
        };
    }
    self.deleteRule=function(rule,index){
        self.thresholdRules.splice(index,1);
        self.rulesTableParams = new NgTableParams({ count: GLOBAL_CONFIG.PAGESIZE }, { counts: [], dataset: self.thresholdRules });
    };

    function severityValueCompare(RuleRange,addRuleItem){
        let compareArr=[],compareNumberArr=[];
        //let criticalValue='no',moderateValue='no',lowValue='no';
        if(addRuleItem.severity=="critical"){
           compareArr.push({level:3,value:addRuleItem.threshold});
        }else if(addRuleItem.severity=="moderate"){
           compareArr.push({level:2,value:addRuleItem.threshold});
        }else if(addRuleItem.severity=="low"){
           compareArr.push({level:1,value:addRuleItem.threshold});
        }
        //严重>中级>低级
        RuleRange.forEach(function(item){
            //严重
            if(item.severity=="critical"){
               compareArr.push({level:3,value:item.threshold});
            }else if(item.severity=="moderate"){
               compareArr.push({level:2,value:item.threshold});
            }else if(item.severity=="low"){
               compareArr.push({level:1,value:item.threshold});
            }
        });
        compareArr=_.chain(compareArr).sortBy("level").value();
        if(addRuleItem.operator=="ge"){
            if(compareArr.length==2){
               if(compareArr[0].value<compareArr[1].value){
                   return true;
               }else{
                   return false;
               }
            }else if(compareArr.length==3){
               if((compareArr[0].value<compareArr[1].value)&&(compareArr[1].value<compareArr[2].value)){
                   return true;
               }else{
                   return false;
               }
            }

        }else if((addRuleItem.operator=="lt")){
            if(compareArr.length==2){
               if(compareArr[0].value>compareArr[1].value){
                   return true;
               }else{
                   return false;
               }
            }else if(compareArr.length==3){
               if((compareArr[0].value>compareArr[1].value)&&(compareArr[1].value>compareArr[2].value)){
                   return true;
               }else{
                   return false;
               }
            }
        }
    }

    function handleAddRule(addRuleItem){
        //先找到告警范围（cpu使用率平均值大于等于）
        var sameRuleRange=[],hasSameSeverity=false;

       for(var i=0;i<self.thresholdRules.length;i++){
          let thresholdRule=angular.copy(self.thresholdRules[i]);
          if(thresholdRule.name==addRuleItem.name&&thresholdRule.statistic==addRuleItem.statistic&&thresholdRule.operator==addRuleItem.operator){
             thresholdRule.currentIndex=i;
             sameRuleRange.push(thresholdRule);
          }  
       }
       if(sameRuleRange.length==1){
          //判断是否有级别相同的
          if(sameRuleRange[0].severity==addRuleItem.severity){
             self.thresholdRules.splice(sameRuleRange[0].currentIndex,1,addRuleItem);

          }else{
            //级别不同的规则数值之间需要进行校验
            self.isSatisfy=severityValueCompare(sameRuleRange,addRuleItem);
            if(self.isSatisfy){
                //可以进行添加规则操作
                scope.thresholdRules.push(addRuleItem);
            }
          }
       }else if(sameRuleRange.length>1){
          let hasSame=false,leftRuleRangeArr=[];
          for(var j=0;j<sameRuleRange.length;j++){
              if(sameRuleRange[j].severity==addRuleItem.severity){
                 hasSame=true;
                 sameRuleRange.splice(j,1);
                 leftRuleRangeArr=angular.copy(sameRuleRange);
                 break;
              }
          }
          if(hasSame){
             //和剩下的不同级别的数值做对比
             self.isSatisfy=severityValueCompare(leftRuleRangeArr,addRuleItem);
             if(self.isSatisfy){
                //可以进行添加规则操作
                scope.thresholdRules.forEach(function(item,index){
                    if(item.severity==addRuleItem.severity&&item.name==addRuleItem.name&&item.operator==addRuleItem.operator&&item.statistic==addRuleItem.statistic){
                        scope.thresholdRules.splice(index,1);
                    }
                });
                scope.thresholdRules.push(addRuleItem);
             }               
          }else{
            //和所有不同级别的数值做对比
            self.isSatisfy=severityValueCompare(sameRuleRange,addRuleItem);
            if(self.isSatisfy){
                //可以进行添加规则操作
                scope.thresholdRules.push(addRuleItem);
            }
          }
       }else if(sameRuleRange.length==0){
          self.thresholdRules.push(addRuleItem);
       }
    }
    //点击添加阈值规则按钮 新增
    scope.addThresholdRule = function(setAlarmTmplRuleForm){
        self.submitted=false; 
        if(setAlarmTmplRuleForm.$valid){
            self.addRuleItem=initThresholdRules();
           //规则名称的展示处理
            scope.ruleNames.options.forEach(function(ruleName){
                if(ruleName.ruleKey==self.addRuleItem.name){
                   self.addRuleItem.transName=ruleName.name;
                }
            });
            self.addRuleItem.rangeDescreption=$translate.instant("aws.monitor.alarmModule."+self.addRuleItem.statistic)+$translate.instant("aws.monitor.alarmModule."+self.addRuleItem.operator)+self.addRuleItem.threshold+self.addRuleItem.unit;
            handleAddRule(self.addRuleItem);
            if(self.isSatisfy){
                self.submitted=false; 
               //重新初始化添加规则里面绑定的值
                self.alarmRule={
                   "name":scope.ruleNames.options[0],
                   "statistic":scope.selectOptions.statistics[0],
                   "operator":scope.selectOptions.operators[0],
                   "threshold":"",
                   "period":scope.selectOptions.periods[0],
                   "severity":scope.selectOptions.severities[0],
                };
                //重置表单
                self.setAlarmTmplRuleForm.$setPristine();
                self.setAlarmTmplRuleForm.$setUntouched();
                self.rulesTableParams = new NgTableParams({ count: GLOBAL_CONFIG.PAGESIZE }, { counts: [], dataset: scope.thresholdRules });
            }else{
                $timeout(function(){
                    self.isSatisfy=true;
                },2000);
            }   
        }else{
           self.submitted=true; 
        }  
    };
    scope.selectOptions = {
        statistics:[
            {name:$translate.instant("aws.monitor.alarmModule.mean"),value:"mean"},
            {name:$translate.instant("aws.monitor.alarmModule.max"),value:"max"},
            {name:$translate.instant("aws.monitor.alarmModule.min"),value:"min"}
        ],
        operators:[
            {name:">=",value:"ge"},
            {name:"<=",value:"le"}
        ],
        periods:[
            {name:"100s",value:100},
            {name:"150s",value:150},
            {name:"200s",value:200}
        ],
        severities:[
            {name:$translate.instant("aws.monitor.alarmModule.critical"),value:"critical"},
            {name:$translate.instant("aws.monitor.alarmModule.moderate"),value:"moderate"},
            {name:$translate.instant("aws.monitor.alarmModule.low"),value:"low"}
        ]
    };
    self.alarmRule={
       "name":"",
       "statistic":scope.selectOptions.statistics[0],
       "operator":scope.selectOptions.operators[0],
       "threshold":"",
       "period":scope.selectOptions.periods[0],
       "severity":scope.selectOptions.severities[0],
    };

    self.setTmplRuleConfirm=function(){
        var _alarmrulesNow = [],params={};
        _.each(self.thresholdRules,function(item,i){
            _alarmrulesNow.push(postRulesParamsFunc(item));
        });
        self.hasNoRule=false;
        //有添加的告警规则
        if(_alarmrulesNow.length>0){
            for(var i = 0;i<_alarmrulesNow.length;i++){
                if(_alarmrulesNow[i].name=="net.bytes_sent"||_alarmrulesNow[i].name=="net.bytes_recv"){
                    _alarmrulesNow[i].threshold= _alarmrulesNow[i].threshold*1024*1024/8;
                }
            }
            params = {
                tempId:editData.id,
                data:{
                    projectId:editData.projectId,
                    enterpriseId:editData.enterpriseId,
                    userId:editData.userId,
                    alarmrulesEx:_alarmrulesEx?_alarmrulesEx:[],
                    alarmrulesNow:_alarmrulesNow?_alarmrulesNow:[]
                }
            };
            alarmTemplateSrv.addTmplRules(params).then(function(){
                initAlarmTmplsTable();
            });
            context.tmplRuleModal.close();
        }else if(_alarmrulesNow.length==0){
            //原先本身就没有设置规则，本次也无新增
            if(_alarmrulesEx.length==0){
               context.tmplRuleModal.close();
               initAlarmTmplsTable();
            //原先本身有设置规则,本次无新增
            }else{
               params = {
                    tempId:editData.id,
                    data:{
                        projectId:editData.projectId,
                        enterpriseId:editData.enterpriseId,
                        userId:editData.userId,
                        alarmrulesEx:_alarmrulesEx,
                        alarmrulesNow:[]
                    }
                };
                alarmTemplateSrv.addTmplRules(params).then(function(){
                    initAlarmTmplsTable();
                });
                context.tmplRuleModal.close();
            }
            
        }
        
    };
    //获取告警模板规则的name下拉选项
    alarmTemplateSrv.getTmplRulesName(editData.resourceType).then(function(result){
        return result.data;
    }).then(function(data){
        thresholdNames = data;
        scope.ruleNames = {
            options:data,
            //selected:data[0].ruleKey
        };
        //规则名称初始化
        self.alarmRule.name=scope.ruleNames.options[0];
        
        //获取模板规则
        alarmTemplateSrv.getTmplRules(editData.id).then(function(result){
            result?self.thresholdData=true:"";
            _.each(result.data,function(item){
                //已经存在的模板进行处理
                _alarmrulesEx.push(postRulesParamsFunc(item));
            });
            //页面上面展示的数据
            scope.thresholdRules = _.map(result.data,function(item){
                item.editDisabled = true;
                for(var i = 0;i<thresholdNames.length;i++){
                    if(item.name == thresholdNames[i].ruleKey){
                        item.unit = thresholdNames[i].ruleUnit;
                    }
                }
                return item;
            });
            for(var j=0;j<scope.thresholdRules.length;j++){
                var ruleItem=scope.thresholdRules[j];
                if(ruleItem.name=="net.bytes_sent"||ruleItem.name=="net.bytes_recv"){
                    ruleItem.threshold= ruleItem.threshold*8/1024/1024;
                }
                //规则名称的展示处理
                scope.ruleNames.options.forEach(function(ruleName){
                    if(ruleName.ruleKey==ruleItem.name){
                       ruleItem.transName=ruleName.name;
                    }
                });
                ruleItem.rangeDescreption=$translate.instant("aws.monitor.alarmModule."+ruleItem.statistic)+$translate.instant("aws.monitor.alarmModule."+ruleItem.operator)+ruleItem.threshold+ruleItem.unit;
            }
            self.rulesTableParams = new NgTableParams({ count: GLOBAL_CONFIG.PAGESIZE }, { counts: [], dataset: scope.thresholdRules });
        });

    });
}]);
alarmTemplateModule.directive("thresholdCheck",function(){
    return {
        restrict:"A",
        require:"ngModel",
        scope:{
            unit:"=",
            ruleKey:"=",
            ruleName:"="
        },
        link:function(scope,elem,attrs,ngModel){
            function vaild(viewValue){
                var reg = new RegExp("^(0|[1-9][0-9]*)$");
                if(viewValue){
                    if(scope.unit == "%"){
                        if(viewValue<0 || viewValue>100 || !reg.test(viewValue)){
                           ngModel.$setValidity("thresholdCheck",false);
                        }else{
                           ngModel.$setValidity("thresholdCheck",true);
                        }
                    }else{
                        if(scope.ruleKey=="net.bytes_sent"||scope.ruleKey=="net.bytes_recv") {
                            if(viewValue<0 || viewValue>102400 || !reg.test(viewValue)){
                               ngModel.$setValidity("thresholdCheck",false); 
                            }else{
                               ngModel.$setValidity("thresholdCheck",true); 
                            }
                        }
                    }  
                }else{
                    ngModel.$setValidity("thresholdCheck",true);
                }
                return viewValue;
            }
            ngModel.$parsers.push(vaild);
            scope.$watch(function(){
               return scope.ruleName;
            },function(ruleName){
               vaild(ngModel.$viewValue);
            });
        }
    };
});