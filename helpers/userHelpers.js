const db = require('../model/connection')

const bcrypt = require('bcrypt')
const { users } = require('../model/connection')
const { ObjectID } = require('bson')

module.exports = {
    doSignup: (userData) => {
        return new Promise(async (resolve, reject) => {
            try {

                    db.users.find({ "$or": [ { email: userData.email }, { mobile: userData.mobile} ] }).then(async (data) => {
   
   
                       let response={}
                       if (data.length!=0) {
                           resolve({status:false})
                       } else {
                           userData.password = await bcrypt.hash(userData.password, 10)
                           let data=await db.users(userData)
                           data.save()
                               response.value = userData
                               response.status = true
                               response.data = data.insertedId
                               resolve(response)
                           
       
       
                       }
                   }).catch((error)=>{
                       reject(error)
                   })
                
                
            } catch (error) {
                reject(error)
            }



        })
    },
    isUser:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            let userExist=await db.users.findOne({mobile:userData})
            resolve(userExist)
        })
    },
    doLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            let loginStatus = false

            let response = {}
            let user = await db.users.findOne({ email: userData.email })
            if (user) {
                bcrypt.compare(userData.password, user.password).then((passwordcheck) => {
                    
                    if (passwordcheck) {

                        if(user.status){
                            console.log('login succes')
                            response.user = user
                            response.status = true
                            resolve(response)
                        }else{
                            console.log('user is blocked')
                            response.blocked=true
                            resolve(response)
                        }
                        
                    }
                    else {
                        console.log('password failed..');
                        response.status=false
                        resolve(response)
                    }
                })

            } else {
                console.log('login failed not an existing user');
                resolve({ status: false })
            }
        })
    },
    updateUserDate:(data,user)=>{
        console.log(user,data);
      
        return new Promise(async(resolve,reject)=>{

            bcrypt.compare(data.password,user.password).then(async(passwordcheck)=>{
                if(passwordcheck){
                    console.log('eligible to change pass');
                    data.newPassword=await bcrypt.hash(data.newPassword,10)
                    db.users.updateOne(
                        {
                            _id:user._id
                        },
                        {
                            $set:{
                                password:data.newPassword,
                                name:data.name,
                                email:data.email,
                                mobile:data.mobile
                            }
                        }
                    ).then((data)=>{
                        console.log("asdfghjk",data,"pass added");
                        resolve(data)
                    })
                }else{
                   resolve()
                    console.log('old pass not match');
                }
            })
            

        })
    }

}