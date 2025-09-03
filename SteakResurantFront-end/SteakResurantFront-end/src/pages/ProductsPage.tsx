import { useEffect, useMemo, useState } from "react";

type Product = {
  id: number;
  name: string;
  description?: string | null;
  specialTag?: string | null;
  category?: string | null;
  price: number;
  imageUrl?: string | null;
  isAvailable?: boolean;
};

type CreateForm = {
  name: string;
  description: string;
  specialTag: string;
  category: string;
  price: string; // เก็บเป็น string เพื่อผูกกับ input
  file: File | null;
};

type EditForm = {
  id: number;
  name: string;
  description: string;
  specialTag: string;
  category: string;
  price: string;
};

async function api<T = any>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init);
  if (!res.ok) throw new Error(await res.text());
  return (await res.json()) as T;
}

export default function ProductsPage() {
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<EditForm | null>(null);
  const [createForm, setCreateForm] = useState<CreateForm>({
    name: "",
    description: "",
    specialTag: "",
    category: "",
    price: "",
    file: null,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await api<Product[]>("/api/products");
      setList(data);
    } catch (e: any) {
      setError(e?.message || "โหลดสินค้าไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.category ?? "").toLowerCase().includes(q) ||
        (p.specialTag ?? "").toLowerCase().includes(q)
    );
  }, [list, search]);

  // สร้างสินค้า (มีอัปโหลดรูป)
  async function createProduct() {
    if (!createForm.name || !createForm.price) {
      alert("กรอกชื่อและราคาให้ครบ");
      return;
    }
    if (!createForm.file) {
      alert("กรุณาเลือกรูปภาพ");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const fd = new FormData();
      // ใช้ชื่อฟิลด์ให้ตรง DTO: Name, Description, SpecialTag, Category, Price, File
      fd.append("Name", createForm.name);
      fd.append("Description", createForm.description);
      fd.append("SpecialTag", createForm.specialTag);
      fd.append("Category", createForm.category);
      fd.append("Price", createForm.price);
      fd.append("File", createForm.file);

      await api("/api/products", {
        method: "POST",
        body: fd,
      });
      setCreating(false);
      setCreateForm({
        name: "",
        description: "",
        specialTag: "",
        category: "",
        price: "",
        file: null,
      });
      await load();
    } catch (e: any) {
      setError(e?.message || "สร้างสินค้าไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  }

  // แก้ไขสินค้า (แก้ข้อความ/ราคา — API เดิมไม่รองรับเปลี่ยนรูป)
  async function saveEdit() {
    if (!editing) return;
    setBusy(true);
    setError(null);
    try {
      const body = {
        id: editing.id,
        name: editing.name,
        description: editing.description,
        category: editing.category,
        price: Number(editing.price),
        specialTag: editing.specialTag,
      };
      await api(`/api/products/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      setEditing(null);
      await load();
    } catch (e: any) {
      setError(e?.message || "บันทึกการแก้ไขไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  }

  async function removeProduct(id: number) {
    if (!confirm("ยืนยันลบสินค้านี้?")) return;
    setBusy(true);
    setError(null);
    try {
      await api(`/api/products/${id}`, { method: "DELETE" });
      await load();
    } catch (e: any) {
      setError(e?.message || "ลบสินค้าไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: 24, maxWidth: 1100, margin: "auto" }}>
      <h2 style={{ marginBottom: 8 }}>Products</h2>
      <div style={{ color: "#666", marginBottom: 16 }}>
        จัดการสินค้า (สร้าง/แก้ไข/ลบ) — อัปโหลดรูปในขั้นตอนสร้าง
      </div>

      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
        <input
          placeholder="ค้นหาชื่อ / หมวดหมู่ / แท็กพิเศษ"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, padding: "10px 12px", border: "1px solid #ddd", borderRadius: 8 }}
        />
        <button
          onClick={() => setCreating(true)}
          style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #ddd", background: "#111", color: "#fff" }}
        >
          + สร้างสินค้า
        </button>
      </div>

      {error && (
        <div style={{ background: "#fff4f4", border: "1px solid #ffd3d3", color: "#a40000", padding: 12, borderRadius: 8, marginBottom: 12 }}>
          {error}
        </div>
      )}

      {loading ? (
        <div>กำลังโหลด...</div>
      ) : (
        <div style={{ border: "1px solid #eee", borderRadius: 12, overflow: "hidden" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "80px 1fr 1fr 100px 160px 140px",
              gap: 0,
              background: "#fafafa",
              fontWeight: 600,
              padding: "10px 12px",
            }}
          >
            <div>รูป</div>
            <div>ชื่อ</div>
            <div>หมวดหมู่ / แท็ก</div>
            <div style={{ textAlign: "right" }}>ราคา</div>
            <div>คำอธิบาย</div>
            <div style={{ textAlign: "right" }}>การจัดการ</div>
          </div>

          {filtered.map((p) => (
            <div
              key={p.id}
              style={{
                display: "grid",
                gridTemplateColumns: "80px 1fr 1fr 100px 160px 140px",
                gap: 0,
                padding: "10px 12px",
                borderTop: "1px solid #eee",
                alignItems: "center",
              }}
            >
              <div>
                {p.imageUrl ? (
                  <img
                    src={p.imageUrl}
                    style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 8, background: "#f5f5f5" }}
                    onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
                  />
                ) : (
                  <div style={{ width: 64, height: 64, borderRadius: 8, background: "#f5f5f5" }} />
                )}
              </div>
              <div style={{ fontWeight: 600 }}>{p.name}</div>
              <div>
                <div>{p.category || "-"}</div>
                <div style={{ color: "#666" }}>{p.specialTag || ""}</div>
              </div>
              <div style={{ textAlign: "right" }}>฿{p.price.toFixed(2)}</div>
              <div style={{ color: "#444", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {p.description || "-"}
              </div>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button
                  onClick={() =>
                    setEditing({
                      id: p.id,
                      name: p.name,
                      description: p.description ?? "",
                      specialTag: p.specialTag ?? "",
                      category: p.category ?? "",
                      price: String(p.price),
                    })
                  }
                  style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid #ddd", background: "#fff" }}
                >
                  แก้ไข
                </button>
                <button
                  onClick={() => removeProduct(p.id)}
                  style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid #ddd", background: "#fff" }}
                >
                  ลบ
                </button>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div style={{ padding: 24, color: "#666" }}>ไม่พบสินค้า</div>
          )}
        </div>
      )}

      {/* Modal: Create */}
      {creating && (
        <div style={modalBackdrop}>
          <div style={modalBox}>
            <div style={modalHead}>สร้างสินค้า</div>
            <div style={modalBody}>
              <Labeled label="ชื่อ">
                <input value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} style={input} />
              </Labeled>
              <Labeled label="หมวดหมู่">
                <input value={createForm.category} onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })} style={input} />
              </Labeled>
              <Labeled label="แท็กพิเศษ">
                <input value={createForm.specialTag} onChange={(e) => setCreateForm({ ...createForm, specialTag: e.target.value })} style={input} />
              </Labeled>
              <Labeled label="ราคา">
                <input type="number" min="0" step="0.01" value={createForm.price} onChange={(e) => setCreateForm({ ...createForm, price: e.target.value })} style={input} />
              </Labeled>
              <Labeled label="คำอธิบาย">
                <textarea value={createForm.description} onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })} style={textarea} />
              </Labeled>
              <Labeled label="รูปภาพ">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCreateForm({ ...createForm, file: e.target.files?.[0] ?? null })}
                />
                {createForm.file && (
                  <img
                    style={{ width: 160, height: 160, objectFit: "cover", marginTop: 8, borderRadius: 8, background: "#f5f5f5" }}
                    src={URL.createObjectURL(createForm.file)}
                  />
                )}
              </Labeled>
            </div>
            <div style={modalFoot}>
              <button onClick={() => setCreating(false)} style={btnGhost} disabled={busy}>ยกเลิก</button>
              <button onClick={createProduct} style={btnPrimary} disabled={busy}>{busy ? "กำลังบันทึก..." : "บันทึก"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Edit */}
      {!!editing && (
        <div style={modalBackdrop}>
          <div style={modalBox}>
            <div style={modalHead}>แก้ไขสินค้า</div>
            <div style={modalBody}>
              <Labeled label="ชื่อ">
                <input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} style={input} />
              </Labeled>
              <Labeled label="หมวดหมู่">
                <input value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} style={input} />
              </Labeled>
              <Labeled label="แท็กพิเศษ">
                <input value={editing.specialTag} onChange={(e) => setEditing({ ...editing, specialTag: e.target.value })} style={input} />
              </Labeled>
              <Labeled label="ราคา">
                <input type="number" min="0" step="0.01" value={editing.price} onChange={(e) => setEditing({ ...editing, price: e.target.value })} style={input} />
              </Labeled>
              <Labeled label="คำอธิบาย">
                <textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} style={textarea} />
              </Labeled>
              <div style={{ color: "#777", fontSize: 12, marginTop: 4 }}>
                * เวอร์ชัน API ปัจจุบันยังไม่รองรับการเปลี่ยนรูปตอนแก้ไข
              </div>
            </div>
            <div style={modalFoot}>
              <button onClick={() => setEditing(null)} style={btnGhost} disabled={busy}>ยกเลิก</button>
              <button onClick={saveEdit} style={btnPrimary} disabled={busy}>{busy ? "กำลังบันทึก..." : "บันทึก"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Labeled(props: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 13, color: "#555", marginBottom: 6 }}>{props.label}</div>
      {props.children}
    </div>
  );
}

const input: React.CSSProperties = { width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: 8 };
const textarea: React.CSSProperties = { ...input, minHeight: 80 };

const modalBackdrop: React.CSSProperties = {
  position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "grid", placeItems: "center", padding: 16, zIndex: 50,
};
const modalBox: React.CSSProperties = {
  width: "min(720px, 100%)", background: "#fff", borderRadius: 16, boxShadow: "0 10px 30px rgba(0,0,0,0.15)", overflow: "hidden"
};
const modalHead: React.CSSProperties = { padding: "14px 16px", fontWeight: 700, borderBottom: "1px solid #eee" };
const modalBody: React.CSSProperties = { padding: 16 };
const modalFoot: React.CSSProperties = { padding: 12, borderTop: "1px solid #eee", display: "flex", justifyContent: "flex-end", gap: 8 };

const btnPrimary: React.CSSProperties = { padding: "10px 14px", borderRadius: 10, border: "1px solid #111", background: "#111", color: "#fff" };
const btnGhost: React.CSSProperties = { padding: "10px 14px", borderRadius: 10, border: "1px solid #ddd", background: "#fff" };
