import { Prisma, PrismaClient } from "../../generated/prisma/client.js";
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
    body: Prisma.UserUpdateInput,
    newAvatar: Express.Multer.File,
  ) => {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new ApiError("User not found", 404);
    }

    let secure_url: string | undefined = undefined;

    if (newAvatar) {
      const result = await this.cloudinaryService.upload(newAvatar);
      secure_url = result.secure_url;
    }

    const birthdate: Date | undefined = body?.birthdate
      ? new Date(body.birthdate as string | Date)
      : undefined;

    const updatedUser = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        fullName: body?.fullName,
        birthdate,
        avatar: secure_url,
      },
    });

    const { password, ...userWithoutPassword } = updatedUser;

    return { message: "User update successful", user: userWithoutPassword };
  };
}
