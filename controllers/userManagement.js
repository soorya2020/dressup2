const adminHelpers = require('../helpers/adminHelpers');
const layout = 'admin-layout'

module.exports={

    viewAllUsers:(req, res) => {
        adminHelpers.getAllUsers().then((users)=>{
          console.log(users);
          res.render("admin/users",{users,layout})
        })
        
      },

    getAddUser:(req,res)=>{
        res.render('admin/add_user',{
          layout
        })
      },

    postAddUser:(req,res)=>{
        adminHelpers.addUser(req.body).then((data)=>{
          res.redirect('/admin/users')
        })
      },

    blockUser:(req, res) => {
        adminHelpers.blockUser(req.params.id).then((user)=>{
          console.log(user);
          req.session.loggedIn=false
          res.redirect("/admin/users")
        })
        
      },

    unBlockUser:(req, res) => {
        adminHelpers.unBlockUser(req.params.id).then((user)=>{
          console.log(user);
          res.redirect("/admin/users")
        })
        
      },
}
