import { BadRequestException, Injectable } from "@nestjs/common";
import { LikeDecision, LikeRequestDto, LikeResponseDto, MatchStatus, ConversationStatus } from "@asia-love/shared";
import { randomUUID } from "crypto";
import { InMemoryStore } from "../data/in-memory-store";

@Injectable()
export class MatchingService {
  constructor(private readonly store: InMemoryStore) {}

  decide(actorProfileId: string, input: LikeRequestDto): LikeResponseDto {
    if (actorProfileId === input.targetProfileId) {
      throw new BadRequestException("Cannot like yourself");
    }
    this.store.getProfile(actorProfileId);
    this.store.getProfile(input.targetProfileId);

    if (this.store.isBlocked(actorProfileId, input.targetProfileId)) {
      throw new BadRequestException("Profiles cannot interact after a block");
    }

    const existing = this.store.likes.find(
      (like) => like.actorProfileId === actorProfileId && like.targetProfileId === input.targetProfileId
    );
    if (existing) {
      existing.decision = input.decision;
    } else {
      this.store.likes.push({
        id: randomUUID(),
        actorProfileId,
        targetProfileId: input.targetProfileId,
        decision: input.decision,
        createdAt: new Date().toISOString()
      });
    }

    if (input.decision === LikeDecision.Pass) {
      return { matched: false };
    }

    const reciprocalLike = this.store.likes.find(
      (like) =>
        like.actorProfileId === input.targetProfileId &&
        like.targetProfileId === actorProfileId &&
        like.decision === LikeDecision.Like
    );
    if (!reciprocalLike) {
      return { matched: false };
    }

    const existingMatch = this.store.matches.find(
      (match) => match.profileIds.includes(actorProfileId) && match.profileIds.includes(input.targetProfileId)
    );
    if (existingMatch) {
      const conversation = this.store.conversations.find((item) => item.matchId === existingMatch.id);
      return {
        matched: true,
        matchId: existingMatch.id,
        conversationId: conversation?.id
      };
    }

    const match = {
      id: randomUUID(),
      profileIds: [actorProfileId, input.targetProfileId] as [string, string],
      createdAt: new Date().toISOString(),
      status: MatchStatus.Active
    };
    this.store.matches.push(match);

    const conversation = {
      id: randomUUID(),
      matchId: match.id,
      participantProfileIds: match.profileIds,
      status: ConversationStatus.Active,
      updatedAt: new Date().toISOString()
    };
    this.store.conversations.push(conversation);

    return {
      matched: true,
      matchId: match.id,
      conversationId: conversation.id
    };
  }
}
