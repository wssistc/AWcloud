//let pathPre = "/img/";
let pathPre = "/images/";
let scale = {
	x: 1,
	y: 1
};

function defaultSetting(scale) {
	return {
		width: 60,
		height: 60,
		fontSize: 14 * scale.x,
		textLineHeight: 18 * scale.y,
		textFill: "#666666",
		textPosition: "top",
		textDistance: 5 * scale.y,
		truncate: {
			outerWidth: 130 * scale.x,
			ellipsis: "..."
		},

		colors: [
			"#b6a2dd",
			// "#e67f23", 
			// "#ff754a",
			"#f39c12",
			// "#4a6583",
			"#7991ab",
			"#a6b6c8",
			"#d87c7c",
			"#919e8b",
			"#d7ab82",
			"#6e7074",
			"#61a0a8",
			"#efa18d",
			"#787464",
			"#cc7e63",
			"#4b565b",
			"#8dc1a9",
			"#eedd78"
		],
		defaultSpace: {
			pLeft: 200, //外网横坐标到画布左边的距离
			padding: 130,
			netPaddingLeft: 0, //网络rect到画布左边的距离
			netPaddingTop: 30, //网络rect到画布上方的距离
			_ASW: 60, //元件间增加的基本距离
			_ERw: 250, //外网与路由器的间距
			_RSw: 250, //路由器和子网的间距
			_SSh: 110, //子网在竖线上的间距
			_VVw: 80, //虚拟机之间的间距
			_btnW: 80,
			_btnH: 35
		}
	};
};
//各状态云主机的颜色
let vmStatusColor = {
	"active": "#1abc9c",
	"up": "#1abc9c",
	"block_device_mapping": "#51a3ff",
	"building": "#51a3ff",
	"build": "#51a3ff",
	"powering-off": "#51a3ff",
	"powering-on": "#51a3ff",
	"deleting": "#51a3ff",
	"deleted": "#51a3ff",
	"soft-deleting": "#51a3ff",
	"soft-delete": " #51a3ff",
	"reboot_pending": "#51a3ff",
	"reboot": "#51a3ff",
	"rebooting": "#51a3ff",
	"reboot_started": "#51a3ff",
	"pausing": "#51a3ff",
	"unpausing": "#51a3ff",
	"suspending": "#51a3ff",
	"resuming": "#51a3ff",
	"resize": "#51a3ff",
	"resize_prep": "#51a3ff",
	"resize_finish": "#51a3ff",
	"resize_migrating": "#51a3ff",
	"resize_migrated": "#51a3ff",
	"image_backup": "#51a3ff",
	"image_snapshot": "#51a3ff",
	"spawning": "#51a3ff",
	"migrating": "#51a3ff",
	"rebuilding": "#51a3ff",
	"rebuild": "#51a3ff",
	"stopped": "#666666",
	"paused": "#f39c12",
	"resized": "#f39c12",
	"verify_resize": "#f39c12",
	"revert_resize": "#f39c12",
	"down": "#f39c12",
	"unknow": "#e74c3c",
	"unrecognized": "#f39c12",
	"error": "#e74c3c",
	"shutoff": "#666666",
	"suspended": "#4a6583",
};

function defaultConfig(elemDefault, scale) {
	return {
		exnet: {
			imgOpts: {
				style: {
					x: "",
					y: "",
					image: pathPre + "topo/topo_exnet.png",
					width: elemDefault.width,
					height: 50,
					text: "",
					textWidth: 180 * scale.x,
					fontSize: elemDefault.fontSize,
					textLineHeight: elemDefault.textLineHeight,
					textFill: elemDefault.textFill,
					textPosition: elemDefault.textPosition,
					textDistance: elemDefault.textDistance,
					truncate: elemDefault.truncate,
					textAlign: "center",
					rich: {
						a: {
							textAlign: "left",
							textWidth: null,
							fontSize: elemDefault.fontSize
						},
						b: {
							textAlign: "left",
							textWidth: null,
							fontSize: elemDefault.fontSize
						}
					}
				},
				scale: [scale.x, scale.y],
				draggable: false
			}
		},
		firewall: {
			imgOpts: {
				style: {
					x: "",
					y: "",
					image: pathPre + "topo/topo_firewall.png",
					width: 40,
					height: 40,
					text: "",
					textWidth: 180 * scale.x,
					fontSize: elemDefault.fontSize,
					textLineHeight: elemDefault.textLineHeight,
					textFill: elemDefault.textFill,
					textPosition: elemDefault.textPosition,
					textDistance: elemDefault.textDistance,
					truncate: elemDefault.truncate,
					textAlign: "center",
					rich: {
						a: {
							textAlign: "left",
							textWidth: null,
							fontSize: elemDefault.fontSize
						},
						b: {
							textAlign: "letf",
							textWidth: null,
							fontSize: elemDefault.fontSize
						}
					}
				},
				z: 1,
				scale: [scale.x, scale.y],
				draggable: false
			}
		},
		router: {
			imgOpts: {
				style: {
					x: "",
					y: "",
					image: pathPre + "topo/topo_router.png",
					width: 50,
					height: 50,
					text: "",
					textWidth: 180 * scale.x,
					fontSize: elemDefault.fontSize,
					textLineHeight: elemDefault.textLineHeight,
					textFill: elemDefault.textFill,
					textPosition: elemDefault.textPosition,
					textDistance: elemDefault.textDistance,
					truncate: elemDefault.truncate,
					textAlign: "center",
					rich: {
						a: {
							textAlign: "left",
							textWidth: null,
							fontSize: elemDefault.fontSize
						},
						b: {
							textAlign: "letf",
							textWidth: null,
							fontSize: elemDefault.fontSize
						}
					}
				},
				z: 2,
				scale: [scale.x, scale.y],
				draggable: false
			}
		},
		subnet: {
			imgOpts: {
				style: {
					x: "",
					y: "",
					image: pathPre + "topo/topo_subnet.png",
					width: 40,
					height: 40,
					text: "",
					fontSize: elemDefault.fontSize,
					textLineHeight: elemDefault.textLineHeight,
					textFill: elemDefault.textFill,
					textPosition: elemDefault.textPosition,
					textDistance: elemDefault.textDistance,
					truncate: elemDefault.truncate,
					rich: {
						a: {
							textAlign: "center",
						},
						b: {
							textAlign: "center",
							textFill: "#999",
							fontSize: elemDefault.fontSize
						}
					}
				},
				scale: [scale.x, scale.y],
				draggable: false
			}
		},
		vm: {
			imgOpts: {
				style: {
					x: "",
					y: "",
					image: pathPre + "topo/topo_vm.png",
					width: 35,
					height: 35,
					text: "",
					fontSize: elemDefault.fontSize,
					textLineHeight: elemDefault.textLineHeight,
					textFill: elemDefault.textFill,
					textPosition: elemDefault.textPosition,
					textDistance: elemDefault.textDistance,
					truncate: elemDefault.truncate,
				},
				scale: [scale.x, scale.y],
				draggable: true
			}
		},
		delete: {
			imgOpts: {
				style: {
					x: "",
					y: "",
					image: pathPre + "topo/topo_remove.png",
					width: 15,
					height: 15,
					text: "",
					fontSize: elemDefault.fontSize,
					textLineHeight: elemDefault.textLineHeight,
					textFill: elemDefault.textFill,
					textPosition: elemDefault.textPosition,
					truncate: elemDefault.truncate,
				},
				scale: [scale.x, scale.y],
				draggable: false
			}
		},
		transparentRect: {
			zrOpts: {
				shape: {
					x: "",
					y: "",
					width: elemDefault.width,
					height: elemDefault.height
				},
				invisible: true,
				z: -1,
				scale: [scale.x, scale.y]
			}
		},
		line: {
			zrOpts: {
				shape: {
					x1: "",
					y1: "",
					x2: "",
					y2: ""
				},
				style: {
					stroke: "#999",
					lineWidth: 2
				},
				z: 0,
				scale: [scale.x, scale.y]
			}
		},
		circle: {
			zrOpts: {
				shape: {
					cx: "",
					cy: "",
					r: ""
				},
				style: {
					stroke: "#999",
					fill: "#fff",
					lineWidth: 2,
					text: "",
					textWidth: 180 * scale.x,
					fontSize: elemDefault.fontSize,
					textLineHeight: elemDefault.textLineHeight,
					textFill: elemDefault.textFill,
					textPosition: elemDefault.textPosition,
					truncate: elemDefault.truncate,
					textAlign: "center",
					// textBorderWidth: 1,
					// textBorderColor: "#999",
					// textBorderRadius: 2,
					//textPadding: 5 * scale.x,
					textDistance: elemDefault.textDistance,
					strokeNoScale: true,//描边粗细不随缩放而改变，false 则会根据缩放同比例缩放描边粗细。
					rich: {
						a: {
							textAlign: "left",
							fontSize: elemDefault.fontSize
						},
						b: {
							textAlign: "left",
							fontSize: elemDefault.fontSize
						},
						c: {
							textAlign: "left",
							//textFill: "#999",
							fontSize: elemDefault.fontSize
						}
					}
				},
				z: 0,
				scale: [scale.x, scale.y]
			}
		},
		netRect: {
			zrOpts: {
				shape: {
					x: 0,
					y: "",
					r: 4,
					width: 15,
					height: 15
				},
				style: {
					fill: "#fff",
					text: "",
					textPosition: "right",
					textAlign: "left",
					textVerticalAlign: "middle",
					textDistance: 10,
					fontSize: elemDefault.fontSize,
					textLineHeight: 18 * scale.y,
					textFill: "#666666",
					truncate: elemDefault.truncate,
				},
				scale: [scale.x, scale.y]
			}
		},
		vmRect:{
			zrOpts: {
				shape: {
					x: 0,
					y: "",
					r: 4,
					width: 15,
					height: 15
				},
				style: {
					fill: "#fff",
					text: "",
					textPosition: "right",
					textAlign: "left",
					textVerticalAlign: "middle",
					textDistance: 10,
					fontSize: elemDefault.fontSize,
					textLineHeight: 18 * scale.y,
					textFill: "#666666",
					truncate: {
						outerWidth: 430 * scale.x,
						ellipsis: "..."
					},
				},
				scale: [scale.x, scale.y]
			}
		}
	};
};

export {
	scale,
	defaultSetting,
	vmStatusColor,
	defaultConfig
};