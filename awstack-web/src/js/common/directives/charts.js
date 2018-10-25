import {
    PiePanelDefault
} from "../../chartpanel";
import {
    AreaPanelDefault
} from "../../chartpanel";
import {
    echartsColorlDefault
} from "../../chartpanel";

var chartsModule = angular.module("chartsModule", []);

chartsModule.directive("chartPie", function($translate, resize) {
    return {
        restrict: "A",
        scope: {
            panel: "=",
            detail: "="
        },
        template: "",
        link: function(scope, elem) {
            function renderPieFunc(width) {
                scope.panel = scope.panel || new PiePanelDefault();
                scope.panel.data = scope.panel.data || [];
                scope.panel.colors = scope.panel.colors || [];
                var colors = scope.panel.colors;

                var dataSet = (scope.panel.data).map(function(d) {
                    return Number(d.value);
                });
                var seriesName = (scope.panel.data).map(function(d) {
                    return d.name;
                });
                var pie = d3.layout.pie().value(function(d) {
                    return d;
                });
                var pieData = pie(dataSet);
                var usagePercent = (dataSet[0] / d3.sum(dataSet, function(d) {
                    return d;
                }) * 100).toFixed(1);

                var svg = d3.select(elem[0]).append("svg").attr("width", width).attr("height", width);
                var outerRadius = width / 2 - 2,
                    innerRadius = outerRadius - 20;
                if (scope.detail && document.body.clientWidth <= 1366) {
                    innerRadius = outerRadius - 14;
                }

                var tooltip = d3.select(elem[0])
                    .append("div")
                    .attr("class", "tooltip")
                    .style("display", "none");

                function mouseout() {
                    tooltip.style("display", "none");
                }

                function mousemove() {
                    tooltip.style("left", (d3.event.pageX - elem.offset().left + 20) + "px").style("top", (d3.event.pageY - elem.offset().top - 20) + "px");
                }

                function defaultPath() {
                    var arc = d3.svg.arc()
                        .startAngle(0)
                        .innerRadius(innerRadius)
                        .outerRadius(outerRadius);

                    var arcs = svg.append("g")
                        .attr("transform", "translate(" + (width / 2) + "," + (width / 2) + ")");

                    arcs.append("path")
                        .attr("class", "background")
                        .attr("fill", "#e5e5e5")
                        .attr("d", arc.endAngle(2 * Math.PI));

                    return arcs;
                }

                if (dataSet.length == 0) {
                    defaultPath().append("text").attr({
                        "text-anchor": "middle",
                        "fill": "#90a2ba",
                        "font-size": ".14rem"
                    }).text($translate.instant("aws.common.noData"));
                } else {
                    if (scope.panel.pieType == "percent") {
                        var pieCenterText = d3.select(elem[0]).append("div").attr("class", "pie-center").append("span");
                        if (!usagePercent || usagePercent == "Infinity" || usagePercent == "NaN") {
                            if (_.every(dataSet, function(val) {
                                    return val == 0;
                                })) {
                                // defaultPath().append("text").attr({
                                //     "text-anchor": "middle",
                                //     "fill": "#313949",
                                //     "font-size": ".24rem"
                                // }).text("0%");
                                defaultPath();
                                pieCenterText.html("0.0%");
                            } else {
                                // defaultPath().append("text").attr({
                                //     "text-anchor": "middle",
                                //     "fill": "#90a2ba",
                                //     "font-size": ".14rem"
                                // }).text($translate.instant("aws.common.dataError"));
                                defaultPath();
                                pieCenterText.html($translate.instant("aws.common.dataError"));
                            }
                        } else {
                            var arc = d3.svg.arc()
                                .startAngle(0)
                                .innerRadius(innerRadius)
                                .outerRadius(outerRadius);

                            var _arc = d3.svg.arc()
                                .startAngle(0)
                                .innerRadius(innerRadius - 2)
                                .outerRadius(outerRadius + 2);

                            var arcs = svg.append("g")
                                .attr("transform", "translate(" + (width / 2) + "," + (width / 2) + ")");

                            arcs.append("path")
                                .attr("class", "background")
                                .attr("fill", "#e5e5e5")
                                .attr("d", arc.endAngle(2 * Math.PI))
                                .on("mouseover", function() {
                                    tooltip.html(seriesName[1] + "\t:\t" + +dataSet[1] + " (" + (dataSet[1] / d3.sum(dataSet, function(d) {
                                            return d;
                                        }) * 100).toFixed(1) + "%)")
                                        .style("left", (d3.event.pageX - elem.offset().left) + "px")
                                        .style("top", (d3.event.pageY - elem.offset().top - 20) + "px")
                                        .style("display", "block");
                                })
                                .on("mousemove", mousemove)
                                .on("mouseout", mouseout);

                            arcs.append("path")
                                .attr("class", "portion")
                                .attr("fill", function() {
                                    if (scope.panel.progressRate) {
                                        if (usagePercent <= 30) {
                                            colors[0] = "#1abc9c";
                                            return "#1abc9c";
                                        } else if (usagePercent <= 50 && usagePercent > 30) {
                                            colors[0] = "#51a3ff";
                                            return "#51a3ff";
                                        } else if (usagePercent <= 65 && usagePercent > 50) {
                                            colors[0] = "#4e80f5";
                                            return "#4e80f5";
                                        } else if (usagePercent <= 75 && usagePercent > 65) {
                                            colors[0] = "#f39c12";
                                            return "#f39c12";
                                        } else if (usagePercent <= 85 && usagePercent > 75) {
                                            colors[0] = "#e67e22";
                                            return "#e67e22";
                                        } else if (usagePercent <= 95 && usagePercent > 85) {
                                            colors[0] = "#e74c3c";
                                            return "#e74c3c";
                                        } else if (usagePercent > 95) {
                                            colors[0] = "#c0392b";
                                            return "#c0392b";
                                        }
                                    } else {
                                        return colors[0];
                                    }
                                })
                                .on("mouseover", function() {
                                    tooltip.html(seriesName[0] + "\t:\t" + +dataSet[0] + " (" + (dataSet[0] / d3.sum(dataSet, function(d) {
                                            return d;
                                        }) * 100).toFixed(1) + "%)")
                                        .style("left", (d3.event.pageX - elem.offset().left) + "px")
                                        .style("top", (d3.event.pageY - elem.offset().top - 20) + "px")
                                        .style("display", "block");

                                })
                                .on("mousemove", mousemove)
                                .on("mouseout", mouseout)
                                .transition()
                                .duration(1000)
                                .tween("transition", function() {
                                    return function(t) {
                                        var i = d3.interpolate(0, dataSet[0] / d3.sum(dataSet, function(d) {
                                            return d;
                                        }));
                                        svg.select(".portion").attr("d", _arc.endAngle(2 * Math.PI * i(t)));
                                    };
                                });

                            //var pieCenterText = d3.select(elem[0]).append("div").attr("class", "pie-center").append("span");
                            pieCenterText.html((dataSet[0] / d3.sum(dataSet, function(d) {
                                return d;
                            }) * 100).toFixed(1) + "%");
                        }

                    } else if (scope.panel.pieType == "category") {
                        let count = 0;
                        for (let ii = 0; ii < pieData.length; ii++) {
                            if (pieData[ii].data == 0) {
                                count++
                            }
                        }
                        if (count == pieData.length) {//所有数据都为0，填充默认圆环
                            defaultPath();
                        } else {
                            let arc = d3.svg.arc()
                                .innerRadius(innerRadius)
                                .outerRadius(outerRadius);
                            let arcs = svg.selectAll("g")
                                .data(pieData)
                                .enter()
                                .append("g")
                                .attr("transform", function() {
                                    return "translate(" + (width / 2) + "," + (width / 2) + ")";
                                });

                            arcs.append("path")
                                //.style("stroke", "#fff")
                                .attr("fill", function(d, i) {
                                    return colors[i];
                                })
                                .attr("d", function(d) {
                                    return arc(d);
                                })
                                .on("mouseover", function(d, i) {
                                    var arcOn = d3.svg.arc().innerRadius(innerRadius - 2).outerRadius(outerRadius + 2);
                                    d3.select(this).attr("d", function(d) {
                                        return arcOn(d);
                                    });
                                    tooltip.html(seriesName[i] + "\t:\t" + +d.data + " (" + (d.data / d3.sum(dataSet, function(d) {
                                            return d;
                                        }) * 100).toFixed(1) + "%)")
                                        .style("left", (d3.event.pageX - elem.offset().left) + "px")
                                        .style("top", (d3.event.pageY - elem.offset().top - 20) + "px")
                                        .style("display", "block");

                                })
                                .on("mousemove", mousemove)
                                .on("mouseout", function() {
                                    d3.select(this).transition().duration(800)
                                        .attr("d", function(d) {
                                            return arc(d);
                                        });
                                    mouseout();
                                });
                        }

                    }
                }
            }

            resize().call(function() {
                scope.$watch(function() {
                    return scope.panel;
                }, function(panel) {
                    if (panel) {
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
chartsModule.directive("chartPie_", function($translate, resize) {
    return {
        restrict: "A",
        scope: {
            panel: "="
        },
        template: "",
        link: function(scope, elem) {
            function renderPieFunc(width) {
                scope.panel = scope.panel || new PiePanelDefault();
                scope.panel.data = scope.panel.data || [];
                scope.panel.colors = scope.panel.colors || [];
                var colors = scope.panel.colors;

                var dataSet = (scope.panel.data).map(function(d) {
                    return Number(d.value);
                });
                var seriesName = (scope.panel.data).map(function(d) {
                    return d.name;
                });
                var pie = d3.layout.pie().value(function(d) {
                    return d;
                });
                var pieData = pie(dataSet);
                var usagePercent = (dataSet[0] / d3.sum(dataSet, function(d) {
                    return d;
                }) * 100).toFixed(1);

                var svg = d3.select(elem[0]).append("svg").attr("width", width).attr("height", width);

                var outerRadius = width / 2 - 2,
                    innerRadius = outerRadius - 20;

                var tooltip = d3.select(elem[0])
                    .append("div")
                    .attr("class", "tooltip")
                    .style("display", "none");

                function mouseout() {
                    tooltip.style("display", "none");
                }

                function mousemove() {
                    tooltip.style("left", (d3.event.pageX - elem.offset().left + 20) + "px").style("top", (d3.event.pageY - elem.offset().top - 20) + "px");
                }

                function defaultPath() {
                    var arc = d3.svg.arc()
                        .startAngle(0)
                        .innerRadius(innerRadius)
                        .outerRadius(outerRadius);

                    var arcs = svg.append("g")
                        .attr("transform", "translate(" + (width / 2) + "," + (width / 2) + ")");

                    arcs.append("path")
                        .attr("class", "background")
                        .attr("fill", "#e5e5e5")
                        .attr("d", arc.endAngle(2 * Math.PI));

                    return arcs;
                }

                if (dataSet.length == 0) {
                    defaultPath().append("text").attr({
                        "text-anchor": "middle",
                        "fill": "#90a2ba",
                        "font-size": ".14rem"
                    }).text($translate.instant("aws.common.noData"));
                } else {
                    if (scope.panel.pieType == "percent") {
                        if (!usagePercent || usagePercent == "Infinity" || usagePercent == "NaN") {
                            if (_.every(dataSet, function(val) {
                                    return val == 0;
                                })) {
                                defaultPath().append("text").attr({
                                    "text-anchor": "middle",
                                    "fill": "#313949",
                                    "font-size": ".20rem"
                                }).text("0.0%");
                            } else {
                                defaultPath().append("text").attr({
                                    "text-anchor": "middle",
                                    "fill": "#90a2ba",
                                    "font-size": ".14rem"
                                }).text($translate.instant("aws.common.dataError"));
                            }
                        } else {
                            var arc = d3.svg.arc()
                                .startAngle(0)
                                .innerRadius(innerRadius)
                                .outerRadius(outerRadius);

                            var _arc = d3.svg.arc()
                                .startAngle(0)
                                .innerRadius(innerRadius - 2)
                                .outerRadius(outerRadius + 2);

                            var arcs = svg.append("g")
                                .attr("transform", "translate(" + (width / 2) + "," + (width / 2) + ")");

                            arcs.append("path")
                                .attr("class", "background")
                                .attr("fill", "#e5e5e5")
                                .attr("d", arc.endAngle(2 * Math.PI))
                                .on("mouseover", function() {
                                    tooltip.html(seriesName[1] + "\t:\t" + +dataSet[1] + " (" + (dataSet[1] / d3.sum(dataSet, function(d) {
                                            return d;
                                        }) * 100).toFixed(1) + "%)")
                                        .style("left", (d3.event.pageX - elem.offset().left) + "px")
                                        .style("top", (d3.event.pageY - elem.offset().top - 20) + "px")
                                        .style("display", "block");
                                })
                                .on("mousemove", mousemove)
                                .on("mouseout", mouseout);

                            arcs.append("path")
                                .attr("class", "portion")
                                .attr("fill", function() {
                                    return colors[0];
                                })
                                .on("mouseover", function() {
                                    tooltip.html(seriesName[0] + "\t:\t" + +dataSet[0] + " (" + (dataSet[0] / d3.sum(dataSet, function(d) {
                                            return d;
                                        }) * 100).toFixed(1) + "%)")
                                        .style("left", (d3.event.pageX - elem.offset().left) + "px")
                                        .style("top", (d3.event.pageY - elem.offset().top - 20) + "px")
                                        .style("display", "block");

                                })
                                .on("mousemove", mousemove)
                                .on("mouseout", mouseout)
                                .transition()
                                .duration(1000)
                                .tween("transition", function() {
                                    return function(t) {
                                        var i = d3.interpolate(0, dataSet[0] / d3.sum(dataSet, function(d) {
                                            return d;
                                        }));
                                        svg.select(".portion").attr("d", _arc.endAngle(2 * Math.PI * i(t)));
                                    };
                                });

                            var pieCenterText = d3.select(elem[0]).append("div").attr("class", "pie-center").append("span");
                            pieCenterText.html((dataSet[0] / d3.sum(dataSet, function(d) {
                                return d;
                            }) * 100).toFixed(1) + "%");
                        }

                    } else if (scope.panel.pieType == "category") {
                        let arc = d3.svg.arc()
                            .innerRadius(innerRadius)
                            .outerRadius(outerRadius);
                        let arcs = svg.selectAll("g")
                            .data(pieData)
                            .enter()
                            .append("g")
                            .attr("transform", function() {
                                return "translate(" + (width / 2) + "," + (width / 2) + ")";
                            });

                        arcs.append("path")
                            //.style("stroke", "#fff")
                            .attr("fill", function(d, i) {
                                return colors[i];
                            })
                            .attr("d", function(d) {
                                return arc(d);
                            })
                            .on("mouseover", function(d, i) {
                                var arcOn = d3.svg.arc().innerRadius(innerRadius - 2).outerRadius(outerRadius + 2);
                                d3.select(this).attr("d", function(d) {
                                    return arcOn(d);
                                });
                                tooltip.html(seriesName[i] + "\t:\t" + +d.data + " (" + (d.data / d3.sum(dataSet, function(d) {
                                        return d;
                                    }) * 100).toFixed(1) + "%)")
                                    .style("left", (d3.event.pageX - elem.offset().left) + "px")
                                    .style("top", (d3.event.pageY - elem.offset().top - 20) + "px")
                                    .style("display", "block");

                            })
                            .on("mousemove", mousemove)
                            .on("mouseout", function() {
                                d3.select(this).transition().duration(800)
                                    .attr("d", function(d) {
                                        return arc(d);
                                    });
                                mouseout();
                            });
                    }
                }
            }

            resize().call(function() {
                scope.$watch(function() {
                    return scope.panel;
                }, function(panel) {
                    if (panel) {
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
chartsModule.directive("chartArea", function($translate, resize, kbnSrv) {
    return {
        restrict: "A",
        scope: {
            panel: "=",
            queue: "=",
            trend: "=",
            view: "="
        },
        template: "",
        link: function(scope, elem) {

            //获取起止总时间，单位h
            function getRangeHours(start, end) {
                var rangeHours = void 0;
                var _start = new Date(start);
                var _end = new Date(end);
                var diffTime = _end.getTime() - _start.getTime();
                var diffDays = Math.floor(diffTime / (24 * 3600 * 1000));
                var leave1 = diffTime % (24 * 3600 * 1000); //计算天数后剩余的毫秒数
                var diffHours = Math.floor(leave1 / (3600 * 1000));
                rangeHours = diffDays * 24 + diffHours;
                return rangeHours;
            }

            function renderAreaFunc(width, panel) {
                scope.panel = panel || (new AreaPanelDefault()).panels;
                scope.panel.data = panel.data || [];
                scope.panel.colors = panel.colors || [];
                var margin = scope.panel.margin,
                    width = width == "" ? scope.panel.width - margin.left - margin.right - 20 : width - margin.left - margin.right - 20,
                    height = scope.panel.height - margin.top - margin.bottom,
                    //areaTitle = scope.panel.title,
                    data = scope.panel.data;

                var colors = d3.scale.ordinal()
                    .domain(data[0].columns.filter(function(key) {
                        return key !== "time";
                    }))
                    .range(scope.panel.colors);

                var series_data = colors.domain().map(function(name, i) {
                    if (scope.panel.xAxisType != "date") {
                        data[0].values = data[0].values.filter(function(d) {
                            return d[1] || d[1] === 0;
                        });
                    }
                    return {
                        name: scope.trend || scope.view ? name : $translate.instant("aws.monitor." + name),
                        name_key: name,
                        values: data[0].values.map(function(d, j) {
                            return {
                                date: d[0],
                                value: +Math.abs(d[i + 1]) //取绝对值
                            };
                        })
                    }

                }); //处理后得到每一个series的name和values
                graph(series_data);

                function graph(series_data) {
                    var getXdomain = function() {
                        if (scope.panel[scope.panel.chart + "StartTime"]) {
                            let xdomain_start = scope.panel[scope.panel.chart + "StartTime"];
                            let xdomain_end;
                            let val_max_endTime = d3.max(data[0].values, function(d) {
                                return d[0]; //指定起始时间
                            });
                            if (xdomain_start > val_max_endTime) {
                                xdomain_end = scope.panel[scope.panel.chart + "EndTime"];
                            } else {
                                xdomain_end = val_max_endTime;
                            }
                            return [xdomain_start, xdomain_end];
                        } else {
                            return d3.extent(data[0].values, function(d) {
                                return d[0]; //返回数据中最小日期和最大日期
                            })
                        }
                    };

                    var series_data_min = d3.min(series_data, function(c) {
                        return d3.min(c.values, function(v) {
                            return v.value;
                        });
                    });
                    var series_data_max = d3.max(series_data, function(c) {
                        if (scope.panel.unit == "percent" && data[0].values.length >=2 && !data[0].default) {
                            return 100;
                        } else {
                            var maxValue = d3.max(c.values, function(v) {
                                return v.value;
                            });
                            if (scope.queue == 'messages_ready' || scope.queue == 'messages_unacked' || scope.queue == 'rabbitQueueTotal' || scope.queue == 'cpu' || scope.queue == 'virtual' || scope.queue == 'project' || scope.queue == 'ip' || scope.queue == 'vlan') {
                                if (maxValue == 1) {
                                    return (d3.max(c.values, function(v) {
                                        return v.value;
                                    })) * 4.5;
                                } else if (maxValue == 2) {
                                    return (d3.max(c.values, function(v) {
                                        return v.value;
                                    })) * 2.5;
                                } else {
                                    return (d3.max(c.values, function(v) {
                                        return v.value;
                                    })) * 1.5;
                                }
                            } else {
                                return (d3.max(c.values, function(v) {
                                    return v.value;
                                })) * 1.5;
                            }
                        }
                    });

                    var x = d3.time.scale()
                        .domain(getXdomain())
                        .range([0, width]);

                    var y = d3.scale.linear()
                        //.domain([series_data_min == series_data_max && series_data_max>0?0:series_data_min,series_data_max])
                        .domain([0, series_data_max]) //纵轴从最小值开始修改为都从0开始；
                        .range([height, 0]);

                    var xAxis = d3.svg.axis()
                        .scale(x)
                        .orient("bottom")
                        .ticks(6).tickFormat(function(d) {
                            let rangeHours = getRangeHours(getXdomain()[0], getXdomain()[1]);
                            if (scope.panel.xAxisType == "date" || rangeHours > 24) {
                                return d3.time.format("%m/%d")(new Date(d));
                            } else if (scope.panel.xAxisType == "year") {
                                return d3.time.format("%Y/%m")(new Date(d));
                            } else {
                                return d3.time.format("%H:%M")(new Date(d));
                            }
                        });

                    var max_char_count = 0;
                    var tickStep = 0;
                    var getyAxisTickStep = d3.svg.axis().scale(y).ticks(6).tickFormat(function(d, i) {
                        if (i === 1) {
                            tickStep = angular.copy(d);
                        }
                    });

                    var transformLength = function(d) {
                        var char_count = String(d).length;
                        if (max_char_count < char_count) {
                            max_char_count = char_count;
                            if (max_char_count > 6) { //纵轴刻度长度超过6位数时，再自动调整偏移量,6位数以下时则统一偏移固定宽度，以保持样式对齐。
                                svg.attr("transform", "translate(" + (max_char_count * 9) + "," + margin.top + ")");
                            }
                        }
                    };
                    var tickFormatterFunc = function(d) {
                        var _d;
                        var axisTickFormatter;
                        var decimalPos = String(d).indexOf(".");
                        var tickDecimals = decimalPos === -1 ? 0 : String(d).length - decimalPos - 1;
                        var scaledDecimals = tickDecimals - Math.floor(Math.log(tickStep) / Math.LN10);
                        if (scope.panel && scope.panel.unit) {
                            var formatType = scope.panel.unit;
                            if (kbnSrv.valueFormats[formatType]) {
                                axisTickFormatter = kbnSrv.valueFormats[formatType];
                                _d = axisTickFormatter(d, tickDecimals, scaledDecimals);
                            } else {
                                axisTickFormatter = kbnSrv.valueFormats.special;
                                _d = axisTickFormatter(d, tickDecimals, formatType);
                            }
                        } else {
                            axisTickFormatter = kbnSrv.valueFormats.none;
                            _d = axisTickFormatter(d, tickDecimals);
                        }
                        return _d;
                    };
                    var yAxis = d3.svg.axis()
                        .scale(y)
                        .orient("left")
                        .tickFormat(function(d) {
                            transformLength(tickFormatterFunc(d));
                            return tickFormatterFunc(d);
                        });
                    if (series_data_max == 0) {
                        yAxis = yAxis.tickValues([0]);
                    } else {
                        yAxis = yAxis.ticks(6);
                    }

                    /*var xGridAxis = d3.svg.axis()
                        .scale(x)
                        .orient('bottom');*/

                    var yGridAxis = d3.svg.axis()
                        .scale(y)
                        .orient("left")
                        .ticks(6);

                    var area = d3.svg.area()
                        .interpolate("monotone")
                        .x(function(d) {
                            return x(d.date);
                        })
                        .y0(height)
                        .y1(function(d) {
                            return y(d.value);
                        });

                    var line = d3.svg.line()
                        .interpolate("monotone")
                        .x(function(d) {
                            return x(d.date);
                        })
                        .y(function(d) {
                            return y(d.value);
                        });

                    var svg = d3.select(elem[0]).append("svg")
                        .attr("width", width + margin.left + margin.right)
                        .attr("height", height + margin.top + margin.bottom)
                        .append("g")
                        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                    svg.append("g")
                        .attr("class", "x axis")
                        .attr("transform", "translate(0," + (height + 5) + ")")
                        .call(xAxis);

                    svg.append("g")
                        .attr("class", "y axis")
                        .attr("transform", "translate(0,0)")
                        .call(getyAxisTickStep)
                        .call(yAxis);

                    svg.append("clipPath")
                        .attr("id", "clip")
                        .append("rect")
                        .attr("x", 0)
                        .attr("y", 0)
                        .attr("width", width)
                        .attr("height", height);

                    svg.selectAll(".defs")
                        .data(series_data)
                        .enter()
                        .append("defs")
                        .attr("class", "defs");

                    var linearGradient = svg.selectAll("defs").append("linearGradient")
                        .attr({
                            "id": function(d) {
                                return d.name_key; //颜色线性渐变的id
                            },
                            "x1": "0%",
                            "y1": "0%",
                            "x2": "0%",
                            "y2": "100%"
                        });

                    linearGradient.append("stop")
                        .attr("offset", "0%")
                        .style("stop-color", function(d) {
                            return colors(d.name);
                        });
                    linearGradient.append("stop")
                        .attr("offset", "100%")
                        .style("stop-color", "#fff");

                    var series = svg.selectAll(".series")
                        .data(series_data)
                        .enter()
                        .append("g")
                        .attr("class", "series")
                        .attr("id", function(d) {
                            return d.name_key + "_line";
                        })

                    series.append("path")
                        .attr("class", "area")
                        .attr("clip-path", "url(#clip)")
                        .attr("d", function(d) {
                            return area(d.values);
                        })
                        /*.style("stroke", function(d) {
                        return colors(d.name);
                        })*/
                        .style("fill", function(d) {
                            return "url(#" + d.name_key + ")";
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
                        .call(function() {
                            var linepath = this[0][0];
                            if (!linepath.style.transition && !scope.animated) {
                                var length = linepath.getTotalLength();
                                linepath.style.transition = linepath.style.WebkitTransition = 'none';
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

                    if (data[0].default || (!data[0].default && data[0].values.length < 2)) {
                        svg.append("g")
                            .attr("class", "prompt")
                            .append("text")
                            .attr({
                                "class": "prompt",
                                "x": width / 3,
                                "y": scope.panel.height / 2,
                                "font-size": ".16rem",
                                "fill": "#4b6483"
                            })
                            .text(data[0].noHistoryData ? $translate.instant("aws.common.noHistoryData") : $translate.instant("aws.common.noData")); //部署完成，暂未收集
                    }

                    //var focusCircle = svg.append("g").attr("class", "focusCircle").style("display", "none");
                    //focusCircle.selectAll(".circle").data(series_data).enter().append("circle").attr("r", 4.5).attr("class", "circle");
                    var tooltip = d3.select(elem[0]).append("div").attr("class", "tooltip").style("display", "none");
                    var title = tooltip.append("div").attr("class", "title");
                    var des = tooltip.selectAll(".des").data(series_data).enter().append("div").attr("class", "des");
                    var desColor = des.append("div").attr("class", "desColor");
                    var desText = des.append("div").attr("class", "desText");
                    var vLine = svg.append("line").attr("class", "focusLine").style("display", "none");

                    svg.append("rect").attr("class", "overlay").attr("x", 0).attr("y", 0).attr("width", width - 2).attr("height", height)
                        .on("mouseover", function() {
                            if (data[0].values && !data[0].default && data[0].values.length >= 2) {
                                tooltip.style("left", (d3.event.pageX - elem.offset().left + $(elem).find(".tooltip").width() > elem.width() ? d3.event.pageX - elem.offset().left - $(elem).find(".tooltip").width() - 5 : d3.event.pageX - elem.offset().left + 10) + "px")
                                    .style("top", (d3.event.pageY - elem.offset().top - $(elem).find(".tooltip").height()) + "px")
                                    .style("display", "block")
                                    .style({
                                        "background-color": "#e6eef4",
                                        "border": function() {
                                            if (scope.panel && scope.panel.colors) {
                                                return "2px solid " + scope.panel.colors[0];
                                            }
                                        },
                                        "border-radius": "8px",
                                        "opacity": 0.8
                                    });
                                vLine.style("display", null);
                                //focusCircle.style("display", null);
                                series.select(".line").style("stroke-width", 2);
                                // focusCircle.select("circle").style({
                                //     "fill": function(d) {
                                //         return "#ddd" /*colors(d.name)*/ ;
                                //     },
                                //     "stroke": function(d) {
                                //         return colors(d.name)
                                //     },
                                //     "stroke-width": 3
                                // });

                            }
                        })
                        .on("mouseout", function() {
                            tooltip.style("display", "none");
                            vLine.style("display", "none");
                            //focusCircle.style("display", "none");
                            series.select(".line").style("stroke-width", 1);
                        })
                        .on("mousemove", mousemove);

                    function mousemove() {
                        var data = [];
                        for (let i = 0; i < series_data.length; i++) {
                            if (series_data[i].values.length) {
                                data = series_data[i].values;
                            }
                        }
                        var mouseX = d3.mouse(this)[0];
                        var mouseY = d3.mouse(this)[1];

                        var x0 = x.invert(mouseX); //横坐标的时间值(时间戳)
                        var y0 = y.invert(mouseY);
                        x0 = Math.round(x0);

                        var bisect = d3.bisector(function(d) {
                            return d.date;
                        }).left;
                        var index = bisect(data, x0);

                        var x_time = new Date(x0);
                        var y_value = [];
                        var formatedTipValue = function(tipVal) {
                            tipVal = tickFormatterFunc(tipVal);
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
                        for (let k = 0; k < series_data.length; k++) {
                            if (series_data[k].values.length) {
                                y_value[k] = {
                                    seriesName: series_data[k].name,
                                    value: series_data[k].values[index] ? (series_data[k].values[index].value ? formatedTipValue(series_data[k].values[index].value) : formatedTipValue(0)) : "",
                                    date: series_data[k].values[index] ? (panel.xAxisType == "date" ? moment(series_data[k].values[index].date).format("YYYY-MM-DD") : moment(series_data[k].values[index].date).format("YYYY-MM-DD HH:mm:ss")) : ""
                                };
                            }
                        }

                        //title.html("<strong>"+ moment(x_time).format('YYYY-MM-DD HH:mm:ss') +"</strong>");
                        title.html(function(d, i) {
                            if (y_value[i]) {
                                return "<strong>" + y_value[i].date + "</strong>"
                            }
                        });

                        desColor.style("background-color", function(d) {
                            return colors(d.name);
                        });

                        desText.html(function(d, i) {
                            if (y_value[i]) {
                                //if(y_value[i].value){
                                //return y_value[i].seriesName+"\t"+"<strong>"+(max_char_count == 6?y_value[i].value.toFixed(6):parseInt(y_value[i].value)==y_value[i].value?y_value[i].value:y_value[i].value.toFixed(4))+scope.panel.unit+"</strong>"; //这里单位为变量
                                //return y_value[i].seriesName+"\t"+"<strong>"+tickFormatterFunc(y_value[i].value)+"</strong>";
                                //}else{
                                return y_value[i].seriesName + "\t" + "<strong>" + y_value[i].value + "</strong>";
                                //}
                            }
                        });

                        var setDisplay = function(index) {
                            // if(scope.view){
                            //     return "none";
                            // }
                            if (index == 0 || scope.panel.data[0].default || (!scope.panel.data[0].default && scope.panel.data[0].values.length < 2)) {
                                return "none";
                            } else {
                                return "block";
                            }
                        };

                        tooltip.style("left", (d3.event.pageX - elem.offset().left + $(elem).find(".tooltip").width() > elem.width() ? d3.event.pageX - elem.offset().left - $(elem).find(".tooltip").width() - 20 : d3.event.pageX - elem.offset().left + 10) + "px")
                            .style("top", (d3.event.pageY - elem.offset().top - $(elem).find(".tooltip").height()) + "px")
                            .style("display", setDisplay(index));
                        if (data[index]) {
                            var vlx = x(data[index].date);
                            var focusY = y(data[index].value);
                            vLine.attr("x1", vlx)
                                .attr("y1", 0)
                                .attr("x2", vlx)
                                .attr("y2", height)
                                .style("display", setDisplay(index));
                        }
                        // focusCircle.attr("transform", "translate(" + vlx + "," + focusY + ")")
                        //     .style("display", setDisplay(index));
                    }

                    function graphLegend(series_data, colors) {
                        //图例显示
                        if (scope.view) {
                            return;
                        }
                        var graph_legend = d3.select(elem[0]).append("div").attr("class", "legend");
                        var legendSeries = graph_legend.selectAll(".series").data(series_data).enter().append("div").attr("class", "series")
                            .on("click", function(d) {
                                series_data = _.map(series_data, function(item, i) {
                                    if (item.name_key == d.name_key) {
                                        if (item.hideLine) {
                                            item.hideLine = false;
                                            d3.select("#" + d.name_key + "_line").style("display", "block");
                                        } else {
                                            item.hideLine = true;
                                            d3.select("#" + d.name_key + "_line").style("display", "none");
                                        }
                                    }
                                    return item;
                                });
                            });
                        if (!data[0].default && data[0].values.length >= 2) {
                            legendSeries.append("div").attr("class", "legend-color")
                                .style("background-color", function(d) {
                                    return colors(d.name);
                                });
                            legendSeries.append("div").attr("class", "legend-text")
                                .html(function(d) {
                                    return d.name;
                                });
                        }

                    }
                    if (scope.panel.legend) {
                        graphLegend(series_data, colors);
                    }
                }

            }

            function timestampFmt(ts) {
                if (typeof(ts) == "string") {
                    if (ts && !ts.substr(ts.length - 1, ts.length) == "Z") { // ie不支持endWith()方法
                        ts += "Z";
                    }
                    var date = new Date(ts);
                    return date;
                } else if (typeof(ts) == "number") {
                    return new Date(ts);
                } else {
                    return ts;
                }
            }

            var _width = "";
            resize().call(function() {
                scope.$watch(function() {
                    return scope.panel;
                }, function(panel) {

                    if (panel) {
                        elem.html("");
                        if (panel.data[0]) {
                            panel.data[0].values.forEach(function(d) {
                                d[0] = timestampFmt(d[0]);
                            });
                            _width = elem.width();
                            renderAreaFunc(elem.width(), panel);
                            scope.animated = true;
                        }
                    }
                });
                if (scope.panel) {
                    elem.html("");
                    if (scope.panel.data[0]) {
                        scope.panel.data[0].values.forEach(function(d) {
                            d[0] = timestampFmt(d[0]);
                        });
                        renderAreaFunc(elem.width() == "0" ? _width : elem.width(), scope.panel);
                    }
                }
            });
        }
    };
});

chartsModule.directive("quotaBar", function($timeout) {
    return {
        restrict: "A",
        replace: true,
        transclude: true,
        scope: {
            bardata: "="
        },
        template: function(elem) {
            if (elem[0].id == "insQuota") {
                return " <div>\
                            <div class=\"series-text\" title={{bardata.domainName}}>{{bardata.domainName}}</div>\
                            <uib-progressbar class=\"active\"  max=\"bardata.total\" value=\"used\" type=\"{{barTypeFunc((bardata.inUsed/bardata.total*100).toFixed(1))}}\" ></uib-progressbar>\
                            <div class=\"legend percent\">{{(bardata.inUsed/bardata.total*100).toFixed(1)}}%</div>\
                            <div class=\"legend quota\">\
                                <span class=\"value progress-bar-{{barTypeFunc((bardata.inUsed/bardata.total*100).toFixed(1))}}\" >{{bardata.inUsed}}</span> / <span>{{bardata.total}}</span>\
                            </div>\
                        </div>";
            } else if (elem[0].id == "tableQuota") {
                return " <div>\
                            <uib-progressbar class=\"active\"  max=\"bardata.total\" value=\"used\" type=\"{{barTypeFunc((bardata.inUsed/bardata.total*100).toFixed(1))}}\" ></uib-progressbar>\
                            <div class=\"legend quota\">\
                                <span class=\"value progress-bar-{{barTypeFunc((bardata.inUsed/bardata.total*100).toFixed(1))}}\" >{{bardata.inUsed}}</span> / <span>{{bardata.total}}</span>\
                            </div>\
                        </div>";
            } else if (elem[0].id == "onlyBar") {
                return " <div>\
                            <uib-progressbar class=\"active {{barTypeFunc((bardata.inUsed/bardata.total*100).toFixed(1))}} \"  max=\"bardata.total\" value=\"used\" type=\"{{barTypeFunc((bardata.inUsed/bardata.total*100).toFixed(1))}}\" ></uib-progressbar>\
                        </div>";
            } else if (elem[0].id == "storage") {
                // return " <div>\
                //             <div class=\"series-text\" title={{bardata.domainName}}>{{bardata.domainName}}</div>\
                //             <uib-progressbar class=\"active\"  max=\"bardata.total\" value=\"used\" type=\"{{barTypeFunc((bardata.inUsed/bardata.total*100).toFixed(1))}}\" ></uib-progressbar>\
                //             <div class=\"legend percent\">{{(bardata.inUsed/bardata.total*100).toFixed(1)}}%</div>\
                //             <div class=\"legend quota\">\
                //                 <span class=\"value progress-bar-{{barTypeFunc((bardata.inUsed/bardata.total*100).toFixed(1))}}\" >{{bardata.inUsedUnit}}</span> / <span>{{bardata.totalUnit}}</span>\
                //             </div>\
                //         </div>";

                return "<div>\
                            <div class=\"left\">{{bardata.domainName}}</div>\
                            <div class=\"legend quota right\">\
                                <span class=\"value progress-bar-{{barTypeFunc((bardata.inUsed/bardata.total*100).toFixed(1))}}\" >{{bardata.inUsedUnit}}</span> / <span>{{bardata.totalUnit}}</span>\
                            </div>\
                            <div class=\"legend percent right\">{{(bardata.inUsed/bardata.total*100).toFixed(1)}}%</div>\
                            <div class=\"progress active width\">\
                                <div class=\"progress-bar progress-bar-{{barTypeFunc((bardata.inUsed/bardata.total*100).toFixed(1))}} \" aria-valuenow=\"used\" aria-valuemin=\"0\" aria-valuemax=\"bardata.total\" ng-style=\"{width: (inUsepercent?(inUsepercent < 100 ? inUsepercent : 100):0) + \'%\'}\"></div>\
                            </div>\
                       </div>"

            } else if (elem[0].id == "setting") {
                return "<div>\
                            <div class=\"left\">{{bardata.title}}</div>\
                            <div class=\"right\">{{bardata.subtitle}}  <span class=\"value progress-bar-{{barTypeFunc(percent)}}\" >{{bardata.inUsed}}</span>/{{bardata.total}}</div>\
                            <div class=\"progress active width\">\
                                <div class=\"progress-bar progress-bar-{{barTypeFunc(percent)}} \" aria-valuenow=\"used\" aria-valuemin=\"0\" aria-valuemax=\"bardata.total\" ng-style=\"{width: (inUsepercent?(inUsepercent < 100 ? inUsepercent : 100):0) + \'%\'}\"></div>\
                                <div ng-if=\"bardata.beAdded\" class=\"progress-bar progress-bar-{{barTypeFunc(percent,'add')}} \" aria-valuenow=\"added\" title=\"已添加：{{bardata.beAdded}}\" aria-valuemin=\"0\" aria-valuemax=\"bardata.total\" ng-style=\"{width: (addpercent?(addpercent < 100 ? addpercent : 100):0) + \'%\'}\"></div>\
                            </div>\
                        </div>";
            } else if (elem[0].id == "plugin") {
                return " <div>\
                            <div class=\"series-text\">{{bardata.domainName}}</div>\
                            <uib-progressbar class=\"active\"  max=\"bardata.total\" value=\"used\" type=\"{{barTypePluginFunc((bardata.inUsed/bardata.total*100).toFixed(1))}}\" ></uib-progressbar>\
                            <div class=\"legend percent\">{{(bardata.inUsed/bardata.total*100).toFixed(1)}}%</div>\
                        </div>";
            } else {
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
        link: function(scope) {

            scope.$watch(function() {
                return scope.bardata;
            }, function(bardata) {
                if (bardata) {
                    scope.used = 0;
                    scope.added = 0;
                    var totalPercent = ((scope.bardata.inUsed + scope.bardata.beAdded) / scope.bardata.total * 100).toFixed(1);
                    scope.percent = totalPercent <= 100 ? totalPercent : 100;
                    scope.inUsepercent = (scope.bardata.inUsed / scope.bardata.total * 100).toFixed(1);
                    var beAdd_percent = (scope.bardata.beAdded / scope.bardata.total * 100).toFixed(1);
                    scope.addpercent = beAdd_percent <= 100 - scope.inUsepercent ? beAdd_percent : 100 - scope.inUsepercent;
                    $timeout(function() {
                        scope.used = scope.bardata.inUsed || 0;
                        scope.added = scope.bardata.beAdded || 0;
                    }, 300);
                }
            });
            scope.barTypePluginFunc = function(percent, type) {
                if (percent <= 30) {
                    return type ? "DarkgreenLight" : "green";
                } else if (percent > 30 && percent <= 70) {
                    return type ? "blueDark" : "blue";
                } else if (percent > 70) {
                    return type ? "blue" : "blueDark";
                }
            }
            scope.barTypeFunc = function(percent, type) {
                if (percent <= 30) {
                    return type ? "DarkgreenLight" : "green";
                } else if (percent > 30 && percent <= 50) {
                    return type ? "blueDark" : "blue";
                } else if (percent > 50 && percent <= 65) {
                    return type ? "blue" : "blueDark";
                } else if (percent > 65 && percent <= 75) {
                    return type ? "orangeDark" : "orange";
                } else if (percent > 75 && percent <= 85) {
                    return type ? "orange" : "orangeDark";
                } else if (percent > 85 && percent <= 95) {
                    return type ? "redDark" : "red";
                } else if (percent > 95) {
                    return type ? "red" : "redDark";
                }
            };
        }
    };
});
chartsModule.directive("uploadProgress", function($timeout) {
    return {
        restrict: "A",
        replace: true,
        transclude: true,
        scope: {
            bardata: "="
        },
        template: function(elem) {
            return "<div>\
                            <div class=\"left\">{{bardata.title}}</div>\
                            <div class=\"right\">{{\"aws.common.progress\"|translate}}  <span class=\"value progress-bar-{{barTypeFunc(percent)}}\" >{{(bardata.inUsed/bardata.total*100).toFixed(1)}}%</span></div>\
                            <div class=\"right rate\">{{\"aws.common.progressrate\"|translate}}  <span class=\"value progress-bar-{{barTypeFunc(percent)}}\" >{{rate}}</span></div>\
                            <div class=\"progress active width\">\
                                <div class=\"progress-bar progress-bar-{{barTypeFunc(percent)}} \" aria-valuenow=\"used\" aria-valuemin=\"0\" aria-valuemax=\"bardata.total\" ng-style=\"{width: (inUsepercent?(inUsepercent < 100 ? inUsepercent : 100):0) + \'%\'}\"></div>\
                                <div ng-if=\"bardata.beAdded\" class=\"progress-bar progress-bar-{{barTypeFunc(percent,'add')}} \" aria-valuenow=\"added\" title=\"{{\"aws.common.progressrate\"|translate}}：{{bardata.beAdded}}\" aria-valuemin=\"0\" aria-valuemax=\"bardata.total\" ng-style=\"{width: (addpercent?(addpercent < 100 ? addpercent : 100):0) + \'%\'}\"></div>\
                            </div>\
                        </div>";

        },
        link: function(scope) {

            scope.$watch(function() {
                return scope.bardata;
            }, function(bardata) {
                if (bardata) {
                    scope.used = 0;
                    scope.added = 0;
                    var totalPercent = ((scope.bardata.inUsed + scope.bardata.beAdded) / scope.bardata.total * 100).toFixed(1);
                    scope.percent = totalPercent <= 100 ? totalPercent : 100;
                    scope.inUsepercent = (scope.bardata.inUsed / scope.bardata.total * 100).toFixed(1);
                    var beAdd_percent = (scope.bardata.beAdded / scope.bardata.total * 100).toFixed(1);
                    scope.addpercent = beAdd_percent <= 100 - scope.inUsepercent ? beAdd_percent : 100 - scope.inUsepercent;
                    $timeout(function() {
                        scope.used = scope.bardata.inUsed || 0;
                        scope.added = scope.bardata.beAdded || 0;
                        scope.rate = scope.bardata.rate || 0;
                    }, 300);
                }
            });

            scope.barTypeFunc = function(percent, type) {
                return type ? "DarkgreenLight" : "green";
            };
        }
    };
});
chartsModule.directive("chartBar", function($timeout, $translate, resize) {
    return {
        restrict: "A",
        replace: true,
        transclude: true,
        scope: {
            bardata: "="
        },
        template: function(elem, attr) {
            if (attr.type == "basic") {
                return "<div>\
                        <div class=\"progress width pull\">\
                            <div class=\"progress-bar progress-bar-{{barTypeFunc(inUsepercent)}}\" aria-valuenow=\"used\" aria-valuemin=\"0\" aria-valuemax=\"1\" ng-style=\"{width: (inUsepercent?(inUsepercent < 100 ? inUsepercent : 100):0) + \'%\'}\"></div>\
                        </div>\
                        <div class=\"right\"><span class=\"value progress-bar-{{barTypeFunc(inUsepercent)}}\" >{{inUsepercent}}%</span></div>\
                    </div>";
            } else {
                return "<div>\
                        <div class=\"left\">{{bardata.name}}</div>\
                        <div class=\"right\" ng-if=\"bardata.type=='unit-adapt'\"><span class=\"value progress-bar-{{barTypeFunc(inUsepercent)}}\" >{{bardata.val_unit}}</span></div>\
                        <div class=\"right\" ng-if=\"bardata.type=='text'\"><span class=\"value progress-bar-{{barTypeFunc(inUsepercent)}}\" >{{bardata.inUsed}}{{bardata.unit}}</span>/{{bardata.total}}{{bardata.unit}}</div>\
                        <div class=\"right\" ng-if=\"bardata.type=='percent'\"><span class=\"value progress-bar-{{barTypeFunc(inUsepercent)}}\" >{{inUsepercent}}%</span></div>\
                        <div class=\"progress active width pull\">\
                            <div class=\"progress-bar progress-bar-{{barTypeFunc(inUsepercent)}}\" aria-valuenow=\"used\" aria-valuemin=\"0\" aria-valuemax=\"bardata.total\" ng-style=\"{width: (inUsepercent?(inUsepercent < 100 ? inUsepercent : 100):0) + \'%\'}\"></div>\
                        </div>\
                    </div>";
            }

        },
        link: function(scope, elem, attr) {
            scope.used = 0;
            scope.inUsepercent = 0;
            scope.$watch(function() {
                return scope.bardata;
            }, function(bardata) {
                if (bardata) {
                    let precision = bardata.precision || 1;
                    if (attr.type == "basic") {
                        $timeout(function() {
                            scope.used = Number(String(scope.bardata.data).split("%")[0]) / 100 || 0;
                            scope.inUsepercent = Number(String(scope.bardata.data).split("%")[0]) || 0;
                        }, 10);
                    } else {
                        $timeout(function() {
                            scope.used = scope.bardata.inUsed || 0;
                            scope.inUsepercent = scope.bardata.total > 0 ? (Number(scope.bardata.inUsed) / Number(scope.bardata.total) * 100).toFixed(precision) : 0 || 0;
                        }, 10);
                    }

                }
            });

            scope.barTypeFunc = function(percent) {
                if (scope.bardata.type == "unit-adapt") {
                    return "green";
                }
                if (percent <= 30) {
                    return "green";
                } else if (percent > 30 && percent <= 50) {
                    return "blue";
                } else if (percent > 50 && percent <= 65) {
                    return "blueDark";
                } else if (percent > 65 && percent <= 75) {
                    return "orange";
                } else if (percent > 75 && percent <= 85) {
                    return "orangeDark";
                } else if (percent > 85 && percent <= 95) {
                    return "red";
                } else if (percent > 95) {
                    return "redDark";
                } else {
                    return "default";
                }
            };

        }
    };
});
chartsModule.directive("progressVertical", function($timeout, $translate, resize) {
    return {
        restrict: "EA",
        scope: {
            chartData: "="
        },
        link: function(scope, elem) {
            function renserVertical(width, height) {
                var xkSet = scope.chartData.name;
                var xkSetCopy = scope.chartData.name;
                var dataset = scope.chartData.value;
                var colors = scope.chartData.color;
                var width = width;
                var height = height;
                var max = d3.max(dataset);
                var floor = 0;
                var tickValues = [];
                var reg = /[A-Z]|[\u4E00-\u9FA5]/;
                var tooltip = d3.select(elem[0])
                    .append("div")
                    .attr("class", "tooltip")
                    .style("display", "none");
                //适配横坐标名称过长
                xkSet = xkSet.map(item => {
                    var realLength = 0;
                    var itemArray = item.split("");
                    for (var i = 0; i < itemArray.length; i++) {
                        if (realLength > 10) {
                            return realLength > 10 ? item.substring(0, i) + "..." : item;
                        }
                        if (!reg.test(itemArray[i]))
                            realLength += 1;
                        else
                            realLength += 2;
                    }
                    return item;

                })
                max ? floor = Math.ceil(max / 5) : floor = 1
                tickValues = [0, floor, floor * 2, floor * 3, floor * 4, floor * 5];
                //在 body 里添加一个 SVG 画布   
                var svg = d3.select(elem[0])
                    .append("svg")
                    .attr("width", width)
                    .attr("height", height);

                //画布周边的空白
                var padding = { left: 60, right: 30, top: 15, bottom: 20 };
                //定义一个数组 
                //x轴的比例尺
                var xScale = d3.scale.ordinal()
                    .domain(d3.range(dataset.length))
                    .rangeRoundBands([0, width - padding.left - padding.right]);

                //y轴的比例尺
                var yScale = d3.scale.linear()
                    //.domain([0,100]) 设置y轴最大刻度
                    .domain([0, tickValues[5]])
                    .range([height - padding.top - padding.bottom, 0]);

                //定义x轴
                var xAxis = d3.svg.axis()
                    .scale(xScale)
                    .orient("bottom")
                    .tickFormat(function(d) {
                        return xkSet[d]; });
                //定义y轴
                var yAxis = d3.svg.axis()
                    .scale(yScale)
                    //.ticks([5])
                    .orient("left")
                    .tickValues(tickValues); //自定义y轴刻度

                //矩形之间的空白
                var rectPadding = (width - 150) / 12;

                //定义纵轴网格线 
                var yInner = d3.svg.axis()
                    .scale(yScale)
                    .tickSize(-(width - rectPadding * 2), 0, 0)
                    .tickFormat("")
                    .orient("left")
                    .tickValues(tickValues);
                //.ticks(6); 
                //添加纵轴网格线 
                var yBar = svg.append("g")
                    .attr("class", "inner_line")
                    .attr("transform", "translate(" + (padding.left) + ",15)")
                    .call(yInner);


                //添加矩形元素
                var rects = svg.selectAll(".MyRect")
                    .data(dataset)
                    .enter()
                    .append("rect")
                    .attr("class", "MyRect")
                    .attr("transform", "translate(" + padding.left + "," + padding.top + ")")
                    .attr("x", function(d, i) {
                        return xScale(i) + rectPadding / 2; //xScale(i)第i个柱状行的起点到第一个柱状形的起点的距离
                    })
                    .attr("y", function(d) {
                        return yScale(0);
                    })
                    .attr("width", xScale.rangeBand() - rectPadding * 2) //xScale.rangeBand()后一个柱状行到前一个柱状行的距离
                    .attr("height", function(d) {
                        return 0;
                    })
                    .on("mouseover", function(d, i) {
                        d3.select(this)
                            .attr("fill", colors[1]);
                        tooltip
                            .html(xkSetCopy[i] + "\t:\t" + dataset[i])
                            .style("left", (d3.event.pageX - elem.offset().left + 20) + "px")
                            .style("top", (d3.event.pageY - elem.offset().top + 120) + "px")
                            .style("display", "block");
                    })
                    .on("mouseout", function(d, i) {
                        d3.select(this)
                            .transition()
                            .duration(500)
                            .attr("fill", colors[0]);
                        tooltip.style("display", "none");
                    })
                    .on("mousemove", function() {
                        tooltip.style("left", (d3.event.pageX - elem.offset().left + 20) + "px")
                            .style("top", (d3.event.pageY - elem.offset().top + 120) + "px");
                    })

                .attr("fill", colors[0]) //填充颜色不要写在CSS里
                    .transition()
                    .delay(function(d, i) {
                        return i * 100;
                    })
                    .duration(1000)
                    .ease("linear") //设定过渡样式


                .attr("y", function(d) {
                        return yScale(d);
                    })
                    .attr("height", function(d) {
                        return height - padding.top - padding.bottom - yScale(d);
                    });

                //添加文字元素
                var texts = svg.selectAll(".MyText")
                    .data(dataset)
                    .enter()
                    .append("text")
                    .attr("class", "MyText")
                    .attr("transform", "translate(" + padding.left + "," + padding.top + ")")
                    .attr("x", function(d, i) {
                        return xScale(i) + 1;
                    })
                    .attr("y", function(d) {
                        return yScale(0) - 22;
                    })
                    .attr("dx", function() {
                        return (xScale.rangeBand() - rectPadding) / 2;
                    })
                    .attr("dy", function(d) {
                        return 20;
                    })
                    .text(function(d) {
                        return d;
                    })

                .transition()
                    .delay(function(d, i) {
                        return i * 100;
                    })
                    .duration(1000)
                    .ease("linear")
                    .attr("y", function(d) {
                        return yScale(d) - 22;
                    });

                //添加x轴
                svg.append("g")
                    .attr("class", "axis")
                    .attr("transform", "translate(" + (padding.left - rectPadding / 2) + "," + (height - padding.bottom) + ")")
                    .call(xAxis);

                //添加y轴
                svg.append("g")
                    .attr("class", "axis")
                    .attr("transform", "translate(" + (padding.left - 5) + "," + padding.top + ")")
                    .call(yAxis);


            }


            resize().call(function() {
                scope.$watch(function() {
                    return scope.chartData;
                }, function(panel) {
                    if (panel && panel.name.length) {
                        elem.html("");
                        renserVertical(elem.parent().width(), elem.parent().height());
                    }
                }, 5000);
                elem.html("");
                if (scope.chartData && elem.parent().width()) {
                    renserVertical(elem.parent().width(), elem.parent().height());
                }
            });

        }


    };
});

chartsModule.directive("echartMultiline", ["lineCache", function (lineCache){
    return {
        restrict: "A",
        replace: false,
        scope: {
            data: "=",
        },
        link: function (scope, element) {
            scope.$watch("data", function (val) {
                if (val) {
                    var chartData = scope.data;
                    var gridRight = '4%';
                    if(chartData.legend.show && chartData.legend.orient == 'vertical') {
                        gridRight = 100;
                    }
                    scope.xAxisData = [];
                    scope.yAxisData = [];
                    if (scope.xAxisData.length == 0 || scope.yAxisData.length == 0) {
                        scope.xAxisData = [0,0,0,0,0];
                        scope.yAxisData = [0,0,0,0,0];
                    }
                    lineCache[chartData.title] = echarts.init(element[0]);
                    lineCache[chartData.title].clear();
                    var option = {
                        color: chartData.color.length>0?chartData.color:new echartsColorlDefault().colors.line,
                        title: {
                            text: chartData.title,
                            left: 10,
                            textStyle:{
                                color:"#666666",
                                fontSize:14,
                                fontWeight:400
                            }
                        },
                        tooltip: {
                            trigger: 'axis'
                        },
                        toolbox: {
                            show: chartData.toolboxShow,
                            right: 30,
                            feature: {
                                magicType: {show: true, type: ['line', 'bar']},
                                saveAsImage : {show: true}
                            }
                        },
                        legend: {
                            show: chartData.legend.show,
                            icon: 'rect', //设置图例的图形形状，circle为圆，rect为矩形
                            itemWidth: 25, //图例标记的图形宽度[ default: 25 ]
                            itemHeight: 7, //图例标记的图形高度。[ default: 14 ]
                            orient: chartData.legend.orient,
                            top: chartData.legend.top,
                            left: chartData.legend.left,
                            right: chartData.legend.right
                        },
                        grid: {
                            left: '5%',
                            top:chartData.title!=''?"15%":"10%",
                            right: gridRight,
                            bottom: '9%',
                            containLabel: true
                        },
                        xAxis: {
                            type: 'category',
                            boundaryGap: false,
                            data: chartData.xAxis,
                            axisLine: {
                                lineStyle: {
                                    color: '#7991ab'
                                 }
                            },
                        },
                        yAxis: {
                            type : 'value',
                            axisLine: {
                                show: false,
                            },
                            axisTick: {
                                show: false
                            },
                            boundaryGap: ['0%', '20%'],
                            axisLabel: {
                                color: '#7991ab',
                                formatter: function (val) {
                                    return val + chartData.unit;
                                }
                            }
                        },
                        series:chartData.series
                    };
                    lineCache[chartData.title].setOption(option);
                }
            },true);
            window.onresize = function () {
                for (let key in lineCache) {
                    lineCache[key].resize("auto", "auto");
                    scope.$apply();
                }
            };
        }
    }
}]).value("lineCache", {});

chartsModule.directive("echartsLine", ["monitorCache", function (monitorCache){
    return {
        restrict: "A",
        replace: false,
        scope: {
            data: "=",
            chartTitle: "=",
            click: "&"
        },
        template: "<div class='echarts-noData' ng-if='data.series.length == 0 || data.xAxis.length == 0'>{{'aws.common.noData'|translate}}</div>",
        link: function (scope, element, attr) {
            scope.$watch("data", function (val) {
                if (val) {
                    if(!scope.data.series || !scope.data.series.length || !scope.data.xAxis.length) {

                        return;
                    }
                    var gridRight = '4%';
                    if(scope.data.legend.show && scope.data.legend.orient == 'vertical') {
                        gridRight = 100;
                    }
                    var gridBottom = scope.data.gridBottom || '15%';
                    monitorCache[scope.chartTitle] = echarts.init(element[0]);
                    monitorCache[scope.chartTitle].clear();
                    var option = {
                        color: new echartsColorlDefault().colors.line,
                        title: {
                            text: scope.chartTitle,
                            left: 10,
                            textStyle:{
                                color:"#666666",
                                fontSize:14,
                                fontWeight:400
                            }
                        },
                        tooltip: {
                            trigger: 'axis',
                            formatter:function(params) {
                                var unit = scope.data.unit || "";
                                var relVal = params[0].name;
                                for (var i = 0, l = params.length; i < l; i++) { 
                                    relVal += '<br/>' + params[i].seriesName + ' : ' + params[i].value + ' ' + unit;
                                }
                                return relVal;
                            }
                        },
                        toolbox: {
                            show: scope.data.toolboxShow,
                            right: 30,
                            feature: {
                                magicType: {show: true, type: ['line', 'bar']},
                                saveAsImage : {show: true}
                            }
                        },
                        legend: {
                            type: scope.data.legend.type||'plain',
                            show: scope.data.legend.show,
                            icon: 'rect', //设置图例的图形形状，circle为圆，rect为矩形
                            itemWidth: 25, //图例标记的图形宽度[ default: 25 ]
                            itemHeight: 7, //图例标记的图形高度。[ default: 14 ]
                            orient: scope.data.legend.orient,
                            top: scope.data.legend.top,
                            left: scope.data.legend.left,
                            right: scope.data.legend.right
                        },
                        grid: {
                            left: '5%',
                            right: gridRight,
                            bottom: gridBottom,
                            containLabel: true,
                        },
                        xAxis: {
                            type: 'category',
                            boundaryGap: false,
                            data: scope.data.xAxis,
                            axisLine: {
                                lineStyle: {
                                    color: '#7991ab'
                                 }
                            },
                            axisLabel: {
                                formatter: function (value, index) {
                                    var date = value;
                                    if(scope.data&&scope.data.dateType == "day") {
                                        date = moment(value).format('MM-DD');
                                    }
                                    return date;
                                }
                            }
                        },
                        yAxis: {
                            type : 'value',
                            axisLine: {
                                show: false,
                            },
                            axisTick: {
                                show: false
                            },
                            axisLabel: {
                                color: '#7991ab'
                            },
                            axisLabel: {
                                color: '#7991ab',
                                formatter: function (value, index) {
                                    var unit = scope.data?scope.data.unit:"";
                                    return value + " " + unit;
                                }
                            }
                        },
                        series:scope.data.series
                    };
                    monitorCache[scope.chartTitle].setOption(option);
                    if(attr.click) {
                       monitorCache[scope.chartTitle].on("click", scope.click);
                    }
                }
            },true);
            window.onresize = function () {
                for (let key in monitorCache) {
                    monitorCache[key].resize("auto", "auto");
                    scope.$apply();
                }
            };
        }
    }
}]).value("monitorCache", {});

chartsModule.directive("echartsLinePhy", ["echartPhyCache", "$translate", function (echartPhyCache, $translate){
    return {
        restrict: "A",
        replace: false,
        scope: {
            data: "=",
            chartTitle: "@",
            timeType: "=",
            unit: "="
        },
        template: "<div class='echarts-noData'>{{chartTitle}}{{'aws.common.noData'|translate}}</div>",
        link: function (scope, element) {
            scope.$watch("data", function (val) {
                if (val) {
                    var chartData = hanleChartData(scope.data);
                    if(!chartData.series.length) {
                        return;
                    }
                    var gridTop = "5%";
                    if(scope.chartTitle != "") {
                        gridTop = "15%";
                    }
                    echartPhyCache[element[0].id] = echarts.init(element[0]);
                    echartPhyCache[element[0].id].clear();
                    var option = {
                        color: new echartsColorlDefault().colors.line,
                        title: {
                            text: scope.chartTitle,
                            left: 30,
                            textStyle:{
                                color:"#666666",
                                fontSize:14,
                                fontWeight:400
                            }
                        },
                        tooltip: {
                            trigger: 'axis',
                            formatter:function(params) {
                                var unit = scope.unit == "percent" ? "%" : scope.unit;
                                var relVal = params[0].name;
                                for (var i = 0, l = params.length; i < l; i++) { 
                                    relVal += '<br/>' + params[i].seriesName + ' : ' + params[i].value + ' ' + unit;
                                }
                                return relVal;
                            }
                        },
                        toolbox: {
                            show: false,
                            right: 30,
                            feature: {
                                magicType: {show: true, type: ['line', 'bar']},
                                saveAsImage : {show: true}
                            }
                        },
                        legend: {
                            show: true,
                            icon: 'rect', //设置图例的图形形状，circle为圆，rect为矩形
                            itemWidth: 25, //图例标记的图形宽度[ default: 25 ]
                            itemHeight: 7, //图例标记的图形高度。[ default: 14 ]
                            top: "bottom",
                            left: 50,
                        },
                        grid: {
                            left: '5%',
                            right: '7%',
                            top: gridTop,
                            bottom: '9%',
                            containLabel: true
                        },
                        xAxis: {
                            type: 'category',
                            boundaryGap: false,
                            data: chartData.xAxis,
                            axisLine: {
                                lineStyle: {
                                    color: '#7991ab'
                                 }
                            },
                            axisLabel: {
                                formatter: function (value, index) {
                                    var date = moment(value).format('HH:mm');
                                    if(scope.timeType != "") {
                                        date = moment(value).format('MM-DD HH:mm');
                                    }
                                    return date;
                                }
                            }
                        },
                        yAxis: {
                            type : 'value',
                            axisLine: {
                                show: false,
                            },
                            axisTick: {
                                show: false
                            },
                            axisLabel: {
                                color: '#7991ab',
                                formatter: function (value, index) {
                                    var unit = scope.unit == "percent" ? "%" : scope.unit;
                                    return value + " " + unit;
                                }
                            }
                        },
                        series:chartData.series
                    };
                    echartPhyCache[element[0].id].setOption(option);
                }
            },true);

            function hanleChartData(data) {
                var chartData = data[0];
                var xAxis = [];
                var series = [];
                if (chartData.default || (!chartData.default && chartData.values.length < 1)) {
                    return {
                        xAxis: xAxis,
                        series: series
                    };
                }
                for(var i = 1; i < chartData.columns.length; i++) {
                    var centername = $translate.instant('aws.monitor.' + chartData.columns[i]);
                    var seriesItem = {
                        name :centername,
                        type:'line',
                        data:[]
                    }
                    xAxis = [];
                    for(var j = 0; j < chartData.values.length; j++) {
                        var columnsItem = chartData.values[j];
                        var timeDate = moment(columnsItem[0]).format('YYYY-MM-DD HH:mm:ss');
                        xAxis.push(timeDate);
                        seriesItem.data.push(columnsItem[i]?columnsItem[i].toFixed(2):0);
                    }
                    series.push(seriesItem)
                }
                return {
                    xAxis: xAxis,
                    series: series
                };
            }
            window.onresize = function () {
                for (let key in echartPhyCache) {
                    echartPhyCache[key].resize("auto", "auto");
                    scope.$apply();
                }
            };
        }
    }
}]).value("echartPhyCache", {});

chartsModule.directive("echartsBar", ["echartBarCache", function (echartBarCache){
    return {
        restrict: "A",
        replace: false,
        scope: {
            data: "=",
            chartTitle: "="
        },
        link: function (scope, element, attr) {
            scope.$watch("data", function (val) {
                if (val) {
                    echartBarCache[scope.chartTitle] = echarts.init(element[0]);
                    echartBarCache[scope.chartTitle].clear();
                    var option = {
                        color: new echartsColorlDefault().colors.bar,
                        title: {
                            text: scope.chartTitle,
                            left: 10,
                            textStyle:{
                                color:"#666666",
                                fontSize:14,
                                fontWeight:400
                            }
                        },
                        tooltip: {
                            trigger: 'axis'
                        },
                        legend: {
                            show: false
                        },
                        grid: {
                            left: '3%',
                            right: '4%',
                            bottom: '9%',
                            containLabel: true
                        },
                        xAxis: {
                            type: 'category',
                            data: scope.data.xAxis,
                            axisTick: {
                                alignWithLabel: true
                            },
                            axisLine: {
                                lineStyle: {
                                    color: '#7991ab'
                                 }
                            },
                        },
                        yAxis: {
                            type : 'value',
                            axisLine: {
                                show: false,
                            },
                            axisTick: {
                                show: false
                            },
                            axisLabel: {
                                color: '#7991ab'
                            }
                        },
                        series:scope.data.series
                    };
                    echartBarCache[scope.chartTitle].setOption(option);
                }
            },true);
            window.onresize = function () {
                for (let key in echartBarCache) {
                    echartBarCache[key].resize("auto", "auto");
                    scope.$apply();
                }
            };
        }
    }
}]).value("echartBarCache", {});