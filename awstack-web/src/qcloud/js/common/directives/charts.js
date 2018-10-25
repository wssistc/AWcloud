import {PiePanelDefault} from"../../chartpanel";
import {AreaPanelDefault} from"../../chartpanel";

var chartsModule = angular.module("chartsModule", []);

chartsModule.directive("chartPie",function($rootScope,$translate,$location,$window,$timeout,resize){
    return {
        restrict:"A",
        scope:{
            panel:"="
        },
        template:"",
        link:function(scope,elem){
            var _pathDetail = $location.path().split("/")[2];
            function renderPieFunc(width){
                scope.panel = scope.panel || new PiePanelDefault();
                scope.panel.data = scope.panel.data || [];
                scope.panel.colors = scope.panel.colors || [];
                var colors = scope.panel.colors;

                var dataSet = (scope.panel.data).map(function(d){
                    if(_pathDetail == "service"){
                        return Number(d.value) + Number(d.abnormal);
                    }else{
                        return Number(d.value);
                    }
                });
                var seriesName = (scope.panel.data).map(function(d){return d.name;});
                var pie=d3.layout.pie().value(function(d){
                    return d;
                });
                var pieData=pie(dataSet); 
                var usagePercent = (dataSet[0]/d3.sum(dataSet,function(d){ return d; })*100).toFixed(1);

                var svg=d3.select(elem[0]).append("svg").attr("width",width).attr("height",width);

                var outerRadius = width/2-2,innerRadius = outerRadius-20;

                var tooltip = d3.select(elem[0])
                                .append("div")
                                .attr("class","tooltip")
                                .style("display","none");

                function mouseout(){
                    tooltip.style("display","none");
                }
                function mousemove(){
                    tooltip.style("left", (d3.event.pageX-elem.offset().left+20) + "px").style("top", (d3.event.pageY-elem.offset().top-20) + "px");
                }
                /*function mouseover(index){
                    tooltip.html(seriesName[index] +"\t:\t"+ + dataSet[index] +" ("+(dataSet[index]/d3.sum(dataSet,function(d){ return d; })*100).toFixed(1)+"%)" )
                        .style("left", (d3.event.pageX-elem.offset().left) + "px")
                        .style("top", (d3.event.pageY-elem.offset().top - 20) + "px")
                        .style("opacity",0.8);
                };*/
                function defaultPath(){
                    var arc=d3.svg.arc()
                            .startAngle(0)
                            .innerRadius(innerRadius)
                            .outerRadius(outerRadius);

                    var arcs = svg.append("g")
                                .attr("transform","translate("+(width/2)+","+(width/2)+")");

                    arcs.append("path")
                        .attr("class","background")
                        .attr("fill","#e5e5e5")
                        .attr("d",arc.endAngle(2 * Math.PI));

                    return arcs;
                }

                if(dataSet.length == 0 ){
                    defaultPath().append("text").attr({"text-anchor":"middle","fill":"#90a2ba","font-size":".14rem"}).text("暂无数据");
                }else{
                    if(scope.panel.pieType == "percent"){
                        if(!usagePercent || usagePercent == "Infinity" || usagePercent == "NaN"){
                            if(_.every(dataSet,function(val){ return val == 0;})){
                                defaultPath().append("text").attr({"text-anchor":"middle","fill":"#313949","font-size":".24rem"}).text("0%");
                            }else{
                                defaultPath().append("text").attr({"text-anchor":"middle","fill":"#90a2ba","font-size":".14rem"}).text("数据错误");
                            }
                        }else{
                            var arc=d3.svg.arc()
                                .startAngle(0)
                                .innerRadius(innerRadius)
                                .outerRadius(outerRadius);

                            var _arc = d3.svg.arc()
                                .startAngle(0)
                                .innerRadius(innerRadius-2)
                                .outerRadius(outerRadius+2);   

                            var arcs = svg.append("g")
                                        .attr("transform","translate("+(width/2)+","+(width/2)+")");

                            arcs.append("path")
                                .attr("class","background")
                                .attr("fill","#e5e5e5")
                                .attr("d",arc.endAngle(2 * Math.PI))
                                .on("mouseover",function(){
                                    tooltip.html(seriesName[1] +"\t:\t"+ + dataSet[1] +" ("+(dataSet[1]/d3.sum(dataSet,function(d){ return d; })*100).toFixed(1)+"%)" )
                                        .style("left", (d3.event.pageX-elem.offset().left) + "px")
                                        .style("top", (d3.event.pageY-elem.offset().top - 20) + "px")
                                        .style("display","block");
                                })
                                .on("mousemove",mousemove)
                                .on("mouseout",mouseout);

                            arcs.append("path")
                                .attr("class","portion")
                                .attr("fill",function(){
                                    if(scope.panel.progressRate){
                                        if(usagePercent<=30){
                                            colors[0] = "#1abc9c";
                                            return "#1abc9c";
                                        }else if(usagePercent<=50 && usagePercent>30){
                                            colors[0] = "#51a3ff";
                                            return "#51a3ff";
                                        }else if(usagePercent<=65 && usagePercent>50){
                                            colors[0] = "#4e80f5";
                                            return "#4e80f5";
                                        }else if(usagePercent<=75 && usagePercent>65){
                                            colors[0] = "#f39c12";
                                            return "#f39c12";
                                        }else if(usagePercent<=85 && usagePercent>75){
                                            colors[0] = "#e67e22";
                                            return "#e67e22";
                                        }else if(usagePercent<=95 && usagePercent>85){
                                            colors[0] = "#e74c3c";
                                            return "#e74c3c";
                                        }else if(usagePercent>95){
                                            colors[0] = "#c0392b";
                                            return "#c0392b";
                                        }
                                    }else{
                                        return colors[0];
                                    }
                                })
                                .on("mouseover",function(){
                                    tooltip.html(seriesName[0] +"\t:\t"+ + dataSet[0] +" ("+(dataSet[0]/d3.sum(dataSet,function(d){ return d; })*100).toFixed(1)+"%)" )
                                        .style("left", (d3.event.pageX-elem.offset().left) + "px")
                                        .style("top", (d3.event.pageY-elem.offset().top - 20) + "px")
                                        .style("display","block");

                                })
                                .on("mousemove",mousemove)
                                .on("mouseout",mouseout)
                                .transition()
                                .duration(1000)
                                .tween("transition", function() {
                                    return function(t) {
                                        var i = d3.interpolate(0, dataSet[0]/d3.sum(dataSet,function(d){ return d; }));
                                        svg.select(".portion").attr("d", _arc.endAngle(2 * Math.PI * i(t)));
                                    };
                                });

                            var pieCenterText = d3.select(elem[0]).append("div").attr("class","pie-center").append("sapn");
                            /*pieCenterText.html((dataSet[0]/d3.sum(dataSet,function(d){ return d; })*100).toFixed(1)+"%");*/
                            pieCenterText.html(scope.panel.centerValue);
                        }
                        
                    }else if(scope.panel.pieType == "category"){
                        let arc=d3.svg.arc()
                            .innerRadius(innerRadius)
                            .outerRadius(outerRadius);
                        let arcs=svg.selectAll("g")
                            .data(pieData)
                            .enter()
                            .append("g")
                            .attr("transform",function(){
                                return "translate("+(width/2)+","+(width/2)+")";
                            });

                        arcs.append("path")
                        //.style("stroke", "#fff")
                        .attr("fill",function(d,i){
                            return colors[i];
                        })
                        .attr("d",function(d){
                            return arc(d); 
                        })
                        .on("mouseover",function(d,i){
                            var arcOn=d3.svg.arc().innerRadius(innerRadius-2).outerRadius(outerRadius+2);
                            d3.select(this).attr("d",function(d){
                                return arcOn(d);
                            });
                            tooltip.html(seriesName[i] +"\t:\t"+ + d.data +" ("+(d.data/d3.sum(dataSet,function(d){ return d; })*100).toFixed(1)+"%)" )
                                .style("left", (d3.event.pageX-elem.offset().left) + "px")
                                .style("top", (d3.event.pageY-elem.offset().top - 20) + "px")
                                .style("display","block");

                        })
                        .on("mousemove",mousemove)
                        .on("mouseout",function(){
                            d3.select(this).transition().duration(800)
                                .attr("d",function(d){
                                    return arc(d);
                                });
                            mouseout();
                        });
                        var pieCenterText = d3.select(elem[0]).append("div").attr("class","pie-center").append("sapn");
                        /*pieCenterText.html((dataSet[0]/d3.sum(dataSet,function(d){ return d; })*100).toFixed(1)+"%");*/
                        pieCenterText.html(scope.panel.centerValue);
                    }
                }
            }

            resize().call(function () {
                scope.$watch(function(){
                    return scope.panel;
                }, function(panel){
                    if(panel){
                        elem.html("");
                        renderPieFunc(elem.width()); 
                    }
                });
                elem.html("");
                renderPieFunc(elem.width()); 
            });  
        }
    };
});

chartsModule.directive("chartArea",function($rootScope,$translate,$location,$window,$timeout,resize,kbnSrv){
    return{
        restrict:"A",
        scope:{
            panel:"="
        },
        template:"",
        link:function(scope,elem){

            function renderAreaFunc(width,panel){
                scope.panel = panel || (new AreaPanelDefault()).panels;
                scope.panel.data = panel.data || [];
                scope.panel.colors = panel.colors || [];
                var margin = scope.panel.margin,
                width = width==""?scope.panel.width- margin.left - margin.right-20:width - margin.left - margin.right-20,
                height = scope.panel.height- margin.top - margin.bottom,
                //areaTitle = scope.panel.title,
                data = scope.panel.data;

                var colors = d3.scale.ordinal()
                    .domain(data[0].columns.filter(function(key) {
                        return key !== "time";
                    }))
                    .range(scope.panel.colors);

                var series_data = colors.domain().map(function(name,i) {
                    return {
                        name: $translate.instant("aws.monitor." + name),
                        values: data[0].values.map(function(d) {
                            return {
                                date: d[0],
                                value: +d[i+1]
                            };
                        })
                    };
                });  //处理后得到每一个series的name和values
               
                var x = d3.time.scale()
                    .domain(d3.extent(data[0].values, function(d) { 
                        return d[0]; //返回的是数据中最小日期和最大日期
                    }))
                    .range([0, width]);

                var series_data_min = d3.min(series_data, function(c) { return d3.min(c.values, function(v) { return v.value; }); });
                var series_data_max = d3.max(series_data, function(c) { 
                    if(scope.panel.unit == "percent" && data[0].values.length>2){
                        return 100;
                    }else{
                        return (d3.max(c.values, function(v) { return v.value; }))*1.5; 
                    }
                });

                var y = d3.scale.linear()
                    //.domain([series_data_min == series_data_max && series_data_max>0?0:series_data_min,series_data_max])
                    .domain([0,series_data_max])//纵轴从最小值开始修改为都从0开始；
                    .range([height, 0]);

                var xAxis = d3.svg.axis()
                    .scale(x)
                    .orient("bottom")
                    .ticks(6).tickFormat(function(d){
                        if(scope.panel.xAxisType == "date"){
                            return d3.time.format("%m/%d")(new Date(d));
                        }else{
                            return d3.time.format("%H:%M")(new Date(d));
                        }
                    });

                var max_char_count = 0;
                var tickStep = 0;
                var getyAxisTickStep = d3.svg.axis().scale(y).ticks(6).tickFormat(function(d,i){
                    if(i === 1){
                        tickStep = angular.copy(d);
                    }
                });
                var transformLength = function(d){
                    var char_count = String(d).length;
                    if(max_char_count < char_count){
                        max_char_count = char_count;
                        if(max_char_count >6){ //纵轴刻度长度超过6位数时，再自动调整偏移量,6位数以下时则统一偏移固定宽度，以保持样式对齐。
                            svg.attr("transform","translate(" + (max_char_count * 8) + "," + margin.top + ")");
                        }
                    }
                };
                var tickFormatterFunc = function(d){
                    var _d;
                    var axisTickFormatter;
                    var decimalPos = String(d).indexOf(".");
                    var tickDecimals = decimalPos === -1 ? 0 : String(d).length - decimalPos - 1;
                    var scaledDecimals = tickDecimals - Math.floor(Math.log(tickStep) / Math.LN10);
                    if(scope.panel && scope.panel.unit){
                        var formatType = scope.panel.unit;
                        if(kbnSrv.valueFormats[formatType]){
                            axisTickFormatter = kbnSrv.valueFormats[formatType];
                            _d = axisTickFormatter(d,tickDecimals,scaledDecimals);
                        }else{
                            axisTickFormatter = kbnSrv.valueFormats.special;
                            _d = axisTickFormatter(d,tickDecimals,formatType);
                        }
                    }else{
                        axisTickFormatter = kbnSrv.valueFormats.none;
                        _d = axisTickFormatter(d,tickDecimals);
                    }
                    return _d;
                };
                var yAxis = d3.svg.axis()
                    .scale(y)
                    .orient("left")
                    .ticks(6).tickFormat(function(d) {
                        transformLength(tickFormatterFunc(d));
                        return tickFormatterFunc(d);
                    });

                /*var xGridAxis = d3.svg.axis()
                    .scale(x)
                    .orient('bottom');*/

                var yGridAxis = d3.svg.axis()
                    .scale(y)
                    .orient("left")
                    .ticks(6);

                var area = d3.svg.area()
                    .interpolate("monotone")
                    .x(function(d) { return x(d.date); })
                    .y0(height)
                    .y1(function(d) { return y(d.value); });

                var line = d3.svg.line()
                    .interpolate("monotone")
                    .x(function(d) { return x(d.date); })
                    .y(function(d) { return y(d.value); });

                var svg = d3.select(elem[0]).append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform","translate(" + margin.left + "," + margin.top + ")");

                svg.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(0," + (height+5) + ")")
                    .call(xAxis);

                svg.append("g")
                    .attr("class", "y axis")
                    .attr("transform", "translate(0,0)")
                    .call(getyAxisTickStep)
                    .call(yAxis);

                svg.append("clipPath")
                    .attr("id", "clip")
                    .append("rect")
                    .attr("x",0)
                    .attr("y",0)
                    .attr("width", width)
                    .attr("height", height);

                svg.selectAll(".defs")
                    .data(series_data)
                    .enter()
                    .append("defs")
                    .attr("class","defs");

                var linearGradient = svg.selectAll("defs").append("linearGradient")
                    .attr({
                        "id":function(d){return d.name.split(" ")[0];},
                        "x1":"0%",
                        "y1":"0%",
                        "x2":"0%",
                        "y2":"100%"
                    });

                linearGradient.append("stop")
                    .attr("offset","0%")
                    .style("stop-color",function(d){
                        return colors(d.name);
                    });
                linearGradient.append("stop")
                    .attr("offset","100%")
                    .style("stop-color","#fff");

                var series = svg.selectAll(".series")
                    .data(series_data)
                    .enter()
                    .append("g")
                    .attr("class", "series");

                series.append("path")
                    .attr("class", "area")
                    .attr("clip-path", "url(#clip)")
                    .attr("d",  function(d) {
                        return area(d.values);
                    })
                    /*.style("stroke", function(d) {
                    return colors(d.name);
                    })*/
                    .style("fill",function(d){
                        return "url(#" + d.name.split(" ")[0] + ")";
                    });

                series.append("path")
                    .attr("class", "line")
                    .attr("clip-path", "url(#clip)")
                    .attr("d", function(d) {
                        return line(d.values);
                    })
                    .style("stroke", function(d) {
                        return colors(d.name);
                    })
                    .call(function(){
                        //console.log(this[0][0]);
                        var linepath = this[0][0];
                        if(!linepath.style.transition && !scope.animated){
                            var length = linepath.getTotalLength();
                            linepath.style.transition = linepath.style.WebkitTransition ='none';
                            linepath.style.strokeDasharray = length + ' ' + length;
                            linepath.style.strokeDashoffset = length;
                            linepath.getBoundingClientRect();
                            linepath.style.transition = linepath.style.WebkitTransition = 'stroke-dashoffset 4s ease-in-out';
                            //linepath.style.animation = "dash 5s linear forwards";
                            linepath.style.strokeDashoffset = '0';
                        }
                    })
  
                svg.append("g") 
                    .attr("class", "grid")
                    .call(yGridAxis.tickSize(-width, 0, 0).tickFormat(""));

                if(data[0].values.length<=2){
                    svg.append("g")
                    .attr("class","prompt")
                    .append("text")
                    .attr({
                        "class":"prompt",
                        "x":width/3,
                        "y":scope.panel.height/2,
                        "font-size":".16rem",
                        "fill":"#4b6483"
                    })
                    .text("暂无数据"); //部署完成，暂未收集
                }
                //图例显示取消 
                /*var graph_legend = d3.select(elem[0]).append("div").attr("class","legend");
                var legendSeries = graph_legend.selectAll(".series").data(series_data).enter().append("div").attr("class","series");
                legendSeries.append("div").attr("class","legend-color")
                    .style("background-color",function(d){
                        return colors(d.name);
                    });
                legendSeries.append("div").attr("class","legend-text")
                    .html(function(d){
                        return d.name; 
                    });*/

                var focusCircle = svg.append("g").attr("class","focusCircle").style("display","none");
                focusCircle.selectAll(".circle").data(series_data).enter().append("circle").attr("r",4.5).attr("class","circle");
                var tooltip = d3.select(elem[0]).append("div").attr("class","tooltip").style("display","none");
                var title = tooltip.append("div").attr("class","title");
                var des = tooltip.selectAll(".des").data(series_data).enter().append("div").attr("class","des");
                var desColor = des.append("div").attr("class","desColor");
                var desText = des.append("div").attr("class","desText");
                var vLine = svg.append("line").attr("class","focusLine").style("display","none");

                svg.append("rect").attr("class","overlay").attr("x",0).attr("y",0).attr("width",width-2).attr("height",height)
                .on("mouseover",function(){
                    if(data[0].values && data[0].values.length>2){
                        tooltip.style("left",(d3.event.pageX-elem.offset().left + angular.element(".tooltip").width() > elem.width()?d3.event.pageX-elem.offset().left-angular.element(".tooltip").width()-5:d3.event.pageX-elem.offset().left+10)+"px")
                            .style("top",(d3.event.pageY-elem.offset().top-angular.element(".tooltip").height())+"px")
                            .style("display","block")
                            .style({
                                "background-color":"#e6eef4",
                                "border":function(){
                                    if(scope.panel && scope.panel.colors){
                                        return "2px solid " + scope.panel.colors[0];
                                    }
                                },
                                "border-radius":"8px",
                                "opacity":0.8
                            });
                        vLine.style("display",null);
                        focusCircle.style("display",null);
                        series.select(".line").style("stroke-width",2);
                        focusCircle.select("circle").style({
                            "fill":function(d){
                                return  "#ddd" /*colors(d.name)*/;
                            },
                            "stroke":function(d){
                                return colors(d.name)
                            },
                            "stroke-width":3
                        });

                    }
                })
                .on("mouseout",function(){
                    tooltip.style("display","none");
                    vLine.style("display","none");
                    focusCircle.style("display","none");
                    series.select(".line").style("stroke-width",1);
                })
                .on("mousemove",mousemove);

                function mousemove(){
                    var data = series_data[0].values;
                    var mouseX = d3.mouse(this)[0];
                    var mouseY = d3.mouse(this)[1];

                    var x0 = x.invert(mouseX);  //横坐标的时间值(时间戳)
                    var y0 = y.invert(mouseY);
                    x0 = Math.round(x0);

                    var bisect = d3.bisector(function(d){
                        return d.date;
                    }).left;
                    var index = bisect(data,x0);

                    var x_time =new Date(x0);
                    var y_value = [];
                    var formatedTipValue = function(tipVal){
                        tipVal = tickFormatterFunc(tipVal);
                        var _tipVal = Number(tipVal.split(" ")[0]);
                        var tipValdecimalPos = String(_tipVal).indexOf(".");
                        var tipValDecimals = tipValdecimalPos === -1 ? 0 : String(_tipVal).length - tipValdecimalPos - 1;
                        if(tipValDecimals>3){
                            if(_tipVal>0 && _tipVal<1){
                                tipVal = tipVal.split(" ")[1]?_tipVal.toFixed(4) + " " +tipVal.split(" ")[1]:_tipVal.toFixed(4);
                            }else if(_tipVal >1){
                                tipVal = tipVal.split(" ")[1]?_tipVal.toFixed(3) + " " +tipVal.split(" ")[1]:_tipVal.toFixed(3);
                            }
                        }
                        return tipVal;
                    };
                    for (let k = 0;k<series_data.length;k++){
                        y_value[k] = {
                            seriesName:series_data[k].name,
                            value:series_data[k].values[index]?(series_data[k].values[index].value?formatedTipValue(series_data[k].values[index].value):0):""
                        };
                    }
                    title.html("<strong>"+moment(x_time).format("YYYY-MM-DD HH:mm:ss")+"</strong>");

                    desColor.style("background-color",function(d){
                        return colors(d.name);
                    });

                    desText.html(function(d,i){
                        if( y_value[i]){
                            //if(y_value[i].value){
                                //return y_value[i].seriesName+"\t"+"<strong>"+(max_char_count == 6?y_value[i].value.toFixed(6):parseInt(y_value[i].value)==y_value[i].value?y_value[i].value:y_value[i].value.toFixed(4))+scope.panel.unit+"</strong>"; //这里单位为变量
                                //return y_value[i].seriesName+"\t"+"<strong>"+tickFormatterFunc(y_value[i].value)+"</strong>";
                            //}else{
                                return y_value[i].seriesName+"\t"+"<strong>"+y_value[i].value+"</strong>";
                            //}
                        }
                    });
                    
                    tooltip.style("left",(d3.event.pageX-elem.offset().left + angular.element(".tooltip").width() > elem.width()?d3.event.pageX-elem.offset().left-angular.element(".tooltip").width()-5:d3.event.pageX-elem.offset().left+10)+"px")
                        .style("top",(d3.event.pageY-elem.offset().top-angular.element(".tooltip").height())+"px");

                    var vlx = x(data[index].date);
                    var focusY = y(data[index].value);
                    vLine.attr("x1",vlx)
                        .attr("y1",0)
                        .attr("x2",vlx)
                        .attr("y2",height);
                    focusCircle.attr("transform","translate(" + vlx + "," + focusY + ")");
                    
                }
            }

            function timestampFmt(ts){
                if(typeof(ts) == "string"){
                    if(ts && !ts.substr(ts.length-1,ts.length) == "Z"){ // ie不支持endWith()方法
                        ts += "Z";
                    }
                    var date = new Date(ts);
                    return date;
                }else{
                    return ts;
                }
            }

            var _width = "";
            resize().call(function () {
                scope.$watch(function(){
                    return scope.panel;
                }, function(panel){
                    if(panel){
                        elem.html("");
                        if(panel.data[0]){
                            panel.data[0].values.forEach(function(d) {
                                d[0] = timestampFmt(d[0]);
                            });
                            _width = elem.width();
                            renderAreaFunc(elem.width(),panel); 
                            scope.animated = true;
                        }
                    }
                });    
                if(scope.panel){
                    elem.html("");
                    if(scope.panel.data[0]){
                        scope.panel.data[0].values.forEach(function(d) {
                            d[0] = timestampFmt(d[0]);
                        });
                        renderAreaFunc(elem.width() == "0"?_width:elem.width(),scope.panel); 
                    }
                }
            });
        }
    };
});

chartsModule.directive("quotaBar",function($timeout){
    return {
        restrict:"A",
        replace: true,
        transclude: true,
        scope:{
            bardata:"="
        },
        template:function(elem){
            if(elem[0].id == "insQuota"){
                return " <div>\
                            <div class=\"series-text\" title={{bardata.message}}>{{bardata.domainName}}<span></sapn><i ng-show=\"bardata.message\" class=\"icon-aw-prompt\"></i></div>\
                            <uib-progressbar class=\"active\"  max=\"bardata.total\" value=\"used\" type=\"{{barTypeFunc((bardata.inUsed/bardata.total*100).toFixed(1))}}\" ></uib-progressbar>\
                            <div class=\"legend percent\">{{bardata.total?(bardata.inUsed/bardata.total*100).toFixed(1):bardata.inUsed?100:0}}%</div>\
                            <div class=\"legend quota\">\
                                <span class=\"value progress-bar-{{barTypeFunc((bardata.inUsed/bardata.total*100).toFixed(1))}}\" >{{bardata.inUsed}}</span> / <span>{{bardata.total}}</span>\
                            </div>\
                        </div>";
            }else{
                return "<div>\
                            <div class=\"left\">{{bardata.title}}</div>\
                            <div class=\"right\">{{\"aws.common.inUsed\"|translate}}  <span class=\"value progress-bar-{{barTypeFunc(percent)}}\" >{{bardata.inUsed}}</span>/{{bardata.total}}</div>\
                            <div class=\"progress active width\">\
                                <div class=\"progress-bar progress-bar-{{barTypeFunc(percent)}} \" aria-valuenow=\"used\" aria-valuemin=\"0\" aria-valuemax=\"bardata.total\" ng-style=\"{width: (inUsepercent?(inUsepercent < 100 ? inUsepercent : 100):0) + \'%\'}\"></div>\
                                <div ng-if=\"bardata.beAdded\" class=\"progress-bar progress-bar-{{barTypeFunc(percent,'add')}} \" aria-valuenow=\"added\" title=\"已添加：{{bardata.beAdded}}\" aria-valuemin=\"0\" aria-valuemax=\"bardata.total\" ng-style=\"{width: (addpercent?(addpercent < 100 ? addpercent : 100):0) + \'%\'}\"></div>\
                            </div>\
                        </div>";
            }
        },
        link:function(scope){
            
            scope.$watch(function(){
                return scope.bardata;
            },function(bardata){
                if(bardata){
                    scope.used = 0;
                    scope.added = 0;
                    var totalPercent = ((scope.bardata.inUsed+scope.bardata.beAdded)/scope.bardata.total*100).toFixed(1);
                    scope.percent = totalPercent<=100 ? totalPercent:100 ;
                    scope.inUsepercent = (scope.bardata.inUsed/scope.bardata.total*100).toFixed(1);
                    var beAdd_percent = (scope.bardata.beAdded/scope.bardata.total*100).toFixed(1);
                    scope.addpercent = beAdd_percent<=100-scope.inUsepercent?beAdd_percent:100-scope.inUsepercent;
                    $timeout(function(){
                        scope.used = scope.bardata.inUsed || 0;
                        scope.added = scope.bardata.beAdded || 0;
                    },300);
                }
            });

            scope.barTypeFunc = function(percent,type){
                if(percent<=30){
                    return type?"DarkgreenLight":"green";
                }else if(percent>30 && percent<=50){
                    return type?"blueDark":"blue";
                }else if(percent>50 && percent<=65){
                    return type?"blue":"blueDark";
                }else if(percent>65 && percent<=75){
                    return type?"orangeDark":"orange";
                }else if(percent>75 && percent<=85){
                    return type?"orange":"orangeDark";
                }else if(percent>85 && percent<=95){
                    return type?"redDark":"red";
                }else if(percent>95){
                    return type?"red":"redDark";
                }
            };
        }
    };
});
chartsModule.directive("chartBar",function($timeout,$translate,resize){
    return {
        restrict:"A",
        replace: true,
        transclude: true,
        scope:{
            bardata:"="
        },
        template:function(elem,attr){
            if(attr.type=="basic"){
                return "<div>\
                        <div class=\"progress width pull\">\
                            <div class=\"progress-bar progress-bar-{{barTypeFunc(inUsepercent)}}\" aria-valuenow=\"used\" aria-valuemin=\"0\" aria-valuemax=\"1\" ng-style=\"{width: (inUsepercent?(inUsepercent < 100 ? inUsepercent : 100):0) + \'%\'}\"></div>\
                        </div>\
                        <div class=\"right\"><span class=\"value progress-bar-{{barTypeFunc(inUsepercent)}}\" >{{inUsepercent}}%</span></div>\
                    </div>";
            }else{
                return "<div>\
                        <div class=\"left\">{{bardata.name}}</div>\
                        <div class=\"right\" ng-if=\"bardata.type=='text'\"><span class=\"value progress-bar-{{barTypeFunc(inUsepercent)}}\" >{{bardata.inUsed}}</span>/{{bardata.total}}</div>\
                        <div class=\"right\" ng-if=\"bardata.type=='percent'\"><span class=\"value progress-bar-{{barTypeFunc(inUsepercent)}}\" >{{inUsepercent}}%</span></div>\
                        <div class=\"progress active width pull\">\
                            <div class=\"progress-bar progress-bar-{{barTypeFunc(inUsepercent)}}\" aria-valuenow=\"used\" aria-valuemin=\"0\" aria-valuemax=\"bardata.total\" ng-style=\"{width: (inUsepercent?(inUsepercent < 100 ? inUsepercent : 100):0) + \'%\'}\"></div>\
                        </div>\
                    </div>";
            }
            
        },
        link:function(scope,elem,attr){
            scope.used = 0;
            scope.inUsepercent = 0;
            scope.$watch(function(){
                return scope.bardata;
            },function(bardata){
                if(bardata){
                    if(attr.type == "basic"){
                        $timeout(function(){
                            scope.used = Number(String(scope.bardata.data).split("%")[0])/100 || 0;
                            scope.inUsepercent = Number(String(scope.bardata.data).split("%")[0]) || 0;
                        },10);
                    }else{
                        $timeout(function(){
                            scope.used = scope.bardata.inUsed || 0;
                            scope.inUsepercent = scope.bardata.total>0?(scope.bardata.inUsed/scope.bardata.total*100).toFixed(1):0 || 0;
                        },10);
                    }
                    
                }
            });

            scope.barTypeFunc = function(percent){
                if(percent<=30){
                    return "redDark";
                }else if(percent>30 && percent<=50){
                    return "red";
                }else if(percent>50 && percent<=65){
                    return "orangeDark";
                }else if(percent>65 && percent<=75){
                    return "orange";
                }else if(percent>75 && percent<=85){
                    return "blueDark";
                }else if(percent>85 && percent<=95){
                    return "blue";
                }else if(percent>95){
                    return "green";
                }else{
                    return "default";
                }
            };

        }
    };
});
