using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using FinSys.Models; 

namespace FinSys.Areas.Public.Controllers;

[Area("Public")]
public class HomeController : Controller
{
    private readonly ILogger<HomeController> _logger;

    public HomeController(ILogger<HomeController> logger)
    {
        _logger = logger;
    }

    public IActionResult Main()
    {
        return View();
    }
}
