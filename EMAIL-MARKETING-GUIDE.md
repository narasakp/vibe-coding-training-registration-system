# 📧 คู่มือการใช้งาน Email Marketing System

## 🎯 ภาพรวมระบบ

ระบบ Email Marketing นี้ถูกออกแบบมาเพื่อส่งอีเมลประชาสัมพันธ์หลักสูตรอบรมให้กับรายชื่อ 500 อีเมล โดยรองรับขีดจำกัดของ Gmail และมีฟีเจอร์ส่งเป็นแบทช์

## 🚀 ฟีเจอร์หลัก

### ✅ การจัดการรายชื่ออีเมล
- รองรับการใส่อีเมลหลายรูปแบบ (แยกด้วย Enter, Comma, Semicolon)
- ตรวจสอบความถูกต้องของรูปแบบอีเมลอัตโนมัติ
- แสดงสถิติอีเมล (ทั้งหมด/ถูกต้อง/ผิด)
- โหลดตัวอย่างอีเมลสำหรับทดสอบ

### ✅ เทมเพลตอีเมล
- เทมเพลตเริ่มต้นสำหรับหลักสูตรอบรม AI
- รองรับการปรับแต่งหัวข้อและเนื้อหา
- ระบบ Personalization (แทนที่ [ชื่อ] ด้วยชื่อจากอีเมล)

### ✅ ตัวเลือกการส่ง
- **ส่งทั้งหมดทีเดียว**: ส่งอีเมลทั้งหมดในครั้งเดียว
- **ส่งเป็นแบทช์**: แบ่งส่งเป็นกลุ่มย่อย มีช่วงพักระหว่างการส่ง

### ✅ ติดตามความคืบหน้า
- Progress bar แสดงสถานะการส่ง
- Log แสดงรายละเอียดการส่งแต่ละอีเมล
- สถิติการส่งสำเร็จ/ไม่สำเร็จ

## 📋 ขั้นตอนการใช้งาน

### 1. เตรียมรายชื่ออีเมล
```
teacher1@university.ac.th
professor.smith@edu.th
admin@school.ac.th
```

### 2. ปรับแต่งเทมเพลต
- แก้ไขหัวข้ออีเมล
- ปรับเนื้อหาให้เหมาะสม
- ใช้ [ชื่อ] สำหรับ personalization

### 3. เลือกวิธีการส่ง
- **ทั้งหมดทีเดียว**: เหมาะสำหรับรายชื่อน้อย (<100)
- **แบทช์**: เหมาะสำหรับรายชื่อมาก (>100)

### 4. กำหนดค่าแบทช์ (ถ้าเลือกแบทช์)
- ส่งครั้งละ: 50-100 อีเมล
- พักระหว่างการส่ง: 60-120 วินาที

### 5. เริ่มส่งอีเมล
- คลิก "เริ่มส่งอีเมล"
- ติดตามความคืบหน้าใน Progress section

## ⚠️ ข้อจำกัดของ Gmail

### Gmail Account ธรรมดา
- **500 อีเมล/วัน**
- **100 ผู้รับต่ออีเมล**

### Gmail Workspace
- **2,000 อีเมล/วัน**
- **500 ผู้รับต่ออีเมล**

### คำแนะนำ
- ส่งเป็นแบทช์ ครั้งละ 50-100 อีเมล
- มีช่วงพัก 1-2 นาทีระหว่างแบทช์
- หลีกเลี่ยงการส่งอีเมลจำนวนมากในเวลาเดียวกัน

## 🔧 การติดตั้งและใช้งาน Google Apps Script

### 1. สร้าง Google Apps Script Project
1. ไปที่ [script.google.com](https://script.google.com)
2. คลิก "New Project"
3. ลบโค้ดเริ่มต้น แล้วคัดลอกโค้ดจาก `email-marketing-apps-script.js`

### 2. ตั้งค่า Permissions
1. รันฟังก์ชัน `setupPermissions()`
2. อนุญาต permissions สำหรับ Gmail, Drive, Sheets

### 3. Deploy เป็น Web App
1. คลิก "Deploy" > "New deployment"
2. เลือก Type: "Web app"
3. Execute as: "Me"
4. Who has access: "Anyone"
5. คลิก "Deploy"
6. คัดลอก Web App URL

### 4. อัปเดต Frontend
แก้ไขไฟล์ `email-marketing.js` ให้ใช้ URL จริงแทน simulation:

```javascript
// แทนที่ฟังก์ชัน simulateEmailSend ด้วย:
async function sendEmailViaGoogleAppsScript(emails, subject, body, batchMode, batchSize, batchDelay) {
    const WEB_APP_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';
    
    const response = await fetch(WEB_APP_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            action: 'sendEmails',
            emails: emails,
            subject: subject,
            body: body,
            batchMode: batchMode,
            batchSize: batchSize,
            batchDelay: batchDelay
        })
    });
    
    return await response.json();
}
```

## 🧪 การทดสอบ

### 1. ทดสอบ Google Apps Script
```javascript
// รันฟังก์ชันนี้ใน Apps Script Editor
testSendEmail();
```

### 2. ทดสอบ Frontend
1. เปิด `email-marketing.html` ในเบราว์เซอร์
2. ใส่อีเมลทดสอบ (อีเมลของคุณเอง)
3. ใช้เทมเพลตเริ่มต้น
4. เลือก "ส่งทั้งหมดทีเดียว"
5. คลิก "เริ่มส่งอีเมล"

## 📊 การติดตาม Log

ระบบจะสร้าง Google Spreadsheet ชื่อ "Email Marketing Logs" อัตโนมัติ เพื่อเก็บ:
- วันเวลาที่ส่ง
- จำนวนอีเมลทั้งหมด
- จำนวนที่ส่งสำเร็จ
- จำนวนที่ส่งไม่สำเร็จ
- อัตราความสำเร็จ

## 🔒 ความปลอดภัย

### Best Practices
- ใช้ Reply-to address ที่ถูกต้อง
- ตรวจสอบรายชื่ออีเมลก่อนส่ง
- หลีกเลี่ยงการส่งอีเมล Spam
- ใส่ข้อมูลการยกเลิกสมัครรับอีเมล

### การป้องกัน Spam
- ใช้หัวข้อที่ชัดเจน ไม่ใช้คำที่ดู Spam
- เนื้อหาต้องมีคุณค่า ไม่ใช่โฆษณาล้วนๆ
- มี Unsubscribe link
- ส่งจากอีเมลที่น่าเชื่อถือ

## 🚨 การแก้ไขปัญหา

### ปัญหาที่พบบ่อย

#### 1. Gmail API Error
```
Error: Gmail API not enabled
```
**วิธีแก้**: เปิดใช้งาน Gmail API ใน Google Cloud Console

#### 2. Permission Denied
```
Error: Insufficient permissions
```
**วิธีแก้**: รันฟังก์ชัน `setupPermissions()` และอนุญาต permissions

#### 3. Quota Exceeded
```
Error: Email quota exceeded
```
**วิธีแก้**: รอ 24 ชั่วโมง หรือใช้ Gmail Workspace

#### 4. CORS Error
```
Error: CORS policy blocked
```
**วิธีแก้**: ตรวจสอบ Web App deployment settings

### Debug Mode
เปิด Browser Developer Tools (F12) เพื่อดู console logs และ network requests

## 📞 การสนับสนุน

หากพบปัญหาหรือต้องการความช่วยเหลือ:
1. ตรวจสอบ console logs ใน browser
2. ตรวจสอบ execution logs ใน Google Apps Script
3. ตรวจสอบ Gmail quota ใน Google Admin Console (สำหรับ Workspace)

## 🎉 สรุป

ระบบ Email Marketing นี้ช่วยให้คุณสามารถ:
- ส่งอีเมลประชาสัมพันธ์ได้อย่างมีประสิทธิภาพ
- จัดการรายชื่อ 500 อีเมลได้อย่างง่ายดาย
- ปฏิบัติตามขีดจำกัดของ Gmail
- ติดตามผลการส่งแบบ Real-time

**ขอให้การประชาสัมพันธ์หลักสูตรอบรมของคุณประสบความสำเร็จ! 🚀**
