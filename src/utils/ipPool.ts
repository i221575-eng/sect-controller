import { connectDB } from "@/utils/db";
import { NextResponse } from "next/server";
import { ipPool } from "@/models/ipPool";

function incrementIp(ip: string) {
    const parts = ip.split(".");
    let i = parts.length;
    while (i--) {
        if (parts[i] === "254") {
            parts[i] = "1";
        } else {
            parts[i] = (parseInt(parts[i]) + 1).toString();
            break;
        }
    }
    return parts.join(".");
}

export async function getIP() {
    await connectDB();
    let ipArray: {
        currentIp: string;
        availableIps: string[];
    }[] = await ipPool.find();
    if (ipArray.length === 0) {
        const ip = await ipPool.create({});
        ip.save();
        ipArray = await ipPool.find();
    }
    const ip = ipArray[0];
    if (ip.availableIps.length === 0) {
        const currentIp = ip.currentIp;
        const newIp = incrementIp(currentIp);
        await ipPool.findOneAndUpdate({}, { $set: { currentIp: newIp } });
        return currentIp;
    }
    else {
        const newIp = ip.availableIps.shift();
        await ipPool.findOneAndUpdate({}, { $set: { availableIps: ip.availableIps } });
        return newIp;
    }
}

export async function deleteIP(ip: string) {
    await connectDB();
    const ipArray: {
        currentIp: string;
        availableIps: string[];
    }[] = await ipPool.find();
    if (ipArray.length === 0) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
    const _ip = ipArray[0];
    _ip.availableIps.push(ip);
    await ipPool.findOneAndUpdate({}, { $set: { availableIps: _ip.availableIps } });
    return ip;
}