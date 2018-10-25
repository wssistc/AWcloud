'use strict'

let gulp = require('gulp'),
  rename = require('gulp-rename'),
	del = require('del');

gulp.task('icon', cb => {
	return gulp.src('./src/favicon.ico')
		.pipe(gulp.dest('./built'))
})

gulp.task('html', cb => {
	return gulp.src(['./src/**/*.html','!./src/js/authprivate/tmpl/*.*','!./src/registerprivate/*.*','!./src/js/registerprivate/tmpl/*.*'])
		.pipe(gulp.dest('./built'))
})

gulp.task('privatehtml', cb => {
	return gulp.src(['./src/**/*.html','!./src/js/auth/tmpl/*.*','!./src/js/authprivate/tmpl/*.*','!./src/registerprivate/*.*','!./src/register/*.*','!./src/js/registerprivate/tmpl/*.*','!./src/js/register/tmpl/*.*'])
		.pipe(gulp.dest('./built/'))
})


gulp.task('flow', cb => {
  return gulp.src('./src/flow/**/*.*')
    .pipe(gulp.dest('./built/flow'))
})


gulp.task('console', cb => {
  return gulp.src('./src/console/**/*.*')
    .pipe(gulp.dest('./built/console'))
})

gulp.task('thegraph', cb => {
  return gulp.src('./src/thegraph/**/*.*')
    .pipe(gulp.dest('./built/thegraph'))
})
gulp.task('configjs', cb => {
	return gulp.src('./src/js/config.js')
		.pipe(gulp.dest('./built/js'))
})

gulp.task('publicconfigjs', function() {
    return gulp.src('./src/js/config-public.js')
        .pipe(rename('config.js'))
        .pipe(gulp.dest('./built/js'))
});

gulp.task('authname',function(){
  return gulp.src('./src/js/authprivate/tmpl/*.*')
         .pipe(gulp.dest('./built/js/auth/tmpl'))
})

gulp.task('authjs', function() {
    return gulp.src('./built/js/authprivate.js')
        .pipe(rename('auth.js'))
        .pipe(gulp.dest('./built/js'))
});

gulp.task('registerjs', function() {
    return gulp.src('./built/js/registerprivate.js')
        .pipe(rename('register.js'))
        .pipe(gulp.dest('./built/js'))
});

gulp.task('regtpl',function(){
  return gulp.src('./src/js/registerprivate/tmpl/*.*')
         .pipe(gulp.dest('./built/js/register/tmpl'))
})
gulp.task('regindex',function(){
  return gulp.src('./src/registerprivate/index.html')
         .pipe(gulp.dest('./built/register'))
})

gulp.task('del',function(){
    del(['./built/js/authprivate.js','./built/js/auth.js.map','./built/js/registerprivate.js','./built/js/register.js.map']);
});



//通用模块
gulp.task("move",function(){
  //favicon.ico
  gulp.src('./src/favicon.ico')
    .pipe(gulp.dest('./built'))

  //公用html
  gulp.src([
    './src/**/*.html',
    './src/**/*.xlsx',
    '!./src/js/auth/**/*.*',
    '!./src/js/authprivate/**/*.*',
    '!./src/js/register/**/*.*',
    '!./src/js/registerprivate/**/*.*',
    '!./src/js/datacenter/**/*.*',
    '!./src/register/**/*.*',
    '!./src/registerprivate/*.*',
    '!./src/datacenter/*.*'
    ])
    .pipe(gulp.dest('./built'))
  
  //工作流
  gulp.src('./src/flow/**/*.*')
    .pipe(gulp.dest('./built/flow'))

  //第三方js库
  gulp.src('./src/frontend_static/**/*.*')
    .pipe(gulp.dest('./built/frontend_static'))

  //vmware控制台
  gulp.src('./src/console/**/*.*')
    .pipe(gulp.dest('./built/console'))

  //拓扑图
  gulp.src('./src/thegraph/**/*.*')
    .pipe(gulp.dest('./built/thegraph'))

  //拓扑图图片
  gulp.src('./src/images/topo/*.*')
    .pipe(gulp.dest('./built/img/topo/'))

  gulp.src('./src/images/topo/*.*')
    .pipe(gulp.dest('./built/images/topo/'))

  gulp.src('./src/images/logo_oem/*.*')
    .pipe(gulp.dest('./built/images/logo_oem/'))
  
})



//下沉版
gulp.task("priHtmlMove",function(){
  //登录页面html
  gulp.src('./src/js/authprivate/tmpl/*.*')
    .pipe(gulp.dest('./built/js/auth/tmpl'))

  //节点注册页面html
  gulp.src('./src/js/registerprivate/tmpl/*.*')
    .pipe(gulp.dest('./built/js/register/tmpl/'))

  gulp.src('./src/registerprivate/*.*')
    .pipe(gulp.dest('./built/register/'))

})


//paas版
gulp.task("paasHtmlMove",function(){
  //登录页面html
  gulp.src('./src/js/authprivate/tmplpaas/*.*')
    .pipe(gulp.dest('./built/js/auth/tmpl'))

  //节点注册页面html
  gulp.src('./src/js/registerprivate/tmpl/*.*')
    .pipe(gulp.dest('./built/js/register/tmpl/'))

  gulp.src('./src/registerprivate/*.*')
    .pipe(gulp.dest('./built/register/'))

})

//非下沉版
gulp.task("defHtmlMove",function(){
  //登录页面html
  gulp.src('./src/js/auth/tmpl/*.html')
    .pipe(gulp.dest('./built/js/auth/tmpl'))

  //节点注册页面html
  gulp.src('./src/js/register/tmpl/*.*')
    .pipe(gulp.dest('./built/js/register/tmpl/'))

  gulp.src('./src/register/*.*')
    .pipe(gulp.dest('./built/register/'))

  gulp.src('./src/datacenter/*.*')
    .pipe(gulp.dest('./built/datacenter/'))

  gulp.src('./src/js/datacenter/tmpl/*.*')
    .pipe(gulp.dest('./built/js/datacenter/tmpl/'))

})

//default config.js
gulp.task("defConfMove",function(){
  gulp.src('./src/js/config.js')
    .pipe(gulp.dest('./built/js'))
  gulp.src('./src/js/hyperConfig.js')
    .pipe(gulp.dest('./built/js'))

})

//paas config.js
gulp.task("paasConfMove",function(){
  gulp.src('./src/js/config-paas.js')
    .pipe(rename('config.js'))
    .pipe(gulp.dest('./built/js'))
  gulp.src('./src/js/hyperConfig.js')
    .pipe(gulp.dest('./built/js'))

})

//public config.js
gulp.task("pubConfMove",function(){
  gulp.src('./src/js/config-public.js')
    .pipe(rename('config.js'))
    .pipe(gulp.dest('./built/js'))
  gulp.src('./src/js/hyperConfig.js')
    .pipe(gulp.dest('./built/js'))

})

gulp.task("maxscreen",function(){
  gulp.src('./src/maxscreen/*.*')
    .pipe(gulp.dest('./built/maxscreen/'))
})

//单独打包的节点注册下发
/*
./src/js/registerprivate/tmpl/*.* //模板文件
./src/registerprivate //入口html文件
./src/registerprivate //入口html文件
*/
gulp.task('regdist', cb => {

  /*---------------src---------------*/
  //favicon.ico
  gulp.src('./src/favicon.ico')
    .pipe(gulp.dest('./built/regdist/'))

  //第三方js库
  gulp.src('./src/frontend_static/**/*.*')
    .pipe(gulp.dest('./built/regdist/frontend_static'))

  //节点注册页面html
  gulp.src('./src/js/registerprivate/tmpl/*.*')
    .pipe(gulp.dest('./built/regdist/js/register/tmpl/'))

  //注册入口html
  gulp.src('./src/registerprivate/*.*')
    .pipe(gulp.dest('./built/regdist/'))

  /*---------------src end---------------*/

  /*---------------编译后 built---------------*/
  //css
  gulp.src(['./built/css/register.css','./built/css/common.css'])
    .pipe(gulp.dest('./built/regdist/css/'))

  //img
  gulp.src(['./built/img/*.*'])
    .pipe(gulp.dest('./built/regdist/img/'))

  //业务逻辑js
  gulp.src(['./built/js/register.js','./built/js/common.js','./src/js/config.js','./src/js/hyperConfig.js'])
    .pipe(gulp.dest('./built/regdist/js/'))
})

gulp.task('default', ['move','defHtmlMove','defConfMove'])

gulp.task('private', ['move','priHtmlMove','defConfMove'])

gulp.task('public', ['move','defHtmlMove','pubConfMove'])

gulp.task('paas', ['move','paasHtmlMove','paasConfMove'])

gulp.task('distributed', ['regdist'])


