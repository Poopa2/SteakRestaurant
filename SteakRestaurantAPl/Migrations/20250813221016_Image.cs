using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace SteakRestaurantAPl.Migrations
{
    /// <inheritdoc />
    public partial class Image : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "ImageUrl",
                table: "Products",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.InsertData(
                table: "Products",
                columns: new[] { "Id", "Category", "Description", "ImageUrl", "IsAvailable", "Name", "Price", "SpecialTag" },
                values: new object[,]
                {
                    { 1, "สเต็กพรีเมี่ยม", "เนื้อริบอายพรีเมี่ยม 24 ออนซ์ อบแห้ง 28 วัน ย่างสุกตามต้องการพร้อมเครื่องปรุงพิเศษ", "/images/ribeye.jpg", true, "สเต็กริบอายพรีเมี่ยม", 1890m, "เชฟแนะนำ" },
                    { 2, "สเต็กพรีเมี่ยม", "เนื้อวากิวญี่ปุ่น A5 เทนเดอร์ลอยน์ 8 ออนซ์ จุดสุดยอดของความสมบูรณ์แบบ เสิร์ฟพร้อมเนยเทรอฟเฟิล", "/images/wagyu_tenderloin.jpg", true, "เนื้อวากิวเทนเดอร์ลอยน์", 2890m, "หรูหรา" },
                    { 3, "เนื้อแบบดั้งเดิม", "เนื้อที-โบน 20 ออนซ์ ที่มีทั้งส่วนสตริปและเทนเดอร์ลอยน์ ตัวเลือกคลาสสิกสำหรับผู้ชื่นชอบสเต็ก", "/images/tbone.jpg", true, "ที-โบนคลาสสิก", 1590m, "ยอดนิยม" },
                    { 4, "ซีฟู้ด", "หางกุ้งมังกรเมนสดจากทะเลย่างพร้อมเนยกระเทียมและสมุนไพร เข้าคู่ได้ลงตัวกับสเต็กทุกชนิด", "/images/lobster_tail.jpg", true, "หางกุ้งมังกรย่าง", 1290m, "สดใหม่ทุกวัน" },
                    { 5, "เครื่องเคียง", "แมคโครนีชีสครีมมี่ยกระดับด้วยเทรอฟเฟิลดำและชีสกรูแยร์ที่บ่มแล้ว", "/images/truffle_mac.jpg", true, "แมคแอนด์ชีสเทรอฟเฟิล", 590m, "เมนูพิเศษ" },
                    { 6, "อาหารเรียกน้ำย่อย", "สลัดซีซาร์คลาสสิกด้วยผักกาดโรแมน พาร์มิซาน เครานตอง และน้ำสลัดแองโชวี่สูตรพิเศษ", "/images/caesar_salad.jpg", true, "สลัดซีซาร์", 390m, "แบบดั้งเดิม" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 6);

            migrationBuilder.AlterColumn<string>(
                name: "ImageUrl",
                table: "Products",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");
        }
    }
}
