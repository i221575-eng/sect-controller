import { User } from "@/models/user";
import { NextResponse } from "next/server";
import { connectDB } from "@/utils/db";
import { options } from "@/app/api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth/next"
import { checkUserEditAccess, clientSideEditAccess } from "@/utils/userEditAccess";
import { Policy } from "@/models/policy";
import { deleteIP, getIP } from "@/utils/ipPool";


export const POST = async (req: Request) => {
    try {
        const session = await getServerSession(options);
        const role = session?.user?.role;
        if (!role || !clientSideEditAccess(role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { email } = await req.json();
        try {
            await connectDB();
            const _user = await User.findOne({ email });
            if (_user) {
                return NextResponse.json({ error: "User already exists" }, { status: 409 });   
            }
            const ip = await getIP();
            const user = await User.create({ email, role: "member", ip });
            user.save();
            return NextResponse.json({ user });
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
        const users = await User.find({}, {accessToken: false, refreshToken: false});
        return NextResponse.json({ users });
    }
    catch (err) {
        return NextResponse.json({ error: "Invalid Request" }, { status: 400 });
    }
}

export const PUT = async (req: Request) => {
    try {
        const session = await getServerSession(options);
        const ownRole = session?.user?.role || "";
        if (ownRole === "" || !clientSideEditAccess(ownRole)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { email, role, name, status, groups } = await req.json();
        try {
            await connectDB();
            const _user = await User.findOne({ email });
            if (!_user) {
                return NextResponse.json({ error: "User not found" }, { status: 404 });
            }
            const previousRole = _user.role;
            if (!checkUserEditAccess(ownRole, previousRole)) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }

            const user = await User.findOneAndUpdate({ email }, { role, name, status, groups });
            if (user) {
                return NextResponse.json({ user });
            }
            else {
                return NextResponse.json({ error: "User not found" }, { status: 404 });
            }
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
        const ownRole = session?.user?.role || "";
        if (ownRole === "" || !clientSideEditAccess(ownRole)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { email } = await req.json();
        try {
            await connectDB();
            const _user = await User.findOne({ email });
            if (!_user) {
                return NextResponse.json({ error: "User not found" }, { status: 404 });
            }
            const previousRole = _user.role;
            if (!checkUserEditAccess(ownRole, previousRole)) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }

            // Remove user from all policies
            await Policy.updateMany({}, { $pull: { users: _user._id } });

            const user = await User.findOneAndDelete({ email });
            let ip: any;
            if ('ip' in user) {
                ip = user.ip;
                await deleteIP(ip);
            }
            if (user) {
                return NextResponse.json({ user });
            }
            else {
                return NextResponse.json({ error: "User not found" }, { status: 404 });
            }
        }
        catch (err) {
            return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
        }
    }
    catch (err) {
        return NextResponse.json({ error: "Invalid Request" }, { status: 400 });
    }
}