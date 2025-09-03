using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SteakRestaurantAPl.Data;
using SteakRestaurantAPl.Models;

namespace SteakRestaurantAPl.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentsController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        private readonly IMapper _mapper;

        public PaymentsController(ApplicationDbContext db, IMapper mapper)
        {
            _db = db;
            _mapper = mapper;
        }

        // GET: api/payments
        /// <summary>
        /// ดึงข้อมูลการชำระเงินทั้งหมด
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Payment>>> GetAll()
        {
            var payments = await _db.Payments
                .Include(p => p.Order)
                .ToListAsync();

            return Ok(payments);
        }

        // GET: api/payments/{id}
        /// <summary>
        /// ดึงข้อมูลการชำระเงินตามรหัส
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<Payment>> GetById(int id)
        {
            var payment = await _db.Payments
                .Include(p => p.Order)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (payment == null)
                return NotFound();

            return Ok(payment);
        }

        // GET: api/payments/byorder/{orderId}
        /// <summary>
        /// ดึงข้อมูลการชำระเงินตามรหัสออเดอร์
        /// </summary>
        [HttpGet("byorder/{orderId}")]
        public async Task<ActionResult<IEnumerable<Payment>>> GetByOrderId(int orderId)
        {
            var payments = await _db.Payments
                .Where(p => p.OrderId == orderId)
                .ToListAsync();

            return Ok(payments);
        }

        // POST: api/payments
        /// <summary>
        /// สร้างข้อมูลการชำระเงินใหม่
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<Payment>> Create(PaymentCreateDTO dto)
        {
            // ตรวจสอบว่า OrderId มีอยู่จริงหรือไม่
            var orderExists = await _db.Orders.AnyAsync(o => o.Id == dto.OrderId);
            if (!orderExists)
                return BadRequest("OrderId ไม่ถูกต้อง");

            // แปลง DTO → Entity และใส่เวลา
            var payment = _mapper.Map<Payment>(dto);
            payment.PaidAt = DateTime.Now;

            _db.Payments.Add(payment);
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = payment.Id }, payment);
        }

        // DELETE: api/payments/{id}
        /// <summary>
        /// ลบข้อมูลการชำระเงิน
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var payment = await _db.Payments.FindAsync(id);
            if (payment == null)
                return NotFound();

            _db.Payments.Remove(payment);
            await _db.SaveChangesAsync();

            return NoContent();
        }
    }
}
