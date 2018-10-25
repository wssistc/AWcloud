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
            var reg = new RegExp("^(0|[1-9][0-9]*)$");
            ngModel.$parsers.push(function(viewValue){
                var val = Number(viewValue);
                if( (val && (val < Number(scope.min) || val > Number(scope.max))) || (viewValue && !reg.test(viewValue)) ){
                    ngModel.$setValidity("limitnumrange",false);
                }else{
                    ngModel.$setValidity("limitnumrange",true);
                }
                return viewValue;
            });

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

validateModule.directive("testincidr",["$rootScope","$translate",function($rootScope,$translate){
    return {
        restrict:"A",
        require:"ngModel",
        scope:{
            choosecidr:"=",
            startip:"=",
            endip:"="
        },
        link:function(scope,elem,attrs,ngModel){
            ngModel.$parsers.push(function(viewValue){
                if(viewValue){
                   $rootScope.outcidrtip =  $translate.instant("aws.loadbalancers.lb.subnet") +scope.startip + " ~ " + scope.endip
                }
                if(scope.choosecidr && (_IP.isV4Format(viewValue) && _IP.cidrSubnet(scope.choosecidr).contains(viewValue)|| !viewValue)){
                    ngModel.$setValidity("testincidr",true);
                }else{
                    ngModel.$setValidity("testincidr",false);
                }
                return viewValue;
            });


        }
    };
}]);
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
validateModule.directive("cidrorip",function(){ //ip地址格式校验(1~255).(0~255).(0~255).(0~255)/(1~31)  or  (1~255).(0~255).(0~255).(0~255)
    return {
        restrict:"A",
        require:"ngModel",
        link:function(scope,elem,attrs,ngModel){
            var reg1 = /^((?:(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d))))[\/]([1-9]|[1-2][0-9]|[3][0]|[3][1])$/;
            var reg2 = /^((?:(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d))))$/;
            ngModel.$parsers.push(function(viewValue){
                if( viewValue && !reg1.test(viewValue) && !reg2.test(viewValue)){
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
            patternMsg:"="
        },
        template:"<div ng-message='required'>{{'aws.errors.required'|translate}}</div>"+
                "<div ng-message='pattern'>{{patmsg}}</div>"+
                "<div ng-message='maxlength'>{{msg}}</div>"+
                "<div ng-message='minlength'>{{minmsg}}</div>"+
                "<div ng-message='pwCheck'>{{'aws.errors.pswdNotEqual'|translate}}</div>",
        link: function(scope){
            scope.maxNum ? scope.msg = translate.instant("aws.errors.maxlengthbig")+scope.maxNum+translate.instant("aws.errors.lenghtUnit"):scope.msg = translate.instant("aws.errors.maxlength");
            scope.minNum ? scope.minmsg = translate.instant("aws.errors.minlengthsmall")+scope.minNum+translate.instant("aws.errors.lenghtUnit"):scope.minmsg  = translate.instant("aws.errors.minlength");
            scope.patternMsg? scope.patmsg = scope.patternMsg : scope.patmsg=translate.instant("aws.errors.noSpecial");
        }
    };
}]);
validateModule.directive("incidr", [function() {
    return {
        require: "ngModel",
        link: function(scope, elem, attrs, $ngModel) {
            var cidr = "#" + attrs.incidr;
            $ngModel.$parsers.push(function(value){
                var min = _IP.cidrSubnet($(cidr).val()).networkAddress;
                var max = _IP.cidrSubnet($(cidr).val()).broadcastAddress;
                if(_IP.isV4Format(value)){
                    if(!_IP.cidrSubnet($(cidr).val()).contains(value) || (_IP.cidrSubnet($(cidr).val()).contains(value) && (_IP.toLong(min) >= _IP.toLong(value) || _IP.toLong(max)<= _IP.toLong(value)))){
                        $ngModel.$setValidity("incidr", false);
                        return value;
                    }
                }
                $ngModel.$setValidity("incidr", true);
                return value;
            });
            $ngModel.$formatters.push(function(value){
                var min = _IP.cidrSubnet($(cidr).val()).networkAddress;
                var max = _IP.cidrSubnet($(cidr).val()).broadcastAddress;
                if(_IP.isV4Format(value)){
                    if(!_IP.cidrSubnet($(cidr).val()).contains(value) || (_IP.cidrSubnet($(cidr).val()).contains(value) && (_IP.toLong(min) >= _IP.toLong(value) || _IP.toLong(max)<= _IP.toLong(value)))){
                        $ngModel.$setValidity("incidr", false);
                        return value;
                    }
                }
                $ngModel.$setValidity("incidr", true);
                return value;
            });
            scope.$watch(function(){
                return $(cidr).val();
            },function(val){
                if(_IP.cidrSubnet(val)){
                    var min = _IP.cidrSubnet(val).networkAddress;
                    var max = _IP.cidrSubnet(val).broadcastAddress;
                    if(!_IP.cidrSubnet(val).contains($ngModel.$viewValue) || (_IP.cidrSubnet(val).contains($ngModel.$viewValue) && (_IP.toLong(min) >= _IP.toLong($ngModel.$viewValue) || _IP.toLong(max)<= _IP.toLong($ngModel.$viewValue)))){
                        $ngModel.$setValidity("incidr", false);
                        return;
                    }
                    $ngModel.$setValidity("incidr", true);
                }
            });
        }
    };
}]);
validateModule.directive("gateway", [function() {
    return {
        require: "ngModel",
        link: function(scope, elem, attrs, $ngModel) {
            var cidr = "#" + attrs.gateway;
            $ngModel.$parsers.push(function(value){
                var min = $("input[name='floatingStart']").val();
                var max = $("input[name='floatingEnd']").val();
                if(_IP.isV4Format(value)){
                    if(!_IP.cidrSubnet($(cidr).val()).contains(value) || (_IP.cidrSubnet($(cidr).val()).contains(value) && _IP.toLong(min) <= _IP.toLong(value) && _IP.toLong(max)>= _IP.toLong(value))){
                        $ngModel.$setValidity("gateway", false);
                        return value;
                    }
                }
                $ngModel.$setValidity("gateway", true);
                return value;
            });
            $ngModel.$parsers.push(function(value){
                var min = $("input[name='floatingStart']").val();
                var max = $("input[name='floatingEnd']").val();
                if(_IP.isV4Format(value)){
                    if(!_IP.cidrSubnet($(cidr).val()).contains(value) || (_IP.cidrSubnet($(cidr).val()).contains(value) && _IP.toLong(min) <= _IP.toLong(value) && _IP.toLong(max)>= _IP.toLong(value))){
                        $ngModel.$setValidity("gateway", false);
                        return value;
                    }
                }
                $ngModel.$setValidity("gateway", true);
                return value;
            });
            scope.$watch(function(){
                var ipc = $("input[name='floatingStart']").val()+","+$("input[name='floatingEnd']").val()+","+$(cidr).val();
                return ipc;
            },function(ne){
                var val = ne.split(",");
                if(_IP.isV4Format(val[0]) && _IP.isV4Format(val[1]) && _IP.cidrSubnet(val[2])){
                    if(!_IP.cidrSubnet(val[2]).contains($ngModel.$viewValue) || (_IP.cidrSubnet(val[2]).contains($ngModel.$viewValue) && _IP.toLong(val[0]) <= _IP.toLong($ngModel.$viewValue) && _IP.toLong(val[1])>= _IP.toLong($ngModel.$viewValue))){
                        $ngModel.$setValidity("gateway", false);
                        return;
                    }
                    $ngModel.$setValidity("gateway", true);
                }
            });
        }
    };
}]);
validateModule.directive("vlan", [function() {
    return {
        require: "ngModel",
        link: function(scope, elem, attrs, $ngModel) {
            $ngModel.$parsers.push(function(value){
                var min = Number($("input[name='tenantStart']").val());
                var max = Number(value);
                if(max && min){
                    if(max<min){
                        $ngModel.$setValidity("vlan", false);
                        return value;
                    }
                }
                $ngModel.$setValidity("vlan", true);
                return value;
            });
            scope.$watch(function(){
                return $("input[name='tenantStart']").val();
            },function(ne){
                var min = Number(ne);
                var max = Number($ngModel.$viewValue);
                if(max && min){
                    if(max<min){
                        $ngModel.$setValidity("vlan", false);
                        return;
                    }
                }
                $ngModel.$setValidity("vlan", true);
            });
        }
    };
}]);

export default validateModule.name;
