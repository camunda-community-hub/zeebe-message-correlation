import { Camunda8 } from "@camunda8/sdk";
import path from "path";

const camunda = new Camunda8();
const zbc = camunda.getZeebeGrpcApiClient();

async function main() {
  const res = await zbc.deployResource({
      processFilename: path.join("..", "bpmn", "test-messaging.bpmn"),
    })
  console.log(`Deployed process ${res.deployments[0].process.bpmnProcessId}`)
  const processInstance = await zbc.createProcessInstance({
      bpmnProcessId: "test-messaging",
      variables: {
        orderId: "345",
        customerId: "110110",
        paymentStatus: "unpaid",
      },
    })
  console.log(`Created process instance ${processInstance.processInstanceKey}`)
  
  zbc.createWorker({
    taskHandler: (job) => {
      console.log( `Job worker collecting money for order id ${job.variables.orderId}`);
      console.log(`Send message from external system when ready...`)
      return job.complete();
    },
    taskType: "collect-money",
  });

  zbc.createWorker({
    taskType: "fetch-items", 
    taskHandler: (job) => {
      console.log(
        `Fetch items worker fetching items for order ${job.variables.orderId} in process instance ${job.processInstanceKey}`
      );
      return job.complete();
    }
  });
}

main();
