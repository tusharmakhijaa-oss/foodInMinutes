let autocomplete;

async function initAutoComplete() {
    console.log("initAutoComplete called");

    const { PlaceAutocompleteElement } = await google.maps.importLibrary("places");

    const addressInput = document.getElementById("id_address");

    autocomplete = new PlaceAutocompleteElement({
        // default in this app is "IN" - add your country code
        includedRegionCodes: ["in"],
    });
    autocomplete.id = "address_autocomplete";
    autocomplete.setAttribute("placeholder", "Start typing...");

    // Show the new element, and keep the old input hidden inside the form
    // so Django still receives the value on submit.
    addressInput.type = "hidden";
    addressInput.parentNode.insertBefore(autocomplete, addressInput);

    // what should happen when a prediction is clicked
    autocomplete.addEventListener("gmp-select", onPlaceChanged);
}

async function onPlaceChanged({ placePrediction }) {
    const place = placePrediction.toPlace();

    await place.fetchFields({
        fields: ["displayName", "formattedAddress", "location", "addressComponents"],
    });

    // User did not select a valid prediction
    if (!place.location) {
        autocomplete.setAttribute("placeholder", "Start typing...");
        return;
    }

    console.log("place name=>", place.displayName);

    // keep the hidden Django field in sync
    document.getElementById("id_address").value = place.formattedAddress || "";

    // get the address components and assign them to the fields
    const get = (type) => {
        const c = (place.addressComponents || []).find((x) => x.types.includes(type));
        return c ? c.longText : "";
    };

    // change these IDs to match your form
    document.getElementById("id_latitude").value  = place.location.lat();
    document.getElementById("id_longitude").value = place.location.lng();
     document.getElementById("id_country").value   = get("country")
    document.getElementById("id_city").value      = get("locality");
    document.getElementById("id_state").value     = get("administrative_area_level_1");
    document.getElementById("id_pin_code").value   = get("postal_code");
}

window.initAutoComplete = initAutoComplete;


$(document).ready(function(){
    // add to cart
    $('.add_to_cart').on('click', function(e){
        e.preventDefault();

        food_id = $(this).attr('data-id');
        url = $(this).attr('data-url');

        data ={
            food_id: food_id,
        }
        $.ajax({
            type: 'GET',
            url: url,
            data: data,
            success: function(response){
                console.log(response)
                if(response.status == 'login_required'){
                    swal(response.message, '', 'info').then(function(){
                        window.location = '/login';
                    })
                }if(response.status == 'Failed'){
                    swal(response.message, '', 'error')
                }else{
                    $('#cart_counter').html(response.cart_counter['cart_count']);
                    $('#qty-'+food_id).html(response.qty);

                    applyCartAmounts(
                        response.cart_amounts['subtotal'],
                        response.cart_amounts['tax'],
                        response.cart_amounts['grand_total'],
                    )
                }
            }
        })

    })

    //place the cart item quantity on load
    $('.item_qty').each(function(){
        var the_id = $(this).attr('id')
        var qty = $(this).attr('data-qty')
        $('#' +the_id).html(qty)
    })

    //decrease cart

    $('.decrease_cart').on('click', function(e){
        e.preventDefault();

        food_id = $(this).attr('data-id');
        url = $(this).attr('data-url');
        cart_id = $(this).attr('id');

        $.ajax({
            type: 'GET',
            url: url,
            success: function(response){
                console.log(response)
                if(response.status == 'login_required'){
                    swal(response.message, '', 'info').then(function(){
                        window.location = '/login';
                    })
                }if(response.status == 'Failed'){
                    swal(response.message, '', 'error')
                }else{
                    $('#cart_counter').html(response.cart_counter['cart_count']);
                    $('#qty-'+food_id).html(response.qty);

                    applyCartAmounts(
                        response.cart_amounts['subtotal'],
                        response.cart_amounts['tax'],
                        response.cart_amounts['grand_total'],
                    )

                }

                if(window.location.pathname == '/cart/'){
                    removeCartItem(response.qty, cart_id);
                    checkEmptyCart();
                }
                
            }
        })

    })

    //DELETE cart item
    
    $('.delete_cart').on('click', function(e){
        e.preventDefault();

        cart_id = $(this).attr('data-id');
        url = $(this).attr('data-url');

        
        $.ajax({
            type: 'GET',
            url: url,
            success: function(response){
                console.log(response)
                if(response.status == 'Failed'){
                    swal(response.message, '', 'error')
                }else{
                    $('#cart_counter').html(response.cart_counter['cart_count']);
                    swal(response.status, response.message, 'success')

                    applyCartAmounts(
                        response.cart_amounts['subtotal'],
                        response.cart_amounts['tax'],
                        response.cart_amounts['grand_total'],
                    )

                    removeCartItem(0, cart_id);
                    checkEmptyCart();
                }

                
            }
        })

    })

    //delete the cart element if the qty is 0

    function removeCartItem(cartItemQty, cart_id){  
        if(cartItemQty <= 0){
        document.getElementById("cart-item-"+cart_id).remove()
        }
    }

    //check empty cart

    function checkEmptyCart(){
        var cart_counter = document.getElementById('cart_counter').innerHTML
        if(cart_counter == 0){
            document.getElementById('empty-cart').style.display = 'block';
        }
    }

    //aplly cart amounts
    function applyCartAmounts(subtotal, tax, grand_total){
        if(window.location.pathname == '/cart/'){
            $('#subtotal').html(subtotal)
            $('#tax').html(tax)
            $('#total').html(grand_total)
        }
    }

});