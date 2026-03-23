import { AppError, UserModel } from "@/the-import";

export class BasedAuthService {
     private access_public_key: string;
     private access_private_key: string;
     private refresh_public_key: string;
     private refresh_private_key: string;

     constructor() {
          this.access_public_key = process.env.ACCESS_PUBLIC_KEY as string
          this.access_private_key = process.env.ACCESS_PRIVATE_KEY as string
          this.refresh_public_key = process.env.REFRESH_PUBLIC_KEY as string
          this.refresh_private_key = process.env.REFRESH_PRIVATE_KEY as string
     }

     public async check_account(payload: string) {
          const user = await UserModel.findOne({ email: payload.toLowerCase() }, { _id: 1 })

          return user
     }

     public async create_account(payload: string) {

     }

     private async create_token() {

     }
}
