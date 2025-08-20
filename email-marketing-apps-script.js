/**
 * Google Apps Script for Email Marketing
 * ใช้สำหรับส่งอีเมลประชาสัมพันธ์หลักสูตรอบรม
 * 
 * วิธีใช้:
 * 1. สร้าง Google Apps Script project ใหม่
 * 2. คัดลอกโค้ดนี้ไปใส่
 * 3. Deploy เป็น Web App
 * 4. อนุญาต permissions สำหรับ Gmail API
 */

// ตั้งค่าพื้นฐาน
const CONFIG = {
  MAX_EMAILS_PER_DAY: 500, // Gmail limit for regular accounts
  MAX_EMAILS_PER_BATCH: 100,
  DELAY_BETWEEN_BATCHES: 60000, // 1 minute in milliseconds
  FROM_NAME: 'ทีมงานหลักสูตรอบรม AI',
  REPLY_TO: 'info@cpru.ac.th'
};

/**
 * Handle web app requests
 */
function doPost(e) {
  try {
    // Enable CORS
    const output = ContentService.createTextOutput();
    output.setMimeType(ContentService.MimeType.JSON);
    
    // Parse request data
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    let result;
    
    switch (action) {
      case 'sendEmails':
        result = sendEmailCampaign(data);
        break;
      case 'checkQuota':
        result = checkEmailQuota();
        break;
      case 'validateEmails':
        result = validateEmailList(data.emails);
        break;
      default:
        result = { success: false, error: 'Invalid action' };
    }
    
    output.setContent(JSON.stringify(result));
    return output;
    
  } catch (error) {
    console.error('Error in doPost:', error);
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: false, 
        error: error.toString() 
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle GET requests (for CORS preflight)
 */
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'Email Marketing API Ready' }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Send email campaign
 */
function sendEmailCampaign(data) {
  try {
    const { emails, subject, body, batchMode, batchSize, batchDelay } = data;
    
    // Validate inputs
    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return { success: false, error: 'ไม่พบรายชื่ออีเมล' };
    }
    
    if (!subject || !body) {
      return { success: false, error: 'กรุณากรอกหัวข้อและเนื้อหาอีเมล' };
    }
    
    // Check email quota
    const quotaCheck = checkEmailQuota();
    if (!quotaCheck.canSend || quotaCheck.remaining < emails.length) {
      return { 
        success: false, 
        error: `เกินขีดจำกัดการส่งอีเมล (เหลือ ${quotaCheck.remaining} อีเมล)` 
      };
    }
    
    // Validate email addresses
    const validEmails = emails.filter(email => isValidEmail(email));
    if (validEmails.length === 0) {
      return { success: false, error: 'ไม่พบอีเมลที่ถูกต้อง' };
    }
    
    let results = {
      success: true,
      totalEmails: validEmails.length,
      sentCount: 0,
      failedCount: 0,
      results: []
    };
    
    if (batchMode) {
      results = sendEmailsInBatches(validEmails, subject, body, batchSize, batchDelay);
    } else {
      results = sendAllEmails(validEmails, subject, body);
    }
    
    // Log campaign results
    logEmailCampaign(results);
    
    return results;
    
  } catch (error) {
    console.error('Error in sendEmailCampaign:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Send all emails at once
 */
function sendAllEmails(emails, subject, body) {
  const results = {
    success: true,
    totalEmails: emails.length,
    sentCount: 0,
    failedCount: 0,
    results: []
  };
  
  for (let i = 0; i < emails.length; i++) {
    const email = emails[i];
    
    try {
      // Personalize email body (replace [ชื่อ] with email username)
      const personalizedBody = personalizeEmailBody(body, email);
      
      // Send email
      GmailApp.sendEmail(
        email,
        subject,
        '', // Plain text body (empty)
        {
          htmlBody: personalizedBody,
          name: CONFIG.FROM_NAME,
          replyTo: CONFIG.REPLY_TO
        }
      );
      
      results.sentCount++;
      results.results.push({
        email: email,
        status: 'success',
        message: 'ส่งสำเร็จ'
      });
      
      // Small delay to prevent rate limiting
      Utilities.sleep(200);
      
    } catch (error) {
      results.failedCount++;
      results.results.push({
        email: email,
        status: 'failed',
        message: error.toString()
      });
    }
  }
  
  return results;
}

/**
 * Send emails in batches
 */
function sendEmailsInBatches(emails, subject, body, batchSize = 50, batchDelay = 60) {
  const results = {
    success: true,
    totalEmails: emails.length,
    sentCount: 0,
    failedCount: 0,
    results: [],
    batches: []
  };
  
  const totalBatches = Math.ceil(emails.length / batchSize);
  
  for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
    const startIndex = batchIndex * batchSize;
    const endIndex = Math.min(startIndex + batchSize, emails.length);
    const batch = emails.slice(startIndex, endIndex);
    
    const batchResults = {
      batchNumber: batchIndex + 1,
      totalBatches: totalBatches,
      emails: batch.length,
      sent: 0,
      failed: 0,
      startTime: new Date()
    };
    
    // Send batch
    for (const email of batch) {
      try {
        const personalizedBody = personalizeEmailBody(body, email);
        
        GmailApp.sendEmail(
          email,
          subject,
          '',
          {
            htmlBody: personalizedBody,
            name: CONFIG.FROM_NAME,
            replyTo: CONFIG.REPLY_TO
          }
        );
        
        results.sentCount++;
        batchResults.sent++;
        results.results.push({
          email: email,
          status: 'success',
          message: 'ส่งสำเร็จ',
          batch: batchIndex + 1
        });
        
        Utilities.sleep(200);
        
      } catch (error) {
        results.failedCount++;
        batchResults.failed++;
        results.results.push({
          email: email,
          status: 'failed',
          message: error.toString(),
          batch: batchIndex + 1
        });
      }
    }
    
    batchResults.endTime = new Date();
    results.batches.push(batchResults);
    
    // Delay between batches (except for last batch)
    if (batchIndex < totalBatches - 1) {
      Utilities.sleep(batchDelay * 1000);
    }
  }
  
  return results;
}

/**
 * Personalize email body
 */
function personalizeEmailBody(body, email) {
  // Extract name from email (part before @)
  const name = email.split('@')[0];
  const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
  
  // Replace placeholders
  let personalizedBody = body.replace(/\[ชื่อ\]/g, capitalizedName);
  
  // Convert line breaks to HTML
  personalizedBody = personalizedBody.replace(/\n/g, '<br>');
  
  // Add basic HTML structure
  personalizedBody = `
    <div style="font-family: 'Kanit', Arial, sans-serif; line-height: 1.6; color: #333;">
      ${personalizedBody}
    </div>
  `;
  
  return personalizedBody;
}

/**
 * Check email quota
 */
function checkEmailQuota() {
  try {
    // Gmail API doesn't provide direct quota check
    // We'll use a simple estimation based on sent emails today
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    // Get sent emails from today (this is an approximation)
    const sentToday = GmailApp.search('in:sent after:' + Utilities.formatDate(startOfDay, Session.getScriptTimeZone(), 'yyyy/MM/dd'));
    
    const used = sentToday.length;
    const remaining = CONFIG.MAX_EMAILS_PER_DAY - used;
    
    return {
      success: true,
      maxPerDay: CONFIG.MAX_EMAILS_PER_DAY,
      used: used,
      remaining: Math.max(0, remaining),
      canSend: remaining > 0
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.toString(),
      maxPerDay: CONFIG.MAX_EMAILS_PER_DAY,
      used: 0,
      remaining: CONFIG.MAX_EMAILS_PER_DAY,
      canSend: true
    };
  }
}

/**
 * Validate email list
 */
function validateEmailList(emails) {
  if (!emails || !Array.isArray(emails)) {
    return { success: false, error: 'Invalid email list' };
  }
  
  const results = {
    success: true,
    total: emails.length,
    valid: 0,
    invalid: 0,
    validEmails: [],
    invalidEmails: []
  };
  
  emails.forEach(email => {
    if (isValidEmail(email)) {
      results.valid++;
      results.validEmails.push(email);
    } else {
      results.invalid++;
      results.invalidEmails.push(email);
    }
  });
  
  return results;
}

/**
 * Validate email format
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Log email campaign to Google Sheets
 */
function logEmailCampaign(results) {
  try {
    // Create or get logging spreadsheet
    const spreadsheetId = getOrCreateLogSpreadsheet();
    const sheet = SpreadsheetApp.openById(spreadsheetId).getActiveSheet();
    
    // Add campaign summary
    const timestamp = new Date();
    sheet.appendRow([
      timestamp,
      'Email Campaign',
      results.totalEmails,
      results.sentCount,
      results.failedCount,
      `${results.sentCount}/${results.totalEmails} (${Math.round(results.sentCount/results.totalEmails*100)}%)`
    ]);
    
  } catch (error) {
    console.error('Error logging campaign:', error);
  }
}

/**
 * Get or create logging spreadsheet
 */
function getOrCreateLogSpreadsheet() {
  const fileName = 'Email Marketing Logs';
  
  // Try to find existing spreadsheet
  const files = DriveApp.getFilesByName(fileName);
  if (files.hasNext()) {
    return files.next().getId();
  }
  
  // Create new spreadsheet
  const spreadsheet = SpreadsheetApp.create(fileName);
  const sheet = spreadsheet.getActiveSheet();
  
  // Add headers
  sheet.getRange(1, 1, 1, 6).setValues([[
    'Timestamp', 'Campaign Type', 'Total Emails', 'Sent', 'Failed', 'Success Rate'
  ]]);
  
  // Format headers
  sheet.getRange(1, 1, 1, 6).setFontWeight('bold');
  sheet.autoResizeColumns(1, 6);
  
  return spreadsheet.getId();
}

/**
 * Test function - ส่งอีเมลทดสอบ
 */
function testSendEmail() {
  const testEmail = 'your-test-email@gmail.com'; // เปลี่ยนเป็นอีเมลของคุณ
  const subject = '🧪 ทดสอบระบบส่งอีเมล - หลักสูตรอบรม AI';
  const body = `
เรียน คุณ [ชื่อ]

นี่คือการทดสอบระบบส่งอีเมลสำหรับประชาสัมพันธ์หลักสูตรอบรม

🚀 "การสอนเขียนโค้ดในยุค AI: คู่มือสำหรับอาจารย์"

หากคุณได้รับอีเมลนี้ แสดงว่าระบบทำงานได้ปกติ

ขอบคุณครับ/ค่ะ
ทีมงานพัฒนาระบบ
  `;
  
  try {
    const result = sendEmailCampaign({
      emails: [testEmail],
      subject: subject,
      body: body,
      batchMode: false
    });
    
    console.log('Test result:', result);
    return result;
    
  } catch (error) {
    console.error('Test failed:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Setup function - เรียกครั้งแรกเพื่อตั้งค่า permissions
 */
function setupPermissions() {
  try {
    // Test Gmail access
    const drafts = GmailApp.getDrafts();
    console.log('Gmail access: OK');
    
    // Test Drive access
    const files = DriveApp.getFiles();
    console.log('Drive access: OK');
    
    // Test Spreadsheet access
    const sheets = SpreadsheetApp.getActiveSpreadsheet();
    console.log('Sheets access: OK');
    
    return { success: true, message: 'All permissions granted successfully' };
    
  } catch (error) {
    console.error('Permission setup failed:', error);
    return { success: false, error: error.toString() };
  }
}
