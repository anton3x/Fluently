import { useThemeColor } from "heroui-native";
import { useTranslation } from "react-i18next";
import Svg, { Circle, Text as SvgText } from "react-native-svg";

function ProgressRing({ value }: { value: number }) {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min(100, Math.max(0, value));
  const [trackColor, progressColor, labelColor] = useThemeColor([
    "default",
    "accent",
    "foreground",
  ]);
  const { t } = useTranslation();

  return (
    <Svg
      width={96}
      height={96}
      viewBox="0 0 72 72"
      accessibilityLabel={t("accessibility.progressComplete", { percentage })}
    >
      <Circle cx="36" cy="36" r={radius} stroke={trackColor} strokeWidth="8" fill="none" />
      <Circle
        cx="36"
        cy="36"
        r={radius}
        stroke={progressColor}
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - percentage / 100)}
        transform="rotate(-90 36 36)"
      />
      <SvgText x="36" y="41" textAnchor="middle" fontSize="16" fontWeight="700" fill={labelColor}>
        {percentage}
      </SvgText>
    </Svg>
  );
}

export { ProgressRing };
