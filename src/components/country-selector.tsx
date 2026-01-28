import { Text } from "@/src/components/ui/text";
import { Colors } from "@/src/constants/colors";
import lifeExpectancyData from "@/src/data/life_expectancy.json";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  ListRenderItem,
  Pressable,
  StyleProp,
  StyleSheet,
  TextInput,
  View,
  ViewStyle,
} from "react-native";

interface CountryRecord {
  countryName: string;
  countryCode: string;
  year: number;
  lifeExpectancy: number;
}

interface CountrySelectorProps {
  selectedCountry: string;
  onCountrySelect: (countryName: string, lifeExpectancy: number) => void;

  ListHeaderComponent?: React.ReactElement;
  maxHeight?: number;
  style?: StyleProp<ViewStyle>;
}

const CountryItem = React.memo(
  ({
    item,
    isSelected,
    onSelect,
  }: {
    item: CountryRecord;
    isSelected: boolean;
    onSelect: (name: string, life: number) => void;
  }) => (
    <Pressable
      style={[styles.countryItem, isSelected && styles.countryItemSelected]}
      onPress={() => onSelect(item.countryName, item.lifeExpectancy)}
    >
      <View style={styles.codeBadge}>
        <Text style={styles.codeText}>{item.countryCode}</Text>
      </View>

      <View style={styles.countryInfo}>
        <Text
          style={[styles.countryName, isSelected && styles.textSelected]}
          numberOfLines={1}
        >
          {item.countryName}
        </Text>
        <Text style={styles.lifeExpectancyText}>
          {item.lifeExpectancy} years
        </Text>
      </View>

      {isSelected && (
        <Ionicons
          name="checkmark-circle"
          size={24}
          color={Colors.accentPrimary}
        />
      )}
    </Pressable>
  ),
);

CountryItem.displayName = "CountryItem";

export const CountrySelector: React.FC<CountrySelectorProps> = ({
  selectedCountry,
  onCountrySelect,
  ListHeaderComponent,
  maxHeight,
  style,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const countries = useMemo(() => {
    const records = (lifeExpectancyData.records || []) as CountryRecord[];
    return records.sort((a, b) => a.countryName.localeCompare(b.countryName));
  }, []);

  const filteredCountries = useMemo(() => {
    if (!searchQuery.trim()) return countries;
    const query = searchQuery.toLowerCase();
    return countries.filter(
      (c) =>
        c.countryName.toLowerCase().includes(query) ||
        c.countryCode.toLowerCase().includes(query),
    );
  }, [countries, searchQuery]);

  const renderItem: ListRenderItem<CountryRecord> = useCallback(
    ({ item }) => (
      <CountryItem
        item={item}
        isSelected={selectedCountry === item.countryName}
        onSelect={onCountrySelect}
      />
    ),
    [selectedCountry, onCountrySelect],
  );

  const renderHeader = () => (
    <View>
      {ListHeaderComponent}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color={Colors.textSecondary}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search country..."
          placeholderTextColor={Colors.placeholder}
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery("")} hitSlop={8}>
            <Ionicons name="close-circle" size={20} color={Colors.textMuted} />
          </Pressable>
        )}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.listContainer,
          maxHeight ? { height: maxHeight } : { flex: 1 },
        ]}
      >
        <FlatList
          data={filteredCountries}
          renderItem={renderItem}
          ListHeaderComponent={renderHeader}
          keyExtractor={(item) => item.countryCode}
          initialNumToRender={10}
          windowSize={5}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          getItemLayout={(_, index) => ({
            length: 72,
            offset: 72 * index,
            index,
          })}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No countries found</Text>
            </View>
          }
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  listContainer: {
    width: "100%",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.inputBackground,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,

    marginTop: 8,
    borderWidth: 1,
    borderColor: Colors.surfaceSecondary,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    color: Colors.textPrimary,
    fontSize: 16,
  },
  listContent: {
    paddingBottom: 20,
    flexGrow: 1,
  },
  countryItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "transparent",
    height: 72,
  },
  countryItemSelected: {
    borderColor: Colors.accentPrimary,
    backgroundColor: Colors.surface,
  },
  codeBadge: {
    width: 45,
    height: 32,
    backgroundColor: Colors.surface,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  codeText: {
    fontSize: 12,
    fontWeight: "bold",
    color: Colors.textSecondary,
  },
  countryInfo: {
    flex: 1,
    justifyContent: "center",
  },
  countryName: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  textSelected: {
    color: Colors.accentPrimary,
  },
  lifeExpectancyText: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
  emptyState: {
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 16,
  },
});
