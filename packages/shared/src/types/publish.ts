export interface PublishResponse {
  id: string;
  blockId: string;
  slug: string;
  showInFeed: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PublishedPageResponse {
  id: string;
  slug: string;
  title: string;
  icon?: string;
  content: unknown[];
  publishedAt: string;
}
