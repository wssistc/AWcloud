import './buyRedisctrl';
import './buymysqlctrl';
import './buyInstancesModule';
import './buyCbsCtrl';
import './buyVpcModule';
import './buyCLBModule';

angular.module("buyModule", ["buyRedisModule","buyMysqlModule", "buyInstancesModule", "buyCbsModule", "buyVpcModule", "buyCLBModule"]);