import { connectDB } from "@/utils/db";
import { getIP, deleteIP } from "@/utils/ipPool";
import { NextResponse } from "next/server";
import { Connector } from "@/models/connector";
import { Resource } from "@/models/resource";
import { getServerSession } from "next-auth";
import { options } from "../auth/[...nextauth]/options";
import { clientSideEditAccess } from "@/utils/userEditAccess";
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(options);
    const role = session?.user?.role;
    if (!role || !clientSideEditAccess(role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {name, networkId, status} = await req.json();
    const ip = await getIP();
    await connectDB();
    const connector = await Connector.create({name, networkId,status, ip});
    connector.save();

    const connector_id = await Connector.findOne({ name: name }, '_id');
    const ACCESS_EXPIRY = parseInt(process.env.ACCESS_EXPIRY || '0');
    const REFRESH_EXPIRY = parseInt(process.env.REFRESH_EXPIRY || '0');

    let access_expiry = ACCESS_EXPIRY * 24 * 60 * 60;
    let refresh_expiry = REFRESH_EXPIRY * 24 * 60 * 60;

    // Generate a random refresh token string
    const refreshToken = crypto.randomBytes(64).toString('hex');
    const accesstoken = crypto.randomBytes(64).toString('hex');
   
     const accessTokenObj = {
        id: connector_id._id,
        ip: ip,
        accessToken: accesstoken,
    };

    const refreshTokenObj ={
        connectorId: connector_id._id,
        refreshToken: refreshToken,
    }
    const privateKey = process.env.PRIVATE_KEY ? Buffer.from(process.env.PRIVATE_KEY,'base64').toString('ascii') : '';
    const accessTokenSigned = jwt.sign(accessTokenObj, privateKey, { algorithm: 'RS256', expiresIn: access_expiry }); // Set expiration time
    const refreshTokenSigned = jwt.sign(refreshTokenObj, privateKey, { algorithm: 'RS256', expiresIn: refresh_expiry }); // Set expiration time
    const relayAddr = process.env.RELAY_ADDR || '192.168.121.101:9089' ;
    const relayport = process.env.RELAY_PORT || '9090';
    const socketAddr = process.env.SOCKET_ADDR || 'https://m6sfjth8-5001.inc1.devtunnels.ms';

    await Connector.findOneAndUpdate({ _id: connector_id }, { accessToken: accessTokenSigned, refreshToken: refreshTokenSigned })
    return NextResponse.json({id:connector_id, ip:ip, accessToken: accessTokenSigned, refreshToken: refreshTokenSigned, socketAddr: socketAddr, relayAddr: relayAddr, relayport: relayport});
  }
    catch (error) {
        return NextResponse.json({error: "Invalid Request", status: 400});
    }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(options);
    const role = session?.user?.role;
    if (!role || !clientSideEditAccess(role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {_id, name, networkId, status} = await req.json();
    await connectDB();
    const connector = await Connector.findByIdAndUpdate(_id, {name, networkId, status});

    if (!connector) {
      return NextResponse.json({error: "Connector not found"}, {status: 404});
    }
    return NextResponse.json({connector});
    }
    catch (error) {
        return NextResponse.json({error: "Invalid Request"}, {status: 400});
    }  
}

export const GET = async (req: Request) => {
    try {
        await connectDB();
        const connectors = await Connector.find({});
        return NextResponse.json({ connectors });
    }
    catch (err) {
        console.log(err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
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
        console.log(_id);
        try {
            await connectDB();

            const _connector = await Connector.findById(_id);
            if (!_connector) {
                return NextResponse.json({ error: "Connector not found" }, { status: 404 });
            }

            const numberOfConnectorsWithInNetwork = await Connector.countDocuments({ networkId: _connector.networkId });
            const numberOfResourcesWithInNetwork = await Resource.countDocuments({ networkId: _connector.networkId });

            if (numberOfResourcesWithInNetwork && numberOfConnectorsWithInNetwork === 1) {
                return NextResponse.json({ error: "Connector cannot be deleted as it is the last connector in the network" }, { status: 400 });
            }

            const connector = await Connector.findByIdAndDelete(_id);
            
            let ip: any;
            if ('ip' in connector) {
                ip = connector.ip;
                await deleteIP(ip);
            }
            return NextResponse.json({ connector });
        }
        catch (err) {
            return NextResponse.json({ error: "Connector not found" }, { status: 404 });
        }
    }
    catch (err) {
        return NextResponse.json({ error: "Invalid Request" }, { status: 400 });
    }
}
