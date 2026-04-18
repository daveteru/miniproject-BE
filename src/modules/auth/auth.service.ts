import { hash, verify } from "argon2";
import axios from "axios";
import jwt from "jsonwebtoken";
import { PrismaClient, Provider, User } from "../../generated/prisma/client.js";
import { randomString } from "../../helpers/random-string.js";
import { ApiError } from "../../utils/api-error.js";
import { MailService } from "../mail/mail.service.js";
import {
  COUPON_EXPIRE_DATE,
  COUPON_ON_REGISTRATION,
  EXPIRED_ACCESS_TOKEN_JWT,
  EXPIRED_REFRESH_TOKEN_JWT,
  EXPIRED_RESET_TOKEN_JWT,
  POINTS_EXPIRE_DATE,
  POINTS_ON_REGISTRATION,
  REFRESH_TOKEN_EXPIRES_IN,
} from "./constants.js";
import { ChangePasswordDTO } from "./dto/change-password.dto.js";

type googleapi = {
  sub: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  email: string;
  email_verified: boolean;
};
export class AuthService {
  constructor(
    private prisma: PrismaClient,
    private mailService: MailService,
  ) {}

  register = async (body: User) => {
    await this.prisma.$transaction(async (tx) => {
      const emailExists = await tx.user.findUnique({
        where: {
          email: body.email,
        },
      });

      if (emailExists) {
        throw new ApiError("Email already exists", 400);
      }

      const hashedPassword = await hash(body.password);
      const referralCode = randomString(16);

      const user = await tx.user.create({
        data: {
          fullName: body.fullName,
          email: body.email,
          password: hashedPassword,
          birthdate: new Date(body.birthdate),
          referral: referralCode,
        },
      });

      if (body.referral) {
        const referrer = await tx.user.findUnique({
          where: {
            referral: body.referral,
          },
        });

        if (!referrer) {
          throw new ApiError("Invalid referral ID", 400);
        }

        await tx.point.create({
          data: {
            amount: POINTS_ON_REGISTRATION,
            userId: referrer.id,
            expiredDate: new Date(POINTS_EXPIRE_DATE),
          },
        });
        await tx.coupon.create({
          data: {
            amount: COUPON_ON_REGISTRATION,
            userId: user.id,
            expiredDate: new Date(COUPON_EXPIRE_DATE),
          },
        });
      }
    });

    await this.mailService.sendMail({
      to: body.email,
      subject: "Welcome to the FRNTROW",
      templateName: "welcome",
      context: { name: body.fullName },
    });

    return { message: "User registration success" };
  };

  login = async (body: User) => {
    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
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

      await tx.refreshToken.upsert({
        where: { userId: user.id },
        update: {
          token: refreshToken,
          expiredAt: new Date(REFRESH_TOKEN_EXPIRES_IN),
        },
        create: {
          token: refreshToken,
          expiredAt: new Date(REFRESH_TOKEN_EXPIRES_IN),
          userId: user.id,
        },
      });

      const { password, ...userWithoutPassword } = user;

      return { userWithoutPassword, accessToken, refreshToken };
    });

    const { userWithoutPassword, accessToken, refreshToken } = result;
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

  forgotPassword = async ({ email }: User) => {
    const user = await this.prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) {
      return { message: "Email sent successfully" };
    }

    const payload = {
      id: user.id,
      role: user.role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET_RESET!, {
      expiresIn: EXPIRED_RESET_TOKEN_JWT,
    });

    await this.mailService.sendMail({
      to: email,
      subject: "FRNTROW* - Reset Password",
      templateName: "forgot-password",
      context: { link: `${process.env.BASE_URL_FE}/reset-password/${token}` },
    });

    return { message: "Email sent successfully" };
  };

  resetPassword = async ({ password }: User, userId: number) => {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) throw new ApiError("User not found", 404);

    const hashedPassword = await hash(password);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
      },
    });

    return { message: "Password reset successfully" };
  };

  changePassword = async (
    userId: number,
    { password, newPassword }: ChangePasswordDTO,
  ) => {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) throw new ApiError("User not found", 404);

    const isPassMatch = await verify(user.password, password);

    if (!isPassMatch) {
      throw new ApiError("Invalid credentials", 400);
    }

    const hashedPassword = await hash(newPassword);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
      },
    });

    return { message: "Password changed successfully" };
  };

  authgoogle = async (body: any) => {
    const response = await axios.get<googleapi>(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: {
          Authorization: `Bearer ${body.accessToken}`,
        },
      },
    );

    let user = await this.prisma.user.findUnique({
      where: { email: response.data.email },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          fullName: response.data.name,
          email: response.data.email,
          avatar: response.data.picture,
          password: "",
          birthdate: new Date(),
          referral: randomString(16),
          provider: Provider.GOOGLE,
        },
      });
    }

    if (user?.provider !== Provider.GOOGLE) {
      throw new ApiError("Account already registered without google", 400);
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
        expiredAt: new Date(REFRESH_TOKEN_EXPIRES_IN),
      },
      create: {
        token: refreshToken,
        expiredAt: new Date(REFRESH_TOKEN_EXPIRES_IN),
        userId: user.id,
      },
    });

    const { password, ...userWithoutPassword } = user;

    return { userWithoutPassword, accessToken, refreshToken };
  };
}
