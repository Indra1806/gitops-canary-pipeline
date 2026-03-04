# 🏥 ClinicOS: GitOps & Service Mesh Architecture

## Executive Summary
This document serves as the learning journal and operational runbook for the ClinicOS infrastructure. It details the transition from local application source code to a fully automated, declarative GitOps pipeline running on a local Kubernetes cluster, managed by ArgoCD and secured by the Istio Service Mesh.

## System Architecture

The following diagram illustrates the flow of code from the developer to the live infrastructure.

```text
[ Developer ]
      │ (git push)
      ▼
[ GitHub Repository (The Source of Truth) ]
├── /frontend/ (React App Code)
└── /k8s/app/  (Declarative YAML Manifests)
      │
      │ (Continuous Pull/Reconciliation)
      ▼
[ Kubernetes Cluster (Minikube) ]
├── Namespace: argocd
│   └── ArgoCD Controller (Watches GitHub for changes)
│
└── Namespace: default
    ├── Service: clinicos-service (Entrypoint)
    │
    ├── Deployment: clinicos-v1 (Stable)
    │   └── Pod [ React App + Istio Envoy Proxy ]
    │
    └── Deployment: clinicos-v2 (Canary)
        └── Pod [ React App + Istio Envoy Proxy ]

```

## Milestone 1: Containerization & Monorepo Strategy

**Objective:** Secure the source code and compile the application into immutable Docker artifacts.

### 1. The Monorepo Structure

We utilized a flat directory structure to prevent Docker context bloat.

* `frontend/`: Contains the React application and multi-stage `Dockerfile`.
* `docs/`: Contains the `Error_Ledger.md` for tracking infrastructure conflicts.

### 2. Compiling the Artifacts

We built two distinct versions of the application (Teal v1 and Purple v2) and pushed them to Docker Hub.

```bash
# Example: Building the stable V1 artifact
cd frontend
docker build -t Indra1806/clinicos:v1 .
docker push Indra1806/clinicos:v1

```

## Milestone 2: Kubernetes & GitOps Provisioning

**Objective:** Stand up the control plane and install the declarative continuous deployment controller.

### 1. Provision the Infrastructure

> **⚠️ CRITICAL NOTE:** The cluster must be provisioned with extended memory to support enterprise tools like Istio and ArgoCD. Do not use the default limits.

```bash
minikube start --memory=6144 --cpus=4

```

### 2. Install ArgoCD

ArgoCD is installed into an isolated namespace. We utilize Server-Side Apply to bypass Kubernetes client-side annotation limits.

```bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml --server-side --force-conflicts

```

### 3. Extract Secure Credentials

```bash
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d

```

## Milestone 3: Traffic Management (Istio)

**Objective:** Inject a Service Mesh to take control of network routing for Canary deployments.

### 1. Install the Control Plane

We bypass the standard Windows download script by directly downloading the compiled binaries and linking them to the system PATH, then installing the default profile.

```bash
istioctl install --set profile=default -y

```

### 2. Enable the Sidecar Injection

We label the target namespace so Istio automatically attaches an Envoy Proxy to every newly created pod.

```bash
kubectl label namespace default istio-injection=enabled
kubectl rollout restart deployment clinicos-v1 clinicos-v2

```

### 3. GitOps Traffic Routing (The Canary Release)

We abandoned standard Kubernetes round-robin load balancing in favor of Istio's mathematically enforced routing.

* **DestinationRule:** Categorizes the pods into `stable` (v1) and `canary` (v2) subsets based on their labels.
* **VirtualService:** Intercepts traffic destined for the `clinicos-service` and routes it based on strict percentage weights.

```yaml
# Example 90/10 Split Logic
  - route:
    - destination:
        host: clinicos-service
        subset: stable
      weight: 90
    - destination:
        host: clinicos-service
        subset: canary
      weight: 10

```

## Milestone 4: Production Promotion & Garbage Collection

**Objective:** Promote the Canary release to 100% live traffic and optimize cluster compute resources by decommissioning dormant pods using GitOps principles.

### 1. The Full Production Rollout

Once a Canary release (v2) is validated, promotion is executed purely via network routing, requiring zero container restarts.

* **VirtualService Update:** We updated the Istio configuration in GitHub to shift routing weights, bringing `stable` (v1) to 0% and `canary` (v2) to 100%. ArgoCD automatically synced this to the cluster, instantly locking all users onto the new version.

### 2. GitOps Resource Pruning

Instead of manually running `kubectl delete` commands to remove the dormant v1 pods, we utilized ArgoCD's automated state reconciliation.

* **Execution:** We deleted the `deployment-v1.yaml` file from the `/k8s/app/` directory in our Git repository.
* **Reconciliation:** ArgoCD detected the missing file in the "Source of Truth" and executed an automated garbage collection routine (Prune) inside the cluster, gracefully terminating the legacy v1 pods to free up CPU and memory.

**Status:** Pipeline Fully Operational.
**End of Runbook.**

```