import { Module } from "@nestjs/common";
import { DataModule } from "../data/data.module";
import { MatchingController } from "./matching.controller";
import { MatchingService } from "./matching.service";

@Module({
  imports: [DataModule],
  controllers: [MatchingController],
  providers: [MatchingService],
  exports: [MatchingService]
})
export class MatchingModule {}
