import { Body, Controller, Get, Param, Post, Req } from "@nestjs/common";
import { SendMessageRequestDto } from "@asia-love/shared";
import { HeaderRequest, profileIdFromRequest } from "../common/request-context";
import { ConversationService } from "./conversation.service";

@Controller("conversations")
export class ConversationController {
  constructor(private readonly conversations: ConversationService) {}

  @Get()
  list(@Req() request: HeaderRequest) {
    return this.conversations.list(profileIdFromRequest(request));
  }

  @Get(":conversationId/messages")
  messages(@Req() request: HeaderRequest, @Param("conversationId") conversationId: string) {
    return this.conversations.messages(profileIdFromRequest(request), conversationId);
  }

  @Post(":conversationId/messages")
  send(
    @Req() request: HeaderRequest,
    @Param("conversationId") conversationId: string,
    @Body() input: SendMessageRequestDto
  ) {
    return this.conversations.sendMessage(profileIdFromRequest(request), conversationId, input);
  }
}
