const accessLevels: any = {
    member: 1,
    manager: 2,
    admin: 3,
    superadmin: 4,
};

export const checkUserEditAccess = (activeUserRole: string, otherUserRole: string) => {
    if (accessLevels[activeUserRole] <= accessLevels[otherUserRole]) {
        return false;
    }
    return true;
}

export const clientSideEditAccess = (activeUserRole: string) => {
    if (accessLevels[activeUserRole] < accessLevels['admin']) {
        return false;
    }
    return true;
}