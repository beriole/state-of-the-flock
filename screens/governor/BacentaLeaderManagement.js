import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    TextInput,
    ActivityIndicator,
    Alert,
    Modal
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { governorAPI, areaAPI } from '../../utils/api';
import Toast from 'react-native-toast-message';

const BacentaLeaderManagement = () => {
    const navigation = useNavigation();
    const { t } = useTranslation();
    const [leaders, setLeaders] = useState([]);
    const [areas, setAreas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [editingLeader, setEditingLeader] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        password: '', // Only for creation
        area_id: '', // Zone assignment
    });

    useEffect(() => {
        fetchLeaders();
        fetchAreas();
    }, []);

    const fetchAreas = async () => {
        try {
            const response = await areaAPI.getAreas();
            setAreas(response.data.areas || []);
        } catch (error) {
            console.error('Error fetching areas:', error);
        }
    };

    const fetchLeaders = async () => {
        try {
            const response = await governorAPI.getBacentaLeaders();
            setLeaders(response.data.users || []);
        } catch (error) {
            console.error('Error fetching leaders:', error);
            Toast.show({
                type: 'error',
                text1: 'Erreur',
                text2: 'Erreur lors du chargement des leaders'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            // Validation for new leader creation
            if (!editingLeader) {
                if (!formData.first_name.trim() || !formData.last_name.trim() || !formData.email.trim() || !formData.password.trim()) {
                    Toast.show({
                        type: 'error',
                        text1: 'Erreur',
                        text2: 'Tous les champs sont obligatoires'
                    });
                    return;
                }
                if (!formData.area_id) {
                    Toast.show({
                        type: 'error',
                        text1: 'Erreur',
                        text2: 'Veuillez sélectionner une zone pour le leader'
                    });
                    return;
                }
            }

            if (editingLeader) {
                await governorAPI.updateBacentaLeader(editingLeader.id, formData);
                Toast.show({ type: 'success', text1: 'Succès', text2: 'Leader mis à jour avec succès' });
            } else {
                await governorAPI.createBacentaLeader(formData);
                Toast.show({ type: 'success', text1: 'Succès', text2: 'Leader créé avec succès' });
            }
            setModalVisible(false);
            fetchLeaders();
        } catch (error) {
            console.error('Error saving leader:', error);
            Toast.show({
                type: 'error',
                text1: 'Erreur',
                text2: error.response?.data?.error || 'Une erreur est survenue'
            });
        }
    };

    const handleDelete = (id) => {
        Alert.alert(
            'Confirmer la suppression',
            'Êtes-vous sûr de vouloir supprimer ce leader ?',
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Supprimer',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await governorAPI.deleteBacentaLeader(id);
                            Toast.show({ type: 'success', text1: 'Succès', text2: 'Leader supprimé avec succès' });
                            fetchLeaders();
                        } catch (error) {
                            console.error('Error deleting leader:', error);
                            Toast.show({
                                type: 'error',
                                text1: 'Erreur',
                                text2: 'Erreur lors de la suppression'
                            });
                        }
                    }
                }
            ]
        );
    };

    const openModal = (leader = null) => {
        if (leader) {
            setEditingLeader(leader);
            setFormData({
                first_name: leader.first_name,
                last_name: leader.last_name,
                email: leader.email,
                phone: leader.phone || '',
                password: '', // Don't show password
                area_id: leader.area_id || '',
            });
        } else {
            setEditingLeader(null);
            setFormData({
                first_name: '',
                last_name: '',
                email: '',
                phone: '',
                password: '',
                area_id: '',
            });
        }
        setModalVisible(true);
    };

    const filteredLeaders = leaders.filter(leader =>
        leader.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        leader.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        leader.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('BacentaLeaderDetail', { leaderId: item.id, leaderName: `${item.first_name} ${item.last_name}` })}
        >
            <View style={styles.cardContent}>
                <View style={styles.avatarContainer}>
                    <Text style={styles.avatarText}>{item.first_name[0]}{item.last_name[0]}</Text>
                </View>
                <View style={styles.infoContainer}>
                    <Text style={styles.name}>{item.first_name} {item.last_name}</Text>
                    <Text style={styles.email}>{item.email}</Text>
                    <Text style={styles.phone}>{item.phone || 'Aucun téléphone'}</Text>
                </View>
                <View style={styles.actionsContainer}>
                    <TouchableOpacity onPress={() => openModal(item)} style={styles.actionButton}>
                        <Icon name="pencil" size={20} color="#4B5563" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.actionButton}>
                        <Icon name="delete" size={20} color="#EF4444" />
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#DC2626" />
            <View style={styles.header}>
                <View style={styles.headerBackground} />
                <View style={styles.headerContent}>
                    <View style={styles.headerLeft}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                            <Icon name="arrow-left" size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Gérer les leaders</Text>
                    </View>
                    <View style={styles.headerRight}>
                        <TouchableOpacity onPress={() => openModal()} style={styles.addButton}>
                            <Icon name="plus" size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <View style={[styles.searchContainer, { marginTop: -20 }]}>
                <Icon name="magnify" size={20} color="#9CA3AF" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Rechercher"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#DC2626" style={styles.loader} />
            ) : (
                <FlatList
                    data={filteredLeaders}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>Aucun leader trouvé</Text>
                    }
                />
            )}

            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>
                            {editingLeader ? 'Modifier le leader' : 'Créer un leader'}
                        </Text>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Prénom</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.first_name}
                                onChangeText={text => setFormData({ ...formData, first_name: text })}
                            />
                        </View>
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Nom</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.last_name}
                                onChangeText={text => setFormData({ ...formData, last_name: text })}
                            />
                        </View>
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Email</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.email}
                                onChangeText={text => setFormData({ ...formData, email: text })}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Téléphone</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.phone}
                                onChangeText={text => setFormData({ ...formData, phone: text })}
                                keyboardType="phone-pad"
                            />
                        </View>
                        {!editingLeader && (
                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Zone *</Text>
                                <View style={styles.pickerContainer}>
                                    <Picker
                                        selectedValue={formData.area_id}
                                        onValueChange={(value) => setFormData({ ...formData, area_id: value })}
                                        style={styles.picker}
                                    >
                                        <Picker.Item label="Sélectionner une zone" value="" />
                                        {areas.map((area) => (
                                            <Picker.Item
                                                key={area.id}
                                                label={`${area.name} (N°${area.number})`}
                                                value={area.id}
                                            />
                                        ))}
                                    </Picker>
                                </View>
                            </View>
                        )}
                        {!editingLeader && (
                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Mot de passe</Text>
                                <TextInput
                                    style={styles.input}
                                    value={formData.password}
                                    onChangeText={text => setFormData({ ...formData, password: text })}
                                    secureTextEntry
                                />
                            </View>
                        )}

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.cancelButtonText}>Annuler</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.saveButton]}
                                onPress={handleSave}
                            >
                                <Text style={styles.saveButtonText}>Enregistrer</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        backgroundColor: '#DC2626',
        height: 140,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        overflow: 'hidden',
        position: 'relative',
    },
    headerBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#DC2626',
        opacity: 0.95,
    },
    headerContent: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerLeft: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    headerRight: {
        alignItems: 'center',
    },
    backButton: {
        padding: 8,
    },
    addButton: {
        padding: 8,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        margin: 16,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#D1D5DB',
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        height: 40,
        color: '#1F2937',
    },
    listContent: {
        padding: 16,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginBottom: 12,
        padding: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#FEE2E2',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    avatarText: {
        color: '#DC2626',
        fontSize: 18,
        fontWeight: 'bold',
    },
    infoContainer: {
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },
    email: {
        fontSize: 14,
        color: '#6B7280',
    },
    phone: {
        fontSize: 14,
        color: '#9CA3AF',
    },
    actionsContainer: {
        flexDirection: 'row',
    },
    actionButton: {
        padding: 8,
        marginLeft: 8,
    },
    loader: {
        marginTop: 20,
    },
    emptyText: {
        textAlign: 'center',
        color: '#6B7280',
        marginTop: 20,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#1F2937',
    },
    inputContainer: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
    },
    picker: {
        height: 50,
        color: '#1F2937',
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    modalButton: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#F3F4F6',
        marginRight: 8,
    },
    saveButton: {
        backgroundColor: '#DC2626',
        marginLeft: 8,
    },
    cancelButtonText: {
        color: '#374151',
        fontWeight: '600',
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
});

export default BacentaLeaderManagement;

