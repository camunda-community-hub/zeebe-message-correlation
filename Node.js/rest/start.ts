import { Camunda8, Dto, HTTPError } from "@camunda8/sdk";
import path from "path";

const camunda = new Camunda8().getCamundaRestClient();

class VariableDto extends Dto.LosslessDto {
  orderId!: string;
  customerId!: string;
  paymentStatus!: "unpaid" | "paid";
}

export async function main() {

  const worker1 = camunda
    .createJobWorker({
      jobHandler: (job) => {
        worker1.log.info(
          `Job worker collecting money for order id ${job.variables.orderId}`
        );
        worker1.log.info(`Send message from external system when ready...`);
        return job.complete();
      },
      inputVariableDto: VariableDto,
      type: "collect-money",
      worker: "money-worker",
      maxJobsToActivate: 1,
      timeout: 10000,
      pollIntervalMs: 1000,
    })
    .on("pollError", (e) => {
      worker1.log.error(`Worker 1 error polling for jobs`);
      if (e instanceof HTTPError) {
        worker1.log.error(e.response.body);
      } else {
        throw e;
      }
    })
    .on("start", () => worker1.log.info(`Worker 1 starting`));


  const worker2 = camunda
    .createJobWorker({
      type: "fetch-items",
      jobHandler: (job) => {
        worker2.log.info(
          `Fetch items worker fetching items for order ${job.variables.orderId} in process instance ${job.processInstanceKey}`
        );
        return job.complete();
      },
      inputVariableDto: VariableDto,
      worker: "fetch-items-worker",
      maxJobsToActivate: 1,
      timeout: 10000,
      pollIntervalMs: 1000,
      autoStart: false,
    })
    .on("pollError", (e) => {
      worker2.log.error(`Worker 2 error polling for jobs`);
      if (e instanceof HTTPError) {
        worker2.log.error(e.response.body);
      } else {
        throw e;
      }
    })
    .on("start", () => worker2.log.info(`Worker 2 starting`));

  worker2.start();

  await camunda
    .deployResourcesFromFiles([path.join("..", "bpmn", "test-messaging.bpmn")])
    .then((res) =>
      camunda.log.info(
        `Deployed process definition ${res.processes[0].bpmnProcessId}`
      )
    );

  const variables = Dto.createDtoInstance(VariableDto, {
    orderId: "345",
    customerId: "110110",
    paymentStatus: "unpaid",
  });
  

  await camunda
    .createProcessInstance({
      bpmnProcessId: "test-messaging",
      variables,
    })
    .then((res) => {
      camunda.log.info(`Created process instance ${res.processInstanceKey}`)
    }
    );
}

main();
