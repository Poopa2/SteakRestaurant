using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using SteakRestaurantAPl.Data;
using SteakRestaurantAPl.Models;
using SteakRestaurantAPI.DTOs;

namespace SteakRestaurantAPl.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrdersController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        private readonly IMapper _mapper;

        public OrdersController(ApplicationDbContext db, IMapper mapper)
        {
            _db = db;
            _mapper = mapper;
        }

        // GET: api/orders
        /// <summary>
        /// ดึงรายการคำสั่งซื้อทั้งหมด (ไม่ผูกโต๊ะ)
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Order>>> GetAll()
        {
            var orders = await _db.Orders
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Product)
                .ToListAsync();

            return Ok(orders);
        }

        // GET: api/orders/{id}
        /// <summary>
        /// ดึงข้อมูลคำสั่งซื้อตามรหัส
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<Order>> GetById(int id)
        {
            var order = await _db.Orders
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Product)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null) return NotFound();
            return Ok(order);
        }

        // POST: api/orders
        /// <summary>
        /// สร้างคำสั่งซื้อใหม่ (อิง SessionToken)
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<Order>> Create(OrderCreateDTO dto)
        {
            var order = _mapper.Map<Order>(dto);
            order.CreatedAt = DateTime.UtcNow;

            _db.Orders.Add(order);
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = order.Id }, order);
        }

        // PUT: api/orders/{id}
        /// <summary>
        /// แก้ไขข้อมูลคำสั่งซื้อ (ไม่แก้ SessionToken)
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, OrderUpdateDTO dto)
        {
            if (id != dto.Id) return BadRequest();

            var existing = await _db.Orders.FindAsync(id);
            if (existing == null) return NotFound();

            existing.Status = dto.Status;
            existing.TotalAmount = dto.TotalAmount;

            await _db.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/orders/{id}
        /// <summary>
        /// ลบคำสั่งซื้อ (พร้อมรายการอาหาร)
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var order = await _db.Orders
                .Include(o => o.OrderItems)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null) return NotFound();

            _db.OrderItems.RemoveRange(order.OrderItems);
            _db.Orders.Remove(order);
            await _db.SaveChangesAsync();

            return NoContent();
        }
    }
}
