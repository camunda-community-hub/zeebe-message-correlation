package com.jwulf;

import io.camunda.zeebe.client.ZeebeClient;
import io.camunda.zeebe.client.impl.oauth.OAuthCredentialsProvider;
import io.camunda.zeebe.client.impl.oauth.OAuthCredentialsProviderBuilder;

import java.time.Duration;
import java.util.HashMap;
import java.util.Scanner;

/**
 * Hello world!
 *
 */
public class App {
    private static final String audience = "zeebe.camunda.io";

    private static final String oAuthAPI = System.getenv("CAMUNDA_OAUTH_URL");

    public static void main(String[] args) {
        OAuthCredentialsProvider credentialsProvider = new OAuthCredentialsProviderBuilder()
            .authorizationServerUrl(oAuthAPI)
            .audience(audience)
            .clientId(System.getenv("ZEEBE_CLIENT_ID"))
            .clientSecret(System.getenv("ZEEBE_CLIENT_SECRET"))
            .build();

            BooleanReference continueExecutionRef = new BooleanReference();
            continueExecutionRef.setValue(false);

            try (ZeebeClient client = ZeebeClient.newClientBuilder()
                .applyEnvironmentVariableOverrides(false)
                .credentialsProvider(credentialsProvider)
                .usePlaintext()
                .build()) {

            client.newDeployResourceCommand()
                .addResourceFromClasspath("test-messaging.bpmn")
                .send()
                .join();

            client.newStreamJobsCommand()
                .jobType("collect-money")
                .consumer(activatedJob -> {
                    System.out.println("[\"collect-money\" Job Worker]: Executed call to external system to collect money");
                    client.newCompleteCommand(activatedJob).send();
                    // This is just to make the console output ordered
                    continueExecutionRef.setValue(true);
                })
                .timeout(Duration.ofSeconds(30))
                .workerName("java-worker")
                .send();

            client.newStreamJobsCommand()
                .jobType("fetch-items")
                .consumer(activatedJob -> {
                    System.out.println("[\"fetch-items\" Job Worker]: Fetching items");
                    client.newCompleteCommand(activatedJob).send();
                    // This is just to make the console output ordered
                    continueExecutionRef.setValue(true);
                })
                .timeout(Duration.ofSeconds(30))
                .workerName("java-worker")
                .send();

            client.newCreateInstanceCommand()
                .bpmnProcessId("test-messaging")
                .latestVersion()
                .variables(new HashMap<String, String>() {
                    {
                        put("orderId", "345");
                        put("customerId", "110110");
                        put("paymentStatus", "unpaid");
                    }
                })
                .send()
                .join();

            System.out.println("\nCreated process instance with orderId 345");

            Scanner scanner = new Scanner(System.in);
            String input = "";

            // while (!continueExecutionRef.getValue()) {
            //     input = scanner.nextLine();
            // }

            System.out.println("\nPress enter to publish the money collected message from the external system");

            // Wait for any key press
            System.console().readLine();

            System.out.println("Publishing message from external system");

            continueExecutionRef.setValue(false);

            client.newPublishMessageCommand()
                .messageName("Money Collected")
                .correlationKey("345")
                .variables(new HashMap<String, String>() {
                    {
                        put("paymentStatus", "paid");
                    }
                })
                .send()
                .join();
            
            System.out.println("Press enter to exit the program...");
            while (!continueExecutionRef.getValue()) {
                input = scanner.nextLine();
            }

            scanner.close();
            System.out.println("\nProcess completed.");
        }
    }
    static class BooleanReference {
        private boolean value;

        void setValue(boolean newValue) {
            this.value = newValue;
        }

        boolean getValue() {
            return this.value;
        }
    }
}
