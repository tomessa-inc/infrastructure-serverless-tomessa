#FROM amazon/aws-lambda-nodejs:latest
FROM public.ecr.aws/lambda/nodejs:latest
LABEL maintainer="Tom Cruickshank"
#RUN export DOCKER_DEFAULT_PLATFORM=linux/arm64
COPY . ${LAMBDA_TASK_ROOT}/
RUN dnf install -y git-lfs
RUN ls -al
RUN cat /lambda-entrypoint.sh
#RUN yum install git-lfs

#RUN npm installnvm
#CMD [ "widget.handler" ]