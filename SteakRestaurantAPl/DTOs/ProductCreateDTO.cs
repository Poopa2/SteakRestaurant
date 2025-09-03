public class ProductCreateDTO
{
    public string Name { get; set; }
    public string Description { get; set; }
    public string SpecialTag { get; set; }
    public string Category { get; set; }
    public decimal Price { get; set; } // ✅ เดิมอาจเป็น double
    public IFormFile File { get; set; } // ✅ รับรูปภาพ
}
