using Microsoft.AspNetCore.Mvc;
using QRCoder;

namespace SteakRestaurantAPl.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class QrController : ControllerBase
    {
        // GET /api/qr/start  → คืนภาพ PNG ของ QR ที่ชี้ไป /api/Sessions/start
        [HttpGet("start")]
        public IActionResult GetQrForStart()
        {
            var url = $"{Request.Scheme}://{Request.Host}/api/Sessions/start";

            using var gen = new QRCodeGenerator();
            using var data = gen.CreateQrCode(url, QRCodeGenerator.ECCLevel.Q);
            var png = new PngByteQRCode(data);
            var bytes = png.GetGraphic(20);

            return File(bytes, "image/png", "qr-start.png");
        }
    }
}
