/// <reference types="next" />
/// <reference types="next/types/global" />

declare module "next/types" {
  interface RouteContext {
    params: Record<string, string>;
  }
} 