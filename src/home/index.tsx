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
const COLORS = {
  primary: '#FF9800',
  primaryDark: '#1D4ED8',
  success: '#059669',
  warning: '#D97706',
  danger: '#DC2626',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
  white: '#FFFFFF',
};

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
      'Confirm Delete',
      'Are you sure you want to delete this company? This action cannot be undone.',
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
                Alert.alert('Success', 'Company deleted successfully');
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
        <View style={styles.companyInfo}>
          <Text style={styles.companyName}>{item.name}</Text>
          {item.industry && (
            <Text style={styles.companyIndustry}>{item.industry}</Text>
          )}
          {item.location && (
            <View style={styles.locationContainer}>
              <Text style={styles.locationIcon}>📍</Text>
              <Text style={styles.companyLocation}>{item.location}</Text>
            </View>
          )}
        </View>

        <View style={styles.companyActions}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) },
            ]}
          >
            <Text style={styles.statusText}>
              {(item.status || 'unknown').toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.companyMetrics}>
        {item.employees && (
          <View style={styles.metricItem}>
            <Text style={styles.metricIcon}>👥</Text>
            <Text style={styles.metricText}>
              {item.employees.toLocaleString()} employees
            </Text>
          </View>
        )}
        {item.founded && (
          <View style={styles.metricItem}>
            <Text style={styles.metricIcon}>📅</Text>
            <Text style={styles.metricText}>Founded {item.founded}</Text>
          </View>
        )}
      </View>

      {item.website && (
        <View style={styles.websiteContainer}>
          <Text style={styles.websiteIcon}>🌐</Text>
          <Text style={styles.websiteText}>{item.website}</Text>
        </View>
      )}

      {item.description && (
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
      )}

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => openEditModal(item)}
        >
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item._id)}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // status color helper
  const getStatusColor = status => {
    switch (status) {
      case 'active':
        return COLORS.success;
      case 'inactive':
        return COLORS.danger;
      case 'pending':
        return COLORS.warning;
      default:
        return COLORS.gray400;
    }
  };

  const getFormFields = () => [
    { key: 'name', placeholder: 'Company Name', required: true },
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
      placeholder: 'Company Description',
      multiline: true,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>CompanyHub</Text>
          <Text style={styles.subtitle}>Manage your company directory</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={openCreateModal}>
          <Text style={styles.addButtonText}>+ Add Company</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
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
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.1}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={() =>
            loadingMore ? (
              <View style={styles.loadingMore}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.loadingMoreText}>Loading more...</Text>
              </View>
            ) : null
          }
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🏢</Text>
              <Text style={styles.emptyText}>No companies found</Text>
              <Text style={styles.emptySubtext}>
                Add your first company to get started
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
              <View>
                <Text style={styles.modalTitle}>
                  {isEditing ? 'Edit Company' : 'Add New Company'}
                </Text>
                <Text style={styles.modalSubtitle}>
                  {isEditing
                    ? 'Update company information'
                    : 'Enter company details below'}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setModalVisible(false);
                  resetForm();
                }}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={getFormFields()}
              renderItem={({ item }) => (
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>
                    {item.placeholder}
                    {item.required && (
                      <Text style={styles.requiredMark}> *</Text>
                    )}
                  </Text>
                  <TextInput
                    style={[styles.input, item.multiline && styles.textArea]}
                    placeholder={`Enter ${item.placeholder.toLowerCase()}`}
                    value={formData[item.key]}
                    onChangeText={text =>
                      setFormData(prev => ({ ...prev, [item.key]: text }))
                    }
                    keyboardType={item.keyboardType || 'default'}
                    multiline={item.multiline}
                    numberOfLines={item.multiline ? 4 : 1}
                    placeholderTextColor={COLORS.gray400}
                  />
                </View>
              )}
              keyExtractor={item => item.key}
              showsVerticalScrollIndicator={false}
              style={styles.formContainer}
            />

            {isEditing && (
              <View style={styles.statusToggleContainer}>
                <Text style={styles.statusToggleLabel}>Status:</Text>
                <TouchableOpacity
                  style={styles.statusToggleButton}
                  onPress={() => {
                    setFormData(prev => ({
                      ...prev,
                      status: prev.status === 'active' ? 'inactive' : 'active',
                    }));
                  }}
                >
                  <Text style={styles.statusToggleText}>
                    {formData.status === 'active' ? 'Active' : 'Inactive'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.modalActions}>
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
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// --- styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray50,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.gray900,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.gray500,
    marginTop: 2,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 16,
  },

  // List
  listContainer: {
    padding: 20,
    paddingBottom: 40,
  },

  // Company Card
  companyCard: {
    backgroundColor: COLORS.white,
    padding: 20,
    marginBottom: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  companyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  companyInfo: {
    flex: 1,
    marginRight: 16,
  },
  companyName: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.gray900,
    lineHeight: 26,
  },
  companyIndustry: {
    marginTop: 4,
    color: COLORS.gray600,
    fontSize: 14,
    fontWeight: '500',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  locationIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  companyLocation: {
    color: COLORS.gray500,
    fontSize: 14,
  },
  companyActions: {
    alignItems: 'flex-end',
  },

  // Status Badge
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
  },
  statusText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Metrics
  companyMetrics: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 16,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  metricText: {
    fontSize: 14,
    color: COLORS.gray600,
    fontWeight: '500',
  },

  // Website
  websiteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  websiteIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  websiteText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '500',
  },

  // Description
  description: {
    marginBottom: 16,
    color: COLORS.gray600,
    lineHeight: 22,
    fontSize: 14,
  },

  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  editButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  editButtonText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 14,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.danger,
  },
  deleteButtonText: {
    color: COLORS.danger,
    fontWeight: '600',
    fontSize: 14,
  },

  // Loading States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.gray50,
  },
  loadingText: {
    marginTop: 16,
    color: COLORS.gray600,
    fontSize: 16,
    fontWeight: '500',
  },
  loadingMore: {
    paddingVertical: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingMoreText: {
    marginLeft: 8,
    color: COLORS.gray600,
    fontSize: 14,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.gray700,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: COLORS.gray500,
    textAlign: 'center',
    lineHeight: 22,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '92%',
    maxHeight: '90%',
    backgroundColor: COLORS.white,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.gray900,
    lineHeight: 28,
  },
  modalSubtitle: {
    fontSize: 14,
    color: COLORS.gray500,
    marginTop: 4,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: COLORS.gray600,
    fontWeight: '600',
  },

  // Form
  formContainer: {
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray700,
    marginBottom: 8,
  },
  requiredMark: {
    color: COLORS.danger,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: COLORS.white,
    fontSize: 16,
    color: COLORS.gray900,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 14,
  },

  // Status Toggle
  statusToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
  },
  statusToggleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray700,
  },
  statusToggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusToggleText: {
    fontWeight: '600',
    fontSize: 14,
  },

  // Modal Actions
  modalActions: {
    flexDirection: 'row',
    padding: 24,
    paddingTop: 16,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: COLORS.gray100,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: COLORS.gray700,
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
