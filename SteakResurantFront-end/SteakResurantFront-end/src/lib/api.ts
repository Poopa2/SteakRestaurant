export type Product = {
  id: number;
  name: string;
  price: number;
  category?: string | null;
  imageUrl?: string | null;

  // เพิ่มสองฟิลด์ที่หน้า UI ใช้งาน
  description?: string | null;
  specialTag?: string | null;

  isAvailable?: boolean | null;
};

export type Order = {
  id: number;
  sessionToken: string;
  status: string;
  totalAmount: number;
};

export type OrderItem = {
  id: number;
  productId: number;
  quantity: number;
  price: number;
  product?: Product;
};

// ไม่มี token ใน URL? => ขอ session ใหม่จากหลังบ้าน แล้วใส่ token ลง URL ให้เลย
export async function ensureSessionToken(): Promise<{
  token: string;
  orderId: number;
}> {
  const urlToken = new URLSearchParams(location.search).get("token");
  if (urlToken) {
    const o = await fetch(
      `/cs67/react/s12/SteakRestaurant/api/sessions/${encodeURIComponent(
        urlToken
      )}`
    ).then((r) => r.json());
    sessionStorage.setItem("orderToken", urlToken);
    return { token: urlToken, orderId: o.id };
  }
  const res = await fetch("/cs67/react/s12/SteakRestaurant/api/sessions", {
    method: "POST",
  });
  const data = await res.json(); // { token, url, orderId }
  sessionStorage.setItem("orderToken", data.token);
  history.replaceState({}, "", `?token=${encodeURIComponent(data.token)}`);
  return { token: data.token, orderId: data.orderId };
}

export const api = {
  products: async (): Promise<Product[]> =>
    fetch("/cs67/react/s12/SteakRestaurant/api/products").then((r) => r.json()),

  orderItemsByOrder: async (orderId: number): Promise<OrderItem[]> =>
    fetch(
      `/cs67/react/s12/SteakRestaurant/api/orderitems/byorder/${orderId}`
    ).then((r) => r.json()),

  addItem: async (payload: {
    orderId: number;
    productId: number;
    quantity: number;
    price: number;
  }) =>
    fetch("/cs67/react/s12/SteakRestaurant/api/orderitems", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then((r) => {
      if (!r.ok) return r.text().then((t) => Promise.reject(t));
      return r.json();
    }),
};
