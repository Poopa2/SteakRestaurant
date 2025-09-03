// เก็บสถานะล็อกอินแบบง่ายใน localStorage (เดโม)
export type AuthUser = { username: string };

const KEY = "krugpt_admin_user";
const USERS_KEY = "krugpt_admin_users";

export function getUser(): AuthUser | null {
  const raw = localStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : null;
}

export function logout() {
  localStorage.removeItem(KEY);
}

export async function login(username: string, password: string) {
  const users = JSON.parse(localStorage.getItem(USERS_KEY) || "[]") as {
    username: string; password: string;
  }[];
  const ok = users.some(u => u.username === username && u.password === password);
  if (!ok) throw new Error("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
  localStorage.setItem(KEY, JSON.stringify({ username }));
  return { username };
}

export async function register(username: string, password: string) {
  const users = JSON.parse(localStorage.getItem(USERS_KEY) || "[]") as {
    username: string; password: string;
  }[];
  if (users.some(u => u.username === username)) {
    throw new Error("มีชื่อผู้ใช้นี้แล้ว");
  }
  users.push({ username, password });
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  return true;
}
