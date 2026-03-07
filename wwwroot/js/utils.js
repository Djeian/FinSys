export function pageRefresh() {
    window.location.reload(true);
}

export function debug(type, description) {
    console.log(type,": ", description);
}

export function clearForm(formId) {
    formId.reset();
}

export function setDateToday(dateInput) {
    let date = new Date();

    let day = ("0" + date.getDate()).slice(-2);
    let month = ("0" + (date.getMonth() + 1)).slice(-2);
    let today = date.getFullYear() + "-" + month + "-" + day;

    dateInput.value = today;
}

export function formatNumber(value) {
    value = String(value);
    value = value.replace(/\D/g, '');

    if (value.length > 2 && value.length <= 5)
        return value.replace(/(\d{2})(\d+)/, "$1 $2");

    if (value.length > 5)
        return value.replace(/(\d{2})(\d{3})(\d+)/, "$1 $2 $3");

    return value;
}

export function isEmpty(value) {
    return (value == null || (typeof value === "string" && value.length === 0));
}

export function errorInput(id) {
    id.classList.add("error-input");
}

export async function validateEmail(email) {
    const res = await fetch("/Account/CheckEmailExists", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            Email: email
        })
    });

    const data = await res.json();

    return data.signedIn;
}

export function formatEmail(email) {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
}

export function showError(message) {
    const p = document.createElement("p");
    p.textContent = message;
    p.classList.add("error-tag");
    return p;
}

export function togglePasswordVisibility(input, icon) {
    const con = icon.closest(".password-input");

    const seeIcon = con.querySelector(".see-eye");
    const unseeIcon = con.querySelector(".unsee-eye");

    if (input.type === "password") {
        input.type = "text";

        seeIcon.classList.remove("see");
        unseeIcon.classList.add("see");
    } else {
        input.type = "password";

        seeIcon.classList.add("see");
        unseeIcon.classList.remove("see");
    }
}

export function passwordStrength(value) {
    const strength = (value / 4) * 100;
    return strength;
}

export function removeUserSession() {
    window.addEventListener("pageshow", function (event) {
        debug("Check", "Remove use session");
        fetch("/Member/Home/Logout", { method: "POST" })
        .then(() => {
            window.location.href = "/Public/Account/LogIn?error=accessdenied";
        });
    });
}