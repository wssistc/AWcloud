var validateModule = angular.module("validateModule", []);


validateModule.directive("limitnumrange",function(){
    return {
        restrict:"A",
        require:"ngModel",
        scope:{
            min:"=",
            max:"="
        },
        link:function(scope,elem,attrs,ngModel){
            var reg = /^(0|[1-9][0-9]*|(-?0)(\.\d+)?)$/; //检验大于等于min 小于等于max的数，包括小数
            ngModel.$parsers.push(function(viewValue){
                var val = Number(viewValue);
                if(val < Number(scope.min) || val > Number(scope.max) || !reg.test(viewValue)){
                    ngModel.$setValidity("limitnumrange",false);
                }else{
                    ngModel.$setValidity("limitnumrange",true);
                }
                return viewValue;
            });

        }
    };
});






validateModule.directive("numRange",function(){
    return {
        restrict:"A",
        require:"ngModel",
        scope:{
            min:"=",
            max:"=",
            step:"="
        },
        link:function(scope,elem,attrs,ngModel){

            var reg = new RegExp("^(0|[1-9][0-9]*)$");
            var step = scope.step || 1;

            ngModel.$parsers.push(function(viewValue){
                var val = Number(viewValue);
                var step = scope.step || 1;
                if(val>=0){
                    if(val>=Number(scope.min)&&val<=Number(scope.max)){
                        ngModel.$setValidity("numRange",true);
                        if(Number(scope.min)<step){
                            if(val<step){
                                if(val>(step-Number(scope.min))/2){
                                    return step;
                                }else{
                                    return scope.min;
                                }
                            }else{
                                return viewValue
                            }
                        }else{
                            return viewValue
                        }
                    }else{
                        ngModel.$setValidity("numRange",false);
                        if(val > Number(scope.max)){//输入值大于最大值
                            return scope.max
                        }else{//输入值小于最小值
                            return scope.min;
                        } 
                    } 
                }else{
                    ngModel.$setValidity("numRange",false);
                    return scope.min
                }
                
            });

            
            $(elem).on("keydown",function(e){
                if((e.keyCode<=57&&e.keyCode>=48)||(e.keyCode<=105&&e.keyCode>=96)||e.keyCode==8||e.keyCode==37||e.keyCode==39||e.keyCode==46){
                }else{
                    return false;
                }
            })
            $(elem).on("blur",function(e){
                var val = Number($(elem).val());
                var step = scope.step || 1;
                var modalValue
                if(val>=0){
                    if(val>=Number(scope.min)&&val<=Number(scope.max)){
                            if(Number(scope.min)<step){
                                if(val<step){
                                    if(val>(step-Number(scope.min))/2){
                                        modalValue = step;
                                    }else{
                                        modalValue = scope.min;
                                    }
                                }else{
                                    modalValue = val
                                }
                            }else{
                                modalValue = val
                            }
                    }else{
                        if(val > Number(scope.max)){//输入值大于最大值
                            modalValue = scope.max
                        }else{//输入值小于最小值
                            modalValue =  scope.min;
                        } 
                    } 
                }else{
                    modalValue = scope.min
                }
                scope.$apply(function(){
                    ngModel.$setViewValue(modalValue);
                    $(elem).val(modalValue);
                    console.log(ngModel);
                });
            })

        }
    };
});


validateModule.directive("minmax",function(){
    return {
        restrict:"A",
        require:"ngModel",
        scope:{
            min:"=",
            max:"="
        },
        link:function(scope,elem,attrs,ngModel){
            var reg = new RegExp("^(0|[1-9][0-9]*)$");
            ngModel.$parsers.push(function(viewValue){
                if(Number(angular.element("#"+attrs.minmax).val())){
                    var val = Number(viewValue);
                    if(val < Number(scope.min) || val > Number(scope.max) || !reg.test(viewValue)){
                        ngModel.$setValidity("minmax",false);
                    }else{
                        ngModel.$setValidity("minmax",true);
                    }
                }
                return viewValue;
            });
            scope.$watch(function(){
                return angular.element("#"+attrs.minmax).val();
            },function(startValue){
                if(Number(startValue)){
                    var val = Number(ngModel.$viewValue);
                    if(val < Number(scope.min) || val > Number(scope.max) || !reg.test(ngModel.$viewValue)){
                        ngModel.$setValidity("minmax",false);
                    }else{
                        ngModel.$setValidity("minmax",true);
                    } 
                }
                
            });
        }
    };
});
validateModule.directive("cidr",function(){ //ip地址格式校验(1~255).(0~255).(0~255).(0~255)/(1~31)
    return {
        restrict:"A",
        require:"ngModel",
        link:function(scope,elem,attrs,ngModel){
            var reg = /^((?:(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d))))[\/]([1-9]|[1-2][0-9]|[3][0]|[3][1])$/;
            ngModel.$parsers.push(function(viewValue){
                if(!reg.test(viewValue)){
                    ngModel.$setValidity("cidr",false);
                }else{
                    ngModel.$setValidity("cidr",true);
                }
                return viewValue;
            });
        }
    };
});
validateModule.directive("regpass",function(){ //至少包含字母、数字和字符（_+-&=!@#$%^*()）中的两种
    return {
        restrict:"A",
        require:"ngModel",
        link:function(scope,elem,attrs,ngModel){
            //var reg = /^(?=.*[0-9])(?=.*[a-z])(?=.*[=_-!@#$%^&*])(?=.*[A-Z]).{8,16}$/;
            //var reg = /^([0-9a-zA-Z_+-&=!@#$%^*()]{8,16})$/;
            var reg = /^[0-9]+[^0-9/\s]+|[a-zA-Z]+[^a-zA-Z/\s]+|[^0-9a-zA-Z\s]+[0-9a-zA-Z]+\S*$/;
            //var reg = /^([_\+-\=\!@#$%\*()&\^]+){8,16}$/;
            //var reg = /^((?:a+)(?:b+)){3,6}$/;
            //var reg = /^.*(?=.{8,16})((?=.*[a-zA-Z])|(?=.*\d))(?=.*[!#$%&? "]).*$/;
            //var reg = /^(?=.*\d|?=.*[a-zA-Z])(?=.*[!#\$%&\?]).{8,16}/;
            ngModel.$parsers.push(function(viewValue){
                if(!reg.test(viewValue)){
                    ngModel.$setValidity("regpass",false);
                }else{
                    ngModel.$setValidity("regpass",true);
                }
                return viewValue;
            });
        }
    };
});
validateModule.directive("regNumLet",function(){ //字母数字和.
    return {
        restrict:"A",
        require:"ngModel",
        link:function(scope,elem,attrs,ngModel){
            var reg = /^[0-9|a-z|A-Z|\.|\%]+$/;
            ngModel.$parsers.push(function(viewValue){
                if(!reg.test(viewValue)){
                    ngModel.$setValidity("regNumLet",false);
                }else{
                    ngModel.$setValidity("regNumLet",true);
                }
                return viewValue;
            });
        }
    };
});
validateModule.directive("regUserName",function(){ //由字母，数字、下划线组成、字母开头，字母或数字结尾
    return {
        restrict:"A",
        require:"ngModel",
        link:function(scope,elem,attrs,ngModel){
            var reg = /^([A-Za-z])+\w+[a-zA-Z0-9]+$/;
            ngModel.$parsers.push(function(viewValue){
                if(!reg.test(viewValue)){
                    ngModel.$setValidity("regUserName",false);
                }else{
                    ngModel.$setValidity("regUserName",true);
                }
                return viewValue;
            });
        }
    };
});
validateModule.directive("instanName",function(){ //由字母，数字、下划线组成、字母开头，字母或数字结尾
    return {
        restrict:"A",
        require:"ngModel",
        link:function(scope,elem,attrs,ngModel){
            var reg = /^(\w|[\u4E00-\u9FA5]|\-|\.)*$/;
            ngModel.$parsers.push(function(viewValue){
                if(!reg.test(viewValue)){
                    ngModel.$setValidity("instanName",false);
                }else{
                    ngModel.$setValidity("instanName",true);
                }
                return viewValue;
            });
        }
    };
});
validateModule.directive("cidrorip",function(){ //ip地址格式校验(1~255).(0~255).(0~255).(0~255)/(1~31)  or  (1~255).(0~255).(0~255).(0~255)
    return {
        restrict:"A",
        require:"ngModel",
        link:function(scope,elem,attrs,ngModel){
            var reg1 = /^((?:(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d))))[\/]([1-9]|[1-2][0-9]|[3][0]|[3][1])$/;
            var reg2 = /^((?:(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d))))$/;
            ngModel.$parsers.push(function(viewValue){
                if(!reg1.test(viewValue) && !reg2.test(viewValue)){
                    ngModel.$setValidity("cidrorip",false);
                }else{
                    ngModel.$setValidity("cidrorip",true);
                }
                return viewValue;
            });
        }
    };
});

validateModule.directive("ipaddrpattern",function(){ //ip格式校验(1~255).(0~255).(0~255).(0~255)
    return {
        restrict:"A",
        require:"ngModel",
        scope:{
            ipaddrpattern:"="
        },
        link:function(scope,elem,attrs,ngModel){
            var reg = /^((?:(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d))))$/;
            ngModel.$parsers.push(function(viewValue){
                if(viewValue){
                    if(scope.ipaddrpattern == "one"){
                        if(!reg.test(viewValue)){
                            ngModel.$setValidity("ipaddrpattern",false);
                        }else{
                            ngModel.$setValidity("ipaddrpattern",true);
                        }
                    }else{
                        var inputValue = viewValue.split(","),_inputValue = [];
                        _.each(inputValue,function(item){
                            if(item){
                                _inputValue.push(item);
                                if(reg.test(item)){
                                    ngModel.$setValidity("ipaddrpattern",true);
                                }else{
                                    ngModel.$setValidity("ipaddrpattern",false);
                                    if(_inputValue.length>1){
                                        scope.moreIpError = true;
                                    }else{
                                        scope.moreIpError = false;
                                    }
                                }
                            }else{
                                ngModel.$setValidity("ipaddrpattern",false);
                                scope.moreIpError = true;
                            }
                        });
                    }
                }else{
                    if(!attrs.required){
                       ngModel.$setValidity("ipaddrpattern",true); 
                    }
                }
                return viewValue;
            });
        }
    };
});

validateModule.directive("gtip",function(){ //校验结束ip是否大于等于开始ip
    return {
        restrict:"A",
        require:"ngModel",
        link:function(scope,elem,attrs,ngModel){
            
            ngModel.$parsers.push(function(viewValue){
                scope.$watch(function(){
                    var startValue = angular.element("#"+attrs.gtip).val();
                    return startValue;
                },function(startValue){
                    if(startValue){
                        if(_IP.isV4Format(viewValue)){
                            if(_IP.toLong(viewValue) <= _IP.toLong(startValue)){
                                ngModel.$setValidity("gtip",false);
                            }else{
                                ngModel.$setValidity("gtip",true);
                            }
                        }
                    }else{
                        if(_IP.isV4Format(ngModel.$viewValue) && !attrs.required){
                            ngModel.$setValidity("gtip",false);
                        }else{
                            ngModel.$setValidity("gtip",true);
                        }
                    }
                });
                return viewValue;
            });
            scope.$watch(function(){
                var startValue = angular.element("#"+attrs.gtip).val();
                return startValue;
            },function(startValue){
                if(startValue){
                    if(_IP.isV4Format(ngModel.$viewValue)){
                        if(_IP.toLong(ngModel.$viewValue) <= _IP.toLong(startValue)){
                            ngModel.$setValidity("gtip",false);
                        }else{
                            ngModel.$setValidity("gtip",true);
                        }
                    }
                }else{
                    if(_IP.isV4Format(ngModel.$viewValue) && !attrs.required){
                        ngModel.$setValidity("gtip",false);
                    }else{
                        ngModel.$setValidity("gtip",true);
                    }
                }
            });
        }
    };
});
validateModule.directive("specialipinput",function(){ //IP地址池和DNS域名服务器输入格式校验
    return {
        restrict:"A",
        require:"ngModel",
        link:function(scope,elem,attrs,ngModel){
            var reg;
            if(attrs.specialipinput == "ipPool"){
                reg = /^((?:(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d))))\,((?:(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d))))$/;
            }else if(attrs.specialipinput == "dns"){
                reg = /^((?:(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d))))$/; //DNS正则
            }
            ngModel.$parsers.push(function(viewValue){
                scope.$watch(function(){
                    return viewValue;
                },function(viewValue){
                    if(viewValue){
                        var inputList = viewValue.split("\n");
                        _.each(inputList,function(item){
                            if(reg.test(item)){
                                ngModel.$setValidity("specialipinput",true);
                            }else{
                                ngModel.$setValidity("specialipinput",false);
                            }

                        });
                    }else{
                        ngModel.$setValidity("specialipinput",true);
                    }
                });
                return viewValue;
            });
        }
    };
});
validateModule.directive("additionalRouter",function(){ //附加路由输入格式校验 ，输入格式为192.168.1.0/24,192.168.1.254换行输入下一条
    return {
        restrict:"A",
        require:"ngModel",
        link:function(scope,elem,attrs,ngModel){
            var reg = /^((?:(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d))))[\/]([1-9]|[1-2][0-9]|[3][0]|[3][1])\,((?:(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d))))$/;
            ngModel.$parsers.push(function(viewValue){
                scope.$watch(function(){
                    return viewValue;
                },function(viewValue){
                    if(viewValue){
                        var inputList = viewValue.split("\n");
                        _.each(inputList,function(item){
                            if(reg.test(item)){
                                ngModel.$setValidity("additionalRouter",true);
                            }else{
                                ngModel.$setValidity("additionalRouter",false);
                            }

                        });
                    }else{
                        ngModel.$setValidity("additionalRouter",true);
                    }
                });
                return viewValue;
            });
        }
    };
});
validateModule.directive("gtTime",function(){ //日志模块结束时间大于起始时间校验
    return {
        restrict:"A",
        require:"ngModel",
        link:function(scope,elem,attrs,ngModel){
            ngModel.$parsers.push(function(viewValue){
                scope.$watch(function(){
                    return scope.filterData;
                },function(filterData){
                    if(filterData.from && filterData.to){
                        var start_time = new Date(filterData.from);
                        var end_time =new Date(filterData.to);
                        if(start_time > end_time){
                            ngModel.$setValidity("gtTime",false);
                        }else{
                            ngModel.$setValidity("gtTime",true);
                        }
                    }
                },true);
                return viewValue;
            });
        }
    };
});
validateModule.directive("repeatDefaultname",function(){ //防火墙名称不能为default
    return {
        restrict:"A",
        require:"ngModel",
        link:function(scope,elem,attr,ngModel){
            ngModel.$parsers.push(function(viewValue){
                if(viewValue && viewValue.toString().toLowerCase() == "default" ){
                    ngModel.$setValidity("repeatDefaultname",false);
                }else{
                    ngModel.$setValidity("repeatDefaultname",true);
                }
                return viewValue;
            });
        }
    };
});
validateModule.directive("repeatName",function(){ //校验输入的名称是否已存在
    return {
        restrict:"A",
        require:"ngModel",
        link:function(scope,elem,attr,ngModel){
            ngModel.$parsers.push(function(viewValue){
                if(viewValue && _.include(scope.existedNamesList,viewValue) ){
                    ngModel.$setValidity("repeatName",false);
                }else{
                    ngModel.$setValidity("repeatName",true);
                }
                return viewValue;
            });
        }
    };
});
validateModule.directive("repeatCidr",function(){ //目的端不能为所属私有网络的子集
    return {
        restrict:"A",
        require:"ngModel",
        link:function(scope,elem,attr,ngModel){
            var reg = /^((?:(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d))))[\/]([1-9]|[1-2][0-9]|[3][0]|[3][1])$/;
            ngModel.$parsers.push(function(viewValue){
                if(viewValue && reg.test(viewValue) && _.include(scope.existedCidrList,_IP.cidr(viewValue)) ){
                    ngModel.$setValidity("repeatCidr",false);
                }else{
                    ngModel.$setValidity("repeatCidr",true);
                }
                return viewValue;
            });
        }
    };
});
validateModule.directive("pwCheck", [function() {
    return {
        require: "ngModel",
        link: function(scope, elem, attrs, ctrl) {
            var firstPassword = "#" + attrs.pwCheck;
            elem.on("keyup", function() {
                scope.$apply(function() {
                    var v = elem.val() === $(firstPassword).val();
                    ctrl.$setValidity("pwCheck", v);
                });
            });
            scope.$watch(function(){
                return angular.element(firstPassword).val();
            },function(val){
                if(elem.val() && elem.val() != val){
                    var v = elem.val() === $(firstPassword).val();
                    ctrl.$setValidity("pwCheck", v);
                }else{
                    ctrl.$setValidity("pwCheck", !v);
                }

            });
        }
    };
}]);

validateModule.directive("formValidate", ["$translate",function(translate){
    return {
        restrict: "EA",
        scope:{
            maxNum:"=",
            patternMsg:"=",
            rangemax:"=",
            rangemin:"="
        },
        template:"<div ng-message='required'>{{'CN.errors.required'|translate}}</div>"+
                "<div ng-message='pattern'>{{patmsg}}</div>"+
                "<div ng-message='maxlength'>{{msg}}</div>"+
                "<div ng-message='minlength'>{{minmsg}}</div>"+
                "<div ng-message='pwCheck'>{{'CN.errors.pswdNotEqual'|translate}}</div>"+
                "<div ng-message='regpass'>至少包含字母、数字和字符（_+-&=!@#$%^*()）中的两种</div>"+
                "<div ng-message='regNumLet'>IP形式，支持填入%，127.0.0.1；英文单词，如 localhost</div>"+
                "<div ng-message='regUserName'>由字母，数字、下划线组成、字母开头，字母或数字结尾</div>"+
                "<div ng-message='instanName'>名称只支持长度为60个字符的中文、英文、数字、下划线_、分隔符-、小数点.</div>"+
                "<div ng-message='limitnumrange'>{{'CN.errors.min_max'|translate:min_max}}</div>",
        link: function(scope){
            scope.min_max = {
                min:scope.rangemin,
                max:scope.rangemax
            };
            scope.maxNum ? scope.msg = translate.instant("CN.errors.maxlengthbig")+scope.maxNum+translate.instant("CN.errors.lenghtUnit"):scope.msg = translate.instant("CN.errors.maxlength");
            scope.minNum ? scope.minmsg = translate.instant("CN.errors.minlengthsmall")+scope.minNum+translate.instant("CN.errors.lenghtUnit"):scope.minmsg  = translate.instant("CN.errors.minlength");
            scope.patternMsg? scope.patmsg = scope.patternMsg : scope.patmsg=translate.instant("CN.errors.noSpecial");
        }
    };
}]);
validateModule.directive("countBox",[function(){
    return{
        restrict:"A",
        scope:{
            count:"=",
            method:"&"
        },
        link:function(scope,ele,attr,ng){
            var max = Number(attr.countMax);
            var min = Number(attr.countMin);
            if(scope.count<=min){
                $(ele).find(".minus").addClass("disabled");
            }
            if(scope.count>=max){
                $(ele).find(".add").addClass("disabled");
            }
            scope.$watch(function(){
                return scope.count;
            },function(ne){
                if(ne){
                    if(ne==min&&ne==max){
                        $(ele).find(".minus").addClass("disabled");
                        $(ele).find(".add").addClass("disabled");
                    }else if(ne<=min){
                        $(ele).find(".minus").addClass("disabled");
                        $(ele).find(".add").removeClass("disabled");
                    }else if(ne>=max){
                        $(ele).find(".minus").removeClass("disabled");
                        $(ele).find(".add").addClass("disabled");
                    }else{
                        $(ele).find(".minus").removeClass("disabled");
                        $(ele).find(".add").removeClass("disabled");
                    }
                }
            })
            $(ele).find(".add").on("click",function(){
                var val = Number($(ele).find(".button-num").val());
                if(val>=max){
                    return;
                }
                scope.$apply(function(){
                    //$(ele).find(".button-num").val(val+1);
                    scope.count = val+1;
                    /*if(scope.method){
                        scope.method();
                    }*/
                });
            });
            $(ele).find(".minus").on("click",function(){
                var val = Number($(ele).find(".button-num").val());
                if(val==min){
                    return;
                }
                scope.$apply(function(){
                    //$(ele).find(".button-num").val(val-1);
                    scope.count = val-1;
                    /*if(scope.method){
                        scope.method();
                    }*/
                });
            });
            $(ele).find(".button-num").on("keydown",function(e){
                var reg = /^([1-9]|10)$/;
                if((e.keyCode<=57&&e.keyCode>=48)||(e.keyCode<=105&&e.keyCode>=96)||e.keyCode==8||e.keyCode==37||e.keyCode==39||e.keyCode==46){
                }else{
                    return false;
                }
            })
            $(ele).find(".button-num").on("blur",function(){
                var reg = /^([1-9]|10)$/;
                var v = Number($(ele).find(".button-num").val());
                if(v&&(v>=min && v<=max)){
                    return;
                }
                scope.$apply(function(){
                    scope.count = 1;
                    if(scope.method){
                        scope.method();
                    }
                });
                
            })
        }
    }
}])