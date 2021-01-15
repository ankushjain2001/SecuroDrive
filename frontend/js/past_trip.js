var trip_data;

// EXTRACT TRIP_ID FROM THE URL QUERY PARAMS
const urlParams = new URLSearchParams(window.location.search);
const trip_id = urlParams.get('tripid');
console.log(trip_id)

// Kibana Viz URL
// var viz_01_src = "https://search-kibana-test-hrgtvqtpirdohmbmrl5rxrfzua.us-east-1.es.amazonaws.com/_plugin/kibana/app/visualize#/edit/f9820df0-4783-11eb-ac97-c5bef1173edc?embed=true&_g=(filters:!(),refreshInterval:(pause:!f,value:10000),time:(from:now-7d,to:now))&_a=(filters:!(),linked:!f,query:(language:kuery,query:'trip_id : "+trip_id+"'),uiState:(vis:(colors:('Mouth%20ratio':%23E24D42))),vis:(aggs:!((enabled:!t,id:'1',params:(customLabel:'Eye%20ratio',field:ear),schema:metric,type:sum),(enabled:!t,id:'2',params:(customLabel:Time,drop_partials:!f,extended_bounds:(),field:time,interval:s,min_doc_count:1,scaleMetricValues:!f,timeRange:(from:now-7d,to:now),useNormalizedEsInterval:!t),schema:segment,type:date_histogram),(enabled:!t,id:'3',params:(customLabel:'Mouth%20ratio',field:mar),schema:metric,type:sum)),params:(addLegend:!t,addTimeMarker:!f,addTooltip:!t,categoryAxes:!((id:CategoryAxis-1,labels:(filter:!t,show:!t,truncate:100),position:bottom,scale:(type:linear),show:!t,style:(),title:(),type:category)),grid:(categoryLines:!f),labels:(),legendPosition:right,seriesParams:!((data:(id:'1',label:'Eye%20ratio'),drawLinesBetweenPoints:!t,interpolate:linear,lineWidth:2,mode:normal,show:!t,showCircles:!t,type:line,valueAxis:ValueAxis-1),(data:(id:'3',label:'Mouth%20ratio'),drawLinesBetweenPoints:!t,interpolate:linear,lineWidth:2,mode:normal,show:!t,showCircles:!t,type:line,valueAxis:ValueAxis-1)),thresholdLine:(color:%23E7664C,show:!f,style:full,value:10,width:1),times:!(),type:line,valueAxes:!((id:ValueAxis-1,labels:(filter:!f,rotate:0,show:!t,truncate:100),name:LeftAxis-1,position:left,scale:(mode:normal,type:linear),show:!t,style:(),title:(text:'Ratio%20Value'),type:value))),title:project-line,type:line))"


// var viz_01_src = "https://search-kibana-test-hrgtvqtpirdohmbmrl5rxrfzua.us-east-1.es.amazonaws.com/_plugin/kibana/app/visualize#/edit/f9820df0-4783-11eb-ac97-c5bef1173edc?embed=true&_g=(filters:!(),refreshInterval:(pause:!f,value:5000),time:(from:now-15m,to:now))&_a=(filters:!(),linked:!f,query:(language:kuery,query:'trip_id : "+trip_id+"'),uiState:(vis:(colors:('Eye%20ratio':%231F78C1,'Eye%20ratio%20Threshold':%23B7DBAB,'Mouth%20ratio':%23E24D42,'Mouth%20ratio%20Threshold':%23F9934E))),vis:(aggs:!((enabled:!t,id:'1',params:(customLabel:'Eye%20ratio',field:ear),schema:metric,type:max),(enabled:!t,id:'2',params:(customLabel:Time,drop_partials:!f,extended_bounds:(),field:time,interval:m,min_doc_count:1,scaleMetricValues:!f,timeRange:(from:now-15m,to:now),useNormalizedEsInterval:!t),schema:segment,type:date_histogram),(enabled:!t,id:'3',params:(customLabel:'Mouth%20ratio',field:mar),schema:metric,type:max),(enabled:!t,id:'4',params:(customLabel:'Eye%20ratio%20Threshold',field:ear_threshhold),schema:metric,type:max),(enabled:!t,id:'5',params:(customLabel:'Mouth%20ratio%20Threshold',field:mar_threshold),schema:metric,type:min)),params:(addLegend:!t,addTimeMarker:!f,addTooltip:!t,categoryAxes:!((id:CategoryAxis-1,labels:(filter:!t,show:!t,truncate:100),position:bottom,scale:(type:linear),show:!t,style:(),title:(),type:category)),grid:(categoryLines:!f),labels:(),legendPosition:right,seriesParams:!((data:(id:'1',label:'Eye%20ratio'),drawLinesBetweenPoints:!t,interpolate:linear,lineWidth:2,mode:normal,show:!t,showCircles:!t,type:line,valueAxis:ValueAxis-1),(data:(id:'3',label:'Mouth%20ratio'),drawLinesBetweenPoints:!t,interpolate:linear,lineWidth:2,mode:normal,show:!t,showCircles:!t,type:line,valueAxis:ValueAxis-1),(data:(id:'4',label:'Eye%20ratio%20Threshold'),drawLinesBetweenPoints:!t,interpolate:cardinal,lineWidth:2,mode:normal,show:!t,showCircles:!f,type:line,valueAxis:ValueAxis-1),(data:(id:'5',label:'Mouth%20ratio%20Threshold'),drawLinesBetweenPoints:!t,interpolate:cardinal,lineWidth:2,mode:normal,show:!t,showCircles:!f,type:line,valueAxis:ValueAxis-1)),thresholdLine:(color:%23E7664C,show:!f,style:dashed,value:1.2,width:1),times:!(),type:line,valueAxes:!((id:ValueAxis-1,labels:(filter:!f,rotate:0,show:!t,truncate:100),name:LeftAxis-1,position:left,scale:(mode:normal,type:linear),show:!t,style:(),title:(text:'Ratio%20Value'),type:value))),title:project-line,type:line))"

var viz_01_src = "https://search-kibana-test-hrgtvqtpirdohmbmrl5rxrfzua.us-east-1.es.amazonaws.com/_plugin/kibana/app/visualize#/edit/f9820df0-4783-11eb-ac97-c5bef1173edc?embed=true&_g=(filters:!(),refreshInterval:(pause:!f,value:5000),time:(from:now-15m,to:now))&_a=(filters:!(),linked:!f,query:(language:kuery,query:'trip_id : "+trip_id+"'),uiState:(vis:(colors:('Eye%20ratio':%231F78C1,'Eye%20ratio%20Threshold':%23B7DBAB,'Mouth%20ratio':%23E24D42,'Mouth%20ratio%20Threshold':%23F9934E))),vis:(aggs:!((enabled:!t,id:'1',params:(customLabel:'Eye%20ratio',field:ear),schema:metric,type:max),(enabled:!t,id:'2',params:(customLabel:Time,drop_partials:!f,extended_bounds:(),field:time,interval:s,min_doc_count:1,scaleMetricValues:!f,timeRange:(from:now-15m,to:now),useNormalizedEsInterval:!t),schema:segment,type:date_histogram),(enabled:!t,id:'3',params:(customLabel:'Mouth%20ratio',field:mar),schema:metric,type:max),(enabled:!t,id:'4',params:(customLabel:'Eye%20ratio%20Threshold',field:ear_threshhold),schema:metric,type:max),(enabled:!t,id:'5',params:(customLabel:'Mouth%20ratio%20Threshold',field:mar_threshold),schema:metric,type:min)),params:(addLegend:!t,addTimeMarker:!f,addTooltip:!t,categoryAxes:!((id:CategoryAxis-1,labels:(filter:!t,show:!t,truncate:100),position:bottom,scale:(type:linear),show:!t,style:(),title:(),type:category)),grid:(categoryLines:!f),labels:(),legendPosition:right,seriesParams:!((data:(id:'1',label:'Eye%20ratio'),drawLinesBetweenPoints:!t,interpolate:linear,lineWidth:2,mode:normal,show:!t,showCircles:!t,type:line,valueAxis:ValueAxis-1),(data:(id:'3',label:'Mouth%20ratio'),drawLinesBetweenPoints:!t,interpolate:linear,lineWidth:2,mode:normal,show:!t,showCircles:!t,type:line,valueAxis:ValueAxis-1),(data:(id:'4',label:'Eye%20ratio%20Threshold'),drawLinesBetweenPoints:!t,interpolate:cardinal,lineWidth:2,mode:normal,show:!t,showCircles:!f,type:line,valueAxis:ValueAxis-1),(data:(id:'5',label:'Mouth%20ratio%20Threshold'),drawLinesBetweenPoints:!t,interpolate:cardinal,lineWidth:2,mode:normal,show:!t,showCircles:!f,type:line,valueAxis:ValueAxis-1)),thresholdLine:(color:%23E7664C,show:!f,style:dashed,value:1.2,width:1),times:!(),type:line,valueAxes:!((id:ValueAxis-1,labels:(filter:!f,rotate:0,show:!t,truncate:100),name:LeftAxis-1,position:left,scale:(mode:normal,type:linear),show:!t,style:(),title:(text:'Ratio%20Value'),type:value))),title:project-line,type:line))"

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

// ROUTE API CALLED WHEN PAGE IS LOADED
$.ajax({
  url: "https://6mkswi5hrf.execute-api.us-east-1.amazonaws.com/dev/history/item",
  type: "POST",
  data: JSON.stringify({"trip_id": trip_id}),
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
      trip_data = res.res
      let trip_date = formatDate(parseInt(trip_data.start_time)*1000)
      let trip_time = formatTime(parseInt(trip_data.start_time)*1000)
      document.getElementById('trip_id').innerHTML += ' '+trip_data.trip_id;
      document.getElementById('trip_date').innerHTML += ' '+trip_date;
      document.getElementById('trip_time').innerHTML += ' '+trip_time;
      document.getElementById('trip_start').innerHTML += ' '+trip_data.start_loc;
      document.getElementById('trip_dest').innerHTML += ' '+trip_data.end_loc;
      document.getElementById('trip_start_ll').innerHTML += ' '+parseFloat(trip_data.start_lat).toFixed(4).toString()+' / '+parseFloat(trip_data.start_lon).toFixed(4).toString();
      document.getElementById('trip_dest_ll').innerHTML += ' '+parseFloat(trip_data.end_lat).toFixed(4).toString()+' / '+parseFloat(trip_data.end_lon).toFixed(4).toString();
      document.getElementById('viz_01').src = viz_01_src;
      
      // Add image
      console.log(trip_data.images)
      for (let i=0; i<trip_data.images.length; i++){
        var title = timeZoneCorrect(trip_data.images[i]);
        console.log(title)
        imgUrl = 'https://project-frontend-web.s3.amazonaws.com/img/trips/'+trip_data.trip_id+ '/' + trip_data.images[i]+'.jpeg';
        $('#x-grid-div').append('<a href="'+imgUrl+'" target="_blank" style="text-align:center;">'+title.split('T')[1]+'<br><img src="'+imgUrl+'" alt="" class="img-thumbnail img-style m-2"></a>');
      }

      // Kibana viz
      document.getElementById('viz_01').onload = function() {
        document.getElementsByClassName('globalQueryBar').display = 'none';
      }
    }
  }
});



