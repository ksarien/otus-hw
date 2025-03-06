minikube start

helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update

cd hw7-billing-chart

helm install ingress-nginx ingress-nginx/ingress-nginx --namespace ingress-nginx --create-namespace
helm install otus-mysql -f helm/mysql-values.yaml bitnami/mysql -n otus-billing --create-namespace

helm upgrade --install otus-billing . -n otus-billing

newman run tests.json --env-var baseUrl=http://arch.homework --reporter-cli
