import { ZBClient } from "zeebe-node";

const zbc = new ZBClient("localhost");

async function main() {
  console.log(await zbc.deployWorkflow("./bpmn/test-messaging"));
  console.log(
    await zbc.createWorkflowInstance("test-messaging", {
      orderId: "345",
      customerId: "110110",
      paymentStatus: "unpaid"
    })
  );
}

main();
