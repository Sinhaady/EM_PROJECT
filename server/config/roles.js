export const SUPER_ADMIN_EMAIL = "adityasinha296@gmail.com";

export const ROLES = {
  ATTENDEE: "attendee",
  ORGANIZER: "organizer",
  ADMIN: "admin",
  SUPER_ADMIN: "super_admin",
};

export const USER_ROLE_VALUES = Object.values(ROLES);
export const PUBLIC_ASSIGNABLE_ROLES = [ROLES.ATTENDEE, ROLES.ORGANIZER];

export const normalizeEmail = (email = "") => String(email).trim().toLowerCase();

export const isSuperAdminEmail = (email = "") => normalizeEmail(email) === SUPER_ADMIN_EMAIL;

export const getEffectiveRole = (user = {}) => {
  if (isSuperAdminEmail(user.email)) {
    return ROLES.SUPER_ADMIN;
  }

  return user.role || ROLES.ATTENDEE;
};

export const toSafeUser = (user) => {
  if (!user) {
    return user;
  }

  const safeUser = typeof user.toObject === "function" ? user.toObject() : { ...user };
  delete safeUser.password;
  safeUser.role = getEffectiveRole(safeUser);

  return safeUser;
};
