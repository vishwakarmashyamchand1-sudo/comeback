require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const Exercise = require('./models/Exercise');

const rawData = fs.readFileSync('C:/Users/alpha/Desktop/FitCoach/exercises-dataset/data/transformed_exercises.json', 'utf8');
const exercises = JSON.parse(rawData);

// Enums from models/Exercise.js
const VALID_MUSCLE_GROUPS = ['Chest','Back','Shoulders','Biceps','Triceps','Legs_Quads','Legs_Hamstrings','Glutes','Calves','Core','Forearms'];
const VALID_EQUIPMENT = ['barbell','dumbbell','cable','body weight','leverage machine','smith machine','kettlebell','band','resistance band','weighted','other'];

function mapMuscleGroup(mg) {
    const raw = mg.toLowerCase();
    if (['hip flexors', 'obliques', 'abdominals', 'core'].includes(raw)) return 'Core';
    if (['hamstrings'].includes(raw)) return 'Legs_Hamstrings';
    if (['quadriceps'].includes(raw)) return 'Legs_Quads';
    if (['calves', 'soleus', 'ankles', 'ankle stabilizers'].includes(raw)) return 'Calves';
    if (['glutes'].includes(raw)) return 'Glutes';
    if (['lower back', 'upper back', 'latissimus dorsi', 'lats', 'traps', 'trapezius', 'rhomboids', 'back'].includes(raw)) return 'Back';
    if (['chest'].includes(raw)) return 'Chest';
    if (['shoulders', 'deltoids', 'rotator cuff'].includes(raw)) return 'Shoulders';
    if (['biceps'].includes(raw)) return 'Biceps';
    if (['triceps'].includes(raw)) return 'Triceps';
    if (['forearms', 'wrist flexors', 'wrist extensors', 'wrists', 'hands'].includes(raw)) return 'Forearms';
    
    // Fallback
    console.warn(`Unmapped muscle group: ${mg}, defaulting to Core`);
    return 'Core';
}

function mapEquipment(eq) {
    const raw = eq.toLowerCase();
    if (['body weight', 'assisted'].includes(raw)) return 'body weight';
    if (['cable', 'rope'].includes(raw)) return 'cable';
    if (['barbell', 'ez barbell', 'olympic barbell', 'trap bar'].includes(raw)) return 'barbell';
    if (['dumbbell'].includes(raw)) return 'dumbbell';
    if (['band', 'resistance band'].includes(raw)) return 'band';
    if (['kettlebell'].includes(raw)) return 'kettlebell';
    if (['smith machine'].includes(raw)) return 'smith machine';
    if (['leverage machine', 'sled machine', 'skierg machine', 'stationary bike', 'stepmill machine', 'elliptical machine', 'upper body ergometer'].includes(raw)) return 'leverage machine';
    if (['medicine ball', 'stability ball', 'bosu ball', 'roller', 'wheel roller', 'hammer', 'tire', 'weighted', 'none', 'other'].includes(raw)) return 'other';
    
    // Fallback
    console.warn(`Unmapped equipment: ${eq}, defaulting to other`);
    return 'other';
}

async function seedDatabase() {
    try {
        const directUri = 'mongodb://vishwakarmashyamchand1_db_user:F4DnApUSYzyKuXa2@ac-mxumfdk-shard-00-00.5fnqp2l.mongodb.net:27017,ac-mxumfdk-shard-00-01.5fnqp2l.mongodb.net:27017,ac-mxumfdk-shard-00-02.5fnqp2l.mongodb.net:27017/comeback?ssl=true&replicaSet=atlas-bap7sb-shard-0&authSource=admin&retryWrites=true&w=majority';
        await mongoose.connect(directUri);
        console.log('Connected to MongoDB.');

        // Delete existing data
        const deleteResult = await Exercise.deleteMany({});
        console.log(`Deleted ${deleteResult.deletedCount} existing exercises.`);

        // Map data
        const mappedExercises = exercises.map(ex => ({
            ...ex,
            muscleGroup: mapMuscleGroup(ex.muscleGroup),
            equipment: mapEquipment(ex.equipment)
        }));

        // Insert new data
        const insertResult = await Exercise.insertMany(mappedExercises);
        console.log(`Successfully seeded ${insertResult.length} new exercises.`);

        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}

seedDatabase();
