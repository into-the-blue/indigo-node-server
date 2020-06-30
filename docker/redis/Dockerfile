FROM redis:latest

RUN sudo sysctl vm.overcommit_memory=1

RUN sudo sysctl -w net.core.somaxconn=1024