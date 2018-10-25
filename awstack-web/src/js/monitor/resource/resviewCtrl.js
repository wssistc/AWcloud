import "./resviewSrv";
import {
	resViewBarChartDefault
} from "../../chartpanel";

var resviewCtrlModule = angular.module("resviewCtrlModule", ["resviewSrvModule"]);

resviewCtrlModule.controller('resviewCtrl', ['$scope', '$rootScope', 'resviewSrv', 'kbnSrv', "$translate",
	function(self, $rootScope, resviewSrv, kbnSrv, $translate) {
		let panelsList = ["cpu", "mem", "disk", "diskio_read", "diskio_write", "net_receive_rate", "net_send_rate"];
		let chartTitle = {
			"cpu": $translate.instant("aws.monitor.resview.cpuRate"),
			"mem": $translate.instant("aws.monitor.resview.memoryRate"),
			"disk": $translate.instant("aws.monitor.resview.diskUseRate"),
			"diskio_read": $translate.instant("aws.monitor.resview.diskIORead"),
			"diskio_write": $translate.instant("aws.monitor.resview.diskIOWrite"),
			"net_receive_rate": $translate.instant("aws.monitor.resview.netReciveRate"),
			"net_send_rate": $translate.instant("aws.monitor.resview.netSendRate")
		}
		let chartUnit = {
			"cpu": "%",
			"mem": "%",
			"diskio_read": "ops",
			"diskio_write": "ops",
			"net_receive_rate": "Kbps",
			"net_send_rate": "Kbps"
		}
		let chartType = "line";
		self.panels = {};
		self.queryDisabled = false;
		self.options = {
			objTypeList: [{
				"name": $translate.instant("aws.monitor.resview.physical"),
				"value": "physical"
			}, {
				"name": $translate.instant("aws.monitor.resview.virtual"),
				"value": "virtual"
			}],
			topTypeList: [{
				"name": $translate.instant("aws.monitor.resview.topHigh"),
				"value": "top"
			}, {
				"name": $translate.instant("aws.monitor.resview.topLow"),
				"value": "bottom"
			}],
			topLengthList: [{
				"name": "TOP5",
				"value": "5"
			}, {
				"name": "TOP3",
				"value": "3"
			}]
		};
		self.queryLimit = {
			objType: self.options.objTypeList[0].value,
			topType: self.options.topTypeList[0].value,
			topLength: self.options.topLengthList[0].value
		};

		var tickFormatterFunc = function(d, formatType, tickStep) {
			var _d;
			var axisTickFormatter = kbnSrv.valueFormats[formatType];
			var decimalPos = String(d).indexOf(".");
			var tickDecimals = decimalPos === -1 ? 0 : String(d).length - decimalPos - 1;
			var scaledDecimals = tickDecimals - Math.floor(Math.log(tickStep) / Math.LN10);
			_d = axisTickFormatter(d, tickDecimals, scaledDecimals);
			return _d;
		};

		var formatedTipValue = function(tipVal, formatType, tickStep) {
			tipVal = tickFormatterFunc(tipVal, formatType, tickStep);
			var _tipVal = Number(tipVal.split(" ")[0]);
			var tipValdecimalPos = String(_tipVal).indexOf(".");
			var tipValDecimals = tipValdecimalPos === -1 ? 0 : String(_tipVal).length - tipValdecimalPos - 1;
			if (tipValDecimals > 3) {
				if (_tipVal > 0 && _tipVal < 1) {
					tipVal = tipVal.split(" ")[1] ? _tipVal.toFixed(4) + " " + tipVal.split(" ")[1] : _tipVal.toFixed(4);
				} else if (_tipVal > 1) {
					tipVal = tipVal.split(" ")[1] ? _tipVal.toFixed(3) + " " + tipVal.split(" ")[1] : _tipVal.toFixed(3);
				}
			}
			return tipVal;
		};

		self.query = function(type) {
			self.queryDisabled = true;
			resviewSrv.getRegionData().then(function(res) {
				if (res && res.data) {
					self.queryDisabled = false;
					res.data = res.data.filter(item => {
						return item.status == 3;
					});
					self.options.dataRegionList = res.data;
					if (type == 'init') {
						self.queryLimit.dataRegion = self.options.dataRegionList[0].regionKey;
						_.each(self.options.dataRegionList, item => {
							if (item.regionKey == localStorage.regionKey) {
								self.queryLimit.dataRegion = item.regionKey;
							}
						})
					}
					_.forEach(panelsList, function(key) {
						let _dList = [];
						let total = 0;
						let tickStep = 0;
						let topType = angular.copy(self.queryLimit.topType);
						self['load' + key] = true;
						// if (key == "cpu") {
						// 	if (self.queryLimit.topType == "top") {
						// 		topType = "bottom";
						// 	} else if (self.queryLimit.topType == "bottom") {
						// 		topType = "top";
						// 	}
						// }
						self.panels[key] = [];
						if(key == "disk") {
							resviewSrv.query({
								"regionCode": self.queryLimit.dataRegion,
								"metrics": key,
								"objType": self.queryLimit.objType,
								"topType": topType,
								"topLength": Number(self.queryLimit.topLength),
								"startTime": moment().format("X"),
								"endTime": moment().subtract(1, "hours").format("X")
							}).then(function(res) {
								res ? self['load' + key] = false : true;
								if (res && res.data && res.data.data) {
									_.each(res.data.data, function(item) {
										_dList.push(Number(item.dataValue));
										total += Number(item.dataValue);
									});

									tickStep = _.max(_dList) / Number(self.queryLimit.topLength);

									_.each(res.data.data, function(item) {
										let dataValue = angular.copy(item.dataValue);
										let hostName = angular.copy(item.hostName);
										// if (key == "cpu") {
										// 	dataValue = 100 - Number(dataValue);
										// }
										if (key != "cpu" && key != "mem") {
											hostName = hostName + "(" + item.keyName + ")";
										}
										if (key == "net_receive_rate" || key == "net_send_rate") {
											self.panels[key].push({
												inUsed: dataValue,
												name: hostName,
												type: "unit-adapt",
												total: total,
												val_unit: formatedTipValue(dataValue, 'bps', tickStep)
											});
										} else if (key == "diskio_read" || key == "diskio_write") {
											self.panels[key].push({
												inUsed: dataValue,
												name: hostName,
												type: "unit-adapt",
												total: total,
												val_unit: formatedTipValue(dataValue, 'ops', tickStep)
											});
										} else {
											self.panels[key].push({
												inUsed: dataValue,
												name: hostName,
												type: "percent",
												total: 100,
												precision: 2
											});
										}
										if (self.queryLimit.topType == "top") {
											self.panels[key] = _.sortBy(self.panels[key], 'inUsed').reverse();
										} else if (self.queryLimit.topType == "bottom") {
											self.panels[key] = _.sortBy(self.panels[key], 'inUsed');
										}
									});
								}
							})
						}else {
							resviewSrv.queryNew({
								"regionCode": self.queryLimit.dataRegion,
								"metrics": key,
								"objType": self.queryLimit.objType,
								"topType": topType,
								"topLength": Number(self.queryLimit.topLength),
								"startTime": moment().format("X"),
								"endTime": moment().subtract(1, "hours").format("X")
							}).then(function(res) {
								if (res && res.data) {
									if(!res.data.chartData) {
										self.panels[key] = {
											data: {
												xAxis: [],
												series: []
											}
										}
										return;
									}
									var series = [];
									var xData = [];
									res.data.chartData.columes.map(item => {
										xData.push(moment(item).format('HH:mm'));
									})
									if(key == "cpu" || key == "mem" || key == "diskio_read" || key == "diskio_write") {
										for(let k in res.data.chartData.data) {
											res.data.chartData.data[k].map((item, index) => {
												res.data.chartData.data[k][index] = item?item.toFixed(2):item;
											});
										}
									}else if(key == "net_receive_rate" || key == "net_send_rate") {
										for(let k in res.data.chartData.data) {
											res.data.chartData.data[k].map((item, index) => {
												res.data.chartData.data[k][index] = item?(item/1024).toFixed(2):item;
											});
										}
									}else if(key == "diskio_read" || key == "diskio_write") {
										for(let k in res.data.chartData.data) {
											res.data.chartData.data[k].map((item, index) => {
												res.data.chartData.data[k][index] = item?(item/1024).toFixed(2):item;
											});
										}
									}
									res.data.chartData.legend = [];
									for(var n in res.data.chartData.data){
										res.data.chartData.legend.push(n)
										var seriesItem = {
					                        name: n,
					                        type: chartType,
					                        data: res.data.chartData.data[n]
					                    }
					                    series.push(seriesItem);
									}
									self.panels[key] = {
										title: chartTitle[key],
										data: {
											// legend: {
											// 	show: true,
											// 	orient: 'vertical',
											// 	top: 'middle',
											// 	left: 'auto',
											// 	right: 10
											// },
											legend: {
												show: true,
												orient: 'horizontal',
												top: 'bottom',
												left: 10,
											},
											unit: chartUnit[key],
											toolboxShow: false,
											xAxis: xData,
											series: series
										}
									}
								}
							})
						}
					})
				}
			});
		};
		self.query('init');
	}
])