namespace FinSys.DTO
{
    public class FinancialTransactionsDto
    {
        public int Id { get; set; }
        public string? Type { get; set; }

        public DateTime DateOfTransaction { get; set; }

        public string? Category { get; set; }

        public string? Description { get; set; }

        public int Amount { get; set; }

        public string? Payee { get; set; }
    }
}