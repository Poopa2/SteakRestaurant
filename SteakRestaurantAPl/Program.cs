using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens; // สำหรับ JWT Authentication
using SteakRestaurantAPl.Data;
using SteakRestaurantAPl.Profiles;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Controllers & Swagger
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Authorization - เพิ่มการตั้งค่า JWT Authentication
builder.Services.AddAuthentication("Bearer")
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidIssuer = "your_app_name", // ตั้งชื่อให้เหมาะสม
            ValidAudience = "your_app_name",
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("your_secret_key")) // เปลี่ยนเป็นคีย์ที่ปลอดภัย
        };
    });

// เพิ่ม Authorization Services
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("admin"));
    options.AddPolicy("StaffOnly", policy => policy.RequireRole("staff"));
    options.AddPolicy("CustomerOnly", policy => policy.RequireRole("customer"));
});

// AutoMapper
builder.Services.AddAutoMapper(typeof(MappingProfile));

// ✅ ลงทะเบียน DbContext ให้ DI (ใช้ ctor เปล่า + OnConfiguring)
builder.Services.AddScoped<ApplicationDbContext>();

// ✅ เปิด CORS สำหรับ Front-end (Vite 5173)
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy
            .WithOrigins(
                "http://localhost:5173",
                "http://127.0.0.1:5173"
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
    );
});

// ถ้าจะใช้ Identity เต็มรูปแบบ ค่อยปลดคอมเมนต์ด้านล่างภายหลัง
// builder.Services.AddIdentityCore<ApplicationUser>()
//     .AddRoles<IdentityRole>()
//     .AddEntityFrameworkStores<ApplicationDbContext>();

var app = builder.Build();

// Swagger เฉพาะ Development
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

// ✅ ใช้ CORS ก่อน AuthN/AuthZ
app.UseCors();

// ✅ ใช้ Authentication และ Authorization
app.UseAuthentication();
app.UseAuthorization();

// กำหนดวิธีการเข้าถึง API โดยใช้ [Authorize] บน Controller หรือ Action ต่าง ๆ
app.MapControllers();
app.Run();
