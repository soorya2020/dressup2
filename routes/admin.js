// const { products } = require('../config/connection');
var express = require('express');
const adminHelpers = require('../helpers/adminHelpers');
const router = express.Router();

const multer= require('multer');

// handle storage using multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/product-images')
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null,  uniqueSuffix+".jpg")
    }
});
 const upload = multer({ storage: storage });


const storage2 = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/assets/banner-images')
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null,  file.fieldname + '-' + uniqueSuffix+".jpg")
    }
});
 const upload2 = multer({ storage: storage2})






const {
  getAddProducts,
  dashboard,
  addProducts,
  viewProducts,
  deleteProduct,
  getEditProduct,
  postEditProduct,
  }=require('../controllers/productManagment')
const {
  viewAllUsers,
  getAddUser,
  postAddUser,
  blockUser,
  unBlockUser}=require('../controllers/userManagement')
const {
  viewAllCategories,
  getAddCategory,
  postAddCategory,
  getEditCategory,
  postEditCategory,
  deleteCategory}=require('../controllers/categoryManagement')

const {
  viewAllOrders,
  viewOrderDetails,
  updateOrderStatus,
  getSalesReport,
  revenueGraph,
  coupon,
  addCoupon,
  addCouponPost
}=require('../controllers/orderManagement')

const{
  getBanner,
  getMainBanner,
  addMainBanner,
  deleteBanner,
  editManinBanner,
  getCoupenCode
}=require('../controllers/bannerManagement')
const layout = 'admin-layout'


/*----------------------middlevare to check admin login--------------------------------*/
const verifyAdminLogin = (req, res, next) => {
  if (req.session.adminLoggedIn) {
    next();
  } else {
    res.redirect("/admin/login");
  }
};

//admin-login
router.get('/login',(req,res)=>{
  if(req.session.adminLoggedIn){
    res.redirect("/admin")
  }
  res.render('admin/login',{admin:true})
})

router.post('/login',(req,res)=>{
 
  adminHelpers.doLogin(req.body).then((response)=>{
    if(response.status){
      req.session.adminLoggedIn=true
      req.session.admin=response.admin
      res.send({value:'success'})
    }else{
      req.session.loginErr=true
      res.send({value:'failed'})
    }
  })
})

router.get('/logout',(req,res)=>{
  req.session.adminLoggedIn=false
  res.redirect('/admin/login')
})




// dashboard
router.get('/',verifyAdminLogin, dashboard);


// products
router.get('/products',verifyAdminLogin ,viewProducts)
//add-products
router.get('/add-products', verifyAdminLogin,getAddProducts)
router.post('/add-products',verifyAdminLogin,upload.array('image'),addProducts)
//delete product
router.get('/delete-products/:id', verifyAdminLogin,deleteProduct)
//edit product
router.get('/edit-products/:id',verifyAdminLogin,getEditProduct)



router.post('/edit-products/:id',verifyAdminLogin,upload.array('image'),postEditProduct)




// users
router.get('/users', verifyAdminLogin,viewAllUsers)
//block user
router.get('/blockUser/:id',verifyAdminLogin, blockUser)
router.get('/unBlockUser/:id', verifyAdminLogin,unBlockUser)
//add user
// router.get('/add-users',getAddUser)
// router.post('/add-user',postAddUser)


// categories
router.get("/categories",verifyAdminLogin,viewAllCategories)
//add category
router.get('/add-category',verifyAdminLogin,getAddCategory)
router.post("/add-category",verifyAdminLogin,postAddCategory)
//edit category
router.get("/edit-category/:id",verifyAdminLogin,getEditCategory)
router.post("/edit-category/:id",verifyAdminLogin,postEditCategory)
//delete category
router.get("/delete-category/:id",verifyAdminLogin,deleteCategory)

//orders
router.get('/orders',verifyAdminLogin,viewAllOrders)
router.get("/single-order/:id",verifyAdminLogin,viewOrderDetails)

router.post('/update-order-status',verifyAdminLogin,updateOrderStatus)

//chart and sales
router.get('/sales-report',verifyAdminLogin,getSalesReport)
router.get('/chartGraph',verifyAdminLogin,revenueGraph)

router.get('/coupon',verifyAdminLogin,coupon)
router.get('/add-coupon',verifyAdminLogin,addCoupon)


router.post('/add-coupon',verifyAdminLogin,addCouponPost)



router.get('/banner',verifyAdminLogin,getBanner)
router.get('/add-main-banner',verifyAdminLogin,getMainBanner)
router.post('/add-main-banner',upload2.array('image'),verifyAdminLogin,addMainBanner)
router.get('/delete-main-banner/:id',verifyAdminLogin,deleteBanner)
router.post('/edit-main-banner',verifyAdminLogin,editManinBanner)

router.get('/generate-coupon-code',verifyAdminLogin,getCoupenCode)




module.exports = router;
