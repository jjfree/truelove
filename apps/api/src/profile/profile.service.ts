import { Injectable, NotFoundException } from "@nestjs/common";
import { UpsertProfileRequestDto } from "@asia-love/shared";
import { InMemoryStore } from "../data/in-memory-store";

@Injectable()
export class ProfileService {
  constructor(private readonly store: InMemoryStore) {}

  me(userId: string) {
    const profile = this.store.getProfileByUserId(userId);
    if (!profile) {
      throw new NotFoundException("Profile not found");
    }
    return profile;
  }

  upsert(userId: string, input: UpsertProfileRequestDto) {
    return this.store.upsertProfile(userId, input);
  }

  get(profileId: string) {
    return this.store.getProfile(profileId);
  }
}
