vaildSize.$inject = ['$http']
export function vaildSize($http){
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
                if(Number(angular.element("#"+attrs.vaildSize).val())){
                    var val = Number(viewValue);
                    if(val < Number(scope.min) || val > Number(scope.max) || !reg.test(viewValue)){
                        ngModel.$setValidity("vaildSize",false);
                    }else{
                        ngModel.$setValidity("vaildSize",true);
                    }
                }else{
                    var val = Number(viewValue);
                    if( val > Number(scope.max) || !reg.test(viewValue)){
                        ngModel.$setValidity("vaildSize",false);
                    }else{
                        ngModel.$setValidity("vaildSize",true);
                    }
                }
                return viewValue;
            });
            scope.$watch(function(){
                return angular.element("#"+attrs.vaildSize).val();
            },function(startValue){
                if(Number(startValue)){
                    var val = Number(ngModel.$viewValue);
                    if(val < Number(scope.min) || val > Number(scope.max) || !reg.test(ngModel.$viewValue)){
                        ngModel.$setValidity("vaildSize",false);
                    }else{
                        ngModel.$setValidity("vaildSize",true);
                    }
                }

            });
        }
    };
}