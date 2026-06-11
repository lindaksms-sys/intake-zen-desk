import { Composition } from "remotion";
import { ClipFrame } from "./components/ClipFrame";
import { Intro } from "./scenes/Intro";
import { SceneLogin } from "./scenes/SceneLogin";
import { IntakeDemo } from "./scenes/IntakeDemo";
import { AgentTerminal } from "./scenes/AgentTerminal";
import { DashboardResult } from "./scenes/DashboardResult";
import { SceneProduct } from "./scenes/SceneProduct";
import { SceneArchitecture } from "./scenes/SceneArchitecture";
import { SceneClosing } from "./scenes/SceneClosing";
import { FullDemo, FULL_DEMO_DURATION } from "./scenes/FullDemo";

// 30fps, 1920x1080 across the board
const W = 1920;
const H = 1080;
const FPS = 30;

type ClipDef = {
  id: string;
  step: number;
  eyebrow: string;
  title: string;
  durationSeconds: number;
  Component: React.FC;
};

export const CLIPS: ClipDef[] = [
  { id: "01-intro",        step: 1, eyebrow: "Intro",          title: "Clinic Intake Copilot",     durationSeconds: 14, Component: Intro },
  { id: "02-login",        step: 2, eyebrow: "Sign in",        title: "Staff sign-in",             durationSeconds: 14, Component: SceneLogin },
  { id: "03-intake",       step: 3, eyebrow: "Intake",         title: "Patient submits intake",    durationSeconds: 30, Component: IntakeDemo },
  { id: "04-triage",       step: 4, eyebrow: "AI triage",      title: "Agent processes the case",  durationSeconds: 20, Component: AgentTerminal },
  { id: "05-case-result",  step: 5, eyebrow: "Case result",    title: "Structured triage output",  durationSeconds: 25, Component: DashboardResult },
  { id: "06-dashboard",    step: 6, eyebrow: "Workflow",       title: "Staff dashboard & queue",   durationSeconds: 18, Component: SceneProduct },
  { id: "07-architecture", step: 7, eyebrow: "Architecture",   title: "Under the hood",            durationSeconds: 18, Component: SceneArchitecture },
  { id: "08-closing",      step: 8, eyebrow: "Impact",         title: "Built for clinic intake",   durationSeconds: 14, Component: SceneClosing },
];

const TOTAL_STEPS = CLIPS.length;

export const RemotionRoot = () => (
  <>
    {CLIPS.map((c) => {
      const Comp = c.Component;
      return (
        <Composition
          key={c.id}
          id={c.id}
          component={() => (
            <ClipFrame step={c.step} total={TOTAL_STEPS} eyebrow={c.eyebrow} title={c.title}>
              <Comp />
            </ClipFrame>
          )}
          durationInFrames={c.durationSeconds * FPS}
          fps={FPS}
          width={W}
          height={H}
        />
      );
    })}

    {/* Legacy combined composition — kept so older render scripts still work */}
    <Composition
      id="main"
      component={FullDemo}
      durationInFrames={FULL_DEMO_DURATION}
      fps={FPS}
      width={W}
      height={H}
    />
  </>
);
