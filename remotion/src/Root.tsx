import { Composition } from "remotion";
import { AgentTerminal } from "./scenes/AgentTerminal";

export const RemotionRoot = () => (
  <Composition
    id="main"
    component={AgentTerminal}
    durationInFrames={600}
    fps={30}
    width={1920}
    height={1080}
  />
);
