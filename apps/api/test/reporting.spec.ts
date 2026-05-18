import { ReportReason, SafetySignalType } from "@asia-love/shared";
import { InMemoryStore } from "../src/data/in-memory-store";
import { SafetyService } from "../src/safety/safety.service";

describe("SafetyService reporting", () => {
  it("creates a report and a manual safety signal", () => {
    const store = InMemoryStore.withSeedData();
    const service = new SafetyService(store);
    const [mei, daniel] = store.profiles;

    const report = service.report(mei.id, {
      targetProfileId: daniel.id,
      reason: ReportReason.Scam,
      details: "Asked for a bank transfer."
    });

    expect(report.reason).toBe(ReportReason.Scam);
    expect(store.safetySignals).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          targetProfileId: daniel.id,
          type: SafetySignalType.ManualReport
        })
      ])
    );
  });
});
