
namespace FinSys.Models
{
    public class Clients
    {
        public int Id { get; set; }

        public required string FirstName { get; set; }

        public required string LastName { get; set; }

        public required string Email { get; set; }

        public required string Phone { get; set; }

        public required string Password { get; set; }

        public required string Country { get; set; }

        public required int CompanyId { get; set; }

        public required bool IsPayed { get; set; }

        public required string Position { get; set; }

        public required string Role { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}