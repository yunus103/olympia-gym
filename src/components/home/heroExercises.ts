// Scene-side constants kept out of HeroScene so the DOM controls don't pull three.js into the main bundle.
export type ExerciseKey = "bicep" | "frontraise" | "squat";

export interface ExerciseConfig {
  key: ExerciseKey;
  label: string;
  actionName: string;
  // TODO: move to Sanity once the copy settles.
  title: string;
  muscle: string;
  note: string;
}

export const EXERCISES: ExerciseConfig[] = [
  { key: "bicep", label: "Biceps", actionName: "BicepCurl", title: "Biceps Curl", muscle: "Biceps brachii", note: "Kol kalınlığı ve çekiş gücü" },
  { key: "frontraise", label: "Omuz", actionName: "FrontRaise", title: "Front Raise", muscle: "Ön deltoid", note: "Omuz genişliği ve duruş" },
  { key: "squat", label: "Bacak", actionName: "Squat", title: "Squat", muscle: "Quadriceps · Gluteus", note: "Tüm vücut gücünün temeli" },
];
