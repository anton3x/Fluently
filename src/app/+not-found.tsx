import { Link, Stack } from "expo-router";
import { View, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";

export default function NotFoundScreen() {
  const { t } = useTranslation();

  return (
    <>
      <Stack.Screen options={{ title: t("notFound.title") }} />
      <View style={styles.container}>
        <Link href={"/"} style={styles.hyperlinks}>
          {t("notFound.action")}
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#25292e",
    alignItems: "center",
    justifyContent: "center",
  },
  hyperlinks: {
    fontWeight: "bold",
    color: "#fff",
    textDecorationLine: "underline",
    fontSize: 20,
  },
});
