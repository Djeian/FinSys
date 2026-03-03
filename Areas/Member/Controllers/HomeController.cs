using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using FinSys.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authentication;
using FinSys.DTO;
using FinSys.Data;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

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