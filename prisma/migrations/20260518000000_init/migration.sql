CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TYPE "CountryCode" AS ENUM ('TW', 'SG', 'MY', 'JP', 'PH', 'VN');
CREATE TYPE "RelationshipIntent" AS ENUM ('marriage', 'serious_relationship', 'open_to_relationship', 'friendship');
CREATE TYPE "Gender" AS ENUM ('woman', 'man', 'non_binary', 'prefer_not_to_say');
CREATE TYPE "VerificationType" AS ENUM ('email', 'phone', 'selfie', 'id_mock');
CREATE TYPE "VerificationStatus" AS ENUM ('pending', 'verified', 'rejected');
CREATE TYPE "LikeDecision" AS ENUM ('like', 'pass');
CREATE TYPE "MatchStatus" AS ENUM ('active', 'blocked');
CREATE TYPE "ConversationStatus" AS ENUM ('active', 'blocked', 'reported');
CREATE TYPE "SafetySignalType" AS ENUM ('investment', 'crypto', 'money_transfer', 'external_messaging', 'suspicious_apk', 'harassment', 'manual_report');
CREATE TYPE "SafetySignalSeverity" AS ENUM ('low', 'medium', 'high');
CREATE TYPE "ReportReason" AS ENUM ('scam', 'harassment', 'fake_profile', 'explicit_content', 'other');

CREATE TABLE "User" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" TEXT NOT NULL UNIQUE,
  "passwordHash" TEXT NOT NULL,
  "displayName" TEXT NOT NULL,
  "locale" TEXT NOT NULL DEFAULT 'zh-TW',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Profile" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL UNIQUE REFERENCES "User"("id") ON DELETE CASCADE,
  "displayName" TEXT NOT NULL,
  "birthYear" INTEGER NOT NULL,
  "gender" "Gender" NOT NULL,
  "city" TEXT NOT NULL,
  "country" "CountryCode" NOT NULL,
  "latitude" DECIMAL(9,6),
  "longitude" DECIMAL(9,6),
  "location" geography(Point,4326),
  "intent" "RelationshipIntent" NOT NULL,
  "languages" TEXT[] NOT NULL,
  "bio" TEXT NOT NULL,
  "isVisible" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "ProfilePhoto" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "profileId" UUID NOT NULL REFERENCES "Profile"("id") ON DELETE CASCADE,
  "url" TEXT NOT NULL,
  "position" INTEGER NOT NULL,
  "isPrimary" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Preference" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "profileId" UUID NOT NULL UNIQUE REFERENCES "Profile"("id") ON DELETE CASCADE,
  "minAge" INTEGER NOT NULL,
  "maxAge" INTEGER NOT NULL,
  "countries" "CountryCode"[] NOT NULL,
  "cities" TEXT[] NOT NULL,
  "maxDistanceKm" INTEGER NOT NULL,
  "intents" "RelationshipIntent"[] NOT NULL,
  "languages" TEXT[] NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Verification" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "profileId" UUID NOT NULL REFERENCES "Profile"("id") ON DELETE CASCADE,
  "type" "VerificationType" NOT NULL,
  "status" "VerificationStatus" NOT NULL DEFAULT 'pending',
  "provider" TEXT NOT NULL DEFAULT 'mock',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Like" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "actorProfileId" UUID NOT NULL REFERENCES "Profile"("id") ON DELETE CASCADE,
  "targetProfileId" UUID NOT NULL REFERENCES "Profile"("id") ON DELETE CASCADE,
  "decision" "LikeDecision" NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Like_actorProfileId_targetProfileId_key" UNIQUE ("actorProfileId", "targetProfileId")
);

CREATE TABLE "Match" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "status" "MatchStatus" NOT NULL DEFAULT 'active',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "MatchProfile" (
  "matchId" UUID NOT NULL REFERENCES "Match"("id") ON DELETE CASCADE,
  "profileId" UUID NOT NULL REFERENCES "Profile"("id") ON DELETE CASCADE,
  PRIMARY KEY ("matchId", "profileId")
);

CREATE TABLE "Conversation" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "matchId" UUID NOT NULL UNIQUE REFERENCES "Match"("id") ON DELETE CASCADE,
  "status" "ConversationStatus" NOT NULL DEFAULT 'active',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Message" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "conversationId" UUID NOT NULL REFERENCES "Conversation"("id") ON DELETE CASCADE,
  "senderProfileId" UUID NOT NULL REFERENCES "Profile"("id") ON DELETE CASCADE,
  "body" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Block" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "actorProfileId" UUID NOT NULL REFERENCES "Profile"("id") ON DELETE CASCADE,
  "targetProfileId" UUID NOT NULL REFERENCES "Profile"("id") ON DELETE CASCADE,
  "reason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Block_actorProfileId_targetProfileId_key" UNIQUE ("actorProfileId", "targetProfileId")
);

CREATE TABLE "Report" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "actorProfileId" UUID NOT NULL REFERENCES "Profile"("id") ON DELETE CASCADE,
  "targetProfileId" UUID NOT NULL REFERENCES "Profile"("id") ON DELETE CASCADE,
  "reason" "ReportReason" NOT NULL,
  "details" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "SafetySignal" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "type" "SafetySignalType" NOT NULL,
  "severity" "SafetySignalSeverity" NOT NULL,
  "source" TEXT NOT NULL,
  "targetProfileId" UUID REFERENCES "Profile"("id") ON DELETE SET NULL,
  "messageId" UUID REFERENCES "Message"("id") ON DELETE SET NULL,
  "details" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "AuditLog" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID REFERENCES "User"("id") ON DELETE SET NULL,
  "action" TEXT NOT NULL,
  "entity" TEXT NOT NULL,
  "entityId" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "Profile_location_idx" ON "Profile" USING GIST ("location");
CREATE INDEX "Profile_discovery_idx" ON "Profile" ("country", "city", "intent", "isVisible");
CREATE INDEX "Message_conversation_created_idx" ON "Message" ("conversationId", "createdAt");
CREATE INDEX "SafetySignal_target_created_idx" ON "SafetySignal" ("targetProfileId", "createdAt");
