// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'ngCordova'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
}).config(function($stateProvider, $urlRouterProvider) {

  $stateProvider
  .state('map', {
    url: '/map',
    templateUrl: 'templates/map.html',
    controller: 'MapCtrl'
  })
  .state('map_route', {
    url: '/map_route',
    templateUrl: 'templates/map_route.html',
    controller: 'MapRouteCtrl'
  });

  $urlRouterProvider.otherwise("/");

}).controller('MapCtrl', function($scope, $state, $cordovaGeolocation) {
  var options = {timeout: 10000, enableHighAccuracy: true};

  $cordovaGeolocation.getCurrentPosition(options).then(function(position){

    var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

    var mapOptions = {
      center: latLng,
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    $scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);
    //Wait until the map is loaded
    google.maps.event.addListenerOnce($scope.map, 'idle', function(){

      var marker = new google.maps.Marker({
          map: $scope.map,
          animation: google.maps.Animation.DROP,
          position: latLng,
          draggable: true
      });
      console.log('Current Lat: ' + latLng.lat().toFixed(3) + ' Current Lng: ' + latLng.lng().toFixed(3));
      google.maps.event.addListener(marker, 'dragend', function(evt){
        console.log('Marker dropped: Current Lat: ' + evt.latLng.lat().toFixed(9) + ' Current Lng: ' + evt.latLng.lng().toFixed(9));
      });

    });

  }, function(error){
    console.log("Could not get location");
  });
}).controller('MapRouteCtrl', function($scope, $state, $cordovaGeolocation) {
  var options = {timeout: 10000, enableHighAccuracy: true};

  var waypts = {};
  $cordovaGeolocation.getCurrentPosition(options).then(function(position){

    var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);


    var mapOptions = {
      center: latLng,
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    $scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);
    //Wait until the map is loaded
    var directionsDisplay = new google.maps.DirectionsRenderer();
    var directionsService = new google.maps.DirectionsService();
    var start = new google.maps.LatLng(9.9530643,-84.1104048);
    //var end = new google.maps.LatLng(38.334818, -181.884886);
    var end = new google.maps.LatLng(9.9604673,-84.0784428);
    var bounds = new google.maps.LatLngBounds();
    bounds.extend(start);
    bounds.extend(end);
    $scope.map.fitBounds(bounds);
    calculateRoute();

    google.maps.event.addListener($scope.map, 'click', function(evt){
      // we add a marker and push in waypoints array
      var marker = new google.maps.Marker({
          map: $scope.map,
          animation: google.maps.Animation.DROP,
          position: evt.latLng,
          draggable: true
      });
      var markerId = getMarkerUniqueId(evt.latLng.lat(), evt.latLng.lng());
      marker.addListener('click', function() {

      //  for (var i=0, iLen=waypts.length; i<iLen; i++) {
      //    if (waypts[i].location.equals(marker.position)) {
      //      waypts.splice(i,1);
            //delete waypts[i];
      //      break;
      //    }
      //  }
        delete waypts[markerId];
        calculateRoute();
        marker.setMap(null);
      });
      waypts[markerId] = {
        location: evt.latLng,
        stopover: false
      };
      calculateRoute();
    });

    function calculateRoute() {
      var dataArray = new Array;
      for(var o in waypts) {
        dataArray.push(waypts[o]);
     }
      var request = {
          origin: start,
          destination: end,
          waypoints: dataArray,
          optimizeWaypoints: true,
          travelMode: google.maps.TravelMode.DRIVING
      };
      directionsService.route(request, function (response, status) {
          if (status == google.maps.DirectionsStatus.OK) {
              directionsDisplay.setDirections(response);
              directionsDisplay.setMap($scope.map);
          } else {
              alert("Directions Request from " + start.toUrlValue(6) + " to " + end.toUrlValue(6) + " failed: " + status);
          }
      });
    }
    var getMarkerUniqueId= function(lat, lng) {
      return lat + '_' + lng;
    }

  }, function(error){
    console.log("Could not get location");
  });


});
