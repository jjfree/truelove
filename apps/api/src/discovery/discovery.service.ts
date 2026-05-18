import { Injectable } from "@nestjs/common";
import { DAILY_RECOMMENDATION_LIMIT } from "@asia-love/shared";
import { InMemoryStore } from "../data/in-memory-store";

@Injectable()
export class DiscoveryService {
  constructor(private readonly store: InMemoryStore) {}

  daily(profileId: string, limit = Number(process.env.DAILY_RECOMMENDATION_LIMIT ?? DAILY_RECOMMENDATION_LIMIT)) {
    return {
      date: new Date().toISOString().slice(0, 10),
      limit,
      candidates: this.store.dailyCandidates(profileId, limit)
    };
  }
}
