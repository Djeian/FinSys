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
using System.Text.Json;

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

    public IActionResult Investors()
    {
        return View();
    }

    public IActionResult FinancialStatements()
    {
        return View();
    }

    public IActionResult AssetsAndLiabilities()
    {
        return View();
    }
    
    public IActionResult Settings()
    {
        return View();
    }

    [HttpPost]
    public async Task<IActionResult> Search([FromBody] EmployeeSearchDto searchDto)
    {
        Console.WriteLine("Search :::::");

        var res = await _context.Employees
            .Where(e => (e.FirstName + " " + (e.MiddleName ?? "") + " " + e.LastName)
            .Contains(searchDto.EmployeeName))
            .ToListAsync();

        return Ok(res);
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

    private async Task CalculateOwnership(int companyId)
    {   
        var investors = await _context.Investors.Where(i => i.CompanyId == companyId).ToListAsync();

        var totalInvestment = investors.Sum(i => i.Investment);

        foreach (var inv in investors)
        {
            inv.Ownership = totalInvestment == 0 ? 100M : Math.Round(((decimal)inv.Investment / (decimal)totalInvestment) * 100M, 3, MidpointRounding.AwayFromZero); 
        }

        await _context.SaveChangesAsync();
    }

    private async Task CalculateRoi(int companyId, string stockholderId)
    {   
        // Income should be based on the earned ionvestment of the investopr not on the total income of thje business
        var income = await _context.FinancialTransactions.Where(i => i.CompanyId == companyId && i.Type == "Income").SumAsync(i => i.Amount);
        var expense = await _context.FinancialTransactions.Where(i => i.CompanyId == companyId && i.Type == "Expense").SumAsync(i => i.Amount);
        var netProfit = income - expense;

        var investor = await _context.Investors.FirstOrDefaultAsync(i => i.CompanyId == companyId && i.StakeholderId == stockholderId);
        
        if (investor == null) return;

        decimal investment = investor.Investment;

        var roi = investment == 0 ? 0M : Math.Round((netProfit - investment) / investment, 3, MidpointRounding.AwayFromZero);

        investor.Roi = roi;

        await _context.SaveChangesAsync();
    }

    private async Task CalculateIncome(int companyId, string stockholderId)
    {   
        // Income should be based on the earned ionvestment of the investopr not on the total income of thje business
        var income = await _context.FinancialTransactions.Where(i => i.CompanyId == companyId && i.Type == "Income").SumAsync(i => i.Amount);
        var expense = await _context.FinancialTransactions.Where(i => i.CompanyId == companyId && i.Type == "Expense").SumAsync(i => i.Amount);
        var netProfit = income - expense;

        var investor = await _context.Investors.FirstOrDefaultAsync(i => i.CompanyId == companyId && i.StakeholderId == stockholderId);
        
        if (investor == null) return;

        decimal ownership = investor.Ownership / 100M;

        int investorIncome = ownership == 0 ? 0 : (int)Math.Round(netProfit * ownership, 2);

        investor.Income = investorIncome;

        Console.WriteLine("Income " + investorIncome);
        await _context.SaveChangesAsync();
    }


    [HttpPost]
    public async Task<IActionResult> LiabilityRegistration([FromBody] LiabilityRegistrationDto liabilityDto)
    {
        int companyId = Convert.ToInt32(User.FindFirst("CompanyId")?.Value);

        Console.WriteLine("Company Id " + companyId);

        var liability = new Liabilities
        {
            CompanyId = companyId,
            Name = liabilityDto.Name,
            Due = liabilityDto.Due,
            Type = liabilityDto.Type,
            Debt = liabilityDto.Debt,
            Paid = 0,
            Balance = liabilityDto.Debt,
            Progress = 0M,
            Status = liabilityDto.Status
        };

        _context.Liabilities.Add(liability);
        await _context.SaveChangesAsync();

        return Ok(liability);
    }

    [HttpPost]
    public async Task<IActionResult> AssetRegistration([FromBody] AssetRegistrationDto assetDto) 
    {
        int companyId = Convert.ToInt32(User.FindFirst("CompanyId")?.Value);

        // ASSET ID
        var random = new Random();
        string prefix = "";
        for (int i = 0; i < 3; i++)
        {
            char letter = (char)random.Next('A', 'Z' + 1);
            prefix += letter;
        }

        string threeDigitNumber = random.Next(100, 999).ToString();
        string assetId = prefix + threeDigitNumber;


        var asset = new Assets
        {
            CompanyId = companyId,
            AssetId = assetId,
            Item = assetDto.Item,
            Category = assetDto.Category,
            Amount = assetDto.Amount
        };

        _context.Assets.Add(asset);
        await _context.SaveChangesAsync();

        return Ok(asset);
    }
    
    [HttpPost]
    public async Task<IActionResult> InvestorRegistration([FromBody] InvestorRegistration investorDto) 
    {
        int companyId = Convert.ToInt32(User.FindFirst("CompanyId")?.Value);

        // STAKEHOLDER ID
        var random = new Random();
        string prefix = "";
        for (int i = 0; i < 3; i++)
        {
            char letter = (char)random.Next('A', 'Z' + 1);
            prefix += letter;
        }

        string threeDigitNumber = random.Next(100, 999).ToString();
        string stakeholderId = prefix + threeDigitNumber;

        //Console.WriteLine("Company Id " + Convert.ToInt32(User.FindFirst("CompanyId")?.Value));
        //Console.WriteLine("Stakeholder Id " + stakeholderId);
        //Console.WriteLine("address" + investorDto.FirstName);
    
        var investor = new Investors
        {
            CompanyId = Convert.ToInt32(User.FindFirst("CompanyId")?.Value),
            StakeholderId = stakeholderId,
            FirstName = investorDto.FirstName,
            MiddleName = investorDto.MiddleName,
            LastName = investorDto.LastName,
            Stakeholder = investorDto.Stakeholder,
            Ownership = 0M, // CHANGE
            Investment = investorDto.Investment,
            Income = 0, // CHANGE
            Roi = 0M, // CHANGE
            Email = investorDto.Email,
            Phone = investorDto.Phone,
            Address = investorDto.Address,
            Tin = investorDto.Tin
        };

        _context.Investors.Add(investor);
        await _context.SaveChangesAsync();

        await CalculateOwnership(companyId);
        await CalculateRoi(companyId, stakeholderId);
        await CalculateIncome(companyId, stakeholderId);

        await _context.Entry(investor).ReloadAsync();

        return Ok(investor);
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

        // ADD OWNER INVESTOR
        var investor = new InvestorRegistration {
            FirstName = User.FindFirst("FirstName")?.Value,
            MiddleName = "",
            LastName = User.FindFirst("LastName")?.Value,
            Stakeholder = "Owner",
            Investment = companyDto.Investment,
            Email = User.FindFirst("Email")?.Value,
            Phone = User.FindFirst("Phone")?.Value,
            Tin = 0,
            Address = User.FindFirst("Country")?.Value
        };

        await InvestorRegistration(investor);

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
    public async Task<IActionResult> DeleteAsset([FromBody] AssetDto assetDto)
    {
        int companyId = Convert.ToInt32(User.FindFirst("CompanyId")?.Value); 
        var asset = await _context.Assets.Where(a => a.Id == assetDto.Id && a.CompanyId == companyId).FirstOrDefaultAsync();

        _context.Assets.Remove(asset);

        await _context.SaveChangesAsync();

        return Ok( new { message = "Deleted Asset"});
    }

    [HttpPost]
    public async Task<IActionResult> DeleteLiability([FromBody] LiabilityDto liabilityDto)
    {
        int companyId = Convert.ToInt32(User.FindFirst("CompanyId")?.Value); 
        var liability = await _context.Liabilities.Where(a => a.Id == liabilityDto.Id && a.CompanyId == companyId).FirstOrDefaultAsync();

        _context.Liabilities.Remove(liability);

        await _context.SaveChangesAsync();

        return Ok( new { message = "Deleted Liability"});
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
    public async Task<IActionResult> EditAsset([FromBody] AssetDto assetDto) 
    {
        int companyId = Convert.ToInt32(User.FindFirst("CompanyId")?.Value); 
        var asset = await _context.Assets.Where(a => a.Id == assetDto.Id && a.CompanyId == companyId).FirstOrDefaultAsync();

        if (asset == null) return Ok (asset);

        asset.Item = assetDto.Item;
        asset.Category = assetDto.Category; 
        asset.Amount = assetDto.Amount;

        await _context.SaveChangesAsync();

        return Ok( new { message = "Asset edited successfully"});
    }

    [HttpPost]
    public async Task<IActionResult> PayALiability([FromBody] PayLiabilityDto liabilityDto)
    {
        int companyId = Convert.ToInt32(User.FindFirst("CompanyId")?.Value); 
        var liability = await _context.Liabilities.Where(a => a.Id == liabilityDto.Id && a.CompanyId == companyId).FirstOrDefaultAsync();

        if (liability == null) return Ok (liability);

        if (liabilityDto.Paid > liability.Balance) return BadRequest( new { message = "Exceeded amount!"});

        var balance = liability.Balance - liabilityDto.Paid;
        decimal progress = (liability.Balance / (decimal)liability.Debt) * 100;

        liability.Paid += liabilityDto.Paid;
        if (liability.Paid > liability.Debt)
            liability.Paid = liability.Debt;

        liability.Balance = liability.Debt - liability.Paid;

        liability.Progress = liability.Debt == 0
            ? 0
            : (liability.Paid / (decimal)liability.Debt) * 100;

        
        liability.Status = liability.Balance <= 0 ? "Paid" : "Active";

        await _context.SaveChangesAsync();

        return Ok( new { message = "Successfully paid a liability" });
    }

    [HttpPost]
    public async Task<IActionResult> EditLiability([FromBody] LiabilityDto liabilityDto) 
    {
        Console.WriteLine("Liability id" + liabilityDto.Id);

        int companyId = Convert.ToInt32(User.FindFirst("CompanyId")?.Value); 
        var liability = await _context.Liabilities.Where(a => a.Id == liabilityDto.Id && a.CompanyId == companyId).FirstOrDefaultAsync();

        if (liability == null) return NotFound(new { message = "Liability not found" });

        liability.Name = liabilityDto.Name;
        liability.Due = liabilityDto.Due; 
        liability.Debt = liabilityDto.Debt;
        liability.Type = liabilityDto.Type;
        liability.Status = liabilityDto.Status;

        await _context.SaveChangesAsync();

        return Ok( new { message = "Liability edited successfully"});
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
    public async Task<IActionResult> GetLiabilitiesData()
    {
        int companyId = Convert.ToInt32(User.FindFirst("CompanyId")?.Value);
        var liability = _context.Liabilities.Where(a => a.CompanyId == companyId);

        var totalLiabilities = await liability.CountAsync();

        var data = await liability.GroupBy(t => t.Type)
            .Select(l => new
            {
                Type = l.Key,
                total = l.Count(),
                percentage = totalLiabilities == 0 ? 0 : (l.Count() * 100.0 /totalLiabilities)
            })
            .ToListAsync();

        return Ok(data);
    }

    [HttpGet]
    public async Task<IActionResult> GetAssetsData()
    {
        int companyId = Convert.ToInt32(User.FindFirst("CompanyId")?.Value);
        var asset = _context.Assets.Where(a => a.CompanyId == companyId);

        var category = await asset
            .GroupBy(a => a.Category)
            .Select(g => new
            {
                category = g.Key,
                value = g.Sum(x => x.Amount)
            })
            .ToListAsync();

        var totalAssetValue = category.Sum(x => x.value);

        var result = new
        {
            totalAssetValue = totalAssetValue,
            chartData = category.Select(x => new
            {
                category = x.category,
                value = x.value,
                percentage = totalAssetValue == 0 
                    ? 0 
                    : Math.Round(((decimal)x.value / totalAssetValue) * 100, 2)
            })
        };

        return Ok(result);
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
    public async Task<IActionResult> GetFinancialStatementsData([FromBody] GetFinancialStatementsDto fsDto)
    {
        int companyId = Convert.ToInt32(User.FindFirst("CompanyId")?.Value);

        var startDate = new DateTime(fsDto.Year, fsDto.Month, 1);
        var endDate = startDate.AddMonths(1);

        Console.WriteLine("Start Date " + startDate + " End Date " + endDate); // REMOVE

        // Income Statement
        var financialTransactions =  _context.FinancialTransactions.Where(i => i.CompanyId == companyId);
        var fsLastMonth = await financialTransactions.Where(i => i.DateOfTransaction >= startDate && i.DateOfTransaction < endDate).ToListAsync();
        var totalIncome = fsLastMonth
            .Where(t => t.Type == "Income")
            .Sum(t => (decimal?)t.Amount) ?? 0;

        var expenses = fsLastMonth
            .Where(t => t.Type == "Expense")
            .GroupBy(t => t.Category)
            .Select(t => new
            {
                name = t.Key,
                amount = t.Sum(x => x.Amount)
            })
            .ToList();

        Console.WriteLine(JsonSerializer.Serialize(expenses));

        var totalExpense = expenses.Sum(e => e.amount);

        var netIncome = totalIncome - totalExpense;

        // Statement of Owners Equity
        var investors = _context.Investors.Where(i => i.CompanyId == companyId);
        var dividends = await investors.SumAsync(x => (decimal?)x.Income) ?? 0;

        var oeStartDate = startDate.AddMonths(-1);
        var oeEndDate = startDate;
        var oeLastMonth = await financialTransactions.Where(i => i.DateOfTransaction >= oeStartDate && i.DateOfTransaction < oeEndDate).ToListAsync();
        var oeTotalIncome = oeLastMonth.Where(t => t.Type == "Income").Sum(t => (decimal?)t.Amount) ?? 0;
        var oeTotalExpense = oeLastMonth.Where(t => t.Type == "Expense").Sum(t => (decimal?)t.Amount) ?? 0;
        var oeNetIncomeLastMonth = oeTotalIncome - oeTotalExpense;
        Console.WriteLine("Net Income Last Month " + oeNetIncomeLastMonth + " Income " + oeTotalIncome + " expense " + oeTotalExpense);
        var retainedEarningsLastMonth = oeNetIncomeLastMonth - dividends; // Get the retained earnings of last month. Create a table for storing
                                                                          // retained earnings per snapshot month and year
  
    
        // CASH FLOW
        var operatingTotalIncome = totalIncome;
        var operatingTotalExpense = totalExpense + dividends;
        var operatingNetIncome = totalIncome - operatingTotalExpense;

        var assets = await _context.Assets
            .Where(a => a.CompanyId == companyId)
            .GroupBy(a => a.Category)
            .Select(a => new
            {
                category = a.Key,
                amount = a.Sum(x => x.Amount)
            })
            .ToListAsync();
        
        var totalAssetValue = assets.Sum(a => a.amount);


        var capital = investors.Sum(c => c.Investment);
        var netFinancingAct = capital - dividends;

        var netCashFlow = operatingNetIncome - totalAssetValue + netFinancingAct;

         // USE CAPITAL
        var retainedEarnings =  capital - netIncome - dividends;

        // LIABILITIES
        var liabilities = _context.Liabilities.Where(l => l.CompanyId == companyId);
        var totalLoans = await liabilities.SumAsync(l => (decimal?)l.Balance) ?? 0;

        var stockholderEquity = capital /*+ retainedEarnings*/;
        var totalLiabAndEquity = stockholderEquity + totalLoans;

        var data = new
        {
            incomeStatement = new
            {
                totalIncome,
                totalExpense,
                expenses,
                netIncome   
            },

            ownersEquity = new
            {
                dividends,
                retainedEarnings,
                retainedEarningsLastMonth
            },
            
            cashFlow = new
            {
                operatingAct = new
                {
                    operatingTotalIncome,
                    operatingTotalExpense,
                    operatingNetIncome
                },

                financingAct = new
                {
                    capital,
                    netFinancingAct
                },

                netCashFlow
            },
            assets = new
            {
                assets,
                totalAssetValue
            },

            liabilities = new
            {
                totalLiabAndEquity,
                stockholderEquity,
                totalLoans
            }
        };
        
        return Ok(data);
    }

    [HttpPost]
    public async Task<IActionResult> SearchLiabilities([FromBody] SearchDto searchDto)
    {
        int companyId = Convert.ToInt32(User.FindFirst("CompanyId")?.Value);

         var results = await _context.Liabilities
            .Where(x => x.CompanyId == companyId &&
                        x.Name.Contains(searchDto.Query))
            .OrderBy(x => x.Name)
            .Take(5)
            .Select(x => new {
                x.Id,
                x.Name,
                x.Due,
                x.Type,
                x.Debt,
                x.Balance
            })
            .ToListAsync();

        return Ok(results);
    }

    [HttpPost]
    public async Task<IActionResult> GetSelectedLiabilities([FromBody] LiabilityPickerDto liabilityPickerDto)
    {
        int companyId = Convert.ToInt32(User.FindFirst("CompanyId")?.Value);
        var today = DateTime.UtcNow.Date; 

        var liabilities = _context.Liabilities
            .Where(l => l.CompanyId == companyId);

        if (liabilityPickerDto.Selected == "Due")
        {
            liabilities = liabilities.Where(l => l.Due <= today && l.Status != "Paid");
        }
        else
        {
            liabilities = liabilities.Where(l => l.Status == liabilityPickerDto.Selected);
        }

        var totalRecords = await liabilities.CountAsync();

        var data = await liabilities.Skip((liabilityPickerDto.PageNumber - 1) * liabilityPickerDto.PageSize).Take(liabilityPickerDto.PageSize).ToListAsync();

        return Ok( new { data = data, totalRecords, liabilityPickerDto.PageNumber, liabilityPickerDto.PageSize, totalPages = (int)Math.Ceiling(totalRecords / (double)liabilityPickerDto.PageSize)});
    }

    [HttpPost]
    public async Task<IActionResult> GetFinancialTransaction([FromBody] FinancialTransactionsDto transactionDto)
    {
        int companyId = Convert.ToInt32(User.FindFirst("CompanyId")?.Value); 
        var transaction = await _context.FinancialTransactions.Where(t => t.Id == transactionDto.Id && t.CompanyId == companyId).FirstOrDefaultAsync();
        
        return Ok(transaction);
    }

    [HttpPost]
    public async Task<IActionResult> GetAsset([FromBody] AssetDto assetDto)
    {
        int companyId = Convert.ToInt32(User.FindFirst("CompanyId")?.Value); 
        var asset = await _context.Assets.Where(t => t.Id == assetDto.Id && t.CompanyId == companyId).FirstOrDefaultAsync();
        
        return Ok(asset);
    }

    [HttpPost]
    public async Task<IActionResult> GetLiability([FromBody] LiabilityDto liabilityDto)
    {
        int companyId = Convert.ToInt32(User.FindFirst("CompanyId")?.Value); 
        var liability = await _context.Liabilities.Where(t => t.Id == liabilityDto.Id && t.CompanyId == companyId).FirstOrDefaultAsync();
        
        return Ok(liability);
    }


    [HttpGet]
    public async Task<IActionResult> GetFinancialTransactions() 
    {
        int companyId = Convert.ToInt32(User.FindFirst("CompanyId")?.Value); 
        var transaction = await _context.FinancialTransactions.Where(t => t.CompanyId == companyId).ToListAsync();

        return Ok(transaction);
    }

    [HttpGet]
    public async Task<IActionResult> GetCapitalInvestment()
    {
        int companyId = Convert.ToInt32(User.FindFirst("CompanyId")?.Value);
        var capital = await _context.Investors.Where(i => i.CompanyId == companyId).SumAsync(i => i.Investment);

        return Ok(capital);
    }

    [HttpGet]
    public async Task<IActionResult> GetInvestorsData()
    {

        int companyId = Convert.ToInt32(User.FindFirst("CompanyId")?.Value);
        var investor = _context.Investors.Where(a => a.CompanyId == companyId);

        var data = await investor
            .Select(g => new
            {
                investor = g.FirstName + " " + g.MiddleName + " " + g.LastName ?? null,
                ownership = g.Ownership
            })
            .ToListAsync();

        var capital = investor.Sum(x => x.Investment);

        var result = new
        {
            capital = capital,
            chartData = data
        };

        return Ok(result);
    }

    [HttpGet]
    public async Task<IActionResult> GetInvestors()
    {
        int companyId = Convert.ToInt32(User.FindFirst("CompanyId")?.Value);
        var investors = await _context.Investors.Where(i => i.CompanyId == companyId).ToListAsync();

        return Ok(investors);
    }

    [HttpPost]
    public async Task<IActionResult> GetAssets([FromBody] PagingDto pagingDto)
    {
        int companyId = Convert.ToInt32(User.FindFirst("CompanyId")?.Value);
        var assets = _context.Assets.Where(a => a.CompanyId == companyId).OrderByDescending(a => a.Id);

        var totalRecords = await assets.CountAsync();

        var data = await assets.Skip((pagingDto.PageNumber - 1) * pagingDto.PageSize).Take(pagingDto.PageSize).ToListAsync();

        return Ok( new { data = data, totalRecords, pagingDto.PageNumber, pagingDto.PageSize, totalPages = (int)Math.Ceiling(totalRecords / (double)pagingDto.PageSize)});
    }

    [HttpPost]
    public async Task<IActionResult> GetLiabilities([FromBody] PagingDto pagingDto)
    {
        int companyId = Convert.ToInt32(User.FindFirst("CompanyId")?.Value);
        var liabilities = _context.Liabilities.Where(a => a.CompanyId == companyId).OrderByDescending(a => a.Id);

        var totalRecords = await liabilities.CountAsync();

        var data = await liabilities.Skip((pagingDto.PageNumber - 1) * pagingDto.PageSize).Take(pagingDto.PageSize).ToListAsync();

        return Ok( new { data = data, totalRecords, pagingDto.PageNumber, pagingDto.PageSize, totalPages = (int)Math.Ceiling(totalRecords / (double)pagingDto.PageSize)});
    }

    [HttpGet]
    public async Task<IActionResult> GetLiabilitiesDashboardData()
    {
        int companyId = Convert.ToInt32(User.FindFirst("CompanyId")?.Value);
        var today = DateTime.UtcNow.Date; 

        var query = _context.Liabilities
            .Where(x => x.CompanyId == companyId);

        var totalLiabilities = await query.CountAsync();

        var result = new
        {
            totalLiabilities = totalLiabilities,
            remainingBalance = await query.SumAsync(x => x.Balance),

            graphData = await query.GroupBy(t => t.Type)
                .Select(l => new
                {
                    Type = l.Key,
                    total = l.Count(),
                    percentage = totalLiabilities == 0 ? 0 : (l.Count() * 100.0 /totalLiabilities)
                })
                .ToListAsync(),

            active = await query.CountAsync(x => x.Status == "Active"),
            paid = await query.CountAsync(x => x.Status == "Paid"),

            due = await query.CountAsync(x =>
                x.Due <= today && x.Status != "Paid")
        };

        return Ok(result);
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