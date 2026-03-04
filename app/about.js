import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Linking } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

export default function AboutScreen() {
    const router = useRouter();

    const models = [
        { name: 'DermNet (Skin)', type: 'ResNet50', acc: '89%', desc: 'Detects 23 skin diseases including Melanoma, Eczema, and Acne.' },
        { name: 'BrainTumorNet (MRI)', type: 'Custom CNN', acc: '91%', desc: 'Classifies brain tumors (Glioma, Meningioma, Pituitary).' },
        { name: 'FractureNet', type: 'VGG16', acc: '92%', desc: 'Identifies bone fractures in X-ray images.' },
        { name: 'DentalAI', type: 'EfficientNetV2-S', acc: '88%', desc: 'Identifies cavities, gingivitis, and tooth decay.' },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.foreground} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>About MedScan AI</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scroll}>
                {/* Hero Section */}
                <View style={styles.hero}>
                    <View style={styles.logoContainer}>
                        <Text style={styles.logoText}>🩺</Text>
                    </View>
                    <Text style={styles.appName}>MedScan AI</Text>
                    <Text style={styles.version}>Version 1.0.0 (Beta)</Text>
                </View>

                {/* WARNING CARD */}
                <View style={styles.warningCard}>
                    <View style={styles.warningHeader}>
                        <Ionicons name="warning" size={24} color="#dc2626" />
                        <Text style={styles.warningTitle}>IMPORTANT MEDICAL DISCLAIMER</Text>
                    </View>
                    <Text style={styles.warningText}>
                        This application uses Artificial Intelligence to analyze medical images.
                        AI models can make mistakes and <Text style={{ fontWeight: 'bold' }}>should NOT be used as a substitute for professional medical advice</Text>.
                    </Text>
                    <Text style={[styles.warningText, { marginTop: 10 }]}>
                        Always consult a certified doctor or specialist for a final diagnosis. Do not ignore professional medical advice based on these results.
                    </Text>
                </View>

                {/* AI Models Section */}
                <Text style={styles.sectionTitle}>Our AI Models</Text>
                {models.map((m, i) => (
                    <View key={i} style={styles.modelCard}>
                        <View style={styles.modelHeader}>
                            <Text style={styles.modelName}>{m.name}</Text>
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{m.type}</Text>
                            </View>
                        </View>
                        <Text style={styles.modelDesc}>{m.desc}</Text>
                        <Text style={styles.modelAcc}>Validation Accuracy: <Text style={{ color: COLORS.primary, fontWeight: 'bold' }}>{m.acc}</Text></Text>
                    </View>
                ))}

                {/* Datasets & Credits Section */}
                <Text style={styles.sectionTitle}>Datasets & Credits</Text>
                <View style={styles.modelCard}>
                    <Text style={[styles.modelName, { marginBottom: 10 }]}>Training Data Sources</Text>

                    <View style={styles.datasetItem}>
                        <Text style={styles.datasetTitle}>Brain Tumor MRI Dataset</Text>
                        <Text style={styles.datasetInfo}>By Masoud Nickparvar (Kaggle)</Text>
                        <Text style={styles.datasetDesc}>7,023 images classifying Glioma, Meningioma, Pituitary, and No Tumor.</Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.datasetItem}>
                        <Text style={styles.datasetTitle}>Fracture Multi-Region X-ray</Text>
                        <Text style={styles.datasetInfo}>By Bmadushani Rodrigo (Kaggle)</Text>
                        <Text style={styles.datasetDesc}>10,509 images for bone fracture classification (Fractured/Normal).</Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.datasetItem}>
                        <Text style={styles.datasetTitle}>DermNet</Text>
                        <Text style={styles.datasetInfo}>By Shubham Goel (Kaggle)</Text>
                        <Text style={styles.datasetDesc}>Large-scale dataset with 23 classes of skin diseases including Acne and Melanoma.</Text>
                    </View>
                </View>

                {/* Developer Info */}
                <Text style={styles.sectionTitle}>Developer</Text>
                <TouchableOpacity style={styles.devCard} onPress={() => Linking.openURL('https://github.com/ShreyashGitHubb')}>
                    <View style={styles.devIcon}>
                        <Ionicons name="person" size={24} color={COLORS.primary} />
                    </View>
                    <View>
                        <Text style={styles.devName}>Shreyash Vishwakarma</Text>
                        <Text style={styles.devRole}>Lead Developer & AI Engineer</Text>
                    </View>
                    <Ionicons name="open-outline" size={20} color={COLORS.mutedForeground} style={{ marginLeft: 'auto' }} />
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    backBtn: {
        padding: 8,
        marginRight: 10,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.foreground,
    },
    scroll: {
        padding: 20,
        paddingBottom: 40,
    },
    hero: {
        alignItems: 'center',
        marginBottom: 30,
    },
    logoContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.card,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
        ...SHADOWS.card,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    logoText: {
        fontSize: 40,
    },
    appName: {
        fontSize: 24,
        fontWeight: '800',
        color: COLORS.foreground,
    },
    version: {
        fontSize: 14,
        color: COLORS.mutedForeground,
    },
    warningCard: {
        backgroundColor: '#fef2f2',
        borderWidth: 1,
        borderColor: '#fca5a5',
        borderRadius: 16,
        padding: 16,
        marginBottom: 30,
    },
    warningHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 8,
    },
    warningTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#dc2626',
    },
    warningText: {
        fontSize: 14,
        color: '#7f1d1d',
        lineHeight: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.foreground,
        marginBottom: 15,
        marginTop: 10,
    },
    modelCard: {
        backgroundColor: COLORS.card,
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.sm,
    },
    modelHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    modelName: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.foreground,
    },
    badge: {
        backgroundColor: COLORS.secondary,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    modelDesc: {
        fontSize: 13,
        color: COLORS.mutedForeground,
        marginBottom: 8,
    },
    modelAcc: {
        fontSize: 12,
        color: COLORS.mutedForeground,
        fontWeight: '500',
    },
    devCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.card,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        gap: 15,
    },
    devIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.secondary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    devName: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.foreground,
    },
    devRole: {
        fontSize: 12,
        color: COLORS.mutedForeground,
    },
    datasetItem: {
        marginBottom: 8,
    },
    datasetTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.foreground,
    },
    datasetInfo: {
        fontSize: 12,
        color: COLORS.primary,
        marginBottom: 2,
    },
    datasetDesc: {
        fontSize: 12,
        color: COLORS.mutedForeground,
        fontStyle: 'italic',
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginVertical: 10,
    }
});
