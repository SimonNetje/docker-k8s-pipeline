# Project Context

This repository contains the Concreto shared-hosting web app and its GitOps deployment manifests.

## Product Goal

Concreto is a shared hosting platform for users who want to host applications without managing Kubernetes or infrastructure directly. The broader platform runs on Proxmox VMs, with firewall routing, a Kubernetes cluster, GitHub Actions builds, Docker Hub images, and ArgoCD deployments.

## Current Repository Scope

This repo currently ships one container that serves both:

- the Concreto frontend from `public/`
- the FastAPI backend from `backend/main.py`

The app listens on port `8080`.

## Runtime Architecture

- `Dockerfile` builds a Python 3.12 image.
- `uvicorn backend.main:app --host 0.0.0.0 --port 8080` starts the app.
- Static HTML/CSS/JS assets live in `public/`.
- API routes live under `/api`.
- Frontend page routes support both `/docs` and `/docs.html` style URLs.
- Health check route is `/healthz`.

## Backend

The backend is implemented with FastAPI and SQLAlchemy.

Main file:

- `backend/main.py`

Dependencies:

- `fastapi`
- `uvicorn[standard]`
- `SQLAlchemy`
- `pydantic`
- `psycopg[binary]`

Persistence:

- default database is SQLite at `/data/concreto.db`
- `DATA_DIR` defaults to `/data`
- `DATABASE_URL` can override SQLite, including Postgres URLs
- Postgres-style URLs are normalized to SQLAlchemy's `postgresql+psycopg://` driver

Implemented API behavior:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/me`
- `GET /api/applications`
- `POST /api/applications`
- `GET /api/deployments`
- `POST /api/deployments`
- `PATCH /api/deployments/{deployment_id}`

Auth details:

- passwords are hashed with PBKDF2-SHA256
- login/register return a bearer token
- sessions are stored in the database as token hashes
- frontend stores the returned token in localStorage as `ph_token`

## Frontend

Static frontend files are in `public/`.

Important JavaScript files:

- `public/js/api.js`: API wrapper around `/api`
- `public/js/auth.js`: standalone login/register handlers exposed as `window.handleLogin` and `window.handleRegister`
- `public/js/app.js`: shared navigation, i18n, auth state, page interactions
- `public/js/dashboard.js`: dashboard UI and simulated deployment progress
- `public/js/demo-data.js`: now proxies dashboard data to the backend API
- `public/js/state.js`: older localStorage state helper retained for compatibility

Important pages:

- `public/index.html`
- `public/docs.html`
- `public/login.html`
- `public/register.html`
- `public/dashboard.html`

Login flow:

1. User creates an account at `/register.html`.
2. `auth.js` calls `Api.register`.
3. Backend creates the user and returns `{ token, user }`.
4. Frontend stores auth state in localStorage.
5. User is redirected to `dashboard.html`.

If login buttons appear to do nothing, check browser console for missing scripts and verify:

```js
typeof handleLogin
typeof Api
```

Both should return `"function"` or an object/function as expected.

## Kubernetes

Manifests live in `k8s/`.

Resources:

- `k8s/deployment.yaml`
- `k8s/service.yaml`
- `k8s/ingress.yaml`
- `k8s/pvc.yaml`

Deployment details:

- namespace expected: `docker-k8s-pipeline`
- deployment name: `docker-k8s-pipeline`
- container port: `8080`
- replicas: `1`
- readiness and liveness probes use `/healthz`
- `/data` is mounted from PVC `docker-k8s-pipeline-data`

Storage:

- PVC name: `docker-k8s-pipeline-data`
- StorageClass: `shared-hosting-storage`
- access mode: `ReadWriteMany`
- size: `1Gi`
- backed by dynamic NFS provisioning through `nfs-subdir-external-provisioner`

SQLite is file-based, so the deployment stays at one replica. If the backend is moved to Postgres through `DATABASE_URL`, replicas can be increased.

## CI/CD and GitOps

Workflow:

- `.github/workflows/docker-build-push.yml`

On push to `main`:

1. GitHub Actions builds the Docker image.
2. Image is pushed to Docker Hub.
3. Tags pushed:
   - `latest`
   - full Git commit SHA
4. Workflow updates `k8s/deployment.yaml` with the commit SHA image tag.
5. Workflow commits the manifest update back to `main`.
6. ArgoCD detects the Git change and deploys to Kubernetes.

Important constraint:

- CI/CD must not run `kubectl`.
- ArgoCD owns cluster deployment.

Because the workflow commits image tags back to `main`, local pushes often need:

```bash
git fetch origin
git rebase origin/main
git push origin main
```

## Operational Checks

Check pods:

```bash
kubectl get pods -n docker-k8s-pipeline
```

Check PVC:

```bash
kubectl get pvc -n docker-k8s-pipeline
kubectl describe pvc docker-k8s-pipeline-data -n docker-k8s-pipeline
```

The PVC should be `Bound`. If it is `Pending`, verify the StorageClass:

```bash
kubectl get storageclass
```

Current expected StorageClass:

```text
shared-hosting-storage
```

Check deployed image:

```bash
kubectl get deploy docker-k8s-pipeline -n docker-k8s-pipeline -o=jsonpath='{.spec.template.spec.containers[0].image}{"\n"}'
```

Check logs:

```bash
kubectl logs -n docker-k8s-pipeline deploy/docker-k8s-pipeline
```

Check service health:

```bash
kubectl port-forward -n docker-k8s-pipeline svc/docker-k8s-pipeline 8080:8080
curl http://localhost:8080/healthz
```

## Known Tradeoffs

- SQLite is acceptable for the current minimal backend but is not ideal for scaled production writes.
- Keep replicas at `1` while using SQLite.
- Use Postgres with `DATABASE_URL` before scaling API replicas.
- The dashboard deployment flow is still simulated; it stores application/deployment records but does not yet build user-submitted apps.
