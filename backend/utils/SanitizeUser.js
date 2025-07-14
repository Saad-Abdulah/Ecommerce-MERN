exports.sanitizeUser=(user)=>{
    return {
        _id: user._id,
        email: user.email,
        name: user.name,
        profileImage: user.profileImage,
        isVerified: user.isVerified,
        isAdmin: user.isAdmin
    }
}