export type User = {
    _id: string;
    name: string;
    email: string;
    role: string; // "admin" | "user"
    image: string; // URL to image
    groups: string[]; // Array of group ids
    status: boolean;
    ip: string;
}