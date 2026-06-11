import { Composition } from "remotion";
import { IntakeDemo } from "./scenes/IntakeDemo";

export const RemotionRoot = () => (
  <Composition
    id="main"
    component={IntakeDemo}
    durationInFrames={900}
    fps={30}
    width={1920}
    height={1080}
  />
);
