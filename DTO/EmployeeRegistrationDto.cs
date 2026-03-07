namespace FinSys.DTO
{
    public class EmployeeRegistration
    {
        public required string FirstName { get; set; }

        public string? MiddleName { get; set; }

        public required string LastName { get; set; }

        public required string Position { get; set; }

        public required string Role { get; set; }

        public required string Email { get; set; }

        public required string Phone { get; set; }

        public required string Address { get; set; }
    }
}