using System.ComponentModel.DataAnnotations.Schema;

namespace SteakRestaurantAPl.Models
{
    public class OrderItem
    {
        public int Id { get; set; }

        public int OrderId { get; set; }
        public Order Order { get; set; } = default!;

        public int ProductId { get; set; }
        public Product Product { get; set; } = default!;

        public int Quantity { get; set; } = 1;

        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; }

        // ⬇️ เพิ่ม navigation
        public ICollection<Customization> Customizations { get; set; } = new List<Customization>();
    }
}
