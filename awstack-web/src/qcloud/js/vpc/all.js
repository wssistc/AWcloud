import "./vpcModule";
import "./subnetModule";
import "./natGatewayModule";
import "./routeModule";

angular.module("vpcAllModule",["vpcModule","subnetModule","natGatewayModule","routeModule"]);