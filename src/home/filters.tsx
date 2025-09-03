import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  Pressable,
} from 'react-native';

const COLORS = {
  primary: '#2563EB',
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

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'pending', label: 'Pending' },
];

export default function CompanyFilters({
  filters,
  onFilterChange,
  onApplyFilters,
  onClearFilters,
  showFilters,
}) {
  const [showStatusModal, setShowStatusModal] = useState(false);

  const updateFilter = (key, value) => {
    onFilterChange(key, value);
  };

  const handleStatusSelect = (status) => {
    updateFilter('status', status);
    setShowStatusModal(false);
  };

  const getStatusLabel = () => {
    const option = statusOptions.find(opt => opt.value === filters.status);
    return option ? option.label : 'All Statuses';
  };

  const renderStatusOption = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.statusOption,
        filters.status === item.value && styles.statusOptionSelected
      ]}
      onPress={() => handleStatusSelect(item.value)}
    >
      <Text style={[
        styles.statusOptionText,
        filters.status === item.value && styles.statusOptionTextSelected
      ]}>
        {item.label}
      </Text>
      {filters.status === item.value && (
        <View style={styles.checkmark}>
          <Text style={styles.checkmarkText}>✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (!showFilters) {
    return null;
  }

  return (
    <View style={styles.filtersContainer}>
      {/* Search */}
      <View style={styles.filterRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search companies or descriptions..."
          value={filters.search}
          onChangeText={text => updateFilter('search', text)}
          placeholderTextColor={COLORS.gray400}
        />
      </View>

      {/* Filter Dropdowns Row 1 */}
      <View style={styles.filterRow}>
        <View style={styles.filterInputHalf}>
          <Text style={styles.filterLabel}>Industry</Text>
          <TextInput
            style={styles.filterInput}
            placeholder="e.g. Technology"
            value={filters.industry}
            onChangeText={text => updateFilter('industry', text)}
            placeholderTextColor={COLORS.gray400}
          />
        </View>
        <View style={styles.filterInputHalf}>
          <Text style={styles.filterLabel}>Location</Text>
          <TextInput
            style={styles.filterInput}
            placeholder="e.g. San Francisco"
            value={filters.location}
            onChangeText={text => updateFilter('location', text)}
            placeholderTextColor={COLORS.gray400}
          />
        </View>
      </View>

      {/* Status Dropdown */}
      <View style={styles.filterRow}>
        <View style={styles.filterInputFull}>
          <Text style={styles.filterLabel}>Status</Text>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setShowStatusModal(true)}
          >
            <Text style={styles.dropdownButtonText}>{getStatusLabel()}</Text>
            <Text style={styles.dropdownArrow}>▼</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Range Filters */}
      <View style={styles.filterRow}>
        <View style={styles.filterInputHalf}>
          <Text style={styles.filterLabel}>Employees</Text>
          <View style={styles.rangeInputContainer}>
            <TextInput
              style={styles.rangeInput}
              placeholder="Min"
              value={filters.employees_min}
              onChangeText={text => updateFilter('employees_min', text)}
              keyboardType="numeric"
              placeholderTextColor={COLORS.gray400}
            />
            <Text style={styles.rangeSeparator}>to</Text>
            <TextInput
              style={styles.rangeInput}
              placeholder="Max"
              value={filters.employees_max}
              onChangeText={text => updateFilter('employees_max', text)}
              keyboardType="numeric"
              placeholderTextColor={COLORS.gray400}
            />
          </View>
        </View>
        <View style={styles.filterInputHalf}>
          <Text style={styles.filterLabel}>Founded Year</Text>
          <View style={styles.rangeInputContainer}>
            <TextInput
              style={styles.rangeInput}
              placeholder="From"
              value={filters.founded_after}
              onChangeText={text => updateFilter('founded_after', text)}
              keyboardType="numeric"
              placeholderTextColor={COLORS.gray400}
            />
            <Text style={styles.rangeSeparator}>to</Text>
            <TextInput
              style={styles.rangeInput}
              placeholder="To"
              value={filters.founded_before}
              onChangeText={text => updateFilter('founded_before', text)}
              keyboardType="numeric"
              placeholderTextColor={COLORS.gray400}
            />
          </View>
        </View>
      </View>

      {/* Filter Actions */}
      <View style={styles.filterActions}>
        <TouchableOpacity style={styles.clearFiltersButton} onPress={onClearFilters}>
          <Text style={styles.clearFiltersText}>Clear All</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.applyFiltersButton} onPress={onApplyFilters}>
          <Text style={styles.applyFiltersText}>Apply Filters</Text>
        </TouchableOpacity>
      </View>

      {/* Status Selection Modal */}
      <Modal
        visible={showStatusModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowStatusModal(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setShowStatusModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Status</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowStatusModal(false)}
                >
                  <Text style={styles.closeButtonText}>×</Text>
                </TouchableOpacity>
              </View>
              
              <FlatList
                data={statusOptions}
                renderItem={renderStatusOption}
                keyExtractor={(item) => item.value}
                showsVerticalScrollIndicator={false}
                style={styles.optionsList}
              />
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  filtersContainer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.gray50,
    fontSize: 16,
    color: COLORS.gray900,
  },
  filterInputHalf: {
    flex: 1,
  },
  filterInputFull: {
    flex: 1,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray700,
    marginBottom: 8,
  },
  filterInput: {
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: COLORS.gray50,
    fontSize: 14,
    color: COLORS.gray900,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: COLORS.gray50,
    minHeight: 42,
  },
  dropdownButtonText: {
    fontSize: 14,
    color: COLORS.gray700,
    fontWeight: '500',
  },
  dropdownArrow: {
    fontSize: 12,
    color: COLORS.gray500,
    marginLeft: 8,
  },
  rangeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rangeInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: COLORS.gray50,
    fontSize: 14,
    color: COLORS.gray900,
    textAlign: 'center',
  },
  rangeSeparator: {
    fontSize: 12,
    color: COLORS.gray500,
    fontWeight: '500',
  },
  filterActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  clearFiltersButton: {
    flex: 1,
    backgroundColor: COLORS.gray100,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  clearFiltersText: {
    color: COLORS.gray700,
    fontSize: 14,
    fontWeight: '600',
  },
  applyFiltersButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  applyFiltersText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    maxHeight: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.gray900,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: COLORS.gray600,
    fontWeight: '300',
  },
  optionsList: {
    paddingHorizontal: 20,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    backgroundColor: COLORS.gray50,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  statusOptionSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  statusOptionText: {
    fontSize: 16,
    color: COLORS.gray700,
    fontWeight: '500',
  },
  statusOptionTextSelected: {
    color: COLORS.white,
    fontWeight: '600',
  },
  checkmark: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: 'bold',
  },
});