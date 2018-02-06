var express=require('express');
var login=require('../../db/module.js');
var mongoose=require('mongoose');
var router=express.Router();
var axios=require('axios');

var csrf = require('csurf')
var csrfProtection = csrf({ cookie: true })

router.get('/test',(req,res)=>{
    return res.json({
        data:'haha'
    })
})

router.post('/postTest',(req,res)=>{
    var _user=req.session.user;
    return res.json({
        data:_user
    })
})

module.exports=router;