using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SteakRestaurantAPl.Models
{
    public class Payment
    {
        public int Id { get; set; }

        public int OrderId { get; set; }
        public Order Order { get; set; } = default!;

        [MaxLength(30)]
        public string PaymentMethod { get; set; } = "Cash";

        public DateTime? PaidAt { get; set; }

        // ถ้าอยากเก็บยอดเงินในตารางจ่ายด้วย
        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }
    }
}
