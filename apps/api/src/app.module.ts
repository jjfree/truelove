import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { ConversationModule } from "./conversation/conversation.module";
import { DataModule } from "./data/data.module";
import { DiscoveryModule } from "./discovery/discovery.module";
import { MatchingModule } from "./matching/matching.module";
import { ProfileModule } from "./profile/profile.module";
import { SafetyModule } from "./safety/safety.module";

@Module({
  imports: [
    DataModule,
    AuthModule,
    ProfileModule,
    DiscoveryModule,
    MatchingModule,
    ConversationModule,
    SafetyModule
  ]
})
export class AppModule {}
