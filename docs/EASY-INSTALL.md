➡️ <kbd>**Next Step:**</kbd> Keep the [Operations Cheatsheet](https://github.com/Indra1806/gitops-canary-pipeline/blob/main/docs/CHEATSHEET.md) handy for daily management.

#  Easy Installation Guide (ClinicOS GitOps Platform)

Welcome! This guide will walk you through standing up the complete ClinicOS enterprise infrastructure on your local machine. By the end of this guide, you will have a running Kubernetes cluster, a continuous deployment controller (ArgoCD), and a mathematically routed Service Mesh (Istio).


## 🛑 1. Prerequisites & System Requirements

Before you begin, verify your system meets these minimum requirements. **Do not skip the RAM requirements**, or the enterprise infrastructure tools will crash the cluster.

### Hardware
* **Memory:** Minimum 8GB RAM total (You must dedicate **6GB** to the cluster).
* **CPU:** Minimum 4 Cores.

### Software
Ensure the following tools are installed and running on your machine:
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Must be running in the background)
* [Minikube](https://minikube.sigs.k8s.io/docs/start/) (For local Kubernetes)
* [Kubectl](https://kubernetes.io/docs/tasks/tools/) (To command the cluster)
* Git Bash (Windows) or Terminal (Mac/Linux)


## 🚀 2. Provisioning the Infrastructure

### Step 1: Clone the Repository
Download the source code and infrastructure manifests to your machine.
```bash
git clone https://github.com/Indra1806/gitops-canary-pipeline.git
cd gitops-canary-pipeline
```

### Step 2: Boot the Kubernetes Cluster

We use Minikube to simulate a cloud environment. We must pass specific flags to give it enough power to run our heavy infrastructure tools.

```bash
minikube start --memory=6144 --cpus=4
```


## 🧠 3. Installing the GitOps Controller (ArgoCD)

ArgoCD will act as our automated deployment robot. It sits inside the cluster and watches our GitHub repository for changes.

### Step 1: Create the Isolation Zone

We isolate infrastructure tools into their own namespaces for security.

```bash
kubectl create namespace argocd
```

### Step 2: Inject the Controller

*Note: We use the `--server-side` flag because ArgoCD's configuration file is too massive for standard client-side Kubernetes application limits.*

```bash
kubectl apply -n argocd -f [https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml](https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml) --server-side --force-conflicts
```

### Step 3: Extract Your Secure Password

Wait a few moments for the installation to finish, then run this command to reveal your auto-generated admin password. **Copy this password somewhere safe.**

```bash
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d
```

## 🕸️ 4. Installing the Service Mesh (Istio)

Istio takes control of the network to allow us to perform advanced Canary (90/10) traffic splits.

### Step 1: Download & Install the CLI

**For Mac/Linux Users:**

```bash
curl -L [https://istio.io/downloadIstio](https://istio.io/downloadIstio) | sh -
cd istio-*
export PATH=$PWD/bin:$PATH
```

**For Windows Users (Git Bash):**
*The standard download script often fails on Windows. Use this direct method instead:*

1. Download the latest stable Windows release directly from the [Istio GitHub Releases page](https://github.com/istio/istio/releases).
2. Extract the `.zip` file.
3. Open your terminal inside the extracted folder and run: `export PATH=$PWD/bin:$PATH`

### Step 2: Deploy the Mesh into Kubernetes

Now that the `istioctl` command is working, install the core components:

```bash
istioctl install --set profile=default -y
```

### Step 3: Enable Automatic Proxies

Instruct Kubernetes to automatically attach an Istio Envoy Proxy to any new application we deploy.

```bash
kubectl label namespace default istio-injection=enabled
```


## 🚢 5. Deploying ClinicOS

Now that the infrastructure is ready, let's connect the pipeline.

### Step 1: Open the ArgoCD Dashboard

Open a secure tunnel to the controller:

```bash
kubectl port-forward svc/argocd-server -n argocd 8080:443
```

*Leave this terminal window open and running!*

### Step 2: Connect the Repository

1. Open your web browser and go to `https://localhost:8080` (Accept the local security warning).
2. Log in with the username `admin` and the password you extracted earlier.
3. Click **+ NEW APP**.
4. **General:** Name: `clinicos`, Project: `default`, Sync Policy: `Automatic` (Check Prune & Self-Heal).
5. **Source:** Repository URL: `<YOUR_GITHUB_REPO_URL>`, Path: `k8s/app`.
6. **Destination:** Cluster URL: `https://kubernetes.default.svc`, Namespace: `default`.
7. Click **CREATE**.

Watch the dashboard! ArgoCD will automatically read the YAML files and build your pods.


## ✅ 6. Verification & Access

Once the ArgoCD dashboard shows all resources as "Healthy" and "Synced", let's view your live application.

Open a new terminal window and create a tunnel to your application service:

```bash
kubectl port-forward svc/clinicos-service 8081:80
```

Open a new browser tab and navigate to `http://localhost:8081`.
*If you refresh the page multiple times, you will occasionally see the UI switch from Teal (v1) to Purple (v2), proving your 90/10 Canary Service Mesh is fully operational!*


➡️ <kbd>**Next Step:**</kbd> Keep the [Operations Cheatsheet](https://github.com/Indra1806/gitops-canary-pipeline/blob/main/docs/CHEATSHEET.md) handy for daily management.