import { Camunda8 } from "@camunda8/sdk";

const camunda = new Camunda8()
const zbc = camunda.getCamundaRestClient();

async function main() {
  zbc.log.info("Publishing message...");
  const res = await zbc.publishMessage({
    correlationKey: "345", 
    name: "Money Collected",
    variables: {
      paymentStatus: "paid"
    },
  });
  zbc.log.info(`Message published with unique id ${res.key}`)
}

main();
