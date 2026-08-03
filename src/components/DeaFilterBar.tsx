import { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { matchLocationOptions } from '@/data/institutionCategories';
import { colors, fonts, spacing } from '@/constants/theme';

export type FilterTypeOption = {
  id: string;
  label: string;
  count?: number;
};

type DeaFilterBarProps = {
  cities: string[];
  provinces: string[];
  types: FilterTypeOption[];
  selectedCity: string | null;
  selectedProvince: string | null;
  selectedType: string | null;
  onCityChange: (city: string | null) => void;
  onProvinceChange: (province: string | null) => void;
  onTypeChange: (typeId: string | null) => void;
  resultCount: number;
  /** Si ya venís de una modalidad, se puede ocultar el filtro Tipo. */
  hideTypeFilter?: boolean;
  emptyMessage?: string | null;
};

const MIN_CHARS = 4;

function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.chip, active && styles.chipActive, pressed && styles.pressed]}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

function LocationTypeahead({
  label,
  placeholder,
  options,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  options: string[];
  value: string | null;
  onChange: (next: string | null) => void;
}) {
  const [query, setQuery] = useState(value ?? '');

  useEffect(() => {
    setQuery(value ?? '');
  }, [value]);

  const matches = useMemo(
    () => matchLocationOptions(options, query, MIN_CHARS),
    [options, query],
  );

  const showList = query.trim().length >= MIN_CHARS && !value;

  const handleChangeText = (text: string) => {
    setQuery(text);
    if (!text.trim()) {
      onChange(null);
      return;
    }
    if (value && text.trim().toLowerCase() !== value.toLowerCase()) {
      onChange(null);
    }
  };

  return (
    <View style={styles.typeaheadWrap}>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.inputRow}>
        <Ionicons name="search" size={16} color={colors.textMuted} style={styles.searchIcon} />
        <TextInput
          value={query}
          onChangeText={handleChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          autoCorrect={false}
          autoCapitalize="words"
        />
        {query ? (
          <Pressable
            onPress={() => {
              setQuery('');
              onChange(null);
            }}
            hitSlop={8}
            accessibilityLabel={`Limpiar ${label}`}
          >
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </Pressable>
        ) : null}
      </View>

      {value ? (
        <View style={styles.selectedRow}>
          <Text style={styles.selectedText} numberOfLines={1}>
            {value}
          </Text>
        </View>
      ) : null}

      {showList ? (
        <View style={styles.suggestions}>
          {matches.length === 0 ? (
            <Text style={styles.noMatch}>Sin coincidencias</Text>
          ) : (
            matches.map((option) => (
              <Pressable
                key={option}
                onPress={() => {
                  setQuery(option);
                  onChange(option);
                }}
                style={({ pressed }) => [styles.suggestionItem, pressed && styles.pressed]}
              >
                <Ionicons name="location-outline" size={14} color={colors.primary} />
                <Text style={styles.suggestionText} numberOfLines={1}>
                  {option}
                </Text>
              </Pressable>
            ))
          )}
        </View>
      ) : query.trim().length > 0 && query.trim().length < MIN_CHARS && !value ? (
        <Text style={styles.hint}>Escribí al menos {MIN_CHARS} letras para ver opciones</Text>
      ) : null}
    </View>
  );
}

export function DeaFilterBar({
  cities,
  provinces,
  types,
  selectedCity,
  selectedProvince,
  selectedType,
  onCityChange,
  onProvinceChange,
  onTypeChange,
  resultCount,
  hideTypeFilter = false,
  emptyMessage = null,
}: DeaFilterBarProps) {
  const hasFilters = Boolean(selectedCity || selectedProvince || selectedType);
  const showEmpty = hasFilters && resultCount === 0;

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="options-outline" size={16} color={colors.primary} />
          <Text style={styles.headerTitle}>Filtros</Text>
          <Text style={[styles.count, showEmpty && styles.countEmpty]}>
            {resultCount} DEA
          </Text>
        </View>
        {hasFilters ? (
          <Pressable
            onPress={() => {
              onCityChange(null);
              onProvinceChange(null);
              onTypeChange(null);
            }}
            hitSlop={8}
          >
            <Text style={styles.clear}>Limpiar</Text>
          </Pressable>
        ) : null}
      </View>

      <LocationTypeahead
        label="Provincia"
        placeholder="Escribí una provincia…"
        options={provinces}
        value={selectedProvince}
        onChange={onProvinceChange}
      />

      <LocationTypeahead
        label="Localidad"
        placeholder="Escribí una localidad…"
        options={cities}
        value={selectedCity}
        onChange={onCityChange}
      />

      {!hideTypeFilter ? (
        <>
          <Text style={styles.rowLabel}>Tipo</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chips}
          >
            <Chip label="Todos" active={!selectedType} onPress={() => onTypeChange(null)} />
            {types.map((type) => (
              <Chip
                key={type.id}
                label={type.count != null ? `${type.label} (${type.count})` : type.label}
                active={selectedType === type.id}
                onPress={() => onTypeChange(selectedType === type.id ? null : type.id)}
              />
            ))}
          </ScrollView>
        </>
      ) : null}

      {showEmpty ? (
        <View style={styles.emptyBox}>
          <Ionicons name="alert-circle-outline" size={18} color={colors.danger} />
          <Text style={styles.emptyText}>
            {emptyMessage || 'No hay DEA instalados con esa combinación de filtros.'}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    gap: 6,
    zIndex: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.text,
  },
  count: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
  },
  countEmpty: {
    color: colors.danger,
    fontFamily: fonts.bodyBold,
  },
  clear: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.primary,
  },
  rowLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  typeaheadWrap: {
    gap: 4,
    zIndex: 3,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    minHeight: 40,
    gap: 6,
  },
  searchIcon: {
    marginTop: 1,
  },
  input: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.text,
    paddingVertical: 8,
  },
  selectedRow: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primarySoft,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  selectedText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: colors.primary,
  },
  suggestions: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: '#fff',
    overflow: 'hidden',
    maxHeight: 180,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  suggestionText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.text,
  },
  noMatch: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  hint: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textMuted,
    paddingHorizontal: 2,
  },
  chips: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
    paddingRight: spacing.sm,
  },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 12,
    paddingVertical: 6,
    maxWidth: 260,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: colors.text,
  },
  chipTextActive: {
    color: '#fff',
  },
  pressed: {
    opacity: 0.88,
  },
  emptyBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 6,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 10,
  },
  emptyText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 18,
    color: colors.text,
  },
});
