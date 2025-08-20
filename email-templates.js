// Email Templates and Rich Editor Functions

// Template and Editor Functions
function selectTemplate(templateType) {
    // Remove selected class from all options
    document.querySelectorAll('.template-option').forEach(opt => {
        opt.classList.remove('selected');
    });
    
    // Add selected class to clicked option
    event.target.closest('.template-option').classList.add('selected');
    
    currentTemplate = templateType;
    loadDefaultTemplate();
}

function switchEditorMode(mode) {
    // Update button states
    document.querySelectorAll('.mode-button').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Hide all editor groups
    document.getElementById('richEditorGroup').style.display = 'none';
    document.getElementById('htmlEditorGroup').style.display = 'none';
    document.getElementById('previewGroup').style.display = 'none';
    
    currentEditorMode = mode;
    
    switch(mode) {
        case 'rich':
            document.getElementById('richEditorGroup').style.display = 'block';
            break;
        case 'html':
            document.getElementById('htmlEditorGroup').style.display = 'block';
            syncEditorContent();
            break;
        case 'preview':
            document.getElementById('previewGroup').style.display = 'block';
            updatePreview();
            break;
    }
}

function syncEditorContent() {
    if (!quill) return;
    
    const htmlContent = quill.root.innerHTML;
    document.getElementById('emailBodyHTML').value = htmlContent;
}

function updatePreview() {
    let htmlContent = '';
    
    if (currentEditorMode === 'rich' && quill) {
        htmlContent = quill.root.innerHTML;
    } else {
        htmlContent = document.getElementById('emailBodyHTML').value;
    }
    
    // Personalize for preview
    const personalizedContent = htmlContent.replace(/\[ชื่อ\]/g, 'คุณตัวอย่าง');
    
    document.getElementById('emailPreview').innerHTML = personalizedContent;
}

function previewEmail() {
    switchEditorMode('preview');
    // Update the mode button to show preview is active
    document.querySelectorAll('.mode-button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector('.mode-button[onclick*="preview"]').classList.add('active');
}

function testSendEmail() {
    const subject = document.getElementById('emailSubject').value;
    let htmlContent = '';
    
    if (currentEditorMode === 'rich' && quill) {
        htmlContent = quill.root.innerHTML;
    } else {
        htmlContent = document.getElementById('emailBodyHTML').value;
    }
    
    // Open Gmail compose with the content
    const testEmail = 'your-email@gmail.com'; // Replace with actual test email
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${testEmail}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(htmlContent)}`;
    window.open(gmailUrl, '_blank');
    
    addLogEntry('เปิด Gmail สำหรับทดสอบส่งอีเมล', 'info');
}

// Get template name in Thai
function getTemplateName(templateType) {
    switch(templateType) {
        case 'professional': return 'มืออาชีพ';
        case 'modern': return 'โมเดิร์น';
        case 'minimal': return 'มินิมอล';
        default: return 'มืออาชีพ';
    }
}

// Professional Template
function getProfessionalTemplate() {
    return `
    <div style="max-width: 600px; margin: 0 auto; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #ffffff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">🚀 เชิญร่วมอบรมพิเศษ</h1>
            <p style="color: #f0f4ff; margin: 10px 0 0 0; font-size: 18px;">Vibe Coding, Spec-Driven Development & Context Engineering</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 30px; background: white; border: 1px solid #e1e5e9; border-top: none;">
            <p style="font-size: 16px; line-height: 1.6; color: #333; margin-bottom: 20px;">เรียน คุณ <strong>[ชื่อ]</strong></p>
            
            <p style="font-size: 16px; line-height: 1.6; color: #333; margin-bottom: 25px;">สวัสดีครับ</p>
            
            <p style="font-size: 16px; line-height: 1.6; color: #333; margin-bottom: 25px;">ขอเชิญท่านเข้าร่วมหลักสูตรอบรมพิเศษ <strong>"การสอนเขียนโค้ดในยุค AI: คู่มือสำหรับอาจารย์"</strong> ที่จะช่วยยกระดับการสอนของท่านในยุคดิจิทัล และเตรียมพร้อมสำหรับอนาคตของการศึกษา</p>
            
            <!-- Event Details -->
            <div style="background: #f8f9fa; padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 4px solid #667eea;">
                <h2 style="color: #333; margin: 0 0 15px 0; font-size: 20px;">📋 รายละเอียดการอบรม</h2>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr><td style="padding: 8px 0; font-weight: 600; color: #555; width: 120px;">📅 วันที่:</td><td style="padding: 8px 0; color: #333;">เสาร์ที่ 16 สิงหาคม 2568</td></tr>
                    <tr><td style="padding: 8px 0; font-weight: 600; color: #555;">⏰ เวลา:</td><td style="padding: 8px 0; color: #333;">09:00 - 16:00 น. (7 ชั่วโมงเต็ม)</td></tr>
                    <tr><td style="padding: 8px 0; font-weight: 600; color: #555;">📍 สถานที่:</td><td style="padding: 8px 0; color: #333;">มหาวิทยาลัยราชภัฏชัยภูมิ</td></tr>
                    <tr><td style="padding: 8px 0; font-weight: 600; color: #555;">👥 กลุ่มเป้าหมาย:</td><td style="padding: 8px 0; color: #333;">ผู้สนใจทั่วไป ครู นักเรียนอาจารย์ นักศึกษา นักพัฒนา</td></tr>
                    <tr><td style="padding: 8px 0; font-weight: 600; color: #555;">💰 ค่าลงทะเบียน:</td><td style="padding: 8px 0; color: #27ae60; font-weight: 600;">ฟรี!</td></tr>
                </table>
            </div>
            
            <!-- Course Topics -->
            <div style="margin: 25px 0;">
                <h3 style="color: #333; margin-bottom: 15px; font-size: 18px;">📚 หัวข้อที่จะเรียนรู้:</h3>
                <div style="display: grid; gap: 12px;">
                    <div style="background: #f0f4ff; padding: 15px; border-radius: 8px; border-left: 3px solid #667eea;">
                        <h4 style="margin: 0 0 8px 0; color: #333; font-size: 16px;">🎯 Vibe Coding</h4>
                        <p style="margin: 0; color: #666; font-size: 14px;">การเขียนโค้ดที่เน้นความรู้สึกและประสบการณ์ผู้ใช้</p>
                    </div>
                    <div style="background: #f0fff4; padding: 15px; border-radius: 8px; border-left: 3px solid #27ae60;">
                        <h4 style="margin: 0 0 8px 0; color: #333; font-size: 16px;">📋 Spec-Driven Development</h4>
                        <p style="margin: 0; color: #666; font-size: 14px;">การพัฒนาซอฟต์แวร์โดยใช้ Specification เป็นหลัก</p>
                    </div>
                    <div style="background: #fff5f5; padding: 15px; border-radius: 8px; border-left: 3px solid #e74c3c;">
                        <h4 style="margin: 0 0 8px 0; color: #333; font-size: 16px;">🤖 Context Engineering</h4>
                        <p style="margin: 0; color: #666; font-size: 14px;">การออกแบบและจัดการ Context สำหรับ AI</p>
                    </div>
                </div>
            </div>
            
            <!-- Benefits -->
            <div style="margin: 25px 0;">
                <h3 style="color: #333; margin-bottom: 15px; font-size: 18px;">🎁 สิ่งที่ท่านจะได้รับ:</h3>
                <ul style="list-style: none; padding: 0; margin: 0;">
                    <li style="padding: 8px 0; color: #333; font-size: 15px;">✅ เทคนิคการสอนเขียนโค้ดด้วย AI Tools</li>
                    <li style="padding: 8px 0; color: #333; font-size: 15px;">✅ กรอบการคิด Spec-Driven Development</li>
                    <li style="padding: 8px 0; color: #333; font-size: 15px;">✅ Workshop Context Engineering ปฏิบัติจริง</li>
                    <li style="padding: 8px 0; color: #333; font-size: 15px;">✅ เอกสาร "การสอนเขียนโค้ดในยุค AI" (PDF + Word)</li>
                    <li style="padding: 8px 0; color: #333; font-size: 15px;">✅ Certificate of Completion จาก มรจ.</li>
                    <li style="padding: 8px 0; color: #333; font-size: 15px;">✅ เครือข่ายอาจารย์ผู้สอนเขียนโปรแกรม</li>
                </ul>
            </div>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 30px 0;">
                <a href="https://narasakp.github.io/vibe-coding-training-registration-system/" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);">📝 ลงทะเบียนเลย</a>
            </div>
            
            <!-- Urgency Box -->
            <div style="background: #fff3cd; padding: 20px; border-radius: 8px; border: 1px solid #ffeaa7; margin: 20px 0;">
                <p style="margin: 0; color: #856404; font-size: 14px; text-align: center;">⚡ <strong>จำนวนที่รับ: จำกัด 500 ท่าน</strong> ⚡<br>ปัจจุบันมีผู้ลงทะเบียนแล้ว <strong>6 ท่าน</strong> - เหลืออีก <strong>494 ที่นั่ง</strong><br>กรุณาลงทะเบียนโดยเร็วที่สุด เนื่องจากที่นั่งมีจำกัด</p>
            </div>
            
            <!-- Contact Info -->
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h4 style="margin: 0 0 10px 0; color: #333; font-size: 16px; text-align: center;">📞 ติดต่อสอบถาม</h4>
                <p style="margin: 0; color: #666; font-size: 14px; text-align: center;">
                    📧 Email: <a href="mailto:info@cpru.ac.th" style="color: #667eea;">info@cpru.ac.th</a><br>
                    🌐 Website: <a href="https://narasakp.github.io/vibe-coding-training-registration-system/" style="color: #667eea;">ระบบลงทะเบียน</a>
                </p>
            </div>
        </div>
        
        <!-- Footer -->
        <div style="background: #f8f9fa; padding: 25px 30px; border-radius: 0 0 10px 10px; border: 1px solid #e1e5e9; border-top: none;">
            <div style="text-align: center; padding-top: 15px; border-top: 1px solid #e1e5e9;">
                <p style="margin: 0; color: #333; font-weight: 600;">ทีมงานหลักสูตรอบรม "การสอนเขียนโค้ดในยุค AI"</p>
                <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">มหาวิทยาลัยราชภัฏจันทรเกษม (CPRU)</p>
                <p style="margin: 10px 0 0 0; color: #999; font-size: 12px;">© 2025 Chandrakasem Rajabhat University. All rights reserved.</p>
            </div>
        </div>
    </div>
    `;
}

// Modern Template
function getModernTemplate() {
    return `
    <div style="max-width: 600px; margin: 0 auto; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #ffffff;">
        <!-- Header -->
        <div style="background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4); background-size: 400% 400%; padding: 50px 30px; text-align: center; position: relative; overflow: hidden;">
            <div style="position: relative; z-index: 2;">
                <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 700; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">🚀 AI Coding Workshop</h1>
                <p style="color: white; margin: 15px 0 0 0; font-size: 18px; opacity: 0.95;">ปฏิวัติการเขียนโค้ดในยุค AI</p>
            </div>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px; background: white;">
        
            <p style="font-size: 16px; line-height: 1.8; color: #444; margin-bottom: 25px; text-align: center;">ขอเรียนเชิญ เข้าร่วมอบรมออนไลน์ ฟรี! </p>
            <p style="font-size: 16px; line-height: 1.8; color: #444; margin-bottom: 25px; text-align: center;">มาร่วมเรียนรู้เทคนิคการเขียนโค้ดด้วย AI ที่ทันสมัยที่สุด! 🌟</p>
            
            <!-- Course Highlights -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 20px; margin: 30px 0;">
                <div style="background: linear-gradient(135deg, #667eea, #764ba2); padding: 20px; border-radius: 15px; text-align: center; color: white;">
                    <div style="font-size: 32px; margin-bottom: 10px;">🎯</div>
                    <h4 style="margin: 0; font-size: 14px;">Vibe Coding</h4>
                </div>
                <div style="background: linear-gradient(135deg, #4ecdc4, #44a08d); padding: 20px; border-radius: 15px; text-align: center; color: white;">
                    <div style="font-size: 32px; margin-bottom: 10px;">📋</div>
                    <h4 style="margin: 0; font-size: 14px;">Spec-Driven Development</h4>
                </div>
                <div style="background: linear-gradient(135deg, #ff6b6b, #ee5a52); padding: 20px; border-radius: 15px; text-align: center; color: white;">
                    <div style="font-size: 32px; margin-bottom: 10px;">🤖</div>
                    <h4 style="margin: 0; font-size: 14px;">Context Engineering</h4>
                </div>
            </div>
            
            <!-- Event Card -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 20px; margin: 30px 0; color: white; box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);">
                <h3 style="margin: 0 0 20px 0; font-size: 20px; text-align: center;">🎯 รายละเอียดการอบรม</h3>
                <div style="display: grid; gap: 15px;">
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <span style="font-size: 24px;">📅</span>
                        <div><strong>วันที่:</strong> วันเสาร์ ที่ 16 สิงหาคม 2568</div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <span style="font-size: 24px;">⏰</span>
                        <div><strong>เวลา:</strong> 09:00 - 16:00 น. (7 ชั่วโมงเต็ม)</div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <span style="font-size: 24px;">📍</span>
                        <div><strong>รูปแบบ:</strong> ออนไลน์ ผ่านโปรแกรม Zoom</div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <span style="font-size: 24px;">👥</span>
                        <div><strong>เป้าหมาย:</strong> ผู้สนใจทั่วไป ครู นักเรียน อาจารย์ นักศึกษา นักพัฒนา</div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <span style="font-size: 24px;">💰</span>
                        <div><strong>ค่าลงทะเบียน:</strong> <span style="background: #27ae60; padding: 5px 10px; border-radius: 15px; font-weight: 700;">ฟรี!</span></div>
                    </div>
                </div>
            </div>
            
            <!-- What You'll Get -->
            <div style="background: #f8f9ff; padding: 25px; border-radius: 15px; margin: 25px 0;">
                <h3 style="color: #333; margin: 0 0 15px 0; font-size: 18px; text-align: center;">🎁 สิ่งที่คุณจะได้รับ</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="color: #27ae60; font-size: 18px;">✅</span>
                        <span style="color: #333; font-size: 14px;">เทคนิคการเขียนโค้ดด้วย AI Tools</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="color: #27ae60; font-size: 18px;">✅</span>
                        <span style="color: #333; font-size: 14px;">Workshop ปฏิบัติจริง</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="color: #27ae60; font-size: 18px;">✅</span>
                        <span style="color: #333; font-size: 14px;">Community Access - เข้ากลุ่ม LINE เพื่อแลกเปลี่ยน</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="color: #27ae60; font-size: 18px;">✅</span>
                        <span style="color: #333; font-size: 14px;">Video Recording - บันทึกการอบรมเก็บไว้ดูซ้ำไม่จำกัดรอบ</span>
                    </div>
                </div>
            </div>
            
            <!-- CTA -->
            <div style="text-align: center; margin: 40px 0;">
                <a href="https://narasakp.github.io/vibe-coding-training-registration-system/" style="background: linear-gradient(45deg, #ff6b6b, #4ecdc4); color: white; padding: 18px 40px; text-decoration: none; border-radius: 50px; font-weight: 700; font-size: 18px; display: inline-block; box-shadow: 0 5px 15px rgba(255, 107, 107, 0.4); transition: transform 0.3s;">🚀 ลงทะเบียนตอนนี้</a>
            </div>
            
            <div style="background: linear-gradient(135deg, #ffeaa7, #fab1a0); padding: 20px; border-radius: 15px; text-align: center; margin: 25px 0;">
                <p style="margin: 0; color: #2d3436; font-weight: 600;">⚡ จำกัดจำนวนผู้เข้าอบรม ⚡</p>
            </div>
        </div>
        
        <!-- Footer -->
        <div style="background: #2d3436; color: white; padding: 30px; text-align: center; border-radius: 0 0 20px 20px;">
            <p style="margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">ทีมงานหลักสูตรอบรม "การใช้ AI เขียนโค้ด" 🤖</p>
            <p style="margin: 0; opacity: 0.8; font-size: 14px;">มหาวิทยาลัยราชภัฏชัยภูมิ (CPRU)</p>
            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #636e72;">
                <p style="margin: 0; font-size: 14px; opacity: 0.7;">📧 narasak@cpru.ac.th | 🌐 <a href="https://narasakp.github.io/vibe-coding-training-registration-system/" style="color: #4ecdc4;">ระบบลงทะเบียน</a></p>
            </div>
        </div>
    </div>
    `;
}

// Minimal Template
function getMinimalTemplate() {
    return `
    <div style="max-width: 600px; margin: 0 auto; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #ffffff; line-height: 1.6;">
        <div style="padding: 40px 30px;">
            <h1 style="color: #333; margin: 0 0 30px 0; font-size: 28px; font-weight: 300; text-align: center; border-bottom: 2px solid #667eea; padding-bottom: 20px;">การใช้ AI เขียนโค้ด</h1>
            
            <p style="font-size: 16px; color: #555; margin-bottom: 25px;">เรียน คุณ <strong>[ชื่อ]</strong></p>
            
            <p style="font-size: 16px; color: #555; margin-bottom: 25px;">เชิญร่วมหลักสูตรอบรม <strong>"การสอนเขียนโค้ดในยุค AI: คู่มือสำหรับอาจารย์"</strong> ที่จะเปลี่ยนวิธีการสอนของคุณด้วยเทคโนโลยี AI และแนวคิดใหม่ๆ</p>
            
            <!-- Course Topics -->
            <div style="background: #f8f9fa; padding: 25px; margin: 25px 0; border-left: 4px solid #667eea;">
                <h3 style="margin: 0 0 15px 0; font-size: 16px; color: #333; font-weight: 500;">หัวข้อหลัก</h3>
                <ul style="margin: 0; padding-left: 20px; color: #555;">
                    <li style="margin-bottom: 8px;">🎯 Vibe Coding - การเขียนโค้ดที่เน้นประสบการณ์ผู้ใช้</li>
                    <li style="margin-bottom: 8px;">📋 Spec-Driven Development - การพัฒนาโดยใช้ Specification</li>
                    <li style="margin-bottom: 8px;">🤖 Context Engineering - การออกแบบ Context สำหรับ AI</li>
                </ul>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; margin: 30px 0; border-left: 4px solid #667eea;">
                <h2 style="margin: 0 0 20px 0; font-size: 18px; color: #333; font-weight: 500;">รายละเอียดการอบรม</h2>
                <p style="margin: 8px 0; color: #555;"><strong>วันที่:</strong> เสาร์ที่ 16 สิงหาคม 2568</p>
                <p style="margin: 8px 0; color: #555;"><strong>เวลา:</strong> 09:00 - 16:00 น. (7 ชั่วโมงเต็ม)</p>
                <p style="margin: 8px 0; color: #555;"><strong>สถานที่:</strong> มหาวิทยาลัยราชภัฏจันทรเกษม</p>
                <p style="margin: 8px 0; color: #555;"><strong>กลุ่มเป้าหมาย:</strong> ผู้สนใจทั่วไป ครู นักเรียน อาจารย์ นักศึกษา นักพัฒนา</p>
                <p style="margin: 8px 0; color: #27ae60; font-weight: 600;"><strong>ค่าลงทะเบียน:</strong> ฟรี! </p>
            </div>
            
            <!-- What You'll Get -->
            <div style="margin: 25px 0;">
                <h3 style="color: #333; margin-bottom: 15px; font-size: 16px; font-weight: 500;">สิ่งที่จะได้รับ</h3>
                <ul style="color: #555; padding-left: 20px; margin: 0;">
                    <li style="margin-bottom: 8px;">เทคนิคการสอนเขียนโค้ดด้วย AI Tools</li>
                    <li style="margin-bottom: 8px;">กรอบการคิด Spec-Driven Development</li>
                    <li style="margin-bottom: 8px;">Workshop Context Engineering ปฏิบัติจริง</li>
                    <li style="margin-bottom: 8px;">เอกสาร "การสอนเขียนโค้ดในยุค AI" (PDF + Word)</li>
                    <li style="margin-bottom: 8px;">Certificate of Completion จาก มรจ.</li>
                    <li style="margin-bottom: 8px;">เครือข่ายอาจารย์ผู้สอนเขียนโปรแกรม</li>
                </ul>
            </div>
            
            <div style="text-align: center; margin: 40px 0;">
                <a href="https://narasakp.github.io/vibe-coding-training-registration-system/" style="color: #667eea; text-decoration: none; font-weight: 600; font-size: 16px; border: 2px solid #667eea; padding: 12px 30px; border-radius: 4px; display: inline-block; transition: all 0.3s;">ลงทะเบียนเลย</a>
            </div>
            
            <div style="background: #fff3cd; padding: 20px; border-radius: 4px; margin: 25px 0; text-align: center;">
                <p style="margin: 0; color: #856404; font-size: 14px;"><strong>จำนวนที่รับ: จำกัด 500 ท่าน</strong><br>ปัจจุบันลงทะเบียนแล้ว 6 ท่าน - เหลืออีก 494 ที่นั่ง</p>
            </div>
            
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e1e5e9; text-align: center;">
                <p style="margin: 0 0 5px 0; color: #333; font-weight: 500;">ทีมงานหลักสูตรอบรม "การสอนเขียนโค้ดในยุค AI"</p>
                <p style="margin: 0; color: #666; font-size: 14px;">มหาวิทยาลัยราชภัฏจันทรเกษม (CPRU)</p>
                <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">📧 info@cpru.ac.th | 🌐 <a href="https://narasakp.github.io/vibe-coding-training-registration-system/" style="color: #667eea;">ระบบลงทะเบียน</a></p>
            </div>
        </div>
    </div>
    `;
}

// Update loadDefaultTemplate function
function loadDefaultTemplate() {
    let htmlContent = '';
    
    switch(currentTemplate) {
        case 'professional':
            htmlContent = getProfessionalTemplate();
            break;
        case 'modern':
            htmlContent = getModernTemplate();
            break;
        case 'minimal':
            htmlContent = getMinimalTemplate();
            break;
        default:
            htmlContent = getProfessionalTemplate();
    }
    
    // Set content in Rich Text Editor
    if (quill) {
        quill.root.innerHTML = htmlContent;
    }
    
    // Sync to HTML editor
    syncEditorContent();
    
    addLogEntry(`โหลดเทมเพลต ${getTemplateName(currentTemplate)} เรียบร้อย`, 'info');
}

// Test send email function
function testSendEmail() {
    try {
        console.log('🚀 เริ่มทดสอบส่งอีเมล...');
        
        const subject = document.getElementById('emailSubject').value;
        console.log('📧 หัวข้อ:', subject);
        
        // Get test email from email list
        const emailListText = document.getElementById('emailList').value;
        const emails = parseEmailList(emailListText);
        const validEmails = emails.filter(email => isValidEmail(email));
        const testEmail = validEmails.length > 0 ? validEmails[0] : '';
        
        let body = '';
        
        // Always use template directly for test email
        console.log('📝 โหลดเทมเพลตปัจจุบัน:', currentTemplate);
        switch(currentTemplate) {
            case 'professional':
                body = getProfessionalTemplate();
                break;
            case 'modern':
                body = getModernTemplate();
                break;
            case 'minimal':
                body = getMinimalTemplate();
                break;
            default:
                body = getProfessionalTemplate();
        }
        
        console.log('📄 เนื้อหา (ความยาว):', body.length);
        
        // Replace placeholder with sample name
        body = body.replace(/\[ชื่อ\]/g, 'คุณทดสอบ');
        
        // Create a simplified text version for Gmail
        let finalBody = '';
        if (body.includes('AI Coding Workshop')) {
            // Modern template
            finalBody = `🚀 AI Coding Workshop
ปฏิวัติการเขียนโค้ดในยุค AI

ขอเรียนเชิญ เข้าร่วมอบรมออนไลน์ ฟรี!
มาร่วมเรียนรู้เทคนิคการเขียนโค้ดด้วย AI ที่ทันสมัยที่สุด! 🌟

📅 วันที่: เสาร์ที่ 16 สิงหาคม 2568
⏰ เวลา: 09:00 - 16:00 น. (7 ชั่วโมงเต็ม)
📍 รูปแบบ: ออนไลน์ ผ่านโปรแกรม Zoom
👥 เป้าหมาย: ผู้สนใจทั่วไป ครู นักเรียน อาจารย์ นักศึกษา นักพัฒนา
💰 ค่าลงทะเบียน: ฟรี!

🎁 สิ่งที่คุณจะได้รับ:
✅ เทคนิคการเขียนโค้ดด้วย AI Tools
✅ Workshop ปฏิบัติจริง
✅ Community Access - เข้ากลุ่ม LINE เพื่อแลกเปลี่ยน
✅ Video Recording - บันทึกการอบรมเก็บไว้ดูซ้ำไม่จำกัดรอบ

🔗 ลงทะเบียน: https://narasakp.github.io/vibe-coding-training-registration-system/

ทีมงานหลักสูตรอบรม "การใช้ AI เขียนโค้ด" 🤖
มหาวิทยาลัยราชภัฏชัยภูมิ (CPRU)
📧 narasak@cpru.ac.th`;
        } else {
            // Convert HTML to plain text as fallback
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = body;
            finalBody = tempDiv.textContent || tempDiv.innerText || '';
        }
        
        // Limit body length to prevent URL too long error
        if (finalBody.length > 2000) {
            finalBody = finalBody.substring(0, 2000) + '\n\n... (เนื้อหาถูกตัดเนื่องจากยาวเกินไป)';
            console.log('⚠️ ตัดเนื้อหาเนื่องจากยาวเกินไป');
        }
        
        console.log('📝 เนื้อหาสุดท้าย (ความยาว):', finalBody.length);
        console.log('📝 ตัวอย่างเนื้อหา:', finalBody.substring(0, 100) + '...');
        
        // Create Gmail compose URL
        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(testEmail)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(finalBody)}`;
        console.log('🔗 Gmail URL Length:', gmailUrl.length);
        console.log('📧 ผู้รับ:', testEmail);
        
        // Open Gmail compose in new tab
        const newWindow = window.open(gmailUrl, '_blank');
        
        if (newWindow) {
            console.log('✅ เปิด Gmail สำเร็จ');
            addLogEntry(`✅ เปิด Gmail Compose สำเร็จ (ผู้รับ: ${testEmail})`, 'success');
        } else {
            console.log('❌ ไม่สามารถเปิด Gmail ได้ (Pop-up blocked?)');
            addLogEntry('❌ ไม่สามารถเปิด Gmail ได้ - กรุณาอนุญาต Pop-up', 'error');
            
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(gmailUrl).then(() => {
                addLogEntry('📋 คัดลอก Gmail URL ไปยัง Clipboard แล้ว', 'info');
                alert('Gmail URL ถูกคัดลอกไปยัง Clipboard แล้ว\nกรุณาเปิดเบราว์เซอร์ใหม่และ Paste URL');
            }).catch(() => {
                addLogEntry('❌ ไม่สามารถคัดลอกไปยัง Clipboard ได้', 'error');
            });
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
        addLogEntry(`❌ เกิดข้อผิดพลาด: ${error.message}`, 'error');
    }
}
