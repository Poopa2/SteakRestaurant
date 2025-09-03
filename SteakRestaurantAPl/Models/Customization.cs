using System.ComponentModel.DataAnnotations;

namespace SteakRestaurantAPl.Models
{
    public class Customization
    {
        public int Id { get; set; }

        public int OrderItemId { get; set; }
        public OrderItem OrderItem { get; set; } = default!;

        [MaxLength(500)]
        public string? Note { get; set; }
    }
}
