var userCollection = require('../config/admin_pass')
const bcrypt = require('bcrypt');


var data = userCollection.userid

module.exports={

  doLogin:(userData)=>{
     return new Promise(async(resolve, reject) => {
      console.log(userData);
      //   data.password = await bcrypt.hash(userData.password,10)
      //   console.log(data.password);
        if(data.email == userData.email){
           bcrypt.compare(userData.password, data.password).then((loginTrue)=>{
              let response={}
              if(loginTrue){
                 console.log('login successful');
                 response.admin=data;
                 response.status=true;
                 resolve(response);
              }else{
                 console.log("login failed");
                 resolve({status:false});
              }
           })
        }else{
           console.log('Login failed email');
            resolve({status:false});
        }
        
     })
}
}

