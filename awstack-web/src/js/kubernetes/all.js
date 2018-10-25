/**
 * Created by weike on 2018/1/17.
 */

import "./dockerClusters/dockerClustersModule";
import "./dockerServices/dockerServicesModule";
import "./dockerImages/dockerImagesModule";
import "./dockerNodes/dockerNodesModule";

angular.module("KubernetesModule", [
    "dockerClustersModule",
    "dockerServicesModule",
    "dockerImagesModule",
    "dockerNodesModule"
]);
