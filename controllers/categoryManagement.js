const adminHelpers = require('../helpers/adminHelpers');
const layout = 'admin-layout'

module.exports={
    viewAllCategories:(req,res)=>{
        adminHelpers.getAllCatagories().then((category)=>{
        
          res.render('admin/categories',{category,layout})
        })
      },

    getAddCategory:(req,res)=>{
        res.render('admin/add-category',{
          layout
        })
      },

    postAddCategory:(req,res)=>{
        adminHelpers.addCategory(req.body).then((data)=>{
          if(data.status){
            res.send({value:'success'})
          }else{
            res.send({value:'failed'})
          }
        }).catch((error)=>{
          res.send(error)
        })
      },
    
    getEditCategory:(req,res)=>{
        adminHelpers.getCategoryDetails(req.params.id).then((category)=>{
          res.render('admin/edit-category',{layout,category})
        })
      },

    postEditCategory:(req,res)=>{
     console.log(req.body,'my body');
        adminHelpers.editCategory(req.params.id,req.body).then(()=>{
          res.redirect("/admin/categories")
        }).catch((error)=>{
          res.render('error',{errmessage:'something went wrong'})
        })
      },

    deleteCategory:(req,res)=>{
        adminHelpers.deleteCategory(req.params.id).then(()=>{
          res.redirect("/admin/categories")
        })
      }

    

}