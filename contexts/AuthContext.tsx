import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import createContextHook from '@nkzw/create-context-hook';
import { supabase } from '@/lib/supabase';
import { Alert, AppState } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

// Ensure the browser closes automatically when app state changes on Android/iOS
AppState.addEventListener('change', (state) => {
    if (state === 'active') {
        WebBrowser.maybeCompleteAuthSession();
    }
});

export type UserRole = 'student' | 'teacher' | 'admin';

interface AuthState {
    isAuthenticated: boolean;
    role: UserRole | null;
    hasSeenOnboarding: boolean;
    userId?: string | null;
}

const ONBOARDING_KEY = 'has_seen_onboarding';
const LOCAL_ROLE_KEY = 'local_user_role';

export const [AuthProvider, useAuth] = createContextHook(() => {
    const queryClient = useQueryClient();
    const [authState, setAuthState] = useState<AuthState>({
        isAuthenticated: false,
        role: null,
        hasSeenOnboarding: false,
        userId: null,
    });
    const [isReady, setIsReady] = useState(false);
    const [isSigningIn, setIsSigningIn] = useState(false);

    const authQuery = useQuery({
        queryKey: ['auth-state'],
        queryFn: async () => {
            const onboardingData = await AsyncStorage.getItem(ONBOARDING_KEY);
            const hasSeenOnboarding = onboardingData === 'true';

            const { data: { session } } = await supabase.auth.getSession();

            if (session) {
                // Check requested role to allow superuser multiplexing
                const localRole = await AsyncStorage.getItem(LOCAL_ROLE_KEY) as UserRole;
                const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();

                let validatedRole = localRole;
                // Security fallback if true deployment: restrict by what profile truly allows
                // For now, if profile is admin, they can pretend to be teacher or admin
                if (profile && profile.role !== 'admin' && localRole === 'admin') {
                    validatedRole = profile.role as UserRole;
                }

                return {
                    isAuthenticated: true,
                    role: validatedRole || profile?.role || 'student',
                    hasSeenOnboarding,
                    userId: session.user.id
                } as AuthState;
            }

            return { isAuthenticated: false, role: null, hasSeenOnboarding } as AuthState;
        },
    });

    useEffect(() => {
        if (authQuery.data) {
            setAuthState(authQuery.data);
            setIsReady(true);
        }
    }, [authQuery.data]);

    const signUp = async (email: string, password: string, name: string, role: UserRole) => {
        setIsSigningIn(true);
        try {
            const { data, error } = await supabase.auth.signUp({
                email: email.trim(),
                password,
                options: {
                    data: {
                        full_name: name,
                    }
                }
            });

            if (error) {
                Alert.alert("Registration Failed", error.message);
                setIsSigningIn(false);
                return false;
            }

            if (data.user) {
                // Manually create profile because trigger might be slow or not setup for custom data
                const names = name.split(' ');
                const firstName = names[0];
                const lastName = names.slice(1).join(' ') || 'User';

                const { error: profileError } = await supabase.from('profiles').insert({
                    id: data.user.id,
                    role,
                    first_name: firstName,
                    last_name: lastName,
                });

                if (profileError) {
                    console.error("Profile creation error:", profileError);
                }

                Alert.alert("Success", "Account created successfully. Please check your email for a confirmation link.");
                setIsSigningIn(false);
                return true;
            }

            setIsSigningIn(false);
            return false;
        } catch (err: any) {
            Alert.alert("Error", err.message);
            setIsSigningIn(false);
            return false;
        }
    };

    const signIn = async (email?: string, password?: string, requestedRole?: UserRole) => {
        setIsSigningIn(true);
        try {
            if (!email || !password || !requestedRole) {
                // Backward compatibility with mock dev buttons or direct routing
                if (requestedRole) {
                    await AsyncStorage.setItem(LOCAL_ROLE_KEY, requestedRole);
                    setAuthState(prev => ({ ...prev, isAuthenticated: true, role: requestedRole }));
                }
                setIsSigningIn(false);
                return true;
            }

            console.log(`[AUTH] Attempting login for: '${email.trim()}' | pass length: ${password.length}`);
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password,
            });

            console.log(`[AUTH] Res:`, data, `| Err:`, error?.message);

            if (error) {
                Alert.alert("Login Failed", `${error.message}. Checking exact error...`);
                setIsSigningIn(false);
                return false;
            }

            if (data.session) {
                const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single();
                let validatedRole = requestedRole;

                if (profile && profile.role !== 'admin' && requestedRole === 'admin') {
                    Alert.alert("Permission Denied", "Your account does not have admin permissions.");
                    await supabase.auth.signOut();
                    setIsSigningIn(false);
                    return false;
                }

                await AsyncStorage.setItem(LOCAL_ROLE_KEY, validatedRole);
                await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
                setAuthState({
                    isAuthenticated: true,
                    role: validatedRole,
                    hasSeenOnboarding: true,
                    userId: data.user.id
                });
                queryClient.invalidateQueries({ queryKey: ['auth-state'] });
                setIsSigningIn(false);
                return true;
            }

            setIsSigningIn(false);
            return false;
        } catch (err: any) {
            Alert.alert("Error", err.message);
            setIsSigningIn(false);
            return false;
        }
    };

    const signInWithGoogle = async (requestedRole: UserRole) => {
        setIsSigningIn(true);
        try {
            await AsyncStorage.setItem(LOCAL_ROLE_KEY, requestedRole);

            // Use Expo Linking to create a callback URL dynamically
            const redirectUrl = Linking.createURL('/auth/callback');

            // Generate an OAuth URL without triggering the browser directly from the Supabase client
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: redirectUrl,
                    skipBrowserRedirect: true, // Crucial for native OAuth flows to not crash
                }
            });

            if (error) {
                Alert.alert("Google Login Failed", error.message);
                setIsSigningIn(false);
                return false;
            }

            if (data?.url) {
                const response = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
                if (response.type === 'success') {
                    // Extract the session hash/token that supabase returns from the auth provider redirect
                    let urlToParse = response.url;
                    if (urlToParse.includes('#')) {
                        urlToParse = urlToParse.replace('#', '?');
                    }

                    try {
                        let queryStr = urlToParse.split('?')[1] || '';

                        // React Native URLSearchParams polyfill can be flaky, parse it manually
                        const params: Record<string, string> = {};
                        queryStr.split('&').forEach(pair => {
                            const [key, value] = pair.split('=');
                            if (key && value) {
                                params[key] = decodeURIComponent(value);
                            }
                        });

                        const accessToken = params['access_token'];
                        const refreshToken = params['refresh_token'];

                        if (accessToken && refreshToken) {
                            const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
                                access_token: accessToken,
                                refresh_token: refreshToken
                            });

                            if (!sessionError && sessionData.session) {
                                // Just like email/pass, set auth state here
                                const { data: profile } = await supabase.from('profiles').select('role').eq('id', sessionData.session.user.id).single();

                                let validatedRole = requestedRole;
                                if (profile && profile.role !== 'admin' && requestedRole === 'admin') {
                                    Alert.alert("Permission Denied", "Your account does not have admin permissions.");
                                    await supabase.auth.signOut();
                                    setIsSigningIn(false);
                                    return false;
                                }

                                await AsyncStorage.setItem(LOCAL_ROLE_KEY, validatedRole);
                                await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
                                setAuthState({
                                    isAuthenticated: true,
                                    role: validatedRole,
                                    hasSeenOnboarding: true,
                                    userId: sessionData.session.user.id
                                });
                                queryClient.invalidateQueries({ queryKey: ['auth-state'] });
                                setIsSigningIn(false);
                                return true;
                            }
                        }
                    } catch (parseErr) {
                        console.error("URL Parse error", parseErr);
                    }
                }
            }

            setIsSigningIn(false);
            return false;
        } catch (err: any) {
            Alert.alert("Error", err.message);
            setIsSigningIn(false);
            return false;
        }
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        await AsyncStorage.removeItem(LOCAL_ROLE_KEY);
        setAuthState(prev => ({ ...prev, isAuthenticated: false, role: null, userId: null }));
        queryClient.invalidateQueries({ queryKey: ['auth-state'] });
    };

    const completeOnboardingMutation = useMutation({
        mutationFn: async () => {
            await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
        },
        onSuccess: () => {
            setAuthState((prev) => ({ ...prev, hasSeenOnboarding: true }));
        },
    });

    const completeOnboarding = useCallback(() => {
        completeOnboardingMutation.mutate();
    }, [completeOnboardingMutation]);

    return {
        isAuthenticated: authState.isAuthenticated,
        role: authState.role,
        userId: authState.userId,
        hasSeenOnboarding: authState.hasSeenOnboarding,
        isReady,
        isSigningIn,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        completeOnboarding,
    };
});
