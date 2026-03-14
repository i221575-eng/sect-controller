import { connectDB } from "@/utils/db";
import { NextResponse } from "next/server";
import { Network as NetworkModel } from "@/models/network";
import { Resource as ResourceModel } from "@/models/resource";
import { Connector as ConnectorModel } from "@/models/connector";
import { getServerSession } from "next-auth";
import { options } from "../auth/[...nextauth]/options";
import { clientSideEditAccess } from "@/utils/userEditAccess";

export const POST = async (req: Request) => {
    try {
        const session = await getServerSession(options);
        const role = session?.user?.role;
        if (!role || !clientSideEditAccess(role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { name, location } = await req.json();
        if (!name || !location) {
            return NextResponse.json({ error: "Invalid Request" }, { status: 400 });
        }
        try {
            await connectDB();
            const network = await NetworkModel.create({ name, location });
            network.save();
            return NextResponse.json({ network });
        }
        catch (err) {
            return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
        }
    }
    catch (err) {
        return NextResponse.json({ error: "Invalid Request" }, { status: 400 });
    }
}

export const GET = async (req: Request) => {
    try {
        await connectDB();
        const networks = await NetworkModel.find({});
        return NextResponse.json({ networks });
    }
    catch (err) {
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

        const { _id, name, location } = await req.json();
        if (!_id || !name || !location) {
            return NextResponse.json({ error: "Invalid Request" }, { status: 400 });
        }
        try {
            await connectDB();
            const network = await NetworkModel.findByIdAndUpdate(_id, { name, location });
            if (!network) {
                return NextResponse.json({ error: "Network not found" }, { status: 404 });
            }
            return NextResponse.json({ network });
        }
        catch (err) {
            return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
        }
    }
    catch (err) {
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
            const resources = await ResourceModel.find({ networkId: _id });
            const connectors = await ConnectorModel.find({ networkId: _id });

            if (resources.length > 0 || connectors.length > 0) {
                return NextResponse.json({ error: "Network has resources or connectors" }, { status: 400 });
            }

            await connectDB();
            const network = await NetworkModel.findByIdAndDelete(_id);
            if (!network) {
                return NextResponse.json({ error: "Network not found" }, { status: 404 });
            }
            return NextResponse.json({ network });
        }
        catch (err) {
            return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
        }
    }
    catch (err) {
        return NextResponse.json({ error: "Invalid Request" }, { status: 400 });
    }
}