import { Body, Controller, Post } from "@nestjs/common";
import { LoginRequestDto, RegisterRequestDto } from "@asia-love/shared";
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post("register")
  register(@Body() input: RegisterRequestDto) {
    return this.auth.register(input);
  }

  @Post("login")
  login(@Body() input: LoginRequestDto) {
    return this.auth.login(input);
  }
}
