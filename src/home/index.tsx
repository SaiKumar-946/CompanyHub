import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';

const API_BASE_URL = 'http://localhost:3000/api'; // change if needed
const PRIMARY = '#FF9800';

export default function Home() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false); // create/edit modal
  const [isEditing, setIsEditing] = useState(false);
  const [editingCompanyId, setEditingCompanyId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  // Form state (used for both create and edit)
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    location: '',
    employees: '',
    founded: '',
    website: '',
    description: '',
    status: 'active',
  });

  // --- API helpers ---
  const fetchCompanies = async (page = 1, limit = 10, refresh = false) => {
    try {
      if (refresh) setRefreshing(true);
      else if (page === 1) setLoading(true);
      else setLoadingMore(true);

      const res = await fetch(
        `${API_BASE_URL}/companies?page=${page}&limit=${limit}`,
      );
      const data = await res.json();

      if (res.ok) {
        if (page === 1 || refresh) setCompanies(data.companies || []);
        else setCompanies(prev => [...prev, ...(data.companies || [])]);

        setCurrentPage(data.pagination?.page || page);
        setTotalPages(data.pagination?.pages || 1);
      } else {
        Alert.alert('Error', data.error || 'Failed to fetch companies');
      }
    } catch (err) {
      console.error('fetchCompanies error', err);
      Alert.alert('Error', 'Network error. Make sure your backend is running.');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  const createCompany = async payload => {
    const res = await fetch(`${API_BASE_URL}/companies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json().then(data => ({ ok: res.ok, data }));
  };

  const updateCompany = async (id, payload) => {
    const res = await fetch(`${API_BASE_URL}/companies/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json().then(data => ({ ok: res.ok, data }));
  };

  const deleteCompany = async id => {
    const res = await fetch(`${API_BASE_URL}/companies/${id}`, {
      method: 'DELETE',
    });
    return res.json().then(data => ({ ok: res.ok, data }));
  };

  // --- lifecycle ---
  useEffect(() => {
    fetchCompanies(1);
  }, []);

  // --- pagination / refresh ---
  const onRefresh = () => {
    fetchCompanies(1, 10, true);
  };

  const loadMore = () => {
    if (currentPage < totalPages && !loadingMore) {
      fetchCompanies(currentPage + 1);
    }
  };

  // --- form helpers ---
  const resetForm = () => {
    setFormData({
      name: '',
      industry: '',
      location: '',
      employees: '',
      founded: '',
      website: '',
      description: '',
      status: 'active',
    });
    setIsEditing(false);
    setEditingCompanyId(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsEditing(false);
    setModalVisible(true);
  };

  const openEditModal = company => {
    setFormData({
      name: company.name || '',
      industry: company.industry || '',
      location: company.location || '',
      employees: company.employees ? String(company.employees) : '',
      founded: company.founded ? String(company.founded) : '',
      website: company.website || '',
      description: company.description || '',
      status: company.status || 'active',
    });
    setEditingCompanyId(company._id);
    setIsEditing(true);
    setModalVisible(true);
  };

  // --- CRUD handlers ---
  const handleAddOrUpdate = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Validation', 'Company name is required');
      return;
    }

    // prepare payload: convert numeric fields to numbers or remove if blank
    const payload = {
      name: formData.name.trim(),
      industry: formData.industry.trim() || undefined,
      location: formData.location.trim() || undefined,
      employees:
        formData.employees !== ''
          ? parseInt(formData.employees, 10)
          : undefined,
      founded:
        formData.founded !== '' ? parseInt(formData.founded, 10) : undefined,
      website: formData.website.trim() || undefined,
      description: formData.description.trim() || undefined,
      status: formData.status || 'active',
    };

    try {
      if (isEditing && editingCompanyId) {
        const { ok, data } = await updateCompany(editingCompanyId, payload);
        if (ok) {
          setCompanies(prev => prev.map(c => (c._id === data._id ? data : c)));
          Alert.alert('Success', 'Company updated');
          setModalVisible(false);
        } else {
          Alert.alert('Error', data.error || 'Update failed');
        }
      } else {
        const { ok, data } = await createCompany(payload);
        if (ok) {
          // prepend new item for visibility (old flow behavior)
          setCompanies(prev => [data, ...prev]);
          Alert.alert('Success', 'Company added');
          setModalVisible(false);
        } else {
          Alert.alert('Error', data.error || 'Create failed');
        }
      }
      resetForm();
    } catch (err) {
      console.error('handleAddOrUpdate err', err);
      Alert.alert('Error', 'Network error. Try again.');
    }
  };

  const handleDelete = id => {
    Alert.alert(
      'Confirm delete',
      'Are you sure you want to delete this company?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { ok, data } = await deleteCompany(id);
              if (ok) {
                setCompanies(prev => prev.filter(c => c._id !== id));
                Alert.alert('Deleted', 'Company removed');
              } else {
                Alert.alert('Error', data.error || 'Delete failed');
              }
            } catch (err) {
              console.error('delete err', err);
              Alert.alert('Error', 'Network error. Try again.');
            }
          },
        },
      ],
    );
  };

  // --- render item ---
  const renderCompanyItem = ({ item }) => (
    <View style={styles.companyCard}>
      <View style={styles.companyHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.companyName}>{item.name}</Text>
          {item.industry ? (
            <Text style={styles.companyIndustry}>{item.industry}</Text>
          ) : null}
          {item.location ? (
            <Text style={styles.companyLocation}>📍 {item.location}</Text>
          ) : null}
        </View>

        <View style={{ alignItems: 'flex-end' }}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusColor(item.status) },
            ]}
          >
            <Text style={styles.statusText}>
              {(item.status || 'unknown').toUpperCase()}
            </Text>
          </View>

          <View style={{ height: 8 }} />

          <TouchableOpacity
            style={styles.smallBtn}
            onPress={() => openEditModal(item)}
          >
            <Text style={styles.smallBtnText}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.smallBtn,
              {
                marginTop: 6,
                backgroundColor: '#fff',
                borderWidth: 1,
                borderColor: '#eee',
              },
            ]}
            onPress={() => handleDelete(item._id)}
          >
            <Text style={[styles.smallBtnText, { color: '#c62828' }]}>
              Delete
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.companyStats}>
        {item.employees ? (
          <Text style={styles.statText}>👥 {item.employees} employees</Text>
        ) : null}
        {item.founded ? (
          <Text style={styles.statText}>📅 Founded {item.founded}</Text>
        ) : null}
      </View>

      {item.website ? (
        <Text style={styles.website}>🌐 {item.website}</Text>
      ) : null}
      {item.description ? (
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
      ) : null}
    </View>
  );

  // status color helper
  const statusColor = status => {
    switch (status) {
      case 'active':
        return PRIMARY;
      case 'inactive':
        return '#c62828';
      case 'pending':
        return '#ffb74d';
      default:
        return '#9E9E9E';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>CompanyHub</Text>
        <TouchableOpacity style={styles.addButton} onPress={openCreateModal}>
          <Text style={styles.addButtonText}>+ Add Company</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={PRIMARY} />
          <Text style={styles.loadingText}>Loading companies...</Text>
        </View>
      ) : (
        <FlatList
          data={companies}
          keyExtractor={item => item._id}
          renderItem={renderCompanyItem}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[PRIMARY]}
            />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.1}
          ListFooterComponent={() =>
            loadingMore ? (
              <View style={styles.loadingMore}>
                <ActivityIndicator size="small" color={PRIMARY} />
                <Text style={{ marginLeft: 8 }}>Loading more...</Text>
              </View>
            ) : null
          }
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No companies found</Text>
              <Text style={styles.emptySubtext}>
                Add your first company to get started!
              </Text>
            </View>
          )}
        />
      )}

      {/* Create/Edit Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          resetForm();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isEditing ? 'Edit Company' : 'Add New Company'}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                  resetForm();
                }}
              >
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={[
                { key: 'name', placeholder: 'Company Name *', required: true },
                { key: 'industry', placeholder: 'Industry' },
                { key: 'location', placeholder: 'Location' },
                {
                  key: 'employees',
                  placeholder: 'Number of Employees',
                  keyboardType: 'numeric',
                },
                {
                  key: 'founded',
                  placeholder: 'Founded Year',
                  keyboardType: 'numeric',
                },
                { key: 'website', placeholder: 'Website URL' },
                {
                  key: 'description',
                  placeholder: 'Description',
                  multiline: true,
                },
              ]}
              renderItem={({ item }) => (
                <TextInput
                  style={[styles.input, item.multiline && styles.textArea]}
                  placeholder={item.placeholder}
                  value={formData[item.key]}
                  onChangeText={text =>
                    setFormData(prev => ({ ...prev, [item.key]: text }))
                  }
                  keyboardType={item.keyboardType || 'default'}
                  multiline={item.multiline}
                  numberOfLines={item.multiline ? 3 : 1}
                />
              )}
              keyExtractor={item => item.key}
              showsVerticalScrollIndicator={false}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setModalVisible(false);
                  resetForm();
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleAddOrUpdate}
              >
                <Text style={styles.submitButtonText}>
                  {isEditing ? 'Save Changes' : 'Add Company'}
                </Text>
              </TouchableOpacity>
            </View>

            {isEditing && (
              <TouchableOpacity
                style={{ marginTop: 10, alignSelf: 'center' }}
                onPress={() => {
                  setFormData(prev => ({
                    ...prev,
                    status: prev.status === 'active' ? 'inactive' : 'active',
                  }));
                }}
              >
                <Text style={{ color: '#007AFF' }}>
                  Toggle status (current: {formData.status})
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// --- styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: { fontSize: 22, fontWeight: '700', color: '#222' },
  addButton: {
    backgroundColor: PRIMARY,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: { color: '#fff', fontWeight: '700' },

  listContainer: { padding: 15 },

  companyCard: {
    backgroundColor: '#fff',
    padding: 14,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  companyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  companyName: { fontSize: 18, fontWeight: '700', color: '#222' },
  companyIndustry: { marginTop: 6, color: '#666' },
  companyLocation: { marginTop: 6, color: '#666' },

  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 72,
    alignItems: 'center',
  },
  statusText: { color: '#fff', fontSize: 11, fontWeight: '700' },

  smallBtn: {
    marginTop: 6,
    backgroundColor: PRIMARY,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  smallBtnText: { color: '#fff', fontWeight: '700' },

  companyStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  statText: { fontSize: 13, color: '#888' },

  website: { marginTop: 8, color: PRIMARY, fontSize: 13 },
  description: { marginTop: 6, color: '#666', lineHeight: 20 },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#666' },
  loadingMore: {
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 5,
  },
  emptySubtext: { fontSize: 14, color: '#999' },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '92%',
    maxHeight: '86%',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#222' },
  closeButton: { fontSize: 20, color: '#666' },

  input: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fafafa',
    marginBottom: 12,
    fontSize: 16,
  },
  textArea: { height: 90, textAlignVertical: 'top' },

  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: { color: '#666', fontSize: 16, fontWeight: '700' },
  submitButton: {
    flex: 1,
    backgroundColor: PRIMARY,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
