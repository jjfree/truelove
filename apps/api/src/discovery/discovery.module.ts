import { Module } from "@nestjs/common";
import { DataModule } from "../data/data.module";
import { DiscoveryController } from "./discovery.controller";
import { DiscoveryService } from "./discovery.service";

@Module({
  imports: [DataModule],
  controllers: [DiscoveryController],
  providers: [DiscoveryService]
})
export class DiscoveryModule {}
