var express = require('express');
const layout = 'admin-layout'
const productHelpers=require('../helpers/product-helpers')
const db = require("../model/connection");
const voucher_codes = require('voucher-code-generator');
module.exports={
    getBanner:async(req,res)=>{
        let banners=await db.banners.find({})
        res.render('admin/banner',{layout,banners})
    },
    getMainBanner:(req,res)=>{
        res.render('admin/mainBanner',{layout})
    },
    addMainBanner:(req,res)=>{
        const files=req.files
        const fileName=files.map((file)=>{
            return file.filename
        })
        const bannerData=req.body
        bannerData.image=fileName
        console.log(bannerData,'this is my data');
        productHelpers.addMainBanner(bannerData).then(()=>{
            res.redirect('/admin/banner')
        })
        
    },
    deleteBanner:(req,res)=>{
        let bannerId=req.params.id
        productHelpers.removeMainBanner(bannerId).then((data)=>{
            // res.send({status:true})
            res.redirect('/admin/banner')
        }).catch((error)=>{
            res.send({status:false,error:error})
        })
    },
    editManinBanner:(req,res)=>{
     
            productHelpers.editMainBanner(bannerId).then((data)=>{
                res.redirect('/admin/banner')
            }).catch((error)=>{
                res.send({error:error})
            })
        
    },
    getCoupenCode:(req,res)=>{
        try {
           let code = voucher_codes.generate({
                length: 15,
                count: 1,
                prefix: "dressup-",
               
            });
            res.send({code:code})
        } catch (error) {
            res.send({error:"Some error occured"})
        }
    }
}