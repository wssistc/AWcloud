var emptyModule = angular.module("emptyModule", []);

emptyModule.directive("emptyTip", ["$translate",function(translate){
    return {
        restrict: "EA",
        scope:{
            "emptyType":"="
        },
        link: function(scope, element){
            var p = document.createElement("p");
            p.id="tip-msg";
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
                    document.getElementById("tip-msg").innerHTML= "";
                }

            });
            scope.$watch(function(){
                return scope.emptyType; 
            },function(val){
                if(val && ele.getElementsByTagName("tr").length==0 ){
                    document.getElementById("tip-msg").innerHTML=  translate.instant("aws.common.empty");
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
        /*scope:{
            lazyOn:"="
        },*/
        /*template:function(){
            return document.getElementById('lazy').innerHTML;
        },*/
         link:function(scope,ele,attr,ngmodal){
            scope.scrtop = 0;
            var winH,contentH,currenTop;
            $(window).scrollTop(0);
            $(window).on("scroll",function(){
                winH = $(window).height();
                contentH = $('html').height();
                currenTop = $(window).scrollTop();
                scope.$on("routeChangeSuccess",function(e){
                    if($rootScope.lazyOnType.length - 1>=0){
                        $rootScope.lazyOnType = $rootScope.lazyOnType.map(function(item){
                            item.on = true;
                            return item;
                        });
                    }
                })
                if($rootScope.lazyOnType.length - 1>=0){
                    if(contentH - winH <= currenTop && currenTop >= scope.scrtop && $rootScope.lazyOnType[$rootScope.lazyOnType.length - 1].on){
                        for(var i=0;i<$rootScope.lazyOnType.length;i++){
                            if($rootScope.lazyOnType[i].on==true && scope.loading){
                                $rootScope.lazyOnType[i].on = false;
                                ele.append($compile(document.getElementById($rootScope.lazyOnType[i].type).innerHTML)(scope));
                                scope.$emit($rootScope.lazyOnType[i].type);
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
}]);
emptyModule.directive("pageComponent",[function(){
    function countPage(totalNum,pageStep,currentPage){
        var pages = [];
        var _length = Math.ceil(totalNum / pageStep);
        if(_length>1){
            pages.push({
                type:"first",
                number: 1
            })
            var maxPivotPages = 2;//5
            var minPage = Math.max(2, currentPage - maxPivotPages);//
            var maxPage = Math.min(_length - 1, currentPage + maxPivotPages * 2 - (currentPage - minPage));
            minPage = Math.max(2, minPage - (maxPivotPages * 2 - (maxPage - minPage)));
            for(let i=minPage;i<=maxPage;i++){
                if((i==minPage && i!=2) || (i==maxPage && i !=_length - 1)){
                    pages.push({
                        type: 'more'
                    })
                }else{
                   pages.push({
                        number:i,
                        type:"page"
                    }); 
                }
                
            }
            pages.push({
                type: 'last',
                number: _length
            });
        }
        
        return pages;
    }
    return {
        restrict:"E",
        scope:{
            total:"=",
            changePage:"&",
            step:"="
        },
        templateUrl:"/tmpl/page.html",
        replace:true,
        link:function(scope,ele){
            scope.$watch(function(){
                if(scope.total){
                    return scope.total+','+scope.step;
                }
            },function(ne){
                if(scope.total>0){
                    scope.totalNum = ne.split(",")[0];
                    scope.pageStep = ne.split(",")[1];
                    scope.numPages = Math.ceil(scope.totalNum/scope.pageStep);
                    scope.currentPage = 1;
                    if(scope.totalNum&&scope.totalNum>0){
                        scope.pages = countPage(scope.totalNum,scope.pageStep,scope.currentPage);
                    } 
                }else{
                    scope.pages = [];
                }
                
            })
            scope.goPage = function(item){
                if(item.number){
                    if(scope.currentPage == item.number){
                        return;
                    };
                    scope.currentPage = item.number;
                    scope.prevDisabled = scope.currentPage == 1;
                    scope.nextDisabled = scope.currentPage == scope.numPages;
                    var postData = {
                        limit:scope.step,
                        offset:(scope.currentPage - 1)*scope.step
                    }
                    scope.changePage({obj:postData});
                    scope.pages = countPage(scope.totalNum,scope.pageStep,scope.currentPage)
                }
            }
            scope.prevNext = function(type){
                if(type=='prev'){
                    if(scope.currentPage==1){return;}
                    scope.currentPage = scope.currentPage-1>0?scope.currentPage-1:1;
                    scope.nextDisabled = scope.currentPage == scope.numPages;
                    scope.prevDisabled = scope.currentPage == 1;
                }else if(type=='next'){
                    if(scope.currentPage==scope.numPages){return;}
                    scope.currentPage = scope.currentPage+1<scope.numPages?scope.currentPage+1:scope.numPages
                    scope.nextDisabled = scope.currentPage == scope.numPages;
                    scope.prevDisabled = scope.currentPage == 1;
                }
                var postData = {
                    limit:scope.step,
                    offset:(scope.currentPage - 1)*scope.step
                }
                scope.changePage({obj:postData});
                scope.pages = countPage(scope.totalNum,scope.pageStep,scope.currentPage)
            }
        }
    }
}]);
emptyModule.directive("paging",[function(){
    return {
        restrict: "EA",
        scope:{
            onData:"&",
            totalCount:"@",
            pageCount:"@",
            selectItems:"@"
        },
        templateUrl:"tmpl/paging.html",
        controller:function($scope){
            var self=$scope
            self.offset=0;
            self.pageNumList=[{name:2,value:2},{name:5,value:5},{name:10,value:10}];
            self.pageNum=self.pageNumList[0];
            self.changePageNum=function(page){
                self.pageNum=page;
            }
            self.currentPage=1;
            function clickButton(){
                if(self.currentPage==1){
                    self.fristButton=false;
                    self.forwardButton=false;
                }else{
                    self.fristButton=true;
                    self.forwardButton=true;
                }
                if(self.currentPage==self.pageCount){
                    self.backButton=false;
                    self.lastButton=false;
                }else{
                    self.backButton=true;
                    self.lastButton=true;
                }
            }
            self.$watch(function(){
                return self.pageNum.value;
            },function(value){
                self.currentPage=1;
                self.offset=(self.currentPage-1)*self.pageNum.value;
                self.onData({a:self.offset,b:value});
                self.pageCount=Math.ceil(self.totalCount/value);
                clickButton();
            });
            self.firstPage=function(){
                self.currentPage=1;
            };
            self.lastPage=function(){
                self.currentPage=self.pageCount;
            };
            self.forward=function(){
                self.currentPage=self.currentPage-1;
            };
            self.back=function(){
                self.currentPage=self.currentPage+1;
            };
            self.$watch(function(){
                return self.currentPage
            },function(){
                self.offset=(self.currentPage-1)*self.pageNum.value;
                self.onData({a:self.offset,b:self.pageNum.value});
                clickButton();
            });
                    
        }
    };
}])
emptyModule.directive("taNav",[function(){
    return {
        restrict:"EA",
        replace:true,
        scope:{
            onSelect:"&",
            tablist:"=",
            active:"="
        },
        templateUrl:"tabTmpl.html",
        link:function(scope,ele){
            ele.find("li").each(function(i){
                $(this).on('click',function(){
                    $(this).addClass("active").siblings("li").removeClass("active");
                    $(this).parent().siblings(".dt-content").children(".tab-pane").removeClass("active");
                    $(this).parent().siblings(".dt-content").children(".tab-pane").eq(i).addClass("active");
                })
                
            })

            scope.selectTab = function(item){
                scope.active = item.active;
                scope.onSelect({obj:item});
            }
        }
    }
}]);
emptyModule.run(['$templateCache', function ($templateCache) {
    var tabTmpl = [
    '<ul>',
    '<li ng-repeat="item in tablist track by $index" ng-class="{active:active==item.active}" ng-click="selectTab(item)"><a><span ng-bind="item.title"></span></a></li>',
    '</ul>'
    ];
    $templateCache.put('tabTmpl.html',tabTmpl.join(""))
    //console.log(tabTmpl.join(""))
}]);
emptyModule.directive("copy",[function(){
    return {
        restrict: "A",
        link:function(scope,elem,attr){
            elem.zclip({  
                path: 'tmpl/ZeroClipboard.swf',  
                copy: function(){  
                    return angular.element(attr.copy).text();  
                },  
                beforeCopy: function(){  
                      
                },  
                afterCopy: function(){  
                  var $copysuc = $("<div class='copy-tips'><div class='copy-tips-wrap'>复制成功</div></div>");
                    $("body").find(".copy-tips").remove();
                    elem.after($copysuc);
                    $(".copy-tips").fadeOut(2000);
                }  
            });    
        }
    };
}]);

emptyModule.directive("rangeTime",["$rootScope",function($rootScope){
    return {
        restrict: "A",
        scope:{
            intime:"=",
        },
        link:function(scope,elem,attr){
            $('input[name="startTime"]').daterangepicker({
                locale: {
                    "format": 'YYYY-MM-DD',
                    "separator": "至"
                },
                "singleDatePicker": true,
                "startDate": moment(scope.intime).format('YYYY-MM-DD'),
            }); 
             
        }
    };
}]);

emptyModule.directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.ngEnter);
                });
 
                event.preventDefault();
            }
        });
    };
});


emptyModule.directive('tableHide',["$rootScope","$routeParams",function($rootScope,$routeParams){
    return {
        restrict: "A",
        link:function(scope,elem,attr){
            scope.$watch(function(){
                return $routeParams.id
            },function(val){
                val ? elem.addClass('tableHide') : elem.removeClass('tableHide');
            })

        }
    }
}])