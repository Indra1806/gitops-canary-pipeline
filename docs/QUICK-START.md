# ⚡ Quick Start Guide: ClinicOS GitOps Platform

Welcome to the ClinicOS infrastructure! This guide will take you from zero to a fully operational, locally hosted GitOps pipeline with a 90/10 Canary traffic split in under 5 minutes.

## 🛑 Prerequisites
Ensure you have the following installed on your local machine and available in your system PATH:
* **Docker Desktop** (Running in the background)
* **Minikube**
* **kubectl**
* **istioctl** (Istio CLI)
* **Git**


## 🚀 The 5-Minute Setup

### Step 1: Clone and Provision
First, download the repository and spin up a local Kubernetes cluster. 
> **Note:** The memory flag is mandatory. Enterprise tools like ArgoCD and Istio require substantial compute resources to run locally.

```bash
git clone [https://github.com/Indra1806/gitops-canary-pipeline.git](https://github.com/Indra1806/gitops-canary-pipeline.git)
cd gitops-canary-pipeline
minikube start --memory=6144 --cpus=4
```

### Step 2: Install the Service Mesh (Istio)

Inject the network controller and configure the default namespace to automatically attach Envoy proxies to all future application pods.

```bash
istioctl install --set profile=default -y
kubectl label namespace default istio-injection=enabled
```

*(If the `istioctl` command fails on Windows, please see our [Troubleshooting Guide](https://github.com/Indra1806/gitops-canary-pipeline/blob/main/docs/TROUBLESHOOTING.md) for the manual binary installation).*

### Step 3: Install the GitOps Controller (ArgoCD)

Create the isolated namespace and force-apply the enterprise ArgoCD manifests.

```bash
kubectl create namespace argocd
kubectl apply -n argocd -f [https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml](https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml) --server-side --force-conflicts
```

### Step 4: Access the Control Center

Extract ArgoCD's automatically generated admin password, then open a secure network tunnel to the dashboard.

```bash
# 1. Extract and copy your password:
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d

# 2. Open the network tunnel (Leave this terminal window running!):
kubectl port-forward svc/argocd-server -n argocd 8080:443
```

### Step 5: Deploy the Application

1. Open your web browser and navigate to **`https://localhost:8080`**.
2. Bypass the local certificate warning and log in using the username **`admin`** and the password you just extracted.
3. Click **+ NEW APP** and configure the synchronization:
* **Application Name:** `clinicos-dashboard`
* **Project Name:** `default`
* **Sync Policy:** `Automatic` (Check *Prune Resources* and *Self Heal*)
* **Repository URL:** `https://github.com/Indra1806/gitops-canary-pipeline.git`
* **Path:** `k8s/app`
* **Cluster URL:** `https://kubernetes.default.svc`
* **Namespace:** `default`


4. Click **CREATE**.

Watch the dashboard as ArgoCD automatically pulls your infrastructure configuration from GitHub and deploys the `v1` and `v2` pods into your cluster!



## Verify the Canary Split

Once ArgoCD shows all resources as "Healthy" and "Synced", open a **new** terminal window and run:

```bash
kubectl port-forward svc/clinicos-service 8081:80
```

Open an **Incognito/Private** browser window and go to `http://localhost:8081`.
Refresh the page rapidly. You will see the Teal UI (Stable v1) approximately 90% of the time, and the Purple UI (Canary v2) exactly 10% of the time, proving your Service Mesh is actively controlling traffic!


## 🧹 Cleanup

When you are finished testing, gracefully shut down the local infrastructure to free up your computer's RAM.

```bash
minikube stop
```

To permanently delete the cluster and start fresh later, run `minikube delete`.


➡️ **Next Step:** Keep the [Operations Cheatsheet](https://github.com/Indra1806/gitops-canary-pipeline/blob/main/README.md) handy for daily management.
