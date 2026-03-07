 
namespace FinSys.Models
{
    public class Companies
    {
        public int Id { get; set;} 

        public required int ClientId { get; set; }

        public required int CompanyId { get; set; }

        public required string CompanyName { get; set; }

        public byte[]? CompanyLogo { get; set; }

        public required string CompanyIndustry { get; set; }

        public required string CompanyCountry { get; set; }

        public required bool Employees { get; set; }

        public required string Plan { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}