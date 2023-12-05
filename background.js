// background.js

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        chrome.storage.sync.get(['calendarUrl'], function (result) {
            const savedUrl = result.calendarUrl || '';
            
            if (request.action === "fetchData") {
                // Make a GET request here (using fetch, XMLHttpRequest, etc.)
                // For example, using fetch:
                fetch(savedUrl)
                .then(response => {
                    // Check if the request was successful (status code 200)
                    if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                    }

                    // text() method to get the response body as a string
                    return response.text();
                })
                .then(data => {
                    // Process the data (it is now a string)
                    console.log(data);
                    chrome.runtime.sendMessage({ action: "dataFetched", data: data });
                })
                .catch(error => {
                    console.error('Fetch error:', error);
                });
                
              }

        });
      
    }
  );
  