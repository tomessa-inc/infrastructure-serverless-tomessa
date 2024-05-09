FROM amazon/aws-lambda-nodejs:latest
LABEL maintainer="Tom Cruickshank"
RUN export DOCKER_DEFAULT_PLATFORM=linux/arm64
COPY . ${LAMBDA_TASK_ROOT}/
RUN apt update -y  
RUN apt install -y git-lfs

#RUN npm installnvm
CMD [ "widget.handler" ]