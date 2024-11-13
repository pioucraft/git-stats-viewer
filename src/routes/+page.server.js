import { git } from "$lib/index";

export async function load() {
  let logs = await git.log();

  for (let i = 0; i < logs.all.length; i++) {
    // C'EST DéCALé !!!!! NON, il mets les différences du commit par rapport au HEAD
    let diff = (await git.diff([logs.all[i].hash, "--shortstat"])).split(", ");
    console.log(logs.all[i].hash);
    console.log(diff);
    diff.forEach((dif) => {
      if (dif.includes("changed"))
        logs.all[i].filesChanged = Number(diff[0].trim().split(" ")[0]);
      if (dif.includes("insertion"))
        logs.all[i].insertions = Number(diff[1].trim().split(" ")[0]);
      if (dif.includes("deletion"))
        logs.all[i].deletions = Number(diff[2].trim().split(" ")[0]);
    });
  }

  logs = JSON.stringify(logs);
  return { logs };
}
