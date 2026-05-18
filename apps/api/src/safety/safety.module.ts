import { Module } from "@nestjs/common";
import { DataModule } from "../data/data.module";
import { SafetyController } from "./safety.controller";
import { SafetyService } from "./safety.service";

@Module({
  imports: [DataModule],
  controllers: [SafetyController],
  providers: [SafetyService]
})
export class SafetyModule {}
