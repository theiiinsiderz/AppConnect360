import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface MessageModalProps {
    visible: boolean;
    senderName: string;
    message: string;
    timestamp: string;
    onClose: () => void;
}

export const MessageModal: React.FC<MessageModalProps> = ({
    visible,
    senderName,
    message,
    timestamp,
    onClose,
}) => {
    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="mail" size={24} color="#FACC15" />
                        </View>
                        <View>
                            <Text style={styles.title}>New Message</Text>
                            <Text style={styles.timestamp}>{timestamp}</Text>
                        </View>
                        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                            <Ionicons name="close" size={24} color="#52525B" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.content}>
                        <Text style={styles.senderLabel}>From:</Text>
                        <Text style={styles.senderName}>{senderName}</Text>

                        <View style={styles.divider} />

                        <Text style={styles.messageText}>{message}</Text>
                    </View>

                    <TouchableOpacity style={styles.actionBtn} onPress={onClose}>
                        <Text style={styles.actionBtnText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    container: {
        width: '100%',
        backgroundColor: '#0A0A0A',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#222',
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#111',
        borderBottomWidth: 1,
        borderBottomColor: '#222',
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#18181B',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    title: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '700',
    },
    timestamp: {
        color: '#52525B',
        fontSize: 12,
        marginTop: 2,
    },
    closeBtn: {
        marginLeft: 'auto',
        padding: 4,
    },
    content: {
        padding: 24,
    },
    senderLabel: {
        color: '#52525B',
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    senderName: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: '700',
        marginTop: 4,
    },
    divider: {
        height: 1,
        backgroundColor: '#222',
        marginVertical: 16,
    },
    messageText: {
        color: '#A1A1AA',
        fontSize: 16,
        lineHeight: 24,
    },
    actionBtn: {
        backgroundColor: '#FACC15',
        margin: 24,
        marginTop: 0,
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
    },
    actionBtnText: {
        color: '#000',
        fontSize: 16,
        fontWeight: '700',
    },
});
