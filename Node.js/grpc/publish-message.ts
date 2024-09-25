import { Camunda8 } from "@camunda8/sdk";

const camunda = new Camunda8()
const zbc = camunda.getZeebeGrpcApiClient();

async function main() {
  console.log("Publishing message...");
  const res = await zbc.publishMessage({
    correlationKey: "345", // the orderId of the workflow we want to target
    name: "Money Collected",
    variables: {
      paymentStatus: "paid"
    },
    timeToLive: 600000
  });
  console.log(`Message published with unique id ${res.key}`)

}

main();
