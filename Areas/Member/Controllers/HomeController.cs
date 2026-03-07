using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using FinSys.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authentication;
using FinSys.DTO;
using FinSys.Data;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Drawing;

namespace FinSys.Areas.Member.Controllers;

[Authorize]
[Area("Member")]
public class HomeController : Controller
{
    private readonly ILogger<HomeController> _logger;
    private readonly ApplicationDbContext _context;

    public HomeController(ILogger<HomeController> logger, ApplicationDbContext context)
    {
        _logger = logger;
        _context = context;
    }

    public IActionResult Dashboard()
    {
        return View();
    }

    public IActionResult FinancialTransactions()
    {
        return View();
    }

    public IActionResult Employees()
    {
        return View();
    }
    
    public IActionResult Reports()
    {
        return View();
    }

    
    public IActionResult Settings()
    {
        return View();
    }

    [HttpPost]
    public async Task<IActionResult> RecordFinancialTransaction([FromBody] FinancialTransactionsDto transactionDto)
    {
        var transaction = new FinancialTransactions
        {
            CompanyId = Convert.ToInt32(User.FindFirst("CompanyId")?.Value),
            Type = transactionDto.Type,
            DateOfTransaction = transactionDto.DateOfTransaction,
            Category = transactionDto.Category,
            Description = transactionDto.Description,
            Amount = transactionDto.Amount,
            Payee = transactionDto.Payee
        };

        _context.FinancialTransactions.Add(transaction);
        await _context.SaveChangesAsync();

        return Ok(transaction);
    }

    [HttpPost]
    public async Task<IActionResult> EmployeeRegistration([FromBody] EmployeeRegistration employeeDto)
    {
        var employee = new Employees
        {
            CompanyId = Convert.ToInt32(User.FindFirst("CompanyId")?.Value),
            FirstName = employeeDto.FirstName,
            MiddleName = employeeDto.MiddleName,
            LastName = employeeDto.LastName,
            Position = employeeDto.Position,
            Role = employeeDto.Role,
            Email = employeeDto.Email,
            Phone = employeeDto.Phone,
            Address = employeeDto.Address
        };

        _context.Employees.Add(employee);
        await _context.SaveChangesAsync();

        return Ok(employee);
    }

    [HttpPost]
    public async Task<IActionResult> CompanyRegistration([FromBody] CompanyRegistrationDto companyDto)
    {
        int clientId = Convert.ToInt32(User.FindFirst("ClientId")?.Value);

        var company = new Companies
        {
            ClientId = clientId,
            CompanyId = Convert.ToInt32(User.FindFirst("CompanyId")?.Value),
            CompanyName = companyDto.CompanyName,
            CompanyIndustry = companyDto.CompanyIndustry,
            CompanyCountry = companyDto.CompanyCountry,
            Employees = false,
            Plan = "Starter"
        };

        var clientIsPayed = await _context.Clients.FirstOrDefaultAsync(c => c.Id == clientId);
        clientIsPayed.IsPayed = true; // UPDATE THE CLEINT `IsPayed` PROPERTY TO TRUE

        _context.Companies.Add(company);
        await _context.SaveChangesAsync();

        return Ok( new { company, success = true, message = "Company Registered", isPayed = clientIsPayed.IsPayed });
    }

    [HttpGet]
    public async Task<IActionResult> IsClientPayed()
    {
        int clientId = Convert.ToInt32(User.FindFirst("ClientId")?.Value);
        
        Console.WriteLine(clientId);
        var IsClientPayed = await _context.Clients.FirstOrDefaultAsync(c => c.Id == clientId);
        return Ok( new { isPayed = IsClientPayed.IsPayed });
    } 

    [HttpPost]
    public async Task<IActionResult> DeleteTransaction([FromBody] FinancialTransactionsDto transactionsDto)
    {
        int companyId = Convert.ToInt32(User.FindFirst("CompanyId")?.Value); 
        var transaction = await _context.FinancialTransactions.Where(t => t.Id == transactionsDto.Id && t.CompanyId == companyId).FirstOrDefaultAsync();

        _context.FinancialTransactions.Remove(transaction);

        await _context.SaveChangesAsync();

        return Ok( new { message = "Deleted transaction"});
    }

    [HttpPost] 
    public async Task<IActionResult> DeleteEmployee([FromBody] EmployeeDto employeeDto)
    {
        int companyId = Convert.ToInt32(User.FindFirst("CompanyId")?.Value); 
        var employee = await _context.Employees.Where(e => e.Id == employeeDto.Id && e.CompanyId == companyId).FirstOrDefaultAsync();

        _context.Employees.Remove(employee);

        await _context.SaveChangesAsync();

        return Ok( new { message = "Deleted employee"});
    }

    [HttpPost]
    public async Task<IActionResult> EditFinancialTransaction([FromBody] FinancialTransactionsDto transactionsDto)
    {
        int companyId = Convert.ToInt32(User.FindFirst("CompanyId")?.Value); 
        var transaction = await _context.FinancialTransactions.Where(t => t.Id == transactionsDto.Id && t.CompanyId == companyId).FirstOrDefaultAsync();

        if (transaction == null) return Ok (transaction);

        transaction.Type = transactionsDto.Type;
        transaction.Category = transactionsDto.Category;
        transaction.Amount = transactionsDto.Amount;
        transaction.Payee = transactionsDto.Payee;
        transaction.Description = transactionsDto.Description;

        await _context.SaveChangesAsync();

        return Ok( new { message = "Transaction updated successfully" });
    }


    [HttpPost] 
    public async Task<IActionResult> EditEmployee([FromBody] EmployeeDto employeeDto)
    {
        int companyId = Convert.ToInt32(User.FindFirst("CompanyId")?.Value); 
        var employee = await _context.Employees.Where(e => e.Id == employeeDto.Id && e.CompanyId == companyId).FirstOrDefaultAsync();

        if (employee == null) return Ok (employee);

        employee.FirstName = employeeDto.FirstName;
        employee.MiddleName = employeeDto.MiddleName; 
        employee.LastName = employeeDto.LastName;
        employee.Position = employeeDto.Position;
        employee.Role = employeeDto.Role;
        employee.Email = employeeDto.Email;
        employee.Phone = employeeDto.Phone;
        employee.Address = employeeDto.Address;

        await _context.SaveChangesAsync();

        return Ok( new { message = "Employee updated successfully" });
    }

    [HttpGet]
    public async Task<IActionResult> GetIncomeExpenseComparisonLineGraph()
    {
        int companyId = Convert.ToInt32(User.FindFirst("CompanyId")?.Value); 

        string[] monthNames = new string[]
            {
                "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
            };

        var rawData = await _context.FinancialTransactions
            .Where(t => t.CompanyId == companyId)
            .GroupBy(t => t.DateOfTransaction.Month)
            .Select(g => new
            {
                MonthNumber = g.Key,
                Income = g.Where(x => x.Type == "Income").Sum(x => x.Amount),
                Expense = g.Where(x => x.Type == "Expense").Sum(x => x.Amount)
            })
            .OrderBy(x => x.MonthNumber)
            .ToListAsync();

        var comparison = rawData.Select(r => new
        {
            month = monthNames[r.MonthNumber - 1],
            income = r.Income,
            expense = r.Expense
        });

        return Ok(comparison);
    }

    [HttpGet]
    public async Task<IActionResult> GetIncomeExpenseComparisonPieGraph()
    {
        int companyId = Convert.ToInt32(User.FindFirst("CompanyId")?.Value); 
        var comparison = await _context.FinancialTransactions
                            .Where(t => t.CompanyId == companyId)
                            .GroupBy(t => t.Type)
                            .Select(t => new
                            {
                                key = t.Key,
                                value = t.Sum(x => x.Amount)
                            })
                            .ToListAsync();

        return Ok(comparison);
    }

    [HttpGet] 
    public async Task<IActionResult> GetExpenseBreakdown()
    {
        int companyId = Convert.ToInt32(User.FindFirst("CompanyId")?.Value); 
        var expense = await _context.FinancialTransactions
                            .Where(t => t.CompanyId == companyId && t.Type == "Expense")
                            .GroupBy(t => t.Category)
                            .Select(t => new
                            {
                                key = t.Key,
                                value = t.Sum(x => x.Amount)
                            })
                            .ToListAsync();

        return Ok(expense);
    }

    [HttpGet]
    public async Task<IActionResult> GetCommonSizeStatement()
    {
        int companyId = Convert.ToInt32(User.FindFirst("CompanyId")?.Value); 
        var income = await _context.FinancialTransactions.Where(t => t.CompanyId == companyId && t.Type == "Income").SumAsync(t => t.Amount);        
        var expense = await _context.FinancialTransactions.Where(t => t.CompanyId == companyId && t.Type == "Expense").SumAsync(t => t.Amount);  

        decimal expenseStatement = expense == 0 ? 0 : Math.Round(((Decimal)expense / income) * 100, 2); // This just get the percentage of the expense based on the income, if expense is greater than income 
        decimal netProfitStatement = Math.Round(((decimal)(income - expense) / income) * 100, 2);

        return Ok( new { expense = expenseStatement, netProfit = netProfitStatement });
    }

    [HttpGet] 
    public async Task<IActionResult> GetNetProfit()
    {
        int companyId = Convert.ToInt32(User.FindFirst("CompanyId")?.Value); 
        var income = await _context.FinancialTransactions.Where(t => t.CompanyId == companyId && t.Type == "Income").SumAsync(t => t.Amount);        
        var expense = await _context.FinancialTransactions.Where(t => t.CompanyId == companyId && t.Type == "Expense").SumAsync(t => t.Amount);  

        var netProfit = income - expense; 

        return Ok( new { totalProfit = netProfit});
    }


    [HttpGet]
    public async Task<IActionResult> GetExpense()
    {
        int companyId = Convert.ToInt32(User.FindFirst("CompanyId")?.Value); 
        var expense = await _context.FinancialTransactions.Where(t => t.CompanyId == companyId && t.Type == "Expense").SumAsync(t => t.Amount);        


        return Ok( new { totalExpense = expense });
    }

    [HttpGet]
    public async Task<IActionResult> GetIncome()
    {
        int companyId = Convert.ToInt32(User.FindFirst("CompanyId")?.Value); 
        var income = await _context.FinancialTransactions.Where(t => t.CompanyId == companyId && t.Type == "Income").SumAsync(t => t.Amount);        

        return Ok( new { totalIncome = income });
    }

    [HttpPost] 
    public async Task<IActionResult> GetSelectedTransactions([FromBody] PickerItem pickerItemDto)
    {
        int companyId = Convert.ToInt32(User.FindFirst("CompanyId")?.Value); 
        var transaction = await _context.FinancialTransactions.Where(t => t.Type == pickerItemDto.Selected && t.CompanyId == companyId).ToListAsync();

        Console.WriteLine(pickerItemDto.Selected);
        return Ok(transaction);
    }

    [HttpPost]
    public async Task<IActionResult> GetFinancialTransaction([FromBody] FinancialTransactionsDto transactionDto)
    {
        int companyId = Convert.ToInt32(User.FindFirst("CompanyId")?.Value); 
        var transaction = await _context.FinancialTransactions.Where(t => t.Id == transactionDto.Id && t.CompanyId == companyId).FirstOrDefaultAsync();
        
        return Ok(transaction);
    }

    [HttpGet]
    public async Task<IActionResult> GetFinancialTransactions() 
    {
        int companyId = Convert.ToInt32(User.FindFirst("CompanyId")?.Value); 
        var transaction = await _context.FinancialTransactions.Where(t => t.CompanyId == companyId).ToListAsync();

        return Ok(transaction);
    }

    [HttpPost]
    public async Task<IActionResult> GetEmployee([FromBody] EmployeeDto employeeDto)
    {
        int companyId = Convert.ToInt32(User.FindFirst("CompanyId")?.Value); 
        var employee = await _context.Employees.Where(e => e.Id == employeeDto.Id && e.CompanyId == companyId).FirstOrDefaultAsync();

        return Ok(employee);
    }

    [HttpGet]
    public async Task<IActionResult> GetEmployees()
    {
        int companyId = Convert.ToInt32(User.FindFirst("CompanyId")?.Value); 
        var employees = await _context.Employees.Where(e => e.CompanyId == companyId).ToListAsync();

        return Ok(employees);
    }

    [HttpGet]
    public async Task<IActionResult> GetCompanyInfo()
    {
        int clientId = Convert.ToInt32(User.FindFirst("ClientId")?.Value);

        var company = await _context.Companies.FirstOrDefaultAsync(c => c.ClientId == clientId);
        return Ok(company);
    }

    [HttpGet]
    public IActionResult GetClientInfo()
    {
        return Ok(new
        {
            clientId = User.FindFirst("ClientId")?.Value,
            email = User.FindFirst("Email")?.Value,
            firstName = User.FindFirst("FirstName")?.Value,
            lastName = User.FindFirst("LastName")?.Value,
            phone = User.FindFirst("Phone")?.Value,
            country = User.FindFirst("Country")?.Value,
            position = User.FindFirst("Position")?.Value,
            role = User.FindFirst("Role")?.Value,
            isPayed = User.FindFirst("IsPayed")?.Value,
            CreatedAt = User.FindFirst("CreatedAt")?.Value,
        });
    }

    [HttpPost]
    public async Task<IActionResult> Logout()
    {
        await HttpContext.SignOutAsync("UserSession");
        return Ok();
    }
}