'use strict';
//Here is the markers
var locations = [

    {
        title:"Ariyoshi",
        lat:40.743935,
        lng:-73.922927,
        visible: ko.observable(true)
    },

    {
        title:"Syo",
        lat:40.763160,
        lng:-73.928229,
        visible: ko.observable(true)
    },

    {
        title:"Yuka",
        lat:40.762406,
        lng:-73.9312114,
        visible: ko.observable(true)
    },

    {
        title: "Ajisai",
        lat:40.759554,
        lng:-73.992154,
        visible: ko.observable(true)
    },

    {
        title:"Tsushima",
        lat:40.751649,
        lng:-73.972810,
        visible: ko.observable(true)
    },

    {
        title:"Edo Sushi",
        lat:40.737757,
        lng:-73.991244,
        visible: ko.observable(true)
    },

    {
        title:"Marumi",
        lat:40.729002,
        lng:-73.998409,
        visible: ko.observable(true)
    },

    {
        title:"Yama",
        lat:40.720947,
        lng: -73.994399,
        visible: ko.observable(true)
    },

    {
        title:"Zenkichi",
        lat:40.718964,
        lng:-73.960830,
        visible: ko.observable(true)
    },

    {
        title:"Ako",
        lat:40.717480,
        lng:-73.958936,
        visible: ko.observable(true)
    },

    {
        title:"Shalom Japan",
        lat:40.709173,
        lng:-73.955848,
        visible: ko.observable(true)
    },

    {
        title:"Kyoto Sushi",
        lat:40.724773,
        lng:-73.945893,
        visible: ko.observable(true)
    }
];


function loadMap(){
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = "https://maps.googleapis.com/maps/api/js?libraries=places,geometry,drawing&key=AIzaSyDcbUPCzjDBhVogtJmPSpJjwMbkQCLzuCM&v=3.exp&callback=initMap";
        document.body.appendChild(script);
}
window.onload = loadMap;

//global variable
var map;
// Create a new blank array for all the listing markers.
var markers = ko.observableArray();

// This global polygon variable is to ensure only ONE polygon is rendered.
var polygon = null;

// Create placemarkers array to use in multiple functions to have control
// over the number of places that show.
var placeMarkers = ko.observableArray();

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

//******************************************************************************************************//

//1//
        var timeAutocomplete = new google.maps.places.Autocomplete(
            document.getElementById('search-within-time-text'));

        var searchBox = new google.maps.places.SearchBox(
            document.getElementById('places-search'));
        // Bias the searchbox to within the bounds of the map.
        searchBox.setBounds(map.getBounds());


        // Listen for the event fired when the user selects a prediction from the
        // picklist and retrieve more details for that place.
        searchBox.addListener('places_changed', function() {
          searchBoxPlaces(this);
        });


//******************************************************************************************************//
    var largeInfowindow = new google.maps.InfoWindow();
    // Style the markers a bit. This will be our listing marker icon.
    var defaultIcon = makeMarkerIcon('0091ff');

    // Create a "highlighted location" marker color for when the user
    // mouses over the marker.
    var highlightedIcon = makeMarkerIcon('FFFF24');

    // Initialize the drawing manager.
    var drawingManager = new google.maps.drawing.DrawingManager({
     drawingMode: google.maps.drawing.OverlayType.POLYGON,
     drawingControl: true,
     drawingControlOptions: {
       position: google.maps.ControlPosition.TOP_LEFT,
       drawingModes: [
         google.maps.drawing.OverlayType.POLYGON
       ]
     }
    });

//******************************************************************************************************//

    // The following group uses the location array to create an array of markers on initialize.
    for (var i = 0; i < locations.length; i++) {
      // Get the position from the location array.
      var position = new google.maps.LatLng(locations[i].lat, locations[i].lng);
      var title = locations[i].title;
      // Create a marker per location, and put into markers array.
      var marker = new google.maps.Marker({
        position: position,
        title: title,
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

//2//

    drawingManager.addListener('overlaycomplete', function(event) {
      // First, check if there is an existing polygon.
      // If there is, get rid of it and remove the markers
      if (polygon) {
        polygon.setMap(null);
        hideMarkers(markers);
      }
      // Switching the drawing mode to the HAND (i.e., no longer drawing).
      drawingManager.setDrawingMode(null);
      // Creating a new editable polygon from the overlay.
      polygon = event.overlay;
      polygon.setEditable(true);
      // Searching within the polygon.
      searchWithinPolygon(polygon);
      // Make sure the search is re-done if the poly is changed.
      polygon.getPath().addListener('set_at', searchWithinPolygon);
      polygon.getPath().addListener('insert_at', searchWithinPolygon);
    });

    showListings();
//******************************************************************************************************//
//Out map event control

var viewModel = function(){

    this.showListings = function(){
        showListings();
    }

    this.hideAllMarkers = function() {
        hideMarkers(markers);
    }

    this.textSearchPlaces = function() {
      var bounds = map.getBounds();
      hideMarkers(placeMarkers);
      var placesService = new google.maps.places.PlacesService(map);
      placesService.textSearch({
        query: document.getElementById('places-search').value,
        bounds: bounds
      }, function(results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          createMarkersForPlaces(results);
        }
      });
    }

    this.drawing = function(){
        toggleDrawing(drawingManager);
    }
    this.searchWithinTime =function() {
      // Initialize the distance matrix service.
      var distanceMatrixService = new google.maps.DistanceMatrixService;
      var address = document.getElementById('search-within-time-text').value;
      // Check to make sure the place entered isn't blank.
      if (address == '') {
      } else {
        hideMarkers(markers);
        // Use the distance matrix service to calculate the duration of the
        // routes between all our markers, and the destination address entered
        // by the user. Then put all the origins into an origin matrix.
        var origins = [];
        for (var i = 0; i < markers().length; i++) {
          origins[i] = markers()[i].position;
        }
        var destination = address;
        var mode = document.getElementById('mode').value;
        // Now that both the origins and destination are defined, get all the
        // info for the distances between them.
        distanceMatrixService.getDistanceMatrix({
          origins: origins,
          destinations: [destination],
          travelMode: google.maps.TravelMode[mode],
          unitSystem: google.maps.UnitSystem.IMPERIAL,
        }, function(response, status) {
          if (status !== google.maps.DistanceMatrixStatus.OK) {
            window.alert('Error was: ' + status);
          } else {
            displayMarkersWithinTime(response);
          }
        });
      }
    }

}

ko.applyBindings(new viewModel());

}


//******************************************************************************************************//
// In map event control//


      // This function populates the infowindow when the marker is clicked. We'll only allow
      // one infowindow which will open at the marker that is clicked, and populate based
      // on that markers position.
      function populateInfoWindow(marker, infowindow) {
        // Check to make sure the infowindow is not already opened on this marker.
        if (infowindow.marker != marker) {
          // Clear the infowindow content to give the streetview time to load.
          infowindow.setContent('');
          infowindow.marker = marker;
          // Make sure the marker property is cleared if the infowindow is closed.
          infowindow.addListener('closeclick', function() {
            infowindow.marker = null;
          });
          var streetViewService = new google.maps.StreetViewService();
          var radius = 50;
          // In case the status is OK, which means the pano was found, compute the
          // position of the streetview image, then calculate the heading, then get a
          // panorama from that and set the options
          function getStreetView(data, status) {
              console.log(status);
            if (status == google.maps.StreetViewStatus.OK) {
              var nearStreetViewLocation = data.location.latLng;
              var heading = google.maps.geometry.spherical.computeHeading(
                nearStreetViewLocation, marker.position);
                infowindow.setContent('<div id = "innerHTML">' + marker.title + '</div><div id="pano"></div>');
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
              infowindow.setContent('<div id = "innerHTML">' + marker.title + '</div>' +
                '<div>No Street View Found</div>');
            }
          }

          var location_key;
          var lat = marker.getPosition().lat();
          var lng = marker.getPosition().lng();
          var url_lockey = "http://dataservice.accuweather.com/locations/v1/cities/geoposition/search?apikey=cE8RhaCzepxklSGYwdciXv9ugtB0wxYR&q="
                      + lat +"%2C" + lng;
          var url_weather1 = "http://dataservice.accuweather.com/forecasts/v1/daily/1day/";
          var apikey = "?apikey=cE8RhaCzepxklSGYwdciXv9ugtB0wxYR&details=True";
          $.ajax({
              url:url_lockey,
              success:function(data){
                  $.ajax({
                      url:url_weather1 + data.Key + apikey,
                      success:function(html){
                              var min = html.DailyForecasts[0].Temperature.Minimum.Value;
                              var max = html.DailyForecasts[0].Temperature.Maximum.Value
                              var realmin = html.DailyForecasts[0].RealFeelTemperature.Minimum.Value;
                              var realmax = html.DailyForecasts[0].RealFeelTemperature.Maximum.Value;
                              var dayp = html.DailyForecasts[0].Day.LongPhrase;
                              var nightp = html.DailyForecasts[0].Night.LongPhrase;

                              var inner = '<br><br><strong>Weather</strong><br>';
                              inner += 'Temperature: From ' + min + 'F' + ' to ' + max + 'F' + '<br>' +
                                      'RealFeel: From ' + realmin + 'F' + ' to ' + realmax+ 'F' + '<br>' +
                                      'Daytime: ' + dayp + '<br>' +
                                      'Nght: ' + nightp + '<br>';
                           $('#innerHTML').append(inner);
                              }
                          });
                      }
              });
          // Use streetview service to get the closest streetview image within
          // 50 meters of the markers position
          streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
          // Open the infowindow on the correct marker.
          infowindow.open(map, marker);
        }
      }

      // This function takes in a COLOR, and then creates a new marker
      // icon of that color. The icon will be 21 px wide by 34 high, have an origin
      // of 0, 0 and be anchored at 10, 34).
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
      function hideMarkers(markers) {
        for (var i = 0; i < markers().length; i++) {
          markers()[i].setMap(null);
        }
      }

      function showListings(){
          var bounds = new google.maps.LatLngBounds();
                  // Extend the boundaries of the map for each marker and display the marker
                  for (var i = 0; i < markers().length; i++) {
                    markers()[i].setMap(map);
                    bounds.extend(markers()[i].position);
                  }
                  map.fitBounds(bounds);
      }

    // This function creates markers for each place found in either places search.
    function createMarkersForPlaces(places) {
          var bounds = new google.maps.LatLngBounds();
          for (var i = 0; i < places.length; i++) {
                var place = places[i];
                var icon = {
                  url: place.icon,
                  size: new google.maps.Size(35, 35),
                  origin: new google.maps.Point(0, 0),
                  anchor: new google.maps.Point(15, 34),
                  scaledSize: new google.maps.Size(25, 25)
                };
                // Create a marker for each place.
                var marker = new google.maps.Marker({
                  map: map,
                  icon: icon,
                  title: place.name,
                  position: place.geometry.location,
                  id: place.place_id
                });
                // Create a single infowindow to be used with the place details information
                // so that only one is open at once.
                var placeInfoWindow = new google.maps.InfoWindow();
                // If a marker is clicked, do a place details search on it in the next function.
                marker.addListener('click', function() {
                  if (placeInfoWindow.marker == this) {
                    console.log("This infowindow already is on this marker!");
                  } else {
                    getPlacesDetails(this, placeInfoWindow);
                  }
                });
                placeMarkers.push(marker);
                if (place.geometry.viewport) {
                  // Only geocodes have viewport.
                  bounds.union(place.geometry.viewport);
                } else {
                  bounds.extend(place.geometry.location);
                }
              }
              map.fitBounds(bounds);
        }

        function searchWithinPolygon() {
          for (var i = 0; i < markers().length; i++) {
            if (google.maps.geometry.poly.containsLocation(markers()[i].position, polygon)) {
              markers()[i].setMap(map);
            } else {
              markers()[i].setMap(null);
            }
          }
        }

        function toggleDrawing(drawingManager) {
          if (drawingManager.map) {
            drawingManager.setMap(null);
            // In case the user drew anything, get rid of the polygon
            if (polygon !== null) {
              polygon.setMap(null);
            }
          } else {
            drawingManager.setMap(map);
          }
        }

        function searchBoxPlaces(searchBox) {
          hideMarkers(placeMarkers);
          var places = searchBox.getPlaces();
          if (places.length == 0) {
            window.alert('We did not find any places matching that search!');
          } else {
          // For each place, get the icon, name and location.
            createMarkersForPlaces(places);
          }
        }

        function displayMarkersWithinTime(response) {
          var maxDuration = document.getElementById('max-duration').value;
          var origins = response.originAddresses;
          var destinations = response.destinationAddresses;
          // Parse through the results, and get the distance and duration of each.
          // Because there might be  multiple origins and destinations we have a nested loop
          // Then, make sure at least 1 result was found.
          var atLeastOne = false;
          for (var i = 0; i < origins.length; i++) {
            var results = response.rows[i].elements;
            for (var j = 0; j < results.length; j++) {
              var element = results[j];
              if (element.status === "OK") {
                // The distance is returned in feet, but the TEXT is in miles. If we wanted to switch
                // the function to show markers within a user-entered DISTANCE, we would need the
                // value for distance, but for now we only need the text.
                var distanceText = element.distance.text;
                // Duration value is given in seconds so we make it MINUTES. We need both the value
                // and the text.
                var duration = element.duration.value / 60;
                var durationText = element.duration.text;
                if (duration <= maxDuration) {
                  //the origin [i] should = the markers[i]
                  markers()[i].setMap(map);
                  atLeastOne = true;
                  // Create a mini infowindow to open immediately and contain the
                  // distance and duration
                  var infowindow = new google.maps.InfoWindow({
                    content: durationText + ' away, ' + distanceText +
                      '<div><input type=\"button\" value=\"View Route\" onclick =' +
                      '\"displayDirections(&quot;' + origins[i] + '&quot;);\"></input></div>'
                  });
                  infowindow.open(map, markers()[i]);
                  // Put this in so that this small window closes if the user clicks
                  // the marker, when the big infowindow opens
                  markers()[i].infowindow = infowindow;
                  google.maps.event.addListener(markers()[i], 'click', function() {
                    this.infowindow.close();
                  });
                }
              }
            }
          }
          if (!atLeastOne) {
            window.alert('We could not find any locations within that distance!');
          }
        }

        function displayDirections(origin) {
          hideMarkers(markers);
          var directionsService = new google.maps.DirectionsService;
          // Get the destination address from the user entered value.
          var destinationAddress =
              document.getElementById('search-within-time-text').value;
          // Get mode again from the user entered value.
          var mode = document.getElementById('mode').value;
          directionsService.route({
            // The origin is the passed in marker's position.
            origin: origin,
            // The destination is user entered address.
            destination: destinationAddress,
            travelMode: google.maps.TravelMode[mode]
          }, function(response, status) {
            if (status === google.maps.DirectionsStatus.OK) {
              var directionsDisplay = new google.maps.DirectionsRenderer({
                map: map,
                directions: response,
                draggable: true,
                polylineOptions: {
                  strokeColor: 'green'
                }
              });
            } else {
              window.alert('Directions request failed due to ' + status);
            }
          });
        }

        //************* Add third party api here
        function getPlacesDetails(marker, infowindow) {

          var service = new google.maps.places.PlacesService(map);
          service.getDetails({
            placeId: marker.id
          }, function(place, status) {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
              // Set the marker property on this infowindow so it isn't created again.
              infowindow.marker = marker;
              var innerHTML = "<div id = 'innerHTML'>";

              // show weather

                var location_key;
                var lat = marker.getPosition().lat();
                var lng = marker.getPosition().lng();
                var url_lockey = "http://dataservice.accuweather.com/locations/v1/cities/geoposition/search?apikey=cE8RhaCzepxklSGYwdciXv9ugtB0wxYR&q="
                            + lat +"%2C" + lng;
                var url_weather1 = "http://dataservice.accuweather.com/forecasts/v1/daily/1day/";
                var apikey = "?apikey=cE8RhaCzepxklSGYwdciXv9ugtB0wxYR&details=True";
                $.ajax({
                    url:url_lockey,
                    success:function(data){
                        $.ajax({
                            url:url_weather1 + data.Key + apikey,
                            success:function(html){
                                    var min = html.DailyForecasts[0].Temperature.Minimum.Value;
                                    var max = html.DailyForecasts[0].Temperature.Maximum.Value
                                    var realmin = html.DailyForecasts[0].RealFeelTemperature.Minimum.Value;
                                    var realmax = html.DailyForecasts[0].RealFeelTemperature.Maximum.Value;
                                    var dayp = html.DailyForecasts[0].Day.LongPhrase;
                                    var nightp = html.DailyForecasts[0].Night.LongPhrase;

                                    var inner = '<br><br><strong>Weather</strong><br>';
                                    inner += 'Temperature: From ' + min + 'F' + ' to ' + max + 'F' + '<br>' +
                                            'RealFeel: From ' + realmin + 'F' + ' to ' + realmax+ 'F' + '<br>' +
                                            'Daytime: ' + dayp + '<br>' +
                                            'Nght: ' + nightp + '<br>';
                                 $('#innerHTML').append(inner);
                                    }
                                });
                            }
                    });
              if (place.name) {
                innerHTML += '<strong>' + place.name + '</strong>';
              }
              if (place.formatted_address) {
                innerHTML += '<br>' + place.formatted_address;
              }
              if (place.formatted_phone_number) {
                innerHTML += '<br>' + place.formatted_phone_number;
              }
              if (place.opening_hours) {
                innerHTML += '<br><br><strong>Hours:</strong><br>' +
                    place.opening_hours.weekday_text[0] + '<br>' +
                    place.opening_hours.weekday_text[1] + '<br>' +
                    place.opening_hours.weekday_text[2] + '<br>' +
                    place.opening_hours.weekday_text[3] + '<br>' +
                    place.opening_hours.weekday_text[4] + '<br>' +
                    place.opening_hours.weekday_text[5] + '<br>' +
                    place.opening_hours.weekday_text[6];
              }
              if (place.photos) {
                innerHTML += '<br><br><img src="' + place.photos[0].getUrl(
                    {maxHeight: 100, maxWidth: 200}) + '">';
              }
              innerHTML += '</div>';
              infowindow.setContent(innerHTML);
              infowindow.open(map, marker);
              // Make sure the marker property is cleared if the infowindow is closed.
              infowindow.addListener('closeclick', function() {
                infowindow.marker = null;
              });
            }
          });
        }

//******************************************************************************************************//
//******************************************************************************************************//
//******************************************************************************************************//
//******************************************************************************************************//
//******************************************************************************************************//
