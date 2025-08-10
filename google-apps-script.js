// Google Apps Script สำหรับรับข้อมูลจากฟอร์มลงทะเบียน - เวอร์ชันขั้นสูง
// คัดลอกโค้ดนี้ไปใส่ใน Google Apps Script

// Configuration
const CONFIG = {
  SPREADSHEET_ID: 'YOUR_SPREADSHEET_ID_HERE',
  EMAIL_TEMPLATE: {
    subject: '✅ ยืนยันการลงทะเบียนอบรม AI เขียนโค้ด',
    fromName: 'ทีมงานอบรม AI Coding'
  }
};

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID).getActiveSheet();
    
    console.log('Received request:', e);
    
    let data;
    if (e.postData && e.postData.contents) {
      // Handle JSON data from fetch request
      try {
        data = JSON.parse(e.postData.contents);
        console.log('Parsed JSON data:', data);
      } catch (jsonError) {
        console.log('JSON parsing failed, using form data:', jsonError);
        data = e.parameter;
      }
    } else {
      // Handle form data from fallback submission (วิธีหลักที่ใช้งานได้จริง)
      data = e.parameter;
      console.log('Using form parameter data:', data);
    }
    
    // Add headers if this is the first row
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'วันที่/เวลา',
        'ชื่อ',
        'นามสกุล', 
        'อีเมล',
        'เบอร์โทรศัพท์',
        'สถานที่ทำงาน',
        'ตำแหน่ง',
        'ประสบการณ์การเขียนโปรแกรม',
        'ภาษาโปรแกรมที่ใช้',
        'ความคาดหวังจากการอบรม',
        'หัวข้อที่สนใจ'
      ]);
      
      // Format header row
      const headerRange = sheet.getRange(1, 1, 1, 11);
      headerRange.setBackground('#4285f4');
      headerRange.setFontColor('white');
      headerRange.setFontWeight('bold');
    }
    
    // Add the new registration data
    sheet.appendRow([
      data.timestamp || new Date().toLocaleString('th-TH', {
        timeZone: 'Asia/Bangkok',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }),
      data.firstName || '',
      data.lastName || '',
      data.email || '',
      data.phone || '',
      data.organization || '',
      data.position || '',
      data.experience || '',
      data.programmingLanguages || '',
      data.expectations || '',
      data.topics || ''
    ]);
    
    // Auto-resize columns
    sheet.autoResizeColumns(1, 11);
    
    // Send confirmation email
    if (data.email && data.firstName) {
      try {
        sendConfirmationEmail(data);
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        // Don't fail the registration if email fails
      }
    }
    
    // Return success response with CORS headers
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'ลงทะเบียนสำเร็จ',
        timestamp: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400'
      });
      
  } catch (error) {
    console.error('Error in doPost:', error);
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString(),
        message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล'
      }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      });
  }
}

// Handle GET requests (for testing)
function doGet(e) {
  return ContentService
    .createTextOutput('Google Apps Script is running. Use POST method to submit data.')
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeaders({
      'Access-Control-Allow-Origin': '*'
    });
}

// Handle OPTIONS requests for CORS preflight
function doOptions(e) {
  return ContentService
    .createTextOutput('')
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    });
}

// Send confirmation email to registrant
function sendConfirmationEmail(data) {
  const subject = CONFIG.EMAIL_TEMPLATE.subject;
  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
        .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; }
        .highlight { color: #667eea; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 ยืนยันการลงทะเบียนสำเร็จ!</h1>
          <p>การอบรม AI เขียนโค้ด</p>
        </div>
        <div class="content">
          <p>สวัสดีครับ/ค่ะ คุณ<span class="highlight">${data.firstName} ${data.lastName}</span></p>
          
          <p>ขอบคุณที่ลงทะเบียนเข้าร่วมการอบรม <strong>"การใช้ AI เขียนโค้ด"</strong> เราได้รับข้อมูลการลงทะเบียนของคุณเรียบร้อยแล้ว</p>
          
          <div class="info-box">
            <h3>📋 ข้อมูลการลงทะเบียนของคุณ</h3>
            <p><strong>ชื่อ-นามสกุล:</strong> ${data.firstName} ${data.lastName}</p>
            <p><strong>อีเมล:</strong> ${data.email}</p>
            <p><strong>เบอร์โทรศัพท์:</strong> ${data.phone}</p>
            <p><strong>สถานที่ทำงาน:</strong> ${data.organization}</p>
            <p><strong>ตำแหน่ง:</strong> ${data.position}</p>
            <p><strong>ประสบการณ์:</strong> ${data.experience}</p>
            <p><strong>หัวข้อที่สนใจ:</strong> ${data.topics}</p>
          </div>
          
          <div class="info-box">
            <h3>📚 หัวข้อการอบรม</h3>
            <ul>
              <li><strong>Vibe Coding:</strong> เทคนิคการเขียนโค้ดที่มีประสิทธิภาพ</li>
              <li><strong>Spec-Driven Development:</strong> การพัฒนาตามข้อกำหนด</li>
              <li><strong>Context Engineering:</strong> การออกแบบบริบทสำหรับ AI</li>
            </ul>
          </div>
          
          <p><strong>ขั้นตอนถัดไป:</strong></p>
          <ul>
            <li>ทีมงานจะติดต่อกลับภายใน 1-2 วันทำการ</li>
            <li>คุณจะได้รับรายละเอียดเพิ่มเติมเกี่ยวกับการอบรม</li>
            <li>เตรียมตัวให้พร้อมสำหรับการเรียนรู้ที่น่าตื่นเต้น!</li>
          </ul>
          
          <div class="footer">
            <p>หากมีคำถามเพิ่มเติม กรุณาติดต่อทีมงานได้ที่อีเมลนี้</p>
            <p>ขอบคุณครับ/ค่ะ<br>ทีมงานอบรม AI Coding</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  
  MailApp.sendEmail({
    to: data.email,
    subject: subject,
    htmlBody: htmlBody,
    name: CONFIG.EMAIL_TEMPLATE.fromName
  });
  
  console.log('Confirmation email sent to:', data.email);
}

// Get registration statistics for dashboard
function getRegistrationStats() {
  try {
    const sheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID).getActiveSheet();
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      return { totalRegistrations: 0, stats: {} };
    }
    
    const registrations = data.slice(1); // Remove header row
    const stats = {
      totalRegistrations: registrations.length,
      byExperience: {},
      byOrganization: {},
      byTopics: {},
      byLanguages: {},
      recentRegistrations: registrations.slice(-5).reverse(),
      registrationsByDay: {}
    };
    
    registrations.forEach(row => {
      const [timestamp, firstName, lastName, email, phone, org, position, exp, languages, expectations, topics] = row;
      
      // Count by experience
      if (exp) {
        stats.byExperience[exp] = (stats.byExperience[exp] || 0) + 1;
      }
      
      // Count by organization
      if (org) {
        stats.byOrganization[org] = (stats.byOrganization[org] || 0) + 1;
      }
      
      // Count by topics
      if (topics) {
        topics.split(',').forEach(topic => {
          const cleanTopic = topic.trim();
          if (cleanTopic) {
            stats.byTopics[cleanTopic] = (stats.byTopics[cleanTopic] || 0) + 1;
          }
        });
      }
      
      // Count by programming languages
      if (languages) {
        languages.split(',').forEach(lang => {
          const cleanLang = lang.trim();
          if (cleanLang) {
            stats.byLanguages[cleanLang] = (stats.byLanguages[cleanLang] || 0) + 1;
          }
        });
      }
      
      // Count by day
      if (timestamp) {
        const date = new Date(timestamp).toDateString();
        stats.registrationsByDay[date] = (stats.registrationsByDay[date] || 0) + 1;
      }
    });
    
    return stats;
  } catch (error) {
    console.error('Error getting stats:', error);
    return { error: error.toString() };
  }
}

// API endpoint for dashboard
function doGet(e) {
  const action = e.parameter.action;
  
  if (action === 'stats') {
    const stats = getRegistrationStats();
    return ContentService
      .createTextOutput(JSON.stringify(stats))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      });
  }
  
  return ContentService
    .createTextOutput('Google Apps Script is running. Use POST method to submit data or GET with action=stats for dashboard.')
    .setHeaders({
      'Access-Control-Allow-Origin': '*'
    });
}

// Test function to verify the script works
function testScript() {
  const testData = {
    firstName: 'ทดสอบ',
    lastName: 'ระบบ',
    email: 'test@example.com',
    phone: '0812345678',
    organization: 'บริษัททดสอบ',
    position: 'นักพัฒนา',
    experience: 'มีประสบการณ์ 1-3 ปี',
    programmingLanguages: 'JavaScript, Python',
    expectations: 'เรียนรู้การใช้ AI ในการเขียนโค้ด',
    topics: 'Vibe Coding, Spec-Driven Development'
  };
  
  const mockEvent = {
    parameter: testData
  };
  
  const result = doPost(mockEvent);
  console.log('Test result:', result.getContent());
}
