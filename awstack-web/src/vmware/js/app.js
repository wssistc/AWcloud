"use strict";
import routeConfig from "./route";
import httpConfig from "./http";
import translateConfig from "./i18n";
import mainConfig from './main';
import component from './common';
import system from "./systemview";
import virtualMachine from "./virtualmachine";
import dataCentersModule from "./dataCenters";
import clustersModule from "./clusters";
import hostsModule from "./hosts";

let app = angular.module("vmware",[
    "ngRoute",
    "pascalprecht.translate",
    component,
    system,
    virtualMachine,
    dataCentersModule,
	clustersModule,
	hostsModule
]);
app.constant("API_HOST", GLOBALCONFIG.APIHOST);
app.config(routeConfig);
app.config(httpConfig);
app.config(translateConfig);
app.controller("mainCtrl",mainConfig);

export default app.name;

