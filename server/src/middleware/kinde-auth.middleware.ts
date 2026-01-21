import { jwtVerify } from "@kinde-oss/kinde-node-express";
import { NextFunction, Request, Response } from "express";
import { config } from "../config";

if (!config.kinde.issuerBaseUrl) {
  throw new Error("KINDE_ISSUER_BASE_URL or KINDE_DOMAIN must be set");
}

// if (!config.kinde.audience) {
//   throw new Error("KINDE_AUDIENCE must be set");
// }

const verifier = jwtVerify(config.kinde.issuerBaseUrl, {
  audience: config.kinde.audience ?? "",
});

export const kindeJwtVerifier = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.header("Authorization");
  if (!authHeader) {
    return res.status(401).json({ message: "Authorization token required" });
  }

  return verifier(req, res, next);
};
