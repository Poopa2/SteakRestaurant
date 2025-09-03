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
    public class ProductsController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        private readonly IMapper _mapper;

        public ProductsController(ApplicationDbContext db, IMapper mapper)
        {
            _db = db;
            _mapper = mapper;
        }

        // GET: /api/products
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Product>>> GetAll()
        {
            return Ok(await _db.Products.ToListAsync());
        }

        // GET: /api/products/{id}
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ProductReadDTO))]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [HttpGet("{id}")]
        public async Task<ActionResult<ProductReadDTO>> GetById(int id)
        {
            var product = await _db.Products.FindAsync(id);
            if (product == null) return NotFound();

            var dto = _mapper.Map<ProductReadDTO>(product);
            return Ok(dto);
        }


        // POST: /api/products
        [HttpPost]
        public async Task<ActionResult<Product>> Create([FromForm] ProductCreateDTO dto)
        {
            if (dto.File == null || dto.File.Length == 0)
                return BadRequest("กรุณาเลือกไฟล์ภาพ");

            // สร้างชื่อไฟล์ใหม่ป้องกันชื่อซ้ำ
            var fileName = Guid.NewGuid().ToString() + Path.GetExtension(dto.File.FileName);
            var uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images");

            if (!Directory.Exists(uploadPath))
                Directory.CreateDirectory(uploadPath);

            var filePath = Path.Combine(uploadPath, fileName);

            // บันทึกไฟล์ภาพ
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await dto.File.CopyToAsync(stream);
            }

            // สร้าง Product entity (ไม่ใช้ AutoMapper เพราะมี logic พิเศษ)
            var product = new Product
            {
                Name = dto.Name,
                Description = dto.Description,
                SpecialTag = dto.SpecialTag,
                Category = dto.Category,
                Price = dto.Price,
                ImageUrl = "/images/" + fileName // ✅ path ไปใช้แสดงผล
            };

            _db.Products.Add(product);
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = product.Id }, product);
        }


        // PUT: /api/products/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, ProductUpdateDTO dto)
        {
            if (id != dto.Id) return BadRequest();

            var existing = await _db.Products.FindAsync(id);
            if (existing == null) return NotFound();

            _mapper.Map(dto, existing);
            await _db.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: /api/products/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var product = await _db.Products.FindAsync(id);
            if (product == null) return NotFound();

            _db.Products.Remove(product);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}
