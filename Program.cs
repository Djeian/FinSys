using FinSys.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<ApplicationDbContext>(options => 
    options.UseMySql(
            builder.Configuration.GetConnectionString("DefaultConnection"),
            ServerVersion.AutoDetect(builder.Configuration.GetConnectionString("DefaultConnection"))
        )
        .UseSnakeCaseNamingConvention()
);

builder.Services.AddAuthentication("UserSession")
    .AddCookie("UserSession", options =>
    {
        options.LoginPath = "/Public/Account/LogIn";
        options.AccessDeniedPath = "/Public/Account/LogIn?error=accessdenied";
        options.ExpireTimeSpan = TimeSpan.FromHours(1);

        options.SlidingExpiration = false;
        options.Cookie.IsEssential = true;
        options.Cookie.HttpOnly = true;
        options.Cookie.MaxAge = options.ExpireTimeSpan;
    });


builder.Services.AddAuthorization();

// Add services to the container.
builder.Services.AddControllersWithViews();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

app.MapStaticAssets();


// THIS HANDLE THE AREAS ROUTING
app.MapControllerRoute(
    name: "areas",
    pattern: "{area:exists}/{controller=Home}/{action=Main}/{id?}"); // CHANGE MO LANG TONG ACTION SA `Main` PAG NAG PULL KA NG REQUEST GALING SAKEN -- MIGZ 
 
app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Main}/{id?}", // CHANGE MO LANG TONG ACTION SA `Main` PAG NAG PULL KA NG REQUEST GALING SAKEN -- MIGZ
    defaults: new { area = "Public" }) // GAWIN MONG `Member` to pag sa admin
    .WithStaticAssets();


app.Run();
