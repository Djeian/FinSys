
namespace FinSys.Models
{
    public class ResetPasswordCodes
    {
        public int Id { get; set; }

        public required string Email { get; set; }

        public required string Code { get; set; }

        public required bool IsUsed { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}