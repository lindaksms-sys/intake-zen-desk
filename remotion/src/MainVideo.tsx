import { AbsoluteFill, Sequence, useCurrentFrame, interpolate } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { SceneBrand } from "./scenes/SceneBrand";
import { SceneSubtitle } from "./scenes/SceneSubtitle";
import { SceneProduct } from "./scenes/SceneProduct";
import { colors } from "./theme";

const BgGrain: React.FC = () => {
  const frame = useCurrentFrame();
  const shift = interpolate(frame, [0, 450], [0, 30]);
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(1200px 800px at ${20 + shift}% 10%, ${colors.routineSoft} 0%, transparent 60%), radial-gradient(900px 700px at 85% 90%, #EEF2F7 0%, transparent 55%), ${colors.bg}`,
      }}
    />
  );
};

export const MainVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg, fontFamily: "Inter, system-ui, sans-serif" }}>
      <BgGrain />
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={130}>
          <SceneBrand />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 15 })} />
        <TransitionSeries.Sequence durationInFrames={120}>
          <SceneSubtitle />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 18 })} />
        <TransitionSeries.Sequence durationInFrames={235}>
          <SceneProduct />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
