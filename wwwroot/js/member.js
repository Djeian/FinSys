// PAGE BASED INITIALIZATION PATTERN **Para confined yung js code for each page
const PageScripts = {
    dashboard: function() {
        console.log("Dashboard");
    },

    financialTransaction: function() {
        console.log("financialTransaction");
    },

    employees: function() {
        console.log("Employees");
    },

    reports: function() {
        console.log("Reports");
    },

    settings: function() {
        console.log("Settings");
    }
};

document.addEventListener("DOMContentLoaded", function () {
    const page = document.body.dataset.page;

    if (PageScripts[page]) {
        PageScripts[page]();
    }
});