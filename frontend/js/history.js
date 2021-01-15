// Get history data
var history_data;
var trip_id;
var trip_date;
var email_id = localStorage.getItem('current_user_email');

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

// Show history function to navigate to item page
function showHistory(trip_id){
  window.location.href = '/past_trip.html?tripid='+trip_id
}


// API CALLED WHEN PAGE IS LOADED
$.ajax({
  url: "https://6mkswi5hrf.execute-api.us-east-1.amazonaws.com/dev/history/list",
  type: "POST",
  data: JSON.stringify({"email_id": email_id,}),
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
      history_data = res.res
      history_data.sort((a, b) => (a.start_time < b.start_time) ? 1 : -1)
      // Insert history data
      for (let i = 0; i < history_data.length; i++) {
        trip_id = history_data[i].trip_id
        let trip_date = formatDate(parseInt(history_data[i].start_time)*1000)
        let trip_time = formatTime(parseInt(history_data[i].start_time)*1000)
        trip_start = history_data[i].start_loc
        trip_dest = history_data[i].end_loc

        template = `
        <div class="alert alert-primary alert-recommendation" role="alert" onclick="showHistory('${trip_id}')">
          <div class="row">
            <div class="col text-dark">
              <h6><b>TRIP ID:</b> ${trip_id}</h6>
            </div>
            <div class="col-2 text-dark">
            <span><b><i class="fas fa-calendar-alt pr-2"></i></b> ${trip_date}</span>
          </div>
          <div class="col-2 text-dark">
            <span><b><i class="fas fa-clock pr-2"></i></b> ${trip_time}</span>
          </div>
          </div>
          <hr class="mt-0 mb-2">
          <div class="row">

          
            <div class="col">
              <span><i class="fas fa-map-marker-alt pr-2"></i><b>Start: </b> ${trip_start}</span>
            </div>
            <div class="col">
              <span><i class="fas fa-map-marker-alt pr-2"></i><b>Destination: </b> ${trip_dest}</span>
            </div>
          </div>           
        </div>  
        `
        document.getElementById('historyTable').innerHTML += template;
      }
    }
  }
});




