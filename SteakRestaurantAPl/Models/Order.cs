using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SteakRestaurantAPl.Models
{
    public class Order
    {
        public int Id { get; set; }

        [MaxLength(64)]
        public string SessionToken { get; set; } = default!;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [MaxLength(30)]
        public string Status { get; set; } = "Open";

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalAmount { get; set; }

        // ⬇️ เพิ่ม navigation
        public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
        public ICollection<Payment> Payments { get; set; } = new List<Payment>();
    }
}
