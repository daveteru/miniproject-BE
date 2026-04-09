import { PrismaClient, User } from "../../generated/prisma/client.js";
import { ApiError } from "../../utils/api-error.js";
import { hash, verify } from "argon2";
import jwt from "jsonwebtoken";

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
        email: body.email,
        password: hashedPassword,
        birthdate: body.birthdate,
        fullName: body.fullName
      },
    });

    return { message: "User registration successful" };
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
      expiresIn: "2h",
    });

    const { password, ...userWithoutPassword } = user;

    return { userWithoutPassword, accessToken };
  };
}
