using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
//using FinSys.Models; UNCOMMENT THIS IF YOU HAVE A MODEL CLASS IN MODEL FOLEDR

namespace FinSys.Areas.Public.Controllers;

[Area("Public")]
public class AccountController : Controller
{
    private readonly ILogger<AccountController> _logger;

    public AccountController(ILogger<AccountController> logger)
    {
        _logger = logger;
    }

    public IActionResult LogIn()
    {
        return View();
    }
}