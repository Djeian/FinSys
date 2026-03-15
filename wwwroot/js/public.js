import { debug, errorInput, formatNumber, 
    isEmpty, showError, validateEmail, 
    togglePasswordVisibility, passwordStrength, clearForm, 
    formatEmail, clearErrorInputFields, inputEmptyValidation,
    selectAllInputFields, removeUserSession,
    RemoveForgotPassSession

 } from "./utils.js";

// GLOBAL VAR

// PAGE BASE INITIALIZATION FOR DYNAMIC JS CODE
const PageScripts = {
    main: function() {
        debug("Page", "Main");

        // MEDIA QUERY FOR HAMBURGER
        const screen = window.matchMedia("(max-width: 755px)");
        
        const hamburger = document.getElementById('hamburger');
        const sidebar = document.getElementById('sidebar');
        const closeBtn = document.getElementById('sidebar-close');

        if (screen) {
            hamburger.addEventListener('click', () => {
                sidebar.classList.add('active');
            });

            closeBtn.addEventListener('click', () => {
                sidebar.classList.remove('active');
            });
        } 
        else {
            sidebar.classList.remove('active');
            hamburger.style.display = 'none';
        }

        const slider = document.querySelector('.services-item-con');
        const items = document.querySelectorAll('.services-item');

        let index = 0;
        let isDown = false;
        let startX;
        let scrollLeft;
        let autoSlide;

        function startAutoSlide(){
            autoSlide = setInterval(() => {
                index++;
                if(index >= items.length) index = 0;

                const itemWidth = items[0].offsetWidth;

                slider.scrollTo({
                    left: itemWidth * index,
                    behavior: "smooth"
                });
            }, 3000);
        }

        function stopAutoSlide(){
            clearInterval(autoSlide);
        }

        slider.addEventListener('mousedown', (e) => {
            isDown = true;
            slider.classList.add('active');
            startX = e.pageX - slider.offsetLeft;
            scrollLeft = slider.scrollLeft;
            stopAutoSlide();
        });

        slider.addEventListener('mouseleave', () => {
            isDown = false;
            slider.classList.remove('active');
        });

        slider.addEventListener('mouseup', () => {
            isDown = false;
            slider.classList.remove('active');
            startAutoSlide();
        });

        slider.addEventListener('mousemove', (e) => {
            if(!isDown) return;
            e.preventDefault();
            const x = e.pageX - slider.offsetLeft;
            const walk = (x - startX) * 1;
            slider.scrollLeft = scrollLeft - walk;
        });

        // TOUCH DRAG (Mobile)
        slider.addEventListener('touchstart', (e) => {
            startX = e.touches[0].pageX - slider.offsetLeft;
            scrollLeft = slider.scrollLeft;
            stopAutoSlide();
        });

        slider.addEventListener('touchmove', (e) => {
            const x = e.touches[0].pageX - slider.offsetLeft;
            const walk = (x - startX) * 1;
            slider.scrollLeft = scrollLeft - walk;
        });

        slider.addEventListener('touchend', () => {
            startAutoSlide();
        });

        startAutoSlide();
                    },

            

    signUp: function() {
        debug("Page", "Sign up");

        // LOCAL VARIABLE
        let signUpClientForm = document.getElementById("signUpClient");
        let firstName = document.getElementById("firstName");
        let lastName = document.getElementById("lastName");
        let email = document.getElementById("email");
        let password = document.getElementById("password");
        let conPassword = document.getElementById("conPassword");
        let phone = document.getElementById("phone");
        let country = document.getElementById("country");
        let agreement = document.getElementById("agreement");
        //let seeIcon = document.closest(".see-eye");
        //let unseeIcon = document.closest(".unsee-eye");
        let visibilityToggle = document.querySelectorAll(".visibilityToggle");

        // PASSWORD STRENGTH VAR
        let strength;
        let strength1 = document.getElementById("strength1");
        let strength2 = document.getElementById("strength2"); 
        let strength3 = document.getElementById("strength3");
        let strength4 = document.getElementById("strength4");

        password.addEventListener("input", function (event) {
            strength = 0;
            const pass = event.target.value;

            document.querySelectorAll(".password-con-item").forEach(e => {
                e.classList.remove("completed");
            });

            if (pass.length >= 8) {
                strength1.classList.add("completed"); 
                strength++;
            }
            
            if (/[A-Z]/.test(pass)) {
                strength2.classList.add("completed"); 
                strength++;
            } 
            
            if (/[a-z]/.test(pass)) {
                strength3.classList.add("completed");
                strength++;
            } 
           
            if (/\d/.test(pass)) {
                strength4.classList.add("completed");
                strength++;
            }
        });
        // FORMAT PHONE NUMBER
        phone.addEventListener("input", function (e) {
            e.target.value = formatNumber(e.target.value);
        }); // TO-DO not working fix this later

        visibilityToggle.forEach(i => {
            i.addEventListener("click", function () {
                const passwordInput = i.closest(".password-input"); // Gets the parent ** ALways get the parent first 
                const input = passwordInput.querySelector("input"); // Gets the child ** This is the input
                
                togglePasswordVisibility(input, i);
            });
        })

        // CLIENT SIGN UP REQUEST

        // IF EVER MAY TIME, CLEAN THIS SHIT
        signUpClientForm.addEventListener("submit", async function (e) {
            e.preventDefault();

            const inputFields = signUpClientForm.querySelectorAll("input, select");

            const checkInputFields = Array.from(inputFields).every(function (input) {
                return input.value.trim().length > 0;
            });


            if (checkInputFields) { 
                
                debug("Input", "All fields contain something");

                inputFields.forEach(i => {
                    i.classList.remove("error-input");
                })

                if (formatEmail(email.value)) {
                    const emailCon = document.querySelector(".email-con");
                    emailCon.querySelectorAll(".error-tag").forEach(e => e.remove()); 
                    email.classList.remove("error-input");

                    const emailExist = await validateEmail(email.value);

                    if (!emailExist) {
                        const emailCon = document.querySelector(".email-con");
                        emailCon.querySelectorAll(".error-tag").forEach(e => e.remove()); 
                        email.classList.remove("error-input");

                        if (passwordStrength(strength) === 100) {                       
                            if (password.value === conPassword.value) {
                                const passwordCon = document.querySelector(".conPassword-con");
                                passwordCon.querySelectorAll(".error-tag").forEach(e => e.remove());

                                password.classList.remove("error-input");
                                conPassword.classList.remove("error-input");

                                if (phone.value.trim().length === 11) {       
                                    const phoneCon = document.querySelector(".phone-con");
                                    phoneCon.querySelectorAll(".error-tag").forEach(e => e.remove());

                                    phone.classList.remove("error-input");

                                    if (agreement.checked) {
                                        const res = await fetch("/Public/Account/SignUpClient", {
                                            method: "POST",
                                            headers: {
                                                "Content-Type": "application/json",
                                            },
                                            body: JSON.stringify({ 
                                                FirstName: firstName.value, 
                                                LastName: lastName.value, 
                                                Email: email.value, 
                                                Phone: phone.value, 
                                                Password: password.value, 
                                                Country: country.value
                                            })
                                        }).then(res => res.json())
                                        .then(data => {
                                            if (data.success) {
                                                clearForm(signUpClientForm);
                                                window.location.href = data.redirect;
                                            } else {
                                                debug("Fetch", "Failed to send a the data to the database");
                                            }
                                        }); 
                                    } else {
                                        const agreementCon = agreement.closest(".account-body-row-wrap ");
                                        const span = agreementCon.querySelectorAll("span");
                                        span.forEach(s => {
                                            s.classList.add("error-tag");
                                        })
                                    }
                                } else {
                                    const phoneCon = document.querySelector(".phone-con");
                                    phoneCon.querySelectorAll(".error-tag").forEach(e => e.remove());
                                    phoneCon.appendChild(showError("Phone invalid"));

                                    phone.classList.add("error-input");
                                }
                            } else {
                                const passwordCon = document.querySelector(".conPassword-con");
                                passwordCon.querySelectorAll(".error-tag").forEach(e => e.remove());
                                passwordCon.appendChild(showError("Confirm password is not the same as password"));

                                password.classList.add("error-input");
                                conPassword.classList.add("error-input");
                            }
        
                        } else {
                            debug("Strenght", passwordStrength(strength));

                            const passwordCon = document.querySelector(".conPassword-con");
                            passwordCon.querySelectorAll(".error-tag").forEach(e => e.remove());
                            passwordCon.appendChild(showError("Weak password"));

                            password.classList.add("error-input");
                            conPassword.classList.add("error-input");
                        }
                    } else {
                        const emailCon = document.querySelector(".email-con");
                        emailCon.querySelectorAll(".error-tag").forEach(e => e.remove()); 
                        emailCon.appendChild(showError("Email already in use"));
                    }
                } else {
                    const emailCon = document.querySelector(".email-con");
                    emailCon.querySelectorAll(".error-tag").forEach(e => e.remove()); 
                    emailCon.appendChild(showError("Invalid email"));
                }
            } else { 
                inputFields.forEach(i => {
                    if (!i.value.trim()) {
                        i.classList.add("error-input");
                    } else {
                        i.classList.remove("error-input");
                    }
                });
            }
        });

    },

    logIn: function() {
        debug("Page", "Log in");

        // LOCAL VARIABLE
        let visibilityToggle = document.querySelectorAll(".visibilityToggle");
        let logInCient = document.getElementById("logInClient");
        let email = document.getElementById("email");
        let password = document.getElementById("password");

        // PASSWORD VISIBILITY
        visibilityToggle.forEach(i => {
            i.addEventListener("click", function () {
                const passwordInput = i.closest(".password-input");
                const input = passwordInput.querySelector("input");

                togglePasswordVisibility(input, i);
            });
        });

        // FETCH
        logInCient.addEventListener("submit", async function (e) {
            e.preventDefault();

            fetch("/Public/Account/Login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    Email: email.value,
                    Password: password.value
                })
            }).then(res => res.json())
            .then(data => {

                if (isEmpty(email.value) && isEmpty(password.value)) {
                    const con = document.querySelectorAll(".account-body-row");
                    con.forEach(c => {
                        c.querySelector("input").classList.add("error-input");
                    });
                } else {
                    const con = document.querySelectorAll(".account-body-row");
                    con.forEach(c => {
                        c.querySelector("input").classList.remove("error-input");
                    });

                    if (data.clientExists) {
                        const con = email.closest(".email-con");
                        con.querySelectorAll(".error-tag").forEach(e => e.remove());

                        if (isEmpty(password.value)) {
                            const con = password.closest(".password-con");
                            con.querySelectorAll(".error-tag").forEach(e => e.remove());
                            con.appendChild(showError("Password is empty"));
                        } else {
                            if (data.isPassCorrect) {
                                const con = password.closest(".password-con");
                                con.querySelectorAll(".error-tag").forEach(e => e.remove());
                                    
                                // REDIRECT
                                debug("Content", data.message);  
                                clearForm(logInCient);
                                window.location.href = data.redirect; 
                            } else {
                                const con = password.closest(".password-con");
                                con.querySelectorAll(".error-tag").forEach(e => e.remove());
                                con.appendChild(showError("Password is incorrect"));
                            }
                        }
                    } else {
                        const con = email.closest(".email-con");
                        con.querySelectorAll(".error-tag").forEach(e => e.remove());
                        con.appendChild(showError("Email does not exist"));
                    }             
                }

    
            })
            .catch(error => debug("Error", error));
        });
    },

    forgotPass: function() {
        debug("Page", "Forgot pass");

        // LOCAL VARIABLE
        const forgotPassSendEmail = document.getElementById("forgotPassSendEmail");
        const email = document.getElementById("email");
        const sendBtn = document.getElementById("sendBtn");

        forgotPassSendEmail.addEventListener("submit", async function (e) {
            e.preventDefault();
            const form = selectAllInputFields(forgotPassSendEmail);

            if (inputEmptyValidation(form)) {
                clearErrorInputFields(form);

                const checkEmail = await validateEmail(email.value);

                if (checkEmail) {
                    debug("Email", "Email exists");

                    document.querySelectorAll(".error-tag").forEach(e => e.remove());

                    // DISABLE BUTTON
                    sendBtn.disabled = true;

                    const res = await fetch("/Public/Account/SendOTP", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            Email: email.value
                        })
                    });
                    const data = await res.json();
                    
                    window.location.href = data.redirect;
                } else {
                    debug("Email", "Email does not exists");
                    document.querySelectorAll(".error-tag").forEach(e => e.remove());
                    const emailCon = document.querySelector(".emailCon");
                    emailCon.appendChild(showError("Email does not exists"));
                }

            } else {
                clearErrorInputFields(form);
            }
        });

    },

    verification: function() {
        debug("Page", "Verification");

        // LOCAL KNOWLEDGE 
        const verifyOtp = document.getElementById("verifyOtp");
        const code = document.getElementById("code");
        const sendBtn = document.getElementById("sendBtn");
        const removeSessionBtn = document.getElementById("removeSessionBtn");

        verifyOtp.addEventListener("submit", async function (e) {
            e.preventDefault();
            const form = selectAllInputFields(verifyOtp);

            if (inputEmptyValidation(form)) {
                clearErrorInputFields(form);
                const con = code.closest(".otpCon");
                con.querySelectorAll(".error-tag").forEach(e => e.remove());    

                const res = await fetch("/Public/Account/VerifyOTP", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        Code: code.value
                    })
                });

                const data = await res.json();

                debug("Otp", data.message);

                if (data.otp) {
                    // DISABLE BUTTON
                    sendBtn.disabled = true;

                    clearErrorInputFields(form)
                    window.location.href = data.redirect;   
                } else {
                    const con = document.querySelector(".otpCon");
                    con.appendChild(showError(data.message));
                }

            } else {    
                clearErrorInputFields(form);
            }

        });

        // REMOVE SESSION
        removeSessionBtn.addEventListener("click", function () {
            RemoveForgotPassSession();
        });
    },

    resetPass: function() {
        debug("Page", "Reset pass");

        // LOCAL VARIABLE
        const resetPass = document.getElementById("resetPass");
        const password = document.getElementById("password");
        const conPassword = document.getElementById("conPassword");
        const removeSessionBtn = document.getElementById("removeSessionBtn");

        const visibilityToggle = document.querySelectorAll(".visibilityToggle");

        let strength;
        const strength1 = document.getElementById("strength1");
        const strength2 = document.getElementById("strength2");
        const strength3 = document.getElementById("strength3");
        const strength4 = document.getElementById("strength4");

        password.addEventListener("input", function (e) {
            strength = 0;
            const pass = e.target.value;

            document.querySelectorAll(".password-con-item").forEach(e => {
                e.classList.remove("completed");
            });

            if (pass.length >= 8) {
                strength1.classList.add("completed"); 
                strength++;
            }
            
            if (/[A-Z]/.test(pass)) {
                strength2.classList.add("completed"); 
                strength++;
            } 
            
            if (/[a-z]/.test(pass)) {
                strength3.classList.add("completed");
                strength++;
            } 
           
            if (/\d/.test(pass)) {
                strength4.classList.add("completed");
                strength++;
            }
        });

        visibilityToggle.forEach(i => {
            i.addEventListener("click", function () {
                const passwordInput = i.closest(".password-input");
                const input = passwordInput.querySelector("input");

                togglePasswordVisibility(input, i);
            });
        });

        resetPass.addEventListener("submit", async function (e) {
            e.preventDefault(e);
            const form = resetPass.querySelectorAll(".password");

            if (inputEmptyValidation(form)) {
                clearErrorInputFields(form);

                if (password.value === conPassword.value) {
                    document.querySelectorAll(".error-tag").forEach(p => p.remove());

                    debug("Error", "Confirm password is the same as password");
                    if (passwordStrength(strength) === 100) {
                        document.querySelectorAll(".error-tag").forEach(p => p.remove());
                    
                        const res = await fetch("/Public/Account/ResetPassword", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                Password: password.value
                            })
                        });

                        const data = await res.json();
                        debug("Password Data", data.message);
                        window.location.href = data.redirect;
                    } else {
                        const con = document.querySelector(".conPassword");
                        con.appendChild(showError("Weak password"));
                    }
                } else {
                    debug("Error", "Confirm password is not the same as password");
                    document.querySelectorAll(".error-tag").forEach(e => e.remove());
                    const con = document.querySelector(".conPassword");
                    con.appendChild(showError("Confirm password is not the same as password"));
                }
            } else {    
                clearErrorInputFields(form);
            }

        });

        // REMOVE SESSION
        removeSessionBtn.addEventListener("click", function () {
            RemoveForgotPassSession();
        });
    }
};

document.addEventListener("DOMContentLoaded", function () {
    const page = document.body.dataset.page;

    if (PageScripts[page]) {
        PageScripts[page]();
    } 
});


 
