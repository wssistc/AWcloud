var login = require('./test/loginAction');
exports.config = {
    framework: 'jasmine',
    baseUrl: 'http://localhost:8888/',
    suites: {
        createVm: './test/cvm/instances/test_vm_create.js',
        bootVm: './test/cvm/instances/test_vm_boot.js',
        shutdownVm: './test/cvm/instances/test_vm_shutdown.js',
        vmConsole: './test/cvm/instances/test_vm_console.js',
        rebootVm: './test/cvm/instances/test_vm_reboot.js',
        deleteVm: './test/cvm/instances/test_vm_delete.js',
        pauseVm: './test/cvm/instances/test_vm_pause.js',
        unpauseVm: './test/cvm/instances/test_vm_unpause.js',
        hangVm: './test/cvm/instances/test_vm_hang.js',
        unhangVm: './test/cvm/instances/test_vm_unhang.js',
        migrateVm: './test/cvm/instances/test_vm_migrate.js',
        resizeVm: './test/cvm/instances/test_vm_resize.js',
        uploadImage:'./test/cvm/images/test_image_upload.js',
        creteVmFromImage:'./test/cvm/images/test_image_createVm.js',
        editImage:'./test/cvm/images/test_image_edit.js',
        deleteImage:'./test/cvm/images/test_image_delete.js',
        clearVm:'./test/cvm/recycle/test_vm_clear.js',
        restoreVm:'./test/cvm/recycle/test_vm_restore.js'
    },
    allScriptsTimeout: 30000,
    specs: [
        //'test/test.js',
        //'test/UHostTest/*.js',
        //'test/volumes/*.js',
        //'test/systemManage/*.js'
        //'test/networks/network/*.js',
        //'test/networks/router/*.js',
        //'test/networks/floatingip/*.js',
        //'test/networks/firewall/*.js',
        //'test/networks/securityGroup/*.js',
        //'test/networks/keypair/*.js',
        //'test/monitor/alarmEvent/*.js',
        //'test/monitor/alarmSetting/*.js',
        //'test/monitor/alarmTmpl/*.js',
        //'test/monitor/contractGroup/*.js',
        //'test/cvm/instances/*.js',
        //'test/logout.spec.js'
    ],
    jasmineNodeOpts: {
        showColors: true
    },
    onPrepare: function() {
        var Jasmine2HtmlReporter = require('protractor-jasmine2-html-reporter');
        jasmine.getEnv().addReporter(new Jasmine2HtmlReporter({
           savePath: './test/reports/',
           screenshotsFolder: './test/reports/images',
           takeScreenshots: false,
           takeScreenshotsOnlyOnFailures: false
        }));

        browser.get('http://localhost:22555');
		let username = element(by.model('login.username'))
		let enterpriseLoginName = element(by.model('login.enterpriseLoginName'))
		let password = element(by.model('login.password'))
		let submit = element(by.css('.login-form .btn.btn-primary[type="submit"]'))

		username.sendKeys('admin')
		password.sendKeys('Awcloud!23')
		enterpriseLoginName.sendKeys('awcloud888')
		submit.click()

		return browser.driver.wait(function() {
			return browser.driver.getCurrentUrl().then(function(url) {
				return url === 'http://localhost:22555/#/view';
			});
		}, 3000);
    }
}
