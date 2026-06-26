import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { ROLES, USER_ROLE_VALUES, isSuperAdminEmail } from "../config/roles.js";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Prevents password from being returned in API responses by default
    },
    role: {
      type: String,
      enum: USER_ROLE_VALUES,
      default: ROLES.ATTENDEE,
    },
    bio: {
      type: String,
      default: "",
      trim: true,
      maxlength: [500, "Bio cannot exceed 500 characters"],
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },
    avatar: {
      type: String,
      default: "",
      trim: true,
    },
    is_verified: {
      type: Boolean,
      default: false,
    },
    googleId: {
      type: String,
      sparse: true,
      unique: true,
    },
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
  },
  { timestamps: true },
);

userSchema.pre("validate", function () {
  if (isSuperAdminEmail(this.email)) {
    this.role = ROLES.SUPER_ADMIN;
  } else if (this.role === ROLES.SUPER_ADMIN) {
    this.invalidate("role", "Only the fixed super admin email can use the super_admin role.");
  }
});

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }
  //skip google user
  if (!this.password) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;

  return bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
