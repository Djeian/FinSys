

namespace FinSys.DTO
{   
    public class ClientSignUpDto
    {
        public required string FirstName { get; set; }

        public required string LastName { get; set; }

        public required string Email { get; set; }

        public required string Phone { get; set; }

        public required string Password { get; set; }

        public required string Country { get; set; }

    }
}