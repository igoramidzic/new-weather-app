/* ------------------------------ Variables --------------------------------- */
var lat, long, city, country, Ftemp, Ctemp, unitTemp, summary, icon, animation,
userSearchLocation, currentLocation;
var currentUnit = 'F';
var locationAPI = 'https://maps.googleapis.com/maps/api/geocode/json?latlng='
var cityLocationAPI = 'https://maps.googleapis.com/maps/api/geocode/json?address='
var weatherAPI = 'https://api.darksky.net/forecast/458b757b57430aa13526445cfd375d84/'


$(document).ready(function () {

/* ------------------------ Change animation function ----------------------- */
function determineAnimation () {
  $('.default').addClass('hide');
  switch (icon) {
    case 'clear-day':
    case 'clear-night':
      animation = 'contain-sunny';
      break;
    case 'rain':
      animation = 'contain-rainy';
      break;
    case 'snow':
    case 'sleet':
      animation = 'contain-flurries';
      break;
    case 'wind':
    case 'fog':
    case 'cloudy':
    case 'partly-cloudy-day':
    case 'partly-cloudy-night':
      animation = 'contain-cloudy';
      break;
    default: 'default'
  }
  $('.divToHide').addClass('hide');
  $(`.${animation}`).css('opacity', '1');
  $(`.${animation}`).removeClass('hide');
}

/* ------------------- Check current unit function ------- Not DRY ---------- */
function checkCurrentUnit () {
  if (currentUnit === 'F') {
    unitTemp = Ftemp;
  } else if (currentUnit === 'C') {
    unitTemp = Ctemp;
  }
  $('#tempNum').text(unitTemp);
}

/* ---------------------- Change unit function ---------- Not DRY ----------- */
function changeUnit () {
  // Change from F to C on clic
  if (currentUnit === 'F') {
    currentUnit = 'C';
    unitTemp = Ctemp;
  } else if (currentUnit === 'C') {
    currentUnit = 'F';
    unitTemp = Ftemp;
  }
  $('#tempNum').text(unitTemp);
  $('#unit').text(currentUnit);
}

/* --------------------------- Fetch city & country ------------------------- */
function fetchCityAndCountry () {
  $.ajax({
    url: locationAPI + `${lat},${long}`,
    success: function (data) {
      city = data.results[0].address_components[3].long_name;
      country = data.results[0].address_components[5].short_name;
      $('#location').text(`${city}, ${country}`);
    }
  })
}

/* ------------------------- Fetch coords of location ----------------------- */
function fetchCoordsOfLocation () {
  $.ajax({
    url: cityLocationAPI + `${userSearchLocation}`,
    success: function (data) {
      if (data.status === 'ZERO_RESULTS') {
        $('#locationTextBox').attr('placeholder', 'Not found');
      } else {
        lat = data.results[0].geometry.location.lat;
        long = data.results[0].geometry.location.lng;
        fetchCityAndCountry();
        fetchWeatherForCity();
        $('#updateBtn').val('Your location');
      }
    }
  })
}

/* -------------------------- Fetch weather for city ------------------------ */
function fetchWeatherForCity () {
  $.ajax({
    url: weatherAPI + `${lat},${long}`,
    dataType: "jsonp",
    success: function (data) {
      Ftemp = Math.round(data.currently.temperature);
      // Calculate celcius degrees
      Ctemp = Math.round((Ftemp - 32) * (5/9));
      summary = data.currently.summary;
      icon = data.currently.icon;

      // Check icon to determine the animation
      checkCurrentUnit();
      determineAnimation();
      // Change elements on page with jQuery
      $('#summary').text(summary);
      $('.weather-info').css('opacity', '1');
      $('.divToHide').css('opacity', '1');
    }
  });
}

/* --------------------------- Geolocation function ------------------------- */
function geolocation () {
  $('#updateBtn').attr('disabled', 'disabled');
  navigator.geolocation.getCurrentPosition(function (position) {
    lat = position.coords.latitude;
    long = position.coords.longitude;

    /* Functions for fetching city and weather data.
      These functions are inside of here so that they only run when the
      location is found. */
    fetchCityAndCountry();
    fetchWeatherForCity();

    // Return functionality to update button
    $('#updateBtn').removeAttr('disabled');

  // If user does not have geolocation enabled
  }, function () {
    $('#updateBtn').css('background-color', 'red');
    $('#updateBtn').val('Error');
  });
}
// Run on document initialize
geolocation();

  // User wants to update the weather data
  $('#updateBtn').click(function () {
    $('.weather-info').css('opacity', '0.1');
    $('.divToHide').css('opacity', '0.1');
    $('.default').css('opacity', '0.1');
    $(this).val('Update')
    geolocation();
  });

  // User chooses unit measurment
  $('#unit').click(function () {
    changeUnit();
  })

  // User searches for a location
  $('#searchBtn').click(function () {
    if ($('#locationTextBox').val()) {
      userSearchLocation = $('#locationTextBox').val();
      $('#locationTextBox').val('');
      $('#locationTextBox').attr('placeholder', userSearchLocation);
      fetchCoordsOfLocation();
    }
  })

  $("#locationTextBox").keyup(function(event){
    if(event.keyCode == 13){
      if ($('#locationTextBox').val()) {
        userSearchLocation = $('#locationTextBox').val();
        $('#locationTextBox').val('');
        $('#locationTextBox').attr('placeholder', userSearchLocation);
        fetchCoordsOfLocation();
      }
    }
  });

});
