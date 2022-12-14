
const { ObjectId } = require("mongodb");
const db = require("../model/connection");

module.exports = {
  addCoupon: (data) => {
    try {
      return new Promise(async (resolve, reject) => {
        let couponObj = {
          couponName: data.couponName,
          expiry: data.expiry,
          minPurchase: data.minPurchase,
          description: data.description,
          discountPercentage: data.discountPercentage,
          maxDiscountValue: data.maxDiscountValue,
        };
        console.log(couponObj, "this is my body");
        let couponData = await db.coupons(couponObj);
        await couponData.save();
        resolve();
      });
    } catch (error) {
      console.log(error);
    }
  },
  getAllCoupons: () => {
    return new Promise((resolve, reject) => {
      try {
        let date=new Date
        db.coupons.aggregate([
      
          {
            $match:{expiry:{$gt: date}}
          }
  
        ]).then((data) => {
            resolve(data);
          })
          .catch((error) => {
            reject(error);
          });
        
      } catch (error) {
        reject(error)
      }
    });
  },
  getCoupon: (id) => {
    return new Promise((resolve, reject) => {
      db.coupons
        .findOne({ _id: id })
        .then((data) => {
          resolve(data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },
  addCouponToUser: (userId, coupId, value) => {
    return new Promise((resolve, reject) => {
      
      //check coupon already used or not
      db.users.findOne({_id:userId,'coupon.couponId':coupId}).then((response)=>{  
         if(!response){

                let couponObj = {
                  couponId: coupId,
                  status: value,
                };
                db.users
                  .updateOne(
                    {
                      _id: userId,
                    },
                    {
                      $push: { coupon: couponObj },
                    }
                  )
                  .then(() => {
                    resolve();
                  })
                  .catch(() => {
                    reject();
                  });

        }else{
          
        
          let couponIndex=response.coupon.findIndex(i=>i.couponId==""+coupId )

          if(response.coupon[couponIndex].status){
           reject("this coupon have been used")
         }else{
          resolve()
         }
        }

      })
    });
  },

};
