import { config } from "@server/config";
import { auth } from "express-oauth2-jwt-bearer";

const authenticateUser = auth({
  issuerBaseURL: `https://${config.auth0.domain}/`,
  audience: config.auth0.audience,
  tokenSigningAlg: "RS256",
});

export default authenticateUser;
