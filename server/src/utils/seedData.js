const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('../config/db');
const User = require('../models/User');
const Farm = require('../models/Farm');
const Contract = require('../models/Contract');
const Application = require('../models/Application');
const Crop = require('../models/Crop');
const Inspection = require('../models/Inspection');
const QualityCheck = require('../models/QualityCheck');
const Payment = require('../models/Payment');
const Complaint = require('../models/Complaint');
const Notification = require('../models/Notification');

const seedAllData = async () => {
  try {
    console.log('[Seeder] Connecting to database...');
    await connectDB();

    console.log('[Seeder] Clearing old records...');
    await Promise.all([
      User.deleteMany(),
      Farm.deleteMany(),
      Contract.deleteMany(),
      Application.deleteMany(),
      Crop.deleteMany(),
      Inspection.deleteMany(),
      QualityCheck.deleteMany(),
      Payment.deleteMany(),
      Complaint.deleteMany(),
      Notification.deleteMany(),
    ]);

    console.log('[Seeder] Seeding core user accounts for all 4 roles...');

    // 1. Admin
    const admin = await User.create({
      name: 'Dr. Vikramaditya Sharma',
      email: 'admin@agriflow.com',
      password: 'Password123!',
      role: 'admin',
      phone: '+91 98230 11223',
      address: {
        street: 'Kisan Vikas Bhavan, Krishi Marg',
        village: 'Civil Lines',
        district: 'New Delhi',
        state: 'Delhi',
        pincode: '110001',
      },
      isVerified: true,
      status: 'active',
    });

    // 2. Buyer
    const buyer = await User.create({
      name: 'GreenHarvest Agro Industries Ltd.',
      email: 'buyer@greenharvest.com',
      password: 'Password123!',
      role: 'buyer',
      phone: '+91 98450 44556',
      address: {
        street: 'Plot 42, Food Park Industrial Corridor',
        village: 'Phase 2',
        district: 'Pune',
        state: 'Maharashtra',
        pincode: '411028',
      },
      buyerDetails: {
        companyName: 'GreenHarvest Agro Industries Ltd.',
        gstNumber: '27AABCG1234F1Z8',
        registrationNumber: 'CIN-U01111MH2018PTC192837',
        businessType: 'Flour Mill & Grain Processing Export',
        website: 'https://greenharvest.example.com',
        escrowBalance: 1250000,
      },
      isVerified: true,
      status: 'active',
    });

    // 3. Farmer
    const farmer = await User.create({
      name: 'Ramesh Patel',
      email: 'farmer@krishiseva.com',
      password: 'Password123!',
      role: 'farmer',
      phone: '+91 97120 77889',
      address: {
        street: 'House No. 18, Kisan Galli',
        village: 'Warora',
        district: 'Chandrapur',
        state: 'Maharashtra',
        pincode: '442907',
      },
      farmerDetails: {
        totalAcreage: 12.5,
        primaryCrops: ['Wheat', 'Basmati Rice', 'Cotton', 'Soybean'],
        kisanCardNumber: 'KCC-MAH-2021-99482',
        experienceYears: 16,
        performanceScore: 94,
        bankDetails: {
          accountHolder: 'Ramesh Patel',
          accountNumber: '308945281920',
          ifscCode: 'SBIN0001248',
          bankName: 'State Bank of India (Warora Branch)',
        },
      },
      isVerified: true,
      status: 'active',
    });

    // 4. Field Officer
    const officer = await User.create({
      name: 'Anjali Deshmukh',
      email: 'officer@agriinspect.gov',
      password: 'Password123!',
      role: 'officer',
      phone: '+91 94231 66554',
      address: {
        street: 'District Agriculture Office, Block 4',
        village: 'Collectorate Compound',
        district: 'Chandrapur',
        state: 'Maharashtra',
        pincode: '442401',
      },
      officerDetails: {
        badgeId: 'EXT-OFF-2023-882',
        designation: 'Senior Agricultural Field Officer',
        assignedDistrict: 'Chandrapur',
        inspectionsCompleted: 48,
      },
      isVerified: true,
      status: 'active',
    });

    // 5. Secondary Farmer
    const farmer2 = await User.create({
      name: 'Balwinder Singh',
      email: 'rajesh.farmer@gmail.com',
      password: 'Password123!',
      role: 'farmer',
      phone: '+91 98140 22334',
      address: {
        street: 'Guru Nanak Pura',
        village: 'Samrala',
        district: 'Ludhiana',
        state: 'Punjab',
        pincode: '141114',
      },
      farmerDetails: {
        totalAcreage: 18.0,
        primaryCrops: ['Wheat', 'Rice', 'Maize'],
        kisanCardNumber: 'KCC-PB-2019-33104',
        experienceYears: 20,
        performanceScore: 96,
      },
      isVerified: true,
      status: 'active',
    });

    console.log('[Seeder] Registering farms for farmers...');

    // Farm 1
    const farm1 = await Farm.create({
      farmer: farmer._id,
      farmName: 'Krishna Valley Organic Fields',
      surveyNumber: 'KHATA-421/A',
      areaInAcres: 8.0,
      soilType: 'Black Soil',
      irrigationSource: 'Drip System',
      waterAvailability: 'Year-Round',
      location: {
        village: 'Warora',
        district: 'Chandrapur',
        state: 'Maharashtra',
        pincode: '442907',
        latitude: 20.2312,
        longitude: 79.0028,
      },
      currentCrops: ['Basmati Rice', 'Wheat'],
      soilHealthScore: 92,
      organicCertified: true,
    });

    // Farm 2
    const farm2 = await Farm.create({
      farmer: farmer._id,
      farmName: 'Surya Agro Parkland',
      surveyNumber: 'KHATA-108/B',
      areaInAcres: 4.5,
      soilType: 'Clayey Loam',
      irrigationSource: 'Borewell',
      waterAvailability: 'Seasonal',
      location: {
        village: 'Bhadravati',
        district: 'Chandrapur',
        state: 'Maharashtra',
        pincode: '442902',
        latitude: 20.1023,
        longitude: 79.1189,
      },
      currentCrops: ['Cotton', 'Soybean'],
      soilHealthScore: 84,
      organicCertified: false,
    });

    console.log('[Seeder] Creating Contracts...');

    // Contract 1: In-Progress with Primary Farmer
    const contract1 = await Contract.create({
      buyer: buyer._id,
      contractCode: 'CFT-2025-1084',
      title: 'Certified Basmati Rice 1121 - 150 Quintals Premium Buyback',
      cropName: 'Basmati Rice',
      variety: 'Pusa Basmati 1121 Extra Long Grain',
      targetQuantity: 150,
      minimumLandRequired: 6.0,
      pricePerUnit: 4200,
      unit: 'Quintal',
      totalEstimatedValue: 630000,
      sowingDate: new Date('2025-06-15'),
      expectedHarvestDate: new Date('2025-10-25'),
      deliveryLocation: 'GreenHarvest Processing Hub, Pune Food Park',
      qualityStandards: {
        minimumGrade: 'Grade A+',
        maxMoisturePercentage: 12.0,
        allowedDefectsPercentage: 1.5,
        organicPreferred: true,
        customSpecifications: 'Grain length minimum 8.2mm, nil chalky grains, certified pesticide free.',
      },
      termsAndConditions: '1. Fixed minimum support price + 15% export premium. 2. 20% advance upon contract signing. 3. Final payment within 48 hours of moisture and grain verification.',
      advancePaymentPercentage: 20,
      status: 'in_progress',
      assignedFarmer: farmer._id,
      assignedFarm: farm1._id,
      assignedOfficer: officer._id,
      qrCodeData: JSON.stringify({
        code: 'CFT-2025-1084',
        crop: 'Basmati Rice 1121',
        qty: 150,
        price: 4200,
        buyer: 'GreenHarvest Agro Industries Ltd.',
        farmer: 'Ramesh Patel',
      }),
    });

    // Contract 2: Open for Application
    const contract2 = await Contract.create({
      buyer: buyer._id,
      contractCode: 'CFT-2025-2491',
      title: 'Certified Sharbati Golden Wheat - 200 Quintals Procurement',
      cropName: 'Wheat',
      variety: 'C-306 Sharbati Premium',
      targetQuantity: 200,
      minimumLandRequired: 5.0,
      pricePerUnit: 2850,
      unit: 'Quintal',
      totalEstimatedValue: 570000,
      sowingDate: new Date('2025-11-05'),
      expectedHarvestDate: new Date('2026-03-20'),
      deliveryLocation: 'Central Grain Silo, Nagpur Highway Hub',
      qualityStandards: {
        minimumGrade: 'Grade A',
        maxMoisturePercentage: 11.5,
        allowedDefectsPercentage: 2.0,
        organicPreferred: false,
        customSpecifications: 'Hard lustrous grain, high gluten content, free from insect holes or black point.',
      },
      advancePaymentPercentage: 25,
      status: 'open',
      qrCodeData: JSON.stringify({
        code: 'CFT-2025-2491',
        crop: 'Wheat (Sharbati)',
        qty: 200,
        price: 2850,
        buyer: 'GreenHarvest Agro Industries Ltd.',
      }),
    });

    // Contract 3: Open for Cotton
    const contract3 = await Contract.create({
      buyer: buyer._id,
      contractCode: 'CFT-2025-3920',
      title: 'Long Staple Organic Cotton - 100 Quintals Spun Grade',
      cropName: 'Cotton',
      variety: 'Bt Cotton Long Staple (32mm)',
      targetQuantity: 100,
      minimumLandRequired: 4.0,
      pricePerUnit: 7400,
      unit: 'Quintal',
      totalEstimatedValue: 740000,
      sowingDate: new Date('2025-05-20'),
      expectedHarvestDate: new Date('2025-11-15'),
      deliveryLocation: 'Vidarbha Ginning & Pressing Yard, Wardha',
      qualityStandards: {
        minimumGrade: 'Grade A',
        maxMoisturePercentage: 8.5,
        allowedDefectsPercentage: 1.0,
        organicPreferred: true,
        customSpecifications: 'Clean lint, micronaire value 3.8-4.2, moisture strictly under 9%.',
      },
      advancePaymentPercentage: 20,
      status: 'open',
      qrCodeData: JSON.stringify({
        code: 'CFT-2025-3920',
        crop: 'Cotton',
        qty: 100,
        price: 7400,
        buyer: 'GreenHarvest Agro Industries Ltd.',
      }),
    });

    // Contract 4: Completed & Settled
    const contract4 = await Contract.create({
      buyer: buyer._id,
      contractCode: 'CFT-2024-9102',
      title: 'High Protein Non-GMO Soybean - 120 Quintals Export Lot',
      cropName: 'Soybean',
      variety: 'JS-335 Certified High Yield',
      targetQuantity: 120,
      minimumLandRequired: 5.0,
      pricePerUnit: 4800,
      unit: 'Quintal',
      totalEstimatedValue: 576000,
      sowingDate: new Date('2024-06-20'),
      expectedHarvestDate: new Date('2024-10-10'),
      deliveryLocation: 'GreenHarvest Processing Hub, Pune Food Park',
      qualityStandards: {
        minimumGrade: 'Grade A',
        maxMoisturePercentage: 10.0,
        allowedDefectsPercentage: 2.0,
        organicPreferred: false,
      },
      status: 'completed',
      assignedFarmer: farmer._id,
      assignedFarm: farm2._id,
      assignedOfficer: officer._id,
    });

    console.log('[Seeder] Creating Applications...');

    // Accepted app for Contract 1
    await Application.create({
      contract: contract1._id,
      farmer: farmer._id,
      farm: farm1._id,
      proposedQuantity: 150,
      proposedDeliveryDate: new Date('2025-10-25'),
      proposalNote: 'Ready to dedicate 6.5 acres of certified black soil with drip irrigation. Prior yield 24 Q/acre.',
      status: 'accepted',
      reviewedAt: new Date('2025-06-10'),
      reviewRemarks: 'Excellent farm profile and previous delivery record approved.',
    });

    // Pending app for Contract 2
    await Application.create({
      contract: contract2._id,
      farmer: farmer._id,
      farm: farm1._id,
      proposedQuantity: 200,
      proposedDeliveryDate: new Date('2026-03-20'),
      proposalNote: 'Applying for post-monsoon rabi season wheat cultivation on primary plot.',
      status: 'pending',
    });

    console.log('[Seeder] Creating Crop Tracking Records...');

    // Active crop for Contract 1
    const crop1 = await Crop.create({
      contract: contract1._id,
      farm: farm1._id,
      farmer: farmer._id,
      cropName: 'Basmati Rice',
      variety: 'Pusa Basmati 1121 Extra Long Grain',
      acreageAllocated: 6.0,
      sowingDate: new Date('2025-06-15'),
      expectedHarvestDate: new Date('2025-10-25'),
      stage: 'Vegetative',
      growthPercentage: 55,
      healthStatus: 'Excellent',
      expectedYieldInQuintals: 155,
      actualYieldInQuintals: 0,
      stageHistory: [
        {
          stage: 'Sowing',
          updatedDate: new Date('2025-06-15'),
          notes: 'Nursery seedling transplanting completed as per GAP schedule.',
          growthPercentage: 15,
        },
        {
          stage: 'Vegetative',
          updatedDate: new Date('2025-07-20'),
          notes: 'Tillering stage vigorous. Tillers average 22 per hill. Bio-fertilizer applied.',
          growthPercentage: 55,
        },
      ],
    });

    console.log('[Seeder] Creating Field Inspection Reports...');

    // Inspection 1
    await Inspection.create({
      contract: contract1._id,
      farm: farm1._id,
      officer: officer._id,
      inspectionDate: new Date('2025-07-22'),
      cropCondition: 'Excellent',
      growthPercentage: 55,
      pestOrDiseaseDetected: false,
      pestDiseaseDetails: 'No stem borer or leaf folder observed. Beneficial spiders present.',
      soilMoistureCondition: 'Optimal',
      irrigationStatus: 'Operational',
      remarks: 'Foliage is lush and deep green. Drip fertigation lines are clean. Soil moisture index is ideal for vegetative tillering.',
      recommendedActions: 'Maintain water level at 2-3 cm and schedule mid-season micronutrient zinc spray.',
      photos: [
        'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&auto=format&fit=crop&q=60',
        'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&auto=format&fit=crop&q=60',
      ],
      overallScore: 95,
    });

    console.log('[Seeder] Creating Quality Checks & Payments...');

    // Quality check for completed soybean contract
    await QualityCheck.create({
      contract: contract4._id,
      buyer: buyer._id,
      farmer: farmer._id,
      suppliedQuantityInQuintals: 120,
      moistureLevelPercentage: 9.8,
      foreignMatterPercentage: 0.4,
      grainSizeUniformityPercentage: 96.5,
      qualityGrade: 'Grade A+',
      qualityScore: 96,
      status: 'Approved',
      certificateNumber: 'QC-CERT-2024-88419',
      certifiedBy: 'Dr. Suresh Kumar (Chief Quality Chemist)',
      remarks: 'Exceptional purity, nil aflatoxin, moisture within export tolerances.',
    });

    // Payment 1: Advance payment on Contract 1 (completed)
    await Payment.create({
      contract: contract1._id,
      buyer: buyer._id,
      farmer: farmer._id,
      transactionId: 'TXN-AGRI-2025-10492',
      milestoneType: 'Advance Deposit',
      quantitySuppliedInQuintals: 0,
      pricePerUnit: 4200,
      grossAmount: 126000,
      deductions: 0,
      netAmount: 126000,
      paymentMethod: 'Direct Bank Transfer (NEFT/RTGS)',
      status: 'completed',
      receiptNumber: 'RCPT-2025-10492',
      notes: '20% Contract mobilization advance credited to Ramesh Patel SBI account.',
    });

    // Payment 2: Completed payment for Contract 4
    await Payment.create({
      contract: contract4._id,
      buyer: buyer._id,
      farmer: farmer._id,
      transactionId: 'TXN-AGRI-2024-77192',
      milestoneType: 'Final Settlement',
      quantitySuppliedInQuintals: 120,
      pricePerUnit: 4800,
      grossAmount: 576000,
      deductions: 57600,
      netAmount: 518400,
      paymentMethod: 'Platform Escrow Release',
      status: 'completed',
      receiptNumber: 'RCPT-2024-77192',
      notes: 'Full harvest payment disbursed post Quality Grade A+ certification.',
    });

    console.log('[Seeder] Creating Platform Complaints...');

    await Complaint.create({
      raisedBy: farmer._id,
      contract: contract4._id,
      againstUser: buyer._id,
      complaintNumber: 'CMP-2024-1002',
      category: 'Delayed Pickup/Delivery',
      subject: 'Delay in warehouse grain unloading during harvest peak',
      description: 'Grain trucks were kept waiting at the processing hub bay for 18 hours due to unannounced intake maintenance.',
      priority: 'Medium',
      status: 'resolved',
      adminResponse: 'Processing hub bay capacity increased with dedicated contract farming express ramp. Detention compensation credited.',
      resolvedAt: new Date('2024-10-15'),
      resolvedBy: admin._id,
    });

    console.log('[Seeder] Creating Notifications...');

    await Notification.create({
      recipient: farmer._id,
      title: 'Advance Payment Credited: ₹1,26,000',
      message: 'Advance mobilization fund for Contract CFT-2025-1084 (Basmati Rice) has been deposited into your SBI account.',
      type: 'payment',
      link: '/farmer/payments',
      isRead: false,
    });

    await Notification.create({
      recipient: farmer._id,
      title: 'Field Inspection Passed (95/100)',
      message: 'Officer Anjali Deshmukh reported excellent tillering and healthy vegetative canopy for your Warora plot.',
      type: 'inspection',
      link: '/farmer/inspections',
      isRead: true,
    });

    await Notification.create({
      recipient: buyer._id,
      title: 'New Contract Application Received',
      message: 'Farmer Ramesh Patel applied for Contract CFT-2025-2491 (Sharbati Wheat).',
      type: 'application',
      link: '/buyer/contracts',
      isRead: false,
    });

    console.log('[Seeder] Database seeding completed successfully! ✨');
    console.log('--------------------------------------------------');
    console.log('TEST CREDENTIALS:');
    console.log('  Admin:         admin@agriflow.com      / Password123!');
    console.log('  Buyer:         buyer@greenharvest.com  / Password123!');
    console.log('  Farmer:        farmer@krishiseva.com   / Password123!');
    console.log('  Field Officer: officer@agriinspect.gov / Password123!');
    console.log('--------------------------------------------------');

    return true;
  } catch (error) {
    console.error(`[Seeder Error]: ${error.message}`);
    throw error;
  }
};

if (require.main === module) {
  seedAllData().then(() => process.exit(0)).catch(() => process.exit(1));
}

module.exports = seedAllData;
