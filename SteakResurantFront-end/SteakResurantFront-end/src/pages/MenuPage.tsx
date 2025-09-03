// src/pages/MenuPage.tsx
import { useEffect, useState } from 'react';
import { api, ensureSessionToken, type Product, type OrderItem } from '../lib/api';

export default function MenuPage() {
  const [orderId, setOrderId] = useState<number>();
  const [products, setProducts] = useState<Product[]>([]);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { orderId } = await ensureSessionToken();
        setOrderId(orderId);
        const [ps, its] = await Promise.all([
          api.products(),
          api.orderItemsByOrder(orderId),
        ]);
        setProducts(ps);
        setItems(its);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const add = async (p: Product, ev?: React.MouseEvent<HTMLButtonElement>) => {
    if (!orderId) return;
    const btn = ev?.currentTarget;
    const old = btn?.innerText;
    if (btn) { btn.disabled = true; btn.innerText = '...'; }
    try {
      await api.addItem({ orderId, productId: p.id, quantity: 1, price: p.price });
      setItems(await api.orderItemsByOrder(orderId));
      if (btn) btn.innerText = '✓';
      setTimeout(() => { if (btn) { btn.innerText = old || 'เพิ่ม'; btn.disabled = false; } }, 700);
    } catch (e: any) {
      alert(e?.message || 'เพิ่มสินค้าไม่สำเร็จ');
      if (btn) { btn.innerText = old || 'เพิ่ม'; btn.disabled = false; }
    }
  };

  const total = items.reduce((s, x) => s + x.price * x.quantity, 0);

  if (loading) return <div style={{ padding: 24 }}>กำลังโหลด...</div>;

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: 24, maxWidth: 900, margin: 'auto' }}>
      <h2>เมนูอาหาร</h2>
      <div style={{ color: '#666', marginBottom: 16 }}>หมายเลขออเดอร์ #{orderId}</div>

      <div>
        {products.map(p => (
          <div key={p.id} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #eee' }}>
            {/* รูปสินค้า: ผ่าน proxy /images แล้ว ไม่ต้องพรีฟิกซ์โดเมน */}
            {p.imageUrl && <img src={p.imageUrl} style={{ width: 64, height: 64, objectFit: 'cover' }}
              onError={(e) => ((e.target as HTMLImageElement).style.display='none')} />}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{p.name}</div>
              <div style={{ color: '#666' }}>{p.category || ''}</div>
              <div>฿{p.price}</div>
            </div>
            <button onClick={(ev) => add(p, ev)}>เพิ่ม</button>
          </div>
        ))}
      </div>

      <h3 style={{ marginTop: 28 }}>ตะกร้าของฉัน</h3>
      {items.length === 0 ? (
        <div>ยังไม่มีรายการ</div>
      ) : (
        <div>
          {items.map(x => (
            <div key={x.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
              <div>{x.product?.name ?? 'สินค้า'} × {x.quantity}</div>
              <div>฿{(x.price * x.quantity).toFixed(2)}</div>
            </div>
          ))}
          <hr />
          <div style={{ textAlign: 'right', fontWeight: 700 }}>รวม: ฿{total.toFixed(2)}</div>
        </div>
      )}
    </div>
  );
}
