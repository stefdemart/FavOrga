export type BookmarkSource = "chrome" | "edge" | "firefox" | "safari" | "opera" | "brave" | "comet" | "atlas" | "other";

export type LinkStatus = "unknown" | "ok" | "suspect" | "dead";

export interface Bookmark {
  id: string;
  title: string;
  url: string;
  category: string | null;
  folderPath: string[];
  source: BookmarkSource;
  isFavorite: boolean;
  createdAt: string;
  lastUpdatedAt: string;
  linkStatus?: LinkStatus;
  linkStatusCode?: number | null;
  linkStatusMessage?: string | null;
  countryCode?: string; // e.g. "fr", "us"
}

export enum AppView {
  DASHBOARD = "DASHBOARD",
  LIST = "LIST",
  VISUAL = "VISUAL",
  DUPLICATES = "DUPLICATES",
  LINK_CHECKER = "LINK_CHECKER",
  IMPORT = "IMPORT",
  EXPORT = "EXPORT",
  REVIEW = "REVIEW",
  SMART_COLLECTIONS = "SMART_COLLECTIONS"
}

export interface CategoryStats {
  name: string;
  count: number;
  color?: string;
}

export interface LinkCheckResult {
  id: string;
  url: string;
  status: "ok" | "suspect" | "dead";
  httpCode?: number | null;
  message?: string | null;
}

export interface SmartCollection {
  id: string;
  name: string;
  filterDescription: string;
  filterFn: (b: Bookmark) => boolean;
  icon?: any;
}

// Security & Account Types
export interface AuthUser {
  id: string;
  email: string;
  createdAt: string;
  isVerified: boolean;
}

export interface CloudSnapshotMeta {
  id: string;
  createdAt: string;
  bookmarkCount: number;
}

// Import Visualization Types
export interface ImportBatchInfo {
  source: BookmarkSource;
  count: number;
  timestamp: number;
}

export interface ImportSessionSummary {
  master: ImportBatchInfo | null;
  merges: ImportBatchInfo[];
}