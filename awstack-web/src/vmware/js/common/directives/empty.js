var emptyModule = angular.module("emptyModule", []);

emptyModule.directive("emptyTip", ["$translate",function(translate){
    return {
        restrict: "EA",
        scope:{
            "emptyType":"="
        },
        link: function(scope, element){
            var p = document.createElement("p");
            p.id = "tip-msg";
            var ele = element[0].parentNode.getElementsByTagName("tbody")[0];
            //scope.emptyType = false;
            if(!scope.emptyType){
                p.innerHTML= translate.instant("aws.common.loading");
                element[0].parentNode.appendChild(p);
            }
            scope.$watch(function(){
                return ele.getElementsByTagName("tr").length; 
            },function(len){
                if(len){
                    if(document.getElementById(p.id)){
                        document.getElementById(p.id).innerHTML= "";
                    }
                }

            });
            scope.$watch(function(){
                return scope.emptyType; 
            },function(val){
                if(val && ele.getElementsByTagName("tr").length==0 ){
                    if(!document.getElementById(p.id)){
                        element[0].parentNode.appendChild(p);
                    }
                    document.getElementById(p.id).innerHTML=  translate.instant("aws.common.empty");
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
        template:"<div>\
                    <p ng-if='dataLoading'>{{'aws.common.loading'|translate}}</p>\
                    <p ng-if='noData'>{{'aws.common.empty'|translate}}</p>\
                </div>",
        link:function(scope){
            
            scope.$watch(function(){
                return scope.data;
            },function(data){
                if(data){
                    scope.dataLoading = false;
                    if(data instanceof Array && data.length == 0){
                        scope.noData = true;
                    }
                }else{
                    scope.noData = false;
                    scope.dataLoading = true;
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
                            if($rootScope.lazyOnType[key] && scope.loading){
                                $rootScope.lazyOnType[key] = false;
                                $rootScope.$broadcast(key);
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
emptyModule.directive("modalDialog",["$window",function($window){
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
                    if(eleH-winH>=0){
                        $(ele).parent(".modal").addClass("modal-absolute")
                    }else{
                        $(ele).parent(".modal").removeClass("modal-absolute")
                    }
                }
                $(window).on("resize",function(){
                    let winH = $(window).outerHeight();
                    let eleH = $(ele).find(".modal-common").outerHeight();
                    if(eleH-winH>=0){
                        $(ele).parent(".modal").addClass("modal-absolute")
                    }else{
                        $(ele).parent(".modal").removeClass("modal-absolute")
                    }
                })
            })
        }
    }
}])

/*document.body.addEventListener('click', copy, true);
function copy(e) {
    var t = e.target,
        c = t.dataset.copytarget,
        inp = (c ? document.querySelector(c) : null);
    if (inp && inp.select) { // is element selectable?  判断元素是否能被选中 
      inp.select();  // select text 选择文本
 
      try {
        document.execCommand('copy');  // copy text复制文本
        //inp.blur(); //失去焦点
      }
      catch (err) {
        alert('please press Ctrl/Cmd+C to copy');
      }
 
    }
 
}*/

export default emptyModule.name;