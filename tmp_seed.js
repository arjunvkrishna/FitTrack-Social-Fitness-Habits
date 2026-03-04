const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fittrack';

const ExerciseSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    category: { type: String, enum: ['STRENGTH', 'CARDIO', 'FLEXIBILITY', 'OTHER'], required: true },
    instructions: { type: String },
    targetMuscleGroup: { type: String },
}, { timestamps: true });

const Exercise = mongoose.model('Exercise', ExerciseSchema);

const exercises = [
    { name: 'Bench Press', category: 'STRENGTH', targetMuscleGroup: 'Chest' },
    { name: 'Squat', category: 'STRENGTH', targetMuscleGroup: 'Legs' },
    { name: 'Deadlift', category: 'STRENGTH', targetMuscleGroup: 'Back/Legs' },
    { name: 'Running', category: 'CARDIO', targetMuscleGroup: 'Full Body' },
    { name: 'Cycling', category: 'CARDIO', targetMuscleGroup: 'Legs' },
    { name: 'Yoga', category: 'FLEXIBILITY', targetMuscleGroup: 'Full Body' },
];

async function seed() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB for seeding');

        for (const ex of exercises) {
            await Exercise.findOneAndUpdate(
                { name: ex.name },
                { $set: ex },
                { upsert: true }
            );
            console.log(`Seeded: ${ex.name}`);
        }

        console.log('Seeding completed');
        process.exit(0);
    } catch (err) {
        console.error('Seeding error:', err);
        process.exit(1);
    }
}

seed();
