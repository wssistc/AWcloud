import * as controllers from './controllers/'
import * as directives from './directives/'
import * as services from './services/'

Config.$inject = ['$controllerProvider', '$compileProvider','$provide']
export default function Config($controllerProvider, $compileProvider,$provide){
    $controllerProvider.register(controllers)
    $compileProvider.directive(directives)
    $provide.service(services)
}

