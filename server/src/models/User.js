const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide full name'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide email address'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false,
    },
    role: {
      type: String,
      enum: ['farmer', 'buyer', 'officer', 'admin'],
      default: 'farmer',
    },
    phone: {
      type: String,
      default: '',
    },
    address: {
      street: { type: String, default: '' },
      village: { type: String, default: '' },
      district: { type: String, default: '' },
      state: { type: String, default: '' },
      pincode: { type: String, default: '' },
    },
    status: {
      type: String,
      enum: ['active', 'pending', 'blocked'],
      default: 'active',
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
    farmerDetails: {
      totalAcreage: { type: Number, default: 0 },
      primaryCrops: [{ type: String }],
      kisanCardNumber: { type: String, default: '' },
      experienceYears: { type: Number, default: 5 },
      performanceScore: { type: Number, default: 92, min: 0, max: 100 },
      bankDetails: {
        accountHolder: { type: String, default: '' },
        accountNumber: { type: String, default: '' },
        ifscCode: { type: String, default: '' },
        bankName: { type: String, default: '' },
      },
    },
    buyerDetails: {
      companyName: { type: String, default: '' },
      gstNumber: { type: String, default: '' },
      registrationNumber: { type: String, default: '' },
      businessType: { type: String, default: 'Agro Processing' },
      website: { type: String, default: '' },
      escrowBalance: { type: Number, default: 500000 },
    },
    officerDetails: {
      badgeId: { type: String, default: '' },
      designation: { type: String, default: 'Agricultural Extension Officer' },
      assignedDistrict: { type: String, default: '' },
      inspectionsCompleted: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT token
userSchema.methods.getSignedJwtToken = function () {
  return jwt.sign(
    { id: this._id, role: this.role, name: this.name, email: this.email },
    process.env.JWT_SECRET || 'contract_farming_jwt_super_secret_key_2025',
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

module.exports = mongoose.model('User', userSchema);
