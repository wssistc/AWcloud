myDirective2.$inject = ['$http']
export function myDirective2($http){
	return {
		restrict: 'A',
		template: `<div><h5>myDirective2</h5><button>{{ title }}</button>`,
		link: {
			post(scope, element, attrs){
				scope.title = `change bgcolor ${ Date.now() }`
				element.find('button').on('click', e => {
					element.attr('style',
						`background-color: rgb(${parseInt(256 * Math.random())}, ${parseInt(256 * Math.random())}, ${parseInt(256 * Math.random())})`)
				})
			}
		}
	}
}