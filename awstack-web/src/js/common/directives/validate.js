var validateModule = angular.module("validateModule", []);

validateModule.directive("limitnumrange",function(){
    return {
        restrict:"A",
        require:"ngModel",
        scope:{
            min:"=",
            max:"=",
	    limittype:"="
        },
        link:function(scope,elem,attrs,ngModel){
            function vaild(viewValue){
                var reg = new RegExp("^(0|[1-9][0-9]*)$");
                if(viewValue){
                    if((viewValue=="无限速"||viewValue=="unlimited")&&scope.limittype=="bandwidth"){
                        return
                    }
                    var val = Number(viewValue);
                    if( (val < Number(scope.min) || val > Number(scope.max)) || !reg.test(viewValue) ){
                        ngModel.$setValidity("limitnumrange",false);
                    }else{
                        ngModel.$setValidity("limitnumrange",true);
                    }
                    
                }else{
                    ngModel.$setValidity("limitnumrange",true);
                }
                return viewValue;
            }
            
            ngModel.$parsers.push(vaild);
            scope.$watch(function(){
                return scope.max+scope.min+ngModel.$viewValue;
            },function(value){
                vaild(ngModel.$viewValue)
            });
        }
    };
});

validateModule.directive("limitflavor",function(){
    return {
        restrict:"A",
        require:"ngModel",
        scope:{
            min:"=",
            max:"=",
            key:"="
        },
        link:function(scope,elem,attrs,ngModel){
            var reg = new RegExp("^(0|[1-9][0-9]*)$");
            ngModel.$parsers.push(function(viewValue){
                if(viewValue){
                    // switch(scope.key){
                    //     case "quota:disk_read_bytes_sec":
                    //     case "quota:disk_read_iops_sec":
                    //     case "quota:disk_write_bytes_sec":
                    //     case "quota:disk_write_iops_sec":
                    //     case "quota:vif_inbound_average":
                    //     case "quota:vif_inbound_burst":
                    //     case "quota:vif_inbound_peak":
                    //     case "quota:vif_outbound_average":
                    //     case "quota:vif_outbound_peak":
                    //     case "qutoa:vif_outbound_burst":
                    //     case "resource:mem_max":
                    //     case "resource:cpu_max":
                    //     ngModel.$setValidity("limitflavor",true);
                    //     break;
                    //     default:
                        var val = Number(viewValue);
                        if( (val < Number(scope.min) || val > Number(scope.max)) || !reg.test(viewValue) || (Number(scope.min) === Number(scope.max) && val != Number(scope.min))){
                            ngModel.$setValidity("limitflavor",false);
                        }else{
                            ngModel.$setValidity("limitflavor",true);
                        }
                        scope.$watch(function(){
                            return scope.max + scope.min;
                        },function(){
                            if( (val < Number(scope.min) || val > Number(scope.max)) || !reg.test(viewValue) || (Number(scope.min) === Number(scope.max) && val != Number(scope.min))){
                                ngModel.$setValidity("limitflavor",false);
                            }else{
                                ngModel.$setValidity("limitflavor",true);
                            }
                        });
                        //break;
                    //}    
                }else{
                    ngModel.$setValidity("limitflavor",true);
                }
                return viewValue;
            });

        }
    };
});

validateModule.directive("limitmac",function(){ 
    return {
        restrict:"A",
        require:"ngModel",
        link:function(scope,elem,attrs,ngModel){
            var reg = new RegExp("^[0-9a-fA-F]{2}(:[0-9a-fA-F]{2}){5}$");
            function valid(viewValue){
                if (!reg.test(viewValue)) {
                    ngModel.$setValidity("limitmac", false);
                } else {
                    var reg2 = new RegExp("^(0|2|4|6|8|a|c|e)");
                    var view2 = viewValue.split(":")[0].split("")[1].toLowerCase();
                    if (reg2.test(view2)) {
                        if (viewValue.split(":")[0].toLowerCase() == "fe") {
                            ngModel.$setValidity("limitmac", false);
                        } else {
                            ngModel.$setValidity("limitmac", true);
                        }
                    } else {
                        ngModel.$setValidity("limitmac", false);
                    }
                }
                return viewValue;
            }
            ngModel.$parsers.push(valid);
            
            scope.$watch(function() {
                return ngModel.$viewValue;
            }, function(viewValue) {
                if (viewValue) {
                    valid(viewValue);
                }
            });

        }
    };
});
validateModule.directive("limitnumberrange",function(){//弹性扩展，扩展策略可以输入负数
    return {
        restrict:"A",
        require:"ngModel",
        scope:{
            min:"=",
            max:"="
        },
        link:function(scope,elem,attrs,ngModel){
            ngModel.$parsers.push(function(viewValue){
                var val = Number(viewValue);
                if( val && (val < Number(scope.min) || val > Number(scope.max))){
                    ngModel.$setValidity("limitnumberrange",false);
                }else{
                    ngModel.$setValidity("limitnumberrange",true);
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
validateModule.directive("checknum",function(){
    return {
        restrict:"A",
        require:"ngModel",
        scope:{
            maxs:"="
        },
        link:function(scope,elem,attrs,ngModel){
            ngModel.$parsers.push(function(viewValue){
                var viewValue=Number(viewValue);
                var max= Number(scope.maxs);
                if(viewValue<=max){
                    ngModel.$setValidity("checknum",true);

                }else{
                    ngModel.$setValidity("checknum",false);
                }
                return viewValue;
            });
        }
    };
});
validateModule.directive("flaram",function(){
    return {
        restrict:"A",
        require:"ngModel",
        link:function(scope,elem,attrs,ngModel){
            var reg = new RegExp("^\d+([.][0-9])?$");
            ngModel.$parsers.push(function(viewValue){
                if(reg.test(viewValue)){
                    ngModel.$setValidity("flaram",false);
                }else{
                    if(viewValue*1>0){
                        if(viewValue*1 == (viewValue*1).toFixed(1)){
                            if(viewValue.substr(-1,1)=="."){
                                ngModel.$setValidity("flaram",false);
                            }else{
                                ngModel.$setValidity("flaram",true);
                            }  
                        }else{
                            ngModel.$setValidity("flaram",false);
                        }
                    }else{
                        ngModel.$setValidity("flaram",false);

                    }
                }
                return viewValue;
            });
        }
    };
});
validateModule.directive("gtZeroNum",function(){ //校验大于等于0的数,小数保留两位
    return {
        restrict:"A",
        require:"ngModel",
        scope:{
            min:"=",
            max:"="
        },
        link:function(scope,elem,attrs,ngModel){
            var reg = /^[0-9]\d*(\.\d{1,2})?$/;
            ngModel.$parsers.push(function(viewValue){
                if(reg.test(viewValue)){
                    if(viewValue.indexOf(".")>-1 ){ //如果是小数
                        if(viewValue.substr(0,1) == "0"){
                            if(viewValue.substr(1,1) == "."){
                                ngModel.$setValidity("gtZeroNum",true);
                            }else{
                                ngModel.$setValidity("gtZeroNum",false);
                            }
                        }else{
                            if(Number(viewValue) <= Number(scope.max)){
                                ngModel.$setValidity("gtZeroNum",true);
                            }else{
                                ngModel.$setValidity("gtZeroNum",false);
                            }
                            
                        }
                    }else{
                        if(viewValue.length>1 && viewValue.substr(0,1) == "0"){
                            ngModel.$setValidity("gtZeroNum",false);
                        }else{
                            if(Number(viewValue) <= Number(scope.max)){
                                ngModel.$setValidity("gtZeroNum",true);
                            }else{
                                ngModel.$setValidity("gtZeroNum",false);
                            }
                        }
                    }
                }else{
                    ngModel.$setValidity("gtZeroNum",false);
                }
                return viewValue;
            });
        }
    };
});
validateModule.directive("minmaxram",function(){
    return {
            restrict:"A",
            require:"ngModel",
            scope:{
                min:"=",
                max:"="
            },
            link:function(scope,elem,attrs,ngModel){
                ngModel.$parsers.push(function(viewValue){
                    if(Number(angular.element("#"+attrs.minmaxram).val())){
                        var val = Number(viewValue);
                        if(val >= Number(scope.min) && val <= Number(scope.max)){
                            ngModel.$setValidity("minmaxram",true);
                        }else{
                            ngModel.$setValidity("minmaxram",false);
                        }
                    }
                    return viewValue;
                });
                scope.$watch(function(){
                    return angular.element("#"+attrs.minmaxram).val();
                },function(startValue){
                    if(Number(startValue)){
                        var val = Number(ngModel.$viewValue);
                        if(val >= Number(scope.min) && val <= Number(scope.max)){
                            ngModel.$setValidity("minmaxram",true);
                        }else{
                            ngModel.$setValidity("minmaxram",false);
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
validateModule.directive("cidrorip",function(){ //ip地址格式校验(1~255).(0~255).(0~255).(0~255)/(1~31)  or  (0~255).(0~255).(0~255).(0~255)
    return {
        restrict:"A",
        require:"ngModel",
        link:function(scope,elem,attrs,ngModel){
            var reg1 = /^((?:(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d))))[\/]([1-9]|[1-2][0-9]|[3][0]|[3][1])$/;
            var reg2 = /^((?:(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d))))$/;
            ngModel.$parsers.push(function(viewValue){
                if(viewValue && viewValue == "0.0.0.0/0"){ 
                    ngModel.$setValidity("cidrorip",true);
                }else{
                    if( viewValue && !reg1.test(viewValue) && !reg2.test(viewValue)){
                        ngModel.$setValidity("cidrorip",false);
                    }else{
                        ngModel.$setValidity("cidrorip",true);
                    }
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
            ipaddrpattern:"=",
            ipadd:"="
        },
        link:function(scope,elem,attrs,ngModel){
            if(scope.ipadd=="access"){
                /*普通ip尾数只能1-254*/
                var reg = /^((?:(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(?:25[0-4]|2[0-4]\d|((1\d{2})|[1-9]|([1-9][0-9]))))$/;
            }else{
                /*包含网络地址，和广播地址校验,尾数0-255*/
                var reg = /^((?:(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d))))$/; 
            }
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
                        for(var i=0;i<inputValue.length;i++){
                            if(inputValue[i]){
                                _inputValue.push(inputValue[i]);
                                if(reg.test(inputValue[i])){
                                    ngModel.$setValidity("ipaddrpattern",true);
                                }else{
                                    ngModel.$setValidity("ipaddrpattern",false);
                                    break;
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
                        }
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
//网络改造后的ip格式校验
validateModule.directive("ipformatValidate",function(){ //ip格式校验(1~255).(0~255).(0~255).(0~255)
    return {
        restrict:"A",
        require:"ngModel",
        link:function(scope,elem,attrs,ngModel){
            /*包含网络地址，和广播地址校验,尾数0-255*/
            var reg = /^((?:(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d))))$/; 
            ngModel.$parsers.push(function(viewValue){
                if(viewValue){
                    if(reg.test(viewValue)){
                        ngModel.$setValidity("ipformat",true);
                    }else{
                        ngModel.$setValidity("ipformat",false);
                    }
                }else{
                    ngModel.$setValidity("ipformat",true);
                }
                return viewValue;
            });
            ngModel.$formatters.push(function(viewValue){
                if(viewValue){
                    if(reg.test(viewValue)){
                        ngModel.$setValidity("ipformat",true);
                    }else{
                        ngModel.$setValidity("ipformat",false);
                    }
                }else{
                    ngModel.$setValidity("ipformat",true);
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
                var startValue = angular.element("#"+attrs.gtip).val();
                if(startValue){
                    if(_IP.isV4Format(viewValue)){
                        if(_IP.toLong(viewValue) <= _IP.toLong(startValue)){
                            ngModel.$setValidity("gtip",false);
                        }else{
                            ngModel.$setValidity("gtip",true);
                        }
                    }else{
                        ngModel.$setValidity("gtip",true);
                    }
                }else{
                    if(_IP.isV4Format(ngModel.$viewValue) && !attrs.required){
                        ngModel.$setValidity("gtip",false);
                    }else{
                        ngModel.$setValidity("gtip",true);
                    }
                }
                return viewValue;
            });
            ngModel.$formatters.push(function(viewValue){
                var startValue = angular.element("#"+attrs.gtip).val();
                if(startValue){
                    if(_IP.isV4Format(viewValue)){
                        if(_IP.toLong(viewValue) <= _IP.toLong(startValue)){
                            ngModel.$setValidity("gtip",false);
                        }else{
                            ngModel.$setValidity("gtip",true);
                        }
                    }else{
                        ngModel.$setValidity("gtip",true);
                    }
                }else{
                    if(_IP.isV4Format(ngModel.$viewValue) && !attrs.required){
                        ngModel.$setValidity("gtip",false);
                    }else{
                        ngModel.$setValidity("gtip",true);
                    }
                }
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
            function isRepeatFunc(arr){
                var hash = {};
                var isTrue;
                for(let i=0;i<arr.length;i++){
                    if(hash[arr[i]]==1){
                        isTrue = true;
                        break;
                    }
                    hash[arr[i]] = 1;
                }
                return isTrue;
            }
            ngModel.$parsers.push(function(viewValue){
                scope.$watch(function(){
                    return viewValue;
                },function(viewValue){
                    if(viewValue){
                        var inputList = viewValue.split("\n");
                        //dns是否重复
                        
                        var isRepeat=isRepeatFunc(inputList);
                        if(isRepeat){
                            ngModel.$setValidity("repeatipinput",false);
                        }else{
                            ngModel.$setValidity("repeatipinput",true);
                        }

                        for(let i=0;i<inputList.length;i++){
                            if(reg.test(inputList[i])){
                                ngModel.$setValidity("specialipinput",true);
                            }else{
                                ngModel.$setValidity("specialipinput",false);
                                break;
                            }
                        }

                        //dns最大个数为5
                        if(inputList.length>5){
                           ngModel.$setValidity("ipinputmax",false);
                        }else{
                           ngModel.$setValidity("ipinputmax",true); 
                        }
                    }else{
                        ngModel.$setValidity("specialipinput",true);
                        ngModel.$setValidity("repeatipinput",true);
                        ngModel.$setValidity("ipinputmax",true);
                    }
                });
                return viewValue;
            });
            ngModel.$formatters.push(function(viewValue){
                scope.$watch(function(){
                    return viewValue;
                },function(viewValue){
                    if(viewValue){
                        var inputList = viewValue.split("\n");
                        //dns是否重复
                        function isRepeatFunc(arr){
                            var hash = {};
                            for(var i in arr) {
                                if(hash[arr[i]])
                                return true;
                                hash[arr[i]] = true;
                            }
                            return false;
                        }
                        var isRepeat=isRepeatFunc(inputList);
                        if(isRepeat){
                            ngModel.$setValidity("repeatipinput",false);
                        }else{
                            ngModel.$setValidity("repeatipinput",true);
                        }

                        for(let i=0;i<inputList.length;i++){
                            if(reg.test(inputList[i])){
                                ngModel.$setValidity("specialipinput",true);
                            }else{
                                ngModel.$setValidity("specialipinput",false);
                                break;
                            }
                        }

                        //dns最大个数为5
                        if(inputList.length>5){
                           ngModel.$setValidity("ipinputmax",false);
                        }else{
                           ngModel.$setValidity("ipinputmax",true); 
                        }
                    }else{
                        ngModel.$setValidity("specialipinput",true);
                        ngModel.$setValidity("repeatipinput",true);
                        ngModel.$setValidity("ipinputmax",true);
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
                        //router是否重复
                        function isRepeatFunc(arr){
                            var hash = {};
                            for(var i in arr) {
                                if(hash[arr[i]])
                                return true;
                                hash[arr[i]] = true;
                            }
                            return false;
                        }
                        var isRepeat=isRepeatFunc(inputList);
                        if(isRepeat){
                            ngModel.$setValidity("repeatRouter",false);
                        }else{
                            ngModel.$setValidity("repeatRouter",true);
                        }

                        for(let i=0;i<inputList.length;i++){
                            if(reg.test(inputList[i])){
                                ngModel.$setValidity("additionalRouter",true);
                            }else{
                                ngModel.$setValidity("additionalRouter",false);
                                break;
                            }
                        }
                        //router最大个数为20
                        if(inputList.length>20){
                           ngModel.$setValidity("routermax",false);
                        }else{
                           ngModel.$setValidity("routermax",true); 
                        }
                    }else{
                        ngModel.$setValidity("additionalRouter",true);
                        ngModel.$setValidity("repeatRouter",true);
                        ngModel.$setValidity("routermax",true);
                    }
                });
                return viewValue;
            });
            ngModel.$formatters.push(function(viewValue){
                scope.$watch(function(){
                    return viewValue;
                },function(viewValue){
                    if(viewValue){
                        var inputList = viewValue.split("\n");
                        //router是否重复
                        function isRepeatFunc(arr){
                            var hash = {};
                            for(var i in arr) {
                                if(hash[arr[i]])
                                return true;
                                hash[arr[i]] = true;
                            }
                            return false;
                        }
                        var isRepeat=isRepeatFunc(inputList);
                        if(isRepeat){
                            ngModel.$setValidity("repeatRouter",false);
                        }else{
                            ngModel.$setValidity("repeatRouter",true);
                        }

                        for(let i=0;i<inputList.length;i++){
                            if(reg.test(inputList[i])){
                                ngModel.$setValidity("additionalRouter",true);
                            }else{
                                ngModel.$setValidity("additionalRouter",false);
                                break;
                            }
                        }
                        //router最大个数为20
                        if(inputList.length>20){
                           ngModel.$setValidity("routermax",false);
                        }else{
                           ngModel.$setValidity("routermax",true); 
                        }
                    }else{
                        ngModel.$setValidity("additionalRouter",true);
                        ngModel.$setValidity("repeatRouter",true);
                        ngModel.$setValidity("routermax",true);
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
                    }else{
                        ngModel.$setValidity("gtTime",true);
                    }
                },true);
                return viewValue;
            });
        }
    };
});
validateModule.directive("ltCurrTime",function(){ 
    return {
        restrict:"A",
        require:"ngModel",
        link:function(scope,elem,attrs,ngModel){
            ngModel.$parsers.push(function(viewValue){
                if( viewValue && viewValue < moment().format('YYYY-MM-DD HH:mm')){
                    ngModel.$setValidity("ltCurrTime",false);
                }else{
                    ngModel.$setValidity("ltCurrTime",true);
                }
                return viewValue;
            });
        }
    };
});
validateModule.directive("timePattern",function(){ 
    return {
        restrict:"A",
        require:"ngModel",
        link:function(scope,elem,attrs,ngModel){
            var timeReg = scope.timePattern;
            ngModel.$parsers.push(function(viewValue){
                if( viewValue && timeReg.test(viewValue)){
                    ngModel.$setValidity("timePattern",true);
                }else{
                    ngModel.$setValidity("timePattern",false);
                }
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
validateModule.directive("exceptName",function(){ //禁止输入某个名称
    return {
        restrict:"A",
        require:"ngModel",
        scope:{
            exceptname:"="
        },
        link:function(scope,elem,attr,ngModel){
            ngModel.$parsers.push(function(viewValue){
                if(viewValue && viewValue.toString() == scope.exceptname ){
                    ngModel.$setValidity("exceptName",false);
                }else{
                    ngModel.$setValidity("exceptName",true);
                }
                return viewValue;
            });
        }
    };
});
validateModule.directive("pwCheck", [function() {
    return {
        require: "ngModel",
        link: function(scope, elem, attrs, ngModel) {
            var firstPassword = "#" + attrs.pwCheck;
            elem.on("keyup", function() {
                scope.$apply(function() {
                    var v = elem.val() === $(firstPassword).val();
                    ngModel.$setValidity("pwCheck", v);
                });
            });
            scope.$watch(function(){
                return angular.element(firstPassword).val();
            },function(val){
                if(val && elem.val() != val){
                    ngModel.$setValidity("pwCheck", false);
                }else{
                    ngModel.$setValidity("pwCheck", true);
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
}])
    .directive("incidr", [function() {
        return {
            require: "ngModel",
            scope:{
               cidrVal:"=",
            },
            link: function(scope, elem, attrs, $ngModel) {
                var cidrVal = scope.cidrVal;
                var reg = /^((?:(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d))))[\/]([1-9]|[1-2][0-9]|[3][0]|[3][1])$/;
                $ngModel.$parsers.push(function(value){
                    cidrVal = scope.cidrVal;
                    var min = _IP.cidrSubnet(cidrVal).networkAddress;
                    var max = _IP.cidrSubnet(cidrVal).broadcastAddress;
                    //if(_IP.isV4Format(value)){
                    if(_IP.isV4Format(value)&&reg.test(cidrVal)){
                        if(!_IP.cidrSubnet(cidrVal).contains(value) || (_IP.cidrSubnet(cidrVal).contains(value) && (_IP.toLong(min) >= _IP.toLong(value) || _IP.toLong(max)<= _IP.toLong(value)))){
                            $ngModel.$setValidity("incidr", false);
                            return value;
                        }
                    }
                    $ngModel.$setValidity("incidr", true);
                    return value;
                });
                $ngModel.$formatters.push(function(value){
                    cidrVal = scope.cidrVal;
                    var min = _IP.cidrSubnet(cidrVal).networkAddress;
                    var max = _IP.cidrSubnet(cidrVal).broadcastAddress;
                    //if(_IP.isV4Format(value)){
                    if(_IP.isV4Format(value)&&reg.test(cidrVal)){
                        if(!_IP.cidrSubnet(cidrVal).contains(value) || (_IP.cidrSubnet(cidrVal).contains(value) && (_IP.toLong(min) >= _IP.toLong(value) || _IP.toLong(max)<= _IP.toLong(value)))){
                            $ngModel.$setValidity("incidr", false);
                            return value;
                        }
                    }
                    $ngModel.$setValidity("incidr", true);
                    return value;
                });
                scope.$watch(function(){
                    return scope.cidrVal;
                },function(val){
                    if($ngModel.$viewValue){
                       //if(_IP.cidrSubnet(val)&&reg.test(val)){
                       if(reg.test(val)){
                            var min = _IP.cidrSubnet(val).networkAddress;
                            var max = _IP.cidrSubnet(val).broadcastAddress;
                            if(!_IP.cidrSubnet(val).contains($ngModel.$viewValue) || (_IP.cidrSubnet(val).contains($ngModel.$viewValue) && (_IP.toLong(min) >= _IP.toLong($ngModel.$viewValue) || _IP.toLong(max)<= _IP.toLong($ngModel.$viewValue)))){
                                $ngModel.$setValidity("incidr", false);
                                return;
                            }
                            $ngModel.$setValidity("incidr", true);
                       }else{
                            $ngModel.$setValidity("incidr", true);
                       } 
                    } 
                });
            }
        };
    }])
    .directive("gateway", [function() {
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
    }])
    .directive("vlan", [function() {
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
    }])
validateModule.directive("gatewayIncidr",[function(){ //校验网关IP是否在子网的cidr范围内
    return {
        //restrict:"A",
        require:"ngModel",
        link:function(scope,elem,attrs,ngModel){
            var reg = /^((?:(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d))))[\/]([1-9]|[1-2][0-9]|[3][0]|[3][1])$/;
            //例如子网的cidr为：192.168.1.134/24 ，192.168.1.0 是网络地址 192.168.1.1是默认的网关地址 ，192.168.1.255是广播地址，那么192.168.1.1~192.168.1.254才是网关IP可用的地址
            ngModel.$parsers.push(function(viewValue){
                if(viewValue){
                   if(scope.cidrVal && reg.test(scope.cidrVal)){
                        var min = _IP.cidrSubnet(scope.cidrVal).firstAddress; //192.168.1.1第一个IP地址默认是网关IP
                        var max = _IP.cidrSubnet(scope.cidrVal).lastAddress; //192.168.1.254
                        scope.cidrValValidate = true;
                        scope.gatewayIpRange = min + "~" + max;
                        if(_IP.isV4Format(viewValue)){  //判断网关IP是否是正确的IP地址格式
                            if(_IP.toLong(viewValue)>= _IP.toLong(min) && _IP.toLong(viewValue)<= _IP.toLong(max)){
                                ngModel.$setValidity("gatewayIncidr",true);
                            }else{
                                ngModel.$setValidity("gatewayIncidr",false);
                            }
                        }
                    }else{
                        scope.cidrValValidate = false;
                        ngModel.$setValidity("gatewayIncidr",false);
                    }
                }else{
                    ngModel.$setValidity("gatewayIncidr",true);
                }
                return viewValue;
            });
            scope.$watch(function(){
                return scope.cidrVal;
            },function(cidrVal){
                if(ngModel.$viewValue){
                    if(cidrVal && reg.test(cidrVal)){//判断子网的cidr是否为(1~255).(0~255).(0~255).(0~31)
                        var min = _IP.cidrSubnet(cidrVal).firstAddress; //192.168.1.1第一个IP地址默认是网关IP
                        var max = _IP.cidrSubnet(cidrVal).lastAddress; //192.168.1.254
                        scope.cidrValValidate = true;
                        scope.gatewayIpRange = min + "~" + max;
                        if(_IP.isV4Format(ngModel.$viewValue)){  //判断网关IP是否是正确的IP地址格式
                            if(_IP.toLong(ngModel.$viewValue)>= _IP.toLong(min) && _IP.toLong(ngModel.$viewValue)<= _IP.toLong(max)){
                                ngModel.$setValidity("gatewayIncidr",true);
                            }else{
                                ngModel.$setValidity("gatewayIncidr",false);
                            }
                        }
                    }else{
                        scope.cidrValValidate = false;
                        ngModel.$setValidity("gatewayIncidr",false);
                    }
                }else{
                    ngModel.$setValidity("gatewayIncidr",true);
                }
            },true)
        }
    }
}]);
validateModule.directive("gtCurrTime",function(){ //选择的时间大于当天日期校验
        return {
            restrict:"A",
            require:"ngModel",
            link:function(scope,elem,attrs,ngModel){
                ngModel.$parsers.push(function(viewValue){
                    var reg = /^\d{4}-([0][1-9]|[1][0-2])-([0-2][1-9]|[1-2][0]|[3][0-1])$/;
                    if(scope.timePattern){
                        reg = scope.timePattern;
                    }
                    if(reg.test(viewValue)){
                        if(new Date(viewValue) > new Date(moment())){
                            ngModel.$setValidity("gtCurrTime",false);
                        }else{
                            ngModel.$setValidity("gtCurrTime",true)
                        }
                    }
                    return viewValue;
                });
            }
        };
    })
validateModule.directive("gtBillTime",function(){ //结束时间大于起始时间校验
    return {
        restrict:"A",
        require:"ngModel",
        scope:{
            gtBillTime:"="
        },
        link:function(scope,elem,attrs,ngModel){
            ngModel.$parsers.push(function(viewValue){
                scope.$watch(function(){
                    return scope.gtBillTime;
                },function(filterData){
                    if(filterData.startAt && filterData.endAt){
                        var start_time = new Date(filterData.startAt);
                        var end_time =new Date(filterData.endAt);
                        if(start_time > end_time){
                            ngModel.$setValidity("gtBillTime",false);
                        }else{
                            ngModel.$setValidity("gtBillTime",true);
                        }
                    }
                },true);
                return viewValue;
            });
        }
    };
});

validateModule.directive("numRange",function(){  //校验slider的input
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
                });
            })

        }
    };
});
validateModule.directive("ipv6InputValidate",function(){  //校验ipv6的ip输入格式
    return {
        restrict:"A",
        require:"ngModel",
        link:function(scope,elem,attrs,ngModel){
             function vaild(viewValue){
                var reg = new RegExp("^[0-9a-fA-F]{1,4}$");
                if(viewValue){    
                    if(!reg.test(viewValue)){
                        ngModel.$setValidity("v6InputValidate",false);
                    }else{
                        ngModel.$setValidity("v6InputValidate",true);
                    }
                    
                }else{
                    ngModel.$setValidity("v6InputValidate",true);
                }
                return viewValue;
            }
            ngModel.$parsers.push(vaild);

        }
    };
});
validateModule.directive("multicastValidate",function(){  //ipv6组播地址校验，第一个16位以ff开头
    return {
        restrict:"A",
        require:"ngModel",
        link:function(scope,elem,attrs,ngModel){
             function vaild(viewValue){
                var reg = new RegExp("^[Ff]{2}$");
                if(viewValue){
                    if(viewValue.length>=2){
                       let preTwoString=viewValue.slice(0,2);
                       if(reg.test(preTwoString)){
                          ngModel.$setValidity("multicastValidate",false);
                       }else{
                          ngModel.$setValidity("multicastValidate",true);
                       }
                    }else{
                       ngModel.$setValidity("multicastValidate",true); 
                    }  
                }else{
                    ngModel.$setValidity("multicastValidate",true);
                }
                return viewValue;
            }
            ngModel.$parsers.push(vaild);

        }
    };
});