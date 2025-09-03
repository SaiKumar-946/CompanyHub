import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
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

export default function CompanyFilters({
  filters,
  onFilterChange,
  onApplyFilters,
  onClearFilters,
  showFilters,
}) {
  const updateFilter = (key, value) => {
    onFilterChange(key, value);
  };

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

      {/* Status Filter */}
      <View style={styles.filterRow}>
        <View style={styles.filterInputFull}>
          <Text style={styles.filterLabel}>Status</Text>
          <View style={styles.statusFilterContainer}>
            {['', 'active', 'inactive', 'pending'].map(status => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.statusFilterChip,
                  filters.status === status && styles.statusFilterChipActive
                ]}
                onPress={() => updateFilter('status', status)}
              >
                <Text style={[
                  styles.statusFilterChipText,
                  filters.status === status && styles.statusFilterChipTextActive
                ]}>
                  {status || 'All'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
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
  statusFilterContainer: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  statusFilterChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.gray100,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  statusFilterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  statusFilterChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.gray600,
    textTransform: 'capitalize',
  },
  statusFilterChipTextActive: {
    color: COLORS.white,
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
});