minikube start

helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update

cd hw8-saga-chart

helm install ingress-nginx ingress-nginx/ingress-nginx --namespace ingress-nginx --create-namespace

helm install otus-mysql oci://registry-1.docker.io/bitnamicharts/mysql \
  -f helm/mysql-values.yaml \
  -n otus-saga --create-namespace

helm upgrade --install otus-saga . -n otus-saga --create-namespace


newman run tests.json --env-var baseUrl=http://arch.homework --reporter-cli
