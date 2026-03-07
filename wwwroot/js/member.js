
// GLOBAL ID / VAR
const companyNameNav = document.getElementById("companyNameNav");
const companyIndustryNav = document.getElementById("companyIndustryNav");

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
const alertHead = document.getElementById("alertHead");
const alertSubhead = document.getElementById("alertSubhead");
const alertBtnText = document.getElementById("alertBtnText");
const employeeModalHeadText = document.getElementById("employeeModalHeadText");
const employeeModalBtnText = document.getElementById("employeeModalBtnText");

// BUTTONS
const employeeModalBtn = document.getElementById("employeeModalBtn");
const alertBtn = document.getElementById("alertBtn");
const cancel = document.querySelectorAll(".cancel");
const cancelBusinessRegistration = document.getElementById("cancelBusinessRegistration");
const closeIcon = document.querySelectorAll(".close-icon");

// NAV OVERLAY
navOverlayChange(navOverlayQuery); // IT RUNS THIS EVERYTIME YOU REFRESH
navOverlayQuery.addEventListener("change", navOverlayChange); // LISTENER WATCH FOR CHANGES PARA FLEXIBLE

// NAV LIST ACTIVE HANDLER
// This handles nav list active effect, if ever man na magawa kong dynamic SPA style tong website ito gamitin mo 
/* navListCon.addEventListener("click", function (e) {
    e.target.classList.add("active-nav-item");
}); */


// DISPLAY COMPANY NAME AND INDUSTRY
displayCompanyInfo();

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
        case "logout": 
            closeModal();
            Logout();
            break;
        default:
            debug("Action", "No action data attribute received");
            break;
    }
});

// EMPLOYEE MODAL BUTTON DATA ATTRIBUTE HANDLER
let employeeBtnAction;
employeeModalBtn.addEventListener("click", function () {
    const action = this.dataset.action;
    debug("Button action check", action);
        
    employeeBtnAction = action;

    switch (action) {
        case "addEmployee":
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

        // LOCAL VARIABLE
        let companyRegistration = document.getElementById("companyRegistration");
        let companyName = document.getElementById("companyName");
        let companyIndustry = document.getElementById("companyIndustry");
        let companyCountry = document.getElementById("companyCountry");
        let companyEmployees = companyRegistration.elements["employees"].value;

        let income = document.getElementById("income");
        let expense = document.getElementById("expense");
        let netProfit = document.getElementById("netProfit");
        let expenseStatement = document.getElementById("expenseStatement");
        let netProfitStatement = document.getElementById("netProfitStatement");

         // DISPLAY CLIENT INFO
        fetch("/Member/Home/IsClientPayed")
            .then(res => res.json())
            .then(client => {
                debug("Is payed", client.isPayed);

                if (client.isPayed) {
                    modal.classList.remove("show");
                    businessRegistrationModal.classList.remove("show");
                } else {
                    modal.classList.add("show");
                    businessRegistrationModal.classList.add("show");

                    // CANCEL
                    cancelBusinessRegistration.addEventListener("click", function () {
                        Logout();
                    })
                }
            })
            .catch(err => debug("Error", err));

        // DISPLAY DASHBOARD
        displayIncome(income);
        displayExpense(expense);
        displayNetProfit(netProfit);
        displayCommonSizeStatement(expenseStatement, netProfitStatement);

        if (window.matchMedia("(max-width: 760px)").matches) {
            // PIE CHART DISPLAY
            const pieGraph = document.getElementById("pieGraphIncExpComp");

            fetch("GetIncomeExpenseComparisonPieGraph")
            .then(res => res.json())
            .then(data => {
                debug("data compa", data);
                displayPieGraph(pieGraph, data);
            })
            .catch(err => {
                debug("Error", err);
            });
        } else {
            // LINE GRAPH DISPLAY
            const lineGraph = document.getElementById("lineGraphIncExpComp");

            fetch("/Member/Home/GetIncomeExpenseComparisonLineGraph")
            .then(res => res.json())
            .then(data => {
                debug("Line Graph", data);
                displayLineGraphIncExpComp(lineGraph, data);
            })
            .catch(err => {
                debug("Error", err);
            });
        }

        // BAR GRAPH DISPLAY
        const barGraph = document.getElementById("barGraph");
        fetch("/Member/Home/GetExpenseBreakdown")
        .then(res => res.json())
        .then(data => {
            debug("Expense Breakdown Data", data);
            displayBarGraph(barGraph, data);
        })
        .catch(err => {
            debug("Error", err)
        });

        // COMPANY REGISTRATION
        companyRegistration.addEventListener("submit", async function (e) {
            e.preventDefault();

            let inputFields = companyRegistration.querySelectorAll("input, select");

            const checkInputFields = Array.from(inputFields).every(function (input) {
                return input.value.trim().length > 0;
            });

            if (checkInputFields) {

                inputFields.forEach(i => {
                    i.classList.remove("error-input");
                })

                const res = await fetch("/Member/Home/CompanyRegistration", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        CompanyName: companyName.value,
                        CompanyIndustry: companyIndustry.value,
                        CompanyCountry: companyCountry.value,
                        Employees: companyEmployees
                    })
                }).then(res => res.json())
                .then(data => {
                    debug("Company Data", data.message);

                    if (data.isPayed) {
                        modal.classList.remove("show");
                        businessRegistrationModal.classList.remove("show");
                        displayCompanyInfo();
                    } else {
                        debug("Company registration", "Company has not been registered" + company);
                    }
                });
            } else {
                inputFields.forEach(i => {
                    if (!i.value.trim()) {
                        i.classList.add("error-input");
                    } else {
                        i.classList.remove("error-input");
                    }
                })
            }

        });


    },

    financialTransactions: function() {
        debug("Page", "Financial Transaction");

        // LOCAL VARIABLE
        const transactionTable = document.getElementById("transactionTable"); // just in case
        const editTransaction = document.getElementById("editTransaction");
        const category = document.getElementById("category");
        const amount = document.getElementById("amount");
        const payee = document.getElementById("payee");
        const description = document.getElementById("description");
        const updateTransactionBtn = document.getElementById("updateTransactionBtn");


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

        // DISPLAY TRANSACTIONS
        let selectedType;
        loadTransactions();

        document.querySelector(".financial-transaction-picker").addEventListener("click", function (e) {
            const allTransaction = e.target.closest(".pickerAllTransaction")?.dataset.item;
            const income = e.target.closest(".pickerIncome")?.dataset.item;
            const expenses = e.target.closest(".pickerExpense")?.dataset.item;

            if (allTransaction) {
                debug("Picker", "all transaction " + allTransaction);
                selectedType = allTransaction;
                pickerTransaction(allTransaction);
            } else if (income) {
                debug("Picker", "Income " + income);
                selectedType = income;
                pickerTransaction(income);
            } else if (expenses) {  
                debug("Picker", "Expenses " + expenses);
                selectedType = expenses;
                pickerTransaction(expenses);
            } else {
                debug("Picker error", "Nothing picked");
            }
        });

        // EDIT TRANSACTION
        editTransaction.addEventListener("submit", async function (e) {
            e.preventDefault();
            const form = selectAllInputFields(editTransaction);
            const id = updateTransactionBtn.dataset.id;
            const type = editTransaction.elements["editTransactionType"].value;

            if (inputEmptyValidation(form)) {
                clearErrorInputFields(form);

                await fetch("/Member/Home/EditFinancialTransaction", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        Id: id,
                        Type: type,
                        Category: category.value,
                        Amount: amount.value,
                        Payee: payee.value,
                        Description: description.value
                    })
                }).then(res => res.json())
                .then(data => {
                    debug("Message", data.message);
                    clearForm(editTransaction);
                    closeModal();
                })
                .catch(err => debug("Error", err));

                await pickerTransaction(selectedType);
            } else {
                clearErrorInputFields(form);
            }
        });

        // ONCLICK LISTENER FOR EDIT AND DELETE BUTTON
        let transactionId;
        document.addEventListener("click", function (e) {
            const click = e.target;
            const editBtn = click.closest(".editTransactionBtn");
            const deleteBtn = click.closest(".deleteTransactionBtn");

            if (editBtn) {
                const id = editBtn.dataset.id;
                debug("Clicked", "Edit" + id);
                displayTransaction(id);
            } else if (deleteBtn) {
                transactionId = deleteBtn.dataset.id;
                debug("Clicked", "Delete" + transactionId);

                showModalAlert("Do you want to remove this transaction?", "Remove Transaction", "removeEmployee");
            }
        });
        
        document.querySelector(".confirm").addEventListener("click", function () {
            deleteTransaction(transactionId, selectedType);
        });
        
    },

    employees: function() {
        debug("Page", "Employees");

        // LOCAL VARIABLE
        const employeeRegistration = document.getElementById("employeeRegistration");
        const firstName = document.getElementById("firstName");
        const middleName = document.getElementById("middleName");
        const lastName = document.getElementById("lastName");
        const role = document.getElementById("role")
        const position = document.getElementById("position");
        const email = document.getElementById("email");
        const phone = document.getElementById("phone");
        const address = document.getElementById("address");


        // SEARCH EMPLOYEE
        const search = document.getElementById("searchEmployee");

        let timeout;
        search.addEventListener("input", function () {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                employeeSearch(search.value);
            }, 200);
        });

        // PHONE FORMAT
        phone.addEventListener("input", function (e) {
            e.target.value = formatNumber(e.target.value);
        });

        // CANCEL / CLOSE BTN
        cancel.forEach(c => {
            c.addEventListener("click", function () {
                clearForm(employeeRegistration);
                closeModal();
            });
        });

        closeIcon.forEach(c => {
            c.addEventListener("click", function () {
                clearForm(employeeRegistration);
                closeModal();
            });
        });

        // OUTSIDE CLICK REMOVE THE MODAL
        modal.addEventListener("click", function (e) {
            if (e.target === modal) {
                closeModal();
            } 
        });

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

        employeeRegistration.addEventListener("submit", async function (e) {
            e.preventDefault();
            const form = selectAllInputFields(employeeRegistration);

            if (employeeBtnAction === "addEmployee") { 
                
                debug("Action", "Add");

                if (inputEmptyValidation(form)) {

                    // EMAIL AND PHONE AUTH, checks if it already exists
                    /*if (isEmpty(email.value) && isEmpty(phone.value)) {
                        const con = document.querySelectorAll(".modal-body-row");
                        con.forEach(i => {
                            i.querySelectorAll("input").classList.add("error-input");
                        })
                    }*/

                    debug("Error", "Employee Added");

                    await fetch("/Member/Home/EmployeeRegistration", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            FirstName: firstName.value,
                            MiddleName: middleName.value,
                            LastName: lastName.value,
                            Position: position.value,
                            Role: role.value,
                            Email: email.value,
                            Phone: phone.value,
                            Address: address.value
                        })
                    }).then(res => res.json())
                    .then(data => {
                        debug("Employee Data", data);
                        clearForm(employeeRegistration);
                        closeModal();
                    })
                    .catch(err => debug("Error", err));

                    await loadEmployees();
                } else {
                    clearErrorInputFields(form);
                }
        
            } else {

                debug("Action", "edit");
                // EDIT
                if (inputEmptyValidation(form)) {
                    const employeeId = employeeModalBtn.dataset.id;

                    await fetch("/Member/Home/EditEmployee", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            Id: employeeId,
                            FirstName: firstName.value,
                            MiddleName: middleName.value,
                            LastName: lastName.value,
                            Position: position.value,
                            Role: role.value,
                            Email: email.value,
                            Phone: phone.value,
                            Address: address.value  
                        })
                    }).then(res => res.json())
                    .then(data => {
                        debug("Employee", data.message);
                        clearForm(employeeRegistration);
                        closeModal();
                        loadEmployees();
                    })
                    .catch(err => debug("Error", err));

                } else {
                    clearErrorInputFields(form);
                }
            }
        });


        // DISPLAY EMPLOYEE
        loadEmployees();
        let employeeId;
        document.addEventListener("click", function (e) {
            const employeeCardId = e.target.closest(".employees-card");
            const editBtn = e.target.closest(".editEmployeeBtn");
            const deleteBtn = e.target.closest(".deleteEmployeeBtn");
            const btn = e.target.closest(".alertBtn");

            if (editBtn) {
                const employeeId = editBtn.dataset.id;
                debug("Btn", "Clicked " + employeeId);
                displayEmployee(employeeId);
            } else if (deleteBtn) {
                employeeId = employeeCardId.dataset.id;
                debug("Action", "delete " + employeeId);
                
                showModalAlert("Do you want to remove this employee?", "Remove Employee", "removeEmployee");

            }
        });

        document.querySelector(".confirm").addEventListener("click", function () {
            deleteEmployee(employeeId);
        });
        
    },

    reports: function() {
        debug("Page", "Reports");

        // LOCAL VARIABLE
        form = document.getElementById("addTransaction");
        const dateOfTransaction = document.getElementById("date");
        const category = document.getElementById("category");
        const description = document.getElementById("description");
        const amount = document.getElementById("amount");
        const payee = document.getElementById("payee");

        // CANCEL / CLOSE BTN
        cancel.forEach(c => {
            c.addEventListener("click", function () {
                closeModal();
            });
        });

        closeIcon.forEach(c => {
            c.addEventListener("click", function () {
                closeModal();
                resetModal();
            });
        });

        // OUTSIDE CLICK REMOVE THE MODAL
        modal.addEventListener("click", function (e) {
            if (e.target === modal) {
                closeModal();
                resetModal();
            } 
        });

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

        // INSERT FORM ID TO FORM VAR
        form.addEventListener("submit", async function (e) {
            e.preventDefault();
            const type = form.elements["transactionType"].value; // GET type value

            const formTransaction = selectAllInputFields(form);

            if (inputEmptyValidation(formTransaction)) {
                clearErrorInputFields(formTransaction);
                
                await fetch("/Member/Home/RecordFinancialTransaction", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        Type: type,
                        DateOfTransaction: dateOfTransaction.value,
                        Category: category.value,
                        Description: description.value,
                        Amount: amount.value,
                        Payee: payee.value
                    })
                }).then(res => res.json())
                .then(data => {
                    debug("Transaction", data);
                    showModal("Succes!", "Successfully added a new transaction.");
                })
                .catch(err => debug("Error", err));

            } else {
                clearErrorInputFields(formTransaction);
            }


        });
    },

    settings: function() {
        debug("Page", "Settings");

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

        // LOG OUT BUTTON
        var logOutBtn = document.getElementById("logOutBtn");
        logOutBtn.addEventListener("click", function () {
            showModalAlert("Do you want to log out?", "Log Out", "logout");
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
async function employeeSearch(input) {
    try {
        const res = await fetch("/Member/Home/Search", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                EmployeeName: input
            })
        });

        const data = await res.json();

        debug("Employee", data);

        const employeesCardCon = document.getElementById("employeesCardCon");
        displayEmployees(data, employeesCardCon);
    } catch (err) {
        debug("Employee Display Error", err);
    }
}

function displayLineGraphIncExpComp(lineGraph, data) {
     const legendItems = [
        { label: "Income", color: "#53AC7F" },  
        { label: "Expense", color: "#E64C4C" } 
    ];

    const width = lineGraph.clientWidth;
    const height = 400;
    const margin = { top: 20, right: 40, bottom: 60, left: 60 };

    const svg = d3.select(`#${lineGraph.id}`)
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const chart = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);


    const xScale = d3.scaleBand()
        .domain(data.map(d => d.month))
        .range([0, chartWidth])
        .padding(0.1);

    const yMax = d3.max(data, d => Math.max(d.income, d.expense));

    const yScale = d3.scaleLinear()
        .domain([0, yMax])
        .range([chartHeight, 0]);

    const yAxis = d3.axisLeft(yScale)
        .tickFormat(d3.format(".2s"));

    chart.append("g")
        .attr("transform", `translate(0,${chartHeight})`)
        .call(d3.axisBottom(xScale));

    chart.append("g")
        .call(yAxis);


    const line = d3.line()
        .x(d => xScale(d.month) + xScale.bandwidth() / 2) 
        .y(d => yScale(d.value));

    const incomeLineData = data.map(d => ({ month: d.month, value: d.income }));
    const expenseLineData = data.map(d => ({ month: d.month, value: d.expense }));

    chart.append("path")
        .datum(incomeLineData)
        .attr("fill", "none")
        .attr("stroke", "#53AC7F") 
        .attr("stroke-width", 2)
        .attr("d", line);

    chart.append("path")
        .datum(expenseLineData)
        .attr("fill", "none")
        .attr("stroke", "#E64C4C")
        .attr("stroke-width", 2)
        .attr("d", line);

    chart.selectAll(".income-point")
        .data(incomeLineData)
        .enter()
        .append("circle")
        .attr("class", "income-point")
        .attr("cx", d => xScale(d.month) + xScale.bandwidth() / 2)
        .attr("cy", d => yScale(d.value))
        .attr("r", 4)
        .attr("fill", "#53AC7F");

    chart.selectAll(".expense-point")
        .data(expenseLineData)
        .enter()
        .append("circle")
        .attr("class", "expense-point")
        .attr("cx", d => xScale(d.month) + xScale.bandwidth() / 2)
        .attr("cy", d => yScale(d.value))
        .attr("r", 4)
        .attr("fill", "#E64C4C");

    const itemSpacing = 90; 
    const circleRadius = 6;
    const totalLegendWidth = legendItems.length * itemSpacing;
    const legendY = chartHeight + margin.top + 40;
    const legendX = (width - totalLegendWidth) / 2; 
    const legend = svg.append("g")
            .attr("transform", `translate(${legendX}, ${legendY})`);


    legendItems.forEach((d, i) => {
        // INCOME
        legend.append("circle")
            .attr("cx", i * itemSpacing)
            .attr("cy", 0)
            .attr("r", 6)
            .attr("fill", d.color);

        legend.append("text")
            .attr("x", i * itemSpacing + circleRadius + 5)
            .attr("y", 2)
            .text(d.label)
            .attr("alignment-baseline", "middle");
    });

}

function displayPieGraph(pieGraph, data) {
    const width = pieGraph.clientWidth;  
    const height = 400;
    const radius = Math.min(width, height) / 2;

    const svg = d3.select(`#${pieGraph.id}`)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width/2}, ${height/2})`);

    const pie = d3.pie()
    .value(d => d.value);

    const arc = d3.arc()
    .innerRadius(0)    
    .outerRadius(radius);

    const color = d3.scaleOrdinal()
    .domain(data.map(d => d.key))
    .range([ '#53AC7F', '#E64C4C']);

    const label = d3.arc()
        .innerRadius(0)
        .outerRadius(radius - 80);

    svg.selectAll("path")
        .data(pie(data))
        .enter()
        .append("path")
        .attr("d", arc)
        .attr("fill", d => {
            if(d.data.key === "Income") return "#53AC7F"; 
            if(d.data.key === "Expense") return "#E64C4C"; 
            return "#ccc"; 
        })
        .attr("stroke", "white")
        .style("stroke-width", "2px");

    const total = d3.sum(data, d => d.value);

    svg.selectAll("text")
        .data(pie(data))
        .enter()
        .append("text")
        .attr("transform", d => `translate(${label.centroid(d)})`)
        .style("text-anchor", "middle")
        .html(d => `
            <tspan x="2" dy="0" class="percentage">${((d.data.value / total) * 100).toFixed(1)}%</tspan>
            <tspan x="0" dy="20">${d.data.key}</tspan>
        `);
}

function displayBarGraph(barGraph, data) {
    // IF EVER CHANGED THE PASSED DATA KEY AND OBJECT NAME TO  {key: object} for modularity

    if (window.matchMedia("(max-width: 760px)").matches) {
        const width = barGraph.clientWidth;
        const height = 300;
        const margin = { top: 20, right: 20, bottom: 40, left: 100 }; 

        const svg = d3.select(`#${barGraph.id}`)
            .append("svg")
            .attr("viewBox", `0 0 ${width} ${height}`)
            .attr("width", "100%")
            .attr("height", height);

        const chart = svg.append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

        const chartWidth = width - margin.left - margin.right;
        const chartHeight = height - margin.top - margin.bottom;

        const xScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.value)])
            .range([0, chartWidth]);

        const yScale = d3.scaleBand()
            .domain(data.map(d => d.key))
            .range([0, chartHeight])
            .padding(0.2);

        const maxLabels = Math.floor(chartWidth / 80);
        const xAxis = d3.axisBottom(xScale)
        .tickValues(xScale.domain().filter((d, i) => !(i % Math.ceil(data.length / maxLabels))));

        chart.selectAll("rect")
            .data(data)
            .enter()
            .append("rect")
            .attr("y", d => yScale(d.key))
            .attr("x", 0) 
            .attr("height", yScale.bandwidth())
            .attr("width", d => xScale(d.value))
            .attr("fill", "steelblue");

        chart.append("g")
            .attr("transform", `translate(0, ${chartHeight})`)
            .call(d3.axisBottom(xScale)
                    .tickFormat(d3.format(".2s")))
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end");

        chart.append("g")
            .call(d3.axisLeft(yScale));
            
    } else {
        const width = barGraph.clientWidth;
        const height = 300;

        const margin = { top: 20, right: 20, bottom: 40, left: 50 };

        const svg = d3.select(`#${barGraph.id}`)
                    .append("svg")
                    .attr("viewBox", `0 0 ${width} ${height}`)
                    .attr("width", "100%")
                    .attr("height", height);

        const chart = svg
            .append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

        const chartWidth = width - margin.left - margin.right;
        const chartHeight = height - margin.top - margin.bottom;

        const xScale = d3
            .scaleBand()
            .domain(data.map(d => d.key)) // CHANGE THIS BASED ON THE KEY
            .range([0, chartWidth])
            .padding(0.2);

        const yScale = d3
            .scaleLinear()
            .domain([0, d3.max(data, d => d.value)])
            .range([chartHeight, 0]);

        const yAxis = d3.axisLeft(yScale)
        .tickFormat(d3.format(".2s"));

        chart
            .selectAll("rect")
            .data(data)
            .enter()
            .append("rect")
            .attr("x", d => xScale(d.key)) // CHANGE THIS BASED ON THE KEY
            .attr("y", d => yScale(d.value))
            .attr("width", xScale.bandwidth())
            .attr("height", d => chartHeight - yScale(d.value))
            .attr("fill", "steelblue");

        chart
            .append("g")
            .attr("transform", `translate(0, ${chartHeight})`)
            .call(d3.axisBottom(xScale));

        chart
            .append("g")
            .call(yAxis);
    }
}

async function displayStatementIcons(expense) {
    let incomeIncreaseIcon = document.querySelector(".increasedIncome");
    let incomeDecreaseIcon = document.querySelector(".decreasedIncome");

    let expenseIncreaseIcon = document.querySelector(".increasedExpense");
    let expenseDecreaseIcon = document.querySelector(".decreasedExpense");

    let netProfitIncreasedIcon = document.querySelector(".increasedNetProfit");
    let netProfitDecreasedIcon = document.querySelector(".decreasedNetProfit");

    let financialValue = document.querySelectorAll(".financialValue");

    if (expense > 100) {
        debug("Expense", "HIgh");

        incomeIncreaseIcon.classList.remove("show");
        incomeDecreaseIcon.classList.add("show");

        expenseIncreaseIcon.classList.add("show");
        expenseDecreaseIcon.classList.remove("show");

        netProfitIncreasedIcon.classList.remove("show");
        netProfitDecreasedIcon.classList.add("show");

        financialValue.forEach(v => {
            v.classList.add("decrease");
        })

    } else {
        debug("Expense", "low");
        incomeIncreaseIcon.classList.add("show");
        incomeDecreaseIcon.classList.remove("show");

        expenseIncreaseIcon.classList.remove("show");
        expenseDecreaseIcon.classList.add("show");

        netProfitIncreasedIcon.classList.add("show");
        netProfitDecreasedIcon.classList.remove("show"); 

        financialValue.forEach(v => {
            v.classList.remove("decrease");
        })
    }
}

async function displayCommonSizeStatement(expenseId, netProfitId) {
    try {
        const res = await fetch("/Member/Home/GetCommonSizeStatement");
        const data = await res.json();

        debug("Expense %", data.expense);
        expenseId.textContent = data.expense;
        netProfitId.textContent = data.netProfit;
        displayStatementIcons(data.expense);
    } catch (err) {
        debug("Error", err);
    }
}

async function displayNetProfit(id) {
    try {
        const res = await fetch("/Member/Home/GetNetProfit");
        const data = await res.json();

        id.textContent = data.totalProfit;
        debug("Net profit", data.totalProfit);
    } catch (err) {
        debug("Error", err);
    } 
}

async function displayExpense(id) {
    try {
        const res = await fetch("/Member/Home/GetExpense");
        const data = await res.json();

        id.textContent = data.totalExpense;
        debug("Total Expense", data.totalExpense);
    } catch (err) {
        debug("Error", err);
    }
}

async function displayIncome(id) {
    
    try {
        const res = await fetch("/Member/Home/GetIncome");
        const data = await res.json();

        id.textContent = data.totalIncome;
        debug("Total Income", data.totalIncome);
    } catch (err) {
        debug("Error", err);
    }
}

async function pickerTransaction(selected) {

    if (selected === "Income" || selected === "Expenses") {
        if (selected === "Expenses") {
            selected = "Expense";
        }

        try {
            const res = await fetch("/Member/Home/GetSelectedTransactions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ Selected: selected })
            });

            const transactions = await res.json();

            if (window.innerWidth < 760) {
                const cardCon = document.getElementById("transactionCardCon");
                displayTransactions(transactions, cardCon);
            } else {
                const table = document.getElementById("transactionTable");
                displayTransactions(transactions, table);
            }
        } catch (err) {
            debug("Error", err);    
        }
    } else {
        loadTransactions();
    }
}

async function deleteTransaction(id, type) {
    const res = await fetch("/Member/Home/DeleteTransaction", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            Id: id
        })
    });

    const data = await res.json();
    debug("Message", data.message);
    await pickerTransaction(type);
}

async function displayTransaction(id) {
    showModalEditTransaction();

    try {
        await fetch("/Member/Home/GetFinancialTransaction", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                Id: id
            })
        }).then(res => res.json())
        .then(data => {
            debug("Transaction data", data);

            const radio = document.querySelector(`input[name="editTransactionType"][value="${data.type}"]`);

            if (radio) {
                radio.checked = true;
            }
            category.value = data.category;
            amount.value = data.amount;
            payee.value = data.payee;
            description.value = data.description;
            updateTransactionBtn.dataset.id = data.id;
        })
        .catch(err => debug("Error", err));

    } catch (err) {
        debug("Error", err);
    }
}

async function displayTransactions(data, tableId) {
    const table = tableId;
    table.innerHTML = "";

    if (window.innerWidth < 760) { 
        data.forEach(c => {
            const card = document.createElement("div");
            card.classList.add("financial-transaction-card");
            card.dataset.id = c.id;

            let type;

            if (c.type === "Income") {
                type = "income";
            } else if (c.type === "Expense") {
                type = "expense"
            } else {
                type = "undefined"
            }

            card.innerHTML = `
                <div class="financial-transaction-card-header">
                    <div class="financial-transaction-card-head">
                        <p class="card-head">${c.category}</p>
                        <p class="card-date">${dateFormat(c.dateOfTransaction)}</p>
                    </div>

                    <div class="financial-transaction-card-action-con">
                        <div class="action-con editTransactionBtn" data-id="${c.id}">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path class="edit" d="M100.4 417.2C104.5 402.6 112.2 389.3 123 378.5L304.2 197.3L338.1 163.4C354.7 180 389.4 214.7 442.1 267.4L476 301.3L442.1 335.2L260.9 516.4C250.2 527.1 236.8 534.9 222.2 539L94.4 574.6C86.1 576.9 77.1 574.6 71 568.4C64.9 562.2 62.6 553.3 64.9 545L100.4 417.2zM156 413.5C151.6 418.2 148.4 423.9 146.7 430.1L122.6 517L209.5 492.9C215.9 491.1 221.7 487.8 226.5 483.2L155.9 413.5zM510 267.4C493.4 250.8 458.7 216.1 406 163.4L372 129.5C398.5 103 413.4 88.1 416.9 84.6C430.4 71 448.8 63.4 468 63.4C487.2 63.4 505.6 71 519.1 84.6L554.8 120.3C568.4 133.9 576 152.3 576 171.4C576 190.5 568.4 209 554.8 222.5C551.3 226 536.4 240.9 509.9 267.4z"/></svg>
                        </div>

                        <div class="action-con deleteTransactionBtn" data-id="${c.id}">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path class="delete" d="M262.2 48C248.9 48 236.9 56.3 232.2 68.8L216 112L120 112C106.7 112 96 122.7 96 136C96 149.3 106.7 160 120 160L520 160C533.3 160 544 149.3 544 136C544 122.7 533.3 112 520 112L424 112L407.8 68.8C403.1 56.3 391.2 48 377.8 48L262.2 48zM128 208L128 512C128 547.3 156.7 576 192 576L448 576C483.3 576 512 547.3 512 512L512 208L464 208L464 512C464 520.8 456.8 528 448 528L192 528C183.2 528 176 520.8 176 512L176 208L128 208zM288 280C288 266.7 277.3 256 264 256C250.7 256 240 266.7 240 280L240 456C240 469.3 250.7 480 264 480C277.3 480 288 469.3 288 456L288 280zM400 280C400 266.7 389.3 256 376 256C362.7 256 352 266.7 352 280L352 456C352 469.3 362.7 480 376 480C389.3 480 400 469.3 400 456L400 280z"/></svg>
                        </div>
                    </div>
                </div>

                <div class="financial-transaction-card-body">
                    <div class="card-body-row">
                        <p class="card-body-row-label">Type:</p>
                        <p class="card-body-row-data ${type}">${c.type}</p>
                    </div>

                    <div class="card-body-row">
                        <p class="card-body-row-label">Amount:</p>
                        <p class="card-body-row-data">₱${c.amount}</p>
                    </div>

                    <div class="card-body-row">
                        <p class="card-body-row-label">Payee:</p>
                        <p class="card-body-row-data">${c.payee}</p>
                    </div>

                    
                    <div class="card-body-row-wrap">
                        <p class="card-body-row-label">Description:</p>
                        <p class="card-body-row-data descriptionCard">${c.description}</p>
                    </div>
                </div>
            `

            table.appendChild(card);
        });

    } else {
        data.forEach(t => {
            const row = document.createElement("tr");
            row.dataset.id = t.id;

            let type;

            if (t.type === "Income") {
                type = "income";
            } else if (t.type === "Expense") {
                type = "expense"
            } else {
                type = "undefined"
            }

            row.innerHTML = `
                <tr data-id="${t.id}">
                    <td>${dateFormat(t.dateOfTransaction)}</td>
                    <td id="type" class="${type}">${t.type}</td>
                    <td>${t.category}</td>
                    <td class="description">${t.description}</td> <!-- Re design this shit set a maximum words then gawa ka ng parang button na "see more" -->
                    <td>₱${t.amount}</td>
                    <td class="payee-col">${t.payee}</td>
                    <td>
                        <div class="action-con editTransactionBtn" data-id="${t.id}">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path class="edit" d="M100.4 417.2C104.5 402.6 112.2 389.3 123 378.5L304.2 197.3L338.1 163.4C354.7 180 389.4 214.7 442.1 267.4L476 301.3L442.1 335.2L260.9 516.4C250.2 527.1 236.8 534.9 222.2 539L94.4 574.6C86.1 576.9 77.1 574.6 71 568.4C64.9 562.2 62.6 553.3 64.9 545L100.4 417.2zM156 413.5C151.6 418.2 148.4 423.9 146.7 430.1L122.6 517L209.5 492.9C215.9 491.1 221.7 487.8 226.5 483.2L155.9 413.5zM510 267.4C493.4 250.8 458.7 216.1 406 163.4L372 129.5C398.5 103 413.4 88.1 416.9 84.6C430.4 71 448.8 63.4 468 63.4C487.2 63.4 505.6 71 519.1 84.6L554.8 120.3C568.4 133.9 576 152.3 576 171.4C576 190.5 568.4 209 554.8 222.5C551.3 226 536.4 240.9 509.9 267.4z"/></svg>
                        </div>

                        <div class="action-con deleteTransactionBtn" data-id="${t.id}">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path class="delete" d="M262.2 48C248.9 48 236.9 56.3 232.2 68.8L216 112L120 112C106.7 112 96 122.7 96 136C96 149.3 106.7 160 120 160L520 160C533.3 160 544 149.3 544 136C544 122.7 533.3 112 520 112L424 112L407.8 68.8C403.1 56.3 391.2 48 377.8 48L262.2 48zM128 208L128 512C128 547.3 156.7 576 192 576L448 576C483.3 576 512 547.3 512 512L512 208L464 208L464 512C464 520.8 456.8 528 448 528L192 528C183.2 528 176 520.8 176 512L176 208L128 208zM288 280C288 266.7 277.3 256 264 256C250.7 256 240 266.7 240 280L240 456C240 469.3 250.7 480 264 480C277.3 480 288 469.3 288 456L288 280zM400 280C400 266.7 389.3 256 376 256C362.7 256 352 266.7 352 280L352 456C352 469.3 362.7 480 376 480C389.3 480 400 469.3 400 456L400 280z"/></svg>
                        </div>
                    </td>
                </tr>
            `

            table.appendChild(row);
        });
    }
}

async function loadTransactions() {
    try {
        const res = await fetch("/Member/Home/GetFinancialTransactions");
        const transactions = await res.json();

        if (window.innerWidth < 760) {
            const cardCon = document.getElementById("transactionCardCon");
            displayTransactions(transactions, cardCon);
        } else {
            const table = document.getElementById("transactionTable");
            displayTransactions(transactions, table);
        }
    } catch (err) {
        debug("Error", err);    
    }
}

function isEmpty(value) {
    return (value == null || (typeof value === "string" && value.length === 0));
}

async function deleteEmployee(id) {
    const res = await fetch("/Member/Home/DeleteEmployee", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ Id: id })
    });

    const data = await res.json();
    await loadEmployees();
}

async function displayEmployee(id) {
    showModalEmployee("Edit", "Edit", "editEmployee");

    try {
        await fetch("/Member/Home/GetEmployee", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                Id: id
            })
        }).then(res => res.json())
        .then(data => {
            debug("Employee Data", data);

            firstName.value = data.firstName;
            middleName.value = data.middleName;
            lastName.value = data.lastName;
            role.value = data.role;
            position.value = data.position;
            email.value = data.email;
            phone.value = data.phone;
            address.value = data.address;
            employeeModalBtn.dataset.id = data.id;
        })
        .catch(err => debug("Error", err));

    } catch (err) {
        debug("Error", err);
    }
}

function dateFormat(date) {
    const format = new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric"
    });

    return format;
}

async function displayEmployees(data, listCon) {

    const list = listCon;
    list.innerHTML = "";

    data.forEach(e => {
        const li = document.createElement("div");
        li.classList.add("employees-card");
        li.dataset.id = e.id;

        let role;

        if (e.role === "Staff") {
            role = "staff";
        } else if (e.role === "Moderator") {
            role = "moderator";
        } else if (e.role === "Admin") {
            role = "admin";
        } else {
            role = "Undefined"
        }

        li.innerHTML = 
        `<div class="employees-card-header">
                <div class="employees-card-header-info">
                    <p class="employees-card-name">${e.firstName} ${e.middleName ?? ""} ${e.lastName}</p>
                    <p class="employees-card-role">${e.position}</p>
                </div>

                <div class="employees-card-actions-con">
                    <div class="action-con editEmployeeBtn" data-id="${e.id}">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path class="edit" d="M100.4 417.2C104.5 402.6 112.2 389.3 123 378.5L304.2 197.3L338.1 163.4C354.7 180 389.4 214.7 442.1 267.4L476 301.3L442.1 335.2L260.9 516.4C250.2 527.1 236.8 534.9 222.2 539L94.4 574.6C86.1 576.9 77.1 574.6 71 568.4C64.9 562.2 62.6 553.3 64.9 545L100.4 417.2zM156 413.5C151.6 418.2 148.4 423.9 146.7 430.1L122.6 517L209.5 492.9C215.9 491.1 221.7 487.8 226.5 483.2L155.9 413.5zM510 267.4C493.4 250.8 458.7 216.1 406 163.4L372 129.5C398.5 103 413.4 88.1 416.9 84.6C430.4 71 448.8 63.4 468 63.4C487.2 63.4 505.6 71 519.1 84.6L554.8 120.3C568.4 133.9 576 152.3 576 171.4C576 190.5 568.4 209 554.8 222.5C551.3 226 536.4 240.9 509.9 267.4z"/></svg>
                    </div>

                    <div class="action-con deleteEmployeeBtn" data-id="${e.id}">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path class="delete" d="M262.2 48C248.9 48 236.9 56.3 232.2 68.8L216 112L120 112C106.7 112 96 122.7 96 136C96 149.3 106.7 160 120 160L520 160C533.3 160 544 149.3 544 136C544 122.7 533.3 112 520 112L424 112L407.8 68.8C403.1 56.3 391.2 48 377.8 48L262.2 48zM128 208L128 512C128 547.3 156.7 576 192 576L448 576C483.3 576 512 547.3 512 512L512 208L464 208L464 512C464 520.8 456.8 528 448 528L192 528C183.2 528 176 520.8 176 512L176 208L128 208zM288 280C288 266.7 277.3 256 264 256C250.7 256 240 266.7 240 280L240 456C240 469.3 250.7 480 264 480C277.3 480 288 469.3 288 456L288 280zM400 280C400 266.7 389.3 256 376 256C362.7 256 352 266.7 352 280L352 456C352 469.3 362.7 480 376 480C389.3 480 400 469.3 400 456L400 280z"/></svg>
                    </div>
                </div>
            </div>

            <div class="employees-card-info-con">
                <div class="role-con ${role}">
                    <p>${e.role}</p>
                </div>

                <div class="employees-card-info">
                    <div class="employees-info-left">
                        <p>Email:</p>
                        <p>Phone:</p>
                        <p>Address:</p>
                    </div>

                    <div class="employees-info-right">
                        <p>${e.email}</p>
                        <p>+63 (09) ${e.phone}</p>
                        <p>${e.address}</p>
                    </div>
                </div>

                <div class="employees-card-border"></div>

                <div class="employees-card-created-at">
                    <p>Added: ${dateFormat(e.createdAt)}</p>
                </div>
            </div>
            `;
        
        list.appendChild(li);
    });
}

async function loadEmployees() {
    try {
        const res = await fetch("/Member/Home/GetEmployees");
        const employees = await res.json();

        const employeesCardCon = document.getElementById("employeesCardCon");
        displayEmployees(employees, employeesCardCon);
    } catch (err) {
        debug("Employee Display Error", err);
    }
}

function clearErrorInputFields(form) {
    const inputFields = form;

    inputFields.forEach(i => {
        if (!i.value.trim()) {
            i.classList.add("error-input");
        } else {
            i.classList.remove("error-input");
        }
    });
}

function inputEmptyValidation(form) {
    const inputFields = Array.from(form);

    const allFilled = inputFields.every(i => {
        if (i.id === "middleName") return true;
        return i.value.trim().length > 0;
    });

    return allFilled;
}

function selectAllInputFields(form) {
    const inputFields = form.querySelectorAll("input, select, textarea");

    return inputFields;
}

function displayCompanyInfo() {
    fetch("/Member/Home/GetCompanyInfo")
        .then(res => res.json())
        .then(data => {
            companyNameNav.textContent = data.companyName;
            companyIndustryNav.textContent = data.companyIndustry;
        })
        .catch(err => debug("Error", err))
}

async function Logout() {
    await fetch("/Member/Home/Logout", {
        method: "POST"
    });

    window.location.replace("/Public/Account/LogIn"); // FIX THIS, CLIENTS MUST NOT CLICK BACK button and get to see the /member
}

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

    if (actions === "logout") {
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

function showModal(head, subhead) {
    modal.classList.add("show");
    alertModal.classList.remove("modal-md");
    alertModal.classList.add("show", "modal-sm");

    alertHead.textContent = head;
    alertSubhead.textContent = subhead;
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

function resetModal() {
    alertModal.classList.remove("modal-sm");
    alertModal.classList.add("modal-md");

    alertHead.textContent = "Are you sure?";
}

function pageRefresh() {
    window.location.reload(true);
}

function debug(type, description) {
    console.log(type,": ", description);
}