/*
超融合模式下的网卡和磁盘配置信息
 */
window.hyperConfig =[
        // {
        //     "name":"M系列",
        //     "nic_map":{
        //         "cluster":"enp4s0f1",
        //         "storage":"ens11f0",
        //         "public":"enp4s0f0",
        //         "tenant":"ens11f1",
        //         "mgmt":"enp4s0f0"
        //     },
        //     "bonds":{},
        //     "disk_config":[
        //         {
        //             "ceph_ssd":"",
        //             "root":"",
        //             "mode":"journal_collocation",
        //             "ceph_osd":"/dev/sda, /dev/sdb, /dev/sdc"
        //         }
        //     ]
        // },
        {
            "name":"S系列",
            "nic_map":{
                "cluster":"bond1",
                "storage":"bond2",
                "public":"bond0",
                "tenant":"bond3",
                "mgmt":"bond0"
            },
            "bonds":{
                "bond0":{
                    "nics":[
                        "ens2f0",
                        "enp3s0f0"
                    ],
                    "mode":"active-backup"
                },
                "bond1":{
                    "nics":[
                        "ens2f1",
                        "enp3s0f1"
                    ],
                    "mode":"active-backup"
                },
                "bond2":{
                    "nics":[
                        "ens2f2",
                        "enp3s0f2"
                    ],
                    "mode":"active-backup"
                },
                "bond3":{
                    "nics":[
                        "ens2f3",
                        "enp3s0f3"
                    ],
                    "mode":"active-backup"
                }
            },
            "disk_config":[
                {
                    "ceph_ssd":"/dev/sdb",
                    "root":"",
                    "mode":"journal_collocation",
                    "ceph_osd":"/dev/sdc, /dev/sdd, /dev/sde, /dev/sdf"
                }
            ]
        },
        {
            "name":"D系列(单网卡模式)",
            "nic_map":{
                "cluster":"ens11f1",
                "storage":"ens11f2",
                "public":"ens11f0",
                "tenant":"ens11f3",
                "mgmt":"ens11f0"
            },
            "bonds":{},
            "disk_config":[
                {
                    "ceph_ssd":"/dev/sdb",
                    "root":"",
                    "mode":"journal_collocation",
                   "ceph_osd":"/dev/sdc, /dev/sdd, /dev/sde, /dev/sdf"
                }
            ]
        },
        {
            "name":"D系列(网卡冗余模式)",
            "nic_map":{
                "cluster":"bond1",
                "storage":"bond2",
                "public":"bond0",
                "tenant":"bond3",
                "mgmt":"bond0"
            },
            "bonds":{
                "bond0":{
                    "nics":[
                        "ens11f0",
                        "enp6s0f0"
                    ],
                    "mode":"active-backup"
                },
                "bond1":{
                    "nics":[
                        "ens11f1",
                        "enp6s0f1"
                    ],
                    "mode":"active-backup"
                },
                "bond2":{
                    "nics":[
                        "ens11f2",
                        "enp6s0f2"
                    ],
                    "mode":"active-backup"
                },
                "bond3":{
                    "nics":[
                        "ens11f3",
                        "enp6s0f3"
                    ],
                    "mode":"active-backup"
                }
            },
            "disk_config":[
                {
                    "ceph_ssd":"/dev/sdb",
                    "root":"",
                    "mode":"journal_collocation",
                   "ceph_osd":"/dev/sdc, /dev/sdd, /dev/sde, /dev/sdf"
                }
            ]
        },
        {
            "name":"D系列-A(单网卡模式)",
            "nic_map":{
                "cluster":"ens2f1",
                "storage":"ens2f2",
                "public":"ens2f0",
                "tenant":"ens2f3",
                "mgmt":"ens2f0"
            },
            
            "bonds":{},
            "disk_config":[
                {
                    "ceph_ssd":"/dev/sdb",
                    "root":"",
                    "mode":"journal_collocation",
                    "ceph_osd":"/dev/sdc, /dev/sdd, /dev/sde, /dev/sdf"
                }
            ]
        },
        {
            "name":"D系列-A(网卡冗余模式)",
            "nic_map":{
                "cluster":"bond1",
                "storage":"bond2",
                "public":"bond0",
                "tenant":"bond3",
                "mgmt":"bond0"
            },
            "bonds":{
                "bond0":{
                    "nics":[
                        "ens2f0",
                        "ens1f0"
                    ],
                    "mode":"active-backup"
                },
                "bond1":{
                    "nics":[
                        "ens2f1",
                        "ens1f1"
                    ],
                    "mode":"active-backup"
                },
                "bond2":{
                    "nics":[
                        "ens2f2",
                        "ens1f2"
                    ],
                    "mode":"active-backup"
                },
                "bond3":{
                    "nics":[
                        "ens2f3",
                        "ens1f3"
                    ],
                    "mode":"active-backup"
                }
            },
            "disk_config":[
                {
                    "ceph_ssd":"/dev/sdb",
                    "root":"",
                    "mode":"journal_collocation",
                    "ceph_osd":"/dev/sdc, /dev/sdd, /dev/sde, /dev/sdf"
                }
            ]
        },
        {
            "name":"H系列",
            "nic_map":{
                "cluster":"bond1",
                "storage":"bond2",
                "public":"bond0",
                "tenant":"bond3",
                "mgmt":"bond0"
            },
            "bonds":{
                "bond0":{
                    "nics":[
                        "ens11f0",
                        "enp6s0f0"
                    ],
                    "mode":"active-backup"
                },
                "bond1":{
                    "nics":[
                        "ens11f1",
                        "enp6s0f1"
                    ],
                    "mode":"active-backup"
                },
                "bond2":{
                    "nics":[
                        "ens11f2",
                        "enp6s0f2"
                    ],
                    "mode":"active-backup"
                },
                "bond3":{
                    "nics":[
                        "ens11f3",
                        "enp6s0f3"
                    ],
                    "mode":"active-backup"
                }
            },
            "disk_config":[
                {
                    "ceph_ssd":"/dev/sdb",
                    "root":"",
                    "mode":"journal_collocation",
                   "ceph_osd":"/dev/sdc, /dev/sdd, /dev/sde, /dev/sdf"
                }
            ]
        },
        
    ]