import { git } from "$lib/index";

export async function load() {
  let logs = await git.log(["--no-merges"]);

  for (let i = 0; i < logs.all.length; i++) {
    // C'EST DéCALé !!!!! NON, il mets les différences du commit par rapport au HEAD
    try {
      let diff = (
        await git.diff([
          `${logs.all[i].hash}^`,
          `${logs.all[i].hash}`,
          "--shortstat",
        ])
      ).split(", ");

      diff.forEach((dif) => {
        if (dif.includes("changed"))
          logs.all[i].filesChanged = Number(dif.trim().split(" ")[0]);
        if (dif.includes("insertion"))
          logs.all[i].insertions = Number(dif.trim().split(" ")[0]);
        if (dif.includes("deletion"))
          logs.all[i].deletions = Number(dif.trim().split(" ")[0]);
      });
    } catch (err) {}
  }

  logs = JSON.stringify(logs);
  return { logs };
}
