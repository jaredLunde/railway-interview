FROM debian:11.6-slim AS builder

WORKDIR /app

RUN apt update
RUN apt install curl unzip -y

RUN curl https://bun.sh/install | bash

COPY . .

RUN /root/.bun/bin/bun install --production

# ? -------------------------

FROM gcr.io/distroless/base

WORKDIR /app

COPY --from=builder --chown=nonroot:nonroot /root/.bun/bin/bun bun
COPY --from=builder --chown=nonroot:nonroot /app/node_modules node_modules

COPY --chown=nonroot:nonroot . .

ENV ENV=production
USER nonroot

CMD ["./bun", "--bun", "apps/api/src/index.ts"]

EXPOSE 4000
