awsHbar.$inject = ['$http','monitorCache']
export function awsHbar($http,monitorCache){
	return {
		restrict: 'EA',
		scope:{
			id:"@",
			xaxisData:"=",
			yaxisData:"=",
			name:"@"
		},
		link: function(scope, elem, attr){
			monitorCache[scope.id] = echarts.init(elem[0]);
			
			function optionFun(){
				let barDataTwo = [];
				let barData = scope.xaxisData;
				const reg = /[A-Z]|[\u4E00-\u9FA5]/;
				var option;
				for (let i = 0; i < barData.length; i++) {
					barDataTwo.push(100);
				}
				//适配横坐标名称过长
                var _yaxisData = angular.copy(scope.yaxisData).map(item =>{
                    var realLength = 0;
                    var itemArray = item.split("");
                    for (var i = 0; i < itemArray.length; i++) {
                        if (realLength > 10) {
                            return realLength > 10 ? item.substring(0,i)+"...":item;
                        }
                        if (!reg.test(itemArray[i])) 
                           realLength += 1;
                        else
                           realLength += 2;
                    }
                    return item;
                    
                })
				return option = {
					title: {
						text: ''
					},
					legend: null,
					tooltip: {
						trigger: 'axis',
						backgroundColor:'rgba(62, 67, 110, 0.7)',
						axisPointer: {
							type: 'none'
						},
						formatter: function(params) {
							return scope.yaxisData[params[0].dataIndex] + "<br/>" + scope.name + ': ' + params[0].value  ;
						}
					},
					grid: {
						left: 100,
						top:10,
						bottom: 30,
						right:60,
					},
					yAxis: [{
							data: _yaxisData,
							inverse: true,
							axisLine: {
								show: false
							},
							axisTick: {
								show: false
							},
							axisLabel: {
								margin:5,
								textStyle: {
									fontSize: 12,
									color: '#42a5c2'
								},
								formatter: function(value) {
									return '{Sunny|' + value + '}';
								},
								rich: {
									value: {
										lineHeight: 30,
									},
									Sunny: {
										width: 50,
										height: 20,
										color:"#fff",
										fontSize: 10,
										backgroundColor: "#1c295e",
										padding: [0, 10, 0, 10],
										borderWidth:1,
										borderColor:"#133365",
										borderRadius:[4,0,0,4],
										align: 'center',
									}
								}
							}
						},
						{
							data: scope.yaxisData,
							inverse: true,
							axisLine: {
								show: false
							},
							axisTick: {
								show: false
							},
							axisLabel: {
								show: false
							},
						},
					],
					xAxis: [{
						type: "value",
						splitLine: {
							show: false
						},
						axisLabel: {
							show: false
						},
						axisTick: {
							show: false
						},
						axisLine: {
							show: false
						}
					}, {
						type: "value",
						splitLine: {
							show: false
						},
						axisLabel: {
							show: false
						},
						axisTick: {
							show: false
						},
						axisLine: {
							show: false
						}
					}],
					series: [{
							z: 10,
							xAxisIndex: 0,
							yAxisIndex: 0,
							name: 'XXX',
							type: 'pictorialBar',
							data: barData,
							// barCategoryGap: '80%',
							label: {
								normal: {
									show: true,
									fontFamily:"xolonium",
									position:"right",
									formatter: '{c}'+'%',
									textStyle: {
										fontSize: 14,
										color: '#fff'
									}
								}
							},
							symbolRepeat: false,
							symbolSize: ['100%', 20],
							symbolOffset: [-16.5, 0],
							itemStyle: {
								normal: {
									color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
											offset: 0,
											color: '#083e6d',
										},
										{
											offset: 0.5,
											color: '#0272f2',
											opacity: 0.7
										}, {
											offset: 1,
											color: '#083e6d',
											opacity: 0.5
										}
									], false),
								}
							},
							symbolClip: true,
							symbolPosition: 'end',
							symbol: 'rect',
						   
						},
						{
							z: 6,
							xAxisIndex: 1,
							yAxisIndex: 1,
							animation: false,
							name: 'XX',
							type: 'pictorialBar',
							data: barDataTwo,
							barCategoryGap: '80%',
							label: {
								normal: {
									show: false,
									position: 'inside',
									textStyle: {
										fontSize: 12,
										color: '#00ffff'
									}
								}
							},
							symbolRepeat: false,
							symbolSize: [1000, 20],
							symbolOffset: [-16.5, 0],
							itemStyle: {
								normal: {
									color: '#00abc5',
									opacity: 0.085
								}
							},
							symbolClip: true,
							symbol: 'rect',
						},
					]
				};	
			}
			

			scope.$watch(function(){
				return scope.xaxisData;
			},function(data){
				if(data && angular.isArray(data)){
					monitorCache[scope.id].setOption(optionFun())
				}
			})
			
			window.onresize = function () {
                for(let key in monitorCache){
                    monitorCache[key].resize('auto','auto');
                    scope.$apply();
                }
            };
		}
	}
}