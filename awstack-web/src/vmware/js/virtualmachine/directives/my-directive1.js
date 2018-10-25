myDirective1.$inject = ['$http']
export function myDirective1($http){
	return {
		restrict: 'A',
		template: `<div><h5>myDirective1</h5><textarea>data: {{ data }}</textarea>`,
		link: {
			post(scope, element, attrs){
				$http.get(attrs.url || '/').then(res => scope.data = res.data)
			}
		}
	}
}