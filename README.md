# 🍿 Serverless Movie Search Engine

A movie search engine that utilises [Terraform](https://www.terraform.io/) for provisioning cloud resources and hosted on the AWS Cloud with [AWS Lambda](https://aws.amazon.com/lambda/) function and [Amazon API Gateway](https://aws.amazon.com/api-gateway/) stack.

## Techstack

- [Terraform](https://www.terraform.io/) is an open-source infrastructure as code software tool that provides a consistent CLI workflow to manage hundreds of cloud services.
- [Typescript](https://www.typescriptlang.org/) is an open-source language which builds on JavaScript, one of the world’s most used tools, by adding static type definitions.
- [AWS Lambda](https://aws.amazon.com/lambda/) is a serverless compute service that lets you run code without provisioning or managing servers, creating workload-aware cluster scaling logic, maintaining event integrations, or managing runtimes.
- [Amazon API Gateway](https://aws.amazon.com/api-gateway/) is a fully managed service that makes it easy for developers to create, publish, maintain, monitor, and secure APIs at any scale.

## Prepare before deploy 🚀

Before going to deploy step, you need to request an **ACM Public Cerfiticate**, read the AWS docs for more details:

- [Request a public certificate using the console](https://docs.aws.amazon.com/acm/latest/userguide/gs-acm-request-public.html)

After that, you need to create **API Gateway** > **Custom domain name** with the **ACM Public Certificate** on the previous step, read the AWS Docs for more details:

- [Setting up custom domain names for REST APIs](https://docs.aws.amazon.com/apigateway/latest/developerguide/how-to-custom-domains.html)

## Deployment 🚀

- Run `yarn lint` to lint TS code using both ESLint and Prettier working together
- Run `yarn script:build-dependency-layer` this will run a bash script to zip up production dependencies and add them to the lamba as a layer
- Run `yarn build` to run TSC to compile TS code to plain JS
- Run `yarn cleanup` to remove generated files after deployment steps
- Run `yarn tf:init` to get aws provider plugin downloaded
- Run `yarn tf:plan` to see changes that will be made
- Run `yarn tf:apply` to actually make those changes to your provider
- Visit AWS and see all your services provisioned via terraform
- Run `yarn tf:destroy` to destroy all the services that were built

You can also simply call `yarn deploy:all` to both zip up an archive and provision the resources together. Similarly you could run `yarn update:all` to destroy all resources and re-provision them.

## Inspiration & References

- [Terraform Lambda Typescript Starter](https://github.com/rahman95/terraform-lambda-typescript-starter) This is a basic Hello World starter template that utilises terraform for provisioning cloud resources. It is an opionanted starter which uses TypeScript, ESlint, Prettier and Husky.
