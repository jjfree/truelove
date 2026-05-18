import { BadRequestException, Injectable } from "@nestjs/common";
import {
  BlockRequestDto,
  ReportRequestDto,
  SafetySignalDto,
  SafetySignalSeverity,
  SafetySignalType
} from "@asia-love/shared";
import { randomUUID } from "crypto";
import { InMemoryStore, StoredReport } from "../data/in-memory-store";

@Injectable()
export class SafetyService {
  constructor(private readonly store: InMemoryStore) {}

  report(actorProfileId: string, input: ReportRequestDto): StoredReport {
    if (actorProfileId === input.targetProfileId) {
      throw new BadRequestException("Cannot report yourself");
    }
    this.store.getProfile(actorProfileId);
    this.store.getProfile(input.targetProfileId);
    const report: StoredReport = {
      id: randomUUID(),
      actorProfileId,
      targetProfileId: input.targetProfileId,
      reason: input.reason,
      details: input.details,
      createdAt: new Date().toISOString()
    };
    this.store.reports.push(report);
    this.store.createManualSafetySignal(
      input.targetProfileId,
      `Report reason: ${input.reason}${input.details ? `; ${input.details}` : ""}`
    );
    return report;
  }

  block(actorProfileId: string, input: BlockRequestDto) {
    if (actorProfileId === input.targetProfileId) {
      throw new BadRequestException("Cannot block yourself");
    }
    this.store.getProfile(actorProfileId);
    this.store.getProfile(input.targetProfileId);
    return this.store.createBlock(actorProfileId, input.targetProfileId, input.reason);
  }

  createSignal(input: Omit<SafetySignalDto, "id" | "createdAt">): SafetySignalDto {
    const signal: SafetySignalDto = {
      id: randomUUID(),
      type: input.type ?? SafetySignalType.ManualReport,
      severity: input.severity ?? SafetySignalSeverity.Medium,
      source: input.source,
      targetProfileId: input.targetProfileId,
      messageId: input.messageId,
      details: input.details,
      createdAt: new Date().toISOString()
    };
    this.store.safetySignals.push(signal);
    return signal;
  }
}
