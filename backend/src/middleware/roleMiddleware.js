export const requireRole = (role) => {
    return (req, res, next) => {
        // Support role aliases: 'teacher' -> 'faculty'
        const roleMap = {
            'teacher': 'faculty',
        };
        
        const expectedRole = roleMap[role] || role;
        const userRole = roleMap[req.user.role] || req.user.role;
        
        if(userRole !== expectedRole){
            return res.status(403).json({
                error: `Access Denied. ${expectedRole} only`,
            })
        }
        return next();
    };
};

// Support multiple roles
export const requireAnyRole = (roles) => {
    return (req, res, next) => {
        const roleMap = {
            'teacher': 'faculty',
        };
        
        const userRole = roleMap[req.user.role] || req.user.role;
        const allowedRoles = roles.map(r => roleMap[r] || r);
        
        if(!allowedRoles.includes(userRole)){
            return res.status(403).json({
                error: `Access Denied. Required roles: ${allowedRoles.join(', ')}`,
            })
        }
        return next();
    };
};  