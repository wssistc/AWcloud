import "./systemInspectionSrv";

angular.module("systemInspectionModule", ["ngSanitize", "ngTable", "ngAnimate", "ngMessages", "ui.bootstrap", "ui.select", "systemInspectionSrvModule"])
    .controller("systemInspectionCtrl", ["$scope","$rootScope","$uibModal","NgTableParams","checkedSrv","systemInspectionSrv","GLOBAL_CONFIG","$translate","$location","alertSrv",function ($scope, $rootScope, $uibModal, NgTableParams, checkedSrv, systemInspectionSrv,GLOBAL_CONFIG,$translate,$location,alert) {
        var self=$scope;
        //导出csv的表头翻译
        self.downloadFileName=$translate.instant("aws.system.systemInspection.inspectionResults")+".csv";
        self.inspectionType=$translate.instant("aws.system.systemInspection.inspectionType");
        self.inspectionItemFile=$translate.instant("aws.system.systemInspection.inspectionItem");
        self.expectedResultsFile=$translate.instant("aws.system.systemInspection.expectedResults");
        self.actualResultsFile=$translate.instant("aws.system.systemInspection.actualResults");
        self.statusFile=$translate.instant("aws.system.systemInspection.status");
        self.allItems=[];
        self.tableList={};
        self.inspection={};

        //防止直接详情刷新
        if($location.search().id){
           $location.search({});
        }

        self.systemCheckHelp=function(){
            $location.search({id:'help'});
        };

        //毫秒数时间转化
        function MillisecondToDate(msd) {
            var time = parseFloat(msd) /1000;
            if (null!= time &&""!= time) {
                if(time<1){
                    time = msd +$translate.instant("aws.system.systemInspection.millisecond");
                }else if(time>=1&&time<60){
                    time = parseInt(time) +$translate.instant("aws.system.systemInspection.second");
                }else if (time >=60&& time <60*60) {
                    let  second=(parseInt((parseFloat(time /60.0) - parseInt(time /60.0)) *60))?(parseInt((parseFloat(time /60.0) -
                    parseInt(time /60.0)) *60))+$translate.instant("aws.system.systemInspection.second"):"";
                    time = parseInt(time /60.0) +$translate.instant("aws.system.systemInspection.minute")+ second;
                }else if (time >=60*60&& time <60*60*24) {
                    var minute=(parseInt((parseFloat(time /3600.0) -parseInt(time /3600.0)) *60))?((parseInt((parseFloat(time /3600.0) -parseInt(time /3600.0)) *60))+$translate.instant("aws.system.systemInspection.minute")):"";
                    var second=(parseInt((parseFloat((parseFloat(time /3600.0) - parseInt(time /3600.0)) *60) -
                    parseInt((parseFloat(time /3600.0) - parseInt(time /3600.0)) *60)) *60))? ((parseInt((parseFloat((parseFloat(time /3600.0) - parseInt(time /3600.0)) *60) -
                    parseInt((parseFloat(time /3600.0) - parseInt(time /3600.0)) *60)) *60))+$translate.instant("aws.system.systemInspection.second")):"" ;
                    time = parseInt(time /3600.0) +$translate.instant("aws.system.systemInspection.hour")+ minute+second;
                }else {
                    time = parseInt(time) +$translate.instant("aws.system.systemInspection.second");
                }
            }else{
                time = "";
            }
            return time;
        }

        //获取巡检项列表
        self.startCheck=function(){
            //清空之前的操作
            self.taskId='clickStartButton';
            self.allItems=[];
            self.nomalNum=0;
            self.exceptionNum=0;
            self.failureNum=0;
            self.inapplicableNum=0;
            self.inspection.isShowResult=false;
            self.inspection.checkFail=false;
            self.canStopCheck=false;
            self.canStartChek=false;
            self.canExportCheckResult=false;
            systemInspectionSrv.getCheckList().then(function(res){
                if(res&&res.data&&angular.isArray(res.data)){
                    self.checkList=res.data;
                    var checkUrl=[];
                    self.checkList.map(function(item){
                       self.allItems=self.allItems.concat(item.items);
                       self.tableList[item.name+"Table"]=new NgTableParams({
                            count: 100
                        }, {
                            counts: [],
                            dataset: item.items
                        });
                    });
                    self.allItems.forEach(function(item,index){
                        if(item.key){
                          checkUrl.push(item.id);
                        } 
                    });
                    var options={
                       "checkItemIds":checkUrl
                    };
                    //获取检查结果
                    systemInspectionSrv.getCheckItemResult(localStorage.regionKey,options);
                }   
            });
        };
        
        //巡检项异常详情展示
        self.$on("getDetail", function(event, value) {
             //防止直接在详情中刷新
             if(self.checkList){
                 self.exceptionCheckList=angular.copy(self.checkList);
                 self.exceptionCheckList.forEach(function(check){
                      check.normalNum=0;
                      check.exceptionNum=0;
                      check.items.forEach(function(item){
                          if(item.status=='normal'){
                             check.normalNum++;
                          }else if(item.status=='exception'||item.status=='failure'){
                             check.exceptionNum++;
                          }
                      });
                 });
             }
        });

        self.goErrorDetails = function(){
            window.location.href = "#/system/systeminspection?id=123"
            // $location.path(encodeURI("#/system/systeminspection?id=123"))
        }

        //接收到巡检结果
        self.nomalNum=0;
        self.exceptionNum=0;
        self.failureNum=0;
        self.inapplicableNum=0;
        //是否可以终止
        self.canStopCheck=false;
        self.canExportCheckResult=false;
        self.canStartChek=true;
        self.stopingCheck=false;
        self.inspection.isShowResult=false;
        self.inspection.checkFail=false;
        self.$on("systemMonitor", function(e, data) {
            //对整个系统的操作，开始，终止，结束
            if(data.type=="Monitor_SystemCheckerMessage"){
               if(angular.isObject(data.body)){
                  if(data.body.status=="START"){
                     if(self.taskId=='clickStartButton'){
                        self.taskId=data.body.taskId;
                     }
                     if(data.body.taskId==self.taskId){
                        self.canStopCheck=true;
                        self.canStartChek=false;
                        self.canExportCheckResult=false;
                     }
                  }else if(data.body.status=="BREAKING"&&data.body.taskId==self.taskId){
                     self.canStopCheck=false;
                     self.canStartChek=false;
                     self.canExportCheckResult=false;
                     self.stopingCheck=true;
                  }else if(data.body.status=="END"&&data.body.taskId==self.taskId){
                     self.inspection.isShowResult=true;
                     self.canStopCheck=false;
                     self.canExportCheckResult=true;
                     self.canStartChek=true;
                     self.stopingCheck=false;
                     self.totalCeckItem=0;
                     var time=data.body.endTimeMillis-data.body.startTimeMillis;
                     self.consumingTime=MillisecondToDate(time);
                     if(self.checkList){
                        self.checkList.forEach(function(check){
                             check.items.forEach(function(item){
                                 if(item.isShow){
                                    self.totalCeckItem++;
                                 }
                             });
                        });
                     }
                  }
               }
            }else if(data.type=='Monitor_SubcheckerMessage'){
              if(!data.body&&data.taskId==self.taskId){
                  operateSocketData(data,self.checkList,self.stopingCheck);
              }else if(angular.isObject(data.body)){
                  if(data.body.taskId==self.taskId){
                     operateSocketData(data.body,self.checkList,self.stopingCheck);
                  }
              }
            }
            self.$apply();
        });

        function operateSocketData(soketData,list,stopingCheck){
           soketData.checkStatus=soketData.checkStatus?soketData.checkStatus:soketData.status;
           if(soketData.checkerKey&&(soketData.checkStatus=='NORMAL'||soketData.checkStatus=='EXCEPTION'||soketData.checkStatus=='FAILURE'||soketData.checkStatus=='INAPPLICABLE')){
             //针对终止巡检项之后的一个子选项而言，此时不能再进行终止操作
             if(stopingCheck){
                self.canStopCheck=false; 
             }else{
                self.canStopCheck=true; 
             } 
             self.canExportCheckResult=false;
             if(self.checkList){
                self.checkList.forEach(function(check){
                     check.items.forEach(function(item){
                         if(item.key==soketData.checkerKey){
                            //大项的显示
                            check.isShow=true;
                            //大项中的小项
                            item.isShow=true;
                            item.result=[];
                            item.status=soketData.checkStatus.toLowerCase();
                            if(item.status=='normal'){
                               self.nomalNum++;
                               item.result=soketData.message;
                            }else if(item.status=='exception'){
                               self.exceptionNum++;
                               item.result=soketData.message;
                            }if(item.status=='failure'){
                               item.result='巡检失败';
                               self.failureNum++;
                            }if(item.status=='inapplicable'){//INAPPLICABLE
                               item.result=soketData.message;
                               self.inapplicableNum++;
                            }
                            item.state=$translate.instant("aws.system.systemInspection."+soketData.checkStatus);
                         } 
                     });
                 });
             }
           }
        }
        
        // 过滤出需要在CSV文件中显示的字段。   
        self.allDataList=[];
        self.downloadAllData = function () {
            if(self.checkList){
                let downLoadData=angular.copy(self.checkList);
                downLoadData.forEach(function(check){
                    check.items.forEach(function(item){
                        if(item.isShow){
                              var arr=[];
                              if(item.result){
                                 item.result=item.result.replace(/<br>/g,",");
                              }
                              arr.push(check.name,item.name,item.expectedResult,item.result,item.state); 
                              self.allDataList.push(arr);
                        } 
                    });  
                });
            }
            return self.allDataList;
        };

        //终止巡检
        self.stopCheck=function(){
           systemInspectionSrv.stopCheck(localStorage.regionKey,self.taskId);
        };

        function operateLastCheckResult(taskId,checkList,type){
            systemInspectionSrv.getLastSystemCheckResult(localStorage.regionKey,taskId).then(function(result){
                if(result&&result.data&&angular.isArray(result.data)){
                   result.data.map(function(item){
                       checkList.forEach(function(check){
                             check.items.forEach(function(checkItem){
                                 if(checkItem.key==item.checkKey){
                                    //大项的显示
                                    check.isShow=true;
                                    checkItem.result=[];
                                    checkItem.status=item.checkStatus.toLowerCase();
                                    if(checkItem.status=='normal'){
                                       if(!checkItem.isShow){
                                          self.nomalNum++;
                                       }
                                       checkItem.result=item.checkMessage;
                                    }else if(checkItem.status=='exception'){
                                       if(!checkItem.isShow){
                                          self.exceptionNum++;
                                       }
                                       checkItem.result=item.checkMessage;
                                    }if(checkItem.status=='failure'){
                                       if(!checkItem.isShow){
                                          self.failureNum++;
                                       }
                                       checkItem.result='巡检失败';
                                    }if(checkItem.status=='inapplicable'){//INAPPLICABLE
                                       if(!checkItem.isShow){
                                          self.inapplicableNum++;
                                       }
                                       checkItem.result=item.checkMessage;
                                    }
                                    //大项中的小项
                                    checkItem.isShow=true;
                                    checkItem.state=$translate.instant("aws.system.systemInspection."+item.checkStatus);
                                 } 
                             });
                       });
                   });
                   if(type=='end'){
                      //上一次的巡检结果统计
                      self.totalCeckItem=0;
                      self.checkList.forEach(function(check){
                         check.items.forEach(function(item){
                             if(item.isShow){
                                self.totalCeckItem++;
                             }
                         });
                      });
                      //上一次的巡检用时统计
                      let len=result.data.length;
                      var time=result.data[len-1].checkTime-result.data[0].checkTime;
                      self.consumingTime=MillisecondToDate(time);
                   }
                }
            });
        }

        //判断是否有巡检正在执行，以及执行的巡检的状态
        systemInspectionSrv.getSystemcheckStatus(localStorage.regionKey).then(function(res){
           //有过巡检记录(没有巡检记录不用做判断，直接初始化页面)
           if(res&&res.data&&angular.isObject(res.data)){
              //上一次巡检没有结束
              if(res.data.checkStatus!='END'){
                 //先获取所有巡检项的列表，初始化table
                 systemInspectionSrv.getCheckList().then(function(result){
                    if(result&&result.data&&angular.isArray(result.data)){
                        self.checkList=result.data;
                        self.checkList.map(function(item){
                           self.tableList[item.name+"Table"]=new NgTableParams({
                                count: 100
                            }, {
                                counts: [],
                                dataset: item.items
                            });
                        });
                        if(res.data.checkStatus=='START'){
                            self.canStopCheck=true;
                            self.canStartChek=false;
                            self.canExportCheckResult=false;
                        }else if(res.data.checkStatus=='BREAKING'){
                            self.canStopCheck=false;
                            self.canStartChek=false;
                            self.canExportCheckResult=false;
                            self.stopingCheck=true;
                        }
                        self.taskId=res.data.checkTaskId;
                        operateLastCheckResult(self.taskId,self.checkList,'checking');
                    }   
                 });
              }else if(res.data.checkStatus=='END'){
              //上一次巡检结束，直接显示上一次的全部巡检结果
                 systemInspectionSrv.getCheckList().then(function(result){
                    if(result&&result.data&&angular.isArray(result.data)){
                        self.checkList=result.data;
                        self.checkList.map(function(item){
                           self.tableList[item.name+"Table"]=new NgTableParams({
                                count: 100
                            }, {
                                counts: [],
                                dataset: item.items
                            });
                        });
                        self.taskId=res.data.checkTaskId;
                        operateLastCheckResult(self.taskId,self.checkList,'end');
                        self.inspection.isShowResult=true;
                        self.canExportCheckResult=true; 
                    }   
                 });
              }
           }
        });

    }]);
