import { Controller, Get, Req } from "@nestjs/common";
import { HeaderRequest, profileIdFromRequest } from "../common/request-context";
import { DiscoveryService } from "./discovery.service";

@Controller("discovery")
export class DiscoveryController {
  constructor(private readonly discovery: DiscoveryService) {}

  @Get("daily")
  daily(@Req() request: HeaderRequest) {
    return this.discovery.daily(profileIdFromRequest(request));
  }
}
