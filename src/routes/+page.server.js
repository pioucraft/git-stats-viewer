import { git } from "$lib/index";

export async function load() {
  let logs = await git.log();
  async () => {
    for (let i = 0; i < logs.all.length; i++) {
      // C'EST DéCALé !!!!!
      let diff = (await git.diff([logs.all[i].hash, "--shortstat"])).split(
        ", ",
      );
      diff.forEach((dif) => {
        if (dif.includes("changed"))
          logs.all[i].filesChanged = Number(diff[0].trim().split(" ")[0]);
        if (dif.includes("insertion"))
          logs.all[i].insertions = Number(diff[1].trim().split(" ")[0]);
        if (dif.includes("deletion"))
          logs.all[i].deletions = Number(diff[2].trim().split(" ")[0]);
      });
    }
  };

  logs = JSON.stringify(logs);
  return { logs };
}
