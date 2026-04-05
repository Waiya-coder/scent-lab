import type { ImageSourcePropType } from "react-native";

const fragranceImages: Record<string, ImageSourcePropType> = {
  "bal-dafrique": require("../assets/fragrances/bal-dafrique.jpg"),
  philosykos: require("../assets/fragrances/philosykos.jpg"),
  "santal-33": require("../assets/fragrances/santal-33.jpg"),
  "by-the-fireplace": require("../assets/fragrances/by-the-fireplace.jpg")
};

export function getFragranceImageSource(id: string, remoteUrl?: string): ImageSourcePropType {
  return fragranceImages[id] ?? { uri: remoteUrl };
}
