import { PrismaClient } from "../../generated/prisma/client.js";
import { ApiError } from "../../utils/api-error.js";

export class UserService {
  constructor(private prisma: PrismaClient) {}

  getUser = async (id: number) => {
    const sample = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!sample) {
      throw new ApiError("sample not found", 404);
    }

    return sample;
  };
}
