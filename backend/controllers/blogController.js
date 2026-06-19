// const Blog = require('../models/Blog');

// // @desc    Get all published blogs (public) or all blogs (admin)
// // @route   GET /api/blogs
// // @access  Public
// const getBlogs = async (req, res, next) => {
//   try {
//     // If request comes from admin (has auth header), show all. Otherwise show only published.
//     const filter = req.headers.authorization ? {} : { published: true };
//     const blogs = await Blog.find(filter).sort({ createdAt: -1 });
//     res.status(200).json({ success: true, count: blogs.length, data: blogs });
//   } catch (error) { next(error); }
// };

// const getBlog = async (req, res, next) => {
//   try {
//     // Find by slug or ID
//     const query = req.params.id.match(/^[0-9a-fA-F]{24}$/)
//       ? { _id: req.params.id }
//       : { slug: req.params.id };
//     const blog = await Blog.findOne(query);
//     if (!blog) return res.status(404).json({ success: false, message: 'Blog post not found' });
//     res.status(200).json({ success: true, data: blog });
//   } catch (error) { next(error); }
// };

// const createBlog = async (req, res, next) => {
//   try {
//     const blog = await Blog.create(req.body);
//     res.status(201).json({ success: true, data: blog });
//   } catch (error) { next(error); }
// };

// const updateBlog = async (req, res, next) => {
//   try {
//     const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
//     if (!blog) return res.status(404).json({ success: false, message: 'Blog post not found' });
//     res.status(200).json({ success: true, data: blog });
//   } catch (error) { next(error); }
// };

// const deleteBlog = async (req, res, next) => {
//   try {
//     const blog = await Blog.findByIdAndDelete(req.params.id);
//     if (!blog) return res.status(404).json({ success: false, message: 'Blog post not found' });
//     res.status(200).json({ success: true, message: 'Blog post deleted successfully' });
//   } catch (error) { next(error); }
// };

// module.exports = { getBlogs, getBlog, createBlog, updateBlog, deleteBlog };
