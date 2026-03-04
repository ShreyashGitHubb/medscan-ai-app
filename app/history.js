import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Alert } from 'react-native';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../constants/theme';
import historyService from '../services/historyService';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HistoryScreen() {
    const [history, setHistory] = useState([]);
    const router = useRouter();

    const loadHistory = async () => {
        const data = await historyService.getHistory();
        setHistory(data);
    };

    useFocusEffect(
        useCallback(() => {
            loadHistory();
        }, [])
    );

    const deleteScan = async (id) => {
        Alert.alert(
            "Delete Scan",
            "Are you sure you want to delete this record?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        await historyService.deleteScan(id);
                        loadHistory();
                    }
                }
            ]
        );
    };

    const clearAll = () => {
        Alert.alert(
            "Clear History",
            "This will delete all saved scans. This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Clear All",
                    style: "destructive",
                    onPress: async () => {
                        await historyService.clearHistory();
                        loadHistory();
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }) => {
        const date = new Date(item.timestamp).toLocaleDateString();
        const time = new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => {
                    router.push({
                        pathname: `/results/${item.type}`,
                        params: {
                            imageUri: item.imageUri,
                            savedResult: JSON.stringify(item) // Pass full object
                        }
                    });
                }}
            >
                <Image source={{ uri: item.imageUri }} style={styles.thumbnail} />
                <View style={styles.info}>
                    <View style={styles.headerRow}>
                        <Text style={styles.typeBadge}>{item.type.toUpperCase()}</Text>
                        <Text style={styles.date}>{date} • {time}</Text>
                    </View>
                    <Text style={styles.prediction}>{item.prediction}</Text>
                    <Text style={styles.confidence}>{(item.confidence * 100).toFixed(0)}% Confidence</Text>
                </View>
                <TouchableOpacity onPress={() => deleteScan(item.id)} style={styles.deleteBtn}>
                    <Ionicons name="trash-outline" size={20} color={COLORS.destructive} />
                </TouchableOpacity>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <Stack.Screen
                options={{
                    title: 'Scan History',
                    headerRight: () => (
                        <TouchableOpacity onPress={clearAll}>
                            <Text style={styles.clearText}>Clear</Text>
                        </TouchableOpacity>
                    )
                }}
            />

            {history.length === 0 ? (
                <View style={styles.emptyState}>
                    <Ionicons name="time-outline" size={64} color={COLORS.muted} />
                    <Text style={styles.emptyText}>No scan history yet.</Text>
                </View>
            ) : (
                <FlatList
                    data={history}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.list}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    list: {
        padding: 16,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: COLORS.card,
        borderRadius: 16,
        padding: 12,
        marginBottom: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.sm,
    },
    thumbnail: {
        width: 60,
        height: 60,
        borderRadius: 12,
        backgroundColor: COLORS.input,
    },
    info: {
        flex: 1,
        marginLeft: 12,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    typeBadge: {
        fontSize: 10,
        fontWeight: 'bold',
        color: COLORS.primary,
        backgroundColor: COLORS.secondary,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    date: {
        fontSize: 10,
        color: COLORS.mutedForeground,
    },
    prediction: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.foreground,
    },
    confidence: {
        fontSize: 12,
        color: COLORS.mutedForeground,
    },
    deleteBtn: {
        padding: 8,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        opacity: 0.6,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        color: COLORS.mutedForeground,
    },
    clearText: {
        color: COLORS.destructive,
        fontSize: 16,
    }
});
