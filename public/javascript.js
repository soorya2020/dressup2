





function addToCart(prodId,stock){
  
    $.ajax({
        url:'/find-prodQuantity/'+prodId,
        method:'get',
        success:(response)=>{
            if(response.status){
                console.log(response);
                if(stock - response.quantity<=0){
                    toast2('out of stock')
                }else{
                    
                    $.ajax({
                        url:'/add-to-cart/'+prodId,
                        method:'get',
                        success:async(response)=>{
                            console.log('added');
                            if(response.status){

                                    let count=$('#cart-count').html()
                                    count=parseInt(count)+1
                                    $('#cart-count').html(count)
                                    toast()

                            }
                        }
                    })
                }
            }else if(!response.status && stock==0){
                toast2('out of stock')
            }
            else{
                $.ajax({
                    url:'/add-to-cart/'+prodId,
                    method:'get',
                    success:async(response)=>{
                        console.log('added');
                        if(response.status){                  
                                let count=$('#cart-count').html()
                                count=parseInt(count)+1
                                $('#cart-count').html(count)
                                toast()                       
                        }else{
                            Swal.fire(
                                'Please login',
                                'Register or login to make shoping better?',
                                'question'
                              )
                        }
                    }
                })
            }
            
               
            
        },
        error:(err)=>{
          alert(err)
        }
        
        
    })

    



    async function toast(message) {
        const Toast = Swal.mixin({
            toast: true,
            position: 'top',
            iconColor: 'white',
            customClass: {
              popup: 'colored-toast'
            },
            showConfirmButton: false,
            timer: 1500,
            timerProgressBar: true
          })
          await Toast.fire({
            icon: 'success',
            title: 'Item added'
          })
          
    }
async function toast2(message) {
        const Toast = Swal.mixin({
            toast: true,
            position: 'bottom',
            iconColor: 'white',
            customClass: {
              popup: 'colored-toast'
            },
            showConfirmButton: false,
            timer: 1500,
            timerProgressBar: true
          })
          await Toast.fire({
            icon: 'error',
            title: `${message}`
          })
          
    }

    
}

async function toast(message) {
    const Toast = Swal.mixin({
        toast: true,
        position: 'top',
        iconColor: 'white',
        customClass: {
          popup: 'colored-toast'
        },
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true
      })
      await Toast.fire({
        icon: 'success',
        title: `${message}`
      })
      
}
async function toast2(message) {
    const Toast = Swal.mixin({
        toast: true,
        position: 'bottom',
        iconColor: 'white',
        customClass: {
          popup: 'colored-toast'
        },
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true
      })
      await Toast.fire({
        icon: 'error',
        title: `${message}`
      })
      
}




function addToWishlist(id){
  $.ajax({
      url:'/add-to-wishlist/'+id,
      method:'get',
      success:(response)=>{
          if(response.status=='success'){
              toast('added to wishlist')
          }else{
              toast('already added to wishlist')
          }
      }
  })
}


   





