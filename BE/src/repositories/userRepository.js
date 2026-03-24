import { User } from '#models/userModel.js'

export const USER_REPOSITORY = {
    findByEmail: async (email) => {
        return await User.findOne({ email, isDeleted: false }).lean()
    },

    create: async (userData) => {
        const newUser = new User(userData)
        return await newUser.save()
    },

    findById: async (id) => {
        return await User.findOne({ _id: id, isDeleted: false }).select('-password').lean()
    },

    update: async (userId, updateData) => {
        const user = await User.findOne({ _id: userId, isDeleted: false });
        if (!user) return null;
        
        Object.assign(user, updateData);
        const updatedUser = await user.save();
        
        const result = updatedUser.toObject();
        delete result.password;
        return result;
    },

    deleteById: async (id) => {
        return await User.findByIdAndUpdate(id, { isDeleted: true }, { new: true }).select('-password').lean()
    }
}