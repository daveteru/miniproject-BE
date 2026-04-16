import { hash } from "argon2";
import { Prisma, PrismaClient, User } from "../../generated/prisma/client.js";
import { ApiError } from "../../utils/api-error.js";
import { CloudinaryService } from "../cloudinary/cloudinary.service.js";

export class UserService {
  constructor(
    private prisma: PrismaClient,
    private cloudinaryService: CloudinaryService,
  ) {}

  getUser = async (id: number) => {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new ApiError("User not found", 404);
    }

    return user;
  };

  updateUser = async (
    userId: number,
    { fullName, birthdate }: User,
    newAvatar: Express.Multer.File,
  ) => {
    const user = this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new ApiError("User not found", 404);
    }


    const { secure_url } = newAvatar
      ? await this.cloudinaryService.upload(newAvatar)
      : undefined;

    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        fullName,
        birthdate,
        avatar: secure_url,
      },
    });

    return { message: "User update successful" };
  };
}
