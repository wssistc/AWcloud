var emptyModule = angular.module("emptyModule", []);

emptyModule.directive("emptyTip", ["$translate",function(translate){
    return {
        restrict: "EA",
        scope:{
            "emptyType":"=",
            "tipId":"="
        },
        link: function(scope, element){
            var p = document.createElement("div");
            p.id = scope.tipId || "tip-msg";
            var ele = element[0].parentNode.getElementsByTagName("tbody")[0];
            //scope.emptyType = false;
            var setLoadingTip = function(){
                if(!scope.emptyType){
                    //p.innerHTML= translate.instant("aws.common.loading");
                    element[0].parentNode.appendChild(p);
                }
            };
            setLoadingTip();

            var setEmptyTip = function(){
                if(!document.getElementById(p.id)){
                    element[0].parentNode.appendChild(p);
                }
                document.getElementById(p.id).innerHTML=  translate.instant("aws.common.empty");
            };
            
            scope.$watch(function(){
                return ele.getElementsByTagName("tr").length; 
            },function(len){
                if(len){
                    if(document.getElementById(p.id)){
                        document.getElementById(p.id).innerHTML= "";
                        $("#"+p.id).addClass("hide");
                    }
                }else{
                    if(scope.emptyType && ele.getElementsByTagName("tr").length==0){
                        setEmptyTip();
                    }
                    setLoadingTip();
                    $("#"+p.id).removeClass("hide");
                }
            });
            
            scope.$watch(function(){
                return scope.emptyType; 
            },function(val){
                if(val && ele.getElementsByTagName("tr").length==0 ){
                    setEmptyTip()
                }else{
                    if(document.getElementById(p.id) && document.getElementById(p.id).innerHTML){
                        //document.getElementById(p.id).innerHTML= translate.instant("aws.common.loading");
                    }
                }
            });
            
        }
    };
}]);
emptyModule.directive("loadingData",[function(){
    return {
        restrict: "EA",
        scope:{
            data:"="
        },
        template:`<div>
                    <p ng-if='noData'>{{'aws.common.empty'|translate}}</p>
                    <p ng-if='failedData'>数据加载失败</p>
                </div>`,
        link:function(scope){
            //$(".global-loading").addClass("hide");
            scope.$watch(function(){
                return scope.data;
            },function(data){
                scope.noData = false;
                scope.failedData = false;
                if(data){
                    if(data instanceof Array && data.length == 0){
                        scope.noData = true;
                    }else{
                        scope.noData=false;
                    }
                }else{
                    scope.noData = false;
                }
            });
        }
    };
}]);

emptyModule.directive("copyText",[function(){
    return {
        restrict: "EA",
        link:function(scope,elem,attr){
            var c = attr.copytarget;
            scope.copytext = "Copy";
            elem.on("click", function(){
                var inp = (c ? document.querySelector(c) : null);
                if (inp && inp.select) { // is element selectable?  判断元素是否能被选中 
                    inp.select();  // select text 选择文本
             
                    try {
                        document.execCommand("copy");  // copy text复制文本
                        scope.copytext = "Copied";
                        inp.blur(); //失去焦点
                    }
                    catch (err) {
                        alert("please press Ctrl/Cmd+C to copy");
                    }
                }
                scope.$apply();
            });
        }
    };
}]);
emptyModule.directive("lazyLoading",["$window","$compile","$rootScope",function($window,$compile,$rootScope){
    return {
        restrict:"A",
        link:function(scope,ele,attr,ngmodal){
            scope.scrtop = 0;
            var winH,contentH,currenTop;
            $(window).scrollTop(0);
            $(window).on("scroll",function(){
                winH = $(window).height();
                contentH = $('html').height();
                currenTop = $(window).scrollTop();
                if(Object.keys($rootScope.lazyOnType).length >0){
                    if(contentH - winH <= currenTop && currenTop >= scope.scrtop && $rootScope.lazyOnType[Object.keys($rootScope.lazyOnType)[Object.keys($rootScope.lazyOnType).length-1]]){
                        for(let key in $rootScope.lazyOnType){
                            if($rootScope.lazyOnType[key] && $rootScope.loading){
                                $rootScope.lazyOnType[key] = false;
                                setTimeout(function(){
                                    $rootScope.$broadcast(key);
                                },100)
                                break;
                            }
                        }
                        $(window).scrollTop(currenTop - 1);
                        scope.scrtop = currenTop - 1;
                    } 
                }
            })
        }
    }
}])
emptyModule.directive("modalDialog",["$window","$timeout",function($window,$timeout){
    return {
        restrict:"C",
        link:function(scope,ele){
            scope.$watch(function(){
                return $(ele).find(".modal-common").outerHeight();
            },function(ne,old){
                if(!ne){
                    return;
                }
                if(ne!=old){
                    let winH = $(window).outerHeight();
                    let eleH = $(ele).find(".modal-common").outerHeight();
                    if((eleH-(winH-0.1*winH))>=0){
                        $(ele).parent(".modal").addClass("modal-absolute")
                    }else{
                        $(ele).parent(".modal").removeClass("modal-absolute")
                    }
                }
                $(window).on("resize",function(){
                    let winH = $(window).outerHeight();
                    let eleH = $(ele).find(".modal-common").outerHeight();
                    if((eleH-(winH-0.1*winH))>=0){
                        $(ele).parent(".modal").addClass("modal-absolute")
                    }else{
                        $(ele).parent(".modal").removeClass("modal-absolute")
                    }
                })
            })
        }
    }
}])
emptyModule.directive("rangeTime",["$rootScope",function($rootScope){
    return {
        restrict: "A",
        link:function(scope,elem,attr){
            function getNowFormatDate(date) {
                var seperator1 = "-";
                var seperator2 = ":";
                var month = date.getMonth() + 1;
                var strDate = date.getDate();
                if (month >= 1 && month <= 9) {
                    month = "0" + month;
                }
                if (strDate >= 0 && strDate <= 9) {
                    strDate = "0" + strDate;
                }
                var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate
                        + " " + date.getHours() + seperator2 + date.getMinutes()
                        + seperator2 + date.getSeconds();
                return currentdate;
            }

            $('.form_date').datetimepicker({
                language: "zh-CN",
                weekStart: 1,
                todayBtn: 1,
                autoclose: 1,
                todayHighlight: 1,
                //startView: 2, 
                minuteStep:5,
                forceParse: 0,
                format: "yyyy-mm-dd hh:ii",
                pickerPosition: "bottom-left",
                
            });
             var date = new Date();
             $('.form_date').datetimepicker('setStartDate', getNowFormatDate(date));

             
        }
    };
}]);
emptyModule.directive("getIframeHeight",[function(){
    return {
        restrict:"A",
        link:function(scope,ele){
            var iframe = document.getElementById("previewFrame"); 
            scope.$watch(function(){
                return $(ele).find("#previewFrame")[0].contentWindow.document.documentElement.scrollHeight;
            },function(ne,old){
                console.log(ne)
                if(ne>0){
                    iframe.style.height = ne+"px" ;
                }
            })
            
            
        }
    }
}])

