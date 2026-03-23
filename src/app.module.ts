import { Application } from "express";
import auth_module from "./Module/Authentication/auth.module";

export default (app: Application) => {
     app.use('/api/v1/auth', auth_module)
}
