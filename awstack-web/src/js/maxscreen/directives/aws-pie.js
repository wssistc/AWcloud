awsPie.$inject = ['$http','monitorCache']
export function awsPie($http,monitorCache){
	return {
		restrict: 'EA',
		scope:{
			id:"@",
			pieData:"="
		},
		link: function(scope, elem, attr){
			monitorCache[scope.id] = echarts.init(elem[0]);
			var rectNum = 20;
			function dataSet(dataValue){
				var dataset = [];
				dataValue.map((item,index) => {
					item.value = Math.ceil(rectNum * item.percent/100);
				})
				dataValue.map((per,i)=>{
					for (var j = 1; j < per.value+1; ++j) {
						dataset.push({
							name: per.name,
							value: 2,
							num:per.value,
							percent:per.percent,
							label: {
								show:false
							},
							itemStyle:{
								normal:{
									color:per.color,
									
								}
							},
							
							
					
						});
					}
				})
				return dataset
			}
			function option(dataSet,dataValue){
				var option = {
					tooltip: {
						trigger: 'item',
						backgroundColor:'rgba(62, 67, 110, 0.7)',
					},
					series: [
						{
							type:'pie',
							radius: ['50%', '70%'],
							center:["50%","50%"],
							hoverOffset:2,
							hoverAnimation:true,
							avoidLabelOverlap: false,
							tooltip:{
								position: function (point, params, dom, rect, size) {
									return point;
								},
								formatter: function (params, ticket, callback) {
									return params.name + " : " + params.data.percent + "%";
								}
							},
							labelLine: {
								normal: {
									show: false
								}
							},
							itemStyle: {
								normal: {
									borderColor: '#050e3e',
									borderWidth:1
								}
							},
							data:dataSet(dataValue)
						}
					]
				};
				return option;
			}
			scope.$watch(function(){
				return scope.pieData;
			},function(data){
				if(data && angular.isArray(data)){
					monitorCache[scope.id].setOption(option(dataSet,scope.pieData))
					//window.onresize = pieChart.resize;
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