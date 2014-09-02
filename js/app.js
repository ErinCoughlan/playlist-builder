angular.module('myApp', [])
.controller('MainCtrl', function($scope, $timeout) {
  var KEY = '1xsDTI-iJL2BQE0vcYedzCFQTK1dd0gltH-c8woFRf5w';
  var URL = 'https://spreadsheets.google.com/feeds/list/' + KEY +
      '/od6/public/values?alt=json';
  var APP_ID = 'nq3nLXdZAza67nUH3HNyYKFiQ8pesJ9DlpA8BxFm';
  var PARSE_KEY = 'fvT1wR4eMTngApnBYwjrrBLsJQhNZi1PRi8SIBBV';

  var filteredSongs = [];
  var pageLimit = 20;

  $scope.date = {};
  $scope.songs = [];

  Parse.initialize(APP_ID, PARSE_KEY);
  var Song = Parse.Object.extend('Song');

  // Get any background information about music playing
  chrome.storage.sync.get('musicInfo', function(value) {
    $scope.$apply(function() {
      $scope.musicPlaying = false;
      if (value && value.musicInfo) {
        for (key in value.musicInfo) {
          if (value.musicInfo[key].isPlaying) {
            $scope.musicPlaying = true;
            break;
          }
        }
      }
    });
  });

  /**
   * Updates the time every second
   */
  var updateTime = function() {
    $scope.date.raw = new Date();
    $timeout(updateTime, 1000);
  };

  /**
   * Get all the songs currently in the playlist
   */
  var getPlaylist = function() {
    var query = new Parse.Query(Song);
    query.find({
      success: function(results) {
        filteredSongs = [];
        for (var i = 0, result; result = results[i]; i++) {
          var title = result.get('title');
          var artist = result.get('artist');
          var date = result.get('createdAt');
          var song = {title: title, artist: artist, dateAdded: date};
          filteredSongs.push(song);
        }
        filterAndRefreshSongs_();
      },
      error: function(error) {
        // error is an instance of Parse.Error.
      }
    });
  };

  /**
   * Orders the songs from most recent to least recent. Also, sets a 
   * limit on the number of songs that will be displayed at once.
   * 
   * @private
   */
  var filterAndRefreshSongs_ = function() {
    $scope.songs = filteredSongs.reverse().slice(0, pageLimit);
  };

  /**
   * Adds the currently playing song to the list.
   */
  $scope.addSong = function(e) {
    console.log(e);
    $scope.success = false;
    if ($scope.musicPlaying) {
      // Add the current song
    } else {
      var title = $scope.songTitle;
      var artist = $scope.songArtist;
      var song = {title: title, artist: artist};

      // Send the data to the server    
      var songObject = new Song();
      songObject.save(song).then(function(object) {
        console.log(object);
        // Reset Inputs
        $scope.songTitle = '';
        $scope.songArtist = '';

        // Tell the user success
        $scope.success = true;
        $scope.songs.unshift(song);
      });
    }
  };

  // Kick off the update function
  updateTime();
  getPlaylist();
});

