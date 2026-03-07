import { debug, errorInput, formatNumber, isEmpty, showError, validateEmail, togglePasswordVisibility, passwordStrength, clearForm, formatEmail } from "./utils.js";

// GLOBAL VAR

// PAGE BASE INITIALIZATION FOR DYNAMIC JS CODE
const PageScripts = {
    main: function() {
        debug("Page", "Main");

        const hamburger = document.getElementById('hamburger');
        const sidebar = document.getElementById('sidebar');
        const closeBtn = document.getElementById('sidebar-close');

        hamburger.addEventListener('click', () => {
            sidebar.classList.add('active');
            hamburger.style.display = 'none';
        });

        closeBtn.addEventListener('click', () => {
            sidebar.classList.remove('active');
            hamburger.style.display = 'block';
        });
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
    },

    verification: function() {
        debug("Page", "Verification");
    },

    resetPass: function() {
        debug("Page", "Reset pass");
    }
};

document.addEventListener("DOMContentLoaded", function () {
    const page = document.body.dataset.page;

    if (PageScripts[page]) {
        PageScripts[page]();
    } 
});

// wag na muna to, tapusin ko muna buong layout
function togglePasswordVisibility(seeIcon) {

}

 
