'use strict';
//Here is the markers
var locations = [
    {
        title:"Sake II",
        lat:40.854068,
        lng:-73.884710,
        location:'Bronx'
    },

    {
        title:"Yokohama",
        lat:40.887091,
        lng:-73.904728,
        location:'Bronx'
    },

    {
        title:"Ariyoshi",
        lat:40.743935,
        lng:-73.922927,
        location: 'Queens'
    },

    {
        title:"Syo",
        lat:40.763160,
        lng:-73.928229,
        location: 'Queens'
    },

    {
        title:"Yuka",
        lat:40.762406,
        lng:-73.9312114,
        location: 'Queens'
    },

    {
        title: "Ajisai",
        lat:40.759554,
        lng:-73.992154,
        location: 'Manhattan'
    },

    {
        title:"Tsushima",
        lat:40.751649,
        lng:-73.972810,
        location: 'Manhattan'
    },

    {
        title:"Edo Sushi",
        lat:40.737757,
        lng:-73.991244,
        location: 'Manhattan'
    },

    {
        title:"Marumi",
        lat:40.729002,
        lng:-73.998409,
        location: 'Manhattan'
    },

    {
        title:"Yama",
        lat:40.720947,
        lng: -73.994399,
        location: 'Manhattan'
    },

    {
        title:"Zenkichi",
        lat:40.718964,
        lng:-73.960830,
        location: 'Brooklyn'
    },

    {
        title:"Ako",
        lat:40.717480,
        lng:-73.958936,
        location: 'Brooklyn'
    },

    {
        title:"Shalom Japan",
        lat:40.709173,
        lng:-73.955848,
        location: 'Brooklyn'
    },

    {
        title:"Kyoto Sushi",
        lat:40.724773,
        lng:-73.945893,
        location: 'Brooklyn'
    }
];
//******************************************************************************************************//

//global variable
var map;
var markers = ko.observableArray();
var placeMarkers = ko.observableArray();
var areaList = ko.observableArray(['New York', 'Manhattan', 'Queens', 'Brooklyn', 'Bronx']);
var selectedArea = ko.observable('New York');

//******************************************************************************************************//

function initMap(){
      // Constructor creates a new map - only center and zoom are required.
    var initMapOption = {
          center: {lat: 40.7587114, lng: -73.8916037},
          zoom: 12,
          mapTypeControl: false,
          disableDefaultUI: true,
          };
     map = new google.maps.Map(document.getElementById('map'), initMapOption);

    var largeInfowindow = new google.maps.InfoWindow();
    // Style the markers a bit. This will be our listing marker icon.
    var defaultIcon = makeMarkerIcon('0091ff');

    // Create a "highlighted location" marker color for when the user
    // mouses over the marker.
    var highlightedIcon = makeMarkerIcon('FFFF24');

    // The following group uses the location array to create an array of markers on initialize.
    for (var i = 0; i < locations.length; i++) {
      // Get the position from the location array.
      var position = new google.maps.LatLng(locations[i].lat, locations[i].lng);
      var title = locations[i].title;
      var location = locations[i].location;
      // Create a marker per location, and put into markers array.
      var marker = new google.maps.Marker({
        position: position,
        title: title,
        location: location,
        animation: google.maps.Animation.DROP,
        icon: defaultIcon,
        id: i
      });
      // Push the marker to our array of markers.
      markers.push(marker);
      // Create an onclick event to open the large infowindow at each marker.
      marker.addListener('click', function() {
        populateInfoWindow(this, largeInfowindow);
      });
      // Two event listeners - one for mouseover, one for mouseout,
      // to change the colors back and forth.
      marker.addListener('mouseover', function() {
        this.setIcon(highlightedIcon);
      });
      marker.addListener('mouseout', function() {
        this.setIcon(defaultIcon);
      });
    }
//******************************************************************************************************//

filter_loc('New York');
showListings();


var viewModel = function(){
    this.showListings = function(){
        showListings();
    };

    this.hideAllMarkers = function() {
        hideMarkers(placeMarkers);
    };

    this.refresh = function(restaurant){
        hideMarkers(placeMarkers);
        placeMarkers.removeAll();
        placeMarkers.push(restaurant);
        populateInfoWindow(restaurant, largeInfowindow);
        showListings();
    };

    this.back = function(){
        hideMarkers(placeMarkers);
        placeMarkers.removeAll();
        filter_loc('New York');
        showListings();
    }
}

ko.applyBindings(new viewModel());
}


selectedArea.subscribe(function(value){
        hideMarkers(placeMarkers);
        placeMarkers.removeAll();
        filter_loc(value);
        showListings();
    });

//******************************************************************************************************//

function populateInfoWindow(marker, infowindow) {
    // Check to make sure the infowindow is not already opened on this marker.
    if (infowindow.marker != marker) {
          // Clear the infowindow content to give the streetview time to load.
          infowindow.setContent('');
          infowindow.marker = marker;
          infowindow.addListener('closeclick', function() {
            infowindow.marker = null;
          });
          var location_key;
          var lat = marker.getPosition().lat();
          var lng = marker.getPosition().lng();
          var url_lockey = "http://dataservice.accuweather.com/locations/v1/cities/geoposition/search?apikey=0HDeENqpJBIeTMQGNCpgOsUtGniAAMF3&q="
                      + lat +"%2C" + lng;
          var url_weather1 = "http://dataservice.accuweather.com/forecasts/v1/daily/1day/";
          var apikey = "?apikey=0HDeENqpJBIeTMQGNCpgOsUtGniAAMF3&details=True";
          var inner;
          $.ajax({
              url:url_lockey,
              async: false,
              success:function(data){
                  $.ajax({
                      url:url_weather1 + data.Key + apikey,
                      async: false,
                      success:function(html){
                              var min = html.DailyForecasts[0].Temperature.Minimum.Value;
                              var max = html.DailyForecasts[0].Temperature.Maximum.Value
                              var realmin = html.DailyForecasts[0].RealFeelTemperature.Minimum.Value;
                              var realmax = html.DailyForecasts[0].RealFeelTemperature.Maximum.Value;
                              var dayp = html.DailyForecasts[0].Day.LongPhrase;
                              var nightp = html.DailyForecasts[0].Night.LongPhrase;

                              inner = '<br><br><strong>Weather</strong><br>';
                              inner += 'Temperature: From ' + min + 'F' + ' to ' + max + 'F' + '<br>' +
                                      'RealFeel: From ' + realmin + 'F' + ' to ' + realmax+ 'F' + '<br>' +
                                      'Daytime: ' + dayp + '<br>' +
                                      'Nght: ' + nightp + '<br>';
                              }
                          });

              },
              error:function(){
                  inner += '<div> Weather not found</div>';
              }
          });
          var streetViewService = new google.maps.StreetViewService();
          var radius = 50;
          function getStreetView(data, status) {
              console.log(status);
            if (status == google.maps.StreetViewStatus.OK) {
              var nearStreetViewLocation = data.location.latLng;
              var heading = google.maps.geometry.spherical.computeHeading(
                nearStreetViewLocation, marker.position);
                infowindow.setContent('<div id = "innerHTML">'+ inner +'</div>'+'<div>'+ marker.title + '</div><div id="pano"></div>');
                var panoramaOptions = {
                  position: nearStreetViewLocation,
                  pov: {
                    heading: heading,
                    pitch: 30
                  }
                };

              var panorama = new google.maps.StreetViewPanorama(
                document.getElementById('pano'), panoramaOptions);
            } else {
              infowindow.setContent('<div id = "innerHTML">' + inner +'</div>'+'<div>'+ marker.title + '</div>' +
                '<div>No Street View Found</div>');
            }
          }

          streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
          // Open the infowindow on the correct marker.
          infowindow.open(map, marker);
        }
      }

      function makeMarkerIcon(markerColor) {
        var markerImage = new google.maps.MarkerImage(
          'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
          '|40|_|%E2%80%A2',
          new google.maps.Size(21, 34),
          new google.maps.Point(0, 0),
          new google.maps.Point(10, 34),
          new google.maps.Size(21,34));
        return markerImage;
      }

      // This function will loop through the listings and hide them all.
      function hideMarkers(placeMarkers) {
        for (var i = 0; i < placeMarkers().length; i++) {
          placeMarkers()[i].setMap(null);
        }
      }

      function showListings(){
          var bounds = new google.maps.LatLngBounds();
                  // Extend the boundaries of the map for each marker and display the marker
                  for (var i = 0; i < placeMarkers().length; i++) {
                    placeMarkers()[i].setMap(map);
                    bounds.extend(placeMarkers()[i].position);
                  }
                  map.fitBounds(bounds);
      }

      function filter_loc(value){
        var filter_value = value;
          function place_push(value){
              for(var i = 0; i < markers().length; i++){
                     if(markers()[i].location == value){
                         placeMarkers.push(markers()[i]);
                     }
                 }
          }

          if (filter_value == "Manhattan") {
              place_push(filter_value);
          }

          else if (filter_value == "Queens") {
              place_push(filter_value);
          }

          else if (filter_value == "Brooklyn") {
              place_push(filter_value);
          }

          else if (filter_value == "Bronx") {
              place_push(filter_value);
          }

          else if (filter_value == "New York"){
              for(var i = 0; i < markers().length; i++){
                  placeMarkers.push(markers()[i]);
              }

          }
      }
