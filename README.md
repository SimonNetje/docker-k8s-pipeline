# docker-k8s-pipeline

This repository contains the static Concreto frontend packaged as a Docker image, with Kubernetes manifests prepared for a GitOps deployment flow with ArgoCD.

## Application type

The application is packaged as a static HTTP service using an unprivileged NGINX container on port `8080`. Static site files live in `public/`.

The original Concreto frontend repository also contains a backend. This repository currently deploys only the static frontend; API/auth routes require a backend deployment to be added separately.

## Required GitHub secrets

Configure these repository secrets before enabling the pipeline:

- `DOCKERHUB_USERNAME`: Docker Hub username or organization that owns the target repository.
- `DOCKERHUB_TOKEN`: Docker Hub access token with permission to push images.

The workflow uses the default `GITHUB_TOKEN` to commit the updated Kubernetes image reference back to the repository.

## CI/CD and GitOps flow

On every push to `main`, GitHub Actions builds the Docker image and pushes it to Docker Hub with two tags:

- `latest`
- the full commit SHA

After the image is pushed, the workflow updates `k8s/deployment.yaml` to use the commit SHA image tag, commits that manifest change, and pushes it back to `main`. ArgoCD should watch this repository and apply the updated Kubernetes manifests from Git. The pipeline does not use `kubectl` and does not require direct cluster access.

## Kubernetes resources

The manifests in `k8s/` define:

- a `Deployment` with 2 replicas, labels/selectors, port `8080`, and basic resource requests/limits.
- a `ClusterIP` `Service` exposing port `8080` inside the cluster.
- an `Ingress` routing HTTP traffic to the service. Replace `docker-k8s-pipeline.example.com` in `k8s/ingress.yaml` with the real domain before deploying publicly.
