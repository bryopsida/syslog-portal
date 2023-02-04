# Syslog-Portal

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=bryopsida_syslog-portal&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=bryopsida_syslog-portal) [![Coverage](https://sonarcloud.io/api/project_badges/measure?project=bryopsida_syslog-portal&metric=coverage)](https://sonarcloud.io/summary/new_code?id=bryopsida_syslog-portal) [![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=bryopsida_syslog-portal&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=bryopsida_syslog-portal) [![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=bryopsida_syslog-portal&metric=vulnerabilities)](https://sonarcloud.io/summary/new_code?id=bryopsida_syslog-portal) [![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=bryopsida_syslog-portal&metric=code_smells)](https://sonarcloud.io/summary/new_code?id=bryopsida_syslog-portal) [![Bugs](https://sonarcloud.io/api/project_badges/measure?project=bryopsida_syslog-portal&metric=bugs)](https://sonarcloud.io/summary/new_code?id=bryopsida_syslog-portal)

## What does this do?

This creates a server capable of receiving and parsing syslog messages in RFC 5424 format. The structured data component of RFC 5424 is not yet supported. It can create either a UDP or TCP server, the UDP server is more actively tested. Once launched you can either adjust the log level to output the information to standard IO for another log aggregation system to pick up or save the log messages to `syslog.messages` in mongodb. It can handle thousands of requests per minute with minimal resources: `128mi` and `256m`. This is provided as a container and a [helm chart](https://github.com/bryopsida/helm/tree/main/charts/syslog-portal), and a npm package `npm install @bryopsida/syslog-portal -g`, afterwhich you can run with `syslog-portal`.

## Intended Scope

This is not intended to provide more functionality than parsing syslog messages and archiving them into a data store, and/or publishing the parsed message into a message bus (kafka). Adding additional archivers and broadcasters (message busses) is in scope of this repo, doing any additional parsing of the inner log messages is not. That is intended to be done via other ETL setups or services that act on the broadcasted messages as desired by end users.

## Why make this?

Why make this when system X,Y, or Z can do this? I wanted a minimal but reliable syslog receiver that would be easy for me to configure, runs well on small systems such as a raspberry pi, (both linux/amd64 and linux/arm64 support) and didn't require bringing in a bunch of other systems to use.

## NPM Scripts

- `lint`lints the source code using eslint
- `lint:fix` automatically fixes any lint errors that can be fixed automatically
- `test` uses jest to run test suites
- `build` compiles the typescript into js and places it in the `dist` folder
- `build:docs` generates the documentation pages from the code comments
- `build:image` build the container image from the Dockerfile
- `start` runs the compiled js in `dist`
- `start:services` spins up mongodb in a docker-compose stack for testing
- `start:dev` runs using nodemon and will automatically rebuild and launch whenever a change is made under the source folder
- `stop:services` spins down the test services

## How to launch

### Helm

First add the helm repo: `helm repo add bryopsida https://bryopsida.github.io/helm`, fetch updates `helm repo update`, and confirm it's available:

```bash
$ helm search repo bryopsida/syslog-portal                                                                                 [20:11:24]
NAME                    CHART VERSION   APP VERSION     DESCRIPTION
bryopsida/syslog-portal 0.1.0           0.1.0           A Helm chart to launch a syslog-portal for inge..
```

launch with logLevels low:

```bash
helm upgrade --install syslog bryopsida/syslog-portal \
  --wait \
  --namespace=syslog \
  --create-namespace \
  --wait \
  --set archiver.enabled=false \
  --set loggerLevel='debug' \
  --set service.type='LoadBalancer'
```

check the service information `kubectl get services --all-namespaces`:

```
NAMESPACE      NAME                   TYPE           CLUSTER-IP      EXTERNAL-IP   PORT(S)                  AGE

syslog         syslog-syslog-portal   LoadBalancer   10.101.248.37   localhost     514:31622/UDP            2d9h
```

You can point all of your syslog sources towards that service, in this case `localhost:514`

### Docker

You can also launch with docker

```bash
docker run -p 1514:1514 --env "SYSLOG_PORTAL_LOGGER_LEVEL=trace" ghcr.io/bryopsida/syslog-portal:main
```

and send your syslog messages to `<your host>:1514`

### Direct Install

If you wish to run directly on a system, you can install with `npm install @bryopsida/syslog-portal -g` this will provide
the `syslog-portal` command in your path to run the application.

The LTS version of node is actively tested/used, previous versions may work but are not tested.

It can be run directly with no setup, with defaults by running `syslog-portal`. This will bind a UDP receiver to `0.0.0.0:1514`. Messages received will be cached in a temporary pouchdb, and synced to a couchdb every 5 minutes. The default sync target is `localhost:5984`.

To customize the configuration you can set the NODE_CONFIG_DIR env variable. For example: `NODE_CONFIG_DIR=~/.syslog-portal syslog-portal` and the receiver will use the configuration provided in that directory. The underlying configuration system is using [config](https://github.com/node-config/node-config). For more information on the available configuration values see [TODO](TODO).

## Something isn't working right?

If you come across an issue feel free to report it as an issue, I'll address it when I have time available, pull requests are also welcome.
