import {
	scale,
	defaultSetting,
	vmStatusColor,
	defaultConfig
} from "../option.js";

import {
	netTopoSrv
} from "../services/service";

import "../../common/services/commonFuncSrv";

zrenderTopoCtrl.$inject = ["$scope", "$rootScope", "$translate", "netTopoSrv", "$timeout", "$location", "$uibModal", "routersSrv", "netfirewallSrv", "commonFuncSrv","$route"];
export function zrenderTopoCtrl($scope, $rootScope, $translate, netTopoSrv, $timeout, $location, $uibModal, routersSrv, netfirewallSrv, commonFuncSrv,$route) {
	var self = $scope;
	$location.search("type", null);
	//判断是否是admin
	switch(localStorage.managementRole){
		case"2":
			self.isSuperAdmin = true;//是否是超级管理员
		break;
		default:
			self.isSuperAdmin = false;//是否是超级管理员
	}
	var zr = zrender.init(document.getElementById("net-topo-main"));
	var ew, eh, fw, fh, rw, rh, sw, sh, vw, vh;
	//子网高度，子网宽度，防火墙高度，防火墙宽度，路由器高度，路由器宽度，子网高度，子网宽度，虚拟机高度，虚拟机宽度
	var org_W,org_H,W,H,elemDefault,elemConfig,elemDefaultColors,pLeft,netPaddingLeft,netPaddingTop,padding;
	
	function initSpacing(){
        org_W = Math.ceil(angular.copy(zr.getWidth()));
		org_H = Math.ceil(angular.copy(zr.getHeight()));
		W = org_W;
		H = org_H;
		elemDefault = defaultSetting(scale);
		elemConfig = defaultConfig(elemDefault, scale);//画各种元件的传参
		elemDefaultColors = angular.copy(elemDefault.colors);
		pLeft = elemDefault.defaultSpace.pLeft;//外网横坐标到画布左边的距离
		netPaddingLeft = elemDefault.defaultSpace.netPaddingLeft;//网络rect到画布左边的距离
		netPaddingTop = elemDefault.defaultSpace.netPaddingTop;//网络rect到画布上方的距离
		padding = elemDefault.defaultSpace.padding;
	}
	initSpacing();

	var initWH = function () {
		ew = elemConfig.exnet.imgOpts.style.width;
		eh = elemConfig.exnet.imgOpts.style.height;
		fw = elemConfig.firewall.imgOpts.style.width;
		fh = elemConfig.firewall.imgOpts.style.height;
		rw = elemConfig.router.imgOpts.style.width;
		rh = elemConfig.router.imgOpts.style.height;
		sw = elemConfig.subnet.imgOpts.style.width;
		sh = elemConfig.subnet.imgOpts.style.height;
		vw = elemConfig.vm.imgOpts.style.width;
		vh = elemConfig.vm.imgOpts.style.height;
	}
	initWH();
    
    //元件上红色删除x所绑定的事件
	var delGroup = function (x, y, ew, eh, data) {
		let rectZrOpts = angular.copy(elemConfig.transparentRect.zrOpts);
		let delImgOpts = angular.copy(elemConfig.delete.imgOpts);
		rectZrOpts.shape = _.assign(rectZrOpts.shape, {
			x: x - 15,
			y: y - 15,
			width: ew + 30,
			height: eh + 30
		});
		delImgOpts.style = _.assign(delImgOpts.style, {
			x: x + ew,
			y: y
		});

		let transparentRect = new zrender.Rect(rectZrOpts);
		let deleteIcon = new zrender.Image(delImgOpts);
		deleteIcon.data = data;

		let group = new zrender.Group();
		group.add(transparentRect);
		group.add(deleteIcon);

		deleteIcon.on('click', function (e) {
			self.deleteItem(e.target.data);
			self.$apply();
		});

		return group;
	};
    
    //画线函数
	var line = function (x1, y1, x2, y2, style, z) {
		let line = new zrender.Line({
			shape: {
				x1: x1,
				y1: y1,
				x2: x2,
				y2: y2
			},
			style: {
				stroke: style.stroke || "#999",
				lineWidth: style.lineWidth || 2,
				lineDash: style.lineDash || ""
			},
			z: z || 0,
			scale: [scale.x, scale.y]
		});
		return line;
	};
    
    //画圆函数
	var circle = function (cx, cy, r, opts) {
		let circleZrOpts = angular.copy(elemConfig.circle.zrOpts);
		circleZrOpts.shape = _.assign(circleZrOpts.shape, {
			cx: cx,
			cy: cy,
			r: r
		});
		circleZrOpts.style = _.assign(circleZrOpts.style, {
			stroke: opts.style.stroke || "#999",
			fill: opts.style.fill || "#fff",
			lineWidth: opts.style.lineWidth || 2,
			text: opts.style.text || "",
			textBorderColor: opts.style.stroke
		});
		circleZrOpts.z = opts.z || 0;
		circleZrOpts.invisible = opts.invisible || false;//true为不可见
		circleZrOpts.scale = [scale.x, scale.y];
		let circle = new zrender.Circle(circleZrOpts);
		return circle;
	};
    
    //矩形函数
	var rect = function (x, y, w, h, r, style, z) {
		let rect = new zrender.Rect({
			shape: {
				x: x,
				y: y,
				r: r || 2,//圆角矩形，相当于border-radius
				width: w || 8,
				height: h || 8
			},
			style: style,
			z: z || 0,
			scale: [scale.x, scale.y]
		});
		return rect;
	};
    
    //点击元件的事件，红色X出现和消失的事件
	var addEvent = function (elem, delGroup, data, edit = false) {
		let group = new zrender.Group();
		group.add(elem);
		group.add(delGroup);
        //元件在编辑和非编辑页面的点击事件组成
		elem.on('click', function (e) {
			if(!edit){
				self.$broadcast('topoDetail', data, edit);
			}else{
				if(!self.isSuperAdmin){
					if(!data.isExternal){
						self.$broadcast('topoDetail', data, edit);
					}
				}else{
					self.$broadcast('topoDetail', data, edit);
				}
			}
		});

		if (edit) {
			let textWidth = 0;
			//编辑时，单独对左边的网络做判断，网络的透明背景要包含网络的名字在内
			if (data._type == "net") {
				let cvs = document.getElementsByTagName("canvas")[0];
				let context = cvs.getContext("2d");
				textWidth = context.measureText(data.name).width * scale.x;
				//delGroup._children[0]为透明快
				delGroup._children[0].attr({
					shape: {
						width: (delGroup._children[0].shape.width + textWidth + elemConfig.netRect.zrOpts.style.textDistance) / scale.x
					}
				});
			}
            
            //vm为什么要单独处理？
			if (data._type == "vm") {
				var timer = null;
				elem.on('mouseover', function (e) {
					clearInterval(timer)
					zr.add(delGroup);
				});
				elem.on('mouseout', function (e) {
					clearInterval(timer)
					timer = setTimeout(function(){
						zr.remove(delGroup);
					},100)
				},true);
				delGroup._children[1].on('mouseover', function (e) {
					clearInterval(timer)
					zr.add(delGroup);
				});
				delGroup._children[1].on('mouseout', function (e) {
					clearInterval(timer)
					zr.remove(delGroup);
				});

			} else {
				group.on('mouseover', function (e) {
					zr.add(delGroup);
				});
				group.on('mouseout', function (e) {
					zr.remove(delGroup);
				},true);
			}
		}
	};

	var addElemTip = function (elem, elemParams, _elem, _add) {
		//鼠标悬浮时，下面三角形的两条线绘制
		let l1 = line(elemParams.x + elemParams.elemW / 2, elemParams.y, elemParams.x + elemParams.elemW * 3 / 8, elemParams.y - 5, {
			stroke: elemParams.stroke || "#51a3ff",
			lineWidth: 1
		});
		let l2 = line(elemParams.x + elemParams.elemW / 2, elemParams.y, elemParams.x + elemParams.elemW * 5 / 8, elemParams.y - 5, {
			stroke: elemParams.stroke || "#51a3ff",
			lineWidth: 1
		});
		let orgElem;

		elem.on("mouseover", function () {
			if (_elem) {
				elem = _elem;
			}
			elem.mouseCount = elem.mouseCount || 0;
			elem.mouseCount++;
			if (elem.mouseCount == 1) {
				orgElem = angular.copy(elem);
			}
			let commonStyle = {
				text: elemParams.tipText,
				textWidth: null,
				textBorderWidth: 1,
				textBorderColor: elemParams.stroke || "#51a3ff",
				textBorderRadius: 2,
				textPadding: 8 * scale.x,
				textBackgroundColor: "#fff"
			};
			if (elemParams.pureName) {
				let cvs = document.getElementsByTagName("canvas")[0];
				let context = cvs.getContext("2d");
				let textWidth = context.measureText(elemParams.tipText).width * scale.x;
				if (textWidth > 180 * scale.x) {

				}
				elem.attr({
					style: _.assign(commonStyle, {
						truncate: null
					}),
					z: orgElem.z ? orgElem.z + 1 : 2
				});
			} else {
				elem.attr({
					style: _.assign(commonStyle, {
						// truncate: {
						// 	outerWidth: 180 * scale.x,
						// 	ellipsis: "..."
						// }
						truncate: null
					}),
					z: orgElem.z ? orgElem.z + 1 : 2
				});
			}
			if (_add) {
				_add.attr({
					z: orgElem.z ? orgElem.z + 1 : 2
				});
			}
			zr.add(l1);
			zr.add(l2);
		});
		elem.on("mouseout", function () {
			if (_elem) {
				elem = _elem;
			}
			elem.attr({
				style: {
					text: elemParams.data.name,
					textWidth: elemParams._type == "vm" ? elemConfig.vm.imgOpts.style.truncate.outerWidth : elemDefault.truncate.outerWidth,
					truncate: elemParams._type == "vm" ? elemConfig.vm.imgOpts.style.truncate : elemDefault.truncate,
					textAlign: "center",
					textBorderWidth: 0,
					textBorderColor: null,
					textBorderRadius: 0,
					textBackgroundColor: null,
					textPadding: 0,
					textDistance: 5 * scale.y
				},
				z: orgElem.z || 0
			});
			if (_add) {
				_add.attr({
					z: orgElem.z || 0
				});
			}
			zr.remove(l1);
			zr.remove(l2);
		});
	};

	var addExnet = function (x, y, data, edit) {
		let exnetZrOpts = angular.copy(elemConfig.exnet.imgOpts);
		exnetZrOpts.style = _.assign(exnetZrOpts.style, {
			x: x,
			y: y,
			text: data.name
		});
		exnetZrOpts.scale = [scale.x, scale.y];
		let exnet = new zrender.Image(exnetZrOpts);
		let group = delGroup(x, y, exnetZrOpts.style.width, exnetZrOpts.style.height, data);
		let exnetTipText = ['{a|' + $translate.instant('aws.topo.externalNet') + '：' + data.name + '}', '{b|CIDR：' + data.cidr.join('\nCIDR：') + '}'].join('\n');
		let params = {
			x: x,
			y: y,
			elemW: ew,
			tipText: exnetTipText,
			data: data
		};
		addElemTip(exnet, params);
		addEvent(exnet, group, data, edit);
		zr.add(exnet);
	};

	var addFirewall = function (x, y, data, edit) {
		let firewallZrOpts = angular.copy(elemConfig.firewall.imgOpts);
		firewallZrOpts.style = _.assign(firewallZrOpts.style, {
			x: x,
			y: y,
			text: data.name
		});
		firewallZrOpts.scale = [scale.x, scale.y];
		let firewall = new zrender.Image(firewallZrOpts);
		let group = delGroup(x, y, firewallZrOpts.style.width, firewallZrOpts.style.height, data);
		let tipText = ['{a|' + $translate.instant('aws.topo.firewallName') + '：' + data.name + '}', '{b|' + $translate.instant('aws.topo.linkedRouter') + '：' + data.routerName + '}'].join('\n');
		let params = {
			x: x,
			y: y,
			elemW: fw,
			tipText: tipText,
			data: data,
			pureName: true
		};
		addElemTip(firewall, params);
		addEvent(firewall, group, data, edit);
		zr.add(firewall);
	};

	var addRouter = function (x, y, data, edit) {
		let routerZrOpts = angular.copy(elemConfig.router.imgOpts);
		routerZrOpts.style = _.assign(routerZrOpts.style, {
			x: x,
			y: y,
			text: data.name
		});
		routerZrOpts.scale = [scale.x, scale.y];
		let router = new zrender.Image(routerZrOpts);
		let group = delGroup(x, y, routerZrOpts.style.width, routerZrOpts.style.height, data);
		let routerTipText = ['{a|' + $translate.instant('aws.topo.routerName') + '：' + data.name + '}', '{b|' + $translate.instant('aws.topo.gatewayIp') + '：' + data.gateway + '}'].join('\n');
		let params = {
			x: x,
			y: y,
			elemW: rw,
			tipText: routerTipText,
			data: data
		};
		addElemTip(router, params);
		addEvent(router, group, data, edit);
		zr.add(router);
	};

	var addSubnet = function (x, y, data, color, edit) {
		let P = {
			x: x + sw / 2,
			y: y + sh / 2
		};
		let P1 = {
			x: x + sw / 4,
			y: y + sh / 2
		};
		let P2 = {
			x: x + sw * 3 / 4,
			y: y + sh / 2
		};
		let P3 = {
			x: x + sw / 2,
			y: y + sh / 4
		};
		let P4 = {
			x: x + sw / 2,
			y: y + sh * 3 / 4
		};
		let lineStyle = {
			stroke: color
		};
		let cOpts = {
			style: {
				stroke: color
			},
			z: 2
		};
		let subText = "";
		if (data.network_type == "vlan") {
			subText = ['{a|' + $translate.instant('aws.topo.networkName') + '：' + data.networkName + '}', '{b|VLAN ID：' + data.vlanId + '}', '{c|' + $translate.instant('aws.topo.subnetName') + '：' + data.name + '}'].join('\n');
		} else {
			subText = ['{a|' + $translate.instant('aws.topo.networkName') + '：' + data.networkName + '}', '{b|' + $translate.instant('aws.topo.networkType') + '：' + data.network_type.toUpperCase() + '}', '{c|' + $translate.instant('aws.topo.subnetName') + '：' + data.name + '}'].join('\n');
		}
		let c = circle(P.x, P.y, 20, {
			style: {
				stroke: color,
				text: data.name
			},
			z: 1
		});
		let c1 = circle(P1.x, P1.y, 3, cOpts);
		let c2 = circle(P2.x, P2.y, 3, cOpts);
		let c3 = circle(P3.x, P3.y, 3, cOpts);
		let c4 = circle(P4.x, P4.y, 3, cOpts);
		let l1 = line(P1.x, P1.y, P4.x, P4.y, lineStyle, 2);
		let l2 = line(P1.x, P1.y, P3.x, P3.y, lineStyle, 2);
		let l3 = line(P2.x, P2.y, P3.x, P3.y, lineStyle, 2);
		let l4 = line(P2.x, P2.y, P4.x, P4.y, lineStyle, 2);
		// let l5 = line(x + sw / 2, y, x + sw * 3 / 8, y - 5, {
		// 	stroke: color,
		// 	lineWidth: 1
		// });
		// let l6 = line(x + sw / 2, y, x + sw * 5 / 8, y - 5, {
		// 	stroke: color,
		// 	lineWidth: 1
		// });
		let subnet = new zrender.Group();
		let group = delGroup(x, y, elemConfig.subnet.imgOpts.style.width, elemConfig.subnet.imgOpts.style.height, data);
		let params = {
			x: x,
			y: y,
			elemW: sw,
			tipText: subText,
			data: data,
			stroke: color
		};
		subnet.add(c);
		subnet.add(l1);
		subnet.add(l2);
		subnet.add(l3);
		subnet.add(l4);
		//subnet.add(l5);
		//subnet.add(l6);
		subnet.add(c1);
		subnet.add(c2);
		subnet.add(c3);
		subnet.add(c4);
		addElemTip(subnet, params, c);
		addEvent(subnet, group, data, edit);
		zr.add(subnet);
	};
    //addNet(_NetPaddingLeft, _NetPaddingTop + k * _Neth, n, elemDefault.colors[k], edit);
    self.vmRectArr=[
        {name:"暂停,热升级,调整配置中,取消热升级,异常,无法识别状态的云主机",color:"#f39c12"},
	    {name:"运行或健康状态的云主机",color:"#1abc9c"},
	    {name:"挂起状态的云主机",color:"#4a6583"},
	    {name:"关机状态的云主机",color:"#666666"},
	    {name:"错误状态的云主机",color:"#e74c3c"},
	    {name:"其他状态的云主机",color:"#51a3ff"},
	];
	var addNet = function (x, y, data, color, edit) {
		let netRectZrOpts = angular.copy(elemConfig.netRect.zrOpts);
		netRectZrOpts.shape = _.assign(netRectZrOpts.shape, {
			x: x || 0,
			y: y
		});
		netRectZrOpts.style = _.assign(netRectZrOpts.style, {
			fill: color,
			//text: data.name
		});
		netRectZrOpts.scale = [scale.x, scale.y];

		let netRect = new zrender.Rect(netRectZrOpts);
		let netText = new zrender.Text({
			style: {
				x: (x + netRect.shape.width + netRect.style.textDistance) * scale.x,
				y: y * scale.y,
				text: data.name,
				fontSize: netRect.style.fontSize,
				textLineHeight: netRect.style.textLineHeight,
				textFill: netRect.style.textFill,
				truncate: netRect.style.truncate
			}
		});
		let net = new zrender.Group();
		let group = delGroup(x, y, netRect.shape.width, netRect.shape.height, data);
		net.add(netRect);
		net.add(netText);
		addEvent(net, group, data, edit);
		zr.add(net);
	};

	var addVmNetInfo=function(x,y,data,color,edit){
        let netRectZrOpts = angular.copy(elemConfig.vmRect.zrOpts);
		netRectZrOpts.shape = _.assign(netRectZrOpts.shape, {
			x: x || 0,
			y: y
		});
		netRectZrOpts.style = _.assign(netRectZrOpts.style, {
			fill: color,
			//text: data.name
		});
		netRectZrOpts.scale = [scale.x, scale.y];

		let netRect = new zrender.Rect(netRectZrOpts);
		let netText = new zrender.Text({
			style: {
				x: (x + netRect.shape.width + netRect.style.textDistance) * scale.x,
				y: y * scale.y,
				text: data.name,
				fontSize: netRect.style.fontSize,
				textLineHeight: netRect.style.textLineHeight,
				textFill: netRect.style.textFill,
				truncate: netRect.style.truncate
			}
		});
		let net = new zrender.Group();
		//let group = delGroup(x, y, netRect.shape.width, netRect.shape.height, data);
		net.add(netRect);
		net.add(netText);
		//addEvent(net, group, data, edit);
		zr.add(net);
	}

	var VM = function (x, y, data, edit) {
		let vm_state = data.task_state || data.vm_state;
		let rectStyle = {
			fill: "#fff",
			stroke: vmStatusColor[vm_state] || "#999",
			lineWidth: 2,
			text: data.name,
			fontSize: elemDefault.fontSize,
			textLineHeight: elemDefault.textLineHeight,
			textFill: elemDefault.textFill,
			textPosition: elemDefault.textPosition,
			textDistance: elemDefault.textDistance,
			truncate: elemConfig.vm.imgOpts.style.truncate
		};
		let lStyle = {
			stroke: vmStatusColor[vm_state]
		};
		if (vm_state.indexOf("ing") > -1) {
			rectStyle.lineDash = [3, 3];
			lStyle.lineDash = [3, 3];
		}
		let rect1 = rect(x, y, vw, vh * 0.8, 3, rectStyle, 1);
		let l1 = line(x, y + vh * 0.6, x + vw, y + vh * 0.6, lStyle, 1);//虚机里面的横线
		let l2 = line(x + 0.4 * vw, y + vh * 0.8, x + 0.4 * vw, y + vh, lStyle);//虚机下面的竖线
		let l3 = line(x + 0.6 * vw, y + vh * 0.8, x + 0.6 * vw, y + vh, lStyle);//
		let l4 = line(x + 0.3 * vw, y + vh, x + 0.7 * vw, y + vh, lStyle);//虚机下面的竖线下面的横线

		let vm = new zrender.Group();
		vm.add(rect1);
		vm.add(l1);
		vm.add(l2);
		vm.add(l3);
		vm.add(l4);

		let group = delGroup(x, y, elemConfig.vm.imgOpts.style.width, elemConfig.vm.imgOpts.style.height, data);
		addEvent(vm, group, data, edit);

		let params = {
			x: x,
			y: y,
			elemW: vw,
			tipText: $translate.instant('aws.topo.instanceName') + "：" + data.name,
			data: data,
			stroke: vmStatusColor[vm_state],
			pureName: true,
			_type: "vm"
		};
		addElemTip(vm, params, rect1, l1);

		return vm;
	};

	var addLine = function (x1, y1, x2, y2, lineWidth) {
		let Line = line(x1, y1, x2, y2, {
			lineWidth: lineWidth,
			stroke: "#999"
		});
		zr.add(Line);
	};

	var addCircle = function (cx, cy, r, lineWidth, z) {
		let Circle = new zrender.Circle({
			shape: {
				cx: cx,
				cy: cy,
				r: r
			},
			style: {
				stroke: "#999",
				fill: "#fff",
				lineWidth: 2,
			},
			z: 1,
			scale: [scale.x, scale.y]
		});
		zr.add(Circle);
	};

	var addSVLink = function (Sx, Sy, Vx, Vy, lineWidth) {
		addLine(Sx + sw, Sy + sh / 2, Vx + vh / 2, Sy + sh / 2, lineWidth);
		addLine(Vx + vh / 2, Sy + sh / 2, Vx + vh / 2, Vy + vh, lineWidth);
		addCircle(Vx + vw / 2, Sy + sh / 2, 5, lineWidth, 1);
	};

	function init(resData, edit = false) {
		var data = resData.net,
			allVmdata = resData.vm.filter(inst => inst.name != "fixedImageInstanceName"),
			sharedNet = resData.sharedNet,
			sharedExnet = resData.sharedExnet,
			netNoRouter = resData.netNoRouter;
		if (sharedExnet.length) {
			_.each(sharedExnet, net => {
				data.push(net);
			});
			data = _.uniq(data, "id");
		}
		var allNetsList = []; //所有外网下的网络数据
		var allSubsList = [];
		var nullRouterNum = 0;

		var _NetPaddingLeft = netPaddingLeft, //网络rect距离画布左边的距离
			_NetPaddingTop = netPaddingTop, //网络rect距离画布上方的距离
			_Neth = elemConfig.netRect.zrOpts.shape.height + 10, //网络rect的间距
			_ASW = elemDefault.defaultSpace._ASW, //元件间增加的基本距离
			_ERw = elemDefault.defaultSpace._ERw, //外网与路由器的间距
			_RSw = elemDefault.defaultSpace._RSw, //路由器和子网的间距
			_SSh = elemDefault.defaultSpace._SSh, //子网在竖线上的间距
			_VVw = elemDefault.defaultSpace._VVw; //虚拟机之间的间距

		var Ex = pLeft, //外网横坐标
			Ey,
			Fx = Ex + ew + _ASW, //防火墙横坐标
			Fy,
			Rx = Ex + _ERw, //路由器横坐标
			Ry,
			Sx = Rx + _RSw, //子网横坐标
			Sy,
			Vx,
			Vy = 50,
			//外网与路由器之间的起始点
			ERx1 = Ex + ew,
			ERy1,
			ERx2 = Rx,
			ERy2 = ERy1,
			//路由器与子网间竖线的起始点
			RSLx1 = Rx + rw + (Sx - Rx - rw) * 0.4,
			RSLy1,
			RSLx2 = RSLx1,
			RSLy2,
			ERLx1 = Ex + ew + (Rx - Ex - ew) * 0.4,
			ERLy1,
			ERLx2 = ERLx1,
			ERLy2,
			FRLx1,
			FRLy1,
			FRLx2,
			FRLy2;

		var initXY = function () {
			Ex = pLeft; //外网横坐标
			Fx = Ex + ew + _ASW; //防火墙横坐标
			Rx = Ex + _ERw; //路由器横坐标
			Sx = Rx + _RSw; //子网横坐标
			ERx1 = Ex + ew;
			ERx2 = Rx;
			ERy2 = ERy1;
			RSLx1 = Rx + rw + (Sx - Rx - rw) * 0.4;
			RSLx2 = RSLx1;
			ERLx1 = Ex + ew + (Rx - Ex - ew) * 0.4;
			ERLx2 = ERLx1;
		};

		self.formatDataFunc = function (data) {
			allNetsList.push.apply(allNetsList, sharedNet);
			_.each(netNoRouter, n => {
				if (n.subnets) {
					allNetsList.push(n);
				}
			});
			_.each(data, item => {
				item._type = "exNet";
				item.isExternal=true;
				_.each(item.networks, n => {
					allNetsList.push(n);
				});
				if (!item.router.length) {
					nullRouterNum++;
				}
			});
			allNetsList = _.uniq(allNetsList, "id");

			_.each(allNetsList, n => {
				n._type = "net";
				_.each(n.subnets, s => {
					s.networkId = n.id;
					s.vlanId = n.segmentation_id;
					s.networkName = n.name;
					s.network_type = n.network_type;
					s._type = "subnet";
					allSubsList.push(s);
				});
			});
			allSubsList = _.uniq(allSubsList, "id");
			//找出外部子网
			data.forEach(function(exnet){
				allSubsList.forEach(function(sub){
					if(exnet.id==sub.networkId&&exnet.isExternal){
						sub.isExternal=true;
					}
				}); 
			});
			let getColor = function () {
				let colorValue = "0,1,2,3,4,5,6,7,8,9,a,b,c,d,e,f";
				let colorArray = colorValue.split(",");
				let color = "#";
				for (let i = 0; i < 6; i++) {
					color += colorArray[Math.floor(Math.random() * 16)];
				}
				return color;
			};
			if (allNetsList.length > elemDefaultColors.length) {
				let addColorLength = allNetsList.length - elemDefaultColors.length;
				for (let i = 0; i < addColorLength; i++) {
					let color = getColor();
					elemDefaultColors.push(color);
				}
			}
			elemDefault.colors = elemDefaultColors;

			let mapItemFunc = function (item) {
				//选出当前网络下的所有子网
				_.each(item.router, r => {
					_.each(allSubsList, s => {
						if ((s.router_id == r.id || !s.router_id) && !s.added) {
							item.subnetsList.push(s);
							s.added = true;
						}
					})
				});
				if (nullRouterNum == data.length) {
					_.each(allSubsList, s => {
						if (!s.added) {
							item.subnetsList.push(s);
							s.added = true;
						}
					})
				}
				item.subnetsList = _.uniq(item.subnetsList, "id");

				_.each(item.subnetsList, s => {
					s.vm = [];
					var errorVms=[];
					var normalVms=[];
					item.subIds.push(s.id);
					_.each(allVmdata, v => {
						v._type = "vm";
						v.subnetsId = _.uniq(v.subnetsId);
						if (v.subnetsId.length == 0 && !v.added) {
							s.vm.push(v); //虚拟机错误状态时没有网络数据，此类虚拟机将都会放到第一条数据的第一个子网中
							v.added = true;
						} else {
							_.each(v.subnetsId, vmSubId => {
								if (s.id == vmSubId) {
									s.vm.push(v);
								}
							});
						}
					});
					s.vm = _.uniq(s.vm, "id");
					s.vm.forEach(function(v){
						if(v.vm_state=='error'&&v.subnetsId&&v.subnetsId.length==0){
							errorVms.push(v);
						}else{
							normalVms.push(v);
						}
					});
					//将子网下面错误且不是属于本子网的虚机放在数组的最后面
					s.vm=normalVms.concat(errorVms);
				});
				item.subIds = _.uniq(item.subIds);

				// _.each(item.subIds, subId => {
				// 	_.each(allVmdata, v => {
				// 		v._type = "vm";
				// 		if (v.subnetsId.length == 0 && !v.added) {
				// 			item.vm.push(v); //虚拟机错误状态时没有网络数据，此类虚拟机将都会放到第一条数据中
				// 			v.added = true;
				// 		} else {
				// 			_.each(v.subnetsId, vmSubId => {
				// 				if (subId == vmSubId) {
				// 					item.vm.push(v);
				// 				}
				// 			});
				// 		}
				// 	});
				// });
				// item.vm = _.uniq(item.vm, "id");

				_.each(allNetsList, (n, k) => { //多外网时，同一网络下的子网可能会分别关联到不同外网的路由器上
					_.map(item.subnetsList, s => {
						if (n.id == s.networkId) {
							s.color = elemDefault.colors[k];
						}
						return s;
					});
				});

				_.map(item.router, (r, i) => {
					r._type = "router";
					if (r.firewall && r.firewall.firewall_id) {
						item.firewallNum++;
						item.firewallIdsList.push(r.firewall.firewall_id);
						r.firewall._type = "firewall";
						r.firewall.routerName = r.name;
						r.firewall.routerId = r.id;
					}
					r.subnets = [];
					item.router[item.router.length - 1].subnets = [];
					_.each(item.subnetsList, s => {
						if (s.router_id == r.id) {
							r.subnets.push(s);
						}
						if (!s.router_id) {
							item.router[item.router.length - 1].subnets.push(s);
						}
					});
					item.router[item.router.length - 1].subnets = _.uniq(item.router[item.router.length - 1].subnets, "id");
					if (!r.subnets.length) {
						item.nullSubRNum++;
					}
					return r;
				});
				item.firewallIdsList = _.uniq(item.firewallIdsList);
			};
			_.each(data, (item, index) => {
				item.firewallIdsList = [];
				//item.vm = [];
				item.subnetsList = [];
				item.subIds = [];
				item.firewallNum = 0;
				item.nullSubRNum = 0;
				if (nullRouterNum == data.length) {
					if ((data.length > 1 && index == 0) || data.length == 1) {
						mapItemFunc(item);
					}
				} else {
					if (item.router.length) {
						mapItemFunc(item);
					}
				}
			});
		};

		self.resizeCvsFunc = function (data) {
			let totalRouterNum = 0;
			let totalSubNum = 0;
			let totalNullSubRNum = 0;
			let maxVmNum = 0;
			let vmNumList = [];
			_.each(data, (item, index) => {
				//vmNumList.push(item.vm.length);
				_.each(item.subnetsList, s => {
					vmNumList.push(s.vm.length);
				});
				totalRouterNum = totalRouterNum + item.router.length;
				totalSubNum = totalSubNum + item.subIds.length;
				totalNullSubRNum = totalNullSubRNum + item.nullSubRNum;
			});
			maxVmNum = _.max(vmNumList);

			_SSh = totalSubNum ? (H * (totalSubNum + 1) / 10 / totalSubNum) : _SSh;
			_VVw = maxVmNum ? (W * 0.5 * (maxVmNum + 1) / 10 / maxVmNum) : _VVw;

			if (_SSh < elemDefault.defaultSpace._SSh) {
				_SSh = elemDefault.defaultSpace._SSh;
			}
			if (_VVw < 120) {
				_VVw = 100;
				elemConfig.vm.imgOpts.style.truncate = _.assign(angular.copy(elemConfig.vm.imgOpts.style.truncate), {
					outerWidth: 100 * scale.x,
					ellipsis: "..."
				});
			}

			if (data.length == 1) {
				let tempH = totalRouterNum > 1 ? ((totalSubNum + totalNullSubRNum + (totalRouterNum - 1) / 2) * _SSh + 2 * padding) : (totalSubNum + totalNullSubRNum) * _SSh + 2 * padding;
				if (tempH > H) {
					zr.resize({
						height: tempH * scale.y
					});
				}
			} else if (data.length > 1) {
				let tempH = totalRouterNum > 1 ? ((totalSubNum + totalNullSubRNum + (totalRouterNum - 1) / 2) * _SSh + data.length * padding) : (totalSubNum + totalNullSubRNum) * _SSh + (data.length + 1) * padding;
				tempH = tempH / 0.8;
				if (tempH > H) {
					zr.resize({
						height: tempH * scale.y
					});
				}
			}
			//if (Sx + sw + 100 + _VVw * (maxVmNum + 2) > W) {
			zr.resize({
				width: (Sx + sw + _VVw * (maxVmNum + 1) + padding * 2) * scale.x
			});
			//} 
			H = Math.ceil(zr.getHeight());
			W = Math.ceil(zr.getWidth());
		};

		self.renderTopoFunc = function (data) {
			let alignH = 0;
			let _H = 0;

			let vmGroupFoldFun = function (s,uniqFNum) {
				if (s.vm.length) {
					addLine(Sx + sw, Sy + sh / 2, Sx + sw + _VVw / 2, Sy + sh / 2, 2);//折叠前的横线
					//addCircle(Sx + sw + _VVw / 2, Sy + sh / 2, 10, 2, 1);
					let foldSpot = new zrender.Group();
					let foldCx = Sx + sw + _VVw / 2;
					let foldCy = Sy + sh / 2;
					let foldCircle = circle(foldCx, foldCy, 10, {
						style: {
							lineWidth: 2
						},
						z: 1
					});
					let foldL1 = line(foldCx - 5, foldCy, foldCx + 5, foldCy, {
						lineWidth: 2
					}, 1);//fold中的横线
					let foldL2 = line(foldCx, foldCy + 5, foldCx, foldCy - 5, {
						lineWidth: 2
					}, 1);//fold中的竖线
					foldSpot.add(foldCircle);
					foldSpot.add(foldL1);
					if (s.folded) {
						foldSpot.add(foldL2);
					}
					//foldSpot.vmData = s.vm;
					//foldSpot.Sy = Sy;
					zr.add(foldSpot);

					let l1, l2, circleNode, vm;
					let vmGroup = new zrender.Group();
					let foldGroup = new zrender.Group();
					let transparentFoldSpot = circle(foldCx, foldCy, 10, {
						style: {
							lineWidth: 2
						},
						z: 1,
						invisible: true
					});
					transparentFoldSpot.Sy = Sy;
					zr.add(transparentFoldSpot);
					transparentFoldSpot.on("click", function (e) {
						e.target.fold = !e.target.fold;
						//let _Sy = e.target.parent.Sy;
						let _Sy = e.target.Sy;
						if (!e.target.fold && s.folded) {
							foldSpot.remove(foldL2);
							s.folded = false;
							addVmGroup(_Sy);
						} else {
							s.folded = true;
							foldSpot.add(foldL2);
							vmGroup.removeAll();
							foldGroup.remove(vmGroup);
						}
						_.map(data, item => {
							_.each(item.subnetsList, (sub, j) => {
								if (sub.id == s.id) {
									item.subnetsList[j] = s;
								}
							});
							return item;
						});
						self.renderedData = data;
					});

					function addVmGroup(Sy) {
						_.each(s.vm, (v, j) => {
							//外网下是否有防火墙对子网横坐标Sx影响很大
							if(uniqFNum>0){
								_ERw = 320;
								Sx=Ex+_ERw+_RSw;
							}else{
								_ERw = 250;
								Sx=Ex+_ERw+_RSw;
							}
							Vx = Sx + sw + _VVw * (j + 1);
							if (v.subnetsId.length) {
								_.each(v.subnetsId, sId => {
									if (s.id == sId) {
										//addSVLink(Sx, Sy, Vx, Sy - _SSh / 2, 2);
										//addVm(Vx, Sy - _SSh / 2, v, edit);
										l1 = line(j == 0 ? foldCx : foldCx + _VVw / 2 + (j - 1) * _VVw, Sy + sh / 2, Vx + vh / 2, Sy + sh / 2, {
											lineWidth: 2
										});
										l2 = line(Vx + vh / 2, Sy + sh / 2, Vx + vh / 2, Sy - _SSh / 2 + vh, {
											lineWidth: 2
										});
										circleNode = circle(Vx + vw / 2, Sy + sh / 2, 5, {
											style: {
												lineWidth: 2
											},
											z: 1
										});
										vm = VM(Vx, Sy - _SSh / 2, v, edit);
										vmGroup.add(l1);
										vmGroup.add(l2);
										vmGroup.add(circleNode);
										vmGroup.add(vm);
										foldGroup.add(vmGroup);
										zr.add(foldGroup);
									}
								});
							} else {
								vm = VM(Vx, Sy - _SSh / 2, v, edit);
								vmGroup.add(vm);
								foldGroup.add(vmGroup);
								zr.add(foldGroup);
							}
						});
					}
					if (!s.folded) {
						addVmGroup(Sy);
					}
				}
			}
			_.each(data, (item, index) => {
				let firewallNum = item.firewallNum,
					uniqFNum = item.firewallIdsList.length,
					routerNum = item.router.length,
					netNum = item.networks.length,
					subNum = item.subIds.length,
					//vmNum = item.vm.length,
					nullSubRNum = item.nullSubRNum;

				let dynamicH = routerNum > 1 ? ((subNum + nullSubRNum + (routerNum - 1) / 2) * _SSh + padding) : ((subNum + nullSubRNum) * _SSh + padding * 2);
				_H = _H + dynamicH;
				if (index == 0) {
					alignH = dynamicH / 2;
				} else {
					alignH = _H - dynamicH / 2;
				}

				Ey = alignH - eh / 2;
				ERy1 = ERy2 = alignH;

				if (routerNum == 1) { // 路由器个数为1的情况
					addExnet(Ex, Ey, item, edit);
					if (item.router[0].firewall && item.router[0].firewall.firewall_id) {
						_ERw = 320;
						Fy = alignH - fh / 2;
						initXY();
						addFirewall(Fx, Fy, item.router[0].firewall, edit);
					} else {
						_ERw = 250;
						initXY();
					}
					RSLy1 = alignH - (subNum + 1) * _SSh / 2;
					RSLy2 = alignH + (subNum + 1) * _SSh / 2;
					Ry = alignH - rh / 2;
					Vy = RSLy1;
					addLine(ERx1, ERy1, ERx2, ERy2, 2);
					addRouter(Rx, Ry, item.router[0], edit);
					addLine(Rx + rw, alignH, RSLx1, alignH, 2);

					if (subNum > 1) {
						addLine(RSLx1, RSLy1 + _SSh / 2, RSLx1, RSLy2 - _SSh / 2, 4);
					}

					var _sn = 0;
					_.each(item.router, (r, k) => {
						_sn = _sn + r.subnets.length;
						_.each(r.subnets, (s, i) => {
							if (k > 0) {
								Sy = RSLy1 + (_sn - r.subnets.length + i + 1) * _SSh - sh / 2;
							} else {
								Sy = RSLy1 + (i + 1) * _SSh - sh / 2;
							}
							addSubnet(Sx, Sy, s, s.color, edit);
							if (s.router_id == item.router[0].id) { //子网关联路由器
								addLine(RSLx1, Sy + sh / 2, Sx, Sy + sh / 2, 2);
							}
							vmGroupFoldFun(s,uniqFNum);
						});
					});
				} else {
					if (item.router.length > 0) {
						if (firewallNum > 0) {
							_ERw = 320;
							initXY();
							if (firewallNum == routerNum && uniqFNum == 1) {
								ERLx1 = Ex + ew + (Rx - Ex - ew) * 0.7;
							}
						}else{
							_ERw = 250;
							initXY();
						}
						let _sn = 0;
						_.each(item.router, (r, k) => {
							//添加路由器
							r.subN = r.subnets.length;
							if (r.subnets.length == 0) {
								r.subN = 1;
							}
							_sn = _sn + r.subN;
							RSLy1 = alignH - ((subNum + nullSubRNum) * _SSh + (routerNum - 1) * _SSh / 2) / 2 + (_sn - r.subN) * _SSh + (k + 1) * _SSh / 2;
							RSLy2 = RSLy1 + r.subN * _SSh;
							Ry = RSLy1 + (RSLy2 - RSLy1) / 2 - rh / 2;
							if (k == 0) {
								Vy = RSLy1 - _SSh / 2;
								ERLy1 = Ry + rh / 2 - _SSh / 2;
							} else {
								ERLy2 = Ry + rh / 2 + _SSh / 2;

							}
							addRouter(Rx, Ry, r, edit);
							if (r.subnets.length > 0) {
								addLine(RSLx1, RSLy1, RSLx1, RSLy2, 4);
								addLine(Rx + rw, Ry + rh / 2, RSLx1, Ry + rh / 2, 2);
							}

							//添加子网
							_.each(r.subnets, (s, i) => {
								Sy = RSLy1 + _SSh / 2 + i * _SSh - sh / 2;
								addSubnet(Sx, Sy, s, s.color, edit);
								//子网关联路由器
								if (s.router_id == r.id) {
									addLine(RSLx1, Sy + sh / 2, Sx, Sy + sh / 2, 2);
								}
								vmGroupFoldFun(s,uniqFNum);
							});

							//添加防火墙
							if (firewallNum > 0) {
								if (!(firewallNum == routerNum && uniqFNum == 1)) {
									ERLx1 = Ex + ew + (Rx - Ex - ew) * 0.3;
									Fx = ERLx1 + (Rx - ERLx1) * 0.3; //防火墙横坐标
									Fy = Ry + rh / 2 - fh / 2;
									if (r.firewall && r.firewall.firewall_id) {
										addFirewall(Fx, Fy, r.firewall, edit);
									}
								}
							}
							addLine(ERLx1, Ry + rh / 2, Rx, Ry + rh / 2, 2);
						});
						Ey = ERLy1 + (ERLy2 - ERLy1) / 2 - eh / 2;
						addLine(ERLx1, ERLy1, ERLx1, ERLy2, 4);
						addLine(Ex + ew, Ey + eh / 2, ERLx1, Ey + eh / 2, 2);
						addExnet(Ex, Ey, item, edit);
						if (firewallNum == routerNum && uniqFNum == 1) {
							Fy = Ey;
							addFirewall(Fx, Fy, item.router[0].firewall);
						}
					} else {
						addExnet(Ex, Ey, item, edit);
						if (nullRouterNum == data.length && ((data.length > 1 && index == 0) || data.length == 1)) {
							if (!(nullRouterNum == data.length && !allSubsList.length)) {
								addLine(Ex + ew, Ey + eh / 2, RSLx1, Ey + eh / 2, 2);
								addLine(RSLx1, alignH - (subNum * _SSh) / 2, RSLx1, alignH + (subNum * _SSh) / 2, 4);
							}
							_.each(item.subnetsList, (s, i) => {
								Sy = alignH - (subNum * _SSh) / 2 + _SSh / 2 + i * _SSh - sh / 2;
								addSubnet(Sx, Sy, s, s.color, edit);
								vmGroupFoldFun(s,uniqFNum);
							});
						}
					}
				}
			});
			//云主机文字显示
			zr.add(new zrender.Text({
				style: {
					x: _NetPaddingLeft* scale.x,
					y: _NetPaddingTop* scale.y,
					text:'云主机',
					textFill: '#333',
					fontSize: 16* scale.x,
					fontWeight: "normal"
				}
			}));
			self.vmRectArr.forEach(function(vmRect,l){
                addVmNetInfo(_NetPaddingLeft,_NetPaddingTop+24+l*_Neth,vmRect,vmRect.color,edit,_NetPaddingTop);
			});
			//网络文字的显示
			zr.add(new zrender.Text({
				style: {
					x: _NetPaddingLeft* scale.x,
					y: (_NetPaddingTop+30+150)* scale.y,
					text: '网络',
					textFill: '#333',
					fontSize: 16* scale.x,
					fontWeight: "normal"
				}
			}));
			//添加网络(网络的颜色没有要求，随机选，但是子网要和网络保持一致) 150=25*6
			_.each(allNetsList, (n, k) => {
				addNet(_NetPaddingLeft, _NetPaddingTop+55+150 + k * _Neth, n, elemDefault.colors[k], edit);
			});
		};
		self.formatDataFunc(data);
		self.resizeCvsFunc(data);
		self.renderTopoFunc(data);
	}

	function dragCanvas(canvas, target, callback) {
		var params = {
			left: 0,
			top: 0,
			currentX: 0,
			currentY: 0,
			flag: false
		};
		var getCss = function (elem, key) {
			//获取css属性值,IE<9 currentStyle; Chrome Firefox IE9 Safari Opera getComputedStyle() 
			return elem.currentStyle ? elem.currentStyle[key] : document.defaultView.getComputedStyle(elem, null)[key];
		};
		if (getCss(target, "left") !== "auto") {
			params.left = getCss(target, "left");
		}
		if (getCss(target, "top") !== "auto") {
			params.top = getCss(target, "top");
		}
		canvas.onmousedown = function (event) {
			params.flag = true;
			if (!event) {
				event = window.event;
				//禁止选取
				canvas.onselectstart = function () {
					return false;
				}
			}
			var e = event;
			params.currentX = e.clientX;
			params.currentY = e.clientY;
		};
		document.onmouseup = function () {
			params.flag = false;
			if (getCss(target, "left") !== "auto") {
				params.left = getCss(target, "left");
			}
			if (getCss(target, "top") !== "auto") {
				params.top = getCss(target, "top");
			}
		};
		document.onmousemove = function (event) {
			var e = event ? event : window.event;
			if (params.flag) {
				var nowX = e.clientX,
					nowY = e.clientY;
				var disX = nowX - params.currentX,
					disY = nowY - params.currentY;
				target.style.left = parseInt(params.left) + disX + "px";
				target.style.top = parseInt(params.top) + disY + "px";

				if (typeof callback == "function") {
					callback((parseInt(params.left) || 0) + disX, (parseInt(params.top) || 0) + disY);
				}
				if (event.preventDefault) {
					event.preventDefault();
				}
				return false;
			}
		}
	};

	function scaleCanvas(e) {
		self.$apply(function () {
			//滚轮上下判断：chrome  deltaY , fireFox detail , IE  wheelDelta
			if (e.deltaY > 0 || e.detail > 0 || e.wheelDelta < 0) {
				if (scale.x == 0.5) {
					scale.x = (scale.x * 10 + 0.2 * 10) / 10;
					scale.y = (scale.y * 10 + 0.2 * 10) / 10;
				} else if (scale.x < 2) {
					scale.x = (scale.x * 10 + 0.1 * 10) / 10;
					scale.y = (scale.y * 10 + 0.1 * 10) / 10;
				}
			}
			if (e.deltaY < 0 || e.detail < 0 || e.wheelDelta > 0) {
				if (scale.x > 0.5) {
					scale.x = (scale.x * 10 - 0.1 * 10) / 10;
					scale.y = (scale.y * 10 - 0.1 * 10) / 10;
				}
			}
			if (scale.x <= 0.5 || scale.x >= 2) {
				return;
			}
			zr.clear(); //清除所有对象和画布
			W = org_W                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  ;
			H = org_H;
			elemDefault = defaultSetting(scale);
			elemConfig = defaultConfig(elemDefault, scale);
			initWH();
			if (self.renderedData) {
				self.resizeCvsFunc(self.renderedData);
				self.renderTopoFunc(self.renderedData);
			} else {
				init(angular.copy(netTopoSrv.topoData));
			}
		});
	}

	function getTopo() {
		netTopoSrv.getTopo().then(function (res) {
			if (res && res.data) {
				netTopoSrv.topoData = JSON.parse(angular.copy(res.data));
				let data = JSON.parse(res.data);
				zr = zrender.init(document.getElementById("net-topo-main"));
				scale.x = 1;
				scale.y = 1;
				W = org_W;
				H = org_H;
				elemDefault = defaultSetting(scale);
				elemConfig = defaultConfig(elemDefault, scale);
				initWH();
				init(data);
			}
		});
	}

	self.$watch(function () {
		self.canvas = document.getElementsByTagName("canvas")[0];
		return self.canvas;
	}, function (canvas) {
		if (canvas) {
			self.canvas = canvas;
			// if (canvas.addEventListener) {
			// 	// IE9, Chrome, Safari, Opera  
			// 	canvas.addEventListener("mousewheel", scaleCanvas);
			// 	// Firefox  
			// 	canvas.addEventListener("DOMMouseScroll", scaleCanvas);
			// } else {
			// 	// IE 6/7/8  
			// 	canvas.attachEvent("onmousewheel", scaleCanvas);
			// }
			dragCanvas(canvas, canvas.parentNode);
		}
	});

	self.scaleCanvas = function (s) {
		if (s > 0) {
			if (scale.x == 0.5) {
				scale.x = (scale.x * 10 + 0.2 * 10) / 10;
				scale.y = (scale.y * 10 + 0.2 * 10) / 10;
			} else if (scale.x < 2) {
				scale.x = (scale.x * 10 + 0.1 * 10) / 10;
				scale.y = (scale.y * 10 + 0.1 * 10) / 10;
			}
		}
		if (s < 0) {
			if (scale.x == 2) {
				scale.x = (scale.x * 10 - 0.2 * 10) / 10;
				scale.y = (scale.y * 10 - 0.2 * 10) / 10;
			} else if (scale.x > 0.5) {
				scale.x = (scale.x * 10 - 0.1 * 10) / 10;
				scale.y = (scale.y * 10 - 0.1 * 10) / 10;
			}
		}
		if (scale.x <= 0.5 || scale.x >= 2) {
			return;
		}
		zr.clear(); //清除所有对象和画布
		W = org_W;
		H = org_H;
		elemDefault = defaultSetting(scale);
		elemConfig = defaultConfig(elemDefault, scale);
		initWH();
		if (self.renderedData) {
			self.resizeCvsFunc(self.renderedData);
			self.renderTopoFunc(self.renderedData);
		} else {
			init(angular.copy(netTopoSrv.topoData));
		}

	};
    
    //点击编辑拓扑按钮
	$rootScope.editTopo = function () {
		$location.search("type", "edit");
		self.topoAnimation = "animateOut";
		if (self.canvas) {
			if (self.canvas.removeEventListener) {
				self.canvas.removeEventListener("mousewheel", scaleCanvas);
				self.canvas.removeEventListener("DOMMouseScroll", scaleCanvas);
			} else {
				self.canvas.detachEvent("onmousewheel", scaleCanvas);
			}
			self.canvas.parentNode.style.left = 0;
			self.canvas.parentNode.style.top = 0;
		}
		document.onmousemove = null;
		document.onmouseup = null;

		scale.x = 0.8;
		scale.y = 0.8;
		zr.clear(); //清除所有对象和画布
		W = org_W;
		H = org_H;
		elemDefault = defaultSetting(scale);
		elemConfig = defaultConfig(elemDefault, scale);
		pLeft = elemDefault.defaultSpace.pLeft + 300;
		netPaddingLeft = elemDefault.defaultSpace.netPaddingLeft + 300;
		netPaddingTop = elemDefault.defaultSpace.netPaddingTop + 50;
		//netPaddingTop = elemDefault.defaultSpace.netPaddingTop + 68;
		initWH();
		init(angular.copy(netTopoSrv.topoData), true);

		let l1 = line(netPaddingLeft - 30, 0, netPaddingLeft - 30, Math.ceil(zr.getHeight() / scale.y), {
			stroke: "#c2d3eb",
			lineWidth: 1
		});
		zr.add(l1);

		//竖栅格线
		let wLength = Math.ceil((Math.ceil(zr.getWidth()) - (netPaddingLeft - 20) * scale.x) / (20 * scale.x));
		for (let i = 0; i < wLength; i++) {
			zr.add(line(netPaddingLeft + i * 20, 0, netPaddingLeft + i * 20, Math.ceil(zr.getHeight() / scale.x), {
				stroke: "#e5e5e5",
				lineWidth: 1
			}, -1));
		}
		//横栅格线
		let hLength = Math.ceil((Math.ceil(zr.getHeight()) - 20 * scale.y) / (20 * scale.y));
		for (let i = 0; i < hLength; i++) {
			zr.add(line(netPaddingLeft - 20, 20 + i * 20, Math.ceil(zr.getWidth() / scale.x), 20 + i * 20, {
				stroke: "#e5e5e5",
				lineWidth: 1
			}, -1));
		}

		//部件文字显示
		zr.add(new zrender.Text({
			style: {
				x: 0,
				y: 0,
				text: $translate.instant('aws.topo.parts'),
				textFill: '#333',
				fontSize: 18,
				fontWeight: "bold"
			}
		}));

		let exnet, firewall, router, netRect, subnet, vm;
		let iconTextStyle = {
			x: 0,
			y: "",
			width: 38,
			height: 38,
			text: '',
			fontSize: 12,
			textPosition: "right",
			textDistance: 20,
			textAlign: "null"
		};

		//exnet 
		function addExnetIcon(y) {
			let exnetZrOpts = angular.copy(elemConfig.exnet.imgOpts);
			exnetZrOpts.z=3;
			exnetZrOpts.style = _.assign(exnetZrOpts.style, _.assign(angular.copy(iconTextStyle), {
				y: y,
				height: 30,
				text: $translate.instant('aws.topo.externalNet')
			}));
			exnetZrOpts.draggable = true;
			exnet = new zrender.Image(exnetZrOpts);
			exnet.on('mouseup', function (e) {
				if (e.offsetX > netPaddingLeft * scale.x && e.target.draggable) {
					e.target.draggable = false;
					e.target.style.width = e.target.style.width / 0.6;
					e.target.style.height = e.target.style.height / 0.6;
					e.target.style.textDistance = iconTextStyle.textDistance / scale.x;
					addExnetIcon(y);
					$uibModal.open({
						animation: true,
						templateUrl: "js/commonModal/tmpl/createPhyNetworkModal.html",
						controller: "createPhyNetworkCtrl",
						resolve: {
							type: function () {
								return true;
							}
						}
					});
				} else {
					zr.remove(exnet);
					addExnetIcon(y);
				}
			});
			//鼠标从元素上面离开，解决AWSTACK261-261拖动离开时卡住的问题
			exnet.on('mousemove',function(e){
				if(e.offsetY<8||e.offsetX<5){
					zr.remove(exnet);
			        addExnetIcon(y);
				}
			})
			zr.add(exnet);
		}

		//firewall
		function addFirewallIcon(y) {
			let firewallZrOpts = angular.copy(elemConfig.firewall.imgOpts);
			firewallZrOpts.z=3;
			firewallZrOpts.style = _.assign(firewallZrOpts.style, _.assign(angular.copy(iconTextStyle), {
				y: y,
				text: $translate.instant('aws.topo.firewall')
			}));
			firewallZrOpts.draggable = true;
			firewall = new zrender.Image(firewallZrOpts);
			firewall.on("mouseup", function (e) {
				if (e.offsetX > netPaddingLeft * scale.x && e.target.draggable) {
					e.target.draggable = false;
					e.target.style.width = e.target.style.width / scale.x;
					e.target.style.height = e.target.style.height / scale.y;
					addFirewallIcon(y);
					let scope = self.$new();
					let firewallModal = $uibModal.open({
						animation: true,
						templateUrl: "createFirewallModal.html",
						scope: scope
					});

					scope.netFirewall = {
						name: "",
						router: "",
						description: ""
					};
					netfirewallSrv.getFirewallList().then(function (result) {
						let assoicatedRouteIds = [];
						if (result && result.data && angular.isArray(result.data)) {
							_.each(result.data, item => {
								assoicatedRouteIds = assoicatedRouteIds.concat(item.router_ids);
							});
						}
						return assoicatedRouteIds;
					}).then(function (assoicatedRouteIds) {
						routersSrv.getRoutersTableData().then(function (result) {
							if (result && result.data) {
								scope.routerList = [];
								let routerIds = [];
								_.each(result.data, item => {
									routerIds.push(item.id);
								});
								let unassoicatedRouterIds = _.difference(routerIds, assoicatedRouteIds);
								_.each(result.data, item => {
									_.each(unassoicatedRouterIds, id => {
										if (item.id == id) {
											scope.routerList.push(item);
										}
									});
								});
								scope.netFirewall.router = scope.routerList[0];
							}
						});
					});

					scope.createFirewallCfm = function (field, data) {
						scope.submitInValid = false;
						if (field.$valid) {
							netfirewallSrv.addFirewall({
								name: scope.netFirewall.name,
								description: scope.netFirewall.description
							}).then(function (res) {
								if (res && res.data) {
									netfirewallSrv.associateRouter(res.data.id, {
										router_ids: [scope.netFirewall.router.id]
									}).then(function () {
										$rootScope.initEditedTopo();
										$rootScope.topoAddFirewall = true;
									});
								}
							});
							firewallModal.close();
						} else {
							scope.submitInValid = true;
						}
					};

					scope.cancelCreateFirewall = function () {
						firewallModal.close();
						$rootScope.editTopo();
					};

				} else {
					zr.remove(firewall);
					addFirewallIcon(y);
				}
			});
			//鼠标从元素上面离开，解决AWSTACK261-261拖动离开时卡住的问题
			firewall.on('mouseout',function(e){
				if(e.offsetY<8||e.offsetX<5){
					zr.remove(firewall);
				    addFirewallIcon(y);
				}
			})
			zr.add(firewall);
		}

		//router
		function addRouterIcon(y) {
			let routerZrOpts = angular.copy(elemConfig.router.imgOpts);
			routerZrOpts.z=3;
			routerZrOpts.style = _.assign(routerZrOpts.style, _.assign(angular.copy(iconTextStyle), {
				y: y,
				text: $translate.instant('aws.topo.router')
			}));
			routerZrOpts.draggable = true;
			router = new zrender.Image(routerZrOpts);
			router.on("mouseup", function (e) {
				if (e.offsetX > netPaddingLeft * scale.x && e.target.draggable) {
					e.target.draggable = false;
					e.target.style.width = e.target.style.width / scale.x;
					e.target.style.height = e.target.style.height / scale.y;
					addRouterIcon(y);
					$uibModal.open({
						animation: true,
						templateUrl: "js/commonModal/tmpl/routerModal.html",
						controller: "routerModelCtrl"
					});
				} else {
					zr.remove(router);
					addRouterIcon(y);
				}
			});
			//鼠标从元素上面离开，解决AWSTACK261-261拖动离开时卡住的问题
			router.on('mouseout',function(e){
				if(e.offsetY<8||e.offsetX<5){
					zr.remove(router);
				    addRouterIcon(y);
				}
			})
			zr.add(router);
		}

		//网络
		function addNetIcon(y) {
			let rectZrOpts = {
				shape: {
					x: 1,
					y: y,
					width: 38 * scale.x,
					height: 38 * scale.y,
					r: 2
				},
				style: {
					fill: "#fff",
					stroke: "#51a3ff",
					lineWidth: 2,
					text: $translate.instant('aws.topo.network'),
					fontSize: 12,
					textFill: "#666",
					textPosition: "right",
					textDistance: 20
				},
				draggable: true,
				z:3
			};
			netRect = new zrender.Rect(rectZrOpts);
			netRect.on("mouseup", function (e) {
				if (e.offsetX > netPaddingLeft * scale.x && e.target.draggable) {
					e.target.draggable = false;
					e.target.shape.width = 50;
					e.target.shape.height = 50;
					addNetIcon(y);
					$uibModal.open({
						animation: true,
						templateUrl: "js/commonModal/tmpl/createNetworkModal.html",
						controller: "createNetworkCtrl",
						resolve: {
							singleway: function () {
								return false;
							}
						}
					});
				} else {
					zr.remove(netRect);
					addNetIcon(y);
				}
			});
			//鼠标从元素上面离开，解决AWSTACK261-261拖动离开时卡住的问题
			netRect.on('mouseout',function(e){
				if(e.offsetY<8||e.offsetX<5){
					zr.remove(netRect);
				    addNetIcon(y);
				}
			})
			zr.add(netRect);
		}

		//子网
		function addSubnetIcon(y) {
			var subnetZrOpts = angular.copy(elemConfig.subnet.imgOpts);
			subnetZrOpts.z=3;
			subnetZrOpts.style = _.assign(subnetZrOpts.style, _.assign(angular.copy(iconTextStyle), {
				y: y,
				text: $translate.instant('aws.topo.subnet')
			}));
			subnetZrOpts.draggable = true;
			subnet = new zrender.Image(subnetZrOpts);
			subnet.on("mouseup", function (e) {
				if (e.offsetX > netPaddingLeft * scale.x && e.target.draggable) {
					e.target.draggable = false;
					e.target.style.width = e.target.style.width / scale.x;
					e.target.style.height = e.target.style.height / scale.y;
					addSubnetIcon(y);
					$uibModal.open({
						animation: true,
						templateUrl: "js/commonModal/tmpl/createSubnetModal.html",
						controller: "createSubnetCtrl",
						resolve: {
							context: self,
							createPhySub:function(){
								return false;
							}
						}
					});
				}else {
					zr.remove(subnet);
					addSubnetIcon(y);
				}
			});
			//鼠标从元素上面离开，解决AWSTACK261-261拖动离开时卡住的问题
			subnet.on('mouseout',function(e){
				if(e.offsetY<8||e.offsetX<5){
                   zr.remove(subnet);
				   addSubnetIcon(y);
				}
			})
			zr.add(subnet);
		}

		//新建云主机
        self.insAnimation = "animateOut";
        self.newInstance = function() {
            self.insAnimation = "animateIn";
            $("body").addClass("animate-open")
        };
        self.closeNewIns = function(){
            self.insAnimation = "animateOut";
            $("body").removeClass("animate-open")
            $rootScope.editTopo();  
        }

		//虚拟机
		function addVmIcon(y) {
			let vmZrOpts = angular.copy(elemConfig.vm.imgOpts);
			vmZrOpts.z=3;
			vmZrOpts.style = _.assign(vmZrOpts.style, _.assign(angular.copy(iconTextStyle), {
				y: y,
				text: $translate.instant('aws.topo.instance')
			}));
			vmZrOpts.draggable = true;
			vm = new zrender.Image(vmZrOpts);
			vm.on("mouseup", function (e) {
				if (e.offsetX > netPaddingLeft * scale.x && e.target.draggable) {
					e.target.draggable = false;
					e.target.style.width = e.target.style.width / scale.x;
					e.target.style.height = e.target.style.height / scale.y;
					addVmIcon(y);
					//新建云主机
			        self.insAnimation = "animateOut";
			        self.newInstance();
					self.$apply();
				} else {
					zr.remove(vm);
					addVmIcon(y);
				}
			});
			//鼠标从元素上面离开，解决AWSTACK261-261拖动离开时卡住的问题
			vm.on('mouseout',function(e){
				if(e.offsetY<8||e.offsetX<5){
					zr.remove(vm);
				    addVmIcon(y);
				}
			})
			zr.add(vm);
		}
        
        //编辑左边部件的展示函数
		function addIconDefaultFunc() {
			if($rootScope.ListApplication){
				if(self.isSuperAdmin){
					addExnetIcon(80);
					addFirewallIcon(exnet.style.y + exnet.style.height + 30);
					addRouterIcon(firewall.style.y + firewall.style.height + 30);
					addNetIcon((router.style.y + router.style.height + 30) * scale.y);
					addSubnetIcon((netRect.shape.y + netRect.shape.height + 30) / scale.y);
					addVmIcon(subnet.style.y + subnet.style.height + 30);
				}else{
                    //非admin不可以新建外部网络
					addFirewallIcon(80);
					addRouterIcon(firewall.style.y + firewall.style.height + 30);
					addNetIcon((router.style.y + router.style.height + 30) * scale.y);
					addSubnetIcon((netRect.shape.y + netRect.shape.height + 30) / scale.y);
					addVmIcon(subnet.style.y + subnet.style.height + 30);
				}
			}else{
				if(self.isSuperAdmin){
                    addExnetIcon(80);
					addFirewallIcon(exnet.style.y + exnet.style.height + 30);
					addSubnetIcon((firewall.style.y + firewall.style.height + 30));
				}else{
					addFirewallIcon(80);
					addSubnetIcon((firewall.style.y + firewall.style.height + 30));
				}
			}
		}
        
        //编辑左边部件的展示函数（有许多判断条件）
		if (localStorage.regionBusiAuth!=2) {
			let regionBusiAuth = JSON.parse(localStorage.regionBusiAuth);
			regionBusiAuth=regionBusiAuth.map(element => {
				element = Number(element);
				return element;
			});
			if (!_.include(regionBusiAuth, 3)) {
				if($rootScope.ListApplication){
					if(self.isSuperAdmin){
						addNetIcon(80);
						addSubnetIcon((netRect.shape.y + netRect.shape.height + 30) / scale.y);
						addVmIcon(subnet.style.y + subnet.style.height + 30);
					}else{
						addSubnetIcon(80);
						addVmIcon(subnet.style.y + subnet.style.height + 30);
					}
				}else{
                    addSubnetIcon(80);
				}
			} else {
				addIconDefaultFunc();
			}
		} else {
			if(self.isSuperAdmin){
                addNetIcon(80);
	            addSubnetIcon((netRect.shape.y + netRect.shape.height + 30) / scale.y);
			    addVmIcon(subnet.style.y + subnet.style.height + 30);
			}else{
	            addSubnetIcon(80);
			    addVmIcon(subnet.style.y + subnet.style.height + 30);
			}
		}

		let btnConfigOpts = function (x, y, text) {
			return {
				shape: {
					x: x,
					y: y,
					width: elemDefault.defaultSpace._btnW * scale.x,
					height: elemDefault.defaultSpace._btnH * scale.y,
					r: 2
				},
				style: {
					fill: "#fff",
					stroke: "#c2d3eb",
					lineWidth: 1,
					text: text,
					fontSize: 12,
					textFill: "#666",
					textPosition: "inside"
				}
			}
		};
		//刷新按钮
		let refreshBtn = new zrender.Rect(btnConfigOpts(netPaddingLeft * scale.x, 10, $translate.instant('aws.topo.refresh')));
		refreshBtn.on("click", function (e) {
			//self.editTopo();
			zr.clear(); //清除所有对象和画布
			$timeout(function(){
				$rootScope.editTopo();
			},500);
		});
		zr.add(refreshBtn);

		//返回按钮
		let returnBtn = new zrender.Rect(btnConfigOpts(netPaddingLeft * scale.x + 20 + elemDefault.defaultSpace._btnW * scale.x, 10, $translate.instant('aws.topo.return')));
		returnBtn.on("click", function (e) {
			$route.reload();
		});
		zr.add(returnBtn);

	};

	$rootScope.initEditedTopo = function () {
		netTopoSrv.getTopo().then(function (res) {
			if (res && res.data) {
				netTopoSrv.topoData = JSON.parse(angular.copy(res.data));
				self.editTopo();
			}
		});
	};

	self.$on("refreshTopo", function (e, data) {
		if (data == "edit") {
			$rootScope.initEditedTopo();
		} else {
			getTopo();
		}
	});

	self.deleteItem = function (delData) {
		switch (delData._type) {
			case "vm":
			    delData.hostId=delData.host_id;
				commonFuncSrv.deleteInstance(self, [delData.id], [delData]);
				break;
			case "subnet":
				commonFuncSrv.deleteSubnet(self, [delData]);
				break;
			case "router":
				commonFuncSrv.deleteRouter(self, [delData]);
				break;
			case "firewall":
				commonFuncSrv.deleteFirewall(self, [delData]);
				break;
			case "net":
			case "exNet":
				commonFuncSrv.deleteNetwork(self, [delData]);
				break;
		}
	};

	getTopo();

}

export function topoDetailCtrl($scope, $rootScope, netTopoSrv, $compile, $translate, ipSrv, networksSrv, instancesSrv) {
	var self = $scope;
	$scope.$on("topoDetail", function (e, data, edit) {
		self.topoAnimation = "animateIn";
		self.itemData = data;
		self.detailCont = data._type;
		self.detailItem = {};
		if (!edit) {
			switch (data._type) {
				// case "exNet":
				// 	// statements_1
				// 	break;
				case "firewall":
					netTopoSrv.getFirewallDetail(data.firewall_id).then(function (res) {
						if (res && res.data) {
							self.detailItem = res.data;
							self.detailItem.status = res.data.status.toLowerCase();
							self.detailItem._status = $translate.instant("aws.networks." + res.data.status.toLowerCase());
						}
					});

					break;
				case "router":
					netTopoSrv.getRouterDetail(data.id).then(function (res) {
						if (res && res.data) {
							res.data.isVPN = res.data.isVPN == true ? $translate.instant("aws.common.have") : $translate.instant("aws.common.none");
							self.detailItem = res.data;
						}
					});
					break;
				case "net":
					netTopoSrv.getAllNets().then(function (res) {
						if (res && res.data) {
							_.each(res.data, item => {
								item.status = item.status.toLowerCase()
								if (item.status == "active") {
									item.state = $translate.instant("aws.networks.run");
								} else {
									item.state = $translate.instant("aws.networks.stop");
								}
								item.provider.network_type = item.provider.network_type.toUpperCase();
								item.shared = item.shared == true ? $translate.instant("aws.common.yes") : $translate.instant("aws.common.no");
								if (item.tags && item.tags.length > 0) {
									_.each(item.tags, function (tag) {
										if (tag.indexOf("qos_limit") > -1) {
											let rateLimit_Mbps = Number(tag.split(":")[1]) / 128;
											item.rateLimit = Math.ceil(rateLimit_Mbps) == rateLimit_Mbps ? rateLimit_Mbps : rateLimit_Mbps.toFixed(2);
											item.rateLimit = item.rateLimit + " Mbps";
										}
									});
								} else {
									item.rateLimit = $translate.instant("aws.networks.noLimit");
								}
								if (data.id == item.id) {
									self.detailItem = item;
								}
							});
						}
					});

					break;
				case "subnet":
					netTopoSrv.getSubnetsList().then(function (res) {
						if (res && res.data) {
							_.each(res.data, item => {
								item.enableDhcp = item.enableDhcp == true ? $translate.instant("aws.common.yes") : $translate.instant("aws.common.no");
								if (data.id == item.id) {
									self.detailItem = item;
								}
							});
						}
					});
					break;
				case "vm":
					self.detailItem = {
						cpuConfigData: 0,
						ramConfigData: 0
					};
					netTopoSrv.getVmDetail(data.id).then(function (res) {
						if (res && res.data && res.data instanceof Object) {
							let vm_state = res.data.task_state || res.data.status;
							self.detailItem = res.data;
							self.detailItem.color = vmStatusColor[vm_state.toLowerCase()];
							self.detailItem._status = $translate.instant("aws.instances.table.status." + vm_state.toLowerCase());
							self.detailItem.cpuConfigData = Number(res.data.vcpus);
							let ram = Number(res.data.ram / 1024);
							self.detailItem.ramConfigData = Math.ceil(ram) == ram ? ram : ram.toFixed(1)
						}
					});
					break;
				default:
					// statements_def
					break;
			}
		} else {
			self.formSubmitted = false;
			self.submitted = false;
			self.editData = angular.copy(data);
			self.interacted = function (field) {
				if (field) {
					return self.submitted || field.$dirty;
				}
			};

			switch (data._type) {
				case "exNet":
				case "net":
					self.networkForm = {
						name: self.editData.name
					};
					self.editNetConfirm = function (form) {
						if (form.$valid) {
							self.formSubmitted = true;
							let params = {
								"network_name": {
									"name": self.networkForm.name
								},
								"network_id": self.editData.id
							};
							netTopoSrv.editNetworkAction(params).then(function () {
								$rootScope.initEditedTopo();
							});
							self.topoAnimation = "animateOut";
						} else {
							self.submitted = true;
						}
					};
					break;
				case "router":
					self.routerForm = {
						name: self.editData.name
					};
					self.editConfirm = function (form) {
						if (form.$valid) {
							self.formSubmitted = true;
							netTopoSrv.editRouterName({
								"name": self.routerForm.name,
								"router_id": self.editData.id
							}).then(function () {
								$rootScope.initEditedTopo();
							});
							self.topoAnimation = "animateOut";
						} else {
							self.submitted = true;
						}
					};
					break;
				case "firewall":
					self.netFirewall = {
						name: self.editData.name
					};
					self.editConfirm = function (form) {
						if (form.$valid) {
							self.formSubmitted = true;
							netTopoSrv.updateFirewall(self.editData.firewall_id, {
								"name": self.netFirewall.name
							}).then(function () {
								$rootScope.initEditedTopo();
							});
							self.topoAnimation = "animateOut";
						} else {
							self.submitted = true;
						}
					};
					break;
				case "subnet":
				    //ipv6子网不可以进行编辑加入判断
				    if(data.cidr.indexOf(":")>-1){
                       self.v6subnet=true;
				    }else{
				       self.v6subnet=false;
				    }
					self.subnetForm = {
						allocationPools: []
					};
					self.setIpIsOverlap = function () {
						self.ipIsOverlap = false;
						self.ipEqToGateway = false;
						self.poolNarrow = false;
					};
					self.setIpIsOverlap();

					netTopoSrv.getSubnetsList().then(function (res) {
						if (res && res.data) {
							_.each(res.data, function (item) {
								if (item.id == self.editData.id) {
									self.editData = _.assign(self.editData, item);
								}
							});

							self.subnetForm = angular.copy(self.editData);
							self.networkAddress = _IP.cidrSubnet(self.subnetForm.cidr).networkAddress;
							self.broadcastAddress = _IP.cidrSubnet(self.subnetForm.cidr).broadcastAddress;
							self.subnetForm.allocationPools = _.sortBy(self.subnetForm.allocationPools, "start");
							self.addAllocationPools = function () {
								self.subnetForm.allocationPools.push({
									start: "",
									end: ""
								})
								self.setIpIsOverlap();
							}

							self.delAllocationPools = function (index, allocationPools) {
								self.subnetForm.allocationPools.splice(index, 1)
								self.setIpIsOverlap()
							}

							let assignedIpList = [];
							if (!self.editData.external) {
								assignedIpList = assignedIpList.slice(assignedIpList.length, 0);
								networksSrv.getNetworksDetail(self.editData.parentId).then(function (result) {
									if (result && result.data) {
										_.each(result.data, function (item) {
											_.each(item.subnetIps, function (sub) {
												if (sub.subnet_id == self.editData.id) {
													assignedIpList.push(sub.ip_address);
												}
											})
										});
									}
								});
							}
							self.editSubnetCfm = function (editSubnetForm) {
								if (editSubnetForm.$valid) {
									self.ipIsOverlap = ipSrv.chkIpOverlapFunc(self.subnetForm.allocationPools);
									self.ipEqToGateway = ipSrv.checkIpInPool(self.subnetForm.allocationPools, self.editData.gatewayIp);
									if (self.editData.external) {
										self.poolNarrow = ipSrv.checkPoolRange(self.editData.allocationPools, self.subnetForm.allocationPools);
									} else {
										for (let i = 0; i < assignedIpList.length; i++) {
											if (self.editData.gatewayIp == assignedIpList[i]) {
												continue;
											}
											if (!ipSrv.checkIpInPool(self.subnetForm.allocationPools, assignedIpList[i])) { //如果修改后的IP池中不含有已经分配出去的IP，则不允许修改
												self.poolNarrow = true;
												break;
											}
										}
									}
									if (!self.ipIsOverlap && !self.ipEqToGateway && !self.poolNarrow) {
										self.formSubmitted = true;
										networksSrv.editSubnetAction({
											"subnet": {
												"name": self.subnetForm.name,
												"allocation_pools": self.subnetForm.allocationPools
											},
											"subnet_id": self.editData.id
										}).then(function () {
											$rootScope.initEditedTopo();
										});
										self.topoAnimation = "animateOut";
									}
								} else {
									self.submitted = true;
								}
							};
						}
					});
					break;
				case "vm":
					self.vmForm = {
						hostName: self.editData.name
					};
					self.editVmCfm = function (form) {
						if (form.$valid) {
							self.formSubmitted = true;
							instancesSrv.editServer(self.editData.id, {
								name: self.vmForm.hostName
							}).then(function (res) {
								if (res && res.status == 0) {
									$rootScope.$broadcast("alert-success", 0);
								} else {
									$rootScope.$broadcast("alert-error", 1);
								}
								$rootScope.initEditedTopo();
							});
							self.topoAnimation = "animateOut";
						} else {
							self.submitted = true;
						}
					}
					break;
				default:
					// statements_def
					break;
			}
		}
		self.returnOrgPath = function () {
			self.topoAnimation = "animateOut";
		};
		self.$apply();
	});
}