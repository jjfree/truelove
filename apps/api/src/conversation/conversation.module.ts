import { Module } from "@nestjs/common";
import { DataModule } from "../data/data.module";
import { ConversationController } from "./conversation.controller";
import { ConversationService } from "./conversation.service";

@Module({
  imports: [DataModule],
  controllers: [ConversationController],
  providers: [ConversationService]
})
export class ConversationModule {}
