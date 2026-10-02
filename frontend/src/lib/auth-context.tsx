"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "./supabase/client";
import { Student } from "@/types/academic";
import { getStudentProfile } from "./academic/service";
import { env } from "@/lib/env";
import { useRouter } from "next/navigation";

interface ProfileRecord {
  id: string;
  full_name?: string | null;
  email?: string | null;
  avatar_url?: string | null;
  university?: string | null;
  department?: string | null;
  year?: number | null;
  semester?: number | null;
  roll_number?: string | null;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  university?: string;
  department?: string;
  year?: number;
  semester?: number;
  rollNumber?: string;
  fullName?: string;
  avatarUrl?: string;
  created_at?: string;
  updated_at?: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  student: UserProfile | null; // Compatibility alias
  studentProfile: Student | null; // Genuine Student row from students table
  isAuthenticated: boolean;
  isLoading: boolean;
  isOAuthEnabled: boolean;
  signIn: (email: string, password?: string) => Promise<{ error?: string }>;
  login: (email: string, password?: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error?: string; requiresVerification?: boolean }>;
  signup: (email: string, password: string, fullName: string) => Promise<{ error?: string; requiresVerification?: boolean }>;
  signInWithGoogle: () => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error?: string }>;
  updateStudentProfile: (updates: Partial<UserProfile>) => Promise<{ error?: string }>;
  loginAsDemo: () => void;
  refreshStudentProfile: () => Promise<void>;
  deleteAccount: () => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [studentRecord, setStudentRecord] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const isOAuthEnabled = env.isGoogleOAuthEnabled;

  const formatProfile = (data: ProfileRecord, fallbackEmail: string): UserProfile => ({
    id: data.id,
    full_name: data.full_name || fallbackEmail.split("@")[0],
    fullName: data.full_name || fallbackEmail.split("@")[0],
    email: data.email || fallbackEmail,
    avatar_url: data.avatar_url || "",
    avatarUrl: data.avatar_url || "",
    university: data.university || "Institute of Technology & Science",
    department: data.department || "Computer Science & Engineering",
    year: data.year || 1,
    semester: data.semester || 1,
    rollNumber: data.roll_number || `LT-${data.id?.substring(0, 8) || "NEW"}`,
    created_at: data.created_at,
    updated_at: data.updated_at,
  });

  const fetchProfileAndStudent = useCallback(async (userId: string, userEmail: string, userMetadata?: Record<string, unknown>) => {
    try {
      // 1. Fetch or initialize profile
      const { data: profileData, error: profileErr } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      let activeProfile: UserProfile;

      const metaName = typeof userMetadata?.full_name === "string"
        ? userMetadata.full_name
        : typeof userMetadata?.name === "string"
        ? userMetadata.name
        : undefined;
      const metaAvatar = typeof userMetadata?.avatar_url === "string"
        ? userMetadata.avatar_url
        : typeof userMetadata?.picture === "string"
        ? userMetadata.picture
        : undefined;

      if (!profileData && !profileErr) {
        // Fallback profile creation if trigger hasn't fired yet
        const initialFullName = metaName || userEmail.split("@")[0];
        const initialAvatar = metaAvatar || "";
        const { data: insertedProfile } = await supabase
          .from("profiles")
          .upsert({
            id: userId,
            full_name: initialFullName,
            email: userEmail,
            avatar_url: initialAvatar,
            university: "Institute of Technology & Science",
            department: "Computer Science & Engineering",
            year: 1,
            semester: 1,
          })
          .select()
          .single();

        activeProfile = formatProfile(insertedProfile || { id: userId, full_name: initialFullName, email: userEmail, avatar_url: initialAvatar }, userEmail);
      } else if (profileData) {
        activeProfile = formatProfile(profileData, userEmail);
      } else {
        const initialFullName = metaName || userEmail.split("@")[0];
        const initialAvatar = metaAvatar || "";
        activeProfile = formatProfile({ id: userId, full_name: initialFullName, email: userEmail, avatar_url: initialAvatar }, userEmail);
      }

      setProfile(activeProfile);

      // 2. Fetch or initialize student record
      let student = await getStudentProfile(userId);
      if (!student) {
        // Create initial student record if not yet created
        const { data: createdStudent } = await supabase
          .from("students")
          .insert({
            profile_id: userId,
            roll_number: `LT-${userId.substring(0, 8)}`,
            university: activeProfile.university,
            department: activeProfile.department,
            year: activeProfile.year,
            semester: activeProfile.semester,
            section: "A",
          })
          .select()
          .single();

        student = createdStudent || null;
      }
      setStudentRecord(student);
    } catch (e) {
      console.error("[LearnTrack Auth] Error loading profile/student:", e);
    }
  }, []);

  const userId = user?.id;
  const refreshStudentProfile = useCallback(async () => {
    if (userId) {
      const student = await getStudentProfile(userId);
      setStudentRecord(student);
    }
  }, [userId]);

  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error("[LearnTrack Auth] getSession error:", error.message);
        }

        if (session?.user && mounted) {
          setUser(session.user);
          await fetchProfileAndStudent(session.user.id, session.user.email || "", session.user.user_metadata);
        } else if (mounted) {
          setUser(null);
          setProfile(null);
          setStudentRecord(null);
        }
      } catch (err) {
        console.error("[LearnTrack Auth] Auth initialization failed:", err);
      } finally {
        if (mounted) setIsLoading(false);
      }

      // Realtime listener for auth state changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (!mounted) return;

          if (event === "SIGNED_OUT") {
            setUser(null);
            setProfile(null);
            setStudentRecord(null);
            setIsLoading(false);
            if (
              typeof window !== "undefined" &&
              !window.location.pathname.startsWith("/login") &&
              !window.location.pathname.startsWith("/signup") &&
              window.location.pathname !== "/"
            ) {
              router.push("/login");
            }
            return;
          }

          if (session?.user) {
            setUser(session.user);
            await fetchProfileAndStudent(session.user.id, session.user.email || "", session.user.user_metadata);
          } else {
            setUser(null);
            setProfile(null);
            setStudentRecord(null);
          }
          setIsLoading(false);
        }
      );

      return () => {
        mounted = false;
        subscription.unsubscribe();
      };
    }

    initializeAuth();
  }, [fetchProfileAndStudent, router]);

  const signIn = async (email: string, password?: string) => {
    if (!password) {
      return { error: "Password is required for student authentication." };
    }

    setIsLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setIsLoading(false);

    if (error) {
      return { error: error.message };
    }

    if (data.user) {
      setUser(data.user);
      await fetchProfileAndStudent(data.user.id, data.user.email || "", data.user.user_metadata);
    }
    return {};
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    setIsLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });
    setIsLoading(false);

    if (error) {
      return { error: error.message };
    }

    if (data.user) {
      setUser(data.user);
      const requiresVerification = !data.session;
      if (data.session) {
        await fetchProfileAndStudent(data.user.id, email, { full_name: fullName });
      }
      return { requiresVerification };
    }
    return {};
  };

  const signInWithGoogle = async () => {
    if (!isOAuthEnabled) {
      return { error: "Google OAuth is not enabled in this project configuration." };
    }
    try {
      const redirectUrl = typeof window !== "undefined"
        ? `${window.location.origin}/auth/callback`
        : "/auth/callback";

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: "offline",
            prompt: "select_account",
          },
        },
      });
      if (error) {
        console.error("[LearnTrack Auth] Google OAuth error:", error.message);
        return { error: error.message };
      }
      return {};
    } catch (err: unknown) {
      console.error("[LearnTrack Auth] Unexpected Google OAuth error:", err);
      const message = err instanceof Error ? err.message : "Unable to initiate Google sign-in.";
      return { error: message };
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("[LearnTrack Auth] signOut error:", err);
    } finally {
      setUser(null);
      setProfile(null);
      setStudentRecord(null);
      setIsLoading(false);
      router.push("/login");
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { error: "User not authenticated" };

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: updates.full_name || updates.fullName,
          avatar_url: updates.avatar_url || updates.avatarUrl,
          university: updates.university,
          department: updates.department,
          year: updates.year,
          semester: updates.semester,
        })
        .eq("id", user.id);

      if (error) return { error: error.message };

      if (profile) {
        setProfile({ ...profile, ...updates });
      }
      return {};
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update profile";
      return { error: message };
    }
  };

  // Demo sign in explicitly disabled in favor of real Supabase Auth
  const loginAsDemo = () => {
    console.warn("[LearnTrack Auth] Demo login is disabled. Real Supabase authentication is required.");
  };

  const deleteAccount = async (): Promise<{ error?: string }> => {
    if (!user) return { error: "User not authenticated" };

    try {
      await supabase.from("students").delete().eq("profile_id", user.id);
      await supabase.from("profiles").delete().eq("id", user.id);
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      setStudentRecord(null);
      router.push("/login");
      return {};
    } catch (err: unknown) {
      console.error("[LearnTrack Auth] Account deletion failed:", err);
      const message = err instanceof Error ? err.message : "Failed to delete account";
      return { error: message };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        student: profile,
        studentProfile: studentRecord,
        isAuthenticated: !!user,
        isLoading,
        isOAuthEnabled,
        signIn,
        login: signIn,
        signUp,
        signup: signUp,
        signInWithGoogle,
        signOut,
        logout: signOut,
        updateProfile,
        updateStudentProfile: updateProfile,
        loginAsDemo,
        refreshStudentProfile,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
