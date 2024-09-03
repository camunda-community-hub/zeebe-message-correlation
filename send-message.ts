import { Camunda8 } from "@camunda8/sdk";

const camunda = new Camunda8()
const zbc = camunda.getZeebeGrpcApiClient();

async function main() {
  zbc.publishMessage({
    correlationKey: "345", // the orderId of the workflow we want to target
    name: "Money Collected",
    variables: {
      paymentStatus: "paid"
    },
    timeToLive: 600000
  });
}

main();
