import { ZBClient } from "zeebe-node";

const zbc = new ZBClient("localhost");

async function main() {
  zbc.createWorker(
    "collect-money-worker",
    "collect-money",
    (job, complete, w) => {
      w.log("Collecting money");
      w.log(job.variables);
      complete.success();
    }
  );

  zbc.createWorker("fetch-items-worker", "fetch-items", (job, complete, w) => {
    w.log("Fetching Items");
    w.log(job.variables);
    complete.success();
  });
}

main();
