document.addEventListener('DOMContentLoaded', () => {
    // Sticky Header
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (header) {
            if (window.scrollY > 50) {
                header.classList.add('sticky');
            } else {
                header.classList.remove('sticky');
            }
        }
    });

    // Reveal Animation
    const revealElements = document.querySelectorAll('[data-reveal]');
    const revealOnScroll = () => {
        revealElements.forEach(el => {
            const elementTop = el.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            if (elementTop < windowHeight - 50) {
                el.classList.add('active');
            }
        });
    };
    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll();

    // Mobile Menu Toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = mobileMenuBtn.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.classList.replace('fa-bars', 'fa-times');
            } else {
                icon.classList.replace('fa-times', 'fa-bars');
            }
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                mobileMenuBtn.querySelector('i').classList.replace('fa-times', 'fa-bars');
            });
        });
    }

    // --- ENROLLMENT & PAYMENT FLOW ---

    // Create Modal HTML and append to body
    const modalHTML = `
    <div class="modal-overlay" id="enrollModal">
        <div class="modal-content">
            <span class="close-modal" id="closeModal">&times;</span>
            <div id="modalStep1">
                <div class="modal-header">
                    <h3 id="courseTitle">Enroll in Course</h3>
                    <p style="font-size: 0.9rem; opacity: 0.9; margin-top: 5px;" id="coursePrice"></p>
                </div>
                <div class="modal-body">
                    <p style="margin-bottom: 20px; color: var(--text-muted);">Please register your email to continue with the enrollment.</p>
                    <div style="margin-bottom: 24px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600; font-size: 0.85rem; color: var(--text-muted); text-transform: uppercase;">Email Address</label>
                        <input type="email" id="enrollEmail" placeholder="name@example.com" style="width: 100%; padding: 14px; border: 2px solid #E2E8F0; border-radius: var(--radius-sm); outline: none; transition: var(--transition);">
                    </div>
                    <button class="btn btn-primary" style="width: 100%;" id="btnToPayment">Proceed to Payment <i class="fas fa-chevron-right"></i></button>
                    <p style="text-align: center; font-size: 0.75rem; color: #94A3B8; margin-top: 16px;">Secure enrollment powered by Asha Queen Academy</p>
                </div>
            </div>
            
            <div id="modalStep2" style="display: none;">
                <div class="modal-header" style="background: #2D3E50;">
                    <img src="https://razorpay.com/favicon.png" style="width: 24px; display: inline; vertical-align: middle; margin-right: 10px;">
                    <span style="font-weight: 700; font-size: 1rem;">Razorpay</span>
                    <p style="font-size: 0.8rem; opacity: 0.8; margin-top: 5px;">Test Payment | <span id="paymentAmt"></span></p>
                </div>
                <div class="modal-body">
                    <p style="font-weight: 700; margin-bottom: 20px; font-size: 0.9rem;">SELECT PAYMENT METHOD</p>
                    <div class="payment-methods">
                        <div class="method-item" onclick="processPayment()">
                            <i class="fas fa-credit-card" style="color: #4F46E5;"></i>
                            <div>
                                <h4 style="font-size: 0.9rem;">Cards</h4>
                                <p style="font-size: 0.75rem; color: #94A3B8;">Visa, Mastercard, RuPay & More</p>
                            </div>
                        </div>
                        <div class="method-item" onclick="processPayment()">
                            <i class="fas fa-university" style="color: #10B981;"></i>
                            <div>
                                <h4 style="font-size: 0.9rem;">Netbanking</h4>
                                <p style="font-size: 0.75rem; color: #94A3B8;">All major Indian banks</p>
                            </div>
                        </div>
                        <div class="method-item" onclick="processPayment()">
                            <i class="fab fa-google-pay" style="color: #EA4335;"></i>
                            <div>
                                <h4 style="font-size: 0.9rem;">UPI</h4>
                                <p style="font-size: 0.75rem; color: #94A3B8;">Google Pay, PhonePe, BHIM</p>
                            </div>
                        </div>
                    </div>
                    <div class="payment-footer">
                        <i class="fas fa-lock"></i> Secured by Razorpay
                    </div>
                </div>
            </div>

            <div id="modalStep3" style="display: none;">
                <div class="modal-body" style="text-align: center; padding: 50px 32px;">
                    <div class="success-icon">
                        <i class="fas fa-check"></i>
                    </div>
                    <h2 style="margin-bottom: 16px;">Registration Successful!</h2>
                    <p style="color: var(--text-muted); margin-bottom: 32px;">Welcome to the academy. A confirmation email with course access details has been sent to <b id="displayEmail"></b>.</p>
                    <button class="btn btn-primary" onclick="window.location.reload()">Great, Let's Start!</button>
                </div>
            </div>
        </div>
    </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const modal = document.getElementById('enrollModal');
    const step1 = document.getElementById('modalStep1');
    const step2 = document.getElementById('modalStep2');
    const step3 = document.getElementById('modalStep3');
    const emailInput = document.getElementById('enrollEmail');
    const btnToPayment = document.getElementById('btnToPayment');

    // Global function to open enrollment
    window.buyCourse = (courseName, price) => {
        document.getElementById('courseTitle').innerText = courseName || "Academy Course";
        document.getElementById('coursePrice').innerText = price ? `Course Fee: ${price}` : "";
        document.getElementById('paymentAmt').innerText = price || "₹499";

        // Reset Modal
        step1.style.display = 'block';
        step2.style.display = 'none';
        step3.style.display = 'none';
        emailInput.value = "";

        modal.classList.add('active');
    };

    // Close Modal Events
    document.getElementById('closeModal').onclick = () => modal.classList.remove('active');
    window.onclick = (e) => { if (e.target == modal) modal.classList.remove('active'); };

    // Step 1 to Step 2
    btnToPayment.onclick = () => {
        if (!emailInput.value || !emailInput.value.includes('@')) {
            emailInput.style.borderColor = '#EF4444';
            setTimeout(() => { emailInput.style.borderColor = '#E2E8F0'; }, 1000);
            return;
        }
        step1.style.display = 'none';
        step2.style.display = 'block';
        document.getElementById('displayEmail').innerText = emailInput.value;
    };

    // Step 2 to Step 3 (Payment Simulation)
    window.processPayment = () => {
        const body = step2.querySelector('.modal-body');
        const oldBody = body.innerHTML;

        // Show Loading State
        body.innerHTML = `
            <div style="text-align: center; padding: 40px 0;">
                <div class="loader" style="width: 40px; height: 40px; border: 4px solid #E2E8F0; border-top-color: #2D3E50; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
                <p style="font-weight: 600;">Processing Secure Payment...</p>
                <p style="font-size: 0.8rem; color: #94A3B8; margin-top: 10px;">Please do not close this window</p>
            </div>
        `;

        setTimeout(() => {
            step2.style.display = 'none';
            step3.style.display = 'block';
            // Clean up loader for next time
            body.innerHTML = oldBody;
        }, 2000);
    };

    // Add loader animation to CSS via JS for ease
    const style = document.createElement('style');
    style.innerHTML = ` @keyframes spin { to { transform: rotate(360deg); } } `;
    document.head.appendChild(style);


    // Form Submission (Demo)
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert("Thank you! Your message has been sent. We will contact you soon.");
            contactForm.reset();
        });
    }
});
