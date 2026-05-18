import {
  AuthUserDto,
  BlockRequestDto,
  CandidateDto,
  ConversationDto,
  ConversationStatus,
  CountryCode,
  DAILY_RECOMMENDATION_LIMIT,
  Gender,
  LikeDecision,
  MatchDto,
  MatchStatus,
  MessageDto,
  PreferenceDto,
  ProfileDto,
  ReportReason,
  ReportRequestDto,
  SafetySignalDto,
  SafetySignalSeverity,
  SafetySignalType,
  UpsertProfileRequestDto,
  VerificationStatus
} from "@asia-love/shared";
import { randomUUID } from "crypto";

export interface StoredUser extends AuthUserDto {
  passwordHash: string;
  locale: string;
}

export interface StoredLike {
  id: string;
  actorProfileId: string;
  targetProfileId: string;
  decision: LikeDecision;
  createdAt: string;
}

export interface StoredReport {
  id: string;
  actorProfileId: string;
  targetProfileId: string;
  reason: ReportReason;
  details?: string;
  createdAt: string;
}

export interface StoredBlock {
  id: string;
  actorProfileId: string;
  targetProfileId: string;
  reason?: string;
  createdAt: string;
}

export class InMemoryStore {
  users: StoredUser[] = [];
  profiles: ProfileDto[] = [];
  preferences: Array<PreferenceDto & { profileId: string }> = [];
  likes: StoredLike[] = [];
  matches: MatchDto[] = [];
  conversations: ConversationDto[] = [];
  messages: MessageDto[] = [];
  blocks: StoredBlock[] = [];
  reports: StoredReport[] = [];
  safetySignals: SafetySignalDto[] = [];

  static withSeedData(): InMemoryStore {
    const store = new InMemoryStore();
    const mei = store.createUser("mei@example.test", "Mei", "pw", "zh-TW");
    const daniel = store.createUser("daniel@example.test", "Daniel", "pw", "zh-TW");
    const aisha = store.createUser("aisha@example.test", "Aisha", "pw", "en");

    store.upsertProfile(mei.id, {
      displayName: "Mei",
      birthYear: 1993,
      gender: Gender.Woman,
      city: "Taipei",
      country: CountryCode.TW,
      latitude: 25.033,
      longitude: 121.565,
      intent: "marriage" as ProfileDto["intent"],
      languages: ["zh-TW", "en"],
      bio: "想找認真經營關係的人。",
      photos: [{ url: "https://example.test/mei.jpg", position: 0, isPrimary: true }]
    });
    store.upsertProfile(daniel.id, {
      displayName: "Daniel",
      birthYear: 1991,
      gender: Gender.Man,
      city: "Taipei",
      country: CountryCode.TW,
      latitude: 25.047,
      longitude: 121.517,
      intent: "serious_relationship" as ProfileDto["intent"],
      languages: ["zh-TW", "en"],
      bio: "Stable, intentional, and family-oriented.",
      photos: [{ url: "https://example.test/daniel.jpg", position: 0, isPrimary: true }]
    });
    store.upsertProfile(aisha.id, {
      displayName: "Aisha",
      birthYear: 1992,
      gender: Gender.Woman,
      city: "Singapore",
      country: CountryCode.SG,
      latitude: 1.3521,
      longitude: 103.8198,
      intent: "marriage" as ProfileDto["intent"],
      languages: ["en", "ms"],
      bio: "Looking for a kind long-term partner.",
      photos: [{ url: "https://example.test/aisha.jpg", position: 0, isPrimary: true }]
    });

    for (const profile of store.profiles) {
      store.preferences.push({
        profileId: profile.id,
        minAge: 28,
        maxAge: 40,
        countries: [CountryCode.TW, CountryCode.SG, CountryCode.MY],
        cities: [profile.city],
        maxDistanceKm: 50,
        intents: ["marriage", "serious_relationship"] as PreferenceDto["intents"],
        languages: profile.languages
      });
    }

    return store;
  }

  createUser(email: string, displayName: string, password: string, locale = "zh-TW"): StoredUser {
    const existing = this.users.find((user) => user.email === email);
    if (existing) {
      throw new Error("Email already registered");
    }
    const user: StoredUser = {
      id: randomUUID(),
      email,
      displayName,
      passwordHash: `mock:${password}`,
      locale
    };
    this.users.push(user);
    return user;
  }

  findUserByEmail(email: string): StoredUser | undefined {
    return this.users.find((user) => user.email === email);
  }

  upsertProfile(userId: string, input: UpsertProfileRequestDto): ProfileDto {
    const user = this.users.find((item) => item.id === userId);
    if (!user) {
      throw new Error("User not found");
    }

    const existing = this.profiles.find((profile) => profile.userId === userId);
    const profile: ProfileDto = {
      id: existing?.id ?? randomUUID(),
      userId,
      displayName: input.displayName,
      birthYear: input.birthYear,
      gender: input.gender,
      city: input.city,
      country: input.country,
      latitude: input.latitude,
      longitude: input.longitude,
      intent: input.intent,
      languages: input.languages,
      bio: input.bio,
      photos: (input.photos ?? []).map((photo) => ({
        ...photo,
        id: randomUUID()
      })),
      verified: true
    };

    if (existing) {
      this.profiles = this.profiles.map((item) => (item.id === existing.id ? profile : item));
    } else {
      this.profiles.push(profile);
    }

    if (!this.preferences.some((preference) => preference.profileId === profile.id)) {
      this.preferences.push({
        profileId: profile.id,
        minAge: 25,
        maxAge: 42,
        countries: [CountryCode.TW, CountryCode.SG, CountryCode.MY],
        cities: [profile.city],
        maxDistanceKm: 50,
        intents: ["marriage", "serious_relationship", "open_to_relationship"] as PreferenceDto["intents"],
        languages: profile.languages
      });
    }

    return profile;
  }

  getProfileByUserId(userId: string): ProfileDto | undefined {
    return this.profiles.find((profile) => profile.userId === userId);
  }

  getProfile(profileId: string): ProfileDto {
    const profile = this.profiles.find((item) => item.id === profileId);
    if (!profile) {
      throw new Error("Profile not found");
    }
    return profile;
  }

  getPreference(profileId: string): PreferenceDto {
    return (
      this.preferences.find((preference) => preference.profileId === profileId) ?? {
        minAge: 25,
        maxAge: 42,
        countries: [CountryCode.TW, CountryCode.SG, CountryCode.MY],
        cities: [],
        maxDistanceKm: 50,
        intents: ["marriage", "serious_relationship", "open_to_relationship"] as PreferenceDto["intents"],
        languages: []
      }
    );
  }

  isBlocked(profileA: string, profileB: string): boolean {
    return this.blocks.some(
      (block) =>
        (block.actorProfileId === profileA && block.targetProfileId === profileB) ||
        (block.actorProfileId === profileB && block.targetProfileId === profileA)
    );
  }

  createBlock(actorProfileId: string, targetProfileId: string, reason?: string): StoredBlock {
    const existing = this.blocks.find(
      (block) => block.actorProfileId === actorProfileId && block.targetProfileId === targetProfileId
    );
    if (existing) {
      return existing;
    }
    const block: StoredBlock = {
      id: randomUUID(),
      actorProfileId,
      targetProfileId,
      reason,
      createdAt: new Date().toISOString()
    };
    this.blocks.push(block);

    const affectedMatchIds = this.matches
      .filter((match) => match.profileIds.includes(actorProfileId) && match.profileIds.includes(targetProfileId))
      .map((match) => match.id);

    this.matches = this.matches.map((match) =>
      affectedMatchIds.includes(match.id) ? { ...match, status: MatchStatus.Blocked } : match
    );
    this.conversations = this.conversations.map((conversation) =>
      affectedMatchIds.includes(conversation.matchId)
        ? { ...conversation, status: ConversationStatus.Blocked }
        : conversation
    );

    return block;
  }

  createManualSafetySignal(targetProfileId: string, details: string): SafetySignalDto {
    const signal: SafetySignalDto = {
      id: randomUUID(),
      type: SafetySignalType.ManualReport,
      severity: SafetySignalSeverity.High,
      source: "report",
      targetProfileId,
      details,
      createdAt: new Date().toISOString()
    };
    this.safetySignals.push(signal);
    return signal;
  }

  scoreCandidate(viewer: ProfileDto, candidate: ProfileDto): CandidateDto {
    const preference = this.getPreference(viewer.id);
    const currentYear = new Date().getFullYear();
    const candidateAge = currentYear - candidate.birthYear;
    const reasons: string[] = [];
    let score = 0;

    if (candidate.intent === viewer.intent) {
      score += 5;
      reasons.push("same_intent");
    }
    if (preference.intents.includes(candidate.intent)) {
      score += 3;
      reasons.push("intent_preferred");
    }
    if (candidate.city === viewer.city) {
      score += 4;
      reasons.push("same_city");
    } else if (candidate.country === viewer.country || preference.countries.includes(candidate.country)) {
      score += 2;
      reasons.push("acceptable_location");
    }
    if (candidate.languages.some((language) => viewer.languages.includes(language))) {
      score += 2;
      reasons.push("language_overlap");
    }
    if (candidateAge >= preference.minAge && candidateAge <= preference.maxAge) {
      score += 2;
      reasons.push("age_preference");
    }
    if (candidate.verified) {
      score += 1;
      reasons.push("verified");
    }

    return { profile: candidate, score, reasons };
  }

  dailyCandidates(profileId: string, limit = DAILY_RECOMMENDATION_LIMIT): CandidateDto[] {
    const viewer = this.getProfile(profileId);
    const existingDecisions = new Set(
      this.likes.filter((like) => like.actorProfileId === profileId).map((like) => like.targetProfileId)
    );

    return this.profiles
      .filter((profile) => profile.id !== profileId)
      .filter((profile) => !existingDecisions.has(profile.id))
      .filter((profile) => !this.isBlocked(profileId, profile.id))
      .map((profile) => this.scoreCandidate(viewer, profile))
      .filter((candidate) => candidate.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  participantIdsForConversation(conversationId: string): [string, string] {
    const conversation = this.conversations.find((item) => item.id === conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }
    return conversation.participantProfileIds;
  }
}
