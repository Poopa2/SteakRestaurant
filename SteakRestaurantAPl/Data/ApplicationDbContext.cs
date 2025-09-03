using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using SteakRestaurantAPl.Models;

namespace SteakRestaurantAPl.Data
{
    // ถ้าไม่ได้ใช้ Identity ก็อยู่ได้ เพราะเรายังสืบจาก IdentityDbContext
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        public ApplicationDbContext() { }                              // ให้ EF CLI ใช้ ctor ว่างได้
        public ApplicationDbContext(DbContextOptions options) : base(options) { }

        // ใช้คอนเนกชันสตริงจากนี่ (dev) — ถ้า AddDbContext ใน Program.cs ก็จะ override ได้
        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
            {
                optionsBuilder.UseSqlServer(
                    "Server=LAPTOP-6FQ9C8GJ\\SQLEXPRESS01;Database=SteakRestaurantAPl;Trusted_Connection=True;TrustServerCertificate=True;");
            }
        }
       
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // ---------- Product ----------
            modelBuilder.Entity<Product>(e =>
            {
                e.Property(p => p.Name).HasMaxLength(200).IsRequired();
                e.Property(p => p.Category).HasMaxLength(100);
                e.Property(p => p.SpecialTag).HasMaxLength(100);
                e.Property(p => p.Description).HasMaxLength(1000);
                e.Property(p => p.ImageUrl).HasMaxLength(500);
                e.Property(p => p.Price).HasColumnType("decimal(18,2)"); // ราคาเป็นทศนิยม 2 ตำแหน่ง
            });

            // ---------- Order ----------
            modelBuilder.Entity<Order>(e =>
            {
                e.Property(o => o.TotalAmount).HasColumnType("decimal(18,2)");
                e.Property(o => o.SessionToken).HasMaxLength(64);
                e.HasIndex(o => o.SessionToken).IsUnique();             // โทเคนไม่ซ้ำ
                e.HasMany(o => o.OrderItems)
                    .WithOne(i => i.Order)
                    .HasForeignKey(i => i.OrderId)
                    .OnDelete(DeleteBehavior.Cascade);                  // ลบออเดอร์ -> ไอเท็มหายด้วย
            });

            // ---------- OrderItem ----------
            modelBuilder.Entity<OrderItem>(e =>
            {
                e.Property(i => i.Price).HasColumnType("decimal(18,2)");
                e.HasOne(i => i.Product)
                    .WithMany()
                    .HasForeignKey(i => i.ProductId)
                    .OnDelete(DeleteBehavior.Restrict);                 // กันลบสินค้าแล้วกระทบประวัติ
            });

            // ---------- Payment ----------
            modelBuilder.Entity<Payment>(e =>
            {
                e.HasOne(p => p.Order)
                    .WithMany(o => o.Payments)
                    .HasForeignKey(p => p.OrderId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // ---------- Customization ----------
            modelBuilder.Entity<Customization>(e =>
            {
                e.Property(c => c.Note).HasMaxLength(500);
                e.HasOne(c => c.OrderItem)
                    .WithMany(i => i.Customizations)
                    .HasForeignKey(c => c.OrderItemId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // ---------- SEED ข้อมูลสินค้า ----------
            var path = "/images";
            modelBuilder.Entity<Product>().HasData(
                new Product
                {
                    Id = 1,
                    Name = "สเต็กริบอายพรีเมี่ยม",
                    Description = "เนื้อริบอายพรีเมี่ยม 24 ออนซ์ อบแห้ง 28 วัน ย่างสุกตามต้องการพร้อมเครื่องปรุงพิเศษ",
                    ImageUrl = $"{path}/ribeye.jpg",
                    Price = 1890,
                    Category = "สเต็กพรีเมี่ยม",
                    SpecialTag = "เชฟแนะนำ"
                },
                new Product
                {
                    Id = 2,
                    Name = "เนื้อวากิวเทนเดอร์ลอยน์",
                    Description = "เนื้อวากิวญี่ปุ่น A5 เทนเดอร์ลอยน์ 8 ออนซ์ จุดสุดยอดของความสมบูรณ์แบบ เสิร์ฟพร้อมเนยเทรอฟเฟิล",
                    ImageUrl = $"{path}/wagyu_tenderloin.jpg",
                    Price = 2890,
                    Category = "สเต็กพรีเมี่ยม",
                    SpecialTag = "หรูหรา"
                },
                new Product
                {
                    Id = 3,
                    Name = "ที-โบนคลาสสิก",
                    Description = "เนื้อที-โบน 20 ออนซ์ ที่มีทั้งส่วนสตริปและเทนเดอร์ลอยน์ ตัวเลือกคลาสสิกสำหรับผู้ชื่นชอบสเต็ก",
                    ImageUrl = $"{path}/tbone.jpg",
                    Price = 1590,
                    Category = "เนื้อแบบดั้งเดิม",
                    SpecialTag = "ยอดนิยม"
                },
                new Product
                {
                    Id = 4,
                    Name = "หางกุ้งมังกรย่าง",
                    Description = "หางกุ้งมังกรเมนสดจากทะเลย่างพร้อมเนยกระเทียมและสมุนไพร เข้าคู่ได้ลงตัวกับสเต็กทุกชนิด",
                    ImageUrl = $"{path}/lobster_tail.jpg",
                    Price = 1290,
                    Category = "ซีฟู้ด",
                    SpecialTag = "สดใหม่ทุกวัน"
                },
                new Product
                {
                    Id = 5,
                    Name = "แมคแอนด์ชีสเทรอฟเฟิล",
                    Description = "แมคโครนีชีสครีมมี่ยกระดับด้วยเทรอฟเฟิลดำและชีสกรูแยร์ที่บ่มแล้ว",
                    ImageUrl = $"{path}/truffle_mac.jpg",
                    Price = 590,
                    Category = "เครื่องเคียง",
                    SpecialTag = "เมนูพิเศษ"
                },
                new Product
                {
                    Id = 6,
                    Name = "สลัดซีซาร์",
                    Description = "สลัดซีซาร์คลาสสิกด้วยผักกาดโรแมน พาร์มิซาน เครานตอง และน้ำสลัดแองโชวี่สูตรพิเศษ",
                    ImageUrl = $"{path}/caesar_salad.jpg",
                    Price = 390,
                    Category = "อาหารเรียกน้ำย่อย",
                    SpecialTag = "แบบดั้งเดิม"
                }
            );
        }

        // DbSets
        public DbSet<Product> Products { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<Customization> Customizations { get; set; }
    }
}
