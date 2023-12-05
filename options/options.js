document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('options-form');
    const urlResult = document.getElementById('url-result');

    // Load the previously saved URL from chrome.storage.sync on page load
    chrome.storage.sync.get(['calendarUrl'], function (result) {
        const savedUrl = result.calendarUrl || '';
        document.getElementById('calendar-url').value = savedUrl;
    });

    form.addEventListener('submit', function (event) {
        event.preventDefault();

        const calendarUrlInput = document.getElementById('calendar-url');
        const calendarUrl = calendarUrlInput.value;

        if (!isValidUrl(calendarUrl)) {
            urlResult.classList.remove('confirmation-message');
            urlResult.classList.add('error-message');
            urlResult.textContent = 'Please enter a valid URL.';
            return;
        }
        urlResult.classList.remove('error-message')
        urlResult.classList.add('confirmation-message');
        urlResult.textContent = 'URL set.';

        // Save the URL to chrome.storage.sync
        chrome.storage.sync.set({ 'calendarUrl': calendarUrl }, function () {
            console.log('Calendar URL saved:', calendarUrl);
        });

        console.log('Calendar URL submitted:', calendarUrl);
    });

    function isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch (error) {
            return false;
        }
    }
});
