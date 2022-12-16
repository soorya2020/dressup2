const db = require("../model/connection");
const ObjectId = require("mongodb").ObjectID;
const Razorpay = require("razorpay");
const paypal = require("paypal-rest-sdk");

var instance = new Razorpay({
  key_id: "rzp_test_tUZpCht97wF71G",
  key_secret: "ggez8hbKtN3dnEXjRWW6XqZg",
});

paypal.configure({
  mode: "sandbox", //sandbox or live
  client_id:
    "AdBqEBGG0O3Kqv7CpACr2MTC35CMT6sMILSPb1Jq_K6FvwrLMRBBLvvnuijtFLc-oYZZEMDhWHnu54oz",
  client_secret:
    "EPzGRv0ycoo3vGSA0FtX_rGnOlq1CP0K0pWncMzwXsO6Un9bJVnNCceYP4rXyT2",
});

module.exports = {
  findQuantity: (prodId, userId) => {
    return new Promise(async (resolve, reject) => {
      try {
        let userCart = await db.carts.findOne({ user: userId });
        if (userCart) {
          let prodIndex = userCart.products.findIndex(
            (product) => product.item == prodId
          );
          console.log(prodIndex);
          if (prodIndex != -1) {
            let productQuantity = userCart.products[prodIndex].quantity;
            resolve({ status: true, quantity: productQuantity });
          } else {
            let quantity = 0;
            resolve({ status: true, quantity: quantity });
          }
        } else {
          resolve({ status: false });
        }
      } catch (error) {
        reject({ status: false, error });
      }
    });
  },

  addToCart: (prodId, userId) => {
    return new Promise(async (resolve, reject) => {
      try {
        let prodObj = {
          item: prodId,
          quantity: 1,
        };
        let userCart = await db.carts.findOne({ user: userId });
        if (userCart) {
          let prodExist = userCart.products.findIndex(
            (product) => product.item == prodId
          );

          if (prodExist != -1) {
            db.carts
              .findOneAndUpdate(
                {
                  user: userId,
                  "products.item": prodId,
                },
                {
                  $inc: { "products.$.quantity": 1 },
                }
              )
              .then((response) => {
                resolve(response);
              })
              .catch((error) => {
                reject(error);
              });
          } else {
            db.carts
              .updateOne(
                { user: userId },
                {
                  $push: { products: prodObj },
                }
              )
              .then((response) => {
                resolve();
              })
              .catch((error) => {
                reject(error);
              });
          }
        } else {
          let cartObj = {
            user: userId,
            products: [prodObj],
          };
          let data = await db.carts(cartObj);
          data.save((err, data) => {
            if (err) {
              reject(err);
            } else {
              resolve(data);
            }
          });
        }
      } catch (error) {
        reject(error);
      }
    });
  },
  //not working
  getCartProducts: (userId) => {
    return new Promise((resolve, reject) => {
      try {
        db.carts
          .aggregate([
            {
              $match: { user: userId },
            },
            {
              $unwind: "$products",
            },
            {
              $project: {
                item: "$products.item",
                quantity: "$products.quantity",
              },
            },
            {
              $lookup: {
                from: "products",
                localField: "item",
                foreignField: "_id",
                as: "productInfo",
              },
            },

            {
              $project: {
                item: 1,
                quantity: 1,
                img: 1,
                product: { $arrayElemAt: ["$productInfo", 0] },
              },
            },
          ])
          .then((productInfo) => {
            resolve(productInfo);
          })
          .catch((err) => {
            reject(err);
          });
      } catch (error) {
        reject(error);
      }
    });
  },

  changeProductQuantity: (data) => {
    data.count = parseInt(data.count);
    data.quantity = parseInt(data.quantity);

    return new Promise((resolve, reject) => {
      if (data.count == -1 && data.quantity == 1) {
        db.carts
          .updateOne(
            {
              _id: data.cart,
              // "products.item":data.product
            },
            {
              $pull: { products: { item: data.product } },
            }
          )
          .then(() => {
            resolve({ removeProduct: true });
          });
      } else {
        db.carts
          .updateOne(
            {
              _id: data.cart,
              "products.item": data.product,
            },
            {
              $inc: { "products.$.quantity": data.count },
            }
          )
          .then(() => {
            resolve({ status: true });
          });
      }
    });
  },
  getTotalAmount: (userId) => {
    return new Promise((resolve, reject) => {
      try {
        db.carts
          .aggregate([
            {
              $match: { user: userId },
            },
            {
              $unwind: "$products",
            },
            {
              $project: {
                item: "$products.item",
                quantity: "$products.quantity",
              },
            },
            {
              $lookup: {
                from: "products",
                localField: "item",
                foreignField: "_id",
                as: "productInfo",
              },
            },
            {
              $project: {
                item: 1,
                quantity: 1,
                product: { $arrayElemAt: ["$productInfo", 0] },
              },
            },
            {
              $group: {
                _id: null,
                total: {
                  $sum: { $multiply: ["$quantity", "$product.offerPrice"] },
                },
                mrpTotal: {
                  $sum: { $multiply: ["$quantity", "$product.price"] },
                },
              },
            },
          ])
          .then((totalAmount) => {
            resolve(totalAmount[0]);
          })
          .catch((err) => {
            reject(err);
          });
      } catch (error) {
        reject(error);
      }
    });
  },

  removeProduct: (data) => {
    return new Promise((resolve, reject) => {
      db.carts
        .updateOne(
          {
            _id: data.cartId,
            // "products.item":data.product
          },
          {
            $pull: { products: { item: data.productId } },
          }
        )
        .then((response) => {
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },
  deleteCart: (prodId) => {
    return new Promise((resolve, reject) => {
      db.carts.updateMany({});
    });
  },
  placeOrder: (order, total, couponId) => {
    return new Promise(async (resolve, reject) => {
      let products = await db.carts.aggregate([
        {
          $match: { user: order.userId },
        },
        {
          $unwind: "$products",
        },
        {
          $project: {
            item: "$products.item",
            quantity: "$products.quantity",
          },
        },
        {
          $lookup: {
            from: "products",
            localField: "item",
            foreignField: "_id",
            as: "cartItemsResult",
          },
        },
        {
          $unwind: "$cartItemsResult",
        },
        {
          $set: { cartItemsResult: { status: 1 } },
        },
        {
          $project: {
            _id: "$cartItemsResult._id",
            quantity: 1,
            productsName: "$cartItemsResult.name",
            productsPrice: "$cartItemsResult.offerPrice",
            productsOfferPercentage: "$cartItemsResult.offerPercentage",
            orderStatus: "$cartItemsResult.status",
            imageName: "$cartItemsResult.img",
            return: "$cartItemsResult.return",
            category: "$cartItemsResult.category",
          },
        },
      ]);

      let totalQuantity = 0; //total quantity
      for (let i = 0; i < products.length; i++) {
        totalQuantity += products[i].quantity;
      }

      for (let i = 0; i <= products.length - 1; i++) {
        db.products
          .updateOne(
            {
              _id: products[i]?._id,
            },
            {
              $inc: { stock: -products[i].quantity },
            }
          )
          .then((data) => {
            console.log(data, "this is my status");
          });
      }

      let addressData = {
        firstName: order.firstname,
        lastName: order.lastname,
        street: order.street,
        country: order.country,
        town: order.town,
        state: order.state,
        pincode: order.pincode,
        mobile: order.mobile,
        email: order.email,
      };

      let addressObj = {
        userId: order.userId,
        address: addressData,
      };

      let addressExist = await db.addresses.find({ userId: order.userId });

      if (addressExist.length) {
        db.addresses
          .find({
            "address.street": order.street,
            "address.pincode": order.pincode,
            userId: order.userId,
          })
          .then((res) => {
            if (res.length == 0) {
              // db.addresses(addressObj).save()
              db.addresses
                .updateOne(
                  {
                    userId: order.userId,
                  },
                  {
                    $push: { address: addressData },
                  }
                )
                .then((data) => {});
            } else {
            }
          });
      } else {
        db.addresses(addressObj)
          .save()
          .then(() => {});
      }

      let orderAddress = {
        appartment: order.appartment,
        street: order.street,
        town: order.town,
        country: order.country,
        state: order.state,
        pincode: order.pincode,
        mobile: order.mobile,
        email: order.email,
      };

      let orderData = {
        firstName: order.firstname,
        lastName: order.lastname,
        mobile: order.mobile,
        paymentMethod: order.paymentMethod,
        productDetails: products,
        totalPrice: total,
        totalQuantity: totalQuantity,
        shippingAddress: orderAddress,
        createdAt: new Date(),
      };

      let orderObj = {
        userId: order.userId,
        orders: [orderData],
      };

      let orderExist = await db.orders.findOne({ userId: order.userId });
      if (orderExist) {
        db.orders
          .updateOne(
            {
              userId: order.userId,
            },
            {
              $push: { orders: orderData },
            }
          )
          .then((data) => {
            console.log("order pushed");
          });
      } else {
        let data = await db.orders(orderObj);

        await data.save();
        console.log(data, "order saved");
      }
      db.carts
        .deleteOne({ user: order.userId })
        .then((res) => {
          if (couponId) {
            db.users
              .updateOne(
                {
                  _id: order.userId,
                  "coupon.couponId": ObjectId(couponId),
                },
                {
                  $set: {
                    "coupon.$.status": true,
                  },
                }
              )
              .then((d) => {
                resolve();
              })
              .catch((e) => {
                console.log(e, "somehting goene wrong wlide deleting cart");
                reject();
              });
          } else {
            resolve();
          }
        })
        .catch(() => {
          reject();
        });
    });
  },

  listAddress: (userId, addressId) => {
    return new Promise((resolve, reject) => {
      try {
        db.addresses
          .aggregate([
            {
              $match: { userId: userId },
            },
            {
              $unwind: "$address",
            },
            {
              $match: {
                "address._id": ObjectId(addressId),
              },
            },
          ])
          .then((data) => {
            resolve(data);
          })
          .catch((error) => {
            reject(error);
          });
      } catch (error) {
        reject(error);
      }
    });
  },

  getOrders: (userId) => {
    return new Promise(async (resolve, reject) => {
      try {
        let orders = await db.orders.find({ userId: userId });

        resolve(orders[0]);
      } catch (error) {
        reject(error);
      }
    });
  },
  getOrderDetails: (orderId, userId) => {
    return new Promise(async (resolve, reject) => {
      try {
        let orders = await db.orders.find({ userId: userId });
        let orderIndex = orders[0].orders.findIndex(
          (order) => order._id == orderId
        );
        db.orders
          .aggregate([
            {
              $match: { userId: userId },
            },
            {
              $unwind: "$orders",
            },
            {
              $match: { "orders._id": ObjectId(orderId) },
            },
          ])
          .then((data) => {
            resolve(data);
          })
          .catch((error) => {
            reject();
          });
      } catch (error) {
        reject();
      }
    });
  },
  getAllOrders: () => {
    return new Promise(async (resolve, reject) => {
      try {
        let orders = await db.orders.aggregate([
          {
            $unwind: "$orders",
          },
        ]);
        resolve(orders);
      } catch (error) {
        reject(error);
      }
    });
  },
  cancelOrder: (orderId, prodId) => {
    return new Promise(async (resolve, reject) => {
      try {
        let order = await db.orders.find({ "orders._id": orderId });

        if (order) {
          let orderIndex = order[0].orders.findIndex(
            (order) => order._id == orderId
          );
          let productIndex = order[0].orders[
            orderIndex
          ].productDetails.findIndex((product) => product._id == prodId);

          db.orders
            .updateOne(
              {
                "orders._id": orderId,
              },
              {
                $set: {
                  ["orders." +
                  orderIndex +
                  ".productDetails." +
                  productIndex +
                  ".orderStatus"]: 0,
                },
              }
            )
            .then(() => {
              console.log("oder cancelled status updated");
              db.products
                .updateOne(
                  { _id: prodId },
                  {
                    $inc: {
                      stock:
                        order[0].orders[orderIndex].productDetails[productIndex]
                          .quantity,
                    },
                  }
                )
                .then((e) => {
                 
                  resolve({ status: true });
                });
            })
            .catch((error) => {
              reject(error);
            });
        }
      } catch (error) {
        reject(error);
      }
    });
  },

  generateRazorpay: async (userId, total) => {
    let orders = await db.orders.find({ userId: userId });

    let myOrderId = orders[0]?.orders.reverse();
    myOrderId = myOrderId[0]._id;

    return new Promise((resolve, reject) => {
      var options = {
        amount: total * 100, // amount in the smallest currency unit
        currency: "INR",
        receipt: "" + myOrderId,
      };
      instance.orders.create(options, function (err, order) {
        resolve(order);
      });
    });
  },

  verifyPayment: (details) => {
    return new Promise(async (resolve, reject) => {
      const { createHmac } = await import("node:crypto");

      let hmac = createHmac("sha256", "ggez8hbKtN3dnEXjRWW6XqZg");
      hmac.update(
        details["payment[razorpay_order_id]"] +
          "|" +
          details["payment[razorpay_payment_id]"]
      );
      hmac = hmac.digest("hex");

      if (hmac == details["payment[razorpay_signature]"]) {
        resolve();
      } else {
        reject();
      }
    });
  },

  changePaymentStatus: (orderId, userId, value) => {
    return new Promise(async (resolve, reject) => {
      try {
        let orders = await db.orders.find({ userId: userId });

        let orderIndex = orders[0].orders.findIndex(
          (order) => order._id == "" + orderId
        );

        console.log(orderIndex, "" + orderId, "my order index and order id");
        db.orders
          .updateOne(
            {
              "orders._id": orderId,
            },
            {
              $set: {
                ["orders." + orderIndex + ".paymentStatus"]: value,
              },
            }
          )
          .then((data) => {
            console.log("thsi is then");
            console.log(data);
            resolve();
          })
          .catch((e) => {
            console.log(e);
            reject();
          });
      } catch (error) {
        reject(error);
      }
    });
  },

  getOrderById: (orderId, userId) => {
    return new Promise((resolve, reject) => {
      db.orders
        .aggregate([
          {
            $unwind: "$orders",
          },
          {
            $unwind: "$orders.productDetails",
          },
          {
            $match: { "orders._id": ObjectId(orderId) },
          },
        ])
        .then((orderDetails) => {
          resolve(orderDetails);
        });
    });
  },
  updateOrderStatus: (value, orderId, prodId) => {
    let updateValue = parseInt(value);
    return new Promise(async (resolve, reject) => {
      let order = await db.orders.findOne({ "orders._id": orderId });

      if (order) {
        let orderIndex = order.orders.findIndex(
          (order) => order._id == orderId
        );
        let productIndex = order.orders[orderIndex].productDetails.findIndex(
          (product) => product._id == prodId
        );
        console.log(order.orders[orderIndex], "test soorya");

        db.orders
          .updateOne(
            {
              "orders._id": orderId,
            },
            {
              $set: {
                ["orders." +
                orderIndex +
                ".productDetails." +
                productIndex +
                ".orderStatus"]: updateValue,
              },
            }
          )
          .then((data) => {
            console.log(data, "line 560 cart helpers");
            if (
              order.orders[orderIndex].paymentMethod == "COD" &&
              updateValue == 4
            ) {
              db.orders
                .updateOne(
                  {
                    "orders._id": orderId,
                  },
                  {
                    $set: {
                      ["orders." + orderIndex + ".paymentStatus"]: 1,
                    },
                  }
                )
                .then((data) => {
                  resolve();
                });
            }
            resolve({ status: true });
          });
      }
    });
  },
  getUserAddress: (userId) => {
    return new Promise(async (resolve, reject) => {
      let address = await db.addresses.find({ userId: userId });
      resolve(address);
    });
  },
  removeAddress: (addressId) => {
    return new Promise(async (resolve, reject) => {
      db.addresses
        .updateOne(
          {
            "address._id": addressId,
          },
          {
            $pull: { address: { _id: addressId } },
          }
        )
        .then((data) => {
          console.log(data, "delted address");
        });
    });
  },
  editAddress: (userId, data) => {
    console.log(data, "this si my edit address");
    return new Promise(async (resolve, reject) => {
      let address = await db.addresses.find({ userId: userId });
      let addressIndex = address[0].address.findIndex(
        (index) => index._id == data._id
      );

      let addressData = {
        firstName: data.firstName,
        lastName: data.lastName,
        country: data.country,
        street: data.street,
        town: data.town,
        state: data.state,
        pincode: data.pincode,
        mobile: data.mobile,
        email: data.email,
      };
      console.log(addressData, "this is address");

      db.addresses
        .updateOne(
          {
            userId: userId,
          },
          {
            $set: {
              ["address." + addressIndex]: addressData,
            },
          }
        )
        .then((data) => {
          console.log("soorya reached line 641");
          resolve();
        });
    });
  },
  addAddress: async (userId, data) => {
    db.addresses
      .updateOne(
        {
          userId: userId,
        },
        {
          $push: { address: data },
        }
      )
      .then((response) => {
        console.log("address added");
        resolve();
      });
  },
  retunItem: (data, userId) => {
    return new Promise(async (resolve, reject) => {
      try {
        console.log(userId, "this is userid");
        let order = await db.orders.findOne({ userId: userId });

        if (order) {
          let orderIndex = order.orders.findIndex(
            (index) => index._id == data.orderId
          );
          let prodIndex = order.orders[orderIndex].productDetails.findIndex(
            (index) => index._id == data.prodId
          );
          console.log(orderIndex, prodIndex, "myindexes");

          let thisOrder = await db.orders.findOne({
            "orders._id": data.orderId,
          });

          if (
            thisOrder.orders[orderIndex].productDetails[prodIndex]
              .orderStatus == 4
          ) {
            db.orders
              .updateOne(
                { "orders._id": data.orderId },
                {
                  $set: {
                    ["orders." +
                    orderIndex +
                    ".productDetails." +
                    prodIndex +
                    ".orderStatus"]: 6, //6 for return
                  },
                }
              )
              .then((e) => {
                console.log(e);
                console.log(userId, "this ismy user id");
              });
            db.orders
              .aggregate([
                {
                  $match: { userId: userId },
                },
                {
                  $unwind: "$orders",
                },
                {
                  $unwind: "$orders.productDetails",
                },
                {
                  $match: {
                    $and: [
                      {
                        "orders._id": ObjectId(data.orderId),
                        "orders.productDetails._id": ObjectId(data.prodId),
                      },
                    ],
                  },
                },
              ])
              .then((data) => {
                let priceToWallet = {
                  price: 0,
                };
                let totalPrice =
                  data[0]?.orders?.productDetails?.quantity *
                  data[0]?.orders?.productDetails?.productsPrice;
                //check if coupon is applied and make changes on the refund
                priceToWallet.price = parseInt(totalPrice);
                console.log(priceToWallet, "this is my wallet proce");
                db.products
                  .updateOne(
                    { _id: data.prodId },
                    { $inc: { stock: data[0].orders.productDetails.quantity } }
                  )
                  .then((e) => {
                    console.log(
                      e,
                      "product stock updated after product return"
                    );
                  });
                db.users
                  .updateOne({ _id: userId }, { $push: { wallet: totalPrice } })
                  .then((e) => {
                    console.log(e, "price adde to wallet");
                    resolve({ status: true });
                  });
              });
          } else {
            console.log("product already returned");
            resolve({ staus: false });
          }
        } else {
          resolve({ staus: false });
        }
      } catch (error) {
        console.log(error);
        reject();
      }
    });
  },
};

module.exports.getCartCount = (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let count = 0;
      let cart = await db.carts.findOne({ user: userId });

      if (cart) {
        for (i = 0; i < cart.products.length; i++) {
          count += cart.products[i].quantity;
        }
      }
      count = parseInt(count);
      resolve(count);
    } catch (error) {
      reject(error);
    }
  });
};

module.exports.getAddress = (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let address = await db.addresses.find({ userId: userId });
      resolve(address);
    } catch (error) {
      reject(error);
    }
  });
};

module.exports.addToWallet = (orderId, prodId, userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let order = await db.orders.findOne({ userId: userId });
      if (order) {
        let orderIndex = order.orders.findIndex(
          (index) => index._id == orderId
        );
        let prodIndex = order.orders[orderIndex].productDetails.findIndex(
          (index) => index._id == prodId
        )
        console.log(orderIndex, prodIndex, "myindexes");
      
        let thisOrder = await db.orders.findOne({ "orders._id": orderId });
        if (thisOrder.orders[orderIndex].paymentMethod == "COD") {
          resolve({ status: true });
        } else {
          let priceToWallet = {
            price: 0,
          };
          let totalPrice =
          thisOrder.orders[orderIndex]?.productDetails[prodIndex]?.quantity *
          thisOrder.orders[orderIndex]?.productDetails[prodIndex]?.productsPrice;
          priceToWallet.price = parseInt(totalPrice);

          db.users
            .updateOne({ _id: userId }, { $push: { wallet: totalPrice } })
            .then((e) => {
              console.log(e, "price adde to wallet");
              resolve({ status: true });
            }).catch((error)=>{
              reject(error)
            })
        }
      }
    } catch (error) {
      reject(error)
    }
  });
};
