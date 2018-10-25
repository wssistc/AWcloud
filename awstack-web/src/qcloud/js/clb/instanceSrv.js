/**
 * Created by Weike on 2017/1/20.
 */
angular.module("clbInstanceSrvModule", [])
    // Controller之间共用的http方法：
    .service("clbInstanceSrv", function ($rootScope, $http) {
        var requestUrl = window.GLOBALCONFIG.APIHOST.QCLOUD + "/v1";

        return {
            // postData = {"params": {"Region": "bj", "loadBalancerType": 2}}
            getLBInstancersList: function (postData) {
                postData["params"]["all"] = "True";
                return $http({
                    method: "POST",
                    url: requestUrl + "/lbs/list",
                    data: postData
                });
            },

            buyLBInstancer: function (postData) {
                return $http({
                    method: "POST",
                    url: requestUrl + "/lbs/create",
                    data: postData
                });
            },

            // postData = {"params": {"Region": "bj"}}
            getVpcList: function (postData) {
                postData["params"]["all"] = "True";
                return $http({
                    method: "POST",
                    url: requestUrl + "/vpc/list",
                    data: postData
                });
            },

            // postData = {"params": {"loadBalancerType": 2}}
            getPrice: function (postData) {
                return $http({
                    method: "POST",
                    url: requestUrl + "/lbs/getprice",
                    data: postData
                });
            },

            // postData = {"params": {"Region": "bj"}}
            getProjects: function (postData) {
                return $http({
                    method: "POST",
                    url: requestUrl + "/lbs/listprojects",
                    data: postData
                });
            },

            // postData = {"params": {"Region": "bj", "loadBalancerName": "newLoadBalancerName", "domainPrefix": "newDomainPrefix"}}
            modifyLBInstancer: function (postData) {
                return $http({
                    method: "POST",
                    url: requestUrl + "/lbs/modifyattr",
                    data: postData
                });
            },

            // postData: {"params": {"Region": "bj", "loadBalancerIds.1": "xxxx", "loadBalancerIds.2": "yyyy"}}
            deleteLBInstancers: function (postData) {
                return $http({
                    method: "POST",
                    url: requestUrl + "/lbs/delete",
                    data: postData
                });
            },

            // postData = {"params": {"loadBalancerId": "lb-8hl3pvql"}}
            getLBListeners: function (postData) {
                return $http({
                    method: "POST",
                    url: requestUrl + "/lbs/listlisteners",
                    data: postData
                });
            },

            deleteLBListeners: function (postData) {
                return $http({
                    method: "POST",
                    url: requestUrl + "/lbs/deletelisteners",
                    data: postData
                });
            },

            getLBBindingServers: function (postData) {
                return $http({
                    method: "POST",
                    url: requestUrl + "/lbs/listbindingservers",
                    data: postData
                });
            },

            createLBListener: function (postData) {
                return $http({
                    method: "POST",
                    url: requestUrl + "/lbs/createlistener",
                    data: postData
                });
            },

            modifyLBListener: function (postData) {
                return $http({
                    method: "POST",
                    url: requestUrl + "/lbs/modifylistenerattr",
                    data: postData
                });
            },

            modifyLBServerWeight: function (postData) {
                return $http({
                    method: "POST",
                    url: requestUrl + "/lbs/modifyserversweigh",
                    data: postData
                });
            },

            bindLBServers: function (postData) {
                return $http({
                    method: "POST",
                    url: requestUrl + "/lbs/bindservers",
                    data: postData
                });
            },

            getAvaliableServers: function (postData) {
                return $http({
                    method: "POST",
                    url: requestUrl + "/lbs/listavaliableservers",
                    data: postData
                });
            },

            getBindingServers: function (postData) {
                return $http({
                    method: "POST",
                    url: requestUrl + "/lbs/listbindingservers",
                    data: postData
                });
            },

            unbindLBServers: function (postData) {
                return $http({
                    method: "POST",
                    url: requestUrl + "/lbs/unbindservers",
                    data: postData
                });
            },

            getHealthStatus: function (postData) {
                return $http({
                    method: "POST",
                    url: requestUrl + "/lbs/gethealthstatus",
                    data: postData
                });
            }
        };
    })
    // Controller之间共用的函数：
    .service("utilSrv", function ($rootScope, sharedValueSrv) {
        return {
            getCheckoutOptionContents: function (timeOut, intervalTime, unhealthNum, healthNum) {
                var checkoutOptionObjs = [
                    {key: "timeOut", value: timeOut, unit: "秒"},
                    {key: "intervalTime", value: intervalTime, unit: "秒"},
                    {key: "unhealthNum", value: unhealthNum, unit: "次"},
                    {key: "healthNum", value: healthNum, unit: "次"}
                ];
                var checkoutOptionContents = [];
                for (var i = 0; i < checkoutOptionObjs.length; i++) {
                    var checkouOptionObj = checkoutOptionObjs[i];
                    if (checkouOptionObj.value > 0) {
                        checkoutOptionContents.push(
                            sharedValueSrv.listenerCheckOptions[checkouOptionObj.key] + "： " +
                            checkouOptionObj.value + "（" + checkouOptionObj.unit + "）"
                        );
                    }
                }
                return checkoutOptionContents;
            },

            // 把11这样的整数转成数组["http_1xx", "http_2xx", "http_4xx"]
            getHTTPCodeContents: function (httpCode) {
                var httpCodeinBin = (httpCode).toString(2);
                var httpCodeLen = httpCodeinBin.length;
                var httpCodeContents = [];
                for (var i = 0; i < httpCodeLen; i++) {
                    var code = parseInt(httpCodeinBin[i]);
                    if (code === 1) {
                        httpCodeContents.unshift(
                            sharedValueSrv.listenerHTTPCodes[Math.pow(2, httpCodeLen - 1 - i)]
                        );
                    }
                }
                return httpCodeContents;
            }
        }
    })
    // Controller之间共用的变量：
    .service("sharedValueSrv", function () {
        return {
            regionsList: [{
                name: "广州",
                code: "gz"
            }, {
                name: "上海",
                code: "sh"
            }, {
                name: "北京",
                code: "bj"
            }],
            // }, {
            //     name: "东南亚地区(香港)",
            //     code: "hk"
            // }, {
            //     name: "东南亚地区(新加坡)",
            //     code: "sg"
            // }, {
            //     name: "北美地区(多伦多)",
            //     code: "ca"
            // }],

            projectsList: null,
            currentProject: null,
            currentProjectId: null,

            // 默认处于活动状态的tabid
            activeTabId: null,

            // 当前地域中的LB对象：{data: [], region: 'bj'}
            loadBalancers: null,
            // 当前LB的LBL对象：{data: [], loadBalancerId: 'lb-1wog6c8d'}。
            lbListeners: null,
            // 当前LB的LBB对象：{data: [], loadBalancerId: 'lb-1wog6c8d'}。
            lbBindingServers: null,
            // 当前LB绑定的云主机的状态：{data: [], loadBalancerId: 'lb-1wog6c8d'}
            lbHealthStatuses: null,

            lbHealthStatusesMap: {
                "-1": "探测目标不完整",
                "0": "异常",
                "1": "健康"
            },

            // 参考文档：https://www.qcloud.com/document/api/214/1260
            loadBalancerTypes: {
                1: "公网无固定IP",
                2: "公网固定IP",
                3: "内网"
            },

            loadBalancerStatuses: {
                0: "创建中",
                1: "正常"
            },

            listenerProtocols: {
                1: "HTTP",
                2: "TCP",
                3: "UDP"
            },

            listenerHttpHash: {
                "wrr": "按权重轮询",
                "ip_hash": "源IP哈希算法"
            },

            listenerStatuses: {
                0: "创建中",
                1: "运行中"
            },

            listenerHealthSwitch: {
                0: "未开启",
                1: "已开启"
            },

            listenerHealthCheckTypes: {
                1: "HTTP请求",
                2: "SYN包",
                3: "PING包"
            },

            listenerHTTPCodes: {
                1: "http_1xx",
                2: "http_2xx",
                4: "http_3xx",
                8: "http_4xx",
                16: "http_5xx"
            },

            listenerCheckOptions: {
                timeOut: "响应超时",
                intervalTime: "检查间隔",
                unhealthNum: "不健康阈值",
                healthNum: "健康阈值"
            },

            lbServerStatus: {
                1: "故障",
                2: "运行中",
                3: "创建中",
                4: "已关机",
                5: "已退还",
                6: "退还中",
                7: "重启中",
                8: "开机中",
                9: "关机中",
                10: "密码重置中",
                11: "格式化中",
                12: "镜像制作中",
                13: "带宽设置中",
                14: "重装系统中",
                15: "域名绑定中",
                16: "域名解绑中",
                17: "负载均衡绑定中",
                18: "负载均衡解绑中",
                19: "升级中",
                20: "秘钥下发中",
                21: "维护中(不能对实例进行操作但不影响正常运行)"
            }
        }
    });
