exports.PiePanelDefault = function() {
    this.panels = {
        colors: ["#51a3ff", "#4e80f5", "#1bbc9d", "#b6a2dd", "#e67f23", "#c0392b", "#ff754a", "#f39c12", "#b675de"],
        type: "pie",
        width: 200,
        height: 200,
        outerRadius: 75,
        innerRadius: 50,
        data: [],
        title: "",
        id: "",
        pieType: "",
        progressRate: true
    };
};
exports.AreaPanelDefault = function() {
    this.panels = {
        colors: ["#4e80f5", "#1bbc9d", "#b6a2dd", "#e67f23"],
        type: "area",
        width: 550,
        height: 220,
        margin: {
            left: 60,
            right: 15,
            top: 15,
            bottom: 30
        },
        unit: "",
        data: [],
        title: "",
        subTitle: "",
        priority: ""
    };
};
exports.monitorViewChartDefault = function(enterpriseUid) {
    this.chartSqls = {
        cpu: [{
            sqlPerm: {
                "sql": "select max(value) as region1 from quota where time > now() - 30d and enterprise_uid= '" + enterpriseUid + "' and resource_name='cpu' group by time(1d) "
            },
            chartPerm: { "title": "CPU(核)", "unit": "", "priority": "a0" }
        }],
        instance: [{
            sqlPerm: {
                "sql": "select max(value) as region1 from quota where time > now() - 30d and enterprise_uid= '" + enterpriseUid + "' and resource_name='instances' group by time(1d) "
            },
            chartPerm: { "title": "虚拟机(个)", "unit": "", "priority": "a1" }
        }],
        project: [{
            sqlPerm: {
                "sql": "select max(value) as region1 from quota where time > now() - 30d and enterprise_uid= '" + enterpriseUid + "' and resource_name='project' group by time(1d) "
            },
            chartPerm: { "title": "项目(个)", "unit": "", "priority": "a2" }
        }],
        mem: [{
            sqlPerm: {
                "sql": "select max(value)/1024 as region1 from quota where time > now() - 30d and enterprise_uid= '" + enterpriseUid + "' and resource_name='mem' group by time(1d) "
            },
            chartPerm: { "title": "内存", "unit": "gbytes", "priority": "b0" }
        }],
        disk: [{
            sqlPerm: {
                "sql": "select max(value) as region1 from quota where time > now() - 30d and enterprise_uid= '" + enterpriseUid + "' and resource_name='disk' group by time(1d) "
            },
            chartPerm: { "title": "存储", "unit": "gbytes", "priority": "b1" }
        }]
    }
};
exports.vmInsDetailChartDefault = function(region_key, insUid, timeRange, target) {
    this.linuxSys = {
        cpu: [{
            sqlPerm: {
                "sql": "SELECT 100-MAX(usage_idle) AS Nusage_idle FROM cpu WHERE time > now() - 30m AND code = '" + region_key + "' \
                            AND host_type = 'virtual' AND vm_id = '" + insUid + "' GROUP BY time(10s)"
            },
            chartPerm: { "title": "Nusage_idle", "unit": "percent", "priority": "a0" }
        }, {
            sqlPerm: {
                "sql": "SELECT MAX(usage_iowait) AS usage_iowait FROM cpu WHERE time > now() - 30m AND code = '" + region_key + "' \
                            AND host_type = 'virtual' AND vm_id = '" + insUid + "' GROUP BY time(10s)"
            },
            chartPerm: { "title": "usage_iowait", "unit": "percent", "priority": "a3" }
        }, {
            sqlPerm: {
                "sql": "SELECT MAX(usage_user) AS cpu_usage_user FROM cpu WHERE time > now() - 30m AND code = '" + region_key + "' \
                            AND host_type = 'virtual' AND vm_id = '" + insUid + "' GROUP BY time(10s)"
            },
            chartPerm: { "title": "cpu_usage_user", "unit": "percent", "priority": "a1" }
        }, {
            sqlPerm: {
                "sql": "SELECT MAX(usage_system) AS cpu_usage_system FROM cpu WHERE time > now() - 30m AND code = '" + region_key + "' \
                            AND host_type = 'virtual' AND vm_id = '" + insUid + "' GROUP BY time(10s)"
            },
            chartPerm: { "title": "cpu_usage_system", "unit": "percent", "priority": "a2" }
        } ],
        mem: [{
            sqlPerm: {
                "sql": "SELECT MAX(used_percent) AS mem_used_percent FROM mem WHERE time > now() - 30m AND code = '" + region_key + "' \
                            AND host_type = 'virtual' AND vm_id = '" + insUid + "' GROUP BY time(10s)"
            },
            chartPerm: { "title": "mem_used_percent", "unit": "percent", "priority": "b0" }
        }, {
            sqlPerm: {
                "sql": "SELECT MAX(free) AS mem_free FROM mem WHERE time > now() - 30m AND code = '" + region_key + "' \
                            AND host_type = 'virtual' AND vm_id = '" + insUid + "' GROUP BY time(10s)"
            },
            chartPerm: { "title": "mem_free", "unit": "bytes", "priority": "b1" }
        }, {
            sqlPerm: {
                "sql": "SELECT MAX(cached) AS mem_cached FROM mem WHERE time > now() - 30m AND code = '" + region_key + "' \
                            AND host_type = 'virtual' AND vm_id = '" + insUid + "' GROUP BY time(10s)"
            },
            chartPerm: { "title": "mem_cached", "unit": "bytes", "priority": "b2" }
        }, {
            sqlPerm: {
                "sql": "SELECT MAX(buffered) AS mem_buffered FROM mem WHERE time > now() - 30m AND code = '" + region_key + "' \
                            AND host_type = 'virtual' AND vm_id = '" + insUid + "' GROUP BY time(10s)"
            },
            chartPerm: { "title": "mem_buffered", "unit": "bytes", "priority": "b3" }
        }, {
            sqlPerm: {
                "sql": "SELECT MAX(used_percent) AS swap_used_percent FROM swap WHERE time > now() - 30m AND code = '" + region_key + "' \
                            AND host_type = 'virtual' AND vm_id = '" + insUid + "' GROUP BY time(10s)"
            },
            chartPerm: { "title": "swap_used_percent", "unit": "percent", "priority": "b4" } //交换内存
        }],
        diskPath: [{
            sqlPerm: {
                "sql": "SELECT MAX(used_percent) AS disk_used_percent FROM disk WHERE time > now() - 30m AND path = '" + target + "' AND code = '" + region_key + "' \
                            AND host_type = 'virtual' AND vm_id = '" + insUid + "' GROUP BY time(10s)"
            },
            chartPerm: { "title": "disk_used_percent", "unit": "percent", "priority": "c0" }
        }],
        diskio: [{
            sqlPerm: {
                "sql": "SELECT derivative(read_time) AS read_time FROM diskio WHERE time > now() - 30m AND \"name\" = '" + target + "' AND code = '" + region_key + "' \
                             AND host_type = 'virtual' AND vm_id = '" + insUid + "' "
            },
            chartPerm: { "title": "read_time", "unit": "ops", "priority": "d0" }
        }, {
            sqlPerm: {
                "sql": "SELECT derivative(write_time) AS write_time FROM diskio WHERE time > now() - 30m AND \"name\" = '" + target + "' AND code = '" + region_key + "' \
                             AND host_type = 'virtual' AND vm_id = '" + insUid + "' "
            },
            chartPerm: { "title": "write_time", "unit": "ops", "priority": "d1" }
        }],
        netcard: [{
            sqlPerm: {
                "sql": "SELECT DERIVATIVE(bytes_recv) AS bytes_recv FROM net WHERE time > now() - 30m AND interface = '" + target + "' AND code = '" + region_key + "' \
                        AND host_type = 'virtual' AND vm_id = '" + insUid + "' "
            },
            chartPerm: { "title": "bytes_recv", "unit": "bps", "priority": "e1" }
        }, {
            sqlPerm: {
                "sql": "SELECT DERIVATIVE(bytes_sent) AS bytes_sent FROM net WHERE time > now() - 30m AND interface = '" + target + "' AND code = '" + region_key + "' \
                        AND host_type = 'virtual' AND vm_id = '" + insUid + "' "
            },
            chartPerm: { "title": "bytes_sent", "unit": "bps", "priority": "e2" }
        }, {
            sqlPerm: {
                "sql": "SELECT DERIVATIVE(packets_recv) AS packets_recv FROM net WHERE time > now() - 30m AND interface = '" + target + "' AND code = '" + region_key + "' \
                        AND host_type = 'virtual' AND vm_id = '" + insUid + "' "

            },
            chartPerm: { "title": "packets_recv", "unit": "pps", "priority": "e4" }
        }, {
            sqlPerm: {
                "sql": "SELECT DERIVATIVE(packets_sent) AS packets_sent FROM net WHERE time > now() - 30m AND interface = '" + target + "' AND code = '" + region_key + "' \
                        AND host_type = 'virtual' AND vm_id = '" + insUid + "' "
            },
            chartPerm: { "title": "packets_sent", "unit": "pps", "priority": "e5" }
        }, {
            sqlPerm: {
                "sql": "SELECT MAX(bytes_recv) AS total_bytes_recv FROM net WHERE time > now() - 30m AND interface = '" + target + "' AND code = '" + region_key + "' \
                        AND host_type = 'virtual' AND vm_id = '" + insUid + "'  GROUP BY time(60s)"
            },
            chartPerm: { "title": "total_bytes_recv", "unit": "bps", "priority": "e0" }
        }, {
            sqlPerm: {
                "sql": "SELECT MAX(bytes_sent) AS total_bytes_sent FROM net WHERE time > now() - 30m AND interface = '" + target + "' AND code = '" + region_key + "' \
                        AND host_type = 'virtual' AND vm_id = '" + insUid + "' GROUP BY time(60s)"
            },
            chartPerm: { "title": "total_bytes_sent", "unit": "bps", "priority": "e3" }
        }]
    };

    this.winSys = {
        // cpu
        cpu: [{
            sqlPerm: {
                "sql": "SELECT 100-MAX(usage_idle) AS Nusage_idle FROM \"cpu\" WHERE time > now() - 30m AND code = '" + region_key + "' \
                            AND host_type = 'virtual' AND vm_id = '" + insUid + "' GROUP BY time(10s)"
            },
            chartPerm: { "title": "Nusage_idle", "unit": "percent", "priority": "a0" }
        }, {
            sqlPerm: {
                "sql": "SELECT usage_user as cpu_usage_user FROM \"cpu\" WHERE time > now() - 30m AND code = '" + region_key + "' \
                            AND host_type = 'virtual' AND vm_id = '" + insUid + "' GROUP BY time(10s)"
            },
            chartPerm: { "title": "usage_user", "unit": "percent", "priority": "a1" }
        }, {
            sqlPerm: {
                "sql": "SELECT usage_system as  cpu_usage_system FROM \"cpu\" WHERE time > now() - 30m AND code = '" + region_key + "' \
                            AND host_type = 'virtual' AND vm_id = '" + insUid + "' GROUP BY time(10s)"
            },
            chartPerm: { "title": "usage_system", "unit": "percent", "priority": "a2" }
        }],
        // 内存
        mem: [{
            sqlPerm: {
                "sql": "select used as mem_used_percent from mem where time > now() - 30m and vm_id = '" + insUid + "' and code = '" + region_key + "'"
            },
            chartPerm: { "title": "mem_used_percent", "unit": "bytes", "priority": "b0" }
        },{
            sqlPerm: {
                "sql": "select total as mem_total_percent from mem where time > now() - 30m and vm_id = '" + insUid + "' and code = '" + region_key + "'"
            },
            chartPerm: { "title": "mem_total_percent", "unit": "bytes", "priority": "b1" }
        }],
        // 系统
        system: [ {
            sqlPerm: {
                "sql": "select System_Calls_persec from win_system where time > now() - 30m and vm_id = '" + insUid + "' and code = '" + region_key + "'"
            },
            chartPerm: { "title": "System_Calls_persec", "unit": "(次/秒)", "priority": "c0" }
        },{
            sqlPerm: {
                "sql": "select Context_Switches_persec from win_system where time > now() - 30m and vm_id = '" + insUid + "' and code = '" + region_key + "'"
            },
            chartPerm: { "title": "Context_Switches_persec", "unit": "(次/秒)", "priority": "c1" }
        }],
        // 磁盘
        disk: [{
                sqlPerm: {
                    "sql": "select Percent_Disk_Read_Time from win_disk where time > now() - 30m and vm_id = '" + insUid + "' and code = '" + region_key + "'"
                },
                chartPerm: { "title": "Percent_Disk_Read_Time", "unit": "(%)", "priority": "d0" }
            }, {
                sqlPerm: {
                    "sql": "select Percent_Disk_Write_Time from win_disk where time > now() - 30m and vm_id = '" + insUid + "' and code = '" + region_key + "'"
                },
                chartPerm: { "title": "Percent_Disk_Write_Time", "unit": "(%)", "priority": "d1" }
            }, {
                sqlPerm: {
                    "sql": "select Percent_Disk_Time from win_disk where time > now() - 30m and vm_id = '" + insUid + "' and code = '" + region_key + "'"
                },
                chartPerm: { "title": "Percent_Disk_Time", "unit": "(%)", "priority": "d2" }
            }

        ],
        // 磁盘分区
        diskPath: [{
            sqlPerm: {
                "sql": "select used_percent as disk_used_percent from \"disk\" where time > now() - 30m \
                     and vm_id = '" + insUid + "' and code = '" + region_key + "' and path = '" + target + "'"
            },
            chartPerm: { "title": "disk_used_percent", "unit": "(%)", "priority": "e" }
        }],
        // 网卡
        netcard: [{
            sqlPerm: {
                "sql": "select Bytes_Received_persec as bytes_recv from win_net where time > now() - 30m \
                     and vm_id = '" + insUid + "' and code = '" + region_key + "' and instance = '" + target + "'"
            },
            chartPerm: { "title": "Bytes_Received_persec", "unit": "bps", "priority": "f0" }
        }, {
            sqlPerm: {
                "sql": "select Bytes_Sent_persec as bytes_sent from win_net where time > now() - 30m \
                     and vm_id = '" + insUid + "' and code = '" + region_key + "' and instance = '" + target + "'"
            },
            chartPerm: { "title": "Bytes_Received_persec", "unit": "bps", "priority": "f1" }
        },{
            sqlPerm: {
                "sql": "select Packets_Received_persec as packets_recv from win_net where time > now() - 30m \
                     and vm_id = '" + insUid + "' and code = '" + region_key + "' and instance = '" + target + "'"
            },
            chartPerm: { "title": "packets_recv", "unit": "pps", "priority": "f2" }
        }, {
            sqlPerm: {
                "sql": "select Packets_Sent_persec as packets_sent from win_net where time > now() - 30m \
                     and vm_id = '" + insUid + "' and code = '" + region_key + "' and instance = '" + target + "'"
            },
            chartPerm: { "title": "packets_sent", "unit": "pps", "priority": "g0" }
        }]
    }
};

exports.phyAreaChartDefault = function(region_key, phy_id, timeRange, target) {
    this.chartSqls = {
        cpu: [{
            sqlPerm: {
                "sql": "SELECT 100-MAX(usage_idle) AS Nusage_idle FROM cpu WHERE time > now() - 30m AND code = '" + region_key + "' \
                            AND host_type = 'physical' AND node_id = '" + phy_id + "' GROUP BY time(10s)"
            },
            chartPerm: { "title": "Nusage_idle", "unit": "percent", "priority": "a0" }
        }, {
            sqlPerm: {
                "sql": "SELECT MAX(usage_iowait) AS usage_iowait FROM cpu WHERE time > now() - 30m AND code = '" + region_key + "' \
                            AND host_type = 'physical' AND node_id = '" + phy_id + "' GROUP BY time(10s)"
            },
            chartPerm: { "title": "usage_iowait", "unit": "percent", "priority": "a3" }
        }, {
            sqlPerm: {
                "sql": "SELECT MAX(usage_user) AS cpu_usage_user FROM cpu WHERE time > now() - 30m AND code = '" + region_key + "' \
                            AND host_type = 'physical' AND node_id = '" + phy_id + "' GROUP BY time(10s)"
            },
            chartPerm: { "title": "cpu_usage_user", "unit": "percent", "priority": "a1" }
        }, {
            sqlPerm: {
                "sql": "SELECT MAX(usage_system) AS cpu_usage_system FROM cpu  WHERE time > now() - 30m AND code = '" + region_key + "' \
                            AND host_type = 'physical' AND node_id = '" + phy_id + "' GROUP BY time(10s)"
            },
            chartPerm: { "title": "cpu_usage_system", "unit": "percent", "priority": "a2" }
        }],
        mem: [{
            sqlPerm: { //内存使用率
                "sql": "SELECT MAX(used_percent) AS mem_used_percent FROM mem WHERE time > now() - 30m AND code = '" + region_key + "' \
                            AND host_type = 'physical' AND node_id = '" + phy_id + "' GROUP BY time(10s)"
            },
            chartPerm: { "title": "mem_used_percent", "unit": "percent", "priority": "b0" }
        }, {
            sqlPerm: { //内存空闲
                "sql": "SELECT MAX(free) AS mem_free FROM mem WHERE time > now() - 30m AND code = '" + region_key + "' \
                            AND host_type = 'physical' AND node_id = '" + phy_id + "' GROUP BY time(10s)"
            },
            chartPerm: { "title": "mem_free", "unit": "bytes", "priority": "b1" }
        }, {
            sqlPerm: { //空闲缓存
                "sql": "SELECT MAX(cached) AS mem_cached FROM mem WHERE time > now() - 30m AND code = '" + region_key + "' \
                            AND host_type = 'physical' AND node_id = '" + phy_id + "' GROUP BY time(10s)"
            },
            chartPerm: { "title": "mem_cached", "unit": "bytes", "priority": "b2" }
        }, {
            sqlPerm: { //buffered
                "sql": "SELECT MAX(buffered) AS mem_buffered FROM mem WHERE time > now() - 30m AND code = '" + region_key + "' \
                            AND host_type = 'physical' AND node_id = '" + phy_id + "' GROUP BY time(10s)"
            },
            chartPerm: { "title": "mem_buffered", "unit": "bytes", "priority": "c0" }
        }, {
            sqlPerm: { //交换空间使用率
                "sql": "SELECT MAX(used_percent) AS swap_used_percent FROM swap WHERE time > now() - 30m AND code = '" + region_key + "' \
                            AND host_type = 'physical' AND node_id = '" + phy_id + "' GROUP BY time(10s)"
            },
            chartPerm: { "title": "swap_used_percent", "unit": "percent", "priority": "c1" }
        }],
        diskPath: [{
            sqlPerm: { //磁盘使用率
                "sql": "SELECT MAX(used_percent) AS disk_used_percent FROM disk WHERE time > now() - 30m AND path = '" + target + "' AND code = '" + region_key + "' \
                            AND host_type = 'physical' AND node_id = '" + phy_id + "' GROUP BY time(10s)"
            },
            chartPerm: { "title": "disk_used_percent", "unit": "percent", "priority": "a0" }
        }],
        diskio: [{
            sqlPerm: { //磁盘读IOPS
                "sql": "SELECT derivative(read_time) AS read_time FROM diskio WHERE time > now() - 30m AND \"name\" = '" + target + "' AND code = '" + region_key + "' \
                            AND host_type = 'physical' AND node_id = '" + phy_id + "' "
            },
            chartPerm: { "title": "read_time", "unit": "ops", "priority": "a1" }
        }, {
            sqlPerm: { //磁盘写IOPS
                "sql": "SELECT derivative(write_time) AS write_time FROM diskio WHERE time > now() - 30m AND \"name\" = '" + target + "' AND code = '" + region_key + "' \
                            AND host_type = 'physical' AND node_id = '" + phy_id + "' "
            },
            chartPerm: { "title": "write_time", "unit": "ops", "priority": "a2" }

        } ],
        netcard: [{
            sqlPerm: { //网络累计流入流量
                "sql": "SELECT MAX(bytes_recv) AS total_bytes_recv FROM net WHERE time > now() - 30m AND interface = '" + target + "' AND code = '" + region_key + "' \
                        AND host_type = 'physical' AND node_id = '" + phy_id + "' GROUP BY time(10s)"
            },
            chartPerm: { "title": "total_bytes_recv", "unit": "bps", "priority": "a0" }
        }, {
            sqlPerm: { //网络累计流出流量
                "sql": "SELECT MAX(bytes_sent) AS total_bytes_sent FROM net WHERE time > now() - 30m AND interface = '" + target + "' AND code = '" + region_key + "' \
                        AND host_type = 'physical' AND node_id = '" + phy_id + "' GROUP BY time(10s)"
            },
            chartPerm: { "title": "total_bytes_sent", "unit": "bps", "priority": "b0" }
        },{
            sqlPerm: { // 网络流入流量速率
                "sql": "SELECT DERIVATIVE(bytes_recv) AS bytes_recv FROM net WHERE time > now() - 30m AND interface = '" + target + "' AND code = '" + region_key + "' \
                        AND host_type = 'physical' AND node_id = '" + phy_id + "' "
            },
            chartPerm: { "title": "bytes_recv", "unit": "bps", "priority": "a1" }
        }, {
            sqlPerm: { // 网络流出流量速率
                "sql": "SELECT DERIVATIVE(bytes_sent) AS bytes_sent FROM net WHERE time > now() - 30m AND interface = '" + target + "' AND code = '" + region_key + "' \
                        AND host_type = 'physical' AND node_id = '" + phy_id + "' "
            },
            chartPerm: { "title": "bytes_sent", "unit": "bps", "priority": "b1" }
        },{
            sqlPerm: { //流入平均带宽
                "sql": "SELECT DERIVATIVE(packets_recv) AS packets_recv FROM net WHERE time > now() - 30m AND interface = '" + target + "' AND code = '" + region_key + "' \
                        AND host_type = 'physical' AND node_id = '" + phy_id + "'"
            },
            chartPerm: { "title": "packets_recv", "unit": "pps", "priority": "a2" }
        }, {
            sqlPerm: { //流出平均带宽
                "sql": "SELECT DERIVATIVE(packets_sent) AS packets_sent FROM net WHERE time > now() - 30m AND interface = '" + target + "' AND code = '" + region_key + "' \
                        AND host_type = 'physical' AND node_id = '" + phy_id + "' "
            },
            chartPerm: { "title": "packets_sent", "unit": "pps", "priority": "b2" }
        }]
    };
};
exports.cephAreaChartDefault = function(region_key,target){
    this.clusterChartSqls = {
        cluster:[/*{
            sqlPerm:{
                "sql": "select cluster_available from ceph_status where time > now() - 30m and code= '" + region_key + "' "
            },
            chartPerm: { "title": "cluster_available", "unit": "bytes", "priority": "a0" },
        },{
            sqlPerm:{
                "sql": "select cluster_used from ceph_status where time > now() - 30m and code= '" + region_key + "' "
            },
            chartPerm: { "title": "cluster_used", "unit": "bytes", "priority": "a1" },
        },*/{
            sqlPerm:{
                "sql": "select cluster_IOPS from ceph_status where time > now() - 30m and code= '" + region_key + "' "
            },
            chartPerm: { "title": "cluster_IOPS", "unit": "bytes", "priority": "a2" }
        },{
            sqlPerm:{
                "sql": "select cluster_rBandwidth from ceph_status where time > now() - 30m and code= '" + region_key + "' "
            },
            chartPerm: { "title": "cluster_rBandwidth", "unit": "bytes", "priority": "a3" }
        },{
            sqlPerm:{
                "sql": "select cluster_wBandwidth from ceph_status where time > now() - 30m and code= '" + region_key + "' "
            },
            chartPerm: { "title": "cluster_wBandwidth", "unit": "bytes", "priority": "a4" }
        }]
    };
    this.poolChartSqls = {
        pool:[{
            sqlPerm:{
                "sql": "select pool_IOPS from ceph_pools  where time > now() - 30m and code= '" + region_key + "' and pool_name = '"+ target + "'"
            },
            chartPerm: { "title": "pool_IOPS", "unit": "bytes", "priority": "a0" }
        },{
            sqlPerm:{
                "sql": "select pool_rBandwidth from ceph_pools where time > now() - 30m and code= '" + region_key + "' and pool_name = '"+ target + "'"
            },
            chartPerm: { "title": "pool_rBandwidth", "unit": "bytes", "priority": "a1" }
        },{
            sqlPerm:{
                "sql": "select pool_wBandwidth from ceph_pools where time > now() - 30m and code= '" + region_key + "' and pool_name = '"+ target + "'"
            },
            chartPerm: { "title": "pool_wBandwidth", "unit": "bytes", "priority": "a2" }
        }]
    }
}

exports.mysqlAreaChartDefault = function(region_key, timeRange, target) {
    this.chartSqls = {
        connection: [ //数据库连接信息
            {
                sqlPerm: { //数据库最大连接数
                    "sql": "select max_connections from mysql_variables where time > now() - 30m and code= '" + region_key + "' and server= '" + target + "'"
                },
                chartPerm: { "title": "max_connections", "unit": "", "priority": "a0" }
            }
        ],
        space: [ //数据库表空间信息
            {
                sqlPerm: { //查询语句-缓存命中率
                    "sql": "select (Qcache_hits-Qcache_inserts)/Qcache_hits as mysql_cachehits_percent from mysql where time > now() - 30m and code= '" + region_key + "' and server= '" + target + "'"
                },
                chartPerm: { "title": "mysql_cachehits_percent", "unit": "percent", "priority": "b0" }
            }, {
                sqlPerm: { //缓存利用率
                    "sql": "select (query_cache_size-Qcache_free_memory)/query_cache_size-Qcache_free_memory as mysql_cache_ratio  from mysql where time > now() - 30m and code= '" + region_key + "' and server= '" + target + "'"
                },
                chartPerm: { "title": "mysql_cache_ratio", "unit": "percent", "priority": "b1" }
            }, {
                sqlPerm: { //当前打开表总数量
                    "sql": "select open_tables from mysql where time > now() - 30m and code= '" + region_key + "' and server= '" + target + "'"
                },
                chartPerm: { "title": "open_tables", "unit": "", "priority": "c0" }
            }, {
                sqlPerm: { //查询缓存块数
                    "sql": "select qcache_total_blocks from mysql where time > now() - 30m and code= '" + region_key + "' and server= '" + target + "'"
                },
                chartPerm: { "title": "qcache_total_blocks", "unit": "", "priority": "c1" }
            }
        ],
        visit: [ //数据库访问信息
            {
                sqlPerm: { //慢查询数
                    "sql": "select DERIVATIVE(slow_queries) as slow_queries from mysql where time > now() - 30m  and code= '" + region_key + "' and server= '" + target + "'"
                },
                chartPerm: { "title": "slow_queries", "unit": "", "priority": "d0" }
            }, {
                sqlPerm: { //总请求数
                    "sql": "select DERIVATIVE(\"queries\") as total_query from mysql where time > now() - 30m  and code= '" + region_key + "' and server= '" + target + "'"
                },
                chartPerm: { "title": "total_query", "unit": "", "priority": "d1" }
            }, {
                sqlPerm: { //查询数
                    "sql": "select DERIVATIVE(commands_select) as command_select from  mysql where time > now() - 30m  and code= '" + region_key + "' and server= '" + target + "'"
                },
                chartPerm: { "title": "command_select", "unit": "", "priority": "d2" }
            }, {
                sqlPerm: { //更新数
                    "sql": "select DERIVATIVE(commands_update) as command_update from mysql where time > now() - 30m  and code= '" + region_key + "' and server= '" + target + "'"
                },
                chartPerm: { "title": "command_update", "unit": "", "priority": "e0" }
            }, {
                sqlPerm: { //删除数
                    "sql": "select DERIVATIVE(commands_delete) as command_delete from mysql where time > now() - 30m  and code= '" + region_key + "' and server= '" + target + "'"
                },
                chartPerm: { "title": "command_delete", "unit": "", "priority": "e1" }
            }, {
                sqlPerm: { //插入数
                    "sql": "select DERIVATIVE(commands_insert) as command_insert from mysql where time > now() - 30m  and code= '" + region_key + "' and server= '" + target + "'"
                },
                chartPerm: { "title": "command_insert", "unit": "", "priority": "e2" }
            }, {
                sqlPerm: { //当前连接数
                    "sql": "select threads_connected from mysql  where time > now() - 30m  and code= '" + region_key + "' and server= '" + target + "'"
                },
                chartPerm: { "title": "threads_connected", "unit": "", "priority": "f0" }
            }, {
                sqlPerm: { //失败连接数
                    "sql": "select DERIVATIVE(aborted_connects) as aborted_connects from mysql where time > now() - 30m  and code= '" + region_key + "' and server= '" + target + "'"
                },
                chartPerm: { "title": "aborted_connects", "unit": "", "priority": "f1" }
            }
        ]
    }
};

exports.rabbitmqAreaChartDefault = function() {
    this.chartSqls = {
        queues: [{
            sqlPerm: { //准备
                "sql": "select messages_ready from rabbitmq_overview where time > now() - 30m"
            },
            chartPerm: { "title": "messages_ready", "unit": "", "priority": "a0" }
        }, {
            sqlPerm: { //未确认
                "sql": "select messages_unacked from rabbitmq_overview where time > now() - 30m"
            },
            chartPerm: { "title": "messages_unacked", "unit": "", "priority": "a1" }
        }, {
            sqlPerm: { //总数量
                "sql": "select (messages_ready+messages_unacked) as rabbitQueueTotal from rabbitmq_overview where time > now() - 30m"
            },
            chartPerm: { "title": "rabbitQueueTotal", "unit": "", "priority": "a2" }
        } ],
        rate: [{
            sqlPerm: { //发布
                "sql": "select messages_published_rate from rabbitmq_overview where time > now() - 30m"
            },
            chartPerm: { "title": "messages_published_rate", "unit": "/s", "priority": "b0" }
        }, {
            sqlPerm: { //交付
                "sql": "select messages_delivered_rate from rabbitmq_overview where time > now() - 30m"
            },
            chartPerm: { "title": "messages_delivered_rate", "unit": "/s", "priority": "b1" }
        }, {
            sqlPerm: { //确认
                "sql": "select messages_acked_rate from rabbitmq_overview where time > now() - 30m"
            },
            chartPerm: { "title": "messages_acked_rate", "unit": "/s", "priority": "b2" }
        }]
    }
};
exports.memcachedAreaChartDefault = function() {
    this.chartSqls = {
        memcached: [{
            sqlPerm: { //读流量
                "sql": "select DERIVATIVE(bytes_read) as bytes_read from memcached where time > now() - 30m"
            },
            chartPerm: { "title": "bytes_read", "unit": "bytes", "priority": "a0" }
        }, {
            sqlPerm: { //写流量
                "sql": "select DERIVATIVE(bytes_written) as bytes_written  from memcached where time > now() - 30m"
            },
            chartPerm: { "title": "bytes_written", "unit": "bytes", "priority": "a1" }
        }, {
            sqlPerm: { //当前连接数
                "sql": "select curr_connections from memcached where time > now() - 30m"
            },
            chartPerm: { "title": "curr_connections", "unit": "", "priority": "a2" }
        }]
    }
};
