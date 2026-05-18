import { Body, Controller, Get, Param, Put, Req } from "@nestjs/common";
import { UpsertProfileRequestDto } from "@asia-love/shared";
import { HeaderRequest, userIdFromRequest } from "../common/request-context";
import { ProfileService } from "./profile.service";

@Controller("profiles")
export class ProfileController {
  constructor(private readonly profiles: ProfileService) {}

  @Get("me")
  me(@Req() request: HeaderRequest) {
    return this.profiles.me(userIdFromRequest(request));
  }

  @Put("me")
  upsert(@Req() request: HeaderRequest, @Body() input: UpsertProfileRequestDto) {
    return this.profiles.upsert(userIdFromRequest(request), input);
  }

  @Get(":profileId")
  get(@Param("profileId") profileId: string) {
    return this.profiles.get(profileId);
  }
}
