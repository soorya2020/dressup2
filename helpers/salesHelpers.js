const db = require("../model/connection");

exports.getRevenueByDay= () => {

        try {
            let date = new Date()

            let thismonth = date.getMonth()
            let month = thismonth + 1
            let year = date.getFullYear()

            return new Promise((resolve, reject) => {

                db.orders.aggregate([
                    {
                        $unwind: "$orders"
                    },
                    {
                        $unwind: '$orders.productDetails'
                    },
                    {
                        $match: { 'orders.createdAt': {
                             $gt: new Date(`${year}-${month}-01`), 
                             $lt: new Date(`${year}-${month}-31`) 
                            } }
                    },
                    {
                        $match: { 'orders.productDetails.orderStatus': 4 }
                    },
                    {
                        $group: {
                            _id: { '$dayOfMonth': '$orders.createdAt' },
                            totalRevenue: { $sum: { $multiply: ['$orders.productDetails.productsPrice', '$orders.productDetails.quantity'] } },
                            orders: { $sum: 1 },
                            totalQuantity: { $sum: '$orders.productDetails.quantity' }
                        }
                    },
                    {
                        $sort: {
                            '_id': 1
                        }
                    }

                ]).then((data) => {
                    // console.log(data,'this is my daily sales repoert');
                    resolve(data)
                }).catch((e) => {
                    console.log('error in catch');
                })
            })
        } catch (error) {
            console.log(error);
        }
    }

exports.getRevenueByear =()=>{

        try {
            let date = new Date()

            let thismonth = date.getMonth()
            let month = thismonth + 1
            let year = date.getFullYear()

            return new Promise((resolve, reject) => {

                db.orders.aggregate([
                    {
                        $unwind: "$orders"
                    },
                    {
                        $unwind: '$orders.productDetails'
                    },
                    {
                        $match: { 'orders.createdAt': { $gt: new Date(`${year - 5}-${month}-01`), $lt: new Date(`${year}-${month}-31`) } }
                    },
                    {
                        $match: {'orders.productDetails.orderStatus': 4}
                    },
                    {
                        $group: {
                            _id: { '$year': '$orders.createdAt' },
                            totalRevenue: { $sum: { $multiply: ['$orders.productDetails.productsPrice', '$orders.productDetails.quantity'] } },
                            orders: { $sum: 1 },
                            totalQuantity: { $sum: '$orders.productDetails.quantity' }
                        }
                    },
                    {
                        $sort: {
                            '_id': 1
                        }
                    }

                ]).then((data) => {
                    
                    resolve(data)
                }).catch((e) => {
                    console.log('error in catch');
                })
            })
        } catch (error) {
            console.log(error);
        }
    }



exports.monthWiseSales= () => {

    return new Promise(async (resolve, reject) => {
        try {
                let year=new Date()
                year=year.getFullYear()
                // console.log(year,'this is my uear');
      
                await db.orders.aggregate([
                    {
                        $unwind: "$orders"
                    },
                    {
                        $unwind: '$orders.productDetails'
                    },
                    {
                        $match:{
                            'orders.createdAt':{$gt:new Date(`${year}-01-01`),$lt:new Date(`${year}-12-31`)}
                        }
                    },
                    {
                        $match: { 'orders.productDetails.orderStatus': 4 }
                    },
                    
                    {
                        $group: {
                            _id: {'$month':'$orders.createdAt'},
                            total: { $sum:{$multiply:['$orders.productDetails.productsPrice','$orders.productDetails.quantity']}},
                            orders: { $sum:1 },
                            totalQuantity: { $sum:'$orders.productDetails.quantity'}
                        }
                    },
                    {
                        $sort: {
                            '_id': 1
                        }
                    }
                ]).then((monthlyData) => {
            //   console.log(monthlyData,'this is my  onthly data');
                    resolve(monthlyData)
                }).catch((error)=>{
                    resolve(error)
                })

        } catch (error) {
            console.log(error);
        }
    })
}

exports.getCategoryRevenue=()=>{
    return new Promise((resolve,reject)=>{
        try {
            db.orders.aggregate([
                {
                    $unwind: "$orders"
                },
                {
                    $unwind: '$orders.productDetails'
                },
                {
                    $match: { 'orders.productDetails.orderStatus':4 }
                },
                
                {
                    $group:{
                        _id:'$orders.productDetails.category',
                    }    
                }
            ]).then((data)=>{
                resolve(data)
            }).catch((error)=>{
                reject(error)
            })
        } catch (error) {
            reject(error)
        }
    })
}


// monthlySales: () => {
    //     let date = new Date()
    //     let thisMonth = date.getMonth()

    //     return new Promise((resolve, reject) => {
    //         try {
    //             db.orders.aggregate([
    //                 {
    //                     $unwind: "$orders"
    //                 },
    //                 {
    //                     $unwind: '$orders.productDetails'
    //                 },
    //                 {
    //                     $match: { 'orders.productDetails.orderStatus': 4 }
    //                 },
    //                 {
    //                     $match: {
    //                         $expr: {
    //                             $eq: [
    //                                 {
    //                                     $month: '$orders.createdAt'
    //                                 },
    //                                 thisMonth + 1
    //                             ]
    //                         }
    //                     }
    //                 },
    //                 {
    //                     $group: {
    //                         _id: null,
    //                         total: { $sum: '$orders.totalPrice' },
    //                         orders: { $sum: '$orders.productDetails.quantity' },
    //                         // totalOrders:{$sum:"$orders.totalQuantity"},
    //                         count: { $sum: 1 }


    //                     }
    //                 }
    //             ]).then((data) => {

    //                 resolve(data)
    //             })
    //         } catch (error) {
    //             console.log(error);
    //         }
    //     })
    // },