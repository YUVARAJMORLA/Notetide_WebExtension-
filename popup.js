let previousNoteValue = '';
let currentSeconds = 0;
let pausedTime = 0; 
let countdownInterval;
let startTime = 0;
let isPaused = false;
let deletedNoteValue = '';

// Function to show Sticky Notes section
function showStickyNotes() {
    document.getElementById('stickySection').classList.add('active');
    document.getElementById('timerSection').classList.remove('active');
    document.getElementById('showStickyNotesButton').classList.add('active');
    document.getElementById('showTimerButton').classList.remove('active');
}

// Function to show Timer section
function showTimer() {
    document.getElementById('stickySection').classList.remove('active');
    document.getElementById('timerSection').classList.add('active');
    document.getElementById('showStickyNotesButton').classList.remove('active');
    document.getElementById('showTimerButton').classList.add('active');
}

// Event listeners for navigation text labels
document.getElementById('showStickyNotesButton').addEventListener('click', showStickyNotes);
document.getElementById('showTimerButton').addEventListener('click', showTimer);

// Show Sticky Notes by default
showStickyNotes();


// Function to save the sticky note content to Chrome storage
function saveNoteContent(noteValue) {
    chrome.storage.sync.set({ note: noteValue });
}

// Function to retrieve the saved sticky note content from Chrome storage
function retrieveNoteContent() {
    chrome.storage.sync.get('note', function (data) {
        if (data.note) {
            document.getElementById('stickyNote').value = data.note;
            previousNoteValue = data.note; // Store initial value
        }
    });
}

// Function to clear the sticky note content
function clearNoteContent() {
    let noteTextArea = document.getElementById('stickyNote');
    deletedNoteValue = noteTextArea.value; // Store the deleted content
    noteTextArea.value = ''; // Clear the content
    saveNoteContent('');
}

function retrieveNoteContent() {
    chrome.storage.sync.get('note', function (data) {
        if (data.note) {
            document.getElementById('stickyNote').value = data.note;
            previousNoteValue = data.note; // Store initial value
        }
    });
}

// Function to handle 'Save' button click
document.getElementById('saveNote').addEventListener('click', function () {
    let noteValue = document.getElementById('stickyNote').value;
    saveNoteContent(noteValue);
});

// Function to handle 'Delete' button click
document.getElementById('deleteNote').addEventListener('click', function () {
    clearNoteContent();
});

// Function to handle 'Undo' button click
document.getElementById('undoNote').addEventListener('click', function () {
    let noteTextArea = document.getElementById('stickyNote');
    if (deletedNoteValue !== '') {
        noteTextArea.value = deletedNoteValue; // Set the content to the previously deleted value
        deletedNoteValue = ''; // Clear the deleted content after undo
        saveNoteContent(noteTextArea.value); // Save the restored content
    }
});
// Function to save the timer and note data to Chrome storage
function saveData(timerValue, timeUnitValue, noteValue) {
    chrome.storage.sync.set({
        timer: timerValue,
        timeUnit: timeUnitValue,
        note: noteValue,
    });
}

// Function to retrieve the saved data from Chrome storage
function retrieveData() {
    chrome.storage.sync.get(['timer', 'timeUnit', 'note'], function (data) {
        if (data.timer) {
            document.getElementById('timerInput').value = data.timer;
            document.getElementById('timeUnit').value = data.timeUnit;
            document.getElementById('stickyNote').value = data.note;
        }
    });
}

// Load saved data when the popup is opened
retrieveData();
let resetClicked = false;



// Function to start or resume the timer
function startOrResumeTimer() {
    startTime = Date.now(); // Store the current time as the start time

    countdownInterval = setInterval(function () {
        let currentTime = Date.now();
        let elapsedTime = Math.floor((currentTime - startTime) / 1000); // Calculate elapsed time in seconds

        if (elapsedTime >= currentSeconds) {
            clearInterval(countdownInterval);
            document.getElementById('timerDisplay').innerText = '00:00:00';
            if (!resetClicked) {
               
                alert('Your timer has finished!');
                 // Show pop-up message only if the timer finished naturally
                 showNotification('Your timer has finished!');
                
            }
        } else {
            let remainingTime = currentSeconds - elapsedTime;
            if (remainingTime <= 0) {
                remainingTime = 0;
            }

            let hours = Math.floor(remainingTime / 3600);
            let minutes = Math.floor((remainingTime % 3600) / 60);
            let secs = remainingTime % 60;
            let displayTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
            document.getElementById('timerDisplay').innerText = displayTime;
        }
    }, 1000);
}


// Function to handle 'Start' button click
document.getElementById('startTimer').addEventListener('click', function () {
    let time = parseInt(document.getElementById('timerInput').value);
    if (!time || isNaN(time)) {
        // If no time is entered or it's not a number, set the default time to 0
        time = 0;
    }
    
    if (currentSeconds === 0) {
        let unit = document.getElementById('timeUnit').value;

        if (unit === 'minutes') {
            currentSeconds = time * 60;
        } else if (unit === 'hours') {
            currentSeconds = time * 3600;
        } else if (unit === 'seconds') {
            currentSeconds = time;
        }

        startOrResumeTimer();
    }
});



// Function to handle 'Resume' button click

document.getElementById('resumeTimer').addEventListener('click', function () {
    if (!isPaused) {
        if (countdownInterval) {
            clearInterval(countdownInterval);
            isPaused = true; // Set the flag to indicate that the timer is paused
            pausedTime = currentSeconds; // Store the remaining time when the timer is paused
        }
    } else {
        if (pausedTime > 0) {
            currentSeconds = pausedTime; // Update currentSeconds to the paused time
            startOrResumeTimer();
            isPaused = false; // Reset the paused state
        }
    }
});



// Function to handle 'Reset' button click
document.getElementById('resetTimer').addEventListener('click', function () {
    clearInterval(countdownInterval);
    currentSeconds = 0;
    pausedTime = 0;
    document.getElementById('timerDisplay').innerText = '00:00:00';
    resetClicked = true; // Set resetClicked to true when the reset button is clicked
    isPaused = false; // Reset the paused state
    saveTimerState(); // Save the timer state upon reset
    alert('Timer reset!');
});
// ... (Your previous code)

// Function to save the timer state at regular intervals
function saveTimerState() {
    chrome.storage.sync.set({ timerState: { currentSeconds, startTime } });
}

// Call this function at regular intervals to save the timer state
setInterval(function() {
    if (currentSeconds > 0) {
        saveTimerState();
    }
}, 1000);

// Function to save the timer state to Chrome storage when the extension is closed
chrome.runtime.onSuspend.addListener(function() {
    saveTimerState();
});

// Function to load timer state when the extension is opened
function loadTimerState() {
    chrome.storage.sync.get('timerState', function(data) {
        if (data.timerState) {
            let savedState = data.timerState;
            let elapsedTime = Math.floor((Date.now() - savedState.startTime) / 1000);
            currentSeconds = savedState.currentSeconds - elapsedTime;

            if (currentSeconds > 0) {
                startOrResumeTimer();
            } else {
                currentSeconds = 0;
                pausedTime = 0;
                document.getElementById('timerDisplay').innerText = '00:00:00';
            }
        }
    });
}

// Call this function when the extension is opened
loadTimerState();

// Inside startOrResumeTimer function after if (elapsedTime >= currentSeconds) block
const finishTime = Date.now() + (currentSeconds - elapsedTime) * 1000;

// Store the finishTime in Chrome storage along with other timer data
chrome.storage.sync.set({ timerState: { currentSeconds, startTime, finishTime } });

// Function to check the timer status and show notification if finished
function checkTimerAndNotify() {
    chrome.storage.sync.get('timerState', function (data) {
        const savedState = data.timerState;
        if (savedState) {
            const { currentSeconds, startTime, finishTime } = savedState;
            const currentTime = Date.now();
            if (currentTime >= finishTime) {
                // Timer finished, show notification or perform actions here
                showNotification('Your timer has finished!');
                // Reset the timer state after displaying the notification
                // Reset currentSeconds, startTime, finishTime, etc., to default values
            }
        }
    });
}

// Create an alarm to periodically check the timer status
chrome.alarms.create('timerAlarm', { periodInMinutes: 1 }); // Set your preferred interval

// Add a listener to handle alarm events
chrome.alarms.onAlarm.addListener(function (alarm) {
    if (alarm.name === 'timerAlarm') {
        checkTimerAndNotify();
    }
});
