
namespace FinSys.Models
{
    public class FinancialTransactions 
    {  
        public int Id { get; set; }

        public required int CompanyId { get; set; }

        public required string Type { get; set; }

        public required DateTime DateOfTransaction { get; set; }

        public required string Category { get; set; }

        public required string Description { get; set; }

        public required int Amount { get; set; }

        public required string Payee { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}