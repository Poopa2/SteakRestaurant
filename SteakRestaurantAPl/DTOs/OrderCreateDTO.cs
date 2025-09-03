public class OrderCreateDTO
{
    public string SessionToken { get; set; } = null!;  // จาก QR
    public decimal TotalAmount { get; set; }
    public string Status { get; set; } = "Open";
}
