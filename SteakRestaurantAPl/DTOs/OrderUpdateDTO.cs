namespace SteakRestaurantAPI.DTOs
{
    public class OrderUpdateDTO
    {
        public int Id { get; set; }
        public decimal TotalAmount { get; set; }
        public string Status { get; set; } = null!;
    }
}
