// 导入模块
let express = require('express');
// 引入验证码插件
let svgCaptcha = require('svg-captcha');
// 导入路径模块
let path = require('path');
// 创建app
let app = express();
// 设置托管静态资源
app.use(express.static('static'));

// 使用get方法 访问登录页面时 直接读取登录页面 并返回
app.get('/login', (req, res) => {
        // 读取文件并返回
        res.sendFile(path.join(__dirname, 'static/views/login.html'))
    })
    // 生成图片的功能
    // 把地址设置给登录页面的图片的src属性
app.get('/login/captchaImg', (req, res) => {
    var captcha = svgCaptcha.create();
    // 打印验证码
    console.log(captcha.text);
    res.type('svg');
    res.status(200).send(captcha.data);
})

// 开始监听
app.listen(38, '127.0.0.1', () => {
    console.log('success');
})