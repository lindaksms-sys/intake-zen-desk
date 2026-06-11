import { Composition } from "remotion";
import { FullDemo, FULL_DEMO_DURATION } from "./scenes/FullDemo";

export const RemotionRoot = () => (
  <Composition
    id="main"
    component={FullDemo}
    durationInFrames={FULL_DEMO_DURATION}
    fps={30}
    width={1920}
    height={1080}
  />
);
