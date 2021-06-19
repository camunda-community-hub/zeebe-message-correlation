import { ZBClient } from "zeebe-node";

const zbc = new ZBClient("localhost");

async function main() {
  zbc.createWorker({
    taskHandler: (job, _, w) => {
      w.log("Collecting money");
      w.log(job.variables);
      return job.complete();
    },
    taskType: "collect-money",
  });

  zbc.createWorker({
    taskType: "fetch-items", 
    taskHandler: (job, _, w) => {
      w.log("Fetching Items");
      w.log(job.variables);
      return job.complete();
    }
  });
}

main();
