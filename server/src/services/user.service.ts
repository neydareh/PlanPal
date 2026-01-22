import { eq } from "drizzle-orm";
import { users } from "server/shared/schema";
import { User } from "../interfaces/models";
import {
  IEnrichedUserData,
  IUserData,
  IUserService,
} from "../interfaces/services";
import { getDb } from "../db";

export class UserService implements IUserService {
  async getUsers(): Promise<User[]> {
    const db = getDb();
    const results = await db.query.users.findMany();
    return results as User[];
  }

  async getUser(id: string): Promise<User | null> {
    const db = getDb();
    const result = await db.query.users.findFirst({
      where: eq(users.id, id),
    });
    return result as User | null;
  }

  async getUserByAuthProviderId(authProviderId: string): Promise<User | null> {
    const db = getDb();
    const result = await db.query.users.findFirst({
      where: eq(users.authProviderId, authProviderId),
    });
    return result as User | null;
  }

  async getOrCreateByAuthProviderId(authProviderId: string): Promise<User> {
    const existing = await this.getUserByAuthProviderId(authProviderId);
    if (existing) return existing;

    const db = getDb();
    const [user] = await db
      .insert(users)
      .values({
        authProviderId,
        role: "user",
      })
      .returning();
    return user as User;
  }

  async createUserFromAuth(
    authProviderId: string,
    userData: IEnrichedUserData,
  ): Promise<User> {
    const existing = await this.getUserByAuthProviderId(authProviderId);
    const updateData = this.buildAuthUpdateData(userData);
    const role = userData.role![0].name;

    if (existing) return existing

    if (userData.email) {
      const existingByEmail = await this.getUserByEmail(userData.email);
      if (existingByEmail) {
        return this.updateUser(existingByEmail.id, {
          ...updateData,
          authProviderId,
        });
      }
    }

    return this.createUser({
      authProviderId,
      email: userData.email ?? null,
      firstName: userData.firstName ?? null,
      lastName: userData.lastName ?? null,
      profileImageUrl: userData.profileImageUrl ?? null,
      role: role ?? "user",
    });
  }

  async createUser(userData: IUserData): Promise<User> {
    const db = getDb();
    const [user] = await db
      .insert(users)
      .values({
        authProviderId: userData.authProviderId,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        profileImageUrl: userData.profileImageUrl,
        role: userData.role,
      })
      .returning();
    return user as User;
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    const db = getDb();
    const updateData = {
      ...userData,
      updatedAt: new Date(),
    };

    const [user] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();
    return user as User;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const db = getDb();
    const result = await db.query.users.findFirst({
      where: eq(users.email, email),
    });
    return result as User | null;
  }

  private buildAuthUpdateData(userData: IUserData): Partial<User> {
    const updateData: Partial<User> = {};

    if (userData.authProviderId) {
      updateData.authProviderId = userData.authProviderId;
    }
    if (userData.email !== undefined && userData.email !== null) {
      updateData.email = userData.email;
    }
    if (userData.firstName !== undefined && userData.firstName !== null) {
      updateData.firstName = userData.firstName;
    }
    if (userData.lastName !== undefined && userData.lastName !== null) {
      updateData.lastName = userData.lastName;
    }
    if (
      userData.profileImageUrl !== undefined &&
      userData.profileImageUrl !== null
    ) {
      updateData.profileImageUrl = userData.profileImageUrl;
    }
    if (userData.role) {
      updateData.role = userData.role;
    }

    return updateData;
  }
}
