var mongoose=require('mongoose');
mongoose.connect('mongodb://localhost:27017/user',{useMongoClient:true,autoIndex:false});
// 这个地方还可以进行多个数据库的连接，connect还是可以传一个options的。
mongoose.Promise=global.Promise;
mongoose.set('debug',true)

const db=mongoose.connection;
db.on('error',(err)=>{
    cnsole.log('err'+err);
})

db.once('open',()=>{
    console.log('ok')
})

module.exports=db;