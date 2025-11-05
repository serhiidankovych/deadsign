import { Button } from "@/src/components/ui/button";
import React from "react";
import { View } from "react-native";
import { styles } from "./notification-settings.styles";

interface ActionButtonsProps {
  onTest: () => void;
  onViewScheduled: () => void;
}

export function ActionButtons({ onTest, onViewScheduled }: ActionButtonsProps) {
  return (
    <View style={styles.buttonRow}>
      <Button variant="secondary" onPress={onTest} style={styles.actionButton}>
        Test Notification
      </Button>
      <Button
        variant="secondary"
        onPress={onViewScheduled}
        style={styles.actionButton}
      >
        View Scheduled
      </Button>
    </View>
  );
}
