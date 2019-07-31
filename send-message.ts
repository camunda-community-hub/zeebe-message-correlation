import { ZBClient } from "zeebe-node";

const zbc = new ZBClient("localhost");

async function main() {
  zbc.publishMessage({
    correlationKey: "345", // the orderId of the workflow we want to target
    name: "Money Collected",
    variables: {
      paymentStatus: "paid"
    },
    timeToLive: 5000
  });
}

main();
