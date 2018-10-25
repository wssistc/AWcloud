"use strict";
export default function routeConfig($routeProvider,$locationProvider){
  $routeProvider
    .when("/vpc",{
      templateUrl:"/bstone/tmpl/test.html",
      controller: function(){}
    })
    .when("/vpc1",{
      template:"",
      controller: function(){}
    })
    .when("/vpc2",{
      template:"",
      controller: function(){}
    })
}
routeConfig.$inject = ["$routeProvider","$locationProvider"];
