import { NextResponse } from "next/server";
import { connectDB } from "@/utils/db";
import { options } from "@/app/api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth/next"
import { Group } from "@/models/group";
import { User } from "@/models/user";
import { Policy } from "@/models/policy";
import { clientSideEditAccess } from "@/utils/userEditAccess";

export const POST = async (req: Request) => {
    try {
        const session = await getServerSession(options);
        const role = session?.user?.role;
        if (!role || !clientSideEditAccess(role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { name } = await req.json();
        try {
            const session = await getServerSession(options);
            const ownRole = session?.user?.role;
            if (!ownRole || (ownRole !== "admin" && ownRole !== "superadmin")) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }
            await connectDB();

            const _group = await Group.findOne({ name });
            if (_group) {
                return NextResponse.json({ error: "Group already exists" }, { status: 409 });   
            }
            const group = await Group.create({ name });
            group.save();
            return NextResponse.json({ group });
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
        const groups = await Group.find({});
        return NextResponse.json({ groups });
    }
    catch (err) {
        return NextResponse.json({ error: "Invalid Request" }, { status: 400 });
    }
}

export const PUT = async (req: Request) => {
    try {
        const { _id, name } = await req.json();
        try {
            const session = await getServerSession(options);
            const ownRole = session?.user?.role;
            if (!ownRole || !clientSideEditAccess(ownRole)) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }
            await connectDB();

            const _group = await Group.findById(_id);
            if (!_group) {
                return NextResponse.json({ error: "Group not found" }, { status: 404 });
            }
            _group.name = name;
            _group.save();
            return NextResponse.json({ group: _group });
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
        const { _id } = await req.json();
        try {
            const session = await getServerSession(options);
            const ownRole = session?.user?.role;
            if (!ownRole || !clientSideEditAccess(ownRole)) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }
            await connectDB();

            const _group = await Group.findById(_id);
            if (!_group) {
                return NextResponse.json({ error: "Group not found" }, { status: 404 });
            }

            // Remove group from all users
            await User.updateMany({}, { $pull: { groups: _id } });

            // Remove group from all policies
            await Policy.updateMany({type: "group"}, { $pull: { ids: _id } });

            const __group = await Group.findByIdAndDelete(_id);
            return NextResponse.json({ group: __group });
        }
        catch (err) {
            return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
        }
    }
    catch (err) {
        return NextResponse.json({ error: "Invalid Request" }, { status: 400 });
    }
}
