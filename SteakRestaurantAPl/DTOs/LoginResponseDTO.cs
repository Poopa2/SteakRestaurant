namespace SteakRestaurantAPI.DTOs
{
    public class LoginResponseDTO
    {
        public string Token { get; set; }  // JWT Token
        public string UserName { get; set; }
        public string Email { get; set; }
        public string Role { get; set; }   // Optional: "Admin", "Staff", ฯลฯ
    }
}
