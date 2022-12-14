const { parse } = require("handlebars");
const db = require("../model/connection");

module.exports = {
  addProducts: async (product) => {
    product.price = parseInt(product.price);
    try {
      const data = await db.products(product);
      console.log(data, "this is data");
      data.save();
      return data._id;
    } catch (error) {
      throw error;
    }
  },

  getAllProducts: (query) => {
    return new Promise(async (resolve, reject) => {
      try {
        if(query){
          let products = await db.products.find(query);
          resolve(products);
        }else{      
          let products = await db.products.find({});
          resolve(products);
        }
        
      } catch (error) {
        reject(error)
      }
     
    });
  },

  findByQuery:(query)=>{
    return new Promise((resolve,reject)=>{
      try {
     
        db.products.find(query).then((data)=>{
          console.log(data,'my query products');
          resolve(data)
        }).catch((error)=>{
          console.log(error.message);
          reject(error)
        })
      } catch (error) {
        console.log(error.message)
        reject(error)
      }
    })
  },
  
  deleteProduct: (prodId) => {
    return new Promise((resolve, reject) => {
      db.products.deleteOne({ _id: prodId }).then(() => {
        resolve();
      });
    });
  },
  getProductDetails: (prodId) => {
    return new Promise(async (resolve, reject) => {
      await db.products.findOne({ _id: prodId }).then((product) => {
        resolve(product);
      });
    });
  },
  editProduct: (prodId, data) => {
    console.log(data);
    return new Promise(async (resolve, reject) => {
      let dbprodData = await db.products.findOne({_id:prodId})
      if(data?.img?.length==0){
        data.img=dbprodData?.img
      }else{
        
        await db.products.updateOne(
          { _id: prodId },
          {
            name: data.name,
            price: data.price,
            offerPrice:data.offerPrice,
            offerPercentage:data.offerPercentage,
            category: data.category,
            stock: data.stock,
            description: data.description,
            img:data.img
          
          }
        );
      }
      resolve();
    });
  },
  addMainBanner:(bannerData)=>{
    return new Promise(async(resolve,reject)=>{
        let data = await db.banners(bannerData)
        await data.save()
        resolve()
    })
  },
  getBanners:()=>{
    
      return new Promise((resolve,reject)=>{
        try {
          
          db.banners.find({}).then((data)=>{
            resolve(data)
          }).catch((error)=>{
            console.log(error);
          })
        } catch (error) {
          
        }
      })
   
  },
  removeMainBanner:(bannerId)=>{
    return new Promise((resolve,reject)=>{
      db.banners.deleteOne({_id:bannerId}).then((d)=>{
        resolve(d)
      }).catch((e)=>{
        reject(e)
      })
    })
  },
  editMainBanner:(data)=>{
    return new Promise((resolve,reject)=>{
      db.banners.updateOne({_id:data._id},
        {
          title:data.title,
          subtitle:data.subtitle,
          description:data.description,
          offer:data.offer
        }).then((data)=>{
          resolve(data)
        }).catch((error)=>{
          reject((error))
        })
    })
  },
  addToWishlist:(userId,prodId)=>{
    try {
      let prodObj = {
        item: prodId,
      };
      return new Promise(async(resolve,reject)=>{
        let wishlistExist=await db.wishlists.findOne({user:userId})
        if(wishlistExist){
          let prodIndex=wishlistExist.products.findIndex((i)=>i.item==prodId)
          console.log(prodIndex,'my product');
          if(prodIndex==-1){
           
              
                db.wishlists.updateOne({user:userId},
                  {
                    $push:{products:prodObj}
                  }
                  ).then(()=>{
                    resolve({status:'success'})
                  })
         
          }else{
            resolve({status:'already added'})
          }
        }else{
          let wishlistObj={
            user:userId,
            products:[prodObj]
          }
          let data=await db.wishlists(wishlistObj)
          await data.save()
          resolve({status:'success'})
        }
      })
      
    } catch (error) {
      console.log(error)
      reject({error:error})
    }
  },
  getWishlistProducts:(userId)=>{
    return new Promise((resolve,reject)=>{
    try {
      
      db.wishlists.aggregate([
        {
          $match:{user:userId},
        },
        {
          $unwind:'$products'
        },
        {
          $project:{
            item:'$products.item',
          }
        },
        {
          $lookup:{
            from:'products',
            localField:'item',
            foreignField:'_id',
            as:'productInfo'
          }
        },
        {
          $project:{
            item:1,
            image:1,
            product:{$arrayElemAt:['$productInfo',0]}
          }
        },
        
      ]).then((data)=>{
        resolve(data)
      }).catch((e)=>{        
        reject(e)
      })
    } catch (error) {
      reject(error)
    }
  })
  },
  removeFromWishlist:(userId,prodId)=>{
    return new Promise((resolve,reject)=>{
      db.wishlists.updateOne(
        {
          user:userId
        },
        {
          $pull:{products:{item:prodId}}
        }
        ).then(()=>{
          resolve()
        }).catch((e)=>{
          reject()
        })
    })
  }
  
  
};                                              
