import { neonAuth } from "@/lib/auth/server";

const { GET, POST, PUT, DELETE, PATCH } = neonAuth.handler();
export { GET, POST, PUT, DELETE, PATCH };
