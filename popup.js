
/**
 * Retrieves the last 5 visit times for the currently active domain
 * and invokes the provided callback function with the result.
 *
 * @param {function} callback - Function to be invoked with the result.
 * @return {void}
 */
function getLast5DomainVisitTimes(callback) {
    // Query for the active tab in the current window
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        // Extract domain from current tab URL
        const currentTabUrl = tabs[0].url;
        const domain = new URL(currentTabUrl).hostname;

        // Search for the domain in the browser history with a maximum of 5 results
        chrome.history.search({ text: domain, maxResults: 5 }, function (historyItems) {
            const visitTimes = []; // Array to store the visit times

            // Iterate through historyItems and collect visit times
            for (let i = 0; i < historyItems.length; i++) {
                // Format the visit time using the local time format
                const visitTime = new Date(historyItems[i].lastVisitTime).toLocaleString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                    hour12: true
                });
                visitTimes.push(visitTime);
            }

            // Invoke the callback function with the result
            callback({ visitTimes: visitTimes });
        });
    });
}
/**
 * Retrieves the last 5 visit times for the currently active tab and
 * invokes the provided callback function with the result.
 *
 * @param {function} callback - Function to be invoked with the result.
 * @return {void}
 */
function getLast5VisitTimes(callback) {
    // Query for the active tab in the current window
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const currentTabUrl = tabs[0].url; // Get the URL of the active tab

        // Retrieve the visits for the current tab
        chrome.history.getVisits({ url: currentTabUrl }, function (historyItems) {
            const visitTimes = []; // Array to store the visit times

            // Iterate through the historyItems and collect the last 5 visit times
            for (let i = Math.max(0, historyItems.length - 5); i < historyItems.length; i++) {
                const visitTime = new Date(historyItems[i].visitTime)
                    .toLocaleString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric',
                        hour12: true
                    });
                visitTimes.push(visitTime);
            }

            // Invoke the callback function with the result
            callback({ visitTimes: visitTimes });
        });
    });
}

document.addEventListener('DOMContentLoaded', function async() {
    getLast5VisitTimes(function (result) {
        const visitTimes = result.visitTimes;
        document.getElementById('visitTime').innerHTML = `
        Last 5 visits:
        <ul>
        ${visitTimes.map((visitTime) => `<li>${visitTime}</li>`).join('')}
        </ul>
        `;
    });
    //    get the domain visit times
    getLast5DomainVisitTimes(function (result) {
        const visitTimes = result.visitTimes;
        //append the visit times to the popup html
        document.getElementById('domainVisitTime').innerHTML = `
        Last 5 Domain visits:
        <ul>
        ${visitTimes.map((visitTime) => `<li>${visitTime}</li>`).join('')}
        </ul>
        `;
    });

    document.getElementById('credit').innerHTML = `Visit Time Tracker by <a href="https://github.com/s-azizkhan" target="_blank">@aziz</a>`;

});
