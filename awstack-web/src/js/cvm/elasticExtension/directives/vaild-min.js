vaildMin.$inject = ['$http']
export function vaildMin($http){
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
                if(viewValue){
                    var val = Number(viewValue);
                    if(Number(scope.max)>0){
                    	if( (val < Number(scope.min) || val > Number(scope.max)) || !reg.test(viewValue) ){
	                        ngModel.$setValidity("vaildMin",false);
	                    }else{
	                        ngModel.$setValidity("vaildMin",true);
	                    }
                    }else{
                    	if( val < Number(scope.min) || val > 100 || !reg.test(viewValue) ){
	                        ngModel.$setValidity("vaildMin",false);
	                    }else{
	                        ngModel.$setValidity("vaildMin",true);
	                    }
                    }
                }else{
                    ngModel.$setValidity("vaildMin",true);
                }
                return viewValue;
            });

        }
    };
}