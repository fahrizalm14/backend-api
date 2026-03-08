import { Role } from '@prisma/client';
import { injectable } from 'tsyringe';

import { IAuthRepository, AuthUser } from '@/modules/auth/auth.interface';
import { mapDbRoleToAppRole } from '@/shared/auth/roles';
import { prisma } from '@/shared/database/prisma';

@injectable()
export class AuthRepository implements IAuthRepository {
  async createWithPassword(input: {
    email: string;
    passwordHash: string;
    name?: string;
  }): Promise<AuthUser> {
    const created = await prisma.user.create({
      data: {
        email: input.email,
        passwordHash: input.passwordHash,
        name: input.name,
        role: Role.MEMBER,
      },
    });

    return this.mapUser(created);
  }

  async findCredentialByEmail(email: string): Promise<{
    user: AuthUser;
    passwordHash: string | null;
  } | null> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return null;
    }

    return {
      user: this.mapUser(user),
      passwordHash: user.passwordHash,
    };
  }

  async findOrCreateFromGoogle(input: {
    googleSub: string;
    email: string;
    name?: string;
    avatarUrl?: string;
  }): Promise<AuthUser> {
    const existingAccount = await prisma.googleAccount.findUnique({
      where: { googleSub: input.googleSub },
      include: { user: true },
    });

    if (existingAccount?.user) {
      const updatedUser = await prisma.user.update({
        where: { id: existingAccount.user.id },
        data: {
          email: input.email,
          name: input.name ?? existingAccount.user.name,
          avatarUrl: input.avatarUrl ?? existingAccount.user.avatarUrl,
        },
      });
      return this.mapUser(updatedUser);
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      await prisma.googleAccount.create({
        data: {
          userId: existingUser.id,
          googleSub: input.googleSub,
          email: input.email,
        },
      });

      const updated = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          email: input.email,
          name: input.name ?? existingUser.name,
          avatarUrl: input.avatarUrl ?? existingUser.avatarUrl,
        },
      });

      return this.mapUser(updated);
    }

    const created = await prisma.user.create({
      data: {
        email: input.email,
        name: input.name,
        avatarUrl: input.avatarUrl,
        role: Role.MEMBER,
        googleAccounts: {
          create: {
            googleSub: input.googleSub,
            email: input.email,
          },
        },
      },
    });

    return this.mapUser(created);
  }

  async findById(userId: string): Promise<AuthUser | null> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    return user ? this.mapUser(user) : null;
  }

  private mapUser(user: {
    id: string;
    email: string;
    name: string | null;
    avatarUrl: string | null;
    role: Role;
  }): AuthUser {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      role: mapDbRoleToAppRole(user.role),
    };
  }
}
