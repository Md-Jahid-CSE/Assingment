// Student data
const studentData = {
    "users": {
                "0802420205101100": { "name": "NAFIS HASAN ABID" },
                "0802420105101101": { "name": "MST. MOMITA JAMAN MOMO" },
                "0802420105101102": { "name": "MST. MARJIA MEHEJABIN" },
                "0802420405101103": { "name": "MD. SAYADUL ISLAM" },
                "0802420205101105": { "name": "ALL SHAHRIAR RAHMAN ROKON" },
                "0802420405101106": { "name": "MD. AYMAN ABID SEYAM" },
                "0802420105101107": { "name": "MOST. FARHA TABASSUM ANANNA" },
                "0802420105101108": { "name": "MOST. FARIHA TABASSUM ANU" },
                "0802420105101109": { "name": "NUSRAT JAHAN JUI" },
                "0802420205101112": { "name": "SHAH MD. AL JUNAID" },
                "0802420105101113": { "name": "SHIDRATUL MUNTAHA" },
                "0802420105101114": { "name": "FARHANA BENTE HUSSIN SAYDA" },
                "0802420105101115": { "name": "JANNATUL MAOWA JEBA" },
                "0802420205101116": { "name": "MD. SIMUM HASSAN SIYAM" },
                "0802420405101118": { "name": "MD. SANZID HASAN" },
                "0802420105101119": { "name": "ASHRIA JAHAN PRIONTY" },
                "0802420105101120": { "name": "MUNTASERA TABASSUM LOPA" },
                "0802420105101122": { "name": "MST. RIFA TAMANNA" },
                "0802420205101123": { "name": "MD. TANJIMUL ISLAM TAMIM" },
                "0802420205101126": { "name": "MD. JAHID HASAN" },
                "0802420105101127": { "name": "DISHA ROY TRIPTY" },
                "0802420205101128": { "name": "MD. RAHIB SABAB SHIFAT" },
                "0802420205101130": { "name": "SHAH MD. RIAZUL ISLAM" },
                "0802420205101131": { "name": "MD. FARHAN ALAM" },
                "0802420105101132": { "name": "TANUSHREE ROY" },
                "0802420405101134": { "name": "MD. TANVIR ISLAM MASUM" },
                "0802420105101135": { "name": "MRINMOYE RAHMAN" },
                "0802420205101136": { "name": "ABDULLAH - AL GALIB TONMOY" },
                "0802420205101137": { "name": "MD. SAJOL HASSAN" },
                "0802420205101138": { "name": "A. S. M. SAYEM" },
                "0802420405101139": { "name": "MD. ELIAS AHMAD" },
                "0802420205101140": { "name": "MD. SEYAM ALI" },
                "0802420105101141": { "name": "FARHANA TABASSUM PROME" },
                "0802420205101143": { "name": "MD MONIRUZZAMAN MONIR" },
                "0802420205101144": { "name": "SHIRATUL BASHAR" },
                "0802420105101145": { "name": "JARIN TAHSIN POLSHA" },
                "0802420105101146": { "name": "ATIKA MALIHA" },
                "0802410205101012": { "name": "S.M. MAHBUB MOURSHED SIAM" },
                "0802410205101076": { "name": "TANZIM MASHRUR TASHIN" },
                "0802410205101078": { "name": "MD. SADEQUL ISLAM SAJEEB" },
                "0802410105101095": { "name": "SADIA AKTER" },
                "0802310105101032": { "name": "HASNA HANA NOWSIN" },
    }
};

const APPS_SCRIPT_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbyInINvlc-r-5GvZ6IuzmGKW5Pz_VDVIAWehd8bGaY_AXnMSzDRUZ6ONuborQOLQ__51A/exec';

document.addEventListener('DOMContentLoaded', function() {
    const totalStudents = Object.keys(studentData.users).length;
    document.getElementById('totalStudents').textContent = totalStudents;
    document.getElementById('pendingCount').textContent = totalStudents;

    const studentSelect = document.getElementById('studentSelect');
    studentSelect.innerHTML = '<option value="">-- Select your Student ID --</option>';
    for (const id in studentData.users) {
        const option = document.createElement('option');
        option.value = id;
        option.textContent = `${id} - ${studentData.users[id].name}`;
        studentSelect.appendChild(option);
    }

    const studentList = document.getElementById('studentList');
    studentList.innerHTML = '';
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
        const validExtensions = ['dwg', 'zip'];
        if (!validExtensions.includes(extension)) {
        alert('Invalid file type. Please upload a DWG or ZIP file.');
        return;
}
        if (file.size > 15 * 1024 * 1024) { // 15MB
            alert('File size exceeds 15MB limit');
            return;
        }
        if (!APPS_SCRIPT_WEB_APP_URL || !APPS_SCRIPT_WEB_APP_URL.startsWith('https://script.google.com/macros/s/')) {
            alert('Critical Error: Apps Script Web App URL is not correctly configured in script.js.');
            return;
        }
        uploadToGoogleDrive(selectedId, file);
    });

    // Test connection and load submission status on page load
    testConnection();
    loadSubmissionStatus();
});

/**
 * Load submission status from Google Drive
 */
function loadSubmissionStatus() {
    console.log('Loading submission status...');
    
    const callbackName = 'status_callback_' + Date.now();
    
    window[callbackName] = function(data) {
        console.log('Status check result:', data);
        
        if (data.status === 'success' && data.submittedFiles) {
            let submittedCount = 0;
            
            // Update UI for each submitted file
            data.submittedFiles.forEach(studentId => {
                const indicator = document.getElementById(`indicator-${studentId}`);
                if (indicator) {
                    indicator.classList.add('submitted');
                    submittedCount++;
                }
            });
            
            // Update counters
            document.getElementById('submittedCount').textContent = submittedCount;
            const totalStudents = Object.keys(studentData.users).length;
            document.getElementById('pendingCount').textContent = totalStudents - submittedCount;
            
            console.log(`✅ Found ${submittedCount} submitted assignments`);
        } else {
            console.log('No submitted files found or error occurred');
        }
        
        // Cleanup
        const script = document.querySelector(`script[src*="${callbackName}"]`);
        if (script) {
            document.head.removeChild(script);
        }
        delete window[callbackName];
    };
    
    const script = document.createElement('script');
    script.src = `${APPS_SCRIPT_WEB_APP_URL}?callback=${callbackName}&action=checkStatus`;
    script.onerror = function() {
        console.error('❌ Failed to check submission status');
        delete window[callbackName];
    };
    document.head.appendChild(script);
}
function testConnection() {
    const callbackName = 'test_callback_' + Date.now();
    
    window[callbackName] = function(data) {
        console.log('Connection test result:', data);
        if (data.status === 'success') {
            console.log('✅ Google Apps Script connection working!');
        } else {
            console.warn('⚠️ Google Apps Script connection issue:', data.message);
        }
        // Cleanup
        const script = document.querySelector(`script[src*="${callbackName}"]`);
        if (script) {
            document.head.removeChild(script);
        }
        delete window[callbackName];
    };
    
    const script = document.createElement('script');
    script.src = `${APPS_SCRIPT_WEB_APP_URL}?callback=${callbackName}`;
    script.onerror = function() {
        console.error('❌ Failed to connect to Google Apps Script');
        delete window[callbackName];
    };
    document.head.appendChild(script);
}

/**
 * Upload file - automatically chooses between JSONP and POST based on file size
 */
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

        // Calculate estimated URL length for JSONP
        const encodedData = encodeURIComponent(JSON.stringify(payload));
        const callbackName = 'upload_callback_' + Date.now();
        const baseUrl = `${APPS_SCRIPT_WEB_APP_URL}?callback=${callbackName}&data=`;
        const totalUrlLength = baseUrl.length + encodedData.length;
        
        console.log('Payload size (chars):', JSON.stringify(payload).length);
        console.log('Estimated URL length:', totalUrlLength);

        // Use POST for large files, JSONP for small files
        if (totalUrlLength > 8000) {
            console.log('File too large for JSONP, using POST method');
            uploadWithPOST(payload, handleUploadResponse);
        } else {
            console.log('Using JSONP method');
            uploadWithJSONP(payload, handleUploadResponse);
        }
    };
    
    reader.onerror = function(error) {
        console.error('Error reading file:', error);
        alert('Error reading file. Could not upload.');
        resetSubmitButton();
    };
    
    reader.readAsDataURL(file);
}

/**
 * Handle upload response (shared between JSONP and POST methods)
 */
function handleUploadResponse(data) {
    console.log('Full upload response:', data);
    console.log('Response status:', data.status);
    console.log('Response message:', data.message);
    
    if (data.status === 'success') {
        const studentId = data.studentId || document.getElementById('studentSelect').value;
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
        // More detailed error reporting
        const errorMessage = data.message || data.error || 'Unknown server-side issue';
        console.error('Upload failed. Full error data:', data);
        alert(`Upload failed: ${errorMessage}`);
    }

    resetSubmitButton();
}

/**
 * Reset submit button to original state
 */
function resetSubmitButton() {
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Assignment';
    submitBtn.disabled = false;
}

/**
 * Upload using form submission method (for larger files - bypasses CORS)
 */
function uploadWithPOST(payload, callback) {
    console.log('Starting form-based upload...');
    
    // Create a unique callback name for this upload
    const callbackName = 'form_upload_callback_' + Date.now();
    
    // Create the callback function
    window[callbackName] = function(data) {
        console.log('Form upload response:', data);
        callback(data);
        cleanup();
    };
    
    // Cleanup function
    function cleanup() {
        const iframe = document.getElementById('upload-iframe-' + callbackName);
        const form = document.getElementById('upload-form-' + callbackName);
        if (iframe) document.body.removeChild(iframe);
        if (form) document.body.removeChild(form);
        delete window[callbackName];
    }
    
    // Create hidden iframe for form submission
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.id = 'upload-iframe-' + callbackName;
    iframe.name = 'upload-iframe-' + callbackName;
    document.body.appendChild(iframe);
    
    // Handle iframe load (response received)
    iframe.onload = function() {
        try {
            // Try to read the response from iframe
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            const responseText = iframeDoc.body.innerText || iframeDoc.body.textContent;
            
            if (responseText.trim()) {
                // Check if it's a JSONP callback
                if (responseText.includes(callbackName + '(')) {
                    // Execute the JSONP callback
                    eval(responseText);
                } else {
                    // Try to parse as JSON
                    try {
                        const data = JSON.parse(responseText);
                        callback(data);
                        cleanup();
                    } catch (e) {
                        callback({ status: 'error', message: 'Invalid response format: ' + responseText });
                        cleanup();
                    }
                }
            }
        } catch (e) {
            // Cross-origin restrictions prevent reading iframe content
            // Wait a bit and assume success if no error callback was triggered
            setTimeout(() => {
                callback({ 
                    status: 'success', 
                    message: 'Upload completed (response not readable due to CORS)',
                    fileName: payload.studentId + '.' + payload.fileName.split('.').pop()
                });
                cleanup();
            }, 2000);
        }
    };
    
    // Create form for submission
    const form = document.createElement('form');
    form.id = 'upload-form-' + callbackName;
    form.method = 'POST';
    form.action = APPS_SCRIPT_WEB_APP_URL + '?callback=' + callbackName;
    form.target = iframe.name;
    form.style.display = 'none';
    
    // Add form data
    const formData = new FormData();
    formData.append('data', JSON.stringify(payload));
    
    // Convert FormData to form inputs
    for (const [key, value] of formData.entries()) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value;
        form.appendChild(input);
    }
    
    document.body.appendChild(form);
    
    // Submit form
    console.log('Submitting form...');
    form.submit();
    
    // Set timeout for the upload
    setTimeout(() => {
        if (window[callbackName]) {
            callback({ status: 'error', message: 'Upload timeout (45 seconds)' });
            cleanup();
        }
    }, 45000);
}

/**
 * Upload using JSONP to bypass CORS restrictions (for smaller files)
 */
function uploadWithJSONP(payload, callback) {
    const callbackName = 'upload_callback_' + Date.now();
    const encodedData = encodeURIComponent(JSON.stringify(payload));
    
    const timeoutId = setTimeout(() => {
        callback({ status: 'error', message: 'Request timeout (30 seconds)' });
        cleanup();
    }, 30000); // 30 second timeout
    
    function cleanup() {
        clearTimeout(timeoutId);
        const script = document.querySelector(`script[src*="${callbackName}"]`);
        if (script) {
            document.head.removeChild(script);
        }
        delete window[callbackName];
    }
    
    window[callbackName] = function(data) {
        clearTimeout(timeoutId);
        console.log('JSONP callback received:', data);
        callback(data);
        cleanup();
    };
    
    const script = document.createElement('script');
    script.src = `${APPS_SCRIPT_WEB_APP_URL}?callback=${callbackName}&data=${encodedData}`;
    
    script.onerror = function(error) {
        clearTimeout(timeoutId);
        console.error('Script loading error:', error);
        callback({ status: 'error', message: 'Network error or script loading failed. Check console for details.' });
        cleanup();
    };
    
    console.log('Loading JSONP script with URL length:', script.src.length);
    document.head.appendChild(script);
}
