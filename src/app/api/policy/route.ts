import { NextResponse } from "next/server";
import { connectDB } from "@/utils/db";
import { options } from "@/app/api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth/next"
import { Policy as PolicyModel } from "@/models/policy";
import { clientSideEditAccess } from "@/utils/userEditAccess";

export const POST = async (req: Request) => {
    try {
        const session = await getServerSession(options);
        const ownRole = session?.user?.role;
        if (!ownRole || !clientSideEditAccess(ownRole)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        try {
            const { name, description, type, ids, resourceIds } = await req.json();
            try {
                await connectDB();
                const policy = await PolicyModel.create({ name, description, type, ids, resourceIds });
                policy.save();
                return NextResponse.json({ policy });
            }
            catch (err) {
                return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
            }
        }
        catch (err) {
            return NextResponse.json({ error: "Invalid Request" }, { status: 400 });
        }
    }
    catch (err) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
}

export const GET = async (req: Request) => {
    try {
        await connectDB();
        const policies = await PolicyModel.find();
        return NextResponse.json({ policies });
    }
    catch (err) {
        return NextResponse.json({ error: "Invalid Request" }, { status: 400 });
    }
}
