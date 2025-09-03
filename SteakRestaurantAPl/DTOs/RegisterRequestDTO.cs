namespace SteakRestaurantAPI.DTOs
{
    public class RegisterRequestDTO
    {
        public string Email { get; set; }
        public string UserName { get; set; }  // หรือใช้ Email เป็น Username ก็ได้
        public string Password { get; set; }
        public string ConfirmPassword { get; set; }  // Optional (ใช้ Validate ฝั่ง Client)
    }
}
