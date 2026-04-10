import { PrismaClient, User } from "../../generated/prisma/client.js";
import { ApiError } from "../../utils/api-error.js";
import { hash, verify } from "argon2";
import jwt from "jsonwebtoken";
import { EXPIRED_ACCESS_TOKEN_JWT, EXPIRED_REFRESH_TOKEN_JWT, SEVEN_DAYS } from "./constants.js";

export class AuthService {
  constructor(private prisma: PrismaClient) {}

  register = async (body: User) => {
    const user = await this.prisma.user.findUnique({
      where: {
        email: body.email,
      },
    });

    if (user) {
      throw new ApiError("Email already exists", 400);
    }

    const hashedPassword = await hash(body.password);

    await this.prisma.user.create({
      data: {
        fullName: body.fullName,
        email: body.email,
        password: hashedPassword,
        birthdate: body.birthdate
      },
    });

    return { message: "User registration success" };
  };

  login = async (body: User) => {
    const user = await this.prisma.user.findUnique({
      where: { email: body.email },
    });
    if (!user) {
      throw new ApiError("Invalid credentials", 400);
    }

    const isPassMatch = await verify(user.password, body.password);

    if (!isPassMatch) {
      throw new ApiError("Invalid credentials", 400);
    }

    const payload = {
      id: user.id,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: EXPIRED_ACCESS_TOKEN_JWT,
    });

    const refreshToken = jwt.sign(payload, process.env.JWT_SECRET_REFRESH!, {
      expiresIn: EXPIRED_REFRESH_TOKEN_JWT,
    });

    await this.prisma.refreshToken.upsert({
      where: { userId: user.id },
      update: {
        token: refreshToken,
        expiredAt: new Date(SEVEN_DAYS),
      },
      create: {
        token: refreshToken,
        expiredAt: new Date(SEVEN_DAYS),
        userId: user.id,
      },
    });

    const { password, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, accessToken, refreshToken };
  };

  logout = async (refreshToken?: string) => {
    if (!refreshToken) return;

    await this.prisma.refreshToken.delete({
      where: { token: refreshToken },
    });

    return { message: "Logout successful" };
  };

  refresh = async (refreshToken?: string) => {
    if (!refreshToken) throw new ApiError("No refresh token", 400);

    const stored = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!stored) throw new ApiError("Refresh token not found", 400);

    const isExpired = stored.expiredAt < new Date();

    if (isExpired) throw new ApiError("Refresh token expired", 400);

    const payload = {
      id: stored.user.id,
      role: stored.user.role,
    };

    const newAccessToken = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: EXPIRED_ACCESS_TOKEN_JWT,
    });

    return { accessToken: newAccessToken };
  };
}
