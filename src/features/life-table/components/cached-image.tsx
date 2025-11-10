import React from "react";
import { Image } from "react-native";

interface CachedImageProps {
  uri: string;
  width: number;
  height: number;
}

export const CachedImage: React.FC<CachedImageProps> = ({
  uri,
  width,
  height,
}) => {
  return (
    <Image source={{ uri }} style={{ width, height }} resizeMode="contain" />
  );
};
