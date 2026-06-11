import { AbsoluteFill, Audio, Series, staticFile } from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";
import { colors } from "./theme";
import { Hook } from "./scenes/Hook";
import { Problem } from "./scenes/Problem";
import { Intake } from "./scenes/Intake";
import { Dashboard } from "./scenes/Dashboard";
import { Outcomes } from "./scenes/Outcomes";
import { CTA } from "./scenes/CTA";
import { Grid } from "./components/Grid";

loadFont("normal", { weights: ["400", "500", "600", "700", "800"], subsets: ["latin"] });

export const MainVideo = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg, fontFamily: "Inter, sans-serif" }}>
      <Grid />
      <Audio src={staticFile("audio/vo.mp3")} volume={1} />
      <Series>
        <Series.Sequence durationInFrames={300}><Hook /></Series.Sequence>
        <Series.Sequence durationInFrames={120}><Problem /></Series.Sequence>
        <Series.Sequence durationInFrames={360}><Intake /></Series.Sequence>
        <Series.Sequence durationInFrames={300}><Dashboard /></Series.Sequence>
        <Series.Sequence durationInFrames={240}><Outcomes /></Series.Sequence>
        <Series.Sequence durationInFrames={210}><CTA /></Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};
