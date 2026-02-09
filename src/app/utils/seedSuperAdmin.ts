import { envVars } from "../config/env";
import { IAuthProvider, IUser, Role } from "../modules/user/user.interface";
import { User } from "../modules/user/user.model";
import bcrypt from "bcryptjs";

export const seedSuperAdmin = async () => {
    try {
        const isSuperAdminExist = await User.findOne({ email: envVars.SUPER_ADMIN_EMAIL });

        if (isSuperAdminExist){
            console.log("Super Admin already exists");
            return;
        }
        const hashedPassword = await bcrypt.hash(envVars.SUPER_ADMIN_PASSWORD as string, Number(envVars.BCRYPT_SALT_ROUND));

        const authProvider: IAuthProvider = {
            providerName: "credentials",
            providerId: envVars.SUPER_ADMIN_EMAIL as string,
          };

        const superAdminPayload: IUser = {
            name: { firstName: "Super", lastName: "Admin" },
            email: envVars.SUPER_ADMIN_EMAIL as string,
            password: hashedPassword,
            role: Role.SUPER_ADMIN,
            isVerified: true,
            auths: [authProvider],
        }

        await User.create(superAdminPayload);
        console.log("Super Admin seeded successfully");

    } catch (error) {
        console.log(error);
    }
}