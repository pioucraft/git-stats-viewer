import { simpleGit } from "simple-git";

// or split out the baseDir, supported for backward compatibility
export const git = simpleGit("../assimly", { binary: "git" });
