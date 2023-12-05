document.addEventListener('DOMContentLoaded', function () {


    document.getElementById('settings-icon').addEventListener('click', function() {
        if (chrome.runtime.openOptionsPage) {
            chrome.runtime.openOptionsPage();
        } else {
            window.open(chrome.runtime.getURL('options/options.html'));
        }
    });
    
    document.getElementById('link-icon').addEventListener('click', function() {
        // Add your link functionality here
        console.log('Link clicked');
        chrome.tabs.create({ url: 'https://cheesefork.cf/' });

    });

    document.getElementById('setup-button').addEventListener('click', function() {
        if (chrome.runtime.openOptionsPage) {
            chrome.runtime.openOptionsPage();
        } else {
            window.open(chrome.runtime.getURL('options/options.html'));
        }
    });

    // document.getElementById('fetch-ics').addEventListener('click', function() {

    //     // chrome.runtime.sendMessage({ action: "fetchData" });

    //     chrome.storage.sync.get(['calendarUrl'], function (result) {
    //         // console.log(result.calendarUrl);
            
           
    //         console.log(result.calendarUrl);
    //         fetchICS(result.calendarUrl);
    //     });
    // });

    const loadingSpinner = document.getElementById('loading-spinner');
    const eventsList = document.getElementById('events-list');

     // Show loading spinner initially
    loadingSpinner.style.display = 'block';
    eventsList.style.display = 'none';

    chrome.storage.sync.get(['calendarUrl'], function (result) {
        // console.log(result.calendarUrl);
        
       
        console.log(result.calendarUrl);
        // fetchICS(result.calendarUrl);
        if(result.calendarUrl === undefined)
        {
            loadingSpinner.style.display = 'none';
            const setupDiv = document.getElementById('setup-container');
            setupDiv.style.display = 'block';
            return;
        }

        // Fetch the ICS file and then display events
        fetchICSFile(result.calendarUrl).then(icsContent => {
            const events = parseICS(icsContent);
            displayEvents(events);

            // Hide loading spinner and show events list
            loadingSpinner.style.display = 'none';
            eventsList.style.display = 'block';
        }).catch(error => {
            console.error('Error fetching or parsing ICS file:', error);

            // Display an error message
            loadingSpinner.innerHTML = '<p>Error loading events. Please try again later.</p>';
        });
    });

    // popup.js

    chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {
        if (request.action === "dataFetched") {
            // Handle the fetched data in the popup script
            console.log("Data fetched:", request.data);
        }
        }
    );
  

    async function fetchICS(calendarUrl) {
        try {

            const icsContent = await fetchICSFile(calendarUrl); // Replace with your ICS file URL
            const events = parseICS(icsContent);

            displayEvents(events);
        } catch (error) {
            console.error('Error fetching or parsing ICS file:', error);
            // Handle error, e.g., display an error message to the user
        }
    }

    async function fetchICSFile(url) {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch ICS file. Status: ${response.status}`);
        }
        return response.text();
    }

    function parseICS(icsContent) {
        const lines = icsContent.split('\n');
        const events = [];
        let event = null;
      
        lines.forEach(line => {
          if (line.startsWith('BEGIN:VEVENT')) {
            event = {};
          } else if (line.startsWith('SUMMARY;LANGUAGE=en-us:')) {
            event.summary = line.replace('SUMMARY;LANGUAGE=en-us:', '').trim();
          } else if (line.startsWith('DTSTART;TZID=Asia/Jerusalem:')) {
            event.start = parseICSDate(line.replace('DTSTART;TZID=Asia/Jerusalem:', '').trim());
          } else if (line.startsWith('DTEND;TZID=Asia/Jerusalem:')) {
            event.end = parseICSDate(line.replace('DTEND;TZID=Asia/Jerusalem:', '').trim());
          } else if (line.startsWith('DESCRIPTION:')) {
            event.description = line.replace('DESCRIPTION:', '').trim();
          } else if (line.startsWith('LOCATION:')) {
            event.location = line.replace('LOCATION:', '').trim();
          } else if (line.startsWith('END:VEVENT')) {
            if (event && event.start && event.end) {
              events.push(event);
              event = null; // Reset the event object
            }
          }
        });
      
        return events;
      }
      
      function parseICSDate(dateString) {
        // Parse the date string in the format yyyyMMdd'T'HHmmss into a JavaScript Date object
        const year = parseInt(dateString.slice(0, 4), 10);
        const month = parseInt(dateString.slice(4, 6), 10) - 1; // Months are zero-based
        const day = parseInt(dateString.slice(6, 8), 10);
        const hour = parseInt(dateString.slice(9, 11), 10);
        const minute = parseInt(dateString.slice(11, 13), 10);
        const second = parseInt(dateString.slice(13, 15), 10);
      
        return new Date(year, month, day, hour, minute, second);
      }
      
      
      function displayEvents(events) {
        const eventsList = document.getElementById('events-list');
      
        eventsList.innerHTML = '';
      
        if (events.length === 0) {
          eventsList.innerHTML = '<p>No events found in the ICS file.</p>';
        } else {
          // Group events by day
          const eventsByDay = groupEventsByDay(events);
          const sortedDays = Object.keys(eventsByDay).sort();

            // console.log(eventsByDay);
          // Iterate over days
          sortedDays.forEach(day => {
            
            // console.log(day);
            if (eventsByDay.hasOwnProperty(day)) {
              const eventsOnDay = eventsByDay[day];
      
              // Create a heading for the day
              const dayHeading = document.createElement('h2');
              dayHeading.textContent = new Date(day).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
              eventsList.appendChild(dayHeading);
      
              // Create elements for each event on the day
              eventsOnDay.forEach(event => {
                const eventItem = document.createElement('div');
                eventItem.classList.add('event-item');
                eventItem.dir = 'rtl'; // Set the dir attribute to "rtl" for right-to-left text
                eventItem.innerHTML = `
                  <strong>${event.summary}</strong><br>
                  <span>${formatTime(event.start)} - ${formatTime(event.end)}</span><br>
                  <span>${event.location}</span><br>
                  <p>${event.description}</p>
                `;
                eventsList.appendChild(eventItem);
              });
            }
          });
        }
      }
      
      
      
      function groupEventsByDay(events) {
        // Group events by day using an object
        const eventsByDay = {};
      
        events.forEach(event => {
          const dayKey = event.start.toISOString().slice(0, 10); // Use the date part as the key
          if (!eventsByDay[dayKey]) {
            eventsByDay[dayKey] = [];
          }
          eventsByDay[dayKey].push(event);
        });
      
        // Sort events within each day by start time
        for (const day in eventsByDay) {
          if (eventsByDay.hasOwnProperty(day)) {
            eventsByDay[day].sort((a, b) => a.start - b.start);
          }
        }


      
        return eventsByDay;
      }
      
      
      
      
      
      
      
      function formatTime(date) {
        // Format the time part of the date as HH:mm
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
      }
      

});