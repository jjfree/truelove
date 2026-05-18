import { BadRequestException } from "@nestjs/common";

export interface HeaderRequest {
  header(name: string): string | undefined;
}

export function profileIdFromRequest(request: HeaderRequest): string {
  const value = request.header("x-profile-id");
  if (!value) {
    throw new BadRequestException("Missing x-profile-id header");
  }
  return value;
}

export function userIdFromRequest(request: HeaderRequest): string {
  const value = request.header("x-user-id");
  if (!value) {
    throw new BadRequestException("Missing x-user-id header");
  }
  return value;
}
