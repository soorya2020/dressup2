var express = require('express');
const adminHelpers = require('../helpers/adminHelpers');
const productHelpers = require('../helpers/product-helpers');
const cartHelpers = require('../helpers/cartHelpers');
const layout = 'admin-layout'

module.exports={
    

    dashboard:function (req, res, next) {
        res.render('admin/admin_page', {
          layout
        })
      },
      
    viewProducts:(req, res) => {
          productHelpers.getAllProducts().then((products) => {
            res.render('admin/products', {
              products: products,
              layout: layout
            })
            // console.log(products)
          })
        },

    getAddProducts:(req, res) => {
      console.log(req.body,"this is my producst");
        adminHelpers.getAllCatagories().then((category)=>{
          res.render('admin/add_product',{layout,category})
        })
        
      },

    
    addProducts:(req, res) => {
      try {
        
        const files = req.files
        const fileName = files.map((file) => {
          return file.filename
        })
        const product = req.body
        product.img = fileName
  
        productHelpers.addProducts(product).then((response)=>{
          res.redirect('/admin/products')
        }).catch((error)=>{
          res.render('error',{errmessage:error.message})
        })
      } catch (error) {
        res.render('error',{errmessage:error.message})
      }

     
      
      },

    deleteProduct:(req, res) => {
        let prodId = req.params.id
        cartHelpers.removeProduct(prodId)
        productHelpers.deleteProduct(prodId).then(() => {
          res.redirect('/admin/products')
        })
      },

    getEditProduct: async(req, res) => {
        let products = await productHelpers.getProductDetails(req.params.id)
        adminHelpers.getAllCatagories().then((category)=>{
          res.render('admin/edit-products', {products,layout,category})
        })
          
        
      },

    postEditProduct:async(req, res) => {
      try {
            //converts string to array 
            let index = req.body.indexOfImage.split(',').map(function(item) {
                return parseInt(item, 10);
            })
            //remove duplicate values in array
            index=index.filter((item,i)=>index.indexOf(item)==i)
        
        
              const files=req.files
              const fileName=files?.map((file)=>{
                return file.filename
              })

              console.log(index,'this is my index array')
              console.log(fileName,'this is my new files name');

              let prodata=await productHelpers.getProductDetails(req.params.id)
                var image=prodata.img
              for(i=0;i<=index.length;i++){
                image[index[i]]=fileName[i]
              }
              
        
              console.log(image,'this is my image data of array');
              const product=req.body
              product.img=image
              console.log(product,prodata,'product before and agter');
        
              productHelpers.editProduct(req.params.id, product).then(()=>{
        
              res.redirect('/admin/products')
         
                }).catch((error)=>{
                  res.render('error',{errmessage:error.message})
                })
        
      } catch (error) {
        res.render('error',{errmessage:error.message})
      }
     
     
      },

      

    

    

    
    

    

    
}