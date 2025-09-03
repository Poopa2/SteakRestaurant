import { Link, useNavigate } from "react-router-dom";
import { getUser, logout } from "../auth";
import { useEffect, useMemo, useState } from "react";
import { api, ensureSessionToken, type Product, type OrderItem } from "../lib/api";


type SortKey = "name-asc" | "name-desc" | "price-asc" | "price-desc";

const money = new Intl.NumberFormat("th-TH", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

// รองรับทั้งกรณีตั้ง proxy (/api,/images) และตั้ง VITE_API_BASE
const BASE = (import.meta.env.VITE_API_BASE ?? "").replace(/\/$/, "");
const assetUrl = (path?: string | null) => {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return BASE ? `${BASE}${path}` : path;
};

// ---------- Admin (no user system) ----------
const ADMIN_KEY = (import.meta.env.VITE_ADMIN_KEY as string) || "admin1234";
const isAdminStored = () => localStorage.getItem("isAdmin") === "1";

export default function StorefrontPage() {
  const nav = useNavigate();

  // auth (ผู้ใช้ทั่วไป)
  const [user, setUser] = useState(getUser());

  // admin flag
  const [isAdmin, setIsAdmin] = useState<boolean>(isAdminStored());

  // data
  const [orderId, setOrderId] = useState<number>();
  const [products, setProducts] = useState<Product[]>([]);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState("ทั้งหมด");
  const [sort, setSort] = useState<SortKey>("name-asc");
  const [addingId, setAddingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // sync user เมื่อมีการเปลี่ยน localStorage (เช่นล็อกอินจากหน้า /login แล้วกด back)
  useEffect(() => {
    const onStorage = () => setUser(getUser());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // โหลดครั้งแรก
  useEffect(() => {
    (async () => {
      try {
        setError(null);
        const { orderId } = await ensureSessionToken();
        setOrderId(orderId);
        const [ps, its] = await Promise.all([
          api.products(),
          api.orderItemsByOrder(orderId),
        ]);
        setProducts(ps);
        setItems(its);
      } catch (e: any) {
        setError(e?.message || "ไม่สามารถโหลดข้อมูลได้");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Admin: เข้าสู่ระบบ/ออกจากระบบแบบ prompt
  function adminLogin() {
    const code = prompt("กรอกรหัสแอดมิน");
    if (!code) return;
    if (code === ADMIN_KEY) {
      localStorage.setItem("isAdmin", "1");
      setIsAdmin(true);
      alert("เข้าสู่โหมดแอดมินแล้ว");
    } else {
      alert("รหัสไม่ถูกต้อง");
    }
  }
  function adminLogout() {
    localStorage.removeItem("isAdmin");
    setIsAdmin(false);
    alert("ออกจากโหมดแอดมินแล้ว");
  }

  // Logout ผู้ใช้ทั่วไป
  function onLogout() {
    logout();
    setUser(null);
    nav(0); // reload เพื่อรีเฟรชข้อมูลตะกร้า/ปุ่ม
  }

  // หมวดหมู่จากข้อมูลจริง
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => p.category && set.add(p.category));
    return ["ทั้งหมด", ...Array.from(set)];
  }, [products]);

  // คัดกรอง + เรียง
  const filteredSorted = useMemo(() => {
    const q = search.trim().toLowerCase();
    let arr = products.filter((p) => {
      const matchQ =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.description ?? "").toLowerCase().includes(q) ||
        (p.category ?? "").toLowerCase().includes(q) ||
        (p.specialTag ?? "").toLowerCase().includes(q);
      const matchCat = activeCat === "ทั้งหมด" || (p.category ?? "") === activeCat;
      return matchQ && matchCat;
    });

    switch (sort) {
      case "name-asc":
        arr = arr.sort((a, b) => a.name.localeCompare(b.name, "th"));
        break;
      case "name-desc":
        arr = arr.sort((a, b) => b.name.localeCompare(a.name, "th"));
        break;
      case "price-asc":
        arr = arr.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        arr = arr.sort((a, b) => b.price - a.price);
        break;
    }
    return arr;
  }, [products, search, activeCat, sort]);

  const cartCount = useMemo(
    () => items.reduce((s, x) => s + (x.quantity ?? 0), 0),
    [items]
  );
  const total = useMemo(
    () => items.reduce((s, x) => s + x.price * x.quantity, 0),
    [items]
  );

  async function refreshCart() {
    if (!orderId) return;
    const its = await api.orderItemsByOrder(orderId);
    setItems(its);
  }

  async function addToCart(p: Product) {
    if (!orderId || addingId === p.id) return;
    setAddingId(p.id);
    try {
      await api.addItem({
        orderId,
        productId: p.id,
        quantity: 1,
        price: p.price,
      });
      await refreshCart();
    } catch (e: any) {
      alert(e?.message || "ไม่สามารถเพิ่มรายการได้");
    } finally {
      setAddingId(null);
    }
  }

  if (loading)
    return (
      <div
        style={{
          padding: 24,
          background: "#1a1a1a",
          color: "#f5d742",
          minHeight: "100vh",
        }}
      >
        กำลังโหลดสเต็กพรีเมี่ยม...
      </div>
    );

  return (
    <div
      style={{
        fontFamily: "system-ui, serif",
        background: "#1a1a1a",
        color: "#f5d742",
        minHeight: "100vh",
      }}
    >
      {/* NAVBAR */}
      <div
        style={{
          height: 80,
          background: "linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)",
          color: "#f5d742",
          display: "flex",
          alignItems: "center",
          padding: "0 24px",
          gap: 24,
          borderBottom: "2px solid #f5d742",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              background: "linear-gradient(45deg, #f5d742, #d4b942)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
              color: "#1a1a1a",
            }}
          >
            🥩
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "serif" }}>
              Prime Cut
            </div>
            <div style={{ fontSize: 12, color: "#d4b942" }}>ร้านสเต็กพรีเมี่ยม</div>
          </div>
        </div>

        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          {/* แสดงสถานะแอดมินถ้าเปิดอยู่ */}
          {isAdmin && (
            <span
              style={{
                padding: "6px 10px",
                borderRadius: 10,
                border: "1px solid rgba(245,215,66,.35)",
                background: "rgba(245,215,66,.15)",
                fontSize: 12,
              }}
              title="โหมดแอดมินกำลังใช้งาน"
            >
              โหมดแอดมิน
            </span>
          )}

          {/* ตะกร้า */}
          <div
            style={{
              padding: "8px 16px",
              borderRadius: 25,
              background: "linear-gradient(45deg, #f5d742, #d4b942)",
              color: "#1a1a1a",
              fontWeight: 600,
              boxShadow: "0 4px 12px rgba(245, 215, 66, 0.3)",
            }}
          >
            🛒 {cartCount} รายการ
          </div>

          {/* Register/Login หรือ Welcome + Logout */}
          {!user ? (
            <>
              <Link
                to="/register"
                style={{
                  color: "#f5d742",
                  textDecoration: "none",
                  padding: "8px 10px",
                }}
              >
                Register
              </Link>
              <Link
                to="/login"
                style={{
                  padding: "8px 16px",
                  borderRadius: 25,
                  background: "linear-gradient(45deg, #28a745, #1e7e34)",
                  color: "#fff",
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                Login
              </Link>
            </>
          ) : (
            <>
              <span style={{ color: "#f5d742" }}>Welcome, {user.username}</span>
              <button
                onClick={onLogout}
                style={{
                  padding: "8px 16px",
                  borderRadius: 25,
                  border: "none",
                  background: "linear-gradient(45deg, #dc3545, #b02a37)",
                  color: "#fff",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Logout
              </button>
            </>
          )}

          {/* ปุ่มโหมดแอดมิน (คงไว้ตามเดิม) */}
          {!isAdmin ? (
            <button
              onClick={adminLogin}
              style={{
                padding: "8px 16px",
                borderRadius: 25,
                border: "2px solid #f5d742",
                background: "transparent",
                color: "#f5d742",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              เข้าสู่ระบบแอดมิน
            </button>
          ) : (
            <button
              onClick={adminLogout}
              style={{
                padding: "8px 16px",
                borderRadius: 25,
                border: "2px solid #f5d742",
                background: "transparent",
                color: "#f5d742",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              ออกจากระบบแอดมิน
            </button>
          )}
        </div>
      </div>

      {/* HERO + SEARCH */}
      <div
        style={{
          height: 300,
          backgroundImage:
            "url('https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1800&auto=format&fit=crop')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
          display: "grid",
          placeItems: "center",
        }}
      >
        <div
          style={{ position: "absolute", inset: 0, background: "rgba(26, 26, 26, 0.75)" }}
        />
        <div style={{ position: "relative", width: "min(800px, 92vw)", textAlign: "center" }}>
          <h1
            style={{
              fontSize: 48,
              fontWeight: 700,
              color: "#f5d742",
              marginBottom: 16,
              fontFamily: "serif",
              textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
            }}
          >
            สเต็กพรีเมี่ยม และอาหารมื้อพิเศษ
          </h1>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: "rgba(255,255,255,0.95)",
              borderRadius: 50,
              padding: 12,
              boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
              backdropFilter: "blur(10px)",
            }}
          >
            <input
              placeholder="ค้นหาเมนูพรีเมี่ยมของเรา..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                fontSize: 16,
                padding: "12px 20px",
                borderRadius: 50,
                background: "transparent",
                color: "#1a1a1a",
              }}
            />
            <button
              style={{
                borderRadius: 50,
                border: "none",
                background: "linear-gradient(45deg, #f5d742, #d4b942)",
                padding: "12px 20px",
                color: "#1a1a1a",
                fontSize: 16,
                cursor: "pointer",
              }}
            >
              🔍
            </button>
          </div>
        </div>
      </div>

      {/* TABS + SORT */}
      <div
        style={{
          maxWidth: 1400,
          margin: "24px auto",
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          gap: 24,
          background: "rgba(42, 42, 42, 0.8)",
          borderRadius: 16,
          backdropFilter: "blur(10px)",
        }}
      >
        <div style={{ display: "flex", gap: 32, flexWrap: "wrap", padding: "16px 0" }}>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCat(c)}
              style={{
                background: "transparent",
                border: "none",
                fontWeight: activeCat === c ? 700 : 500,
                color: activeCat === c ? "#f5d742" : "#e0e0e0",
                paddingBottom: 12,
                borderBottom:
                  activeCat === c ? "3px solid #f5d742" : "3px solid transparent",
                cursor: "pointer",
                fontSize: 16,
                fontFamily: "serif",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              {c}
            </button>
          ))}
        </div>
        <div style={{ marginLeft: "auto" }}>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            style={{
              padding: "12px 16px",
              borderRadius: 12,
              border: "2px solid #f5d742",
              background: "#2a2a2a",
              color: "#f5d742",
              fontSize: 14,
            }}
          >
            <option value="name-asc">ชื่อ ก-ฮ</option>
            <option value="name-desc">ชื่อ ฮ-ก</option>
            <option value="price-asc">ราคา น้อย-มาก</option>
            <option value="price-desc">ราคา มาก-น้อย</option>
          </select>
        </div>
      </div>

      {/* GRID การ์ดสินค้า */}
      <div
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          padding: "0 24px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))",
          gap: 24,
        }}
      >
        {filteredSorted.map((p) => (
          <div
            key={p.id}
            style={{
              background: "linear-gradient(145deg, #2a2a2a 0%, #1a1a1a 100%)",
              borderRadius: 20,
              padding: 24,
              boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
              border: "1px solid rgba(245, 215, 66, 0.2)",
            }}
          >
            {/* badge + cart */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  background: "linear-gradient(45deg, #f5d742, #d4b942)",
                  color: "#1a1a1a",
                  padding: "6px 12px",
                  borderRadius: 20,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                {p.specialTag || "พรีเมี่ยม"}
              </span>
              <button
                onClick={() => addToCart(p)}
                disabled={addingId === p.id}
                title="เพิ่มลงตะกร้า"
                style={{
                  border: "2px solid #f5d742",
                  color: "#f5d742",
                  background: "transparent",
                  borderRadius: 12,
                  padding: "8px 12px",
                  cursor: "pointer",
                  fontSize: 16,
                }}
              >
                {addingId === p.id ? "..." : "🛒+"}
              </button>
            </div>

            {/* รูป */}
            <div style={{ display: "grid", placeItems: "center", margin: "16px 0 20px" }}>
              <div
                style={{
                  width: 280,
                  height: 280,
                  borderRadius: 20,
                  overflow: "hidden",
                  background: "linear-gradient(45deg, #3a3a3a, #2a2a2a)",
                  display: "grid",
                  placeItems: "center",
                  border: "3px solid rgba(245, 215, 66, 0.3)",
                }}
              >
                {!!p.imageUrl && (
                  <img
                    src={assetUrl(p.imageUrl)}
                    alt={p.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = "none";
                    }}
                  />
                )}
              </div>
            </div>

            {/* ข้อมูลสินค้า */}
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  color: "#f5d742",
                  fontWeight: 700,
                  fontSize: 24,
                  marginBottom: 8,
                  fontFamily: "serif",
                }}
              >
                {p.name}
              </div>

              {!!p.category && (
                <span
                  style={{
                    fontSize: 12,
                    background: "rgba(245, 215, 66, 0.2)",
                    color: "#f5d742",
                    padding: "4px 12px",
                    borderRadius: 50,
                    border: "1px solid rgba(245, 215, 66, 0.3)",
                  }}
                >
                  {p.category}
                </span>
              )}

              {!!p.description && (
                <div
                  style={{
                    color: "#d0d0d0",
                    marginTop: 16,
                    minHeight: 60,
                    fontSize: 14,
                    lineHeight: 1.5,
                  }}
                >
                  {p.description.length > 140
                    ? p.description.slice(0, 140) + "…"
                    : p.description}
                </div>
              )}

              <div
                style={{
                  fontWeight: 800,
                  fontSize: 28,
                  marginTop: 16,
                  color: "#f5d742",
                  fontFamily: "serif",
                }}
              >
                ฿{money.format(p.price)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* แถบสรุปด้านล่าง */}
      <div
        style={{
          position: "sticky",
          bottom: 0,
          marginTop: 40,
          background: "linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)",
          color: "#f5d742",
          padding: "16px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: "2px solid #f5d742",
          boxShadow: "0 -8px 32px rgba(0,0,0,0.6)",
        }}
      >
        <div style={{ fontSize: 18, fontWeight: 600 }}>🛒 {cartCount} รายการพรีเมี่ยม</div>
        <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "serif" }}>
          รวม: ฿{money.format(total)}
        </div>
        <button
          onClick={() => alert("กำลังดำเนินการชำระเงิน...")}
          style={{
            padding: "12px 24px",
            borderRadius: 25,
            border: "none",
            background: "linear-gradient(45deg, #f5d742, #d4b942)",
            color: "#1a1a1a",
            fontSize: 16,
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 4px 16px rgba(245, 215, 66, 0.4)",
          }}
        >
          ชำระเงิน
        </button>
      </div>

      {!!error && (
        <div
          style={{
            position: "fixed",
            right: 24,
            bottom: 100,
            background: "linear-gradient(45deg, #dc2626, #b91c1c)",
            border: "2px solid #fca5a5",
            color: "#fff",
            padding: 16,
            borderRadius: 12,
            boxShadow: "0 8px 32px rgba(220, 38, 38, 0.4)",
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}
