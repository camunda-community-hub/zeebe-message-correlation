import { Camunda8 } from "@camunda8/sdk";

const camunda = new Camunda8()
const zbc = camunda.getCamundaRestClient();

async function main() {
  zbc.log.info("Correlating message...");
  const res = await zbc.correlateMessage({
    correlationKey: "345", 
    name: "Money Collected",
    variables: {
      paymentStatus: "paid"
    },
  });
  zbc.log.info(`Message correlated with process instance ${res.processInstanceKey}`)
}

main();
