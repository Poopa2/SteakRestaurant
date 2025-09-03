using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SteakRestaurantAPl.Data;
using SteakRestaurantAPl.Models;

namespace SteakRestaurantAPl.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CustomizationsController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        private readonly IMapper _mapper;

        public CustomizationsController(ApplicationDbContext db, IMapper mapper)
        {
            _db = db;
            _mapper = mapper;
        }

        // GET: api/customizations
        /// <summary>
        /// ดึงรายการคำขอพิเศษทั้งหมด
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Customization>>> GetAll()
        {
            return Ok(await _db.Customizations
                .Include(c => c.OrderItem)
                .ThenInclude(oi => oi.Product)
                .ToListAsync());
        }

        // GET: api/customizations/{id}
        /// <summary>
        /// ดึงคำขอพิเศษตามรหัส
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<Customization>> GetById(int id)
        {
            var customization = await _db.Customizations
                .Include(c => c.OrderItem)
                .ThenInclude(oi => oi.Product)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (customization == null)
                return NotFound();

            return Ok(customization);
        }

        // GET: api/customizations/byorderitem/{orderItemId}
        /// <summary>
        /// ดึงคำขอพิเศษทั้งหมดของรายการอาหารที่ระบุ
        /// </summary>
        [HttpGet("byorderitem/{orderItemId}")]
        public async Task<ActionResult<IEnumerable<Customization>>> GetByOrderItem(int orderItemId)
        {
            var list = await _db.Customizations
                .Where(c => c.OrderItemId == orderItemId)
                .ToListAsync();

            return Ok(list);
        }

        // POST: api/customizations
        /// <summary>
        /// เพิ่มคำขอพิเศษใหม่
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<Customization>> Create(CustomizationCreateDTO dto)
        {
            // ตรวจสอบว่า OrderItem มีอยู่จริงหรือไม่
            var orderItemExists = await _db.OrderItems.AnyAsync(oi => oi.Id == dto.OrderItemId);
            if (!orderItemExists)
                return BadRequest("Invalid OrderItemId");

            // ใช้ AutoMapper แปลง DTO → Entity
            var customization = _mapper.Map<Customization>(dto);

            _db.Customizations.Add(customization);
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = customization.Id }, customization);
        }


        // PUT: api/customizations/{id}
        /// <summary>
        /// แก้ไขคำขอพิเศษ
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, Customization updated)
        {
            if (id != updated.Id)
                return BadRequest();

            var existing = await _db.Customizations.FindAsync(id);
            if (existing == null)
                return NotFound();

            existing.Note = updated.Note;
            await _db.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/customizations/{id}
        /// <summary>
        /// ลบคำขอพิเศษ
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var customization = await _db.Customizations.FindAsync(id);
            if (customization == null)
                return NotFound();

            _db.Customizations.Remove(customization);
            await _db.SaveChangesAsync();

            return NoContent();
        }
    }
}
