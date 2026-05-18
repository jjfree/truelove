import { Body, Controller, Post, Req } from "@nestjs/common";
import { BlockRequestDto, ReportRequestDto, SafetySignalDto } from "@asia-love/shared";
import { HeaderRequest, profileIdFromRequest } from "../common/request-context";
import { SafetyService } from "./safety.service";

@Controller("safety")
export class SafetyController {
  constructor(private readonly safety: SafetyService) {}

  @Post("reports")
  report(@Req() request: HeaderRequest, @Body() input: ReportRequestDto) {
    return this.safety.report(profileIdFromRequest(request), input);
  }

  @Post("blocks")
  block(@Req() request: HeaderRequest, @Body() input: BlockRequestDto) {
    return this.safety.block(profileIdFromRequest(request), input);
  }

  @Post("signals")
  signal(@Body() input: Omit<SafetySignalDto, "id" | "createdAt">) {
    return this.safety.createSignal(input);
  }
}
