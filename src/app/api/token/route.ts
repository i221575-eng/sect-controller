import { getServerSession } from 'next-auth';
import { options } from '@/app/api/auth/[...nextauth]/options';
import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { User } from "@/models/user";
import jwt from 'jsonwebtoken';

export const GET = async (req: Request) => {
    const session = await getServerSession(options);
    const userinfo = session?.user;

    if (!userinfo || userinfo.role === "unauthorized") {
        return NextResponse.redirect('/api/auth/signin');
    }

    const email = userinfo.email;
    const user_id = await User.findOne({ email: email }, '_id');

    const { searchParams } = new URL(req.url);
    const challenge = searchParams.get('challenge');

    const ACCESS_EXPIRY = parseInt(process.env.ACCESS_EXPIRY || '0');
    const REFRESH_EXPIRY = parseInt(process.env.REFRESH_EXPIRY || '0');

    let access_expiry = ACCESS_EXPIRY * 24 * 60 * 60;
    let refresh_expiry = REFRESH_EXPIRY * 24 * 60 * 60;

    // Generate a random refresh token string
    const refreshToken = crypto.randomBytes(64).toString('hex');
    const accesstoken = crypto.randomBytes(64).toString('hex');
   
     const accessTokenObj = {
        id: user_id._id,
        challenge: challenge,
        accessToken: accesstoken,
    };

    const refreshTokenObj ={
        refreshToken: refreshToken,
    }

    const privateKey = process.env.PRIVATE_KEY ? Buffer.from(process.env.PRIVATE_KEY,'base64').toString('ascii') : '';
    const accessTokenSigned = jwt.sign(accessTokenObj, privateKey, { algorithm: 'RS256', expiresIn: access_expiry }); // Set expiration time
    const refreshTokenSigned = jwt.sign(refreshTokenObj, privateKey, { algorithm: 'RS256', expiresIn: refresh_expiry }); // Set expiration time

    await User.findOneAndUpdate({ email: email }, { accessToken: accessTokenSigned, refreshToken: refreshTokenSigned });

    return NextResponse.json({ accessToken: accessTokenSigned, refreshToken: refreshTokenSigned });
}