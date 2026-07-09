export interface Blockout {
    id: string;
    createdAt: Date | null;
    updatedAt: Date | null;
    orgId: string | null;
    userId: string;
    startDate: Date;
    endDate: Date;
    reason: string | null;
}