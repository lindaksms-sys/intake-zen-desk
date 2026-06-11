import { Composition } from "remotion";
import { DashboardResult } from "./scenes/DashboardResult";

export const RemotionRoot = () => (
  <Composition
    id="main"
    component={DashboardResult}
    durationInFrames={750}
    fps={30}
    width={1920}
    height={1080}
  />
);
