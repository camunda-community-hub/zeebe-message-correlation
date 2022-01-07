import { ZBClient } from "zeebe-node";

const zbc = new ZBClient();

async function main() {
  console.log(process.cwd())
  console.log(await zbc.deployProcess("./bpmn/test-messaging.bpmn"));
  console.log(
    await zbc.createProcessInstance("test-messaging", {
      orderId: "345",
      customerId: "110110",
      paymentStatus: "unpaid"
    })
  );
}

main();
