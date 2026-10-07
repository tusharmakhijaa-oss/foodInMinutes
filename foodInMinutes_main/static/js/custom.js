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