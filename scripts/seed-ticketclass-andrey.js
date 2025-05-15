require('dotenv').config();
const mongoose = require('mongoose');

async function seedTicketClass() {
  await mongoose.connect(process.env.MONGODB_URI);

  const db = mongoose.connection.useDb('DrivingSchool_Admin');
  const ticketclasses = db.collection('ticketclasses');

  const doc = {
    locationId: new mongoose.Types.ObjectId('67a6e636e9412b52f8ea5786'),
    date: new Date('2025-05-08T00:00:00.000Z'),
    hour: '23:00',
    classId: new mongoose.Types.ObjectId('67cdb87ee13bb06c1001f1e1'),
    type: 'date',
    duration: 'standard',
    instructorId: new mongoose.Types.ObjectId('681c2566f4e0eb5564f85205'),
    students: [
      "67dda5c8448d12032b5d7a76",
      "67e34d9738d01e2999937e1d"
    ],
    __v: 2
  };

  const result = await ticketclasses.insertOne(doc);
  await mongoose.disconnect();
}

seedTicketClass().catch(console.error); 