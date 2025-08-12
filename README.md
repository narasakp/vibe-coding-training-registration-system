# โครงการอบรม การใช้ AI เขียนโค้ด - ระบบลงทะเบียน

ระบบลงทะเบียนอบรมออนไลน์สำหรับหัวข้อ Vibe Coding, Spec-Driven Development, และ Context Engineering

## ✨ คุณสมบัติหลัก

### 🎯 คุณสมบัติพื้นฐาน
- 🎨 **UI สวยงาม** - ดีไซน์เรียบง่าย สะอาดตา ตามแบบระบบเดิม
- 📱 **Responsive Design** - ใช้งานได้ทุกอุปกรณ์
- ✅ **Real-time Validation** - ตรวจสอบข้อมูลทันที
- 🌸 **Falling Petals Animation** - เอฟเฟกต์กลีบดอกไม้ตกนุ่มนวล
- 📊 **Google Sheets Integration** - บันทึกข้อมูลลง Google Sheets
- 🎉 **Success Modal** - แสดงผลสำเร็จพร้อมเอฟเฟกต์

### 🚀 คุณสมบัติขั้นสูง (ใหม่!)
- 📧 **Email Confirmation อัตโนมัติ** - ส่งอีเมลยืนยันการลงทะเบียนแบบ HTML สวยงาม
- 📊 **Dashboard** - หน้าแดชบอร์ดสำหรับดูข้อมูลผู้ลงทะเบียนแบบ Real-time
- 📈 **Advanced Analytics** - การวิเคราะห์ข้อมูลเชิงลึกพร้อมกราฟและแนวโน้ม

## 🚀 การติดตั้งและใช้งาน

### 1. เปิดไฟล์ในเบราว์เซอร์
```bash
# เปิด index.html ในเบราว์เซอร์โดยตรง หรือ
# ใช้ local server
python -m http.server 8000
```

### 2. ตั้งค่า Google Sheets Integration

1. สร้าง Google Apps Script ใหม่
2. คัดลอกโค้ดด้านล่างไปใส่:

```javascript
function doPost(e) {
  try {
    const sheet = SpreadsheetApp.openById('YOUR_SPREADSHEET_ID').getActiveSheet();
    
    let data;
    if (e.postData && e.postData.contents) {
      // Handle JSON data
      data = JSON.parse(e.postData.contents);
    } else {
      // Handle form data
      data = e.parameter;
    }
    
    // Add headers if first row
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Timestamp', 'First Name', 'Last Name', 'Email', 'Phone', 
        'Organization', 'Position', 'Experience', 'Programming Languages', 
        'Expectations', 'Topics'
      ]);
    }
    
    // Add data row
    sheet.appendRow([
      data.timestamp || new Date().toLocaleString('th-TH'),
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
    
    return ContentService
      .createTextOutput(JSON.stringify({success: true}))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type'
      });
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({success: false, error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return doPost(e);
}
```

3. Deploy เป็น Web App
4. ตั้งค่า Execute as: "Me" และ Access: "Anyone, even anonymous"
5. คัดลอก URL และแทนที่ใน `script.js` ที่บรรทัด:
```javascript
const GOOGLE_SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';
```

## 📁 โครงสร้างไฟล์

```
training-registration-new/
├── index.html          # หน้าหลักของระบบ
├── styles.css          # ไฟล์ CSS สำหรับ styling
├── script.js           # ไฟล์ JavaScript สำหรับ functionality
└── README.md           # คู่มือการใช้งาน
```

## 🎯 ฟีเจอร์ที่รวมอยู่

### 1. หน้าแรก (Landing Page)
- โลโก้มหาวิทยาลัย
- ชื่อโครงการและรายละเอียด
- Topic Cards แบบ Interactive
- ข้อมูลวิทยากร
- รายละเอียดการอบรม

### 2. ฟอร์มลงทะเบียน
- **ข้อมูลส่วนตัว**: ชื่อ, นามสกุล, อีเมล, เพศ, อายุ
- **ข้อมูลติดต่อ**: เบอร์โทร, หน่วยงาน/สถาบัน, ตำแหน่ง/สถานะ, ความเกี่ยวข้องกับ CPRU, ช่องทางติดต่ออื่นๆ
- **ประสบการณ์**: ระดับประสบการณ์, ภาษาโปรแกรม, ความคาดหวัง
- **หัวข้อที่สนใจ**: เลือกได้หลายหัวข้อ

### 3. การตรวจสอบข้อมูล
- Real-time validation
- แสดงข้อผิดพลาดทันที
- ตรวจสอบรูปแบบอีเมลและเบอร์โทร

### 4. เอฟเฟกต์และ Animation
- Falling petals animation
- Hover effects บน cards
- Modal สำเร็จพร้อม confetti
- Smooth transitions

## 🎨 การปรับแต่ง

### เปลี่ยนสีธีม
แก้ไขใน `styles.css`:
```css
/* สีหลัก */
--primary-color: #3b82f6;
--secondary-color: #ef4444;
--accent-color: #f59e0b;
```

### เปลี่ยนเนื้อหา
แก้ไขใน `index.html`:
- ชื่อโครงการ
- รายละเอียดหัวข้อ
- ข้อมูลวิทยากร
- วันที่และเวลา

### เพิ่ม/ลดฟิลด์ฟอร์ม
1. เพิ่มฟิลด์ใน HTML
2. อัปเดต validation ใน `script.js`
3. เพิ่มคอลัมน์ใน Google Sheets

## 🔧 การแก้ไขปัญหา

### ปัญหา CORS
- ใช้ local server แทนการเปิดไฟล์โดยตรง
- ตรวจสอบการตั้งค่า Google Apps Script

### ข้อมูลไม่ถูกส่ง
- ตรวจสอบ URL ของ Google Apps Script
- ตรวจสอบ permission ของ Google Apps Script
- ดู console log ในเบราว์เซอร์

### แสดงผลไม่ถูกต้อง
- ตรวจสอบ CSS loading
- ตรวจสอบ JavaScript errors
- ใช้ Developer Tools

## 📱 Browser Support

- ✅ Chrome (แนะนำ)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ⚠️ IE11+ (บางฟีเจอร์อาจไม่ทำงาน)

## 🤝 การสนับสนุน

หากพบปัญหาหรือต้องการความช่วยเหลือ:
1. ตรวจสอบ console log ในเบราว์เซอร์
2. ตรวจสอบการตั้งค่า Google Apps Script
3. ทดสอบใน browser อื่น

## 📄 License

MIT License - ใช้งานได้อย่างอิสระ

---

**หมายเหตุ**: ระบบนี้สร้างขึ้นเพื่อทดแทนระบบเดิมที่เสียหายจากการ refactoring โดยมีหน้าตาและฟังก์ชันการทำงานเหมือนระบบเดิมมากที่สุด
