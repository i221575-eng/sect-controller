export type Resource = {
    _id: string;
    name: string; 
    address: string; // IP/Subnet/FQDN
    alias: string; 
    networkId: string; 
    tcpStatus: string; // "All Ports" | "Custom" | "Blocked"
    udpStatus: string; // "All Ports" | "Custom" | "Blocked"
    icmpStatus: string; // "Allow" | "Block"
    tcpPorts: string[];
    udpPorts: string[]; 
}