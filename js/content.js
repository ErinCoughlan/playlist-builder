/* Listen for messages */
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.msg == 'getDOM') {
      checkMusicPlaying(request.tabId);
    }
});


var checkMusicPlaying = function(tabId) {
  var audios = document.getElementsByTagName('audio');
  for (var i = 0, audio; audio = audios[i]; i++) {
    // Add an event listener for when the audio is paused
    audio.addEventListener('pause', function() {
      chrome.storage.sync.get('musicInfo', function(value) {
        if (value && value.musicInfo) {
          var tabs = value.musicInfo;
          tabs[tabId] = {isPlaying: false};
          chrome.storage.sync.set({musicInfo: tabs}, function() {
            var response = 'Settings saved - isPlaying: false, tabId: ' + tabId;
            chrome.runtime.sendMessage({msg: 'stateChange', change: response});
            var jsonResponse = JSON.stringify(tabs);
            chrome.runtime.sendMessage({msg: 'stateChange', change: jsonResponse});
          });
        }
      });
    });

    // Add an event listener for when the audio is played
    audio.addEventListener('play', function() {
      chrome.storage.sync.get('musicInfo', function(value) {
        if (value && value.musicInfo) {
          var tabs = value.musicInfo;
          tabs[tabId] = {isPlaying: true};
          chrome.storage.sync.set({musicInfo: tabs}, function() {
            var response = 'Settings saved - isPlaying: true, tabId: ' + tabId;
            chrome.runtime.sendMessage({msg: 'stateChange', change: response});
            var jsonResponse = JSON.stringify(tabs);
            chrome.runtime.sendMessage({msg: 'stateChange', change: jsonResponse});
          });
        }
      });
    });
  }
};
