// Email Marketing JavaScript
let emailCampaignActive = false;
let currentBatch = 0;
let totalBatches = 0;
let sentCount = 0;
let totalEmails = 0;
let quill = null;
let currentEditorMode = 'rich';
let currentTemplate = 'professional';

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Rich Text Editor
    initializeRichEditor();
    
    // Load default template
    loadDefaultTemplate();
    
    // Add event listener for email list changes
    document.getElementById('emailList').addEventListener('input', updateEmailStats);
    
    // Initialize stats
    updateEmailStats();
});

// Initialize Quill Rich Text Editor
function initializeRichEditor() {
    try {
        console.log('🔧 กำลัง Initialize Quill Editor...');
        
        // Check if Quill is loaded
        if (typeof Quill === 'undefined') {
            console.error('❌ Quill.js ไม่ได้โหลด');
            addLogEntry('❌ Quill.js ไม่ได้โหลด - กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต', 'error');
            return;
        }
        
        // Check if element exists
        const editorElement = document.getElementById('emailEditor');
        if (!editorElement) {
            console.error('❌ ไม่พบ element #emailEditor');
            addLogEntry('❌ ไม่พบ Rich Text Editor element', 'error');
            return;
        }
        
        const toolbarOptions = [
            ['bold', 'italic', 'underline'],
            [{ 'header': 1 }, { 'header': 2 }],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'align': [] }],
            ['link'],
            ['clean']
        ];

        quill = new Quill('#emailEditor', {
            theme: 'snow',
            modules: {
                toolbar: toolbarOptions
            },
            placeholder: 'เขียนเนื้อหาอีเมลที่นี่...'
        });
        
        console.log('✅ Quill Editor Initialize สำเร็จ');
        addLogEntry('✅ Rich Text Editor พร้อมใช้งาน', 'success');

        // Listen for text changes
        quill.on('text-change', function() {
            if (currentEditorMode === 'rich') {
                syncEditorContent();
            }
        });
        
        // Set global reference
        window.quill = quill;
        
    } catch (error) {
        console.error('❌ Error initializing Quill:', error);
        addLogEntry(`❌ เกิดข้อผิดพลาดในการโหลด Rich Text Editor: ${error.message}`, 'error');
    }
}

// Load default email template
function loadDefaultTemplate() {
    const defaultTemplate = `เรียน คุณ [ชื่อ]

สวัสดีครับ/ค่ะ

ขอเชิญท่านเข้าร่วมหลักสูตรอบรมพิเศษ
🚀 "การสอนเขียนโค้ดในยุค AI: คู่มือสำหรับอาจารย์"

📅 วันที่: เสาร์ที่ 16 สิงหาคม 2568
⏰ เวลา: 09:00 - 16:00 น.
📍 สถานที่: มหาวิทยาลัยราชภัฏจันทรเกษม
💰 ค่าลงทะเบียน: ฟรี!

🎯 สิ่งที่ท่านจะได้รับ:
✅ เทคนิคการสอนเขียนโค้ดด้วย AI
✅ เครื่องมือ AI สำหรับการสอน
✅ กิจกรรมปฏิบัติจริง
✅ เอกสารประกอบการอบรม
✅ Certificate of Completion

👥 จำนวนที่รับ: จำกัด 500 ท่าน
📝 ลงทะเบียน: https://your-registration-link.com

หากท่านสนใจ กรุณาลงทะเบียนโดยเร็วที่สุด
เนื่องจากที่นั่งมีจำกัด

📞 สอบถามเพิ่มเติม: 02-XXX-XXXX
📧 Email: info@example.com

ขอบคุณครับ/ค่ะ

ทีมงานหลักสูตรอบรม AI
มหาวิทยาลัยราชภัฏจันทรเกษม`;

    document.getElementById('emailBody').value = defaultTemplate;
}

// Load sample emails for testing
function loadSampleEmails() {
    const sampleEmails = [
        'teacher1@university.ac.th',
        'professor.smith@edu.th',
        'admin@school.ac.th',
        'lecturer@college.edu',
        'instructor@academy.th',
        'faculty@institute.ac.th',
        'educator@training.th',
        'academic@research.edu',
        'coordinator@program.th',
        'director@education.ac.th'
    ];
    
    document.getElementById('emailList').value = sampleEmails.join('\n');
    updateEmailStats();
    
    addLogEntry('โหลดตัวอย่างอีเมลเรียบร้อย', 'info');
}

// Update email statistics
function updateEmailStats() {
    const emailText = document.getElementById('emailList').value;
    const emails = parseEmailList(emailText);
    
    const validEmails = emails.filter(email => isValidEmail(email));
    const invalidEmails = emails.filter(email => !isValidEmail(email));
    
    document.getElementById('totalEmails').textContent = emails.length;
    document.getElementById('validEmails').textContent = validEmails.length;
    document.getElementById('invalidEmails').textContent = invalidEmails.length;
    
    // Update send button state
    const sendButton = document.getElementById('sendButton');
    if (validEmails.length > 0) {
        sendButton.disabled = false;
        sendButton.innerHTML = '<i class="fas fa-paper-plane"></i> เริ่มส่งอีเมล (' + validEmails.length + ' อีเมล)';
    } else {
        sendButton.disabled = true;
        sendButton.innerHTML = '<i class="fas fa-paper-plane"></i> เริ่มส่งอีเมล';
    }
}

// Parse email list from textarea
function parseEmailList(text) {
    if (!text.trim()) return [];
    
    // Split by newlines and commas, then clean up
    return text.split(/[\n,;]/)
        .map(email => email.trim())
        .filter(email => email.length > 0);
}

// Validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Select send option (all or batch)
function selectSendOption(option) {
    // Remove selected class from all options
    document.querySelectorAll('.send-option').forEach(opt => {
        opt.classList.remove('selected');
    });
    
    // Add selected class to clicked option
    event.target.closest('.send-option').classList.add('selected');
    
    // Show/hide batch settings
    const batchSettings = document.getElementById('batchSettings');
    if (option === 'batch') {
        batchSettings.classList.add('show');
    } else {
        batchSettings.classList.remove('show');
    }
}

// Start email campaign
async function startEmailCampaign() {
    if (emailCampaignActive) {
        alert('การส่งอีเมลกำลังดำเนินการอยู่');
        return;
    }
    
    const emailText = document.getElementById('emailList').value;
    const emails = parseEmailList(emailText);
    const validEmails = emails.filter(email => isValidEmail(email));
    
    if (validEmails.length === 0) {
        alert('ไม่พบอีเมลที่ถูกต้อง');
        return;
    }
    
    const subject = document.getElementById('emailSubject').value.trim();
    
    // Get email body from Rich Text Editor or HTML editor
    let body = '';
    if (window.quill) {
        body = window.quill.root.innerHTML.trim();
    } else {
        const htmlEditor = document.getElementById('htmlEditor');
        if (htmlEditor) {
            body = htmlEditor.value.trim();
        }
    }
    
    if (!subject || !body || body === '<p><br></p>') {
        alert('กรุณากรอกหัวข้อและเนื้อหาอีเมล');
        return;
    }
    
    // Check Gmail limits
    if (validEmails.length > 500) {
        if (!confirm(`คุณกำลังจะส่งอีเมล ${validEmails.length} ฉบับ ซึ่งเกินขีดจำกัดของ Gmail (500 อีเมล/วัน)\n\nต้องการดำเนินการต่อหรือไม่?`)) {
            return;
        }
    }
    
    // Start campaign
    emailCampaignActive = true;
    sentCount = 0;
    totalEmails = validEmails.length;
    
    // Show progress section
    document.getElementById('progressSection').classList.add('show');
    
    // Update UI
    const sendButton = document.getElementById('sendButton');
    sendButton.disabled = true;
    sendButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> กำลังส่ง...';
    
    // Clear log
    document.getElementById('logSection').innerHTML = '';
    
    // Check send option
    const selectedOption = document.querySelector('.send-option.selected');
    const isBatchMode = selectedOption.textContent.includes('แบทช์');
    
    addLogEntry(`เริ่มส่งอีเมล ${totalEmails} ฉบับ`, 'info');
    
    if (isBatchMode) {
        await sendEmailsInBatches(validEmails, subject, body);
    } else {
        await sendAllEmails(validEmails, subject, body);
    }
    
    // Campaign completed
    emailCampaignActive = false;
    sendButton.disabled = false;
    sendButton.innerHTML = '<i class="fas fa-paper-plane"></i> เริ่มส่งอีเมล';
    
    addLogEntry('การส่งอีเมลเสร็จสิ้น', 'success');
}

// Send all emails at once
async function sendAllEmails(emails, subject, body) {
    addLogEntry('ส่งอีเมลทั้งหมดในครั้งเดียว', 'info');
    
    for (let i = 0; i < emails.length; i++) {
        const email = emails[i];
        
        // Simulate sending email (replace with actual email sending logic)
        const success = await simulateEmailSend(email, subject, body);
        
        if (success) {
            sentCount++;
            addLogEntry(`✅ ส่งสำเร็จ: ${email}`, 'success');
        } else {
            addLogEntry(`❌ ส่งไม่สำเร็จ: ${email}`, 'error');
        }
        
        // Update progress
        updateProgress();
        
        // Small delay to prevent overwhelming
        await delay(100);
    }
}

// Send emails in batches
async function sendEmailsInBatches(emails, subject, body) {
    const batchSize = parseInt(document.getElementById('batchSize').value) || 50;
    const batchDelay = parseInt(document.getElementById('batchDelay').value) || 60;
    
    totalBatches = Math.ceil(emails.length / batchSize);
    currentBatch = 0;
    
    addLogEntry(`ส่งเป็นแบทช์: ${totalBatches} แบทช์, แบทช์ละ ${batchSize} อีเมล`, 'info');
    
    for (let i = 0; i < emails.length; i += batchSize) {
        currentBatch++;
        const batch = emails.slice(i, i + batchSize);
        
        addLogEntry(`เริ่มแบทช์ที่ ${currentBatch}/${totalBatches} (${batch.length} อีเมล)`, 'info');
        
        // Track batch results
        let batchSuccessCount = 0;
        let batchFailCount = 0;
        
        // Send batch
        for (const email of batch) {
            const success = await simulateEmailSend(email, subject, body);
            
            if (success) {
                sentCount++;
                batchSuccessCount++;
                addLogEntry(`✅ ส่งสำเร็จ: ${email}`, 'success');
            } else {
                batchFailCount++;
                addLogEntry(`❌ ส่งไม่สำเร็จ: ${email}`, 'error');
            }
            
            updateProgress();
            await delay(100);
        }
        
        // Batch completion summary
        addLogEntry(`🎉 แบทช์ที่ ${currentBatch} เสร็จสิ้น: สำเร็จ ${batchSuccessCount}/${batch.length} อีเมล (${Math.round(batchSuccessCount/batch.length*100)}%)`, 'success');
        
        // Delay between batches (except for last batch)
        if (currentBatch < totalBatches) {
            addLogEntry(`⏳ พักระหว่างแบทช์ ${batchDelay} วินาที...`, 'info');
            await delay(batchDelay * 1000);
        }
    }
}

// Simulate email sending (replace with actual email API)
async function simulateEmailSend(email, subject, body) {
    // Simulate very short network delay for demo
    await delay(Math.random() * 100 + 50); // 50-150ms instead of 500-1500ms
    
    // Simulate 95% success rate
    return Math.random() > 0.05;
}

// Update progress bar and text
function updateProgress() {
    const percentage = Math.round((sentCount / totalEmails) * 100);
    
    document.getElementById('progressFill').style.width = percentage + '%';
    document.getElementById('progressText').textContent = 
        `${sentCount} / ${totalEmails} อีเมล (${percentage}%)`;
}

// Add log entry
function addLogEntry(message, type = 'info') {
    const logSection = document.getElementById('logSection');
    const timestamp = new Date().toLocaleTimeString('th-TH');
    
    const logEntry = document.createElement('div');
    logEntry.className = `log-entry log-${type}`;
    logEntry.textContent = `[${timestamp}] ${message}`;
    
    logSection.appendChild(logEntry);
    logSection.scrollTop = logSection.scrollHeight;
}

// Utility function for delays
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Gmail integration functions (for future implementation)
function openGmailCompose(emails, subject, body) {
    // This would open Gmail compose window
    // Limited by Gmail's recipient limits
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${emails.slice(0, 100).join(',')}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(gmailUrl, '_blank');
}

// Export email list as CSV
function exportEmailList() {
    const emailText = document.getElementById('emailList').value;
    const emails = parseEmailList(emailText);
    const validEmails = emails.filter(email => isValidEmail(email));
    
    const csvContent = 'Email Address\n' + validEmails.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'email-list.csv';
    a.click();
    
    window.URL.revokeObjectURL(url);
}

// Import email list from CSV
function importEmailList(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const csv = e.target.result;
        const lines = csv.split('\n');
        const emails = lines.slice(1) // Skip header
            .map(line => line.trim())
            .filter(line => line.length > 0);
        
        document.getElementById('emailList').value = emails.join('\n');
        updateEmailStats();
        
        addLogEntry(`นำเข้าอีเมล ${emails.length} รายการ`, 'success');
    };
    reader.readAsText(file);
}
