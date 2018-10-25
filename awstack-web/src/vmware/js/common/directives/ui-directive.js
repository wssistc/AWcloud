var UIModule = angular.module("UIModule", []);
UIModule.directive("uiAlert",[function(){
    return {
        restrict:"E",
        replace:true,
        //scope:{},
        template:
        `<div class="delete-wrap" ng-show="showAlert">
            <div class="delete-alert" ng-class="{'delete-show':showAlert}">
              <div class="alert"
                ng-class="{
                    'warning':'alert-warning',
                    'success':'alert-success',
                    'danger':'alert-danger'
                }[type]"
              >
                <button type="button" class="close" ng-click="AlertClose()">
                  <span>×</span>
                  <span class="sr-only">Close</span>
                </button>
                <div class="del-cont"><span>{{message}}</span></div>
                <div class="btn-item">
                  <button type='button' class='btn' ng-click='AlertConfirm()'
                    ng-class="{
                        'warning':'btn-warning',
                        'success':'btn-primary',
                        'danger':'btn-danger'
                    }[type]"
                  >{{'vmware.action.ok'|translate}}</button>
                  <button type='button' class='btn btn-default' ng-click="AlertClose()">{{'vmware.action.cancel'|translate}}</button>
                </div>
              </div>
            </div>
        </div>`,
        link:function(scope){
            let context,recData;
            scope.$on("ui-tag-alert",function(e,data){
                scope.showAlert = true;
                scope.message = data.msg;
                scope.type = data.type||"success";
                context = e.targetScope;
                recData = data;
            });
            scope.AlertClose = function(){
                context = null;
                recData = null;
                scope.showAlert = false;
            }
            scope.AlertConfirm = function(){
                context[recData.func]();
                context = null;
                recData = null;
                scope.showAlert = false;
            }
        }
    }
    
}])
UIModule.directive("uiBubble",["$timeout",function($timeout){
    /*
        let data = {
            msg: "无法关闭客户机操作系统",
            type: "danger"||"error",
            keep:false,
            id:id||""
        };
    */
    return {
        restrict:"E",
        replace:true,
        template:
        `<div class="page-alert-list" ng-class="{'show-dash-alert':BubbleList}">
            <div ng-repeat='item in BubbleList track by $index' class="alert"
                ng-class="{
                    'building':'alert-building',
                    'success':'alert-success',
                    'warning':'alert-warning',
                    'error':'alert-error',
                    false:'alert-error'
                }[item.type]"
            >
              <button type="button" class="alert-close" ng-click="BubbleClear(item,$index)">
                <i class="icon-aw-wrong"></i>
              </button>
              <div class="alert-title"></div>
              <div>
                  <span ng-bind="item.msg"></span>
                  <i ng-show="item.type=='building'" class="icon-aw-refresh aw-spin"></i>
              </div>
            </div>
        </div>`,
        link:function(scope){
            scope.BubbleList = [];
            scope.$on("ui-tag-bubble",function(e,data){
                if(data.id){
                    scope.BubbleList = scope.BubbleList.filter(item=>item.id!=data.id);
                }
                data.type=data.type||"error";
                scope.BubbleList.unshift(data);
                
                if(data.keep){
                    return;
                }else{
                    $timeout(function(){
                        let numFlag;
                        scope.BubbleList.filter((item,index)=>{
                            if(!item.keep){
                                numFlag = index;
                            }
                        });
                        scope.BubbleList.splice(numFlag,1);
                    },5000)
                };
                
            })
            scope.BubbleClear = function(item,index){
                scope.BubbleList.splice(index,1);
            }
        }
    }
    
}])


export default UIModule.name;
