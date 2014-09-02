angular.module('myApp', [])
.controller('MainCtrl', function($scope, $timeout) {
  var APP_ID = 'nq3nLXdZAza67nUH3HNyYKFiQ8pesJ9DlpA8BxFm';
  var PARSE_KEY = 'fvT1wR4eMTngApnBYwjrrBLsJQhNZi1PRi8SIBBV';

  var filteredSongs = [];
  var pageLimit = 20;

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
   * Get all the songs currently in the playlist
   */
  var getPlaylist = function() {
    var query = new Parse.Query(Song);
    query.descending('createdAt').find({
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
   * Sets a limit on the number of songs that will be displayed at once
   * and adds everything to scope
   * 
   * @private
   */
  var filterAndRefreshSongs_ = function() {
    $scope.songs = filteredSongs.slice(0, pageLimit);
  };

  /**
   * Adds the currently playing song to the list.
   */
  $scope.addSong = function(e) {
    console.log(e);
    $scope.success = false;
    $scope.exists = false;
    if ($scope.musicPlaying) {
      // Add the current song
    } else {
      var title = $scope.songTitle;
      var artist = $scope.songArtist;
      var song = {title: title, artist: artist};

      // Determine if the song already exists in the database
      var query = new Parse.Query(Song)
          .equalTo('title', title)
          .equalTo('artist', artist)
          .count({
        success: function(number) {
          if (number == 0) {
            // Save the song to the database   
            var songObject = new Song();
            songObject.save(song).then(function(object) {

              // Reset Inputs
              $scope.songTitle = '';
              $scope.songArtist = '';

              // Add the song to the recently added songs
              $scope.success = true;
              filteredSongs.unshift(song);
              filterAndRefreshSongs_();
            });
          } else {
            // Tell the user the song already exists
            $scope.exists = true;
          }
        }
      });
    }
  };

  // Kick off the update function
  getPlaylist();
});
