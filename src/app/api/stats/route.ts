import { NextResponse } from "next/server";
import { connectDB } from "@/utils/db";
import { Connector } from "@/models/connector";
import { User } from "@/models/user";
import { Resource as ResourceModel } from "@/models/resource";
import { Policy as PolicyModel } from "@/models/policy";
import { Network as NetworkModel } from "@/models/network";
import { Group } from "@/models/group";
import { options } from "@/app/api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth/next"

export const GET = async (req: Request) => {
    try {
        
        const session = await getServerSession(options);
        const ownRole = session?.user?.role;
        if (!ownRole) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        
        await connectDB();
        const stats  = {
            userRole: ownRole,    

            noOConnectors: await Connector.countDocuments({}),
            enabledConnectors: await Connector.countDocuments({ status: true }),

            users: await User.countDocuments({role: "member"}),
            admins: await User.countDocuments({ role: "admin"}),
            managers: await User.countDocuments({ role: "manager"}),

            noofResources: await ResourceModel.countDocuments({}),
            
            noOfGroupPolicies: await PolicyModel.countDocuments({ type: "group" }),
            noOfUserPolicies: await PolicyModel.countDocuments({ type: "user" }),
            
            noOfNetworks: await NetworkModel.countDocuments({}),
            awsNetworks: await NetworkModel.countDocuments({ location: "AWS" }),
            OnpremNetworks: await NetworkModel.countDocuments({ location: "On-premise" }),
 
            noOfGroups: await Group.countDocuments({}),
        };

        return NextResponse.json({ stats });
    }
    catch (err) {
        return NextResponse.json({ error: "Invalid Request" }, { status: 400 });
    }
}