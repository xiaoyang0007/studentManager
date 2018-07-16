// 导入模块
let express = require('express');
// 引入验证码插件
let svgCaptcha = require('svg-captcha');
// 导入路径模块
let path = require('path');
// 导入session模块
let session = require('express-session');
// 导入body-parser
let bodyParser = require('body-parser');
// 导入mongoDB
const MongoClient = require('mongodb').MongoClient

const url = 'mongodb://localhost:27017';

const dbName = 'mongodb';

// 创建app
let app = express();
// 设置托管静态资源
app.use(express.static('static'));

app.use(session({
    secret: 'keyboard cat love weilonglatiao'
}))

// 使用 bodyParser 中间件
app.use(bodyParser.urlencoded({
    extended: false
}))

// 使用get方法 访问登录页面时 直接读取登录页面 并返回
app.get('/login', (req, res) => {
    // 读取文件并返回
    res.sendFile(path.join(__dirname, 'static/views/login.html'))
})

// 使用post 提交数据过来 验证用户登录
app.post('/login', (req, res) => {
        // 获取form表单提交的数据
        let userName = req.body.userName;
        let userPass = req.body.userPass;
        // 验证码
        let code = req.body.code;
        if (code == req.session.captcha) {
            // console.log("验证码正确");
            // 设置session
            req.session.userInfo = {
                userName,
                userPass
            }
            res.redirect('/index');
        } else {
            // console.log("失败");
            res.setHeader('content-type', 'text/html');
            res.send('<script>alert("验证码失败");window.location.href="/login"</script>');
        }
        // res.send('/login')
    })
    // 生成图片的功能
    // 把地址设置给登录页面的图片的src属性
app.get('/login/captchaImg', (req, res) => {
    var captcha = svgCaptcha.create();
    // 打印验证码
    console.log(captcha.text);
    // 为了比较时简单 直接转为小写
    req.session.captcha = captcha.text.toLocaleLowerCase();
    res.type('svg');
    res.status(200).send(captcha.data);
})

// 访问首页
app.get('/index', (req, res) => {
    // 如果有session
    if (req.session.userInfo) {
        // 访问首页
        res.sendFile(path.join(__dirname, 'static/views/index.html'));
    } else {
        // 没有 去登录页
        res.setHeader('content-type', 'text/html');
        res.send('<script>alert("验证码失败");window.location.href="/login"</script>');
    }
})

// 登出操作
// 删除session值
app.get('/logout', (req, res) => {
        delete req.session.userInfo;
        // 去登录页
        res.redirect('/login')
    })
    // 展示注册页面
app.get('/register', (req, res) => {
        // 返回注册页
        res.sendFile(path.join(__dirname, 'static/views/register.html'));
    })
    // 用户注册
app.post('/register', (req, res) => {
        // 获取用户数据
        let userName = req.body.userName;
        let userPass = req.body.userPass;

        MongoClient.connect(url, function(err, client) {
            const db = client.db(dbName);
            // 选择要使用的库
            const collection = db.collection('mongodb');
            // 查询数据
            collection.find({
                userName
            }).toArray(function(err, docs) {
                if (docs.length == 0) {
                    //    如果没有就新增数据
                    collection.insertOne({
                        userName,
                        userPass
                    }, (err, result) => {
                        console.log(err);
                        // 注册成功了
                        res.setHeader('content-type', 'text/html');
                        res.send("<script>alert('注册成功');window.location='/login'</script>")
                            //  关闭数据连接
                        client.close();
                    })
                }
            });

        });
    })
    // 开始监听
app.listen(38, '127.0.0.1', () => {
    console.log('success');
})