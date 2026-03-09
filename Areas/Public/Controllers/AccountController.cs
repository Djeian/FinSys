using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using FinSys.Models;
using FinSys.Data;
using FinSys.DTO;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using FinSys.Services.Interfaces;

namespace FinSys.Areas.Public.Controllers;

[Area("Public")]
public class AccountController : Controller
{
    private readonly ApplicationDbContext _context;

    private readonly ILogger<AccountController> _logger;

    private readonly IEmailService _email;

    public AccountController(ILogger<AccountController> logger, ApplicationDbContext context, IEmailService email)
    {
        _logger = logger;
        _context = context;
        _email = email;
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
    public async Task<IActionResult> ResetPassword([FromBody] ClientResetPasswordDto passwordDto)
    {
        var email = HttpContext.Session.GetString("Email");
        var client = await _context.Clients.Where(c => c.Email == email).ExecuteUpdateAsync(c => c.SetProperty(c => c.Password, passwordDto.Password));

        // END SESSION
        HttpContext.Session.Remove("Email");

        return Ok( new { message = "Updated password", redirect = "/Public/Account/LogIn"});
    }

    [HttpPost]
    public async Task<IActionResult> VerifyOTP([FromBody] ClientSendOTPDto otpDto)
    {
        var email = HttpContext.Session.GetString("Email");
        var otp = await _context.ResetPasswordCodes.Where(o => o.Code == otpDto.Code && o.Email == email).FirstOrDefaultAsync();
        //var checkOtp = await _context.ResetPasswordCodes.Where(o => o.Code == otpDto.Code && o.Email == email && o.IsUsed == true).FirstOrDefaultAsync();
    
        if (otp == null) return Ok( new { message = "OTP is wrong", otp = false });
        if (otp.IsUsed) return Ok( new { message = "OTP already used", otp = false });

        await _context.ResetPasswordCodes.Where(c => c.Email == email).ExecuteUpdateAsync(c => c.SetProperty(c => c.IsUsed, true)); // UPDATE IS USED TO TRUE

        return Ok( new { message = "OTP is corect", otp = true, redirect = "/Public/Account/ResetPass"} );
    }

    [HttpPost]
    public async Task<IActionResult> SendOTP([FromBody] ClientSendOTPDto emailDto)
    {
        Console.WriteLine("Email" + emailDto.Email);
        Random ran = new();
        string otp = ran.Next(0, 100000).ToString("D6");

        var resetPass = new ResetPasswordCodes
        {
            Email = emailDto.Email,
            Code = otp,
            IsUsed = false
        };

        _context.ResetPasswordCodes.Add(resetPass);
        await _context.SaveChangesAsync();

        // SEND AN EMAIL
        await _email.SendEmailAsync(emailDto.Email, "Reset Password", $"Your OTP code is {otp}"); // CHANGE THE SEND TO

        // SESSION
        HttpContext.Session.SetString("Email", emailDto.Email);

        return Ok( new { message = "Otp code has been sent", isUsed = false, redirect = "/Public/Account/Verification" });
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
    public async Task<IActionResult> CheckEmailExists([FromBody] ClientEmailVerifDto emailDto) 
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

    [HttpGet]
    public async Task<IActionResult> RemoveForgotPassSession()
    {
        HttpContext.Session.Remove("Email");
        return Ok( new { message = "Session Removed" });
    }
}