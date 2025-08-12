// Evaluation Form JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initializeEvaluationForm();
    createFallingPetals();
});

// Google Apps Script URL for evaluation form
const EVALUATION_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyIrPo2ADKVNmbBtq6_qgOoQrKiGpxy5bTSkqXZPQwBT8yMqUs5C7sunLPOU58EJ4awCw/exec';

function initializeEvaluationForm() {
    const form = document.getElementById('evaluationForm');
    if (!form) return;

    // Add form submission handler for direct POST submission
    form.addEventListener('submit', function(e) {
        // Validate form before submission
        if (!validateForm()) {
            e.preventDefault();
            return;
        }
        
        // Show loading state
        const submitBtn = form.querySelector('.submit-btn');
        if (submitBtn) {
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> กำลังส่งข้อมูล...';
            submitBtn.disabled = true;
            
            // Show progress messages
            setTimeout(() => {
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> กำลังประมวลผล...';
            }, 3000);
            
            setTimeout(() => {
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> กำลังบันทึกลง Google Sheets...';
            }, 8000);
            
            setTimeout(() => {
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> เกือบเสร็จแล้ว...';
            }, 12000);
            
            // Re-enable button after submission
            setTimeout(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }, 20000);
        }
        
        // Show success modal after reasonable wait time
        setTimeout(() => {
            showSuccessModal();
        }, 18000);
        
        // Let form submit naturally to Google Apps Script
        console.log('Form submitting to:', form.action);
    });

    // Add rating interaction effects
    addRatingInteractions();

    // Add form validation
    addFormValidation();
}

function addRatingInteractions() {
    const ratingInputs = document.querySelectorAll('.rating-options input[type="radio"]');
    
    ratingInputs.forEach(input => {
        input.addEventListener('change', function() {
            // Add visual feedback when rating is selected
            const questionContainer = this.closest('.rating-question');
            if (questionContainer) {
                questionContainer.style.background = 'rgba(245, 158, 11, 0.1)';
                questionContainer.style.borderColor = 'rgba(245, 158, 11, 0.3)';
                
                setTimeout(() => {
                    questionContainer.style.background = 'rgba(255, 255, 255, 0.6)';
                    questionContainer.style.borderColor = 'rgba(245, 158, 11, 0.2)';
                }, 300);
            }
        });
    });
}

function addFormValidation() {
    const requiredFields = document.querySelectorAll('input[required], textarea[required]');
    
    requiredFields.forEach(field => {
        field.addEventListener('blur', function() {
            validateField(this);
        });
    });
}

// Main form validation function
function validateForm() {
    const requiredFields = document.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            const formGroup = field.closest('.form-group') || field.closest('.rating-question');
            if (formGroup) {
                formGroup.classList.add('field-invalid');
            }
        }
    });
    
    // Check required radio buttons (ratings)
    const ratingQuestions = document.querySelectorAll('.rating-question');
    ratingQuestions.forEach(question => {
        const radioButtons = question.querySelectorAll('input[type="radio"]');
        const isChecked = Array.from(radioButtons).some(radio => radio.checked);
        
        if (radioButtons.length > 0 && !isChecked) {
            isValid = false;
            question.classList.add('field-invalid');
        }
    });
    
    if (!isValid) {
        alert('กรุณากรอกข้อมูลที่จำเป็น (*) ให้ครบถ้วน');
    }
    
    return isValid;
}

// Show success modal
function showSuccessModal() {
    const modal = document.getElementById('successModal');
    if (modal) {
        modal.style.display = 'flex';
        
        // Auto close after 3 seconds
        setTimeout(() => {
            closeModal();
        }, 3000);
    }
}

// Close modal
function closeModal() {
    const modal = document.getElementById('successModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function validateField(field) {
    const isValid = field.checkValidity();
    const formGroup = field.closest('.form-group') || field.closest('.rating-question');
    
    if (!formGroup) return;
    
    // Remove existing validation classes
    formGroup.classList.remove('field-valid', 'field-invalid');
    
    if (field.value.trim() !== '') {
        if (isValid) {
            formGroup.classList.add('field-valid');
        } else {
            formGroup.classList.add('field-invalid');
        }
    }
}

async function handleEvaluationSubmission(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitBtn = form.querySelector('.submit-btn');
    
    // Show loading state
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> กำลังส่งข้อมูล...';
    submitBtn.disabled = true;
    
    try {
        // Collect form data
        const formData = initializeEvaluationForm();
        
        // Validate required fields
        if (!validateEvaluationForm(formData)) {
            throw new Error('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน');
        }
        
        // Submit to Google Sheets
        const success = await submitEvaluationData(formData);
        
        if (success) {
            showSuccessModal();
            form.reset();
        } else {
            throw new Error('เกิดข้อผิดพลาดในการส่งข้อมูล');
        }
        
    } catch (error) {
        console.error('Evaluation submission error:', error);
        alert('เกิดข้อผิดพลาด: ' + error.message);
    } finally {
        // Restore button state
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

function collectEvaluationData(form) {
    const formData = new FormData(form);
    const data = {};
    
    // Convert FormData to regular object
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }
    
    // Add timestamp
    data.submissionTime = new Date().toISOString();
    data.submissionDate = new Date().toLocaleDateString('th-TH');
    
    return data;
}

function validateEvaluationForm(data) {
    const requiredFields = [
        'participantName',
        'contentSatisfaction',
        'contentDifficulty',
        'contentUsefulness',
        'instructorKnowledge',
        'instructorCommunication',
        'instructorQA',
        'timeDuration',
        'timeSchedule',
        'organizationOverall',
        'platformSatisfaction',
        'avQuality',
        'overallSatisfaction',
        'recommendation'
    ];
    
    for (let field of requiredFields) {
        if (!data[field] || data[field].trim() === '') {
            return false;
        }
    }
    
    return true;
}

async function submitEvaluationData(data) {
    console.log('=== SUBMITTING EVALUATION DATA ===');
    console.log('URL:', EVALUATION_SCRIPT_URL);
    console.log('Data to submit:', data);
    
    try {
        // Try fetch first (modern approach)
        console.log('Attempting fetch submission...');
        const response = await fetch(EVALUATION_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', // Changed from 'cors' to 'no-cors'
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'submitEvaluation',
                data: data
            })
        });
        
        console.log('Fetch response status:', response.status);
        
        // With no-cors mode, we can't read the response, so assume success
        if (response.type === 'opaque') {
            console.log('Fetch submission completed (no-cors mode)');
            return true;
        }
        
        if (response.ok) {
            const result = await response.json();
            console.log('Fetch result:', result);
            return result.success;
        } else {
            throw new Error(`Network response was not ok: ${response.status}`);
        }
        
    } catch (error) {
        console.log('Fetch failed, trying form submission fallback:', error);
        
        // Fallback: Form submission method
        return await submitEvaluationViaForm(data);
    }
}

async function submitEvaluationViaForm(data) {
    console.log('=== FORM FALLBACK SUBMISSION ===');
    console.log('Form data to submit:', data);
    
    return new Promise((resolve) => {
        // Create hidden form for submission
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = EVALUATION_SCRIPT_URL;
        form.target = 'evaluation_frame';
        form.style.display = 'none';
        
        // Add action field
        const actionField = document.createElement('input');
        actionField.type = 'hidden';
        actionField.name = 'action';
        actionField.value = 'submitEvaluation';
        form.appendChild(actionField);
        
        console.log('Form action URL:', EVALUATION_SCRIPT_URL);
        
        // Add all data fields
        for (let [key, value] of Object.entries(data)) {
            const field = document.createElement('input');
            field.type = 'hidden';
            field.name = key;
            field.value = value || '';
            form.appendChild(field);
        }
        
        // Create hidden iframe for response
        const iframe = document.createElement('iframe');
        iframe.name = 'evaluation_frame';
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
        
        // Handle response
        iframe.onload = function() {
            setTimeout(() => {
                document.body.removeChild(form);
                document.body.removeChild(iframe);
                resolve(true);
            }, 1000);
        };
        
        // Submit form
        document.body.appendChild(form);
        form.submit();
    });
}

function showSuccessModal() {
    const modal = document.getElementById('successModal');
    if (modal) {
        modal.style.display = 'block';
        
        // Add confetti effect
        createConfetti();
        
        // Auto close after 5 seconds
        setTimeout(() => {
            closeModal();
        }, 5000);
    }
}

function closeModal() {
    const modal = document.getElementById('successModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('successModal');
    if (event.target === modal) {
        closeModal();
    }
}

function createConfetti() {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b'];
    const confettiCount = 50;
    
    for (let i = 0; i < confettiCount; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.style.position = 'fixed';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.top = '-10px';
            confetti.style.width = '10px';
            confetti.style.height = '10px';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.zIndex = '9999';
            confetti.style.pointerEvents = 'none';
            confetti.style.borderRadius = '50%';
            
            document.body.appendChild(confetti);
            
            const animation = confetti.animate([
                { transform: 'translateY(-10px) rotate(0deg)', opacity: 1 },
                { transform: `translateY(${window.innerHeight + 10}px) rotate(720deg)`, opacity: 0 }
            ], {
                duration: 3000 + Math.random() * 2000,
                easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            });
            
            animation.onfinish = () => {
                if (confetti.parentNode) {
                    confetti.parentNode.removeChild(confetti);
                }
            };
        }, i * 100);
    }
}

// Create falling petals effect (reused from main site)
function createFallingPetals() {
    // Prevent multiple initializations
    if (window.petalsInitialized) {
        return;
    }
    
    let container = document.getElementById('techBackground');
    if (!container) {
        container = document.body;
    }
    
    const petalSymbols = ['🌸', '🌺', '🌻', '🌷', '💮', '🏵️'];
    const petalClasses = ['petal-blue', 'petal-green', 'petal-purple', 'petal-indigo', 'petal-cyan'];
    
    function createPetal() {
        const currentPetals = container.querySelectorAll('.falling-petal').length;
        if (currentPetals >= 8) {
            return;
        }
        
        const petal = document.createElement('div');
        petal.className = `falling-petal ${petalClasses[Math.floor(Math.random() * petalClasses.length)]}`;
        petal.textContent = petalSymbols[Math.floor(Math.random() * petalSymbols.length)];
        
        petal.style.position = 'fixed';
        petal.style.left = Math.random() * 100 + '%';
        petal.style.top = '-50px';
        petal.style.zIndex = '1';
        petal.style.pointerEvents = 'none';
        petal.style.fontSize = (0.8 + Math.random() * 0.6) + 'rem';
        
        const duration = 15 + Math.random() * 10;
        petal.style.animation = `fall ${duration}s linear forwards`;
        
        container.appendChild(petal);
        
        setTimeout(() => {
            if (petal.parentNode) {
                petal.parentNode.removeChild(petal);
            }
        }, duration * 1000 + 1000);
    }
    
    // Create initial petals
    for (let i = 0; i < 3; i++) {
        setTimeout(() => createPetal(), i * 2000);
    }
    
    // Continue creating petals
    setInterval(() => {
        const currentPetals = container.querySelectorAll('.falling-petal').length;
        if (currentPetals < 5) {
            createPetal();
        }
    }, 5000);
    
    window.petalsInitialized = true;
}

// Add CSS for falling petals animation
const style = document.createElement('style');
style.textContent = `
    @keyframes fall {
        to {
            transform: translateY(calc(100vh + 100px)) rotate(360deg);
        }
    }
    
    .falling-petal {
        opacity: 0.7;
        animation-timing-function: linear;
    }
    
    .petal-blue { color: #3b82f6; }
    .petal-green { color: #10b981; }
    .petal-purple { color: #8b5cf6; }
    .petal-indigo { color: #6366f1; }
    .petal-cyan { color: #06b6d4; }
    
    .field-valid {
        border-color: #10b981 !important;
        background: rgba(16, 185, 129, 0.1) !important;
    }
    
    .field-invalid {
        border-color: #ef4444 !important;
        background: rgba(239, 68, 68, 0.1) !important;
    }
`;
document.head.appendChild(style);
