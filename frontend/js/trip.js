var map;
var bounds;
var trip_data;
var recom_data;
var last_marker = null; // holds last location object
var last_location; // hold last location coordinates
var markers = []; //all google map markers for clearing
var notifications = [];
var myTimeoutId;
var start_icon = "/img/start_icon.png";
var dest_icon = "/img/dest_icon.png";
var user_icon = "/img/user_icon.png";
var route_icon = "/img/route_icon.png";
var rest_icon = "/img/rest_icon.png";
var rest_route_icon = "img/rest_route_icon.png"

// Initialize the Amazon Cognito credentials provider
AWS.config.region = 'us-east-1'; 
AWS.config.credentials = new AWS.CognitoIdentityCredentials({IdentityPoolId: 'us-east-1:f0dd67c1-026b-4502-8a66-424f61eea0a0'});

// Google map api services
var onChangeHandler_1;
var onChangeHandler_2;

// Initialize the map
function initMap() {
  // The map, centered at startLoc
  const usa = { lat: 40.1864644, lng: -99.56579636 }
  const directionsService = new google.maps.DirectionsService();
  const directionsRenderer_1 = new google.maps.DirectionsRenderer({polylineOptions: {strokeColor: "#3498DB"}, suppressMarkers: true});
  const directionsRenderer_2 = new google.maps.DirectionsRenderer({ polylineOptions: { strokeColor: "#FF8C00" }, suppressMarkers: true });
  var mapOptions = { 
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    zoom: 4,
    center: usa
  };
  // Map
  map =  new google.maps.Map(document.getElementById("map"), mapOptions);
  // Bounds for map centering
  bounds  = new google.maps.LatLngBounds();
  // Directions rendered
  directionsRenderer_1.setMap(map);
  directionsRenderer_2.setMap(map);
  // // Change handler to be called when the location names are added
  onChangeHandler_1 = function (start, end) {
    calculateAndDisplayRoute(directionsService, directionsRenderer_1, start, end);
  };
  onChangeHandler_2 = function (start, end) {
    calculateAndDisplayRoute(directionsService, directionsRenderer_2, start, end);
  };
};

// Function to draw path
function calculateAndDisplayRoute(directionsService, directionsRenderer, start, end) {
  directionsService.route(
    {
      // origin: {
      //   query: start,
      // },
      // destination: {
      //   query: end,
      // },
      origin: start,
      destination: end,
      travelMode: google.maps.TravelMode.DRIVING,
    },
    (response, status) => {
      if (status === "OK") {
        directionsRenderer.setDirections(response);
      } else {
        window.alert("Directions request failed due to " + status);
      }
    }
  );
}


// Add a custom marker
function addMarker(location, name, active) {   
  if (name === "Start") {
    marker_icon = start_icon;
  }
  else if (name === "Destination") {
    marker_icon = dest_icon;
  }
  else if (name === "Route") {
    marker_icon = route_icon;
  }
  else if (name === "Rest Route") {
    marker_icon = rest_route_icon;
  }
  else if (name === "User") {
    marker_icon = user_icon;
  }
  else {
    marker_icon = rest_icon;
  }
  var marker = new google.maps.Marker({
      position: location,
      map: map,
      title: name,
      status: active,
      icon: marker_icon

  });

  bounds.extend(marker.position);

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
  markers.push(marker)
  return marker;
};


// Add all the route markers, start and dest
function addAllMarkers(start, dest, route, start_loc, dest_loc) {
  // console.log(start, dest, route)

  // Process and add start marker
  start_lat_lon = { lat: parseFloat(start[0]), lng: parseFloat(start[1]) }
  dest_lat_lon = { lat: parseFloat(dest[0]), lng: parseFloat(dest[1]) }
  addMarker(start_lat_lon, "Start", "active")
  addMarker(dest_lat_lon, "Destination", "active")


  // Get GPS path
  // calculateAndDisplayRoute(directionsService, directionsRenderer, 'New York, NY, USA, ', 'Long Island, New York, USA');
  onChangeHandler_1(start_lat_lon, dest_lat_lon)
  // ===== STYLE 2========
  // var lineCoordinates = [];
  // for (let i = 0; i < route.length; i++) {
  //   let lat_lon = { lat: parseFloat(route[i][0]), lng: parseFloat(route[i][1]) }
  //   lineCoordinates.push(lat_lon);
  // }
  // var linePath = new google.maps.Polyline({
  //   path: lineCoordinates,
  //   geodesic: true,
  //   strokeColor: '#FF0000'
  // });
  // linePath.setMap(map);

  // ======= STYLE 1 ======
  // Process and add route markers
  for (let i = 0; i < route.length; i++) {
    let lat_lon = { lat: parseFloat(route[i][0]), lng: parseFloat(route[i][1]) }
    let marker = addMarker(lat_lon, "Route", "active")
    // console.log(marker)
  }

  // Fit the bounds
  map.fitBounds(bounds);
  map.panToBounds(bounds);
};


// Simulate car movement
function moveTheCar(start, dest, route, time) {
  var i = 0;
  function delayLoop() {
    myTimeoutId = setTimeout(function() {

      if (last_marker != null) {
        last_marker.setMap(null)
      }
      let lat_lon = { lat: parseFloat(route[i][0]), lng: parseFloat(route[i][1]) }
      last_marker = addMarker(lat_lon, "User", "active")
      last_location = { lat: parseFloat(route[i][0]), lng: parseFloat(route[i][1]) }
      i++;
      if (i < route_lat_lon.length) {
        delayLoop();
      }
    }, 10000)
  }
  delayLoop()
};


// End trip
function endTrip(hardEnd) {
  // Stop map simulation
  clearTimeout(myTimeoutId);
  // Disconnect socket
  disconnect()
  console.log({"process_id": trip_data.process_id.S})
  // Terminate EC2
  $.ajax({
    url: "https://6mkswi5hrf.execute-api.us-east-1.amazonaws.com/dev/trip/end",
    type: "POST",
    data: JSON.stringify({"process_id": trip_data.process_id.S}),
    // beforeSend: function(xhr){
    //   xhr.setRequestHeader('x-api-key', 'UPpQWQNa8Q6mYWT2pHSg7aAjhqldY1vC1f6EWduq'); // Not safe but the HW doesn't ask for any secure way to do this
    // },
    error: function(res) {
      alert("Some error occurred");
      console.log(res)
    },
    success: function(res) { 
      if (res.statusCode === 200) {
        console.log('EC2 Terminated')
        if (hardEnd == true){
          alert('Thank you! The trip is over.')
          // Send end signal to EC2
          window.location.href = '/'
        }
      }
      else {
        alert("Some error occurred");
        console.log(res)
      }
  
    }
  });
}

// Get Recommendations
function getRecommendations(manualClick) {

  // Get current location
  if (last_marker != null){
    data = {
      "lat": last_marker.position.lat(),
      "lon": last_marker.position.lng()
    }
  }
  else {
    data = {
      "lat": parseFloat(trip_data.start_lat.S),
      "lon": parseFloat(trip_data.start_lon.S)
    }
  }
  // console.log(data)

  // Get recommendations
  $.ajax({
    url: "https://6mkswi5hrf.execute-api.us-east-1.amazonaws.com/dev/trip/recommendations",
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
          alert(res.response.error);
          throw res.response.error
        }
        else {
          alert("Some unknown error occurred while starting the trip.");
          throw "Some unknown error occurred while starting the trip."
        }
      }
      else if (res.statusCode === 200) {
        // console.log('success')
        recom_data = res.res;
        document.getElementById('recommendationsBody').innerHTML = "";
        if (recom_data.length > 0) {
          // console.log(res.res)
          // Clear timeout
          if (manualClick === true){
            endTrip(false);
          }
          var recomCount = (recom_data.length>=5 ? 5 : recom_data.length)
          for (let i = 0; i < recomCount; i++) {
            rec_name = recom_data[i].name
            rec_tags = recom_data[i].types
            let lat_lon = { lat: parseFloat(recom_data[i].loc.lat), lng: parseFloat(recom_data[i].loc.lng) }
            let marker = addMarker(lat_lon, rec_name, "active", )

            tags_string = ''
            for (let i = 0; i < rec_tags.length; i++) {
              tags_string += '<span class="badge badge-light mr-2">' + rec_tags[i] + '</span>'
            }

            document.getElementById('recommendationsBody').innerHTML += '<div class="alert alert-primary alert-recommendation" role="alert" onclick="selectRecommendation('+i.toString()+')" data-dismiss="modal"><h5>'+rec_name.toUpperCase() +'</h5>'+ tags_string +'</div>'

          }
        }
        else {
          document.getElementById('recommendationsBody').innerHTML = "";
          document.getElementById('recommendationsBody').innerHTML += "No rest area nearby. Please drive to a better location or refresh yourself.";
        }
        
      }
    }
 });
}

// Adds custom lat lon markers
function getCustomRoute(start, dest, marker_type) {
  console.log(start, dest)
  $.ajax({
    url: "https://6mkswi5hrf.execute-api.us-east-1.amazonaws.com/dev/trip/route",
    type: "POST",
    data: JSON.stringify({"start": start, "end": dest, "custom": true}),
    // beforeSend: function(xhr){
    //   xhr.setRequestHeader('x-api-key', 'UPpQWQNa8Q6mYWT2pHSg7aAjhqldY1vC1f6EWduq'); // Not safe but the HW doesn't ask for any secure way to do this
    // },
    error: function(res) {
      console.log(res)
    },
    success: function(res) { 
      if (res.statusCode === 400) {
        if (res.res.error !== undefined){
          alert(res.res.error);
          throw res.res.error
        }
        else {
          alert("Some unknown error occurred while starting the trip.");
          throw "Some unknown error occurred while starting the trip."
        }
      }
      else if (res.statusCode === 200) {
        console.log(res.res);
        
        // AJ
        if (marker_type == "Rest Route"){
          onChangeHandler_2(start, dest)
        }
        else if (marker_type == "Route"){
          onChangeHandler_1(start, dest)
        }
        


        route_lat_lon = res.res.route_lat_lon
        // Process and add route markers
        for (let i = 0; i < route_lat_lon.length; i++) {
          let lat_lon = { lat: parseFloat(route_lat_lon[i][0]), lng: parseFloat(route_lat_lon[i][1]) }
          let marker = addMarker(lat_lon, marker_type, "active")
          // console.log(marker)
        }
      }
      console.log(res);
    }
  });
}

// Select a recommendation
function selectRecommendation(option) {
  // Terminate socket
  disconnect()
  // Clear out the old markers.
  markers.forEach(function(marker) {
      marker.setMap(null);
  });
  markers = [];

  // Set Destination marker
  start_lat_lon = { lat: parseFloat(trip_data.start_lat.S), lng: parseFloat(trip_data.start_lon.S) }
  dest_lat_lon = { lat: parseFloat(trip_data.end_lat.S), lng: parseFloat(trip_data.end_lon.S) }
  addMarker(start_lat_lon, "Start", "active")
  addMarker(dest_lat_lon, "Destination", "active")

  // Set last marker
  if (last_location != undefined){
    addMarker(last_location, "User", "active")
  }
  else{
    addMarker(start_lat_lon, "User", "active")
  }

  // Set rest stop marker
  rest_lat_lon = { lat: parseFloat(recom_data[option].loc.lat), lng: parseFloat(recom_data[option].loc.lng) }
  addMarker(rest_lat_lon, recom_data[option].name, "active", )

  // Get custom routes and marker from user location to rest stop
  if (last_location != undefined){
    getCustomRoute(last_location, rest_lat_lon, "Rest Route")
  }
  else{
    getCustomRoute(start_lat_lon, rest_lat_lon, "Rest Route")
  }

  // Get custom routes and marker from rest stop to destination
  getCustomRoute(rest_lat_lon, dest_lat_lon, "Route")

}

// Function invoked by button click
function speakText(textData) {
  // Create the JSON parameters for getSynthesizeSpeechUrl
  var speechParams = {
      OutputFormat: "mp3",
      SampleRate: "16000",
      Text: "",
      TextType: "text",
      VoiceId: "Joanna"
  };
  speechParams.Text = textData;
  
  // Create the Polly service object and presigner object
  var polly = new AWS.Polly({apiVersion: '2016-06-10'});
  var signer = new AWS.Polly.Presigner(speechParams, polly)

  // Create presigned URL of synthesized speech file
  signer.getSynthesizeSpeechUrl(speechParams, function(error, url) {
  if (error) {
      console.log(error);
  } else {
      document.getElementById('audioSource').src = url;
      document.getElementById('audioPlayback').load();
  }
});
};


// Date formatter
function formatDate(date) {
  var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

  if (month.length < 2) 
      month = '0' + month;
  if (day.length < 2) 
      day = '0' + day;

  return [year, month, day].join('-');
}

// Time formatter
function formatTime(date) {
  var d = new Date(date),
      hours = '' + d.getHours(),
      minutes = '' + d.getMinutes(),
      seconds = '' + d.getSeconds();

  if (hours.length < 2) 
      hours = '0' + hours;
  if (minutes.length < 2) 
      minutes = '0' + minutes;
  if (seconds.length < 2) 
      seconds = '0' + seconds;
  return [hours, minutes, seconds].join(':');
}


// EXTRACT TRIP_ID FROM THE URL QUERY PARAMS
const urlParams = new URLSearchParams(window.location.search);
const trip_id = urlParams.get('tripid');

// Kibana Viz URL
// var viz_01_src = "https://search-kibana-test-hrgtvqtpirdohmbmrl5rxrfzua.us-east-1.es.amazonaws.com/_plugin/kibana/app/visualize#/edit/f9820df0-4783-11eb-ac97-c5bef1173edc?embed=true&_g=(filters:!(),refreshInterval:(pause:!f,value:10000),time:(from:now-7d,to:now))&_a=(filters:!(),linked:!f,query:(language:kuery,query:'trip_id : "+trip_id+"'),uiState:(vis:(colors:('Mouth%20ratio':%23E24D42))),vis:(aggs:!((enabled:!t,id:'1',params:(customLabel:'Eye%20ratio',field:ear),schema:metric,type:sum),(enabled:!t,id:'2',params:(customLabel:Time,drop_partials:!f,extended_bounds:(),field:time,interval:s,min_doc_count:1,scaleMetricValues:!f,timeRange:(from:now-7d,to:now),useNormalizedEsInterval:!t),schema:segment,type:date_histogram),(enabled:!t,id:'3',params:(customLabel:'Mouth%20ratio',field:mar),schema:metric,type:sum)),params:(addLegend:!t,addTimeMarker:!f,addTooltip:!t,categoryAxes:!((id:CategoryAxis-1,labels:(filter:!t,show:!t,truncate:100),position:bottom,scale:(type:linear),show:!t,style:(),title:(),type:category)),grid:(categoryLines:!f),labels:(),legendPosition:right,seriesParams:!((data:(id:'1',label:'Eye%20ratio'),drawLinesBetweenPoints:!t,interpolate:linear,lineWidth:2,mode:normal,show:!t,showCircles:!t,type:line,valueAxis:ValueAxis-1),(data:(id:'3',label:'Mouth%20ratio'),drawLinesBetweenPoints:!t,interpolate:linear,lineWidth:2,mode:normal,show:!t,showCircles:!t,type:line,valueAxis:ValueAxis-1)),thresholdLine:(color:%23E7664C,show:!f,style:full,value:10,width:1),times:!(),type:line,valueAxes:!((id:ValueAxis-1,labels:(filter:!f,rotate:0,show:!t,truncate:100),name:LeftAxis-1,position:left,scale:(mode:normal,type:linear),show:!t,style:(),title:(text:'Ratio%20Value'),type:value))),title:project-line,type:line))"
var viz_01_src = "https://search-kibana-test-hrgtvqtpirdohmbmrl5rxrfzua.us-east-1.es.amazonaws.com/_plugin/kibana/app/visualize#/edit/f9820df0-4783-11eb-ac97-c5bef1173edc?embed=true&_g=(filters:!(),refreshInterval:(pause:!f,value:5000),time:(from:now-15m,to:now))&_a=(filters:!(),linked:!f,query:(language:kuery,query:'trip_id : "+trip_id+"'),uiState:(vis:(colors:('Eye%20ratio':%231F78C1,'Eye%20ratio%20Threshold':%23B7DBAB,'Mouth%20ratio':%23E24D42,'Mouth%20ratio%20Threshold':%23F9934E))),vis:(aggs:!((enabled:!t,id:'1',params:(customLabel:'Eye%20ratio',field:ear),schema:metric,type:max),(enabled:!t,id:'2',params:(customLabel:Time,drop_partials:!f,extended_bounds:(),field:time,interval:s,min_doc_count:1,scaleMetricValues:!f,timeRange:(from:now-15m,to:now),useNormalizedEsInterval:!t),schema:segment,type:date_histogram),(enabled:!t,id:'3',params:(customLabel:'Mouth%20ratio',field:mar),schema:metric,type:max),(enabled:!t,id:'4',params:(customLabel:'Eye%20ratio%20Threshold',field:ear_threshhold),schema:metric,type:max),(enabled:!t,id:'5',params:(customLabel:'Mouth%20ratio%20Threshold',field:mar_threshold),schema:metric,type:min)),params:(addLegend:!t,addTimeMarker:!f,addTooltip:!t,categoryAxes:!((id:CategoryAxis-1,labels:(filter:!t,show:!t,truncate:100),position:bottom,scale:(type:linear),show:!t,style:(),title:(),type:category)),grid:(categoryLines:!f),labels:(),legendPosition:right,seriesParams:!((data:(id:'1',label:'Eye%20ratio'),drawLinesBetweenPoints:!t,interpolate:linear,lineWidth:2,mode:normal,show:!t,showCircles:!t,type:line,valueAxis:ValueAxis-1),(data:(id:'3',label:'Mouth%20ratio'),drawLinesBetweenPoints:!t,interpolate:linear,lineWidth:2,mode:normal,show:!t,showCircles:!t,type:line,valueAxis:ValueAxis-1),(data:(id:'4',label:'Eye%20ratio%20Threshold'),drawLinesBetweenPoints:!t,interpolate:cardinal,lineWidth:2,mode:normal,show:!t,showCircles:!f,type:line,valueAxis:ValueAxis-1),(data:(id:'5',label:'Mouth%20ratio%20Threshold'),drawLinesBetweenPoints:!t,interpolate:cardinal,lineWidth:2,mode:normal,show:!t,showCircles:!f,type:line,valueAxis:ValueAxis-1)),thresholdLine:(color:%23E7664C,show:!f,style:dashed,value:1.2,width:1),times:!(),type:line,valueAxes:!((id:ValueAxis-1,labels:(filter:!f,rotate:0,show:!t,truncate:100),name:LeftAxis-1,position:left,scale:(mode:normal,type:linear),show:!t,style:(),title:(text:'Ratio%20Value'),type:value))),title:project-line,type:line))"


// ROUTE API CALLED WHEN PAGE IS LOADED
$.ajax({
  url: "https://6mkswi5hrf.execute-api.us-east-1.amazonaws.com/dev/trip/route",
  type: "POST",
  data: JSON.stringify({"trip_id": trip_id, "custom": false}),
  // beforeSend: function(xhr){
  //   xhr.setRequestHeader('x-api-key', 'UPpQWQNa8Q6mYWT2pHSg7aAjhqldY1vC1f6EWduq'); // Not safe but the HW doesn't ask for any secure way to do this
  // },
  error: function(res) {
    console.log(res)
  },
  success: function(res) { 
    if (res.statusCode === 400) {
      if (res.res.error !== undefined){
        alert(res.res.error);
        throw res.res.error
      }
      else {
        alert("Some unknown error occurred while starting the trip.");
        throw "Some unknown error occurred while starting the trip."
      }
    }
    else if (res.statusCode === 200) {
      // console.log(res.res);
      trip_data = res.res
      start_loc = res.res.start_loc.S
      start_lat_lon = [res.res.start_lat.S, res.res.start_lon.S]
      dest_loc = res.res.end_loc.S
      dest_lat_lon = [res.res.end_lat.S, res.res.end_lon.S]
      route_lat_lon = res.res.route_lat_lon
      route_time = res.res.route_time
      let trip_date = formatDate(parseInt(trip_data.start_time.S)*1000)
      let trip_time = formatTime(parseInt(trip_data.start_time.S)*1000)

      document.getElementById('trip_id').innerHTML += ' '+trip_data.trip_id.S;
      document.getElementById('trip_date').innerHTML += ' '+trip_date;
      document.getElementById('trip_time').innerHTML += ' '+trip_time;
      document.getElementById('trip_start').innerHTML += ' '+trip_data.start_loc.S;
      document.getElementById('trip_dest').innerHTML += ' '+trip_data.end_loc.S;
      
      document.getElementById('viz_01').src = viz_01_src;
      
      addAllMarkers(start_lat_lon, dest_lat_lon, route_lat_lon, start_loc, dest_loc)
      moveTheCar(start_lat_lon, dest_lat_lon, route_lat_lon, route_time)
    }
  }
});


// VIDEO URL API CALLED WHEN PAGE IS LOADED
$.ajax({
  url: "https://6mkswi5hrf.execute-api.us-east-1.amazonaws.com/dev/trip/video",
  type: "GET",
  // beforeSend: function(xhr){
  //   xhr.setRequestHeader('x-api-key', 'UPpQWQNa8Q6mYWT2pHSg7aAjhqldY1vC1f6EWduq'); // Not safe but the HW doesn't ask for any secure way to do this
  // },
  error: function(res) {
    alert("Please turn on the video stream.");
    console.log(res)
  },
  success: function(res) { 
    if (res.errorMessage) {
        console.log(res)
        alert("Please turn on the video stream.");
        throw "Error occurred in fetching the video stream."
    }
    else if (res.statusCode === 200) {
      // console.log(res.body);
      var videoURI = res.body;
      var playerElement = $('#shaka');
      playerElement.show();
      var player = new shaka.Player(playerElement[0]);
      player.load(videoURI).then(function() {
          console.log('Starting Video Playback');
      });

    }
    else {
      alert("Please turn on the video stream.");
      console.log(res)
    }

  }
});

// Convert gmt to local
function timeZoneCorrect(ts){
  ts += ".000+00:00";
  let d = new Date(ts),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear(),
      hours = '' + d.getHours(),
      minutes = '' + d.getMinutes(),
      seconds = '' + d.getSeconds();

  if (month.length < 2) 
      month = '0' + month;
  if (day.length < 2) 
      day = '0' + day;
  if (hours.length < 2) 
      hours = '0' + hours;
  if (minutes.length < 2) 
      minutes = '0' + minutes;
  if (seconds.length < 2) 
      seconds = '0' + seconds;
  return [year, month, day].join('-')+'T'+[hours, minutes, seconds].join(':');
}

// Web socket for notifications
function connectToWebSocket(){
  webSocketConnection = 'wss://gddowyfaka.execute-api.us-east-1.amazonaws.com/dev/';
  socket = new WebSocket(webSocketConnection);

  socket.onopen = function(event) {
      // document.getElementById("socketState").innerHTML = 'Connection Open';
      console.log('Notification Connection Open')
  };

  socket.onmessage = function(event) {
      // document.getElementById("messages").innerHTML += event.data + '<br/>'
      var notif = event.data.split("; ");
      fixed_time = timeZoneCorrect(notif[2]);
      notif= {"time": fixed_time.split('T')[1], "trip_id": notif[1], "timestamp": notif[2]}

      console.log(notif)
      notifications.push(notif);

      if (notifications.length % 6 == 0) {
        //rec
        template = `
        <div class="alert alert-danger" role="alert">
          <p class="mb-1"><b>Warning!</b> Please take a break at the nearest rest stop.</p>
          <button type="button" class="form-control btn btn-light text-primary small" onclick="getRecommendations(true)" data-toggle="modal" data-target="#recommendationModal"><i class="fas fa-building pr-2"></i><b>Recommendations</b></button>
          <p class="mt-1 mb-0 small" style="text-align:right"><i class="fas fa-clock pr-2"></i> ${notif.time}</p>
        </div>
        `
        
        // Polly speaks
        speakText("Warning! Please take a break at the nearest rest stop.")
      }
      else{
        //alert
        template = `
        <div class="alert alert-warning alert-warning-border" role="alert">
          <p class="mb-0"><b>Attention!</b> Please focus on your driving.</p>
          <p class="mb-0 small" style="text-align:right"><i class="fas fa-clock pr-2"></i> ${notif.time}</p>
        </div>
        `
        speakText("Alert! Please focus.")
      }
      
      
    // Add image
    imgUrl = 'https://project-frontend-web.s3.amazonaws.com/img/trips/'+notif.trip_id+ '/' + notif.timestamp+'.jpeg';
    $('#x-grid-div').append('<a href="'+imgUrl+'" target="_blank" style="text-align:center;">'+notif.time+'<br><img src="'+imgUrl+'" alt="" class="img-thumbnail img-style m-2"></a>');
    document.getElementById('notification-div').innerHTML = template + document.getElementById('notification-div').innerHTML

  };

  socket.onerror = function(event) {
      console.error("WebSocket error observed:", event);
      console.log('Connection Error')
  };

  socket.onclose = function(event) {
      console.log('Notification Connection Closed')
  };
};
connectToWebSocket();

// Closes websocket for notification
function disconnect(){
  socket.close();
};
