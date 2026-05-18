import { Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthResponseDto, LoginRequestDto, RegisterRequestDto } from "@asia-love/shared";
import { InMemoryStore } from "../data/in-memory-store";

@Injectable()
export class AuthService {
  constructor(private readonly store: InMemoryStore) {}

  register(input: RegisterRequestDto): AuthResponseDto {
    const user = this.store.createUser(input.email, input.displayName, input.password, input.locale);
    return {
      token: `mock-token:${user.id}`,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName
      }
    };
  }

  login(input: LoginRequestDto): AuthResponseDto {
    const user = this.store.findUserByEmail(input.email);
    if (!user || user.passwordHash !== `mock:${input.password}`) {
      throw new UnauthorizedException("Invalid mock credentials");
    }
    return {
      token: `mock-token:${user.id}`,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName
      }
    };
  }
}
