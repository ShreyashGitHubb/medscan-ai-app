
import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Alert, ActivityIndicator, Dimensions } from 'react-native';
import { Camera, CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../../constants/theme';
import * as FileSystem from 'expo-file-system';
import SymptomSurveyModal from '../../components/SymptomSurveyModal';

// Try to import TFJS (Simulation Logic can go here or in results)
// For now, we just handle capture in this screen.

const { width, height } = Dimensions.get('window');

const ScanScreen = () => {
    const { type } = useLocalSearchParams();
    const router = useRouter();

    const [permission, requestPermission] = useCameraPermissions();
    const [cameraType, setCameraType] = useState('back');
    const [image, setImage] = useState(null);
    const [isCameraActive, setIsCameraActive] = useState(true);
    const [surveyVisible, setSurveyVisible] = useState(false);
    const cameraRef = useRef(null);

    if (!permission) {
        // Camera permissions are still loading.
        return <View style={styles.container} />;
    }

    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text style={styles.message}>We need your permission to show the camera</Text>
                <TouchableOpacity style={styles.btn} onPress={requestPermission}>
                    <Text style={styles.btnText}>Grant Permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const toggleCameraType = () => {
        setCameraType(current => (current === 'back' ? 'front' : 'back'));
    };

    const takePicture = async () => {
        if (cameraRef.current) {
            try {
                const photo = await cameraRef.current.takePictureAsync({
                    quality: 0.8,
                    base64: false, // We'll read base64 only when analyzing
                    skipProcessing: true,
                });
                setImage(photo.uri);
                setIsCameraActive(false);
            } catch (e) {
                Alert.alert("Error", "Failed to take photo");
            }
        }
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false,
            quality: 0.8,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
            setIsCameraActive(false);
        }
    };

    const retake = () => {
        setImage(null);
        setIsCameraActive(true);
    };

    const analyze = () => {
        // Open Symptom Survey instead of direct navigation
        setSurveyVisible(true);
    };

    const handleSurveySubmit = (answers) => {
        setSurveyVisible(false);
        // Navigate to results page with image URI and survey answers
        router.push({
            pathname: `/results/${type}`,
            params: {
                imageUri: image,
                surveyData: JSON.stringify(answers) // Pass answers as string
            }
        });
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            {isCameraActive ? (
                <CameraView style={styles.camera} facing={cameraType} ref={cameraRef}>
                    <View style={styles.cameraControls}>
                        <View style={styles.topControl}>
                            <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
                                <Ionicons name="close" size={28} color="white" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={toggleCameraType} style={styles.iconBtn}>
                                <Ionicons name="camera-reverse" size={28} color="white" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.bottomControl}>
                            <TouchableOpacity onPress={pickImage} style={styles.galleryBtn}>
                                <Ionicons name="images" size={24} color="white" />
                            </TouchableOpacity>

                            <TouchableOpacity onPress={takePicture} style={styles.captureBtn}>
                                <View style={styles.captureInner} />
                            </TouchableOpacity>

                            <View style={{ width: 40 }} />
                        </View>
                    </View>
                </CameraView>
            ) : (
                <View style={styles.previewContainer}>
                    <Image source={{ uri: image }} style={styles.preview} />
                    <View style={styles.previewOverlay}>
                        <Text style={styles.confirmTitle}>Confirm Image</Text>
                        <View style={styles.btnRow}>
                            <TouchableOpacity style={[styles.actionBtn, styles.secondaryBtn]} onPress={retake}>
                                <Text style={styles.secondaryBtnText}>Retake</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.actionBtn, styles.primaryBtn]} onPress={analyze}>
                                <Text style={styles.primaryBtnText}>Analyze</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}

            <SymptomSurveyModal
                visible={surveyVisible}
                onClose={() => setSurveyVisible(false)}
                onSubmit={handleSurveySubmit}
                type={type}
            />
        </View>
    );
}

export default ScanScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    message: {
        textAlign: 'center',
        paddingBottom: 10,
        color: 'white',
    },
    camera: {
        flex: 1,
    },
    cameraControls: {
        flex: 1,
        backgroundColor: 'transparent',
        justifyContent: 'space-between',
        padding: 20,
        paddingTop: 50,
    },
    topControl: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    bottomControl: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
    },
    iconBtn: {
        padding: 10,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 20,
    },
    galleryBtn: {
        padding: 12,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 24,
    },
    captureBtn: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    captureInner: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'white',
    },
    previewContainer: {
        flex: 1,
    },
    preview: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    previewOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: 24,
        paddingBottom: 40,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    modelSelectOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: COLORS.background, // Use theme background
        padding: 24,
        paddingBottom: 40,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        ...SHADOWS.card,
    },
    modelTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.foreground,
        marginBottom: 4,
        textAlign: 'center',
    },
    modelSubtitle: {
        fontSize: 14,
        color: COLORS.mutedForeground,
        marginBottom: 20,
        textAlign: 'center',
    },
    modelOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: COLORS.card,
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    recommendedOption: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    modelInfo: {
        flex: 1,
    },
    modelName: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.foreground,
        marginBottom: 2,
    },
    modelDesc: {
        fontSize: 12,
        color: COLORS.mutedForeground,
    },
    badge: {
        backgroundColor: COLORS.accent,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        marginLeft: 8,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: 'white',
    },
    cancelBtn: {
        marginTop: 8,
        padding: 12,
        alignItems: 'center',
    },
    cancelText: {
        color: COLORS.mutedForeground,
        fontSize: 14,
        fontWeight: '500',
    },
    confirmTitle: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    btnRow: {
        flexDirection: 'row',
        gap: 16,
    },
    actionBtn: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    primaryBtn: {
        backgroundColor: COLORS.primary,
    },
    secondaryBtn: {
        backgroundColor: '#374151',
    },
    primaryBtnText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    secondaryBtnText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 16,
    },
    btn: {
        padding: 15,
        backgroundColor: COLORS.primary,
        borderRadius: 10,
        alignSelf: 'center',
    },
    btnText: {
        color: 'white',
        fontWeight: 'bold',
    },
});
