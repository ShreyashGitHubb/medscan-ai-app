import React, { useState, useEffect } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { COLORS, SHADOWS } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

const QUESTIONS = {
    skin: [
        { id: 'duration', text: 'How long have you had this mark?', placeholder: 'e.g., 2 weeks, 1 year' },
        { id: 'sensation', text: 'Is it itchy, painful, or bleeding?', placeholder: 'e.g., Yes, itchy and bleeds sometimes' },
        { id: 'change', text: 'Has it changed in size or color recently?', placeholder: 'e.g., Yes, became darker' }
    ],
    xray: [
        { id: 'symptoms', text: 'What are your main symptoms?', placeholder: 'e.g., Cough, fever, chest pain' },
        { id: 'duration', text: 'How long have symptoms persisted?', placeholder: 'e.g., 3 days, 1 week' },
        { id: 'history', text: 'Do you have a history of lung conditions?', placeholder: 'e.g., Asthma, Smoking history' }
    ],
    mri: [
        { id: 'symptoms', text: 'What symptoms are you experiencing?', placeholder: 'e.g., Headaches, vision changes, seizures' },
        { id: 'duration', text: 'When did these symptoms start?', placeholder: 'e.g., A month ago' },
        { id: 'history', text: 'Any previous head injuries or family history?', placeholder: 'e.g., No previous injuries' }
    ],
    fracture: [
        { id: 'pain_level', text: 'Rate pain (1-10) and location.', placeholder: 'e.g., 8/10, near the wrist' },
        { id: 'cause', text: 'How did the injury happen?', placeholder: 'e.g., Fall, sports injury' },
        { id: 'mobility', text: 'Can you move the affected area?', placeholder: 'e.g., Limited movement, very painful' }
    ],
    nail: [
        { id: 'duration', text: 'How long have you had this nail issue?', placeholder: 'e.g., 3 months, 1 year' },
        { id: 'symptoms', text: 'Describe the symptoms (discoloration, thickening).', placeholder: 'e.g., Yellowing, crumbling edges' },
        { id: 'pain', text: 'Do you feel any pain or discomfort?', placeholder: 'e.g., Pain when walking, throbbing' }
    ],
    tooth: [
        { id: 'pain_type', text: 'Describe the pain (sharp, throbbing, dull).', placeholder: 'e.g., Sharp pain when eating sweets' },
        { id: 'duration', text: 'How long has it been hurting?', placeholder: 'e.g., 2 days, on and off' },
        { id: 'sensitivity', text: 'Any sensitivity to hot or cold?', placeholder: 'e.g., Yes, sensitive to cold water' }
    ]
};

export default function SymptomSurveyModal({ visible, onClose, onSubmit, type }) {
    const [answers, setAnswers] = useState({});
    const [currentQuestions, setCurrentQuestions] = useState([]);

    useEffect(() => {
        if (type && QUESTIONS[type]) {
            setCurrentQuestions(QUESTIONS[type]);
            setAnswers({}); // Reset answers on open/type change
        }
    }, [type, visible]);

    const handleAnswerChange = (id, text) => {
        setAnswers(prev => ({ ...prev, [id]: text }));
    };

    const handleSubmit = () => {
        if (onSubmit) {
            onSubmit(answers);
        }
    };

    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.modalContainer}
            >
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Patient Symptoms</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <Ionicons name="close" size={24} color={COLORS.mutedForeground} />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.subtitle}>
                        Please answer a few questions to help the AI provide a better analysis.
                    </Text>

                    <ScrollView style={styles.formContainer}>
                        {currentQuestions.map((q, index) => (
                            <View key={q.id} style={styles.questionGroup}>
                                <Text style={styles.questionLabel}>{index + 1}. {q.text}</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder={q.placeholder}
                                    placeholderTextColor={COLORS.mutedForeground}
                                    value={answers[q.id] || ''}
                                    onChangeText={(text) => handleAnswerChange(q.id, text)}
                                    multiline
                                />
                            </View>
                        ))}
                    </ScrollView>

                    <View style={styles.footer}>
                        <TouchableOpacity onPress={onClose} style={styles.skipBtn}>
                            <Text style={styles.skipText}>Skip</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleSubmit} style={styles.submitBtn}>
                            <Text style={styles.submitText}>Analyze Scan</Text>
                            <Ionicons name="arrow-forward" size={18} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: COLORS.background,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        height: '75%', // Occupy bottom 75% of screen
        ...SHADOWS.card,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: COLORS.foreground,
    },
    closeBtn: {
        padding: 4,
    },
    subtitle: {
        fontSize: 14,
        color: COLORS.mutedForeground,
        marginBottom: 20,
    },
    formContainer: {
        flex: 1,
    },
    questionGroup: {
        marginBottom: 20,
    },
    questionLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.foreground,
        marginBottom: 8,
    },
    input: {
        backgroundColor: COLORS.secondary,
        borderRadius: 12,
        padding: 16,
        fontSize: 15,
        color: COLORS.foreground,
        borderWidth: 1,
        borderColor: COLORS.border,
        minHeight: 80,
        textAlignVertical: 'top',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    skipBtn: {
        padding: 12,
    },
    skipText: {
        color: COLORS.mutedForeground,
        fontWeight: '600',
    },
    submitBtn: {
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
        gap: 8,
    },
    submitText: {
        color: 'white',
        fontWeight: '700',
        fontSize: 16,
    },
});
