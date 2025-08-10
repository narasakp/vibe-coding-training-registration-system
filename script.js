// Training Registration System - JavaScript
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing...');
    initializeForm();
    initializeTopicCards();
    initializeInteractiveFeatures();
    
    // Initialize falling petals with a small delay to ensure DOM is ready
    setTimeout(() => {
        createFallingPetals();
    }, 500);
});

// Initialize form functionality
function initializeForm() {
    const form = document.getElementById('registrationForm');
    if (!form) {
        console.error('Registration form not found');
        return;
    }
    
    const inputs = form.querySelectorAll('input, select, textarea');
    
    // Add real-time validation
    inputs.forEach(input => {
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', () => clearError(input));
    });
    
    // Handle form submission
    form.addEventListener('submit', handleFormSubmit);
}

// Validate individual field
function validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name;
    let isValid = true;
    let errorMessage = '';
    
    // Required field validation
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = 'กรุณากรอกข้อมูลในช่องนี้';
    }
    
    // Email validation
    if (fieldName === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            isValid = false;
            errorMessage = 'กรุณากรอกอีเมลให้ถูกต้อง';
        }
    }
    
    // Phone validation
    if (fieldName === 'phone' && value) {
        const phoneRegex = /^[0-9-+\s()]{10,}$/;
        if (!phoneRegex.test(value)) {
            isValid = false;
            errorMessage = 'กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง';
        }
    }
    
    // Show/hide error
    showFieldError(field, isValid, errorMessage);
    return isValid;
}

// Show field error
function showFieldError(field, isValid, errorMessage) {
    const formGroup = field.closest('.form-group');
    const errorElement = formGroup.querySelector('.error-message');
    
    if (isValid) {
        formGroup.classList.remove('error');
        if (errorElement) errorElement.textContent = '';
    } else {
        formGroup.classList.add('error');
        if (errorElement) errorElement.textContent = errorMessage;
    }
}

// Clear field error
function clearError(field) {
    const formGroup = field.closest('.form-group');
    formGroup.classList.remove('error');
    const errorElement = formGroup.querySelector('.error-message');
    if (errorElement) errorElement.textContent = '';
}

// Handle form submission
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    
    // Validate all fields
    const inputs = form.querySelectorAll('input[required], select[required]');
    let isFormValid = true;
    
    inputs.forEach(input => {
        if (!validateField(input)) {
            isFormValid = false;
        }
    });
    
    // Check if at least one topic is selected
    const topicCheckboxes = form.querySelectorAll('input[name="topics"]:checked');
    if (topicCheckboxes.length === 0) {
        alert('กรุณาเลือกหัวข้อที่สนใจอย่างน้อย 1 หัวข้อ');
        isFormValid = false;
    }
    
    if (!isFormValid) {
        return;
    }
    
    // Show loading state
    const submitBtn = form.querySelector('.submit-btn');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> กำลังส่งข้อมูล...';
    submitBtn.disabled = true;
    
    try {
        // Collect form data
        const registrationData = collectFormData(formData);
        
        // Submit to Google Sheets (you'll need to replace with your Google Apps Script URL)
        const success = await submitToGoogleSheets(registrationData);
        
        if (success) {
            showSuccessModal();
            form.reset();
        } else {
            throw new Error('Failed to submit');
        }
    } catch (error) {
        console.error('Submission error:', error);
        alert('เกิดข้อผิดพลาดในการส่งข้อมูล กรุณาลองใหม่อีกครั้ง');
    } finally {
        // Restore button state
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Collect form data
function collectFormData(formData) {
    const data = {};
    
    // Get basic form fields
    for (let [key, value] of formData.entries()) {
        if (key !== 'topics') {
            data[key] = value;
        }
    }
    
    // Get selected topics
    const selectedTopics = [];
    const topicCheckboxes = document.querySelectorAll('input[name="topics"]:checked');
    topicCheckboxes.forEach(checkbox => {
        selectedTopics.push(checkbox.value);
    });
    data.topics = selectedTopics.join(', ');
    
    // Add timestamp
    data.timestamp = new Date().toLocaleString('th-TH');
    
    return data;
}

// Submit to Google Sheets - ใช้วิธีที่พิสูจน์แล้วจากโปรเจกต์เดิม
async function submitToGoogleSheets(data) {
    // ใช้ URL จากโปรเจกต์เดิมที่ทำงานได้
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyRrQGPIW8WBG_7xUvx7YjCFr1_cWr2I2njtjya1cQawhrS14EX0fYFfFZkQ71tXIN8/exec';
    
    console.log('Submitting data to Google Sheets:', data);
    
    try {
        // ลองใช้ fetch ก่อน (แต่มักจะ fail เพราะ CORS)
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        console.log('Fetch completed (no-cors mode)');
        return true; // ถือว่าสำเร็จเพราะใช้ no-cors
    } catch (error) {
        console.log('Fetch failed, using form submission fallback:', error);
        
        // Fallback: สร้าง hidden form และ submit (วิธีที่ใช้ในโปรเจกต์เดิม)
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = GOOGLE_SCRIPT_URL;
        form.target = 'hidden_iframe'; // ส่งไปยัง hidden iframe
        form.style.display = 'none';
        
        // สร้าง hidden iframe สำหรับรับ response
        let iframe = document.getElementById('hidden_iframe');
        if (!iframe) {
            iframe = document.createElement('iframe');
            iframe.id = 'hidden_iframe';
            iframe.name = 'hidden_iframe';
            iframe.style.display = 'none';
            document.body.appendChild(iframe);
        }
        
        // เพิ่มข้อมูลเป็น hidden inputs
        Object.keys(data).forEach(key => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = data[key] || '';
            form.appendChild(input);
        });
        
        document.body.appendChild(form);
        
        // Submit form
        form.submit();
        
        // ลบ form หลังจาก submit
        setTimeout(() => {
            if (form.parentNode) {
                form.parentNode.removeChild(form);
            }
        }, 1000);
        
        return true;
    }
}

// Show success modal
function showSuccessModal() {
    const modal = document.getElementById('successModal');
    modal.style.display = 'block';
    
    // Add celebration effect
    createCelebrationEffect();
}

// Close modal
function closeModal() {
    const modal = document.getElementById('successModal');
    modal.style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('successModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}

// Create celebration effect
function createCelebrationEffect() {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7'];
    
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.style.position = 'fixed';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.top = '-10px';
            confetti.style.width = '10px';
            confetti.style.height = '10px';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.borderRadius = '50%';
            confetti.style.pointerEvents = 'none';
            confetti.style.zIndex = '9999';
            confetti.style.animation = 'confettiFall 3s linear forwards';
            
            document.body.appendChild(confetti);
            
            setTimeout(() => {
                if (confetti.parentNode) {
                    confetti.parentNode.removeChild(confetti);
                }
            }, 3000);
        }, i * 100);
    }
}

// Add confetti animation
const style = document.createElement('style');
style.textContent = `
    @keyframes confettiFall {
        to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize topic cards interaction
function initializeTopicCards() {
    const topicCards = document.querySelectorAll('.topic-card');
    const topicCheckboxes = document.querySelectorAll('input[name="topics"]');
    
    if (topicCards.length === 0) {
        console.warn('No topic cards found');
        return;
    }
    
    // Add click handlers to topic cards in banner
    topicCards.forEach(card => {
        card.addEventListener('click', function() {
            const topic = this.dataset.topic;
            const checkbox = document.querySelector(`input[value="${topic}"]`);
            if (checkbox) {
                checkbox.checked = !checkbox.checked;
                updateTopicSelection();
            }
        });
    });
    
    // Add change handlers to checkboxes
    topicCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateTopicSelection);
    });
}

// Update topic selection visual feedback
function updateTopicSelection() {
    const topicCheckboxes = document.querySelectorAll('input[name="topics"]');
    
    topicCheckboxes.forEach(checkbox => {
        const topicCard = document.querySelector(`[data-topic="${checkbox.value}"]`);
        if (topicCard) {
            if (checkbox.checked) {
                topicCard.style.transform = 'translateY(-5px)';
                topicCard.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.3)';
            } else {
                topicCard.style.transform = '';
                topicCard.style.boxShadow = '';
            }
        }
    });
}

// Create falling petals effect
function createFallingPetals() {
    console.log('Initializing falling petals...');
    
    // Try to find tech background, if not found, use body
    let container = document.getElementById('techBackground');
    if (!container) {
        console.log('Tech background not found, using body');
        container = document.body;
    }
    
    const petalSymbols = ['🌸', '🌺', '🌻', '🌷', '💮', '🏵️'];
    const petalClasses = ['petal-blue', 'petal-green', 'petal-purple', 'petal-indigo', 'petal-cyan'];
    
    function createPetal() {
        const petal = document.createElement('div');
        petal.className = `falling-petal ${petalClasses[Math.floor(Math.random() * petalClasses.length)]}`;
        petal.textContent = petalSymbols[Math.floor(Math.random() * petalSymbols.length)];
        
        // Set initial position and animation properties
        petal.style.position = 'fixed';
        petal.style.left = Math.random() * 100 + '%';
        petal.style.top = '-50px';
        petal.style.zIndex = '1';
        petal.style.pointerEvents = 'none';
        petal.style.fontSize = (0.8 + Math.random() * 0.6) + 'rem';
        
        // Apply animation
        const duration = 8 + Math.random() * 6; // 8-14 seconds
        petal.style.animation = `fall ${duration}s linear forwards`;
        
        container.appendChild(petal);
        console.log('Petal created:', petal.textContent);
        
        // Remove petal after animation completes
        setTimeout(() => {
            if (petal.parentNode) {
                petal.parentNode.removeChild(petal);
            }
        }, duration * 1000 + 1000); // Add 1 second buffer
    }
    
    // Create initial petals
    for (let i = 0; i < 8; i++) {
        setTimeout(() => createPetal(), i * 500); // Stagger initial petals
    }
    
    // Continue creating petals
    setInterval(() => {
        // Limit total petals on screen
        const currentPetals = container.querySelectorAll('.falling-petal').length;
        if (currentPetals < 15) {
            createPetal();
        }
    }, 2000); // Create new petal every 2 seconds
    
    console.log('Falling petals initialized successfully');
}

// Smooth scroll for better UX
function smoothScrollTo(element) {
    element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

// Initialize interactive features
function initializeInteractiveFeatures() {
    // Add hover effects to form sections
    const formSections = document.querySelectorAll('.form-section');
    formSections.forEach(section => {
        section.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
        });
        
        section.addEventListener('mouseleave', function() {
            this.style.transform = '';
            this.style.boxShadow = '';
        });
    });
    
    // Add typing effect for placeholders
    const inputs = document.querySelectorAll('input[placeholder], textarea[placeholder]');
    inputs.forEach(input => {
        const originalPlaceholder = input.placeholder;
        
        input.addEventListener('focus', function() {
            this.placeholder = '';
        });
        
        input.addEventListener('blur', function() {
            if (!this.value) {
                this.placeholder = originalPlaceholder;
            }
        });
    });
    
    // Add smooth scrolling for better UX
    const formInputs = document.querySelectorAll('input, select, textarea');
    if (formInputs.length > 0) {
        formInputs.forEach(input => {
            input.addEventListener('focus', function() {
                setTimeout(() => {
                    const section = this.closest('.form-section');
                    if (section) {
                        smoothScrollTo(section);
                    }
                }, 100);
            });
        });
    }
    
    // Initialize form progress
    updateFormProgress();
}

// Add form progress indicator - Enhanced version
function updateFormProgress() {
    const requiredFields = document.querySelectorAll('input[required], select[required]');
    const topicCheckboxes = document.querySelectorAll('input[name="topics"]:checked');
    
    if (requiredFields.length === 0) return;
    
    // Count filled required fields
    const filledFields = Array.from(requiredFields).filter(field => field.value.trim() !== '');
    
    // Add topic selection to progress (at least 1 topic required)
    const topicSelected = topicCheckboxes.length > 0 ? 1 : 0;
    const totalFields = requiredFields.length + 1; // +1 for topic selection
    const completedFields = filledFields.length + topicSelected;
    
    const progress = Math.round((completedFields / totalFields) * 100);
    
    // Update progress bar elements
    const progressBar = document.getElementById('progressBar');
    const progressPercent = document.getElementById('progressPercent');
    const progressCount = document.getElementById('progressCount');
    const progressTotal = document.getElementById('progressTotal');
    
    if (progressBar) {
        progressBar.style.width = progress + '%';
    }
    
    if (progressPercent) {
        progressPercent.textContent = progress + '%';
    }
    
    if (progressCount && progressTotal) {
        progressCount.textContent = completedFields;
        progressTotal.textContent = totalFields;
    }
    
    // Add visual feedback
    if (progress === 100) {
        progressBar.style.boxShadow = '0 0 15px rgba(34, 197, 94, 0.5)';
        progressBar.style.background = 'linear-gradient(90deg, #22c55e, #16a34a)';
    } else {
        progressBar.style.boxShadow = '0 0 10px rgba(255, 107, 53, 0.3)';
        progressBar.style.background = 'linear-gradient(90deg, #ff6b35, #f7931e)';
    }
}

// Initialize progress tracking
function initializeProgressTracking() {
    const requiredFields = document.querySelectorAll('input[required], select[required]');
    const topicCheckboxes = document.querySelectorAll('input[name="topics"]');
    const allFormFields = document.querySelectorAll('input, select, textarea');
    const progressContainer = document.querySelector('.progress-container');
    
    if (requiredFields.length === 0) return;
    
    let progressTimeout;
    let isProgressVisible = false;
    
    // Function to show progress bar
    function showProgressBar() {
        if (!isProgressVisible) {
            progressContainer.classList.add('show');
            isProgressVisible = true;
            updateFormProgress();
        }
        
        // Clear existing timeout
        if (progressTimeout) {
            clearTimeout(progressTimeout);
        }
    }
    
    // Function to hide progress bar after delay
    function hideProgressBarDelayed() {
        progressTimeout = setTimeout(() => {
            progressContainer.classList.remove('show');
            isProgressVisible = false;
        }, 3000); // Hide after 3 seconds of inactivity
    }
    
    // Add listeners for all form fields to show progress on focus
    allFormFields.forEach(field => {
        field.addEventListener('focus', () => {
            showProgressBar();
        });
        
        field.addEventListener('blur', () => {
            hideProgressBarDelayed();
        });
        
        field.addEventListener('input', () => {
            if (isProgressVisible) {
                updateFormProgress();
            }
        });
        
        field.addEventListener('change', () => {
            if (isProgressVisible) {
                updateFormProgress();
            }
        });
    });
    
    // Add listeners for topic checkboxes
    topicCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            if (isProgressVisible) {
                updateFormProgress();
            }
        });
    });
    
    // Hide progress bar when clicking outside form
    document.addEventListener('click', (e) => {
        const isFormClick = e.target.closest('.form-container') || e.target.closest('.progress-container');
        if (!isFormClick && isProgressVisible) {
            hideProgressBarDelayed();
        }
    });
    
    // Show progress bar when hovering over form container
    const formContainer = document.querySelector('.form-container');
    if (formContainer) {
        formContainer.addEventListener('mouseenter', () => {
            showProgressBar();
        });
        
        formContainer.addEventListener('mouseleave', () => {
            hideProgressBarDelayed();
        });
    }
}

// Enhanced form interaction tracking
function initializeFormInteractionTracking() {
    const progressContainer = document.querySelector('.progress-container');
    
    // Initially hide progress bar
    if (progressContainer) {
        progressContainer.classList.remove('show');
    }
    
    // Initialize progress tracking
    initializeProgressTracking();
}

// Call enhanced form interaction tracking
document.addEventListener('DOMContentLoaded', function() {
    initializeFormInteractionTracking();
});

// Export functions for potential external use
window.TrainingRegistration = {
    validateField,
    showSuccessModal,
    closeModal,
    updateFormProgress
};
