import { SafetySignalSeverity, SafetySignalType } from "@asia-love/shared";
import { InMemoryStore } from "../src/data/in-memory-store";
import { ConversationService } from "../src/conversation/conversation.service";
import { MatchingService } from "../src/matching/matching.service";
import { LikeDecision } from "@asia-love/shared";

describe("Conversation safety rules", () => {
  it("creates high-risk safety signals from risky message content", () => {
    const store = InMemoryStore.withSeedData();
    const matching = new MatchingService(store);
    const [mei, daniel] = store.profiles;

    matching.decide(mei.id, { targetProfileId: daniel.id, decision: LikeDecision.Like });
    const match = matching.decide(daniel.id, {
      targetProfileId: mei.id,
      decision: LikeDecision.Like
    });

    const conversations = new ConversationService(store);
    const message = conversations.sendMessage(daniel.id, match.conversationId!, {
      body: "我們可以外面聊，我也想介紹一個 USDT 投資機會"
    });

    expect(message.safetySignals).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: SafetySignalType.Investment,
          severity: SafetySignalSeverity.High
        }),
        expect.objectContaining({
          type: SafetySignalType.Crypto,
          severity: SafetySignalSeverity.High
        })
      ])
    );
  });

  it("prevents sending messages after a block", () => {
    const store = InMemoryStore.withSeedData();
    const matching = new MatchingService(store);
    const [mei, daniel] = store.profiles;
    matching.decide(mei.id, { targetProfileId: daniel.id, decision: LikeDecision.Like });
    const match = matching.decide(daniel.id, {
      targetProfileId: mei.id,
      decision: LikeDecision.Like
    });
    store.createBlock(mei.id, daniel.id, "boundary");

    const conversations = new ConversationService(store);

    expect(() =>
      conversations.sendMessage(daniel.id, match.conversationId!, {
        body: "hello"
      })
    ).toThrow("Blocked profiles cannot message each other");
  });
});
