

const cartHelpers=require('../helpers/cartHelpers')
const productHelpers = require("../helpers/product-helpers");



var nav = true;
var footer = true;




module.exports={
  shop:async(req, res) => {
   
      let user=req.session.user
      let cartCount=await cartHelpers.getCartCount(req?.session?.user?._id)
        productHelpers.getAllProducts(req.query).then((products) => {
          var value = req.session.loggedIn;
        
          if(req.session.loggedIn){
            res.locals.loggedIn=true
          }
          res.render("user/shop", {
            products,
            admin: false,
            user,
            value,
            nav,
            footer,
            cartCount,
            
            
          });
          
        }).catch((error)=>{
          res.render('error',{errmessage:error.message})
        })
      },
    getProducts:async(req, res) => {
   
     
      
        productHelpers.getAllProducts(req.query).then((products) => {
     
        
       
          res.send(products)
          
        }).catch((error)=>{
          res.status(500).send({error:error.message})
        })
      },
  singleProduct:(req, res) => {
        let prodId=req.params.id
        productHelpers.getProductDetails(prodId).then((product)=>{
          
          res.render('user/single-product',{nav:true,footer:true,product})
        })
        
      },
  



    
}