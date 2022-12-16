var express = require("express");
var router = express.Router();
const path = require('path');
const multer = require("multer");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "Images");
  },
  filename: (req, file, cb) => {
    console.log(file);
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

const config = require("../config/otpconfig");

const {
  login,
  getLogin,
  verifyLogin,
  verifyLoginApi,
  logout,
  getSignup,
  signup,
  getOtp,
  verifyOtp,
  updateUser,
} = require("../controllers/auth");

const { shop,getProducts, singleProduct } = require("../controllers/product");
const {
  getCart,
  findProdQuantity,
  addToCart,
  changePrdQty,
  deleteProduct,
  getCheckout,
  postCheckout,
  getOrders,
  getOrderDetails,
  postCancelOrder,
  getAddress,
  paymentVerification,
  showProfile,
  removeAddress,
  updateAddress,
  addAddress,
  paypalPayment,
  verifyPaypal,
  retunProduct,
  getHome,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  applyCoupon,

} = require("../controllers/cart");


var nav = true;
var footer = true;


const cartCount = async (req, res, next) => {
  // res.locals.cartCount = await cartHelpers.getCartCount(req.session.user._id);
  next();
};
//home page
router.get("/",getHome);

//user login and signup
router.get("/login", getLogin);
router.post("/login", login);
router.get("/signup", getSignup);
router.post("/signup", signup);
router.get("/logout", logout);

//otp
router.get("/otpform", (req, res) => {
  res.render("user/otp-login", { nav: false, footer: false });
});
router.get("/otp-login", getOtp);
router.get("/verify", verifyOtp);

//shop
router.get("/shop", shop)
router.get("/getProducts", getProducts)

router.get("/single-product/:id", cartCount, singleProduct);

router.get("/about-us", (req, res) => {
  res.send("coming soon");
});

router.get("/ordersuccess", verifyLogin, (req, res) => {
  res.render("user/ordersuccess");
});

router.get("/cart", verifyLogin, getCart);
router.get('/find-prodQuantity/:id',verifyLogin,findProdQuantity)
router.get("/add-to-cart/:id", verifyLogin, addToCart);
router.post("/change-product-quantity", changePrdQty);
router.post("/remove-product", verifyLogin, deleteProduct);


router.get("/checkout", verifyLogin, getCheckout);
router.post("/checkout", verifyLogin, postCheckout);

router.get("/orders", verifyLogin, cartCount, getOrders);

router.post("/cancel-order", verifyLogin, postCancelOrder);

router.get("/fill-address/:id", verifyLogin, getAddress);

router.post("/verify-payment", verifyLogin, paymentVerification);

router.get("/my-account", verifyLogin, showProfile);

router.get("/remove-address/:id", verifyLogin, removeAddress);
router.post("/edit-address", verifyLogin, updateAddress);
router.post("/add-address", verifyLogin, addAddress);
router.post("/update-user-info", verifyLogin, updateUser);

router.post("/create-order", verifyLogin, paypalPayment);
router.get("/verify-paypal", verifyLogin, verifyPaypal);


router.post('/return',retunProduct)
router.get('/get-order-data/:id',getOrderDetails)


router.get('/wishlist',verifyLogin,getWishlist)
router.get('/add-to-wishlist/:id',verifyLogin,addToWishlist)
router.get('/remove-item-wishlist/:id',verifyLogin,removeFromWishlist)

router.post('/apply-coupon',verifyLogin,applyCoupon)



// router.get('/new-order',(req,res)=>{
//   res.render('user/neworder')
// })
module.exports = router;
