createAlarmCtrl.$inject=["$scope", "$rootScope","$uibModalInstance","alarmService"];
export function createAlarmCtrl($scope, $rootScope,$uibModalInstance,alarmService){
    var self=$scope;
    self.submitted = false;
    self.interacted = function(field) {
        return self.submitted || field.$dirty;
    };
    self.newObj={};
    //获取监控项
    function get_watchitems(){
        self.newObj.watchitem_list=[];
        //EEService.getBalancers().then(function(result){
              let result={}
             result.data=[{name:"hahah",id:"sss"},{name:"kkk",id:"sss"}]
            if(result&&result.data){
                self.newObj.watchitem_list=result.data;
            }
            if(self.newObj.watchitem_list.length>0){
                self.newObj.watchitem=self.newObj.watchitem_list[0];
                self.haveWatchitem=true;
            }
        //});
    }
    get_watchitems();
    self.change_watchitem=function(obj){
        self.newObj.watchitem=obj;
    };



    //获取统计周期（分钟）
    function get_periods(){
        self.newObj.period_list=[];
        let result={}
             result.data=[{name:"hahah",id:"sss"},{name:"kkk",id:"sss"}]
        //EEService.getBalancers().then(function(result){
            if(result&&result.data){
                self.newObj.period_list=result.data;
            }
            if(self.newObj.period_list.length>0){
                self.newObj.period=self.newObj.period_list[0];
                self.havePeriod=true;
            }
        //});
    }
    get_periods();
    self.change_period=function(obj){
        self.newObj.period=obj;
    };


    //获取统计办法
    function get_methods(){
        self.newObj.method_list=[];
        let result={}
             result.data=[{name:"hahah",id:"sss"},{name:"kkk",id:"sss"}]
       // EEService.getBalancers().then(function(result){
            if(result&&result.data){
                self.newObj.method_list=result.data;
            }
            if(self.newObj.method_list.length>0){
                self.newObj.method=self.newObj.method_list[0];
                self.haveMethod=true;
            }
        //});
    }
    get_methods();
    self.change_method=function(obj){
        self.newObj.method=obj;
    };

    //获取符号
    function get_symbols(){
        self.newObj.symbol_list=[];
        let result={}
             result.data=[{name:"hahah",id:"sss"},{name:"kkk",id:"sss"}]
        //EEService.getBalancers().then(function(result){
            if(result&&result.data){
                self.newObj.symbol_list=result.data;
            }
            if(self.newObj.symbol_list.length>0){
                self.newObj.symbol=self.newObj.symbol_list[0];
                self.haveSymbol=true;
            }
        //});
    }
    get_symbols();
    self.change_symbol=function(obj){
        self.newObj.symbol=obj;
    };

    //获取百分数
    function get_percents(){
        self.newObj.percent_list=[];
        let result={}
             result.data=[{name:"hahah",id:"sss"},{name:"kkk",id:"sss"}]
       // EEService.getBalancers().then(function(result){
            if(result&&result.data){
                self.newObj.percent_list=result.data;
            }
            if(self.newObj.percent_list.length>0){
                self.newObj.percent=self.newObj.percent_list[0];
                self.havePercent=true;
            }
        //});
    }
    get_percents();
    self.change_percent=function(obj){
        self.newObj.percent=obj;
    };

    //重复几次后报警
    function get_times(){
        self.newObj.times_list=[];
        let result={}
             result.data=[{name:"hahah",id:"sss"},{name:"kkk",id:"sss"}]
        //EEService.getBalancers().then(function(result){
            if(result&&result.data){
                self.newObj.times_list=result.data;
            }
            if(self.newObj.times_list.length>0){
                self.newObj.times=self.newObj.times_list[0];
                self.haveTimes=true;
            }
        //});
    }
    get_times();
    self.change_times=function(obj){
        self.newObj.times=obj;
    };

    self.canSecond=true;
    self.cretealarm=function(){
        if (self.alarmForm.$valid) {
            $uibModalInstance.close();
            self.canSecond=false;
        }else{
            self.submitted = true;
        }
        
    };
    self.canCreate=function(){
        return self.canSecond && self.haveTimes &&  self.havePercent && self.haveSymbol && self.haveMethod && self.havePeriod && self.haveWatchitem
    };
}