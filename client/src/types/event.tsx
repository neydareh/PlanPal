export interface Event {
    date: Date;
    id: string;
    createdAt: Date | null;
    updatedAt: Date | null;
    title: string;
    orgId: string | null;
    description: string | null;
    createdBy: string;
}