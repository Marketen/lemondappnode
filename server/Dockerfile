# server/Dockerfile

FROM golang:1.24-alpine

WORKDIR /app
COPY . .

RUN go mod tidy
RUN go build -o lemondappnode-cli

CMD [\"/app/lemondappnode-cli\"]