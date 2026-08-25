import { DB_NAME } from "@/constants";
import { ProgressProvider } from "@/features/questions/providers/progress-provider";
import { QuestionsProvider } from "@/features/questions/providers/questions-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SQLiteProvider } from "expo-sqlite";
import { HeroUINativeProvider } from "heroui-native/provider";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const queryClient = new QueryClient();

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SQLiteProvider
        databaseName={DB_NAME}
        assetSource={{
          assetId: require("../../assets/fluently.db"), //TODO: update this to use migrations instead of a prebuilt database
          forceOverwrite: true,
        }}
        options={{
          enableChangeListener: true,
        }}
      >
        <ProgressProvider>
          <QuestionsProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <HeroUINativeProvider
                config={{
                  devInfo: {
                    stylingPrinciples: false,
                  },
                }}
              >
                {children}
              </HeroUINativeProvider>
            </GestureHandlerRootView>
          </QuestionsProvider>
        </ProgressProvider>
      </SQLiteProvider>
    </QueryClientProvider>
  );
}
