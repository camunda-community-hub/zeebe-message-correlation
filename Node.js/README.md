# Zeebe Message Correlation

Message correlation is a powerful feature in Zeebe. It allows you to target a running workflow with a state update from an external system asynchronously. 

This tutorial uses the JavaScript client, but it serves to illustrate message correlation concepts that are applicable to all language clients.

If you are doing this exercise on Camunda SaaS, remember to set the environment variables with your client credentials in each terminal window; and you will use Operate in your Camunda SaaS cluster, rather than Simple Monitor.

Note: the Rest API is only available from Camunda 8.6.0. For versions prior to 8.6.0, use the gRPC API.

## Workflow

Here is the basic example from [the Camunda 8 docs](https://docs.camunda.io/docs/product-manuals/concepts/messages):

![](../img/workflow.png)

Use the [Camunda Modeler](https://camunda.com/download/modeler/) to open the [test-messaging](bpmn/test-messaging.bpmn) file in this project.

Click on the intermediate message catch event to see how it is configured:

![](../img/message-properties.png)

A crucial piece here is the _Subscription Correlation Key_. In a running instance of this process, an incoming "_Money Collected_" message will have a `correlationKey` property:

```typescript
  zbc.correlateMessage({
    correlationKey: "345",
    name: "Money Collected",
    variables: {
      paymentStatus: "paid"
    });
```

 The value of the message `correlationKey` is matched against running process instances, by comparing the supplied value against the `orderId` variable of running instances subscribed to this message. This is the relationship established by setting the Subscription Correlation Key to `orderId` in the message catch event in the BPMN.

## Running the demonstration

 - Clone this repository.

 - Make sure you have Node.js > 22 installed.

 - Install dependencies:
 ```
 npm i
 ```

 - In another terminal start Camunda 8 using [](https://github.com/camunda/camunda-platform) (or used Hosted).

 - Set the credentials in the environment for your Camunda 8 instance.

 - Deploy the workflow and start an instance, as well as the workers:
```
npm run rest:start
```
 or
```
npm run grpc:start
```

This starts a workflow instance with the `orderId` set to 345:
 ```typescript
camunda
  .createProcessInstance({
    bpmnProcessId: "test-messaging",
    variables: {
      orderId: "345",
      customerId: "110110",
      paymentStatus: "unpaid",
    },
  })
  .then((res) =>
    camunda.log.info(`Created process instance ${res.processInstanceKey}`)
  );
 ```

Open Operate and inspect the processes, and you will see a process instance waiting at the message catch event.

 ![](../img/workflow-state.png)

- Now send the message, in another terminal, using either publish or correlate:
```
npm run rest:publish-message
```
or
```
npm run rest:correlate-message
```
or
```
npm run grpc:publish-message
```

- Refresh Operate, and you see that the message has been correlated and the workflow has run to completion:
![](../img/completed.png)

## correlateMessage vs publishMessage

Message correlation is a synchronous operation that returns the process id of the first process that the message is correlated with, or fails if no correlating message subscription is found. 

## Message Buffering

Messages are buffered on the broker, so your external systems can emit messages before your process arrives at the catch event. The amount of time that a message is buffered is configured when publishing the message from the client library. 

For example, to send a message that is buffered for 10 minutes with the JavaScript client:

```typescript
  zbc.publishMessage({
    correlationKey: "345",
    name: "Money Collected",
    variables: {
      paymentStatus: "paid"
    },
    timeToLive: 600000
  });
```

## Common Mistakes

A couple of common gotchas:

- The `correlationKey` in the BPMN message definition XML ("Subscription Correlation Key" in the modeler) is the name of the workflow variable to match against. The `correlationKey` in the message is the concrete value to match against that variable in the workflow instance. 

 - An important thing to know is that the message subscription _is not updated after it is opened_. That is not an issue in the case of a message catch event, however for boundary message events (both interrupting and non-interrupting) the subscription is opened _as soon as the token enters the bounding subprocess_. If any service task modifies the `orderId` value inside the subprocess, the subscription will not be updated.  
 
 For example, the interrupting boundary message event in the following example will not be correlated on the updated value, because the subscription is opened when the token enters the subprocess, using the value at that time:
 
 ![](../img/not-like-this.png)
 
 
 If you need a boundary message event correlated on a value that is modified somewhere in your process, then put the boundary message event in a subprocess after the task that sets the variable. The message subscription for the boundary message event will be opened when the token enters the subprocess, with the current variable value.

 ![](../img/like-this.png)

## Summary

Message Correlation is a powerful feature in Zeebe. Knowing how messages are correlated, and how and when the message subscription is created is important to design systems that perform as expected.
