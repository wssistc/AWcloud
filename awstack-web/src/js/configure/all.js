import "./node/all";
import "./cluster/clusterCtrl";
import "./cluster/clusterDeployCtrl";
angular.module("configure", ["nodeAll", "clusterModule","clusterDeployModule"]);
