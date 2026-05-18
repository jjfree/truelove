import { Body, Controller, Post, Req } from "@nestjs/common";
import { LikeDecision, LikeRequestDto } from "@asia-love/shared";
import { HeaderRequest, profileIdFromRequest } from "../common/request-context";
import { MatchingService } from "./matching.service";

@Controller("matching")
export class MatchingController {
  constructor(private readonly matching: MatchingService) {}

  @Post("like")
  like(@Req() request: HeaderRequest, @Body() input: Omit<LikeRequestDto, "decision">) {
    return this.matching.decide(profileIdFromRequest(request), {
      ...input,
      decision: LikeDecision.Like
    });
  }

  @Post("pass")
  pass(@Req() request: HeaderRequest, @Body() input: Omit<LikeRequestDto, "decision">) {
    return this.matching.decide(profileIdFromRequest(request), {
      ...input,
      decision: LikeDecision.Pass
    });
  }
}
