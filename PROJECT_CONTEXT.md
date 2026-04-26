# Project Context

This repository is part of a larger project:

A shared hosting platform with automation and scalability.

## Architecture Overview

- Infrastructure runs on Proxmox (virtual machines)
- A firewall VM (OPNsense/pfSense) controls traffic
- A Kubernetes cluster runs applications
- Applications are deployed automatically using ArgoCD (GitOps)
- Users can host applications without managing infrastructure

## Deployment Flow

1. Developer pushes code to GitHub
2. CI/CD builds Docker image
3. Image is pushed to Docker Hub
4. Kubernetes manifests are stored in Git
5. ArgoCD detects changes and deploys automatically to the cluster

## Important Constraints

- No direct kubectl deployment from CI/CD (ArgoCD handles deployment)
- CI/CD should ONLY:
  - build Docker image
  - push image to Docker Hub
  - optionally update image tag in Kubernetes manifests

## Goal of this repository

- Automate container build process
- Prepare Kubernetes manifests
- Integrate cleanly with GitOps (ArgoCD)

## Technologies

- Docker
- Kubernetes
- GitHub Actions
- ArgoCD
- Proxmox (infrastructure layer)