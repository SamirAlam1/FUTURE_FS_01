const express = require('express');
const router  = express.Router();
const User       = require('../models/User');
const Project    = require('../models/Project');
const Skill      = require('../models/Skill');
const Education  = require('../models/Education');
const Blog       = require('../models/Blog');

// One-time seed route — DELETE this file after first use!
// GET /api/seed?secret=YOUR_SECRET_KEY
router.get('/', async (req, res) => {
  try {
    // Secret key check — security ke liye
    const secret = req.query.secret;
    if (secret !== process.env.SEED_SECRET) {
      return res.status(403).json({ success: false, message: 'Invalid secret key' });
    }

    // Check if admin already exists
    const existingUser = await User.findOne({});
    if (existingUser) {
      return res.json({
        success: false,
        message: 'Data already exists! Admin already created.',
        email: existingUser.email,
      });
    }

    // ── Admin User ───────────────────────────────────
    await User.create({
      name:     process.env.ADMIN_NAME     || 'Samir Alam',
      email:    process.env.ADMIN_EMAIL    || 'admin@portfolio.com',
      password: process.env.ADMIN_PASSWORD || 'Admin@1234',
      message: '🎉 Seed complete! Now perform admin login.',
});
    });

    // ── Skills ───────────────────────────────────────
    await Skill.insertMany([
      { name: 'React',        category: 'Frontend', level: 90, icon: '⚛️',  order: 1 },
      { name: 'JavaScript',   category: 'Frontend', level: 88, icon: '🟨',  order: 2 },
      { name: 'Tailwind CSS', category: 'Frontend', level: 85, icon: '🎨',  order: 3 },
      { name: 'Node.js',      category: 'Backend',  level: 85, icon: '🟢',  order: 1 },
      { name: 'Express.js',   category: 'Backend',  level: 82, icon: '🚂',  order: 2 },
      { name: 'MongoDB',      category: 'Database', level: 80, icon: '🍃',  order: 1 },
      { name: 'Git & GitHub', category: 'Tools',    level: 90, icon: '🐙',  order: 1 },
    ]);

    // ── Education ─────────────────────────────────────
    await Education.insertMany([
      {
        institution:  'Your College Name',
        degree:       "Bachelor's Degree",
        fieldOfStudy: 'Computer Science',
        startYear:    2021,
        endYear:      2025,
        grade:        'CGPA: 8.5',
        description:  'Focused on software engineering and web development.',
        order:        1,
      },
    ]);

    // ── Projects ─────────────────────────────────────
    await Project.insertMany([
      {
        title:       'Portfolio CMS',
        description: 'A CMS-driven developer portfolio with admin panel.',
        techStack:   ['React', 'Node.js', 'MongoDB', 'Tailwind CSS'],
        liveUrl:     'https://my-portfolio-psi-fawn-72.vercel.app',
        githubUrl:   'https://github.com/sa0409716',
        imageUrl:    'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=600',
        featured:    true,
        order:       1,
      },
    ]);

    // ── Blog ─────────────────────────────────────────
    await Blog.create({
      title:      'Getting Started with MERN Stack',
      excerpt:    'A comprehensive guide to build full-stack apps with MERN.',
      content:    '# MERN Stack\n\nMERN stands for MongoDB, Express, React, Node.js.\n\nHappy coding! 🚀',
      tags:       ['MERN', 'React', 'Node.js'],
      coverImage: 'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=600',
      published:  true,
      readTime:   5,
    });

    res.json({
      success:  true,
      message:  '🎉 Seed complete! Ab admin login karo.',
      email:    process.env.ADMIN_EMAIL    || 'admin@portfolio.com',
      password: process.env.ADMIN_PASSWORD || 'Admin@123456',
      warning:  '⚠️ IMPORTANT: Render pe SEED_SECRET environment variable hatao ya is route ko delete karo!',
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
