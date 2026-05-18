export enum CountryCode {
  TW = "TW",
  SG = "SG",
  MY = "MY",
  JP = "JP",
  PH = "PH",
  VN = "VN"
}

export enum RelationshipIntent {
  Marriage = "marriage",
  SeriousRelationship = "serious_relationship",
  OpenToRelationship = "open_to_relationship",
  Friendship = "friendship"
}

export enum Gender {
  Woman = "woman",
  Man = "man",
  NonBinary = "non_binary",
  PreferNotToSay = "prefer_not_to_say"
}

export enum VerificationType {
  Email = "email",
  Phone = "phone",
  Selfie = "selfie",
  IdMock = "id_mock"
}

export enum VerificationStatus {
  Pending = "pending",
  Verified = "verified",
  Rejected = "rejected"
}

export enum LikeDecision {
  Like = "like",
  Pass = "pass"
}

export enum MatchStatus {
  Active = "active",
  Blocked = "blocked"
}

export enum ConversationStatus {
  Active = "active",
  Blocked = "blocked",
  Reported = "reported"
}

export enum SafetySignalType {
  Investment = "investment",
  Crypto = "crypto",
  MoneyTransfer = "money_transfer",
  ExternalMessaging = "external_messaging",
  SuspiciousApk = "suspicious_apk",
  Harassment = "harassment",
  ManualReport = "manual_report"
}

export enum SafetySignalSeverity {
  Low = "low",
  Medium = "medium",
  High = "high"
}

export enum ReportReason {
  Scam = "scam",
  Harassment = "harassment",
  FakeProfile = "fake_profile",
  ExplicitContent = "explicit_content",
  Other = "other"
}

export interface AuthUserDto {
  id: string;
  email: string;
  displayName: string;
}

export interface RegisterRequestDto {
  email: string;
  displayName: string;
  password: string;
  locale?: SupportedLocale;
}

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface AuthResponseDto {
  token: string;
  user: AuthUserDto;
}

export interface ProfileDto {
  id: string;
  userId: string;
  displayName: string;
  birthYear: number;
  gender: Gender;
  city: string;
  country: CountryCode;
  latitude?: number;
  longitude?: number;
  intent: RelationshipIntent;
  languages: string[];
  bio: string;
  photos: ProfilePhotoDto[];
  verified: boolean;
}

export interface ProfilePhotoDto {
  id: string;
  url: string;
  position: number;
  isPrimary: boolean;
}

export interface UpsertProfileRequestDto {
  displayName: string;
  birthYear: number;
  gender: Gender;
  city: string;
  country: CountryCode;
  latitude?: number;
  longitude?: number;
  intent: RelationshipIntent;
  languages: string[];
  bio: string;
  photos?: Array<Omit<ProfilePhotoDto, "id">>;
}

export interface PreferenceDto {
  minAge: number;
  maxAge: number;
  countries: CountryCode[];
  cities: string[];
  maxDistanceKm: number;
  intents: RelationshipIntent[];
  languages: string[];
}

export interface CandidateDto {
  profile: ProfileDto;
  score: number;
  reasons: string[];
}

export interface DiscoveryResponseDto {
  date: string;
  limit: number;
  candidates: CandidateDto[];
}

export interface LikeRequestDto {
  targetProfileId: string;
  decision: LikeDecision;
}

export interface LikeResponseDto {
  matched: boolean;
  matchId?: string;
  conversationId?: string;
}

export interface MatchDto {
  id: string;
  profileIds: [string, string];
  createdAt: string;
  status: MatchStatus;
}

export interface ConversationDto {
  id: string;
  matchId: string;
  participantProfileIds: [string, string];
  status: ConversationStatus;
  lastMessagePreview?: string;
  updatedAt: string;
}

export interface MessageDto {
  id: string;
  conversationId: string;
  senderProfileId: string;
  body: string;
  createdAt: string;
  safetySignals: SafetySignalDto[];
}

export interface SendMessageRequestDto {
  body: string;
}

export interface BlockRequestDto {
  targetProfileId: string;
  reason?: string;
}

export interface ReportRequestDto {
  targetProfileId: string;
  reason: ReportReason;
  details?: string;
}

export interface SafetySignalDto {
  id: string;
  type: SafetySignalType;
  severity: SafetySignalSeverity;
  source: "message" | "profile" | "report" | "system";
  targetProfileId?: string;
  messageId?: string;
  details: string;
  createdAt: string;
}

export type SupportedLocale = "zh-TW" | "en" | "ja";

export const DAILY_RECOMMENDATION_LIMIT = 5;

export const supportedLocales: SupportedLocale[] = ["zh-TW", "en", "ja"];

export const riskyMessagePatterns: Array<{
  type: SafetySignalType;
  severity: SafetySignalSeverity;
  keywords: string[];
}> = [
  {
    type: SafetySignalType.Investment,
    severity: SafetySignalSeverity.High,
    keywords: ["投資", "理財老師", "guaranteed return", "investment", "穩賺"]
  },
  {
    type: SafetySignalType.Crypto,
    severity: SafetySignalSeverity.High,
    keywords: ["加密貨幣", "crypto", "bitcoin", "usdt", "幣安", "交易所"]
  },
  {
    type: SafetySignalType.MoneyTransfer,
    severity: SafetySignalSeverity.High,
    keywords: ["轉帳", "匯款", "wire me", "remit", "bank transfer", "借我錢"]
  },
  {
    type: SafetySignalType.SuspiciousApk,
    severity: SafetySignalSeverity.High,
    keywords: [".apk", "安裝包", "side load", "sideload", "下載這個app"]
  },
  {
    type: SafetySignalType.ExternalMessaging,
    severity: SafetySignalSeverity.Medium,
    keywords: ["line id", "telegram", "whatsapp", "wechat", "加我賴", "外面聊"]
  }
];

export function detectRiskyMessage(body: string): Array<{
  type: SafetySignalType;
  severity: SafetySignalSeverity;
  matchedKeyword: string;
}> {
  const lowerBody = body.toLowerCase();
  return riskyMessagePatterns.flatMap((pattern) => {
    const keyword = pattern.keywords.find((item) => lowerBody.includes(item.toLowerCase()));
    return keyword
      ? [
          {
            type: pattern.type,
            severity: pattern.severity,
            matchedKeyword: keyword
          }
        ]
      : [];
  });
}
