
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  Bell,
  Briefcase,
  Check,
  ChevronLeft,
  Clock3,
  Edit3,
  Globe2,
  KeyRound,
  Lock,
  Mail,
  MapPin,
  Phone,
  Save,
  Shield,
  User,
  X,
} from "lucide-react";

import { useAuthStore } from "../../../../store/authStore";
import styles from "./profile.module.css";

/* =========================================================
   TYPES
========================================================= */

type ProfileUser = {
  id?: string;

  name?: string;
  firstName?: string;
  lastName?: string;

  email?: string;
  role?: string;

  phone?: string;
  jobTitle?: string;
  department?: string;
  location?: string;
  timezone?: string;
  bio?: string;

  workspaceId?: string;
  workspaceName?: string;

  createdAt?: string | Date;
  updatedAt?: string | Date;
  lastLoginAt?: string | Date;

  isEmailVerified?: boolean;
  isTwoFactorEnabled?: boolean;
};

type ProfileData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  jobTitle: string;
  department: string;
  location: string;
  timezone: string;
  bio: string;
};

type ActivityItem = {
  icon: typeof Activity;
  title: string;
  description: string;
};

/* =========================================================
   HELPERS
========================================================= */

function formatDate(value?: string | Date) {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getInitials(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return "AU";
  }

  if (parts.length === 1) {
    return parts[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return `${parts[0][0]}${
    parts[parts.length - 1][0]
  }`.toUpperCase();
}

/* =========================================================
   PAGE
========================================================= */

export default function AnalystProfilePage() {
  /*
   * Get the currently logged-in user from the
   * frontend authentication store.
   *
   * The actual permanent data remains in Prisma/PostgreSQL.
   */
  const user = useAuthStore(
    (state) => state.user,
  );

  const profileUser =
    user as ProfileUser | null | undefined;

  /* =======================================================
     USER INFORMATION
  ======================================================== */

  const fullName = useMemo(() => {
    if (profileUser?.name?.trim()) {
      return profileUser.name.trim();
    }

    const combinedName = [
      profileUser?.firstName,
      profileUser?.lastName,
    ]
      .filter(Boolean)
      .join(" ")
      .trim();

    return combinedName || "LOOP User";
  }, [profileUser]);

  const firstName = useMemo(() => {
    if (profileUser?.firstName?.trim()) {
      return profileUser.firstName.trim();
    }

    return (
      fullName.split(/\s+/)[0] ||
      "User"
    );
  }, [profileUser, fullName]);

  const lastName = useMemo(() => {
    if (profileUser?.lastName?.trim()) {
      return profileUser.lastName.trim();
    }

    return fullName
      .split(/\s+/)
      .slice(1)
      .join(" ");
  }, [profileUser, fullName]);

  const email =
    profileUser?.email?.trim() ||
    "";

  const role = String(
    profileUser?.role ||
      "ANALYST",
  ).toUpperCase();

  const initials = useMemo(
    () => getInitials(fullName),
    [fullName],
  );

  /* =======================================================
     INITIAL PROFILE
  ======================================================== */

  const initialProfile =
    useMemo<ProfileData>(
      () => ({
        firstName,
        lastName,

        email,

        phone:
          profileUser?.phone || "",

        jobTitle:
          profileUser?.jobTitle ||
          "Data Analyst",

        department:
          profileUser?.department ||
          "Analytics",

        location:
          profileUser?.location || "",

        timezone:
          profileUser?.timezone ||
          "Asia/Kolkata (IST)",

        bio:
          profileUser?.bio || "",
      }),
      [
        firstName,
        lastName,
        email,
        profileUser,
      ],
    );

  const [profile, setProfile] =
    useState<ProfileData>(
      initialProfile,
    );

  const [isEditing, setIsEditing] =
    useState(false);

  const [isSaving, setIsSaving] =
    useState(false);

  const [showSuccess, setShowSuccess] =
    useState(false);

  /* =======================================================
     PREFERENCES
  ======================================================== */

  const [
    notifications,
    setNotifications,
  ] = useState(true);

  const [
    emailUpdates,
    setEmailUpdates,
  ] = useState(true);

  const [
    weeklySummary,
    setWeeklySummary,
  ] = useState(true);

  /* =======================================================
     SYNC PROFILE WITH AUTH USER
  ======================================================== */

  useEffect(() => {
    setProfile(initialProfile);
  }, [initialProfile]);

  /* =======================================================
     PROFILE COMPLETION
  ======================================================== */

  const profileCompletion =
    useMemo(() => {
      const fields = [
        profile.firstName,
        profile.lastName,
        profile.email,
        profile.phone,
        profile.jobTitle,
        profile.department,
        profile.location,
        profile.timezone,
        profile.bio,
      ];

      const completed =
        fields.filter(
          (value) =>
            value.trim().length > 0,
        ).length;

      return Math.round(
        (completed /
          fields.length) *
          100,
      );
    }, [profile]);

  /* =======================================================
     ACCOUNT INFORMATION
  ======================================================== */

  const memberSince =
    formatDate(
      profileUser?.createdAt,
    );

  const lastLogin =
    formatDate(
      profileUser?.lastLoginAt,
    );

  const emailVerified =
    profileUser
      ?.isEmailVerified === true;

  const twoFactorEnabled =
    profileUser
      ?.isTwoFactorEnabled === true;

  const workspaceName =
    profileUser?.workspaceName ||
    "LOOP Workspace";

  /* =======================================================
     ACCOUNT ACTIVITY
  ======================================================== */

  const activityItems: ActivityItem[] =
    [
      {
        icon: User,
        title:
          "Profile information",
        description:
          "Your profile is connected to your LOOP account.",
      },

      {
        icon: Shield,
        title:
          "Account security",
        description:
          twoFactorEnabled
            ? "Two-factor authentication is enabled."
            : "Two-factor authentication is not configured.",
      },

      {
        icon: Bell,
        title:
          "Notification preferences",
        description:
          notifications
            ? "Account notifications are enabled."
            : "Account notifications are disabled.",
      },
    ];

  /* =======================================================
     UPDATE FIELD
  ======================================================== */

  const updateField = (
    field: keyof ProfileData,
    value: string,
  ) => {
    setProfile(
      (current) => ({
        ...current,
        [field]: value,
      }),
    );
  };

  /* =======================================================
     CANCEL
  ======================================================== */

  const handleCancel = () => {
    setProfile(
      initialProfile,
    );

    setIsEditing(false);
    setShowSuccess(false);
  };

  /* =======================================================
     SAVE
  ======================================================== */

  const handleSave = async () => {
    setIsSaving(true);
    setShowSuccess(false);

    /*
     * UI save for now.
     *
     * IMPORTANT:
     * Your permanent profile data should be updated
     * through your backend API -> Prisma -> PostgreSQL.
     *
     * Do not directly connect Prisma from this client page.
     */

    await new Promise(
      (resolve) =>
        setTimeout(resolve, 700),
    );

    setIsSaving(false);
    setIsEditing(false);
    setShowSuccess(true);

    window.setTimeout(() => {
      setShowSuccess(false);
    }, 3500);
  };

  /* =======================================================
     PAGE
  ======================================================== */

  return (
    <main className={styles.page}>
      {/* Background */}
      <div
        className={
          styles.backgroundGlowOne
        }
      />

      <div
        className={
          styles.backgroundGlowTwo
        }
      />

      {/* =====================================================
          TOP BAR
      ====================================================== */}

      <header className={styles.topbar}>
        <div
          className={
            styles.topbarLeft
          }
        >
          <Link
            href="/protected/analyst"
            className={
              styles.backButton
            }
            aria-label="Back to Analyst Dashboard"
          >
            <ChevronLeft
              size={18}
            />
          </Link>

          <div
            className={
              styles.breadcrumb
            }
          >
            <span>
              Analyst
            </span>

            <span>/</span>

            <strong>
              Profile
            </strong>
          </div>
        </div>

        <div
          className={
            styles.topbarActions
          }
        >
          {!isEditing ? (
            <button
              type="button"
              className={
                styles.editButton
              }
              onClick={() =>
                setIsEditing(
                  true,
                )
              }
            >
              <Edit3
                size={17}
              />

              Edit Profile
            </button>
          ) : (
            <>
              <button
                type="button"
                className={
                  styles.cancelButton
                }
                onClick={
                  handleCancel
                }
                disabled={
                  isSaving
                }
              >
                <X
                  size={17}
                />

                Cancel
              </button>

              <button
                type="button"
                className={
                  styles.saveButton
                }
                onClick={
                  handleSave
                }
                disabled={
                  isSaving
                }
              >
                {isSaving ? (
                  <>
                    <span
                      className={
                        styles.spinner
                      }
                    />

                    Saving...
                  </>
                ) : (
                  <>
                    <Save
                      size={17}
                    />

                    Save Changes
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </header>

      {/* =====================================================
          PAGE TITLE
      ====================================================== */}

      <div
        className={
          styles.pageTitle
        }
      >
        <div>
          <h1>
            My Profile
          </h1>

          <p>
            Manage your personal
            information, account
            preferences and security.
          </p>
        </div>
      </div>

      {/* =====================================================
          SUCCESS ALERT
      ====================================================== */}

      {showSuccess && (
        <div
          className={
            styles.successAlert
          }
          role="status"
          aria-live="polite"
        >
          <div
            className={
              styles.successIcon
            }
          >
            <Check
              size={16}
            />
          </div>

          <span>
            Profile changes
            have been saved
            successfully.
          </span>

          <button
            type="button"
            className={
              styles.alertClose
            }
            onClick={() =>
              setShowSuccess(
                false,
              )
            }
            aria-label="Close notification"
          >
            <X
              size={16}
            />
          </button>
        </div>
      )}

      {/* =====================================================
          PROFILE HERO
      ====================================================== */}

      <section
        className={
          styles.profileHero
        }
      >
        <div
          className={
            styles.profileHeroContent
          }
        >
          {/* Avatar */}
          <div
            className={
              styles.avatarArea
            }
          >
            <div
              className={
                styles.avatar
              }
              aria-label={`Avatar for ${fullName}`}
            >
              {initials}
            </div>
          </div>

          {/* Identity */}
          <div
            className={
              styles.heroIdentity
            }
          >
            <div
              className={
                styles.nameRow
              }
            >
              <h2>
                {fullName}
              </h2>

              {emailVerified && (
                <span
                  className={
                    styles.verifiedBadge
                  }
                >
                  <Check
                    size={13}
                  />

                  Verified
                </span>
              )}
            </div>

            <p
              className={
                styles.heroRole
              }
            >
              {profile.jobTitle ||
                "Data Analyst"}
            </p>

            <div
              className={
                styles.heroMeta
              }
            >
              <span>
                <Mail
                  size={14}
                />

                {email ||
                  "Email not available"}
              </span>

              <span>
                <Briefcase
                  size={14}
                />

                {role}
              </span>

              <span>
                <MapPin
                  size={14}
                />

                {profile.location ||
                  "Location not set"}
              </span>
            </div>
          </div>

          {/* Completion */}
          <div
            className={
              styles.profileScore
            }
          >
            <div
              className={
                styles.scoreCircle
              }
              style={{
                background: `conic-gradient(
                  currentColor ${profileCompletion}%,
                  rgba(148, 163, 184, 0.18) ${profileCompletion}% 100%
                )`,
              }}
            >
              <div>
                <strong>
                  {profileCompletion}%
                </strong>

                <span>
                  Complete
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          CONTENT
      ====================================================== */}

      <div
        className={
          styles.layout
        }
      >
        {/* ===================================================
            MAIN COLUMN
        ==================================================== */}

        <div
          className={
            styles.mainColumn
          }
        >
          {/* =================================================
              PERSONAL INFORMATION
          ================================================== */}

          <section
            className={
              styles.card
            }
          >
            <div
              className={
                styles.cardHeader
              }
            >
              <div
                className={
                  styles.cardHeaderIcon
                }
              >
                <User
                  size={18}
                />
              </div>

              <div>
                <h3>
                  Personal
                  Information
                </h3>

                <p>
                  Your basic account
                  and contact
                  information.
                </p>
              </div>
            </div>

            <div
              className={
                styles.formGrid
              }
            >
              {/* First Name */}
              <div
                className={
                  styles.field
                }
              >
                <label htmlFor="firstName">
                  First Name
                </label>

                <div
                  className={
                    styles.inputWithIcon
                  }
                >
                  <User
                    size={16}
                  />

                  <input
                    id="firstName"
                    type="text"
                    value={
                      profile.firstName
                    }
                    disabled={
                      !isEditing
                    }
                    onChange={(event) =>
                      updateField(
                        "firstName",
                        event.target
                          .value,
                      )
                    }
                    placeholder="First name"
                  />
                </div>
              </div>

              {/* Last Name */}
              <div
                className={
                  styles.field
                }
              >
                <label htmlFor="lastName">
                  Last Name
                </label>

                <div
                  className={
                    styles.inputWithIcon
                  }
                >
                  <User
                    size={16}
                  />

                  <input
                    id="lastName"
                    type="text"
                    value={
                      profile.lastName
                    }
                    disabled={
                      !isEditing
                    }
                    onChange={(event) =>
                      updateField(
                        "lastName",
                        event.target
                          .value,
                      )
                    }
                    placeholder="Last name"
                  />
                </div>
              </div>

              {/* Email */}
              <div
                className={`${styles.field} ${styles.fullField}`}
              >
                <label htmlFor="email">
                  Email Address
                </label>

                <div
                  className={
                    styles.inputWithIcon
                  }
                >
                  <Mail
                    size={16}
                  />

                  <input
                    id="email"
                    type="email"
                    value={
                      profile.email
                    }
                    disabled
                    readOnly
                  />
                </div>

                <span
                  className={
                    styles.fieldHint
                  }
                >
                  Email is managed
                  by your LOOP
                  account.
                </span>
              </div>

              {/* Phone */}
              <div
                className={
                  styles.field
                }
              >
                <label htmlFor="phone">
                  Phone Number
                </label>

                <div
                  className={
                    styles.inputWithIcon
                  }
                >
                  <Phone
                    size={16}
                  />

                  <input
                    id="phone"
                    type="tel"
                    value={
                      profile.phone
                    }
                    disabled={
                      !isEditing
                    }
                    onChange={(event) =>
                      updateField(
                        "phone",
                        event.target
                          .value,
                      )
                    }
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
              </div>

              {/* Timezone */}
              <div
                className={
                  styles.field
                }
              >
                <label htmlFor="timezone">
                  Timezone
                </label>

                <div
                  className={
                    styles.inputWithIcon
                  }
                >
                  <Clock3
                    size={16}
                  />

                  <input
                    id="timezone"
                    type="text"
                    value={
                      profile.timezone
                    }
                    disabled={
                      !isEditing
                    }
                    onChange={(event) =>
                      updateField(
                        "timezone",
                        event.target
                          .value,
                      )
                    }
                    placeholder="Asia/Kolkata (IST)"
                  />
                </div>
              </div>

              {/* Bio */}
              <div
                className={`${styles.field} ${styles.fullField}`}
              >
                <label htmlFor="bio">
                  About
                </label>

                <textarea
                  id="bio"
                  value={
                    profile.bio
                  }
                  disabled={
                    !isEditing
                  }
                  maxLength={300}
                  rows={5}
                  onChange={(event) =>
                    updateField(
                      "bio",
                      event.target
                        .value,
                    )
                  }
                  placeholder="Tell your team a little about yourself..."
                />

                <div
                  className={
                    styles.characterCount
                  }
                >
                  {profile.bio.length}
                  /300
                </div>
              </div>
            </div>
          </section>

          {/* =================================================
              PROFESSIONAL INFORMATION
          ================================================== */}

          <section
            className={
              styles.card
            }
          >
            <div
              className={
                styles.cardHeader
              }
            >
              <div
                className={
                  styles.cardHeaderIcon
                }
              >
                <Briefcase
                  size={18}
                />
              </div>

              <div>
                <h3>
                  Professional
                  Information
                </h3>

                <p>
                  Information about
                  your role inside
                  the organization.
                </p>
              </div>
            </div>

            <div
              className={
                styles.formGrid
              }
            >
              {/* Job Title */}
              <div
                className={
                  styles.field
                }
              >
                <label htmlFor="jobTitle">
                  Job Title
                </label>

                <div
                  className={
                    styles.inputWithIcon
                  }
                >
                  <Briefcase
                    size={16}
                  />

                  <input
                    id="jobTitle"
                    type="text"
                    value={
                      profile.jobTitle
                    }
                    disabled={
                      !isEditing
                    }
                    onChange={(event) =>
                      updateField(
                        "jobTitle",
                        event.target
                          .value,
                      )
                    }
                    placeholder="Data Analyst"
                  />
                </div>
              </div>

              {/* Department */}
              <div
                className={
                  styles.field
                }
              >
                <label htmlFor="department">
                  Department
                </label>

                <div
                  className={
                    styles.inputWithIcon
                  }
                >
                  <Activity
                    size={16}
                  />

                  <input
                    id="department"
                    type="text"
                    value={
                      profile.department
                    }
                    disabled={
                      !isEditing
                    }
                    onChange={(event) =>
                      updateField(
                        "department",
                        event.target
                          .value,
                      )
                    }
                    placeholder="Analytics"
                  />
                </div>
              </div>

              {/* Location */}
              <div
                className={`${styles.field} ${styles.fullField}`}
              >
                <label htmlFor="location">
                  Location
                </label>

                <div
                  className={
                    styles.inputWithIcon
                  }
                >
                  <MapPin
                    size={16}
                  />

                  <input
                    id="location"
                    type="text"
                    value={
                      profile.location
                    }
                    disabled={
                      !isEditing
                    }
                    onChange={(event) =>
                      updateField(
                        "location",
                        event.target
                          .value,
                      )
                    }
                    placeholder="City, State, Country"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* =================================================
              SECURITY
          ================================================== */}

          <section
            className={
              styles.card
            }
          >
            <div
              className={
                styles.cardHeader
              }
            >
              <div
                className={
                  styles.cardHeaderIcon
                }
              >
                <Shield
                  size={18}
                />
              </div>

              <div>
                <h3>
                  Security
                </h3>

                <p>
                  Protect your LOOP
                  account and login
                  access.
                </p>
              </div>
            </div>

            <div
              className={
                styles.securityList
              }
            >
              {/* Password */}
              <div
                className={
                  styles.securityItem
                }
              >
                <div
                  className={
                    styles.securityIcon
                  }
                >
                  <Lock
                    size={18}
                  />
                </div>

                <div
                  className={
                    styles.securityInfo
                  }
                >
                  <strong>
                    Password
                  </strong>

                  <span>
                    Keep your account
                    protected with a
                    strong password.
                  </span>
                </div>

                <button
                  type="button"
                  className={
                    styles.secondaryButton
                  }
                >
                  Change Password
                </button>
              </div>

              {/* 2FA */}
              <div
                className={
                  styles.securityItem
                }
              >
                <div
                  className={
                    styles.securityIcon
                  }
                >
                  <Shield
                    size={18}
                  />
                </div>

                <div
                  className={
                    styles.securityInfo
                  }
                >
                  <strong>
                    Two-Factor
                    Authentication
                  </strong>

                  <span>
                    {twoFactorEnabled
                      ? "Extra account protection is enabled."
                      : "Add an extra layer of security to your account."}
                  </span>
                </div>

                <span
                  className={
                    twoFactorEnabled
                      ? styles.enabledBadge
                      : styles.secondaryButton
                  }
                >
                  {twoFactorEnabled
                    ? "Enabled"
                    : "Not configured"}
                </span>
              </div>

              {/* Email verification */}
              <div
                className={
                  styles.securityItem
                }
              >
                <div
                  className={
                    styles.securityIcon
                  }
                >
                  <Mail
                    size={18}
                  />
                </div>

                <div
                  className={
                    styles.securityInfo
                  }
                >
                  <strong>
                    Email Verification
                  </strong>

                  <span>
                    {emailVerified
                      ? "Your email address has been verified."
                      : "Your email address is not verified yet."}
                  </span>
                </div>

                <span
                  className={
                    emailVerified
                      ? styles.enabledBadge
                      : styles.secondaryButton
                  }
                >
                  {emailVerified
                    ? "Verified"
                    : "Pending"}
                </span>
              </div>
            </div>
          </section>

          {/* =================================================
              PASSWORD CARD
          ================================================== */}

          <section
            className={
              styles.passwordPanel
            }
          >
            <div>
              <div
                className={
                  styles.cardHeaderIcon
                }
              >
                <KeyRound
                  size={18}
                />
              </div>

              <h3>
                Keep your account
                secure
              </h3>

              <p>
                Use a unique password
                and never share your
                LOOP login credentials
                with anyone.
              </p>
            </div>

            <button
              type="button"
              className={
                styles.passwordSave
              }
            >
              <KeyRound
                size={16}
              />

              Manage Password
            </button>
          </section>
        </div>

        {/* ===================================================
            SIDEBAR
        ==================================================== */}

        <aside
          className={
            styles.sidebar
          }
        >
          {/* =================================================
              ACCOUNT OVERVIEW
          ================================================== */}

          <section
            className={
              styles.sideCard
            }
          >
            <div
              className={
                styles.sideCardHeader
              }
            >
              <div
                className={
                  styles.cardHeaderIcon
                }
              >
                <Shield
                  size={17}
                />
              </div>

              <h3>
                Account Overview
              </h3>
            </div>

            <div
              className={
                styles.accountRows
              }
            >
              <div
                className={
                  styles.accountRow
                }
              >
                <span>
                  Role
                </span>

                <strong
                  className={
                    styles.roleBadge
                  }
                >
                  {role}
                </strong>
              </div>

              <div
                className={
                  styles.accountRow
                }
              >
                <span>
                  Status
                </span>

                <strong
                  className={
                    styles.activeStatus
                  }
                >
                  <span />

                  Active
                </strong>
              </div>

              <div
                className={
                  styles.accountRow
                }
              >
                <span>
                  Workspace
                </span>

                <strong>
                  {workspaceName}
                </strong>
              </div>

              <div
                className={
                  styles.accountRow
                }
              >
                <span>
                  Member Since
                </span>

                <strong>
                  {memberSince}
                </strong>
              </div>

              <div
                className={
                  styles.accountRow
                }
              >
                <span>
                  Last Login
                </span>

                <strong>
                  {lastLogin}
                </strong>
              </div>

              <div
                className={
                  styles.accountRow
                }
              >
                <span>
                  Profile
                </span>

                <strong>
                  {profileCompletion}%
                </strong>
              </div>
            </div>
          </section>

          {/* =================================================
              ACTIVITY
          ================================================== */}

          <section
            className={
              styles.sideCard
            }
          >
            <div
              className={
                styles.sideCardHeader
              }
            >
              <div
                className={
                  styles.cardHeaderIcon
                }
              >
                <Activity
                  size={17}
                />
              </div>

              <h3>
                Account Activity
              </h3>
            </div>

            <div
              className={
                styles.activityList
              }
            >
              {activityItems.map(
                (item) => {
                  const Icon =
                    item.icon;

                  return (
                    <div
                      className={
                        styles.activityItem
                      }
                      key={
                        item.title
                      }
                    >
                      <div
                        className={
                          styles.activityIcon
                        }
                      >
                        <Icon
                          size={15}
                        />
                      </div>

                      <div>
                        <strong>
                          {
                            item.title
                          }
                        </strong>

                        <span>
                          {
                            item.description
                          }
                        </span>
                      </div>
                    </div>
                  );
                },
              )}
            </div>

            <button
              type="button"
              className={
                styles.viewActivity
              }
            >
              View account
              activity
            </button>
          </section>

          {/* =================================================
              PREFERENCES
          ================================================== */}

          <section
            className={
              styles.sideCard
            }
          >
            <div
              className={
                styles.sideCardHeader
              }
            >
              <div
                className={
                  styles.cardHeaderIcon
                }
              >
                <Globe2
                  size={17}
                />
              </div>

              <h3>
                Preferences
              </h3>
            </div>

            <div
              className={
                styles.preferenceList
              }
            >
              {/* Notifications */}
              <div
                className={
                  styles.preferenceItem
                }
              >
                <div>
                  <strong>
                    Notifications
                  </strong>

                  <span>
                    Important account
                    notifications
                  </span>
                </div>

                <button
                  type="button"
                  className={`${styles.switch} ${
                    notifications
                      ? styles.switchActive
                      : ""
                  }`}
                  onClick={() =>
                    setNotifications(
                      (value) =>
                        !value,
                    )
                  }
                  aria-label="Toggle notifications"
                  aria-pressed={
                    notifications
                  }
                >
                  <span />
                </button>
              </div>

              {/* Email */}
              <div
                className={
                  styles.preferenceItem
                }
              >
                <div>
                  <strong>
                    Email Updates
                  </strong>

                  <span>
                    Product and
                    workspace updates
                  </span>
                </div>

                <button
                  type="button"
                  className={`${styles.switch} ${
                    emailUpdates
                      ? styles.switchActive
                      : ""
                  }`}
                  onClick={() =>
                    setEmailUpdates(
                      (value) =>
                        !value,
                    )
                  }
                  aria-label="Toggle email updates"
                  aria-pressed={
                    emailUpdates
                  }
                >
                  <span />
                </button>
              </div>

              {/* Weekly summary */}
              <div
                className={
                  styles.preferenceItem
                }
              >
                <div>
                  <strong>
                    Weekly Summary
                  </strong>

                  <span>
                    Weekly feedback
                    insights
                  </span>
                </div>

                <button
                  type="button"
                  className={`${styles.switch} ${
                    weeklySummary
                      ? styles.switchActive
                      : ""
                  }`}
                  onClick={() =>
                    setWeeklySummary(
                      (value) =>
                        !value,
                    )
                  }
                  aria-label="Toggle weekly summary"
                  aria-pressed={
                    weeklySummary
                  }
                >
                  <span />
                </button>
              </div>
            </div>
          </section>

          {/* =================================================
              HELP
          ================================================== */}

          <section
            className={
              styles.helpCard
            }
          >
            <div
              className={
                styles.helpIcon
              }
            >
              <Bell
                size={19}
              />
            </div>

            <div>
              <h3>
                Need help?
              </h3>

              <p>
                Contact your LOOP
                workspace
                administrator if
                you need help with
                your account.
              </p>

              <Link
                href="/protected/analyst/settings"
              >
                Open Settings
              </Link>
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}
