# Node-TS-Starter

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=bryopsida_node-ts-starter&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=bryopsida_node-ts-starter) [![Coverage](https://sonarcloud.io/api/project_badges/measure?project=bryopsida_node-ts-starter&metric=coverage)](https://sonarcloud.io/summary/new_code?id=bryopsida_node-ts-starter) [![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=bryopsida_node-ts-starter&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=bryopsida_node-ts-starter) [![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=bryopsida_node-ts-starter&metric=vulnerabilities)](https://sonarcloud.io/summary/new_code?id=bryopsida_node-ts-starter) [![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=bryopsida_node-ts-starter&metric=code_smells)](https://sonarcloud.io/summary/new_code?id=bryopsida_node-ts-starter) [![Bugs](https://sonarcloud.io/api/project_badges/measure?project=bryopsida_node-ts-starter&metric=bugs)](https://sonarcloud.io/summary/new_code?id=bryopsida_node-ts-starter)

This template provides a few things to kick start a TypeScript Node.JS project, an IoC library (Inversify.JS), linting (ESLint and Prettier), automatic dependency updates (Renovate), logger (Pino), Dockerfile, Document generation (Typedoc). This template purposely avoids taking opinions on frameworks that would constrain the type of services/projects created.

- [Jest](https://github.com/facebook/jest)
- [Github Action CI](.github/workflows/ci.yaml)
- [Renovate](https://github.com/renovatebot/renovate)
- [Eslint (with standard config)](https://github.com/standard/eslint-config-standard)
- [Typescript](https://github.com/Microsoft/TypeScript)
- [InversifyJS](https://github.com/inversify/InversifyJS)
- [Sonar Project File](./sonar-project.properties)
- [Dockerfile](./Dockerfile)

## NPM Scripts

The following scripts are included in the NPM project configuration

- `lint`lints the source code using eslint
- `lint:fix` automatically fixes any lint errors that can be fixed automatically
- `test` uses jest to run test suites
- `build` compiles the typescript into js and places it in the `dist` folder
- `build:docs` generates the documentation pages from the code comments
- `build:image` build the container image from the Dockerfile
- `start` runs the compiled js in `dist`
- `start:dev` runs using nodemon and will automatically rebuild and launch whenever a change is made under the source folder

## Structure

### [Services](./src/services/)

This is meant to include service abstractions, ideally each service should provide an interface/contract
exposing the functionality that other things in the application need.

### [Models](./src/models/)

This houses interfaces/models with little to no logic, the intent is these items can be passed/returned from the abstractions in services and avoid tight coupling to third party types.

### [types.ts](./src/types.ts)

This defines symbols for each type that will be configured in the IoC container, these are used to identify the type when using `@inject(TYPES.Services.Echo)` for example. For more information refer to [inversify](https://github.com/inversify/InversifyJS).

### [inversify.config.ts](./src/inversify.config.ts)

This file maps the types defined in `./src/types.ts` to interface types. For more information refer to [inversify](https://github.com/inversify/InversifyJS).

## After Using as Template Todo List

1. [ ] Update Sonar Project Properties For [Sonar Cloud](https://sonarcloud.io)
2. [ ] Add SONARQUBE_KEY secret to your repo or org if not already present
3. [ ] Point badges in README.md to correct location for you repo
4. [ ] Update [renovate.json](./renovate.json) to meet desired behavior for your needs, docs can be found [here](https://docs.renovatebot.com).
5. [ ] Update this readme to reflect your project name and info
