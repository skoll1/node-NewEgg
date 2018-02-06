var express=require('express');
var {login}=require('../../db/module.js');
var mongoose=require('mongoose');
var router=express.Router();
var axios=require('axios');



// 登陆
router.post('/signin',function(req,res){
    // console.log(req.body)
    var name=req.body.ShortName
    var password=req.body.Password

    axios({
        method:'PUT',
        url:'http://10.16.75.24:3000/common/v1/domain/security/authentication',
        data:{
            UserName:name,
            Password:password,
        },
        headers:{
            'accept': 'application/json',
            'content-type': 'application/json',
        }
    })
    .then(function(response){
        if(response.data.Result){
            req.session.user=response.data.UserName;
            var User={};
            User.ShortName=req.session.user;
            // user.password=password;
            // console.log(User);
            
            login.findOne({ShortName:User.ShortName},function(err,user){
                console.log(user);
                if(err){
                    console.log('查询出错')
                }
                console.log(user);
                if(!user){
                    console.log('开始保存')
                    let _user=new login(User);
                    _user.save(function(err,user){
                        if(err){
                            return res.json({
                                msg:'登陆失败',
                                code:404,
                                err:err
                            })
                        }else{
                            console.log(user)
                            return res.json({
                                msg:'登陆成功',
                                code:403,
                                info:req.session.user,
                            })
                        }
                    })
                }else if(user.IsUpdate===0){
                    console.log('之前以登陆')
                    res.json({
                        msg:'之前就登陆过，但是需要完善信息',
                        code:403
                    })
                }
                else{
                    console.log(user.IsUpdate)
                    res.json({
                                msg:'信息已完善',
                                code:200
        
                            })
                }
            })
        }else{
            return res.json({
                msg:'请到oc处修改密码',
                code:404
            })
            
        }
    })
    .catch((err)=>{
        return res.json({
            code:500,
            msg:'登陆错误,也有可能是密码被锁了'
        })
    })
})

// 安全退出
router.get('/logout',function(req,res){
    if(req.session.user){
        delete req.session.user;

        res.json({
            msg:'退出成功',
            haha:'真的安全退出了'
        })
    }else{
        res.json({
            msg:'登都没登去哪退出？？？？？',
            code:250,
        })
    }   
})


//返回个人信息
router.get('/person',function(req,res){
    var _user=req.session.user
    console.log(_user)
    login.findOne({ShortName:_user},function(err,user){
        // 这里有个坑
        if(err){
            return res.json({
                code:404,
                msg:'这个人消失在了时间缝隙中。。。'

            })
        }else{
            res.json({
                msg:'个人信息',
                data:user,
                code:200,
            })
        }
    })
})

// 检测是否登陆
router.get('/check',signinRequire,function(req,res){
    var shortName=req.session.user;
    login.findOne({ShortName:shortName},(err,user)=>{
        if(user.IsUpdate==0){
            return res.json({
                code:403,
                msg:'信息不完成，需要重新填写'
            })
        }else{
            return res.json({
                msg:'登陆完成',
                code:200,
                info:req.session.user
            })
        }
    })
})

router.get('/checkTest',signinRequire,(req,res)=>{
    login.findOne({ShortName:req.session.user},(err,user)=>{
        console.log(user);
        if(user.IsUpdate==0){
            return res.json({
                code:403,
                msg:'去完善信息'
            })
        }else{
            return res.json({
                code:200,
                msg:'不仅之前登陆有记录，而且也完善了信息'
            })
        }
    })
})

// 自己玩改成get
router.post('/info',function(req,res){
    var query=req.body.query; 
    console.log(query);
    login.findOne({ShortName:query},(err,user)=>{
        if(err){
            return res.json({
                code:404,
                msg:'这个人消失在了时间缝隙中。。。'

            }) 
        }


        console.log(Boolean(user))
        if(!Boolean(user)){
                return res.json({
                    code:404,
                    msg:'数据库没有这个人'
            })
        }else{
           
            let visit=user.Visit;
            visit+=1;
            user.Visit=visit;

            let User={
                ShortName:user.ShortName,
                Visit:user.Visit,
            }

            user.update(User,(err,response)=>{
                if(err){
                    console.log('失败');
                }else{
                    console.log('更新呢.好了')
                }
            })

            res.json({
                msg:'个人信息',
                data:user,
                code:200,
            })
        }
    })
})


function signinRequire(req,res,next){
    var user=req.session.user;
    console.log(user+'session')
    if(user){
        next()
        // console.log(user.shortName)
    }else{
        return res.json({
            msg:'你没有登录',
            code:400,
        })
    }
}
// 可以通过使用中间件来控制数据的流向节奏





// 图片上传准备
var multer=require('multer');
var storage = multer.diskStorage({
    //设置上传后文件路径，uploads文件夹会自动创建。
     destination: function (req, file, cb) {
           cb(null, './public/uploads')
        //如果这个是字符串的话，必须要你创建这个文件夹。    
      }, 
     
    //给上传文件重命名，获取添加后缀名
     filename: function (req, file, cb) {
         var fileFormat = (file.originalname).split(".");
         cb(null, file.fieldname + '-' + Date.now() + "." + fileFormat[fileFormat.length - 1]);
     }
    //  用于确定文件夹中文件名的确认，如果没有，会为每个文件设置成一个随机文件名，而且没有扩展名。
});  
var upload=multer({
    storage:storage,
})

// var imgUpDate=upload.fields([
//     {name:'Avatar',maxCount:1},
//     {name:'Photograph',maxCount:1},
// ])

router.post('/updateUser',signinRequire,function(req,res){
    // 全部执行update操作
    
    let shortName=req.session.user;
    console.log(shortName)
    var _user=req.body;

    // if(req.files.Photograph && req.files.Photograph.length > 0 && req.files.Photograph[0].filename){
    //     // console.log(req.files.photograph[0].filename)
    //     _user.Photograph=`uploads/${req.files.Photograph[0].filename}`;
    //     // console.log(_user)
    // }
    // if(req.files.Avatar && req.files.Avatar.length>0 && req.files.Avatar[0].filename){
    //     // console.log('有图')
    //     // console.log(req.files.Avatar[0].filename)
    //     _user.Avatar=`uploads/${req.files.Avatar[0].filename}` 
    // }

    console.log(_user)
    axios.get(`http://10.16.75.24:3000/common/v1/domain/user/${shortName}`)
        .then((response)=>{
            delete response.data.Avatar;

            var contributes=response.data.contributes;
            console.log(contributes);

            var User=Object.assign({},response.data,_user);
            User.IsUpdate=1;
            login.findOne({ShortName:shortName},function(err,user){
                    if(err){
                        console.log('数据库查找错误');
                    }
                    console.log(user)
                    user.update(User,function(err,response){
                        if(err){
                            console.log(err)
                            // 数据库更新错误
                        }else{
                            res.json({
                                msg:'更新呢，好了',
                                data:response,
                                code:200,
                            })
                        }
                    })
            })
           
        })
        .catch((error)=>{
            return res.json({
                msg:'现在只能更新你提交的信息，远端数据库请求失败'
            })
     })
})


router.post('/updateAvatar',signinRequire,upload.single('Avatar'),(req,res)=>{
    console.log(req.session.user)
    var ShortName=req.session.user;
    var _user={};
    _user.ShortName=ShortName;
    console.log(req.session.user)
    // if(req.file.Avatar && req.file.Avatar.length>0 && req.file.Avatar[0].filename){
    //     console.log('有图')
    //     // _user.Avatar=`uploads/${req.files.Avatar[0].filename}`  
    // }

    // 判断图片组的方法

    if(req.file.filename){
        console.log('有图片')
        console.log(req.file.filename)
        _user.Avatar=`http://wsmis053:6141/uploads/${req.file.filename}`;

    }
    console.log(_user)
    login.findOne({ShortName:ShortName},(err,user)=>{
        if(err){
            return res.json({
                code:404,
                msg:'未知的错误'
            })
        }

        user.update(_user,(err,response)=>{
            if(err){
                return res.json({
                    code:404,
                    msg:'未知的错误'
                })
            }else{
                return res.json({
                    msg:'更新了图片',
                    data:_user.Avatar
                })
            }
        })
    })
})

router.post('/IndexShowPhotograph',signinRequire,upload.single('IndexShowPhotograph'),(req,res)=>{
    var ShortName=req.session.user;
    var _user={};
 
    _user.ShortName=ShortName;
    
    if(req.file.filename){
        console.log('有图片')
        _user.IndexShowPhotograph=`http://wsmis053:6141/uploads/${req.file.filename}`;
    }
    console.log(_user)
    login.findOne({ShortName:ShortName},(err,user)=>{
        if(err){
            return res.json({
                code:404,
                msg:'未知的错误'
            })
        }
        console.log(user);
        user.update(_user,(err,response)=>{
            if(err){
                return res.json({
                    code:404,
                    msg:'未知的错误'
                })
            }else{
                return res.json({
                    msg:'更新了图片',
                    data:_user.IndexShowPhotograph
                })
            }
        })
    })
})

router.post('/Photograph1',signinRequire,upload.single('Photograph1'),(req,res)=>{
    var ShortName=req.session.user;
    var _user={};
 
    _user.ShortName=ShortName;
    
    if(req.file.filename){
        _user.Photograph1=`http://wsmis053:6141/uploads/${req.file.filename}`;
    }
    console.log(_user)
    login.findOne({ShortName:ShortName},(err,user)=>{
        if(err){
            return res.json({
                code:404,
                msg:'未知的错误'
            })
        }
        console.log(user);
        user.update(_user,(err,response)=>{
            if(err){
                return res.json({
                    code:404,
                    msg:'未知的错误'
                })
            }else{
                return res.json({
                    msg:'更新了图片',
                    data:_user.Photograph1
                })
            }
        })
    })
})

router.post('/Photograph2',signinRequire,upload.single('Photograph2'),(req,res)=>{
    var ShortName=req.session.user;
    var _user={};
 
    _user.ShortName=ShortName;
    
    if(req.file.filename){
        _user.Photograph2=`http://wsmis053:6141/uploads/${req.file.filename}`;
    }
    console.log(_user)
    login.findOne({ShortName:ShortName},(err,user)=>{
        if(err){
            return res.json({
                code:404,
                msg:'未知的错误'
            })
        }
        console.log(user);
        user.update(_user,(err,response)=>{
            if(err){
                return res.json({
                    code:404,
                    msg:'未知的错误'
                })
            }else{
                return res.json({
                    msg:'更新了图片',
                    data:_user.Photograph2
                })
            }
        })
    })
})

router.post('/Photograph3',signinRequire,upload.single('Photograph3'),(req,res)=>{
    var ShortName=req.session.user;
    var _user={};
 
    _user.ShortName=ShortName;
    
    if(req.file.filename){
        _user.Photograph3=`http://wsmis053:6141/uploads/${req.file.filename}`;
    }
    console.log(_user)
    login.findOne({ShortName:ShortName},(err,user)=>{
        if(err){
            return res.json({
                code:404,
                msg:'未知的错误'
            })
        }
        console.log(user);
        user.update(_user,(err,response)=>{
            if(err){
                return res.json({
                    code:404,
                    msg:'未知的错误'
                })
            }else{
                return res.json({
                    msg:'更新了图片',
                    data:_user.Photograph3
                })
            }
        })
    })
})

module.exports=router;