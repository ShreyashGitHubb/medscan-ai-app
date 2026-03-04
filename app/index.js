

import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, Modal, FlatList } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS, GRADIENTS } from '../constants/theme';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '../context/LanguageContext';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const FeatureCard = ({ title, description, icon, type, color, router }) => {
    return (
        <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/scan/${type}`)}
            activeOpacity={0.9}
        >
            <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
                <Text style={{ fontSize: 24 }}>{icon}</Text>
            </View>
            <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{title}</Text>
                <Text style={styles.cardDesc}>{description}</Text>
            </View>
            <View style={[styles.arrowBtn, { backgroundColor: color }]}>
                <Text style={styles.arrowText}>→</Text>
            </View>
        </TouchableOpacity>
    );
};

export default function Dashboard() {
    const router = useRouter();
    const { t, language, changeLanguage } = useLanguage();
    const [langModalVisible, setLangModalVisible] = useState(false);

    const languages = [
        { code: 'en', name: 'English', flag: '🇺🇸' },
        { code: 'hi', name: 'हिंदी (Hindi)', flag: '🇮🇳' },
        { code: 'ta', name: 'தமிழ் (Tamil)', flag: '🇮🇳' },
        { code: 'te', name: 'తెలుగు (Telugu)', flag: '🇮🇳' },
        { code: 'kn', name: 'ಕನ್ನಡ (Kannada)', flag: '🇮🇳' },
        { code: 'bn', name: 'বাংলা (Bengali)', flag: '🇮🇳' },
        { code: 'mr', name: 'मराठी (Marathi)', flag: '🇮🇳' },
        { code: 'gu', name: 'ગુજરાતી (Gujarati)', flag: '🇮🇳' },
        { code: 'ml', name: 'മലയാളം (Malayalam)', flag: '🇮🇳' },
        { code: 'es', name: 'Español (Spanish)', flag: '🇪🇸' },
        { code: 'fr', name: 'Français (French)', flag: '🇫🇷' },
    ];
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* Header Section */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>{t('welcome')}</Text>
                        <Text style={styles.appName}>MedScan AI</Text>
                    </View>

                    <View style={{ flexDirection: 'row', gap: 12 }}>
                        <TouchableOpacity
                            style={styles.iconButton}
                            onPress={() => setLangModalVisible(true)}
                        >
                            <Text style={{ fontSize: 24 }}>🌐</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.iconButton}
                            onPress={() => router.push('/history')}
                        >
                            <Text style={{ fontSize: 24 }}>📜</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.avatar}
                            onPress={() => router.push('/about')}
                        >
                            <Text style={styles.avatarText}>HP</Text>
                        </TouchableOpacity>
                    </View>
                </View>


                {/* Hero Section */}
                <LinearGradient
                    colors={GRADIENTS.primary}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.hero}
                >
                    <Text style={styles.heroTitle}>Advanced Medical Analysis</Text>
                    <Text style={styles.heroSubtitle}>
                        {t('subtitle')}
                    </Text>
                </LinearGradient>

                {/* Features Grid */}
                <Text style={styles.sectionTitle}>{t('start_analysis')}</Text>

                <FeatureCard
                    title={t('skin_analysis')}
                    description={t('skin_desc')}
                    icon="🧴"
                    type="skin"
                    color="#0891b2"
                    router={router}
                />



                <FeatureCard
                    title={t('mri_analysis')}
                    description={t('mri_desc')}
                    icon="🧠"
                    type="mri"
                    color="#10b981"
                    router={router}
                />

                <FeatureCard
                    title={t('fracture_analysis')}
                    description={t('fracture_desc')}
                    icon="🦴"
                    type="fracture"
                    color="#f59e0b"
                    router={router}
                />



                <FeatureCard
                    title={t('tooth_analysis')}
                    description={t('tooth_desc')}
                    icon="🦷"
                    type="tooth"
                    color="#f43f5e"
                    router={router}
                />

                <View style={styles.footer}>
                    <Text style={styles.footerText}>MedScan AI Mobile v1.0.0</Text>
                </View>

            </ScrollView>

            {/* Language Selection Modal */}
            <Modal
                visible={langModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setLangModalVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setLangModalVisible(false)}
                >
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Select Language</Text>
                        <FlatList
                            data={languages}
                            keyExtractor={item => item.code}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[styles.langItem, language === item.code && styles.activeLangItem]}
                                    onPress={() => {
                                        changeLanguage(item.code);
                                        setLangModalVisible(false);
                                    }}
                                >
                                    <Text style={{ fontSize: 24 }}>{item.flag}</Text>
                                    <Text style={[styles.langName, language === item.code && styles.activeLangName]}>
                                        {item.name}
                                    </Text>
                                    {language === item.code && (
                                        <Ionicons name="checkmark" size={20} color={COLORS.primary} />
                                    )}
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    greeting: {
        fontSize: 16,
        color: COLORS.mutedForeground,
        fontWeight: '500',
    },
    appName: {
        fontSize: 28,
        fontWeight: '800',
        color: COLORS.foreground,
        letterSpacing: -0.5,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: COLORS.secondary,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    iconButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: COLORS.card,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.sm,
    },
    avatarText: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.primary,
    },
    hero: {
        padding: 24,
        borderRadius: 24,
        marginBottom: 32,
        ...SHADOWS.glow,
    },
    heroTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    heroSubtitle: {
        fontSize: 14,
        color: '#E0F2FE',
        lineHeight: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.foreground,
        marginBottom: 16,
    },
    card: {
        backgroundColor: COLORS.card,
        borderRadius: 20,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.card,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    cardContent: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.foreground,
        marginBottom: 4,
    },
    cardDesc: {
        fontSize: 13,
        color: COLORS.mutedForeground,
    },
    arrowBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 12,
    },
    arrowText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    footer: {
        marginTop: 24,
        alignItems: 'center',
    },
    footerText: {
        color: COLORS.mutedForeground,
        fontSize: 12,
    },
    footerText: {
        color: COLORS.mutedForeground,
        fontSize: 12,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 24
    },
    modalContent: {
        backgroundColor: COLORS.card,
        borderRadius: 24,
        padding: 24,
        ...SHADOWS.card
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.foreground,
        marginBottom: 16,
        textAlign: 'center'
    },
    langItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        gap: 12
    },
    activeLangItem: {
        backgroundColor: COLORS.secondary + '50', // light highlight
        paddingHorizontal: 12,
        borderRadius: 12,
        borderBottomWidth: 0,
        marginVertical: 4
    },
    langName: {
        fontSize: 16,
        fontWeight: '500',
        color: COLORS.foreground,
        flex: 1
    },
    activeLangName: {
        color: COLORS.primary,
        fontWeight: '700'
    }
});
