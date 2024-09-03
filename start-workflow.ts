import { Camunda8 } from "@camunda8/sdk";

const camunda = new Camunda8();
const zbc = camunda.getZeebeGrpcApiClient();

async function main() {
  console.log(process.cwd());
  console.log(
    await zbc.deployResource({ processFilename: "./bpmn/test-messaging.bpmn" })
  );
  console.log(
    await zbc.createProcessInstance({
      bpmnProcessId: "test-messaging",
      variables: {
        orderId: "345",
        customerId: "110110",
        paymentStatus: "unpaid",
      },
    })
  );
}

main();
