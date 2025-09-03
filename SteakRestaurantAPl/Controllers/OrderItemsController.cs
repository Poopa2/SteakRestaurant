using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SteakRestaurantAPl.Data;
using SteakRestaurantAPl.Models;
// ปรับ namespace ให้ตรงกับโปรเจกต์ DTO ของคุณ:
// ถ้า DTO อยู่ที่ SteakRestaurantAPI.DTOs ให้ใช้บรรทัดด้านล่าง
using SteakRestaurantAPI.DTOs;
// ถ้า DTO อยู่ใน SteakRestaurantAPl.DTOs ให้เปลี่ยนเป็น:
// using SteakRestaurantAPl.DTOs;

namespace SteakRestaurantAPl.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrderItemsController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        private readonly IMapper _mapper;

        public OrderItemsController(ApplicationDbContext db, IMapper mapper)
        {
            _db = db;
            _mapper = mapper;
        }

        // GET: api/orderitems
        [HttpGet]
        public async Task<ActionResult<IEnumerable<OrderItem>>> GetAll()
        {
            var items = await _db.OrderItems
                .Include(oi => oi.Product)
                .Include(oi => oi.Order)
                .ToListAsync();

            return Ok(items);
        }

        // GET: api/orderitems/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<OrderItem>> GetById(int id)
        {
            var item = await _db.OrderItems
                .Include(oi => oi.Product)
                .Include(oi => oi.Order)
                .FirstOrDefaultAsync(oi => oi.Id == id);

            if (item == null) return NotFound();
            return Ok(item);
        }

        // GET: api/orderitems/byorder/{orderId}
        [HttpGet("byorder/{orderId}")]
        public async Task<ActionResult<IEnumerable<OrderItem>>> GetByOrderId(int orderId)
        {
            var items = await _db.OrderItems
                .Where(oi => oi.OrderId == orderId)
                .Include(oi => oi.Product)
                .ToListAsync();

            return Ok(items);
        }

        // POST: api/orderitems
        [HttpPost]
        public async Task<ActionResult<OrderItem>> Create(OrderItemCreateDTO dto)
        {
            // ตรวจสอบว่า Order / Product มีจริง
            var orderExists = await _db.Orders.AnyAsync(o => o.Id == dto.OrderId);
            var productExists = await _db.Products.AnyAsync(p => p.Id == dto.ProductId);
            if (!orderExists || !productExists)
                return BadRequest("Invalid OrderId or ProductId");

            var item = _mapper.Map<OrderItem>(dto);
            _db.OrderItems.Add(item);
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = item.Id }, item);
        }

        // PUT: api/orderitems/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, OrderItem item)
        {
            if (id != item.Id) return BadRequest();

            var existing = await _db.OrderItems.FindAsync(id);
            if (existing == null) return NotFound();

            existing.ProductId = item.ProductId;
            existing.Quantity = item.Quantity;
            existing.Price = item.Price;

            await _db.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/orderitems/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var item = await _db.OrderItems.FindAsync(id);
            if (item == null) return NotFound();

            _db.OrderItems.Remove(item);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}
