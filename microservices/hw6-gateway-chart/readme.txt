minikube start

helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update

helm install ingress-nginx ingress-nginx/ingress-nginx --namespace ingress-nginx --create-namespace

cd hw6-gateway-chart

helm dependency update

helm install mysql-auth -f helm/values-auth.yaml bitnami/mysql -n mysql --create-namespace
helm install mysql-user -f helm/values-user.yaml bitnami/mysql -n mysql

helm upgrade --install otus-gateway . -n otus-gateway

newman run tests.json --env-var baseUrl=http://arch.homework --reporter-cli
