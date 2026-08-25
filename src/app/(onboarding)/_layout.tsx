import { Stack } from 'expo-router'
import { useThemeColor } from 'heroui-native/hooks'

export default function Layout() {
  const [background] = useThemeColor(['background'])
  return (
    <Stack
      screenOptions={{
        animation: 'slide_from_right',
        headerTitle: '',
        //headerTintColor: foreground,
        headerBackButtonDisplayMode: 'minimal',
        headerShadowVisible: false,
        //headerTransparent: true,
        headerStyle: {
          backgroundColor: background,
        },
      }}
      initialRouteName="first"
    />
  )
}