// Student data
const studentData = {
    "users": {
        "0802420205101126": { "name": "MD. JAHID HASAN" },
        "0802410105101095": { "name": "SADIA AKTER" },
        "0802310205101097": { "name": "NUREN IBN NOMAN" },
        "0802310105101032": { "name": "HASNA HANA NOWSIN" },
        "0802410105101075": { "name": "MOST. MALIHA TABASSUM" },
        "0802410205101085": { "name": "MD. FAIYAZ MUNTASIR NIBIR" }
    }
};

// Ensure this URL is from your LATEST Apps Script deployment that has doOptions
const APPS_SCRIPT_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbxisK9nJn7ebizBuxPfG3mPNkhAWw5f1tjlarvN9OmNVPhbUCLN_GE42MGVNs3WqWe4/exec';

document.addEventListener('DOMContentLoaded', function() {
    const totalStudents = Object.keys(studentData.users).length;
    document.getElementById('totalStudents').textContent = totalStudents;
    document.getElementById('pendingCount').textContent = totalStudents;

    const studentSelect = document.getElementById('studentSelect');
    studentSelect.innerHTML = '<option value="">-- Select your Student ID --</option>'; // Clear before populating
    for (const id in studentData.users) {
        const option = document.createElement('option');
        option.value = id;
        option.textContent = `${id} - ${studentData.users[id].name}`;
        studentSelect.appendChild(option);
    }

    const studentList = document.getElementById('studentList');
    studentList.innerHTML = ''; // Clear before populating
    for (const id in studentData.users) {
        const student = studentData.users[id];
        const card = document.createElement('div');
        card.className = 'student-card';
        card.innerHTML = `
            <div class="status-indicator" id="indicator-${id}"></div>
            <div class="student-info">
                <div class="student-id">${id}</div>
                <div class="student-name">${student.name}</div>
            </div>
        `;
        studentList.appendChild(card);
    }

    const fileInput = document.getElementById('fileInput');
    const fileNameDisplay = document.getElementById('fileName');
    const uploadTrigger = document.getElementById('uploadTrigger');

    uploadTrigger.addEventListener('click', function() {
        fileInput.click();
    });

    fileInput.addEventListener('change', function() {
        if (fileInput.files.length > 0) {
            fileNameDisplay.textContent = `Selected: ${fileInput.files[0].name}`;
        } else {
            fileNameDisplay.textContent = '';
        }
    });

    const submitBtn = document.getElementById('submitBtn');
    submitBtn.addEventListener('click', function() {
        const selectedId = studentSelect.value;
        const file = fileInput.files[0];

        if (!selectedId) {
            alert('Please select your Student ID');
            return;
        }
        if (!file) {
            alert('Please select a file to upload');
            return;
        }
        const extension = file.name.split('.').pop().toLowerCase();
        const validExtensions = ['pdf', 'doc', 'docx', 'dwg'];
        if (!validExtensions.includes(extension)) {
            alert('Invalid file type. Please upload a PDF, DOC, DOCX, or DWG file.');
            return;
        }
        if (file.size > 15 * 1024 * 1024) { // 15MB
            alert('File size exceeds 15MB limit');
            return;
        }
        // Simplified check for the URL placeholder, main check is for a valid start
        if (!APPS_SCRIPT_WEB_APP_URL || !APPS_SCRIPT_WEB_APP_URL.startsWith('https://script.google.com/macros/s/')) {
            alert('Critical Error: Apps Script Web App URL is not correctly configured in script.js.');
            return;
        }
        uploadToGoogleDrive(selectedId, file);
    });
});

function uploadToGoogleDrive(studentId, file) {
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
    submitBtn.disabled = true;

    const reader = new FileReader();
    reader.onloadend = function() {
        const fileContentBase64 = reader.result.split(',')[1];
        const payload = {
            studentId: studentId,
            fileName: file.name,
            mimeType: file.type || 'application/octet-stream',
            fileContent: fileContentBase64
        };

        fetch(APPS_SCRIPT_WEB_APP_URL, {
            method: 'POST',
            // mode: 'cors', // This is the default, so explicitly setting it is optional
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json'
                // 'Accept': 'application/json' // Optional, but can be good practice
            },
            body: JSON.stringify(payload)
        })
        .then(response => {
            if (!response.ok) {
                // Attempt to parse error as JSON first, then fall back to text
                return response.json() // Try to parse as JSON
                    .catch(() => response.text()) // If JSON parsing fails, get as text
                    .then(errorData => {
                        let errorDetail = `Server responded with ${response.status}`;
                        if (typeof errorData === 'object' && errorData !== null && errorData.message) {
                            errorDetail += `: ${errorData.message}`;
                        } else if (typeof errorData === 'string') {
                            errorDetail += `. Response text: ${errorData.substring(0, 200)}`; // Log snippet
                        } else {
                            errorDetail += `. Could not parse error response.`;
                        }
                        throw new Error(errorDetail);
                    });
            }
            return response.json(); // If response.ok, expect JSON
        })
        .then(data => {
            if (data.status === 'success') {
                const indicator = document.getElementById(`indicator-${studentId}`);
                if (indicator) indicator.classList.add('submitted');

                const submittedCountEl = document.getElementById('submittedCount');
                let currentSubmitted = parseInt(submittedCountEl.textContent);
                submittedCountEl.textContent = currentSubmitted + 1;

                const pendingCountEl = document.getElementById('pendingCount');
                let currentPending = parseInt(pendingCountEl.textContent);
                pendingCountEl.textContent = currentPending - 1;

                alert(`Assignment submitted successfully!\n\nFile saved to Google Drive as: ${data.fileName}`);
                document.getElementById('fileName').textContent = '';
                document.getElementById('fileInput').value = '';
                document.getElementById('studentSelect').value = '';
            } else {
                // This case handles if server returns 200 OK but {status: "error", message: "..."}
                alert(`Upload failed: ${data.message || 'Unknown server-side issue (received success status but error content).'}`);
                console.error('Upload error data (successful response, but error status in JSON):', data);
            }
        })
        .catch(error => {
            // This catches network errors or errors thrown from the .then(response => ...) block
            console.error('Error during fetch operation:', error);
            alert(`Upload failed: ${error.message}. Check the console for more details.`);
        })
        .finally(() => {
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Assignment';
            submitBtn.disabled = false;
        });
    };
    reader.onerror = function(error) {
        console.error('Error reading file:', error);
        alert('Error reading file. Could not upload.');
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Assignment';
        submitBtn.disabled = false;
    };
    reader.readAsDataURL(file);
}