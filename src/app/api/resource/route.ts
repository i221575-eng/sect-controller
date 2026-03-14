import { connectDB } from "@/utils/db";
import { NextResponse } from "next/server";
import { Resource as ResourceModel } from "@/models/resource";
import { Policy } from "@/models/policy";
import { Network } from "@/models/network";
import { Connector } from "@/models/connector";
import { getServerSession } from "next-auth";
import { clientSideEditAccess } from "@/utils/userEditAccess";
import { options } from "../auth/[...nextauth]/options";

export const POST = async (req: Request) => {
    try {
        const session = await getServerSession(options);
        const role = session?.user?.role;
        if (!role || !clientSideEditAccess(role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { name, address, alias, networkId, tcpStatus, udpStatus, icmpStatus, tcpPorts, udpPorts } = await req.json();
        try {
            await connectDB();

            const network = await Network.findById(networkId);
            if (!network) {
                return NextResponse.json({ error: "Network not found" }, { status: 404 });
            }

            const connector = await Connector.findOne({ networkId });
            if (!connector) {
                return NextResponse.json({ error: "No Connector in Network" }, { status: 404 });
            }

            const resource = await ResourceModel.create({ name, address, alias, networkId, tcpStatus, udpStatus, icmpStatus, tcpPorts, udpPorts });
            resource.save();
            return NextResponse.json({ resource });
        }
        catch (err) {
            console.log(err);
            return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
        }
    }
    catch (e) {
        NextResponse.json({ error: "Invalid Request" }, { status: 400 });
    }
}

export const GET = async (req: Request) => {
    try {
        await connectDB();
        const resources = await ResourceModel.find({});
        return NextResponse.json({ resources });
    }
    catch (err) {
        console.log(err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export const PUT = async (req: Request) => {
    try {
        const session = await getServerSession(options);
        const role = session?.user?.role;
        if (!role || !clientSideEditAccess(role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { _id, name, address, alias, networkId, tcpStatus, udpStatus, icmpStatus, tcpPorts, udpPorts } = await req.json();
        if (!_id) {
            return NextResponse.json({ error: "Invalid Request" }, { status: 400 });
        }
        try {
            await connectDB();
            const _resource = await ResourceModel.findById(_id);

            if (!_resource) {
                return NextResponse.json({ error: "Resource not found" }, { status: 404 });
            }
            if (_resource.networkId !== networkId) {
                return NextResponse.json({ error: "Network cannot be changed" }, { status: 400 });
            }

            const resource = await ResourceModel.findByIdAndUpdate(_id, { name, address, alias, networkId, tcpStatus, udpStatus, icmpStatus, tcpPorts, udpPorts });
            return NextResponse.json({ resource });
        }
        catch (err) {
            console.log(err);
            return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
        }
    }
    catch (err) {
        console.log(err);
        return NextResponse.json({ error: "Invalid Request" }, { status: 400 });
    }
}

export const DELETE = async (req: Request) => {
    try {
        const session = await getServerSession(options);
        const role = session?.user?.role;
        if (!role || !clientSideEditAccess(role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { _id } = await req.json();
        if (!_id) {
            return NextResponse.json({ error: "Invalid Request" }, { status: 400 });
        }
        try {
            await connectDB();

            const _resource = await ResourceModel.findById(_id);
            if (!_resource) {
                return NextResponse.json({ error: "Resource not found" }, { status: 404 });
            }

            // Remove resource from all policies
            await Policy.updateMany({ resourceIds: _id }, { $pull: { resourceIds: _id } });

            // Remove resource
            const __resource = await ResourceModel.deleteOne({ _id });
            return NextResponse.json({ resource: __resource });
        }
        catch (err) {
            console.log(err);
            return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
        }
    }
    catch (err) {
        console.log(err);
        return NextResponse.json({ error: "Invalid Request" }, { status: 400 });
    }
}