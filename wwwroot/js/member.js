// GLOBAL ID / VAR
const modal = document.getElementById("modal");
const modalContent = document.querySelectorAll(".modal-content");
const businessRegistrationModal = document.getElementById("businessRegistrationModal");
const employeeModal  = document.getElementById("employeeModal");
const editTransactionModal = document.getElementById("editTransactionModal");
const alertModal = document.getElementById("alertModal");
let form = "";

// MEDIA QUERY
const navOverlayQuery = window.matchMedia('(max-width: 1000px)');

// NAV
//let navListCon = document.getElementById("navListCon"); // UNCOMMENT MO PAG NAG SPA / AJAX NAVIGATION KANA
let openNavVar = document.getElementById("openNav");
let closeNavVar = document.getElementById("closeNav");

// ICONS
const logOutIconModal = document.getElementById("logOutIconModal");

// TEXTS
const alertSubhead = document.getElementById("alertSubhead");
const alertBtnText = document.getElementById("alertBtnText");
const employeeModalHeadText = document.getElementById("employeeModalHeadText");
const employeeModalBtnText = document.getElementById("employeeModalBtnText");

// BUTTONS
const employeeModalBtn = document.getElementById("employeeModalBtn");
const alertBtn = document.getElementById("alertBtn");
const cancel = document.querySelectorAll(".cancel");
const closeIcon = document.querySelectorAll(".close-icon");

// NAV OVERLAY
navOverlayChange(navOverlayQuery); // IT RUNS THIS EVERYTIME YOU REFRESH
navOverlayQuery.addEventListener("change", navOverlayChange); // LISTENER WATCH FOR CHANGES PARA FLEXIBLE

// NAV LIST ACTIVE HANDLER
// This handles nav list active effect, if ever man na magawa kong dynamic SPA style tong website ito gamitin mo 
/* navListCon.addEventListener("click", function (e) {
    e.target.classList.add("active-nav-item");
}); */

// CANCEL / CLOSE BTN
cancel.forEach(c => {
    c.addEventListener("click", function () {
        closeModal();
    });
});

closeIcon.forEach(c => {
    c.addEventListener("click", function () {
        closeModal();
    });
});

// OUTSIDE CLICK REMOVE THE MODAL
modal.addEventListener("click", function (e) {
    if (e.target === modal) {
        closeModal();
    } 
});

// ALERT MODAL BUTTON DATA ATTRIBUTE HANDLER
alertBtn.addEventListener("click", function () {
    const action = this.dataset.action;
    debug("Button action check", action); // DEBUGGER

    switch (action) {
        case "clearForm": 
            clearForm(form);
            closeModal();
            break;
        case "removeEmployee":
            // create a function that sends a req to the controller with js fetch 
            closeModal();
            break;
        case "removeTransaction":
            closeModal();
            break;
        default:
            debug("Action", "No action data attribute received");
            break;
    }
});

// EMPLOYEE MODAL BUTTON DATA ATTRIBUTE HANDLER
employeeModalBtn.addEventListener("click", function () {
    const action = this.dataset.action;
    debug("Button action check", action);
    
    switch (action) {
        case "addEmployee":
            // Gawa ka ng fetch function for sending the data papunta sa controller, rather than using the form itself
            break;
        case "editEmployee":
            break;
        default:
            debug("Action", "No specified action to do");
            break;
    }
});


// PAGE BASED INITIALIZATION PATTERN **Para confined yung js code for each page
const PageScripts = {
    dashboard: function() {
        debug("Page", "Dashboard");
    },

    financialTransactions: function() {
        debug("Page", "Financial Transaction");

        // PICKER
        const pickerAllTransaction = document.getElementById("pickerAllTransaction");
        const pickerIncome = document.getElementById("pickerIncome");
        const pickerExpense = document.getElementById("pickerExpense");

        pickerAllTransaction.addEventListener("click", function () {
            pickerAllTransaction.classList.add("picked");
            pickerIncome.classList.remove("picked");
            pickerExpense.classList.remove("picked");
        });

        pickerIncome.addEventListener("click", function () {
            pickerIncome.classList.add("picked");
            pickerExpense.classList.remove("picked");
            pickerAllTransaction.classList.remove("picked");
        });

        pickerExpense.addEventListener("click", function () {
            pickerExpense.classList.add("picked");
            pickerAllTransaction.classList.remove("picked");
            pickerIncome.classList.remove("picked");
        });

        // EDIT TRANSACTION
        const editTransactionBtn = document.querySelectorAll(".editTransactionBtn");
        editTransactionBtn.forEach(e => {
            e.addEventListener("click", function () {
                showModalEditTransaction();
            });
        });

        // REMOVE TRANSACTION
        const deleteTransactionBtn = document.querySelectorAll(".deleteTransactionBtn");
        deleteTransactionBtn.forEach(d => {
            d.addEventListener("click", function () {
                showModalAlert("Do you want to remove this transaction?", "Remove Transaction", "removeTransaction");
            });
        });
    },

    employees: function() {
        debug("Page", "Employees");

        // ADD EMPLOYEE
        const addEmployeeBtn = document.getElementById("addEmployeeBtn");
        addEmployeeBtn.addEventListener("click", function () {
            showModalEmployee("Add", "Add", "addEmployee");
        });

        // EDIT EMPLOYEE
        const editEmployeeBtn = document.querySelectorAll(".editEmployeeBtn");
        editEmployeeBtn.forEach(e => {
            e.addEventListener("click", function () {
                showModalEmployee("Edit", "Edit", "editEmployee");
            });
        });

        // DELETE EMPLOYEE
        const deleteEmployeeBtn = document.querySelectorAll(".deleteEmployeeBtn");
        deleteEmployeeBtn.forEach(d => {
            d.addEventListener("click", function () {
                showModalAlert("Do you want to remove this employee?", "Remove Employee", "removeEmployee");
            });
        });
    },

    reports: function() {
        debug("Page", "Reports");

        // INSERT FORM ID TO FORM VAR
        form = document.getElementById("addTransaction");

        // DATE INPUT FOCUSED OUTLINE DESIGN
        const dateBtn = document.getElementById("date");
        dateBtn.addEventListener("focus", function () {
            dateBtn.classList.add("active-input");
        });

        dateBtn.addEventListener("blur", function () {
            dateBtn.classList.remove("active-input");
        });

        setDateToday(dateBtn);

        // CLEAR FORM
        const clearForm = document.getElementById("clearForm");
        clearForm.addEventListener("click", function () {
            showModalAlert("Do you want to clear the form?", "Clear Form", "clearForm");
        });
    },

    settings: function() {
        debug("Page", "Settings");

        // LOG OUT BUTTON
        var logOutBtn = document.getElementById("logOutBtn");
        logOutBtn.addEventListener("click", function () {
            showModalAlert("Do you want to log out?", "Log Out", "logOut");
        });
    }
};

document.addEventListener("DOMContentLoaded", function () {
    const page = document.body.dataset.page;

    if (PageScripts[page]) {
        PageScripts[page]();
    }

});

// FUNCTIONS
// FORMAT PHONE NUMBER
function formatNumber(value) {
    // Remove non-digits
    value = value.replace(/\D/g, '');

    // Apply format: 2 3 4 grouping
    if (value.length > 2 && value.length <= 5)
        return value.replace(/(\d{2})(\d+)/, "$1 $2");

    if (value.length > 5)
        return value.replace(/(\d{2})(\d{3})(\d+)/, "$1 $2 $3");

    return value;
}

function navOverlayChange(event) {
    if (event.matches) {
        debug("Media Query", "It works"); // REMOVE THIS
        document.body.classList.add("relative");
        openNavVar.classList.add("absolute");

        // CLEAN UP SHOW AND HIDDEN CLASS
        closeNavVar.classList.remove("hidden");
        openNavVar.classList.remove("show");

        closeNavVar.addEventListener("click", function (e) {
            if (e.target.closest(".nav-item")) return;  
            openNavVar.classList.add("show");

            debug("Text Sidebar", "Open");
        });

        openNavVar.addEventListener("click", function () {
            openNavVar.classList.remove("show");
        
            debug("Text Sidebar", "Close");
        });


    } else {
        document.body.classList.remove("relative");
        openNavVar.classList.remove("absolute");

        // CLEAN UP SHOW AND HIDDEN CLASS
        closeNavVar.classList.remove("hidden");
        openNavVar.classList.remove("show");

        // NAV SIDE BAR OPEN / CLOSE
        closeNavVar.addEventListener("click", function (e) {
            if (e.target.closest(".nav-item")) return;  
            closeNav.classList.add("hidden");
            openNavVar.classList.add("show");
        });

        openNavVar.addEventListener("click", function () {
            closeNavVar.classList.remove("hidden");
            openNavVar.classList.remove("show");
        });
    }
}

function showModalEditTransaction() {
    modal.classList.add("show");
    editTransactionModal.classList.add("show");
}

function showModalEmployee(head, buttonText, actions) {
    modal.classList.add("show");
    employeeModal.classList.add("show");

    employeeModalBtn.dataset.action = actions;
    employeeModalHeadText.textContent = head;
    employeeModalBtnText.textContent = buttonText;
}

function showModalAlert(subhead, buttonText, actions) {
    modal.classList.add("show");
    alertModal.classList.add("show");

    if (actions === "logOut") {
        logOutIconModal.classList.remove("hidden");
        alertBtn.dataset.action = actions;
        alertSubhead.textContent = subhead;
        alertBtnText.textContent = buttonText;
    } else {
        alertBtn.dataset.action = actions;
        alertSubhead.textContent = subhead;
        alertBtnText.textContent = buttonText;
    }
}   

function clearForm(formId) {
    formId.reset();
}

function setDateToday(dateInput) {
    let date = new Date();

    let day = ("0" + date.getDate()).slice(-2);
    let month = ("0" + (date.getMonth() + 1)).slice(-2);
    let today = date.getFullYear() + "-" + month + "-" + day;

    dateInput.value = today;
}

function closeModal() {
    modalContent.forEach(m => {
        m.classList.remove("show");
    });
    modal.classList.remove("show");
}

function pageRefresh() {
    window.location.reload(true);
}

function debug(type, description) {
    console.log(type,": ", description);
}