import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  CandidateDto,
  ConversationDto,
  CountryCode,
  Gender,
  LikeDecision,
  ProfileDto,
  RelationshipIntent,
  ReportReason,
  detectRiskyMessage
} from "@asia-love/shared";
import { t, type Locale } from "./src/i18n";

type Screen = "login" | "profile" | "daily" | "detail" | "matches" | "chat" | "safety";

const seedProfiles: ProfileDto[] = [
  {
    id: "profile-mei",
    userId: "user-mei",
    displayName: "Mei",
    birthYear: 1993,
    gender: Gender.Woman,
    city: "Taipei",
    country: CountryCode.TW,
    latitude: 25.033,
    longitude: 121.565,
    intent: RelationshipIntent.Marriage,
    languages: ["zh-TW", "en"],
    bio: "想找認真經營關係、能一起規劃未來的人。",
    photos: [{ id: "photo-mei", url: "mock://mei", position: 0, isPrimary: true }],
    verified: true
  },
  {
    id: "profile-daniel",
    userId: "user-daniel",
    displayName: "Daniel",
    birthYear: 1991,
    gender: Gender.Man,
    city: "Taipei",
    country: CountryCode.TW,
    intent: RelationshipIntent.SeriousRelationship,
    languages: ["zh-TW", "en"],
    bio: "Stable, intentional, family-oriented. Prefer fewer but deeper conversations.",
    photos: [{ id: "photo-daniel", url: "mock://daniel", position: 0, isPrimary: true }],
    verified: true
  },
  {
    id: "profile-aisha",
    userId: "user-aisha",
    displayName: "Aisha",
    birthYear: 1992,
    gender: Gender.Woman,
    city: "Singapore",
    country: CountryCode.SG,
    intent: RelationshipIntent.Marriage,
    languages: ["en", "ms"],
    bio: "Looking for a kind long-term partner who values family and honesty.",
    photos: [{ id: "photo-aisha", url: "mock://aisha", position: 0, isPrimary: true }],
    verified: true
  }
];

const meInitial: ProfileDto = {
  id: "profile-you",
  userId: "user-you",
  displayName: "你",
  birthYear: 1994,
  gender: Gender.PreferNotToSay,
  city: "Taipei",
  country: CountryCode.TW,
  intent: RelationshipIntent.Marriage,
  languages: ["zh-TW", "en"],
  bio: "認真交友中。",
  photos: [{ id: "photo-you", url: "mock://you", position: 0, isPrimary: true }],
  verified: true
};

export default function App() {
  const [locale, setLocale] = useState<Locale>("zh-TW");
  const [screen, setScreen] = useState<Screen>("login");
  const [me, setMe] = useState<ProfileDto>(meInitial);
  const [selected, setSelected] = useState<ProfileDto | null>(null);
  const [matches, setMatches] = useState<ProfileDto[]>([]);
  const [conversations, setConversations] = useState<ConversationDto[]>([]);
  const [messages, setMessages] = useState<Array<{ sender: string; body: string; risky: boolean }>>([]);
  const [blockedIds, setBlockedIds] = useState<string[]>([]);
  const [passedIds, setPassedIds] = useState<string[]>([]);
  const [bioDraft, setBioDraft] = useState(me.bio);
  const [chatDraft, setChatDraft] = useState("");

  const candidates = useMemo<CandidateDto[]>(() => {
    return seedProfiles
      .filter((profile) => !blockedIds.includes(profile.id))
      .filter((profile) => !passedIds.includes(profile.id))
      .map((profile) => ({
        profile,
        score:
          (profile.intent === me.intent ? 5 : 0) +
          (profile.city === me.city ? 4 : 0) +
          (profile.languages.some((language) => me.languages.includes(language)) ? 2 : 0) +
          (profile.verified ? 1 : 0),
        reasons: [
          profile.intent === me.intent ? t(locale, "sameIntent") : t(locale, "seriousIntent"),
          profile.city === me.city ? t(locale, "sameCity") : t(locale, "regional"),
          profile.languages.some((language) => me.languages.includes(language)) ? t(locale, "languageOverlap") : ""
        ].filter(Boolean)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }, [blockedIds, locale, me, passedIds]);

  function like(profile: ProfileDto) {
    if (!matches.some((match) => match.id === profile.id)) {
      setMatches((current) => [...current, profile]);
      setConversations((current) => [
        ...current,
        {
          id: `conversation-${profile.id}`,
          matchId: `match-${profile.id}`,
          participantProfileIds: [me.id, profile.id],
          status: "active" as ConversationDto["status"],
          updatedAt: new Date().toISOString(),
          lastMessagePreview: t(locale, "matchOpened")
        }
      ]);
    }
    Alert.alert(t(locale, "match"), t(locale, "mutualLikeMock"));
    setScreen("matches");
  }

  function pass(profile: ProfileDto) {
    setPassedIds((current) => [...current, profile.id]);
    setScreen("daily");
  }

  function sendMessage() {
    if (!chatDraft.trim()) {
      return;
    }
    const risks = detectRiskyMessage(chatDraft);
    setMessages((current) => [
      ...current,
      {
        sender: me.displayName,
        body: chatDraft,
        risky: risks.length > 0
      }
    ]);
    if (risks.length > 0) {
      Alert.alert(t(locale, "safetySignal"), t(locale, "safetySignalBody"));
    }
    setChatDraft("");
  }

  function reportOrBlock(profile: ProfileDto, block: boolean) {
    if (block) {
      setBlockedIds((current) => [...current, profile.id]);
      setMatches((current) => current.filter((item) => item.id !== profile.id));
      setConversations((current) => current.filter((item) => !item.participantProfileIds.includes(profile.id)));
    }
    Alert.alert(block ? t(locale, "blocked") : t(locale, "reported"), t(locale, "safetyActionSaved"));
    setScreen("daily");
  }

  return (
    <SafeAreaView style={styles.shell}>
      <StatusBar style="dark" />
      <View style={styles.topBar}>
        <Text style={styles.brand}>Serious Asia</Text>
        <View style={styles.localeRow}>
          {(["zh-TW", "en", "ja"] as Locale[]).map((item) => (
            <Pressable
              key={item}
              onPress={() => setLocale(item)}
              style={[styles.localeButton, locale === item && styles.localeActive]}
            >
              <Text style={styles.localeText}>{item}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {screen === "login" && (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>{t(locale, "welcome")}</Text>
          <Text style={styles.copy}>{t(locale, "positioning")}</Text>
          <PrimaryButton label={t(locale, "mockLogin")} icon="log-in-outline" onPress={() => setScreen("profile")} />
        </ScrollView>
      )}

      {screen === "profile" && (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>{t(locale, "profileSetup")}</Text>
          <Field label={t(locale, "displayName")} value={me.displayName} onChangeText={(displayName) => setMe({ ...me, displayName })} />
          <Text style={styles.label}>{t(locale, "intent")}</Text>
          <View style={styles.segmentRow}>
            {Object.values(RelationshipIntent).map((intent) => (
              <Pressable
                key={intent}
                onPress={() => setMe({ ...me, intent })}
                style={[styles.segment, me.intent === intent && styles.segmentActive]}
              >
                <Text style={styles.segmentText}>{intent}</Text>
              </Pressable>
            ))}
          </View>
          <Field label={t(locale, "city")} value={me.city} onChangeText={(city) => setMe({ ...me, city })} />
          <Field label={t(locale, "bio")} value={bioDraft} onChangeText={setBioDraft} multiline />
          <PrimaryButton
            label={t(locale, "saveProfile")}
            icon="checkmark-circle-outline"
            onPress={() => {
              setMe({ ...me, bio: bioDraft });
              setScreen("daily");
            }}
          />
        </ScrollView>
      )}

      {screen === "daily" && (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>{t(locale, "daily")}</Text>
          <Text style={styles.copy}>{t(locale, "dailyLimit")}</Text>
          {candidates.map((candidate) => (
            <Pressable
              key={candidate.profile.id}
              style={styles.card}
              onPress={() => {
                setSelected(candidate.profile);
                setScreen("detail");
              }}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{candidate.profile.displayName.slice(0, 1)}</Text>
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{candidate.profile.displayName}</Text>
                <Text style={styles.meta}>
                  {candidate.profile.city} · {candidate.profile.intent}
                </Text>
                <Text style={styles.reason}>{candidate.reasons.join(" · ")}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#5E6B63" />
            </Pressable>
          ))}
        </ScrollView>
      )}

      {screen === "detail" && selected && (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>{selected.displayName}</Text>
          <Text style={styles.copy}>{selected.bio}</Text>
          <InfoLine icon="location-outline" text={`${selected.city}, ${selected.country}`} />
          <InfoLine icon="heart-outline" text={selected.intent} />
          <InfoLine icon="language-outline" text={selected.languages.join(", ")} />
          <View style={styles.actionRow}>
            <SecondaryButton label={t(locale, "pass")} icon="close-circle-outline" onPress={() => pass(selected)} />
            <PrimaryButton label={t(locale, "like")} icon="heart-circle-outline" onPress={() => like(selected)} />
          </View>
          <SecondaryButton label={t(locale, "reportSafety")} icon="shield-outline" onPress={() => setScreen("safety")} />
        </ScrollView>
      )}

      {screen === "matches" && (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>{t(locale, "matches")}</Text>
          {matches.map((match) => (
            <Pressable
              key={match.id}
              style={styles.card}
              onPress={() => {
                setSelected(match);
                setScreen("chat");
              }}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{match.displayName.slice(0, 1)}</Text>
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{match.displayName}</Text>
                <Text style={styles.meta}>{conversations.find((item) => item.participantProfileIds.includes(match.id))?.lastMessagePreview}</Text>
              </View>
              <Ionicons name="chatbubble-outline" size={20} color="#5E6B63" />
            </Pressable>
          ))}
          <SecondaryButton label={t(locale, "backToDaily")} icon="calendar-outline" onPress={() => setScreen("daily")} />
        </ScrollView>
      )}

      {screen === "chat" && selected && (
        <View style={styles.chatScreen}>
          <ScrollView contentContainerStyle={styles.messages}>
            <Text style={styles.title}>{selected.displayName}</Text>
            {messages.map((message, index) => (
              <View key={`${message.body}-${index}`} style={[styles.bubble, message.risky && styles.riskyBubble]}>
                <Text style={styles.bubbleText}>{message.body}</Text>
                {message.risky && <Text style={styles.riskyText}>{t(locale, "flagged")}</Text>}
              </View>
            ))}
          </ScrollView>
          <View style={styles.composer}>
            <TextInput
              value={chatDraft}
              onChangeText={setChatDraft}
              placeholder={t(locale, "messagePlaceholder")}
              style={styles.composerInput}
            />
            <Pressable style={styles.sendButton} onPress={sendMessage}>
              <Ionicons name="send" size={20} color="#FFFFFF" />
            </Pressable>
          </View>
          <SecondaryButton label={t(locale, "reportSafety")} icon="shield-outline" onPress={() => setScreen("safety")} />
        </View>
      )}

      {screen === "safety" && selected && (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>{t(locale, "safetyCenter")}</Text>
          <Text style={styles.copy}>{t(locale, "safetyCopy")}</Text>
          <PrimaryButton
            label={`${t(locale, "report")} · ${ReportReason.Scam}`}
            icon="flag-outline"
            onPress={() => reportOrBlock(selected, false)}
          />
          <SecondaryButton label={t(locale, "block")} icon="ban-outline" onPress={() => reportOrBlock(selected, true)} />
          <SecondaryButton label={t(locale, "cancel")} icon="arrow-back-outline" onPress={() => setScreen("detail")} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function Field(props: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  multiline?: boolean;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{props.label}</Text>
      <TextInput
        value={props.value}
        onChangeText={props.onChangeText}
        multiline={props.multiline}
        style={[styles.input, props.multiline && styles.multilineInput]}
      />
    </View>
  );
}

function InfoLine({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View style={styles.infoLine}>
      <Ionicons name={icon} size={18} color="#406A5D" />
      <Text style={styles.meta}>{text}</Text>
    </View>
  );
}

function PrimaryButton({ label, icon, onPress }: { label: string; icon: keyof typeof Ionicons.glyphMap; onPress: () => void }) {
  return (
    <Pressable style={styles.primaryButton} onPress={onPress}>
      <Ionicons name={icon} size={18} color="#FFFFFF" />
      <Text style={styles.primaryButtonText}>{label}</Text>
    </Pressable>
  );
}

function SecondaryButton({ label, icon, onPress }: { label: string; icon: keyof typeof Ionicons.glyphMap; onPress: () => void }) {
  return (
    <Pressable style={styles.secondaryButton} onPress={onPress}>
      <Ionicons name={icon} size={18} color="#315C51" />
      <Text style={styles.secondaryButtonText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: "#F8F5EF"
  },
  topBar: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#DDD6C8",
    backgroundColor: "#FFFDF8"
  },
  brand: {
    fontSize: 20,
    fontWeight: "700",
    color: "#243B36"
  },
  localeRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10
  },
  localeButton: {
    borderWidth: 1,
    borderColor: "#CFC7B8",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5
  },
  localeActive: {
    backgroundColor: "#DDEBE4",
    borderColor: "#7EA694"
  },
  localeText: {
    fontSize: 12,
    color: "#314842"
  },
  content: {
    padding: 20,
    gap: 14
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#253A35"
  },
  copy: {
    fontSize: 16,
    lineHeight: 24,
    color: "#56625D"
  },
  field: {
    gap: 6
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#4B5E58"
  },
  input: {
    borderWidth: 1,
    borderColor: "#CFC7B8",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    color: "#253A35"
  },
  multilineInput: {
    minHeight: 88,
    textAlignVertical: "top"
  },
  segmentRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  segment: {
    borderWidth: 1,
    borderColor: "#CFC7B8",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#FFFFFF"
  },
  segmentActive: {
    backgroundColor: "#DDEBE4",
    borderColor: "#7EA694"
  },
  segmentText: {
    fontSize: 12,
    color: "#253A35"
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#DDD6C8",
    borderRadius: 8,
    backgroundColor: "#FFFDF8"
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#D8A25E",
    alignItems: "center",
    justifyContent: "center"
  },
  avatarText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 20
  },
  cardBody: {
    flex: 1,
    gap: 3
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#253A35"
  },
  meta: {
    fontSize: 14,
    color: "#5E6B63"
  },
  reason: {
    fontSize: 12,
    color: "#8B6E45"
  },
  actionRow: {
    flexDirection: "row",
    gap: 10
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#315C51",
    borderRadius: 8,
    paddingVertical: 13,
    paddingHorizontal: 14,
    flex: 1
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "800"
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#9DB2A9",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: "#FFFFFF",
    flex: 1
  },
  secondaryButtonText: {
    color: "#315C51",
    fontWeight: "800"
  },
  chatScreen: {
    flex: 1,
    padding: 16,
    gap: 10
  },
  messages: {
    gap: 10,
    paddingBottom: 12
  },
  bubble: {
    alignSelf: "flex-end",
    maxWidth: "86%",
    backgroundColor: "#DDEBE4",
    borderRadius: 8,
    padding: 12
  },
  riskyBubble: {
    backgroundColor: "#F8E0D8",
    borderWidth: 1,
    borderColor: "#D78A73"
  },
  bubbleText: {
    color: "#253A35",
    fontSize: 15
  },
  riskyText: {
    marginTop: 4,
    color: "#9B3D2A",
    fontSize: 12,
    fontWeight: "800"
  },
  composer: {
    flexDirection: "row",
    gap: 8
  },
  composerInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#CFC7B8",
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#FFFFFF"
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: "#315C51",
    alignItems: "center",
    justifyContent: "center"
  },
  infoLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  }
});
