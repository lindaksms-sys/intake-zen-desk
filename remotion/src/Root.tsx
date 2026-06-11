import { Composition } from "remotion";
import { MainVideo } from "./MainVideo";
import { Intro } from "./scenes/Intro";
import { loadFont } from "@remotion/google-fonts/Inter";

loadFont("normal", { weights: ["400", "500", "600", "700", "800"], subsets: ["latin"] });

export const RemotionRoot = () => (
  <>
    <Composition
      id="main"
      component={MainVideo}
      durationInFrames={1530}
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition
      id="intro"
      component={Intro}
      durationInFrames={450}
      fps={30}
      width={1920}
      height={1080}
    />
  </>
);
