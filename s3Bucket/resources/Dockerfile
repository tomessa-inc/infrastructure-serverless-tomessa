FROM amazon/aws-lambda-nodejs:latest
LABEL maintainer="Tom Cruickshank"
RUN export DOCKER_DEFAULT_PLATFORM=linux/arm64
COPY . ${LAMBDA_TASK_ROOT}/
RUN apk update
RUN yum install git-lfs

#RUN npm installnvm
CMD [ "widget.handler" ]