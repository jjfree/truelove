import { Module } from "@nestjs/common";
import { DataModule } from "../data/data.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

@Module({
  imports: [DataModule],
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule {}
