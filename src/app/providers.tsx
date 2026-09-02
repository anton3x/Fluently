import { DB_NAME } from "@/constants";
import { ProgressProvider } from "@/features/questions/providers/progress-provider";
import { QuestionsProvider } from "@/features/questions/providers/questions-provider";
import { DailyActivityProvider } from "@/features/questions/providers/daily-activity-provider";
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
          assetId: require("../../assets/fluently.db"),
          forceOverwrite: true,
        }}
        options={{
          enableChangeListener: true,
        }}
      >
        <ProgressProvider>
          <QuestionsProvider>
            <DailyActivityProvider>
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
            </DailyActivityProvider>
          </QuestionsProvider>
        </ProgressProvider>
      </SQLiteProvider>
    </QueryClientProvider>
  );
}
