using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SteakRestaurantAPl.Data;
using SteakRestaurantAPl.Models;
using System.Security.Cryptography;

namespace SteakRestaurantAPl.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SessionsController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        public SessionsController(ApplicationDbContext db) => _db = db;

        private static string NewToken()
        {
            var b = RandomNumberGenerator.GetBytes(16); // 128-bit
            return Convert.ToBase64String(b).Replace("+", "-").Replace("/", "_").TrimEnd('=');
        }

        // ✅ GET: /api/sessions/start
        // สร้าง session ใหม่แล้ว redirect ลูกค้าไปหน้า ordering พร้อม token
        [HttpGet("start")]
        public async Task<IActionResult> Start()
        {
            var token = NewToken();

            var order = new Order
            {
                SessionToken = token,
                Status = "Open",
                CreatedAt = DateTime.UtcNow
            };

            _db.Orders.Add(order);
            await _db.SaveChangesAsync();

            // ไปหน้า static (wwwroot/ordering.html) หรือปรับเป็น URL ของ Frontend จริง
            var target = $"/ordering.html?token={Uri.EscapeDataString(token)}";
            return Redirect(target);
        }

        // POST: /api/sessions  → ใช้ในกรณีต้องการสร้าง session แบบ API (ไม่ redirect)
        [HttpPost]
        public async Task<IActionResult> CreateSession()
        {
            var token = NewToken();

            var order = new Order
            {
                SessionToken = token,
                Status = "Open",
                CreatedAt = DateTime.UtcNow
            };

            _db.Orders.Add(order);
            await _db.SaveChangesAsync();

            // URL สำหรับฝั่งลูกค้า (ถ้าต้องการใช้งานแบบ API)
            var url = $"{Request.Scheme}://{Request.Host}/ordering.html?token={token}";
            return Ok(new { token, url, orderId = order.Id });
        }

        // GET: /api/sessions/{token}  → ดูออเดอร์ตามโทเคน
        [HttpGet("{token}")]
        public async Task<IActionResult> GetOrderByToken(string token)
        {
            var order = await _db.Orders
                .Include(o => o.OrderItems)!.ThenInclude(i => i.Product)
                .FirstOrDefaultAsync(o => o.SessionToken == token && o.Status == "Open");

            if (order == null) return NotFound();
            return Ok(order);
        }
    }
}
