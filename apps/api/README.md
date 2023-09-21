# FlexStack User API

> The FlexStack User API is the API exposed to FlexStack's users through the
> web interface. It is used to create and manage teams, user accounts, and more.

## Local development

### Prerequisites

- [Bun](https://bun.sh/)
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Setup

1. Clone the repository

```sh
git clone https://github.com/flexstack/flexstack
```

2. Install dependencies

```sh
bun install
```

3. Set up the development environment

```sh
bun runs dev:up
```

4. Start the development servers

```sh
bun runs dev
```

### Teardown

When you're done, stop the development servers and containers by running:

```sh
bun runs dev:down
```
