var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session=require('express-session');
var compression=require('compression');
var cors=require('cors');
// var helmet=require('helmet');
// 这个的使用必须在cookie-parser后面
// var csrf=require('csurf');

var post=require('./routes/post/post')

var mongoStore=require('connect-mongo')(session);
// router
// user
var user=require('./routes/user/userRouter');

// info
var info=require('./routes/info/infoRouter');

var multer=require('multer');
var storage = multer.diskStorage({
  //设置上传后文件路径，uploads文件夹会自动创建。
     destination: function (req, file, cb) {
         cb(null, './uploads')
    }, 
  //给上传文件重命名，获取添加后缀名
   filename: function (req, file, cb) {
       var fileFormat = (file.originalname).split(".");
       cb(null, file.fieldname + '-' + Date.now() + "." + fileFormat[fileFormat.length - 1]);
   }
});  
var upload=multer({
  storage:storage
})
// var csrfProtection=csrf({cookie:true});
var app = express();
app.use(compression());
// app.use(helmet())
// 压缩的要放在最前面
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

app.use(session({
  secret:'newEgg',
  name:'newEgg',
  cookie:{
      path:'/',
      httpOnly:true,
      maxAge:36500*24*3600*1000,
  },
  saveUninitialized:false,
  store:new mongoStore({
    url:'mongodb://localhost:27017/user',
    collection:'sessions',
    ttl:36500*24*3600*1000,
    // 会话有效期，一天：如何设置更长的会话有效时间。
    autoRemove:'native',
    autoRemoveInterval:10,
  }),
}))

app.use('/', express.static('./public/html'));
app.use('/user',user);
app.use('/info',info);
app.use('/post',post)

app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});


app.use(function(err, req, res, next) {
  return res.json({
    code:500,
    msg:'发生了未知的错误',
  })
});


app.listen(6141,function(){
  console.log('localhost://6141==hahahahah')
  // process.send('ready');
})
// module.exports = app;

