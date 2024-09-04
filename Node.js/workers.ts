import { Camunda8 } from "@camunda8/sdk";

const camunda = new Camunda8()
const zbc = camunda.getZeebeGrpcApiClient();

async function main() {
  zbc.createWorker({
    taskHandler: (job) => {
      console.log("Collecting money");
      console.log(job.variables);
      return job.complete();
    },
    taskType: "collect-money",
  });

  zbc.createWorker({
    taskType: "fetch-items", 
    taskHandler: (job) => {
      console.log("Fetching Items");
      console.log(job.variables);
      return job.complete();
    }
  });
}

main();
