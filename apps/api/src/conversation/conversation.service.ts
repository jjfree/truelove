import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import {
  ConversationStatus,
  detectRiskyMessage,
  MessageDto,
  SafetySignalDto,
  SendMessageRequestDto
} from "@asia-love/shared";
import { randomUUID } from "crypto";
import { InMemoryStore } from "../data/in-memory-store";

@Injectable()
export class ConversationService {
  constructor(private readonly store: InMemoryStore) {}

  list(profileId: string) {
    return this.store.conversations
      .filter((conversation) => conversation.participantProfileIds.includes(profileId))
      .filter((conversation) => conversation.status === ConversationStatus.Active)
      .filter((conversation) => {
        const [a, b] = conversation.participantProfileIds;
        return !this.store.isBlocked(a, b);
      })
      .map((conversation) => {
        const lastMessage = [...this.store.messages]
          .filter((message) => message.conversationId === conversation.id)
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
        return {
          ...conversation,
          lastMessagePreview: lastMessage?.body
        };
      });
  }

  messages(profileId: string, conversationId: string) {
    this.assertCanUseConversation(profileId, conversationId);
    return this.store.messages
      .filter((message) => message.conversationId === conversationId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  sendMessage(profileId: string, conversationId: string, input: SendMessageRequestDto): MessageDto {
    const conversation = this.assertCanUseConversation(profileId, conversationId);
    const otherProfileId = conversation.participantProfileIds.find((id) => id !== profileId);
    if (!otherProfileId) {
      throw new BadRequestException("Conversation participant not found");
    }

    const messageId = randomUUID();
    const signals: SafetySignalDto[] = detectRiskyMessage(input.body).map((risk) => ({
      id: randomUUID(),
      type: risk.type,
      severity: risk.severity,
      source: "message",
      targetProfileId: otherProfileId,
      messageId,
      details: `Matched keyword: ${risk.matchedKeyword}`,
      createdAt: new Date().toISOString()
    }));

    const message: MessageDto = {
      id: messageId,
      conversationId,
      senderProfileId: profileId,
      body: input.body,
      createdAt: new Date().toISOString(),
      safetySignals: signals
    };
    this.store.messages.push(message);
    this.store.safetySignals.push(...signals);
    this.store.conversations = this.store.conversations.map((item) =>
      item.id === conversationId ? { ...item, updatedAt: message.createdAt, lastMessagePreview: input.body } : item
    );
    return message;
  }

  private assertCanUseConversation(profileId: string, conversationId: string) {
    const conversation = this.store.conversations.find((item) => item.id === conversationId);
    if (!conversation) {
      throw new NotFoundException("Conversation not found");
    }
    if (!conversation.participantProfileIds.includes(profileId)) {
      throw new BadRequestException("Profile is not in this conversation");
    }
    const [a, b] = conversation.participantProfileIds;
    if (conversation.status === ConversationStatus.Blocked || this.store.isBlocked(a, b)) {
      throw new BadRequestException("Blocked profiles cannot message each other");
    }
    if (conversation.status !== ConversationStatus.Active) {
      throw new BadRequestException("Conversation is not active");
    }
    return conversation;
  }
}
