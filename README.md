# docker-k8s-pipeline

This repository contains the Concreto frontend and FastAPI backend packaged as one Docker image, with Kubernetes manifests prepared for a GitOps deployment flow with ArgoCD.

## Application type

The application is packaged as a FastAPI service on port `8080`. Static site files live in `public/`, and the API lives under `/api`.

The backend currently supports account registration, login/logout, authenticated dashboard application records, and deployment history. It uses SQLite by default at `/data/concreto.db` and can be pointed at another SQL database with `DATABASE_URL`.

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

- a `Deployment` with 1 replica, labels/selectors, port `8080`, health probes, and basic resource requests/limits.
- a `ClusterIP` `Service` exposing port `8080` inside the cluster.
- an `Ingress` routing HTTP traffic to the service. Replace `docker-k8s-pipeline.example.com` in `k8s/ingress.yaml` with the real domain before deploying publicly.
- a `PersistentVolumeClaim` mounted at `/data` for the default SQLite database.

The deployment runs one replica by default because SQLite is file-based. If you move to PostgreSQL or another shared database through `DATABASE_URL`, you can scale replicas safely.
