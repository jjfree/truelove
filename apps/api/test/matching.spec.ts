import { LikeDecision } from "@asia-love/shared";
import { InMemoryStore } from "../src/data/in-memory-store";
import { MatchingService } from "../src/matching/matching.service";

describe("MatchingService", () => {
  it("creates a match and conversation only after mutual likes", () => {
    const store = InMemoryStore.withSeedData();
    const service = new MatchingService(store);
    const [mei, daniel] = store.profiles;

    const first = service.decide(mei.id, {
      targetProfileId: daniel.id,
      decision: LikeDecision.Like
    });
    expect(first.matched).toBe(false);

    const second = service.decide(daniel.id, {
      targetProfileId: mei.id,
      decision: LikeDecision.Like
    });
    expect(second.matched).toBe(true);
    expect(second.matchId).toBeDefined();
    expect(second.conversationId).toBeDefined();
    expect(store.conversations).toHaveLength(1);
  });

  it("does not create a match when either profile has blocked the other", () => {
    const store = InMemoryStore.withSeedData();
    const service = new MatchingService(store);
    const [mei, daniel] = store.profiles;

    store.createBlock(mei.id, daniel.id, "not interested");

    expect(() =>
      service.decide(daniel.id, {
        targetProfileId: mei.id,
        decision: LikeDecision.Like
      })
    ).toThrow("Profiles cannot interact after a block");
  });
});
