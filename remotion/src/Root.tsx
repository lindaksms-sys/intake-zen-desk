import { Composition } from "remotion";
import { ScreenDemo } from "./scenes/ScreenDemo";

export const RemotionRoot = () => (
  <Composition
    id="main"
    component={ScreenDemo}
    durationInFrames={600}
    fps={30}
    width={1920}
    height={1080}
  />
);
