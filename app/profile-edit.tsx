import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Camera, User, Phone, Mail, MapPin } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { Theme } from '@/constants/theme';
import { useStudent } from '@/contexts/StudentContext';

export default function ProfileEditScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { student } = useStudent();

    const [firstName, setFirstName] = useState(student.firstName);
    const [lastName, setLastName] = useState(student.lastName);
    const [phone, setPhone] = useState(student.phone);
    const [address, setAddress] = useState(student.address);
    const [profileImage, setProfileImage] = useState<string | null>(null);

    const handlePickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setProfileImage(result.assets[0].uri);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
    };

    const handleSave = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        // Here we would typically update the database
        Alert.alert(
            "Success",
            "Your profile has been updated locally. (In a production app, this would sync to Supabase)",
            [{ text: "OK", onPress: () => router.back() }]
        );
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => router.back()}
                >
                    <ArrowLeft size={24} color={Theme.colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.title}>Edit Profile</Text>
                <TouchableOpacity onPress={handleSave}>
                    <Text style={styles.saveText}>Save</Text>
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                    <View style={styles.avatarSection}>
                        <View style={styles.avatarContainer}>
                            {profileImage ? (
                                <Image source={{ uri: profileImage }} style={styles.avatar} />
                            ) : (
                                <View style={styles.avatarPlaceholder}>
                                    <Text style={styles.avatarText}>{student.firstName[0]}{student.lastName[0]}</Text>
                                </View>
                            )}
                            <TouchableOpacity style={styles.cameraBtn} onPress={handlePickImage}>
                                <Camera size={20} color={Theme.colors.background} />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.avatarLabel}>Tap to change photo</Text>
                    </View>

                    <Text style={styles.sectionTitle}>Basic Information</Text>
                    <View style={styles.inputGroup}>
                        <InputRow
                            icon={<User size={18} color={Theme.colors.textSecondary} />}
                            label="First Name"
                            value={firstName}
                            onChangeText={setFirstName}
                        />
                        <InputRow
                            icon={<User size={18} color={Theme.colors.textSecondary} />}
                            label="Last Name"
                            value={lastName}
                            onChangeText={setLastName}
                        />
                    </View>

                    <Text style={styles.sectionTitle}>Contact Info</Text>
                    <View style={styles.inputGroup}>
                        <InputRow
                            icon={<Phone size={18} color={Theme.colors.textSecondary} />}
                            label="Phone Number"
                            value={phone}
                            onChangeText={setPhone}
                            keyboardType="phone-pad"
                        />
                        <View style={styles.readOnlyRow}>
                            <Mail size={18} color={Theme.colors.textTertiary} />
                            <View style={{ flex: 1, marginLeft: 12 }}>
                                <Text style={styles.readOnlyLabel}>Email (Cannot change)</Text>
                                <Text style={styles.readOnlyValue}>{student.email}</Text>
                            </View>
                        </View>
                    </View>

                    <Text style={styles.sectionTitle}>Address</Text>
                    <View style={styles.inputGroup}>
                        <TextInput
                            style={styles.textArea}
                            value={address}
                            onChangeText={setAddress}
                            multiline
                            numberOfLines={4}
                            placeholder="Home Address"
                            placeholderTextColor={Theme.colors.textTertiary}
                        />
                    </View>

                    <View style={{ height: 40 }} />
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

function InputRow({
    icon,
    label,
    value,
    onChangeText,
    keyboardType = 'default',
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    keyboardType?: any;
}) {
    return (
        <View style={styles.inputRow}>
            {icon}
            <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.inputLabel}>{label}</Text>
                <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={onChangeText}
                    keyboardType={keyboardType}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Theme.layout.paddingHorizontal,
        height: 60,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Theme.colors.surface,
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    title: {
        ...Theme.typography.h3,
    },
    saveText: {
        ...Theme.typography.h3,
        color: Theme.colors.primary,
    },
    scroll: {
        paddingHorizontal: Theme.layout.paddingHorizontal,
        paddingTop: Theme.spacing.lg,
    },
    avatarSection: {
        alignItems: 'center',
        marginVertical: Theme.spacing.xl,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: Theme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        ...Theme.typography.h1,
        color: Theme.colors.background,
        fontSize: 32,
    },
    cameraBtn: {
        position: 'absolute',
        right: 0,
        bottom: 0,
        backgroundColor: Theme.colors.primary,
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: Theme.colors.background,
    },
    avatarLabel: {
        ...Theme.typography.caption,
        marginTop: 12,
        color: Theme.colors.textSecondary,
    },
    sectionTitle: {
        ...Theme.typography.caption,
        textTransform: 'uppercase',
        marginBottom: 12,
        marginTop: 24,
        marginLeft: 4,
    },
    inputGroup: {
        backgroundColor: Theme.colors.surface,
        borderRadius: Theme.layout.borderRadiusCard,
        paddingHorizontal: Theme.spacing.md,
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: Theme.colors.border,
    },
    inputLabel: {
        fontSize: 12,
        color: Theme.colors.textTertiary,
        marginBottom: 2,
    },
    input: {
        ...Theme.typography.h3,
        fontSize: 16,
        padding: 0,
    },
    readOnlyRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        opacity: 0.7,
    },
    readOnlyLabel: {
        fontSize: 12,
        color: Theme.colors.textTertiary,
        marginBottom: 2,
    },
    readOnlyValue: {
        ...Theme.typography.h3,
        fontSize: 16,
        color: Theme.colors.textTertiary,
    },
    textArea: {
        ...Theme.typography.h3,
        fontSize: 16,
        paddingVertical: 12,
        minHeight: 100,
        textAlignVertical: 'top',
    },
});
