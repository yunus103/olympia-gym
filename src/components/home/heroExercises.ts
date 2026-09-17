// Scene-side constants kept out of HeroScene so the DOM controls don't pull three.js into the main bundle.
export type ExerciseKey = "bicep" | "frontraise" | "squat";

export const EXERCISES: { key: ExerciseKey; label: string; actionName: string }[] = [
  { key: "bicep", label: "Biceps Curl", actionName: "BicepCurl" },
  { key: "frontraise", label: "Front Raise", actionName: "FrontRaise" },
  { key: "squat", label: "Squat", actionName: "Squat" },
];
