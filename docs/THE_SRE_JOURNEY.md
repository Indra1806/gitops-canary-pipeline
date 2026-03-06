# The SRE Chronicles: Building the ClinicOS GitOps Platform

## Foreword: Crossing the Bridge
This journal documents the evolution of the ClinicOS project. It traces the journey from a standard local web application to a highly resilient, enterprise-grade cloud architecture. 

The core theme of this journey was crossing the bridge from **Imperative** engineering (manually doing things) to **Declarative** engineering (telling machines what the end-state should be). We moved away from "pushing" code to servers, and instead built an intelligent, self-healing system that "pulls" the truth from our repository.



## Chapter 1: The Foundation (Containerization & State)

**The Goal:** Eliminate the "it works on my machine" problem.
**The Bridge Crossed:** Moving from running local Node.js servers to building immutable, isolated artifacts.

### What I Learned
* **Immutability:** A Docker container is a sealed environment. Once built, it never changes. If we need a new version, we don't update the container; we destroy it and deploy a new one.
* **Multi-Stage Builds:** We learned to optimize cloud costs by splitting our Dockerfile. We used a heavy Node image to compile the React code, but then copied *only* the compiled static files into a lightweight Nginx server for the final product, drastically reducing image size.
* **Monorepo Discipline:** Keeping infrastructure code (`k8s/`) and application code (`frontend/`) in the same repository, but strictly separated, prevents context bloat.

### What I Built
* A highly optimized `Dockerfile`.
* Two distinct releases pushed to a global registry: `clinicos:v1` (Teal/Stable) and `clinicos:v2` (Purple/Canary).



## Chapter 2: The Control Plane (Kubernetes & ArgoCD)

**The Goal:** Automate deployment and ensure the infrastructure matches the code exactly.
**The Bridge Crossed:** Shifting from traditional CI/CD "Push" pipelines (like Jenkins) to the GitOps "Pull" architecture.

### What I Learned
* **The GitOps Philosophy:** GitHub is the absolute Source of Truth. No human should ever SSH into a server to make changes.
* **State Reconciliation:** ArgoCD sits inside the cluster on a continuous 3-minute loop, comparing the live pods against the GitHub repository. If someone deletes a pod manually, ArgoCD instantly respawns it to match Git (Self-Healing).
* **Bypassing Limitations (The 262kb Error):** We hit a massive roadblock when installing ArgoCD because its configuration exceeded Kubernetes' client-side annotation limits. We learned to use `--server-side --force-conflicts` to shift the processing burden to the cluster's API, successfully resolving state manager conflicts.

### What I Built
* A Minikube local Kubernetes cluster with expanded compute resources (6GB RAM).
* An isolated ArgoCD deployment configured to monitor the `k8s/app/` folder.



## Chapter 3: The Network Matrix (Istio Service Mesh)

**The Goal:** Safely test new code in production without impacting all users.
**The Bridge Crossed:** Moving from basic round-robin load balancing to mathematically enforced network routing.

### What I Learned
* **The Sidecar Pattern:** Instead of changing our React app to handle advanced routing, we learned how Istio injects an invisible "Envoy Proxy" container alongside every application pod (`2/2` Ready state). This proxy intercepts and controls all network traffic.
* **Canary Deployments:** Deploying a new version to 100% of users is dangerous. We learned to deploy `v2` silently, and instruct the Service Mesh to route exactly 10% of real user traffic to it while keeping 90% on the stable `v1`.
* **Script Failures:** When the official Istio installation script failed due to Windows OS incompatibilities, we didn't panic. We manually downloaded the binaries, linked them to the system PATH, and forced the installation.

### What I Built
* An Istio Control Plane.
* `VirtualService` and `DestinationRule` manifests that enforced a 90/10 traffic split.



## Chapter 4: The Final Cut (Promotion & Pruning)

**The Goal:** Complete the software release lifecycle cleanly.
**The Bridge Crossed:** Executing a zero-downtime production rollout and performing automated garbage collection.

### What I Learned
* **Math-Based Upgrades:** Promoting software no longer means restarting servers. We simply updated our Git repository to shift the Istio routing weight from 10% to 100%, instantly migrating all users to `v2` with zero dropped connections.
* **GitOps Deletion:** To clean up the old `v1` pods, we didn't touch the cluster. We deleted the `deployment-v1.yaml` file from GitHub. ArgoCD detected the missing file and automatically "pruned" the legacy pods, freeing up CPU and memory.

### What I Built
* A fully promoted `v2` production environment with a clean, optimized Kubernetes cluster.


## Appendix A: The SRE Glossary

* **Cluster:** A group of nodes (machines) running containerized applications managed by Kubernetes.
* **Control Plane:** The "brain" of Kubernetes that makes global decisions about the cluster (scheduling, scaling).
* **CRD (Custom Resource Definition):** Extensions of the Kubernetes API. ArgoCD and Istio use these to add new features to the cluster that don't exist by default.
* **Deployment:** A Kubernetes object that manages a set of identical pods, ensuring the correct number are always running.
* **Envoy Proxy:** A high-performance proxy used by Istio to mediate all inbound and outbound traffic for all services in the mesh.
* **GitOps:** An operational framework that takes DevOps best practices used for application development (version control, collaboration, compliance, and CI/CD) and applies them to infrastructure automation.
* **Namespace:** A logical boundary or "virtual cluster" inside a Kubernetes cluster used to isolate resources (e.g., keeping ArgoCD tools separate from ClinicOS apps).
* **Pod:** The smallest deployable unit of computing in Kubernetes. It encapsulates one or more containers (like our React app + Envoy proxy).
* **Port-Forwarding:** Creating a secure tunnel from a local machine port directly into a private port inside the Kubernetes cluster.
* **Sidecar:** A utility container attached to an application container inside the same Pod, used to add functionality without changing the app code (e.g., logging, security, or proxying).


## Appendix B: Master Command Cheat Sheet

### Docker
* `docker build -t <username>/<image>:<tag> .` - Build an image from a Dockerfile.
* `docker push <username>/<image>:<tag>` - Push an image to a public/private registry.

### Kubernetes (kubectl)
* `kubectl get pods -n <namespace>` - List all pods in a specific boundary.
* `kubectl apply -f <file.yaml> --server-side` - Apply a configuration directly to the K8s API, bypassing client limits.
* `kubectl port-forward svc/<service-name> 8080:80` - Open a secure tunnel to a service.
* `kubectl rollout restart deployment <name>` - Gracefully restart a deployment's pods.

### Git & State Management
* `git pull --rebase origin main` - Cleanly fetch remote changes and slide local commits on top to prevent a diverged history.
* `git status` - The most important command. Always check before committing to prevent bloat.

### Istio
* `istioctl install --set profile=default -y` - Install the core service mesh components.
* `kubectl label namespace default istio-injection=enabled` - Command the mesh to auto-inject Envoy proxies into a namespace.


➡️ **Next Step:** Review the [Architecture Runbook](ARCHITECTURE_RUNBOOK.md)