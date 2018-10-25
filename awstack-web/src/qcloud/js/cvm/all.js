import './volumesModule';
import './SnapshotModule';
import './instancesModule';
import './imagesModule';
import './keypairsModule';
import './securityGroupsModule';
import './securityGroupsDetailModule';
import './eipModule';
angular.module("cvmModule",[
	"volumesModule",
	"snapshotModule",
	"instancesModule",
	"keypairsModule",
	"imagesModule",
	"secGroupsModule",
	"secGroupsDetailModule",
	"eipModule"
]);