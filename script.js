// DOM Elements
const navbar = document.querySelector('.navbar');
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');
const installBanner = document.getElementById('installBanner');
const installBtn = document.getElementById('installBtn');
const dismissBtn = document.getElementById('dismissBtn');

// PWA Install Prompt
let deferredPrompt;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
    setupSmoothScrolling();
    setupNavbarScroll();
    setupMobileMenu();
    setupScheduleTabs();
    setupBMIcalculator();
    setupContactForm();
    setupPWAInstall();
});

// App Initialization
function initializeApp() {
    // Add loading animation removal
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 100);
    
    // Set current year in footer
    const currentYear = new Date().getFullYear();
    const footerYear = document.querySelector('.footer-bottom p');
    if (footerYear) {
        footerYear.innerHTML = `&copy; ${currentYear} PowerFit Gym. All rights reserved.`;
    }
}

// Event Listeners Setup
function setupEventListeners() {
    // Hamburger menu
    hamburger?.addEventListener('click', toggleMobileMenu);
    
    // Install banner buttons
    installBtn?.addEventListener('click', installApp);
    dismissBtn?.addEventListener('click', dismissInstallBanner);
    
    // Plan and workout buttons
    document.querySelectorAll('.plan-card button, .workout-card button').forEach(button => {
        button.addEventListener('click', handlePlanClick);
    });
    
    // Form inputs validation
    document.querySelectorAll('input, textarea, select').forEach(input => {
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', () => clearFieldError(input));
    });
}

// Mobile Menu Toggle
function toggleMobileMenu() {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
    
    // Prevent body scroll when menu is open
    if (navMenu.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
}

// Close mobile menu when clicking on a link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = '';
    });
});

// Smooth Scrolling
function setupSmoothScrolling() {
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80; // Account for fixed navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Navbar Scroll Effect
function setupNavbarScroll() {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

// Schedule Tabs
function setupScheduleTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const daySchedules = document.querySelectorAll('.day-schedule');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetDay = button.getAttribute('data-day');
            
            // Remove active class from all buttons and schedules
            tabButtons.forEach(btn => btn.classList.remove('active'));
            daySchedules.forEach(schedule => schedule.classList.remove('active'));
            
            // Add active class to clicked button and corresponding schedule
            button.classList.add('active');
            const targetSchedule = document.getElementById(targetDay);
            if (targetSchedule) {
                targetSchedule.classList.add('active');
            }
        });
    });
}

// BMI Calculator
function setupBMIcalculator() {
    const heightInput = document.getElementById('height');
    const weightInput = document.getElementById('weight');
    
    // Auto-calculate on input
    [heightInput, weightInput].forEach(input => {
        input?.addEventListener('input', () => {
            if (heightInput.value && weightInput.value) {
                calculateBMI();
            }
        });
    });
}

function calculateBMI() {
    const heightInput = document.getElementById('height');
    const weightInput = document.getElementById('weight');
    const bmiNumber = document.querySelector('.bmi-number');
    const bmiCategory = document.querySelector('.bmi-category');
    
    const height = parseFloat(heightInput.value);
    const weight = parseFloat(weightInput.value);
    
    // Validation
    if (!height || !weight || height < 100 || height > 250 || weight < 30 || weight > 200) {
        bmiNumber.textContent = '--';
        bmiCategory.textContent = 'Enter valid details';
        resetBMIScale();
        return;
    }
    
    // Calculate BMI
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    const roundedBMI = bmi.toFixed(1);
    
    // Update display
    bmiNumber.textContent = roundedBMI;
    bmiCategory.textContent = getBMICategory(bmi);
    updateBMIScale(bmi);
    
    // Add animation
    const bmiResult = document.getElementById('bmiResult');
    bmiResult.style.animation = 'pulse 0.5s ease';
    setTimeout(() => {
        bmiResult.style.animation = '';
    }, 500);
}

function getBMICategory(bmi) {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal Weight';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
}

function updateBMIScale(bmi) {
    const scaleItems = document.querySelectorAll('.scale-item');
    scaleItems.forEach(item => item.style.transform = 'scale(1)');
    
    let activeIndex;
    if (bmi < 18.5) activeIndex = 0;
    else if (bmi < 25) activeIndex = 1;
    else if (bmi < 30) activeIndex = 2;
    else activeIndex = 3;
    
    if (scaleItems[activeIndex]) {
        scaleItems[activeIndex].style.transform = 'scale(1.1)';
        scaleItems[activeIndex].style.boxShadow = '0 0 20px rgba(255, 0, 0, 0.3)';
    }
}

function resetBMIScale() {
    const scaleItems = document.querySelectorAll('.scale-item');
    scaleItems.forEach(item => {
        item.style.transform = 'scale(1)';
        item.style.boxShadow = '';
    });
}

// Contact Form
function setupContactForm() {
    const form = document.getElementById('inquiryForm');
    
    form?.addEventListener('submit', (e) => {
        e.preventDefault();
        handleFormSubmit(form);
    });
}

function handleFormSubmit(form) {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    // Validation
    if (!validateForm(form)) {
        return;
    }
    
    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;
    
    // Simulate form submission (in real app, this would be an API call)
    setTimeout(() => {
        // Show success message
        showNotification('Thank you for your inquiry! We\'ll contact you soon.', 'success');
        
        // Reset form
        form.reset();
        
        // Reset button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        
        // Store in localStorage for demo purposes
        const inquiries = JSON.parse(localStorage.getItem('gymInquiries') || '[]');
        inquiries.push({
            ...data,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('gymInquiries', JSON.stringify(inquiries));
        
    }, 1500);
}

function validateForm(form) {
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            showFieldError(field, 'This field is required');
            isValid = false;
        }
    });
    
    // Email validation
    const emailField = form.querySelector('#email');
    if (emailField && emailField.value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailField.value)) {
            showFieldError(emailField, 'Please enter a valid email');
            isValid = false;
        }
    }
    
    // Phone validation (optional but if provided, should be valid)
    const phoneField = form.querySelector('#phone');
    if (phoneField && phoneField.value) {
        const phoneRegex = /^[\d\s\-\+\(\)]+$/;
        if (!phoneRegex.test(phoneField.value)) {
            showFieldError(phoneField, 'Please enter a valid phone number');
            isValid = false;
        }
    }
    
    return isValid;
}

function validateField(field) {
    if (field.hasAttribute('required') && !field.value.trim()) {
        showFieldError(field, 'This field is required');
        return false;
    }
    
    if (field.type === 'email' && field.value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(field.value)) {
            showFieldError(field, 'Please enter a valid email');
            return false;
        }
    }
    
    return true;
}

function showFieldError(field, message) {
    clearFieldError(field);
    
    field.style.borderColor = 'var(--error-color)';
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    errorDiv.style.color = 'var(--error-color)';
    errorDiv.style.fontSize = '0.8rem';
    errorDiv.style.marginTop = '0.3rem';
    
    field.parentNode.appendChild(errorDiv);
}

function clearFieldError(field) {
    field.style.borderColor = '';
    const errorDiv = field.parentNode.querySelector('.field-error');
    if (errorDiv) {
        errorDiv.remove();
    }
}

// Plan Click Handler
function handlePlanClick(e) {
    const planName = e.target.closest('.plan-card, .workout-card').querySelector('h3').textContent;
    showNotification(`Great choice! The ${planName} plan will be perfect for your fitness journey. Contact us to get started!`, 'success');
}

// Notifications
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? 'var(--success-color)' : type === 'error' ? 'var(--error-color)' : 'var(--primary-color)'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: var(--border-radius);
        box-shadow: var(--shadow-lg);
        z-index: 1002;
        max-width: 300px;
        animation: slideInRight 0.5s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.5s ease';
        setTimeout(() => notification.remove(), 500);
    }, 5000);
}

// PWA Setup
function setupPWAInstall() {
    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent the mini-infobar from appearing on mobile
        e.preventDefault();
        // Stash the event so it can be triggered later
        deferredPrompt = e;
        // Show install banner
        showInstallBanner();
    });
    
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
        console.log('App is already installed');
    }
}

function showInstallBanner() {
    // Don't show if already dismissed or installed
    if (localStorage.getItem('installDismissed') || localStorage.getItem('appInstalled')) {
        return;
    }
    
    // Show after a delay
    setTimeout(() => {
        if (installBanner && deferredPrompt) {
            installBanner.style.display = 'block';
        }
    }, 3000);
}

function installApp() {
    if (!deferredPrompt) {
        showNotification('App installation is not available on this device', 'error');
        return;
    }
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
            console.log('User accepted the install prompt');
            localStorage.setItem('appInstalled', 'true');
            showNotification('App installed successfully! You can now access it from your home screen.', 'success');
        } else {
            console.log('User dismissed the install prompt');
        }
        // Clear the deferredPrompt variable
        deferredPrompt = null;
        // Hide the banner
        hideInstallBanner();
    });
}

function dismissInstallBanner() {
    localStorage.setItem('installDismissed', 'true');
    hideInstallBanner();
}

function hideInstallBanner() {
    if (installBanner) {
        installBanner.style.display = 'none';
    }
}

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then((registration) => {
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            })
            .catch((error) => {
                console.log('ServiceWorker registration failed: ', error);
            });
    });
}

// Performance Optimization
function optimizeImages() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.loading = 'lazy';
    });
}

// Accessibility
function setupAccessibility() {
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            // Close mobile menu if open
            if (navMenu.classList.contains('active')) {
                toggleMobileMenu();
            }
            
            // Close notifications
            const notification = document.querySelector('.notification');
            if (notification) {
                notification.remove();
            }
        }
    });
    
    // Focus management
    const focusableElements = document.querySelectorAll(
        'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
    );
    
    focusableElements.forEach(element => {
        element.addEventListener('focus', () => {
            element.style.outline = '2px solid var(--primary-color)';
        });
        
        element.addEventListener('blur', () => {
            element.style.outline = '';
        });
    });
}

// Analytics (placeholder)
function trackPageView(page) {
    // In a real app, this would send data to analytics service
    console.log('Page view:', page);
}

function trackEvent(action, category, label) {
    // In a real app, this would send event data to analytics service
    console.log('Event:', { action, category, label });
}

// Initialize accessibility and performance
setupAccessibility();
optimizeImages();

// Track initial page view
trackPageView('home');

// Add custom animations CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .notification {
        font-family: var(--font-primary);
        font-weight: 500;
    }
    
    body.loaded {
        opacity: 1;
    }
    
    body:not(.loaded) {
        opacity: 0;
        transition: opacity 0.3s ease;
    }
`;
document.head.appendChild(style);

// Export functions for testing (if needed)
window.GymApp = {
    calculateBMI,
    showNotification,
    validateForm,
    installApp
};
