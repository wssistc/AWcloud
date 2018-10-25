awsArea.$inject = ['$http',"monitorCache"]
export function awsArea($http,monitorCache){
	return {
		restrict: 'A',
		scope:{
			id:"@",
			name:"@",
			unit:"@",
			areaData:"=",
			timeModel:"@",
			color:"="
		},
		link: function(scope, elem, attr){
			//var areaChart = echarts.init(elem[0]);
			monitorCache[scope.id] = echarts.init(elem[0]);
			function dataSet(data){
				var date = [];
				var dateset = [];
				var orginDate = [];
				for (var i = 0; i < data.length; i++) {
					orginDate.push(moment(data[i][0]).format("YYYY-MM-DD HH:mm:ss"))
					switch(scope.timeModel){
						case "day": 
						data[i][0] = moment(data[i][0]).format("MM/DD")
						break;
						case "time": 
						data[i][0] = moment(data[i][0]).format("HH:mm");
						break;

					}
					date.push(data[i][0]);
					dateset.push(data[i][1]||0);
				}
				return {date,dateset,orginDate}
		
			}

			function valueSetOfUnit(value){
				switch(scope.unit){
					case "%":
						return value + "%";
						break;
					case "iops":
						if(value>=1000){
							return Math.ceil((value/1000))+"kiops";
						}
						return value+scope.unit;
						break;
					case "B":
						if(value>=1024*1024){
							return Math.ceil(value/(1024*1024)) + "MB"
						}
						else if(value>=1024){
							return Math.ceil((value/1024))+"KB";
						} 
						return value+scope.unit;
						break;
					case "MB":
						if(value>=1024){
							return Math.ceil((value/1024))+"GB";
						} 
						return value+scope.unit;
						break;
					case "GB":
						if(value>=1024){
							return Math.ceil((value/1024))+"TB";
						} 
						return value+scope.unit;
						break;
					default :
						return value+scope.unit;
						break;
				}
			}
			function option(dataSetL,data,color){
				var data = angular.copy(data)
				var datas = dataSetL(data);
				var date = datas.date;
				var dateSet = datas.dateset;
				var orginDate = datas.orginDate;
				
				var option_l = {
					tooltip: {
						trigger: 'axis',
						backgroundColor:'rgba(62, 67, 110, 0.7)',
						formatter: function (params, ticket, callback) {
							var index = params[0].dataIndex;
							var value = valueSetOfUnit(params[0].value)
							return orginDate[index] + '<br />' + scope.name + ":" + " " + value  
						}
					},
				   
					// title: {
					//     left: 'center',
					//     text: '大数据量面积图',
					// },
					xAxis: {
						type: 'category',
						boundaryGap: false,
						data: date,
						axisTick: {
							show: false
						},
						axisLine:{
							lineStyle:{
								color:"#3a456d",
								width:2
							}
						}
					},
					yAxis: {
						type: 'value',
						boundaryGap: [0, 0],
						splitLine:{
							show:false
						},
						axisLabel:{
							show:true,
							formatter:  function(value){
								return valueSetOfUnit(value)
							}
						},
						axisTick: {
							show: false,
						},
						axisLine:{
							lineStyle:{
								color:"#3a456d",
								width:2
							}
						}
					},
					grid: {
						left: 55,
						top:10,
						bottom: 30,
					},
					series: [
						{
							name:scope.name,
							type:'line',
							smooth:true,
							symbol: 'none',
							sampling: 'average',
							itemStyle: {
								normal: {
									color: color[0]
								}
							},
							areaStyle: {
								normal: {
									color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
										offset: 0,
										color: color[1]
									}, {
										offset: 1,
										color: color[2]
									}])
								}
							},
							data: dateSet
						}
					]
				};
				return option_l
			}
			scope.$watch(function(){
				return scope.areaData;
			},function(data){
				if(data && angular.isArray(data)){
					monitorCache[scope.id].setOption(option(dataSet,scope.areaData,scope.color))
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