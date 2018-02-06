var mongoose=require('mongoose');
var loginSchema=new mongoose.Schema({
    ShortName:{
        type:String,
        require:true,
    },
    CName:{
        type:String,
        require:true,
    },
    EName:{
        type:String,
        reurie:true
    },
    Avatar:{
        type:String,
        default:'http://www.gx8899.com/uploads/allimg/160804/3-160P4111639.jpg',
        require:true,
    },
    Photograph1:{
        type:String,
        require:true,
        default:'http://img.hb.aicdn.com/878bcfdf964345f2aba707a01bb87c84a5fac10c1f4f0-tzoR1H_fw658'
        ,
    },
    Photograph2:{
        type:String,
        require:true,
        default:'http://img.hb.aicdn.com/a117393c570026946b9184daa9715253eb46d1067c560-er7jVl_fw658'
        ,
    },
    Photograph3:{
        type:String,
        require:true,
        default:'http://img.hb.aicdn.com/a8d1d7cacb6175a19ba6df6cd87bec4f66ac4bb4a87b4-SztuMm_fw658'
        ,
    },

    // 0 普通用户
    // 1 超级管理员
    Role:{
        type:Number,
        default:0,
        require:true,
    },
    meta:{
        createAt:{
            type:Date,
            default:Date.now()
        },
        updateAt:{
            type:Date,
            default:Date.now()
        }
    },
    Job:{
        type:String,
        require:true,
    },
    PhoneNumber:{
        type:String,
        require:true,
    },
    HireDate:{
        type:String,
        require:true,
    },
    Sex:{
        type:String,
        require:true,
        enum:['男','女','其他']
    },
    IsSingle:{
        type:String,
        require:true,
        enum:['单身','找到了另一半']
    },
    IsWork:{
        type:String,
        default:'在职',
        require:true,
        enum:['在职','离职']
    },
    Hometown:{
        type:String,
        require:true,
    },
    Signature:{
        type:String,
        require:true,
    },
    Contributes:[
        {
            startTime:Date,
            endTime:Date,
            duty:String,
        }
    ],
    Visit:{
        type:Number,
        default:0,
        require:true,
    },
    Country:{
        type:String,
        default:"中国"
    },
    Hobbies:{
        type:Array,
        default:['琴','棋','书','画']
    },
    Tags:{
        type:Array,
        default:['爱学习','爱工作','爱自由']
    },
    Skills:{
        type:Array,
        default:['吃','喝','玩','乐']
    },
    Age:{
        type:String,
        require:true,
        default:"我的年龄你别猜"
    },
    Domain:{
        type:String,
        require:true,
        default:'WWW Dev'
    },
    // 数据库抓来
    FullName:{
        type:String,
        require:true
    },
    DisplayName:{
        type:String,
        require:true,
    },
    Email:{
        type:String,
        require:true
    },
    EmployeeID:{
        type:String,
        require:true
    },
    Department:{
        type:String,
        require:true
    },
    Company:{
        type:String,
        require:true
    },
    TelephoneNumber:{
        type:String,
        require:true
    },
    Title:{
        type:String,
        require:true
    },
    Groups:{
        type:Array,
        require:true
    },
    GitHub:{
        type:String,
        retuire:true,
    },
    Confluence:{
        type:String,
        require:true,
    },
    WeiBo:{
        type:String,
        require:true,
    },
    WeChat:{
        type:String,
        require:true,
    },
    LinkedIn:{
        type:String,
        require:true,
    },
    Twitter:{
        type:String,
        require:true,
    },
    IndexShowPhotograph:{
        type:String,
        require:true,
        default:'http://img.hb.aicdn.com/462f07883ed8a00729b89e0e11da56264f5d6a391884cb-EKAEeC_fw658'
        ,
    },
    IsUpdate:{
        type:Number,
        default:0,
        retuqire:true,
    },
    ShGit:{
        type:String,
        require:true,
    }
})
// 是这个里面可以加options


loginSchema.pre('save',function(next){
    var user=this;
    console.log(this);
    if(this.isNew){
        this.meta.createAt=this.meta.updateAt=Date.now()
    }else{
        this.meta.updateAt=Date.now()
    }
    next()

    // 白加盐了
    // bcrypt.genSalt(SALT_WORK_FAXTOR,function(err,salt){
    //     if(err){
    //         return next(err);
    //     }
    //     bcrypt.hash(user.password,salt,function(err,hash){
    //         if(err){
    //             return next(err);
    //         }
    //         user.password=hash;
    //         next();
    //     })
    // })
})
// loginSchema.methods={
//     comparePassword:function(_password,cb){
//         bcrypt.compare(_password,this.password,function(err,isMatch){
//             if(err){
//                 return cb(err);
//             }
//             cb(null,isMatch);
//         })
//     }
// }

// 
// loginSchema.statics={
//     fetch:function(cb){
//         return this
//                 .find({})
//                 .sort('meta.updateAt')
//         exec(cb)
//     },
//     findByName:function(name,cb){
//         return this
//                  .findOne({name:name})
//                  exec(cb)
//     }
// }

module.exports=loginSchema;
