using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using FinSys.Models;
using FinSys.Data;
using FinSys.DTO;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;

namespace FinSys.Areas.Public.Controllers;

[Area("Public")]
public class AccountController : Controller
{
    private readonly ApplicationDbContext _context;

    private readonly ILogger<AccountController> _logger;

    public AccountController(ILogger<AccountController> logger, ApplicationDbContext context)
    {
        _logger = logger;
        _context = context;
    }

    public IActionResult LogIn()
    {
        return View();
    }

    public IActionResult SignUp()
    {
        return View();
    }

    public IActionResult ForgotPass()
    {
        return View();
    }

    public IActionResult Verification()
    {
        return View();
    }

    public IActionResult ResetPass()
    {
        return View();
    }

    [HttpPost]
    public async Task<IActionResult> SignUpClient([FromBody] ClientSignUpDto clientDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        // COMPANY ID
        Random ran = new();
        var id = ran.Next(0, 100000).ToString("D6");

        var client = new Clients
        {
            FirstName = clientDto.FirstName,
            LastName = clientDto.LastName,
            Email = clientDto.Email,
            Phone = clientDto.Phone,
            Password = clientDto.Password,
            Country = clientDto.Country,
            CompanyId = int.Parse(id),
            IsPayed = false,
            Position = "Owner",
            Role = "Admin"
        };

        _context.Clients.Add(client);
        await _context.SaveChangesAsync();

        return Ok( new { client, success = true, message = "Client signed up", redirect = "/Public/Account/LogIn"});
    } 

    [HttpPost]
    public async Task<IActionResult> CheckEmailExists([FromBody] ClientEmailVerifDtto emailDto) 
    {
        var Client = await _context.Clients.FirstOrDefaultAsync(u => u.Email == emailDto.Email);

        if (Client == null)
        {
            return Ok( new { message = "Client have not signed in yet", signedIn = false});
        } 
        else
        {
            return Ok( new { message = "Client have signed in", signedIn = true});
        }
    }

    [HttpPost]
    public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
    {
        var checkEmail = await _context.Clients.FirstOrDefaultAsync(c => c.Email == loginDto.Email);
        var checkPassword = await _context.Clients.Where(c => c.Email == loginDto.Email).Select(c => c.Password).FirstOrDefaultAsync(); // HASH password next time

        if (checkEmail == null)
        {
            return Ok( new { clientExists = false, message = "Client does not exists"});
        } 
        else
        {
            if (checkPassword?.ToString() == loginDto.Password) // NULLABLE TO
            {
                var claims = new List<Claim>
                {
                    new Claim("ClientId", checkEmail.Id.ToString()),
                    new Claim("CompanyId", checkEmail.CompanyId.ToString()),
                    new Claim("Email", checkEmail.Email),
                    new Claim("FirstName", checkEmail.FirstName),
                    new Claim("LastName", checkEmail.LastName),
                    new Claim("Phone", checkEmail.Phone.ToString()),
                    new Claim("Country", checkEmail.Country),
                    new Claim("Position", checkEmail.Position),
                    new Claim("Role", checkEmail.Role),
                    new Claim("IsPayed", checkEmail.IsPayed.ToString()),
                    new Claim("CreatedAt", checkEmail.CreatedAt.ToString())
                };

                var identity = new ClaimsIdentity(claims, "UserSession");
                var principal = new ClaimsPrincipal(identity);

                await HttpContext.SignInAsync("UserSession", principal);

                return Ok( new { clientExists = true, isPassCorrect = true, redirect = "/Member/Home/Dashboard", message = "Password and Email is correct"}); // add a user id here for user session
            } else
            {
                return Ok( new { clientExists = true, isPassCorrect = false,  message = "Password is wrong"});
            }
        }
    }
}