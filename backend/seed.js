const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config({ path: path.join(__dirname, '../.env') });
require('dotenv').config();

const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Event = require('./models/Event');
const EventRegistration = require('./models/EventRegistration');

const seedEvents = async () => {
  try {
    await connectDB();
    await User.deleteMany({ email: { $in: ['admin@example.com', 'user@example.com'] } });
    await Event.deleteMany({});
    await EventRegistration.deleteMany({});

    const users = await User.create([
      { name: 'Event Organizer', email: 'admin@example.com', password: 'Password@123', role: 'admin' },
      { name: 'Sarah Participant', email: 'user@example.com', password: 'Password@123', role: 'user' }
    ]);

    const events = await Event.create([
      {
        title: 'Tech Symposium 2026',
        description: 'Annual technology conference with keynote speakers and startup showcases.',
        date: new Date('2026-10-15'),
        time: '09:30 AM',
        venue: 'Grand University Auditorium',
        organizer: 'Computer Science Society',
        capacity: 100
      },
      {
        title: 'Full-Stack Web Development Bootcamp',
        description: 'Hands-on coding workshop on Node.js, Express, MongoDB, and modern web architecture.',
        date: new Date('2026-10-22'),
        time: '02:00 PM',
        venue: 'Engineering Hall Lab 4',
        organizer: 'Code Club',
        capacity: 35
      },
      {
        title: 'Annual Hackathon 2026',
        description: '24-hour sprint to build impactful full-stack solutions for real-world challenges.',
        date: new Date('2026-11-05'),
        time: '10:00 AM',
        venue: 'Innovation Hub',
        organizer: 'Student Council',
        capacity: 50
      }
    ]);

    // Initial registration: Sarah for Event 1
    await EventRegistration.create({
      userId: users[1]._id,
      eventId: events[0]._id
    });

    console.log('Seeded demo events and accounts successfully!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedEvents();
