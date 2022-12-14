const cartHelpers = require('../helpers/cartHelpers');
const salesHelpers = require('../helpers/salesHelpers');
const couponHelpers=require('../helpers/couponHelpers')
const layout = 'admin-layout'


module.exports={
    viewAllOrders:(req,res)=>{
        let userId=req.session.user._id
        let user=req.session.user
        cartHelpers.getAllOrders().then((orders)=>{
           
            res.render('admin/orders',{orders,layout,user})
        })
    },
    viewOrderDetails:(req,res)=>{
        cartHelpers.getOrderById(req.params.id,req.session.user._id).then((orders)=>{
        
            res.render('admin/single-order-details',{layout,orders})
        })
    },
    updateOrderStatus:(req,res)=>{
        cartHelpers.updateOrderStatus(req.body.value,req.body.orderId,req.body.prodId).then((response)=>{
            console.log('succeffully updated order status');
            res.send(response)
        })
    },
    getSalesReport:async(req,res)=>{
        // let yearly=await salesHelpers.yearlySales()
        // let monthly=await salesHelpers.monthlySales()
        let monthlyWise=await salesHelpers.monthWiseSales()
        let daily=await salesHelpers.getRevenueByDay()
        let year=await salesHelpers.getRevenueByear()
  
      
        
        res.render('admin/salesReport',{layout,monthlyWise:monthlyWise,dailyWise:daily,yearlyWise:year})
    },
    revenueGraph:async(req,res)=>{
        try {
            let monthly=await salesHelpers.monthWiseSales()
            // let yeaely=await salesHelpers.yearlyWise
            let daily=await salesHelpers.getRevenueByDay()
            let year=await salesHelpers.getRevenueByear()
            let category=await salesHelpers.getCategoryRevenue()
  
            // let yearly=await salesHelpers.yearlyWiseSales()
            res.send({priceStat:monthly,daily:daily,year:year,category})
        } catch (error) {
            
        }
    },
    coupon:(req,res)=>{
            couponHelpers.getAllCoupons().then((coupons)=>{
                res.render('admin/coupon',{layout,coupons:coupons})
            })  
    },
    addCoupon:(req,res)=>{
        try {
            res.render('admin/add-coupon',{layout})
        } catch (error) {
            res.send(error)
        }
    },
    addCouponPost:(req,res)=>{
       
       
        couponHelpers.addCoupon(req.body).then(()=>{
                res.send({status:true})
            }).catch((error)=>{
                console.log('coupon not added');
                res.send({status:false,error:error})
            })
    
    }
}