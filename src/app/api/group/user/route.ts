import { User } from "@/models/user";
import { Group } from "@/models/group";
import { NextResponse } from "next/server";
import { connectDB } from "@/utils/db";
import { options } from "@/app/api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth/next"
import { clientSideEditAccess } from "@/utils/userEditAccess";

export const DELETE = async (req: Request) => {
    try {
        const session = await getServerSession(options);
        const ownRole = session?.user?.role;
        if (!ownRole || !clientSideEditAccess(ownRole)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        try {
            const { group, user } = await req.json();
            await connectDB();
            const _group = await Group.findById(group);
            if (!_group) {
                return NextResponse.json({ error: "Group not found" }, { status: 404 });
            }

            const _user = await User.findById(user);
            if (!_user) {
                return NextResponse.json({ error: "User not found" }, { status: 404 });
            }

            await User.updateOne({ _id: user }, { $pull: { groups: group } });
            return NextResponse.json({ message: "User removed from group" });
        }
        catch (err) {
            return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
        }
    }
    catch (err) {
        return NextResponse.json({ error: "Invalid Request" }, { status: 400 });
    }
}