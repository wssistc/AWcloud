import "./operatelogSrv";

var operatelogModule = angular.module("operatelogModule", ["operatelogSrv"]);
operatelogModule.controller("operatelogCtrl", ["$scope", "operatelogSrv", "$translate", "$http", "$location",
    function($scope, operatelogSrv, $translate, $http, $location) {
        var self = $scope;

        function initFilterForm() {
            return self.filterData = {
                pageNum: "1",
                pageSize: "10",
                keyWord: "",
                from: "",
                to: "",
                remoteIp: "",
                logLevel: ""
            };
        }
        initFilterForm();

        function formatPerams(filterData) {
            var permas = angular.copy(filterData);
            if (filterData.from) {
                permas.from = permas.from + " 00:00:00";
            }
            if (filterData.to) {
                permas.to = permas.to + " 00:00:00";
            }
            return permas;
        }

        function init_dateTimepicker() {
            $(".form_date").datetimepicker({
                language: "zh-CN",
                weekStart: 1,
                todayBtn: 1,
                autoclose: 1,
                todayHighlight: 1,
                //startView: 2,
                minView: "month",
                //minuteStep:5,
                forceParse: 0,
                format: "yyyy-mm-dd",
                pickerPosition: "bottom-left"
            });
        }
        init_dateTimepicker();

        function init_data(result) {
            self.logsTable = _.map(result.data, function(item) {
                var itemResCode = item.responseCode.split("#"); //多数据中心responseCode
                if (itemResCode.length > 1) {
                    itemResCode = itemResCode.slice(1, itemResCode.length - 1)
                }
                item.state = itemResCode;
                //item.state = $translate.instant("aws.statusCode." + item.responseCode);
                item.createTime = new Date(item.createTime);
                return item;
            });
            var e = $("#pageNum")[0];
            if (result.total && self.filterData.pageSize) {
                self.pages = Math.ceil(result.total / self.filterData.pageSize);
                self.showPage = true;
                setPage(e, self.pages, self.filterData.pageNum);
            } else {
                self.showPage = false;
            }
        }

        function setPage(container, count, pageindex) { //总页数少于10 全部显示,大于10 显示前3 后3 中间3 其余....
            var a = [];

            if (pageindex == 1) {
                a[a.length] = "<li><a href=\"#\" class=\"prev unclick\"><i class=\"icon-aw-angle-double-left\"></i></a></li>";
            } else {
                a[a.length] = "<li><a href=\"#\" class=\"prev\"><i class=\"icon-aw-angle-double-left\"></i></a></li>";
            }

            function setPageList() {
                if (pageindex == i) {
                    a[a.length] = "<li><a href=\"#\" class=\"on\">" + i + "</a></li>";
                } else {
                    a[a.length] = "<li><a href=\"#\">" + i + "</a></li>";
                }
            }

            if (count <= 10) { //总页数小于10
                for (var i = 1; i <= count; i++) {
                    setPageList();
                }
            } else { //总页数大于10页
                if (pageindex <= 4) {
                    for (var i = 1; i <= 5; i++) {
                        setPageList();
                    }
                    a[a.length] = "<li><span>...</span></li><li><a href=\"#\">" + count + "</a></li>";
                } else if (pageindex >= count - 3) {
                    a[a.length] = "<li><a href=\"#\">1</a></li><li><span>...</span></li>";
                    for (var i = count - 4; i <= count; i++) {
                        setPageList();
                    }
                } else { //当前页在中间部分
                    a[a.length] = "<li><a href=\"#\">1</a></li><li><span>...</span></li>";
                    for (var i = pageindex - 2; i <= pageindex + 2; i++) {
                        setPageList();
                    }
                    a[a.length] = "<li><span>...</span></li><li><a href=\"#\">" + count + "</a></li>";
                }
            }
            if (pageindex == count) {
                a[a.length] = "<li><a href=\"#\" class=\"next unclick\"><i class=\"icon-aw-angle-double-right\"></i></a></li>";
            } else {
                a[a.length] = "<li><a href=\"#\" class=\"next\"><i class=\"icon-aw-angle-double-right\"></i></a></li>";
            }
            container.innerHTML = a.join("");

            (function pageClick() { //事件点击
                var oAlink = container.getElementsByTagName("a");
                var inx = pageindex; //初始的页码
                var clickPageFunc = function(inx) {
                    self.filterData.pageNum = inx;
                    setPage(container, count, inx);
                    self.clickPageToquery = function() {
                        initLogsTable(formatPerams(self.filterData));
                    }();
                };
                oAlink[0].onclick = function() { //点击上一页
                    if (inx == 1) {
                        return false;
                    }
                    inx--;
                    clickPageFunc(inx);
                    return false;
                };
                for (var i = 1; i < oAlink.length - 1; i++) { //点击页码
                    oAlink[i].onclick = function() {
                        inx = parseInt(this.innerHTML);
                        clickPageFunc(inx);
                        return false;
                    };
                }
                oAlink[oAlink.length - 1].onclick = function() { //点击下一页
                    if (inx == count) {
                        return false;
                    }
                    inx++;
                    clickPageFunc(inx);
                    return false;
                };
            })();
        }

        function initLogsTable(params) {
            self.loadData = false;
            self.logsTable = [];
            var getlogsData = function() {
                operatelogSrv.getoperateLogsData(params).then(function(result) {
                    result ? self.loadData = true : false;
                    if (result && result.data) {
                        init_data(result);
                    }
                });
            };
                getlogsData();
            
        }
        initLogsTable(formatPerams(self.filterData));

        self.queryFun = function(type) {
            if (type == "refresh") {
                initFilterForm();
            }
            if (type == "form") {
            	 if (!self.logFilter_form.$valid) {
            	 	return ;
            	 }
                self.filterData.pageNum = "1";
            }
            initLogsTable(formatPerams(self.filterData));
        };

        self.goToPage = function(num) {
            self.filterData.pageNum = num;
            initLogsTable(formatPerams(self.filterData));
        };

        self.exportlogs = function(filterData, page) {
            console.log(filterData)
            var urlPermas = angular.copy(filterData);
            if (page == "all") {
                urlPermas.pageSize = "";
            }
            $("#export" + page).removeAttr("href");
            /*$("#export"+page).attr("href",GLOBALCONFIG.APIHOST.LOG + "/v1/enterprises/"+ localStorage.enterpriseUid + "/logs/sqls/export?"
                +"pageNum="+urlPermas.pageNum+"&"
                +"pageSize="+urlPermas.pageSize+"&"
                +"from="+urlPermas.from+"&"
                +"to="+urlPermas.to+"&"
                +"keyWord="+encodeURI(urlPermas.keyWord)); */

            $http({
                method: "POST",
                url: GLOBALCONFIG.APIHOST.LOG + "/v1/enterprises/" + localStorage.enterpriseUid + "/logs/export/url",
                data:{
                    url:GLOBALCONFIG.APIHOST.LOG + "/v1/enterprises/"+ localStorage.enterpriseUid + "/logs/sqls/export?"
                        +"pageNum="+urlPermas.pageNum+"&"
                        +"pageSize="+urlPermas.pageSize+"&"
                        +"from="+urlPermas.from+"&"
                        +"to="+urlPermas.to+"&"
                        +"keyWord="+encodeURI(urlPermas.keyWord)+"&"
                        +"remoteIp="+urlPermas.remoteIp+"&"
                        +"logLevel="+encodeURI(urlPermas.logLevel)+"&"
                        +"responseCode="
                }
            }).then(function(res) {
                if (res.data) {
                    var link = document.createElement('a');
                    link.setAttribute('href', res.data);
                    var event = document.createEvent('MouseEvents');
                    event.initMouseEvent('click', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
                    link.dispatchEvent(event);
                }
            })

        };
    }
]);