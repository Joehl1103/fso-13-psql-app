import type { JwtPayload } from "jsonwebtoken";

interface JwtUserPayload extends JwtPayload {
  username: string;
  id: number;
}

export type { JwtUserPayload }
