import { Blog } from '#models/blogModel.js';

export const BLOG_REPOSITORY = {
    create: async (blogData) => {
        const blog = new Blog(blogData);
        return await blog.save();
    },

    findById: async (id) => {
        return await Blog.findById(id).populate('authorId', 'fullName avatar').lean();
    },

    findBySlug: async (slug) => {
        return await Blog.findOne({ slug }).populate('authorId', 'fullName avatar').lean();
    },

    updateById: async (id, updateData) => {
        return await Blog.findByIdAndUpdate(id, updateData, { new: true }).lean();
    },

    deleteById: async (id) => {
        return await Blog.findByIdAndDelete(id);
    },

    paginatePlatform: async (options = {}) => {
        const { page = 1, limit = 10, search } = options;
        const query = { shopId: null, status: 'PUBLISHED' };
        if (search) query.title = { $regex: search, $options: 'i' };
        
        return await Blog.paginate(query, { 
            page, 
            limit, 
            sort: { createdAt: -1 },
            populate: { path: 'authorId', select: 'fullName avatar' }
        });
    },

    paginateShop: async (shopId, options = {}) => {
        const { page = 1, limit = 10, status = 'PUBLISHED' } = options;
        const query = { shopId };
        if (status) query.status = status;

        return await Blog.paginate(query, { 
            page, 
            limit, 
            sort: { createdAt: -1 },
            populate: { path: 'authorId', select: 'fullName avatar' }
        });
    },

    incrementView: async (id) => {
        return await Blog.findByIdAndUpdate(id, { $inc: { viewCount: 1 } }, { new: true });
    }
};
