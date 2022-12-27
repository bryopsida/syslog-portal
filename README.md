# Syslog-Portal

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=bryopsida_syslog-portal&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=bryopsida_syslog-portal) [![Coverage](https://sonarcloud.io/api/project_badges/measure?project=bryopsida_syslog-portal&metric=coverage)](https://sonarcloud.io/summary/new_code?id=bryopsida_syslog-portal) [![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=bryopsida_syslog-portal&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=bryopsida_syslog-portal) [![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=bryopsida_syslog-portal&metric=vulnerabilities)](https://sonarcloud.io/summary/new_code?id=bryopsida_syslog-portal) [![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=bryopsida_syslog-portal&metric=code_smells)](https://sonarcloud.io/summary/new_code?id=bryopsida_syslog-portal) [![Bugs](https://sonarcloud.io/api/project_badges/measure?project=bryopsida_syslog-portal&metric=bugs)](https://sonarcloud.io/summary/new_code?id=bryopsida_syslog-portal)

This is currently a work in progress, the goal is to create a service that listens for incoming syslog data and is capable of recording that data to a data store or publishing to a event bus for another system to record or process.

## NPM Scripts

- `lint`lints the source code using eslint
- `lint:fix` automatically fixes any lint errors that can be fixed automatically
- `test` uses jest to run test suites
- `build` compiles the typescript into js and places it in the `dist` folder
- `build:docs` generates the documentation pages from the code comments
- `build:image` build the container image from the Dockerfile
- `start` runs the compiled js in `dist`
- `start:dev` runs using nodemon and will automatically rebuild and launch whenever a change is made under the source folder
