// background.js

// Listen for messages from the popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'showNotification') {
        showNotification(request.message);
    }
});

// Function to show notification
function showNotification(message) {
    chrome.notifications.create({
        type: 'basic',
        iconUrl: 'images/Notetide128_y.png',
        title: 'Timer Finished!',
        message: message
    });
}
