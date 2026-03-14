export type Policy = {
    _id: string;
    name: string;
    description: string;
    type: string; // "user" | "group" 
    ids: string[]; // Array of user or group ids
    resourceIds: string[]; // Array of resource ids
}