angular.module('myApp', [])
.controller('MainCtrl', function($scope, $timeout) {
  var KEY = '1xsDTI-iJL2BQE0vcYedzCFQTK1dd0gltH-c8woFRf5w';
  var URL = 'https://spreadsheets.google.com/feeds/list/' + KEY +
  		'/od6/public/values?alt=json';

  var filteredSongs = [];

  $scope.date = {};
  $scope.songs = [];

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
		var req = new XMLHttpRequest();
		req.open("GET", URL, true);
		req.responseType = 'json';
    req.onload = addSongs_.bind(this);
    req.send(null);
  };

  /**
	 * Handle the 'onload' event of our song XHR request, generated in
	 * 'getPlaylist'.
	 *
	 * @param {ProgressEvent} e The XHR ProgressEvent.
	 * @private
	 */
	var addSongs_ = function (e) {
		filteredSongs = [];
	  var entries = e.target.response.feed.entry || [];
		for (var i = 0, entry; entry = entries[i]; i++) {
			var title = entry['gsx$title']['$t'];
			var artist = entry['gsx$artist']['$t'];
			var date = entry['gsx$dateadded']['$t'];
			var song = {title: title, artist: artist, dateAdded: date};
			filteredSongs.push(song);
		}
		filterAndRefreshSongs_();
	};

	/**
	 * Orders the songs from most recent to least recent. Also, sets a 
	 * limit on the number of songs that will be displayed at once.
	 * 
	 * @private
	 */
	var filterAndRefreshSongs_ = function() {
		$scope.songs = filteredSongs.reverse();
	};

	/**
	 * Adds the currently playing song to the list.
	 */
	$scope.addNewSong = function() {
		// something eventually
	};

  // Kick off the update function
  updateTime();
  getPlaylist();
});

