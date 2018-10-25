exports.PiePanelDefault = function() {
    this.panels = {
        colors: ["#51a3ff", "#4e80f5", "#1bbc9d", "#b6a2dd", "#e67f23", "#c0392b", "#ff754a", "#f39c12", "#b675de","#4a6583","#7991ab","#a6b6c8","#d7d7d7"],
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
exports.vmStatusColor = function(){
    let colors;
    return colors = {
        "active":"#1bbc9d",
        "up":"#1bbc9d",
        "building":"#4e80f5",
        "build":"#4e80f5",
        "powering-off":"#4e80f5",
        "powering-on":"#4e80f5",
        "deleting":"#4e80f5",
        "deleted":"#4e80f5",
        "soft-deleting":"#4e80f5",
        "soft-delete":"#4e80f5",
        "reboot_pending":"#4e80f5",
        "reboot":"#4e80f5",
        "pausing":"#4e80f5",
        "unpausing":"#4e80f5",
        "suspending":"#4e80f5",
        "resuming":"#4e80f5",
        "resize":"#4e80f5",
        "resize_prep":"#4e80f5",
        "resize_finish":"#4e80f5",
        "resize_migrating":"#4e80f5",
        "image_backup":"#4e80f5",
        "image_snapshot":"#4e80f5",
        "spawning":"#4e80f5",
        "migrating":"#4e80f5",
        "rebuilding":"#4e80f5",
        "rebuild":"#4e80f5",
        "retyping":"#4e80f5",

        "stopped":"#f39c12",
        "shutoff":"#f39c12",
        "paused":"#f39c12",
        "suspended":"#f39c12",
        "resized":"#f39c12",
        "verify_resize":"#f39c12",
        "revert_resize":"#f39c12",
        "down":"#f39c12",
        "unknow":"#f39c12",
        "unrecognized":"#f39c12",

        "error":"#c0392b",

        "other":"#a6b6c8"
    }
};
exports.AreaPanelDefault2 = function() {
    this.panels = {
        colors: ["#4e80f5", "#1bbc9d", "#b6a2dd", "#e67f23"],
        type: "area",
        width: 400,
        height: 250,
        margin: {
            left: 60,
            right: 60,
            top: 15,
            bottom: 30
        },
        unit: "",
        data: [],
        title: "",
        subTitle: "",
        priority: "",
        legend:false
    };
};
exports.monitorViewChartDefault = function(enterpriseUid) {
    this.chartSqls = {
        cpu: [{
            sqlPerm: {
                "sql": "select max(value) as region1 from quota where time > now() - 30d and enterprise_uid= '" + enterpriseUid + "' and resource_name='cpu' group by time(1d) "
            },
            chartPerm: { "title": "cpu", "unit": "", "priority": "a0" },
            name:"cpu"
        }],
        instance: [{
            sqlPerm: {
                "sql": "select max(value) as region1 from quota where time > now() - 30d and enterprise_uid= '" + enterpriseUid + "' and resource_name='instances' group by time(1d) "
            },
            chartPerm: { "title": "virtual", "unit": "", "priority": "a1" },
            name:"instances"
        }],
        project: [{
            sqlPerm: {
                "sql": "select max(value) as region1 from quota where time > now() - 30d and enterprise_uid= '" + enterpriseUid + "' and resource_name='project' group by time(1d) "
            },
            chartPerm: { "title": "project", "unit": "", "priority": "a2" },
            name:"project"
        }],
        mem: [{
            sqlPerm: {
                "sql": "select max(value)/1024 as region1 from quota where time > now() - 30d and enterprise_uid= '" + enterpriseUid + "' and resource_name='mem' group by time(1d) "
            },
            chartPerm: { "title": "mem", "unit": "gbytes", "priority": "b0" },
            name:"mem"
        }],
        disk: [{
            sqlPerm: {
                "sql": "select max(value) as region1 from quota where time > now() - 30d and enterprise_uid= '" + enterpriseUid + "' and resource_name='disk' group by time(1d) "
            },
            chartPerm: { "title": "storage", "unit": "gbytes", "priority": "b1" },
            name:"disk"
        }],
        floatingip: [{
            sqlPerm: {
                "sql": ""
            },
            chartPerm: { "title": "floatingip", "unit": "", "priority": "b2" },
            name:"floatingip"
        }]
    }
};
exports.vmInsDetailChartDefault = function(region_key, insUid, timeRange, target) {
    this.linuxSys = {
        cpu: [{
            sqlPerm: {
                "sql": "SELECT mean(usage_system)+mean(usage_user) AS Nusage_idle FROM cpu WHERE time >= " + timeRange.cpu.startTime + "ms and time < " + timeRange.cpu.endTime + "ms AND code = '" + region_key + "' \
                            AND host_type = 'virtual' AND vm_id = '" + insUid + "' AND cpu = 'cpu-total' GROUP BY time(" + timeRange.cpu.precision + "s)"
            },
            chartPerm: { "title": "Nusage_idle", "unit": "percent", "priority": "a0" }
        }, {
            sqlPerm: {
                "sql": "SELECT mean(usage_iowait) AS usage_iowait FROM  cpu WHERE time >= "+timeRange.cpu.startTime+"ms and time <"+timeRange.cpu.endTime+"ms AND code = '" + region_key + "' \
                            AND host_type = 'virtual' AND vm_id = '" + insUid + "' AND cpu = 'cpu-total' GROUP BY time(" + timeRange.cpu.precision + "s)"
            },
            chartPerm: { "title": "usage_iowait", "unit": "percent", "priority": "a3" }
        }, {
            sqlPerm: {
                "sql": "SELECT mean(usage_user) AS cpu_usage_user FROM cpu WHERE time >= "+timeRange.cpu.startTime+"ms and time <"+timeRange.cpu.endTime+"ms AND code = '" + region_key + "' \
                            AND host_type = 'virtual' AND vm_id = '" + insUid + "' AND cpu = 'cpu-total' GROUP BY time(" + timeRange.cpu.precision + "s)"
            },
            chartPerm: { "title": "cpu_usage_user", "unit": "percent", "priority": "a1" }
        }, {
            sqlPerm: {
                "sql": "SELECT mean(usage_system) AS cpu_usage_system FROM cpu WHERE time >= "+timeRange.cpu.startTime + "ms and time <"+timeRange.cpu.endTime+"ms AND code = '" + region_key + "' \
                            AND host_type = 'virtual' AND vm_id = '" + insUid + "' AND cpu = 'cpu-total' GROUP BY time(" + timeRange.cpu.precision +"s)"
            },
            chartPerm: { "title": "cpu_usage_system", "unit": "percent", "priority": "a2" }
        } ],
        mem: [{
            sqlPerm: {
                "sql": "SELECT mean(used_percent) AS mem_used_percent FROM mem WHERE time >= "+timeRange.mem.startTime+"ms and time <"+timeRange.mem.endTime+"ms AND code = '" + region_key + "' \
                            AND host_type = 'virtual' AND vm_id = '" + insUid + "' GROUP BY time("+timeRange.mem.precision+"s)"
            },
            chartPerm: { "title": "mem_used_percent", "unit": "percent", "priority": "b0" }
        }, {
            sqlPerm: {
                "sql": "SELECT mean(free) AS mem_free FROM mem WHERE time >= "+timeRange.mem.startTime+"ms and time <"+timeRange.mem.endTime+"ms AND code = '" + region_key + "' \
                            AND host_type = 'virtual' AND vm_id = '" + insUid + "' GROUP BY  time("+timeRange.mem.precision+"s)"
            },
            chartPerm: { "title": "mem_free", "unit": "bytes", "priority": "b1" }
        }, {
            sqlPerm: {
                "sql": "SELECT mean(cached) AS mem_cached FROM mem WHERE time >=  "+timeRange.mem.startTime+"ms and time <"+timeRange.mem.endTime+"ms AND code = '" + region_key + "' \
                            AND host_type = 'virtual' AND vm_id = '" + insUid + "' GROUP BY time("+timeRange.mem.precision+"s)"
            },
            chartPerm: { "title": "mem_cached", "unit": "bytes", "priority": "b2" }
        }, {
            sqlPerm: {
                "sql": "SELECT mean(buffered) AS mem_buffered FROM mem WHERE time >=  "+timeRange.mem.startTime+"ms and time <"+timeRange.mem.endTime+"ms AND code = '" + region_key + "' \
                            AND host_type = 'virtual' AND vm_id = '" + insUid + "' GROUP BY time("+timeRange.mem.precision+"s)"
            },
            chartPerm: { "title": "mem_buffered", "unit": "bytes", "priority": "b3" }
        }, {
            sqlPerm: {
                "sql": "SELECT mean(used_percent) AS swap_used_percent FROM swap WHERE time >= "+timeRange.mem.startTime+"ms and time <"+timeRange.mem.endTime+"ms AND code = '" + region_key + "' \
                            AND host_type = 'virtual' AND vm_id = '" + insUid + "' GROUP BY time("+timeRange.mem.precision+"s)"
            },
            chartPerm: { "title": "swap_used_percent", "unit": "percent", "priority": "b4" } //交换内存
        }],
        diskPath: [{
            sqlPerm: {
                "sql": "SELECT mean(used_percent) AS disk_used_percent FROM disk WHERE time >= "+timeRange.disk.startTime+"ms and time <"+timeRange.disk.endTime+"ms AND path = '" + target + "' AND code = '" + region_key + "' \
                            AND host_type = 'virtual' AND vm_id = '" + insUid + "' GROUP BY time("+timeRange.disk.precision+"s)"
            },
            chartPerm: { "title": "disk_used_percent", "unit": "percent", "priority": "c0" }
        }],
        diskio: [{
            sqlPerm: {
                "sql": "SELECT derivative(mean(reads), 1s) AS read_bytes_per_second FROM diskio WHERE time >= "+timeRange.disk.startTime+"ms and time <"+timeRange.disk.endTime+"ms AND \"name\" = '" + target + "' AND code = '" + region_key + "' \
                             AND host_type = 'virtual' AND vm_id = '" + insUid + "' group by time("+ timeRange.disk.precision +"s)"
            },
            chartPerm: { "title": "read_bytes_per_second", "unit": "ops", "priority": "d0" }
        }, {
            sqlPerm: {
                "sql": "SELECT derivative(mean(writes), 1s) AS write_bytes_per_time FROM diskio WHERE time >= "+timeRange.disk.startTime+"ms and time <"+timeRange.disk.endTime+"ms AND \"name\" = '" + target + "' AND code = '" + region_key + "' \
                             AND host_type = 'virtual' AND vm_id = '" + insUid + "' group by time("+ timeRange.disk.precision +"s)"
            },
            chartPerm: { "title": "write_bytes_per_time", "unit": "ops", "priority": "d1" }
        }],
        netcard: [{
            sqlPerm: {
                "sql": "SELECT DERIVATIVE(last(bytes_recv))/" + timeRange.netcard.precision + "*8 AS bytes_recv FROM net WHERE time >= " + timeRange.netcard.startTime + "ms and time < " + timeRange.netcard.endTime + "ms AND interface = '" + target + "' AND code = '" + region_key + "' \
                        AND host_type = 'virtual' AND vm_id = '" + insUid + "' group by time("+ timeRange.netcard.precision +"s)"
            },
            chartPerm: { "title": "bytes_recv", "unit": "bps", "priority": "e1" }
        }, {
            sqlPerm: {
                "sql": "SELECT DERIVATIVE(last(bytes_sent))/" + timeRange.netcard.precision + "*8 AS bytes_sent FROM net WHERE time >= " +  timeRange.netcard.startTime + "ms and time < " + timeRange.netcard.endTime + "ms AND interface = '" + target + "' AND code = '" + region_key + "' \
                        AND host_type = 'virtual' AND vm_id = '" + insUid + "' group by time("+ timeRange.netcard.precision +"s)"
            },
            chartPerm: { "title": "bytes_sent", "unit": "bps", "priority": "e4" }
        }, {
            sqlPerm: {
                "sql": "SELECT DERIVATIVE(mean(packets_recv), 1s) AS packets_recv FROM net WHERE time >= " + timeRange.netcard.startTime + "ms and time < " + timeRange.netcard.endTime + "ms AND interface = '" + target + "' AND code = '" + region_key + "' \
                        AND host_type = 'virtual' AND vm_id = '" + insUid + "' group by time("+ timeRange.netcard.precision +"s)"

            },
            chartPerm: { "title": "packets_recv", "unit": "pps", "priority": "e2" }
        }, {
            sqlPerm: {
                "sql": "SELECT DERIVATIVE(mean(packets_sent), 1s) AS packets_sent FROM net WHERE time >= " + timeRange.netcard.startTime + "ms and time <" + timeRange.netcard.endTime + "ms AND interface = '" + target + "' AND code = '" + region_key + "' \
                        AND host_type = 'virtual' AND vm_id = '" + insUid + "' group by time("+ timeRange.netcard.precision +"s)"
            },
            chartPerm: { "title": "packets_sent", "unit": "pps", "priority": "e5" }
        }, {
            sqlPerm: {
                "sql": "SELECT last(bytes_recv) AS total_bytes_recv FROM net WHERE time >= " + timeRange.netcard.startTime + "ms  and time < " + timeRange.netcard.endTime + "ms  AND interface = '" + target + "' AND code = '" + region_key + "' \
                        AND host_type = 'virtual' AND vm_id = '" + insUid + "' GROUP BY time( " + timeRange.netcard.precision + "s)  "
            },
            chartPerm: { "title": "total_bytes_recv", "unit": "bytes", "priority": "e0" }
        }, {
            sqlPerm: {
                "sql": "SELECT last(bytes_sent) AS total_bytes_sent FROM net WHERE time >= " + timeRange.netcard.startTime + "ms and time < " + timeRange.netcard.endTime + "ms  AND interface = '" + target + "' AND code = '" + region_key + "' \
                        AND host_type = 'virtual' AND vm_id = '" + insUid + "' GROUP BY time( " + timeRange.netcard.precision + "s)"
            },
            chartPerm: { "title": "total_bytes_sent", "unit": "bytes", "priority": "e3" }
        }]
    };

    this.winSys = {
        // cpu
        cpu: [{
            sqlPerm: {
                "sql": "SELECT mean(usage_system)+mean(usage_user) AS Nusage_idle FROM \"cpu\" WHERE time >= " + timeRange.cpu.startTime + "ms  and time < " + timeRange.cpu.endTime + "ms AND code = '" + region_key + "' \
                            AND host_type = 'virtual' AND vm_id = '" + insUid + "' GROUP BY time( " + timeRange.cpu.precision + "s)"
            },
            chartPerm: { "title": "Nusage_idle", "unit": "percent", "priority": "a0" }
        }, {
            sqlPerm: {
                "sql": "SELECT mean(usage_iowait) AS usage_iowait FROM cpu WHERE time >= " + timeRange.cpu.startTime + "ms  and time < " + timeRange.cpu.endTime + "ms AND code = '" + region_key + "' \
                            AND host_type = 'virtual' AND vm_id = '" + insUid + "' GROUP BY time( " + timeRange.cpu.precision + "s)"
            },
            chartPerm: { "title": "usage_iowait", "unit": "percent", "priority": "a3" }
        },{
            sqlPerm: {
                "sql": "SELECT mean(usage_user) as cpu_usage_user FROM \"cpu\" WHERE time >= " + timeRange.cpu.startTime + "ms  and time < " + timeRange.cpu.endTime + "ms AND code = '" + region_key + "' \
                            AND host_type = 'virtual' AND vm_id = '" + insUid + "' GROUP BY time( " + timeRange.cpu.precision + "s)"
            },
            chartPerm: { "title": "usage_user", "unit": "percent", "priority": "a1" }
        }, {
            sqlPerm: {
                "sql": "SELECT mean(usage_system) as  cpu_usage_system FROM \"cpu\" WHERE time >= " + timeRange.cpu.startTime + "ms  and time < " + timeRange.cpu.endTime + "ms AND code = '" + region_key + "' \
                            AND host_type = 'virtual' AND vm_id = '" + insUid + "' GROUP BY time( " + timeRange.cpu.precision + "s)"
            },
            chartPerm: { "title": "usage_system", "unit": "percent", "priority": "a2" }
        }],
        // 内存
        mem: [{
            sqlPerm: {
                "sql": "SELECT mean(used_percent) AS mem_used_percent FROM mem WHERE time >= " + timeRange.mem.startTime + "ms  and time < " + timeRange.mem.endTime + "ms AND code = '" + region_key + "' \
                            AND host_type = 'virtual' AND vm_id = '" + insUid + "' GROUP BY time( " + timeRange.mem.precision + "s)"
            },
            chartPerm: { "title": "mem_used_percent", "unit": "percent", "priority": "b0" }
        }, {
            sqlPerm: {
                "sql": "SELECT mean(free) AS mem_free FROM mem WHERE time >= " + timeRange.mem.startTime + "ms  and time < " + timeRange.mem.endTime + "ms AND code = '" + region_key + "' \
                            AND host_type = 'virtual' AND vm_id = '" + insUid + "' GROUP BY time( " + timeRange.mem.precision + "s)"
            },
            chartPerm: { "title": "mem_free", "unit": "bytes", "priority": "b1" }
        }, {
            sqlPerm: {
                "sql": "SELECT mean(cached) AS mem_cached FROM mem WHERE time >= " + timeRange.mem.startTime + "ms  and time < " + timeRange.mem.endTime + "ms AND code = '" + region_key + "' \
                            AND host_type = 'virtual' AND vm_id = '" + insUid + "' GROUP BY time( " + timeRange.mem.precision + "s)"
            },
            chartPerm: { "title": "mem_cached", "unit": "bytes", "priority": "b2" }
        }, {
            sqlPerm: {
                "sql": "SELECT mean(buffered) AS mem_buffered FROM mem WHERE time >= " + timeRange.mem.startTime + "ms  and time < " + timeRange.mem.endTime + "ms AND code = '" + region_key + "' \
                            AND host_type = 'virtual' AND vm_id = '" + insUid + "' GROUP BY time( " + timeRange.mem.precision + "s)"
            },
            chartPerm: { "title": "mem_buffered", "unit": "bytes", "priority": "b3" }
        }],
        // 系统
        system: [ {
            sqlPerm: {
                "sql": "select mean(System_Calls_persec) as System_Calls_Per_Period from win_system where time >= "+timeRange.system.startTime+"ms and time < "+timeRange.system.endTime+"ms  and vm_id = '" + insUid + "' and code = '" + region_key + "' group by time("+timeRange.system.precision+"s)"
            },
            chartPerm: { "title": "System_Calls_Per_Period", "unit": "(/s)", "priority": "c0" }
        },{
            sqlPerm: {
                "sql": "select mean(Context_Switches_persec) as Context_Switches_Per_Period from win_system where time >= "+timeRange.system.startTime+"ms and time < "+timeRange.system.endTime+"ms  and vm_id = '" + insUid + "' and code = '" + region_key + "' group by time("+timeRange.system.precision+"s)"
            },
            chartPerm: { "title": "Context_Switches_Per_Period", "unit": "(/s)", "priority": "c1" }
        }],
        // 磁盘分区
        diskPath: [{
            sqlPerm: {
                "sql": "select used_percent as disk_used_percent from \"disk\" where time >= "+timeRange.win_disk.startTime+"ms and time < "+timeRange.win_disk.endTime + "ms and vm_id = '" + insUid + "' and code = '" + region_key + "' and path = '" + target + "'"
            },
            chartPerm: { "title": "disk_used_percent", "unit": "percent", "priority": "d" }
        }],
        // 磁盘
        disk: [{
                sqlPerm: {
                    "sql": "select mean(Percent_Disk_Read_Time)  as  Percent_Disk_Read_Time from win_disk where time >= "+timeRange.win_disk.startTime+"ms and time < "+timeRange.win_disk.endTime+"ms and vm_id = '" + insUid + "' and code = '" + region_key + "' \
                            AND host_type = 'virtual' GROUP BY time( " + timeRange.win_disk.precision + "s)"
                },
                chartPerm: { "title": "Percent_Disk_Read_Time", "unit": "percent", "priority": "e0" }
            }, {
                sqlPerm: {
                    "sql": "select mean(Percent_Disk_Write_Time) as Percent_Disk_Write_Time from win_disk where time >= "+timeRange.win_disk.startTime+"ms and time < "+timeRange.win_disk.endTime+"ms and vm_id = '" + insUid + "' and code = '" + region_key + "' GROUP BY time( " + timeRange.win_disk.precision + "s) "
                },
                chartPerm: { "title": "Percent_Disk_Write_Time", "unit": "percent", "priority": "e1" }
            }
            // {
            //     sqlPerm: {
            //         "sql": "select Percent_Disk_Time from win_disk where time > now() - 30m and vm_id = '" + insUid + "' and code = '" + region_key + "'"
            //     },
            //     chartPerm: { "title": "Percent_Disk_Time", "unit": "percent", "priority": "d2" }
            // },

        ],
        
        // 网卡
        netcard: [{
            sqlPerm: {
                "sql": "select mean(Bytes_Received_persec)*8 as bytes_recv from win_net where time >= "+timeRange.netcard.startTime+"ms and time <"+timeRange.netcard.endTime+"ms \
                     and vm_id = '" + insUid + "' and code = '" + region_key + "' and instance = '" + target + "'  group by time("+timeRange.netcard.precision+"s)"
            },
            chartPerm: { "title": "bytes_recv", "unit": "bps", "priority": "e1" }
        }, {
            sqlPerm: {
                "sql": "select mean(Bytes_Sent_persec)*8 as bytes_sent from win_net where time >= "+timeRange.netcard.startTime+"ms and time <"+timeRange.netcard.endTime+"ms \
                     and vm_id = '" + insUid + "' and code = '" + region_key + "' and instance = '" + target + "'  group by time("+timeRange.netcard.precision+"s)"
            },
            chartPerm: { "title": "bytes_sent", "unit": "bps", "priority": "e4" }
        },{
            sqlPerm: {
                "sql": "select mean(Packets_Received_persec) as packets_recv from win_net where time >= "+timeRange.netcard.startTime+"ms and time <"+timeRange.netcard.endTime+"ms \
                     and vm_id = '" + insUid + "' and code = '" + region_key + "' and instance = '" + target + "' group by time("+timeRange.netcard.precision+"s)"
            },
            chartPerm: { "title": "packets_recv", "unit": "pps", "priority": "e2" }
        }, {
            sqlPerm: {
                "sql": "select mean(Packets_Sent_persec) as packets_sent from win_net where time >= " +timeRange.netcard.startTime+"ms and time <"+timeRange.netcard.endTime+"ms \
                     and vm_id = '" + insUid + "' and code = '" + region_key + "' and instance = '" + target + "' group by time("+timeRange.netcard.precision+"s)"
            },
            chartPerm: { "title": "packets_sent", "unit": "pps", "priority": "e5" }
        },{
            sqlPerm: {
                "sql": "SELECT mean(Bytes_Received_persec)*" + timeRange.netcard.precision + " AS total_bytes_recv FROM win_net WHERE time >= "+timeRange.netcard.startTime+"ms and time <"+timeRange.netcard.endTime+"ms \
                     AND instance = '" + target + "' AND code = '" + region_key + "' AND vm_id = '" + insUid + "' group by time("+timeRange.netcard.precision+"s)"
            },
            chartPerm: { "title": "total_bytes_recv", "unit": "bytes", "priority": "e0" ,"type":"stack"}
        }, {
            sqlPerm: {
                "sql": "SELECT mean(Bytes_Sent_persec)*" + timeRange.netcard.precision + " AS total_bytes_sent FROM win_net WHERE time >= "+timeRange.netcard.startTime+"ms and time <"+timeRange.netcard.endTime+"ms AND instance = '" + target + "' AND code = '" + region_key + "' \
                        AND vm_id = '" + insUid + "' GROUP BY time("+timeRange.netcard.precision+"s)"
            },
            chartPerm: { "title": "total_bytes_sent", "unit": "bytes", "priority": "e3" ,"type":"stack"}
        }]
    }
};

exports.phyAreaChartDefault = function(region_key, phy_id, timeRange, target) {
    this.chartSqls = {
        cpu: [{
            sqlPerm: {
                "sql": "SELECT 100-usage_idle AS Nusage_idle FROM cpu WHERE time > now() - 30m AND code = '" + region_key + "' \
                            AND host_type = 'physical' AND node_id = '" + phy_id + "' and cpu = 'cpu-total' "
            },
            chartPerm: { "title": "Nusage_idle", "unit": "percent", "priority": "a0" },
        }, {
            sqlPerm: {
                "sql": "SELECT usage_iowait AS usage_iowait FROM cpu WHERE time > now() - 30m AND code = '" + region_key + "' \
                            AND host_type = 'physical' AND node_id = '" + phy_id + "' and cpu = 'cpu-total' "
            },
            chartPerm: { "title": "usage_iowait", "unit": "percent", "priority": "a3" },
        }, {
            sqlPerm: {
                "sql": "SELECT usage_user AS cpu_usage_user FROM cpu WHERE time > now() - 30m AND code = '" + region_key + "' \
                            AND host_type = 'physical' AND node_id = '" + phy_id + "' and cpu = 'cpu-total' "
            },
            chartPerm: { "title": "cpu_usage_user", "unit": "percent", "priority": "a1" },
        }, {
            sqlPerm: {
                "sql": "SELECT usage_system AS cpu_usage_system FROM cpu  WHERE time > now() - 30m AND code = '" + region_key + "' \
                            AND host_type = 'physical' AND node_id = '" + phy_id + "' and cpu = 'cpu-total' "
            },
            chartPerm: { "title": "cpu_usage_system", "unit": "percent", "priority": "a2" },
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
                "sql": "SELECT derivative(reads) AS read_time FROM diskio WHERE time > now() - 30m AND \"name\" = '" + target + "' AND code = '" + region_key + "' \
                            AND host_type = 'physical' AND node_id = '" + phy_id + "' "
            },
            chartPerm: { "title": "read_time", "unit": "ops", "priority": "a1" }
        }, {
            sqlPerm: { //磁盘写IOPS
                "sql": "SELECT derivative(writes) AS write_time FROM diskio WHERE time > now() - 30m AND \"name\" = '" + target + "' AND code = '" + region_key + "' \
                            AND host_type = 'physical' AND node_id = '" + phy_id + "' "
            },
            chartPerm: { "title": "write_time", "unit": "ops", "priority": "a2" }

        }, ],
        netcard: [{
            sqlPerm: { //网络累计流入流量
                "sql": "SELECT last(bytes_recv) AS total_bytes_recv FROM net WHERE time > now() - 30m AND interface = '" + target + "' AND code = '" + region_key + "' \
                        AND host_type = 'physical' AND node_id = '" + phy_id + "' GROUP BY time(20s)"
            },
            chartPerm: { "title": "total_bytes_recv", "unit": "bytes", "priority": "a0" }
        }, {
            sqlPerm: { //网络累计流出流量
                "sql": "SELECT last(bytes_sent) AS total_bytes_sent FROM net WHERE time > now() - 30m AND interface = '" + target + "' AND code = '" + region_key + "' \
                        AND host_type = 'physical' AND node_id = '" + phy_id + "' GROUP BY time(20s)"
            },
            chartPerm: { "title": "total_bytes_sent", "unit": "bytes", "priority": "b0" }
        },{
            sqlPerm: { // 网络流入流量速率
                "sql": "SELECT DERIVATIVE(bytes_recv)*8 AS bytes_recv FROM net WHERE time > now() - 30m AND interface = '" + target + "' AND code = '" + region_key + "' \
                        AND host_type = 'physical' AND node_id = '" + phy_id + "' "
            },
            chartPerm: { "title": "bytes_recv", "unit": "bps", "priority": "a1" }
        }, {
            sqlPerm: { // 网络流出流量速率
                "sql": "SELECT DERIVATIVE(bytes_sent)*8 AS bytes_sent FROM net WHERE time > now() - 30m AND interface = '" + target + "' AND code = '" + region_key + "' \
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

//纳管物理机数据
exports.tubephyAreaChartDefault = function(region_key, phy_id, timeRange, target) {
    this.chartSqls = {
        cpu: [{
            sqlPerm: {
                "sql": "SELECT 100-MAX(usage_idle) AS Nusage_idle FROM cpu WHERE time > now() - 30m \
                            AND host_type = 'physical' AND host = '" + phy_id + "' GROUP BY time(10s)"
            },
            chartPerm: { "title": "Nusage_idle", "unit": "percent", "priority": "a0" }
        }, {
            sqlPerm: {
                "sql": "SELECT MAX(usage_iowait) AS usage_iowait FROM cpu WHERE time > now() - 30m  \
                            AND host_type = 'physical' AND host = '" + phy_id + "' GROUP BY time(10s)"
            },
            chartPerm: { "title": "usage_iowait", "unit": "percent", "priority": "a3" }
        }, {
            sqlPerm: {
                "sql": "SELECT MAX(usage_user) AS cpu_usage_user FROM cpu WHERE time > now() - 30m  \
                            AND host_type = 'physical' AND host = '" + phy_id + "' GROUP BY time(10s)"
            },
            chartPerm: { "title": "cpu_usage_user", "unit": "percent", "priority": "a1" }
        }, {
            sqlPerm: {
                "sql": "SELECT MAX(usage_system) AS cpu_usage_system FROM cpu  WHERE time > now() - 30m  \
                            AND host_type = 'physical' AND host = '" + phy_id + "' GROUP BY time(10s)"
            },
            chartPerm: { "title": "cpu_usage_system", "unit": "percent", "priority": "a2" }
        }],
        mem: [{
            sqlPerm: { //内存使用率
                "sql": "SELECT MAX(used_percent) AS mem_used_percent FROM mem WHERE time > now() - 30m  \
                            AND host_type = 'physical' AND host = '" + phy_id + "' GROUP BY time(10s)"
            },
            chartPerm: { "title": "mem_used_percent", "unit": "percent", "priority": "b0" }
        }, {
            sqlPerm: { //内存空闲
                "sql": "SELECT MAX(free) AS mem_free FROM mem WHERE time > now() - 30m  \
                            AND host_type = 'physical' AND host = '" + phy_id + "' GROUP BY time(10s)"
            },
            chartPerm: { "title": "mem_free", "unit": "bytes", "priority": "b1" }
        }, {
            sqlPerm: { //空闲缓存
                "sql": "SELECT MAX(cached) AS mem_cached FROM mem WHERE time > now() - 30m  \
                            AND host_type = 'physical' AND host = '" + phy_id + "' GROUP BY time(10s)"
            },
            chartPerm: { "title": "mem_cached", "unit": "bytes", "priority": "b2" }
        }, {
            sqlPerm: { //buffered
                "sql": "SELECT MAX(buffered) AS mem_buffered FROM mem WHERE time > now() - 30m  \
                            AND host_type = 'physical' AND host = '" + phy_id + "' GROUP BY time(10s)"
            },
            chartPerm: { "title": "mem_buffered", "unit": "bytes", "priority": "c0" }
        }, {
            sqlPerm: { //交换空间使用率
                "sql": "SELECT MAX(used_percent) AS swap_used_percent FROM swap WHERE time > now() - 30m  \
                            AND host_type = 'physical' AND host = '" + phy_id + "' GROUP BY time(10s)"
            },
            chartPerm: { "title": "swap_used_percent", "unit": "percent", "priority": "c1" }
        }],
        diskPath: [{
            sqlPerm: { //磁盘使用率
                "sql": "SELECT MAX(used_percent) AS disk_used_percent FROM disk WHERE time > now() - 30m AND path = '" + target + "'  \
                            AND host_type = 'physical' AND host = '" + phy_id + "' GROUP BY time(10s)"
            },
            chartPerm: { "title": "disk_used_percent", "unit": "percent", "priority": "a0" }
        }],
        diskio: [{
            sqlPerm: { //磁盘读IOPS
                "sql": "SELECT derivative(read_time) AS read_time FROM diskio WHERE time > now() - 30m AND \"name\" = '" + target + "' \
                            AND host_type = 'physical' AND host = '" + phy_id + "' "
            },
            chartPerm: { "title": "read_time", "unit": "ops", "priority": "a1" }
        }, {
            sqlPerm: { //磁盘写IOPS
                "sql": "SELECT derivative(write_time) AS write_time FROM diskio WHERE time > now() - 30m AND \"name\" = '" + target + "'  \
                            AND host_type = 'physical' AND host = '" + phy_id + "' "
            },
            chartPerm: { "title": "write_time", "unit": "ops", "priority": "a2" }

        }],
        netcard: [{
            sqlPerm: { //网络累计流入流量
                "sql": "SELECT MAX(bytes_recv) AS total_bytes_recv FROM net WHERE time > now() - 30m AND interface = '" + target + "'  \
                        AND host_type = 'physical' AND host = '" + phy_id + "' GROUP BY time(10s)"
            },
            chartPerm: { "title": "total_bytes_recv", "unit": "bytes", "priority": "a0" }
        }, {
            sqlPerm: { //网络累计流出流量
                "sql": "SELECT MAX(bytes_sent) AS total_bytes_sent FROM net WHERE time > now() - 30m AND interface = '" + target + "'  \
                        AND host_type = 'physical' AND host = '" + phy_id + "' GROUP BY time(10s)"
            },
            chartPerm: { "title": "total_bytes_sent", "unit": "bytes", "priority": "b0" }
        },{
            sqlPerm: { // 网络流入流量速率
                "sql": "SELECT DERIVATIVE(bytes_recv)*8 AS bytes_recv FROM net WHERE time > now() - 30m AND interface = '" + target + "'  \
                        AND host_type = 'physical' AND host = '" + phy_id + "' "
            },
            chartPerm: { "title": "bytes_recv", "unit": "bps", "priority": "a1" }
        }, {
            sqlPerm: { // 网络流出流量速率
                "sql": "SELECT DERIVATIVE(bytes_sent)*8 AS bytes_sent FROM net WHERE time > now() - 30m AND interface = '" + target + "'  \
                        AND host_type = 'physical' AND host = '" + phy_id + "' "
            },
            chartPerm: { "title": "bytes_sent", "unit": "bps", "priority": "b1" }
        },{
            sqlPerm: { //流入平均带宽
                "sql": "SELECT DERIVATIVE(packets_recv) AS packets_recv FROM net WHERE time > now() - 30m AND interface = '" + target + "'  \
                        AND host_type = 'physical' AND host = '" + phy_id + "'"
            },
            chartPerm: { "title": "packets_recv", "unit": "pps", "priority": "a2" }
        }, {
            sqlPerm: { //流出平均带宽
                "sql": "SELECT DERIVATIVE(packets_sent) AS packets_sent FROM net WHERE time > now() - 30m AND interface = '" + target + "'  \
                        AND host_type = 'physical' AND host = '" + phy_id + "' "
            },
            chartPerm: { "title": "packets_sent", "unit": "pps", "priority": "b2" }
        }]
    };
};

exports.cephAreaChartDefault = function(region_key,target,value){
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
            chartPerm: { "title": "cluster_IOPS", "unit": "ops", "priority": "a2" }
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
                "sql": "select pool_IOPS from ceph_pools  where time > now() - 30m and code= '" + region_key + "' and pool_name = '"+ value + "'"
            },
            chartPerm: { "title": "pool_IOPS", "unit": "ops", "priority": "a0" }
        },{
            sqlPerm:{
                "sql": "select pool_rBandwidth from ceph_pools where time > now() - 30m and code= '" + region_key + "' and pool_name = '"+ value + "'"
            },
            chartPerm: { "title": "pool_rBandwidth", "unit": "bytes", "priority": "a1" }
        },{
            sqlPerm:{
                "sql": "select pool_wBandwidth from ceph_pools where time > now() - 30m and code= '" + region_key + "' and pool_name = '"+ value + "'"
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
            // {
            //     sqlPerm: { //查询语句-缓存命中率
            //         "sql": "select (Qcache_hits-Qcache_inserts)/Qcache_hits as mysql_cachehits_percent from mysql where time > now() - 30m and code= '" + region_key + "' and server= '" + target + "'"
            //     },
            //     chartPerm: { "title": "mysql_cachehits_percent", "unit": "percent", "priority": "b0" }
            // }, {
            //     sqlPerm: { //缓存利用率
            //         "sql": "select (query_cache_size-Qcache_free_memory)/query_cache_size-Qcache_free_memory as mysql_cache_ratio  from mysql where time > now() - 30m and code= '" + region_key + "' and server= '" + target + "'"
            //     },
            //     chartPerm: { "title": "mysql_cache_ratio", "unit": "percent", "priority": "b1" }
            // }, 
            {
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
                chartPerm: { "title": "slow_queries", "unit": "PS", "priority": "d0" }
            }, {
                sqlPerm: { //总请求数
                    "sql": "select DERIVATIVE(\"queries\") as total_query from mysql where time > now() - 30m  and code= '" + region_key + "' and server= '" + target + "'"
                },
                chartPerm: { "title": "total_query", "unit": "PS", "priority": "d1" }
            }, {
                sqlPerm: { //查询数
                    "sql": "select DERIVATIVE(commands_select) as command_select from  mysql where time > now() - 30m  and code= '" + region_key + "' and server= '" + target + "'"
                },
                chartPerm: { "title": "command_select", "unit": "PS", "priority": "d2" }
            }, {
                sqlPerm: { //更新数
                    "sql": "select DERIVATIVE(commands_update) as command_update from mysql where time > now() - 30m  and code= '" + region_key + "' and server= '" + target + "'"
                },
                chartPerm: { "title": "command_update", "unit": "PS", "priority": "e0" }
            }, {
                sqlPerm: { //删除数
                    "sql": "select DERIVATIVE(commands_delete) as command_delete from mysql where time > now() - 30m  and code= '" + region_key + "' and server= '" + target + "'"
                },
                chartPerm: { "title": "command_delete", "unit": "PS", "priority": "e1" }
            }, {
                sqlPerm: { //插入数
                    "sql": "select DERIVATIVE(commands_insert) as command_insert from mysql where time > now() - 30m  and code= '" + region_key + "' and server= '" + target + "'"
                },
                chartPerm: { "title": "command_insert", "unit": "PS", "priority": "e2" }
            }, {
                sqlPerm: { //当前连接数
                    "sql": "select threads_connected from mysql  where time > now() - 30m  and code= '" + region_key + "' and server= '" + target + "'"
                },
                chartPerm: { "title": "threads_connected", "unit": "", "priority": "f0" }
            }, {
                sqlPerm: { //失败连接数
                    "sql": "select DERIVATIVE(aborted_connects) as aborted_connects from mysql where time > now() - 30m  and code= '" + region_key + "' and server= '" + target + "'"
                },
                chartPerm: { "title": "aborted_connects", "unit": "PS", "priority": "f1" }
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
            chartPerm: { "title": "bytes_read", "unit": "bytes_rate", "priority": "a0" }
        }, {
            sqlPerm: { //写流量
                "sql": "select DERIVATIVE(bytes_written) as bytes_written  from memcached where time > now() - 30m"
            },
            chartPerm: { "title": "bytes_written", "unit": "bytes_rate", "priority": "a1" }
        }, {
            sqlPerm: { //当前连接数
                "sql": "select curr_connections from memcached where time > now() - 30m"
            },
            chartPerm: { "title": "curr_connections", "unit": "", "priority": "a2" }
        }]
    }
};
//物理主机的监控
exports.hostAreaChartSqlParams = function(regionKey,hostId,filterData, target,type) {
    let params = {
        "region":regionKey,
        "hostId":hostId,
        "startTimeMillis":filterData.from ? (Date.parse(new Date(filterData.from))) : (new Date(moment().subtract('hours',0.5).format('YYYY-MM-DD HH:mm:ss'))).getTime(),
        "endTimeMillis":filterData.to ? (Date.parse(new Date(filterData.to))) : (new Date(moment().format('YYYY-MM-DD HH:mm:ss'))).getTime(),
        "precision":filterData.precision
    };

    let linuxChartSqls = {
        cpu: [{
            sqlPerm:function(){
                let _params = angular.copy(params);
                _params.chart = "cpu";
                return _params;
            }(),
            chartPerm: { "title": "", "unit": "percent", "priority": "a0","legend":true },
        }],
        mem: [{
            sqlPerm:function(){
                let _params = angular.copy(params);
                _params.chart = "memory";
                return _params;
            }(),
            chartPerm: { "title": "", "unit": "percent", "priority": "a1","legend":true }
        }],
        diskPath: [{
            sqlPerm:function(){
                let _params = angular.copy(params);
                _params.chart = "disk";
                _params.path = target;
                return _params;
            }(),
            chartPerm: { "title": "", "unit": "percent", "priority": "b0","legend":true }
        }],
        diskio: [{
            sqlPerm:function(){
                let _params = angular.copy(params);
                _params.chart = "disk.rate"; //磁盘IO
                _params.disk = target;
                return _params;
            }(),
            chartPerm: { "title": "", "unit": "次/s", "priority": "b1","legend":true }
        },{
            sqlPerm:function(){
                let _params = angular.copy(params);
                _params.chart = "disk.throughput"; //磁盘吞吐
                _params.disk = target;
                return _params;
            }(),
            chartPerm: { "title": "", "unit": "Bps", "priority": "b2","legend":true }
        }],
        netcard: [{
            sqlPerm:function(){
                let _params = angular.copy(params);
                _params.chart = "net.traffic"; //网络流量
                _params.interface = target;
                return _params;
            }(),
            chartPerm: { "title": "", "unit": "bytes", "priority": "c0","legend":true }
        },{
            sqlPerm:function(){
                let _params = angular.copy(params);
                _params.chart = "net.packet.rate", 
                _params.interface = target;
                return _params;
            }(),
            chartPerm: { "title": "", "unit": "个/s", "priority": "c1","legend":true}
        },{
            sqlPerm:function(){
                let _params = angular.copy(params);
                _params.chart = "net.bandwidth.rate", //网络带宽
                _params.interface = target;
                return _params;
            }(),
            chartPerm: { "title": "", "unit": "bps", "priority": "c2","legend":true }
        }]
    };
    let winSysChartSqls = {
        cpu: [{
            sqlPerm:function(){
                let _params = angular.copy(params);
                _params.chart = "cpu";
                return _params;
            }(),
            chartPerm: { "title": "", "unit": "percent", "priority": "a0","legend":true },
        }],
        mem: [{
            sqlPerm:function(){
                let _params = angular.copy(params);
                _params.chart = "memory";
                return _params;
            }(),
            chartPerm: { "title": "", "unit": "percent", "priority": "a1","legend":true }
        }],
        system: [{
            sqlPerm:function(){
                let _params = angular.copy(params);
                _params.chart = "system.windows";
                return _params;
            }(),
            chartPerm: { "title": "", "unit": "次/s", "priority": "b0","legend":true }
        }],
        diskPath: [{
            sqlPerm:function(){
                let _params = angular.copy(params);
                _params.chart = "disk";
                _params.path = target;
                return _params;
            }(),
            chartPerm: { "title": "disk_usage", "unit": "percent", "priority": "c0","legend":true }
        },{
            sqlPerm:function(){
                let _params = angular.copy(params);
                _params.chart = "disk.queue.windows";
                _params.path = target;
                return _params;
            }(),
            chartPerm: { "title": "current_disk_queue_length", "unit": "个", "priority": "c1","legend":true }
        },{
            sqlPerm:function(){
                let _params = angular.copy(params);
                _params.chart = "disk.time.windows";
                _params.path = target;
                return _params;
            }(),
            chartPerm: { "title": "disk_read_write_percent", "unit": "percent", "priority": "c2","legend":true }
        }],
        netcard: [{
            sqlPerm:function(){
                let _params = angular.copy(params);
                _params.chart = "windows.net.traffic"; 
                _params.interface = target;
                return _params;
            }(),
            chartPerm: { "title": "", "unit": "bps", "priority": "d0","legend":true }
        },{
            sqlPerm:function(){
                let _params = angular.copy(params);
                _params.chart = "windows.net.packet.rate"; 
                _params.interface = target;
                return _params;
            }(),
            chartPerm: { "title": "", "unit": "pps", "priority": "d1","legend":true }
        }]
    };
    if(type == "win"){
        this.chartSqls = winSysChartSqls;
    }else{
        this.chartSqls = linuxChartSqls;
    }
    
};
//时序性数据库
exports.sqlDatabaseParams= function(regionKey,filterData, target,type) {
    //开始和起止事件不传，则选择最近期的半个小时
    let params = {
        "region":regionKey,
        "startTimeMillis":filterData.from ? (Date.parse(new Date(filterData.from))) : (new Date(moment().subtract('hours',0.5).format('YYYY-MM-DD HH:mm:ss'))).getTime(),
        "endTimeMillis":filterData.to ? (Date.parse(new Date(filterData.to))) : (new Date(moment().format('YYYY-MM-DD HH:mm:ss'))).getTime(),
        "precision":filterData.precision
    };

    let chartSqls = {
        disk_usage_avg: [{
            sqlPerm:function(){
                let _params = angular.copy(params);
                _params.chart = "temporal.database";
                _params.column="disk_usage_avg";
                return _params;
            }(),
            chartPerm: { "title": "", "unit": "percent", "priority": "e0","legend":true },
        }],
        index_speed: [{
            sqlPerm:function(){
                let _params = angular.copy(params);
                _params.chart = "temporal.database";
                _params.column="index_speed";
                return _params;
            }(),
            chartPerm: { "title": "", "unit": "次/秒", "priority": "e0","legend":true },
        }],
        index_total: [{
            sqlPerm:function(){
                let _params = angular.copy(params);
                _params.chart = "temporal.database";
                _params.column="index_total";
                return _params;
            }(),
            chartPerm: { "title": "", "unit": "次", "priority": "e0","legend":true },
        }],
    };
    this.chartSqls = chartSqls;
};

exports.echartsColorlDefault = function() {
    this.colors = {
        bar: ["#51a3ff"],
        line: ["#1abc9c", "#2aabfd", "#4a6583", "#e74c3c", "#f39c12"]
    }
};
