/**
 * Retrieves the last 5 visit times for the currently active domain
 * and invokes the provided callback function with the result.
 *
 * @param {function} callback - Function to be invoked with the result.
 * @return {void}
 */
async function getLast5DomainVisitTimes(callback) {
    try {
        // Query for the active tab in the current window
        const [currentTab] = await chrome.tabs.query({
            active: true,
            currentWindow: true
        });
        if (!currentTab?.url) return;
        // Extract domain from current tab URL
        const currentTabUrl = new URL(currentTab.url);
        let domain = currentTabUrl.hostname;
        // extract domain if its subdomain
        if (domain.includes('.')) {
            domain = domain.split('.').slice(-2).join('.');
        }
        // Search for the domain in the browser history with a maximum of 5 results
        const historyItems = await chrome.history.search({
            text: domain,
            maxResults: 100 // default value
        });
        if (!historyItems || !historyItems.length) return;

        const visitTimes = historyItems.map(item => new Date(item.lastVisitTime)).sort((a, b) => b - a);

        // Iterate through historyItems and collect visit times
        const dateCounts = {};
        visitTimes.forEach(date => {
            const dateString2 = date.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour12: true
            });
            dateCounts[dateString2] = (dateCounts[dateString2] || 0) + 1;
        });
        const visitSummary = Object.entries(dateCounts).map(([date, count]) => `You visited ${count} times on ${date}`);

        // Invoke the callback function with the result
        callback({
            visitTimes: visitSummary.slice(0, 5) // last 5
        });

    } catch (error) {
        console.error('Error from getLast5DomainVisitTimes :>> ', error);
    }
}

/**
 * Retrieves the last 5 visit times for the currently active tab and
 * invokes the provided callback function with the result.
 *
 * @param {function} callback - Function to be invoked with the result.
 * @return {void}
 */
async function getLast5VisitTimes(callback) {
    try {
        const [currentTab] = await chrome.tabs.query({
            active: true,
            currentWindow: true
        });

        if (!currentTab?.url) return;

        const currentTabUrl = currentTab.url;

        const data = await chrome.history.search({
            text: currentTabUrl,
        });

        const currentTabLastAccess = data[0]?.lastVisitTime;
        if (currentTabLastAccess) {

            const parsedLastAccess = new Date(currentTabLastAccess).toLocaleString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric',
                hour12: true
            });
            document.getElementById('lastAccess').innerHTML = parsedLastAccess;
        }

        // Retrieve the visits for the current tab
        const historyItems = await chrome.history.getVisits({
            url: currentTabUrl
        });
        if (!historyItems || !historyItems.length) return;

        const visitTimes = historyItems.map(item => new Date(item.visitTime)).sort((a, b) => b - a);
        const dateCounts = {};
        visitTimes.forEach(date => {
            const dateString2 = date.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour12: true
            });
            dateCounts[dateString2] = (dateCounts[dateString2] || 0) + 1;
        });

        const visitSummary = Object.entries(dateCounts).map(([date, count]) => `You visited ${count} times on ${date}`);

        // total visit count
        const totalVisitCount = Object.values(dateCounts).reduce((a, b) => a + b, 0);

        document.getElementById('visitCount').innerHTML = totalVisitCount;

        // Invoke the callback function with the result
        callback({
            visitTimes: visitSummary.slice(0, 5) // limit visitSummary to 5
        });
    } catch (error) {
        console.error('Error from getLast5VisitTimes: >>', error);
    }
}

document.addEventListener('DOMContentLoaded', function async () {
    getLast5VisitTimes(function ({
        visitTimes
    }) {
        document.getElementById('visitTime').innerHTML = `${visitTimes.map((visitTime) => `<li>${visitTime}</li>`).join('')}`;
    });

    getLast5DomainVisitTimes(function ({
        visitTimes
    }) {
        //append the visit times to the popup html
        document.getElementById('domainVisitTime').innerHTML = `${visitTimes.map((visitTime) => `<li>${visitTime}</li>`).join('')}`;
    });

    document.getElementById('credit').innerHTML = `Visit Time Tracker by <a href="https://github.com/s-azizkhan" target="_blank">@aziz</a>`;

});
