using Microsoft.AspNetCore.Identity;


public class ApplicationUser : IdentityUser
{
    // ✅ เพิ่มฟิลด์เพิ่มเติมได้ เช่น ชื่อจริง, เบอร์โทร ฯลฯ
    public string? FullName { get; set; }

    public string? Role { get; set; }  // optional: ใช้แสดงบทบาทถ้าจำเป็น (Staff, Admin ฯลฯ)

    // ❗ ถ้าคุณใช้กับ Order/TableReservation ก็สามารถเพิ่มความสัมพันธ์ได้
    // เช่น:
    // public ICollection<Order>? Orders { get; set; }
}
