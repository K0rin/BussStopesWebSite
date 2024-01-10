const SERVER = "http://localhost:3000/";


$(document).ready(function() {
  $('#combo-box-area').select2();
});

$(document).ready(function() {
  $('#combo-box-stops').select2();
});

var ariaSelect = document.getElementById("combo-box-area");
var stopSelect = document.getElementById("combo-box-stops");
var busSelect = document.getElementById("bus-list");
let locationDivText =document.getElementById("location-info");
let bussTimeInfo = document.getElementById("buss-time-info");
let bestStopFlag = 0;
let bestStopId;


// Function to fetch data from the backend
async function getAriaList() {
  const address = SERVER + "getAriaList";
    const result = await fetch(address);
    const text = await result.text();
    const data = JSON.parse(text);
    busSelect.innerHTML = "";
    for(let area of data){
      let option = document.createElement("option")
      option.value = area.stop_area;
      option.text = area.stop_area;
      ariaSelect.appendChild(option);
    }
}

async function getStopsList() {
  let stopArea = ariaSelect.value;
  const stops = SERVER + "getBussStops/" + stopArea;
    const result = await fetch(stops);
    const text = await result.text();
    const data = JSON.parse(text);
    removeOptions(stopSelect)
    for(let stop of data){
      let option = document.createElement("option")
      option.value = stop.stop_id;
      option.text = stop.stop_name + " " +stop.stop_code;
      stopSelect.appendChild(option);
    }
}

async function getBusList() {
  let stopId = stopSelect.value;
  // if(bestStopFlag >0){
  //   bestStopFlag=0;
  //   stopId = bestStopId;
  // }else{
  //   stopId = stopSelect.value;
  // }
  const busses = SERVER + "getBuss/" + stopId;
    const result = await fetch(busses);
    const text = await result.text();
    const data = JSON.parse(text);
    busSelect.innerHTML = "";
    for(let bus of data){
      let button = document.createElement("button");
      button.innerText = bus.route_short_name;
      button.value = bus.route_id;
      button.className = "btn btn-success";
      button.style.marginRight = "10px";
      button.style.marginBottom = "10px";
      button.addEventListener("click", function() {
        getBussArrivalTime(button.value);
      });
      console.log(bus.route_short_name);
      console.log(bus.route_id);
      console.log(button.value);
      busSelect.appendChild(button);
    }
}

function handleGetArea(){
  console.log(ariaSelect.value);
}

function handleStops(){
  console.log(stopSelect.value);
}

function handleBus(){
  
}

function removeOptions(selectElement) {
  let i, L = selectElement.options.length - 1;
  for(i = L; i >= 0; i--) {
     selectElement.remove(i);
  }
}

function getLocationInfo() {
  if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(showPosition, console.log);
  } else {
  console.log("The Browser Does not Support Geolocation");
  }
}

function showPosition(position) {
  let lat = position.coords.latitude;
  let lon = position.coords.longitude;
  // You need to enter your API Key here
  console.log(lat);
  console.log(lon);
  getNearCityNameStopName(lat, lon);
}

async function getNearCityNameStopName(latitude, longitude) {
  const stops = SERVER + "getStopsList";
    const result = await fetch(stops);
    const text = await result.text();
    const data = JSON.parse(text);
    let minimum = 0;
    let counter = 0;
    let stopData;
    for(let stop of data){
      routeLength = Math.sqrt((stop.stop_lat-latitude)*(stop.stop_lat-latitude)+(stop.stop_lon-longitude)*(stop.stop_lon-longitude));
      if(counter<1){
        minimum=routeLength;
        stopData=stop;
      }else{
        if(routeLength<minimum){
          minimum=routeLength;
          stopData=stop;
        }
      }
      counter=counter+1;
    }
    console.log(stopData.stop_name);
    cityText="Teie linn: "+stopData.stop_area;
    stopText="Lähedam peautus on: "+stopData.stop_name;
    locationDivText.innerHTML="<p>"+cityText+"<p/>"+"<p>"+stopText+" "+stopData.stop_code+"<p/>";
    let button = document.createElement("button");
    button.value = stopData.stop_id;
    button.innerText = "Show busses";
    button.id = "bestStop";
    button.className = "btn btn-primary";
    button.addEventListener("click", function() {
      // bestStopFlag = 1;
      // bestStopId = stopData.stop_id;
      let option = document.createElement("option")
      option.value = stopData.stop_id;
      option.text = stopData.stop_name + " " +stopData.stop_code;
      stopSelect.appendChild(option);
      getBusList();
    });
    locationDivText.appendChild(button);
}

async function getBussArrivalTime(routeId) {
  console.log(routeId);
  const buss = SERVER + "getBussTime/" + routeId;
  const result = await fetch(buss);
  const text = await result.text();
  const data = JSON.parse(text);
  let today = new Date();
  let time = today.toLocaleTimeString();
  let counter = 0;
  let minimum = 0;
  let currentTimeInMinutes = parseInt(time.slice(0,2))*60+parseInt(time.slice(3,5));
  console.log(currentTimeInMinutes);
  let tripData;
  for(let trip of data){
    tripTime=parseInt(trip.arrival_time.slice(0,2))*60+parseInt(trip.arrival_time.slice(3,5))
    routeLength=tripTime-currentTimeInMinutes;
      if(counter<1 && routeLength>0 && trip.stop_id==stopSelect.value){
        minimum=routeLength;
        tripData=trip;
        counter=counter+1;
      }else{
        if(routeLength<minimum && routeLength>0 && trip.stop_id==stopSelect.value){
          minimum=routeLength;
          tripData=trip;
          counter=counter+1;
        }
      }
  }
  try {
    console.log(tripData.arrival_time);
    bussTimeInfo.innerHTML = "<p>Buss peatub kell: "+tripData.arrival_time+"</p>";
    bussTimeInfo.className = "alert alert-success";
  } catch (err) {
    console.log("Kahjuks selline reis täna juba lõpetas oma reisiplaani.");
    bussTimeInfo.innerHTML = "<p>Kahjuks selline reis täna juba lõpetas oma reisiplaani.</p>";
    bussTimeInfo.className = "alert alert-danger";
  }
    //console.log(stopData.arrival_time);
}
// Start Aplication
getAriaList();
getLocationInfo();
