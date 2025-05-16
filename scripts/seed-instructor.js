require('dotenv').config();
const mongoose = require('mongoose');

const InstructorSchema = new mongoose.Schema({
  name: String,
  photo: String,
  certifications: String,
  experience: String,
  schedule: [
    {
      date: String,
      slots: [
        {
          start: String,
          end: String,
          status: String, // 'free', 'scheduled', 'cancelled'
          booked: { type: Boolean, default: false },
          studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
        }
      ]
    }
  ],
  createdAt: Date,
  updatedAt: Date
});

const Instructor = mongoose.model('Instructor', InstructorSchema);

async function createInstructor() {
  await mongoose.connect(process.env.MONGODB_URI);

  // Generar 9 días de schedule alternando status
  const statuses = ['free', 'scheduled', 'cancelled'];
  const schedule = [];
  for (let i = 1; i <= 9; i++) {
    const day = (i < 10 ? `0${i}` : i);
    schedule.push({
      date: `2025-02-${day}`,
      slots: [
        { 
          start: '08:00', 
          end: '10:00', 
          status: statuses[(i - 1) % 3],
          booked: false,
          studentId: null
        }
      ]
    });
  }

  const instructor = new Instructor({
    name: 'Andrey',
    photo: 'https://res.cloudinary.com/dzi2p0pqa/image/upload/v1738972274/s8wj7eogwjigjkwt5chq.png',
    certifications: '',
    experience: '',
    schedule,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  await instructor.save();
  await mongoose.disconnect();
}

createInstructor().catch(console.error); 