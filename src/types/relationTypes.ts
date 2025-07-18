export const relationTypes = ["MANAGER", "LEAD", "COLLEAGUE"] as const;
export type RelationType = typeof relationTypes[number];
