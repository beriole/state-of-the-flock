import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    TextInput,
    ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { memberAPI } from '../../utils/api';
import Toast from 'react-native-toast-message';

const LeaderMembersScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { t } = useTranslation();
    const { leaderId, leaderName } = route.params;

    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchMembers();
    }, [leaderId]);

    const fetchMembers = async () => {
        try {
            const response = await memberAPI.getMembers({ leader_id: leaderId });
            setMembers(response.data.members || []);
        } catch (error) {
            console.error('Error fetching leader members:', error);
            Toast.show({
                type: 'error',
                text1: t('common.error'),
                text2: t('governor.fetchMembersError') || 'Erreur lors du chargement des membres'
            });
        } finally {
            setLoading(false);
        }
    };

    const filteredMembers = members.filter(member =>
        member.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.phone_primary?.includes(searchQuery)
    );

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('MemberDetail', { memberId: item.id })}
        >
            <View style={styles.cardContent}>
                <View style={styles.avatarContainer}>
                    <Text style={styles.avatarText}>{item.first_name[0]}{item.last_name[0]}</Text>
                </View>
                <View style={styles.infoContainer}>
                    <Text style={styles.name}>{item.first_name} {item.last_name}</Text>
                    <Text style={styles.phone}>{item.phone_primary || t('common.noPhone')}</Text>
                    <Text style={styles.status}>{item.state || 'Sheep'}</Text>
                </View>
                <Icon name="chevron-right" size={24} color="#9CA3AF" />
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-left" size={24} color="#1F2937" />
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>{t('governor.membersOf')}</Text>
                    <Text style={styles.headerSubtitle}>{leaderName}</Text>
                </View>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.searchContainer}>
                <Icon name="magnify" size={20} color="#9CA3AF" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder={t('common.search')}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#DC2626" style={styles.loader} />
            ) : (
                <FlatList
                    data={filteredMembers}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>{t('members.noMembersFound') || 'Aucun membre trouvé'}</Text>
                    }
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
    },
    headerSubtitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
        textAlign: 'center',
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
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    avatarText: {
        color: '#4B5563',
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
    phone: {
        fontSize: 14,
        color: '#6B7280',
    },
    status: {
        fontSize: 12,
        color: '#DC2626',
        marginTop: 2,
    },
    loader: {
        marginTop: 20,
    },
    emptyText: {
        textAlign: 'center',
        color: '#6B7280',
        marginTop: 20,
    },
});

export default LeaderMembersScreen;
