const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

async function checkData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const Booking = require('./models/Booking');
    const User = require('./models/User');
    const Admin = require('./models/Admin');
    const Hall = require('./models/Hall');

    // Counts
    const [bookingCount, userCount, adminCount, hallCount] = await Promise.all([
      Booking.countDocuments(),
      User.countDocuments(),
      Admin.countDocuments(),
      Hall.countDocuments()
    ]);

    console.log(`📊 Counts:`);
    console.log(`   Bookings: ${bookingCount}`);
    console.log(`   Users: ${userCount}`);
    console.log(`   Admins: ${adminCount}`);
    console.log(`   Halls: ${hallCount}`);

    if (bookingCount > 0) {
      // Sample bookings with status
      const sampleBookings = await Booking.find().limit(5).select('status date purpose createdAt');
      console.log(`\\n📋 Sample Bookings (status):`);
      sampleBookings.forEach((b, i) => {
        console.log(`   ${i+1}. ID:${b._id.toString().slice(-4)} status:'${b.status}' date:'${b.date}'`);
      });

      // Stats debug
      const stats = await Booking.aggregate([
        { $group: {
          _id: null,
          total: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] } },
          approved: { $sum: { $cond: [{ $eq: ['$status', 'Approved'] }, 1, 0] } },
          rejected: { $sum: { $cond: [{ $eq: ['$status', 'Rejected'] }, 1, 0] } }
        }}
      ]);
      console.log(`\\n📈 Exact Stats from Aggregation:`);
      console.log(stats[0] || {total:0, pending:0, approved:0, rejected:0});
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

checkData();

