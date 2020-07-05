docker build -t scranga/multi-client:latest -t scranga/multi-client:$GIT_SHA -f ./client/Dockerfile ./client
docker build -t scranga/multi-server:latest -t scranga/multi-server:$GIT_SHA -f ./server/Dockerfile ./server
docker build -t scranga/multi-worker:latest -t scranga/multi-worker:$GIT_SHA -f ./worker/Dockerfile ./worker

docker push scranga/multi-client:latest
docker push scranga/multi-server:latest
docker push scranga/multi-worker:latest

docker push scranga/multi-client:$GIT_SHA
docker push scranga/multi-server:$GIT_SHA
docker push scranga/multi-worker:$GIT_SHA

kubectl apply -f k8s

kubectl set image deployments/client-deployment client=scranga/multi-client:$GIT_SHA
kubectl set image deployments/server-deployment server=scranga/multi-server:$GIT_SHA
kubectl set image deployments/worker-deployment worker=scranga/multi-worker:$GIT_SHA