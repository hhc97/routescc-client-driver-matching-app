# syntax=docker/dockerfile:1
FROM node:16-alpine as builder

COPY /client /client

RUN npm install react-scripts@latest -g
RUN cd client && npm install && npm run build


FROM python:3.9

COPY requirements.txt requirements.txt
RUN pip3 install -r requirements.txt

COPY /server /server
COPY --from=builder /client/build /client/build


CMD ["gunicorn", "-b", ":5000", "server.app:app"]
