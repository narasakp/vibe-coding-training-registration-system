// Google Apps Script สำหรับรับข้อมูลจากฟอร์มลงทะเบียน - เวอร์ชันขั้นสูง
// คัดลอกโค้ดนี้ไปใส่ใน Google Apps Script

// Configuration
const CONFIG = {
  SPREADSHEET_ID: '1uI_TA9lR0RsLcakF_GGb7LsM5H8gR3XCnQuiWQ0NuUQ', // ✅ Spreadsheet ID จริงที่ถูกต้อง
  EMAIL_TEMPLATE: {
    subject: '✅ ยืนยันการลงทะเบียน: อบรม AI เขียนโค้ด',
    fromName: 'CScpru: ทีมผู้จัดการอบรม AI Coding'
  },
  // 🔧 ปรับแต่งข้อมูลการอบรมที่นี่
  WORKSHOP_INFO: {
    title: 'การใช้ AI เขียนโค้ด',
    date: 'วันเสาร์ ที่ 16 สิงหาคม 2568',
    time: '09:00 - 16:00 น.',
    format: 'Online ผ่าน Zoom',
    maxParticipants: '500 คน',
    // 🔗 ข้อมูล Zoom Meeting
    zoom: {
      meetingId: '994 2059 5047',
      passcode: '208885',
      url: 'https://zoom.us/j/99420595047?pwd=xaa2TCqZHiIZ6XS7JT14zxlkc6acap.1'
    },
    // 📞 ช่องทางติดต่อ
    contact: {
      email: 'narasak@cpru.ac.th',
      lineId: '@narasak_poo'
    },
    // 🏢 ข้อมูลองค์กร
    organization: {
      teamName: 'สาขาวิชาวิทยาการคอมพิวเตอร์ มหาวิทยาลัยราชภัฏชัยภูมิ',
      slogan: '🚀 "เขียนโค้ดด้วย AI ให้เป็นมืออาชีพ"'
    }
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
        'คำนำหน้าชื่อ',
        'ชื่อ',
        'นามสกุล', 
        'อีเมล',
        'เพศ',
        'อายุ',
        'เบอร์โทรศัพท์',
        'หน่วยงาน / สถาบัน',
        'ตำแหน่ง / สถานะ',
        'ความเกี่ยวข้องกับ CPRU',
        'ช่องทางติดต่ออื่น ๆ',
        'ประสบการณ์การเขียนโปรแกรม',
        'ภาษาโปรแกรมที่ใช้',
        'ความคาดหวังจากการอบรม',
        'ช่องทางที่รู้จักการอบรมนี้',
        'หัวข้อที่สนใจ',
        'ข้อเสนอแนะเพิ่มเติม'
      ]);
      
      // Format header row
      const headerRange = sheet.getRange(1, 1, 1, 18);
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
      data.prefix || '',
      data.firstName || '',
      data.lastName || '',
      data.email || '',
      data.gender || '',
      data.age || '',
      data.phone || '',
      data.organization || '',
      data.position || '',
      data.cpruAffiliation || '',
      data.otherContact || '',
      data.experience || '',
      data.programmingLanguages || '',
      data.expectations || '',
      data.howDidYouHear || '',
      data.topics || '',
      data.additionalFeedback || ''
    ]);
    
    // Auto-resize columns
    sheet.autoResizeColumns(1, 18);
    
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

// Create a response with proper CORS headers
function createResponse(data, statusCode = 200) {
  const response = ContentService.createTextOutput(JSON.stringify(data));
  
  // Set CORS headers
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '3600',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  };
  
  // Set all headers
  for (const [key, value] of Object.entries(headers)) {
    response.setHeader(key, value);
  }
  
  // Set status code if provided
  if (statusCode) {
    response.setMimeType(ContentService.MimeType.JSON).setStatusCode(statusCode);
  } else {
    response.setMimeType(ContentService.MimeType.JSON);
  }
  
  return response;
}

// Handle GET requests (for registration count)
function doGet(e) {
  try {
    const action = e.parameter.action;
    console.log('Received GET request with action:', action);
    
    if (action === 'count') {
      try {
        const count = getRegistrationCount();
        console.log('Current registration count:', count);
        
        return createResponse({
          success: true,
          count: count,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('Error getting registration count:', error);
        return createResponse({
          success: false,
          error: error.toString(),
          message: 'Failed to get registration count'
        }, 500);
      }
    }
    
    if (action === 'dashboard') {
      try {
        const stats = getRegistrationStats();
        console.log('Dashboard stats:', stats);
        
        return createResponse({
          success: true,
          data: stats,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('Error getting dashboard stats:', error);
        return createResponse({
          success: false,
          error: error.toString(),
          message: 'Failed to get dashboard stats'
        }, 500);
      }
    }
    
    if (action === 'analytics') {
      try {
        const stats = getRegistrationStats();
        console.log('Analytics stats:', stats);
        
        return createResponse({
          success: true,
          data: stats,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('Error getting analytics stats:', error);
        return createResponse({
          success: false,
          error: error.toString(),
          message: 'Failed to get analytics stats'
        }, 500);
      }
    }
    
    // Handle other GET actions or return 404
    return createResponse({
      success: false,
      message: 'Invalid action',
      availableActions: ['count', 'dashboard', 'analytics']
    }, 400);
      
  } catch (error) {
    console.error('Error in doGet:', error);
    return createResponse({
      success: false,
      error: error.toString(),
      message: 'Internal server error'
    }, 500);
  }
}

// Handle OPTIONS requests for CORS preflight
function doOptions(e) {
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Max-Age': '3600',
      'Access-Control-Allow-Credentials': 'true'
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
          <p><h3>โครงการอบรม การใช้ AI เขียนโค้ด</h3></p>
        </div>
        <div class="content">
          <p>สวัสดีครับ ${data.prefix ? data.prefix : ''}${data.firstName} ${data.lastName}</p>
          
          <p>ขอบคุณที่ลงทะเบียนเข้าร่วมอบรม <strong>"${CONFIG.WORKSHOP_INFO.title}"</strong> <br>เราได้รับข้อมูลการลงทะเบียนของคุณเรียบร้อยแล้ว</p>
          
          <div class="info-box">
            <h3>📚 หัวข้อการอบรม</h3>
            <ul>
              <li><strong>Vibe Coding:</strong> เทคนิคการเขียนโค้ดที่มีประสิทธิภาพ</li>
              <li><strong>Spec-Driven Development:</strong> การพัฒนาตามข้อกำหนด</li>
              <li><strong>Context Engineering:</strong> การออกแบบบริบทสำหรับ AI</li>
            </ul>
          </div>

          <div class="info-box">
            <h3>📋 ข้อมูลการลงทะเบียนของคุณ</h3>
            <p><strong>ชื่อ-นามสกุล:</strong> ${data.prefix ? data.prefix + ' ' : ''}${data.firstName} ${data.lastName}</p>
            <p><strong>อีเมล:</strong> ${data.email}</p>
            <p><strong>เพศ:</strong> ${data.gender === 'male' ? 'ชาย' : data.gender === 'female' ? 'หญิง' : data.gender || '-'}</p>
            <p><strong>อายุ:</strong> ${data.age || '-'}</p>
            <p><strong>เบอร์โทรศัพท์:</strong> ${data.phone}</p>
            <p><strong>หน่วยงาน/สถาบัน:</strong> ${data.organization}</p>
            <p><strong>ตำแหน่ง/สถานะ:</strong> ${data.position}</p>
            <p><strong>ความเกี่ยวข้องกับ CPRU:</strong> ${(() => {
              switch(data.cpruAffiliation) {
                case 'current-student': return 'นักศึกษาปัจจุบัน';
                case 'alumni': return 'ศิษย์เก่า CPRU';
                case 'staff': return 'บุคลากร (อาจารย์, เจ้าหน้าที่)';
                case 'general-public': return 'บุคคลทั่วไป – ไม่เกี่ยวข้อง';
                default: return data.cpruAffiliation || '-';
              }
            })()}</p>
            ${data.otherContact ? `<p><strong>ช่องทางติดต่ออื่น:</strong> ${data.otherContact}</p>` : ''}
            <p><strong>ประสบการณ์:</strong> ${data.experience}</p>
            <p><strong>ช่องทางที่รู้จักการอบรม:</strong> ${(() => {
              switch(data.howDidYouHear) {
                case 'organizer': return 'ผู้จัดงาน / ผู้ดูแลโครงการ';
                case 'friend': return 'เพื่อน / คนรู้จักแชร์โพสต์';
                case 'website': return 'เพจอื่น ๆ / เว็บไซต์ข่าวสาร';
                case 'line': return 'Line Group';
                case 'google': return 'ค้นหาจาก Google';
                case 'other': return 'ช่องทางอื่น ๆ';
                default: return data.howDidYouHear || '-';
              }
            })()}</p>
            <p><strong>หัวข้อที่สนใจ:</strong> ${data.topics}</p>
            ${data.additionalFeedback ? `<p><strong>ข้อเสนอแนะเพิ่มเติม:</strong> ${data.additionalFeedback}</p>` : ''}
          </div>

          <div class="info-box" style="background: #e8f5e8; border-left: 4px solid #28a745;">
            <h3>🎯 รายละเอียดการอบรม</h3>
            <p><strong>📅 วันที่:</strong> ${CONFIG.WORKSHOP_INFO.date}</p>
            <p><strong>⏰ เวลา:</strong> ${CONFIG.WORKSHOP_INFO.time}</p>
            <p><strong>📍 รูปแบบ:</strong> ${CONFIG.WORKSHOP_INFO.format}</p>
          </div>

          <div class="info-box" style="background: #fff3cd; border-left: 4px solid #ffc107;">
            <h3>🔗 ลิงก์เข้าร่วมการอบรม</h3>
            <p><strong>Zoom Meeting:</strong></p>
            <p style="background: #f8f9fa; padding: 15px; border-radius: 5px; font-family: monospace;">
              <strong>Meeting ID:</strong> ${CONFIG.WORKSHOP_INFO.zoom.meetingId}<br>
              <strong>Passcode:</strong> ${CONFIG.WORKSHOP_INFO.zoom.passcode}<br>
              <strong>Link:</strong> <a href="${CONFIG.WORKSHOP_INFO.zoom.url}" style="color: #667eea; text-decoration: none;">${CONFIG.WORKSHOP_INFO.zoom.url}</a>
            </p>
            <p style="color: #856404; font-size: 14px;">
              💡 <strong>หมายเหตุ:</strong> กรุณาเข้าร่วมก่อนเวลาอบรม 5-10 นาที
            </p>
          </div>
          
          <div class="info-box">
            <h3>📋 สิ่งที่ควรเตรียมตัว</h3>
            <ul>
              <li>💻 คอมพิวเตอร์หรือแล็ปท็อปที่มีอินเทอร์เน็ตเสถียร</li>
              <li>🎧 หูฟังหรือลำโพงสำหรับฟังเสียง</li>
              <li>📝 สมุดจดบันทึกหรือแอปพลิเคชันจดบันทึก</li>
              <li>☕ เครื่องดื่มและขนมเบาๆ สำหรับพักเบรก ^^</li>
            </ul>
          </div>

          <p><strong>📞 ติดต่อสอบถาม:</strong></p>
          <ul>
            <li>📧 อีเมล: ${CONFIG.WORKSHOP_INFO.contact.email}</li>
            <li>📱 Line ID: ${CONFIG.WORKSHOP_INFO.contact.lineId}</li>
            <li>💬 Facebook Messenger: <a href="https://m.me/narasakp" style="color: #667eea; text-decoration: none;" target="_blank">facebook.com/narasakp</a></li>
          </ul>
          
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

// Get registration count
function getRegistrationCount() {
  try {
    console.log('Getting registration count...');
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    
    // ตรวจสอบว่า Spreadsheet พร้อมใช้งาน
    if (!spreadsheet) {
      console.error('ไม่พบ Spreadsheet ที่ระบุ');
      return 0;
    }
    
    const sheet = spreadsheet.getActiveSheet();
    
    // ตรวจสอบว่า Sheet พร้อมใช้งาน
    if (!sheet) {
      console.error('ไม่พบ Sheet ที่ระบุ');
      return 0;
    }
    
    const lastRow = sheet.getLastRow();
    // หัก 1 สำหรับ header row ถ้ามีข้อมูล
    const count = lastRow > 1 ? lastRow - 1 : 0;
    
    console.log('จำนวนแถวทั้งหมด:', lastRow);
    console.log('จำนวนผู้ลงทะเบียน (ไม่รวมหัวข้อ):', count);
    
    return count;
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการนับผู้ลงทะเบียน:', error);
    return 0; // คืนค่า 0 แทนการ throw error
  }
}

// API endpoint for dashboard
function doGet(e) {
  const action = e.parameter.action;
  let response;
  
  try {
    if (action === 'stats') {
      const stats = getRegistrationStats();
      response = ContentService.createTextOutput(JSON.stringify(stats));
    } 
    else if (action === 'count') {
      const count = getRegistrationCount();
      response = ContentService.createTextOutput(JSON.stringify({ count }));
    }
    else {
      response = ContentService.createTextOutput(
        JSON.stringify({ error: 'Invalid action' })
      );
    }
    
    // Set common headers for all responses
    return response
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        'Access-Control-Allow-Credentials': 'true',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ 
        error: error.toString(),
        message: error.message 
      }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
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
