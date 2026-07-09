export interface Song {
    id: string;
    createdAt: Date | null;
    updatedAt: Date | null;
    title: string;
    orgId: string | null;
    createdBy: string;
    artist: string | null;
    key: string | null;
    youtubeUrl: string | null;
}