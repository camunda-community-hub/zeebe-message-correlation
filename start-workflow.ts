import { ZBClient } from "zeebe-node";

const zbc = new ZBClient("localhost");

async function main() {
  await zbc.deployWorkflow("./bpmn/test-messaging");
  zbc.createWorkflowInstance("test-messaging", {
    orderId: "345",
    customerId: "110110",
    paymentStatus: "unpaid"
  });
}

main();
