* 前端项目脚手架

脚手架依赖 nodejs@5.x 及以上和 npm@3.x 及以上，在墙内开发可能需要添加 cnpm 作为镜像源

cnpm 安装
```bash
npm install cnpm -g --registry=https://registry.npm.taobao.org
```

安装好 node 以及 npm 后，在项目根目录安装依赖
```bash
npm i
```
或者
```bash
cnpm i
```

预设运行命令

```bash
npm run build
```
生成编译出的目标文件到 built 目录

```bash
npm run dev
```
生成编译出的目标文件到 built 目录，并开始监控 webpack 配置中的 entry 文件列表

```bash
npm run start
```
生成编译出的目标文件，并监控 webpack 配置中的文件列表，但不写入 built 目录；同时创建本地 web 服务器 http://localhost:56789/ ，方便直接上手开发