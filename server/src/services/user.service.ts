import { eq } from "drizzle-orm";
import { users } from "server/shared/schema";
import { User } from "../interfaces/models";
import { IUserData, IUserService } from "../interfaces/services";
import { UpdateUserDTO } from "../interfaces/dto";
import { db } from "../db";

export class UserService implements IUserService {
  async getUsers(): Promise<User[]> {
    const results = await db.query.users.findMany();
    return results as User[];
  }

  async getUser(id: string): Promise<User | null> {
    const result = await db.query.users.findFirst({
      where: eq(users.id, id),
    });
    return result as User | null;
  }

  async createUser(userData: IUserData): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        profileImageUrl: userData.profileImageUrl,
        role: userData.role,
      })
      .returning();
    return user as User;
  }

  async updateUser(id: string, userData: UpdateUserDTO): Promise<User> {
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
    const result = await db.query.users.findFirst({
      where: eq(users.email, email),
    });
    return result as User | null;
  }
}
