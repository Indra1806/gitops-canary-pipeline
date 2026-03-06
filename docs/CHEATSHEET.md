# 🚀 ClinicOS GitOps & Service Mesh: End-to-End Cheatsheet

**The Gist:** A zero-downtime, pull-based Continuous Deployment pipeline that automatically builds React artifacts, synchronizes infrastructure state via ArgoCD, and safely routes Canary traffic using an Istio Service Mesh.


## 🟢 1. Cluster Power States (Minikube)
*Control the local Kubernetes virtual machine.*

* **Start Cluster:** `minikube start --memory=6144 --cpus=4` *(Requires 6GB RAM for Istio/ArgoCD)*
* **Stop Cluster (Graceful):** `minikube stop` *(Saves state, stops using RAM)*
* **Pause Cluster:** `minikube pause` *(Freezes workloads to save CPU)*
* **Nuke/Reset Cluster:** `minikube delete` *(Destroys everything for a clean slate)*



## 🐳 2. Containerization (Docker)
*Compile the React application into immutable artifacts.*

* **Build Image:** `docker build -t <username>/clinicos:<tag> .` *(Run from `/frontend/`)*
* **Push Image:** `docker push <username>/clinicos:<tag>`
* **Run Locally (Testing):** `docker run -p 3000:80 <username>/clinicos:<tag>`



## 🐙 3. GitOps Controller (ArgoCD)
*The brain that pulls state from GitHub to the cluster.*

* **Install ArgoCD:** `kubectl create namespace argocd`
  `kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml --server-side --force-conflicts`
* **Get Admin Password:** `kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d`
* **Open UI Dashboard:** `kubectl port-forward svc/argocd-server -n argocd 8080:443`
* **Trigger Manual Sync:** Managed via UI (`https://localhost:8080`) -> Click "Sync".


## 🕸️ 4. Service Mesh (Istio)
*The network layer enforcing the 90/10 Canary traffic split.*

* **Install Control Plane:** `istioctl install --set profile=default -y`
* **Enable Proxy Injection:** `kubectl label namespace default istio-injection=enabled`
* **Inject Proxies into Existing Pods:** `kubectl rollout restart deployment clinicos-v1 clinicos-v2`
* **Analyze Mesh Health:** `istioctl analyze`



## 🌐 5. Service URLs & Tunnels
*Localhost access points for your infrastructure.*

* **ArgoCD Control Panel:** `https://localhost:8080` *(Requires ArgoCD port-forward)*
* **ClinicOS Live App:** `http://localhost:8081` *(Requires App port-forward: `kubectl port-forward svc/clinicos-service 8081:80`)*



## 📁 6. Repository Architecture (Important Folders)
*Where everything lives in the Monorepo.*

* `/frontend/`: The React application and multi-stage `Dockerfile`.
* `/k8s/app/`: The absolute "Source of Truth" (YAML manifests for pods, services, and Istio routing).
* `/.github/workflows/`: The CI automation script (`ci.yml`) for GitHub Actions.
* `/docs/`: SRE Runbooks, Error Ledgers, and this Cheatsheet.



## 🚨 7. Emergency Reset & Troubleshooting
*When things break, follow these exact steps.*

* **Symptom:** Kubernetes says `Too long: may not be more than 262144 bytes`.
  * **Fix:** You forgot the `--server-side` flag. Re-run `kubectl apply` with `--server-side --force-conflicts`.
* **Symptom:** Istio install script hangs/fails on Windows Git Bash.
  * **Fix:** Download the zip directly, extract it, and `export PATH=$PWD/bin:$PATH`.
* **Symptom:** Pods aren't getting the Envoy Proxy (`1/1` instead of `2/2` Ready state).
  * **Fix:** Ensure the namespace is labeled, then run the `rollout restart` command.
* **The "Nuclear" Option (Total Reset):** `minikube delete` -> `minikube start --memory=6144` -> Reinstall ArgoCD & Istio.



## 🩺 8. System Checks (Kubectl Quick Ref)
*Verify the pulse of your infrastructure.*

* **Check App Pods:** `kubectl get pods` *(Look for `2/2` Running)*
* **Check ArgoCD Pods:** `kubectl get pods -n argocd`
* **Check Services:** `kubectl get svc`
* **Check Istio Routing:** `kubectl get virtualservice,destinationrule`



## 🔒 9. Security Reminders
* **GitHub Secrets:** NEVER hardcode `DOCKER_USERNAME` or `DOCKER_PASSWORD` in `ci.yml`. Always use repository secrets.
* **.gitignore Integrity:** NEVER commit `.zip` files, `/node_modules/`, or `/istio-*/` binary folders. Run `git status` before every commit.
* **ArgoCD Exposure:** ArgoCD is kept internal to the cluster securely. Only access it via `port-forward`.


## ✅ 10. Success Indicators
* **CI:** GitHub Actions shows a green checkmark on push.
* **CD:** ArgoCD UI shows a green "Healthy" heart and "Synced" status.
* **Mesh:** Spamming refresh on `localhost:8081` correctly yields a 90% Teal / 10% Purple UI split.
* **Compute:** Unused application versions are deleted from GitHub, and ArgoCD automatically prunes the pods from the cluster to save RAM.


➡️ **Next Step:** If something breaks, consult the [Troubleshooting Guide](/docs/troubleshooting.md)