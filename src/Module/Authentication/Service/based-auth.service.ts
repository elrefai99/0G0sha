import { createPublicKey } from "node:crypto"
import { V4 } from "paseto"
import { AppError } from "../../../Shared/errors/app-error"
import { UserModel } from "../../User/Schema/user.schema"
import { token_PASETO } from "../utils/paseto.utils"
import { RegisterDTO } from "../DTO/index.dto"
import prisma from "../../../config/prisma"

export class BasedAuthService {
     constructor() { }

     public async check_account(payload: string) {
          const user = await prisma.user.findFirst({
               where: {
                    email: payload.toLowerCase(),
               },
               select: {
                    id: true,
                    password: true
               }
          })

          return user
     }

     public async create_account(payload: RegisterDTO) {
          const { name, email, password } = payload
          const user = await prisma.user.create({
               data: {
                    fullname: name,
                    email: email.toLowerCase(),
                    password: password,
               },
               select: {
                    id: true
               }
          })

          const access_token = await this.create_token({ _id: user.id.toString(), type: 'access' })
          const refresh_token = await this.create_token({ _id: user.id.toString(), type: 'refresh' })

          return { success: true, access_token, refresh_token }
     }

     public async forget_password(payload: string) {
          const cUser = await UserModel.findOne({ email: payload.toLowerCase() }, { _id: 1 });

          if (!cUser) {
               throw AppError.badRequest("email is not founded, try agin");
          }

          const token: any = this.create_token({ _id: cUser._id.toString(), type: 'forget_password' })

          return { success: true, token };
     }

     public async reset_password(payload: { token: string; password: string }) {
          const { token, password } = payload
          const publicKey = createPublicKey(process.env.PUBLIC_REFRESH_TOKEN_SECRET as string)
          await V4.verify(token, publicKey).then(async (payload: any) => {
               const user = await UserModel.findOne({ _id: payload.data.user_id }, { _id: 1 })
               if (!user) {
                    throw AppError.badRequest("User not found")
               }
               await user.updateOne({ password })
               return { success: true }
          }).catch((err) => {
               throw AppError.badRequest(`Invalid refresh token: ${err}`)
          })
     }

     public async create_token(payload: { _id: string; type: 'access' | 'refresh' | 'forget_password'; access_device?: string }): Promise<string> {
          const tokenPayload = {
               data: { user_id: payload._id },
               access_device: payload.access_device ?? 'unknown',
          }

          switch (payload.type) {
               case 'access':
                    return token_PASETO(tokenPayload, 'access')

               case 'refresh':
                    return token_PASETO(tokenPayload, 'refresh')

               case 'forget_password':
                    return token_PASETO(tokenPayload, 'forget_password')
          }
     }
}
