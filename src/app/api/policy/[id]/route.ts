import { NextResponse } from "next/server";
import { connectDB } from "@/utils/db";
import { options } from "@/app/api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth/next"
import { Policy as PolicyModel } from "@/models/policy";
import { clientSideEditAccess } from "@/utils/userEditAccess";

export const PUT = async (req: Request, { params } : { params: { id: string } }) => {
    try {
        const session = await getServerSession(options);
        const ownRole = session?.user?.role;
        if (!ownRole || !clientSideEditAccess(ownRole)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        try {
            const policyId = params.id;
            const { name, description, type, ids, resourceIds } = await req.json();
            await connectDB();
            
            const policy = await PolicyModel.findById(policyId);
            if (!policy) {
                return NextResponse.json({ error: "Policy not found" }, { status: 404 });
            }
            policy.name = name;
            policy.description = description;
            policy.type = type;
            policy.ids = ids;
            policy.resourceIds = resourceIds;
            policy.save();

            return NextResponse.json({ policy });
        }
        catch (err) {
            return NextResponse.json({ error: "Invalid Request" }, { status: 400 });
        }
    }
    catch (err) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
}

export const DELETE = async (req: Request, { params } : { params: { id: string } }) => {
    try {
        const session = await getServerSession(options);
        const ownRole = session?.user?.role;
        if (!ownRole || !clientSideEditAccess(ownRole)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        try {
            const policyId = params.id;
            await connectDB();
            const policy = await PolicyModel.deleteOne({ _id: policyId });
            if (!policy) {
                return NextResponse.json({ error: "Policy not found" }, { status: 404 });
            }
            
            return NextResponse.json({ policy });
        }
        catch (err) {
            return NextResponse.json({ error: "Invalid Request" }, { status: 400 });
        }
    }
    catch (err) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
}