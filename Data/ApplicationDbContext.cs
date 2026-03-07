using Microsoft.EntityFrameworkCore;
using FinSys.Models;

namespace FinSys.Data
{
    public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
    {
        public DbSet<Clients> Clients { get; set; }
        
        public DbSet<Companies> Companies { get; set; }

        public DbSet<Employees> Employees { get; set; }

        public DbSet<FinancialTransactions> FinancialTransactions { get; set; }

        public DbSet<ResetPasswordCodes> ResetPasswordCodes { get; set; }
    }   
}