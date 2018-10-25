import "./instances/instancesModule";
import "./instances/affinityModule";
import "./instances/portsModule";
import "./instances/elasticExpansionModule";
import "./images/imagesModule";
import "./images/makeImageModule";
import "./networks/networksModule";
import "./networks/physicalNetworksModule";
import "./volumes/snapshotsModule";
import "./volumes/regularSnap";
import "./networks/routersModule";
import "./networks/floatingIpModule";
import "./networks/bandwidthModule";
import "./networks/netfirewallModule";
import "./networks/qosModule";
import "./networks/vpnModule";
import "./security/keyPairsModule";
import "./security/securityGroupModule";
import "./overview/cvmViewModule";
import "./recycle/recycleModule";
import "./extension/extensionCtrl";
import "./loadbalancers/loadBalanceModule";
import "./loadbalancersNew/loadBalanceModule";
import "./extension/scalpolicyCtrl";
import "./elasticExtension/";
import "./alarm/";
import "./volumes/volumesQoSModule";
import "./console/consoleModule";



angular.module("cvm", [
    "instancesModule",
    "affinityModule",
    "portsModule",
    "elasticExpansionModule",
    "imagesModule",
    "makeImageModule",
    "networksModule",
    "physicalNetworksModule",
    "snapshotsModule",
    "volumesQoSModule",
    "regularSnapModule",
    "routersModule",
    "floatipsModule",
    "bandwidthModule",
    "netfirewallModule",
    "qosModule",
    "vpnModule",
    "keyPairsModule",
    "securityGroupModule",
    "cvmViewModule",
    "recycleModule",
    "extensionModule",
    "balanceModule",
    "loadBalanceModule",
    "scalpolicyModule",
    "elasticExtension",
    "alarmModule",
    "consoleModule"
]);
