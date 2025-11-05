import { ManagementClient } from "auth0";
import { config } from "@server/config";

type ManagementClientInstance = ManagementClient;

class Auth0ManagementService {
  private client: ManagementClientInstance;

  constructor() {
    this.client = new ManagementClient({
      domain: config.auth0.domain,
      clientId: config.auth0Management.clientId,
      clientSecret: config.auth0Management.clientSecret,
      audience: `https://${config.auth0.domain}/api/v2/`
    });
  }

  getClient() {
    return this.client;
  }

  async getUserById(userId: string) {
    return this.client.users.get({ id: userId });
  }
}

export const auth0ManagementService = new Auth0ManagementService();
