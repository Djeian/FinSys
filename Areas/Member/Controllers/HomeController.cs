using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
//using FinSys.Models; UNCOMMENT THIS IF YOU HAVE A MODEL CLASS IN MODEL FOLEDR

namespace FinSys.Areas.Member.Controllers;

[Area("Member")]
public class HomeController : Controller
{
    private readonly ILogger<HomeController> _logger;

    public HomeController(ILogger<HomeController> logger)
    {
        _logger = logger;
    }

    public IActionResult Reports()
    {
        return View();
    }
}