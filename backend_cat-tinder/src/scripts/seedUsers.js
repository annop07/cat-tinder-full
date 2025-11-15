const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const Owner = require('../models/Owner');
const Cat = require('../models/Cat');

// ข้อมูล User ตัวอย่าง
const sampleUsers = [
  {
    email: 'john@example.com',
    password: 'password123',
    username: 'john_cat_lover',
    phone: '0812345678',
    avatar: {
      url: 'https://i.pravatar.cc/300?img=12',
      publicId: 'sample_avatar_1'
    },
    location: {
      province: 'กรุงเทพมหานคร',
      district: 'บางรัก',
      lat: 13.7563,
      lng: 100.5018
    },
    onboardingCompleted: true,
    cats: [
      {
        name: 'Luna',
        gender: 'female',
        ageYears: 2,
        ageMonths: 3,
        breed: 'Scottish Fold',
        color: 'Grey',
        traits: ['playful', 'affectionate', 'friendly'],
        photos: [
          {
            url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba',
            publicId: 'sample_cat_1'
          }
        ],
        readyForBreeding: true,
        vaccinated: true,
        neutered: false,
        notes: 'Very friendly and loves to play',
        location: {
          province: 'กรุงเทพมหานคร',
          district: 'บางรัก',
          lat: 13.7563,
          lng: 100.5018
        }
      }
    ]
  },
  {
    email: 'sarah@example.com',
    password: 'password123',
    username: 'sarah_meow',
    phone: '0823456789',
    avatar: {
      url: 'https://i.pravatar.cc/300?img=47',
      publicId: 'sample_avatar_2'
    },
    location: {
      province: 'กรุงเทพมหานคร',
      district: 'สาทร',
      lat: 13.7248,
      lng: 100.5340
    },
    onboardingCompleted: true,
    cats: [
      {
        name: 'Max',
        gender: 'male',
        ageYears: 1,
        ageMonths: 8,
        breed: 'British Shorthair',
        color: 'Orange',
        traits: ['calm', 'friendly', 'independent'],
        photos: [
          {
            url: 'https://images.unsplash.com/photo-1574158622682-e40e69881006',
            publicId: 'sample_cat_2'
          }
        ],
        readyForBreeding: true,
        vaccinated: true,
        neutered: false,
        notes: 'Calm and gentle cat',
        location: {
          province: 'กรุงเทพมหานคร',
          district: 'สาทร',
          lat: 13.7248,
          lng: 100.5340
        }
      }
    ]
  },
  {
    email: 'mike@example.com',
    password: 'password123',
    username: 'mike_cats',
    phone: '0834567890',
    avatar: {
      url: 'https://i.pravatar.cc/300?img=33',
      publicId: 'sample_avatar_3'
    },
    location: {
      province: 'เชียงใหม่',
      district: 'เมืองเชียงใหม่',
      lat: 18.7883,
      lng: 98.9853
    },
    onboardingCompleted: true,
    cats: [
      {
        name: 'Milo',
        gender: 'male',
        ageYears: 3,
        ageMonths: 0,
        breed: 'Siamese',
        color: 'Cream',
        traits: ['vocal', 'affectionate', 'playful'],
        photos: [
          {
            url: 'https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8',
            publicId: 'sample_cat_3'
          }
        ],
        readyForBreeding: true,
        vaccinated: true,
        neutered: false,
        notes: 'Very vocal Siamese cat',
        location: {
          province: 'เชียงใหม่',
          district: 'เมืองเชียงใหม่',
          lat: 18.7883,
          lng: 98.9853
        }
      }
    ]
  },
  {
    email: 'emma@example.com',
    password: 'password123',
    username: 'emma_feline',
    phone: '0845678901',
    avatar: {
      url: 'https://i.pravatar.cc/300?img=48',
      publicId: 'sample_avatar_4'
    },
    location: {
      province: 'ภูเก็ต',
      district: 'เมืองภูเก็ต',
      lat: 7.8804,
      lng: 98.3923
    },
    onboardingCompleted: true,
    cats: [
      {
        name: 'Bella',
        gender: 'female',
        ageYears: 2,
        ageMonths: 6,
        breed: 'Persian',
        color: 'White',
        traits: ['calm', 'quiet', 'affectionate'],
        photos: [
          {
            url: 'https://images.unsplash.com/photo-1495360010541-f48722b34f7d',
            publicId: 'sample_cat_4'
          }
        ],
        readyForBreeding: true,
        vaccinated: true,
        neutered: false,
        notes: 'Beautiful white Persian cat',
        location: {
          province: 'ภูเก็ต',
          district: 'เมืองภูเก็ต',
          lat: 7.8804,
          lng: 98.3923
        }
      }
    ]
  },
  {
    email: 'david@example.com',
    password: 'password123',
    username: 'david_kitty',
    phone: '0856789012',
    avatar: {
      url: 'https://i.pravatar.cc/300?img=15',
      publicId: 'sample_avatar_5'
    },
    location: {
      province: 'กรุงเทพมหานคร',
      district: 'ห้วยขวาง',
      lat: 13.7808,
      lng: 100.5748
    },
    onboardingCompleted: true,
    cats: [
      {
        name: 'Oliver',
        gender: 'male',
        ageYears: 1,
        ageMonths: 4,
        breed: 'Maine Coon',
        color: 'Brown Tabby',
        traits: ['playful', 'friendly', 'vocal'],
        photos: [
          {
            url: 'https://images.unsplash.com/photo-1559235038-1b0faec76f78',
            publicId: 'sample_cat_5'
          }
        ],
        readyForBreeding: true,
        vaccinated: true,
        neutered: false,
        notes: 'Large and playful Maine Coon',
        location: {
          province: 'กรุงเทพมหานคร',
          district: 'ห้วยขวาง',
          lat: 13.7808,
          lng: 100.5748
        }
      }
    ]
  }
];

const seedUsers = async () => {
  try {
    // เชื่อมต่อฐานข้อมูล
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // ลบข้อมูลเดิมทั้งหมด (ถ้าต้องการ)
    console.log('🗑️  Clearing existing data...');
    await Owner.deleteMany({});
    await Cat.deleteMany({});
    console.log('✅ Existing data cleared');

    // เพิ่มข้อมูล User และ Cat
    console.log('📝 Creating sample users and cats...');

    for (const userData of sampleUsers) {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(userData.password, salt);

      // สร้าง Owner
      const owner = await Owner.create({
        email: userData.email,
        passwordHash,
        username: userData.username,
        phone: userData.phone,
        avatar: userData.avatar,
        location: userData.location,
        onboardingCompleted: userData.onboardingCompleted
      });

      console.log(`✅ Created user: ${owner.username} (${owner.email})`);

      // สร้าง Cat สำหรับ Owner นี้
      if (userData.cats && userData.cats.length > 0) {
        for (const catData of userData.cats) {
          const cat = await Cat.create({
            ...catData,
            ownerId: owner._id
          });
          console.log(`  🐱 Created cat: ${cat.name} for ${owner.username}`);
        }
      }
    }

    console.log('\n🎉 Seed completed successfully!');
    console.log(`\n📊 Summary:`);
    console.log(`   - Users created: ${sampleUsers.length}`);
    console.log(`   - Cats created: ${sampleUsers.reduce((sum, u) => sum + (u.cats?.length || 0), 0)}`);
    console.log(`\n🔑 Login credentials (all users):`);
    console.log(`   Password: password123`);
    console.log(`\n📧 User emails:`);
    sampleUsers.forEach(user => {
      console.log(`   - ${user.email}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// เรียกใช้งาน
seedUsers();
