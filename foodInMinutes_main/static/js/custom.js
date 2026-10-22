/* let autocomplete;

async function initAutoComplete() {

    const { PlaceAutocompleteElement } = await google.maps.importLibrary("places");

    const addressInput = document.getElementById("id_address");

    autocomplete = new PlaceAutocompleteElement({
        // default in this app is "IN" - add your country code
        includedRegionCodes: ["in"],
    });
    // autocomplete.id = "address_autocomplete";
    // autocomplete.setAttribute("placeholder", "Start typing...");

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

window.initAutoComplete = initAutoComplete; */

let sessionToken;
let debounceTimer;
let AutocompleteSuggestion, AutocompleteSessionToken;

async function initAutoComplete() {
    const input = document.getElementById("id_address");
    const list = document.getElementById("address_suggestions");
    if (!input || !list) return; // page has no address field

    ({ AutocompleteSuggestion, AutocompleteSessionToken } =
        await google.maps.importLibrary("places"));

    sessionToken = new AutocompleteSessionToken();

    input.addEventListener("input", () => {
        clearTimeout(debounceTimer);
        const query = input.value.trim();

        if (query.length < 3) {
            list.innerHTML = "";
            return;
        }

        debounceTimer = setTimeout(async () => {
            try {
                const { suggestions } =
                    await AutocompleteSuggestion.fetchAutocompleteSuggestions({
                        input: query,
                        includedRegionCodes: ["in"],
                        sessionToken,
                    });
                renderSuggestions(suggestions);
            } catch (err) {
                console.error("Autocomplete error:", err);
            }
        }, 250);
    });

    document.addEventListener("click", (e) => {
        if (!list.contains(e.target) && e.target !== input) list.innerHTML = "";
    });
}

function renderSuggestions(suggestions) {
    const list = document.getElementById("address_suggestions");
    list.innerHTML = "";

    suggestions.forEach((s) => {
        const prediction = s.placePrediction;
        if (!prediction) return;

        const item = document.createElement("div");
        item.className = "address-suggestion-item";
        item.textContent = prediction.text.text;
        item.addEventListener("click", () => onPlaceChanged(prediction));
        list.appendChild(item);
    });
}

async function onPlaceChanged(placePrediction) {
    const place = placePrediction.toPlace();

    await place.fetchFields({
        fields: ["displayName", "formattedAddress", "location", "addressComponents"],
    });

    if (!place.location) return;

    document.getElementById("id_address").value = place.formattedAddress || "";
    document.getElementById("address_suggestions").innerHTML = "";

    const get = (type) => {
        const c = (place.addressComponents || []).find((x) => x.types.includes(type));
        return c ? c.longText : "";
    };

    const setVal = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.value = value;
    };

    setVal("id_latitude", place.location.lat());
    setVal("id_longitude", place.location.lng());
    setVal("id_country", get("country"));
    setVal("id_city", get("locality"));
    setVal("id_state", get("administrative_area_level_1"));
    setVal("id_pin_code", get("postal_code"));

    sessionToken = new AutocompleteSessionToken();
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
                        response.cart_amounts['tax_dict'],
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
                        response.cart_amounts['tax_dict'],
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
                        response.cart_amounts['tax_dict'],
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
        if(cart_counter == 0){$('.add_hour').on('click', function(e){
        e.preventDefault();
        var day = document.getElementById('id_day').value
        var from_hour = document.getElementById('id_from_hour').value
        var to_hour = document.getElementById('id_to_hour').value
        var is_closed = document.getElementById('id_is_closed').checked
        var csrf_token =$('input[name =csrfmiddlewaretoken]').val
        var url = document.getElementById('add_hour_url').value

        console.log(day, from_hour, to_hour,is_closed,csrf_token)

        if(is_closed){
            is_closed ='True'
            condition = "day != ''"
        }else{
            is_closed = 'False'
            condition = "day != '' && from_hour != '' && to_hour != ''"
        }


        if(eval(condition)){
            $.ajax({
                type: 'POST',
                url: url,
                data: {
                    'day':day,
                    'from_hour':from_hour,
                    'to_hour': to_hour,
                    'is_closed': is_closed,
                    'csrfmiddlewaretoken': csrf_token,
                },
                success: function(response){
                    console.log(response)
                }
            })
        }else{
            swal('Please Fill all the fields', '', 'info')
        }
    })
            document.getElementById('empty-cart').style.display = 'block';
        }
    }

    //aplly cart amounts
    function applyCartAmounts(subtotal, tax_dict, grand_total){
        if(window.location.pathname == '/cart/'){
            $('#subtotal').html(subtotal)
            $('#total').html(grand_total)

            for(key1 in tax_dict){
                for(key2 in tax_dict[key1]){
                    $('#tax-'+key1).html(tax_dict[key1][key2])
                }
            }

        }
    }

    // ADD opening hour

    $('.add_hour').on('click', function(e){
        e.preventDefault();
        var day = document.getElementById('id_day').value
        var from_hour = document.getElementById('id_from_hour').value
        var to_hour = document.getElementById('id_to_hour').value
        var is_closed = document.getElementById('id_is_closed').checked
        var csrf_token =$('input[name =csrfmiddlewaretoken]').val()
        var url = document.getElementById('add_hour_url').value

        console.log(day, from_hour, to_hour,is_closed,csrf_token)

        if(is_closed){
            is_closed ='True'
            condition = "day != ''"
        }else{
            is_closed = 'False'
            condition = "day != '' && from_hour != '' && to_hour != ''"
        }


        if(eval(condition)){
            $.ajax({
                type: 'POST',
                url: url,
                data: {
                    'day':day,
                    'from_hour':from_hour,
                    'to_hour': to_hour,
                    'is_closed': is_closed,
                    'csrfmiddlewaretoken': csrf_token,
                },
                success: function(response){
                    if(response.status == 'success'){
                        if(response.is_closed == 'closed'){
                            html = '<tr id="hour-'+response.id+'"> <td><b>'+response.day+'</b></td><td>Closed</td><td><a href="#" class="remove_hour" data-url="/vendor/opening-hours/remove/'+response.id+'/">Remove</td></tr>'
                        }else{
                            html= '<tr id="hour-'+response.id+'"> <td><b>'+response.day+'</b></td><td>'+response.from_hour+'-'+response.to_hour+'</td><td><a href="#" class="remove_hour" data-url="/vendor/opening-hours/remove/'+response.id+'/">Remove</td></tr>'
                        }
                        
                        $(".opening_hours").append(html)
                        document.getElementById("opening_hours").reset();
                    }else{
                        swal(response.message, '', 'error')
                    }
                }
            })
        }else{
            swal('Please Fill all the fields', '', 'info')
        }
    })

    //Remove opneing hour


    $(document).on('click', '.remove_hour', function(e){
        e.preventDefault();
        url = $(this).attr('data-url');
        console.log(url)
        
        $.ajax({
            type: 'GET',
            url: url,
            success: function(response){
                if(response.status == 'success')
                    document.getElementById('hour-'+response.id).remove()
            }

        })
    })




});