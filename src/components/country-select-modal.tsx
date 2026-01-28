import { Text } from "@/src/components/ui/text";
import { Colors } from "@/src/constants/colors";
import lifeExpectancyData from "@/src/data/life_expectancy.json";
import { Ionicons } from "@expo/vector-icons";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  FlatList,
  Keyboard,
  ListRenderItem,
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface CountryRecord {
  countryName: string;
  countryCode: string;
  year: number;
  lifeExpectancy: number;
}

interface CountrySelectModalProps {
  visible: boolean;
  onClose: () => void;
  selectedCountry: string;
  onCountrySelect: (countryName: string, lifeExpectancy: number) => void;
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

export const CountrySelectModal: React.FC<CountrySelectModalProps> = ({
  visible,
  onClose,
  selectedCountry,
  onCountrySelect,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const flatListRef = useRef<FlatList<CountryRecord>>(null);
  const searchInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (!visible) {
      setSearchQuery("");
    }
  }, [visible]);

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

  const handleSelect = useCallback(
    (name: string, lifeExpectancy: number) => {
      onCountrySelect(name, lifeExpectancy);
      Keyboard.dismiss();
      onClose();
    },
    [onCountrySelect, onClose],
  );

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");

    searchInputRef.current?.focus();
  }, []);

  const renderItem: ListRenderItem<CountryRecord> = useCallback(
    ({ item }) => (
      <CountryItem
        item={item}
        isSelected={selectedCountry === item.countryName}
        onSelect={handleSelect}
      />
    ),
    [selectedCountry, handleSelect],
  );

  const keyExtractor = useCallback(
    (item: CountryRecord) => item.countryCode,
    [],
  );

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: 80,
      offset: 80 * index,
      index,
    }),
    [],
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container} edges={["top"]}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={onClose} style={styles.closeButton} hitSlop={8}>
            <Ionicons name="close" size={24} color={Colors.textPrimary} />
          </Pressable>
          <Text variant="subtitle" style={styles.title}>
            Select Country
          </Text>
          <View style={styles.placeholder} />
        </View>

        {/* Fixed Search Bar */}
        <View style={styles.searchWrapper}>
          <View style={styles.searchContainer}>
            <Ionicons
              name="search"
              size={20}
              color={Colors.textSecondary}
              style={styles.searchIcon}
            />
            <TextInput
              ref={searchInputRef}
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search country or code..."
              placeholderTextColor={Colors.placeholder}
              autoCorrect={false}
              autoCapitalize="none"
              returnKeyType="search"
              clearButtonMode="never"
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={handleClearSearch} hitSlop={8}>
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={Colors.textMuted}
                />
              </Pressable>
            )}
          </View>

          {/* Results count */}
          {searchQuery.length > 0 && (
            <View style={styles.resultsInfo}>
              <Text style={styles.resultsText}>
                {filteredCountries.length}{" "}
                {filteredCountries.length === 1 ? "country" : "countries"} found
              </Text>
            </View>
          )}
        </View>

        {/* Country List */}
        <View style={styles.listContainer}>
          <FlatList
            ref={flatListRef}
            data={filteredCountries}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            initialNumToRender={20}
            maxToRenderPerBatch={10}
            windowSize={10}
            removeClippedSubviews={true}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
            getItemLayout={getItemLayout}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons
                  name="search-outline"
                  size={48}
                  color={Colors.textMuted}
                  style={styles.emptyIcon}
                />
                <Text style={styles.emptyText}>No countries found</Text>
                <Text style={styles.emptySubtext}>
                  Try searching with a different term
                </Text>
              </View>
            }
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  closeButton: {
    padding: 4,
  },
  title: {
    color: Colors.textPrimary,
  },
  placeholder: {
    width: 32,
  },

  searchWrapper: {
    backgroundColor: Colors.background,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.inputBackground,
    borderRadius: 12,
    paddingHorizontal: 12,
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
  resultsInfo: {
    paddingTop: 8,
    paddingBottom: 4,
  },
  resultsText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: "500",
  },

  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
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
    minHeight: 72,
  },
  countryItemSelected: {
    borderColor: Colors.accentPrimary,
    backgroundColor: Colors.surface,
  },
  codeBadge: {
    width: 48,
    height: 36,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  codeText: {
    fontSize: 13,
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
    marginBottom: 4,
  },
  textSelected: {
    color: Colors.accentPrimary,
  },
  lifeExpectancyText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  emptyState: {
    padding: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptySubtext: {
    color: Colors.textMuted,
    fontSize: 14,
  },
});
