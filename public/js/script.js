/* ------------------------------ Variables --------------------------------- */
var lat, long, city, country, Ftemp, Ctemp, unitTemp, summary, icon, animation;
var currentUnit = 'F';
var locationAPI = `https://maps.googleapis.com/maps/api/geocode/json?latlng=`
var weatherAPI = `https://api.darksky.net/forecast/458b757b57430aa13526445cfd375d84/`

/* ------------------------ Change animation function ----------------------- */
function determineAnimation () {
  switch (icon) {
    case 'clear-day':
      animation = 'contain-sunny';
      break;
    case 'clear-night':
      animation = 'default';
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
  }
  $('.divToHide').addClass('hide');
  $(`.${animation}`).removeClass('hide');
  $('.default').addClass('hide');
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
      // $('.divToHide').addClass('hide');
    }
  });
}

/* --------------------------- Geolocation function ------------------------- */
function geolocation () {
  $('#update').attr('disabled', 'disabled');
  navigator.geolocation.getCurrentPosition(function (position) {
    lat = position.coords.latitude;
    long = position.coords.longitude;

    /* Functions for fetching city and weather data.
      These functions are inside of here so that they only run when the
      location is found. */
    fetchCityAndCountry();
    fetchWeatherForCity();

    // Return functionality to update button
    $('#update').removeAttr('disabled');

  // If user does not have geolocation enabled
  }, function () {
    $('#update').css('background-color', 'red');
    $('#update').val('Error');
  });
}
// Run on document initialize
geolocation();

// Run on document ready
$(document).ready(function () {
  $('#update').click(function () {
    $('.weather-info').css('opacity', '0.1');
    $('.divToHide').css('opacity', '0.1');
    geolocation();
  });

  $('#unit').click(function () {
    changeUnit();
  })
});
