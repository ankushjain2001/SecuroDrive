var map;
var bounds;
var start_marker = null; // will hold start marker object. (lat lon in start_marker.position)
var dest_marker = null; // will hold dest marker object. (lat lon in dest_marker.position)
var start_icon = "/img/start_icon.png";
var dest_icon = "/img/dest_icon.png";

// Places textbox listeners
$(document).ready(function () {
  var autocompleteStart;
  var autocompleteDest;
  autocompleteStart = new google.maps.places.SearchBox((document.getElementById("tripStart")), {
      types: ['geocode'],
  });
  autocompleteDest = new google.maps.places.SearchBox((document.getElementById("tripDestination")), {
      types: ['geocode'],
});

  google.maps.event.addListener(autocompleteStart, 'places_changed', function () {
      var near_place = autocompleteStart.getPlaces();
      loc = near_place[0].geometry.location
      addMarker(loc, 'Start', "active");
  });

  google.maps.event.addListener(autocompleteDest, 'places_changed', function () {
      var near_place = autocompleteDest.getPlaces();
      loc = near_place[0].geometry.location
      addMarker(loc, 'Destination', "active");
  });
});

// Listeners to make marker data null when text box data is changed and not picked from google suggestions
$(document).on('change', '#tripStart', function () {
  start_marker = null;
});

$(document).on('change', '#tripDestination', function () {
  dest_marker = null;
});

// Initialize the map
function initMap() {
  // The map, centered at startLoc
  const usa = { lat: 40.1864644, lng: -99.56579636 }
  var mapOptions = { 
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    zoom: 4,
    center: usa
  };
  // Map
  map =  new google.maps.Map(document.getElementById("map"), mapOptions);
  // Bounds for map centering
  bounds  = new google.maps.LatLngBounds();
}

// Function to add new start or destination marker
function addMarker(location, name, active) {   
  if (name === "Start") {
    marker_icon = start_icon;
  }
  else if (name === "Destination") {
    marker_icon = dest_icon;
  }     
  var marker = new google.maps.Marker({
      position: location,
      map: map,
      title: name,
      status: active,
      icon: marker_icon

  });
  // If Start Marker
  if (name === "Start") {
    if (start_marker != null){
      start_marker.setMap(null);
    }
    start_marker = marker
  }
  // If Dest Marker
  if (name === "Destination") {
    if (dest_marker != null){
      dest_marker.setMap(null);
    }
    dest_marker = marker
  }

  // Update both bounds if they are not null
  bounds  = new google.maps.LatLngBounds();
  if (start_marker != null){
    bounds.extend(start_marker.position);
  }
  if (dest_marker != null){
    bounds.extend(dest_marker.position);
  }

  // Fit the bounds
  map.fitBounds(bounds);
  map.panToBounds(bounds);
  
  // Bounce animation
  function toggleBounceStart() {
    if (marker.getAnimation() !== null) {
      marker.setAnimation(null);
    } else {
      marker.setAnimation(google.maps.Animation.BOUNCE);
      marker.setAnimation(null);
    }
  }
  marker.addListener("click", toggleBounceStart);
};


function startTrip(e){
  e.preventDefault();
  document.getElementById("spin-loader").style.display = "inline-block";
  
  if (document.getElementById("tripStart").value == "" || document.getElementById("tripDestination").value =="") {
    document.getElementById("spin-loader").style.display = "none";
    alert("Please select both source and destination!")
    throw "Please select both source and destination!"
  } else if (start_marker ==null || dest_marker == null){
    document.getElementById("spin-loader").style.display = "none";
    alert("Please select both source and destination from the suggestions!")
    throw "Please select both source and destination from the suggestions!"
  }

  // Data for api call body
  var data = {
    "email": localStorage.getItem("current_user_email"),
    "start": {
      "loc": document.getElementById("tripStart").value,
      "lat": start_marker.position.lat(),
      "lon": start_marker.position.lng()
    },
    "end": {
      "loc": document.getElementById("tripDestination").value,
      "lat": dest_marker.position.lat(),
      "lon": dest_marker.position.lng()
    }
  }

  // API call
  $.ajax({
    url: "https://6mkswi5hrf.execute-api.us-east-1.amazonaws.com/dev/trip/start",
    type: "POST",
    data: JSON.stringify(data),
    // beforeSend: function(xhr){
    //   xhr.setRequestHeader('x-api-key', 'UPpQWQNa8Q6mYWT2pHSg7aAjhqldY1vC1f6EWduq'); // Not safe but the HW doesn't ask for any secure way to do this
    // },
    error: function(res) {
      console.log(res)
    },
    success: function(res) { 
      if (res.statusCode === 400) {
        if (res.response.error !== undefined){
          document.getElementById("spin-loader").style.display = "none";
          alert(res.response.error);
          throw res.response.error
        }
        else 
          document.getElementById("spin-loader").style.display = "none";{
          alert("Some unknown error occurred while starting the trip.");
          throw "Some unknown error occurred while starting the trip."
        }
      }
      else if (res.statusCode === 200) {
        console.log(res.response);
        console.log('Success');
        window.location.href = '/trip.html?tripid='+res.response.trip_id
      }
    }
 });

};



