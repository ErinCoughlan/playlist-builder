/* Listen for messages */
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.msg == 'stateChange') {
      console.log(request.change);
    }
});

/* When a URL is visited... */
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	if (changeInfo.status == 'complete') {
		console.log('loading a new page: ' + tab.url);
	  chrome.tabs.sendMessage(tab.id, {msg: 'getDOM', tabId: tab.id});
	}
});

/** When a tab is closed... */
chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
	console.log('tab is closed');
  removeTabFromList(tabId);
});

/** When the extension is loaded... */
chrome.runtime.onInstalled.addListener(function(details) {
	console.log('extension loaded');
  removeAllTabs();
});


var removeAllTabs = function() {
	chrome.storage.sync.set({musicInfo: {}});
};


var removeTabFromList = function(tabId) {
  // Get any background information about music playing
  chrome.storage.sync.get('musicInfo', function(value) {
    if (value && value.musicInfo) {
      var tabs = value.musicInfo;
      delete tabs[tabId];

      // Set the list back to the server
      chrome.storage.sync.set({musicInfo: tabs}, function() {
        var jsonResponse = JSON.stringify(tabs);
        chrome.runtime.sendMessage({msg: 'stateChange', change: jsonResponse});
      });
    }
  });
};
